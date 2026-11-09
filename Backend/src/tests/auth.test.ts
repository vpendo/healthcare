import { createHash } from "node:crypto";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../app.js";
import { DoctorProfile } from "../models/DoctorProfile.js";
import { User } from "../models/User.js";

function hashResetCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function createToken(
  userId: string,
  role: "patient" | "receptionist" | "doctor" | "admin"
): string {
  const secret = process.env.JWT_SECRET || "test-jwt-secret-key-for-testing";
  return jwt.sign({ sub: userId, role }, secret, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
}

describe("Auth Endpoints", () => {
  it("should register a new patient successfully", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Patient",
      email: "patient@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("patient@example.com");
    expect(res.body.user.role).toBe("patient");
  });

  it("should fail to login with wrong credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  describe("POST /api/auth/staff (Admin Only)", () => {
    let adminToken: string;
    let patientToken: string;

    beforeEach(async () => {
      const admin = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        passwordHash: "hash123",
        role: "admin",
      });
      adminToken = createToken(String(admin._id), "admin");

      const patient = await User.create({
        name: "Regular Patient",
        email: "patient@example.com",
        passwordHash: "hash123",
        role: "patient",
      });
      patientToken = createToken(String(patient._id), "patient");
    });

    it("should allow admin to create a doctor account", async () => {
      const res = await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Dr. Gregory House",
          email: "house@example.com",
          password: "SecurePassword123!",
          role: "doctor",
          specialty: "General consultation",
        });

      expect(res.status).toBe(201);
      expect(res.body.user.name).toBe("Dr. Gregory House");
      expect(res.body.user.email).toBe("house@example.com");
      expect(res.body.user.role).toBe("doctor");
      expect(res.body.user.specialty).toBe("general consultation");
      await expect(
        DoctorProfile.findOne({ userId: res.body.user.id }).lean()
      ).resolves.toMatchObject({ specialty: "general consultation" });
    });

    it("should allow admin to create a receptionist account", async () => {
      const res = await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Pam Beesly",
          email: "pam@example.com",
          password: "SecurePassword123!",
          role: "receptionist",
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe("receptionist");
    });

    it("should reject creating an account with invalid role", async () => {
      const res = await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Invalid Staff",
          email: "invalid@example.com",
          password: "SecurePassword123!",
          role: "patient",
        });

      expect(res.status).toBe(400);
    });

    it("should require a specialty for doctor accounts", async () => {
      const res = await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          name: "Dr. No Specialty",
          email: "no-specialty@example.com",
          password: "SecurePassword123!",
          role: "doctor",
        });

      expect(res.status).toBe(400);
      await expect(
        User.findOne({ email: "no-specialty@example.com" }).lean()
      ).resolves.toBeNull();
    });

    it("should reject doctor specialties outside the admin options", async () => {
      const res = await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Dr. Invalid Specialty",
          email: "invalid-specialty@example.com",
          password: "SecurePassword123!",
          role: "doctor",
          specialty: "cardiology",
        });

      expect(res.status).toBe(400);
    });

    it("should list registered users for admins only", async () => {
      await User.create({
        name: "Doctor User",
        email: "doctor@example.com",
        passwordHash: "hash123",
        role: "doctor",
      });

      const adminResponse = await request(app)
        .get("/api/auth/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(adminResponse.status).toBe(200);
      expect(adminResponse.body.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: "patient@example.com",
            role: "patient",
          }),
          expect.objectContaining({
            email: "doctor@example.com",
            role: "doctor",
          }),
        ])
      );

      const patientResponse = await request(app)
        .get("/api/auth/users")
        .set("Authorization", `Bearer ${patientToken}`);
      expect(patientResponse.status).toBe(403);
    });

    it("should let admins edit staff details and doctor specialty", async () => {
      const doctor = await User.create({
        name: "Doctor Before",
        email: "doctor-before@example.com",
        passwordHash: await bcrypt.hash("OriginalPassword123!", 12),
        role: "doctor",
      });
      await DoctorProfile.create({
        userId: doctor._id,
        specialty: "general consultation",
      });

      const response = await request(app)
        .patch(`/api/auth/staff/${doctor._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Doctor After",
          email: "doctor-after@example.com",
          password: "ChangedPassword123!",
          specialty: "Dental Care",
        });

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        name: "Doctor After",
        email: "doctor-after@example.com",
        specialty: "dental care",
      });
      const updatedDoctor = await User.findById(doctor._id)
        .select("+passwordHash")
        .lean();
      if (!updatedDoctor) {
        throw new Error("Updated doctor account was not found.");
      }
      expect(updatedDoctor?.passwordHash).not.toBe("ChangedPassword123!");
      await expect(
        bcrypt.compare("ChangedPassword123!", updatedDoctor.passwordHash)
      ).resolves.toBe(true);
      await expect(
        DoctorProfile.findOne({ userId: doctor._id }).lean()
      ).resolves.toMatchObject({ specialty: "dental care" });
    });

    it("should let admins delete staff accounts and doctor profiles", async () => {
      const doctor = await User.create({
        name: "Doctor To Delete",
        email: "doctor-delete@example.com",
        passwordHash: "hash123",
        role: "doctor",
      });
      await DoctorProfile.create({
        userId: doctor._id,
        specialty: "general consultation",
      });

      const response = await request(app)
        .delete(`/api/auth/staff/${doctor._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      await expect(User.findById(doctor._id).lean()).resolves.toBeNull();
      await expect(
        DoctorProfile.findOne({ userId: doctor._id }).lean()
      ).resolves.toBeNull();
    });

    it("should forbid patients from editing or deleting staff accounts", async () => {
      const receptionist = await User.create({
        name: "Receptionist",
        email: "receptionist@example.com",
        passwordHash: "hash123",
        role: "receptionist",
      });

      const updateResponse = await request(app)
        .patch(`/api/auth/staff/${receptionist._id}`)
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          name: "Changed Receptionist",
          email: "changed@example.com",
        });
      const deleteResponse = await request(app)
        .delete(`/api/auth/staff/${receptionist._id}`)
        .set("Authorization", `Bearer ${patientToken}`);

      expect(updateResponse.status).toBe(403);
      expect(deleteResponse.status).toBe(403);
    });

    it("should forbid non-admin users from creating staff accounts", async () => {
      const res = await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${patientToken}`)
        .send({
          name: "Dr. Hacker",
          email: "hacker@example.com",
          password: "SecurePassword123!",
          role: "doctor",
        });

      expect(res.status).toBe(403);
    });

    it("should reject duplicate email", async () => {
      await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Dr. Gregory House",
          email: "house@example.com",
          password: "SecurePassword123!",
          role: "doctor",
          specialty: "General consultation",
        });

      const res = await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Dr. Duplicate",
          email: "house@example.com",
          password: "SecurePassword123!",
          role: "doctor",
          specialty: "General consultation",
        });

      expect(res.status).toBe(409);
    });
  });

  describe("Password reset", () => {
    const forgotMessage =
      "If an account exists for this email, a reset code has been sent.";

    it("should return a generic success for an unknown email", async () => {
      const res = await request(app).post("/api/auth/forgot-password").send({
        email: "missing@example.com",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(forgotMessage);
    });

    it("should store a hashed reset code for an existing account", async () => {
      await User.create({
        name: "Jane Doe",
        email: "jane@example.com",
        passwordHash: await bcrypt.hash("Password123!", 12),
        role: "patient",
      });

      const res = await request(app).post("/api/auth/forgot-password").send({
        email: "jane@example.com",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe(forgotMessage);

      const user = await User.findOne({ email: "jane@example.com" }).select(
        "+passwordResetCodeHash +passwordResetExpires"
      );

      expect(user?.passwordResetCodeHash).toEqual(expect.any(String));
      expect(user?.passwordResetCodeHash).toHaveLength(64);
      expect(user?.passwordResetExpires?.getTime()).toBeGreaterThan(Date.now());
    });

    it("should reject an invalid email on forgot-password", async () => {
      const res = await request(app).post("/api/auth/forgot-password").send({
        email: "not-an-email",
      });

      expect(res.status).toBe(400);
    });

    it("should reject an invalid or expired reset code", async () => {
      await User.create({
        name: "Jane Doe",
        email: "jane@example.com",
        passwordHash: await bcrypt.hash("Password123!", 12),
        role: "patient",
        passwordResetCodeHash: hashResetCode("123456"),
        passwordResetExpires: new Date(Date.now() - 60_000),
      });

      const expired = await request(app).post("/api/auth/reset-password").send({
        email: "jane@example.com",
        code: "123456",
        newPassword: "NewPassword123!",
      });
      expect(expired.status).toBe(400);

      await User.updateOne(
        { email: "jane@example.com" },
        {
          $set: {
            passwordResetCodeHash: hashResetCode("123456"),
            passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
          },
        }
      );

      const wrongCode = await request(app)
        .post("/api/auth/reset-password")
        .send({
          email: "jane@example.com",
          code: "000000",
          newPassword: "NewPassword123!",
        });
      expect(wrongCode.status).toBe(400);
    });

    it("should verify a reset code successfully without resetting the password", async () => {
      await User.create({
        name: "Jane Doe",
        email: "jane@example.com",
        passwordHash: await bcrypt.hash("Password123!", 12),
        role: "patient",
        passwordResetCodeHash: hashResetCode("654321"),
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
      });

      const invalidCodeRes = await request(app)
        .post("/api/auth/verify-reset-code")
        .send({
          email: "jane@example.com",
          code: "000000",
        });
      expect(invalidCodeRes.status).toBe(400);

      const validCodeRes = await request(app)
        .post("/api/auth/verify-reset-code")
        .send({
          email: "jane@example.com",
          code: "654321",
        });
      expect(validCodeRes.status).toBe(200);
      expect(validCodeRes.body.message).toBe("Reset code is valid.");

      // Ensure code is still intact for the subsequent reset step
      const user = await User.findOne({ email: "jane@example.com" }).select(
        "+passwordResetCodeHash"
      );
      expect(user?.passwordResetCodeHash).toBeTruthy();
    });

    it("should reset the password and allow login with the new one", async () => {
      const oldHash = await bcrypt.hash("Password123!", 12);
      await User.create({
        name: "Jane Doe",
        email: "jane@example.com",
        passwordHash: oldHash,
        role: "patient",
        passwordResetCodeHash: hashResetCode("482193"),
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
      });

      const res = await request(app).post("/api/auth/reset-password").send({
        email: "jane@example.com",
        code: "482193",
        newPassword: "NewPassword123!",
      });

      expect(res.status).toBe(200);

      const user = await User.findOne({ email: "jane@example.com" }).select(
        "+passwordHash +passwordResetCodeHash +passwordResetExpires"
      );
      expect(user?.passwordResetCodeHash).toBeFalsy();
      expect(user?.passwordResetExpires).toBeFalsy();
      expect(await bcrypt.compare("NewPassword123!", user!.passwordHash)).toBe(
        true
      );

      const oldLogin = await request(app).post("/api/auth/login").send({
        email: "jane@example.com",
        password: "Password123!",
      });
      expect(oldLogin.status).toBe(401);

      const newLogin = await request(app).post("/api/auth/login").send({
        email: "jane@example.com",
        password: "NewPassword123!",
      });
      expect(newLogin.status).toBe(200);
      expect(newLogin.body).toHaveProperty("token");
    });
  });
});
