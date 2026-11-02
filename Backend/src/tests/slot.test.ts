import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { User } from "../models/User.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";

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

describe("Availability Slot Endpoints", () => {
  let doctorUser: { _id: string; token: string };
  let anotherDoctorUser: { _id: string; token: string };
  let receptionistUser: { _id: string; token: string };
  let adminUser: { _id: string; token: string };
  let patientUser: { _id: string; token: string };

  beforeEach(async () => {
    // 1. Doctor 1
    const doc1 = await User.create({
      name: "Dr. Meredith Grey",
      email: "meredith@example.com",
      passwordHash: "hash123",
      role: "doctor",
    });
    doctorUser = {
      _id: String(doc1._id),
      token: createToken(String(doc1._id), "doctor"),
    };

    // 2. Doctor 2
    const doc2 = await User.create({
      name: "Dr. Derek Shepherd",
      email: "derek@example.com",
      passwordHash: "hash123",
      role: "doctor",
    });
    anotherDoctorUser = {
      _id: String(doc2._id),
      token: createToken(String(doc2._id), "doctor"),
    };

    // 3. Receptionist
    const rec = await User.create({
      name: "Receptionist Jane",
      email: "jane@example.com",
      passwordHash: "hash123",
      role: "receptionist",
    });
    receptionistUser = {
      _id: String(rec._id),
      token: createToken(String(rec._id), "receptionist"),
    };

    // 4. Admin
    const adm = await User.create({
      name: "Admin Boss",
      email: "admin@example.com",
      passwordHash: "hash123",
      role: "admin",
    });
    adminUser = {
      _id: String(adm._id),
      token: createToken(String(adm._id), "admin"),
    };

    // 5. Patient
    const pat = await User.create({
      name: "John Patient",
      email: "john@example.com",
      passwordHash: "hash123",
      role: "patient",
    });
    patientUser = {
      _id: String(pat._id),
      token: createToken(String(pat._id), "patient"),
    };
  });

  describe("POST /api/slots", () => {
    it("should allow a doctor to create a slot for themselves", async () => {
      const res = await request(app)
        .post("/api/slots")
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({
          startTime: "2030-01-15T09:00:00.000Z",
          endTime: "2030-01-15T09:30:00.000Z",
        });

      expect(res.status).toBe(201);
      expect(res.body.slot).toHaveProperty("id");
      expect(res.body.slot.doctorId).toBe(doctorUser._id);
      expect(res.body.slot.status).toBe("open");
    });

    it("should allow a receptionist to create a slot for a doctor", async () => {
      const res = await request(app)
        .post("/api/slots")
        .set("Authorization", `Bearer ${receptionistUser.token}`)
        .send({
          doctorId: doctorUser._id,
          startTime: "2030-01-15T10:00:00.000Z",
          endTime: "2030-01-15T10:30:00.000Z",
        });

      expect(res.status).toBe(201);
      expect(res.body.slot.doctorId).toBe(doctorUser._id);
    });

    it("should allow an admin to create a slot for a doctor", async () => {
      const res = await request(app)
        .post("/api/slots")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({
          doctorId: doctorUser._id,
          startTime: "2030-01-15T11:00:00.000Z",
          endTime: "2030-01-15T11:30:00.000Z",
        });

      expect(res.status).toBe(201);
      expect(res.body.slot.doctorId).toBe(doctorUser._id);
    });

    it("should forbid a patient from creating a slot", async () => {
      const res = await request(app)
        .post("/api/slots")
        .set("Authorization", `Bearer ${patientUser.token}`)
        .send({
          startTime: "2030-01-15T09:00:00.000Z",
          endTime: "2030-01-15T09:30:00.000Z",
        });

      expect(res.status).toBe(403);
    });

    it("should reject creating a slot in the past", async () => {
      const res = await request(app)
        .post("/api/slots")
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({
          startTime: "2020-01-01T09:00:00.000Z",
          endTime: "2020-01-01T09:30:00.000Z",
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.startTime).toBeDefined();
    });

    it("should reject creating a slot where endTime is before startTime", async () => {
      const res = await request(app)
        .post("/api/slots")
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({
          startTime: "2030-01-15T10:00:00.000Z",
          endTime: "2030-01-15T09:00:00.000Z",
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.endTime).toBeDefined();
    });

    it("should reject creating a slot if target user is not a doctor", async () => {
      const res = await request(app)
        .post("/api/slots")
        .set("Authorization", `Bearer ${receptionistUser.token}`)
        .send({
          doctorId: patientUser._id,
          startTime: "2030-01-15T09:00:00.000Z",
          endTime: "2030-01-15T09:30:00.000Z",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/doctor role/i);
    });

    it("should reject creating an overlapping slot for the same doctor", async () => {
      // Create first slot: 09:00 - 10:00
      await AvailabilitySlot.create({
        doctorId: doctorUser._id,
        startTime: new Date("2030-01-15T09:00:00.000Z"),
        endTime: new Date("2030-01-15T10:00:00.000Z"),
        status: "open",
      });

      // Try overlapping: 09:30 - 10:30
      const res = await request(app)
        .post("/api/slots")
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({
          startTime: "2030-01-15T09:30:00.000Z",
          endTime: "2030-01-15T10:30:00.000Z",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/overlaps/i);
    });
  });

  describe("GET /api/slots", () => {
    beforeEach(async () => {
      await AvailabilitySlot.create([
        {
          doctorId: doctorUser._id,
          startTime: new Date("2030-01-15T09:00:00.000Z"),
          endTime: new Date("2030-01-15T09:30:00.000Z"),
          status: "open",
        },
        {
          doctorId: doctorUser._id,
          startTime: new Date("2030-01-15T10:00:00.000Z"),
          endTime: new Date("2030-01-15T10:30:00.000Z"),
          status: "booked",
        },
        {
          doctorId: anotherDoctorUser._id,
          startTime: new Date("2030-01-16T14:00:00.000Z"),
          endTime: new Date("2030-01-16T14:30:00.000Z"),
          status: "open",
        },
      ]);
    });

    it("should list all slots for receptionist/admin", async () => {
      const res = await request(app)
        .get("/api/slots")
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(3);
      expect(res.body.slots).toHaveLength(3);
    });

    it("should filter slots by doctorId", async () => {
      const res = await request(app)
        .get(`/api/slots?doctorId=${doctorUser._id}`)
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(
        res.body.slots.every(
          (s: { doctorId: string }) => s.doctorId === doctorUser._id
        )
      ).toBe(true);
    });

    it("should filter slots by specific date", async () => {
      const res = await request(app)
        .get("/api/slots?date=2030-01-16")
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.slots[0].doctorId).toBe(anotherDoctorUser._id);
    });

    it("should default to open slots for patient users", async () => {
      const res = await request(app)
        .get("/api/slots")
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(
        res.body.slots.every((s: { status: string }) => s.status === "open")
      ).toBe(true);
    });
  });

  describe("GET /api/slots/:slotId", () => {
    it("should retrieve a single slot by ID", async () => {
      const slot = await AvailabilitySlot.create({
        doctorId: doctorUser._id,
        startTime: new Date("2030-01-15T09:00:00.000Z"),
        endTime: new Date("2030-01-15T09:30:00.000Z"),
        status: "open",
      });

      const res = await request(app)
        .get(`/api/slots/${slot._id}`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.slot.id).toBe(String(slot._id));
      expect(res.body.slot.doctorName).toBe("Dr. Meredith Grey");
    });

    it("should return 404 for a non-existent slot ID", async () => {
      const fakeId = "665f1a2b3c4d5e6f7a8b9c0d";
      const res = await request(app)
        .get(`/api/slots/${fakeId}`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/slots/:slotId", () => {
    it("should allow a doctor to mark their slot as unavailable", async () => {
      const slot = await AvailabilitySlot.create({
        doctorId: doctorUser._id,
        startTime: new Date("2030-01-15T09:00:00.000Z"),
        endTime: new Date("2030-01-15T09:30:00.000Z"),
        status: "open",
      });

      const res = await request(app)
        .patch(`/api/slots/${slot._id}`)
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ status: "unavailable" });

      expect(res.status).toBe(200);
      expect(res.body.slot.status).toBe("unavailable");
    });

    it("should forbid a doctor from updating another doctor's slot", async () => {
      const slot = await AvailabilitySlot.create({
        doctorId: doctorUser._id,
        startTime: new Date("2030-01-15T09:00:00.000Z"),
        endTime: new Date("2030-01-15T09:30:00.000Z"),
        status: "open",
      });

      const res = await request(app)
        .patch(`/api/slots/${slot._id}`)
        .set("Authorization", `Bearer ${anotherDoctorUser.token}`)
        .send({ status: "unavailable" });

      expect(res.status).toBe(403);
    });

    it("should reject updating a slot that is already booked", async () => {
      const slot = await AvailabilitySlot.create({
        doctorId: doctorUser._id,
        startTime: new Date("2030-01-15T09:00:00.000Z"),
        endTime: new Date("2030-01-15T09:30:00.000Z"),
        status: "booked",
      });

      const res = await request(app)
        .patch(`/api/slots/${slot._id}`)
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ status: "unavailable" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/booked slot/i);
    });
  });

  describe("DELETE /api/slots/:slotId", () => {
    it("should allow a doctor to delete their own unbooked slot", async () => {
      const slot = await AvailabilitySlot.create({
        doctorId: doctorUser._id,
        startTime: new Date("2030-01-15T09:00:00.000Z"),
        endTime: new Date("2030-01-15T09:30:00.000Z"),
        status: "open",
      });

      const res = await request(app)
        .delete(`/api/slots/${slot._id}`)
        .set("Authorization", `Bearer ${doctorUser.token}`);

      expect(res.status).toBe(200);

      const check = await AvailabilitySlot.findById(slot._id);
      expect(check).toBeNull();
    });

    it("should reject deleting a booked slot", async () => {
      const slot = await AvailabilitySlot.create({
        doctorId: doctorUser._id,
        startTime: new Date("2030-01-15T09:00:00.000Z"),
        endTime: new Date("2030-01-15T09:30:00.000Z"),
        status: "booked",
      });

      const res = await request(app)
        .delete(`/api/slots/${slot._id}`)
        .set("Authorization", `Bearer ${doctorUser.token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/booked slot/i);
    });

    it("should forbid another doctor from deleting someone else's slot", async () => {
      const slot = await AvailabilitySlot.create({
        doctorId: doctorUser._id,
        startTime: new Date("2030-01-15T09:00:00.000Z"),
        endTime: new Date("2030-01-15T09:30:00.000Z"),
        status: "open",
      });

      const res = await request(app)
        .delete(`/api/slots/${slot._id}`)
        .set("Authorization", `Bearer ${anotherDoctorUser.token}`);

      expect(res.status).toBe(403);
    });
  });
});
