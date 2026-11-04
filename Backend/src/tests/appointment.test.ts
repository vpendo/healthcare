import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import { User } from "../models/User.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { Appointment } from "../models/Appointment.js";

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

describe("Appointment Endpoints", () => {
  let doctorUser: { _id: string; token: string };
  let anotherDoctorUser: { _id: string; token: string };
  let patientUser: { _id: string; token: string };
  let secondPatientUser: { _id: string; token: string };
  let receptionistUser: { _id: string; token: string };
  let adminUser: { _id: string; token: string };

  let openSlotId: string;
  let secondSlotId: string;

  beforeEach(async () => {
    // 1. Doctors
    const doc1 = await User.create({
      name: "Dr. Gregory House",
      email: "house@example.com",
      passwordHash: "hash123",
      role: "doctor",
    });
    doctorUser = {
      _id: String(doc1._id),
      token: createToken(String(doc1._id), "doctor"),
    };

    const doc2 = await User.create({
      name: "Dr. James Wilson",
      email: "wilson@example.com",
      passwordHash: "hash123",
      role: "doctor",
    });
    anotherDoctorUser = {
      _id: String(doc2._id),
      token: createToken(String(doc2._id), "doctor"),
    };

    // 2. Patients
    const pat1 = await User.create({
      name: "Alice Patient",
      email: "alice@example.com",
      passwordHash: "hash123",
      role: "patient",
    });
    patientUser = {
      _id: String(pat1._id),
      token: createToken(String(pat1._id), "patient"),
    };

    const pat2 = await User.create({
      name: "Bob Patient",
      email: "bob@example.com",
      passwordHash: "hash123",
      role: "patient",
    });
    secondPatientUser = {
      _id: String(pat2._id),
      token: createToken(String(pat2._id), "patient"),
    };

    // 3. Receptionist & Admin
    const rec = await User.create({
      name: "Receptionist Pam",
      email: "pam@example.com",
      passwordHash: "hash123",
      role: "receptionist",
    });
    receptionistUser = {
      _id: String(rec._id),
      token: createToken(String(rec._id), "receptionist"),
    };

    const adm = await User.create({
      name: "Admin Boss",
      email: "boss@example.com",
      passwordHash: "hash123",
      role: "admin",
    });
    adminUser = {
      _id: String(adm._id),
      token: createToken(String(adm._id), "admin"),
    };

    // 4. Create sample availability slots
    const slot1 = await AvailabilitySlot.create({
      doctorId: doctorUser._id,
      startTime: new Date("2030-02-01T09:00:00.000Z"),
      endTime: new Date("2030-02-01T09:30:00.000Z"),
      status: "open",
    });
    openSlotId = String(slot1._id);

    const slot2 = await AvailabilitySlot.create({
      doctorId: anotherDoctorUser._id,
      startTime: new Date("2030-02-01T10:00:00.000Z"),
      endTime: new Date("2030-02-01T10:30:00.000Z"),
      status: "open",
    });
    secondSlotId = String(slot2._id);
  });

  describe("POST /api/appointments", () => {
    it("should allow a patient to book an open slot", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientUser.token}`)
        .send({
          slotId: openSlotId,
          symptoms: "Severe headache and sensitivity to light.",
          suggestedSpecialty: "neurology",
        });

      expect(res.status).toBe(201);
      expect(res.body.appointment).toHaveProperty("id");
      expect(res.body.appointment.patientId).toBe(patientUser._id);
      expect(res.body.appointment.doctorId).toBe(doctorUser._id);
      expect(res.body.appointment.status).toBe("booked");
      expect(res.body.appointment.queueStatus).toBe("not_arrived");

      // Verify the slot status was locked to 'booked'
      const updatedSlot = await AvailabilitySlot.findById(openSlotId);
      expect(updatedSlot?.status).toBe("booked");
    });

    it("should prevent double-booking if two patients attempt to book the same slot", async () => {
      // First booking succeeds
      const firstRes = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientUser.token}`)
        .send({
          slotId: openSlotId,
          symptoms: "First patient symptoms.",
        });
      expect(firstRes.status).toBe(201);

      // Second booking on the same slot must fail
      const secondRes = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${secondPatientUser.token}`)
        .send({
          slotId: openSlotId,
          symptoms: "Second patient symptoms.",
        });

      expect(secondRes.status).toBe(409);
      expect(secondRes.body.message).toMatch(/no longer available/i);
    });

    it("should allow a receptionist to book an appointment for a patient", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${receptionistUser.token}`)
        .send({
          slotId: openSlotId,
          patientId: secondPatientUser._id,
          symptoms: "Routine health checkup.",
        });

      expect(res.status).toBe(201);
      expect(res.body.appointment.patientId).toBe(secondPatientUser._id);
    });

    it("should allow an admin to book an appointment for a patient", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({
          slotId: openSlotId,
          patientId: secondPatientUser._id,
          symptoms: "Admin scheduled consultation.",
        });

      expect(res.status).toBe(201);
      expect(res.body.appointment.patientId).toBe(secondPatientUser._id);
    });

    it("should reject booking with short symptoms description", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientUser.token}`)
        .send({
          slotId: openSlotId,
          symptoms: "Hi",
        });

      expect(res.status).toBe(400);
      expect(res.body.errors.symptoms).toBeDefined();
    });

    it("should return 404 if slot ID does not exist", async () => {
      const fakeId = "665f1a2b3c4d5e6f7a8b9c0d";
      const res = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${patientUser.token}`)
        .send({
          slotId: fakeId,
          symptoms: "Abdominal pain.",
        });

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/appointments/my", () => {
    beforeEach(async () => {
      await Appointment.create({
        patientId: patientUser._id,
        doctorId: doctorUser._id,
        slotId: openSlotId,
        symptoms: "Fever and cough",
        status: "booked",
        queueStatus: "not_arrived",
      });
    });

    it("should allow a patient to see their appointments", async () => {
      const res = await request(app)
        .get("/api/appointments/my")
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.appointments[0].patient.id).toBe(patientUser._id);
    });

    it("should allow a doctor to see appointments assigned to them", async () => {
      const res = await request(app)
        .get("/api/appointments/my")
        .set("Authorization", `Bearer ${doctorUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.appointments[0].doctor.id).toBe(doctorUser._id);
    });
  });

  describe("GET /api/appointments", () => {
    beforeEach(async () => {
      await Appointment.create([
        {
          patientId: patientUser._id,
          doctorId: doctorUser._id,
          slotId: openSlotId,
          symptoms: "Chest pain",
          urgent: true,
          status: "booked",
          queueStatus: "waiting",
        },
        {
          patientId: secondPatientUser._id,
          doctorId: anotherDoctorUser._id,
          slotId: secondSlotId,
          symptoms: "Mild rash",
          urgent: false,
          status: "booked",
          queueStatus: "not_arrived",
        },
      ]);
    });

    it("should allow a receptionist to view all appointments", async () => {
      const res = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it("should filter appointments by urgent flag", async () => {
      const res = await request(app)
        .get("/api/appointments?urgent=true")
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.appointments[0].urgent).toBe(true);
    });

    it("should restrict doctors to only see appointments assigned to them", async () => {
      const res = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${doctorUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.appointments[0].doctor.id).toBe(doctorUser._id);
    });

    it("should forbid patients from accessing the general appointments endpoint", async () => {
      const res = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/appointments/:appointmentId", () => {
    let appointmentId: string;

    beforeEach(async () => {
      const appt = await Appointment.create({
        patientId: patientUser._id,
        doctorId: doctorUser._id,
        slotId: openSlotId,
        symptoms: "Ear pain",
        status: "booked",
        queueStatus: "not_arrived",
      });
      appointmentId = String(appt._id);
    });

    it("should allow the patient to view their own appointment", async () => {
      const res = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.appointment.id).toBe(appointmentId);
    });

    it("should forbid another patient from viewing the appointment", async () => {
      const res = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set("Authorization", `Bearer ${secondPatientUser.token}`);

      expect(res.status).toBe(403);
    });

    it("should allow the assigned doctor to view the appointment", async () => {
      const res = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set("Authorization", `Bearer ${doctorUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.appointment.id).toBe(appointmentId);
    });

    it("should forbid an unassigned doctor from viewing the appointment", async () => {
      const res = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set("Authorization", `Bearer ${anotherDoctorUser.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/appointments/:appointmentId/cancel", () => {
    let appointmentId: string;

    beforeEach(async () => {
      // Mark slot as booked
      await AvailabilitySlot.findByIdAndUpdate(openSlotId, {
        status: "booked",
      });

      const appt = await Appointment.create({
        patientId: patientUser._id,
        doctorId: doctorUser._id,
        slotId: openSlotId,
        symptoms: "Back pain",
        status: "booked",
        queueStatus: "not_arrived",
      });
      appointmentId = String(appt._id);
    });

    it("should allow a patient to cancel their own appointment and reopen the slot", async () => {
      const res = await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.appointment.status).toBe("cancelled");

      // Verify slot was reopened to 'open'
      const slot = await AvailabilitySlot.findById(openSlotId);
      expect(slot?.status).toBe("open");
    });

    it("should forbid another patient from cancelling someone else's appointment", async () => {
      const res = await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set("Authorization", `Bearer ${secondPatientUser.token}`);

      expect(res.status).toBe(403);
    });

    it("should allow a receptionist to cancel an appointment", async () => {
      const res = await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.appointment.status).toBe("cancelled");
    });

    it("should reject cancelling an already cancelled appointment", async () => {
      // Cancel once
      await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      // Try cancelling again
      const res = await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already cancelled/i);
    });
  });
});
