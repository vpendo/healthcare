import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { User } from "../models/User.js";

// ---------------------------------------------------------------------------
// Validation Schemas
// ---------------------------------------------------------------------------

const bookAppointmentSchema = z.object({
  slotId: z.string().min(1, "slotId is required."),
  patientId: z.string().optional(),
  symptoms: z
    .string()
    .min(3, "Symptoms description must be at least 3 characters long.")
    .trim(),
  suggestedSpecialty: z.string().trim().optional(),
  urgent: z.boolean().optional().default(false),
  aiSummary: z.string().trim().optional(),
});

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/appointments
 * Books an appointment for an open availability slot.
 * Access: Patient (for self) or Receptionist/Admin (with patientId).
 */
export async function bookAppointment(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = bookAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const currentUser = req.user!;
  let targetPatientId = currentUser.sub;

  if (currentUser.role === "receptionist" || currentUser.role === "admin") {
    if (!parsed.data.patientId) {
      res.status(400).json({
        message: "patientId is required when booking as receptionist or admin.",
      });
      return;
    }
    targetPatientId = parsed.data.patientId;
  }

  if (!mongoose.Types.ObjectId.isValid(targetPatientId)) {
    res.status(400).json({ message: "Invalid patient ID format." });
    return;
  }

  // Ensure target user is a patient
  const patient = await User.findById(targetPatientId).lean();
  if (!patient) {
    res.status(404).json({ message: "Patient not found." });
    return;
  }

  if (patient.role !== "patient") {
    res.status(400).json({
      message:
        "Appointments can only be booked for users with the patient role.",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(parsed.data.slotId)) {
    res.status(400).json({ message: "Invalid slot ID format." });
    return;
  }

  // Atomically lock and book the slot to prevent double-booking
  const updatedSlot = await AvailabilitySlot.findOneAndUpdate(
    { _id: parsed.data.slotId, status: "open" },
    { status: "booked" },
    { returnDocument: "after" }
  );

  if (!updatedSlot) {
    // Check whether slot doesn't exist or is simply not open
    const slotExists = await AvailabilitySlot.findById(
      parsed.data.slotId
    ).lean();
    if (!slotExists) {
      res.status(404).json({ message: "Availability slot not found." });
      return;
    }
    res.status(409).json({
      message:
        "This slot is no longer available. Please select another time slot.",
    });
    return;
  }

  const doctor = await User.findById(updatedSlot.doctorId).lean();

  const createPayload: Record<string, unknown> = {
    patientId: targetPatientId,
    doctorId: updatedSlot.doctorId,
    slotId: updatedSlot._id,
    symptoms: parsed.data.symptoms,
    urgent: parsed.data.urgent ?? false,
    status: "booked",
    queueStatus: "not_arrived",
  };

  if (parsed.data.suggestedSpecialty) {
    createPayload.suggestedSpecialty = parsed.data.suggestedSpecialty;
  }
  if (parsed.data.aiSummary) {
    createPayload.aiSummary = parsed.data.aiSummary;
  }

  const appointment = await Appointment.create(createPayload);

  res.status(201).json({
    message: "Appointment booked successfully.",
    appointment: {
      id: appointment._id,
      patientId: patient._id,
      patientName: patient.name,
      patientEmail: patient.email,
      doctorId: doctor?._id,
      doctorName: doctor?.name,
      doctorEmail: doctor?.email,
      slot: {
        id: updatedSlot._id,
        startTime: updatedSlot.startTime,
        endTime: updatedSlot.endTime,
      },
      symptoms: appointment.symptoms,
      suggestedSpecialty: appointment.suggestedSpecialty,
      urgent: appointment.urgent,
      aiSummary: appointment.aiSummary,
      status: appointment.status,
      queueStatus: appointment.queueStatus,
      createdAt: appointment.createdAt,
    },
  });
}

/**
 * GET /api/appointments
 * Lists appointments with filters.
 * Access: Doctor (assigned appointments), Receptionist, Admin.
 */
export async function getAppointments(
  req: Request,
  res: Response
): Promise<void> {
  const currentUser = req.user!;
  const { doctorId, patientId, status, queueStatus, urgent } = req.query;

  const filter: Record<string, unknown> = {};

  // Doctors can only view appointments assigned to them
  if (currentUser.role === "doctor") {
    filter.doctorId = currentUser.sub;
  } else if (doctorId && typeof doctorId === "string") {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      res.status(400).json({ message: "Invalid doctor ID format." });
      return;
    }
    filter.doctorId = doctorId;
  }

  if (patientId && typeof patientId === "string") {
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      res.status(400).json({ message: "Invalid patient ID format." });
      return;
    }
    filter.patientId = patientId;
  }

  if (
    status &&
    typeof status === "string" &&
    ["booked", "cancelled", "completed"].includes(status)
  ) {
    filter.status = status;
  }

  if (
    queueStatus &&
    typeof queueStatus === "string" &&
    ["not_arrived", "waiting", "in_consultation", "done"].includes(queueStatus)
  ) {
    filter.queueStatus = queueStatus;
  }

  if (urgent === "true") {
    filter.urgent = true;
  } else if (urgent === "false") {
    filter.urgent = false;
  }

  const appointments = await Appointment.find(filter)
    .populate<{
      patientId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
      };
    }>("patientId", "name email")
    .populate<{
      doctorId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
      };
    }>("doctorId", "name email")
    .populate<{
      slotId: {
        _id: mongoose.Types.ObjectId;
        startTime: Date;
        endTime: Date;
        status: string;
      };
    }>("slotId", "startTime endTime status")
    .sort({ createdAt: -1 })
    .lean();

  const formatted = appointments.map((a) => ({
    id: a._id,
    patient: a.patientId
      ? {
          id: a.patientId._id,
          name: a.patientId.name,
          email: a.patientId.email,
        }
      : null,
    doctor: a.doctorId
      ? {
          id: a.doctorId._id,
          name: a.doctorId.name,
          email: a.doctorId.email,
        }
      : null,
    slot: a.slotId
      ? {
          id: a.slotId._id,
          startTime: a.slotId.startTime,
          endTime: a.slotId.endTime,
          status: a.slotId.status,
        }
      : null,
    symptoms: a.symptoms,
    suggestedSpecialty: a.suggestedSpecialty,
    urgent: a.urgent,
    aiSummary: a.aiSummary,
    status: a.status,
    queueStatus: a.queueStatus,
    doctorNote: a.doctorNote,
    createdAt: a.createdAt,
  }));

  res.status(200).json({
    count: formatted.length,
    appointments: formatted,
  });
}

/**
 * GET /api/appointments/my
 * Retrieves the appointments for the currently logged-in user.
 * Access: Patient or Doctor.
 */
export async function getMyAppointments(
  req: Request,
  res: Response
): Promise<void> {
  const currentUser = req.user!;
  const filter: Record<string, unknown> = {};

  if (currentUser.role === "patient") {
    filter.patientId = currentUser.sub;
  } else if (currentUser.role === "doctor") {
    filter.doctorId = currentUser.sub;
  }

  const appointments = await Appointment.find(filter)
    .populate<{
      patientId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
      };
    }>("patientId", "name email")
    .populate<{
      doctorId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
      };
    }>("doctorId", "name email")
    .populate<{
      slotId: {
        _id: mongoose.Types.ObjectId;
        startTime: Date;
        endTime: Date;
        status: string;
      };
    }>("slotId", "startTime endTime status")
    .sort({ createdAt: -1 })
    .lean();

  const formatted = appointments.map((a) => ({
    id: a._id,
    patient: a.patientId
      ? {
          id: a.patientId._id,
          name: a.patientId.name,
          email: a.patientId.email,
        }
      : null,
    doctor: a.doctorId
      ? {
          id: a.doctorId._id,
          name: a.doctorId.name,
          email: a.doctorId.email,
        }
      : null,
    slot: a.slotId
      ? {
          id: a.slotId._id,
          startTime: a.slotId.startTime,
          endTime: a.slotId.endTime,
        }
      : null,
    symptoms: a.symptoms,
    suggestedSpecialty: a.suggestedSpecialty,
    urgent: a.urgent,
    aiSummary: a.aiSummary,
    status: a.status,
    queueStatus: a.queueStatus,
    doctorNote: a.doctorNote,
    createdAt: a.createdAt,
  }));

  res.status(200).json({
    count: formatted.length,
    appointments: formatted,
  });
}

/**
 * GET /api/appointments/:appointmentId
 * Retrieves detailed info of a single appointment.
 * Access: Relevant Patient/Doctor, Receptionist, Admin.
 */
export async function getAppointmentById(
  req: Request,
  res: Response
): Promise<void> {
  const { appointmentId } = req.params;

  if (
    !appointmentId ||
    typeof appointmentId !== "string" ||
    !mongoose.Types.ObjectId.isValid(appointmentId)
  ) {
    res.status(400).json({ message: "Invalid appointment ID." });
    return;
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate<{
      patientId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
      };
    }>("patientId", "name email")
    .populate<{
      doctorId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
      };
    }>("doctorId", "name email")
    .populate<{
      slotId: {
        _id: mongoose.Types.ObjectId;
        startTime: Date;
        endTime: Date;
        status: string;
      };
    }>("slotId", "startTime endTime status")
    .lean();

  if (!appointment) {
    res.status(404).json({ message: "Appointment not found." });
    return;
  }

  const currentUser = req.user!;

  // Access checks
  if (
    currentUser.role === "patient" &&
    String(appointment.patientId?._id) !== currentUser.sub
  ) {
    res.status(403).json({
      message: "Forbidden: You are not authorized to view this appointment.",
    });
    return;
  }

  if (
    currentUser.role === "doctor" &&
    String(appointment.doctorId?._id) !== currentUser.sub
  ) {
    res.status(403).json({
      message: "Forbidden: You are not authorized to view this appointment.",
    });
    return;
  }

  res.status(200).json({
    appointment: {
      id: appointment._id,
      patient: appointment.patientId
        ? {
            id: appointment.patientId._id,
            name: appointment.patientId.name,
            email: appointment.patientId.email,
          }
        : null,
      doctor: appointment.doctorId
        ? {
            id: appointment.doctorId._id,
            name: appointment.doctorId.name,
            email: appointment.doctorId.email,
          }
        : null,
      slot: appointment.slotId
        ? {
            id: appointment.slotId._id,
            startTime: appointment.slotId.startTime,
            endTime: appointment.slotId.endTime,
            status: appointment.slotId.status,
          }
        : null,
      symptoms: appointment.symptoms,
      suggestedSpecialty: appointment.suggestedSpecialty,
      urgent: appointment.urgent,
      aiSummary: appointment.aiSummary,
      status: appointment.status,
      queueStatus: appointment.queueStatus,
      doctorNote: appointment.doctorNote,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    },
  });
}

/**
 * PATCH /api/appointments/:appointmentId/cancel
 * Cancels an appointment and reopens the availability slot.
 * Access: Patient (own appointment), Doctor (assigned), Receptionist, Admin.
 */
export async function cancelAppointment(
  req: Request,
  res: Response
): Promise<void> {
  const { appointmentId } = req.params;

  if (
    !appointmentId ||
    typeof appointmentId !== "string" ||
    !mongoose.Types.ObjectId.isValid(appointmentId)
  ) {
    res.status(400).json({ message: "Invalid appointment ID." });
    return;
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404).json({ message: "Appointment not found." });
    return;
  }

  const currentUser = req.user!;

  if (
    currentUser.role === "patient" &&
    String(appointment.patientId) !== currentUser.sub
  ) {
    res.status(403).json({
      message: "Forbidden: You are not authorized to cancel this appointment.",
    });
    return;
  }

  if (
    currentUser.role === "doctor" &&
    String(appointment.doctorId) !== currentUser.sub
  ) {
    res.status(403).json({
      message: "Forbidden: You are not authorized to cancel this appointment.",
    });
    return;
  }

  if (appointment.status === "cancelled") {
    res.status(400).json({ message: "Appointment is already cancelled." });
    return;
  }

  if (appointment.status === "completed") {
    res.status(400).json({ message: "Cannot cancel a completed appointment." });
    return;
  }

  appointment.status = "cancelled";
  await appointment.save();

  // Reopen the availability slot so other patients can book it
  await AvailabilitySlot.findByIdAndUpdate(appointment.slotId, {
    status: "open",
  });

  res.status(200).json({
    message: "Appointment cancelled successfully. Slot has been reopened.",
    appointment: {
      id: appointment._id,
      status: appointment.status,
      updatedAt: appointment.updatedAt,
    },
  });
}

const updateDoctorNoteSchema = z.object({
  doctorNote: z.string().trim().min(1, "doctorNote cannot be empty."),
});

/**
 * PATCH /api/appointments/:appointmentId/note
 * Adds or updates clinical notes for an appointment.
 * Access: Assigned Doctor or Admin.
 */
export async function updateDoctorNote(
  req: Request,
  res: Response
): Promise<void> {
  const { appointmentId } = req.params;

  if (
    !appointmentId ||
    typeof appointmentId !== "string" ||
    !mongoose.Types.ObjectId.isValid(appointmentId)
  ) {
    res.status(400).json({ message: "Invalid appointment ID." });
    return;
  }

  const parsed = updateDoctorNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404).json({ message: "Appointment not found." });
    return;
  }

  const currentUser = req.user!;

  if (
    currentUser.role === "doctor" &&
    String(appointment.doctorId) !== currentUser.sub
  ) {
    res.status(403).json({
      message:
        "Forbidden: You are not authorized to add notes for this appointment.",
    });
    return;
  }

  appointment.doctorNote = parsed.data.doctorNote;
  await appointment.save();

  res.status(200).json({
    message: "Doctor note updated successfully.",
    appointment: {
      id: appointment._id,
      doctorId: appointment.doctorId,
      doctorNote: appointment.doctorNote,
      updatedAt: appointment.updatedAt,
    },
  });
}
