import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { User } from "../models/User.js";
import { DoctorProfile } from "../models/DoctorProfile.js";

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

describe("Doctor Endpoints", () => {
  let doctorUser: { _id: string; token: string };
  let receptionistUser: { _id: string; token: string };
  let patientUser: { _id: string; token: string };
  let adminUser: { _id: string; token: string };

  beforeEach(async () => {
    // Create admin user
    const adm = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: "hashedpassword123",
      role: "admin",
    });
    adminUser = {
      _id: String(adm._id),
      token: createToken(String(adm._id), "admin"),
    };
    // Create doctor user
    const doc = await User.create({
      name: "Dr. Alice Smith",
      email: "alice@example.com",
      passwordHash: "hashedpassword123",
      role: "doctor",
    });
    doctorUser = {
      _id: String(doc._id),
      token: createToken(String(doc._id), "doctor"),
    };

    // Create receptionist user
    const rec = await User.create({
      name: "Bob Receptionist",
      email: "bob@example.com",
      passwordHash: "hashedpassword123",
      role: "receptionist",
    });
    receptionistUser = {
      _id: String(rec._id),
      token: createToken(String(rec._id), "receptionist"),
    };

    // Create patient user
    const pat = await User.create({
      name: "Charlie Patient",
      email: "charlie@example.com",
      passwordHash: "hashedpassword123",
      role: "patient",
    });
    patientUser = {
      _id: String(pat._id),
      token: createToken(String(pat._id), "patient"),
    };
  });

  describe("POST /api/doctors", () => {
    it("should allow a doctor to create their own profile", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ specialty: "General Practitioner" });

      expect(res.status).toBe(201);
      expect(res.body.profile).toHaveProperty(
        "specialty",
        "general practitioner"
      );
      expect(res.body.profile.doctorId).toBe(doctorUser._id);
      expect(res.body.profile.name).toBe("Dr. Alice Smith");
    });

    it("should allow an admin to create a profile for a doctor", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({
          userId: doctorUser._id,
          specialty: "Pediatrics",
        });

      expect(res.status).toBe(201);
      expect(res.body.profile.specialty).toBe("pediatrics");
      expect(res.body.profile.doctorId).toBe(doctorUser._id);
    });

    it("should forbid a receptionist from creating a doctor profile", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${receptionistUser.token}`)
        .send({
          userId: doctorUser._id,
          specialty: "Pediatrics",
        });

      expect(res.status).toBe(403);
    });

    it("should forbid a patient from creating a doctor profile", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${patientUser.token}`)
        .send({ specialty: "Cardiology" });

      expect(res.status).toBe(403);
    });

    it("should reject creating a duplicate profile for the same doctor", async () => {
      await DoctorProfile.create({
        userId: doctorUser._id,
        specialty: "general practitioner",
      });

      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ specialty: "Dermatology" });

      expect(res.status).toBe(409);
    });

    it("should reject profile creation if referenced user is not a doctor", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({
          userId: patientUser._id,
          specialty: "Cardiology",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/doctor role/i);
    });
  });

  describe("GET /api/doctors", () => {
    beforeEach(async () => {
      // Create a second doctor
      const doc2 = await User.create({
        name: "Dr. David Davis",
        email: "david@example.com",
        passwordHash: "hashedpassword123",
        role: "doctor",
      });

      await DoctorProfile.create({
        userId: doctorUser._id,
        specialty: "general practitioner",
      });

      await DoctorProfile.create({
        userId: doc2._id,
        specialty: "pediatrics",
      });
    });

    it("should list all doctors for an authenticated user", async () => {
      const res = await request(app)
        .get("/api/doctors")
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.doctors).toHaveLength(2);
    });

    it("should filter doctors by specialty", async () => {
      const res = await request(app)
        .get("/api/doctors?specialty=pediatrics")
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.doctors[0].specialty).toBe("pediatrics");
      expect(res.body.doctors[0].name).toBe("Dr. David Davis");
    });
  });

  describe("GET /api/doctors/:doctorId", () => {
    beforeEach(async () => {
      await DoctorProfile.create({
        userId: doctorUser._id,
        specialty: "general practitioner",
      });
    });

    it("should retrieve a doctor profile by user ID", async () => {
      const res = await request(app)
        .get(`/api/doctors/${doctorUser._id}`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.doctor.name).toBe("Dr. Alice Smith");
      expect(res.body.doctor.specialty).toBe("general practitioner");
    });

    it("should return 404 for non-existent doctor ID", async () => {
      const fakeId = "665f1a2b3c4d5e6f7a8b9c0d";
      const res = await request(app)
        .get(`/api/doctors/${fakeId}`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/doctors/:doctorId", () => {
    beforeEach(async () => {
      await DoctorProfile.create({
        userId: doctorUser._id,
        specialty: "general practitioner",
      });
    });

    it("should allow a doctor to update their own specialty", async () => {
      const res = await request(app)
        .patch(`/api/doctors/${doctorUser._id}`)
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ specialty: "Family Medicine" });

      expect(res.status).toBe(200);
      expect(res.body.doctor.specialty).toBe("family medicine");
    });

    it("should forbid a doctor from updating another doctor's profile", async () => {
      // Create another doctor
      const anotherDoc = await User.create({
        name: "Dr. Eve",
        email: "eve@example.com",
        passwordHash: "hash123",
        role: "doctor",
      });
      const anotherToken = createToken(String(anotherDoc._id), "doctor");

      const res = await request(app)
        .patch(`/api/doctors/${doctorUser._id}`)
        .set("Authorization", `Bearer ${anotherToken}`)
        .send({ specialty: "Cardiology" });

      expect(res.status).toBe(403);
    });

    it("should allow an admin to update any doctor's profile", async () => {
      const res = await request(app)
        .patch(`/api/doctors/${doctorUser._id}`)
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({ specialty: "Internal Medicine" });

      expect(res.status).toBe(200);
      expect(res.body.doctor.specialty).toBe("internal medicine");
    });

    it("should forbid a receptionist from updating a doctor's profile", async () => {
      const res = await request(app)
        .patch(`/api/doctors/${doctorUser._id}`)
        .set("Authorization", `Bearer ${receptionistUser.token}`)
        .send({ specialty: "Internal Medicine" });

      expect(res.status).toBe(403);
    });
  });
});
