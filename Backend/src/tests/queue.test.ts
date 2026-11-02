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

describe("Queue Management & Doctor Notes Endpoints", () => {
  let doctorUser: { _id: string; token: string };
  let anotherDoctorUser: { _id: string; token: string };
  let receptionistUser: { _id: string; token: string };
  let adminUser: { _id: string; token: string };
  let patientUser: { _id: string; token: string };

  const testDate = "2030-03-10";

  let regularAppointmentId: string;
  let urgentAppointmentId: string;
  let anotherDoctorAppointmentId: string;

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

    // 2. Staff & Patient
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

    const pat = await User.create({
      name: "Alice Patient",
      email: "alice@example.com",
      passwordHash: "hash123",
      role: "patient",
    });
    patientUser = {
      _id: String(pat._id),
      token: createToken(String(pat._id), "patient"),
    };

    // 3. Create Slots for the test date
    // Slot 1: 09:00 (non-urgent will go here)
    const slot1 = await AvailabilitySlot.create({
      doctorId: doctorUser._id,
      startTime: new Date(`${testDate}T09:00:00.000Z`),
      endTime: new Date(`${testDate}T09:30:00.000Z`),
      status: "booked",
    });

    // Slot 2: 10:00 (urgent will go here)
    const slot2 = await AvailabilitySlot.create({
      doctorId: doctorUser._id,
      startTime: new Date(`${testDate}T10:00:00.000Z`),
      endTime: new Date(`${testDate}T10:30:00.000Z`),
      status: "booked",
    });

    // Slot 3: For Doctor 2
    const slot3 = await AvailabilitySlot.create({
      doctorId: anotherDoctorUser._id,
      startTime: new Date(`${testDate}T11:00:00.000Z`),
      endTime: new Date(`${testDate}T11:30:00.000Z`),
      status: "booked",
    });

    // 4. Create Appointments
    // Regular non-urgent at 09:00
    const appt1 = await Appointment.create({
      patientId: patientUser._id,
      doctorId: doctorUser._id,
      slotId: slot1._id,
      symptoms: "Mild throat tickle",
      urgent: false,
      status: "booked",
      queueStatus: "not_arrived",
    });
    regularAppointmentId = String(appt1._id);

    // Urgent at 10:00
    const appt2 = await Appointment.create({
      patientId: patientUser._id,
      doctorId: doctorUser._id,
      slotId: slot2._id,
      symptoms: "Severe acute chest pain",
      urgent: true,
      status: "booked",
      queueStatus: "waiting",
    });
    urgentAppointmentId = String(appt2._id);

    // Doctor 2 appointment
    const appt3 = await Appointment.create({
      patientId: patientUser._id,
      doctorId: anotherDoctorUser._id,
      slotId: slot3._id,
      symptoms: "Follow-up consultation",
      urgent: false,
      status: "booked",
      queueStatus: "not_arrived",
    });
    anotherDoctorAppointmentId = String(appt3._id);
  });

  describe("GET /api/queue/today", () => {
    it("should allow receptionist to view the queue with summary statistics", async () => {
      const res = await request(app)
        .get(`/api/queue/today?date=${testDate}`)
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.date).toBe(testDate);
      expect(res.body.count).toBe(3);
      expect(res.body.stats).toEqual({
        totalToday: 3,
        notArrived: 2,
        waiting: 1,
        inConsultation: 0,
        done: 0,
      });
    });

    it("should prioritize urgent cases at the top of the queue", async () => {
      const res = await request(app)
        .get(`/api/queue/today?date=${testDate}`)
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      // The urgent appointment (10:00) should appear before the non-urgent appointment (09:00)
      expect(res.body.queue[0].id).toBe(urgentAppointmentId);
      expect(res.body.queue[0].urgent).toBe(true);
    });

    it("should restrict doctors to only see their own queue", async () => {
      const res = await request(app)
        .get(`/api/queue/today?date=${testDate}`)
        .set("Authorization", `Bearer ${doctorUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.stats.totalToday).toBe(2);
      expect(
        res.body.queue.every(
          (q: { doctor: { id: string } }) => q.doctor.id === doctorUser._id
        )
      ).toBe(true);
    });

    it("should forbid patients from viewing the clinic queue", async () => {
      const res = await request(app)
        .get(`/api/queue/today?date=${testDate}`)
        .set("Authorization", `Bearer ${patientUser.token}`);

      expect(res.status).toBe(403);
    });

    it("should exclude cancelled appointments from the live queue", async () => {
      // Mark appointment as cancelled
      await Appointment.findByIdAndUpdate(regularAppointmentId, {
        status: "cancelled",
      });

      const res = await request(app)
        .get(`/api/queue/today?date=${testDate}`)
        .set("Authorization", `Bearer ${receptionistUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(
        res.body.queue.some(
          (q: { id: string }) => q.id === regularAppointmentId
        )
      ).toBe(false);
    });
  });

  describe("PATCH /api/queue/:appointmentId/status", () => {
    it("should allow a receptionist to check in a patient (not_arrived -> waiting)", async () => {
      const res = await request(app)
        .patch(`/api/queue/${regularAppointmentId}/status`)
        .set("Authorization", `Bearer ${receptionistUser.token}`)
        .send({ queueStatus: "waiting" });

      expect(res.status).toBe(200);
      expect(res.body.appointment.queueStatus).toBe("waiting");
    });

    it("should allow a doctor to transition patient to in_consultation", async () => {
      const res = await request(app)
        .patch(`/api/queue/${urgentAppointmentId}/status`)
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ queueStatus: "in_consultation" });

      expect(res.status).toBe(200);
      expect(res.body.appointment.queueStatus).toBe("in_consultation");
    });

    it("should automatically set appointment status to completed when queueStatus is done", async () => {
      const res = await request(app)
        .patch(`/api/queue/${urgentAppointmentId}/status`)
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ queueStatus: "done" });

      expect(res.status).toBe(200);
      expect(res.body.appointment.queueStatus).toBe("done");
      expect(res.body.appointment.status).toBe("completed");

      const inDb = await Appointment.findById(urgentAppointmentId);
      expect(inDb?.status).toBe("completed");
    });

    it("should forbid a doctor from modifying another doctor's queue status", async () => {
      const res = await request(app)
        .patch(`/api/queue/${anotherDoctorAppointmentId}/status`)
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ queueStatus: "in_consultation" });

      expect(res.status).toBe(403);
    });

    it("should forbid a patient from updating queue status", async () => {
      const res = await request(app)
        .patch(`/api/queue/${regularAppointmentId}/status`)
        .set("Authorization", `Bearer ${patientUser.token}`)
        .send({ queueStatus: "waiting" });

      expect(res.status).toBe(403);
    });

    it("should reject invalid queue status value", async () => {
      const res = await request(app)
        .patch(`/api/queue/${regularAppointmentId}/status`)
        .set("Authorization", `Bearer ${receptionistUser.token}`)
        .send({ queueStatus: "invalid_status" });

      expect(res.status).toBe(400);
      expect(res.body.errors.queueStatus).toBeDefined();
    });
  });

  describe("PATCH /api/appointments/:appointmentId/note", () => {
    it("should allow assigned doctor to add clinical consultation notes", async () => {
      const noteText =
        "Patient examined. Vitals normal. Prescribed Ibuprofen 400mg.";
      const res = await request(app)
        .patch(`/api/appointments/${urgentAppointmentId}/note`)
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ doctorNote: noteText });

      expect(res.status).toBe(200);
      expect(res.body.appointment.doctorNote).toBe(noteText);

      const inDb = await Appointment.findById(urgentAppointmentId);
      expect(inDb?.doctorNote).toBe(noteText);
    });

    it("should allow an admin to update clinical notes", async () => {
      const noteText = "Admin reviewed note.";
      const res = await request(app)
        .patch(`/api/appointments/${urgentAppointmentId}/note`)
        .set("Authorization", `Bearer ${adminUser.token}`)
        .send({ doctorNote: noteText });

      expect(res.status).toBe(200);
      expect(res.body.appointment.doctorNote).toBe(noteText);
    });

    it("should forbid another doctor from editing someone else's notes", async () => {
      const res = await request(app)
        .patch(`/api/appointments/${urgentAppointmentId}/note`)
        .set("Authorization", `Bearer ${anotherDoctorUser.token}`)
        .send({ doctorNote: "Unauthorized note." });

      expect(res.status).toBe(403);
    });

    it("should forbid a patient from modifying clinical notes", async () => {
      const res = await request(app)
        .patch(`/api/appointments/${urgentAppointmentId}/note`)
        .set("Authorization", `Bearer ${patientUser.token}`)
        .send({ doctorNote: "Patient wrote this." });

      expect(res.status).toBe(403);
    });

    it("should reject empty doctor notes", async () => {
      const res = await request(app)
        .patch(`/api/appointments/${urgentAppointmentId}/note`)
        .set("Authorization", `Bearer ${doctorUser.token}`)
        .send({ doctorNote: "   " });

      expect(res.status).toBe(400);
      expect(res.body.errors.doctorNote).toBeDefined();
    });
  });
});
