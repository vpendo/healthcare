import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { User } from "../models/User.js";

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
        });

      expect(res.status).toBe(201);
      expect(res.body.user.name).toBe("Dr. Gregory House");
      expect(res.body.user.email).toBe("house@example.com");
      expect(res.body.user.role).toBe("doctor");
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
        });

      const res = await request(app)
        .post("/api/auth/staff")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Dr. Duplicate",
          email: "house@example.com",
          password: "SecurePassword123!",
          role: "doctor",
        });

      expect(res.status).toBe(409);
    });
  });
});
