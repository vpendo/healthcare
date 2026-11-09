
import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { User } from "../models/User.js";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const bookAppointmentSchema = z.object({
  slotId: z.string().min(1, "slotId is required."),
  patientId: z.string().optional(),
  symptoms: z
    .string()
    .trim()
    .min(3, "Symptoms description must be at least 3 characters long."),
  suggestedSpecialty: z.string().trim().optional(),
  urgent: z.boolean().optional().default(false),
  aiSummary: z.string().trim().optional(),
});

const updateSymptomsSchema = z.object({
  symptoms: z
    .string()
    .trim()
    .min(3, "Symptoms description must be at least 3 characters long."),
});

const rescheduleAppointmentSchema = z.object({
  slotId: z.string().min(1, "A new slot ID is required."),
});

const updateDoctorNoteSchema = z.object({
  doctorNote: z.string().trim().min(1, "doctorNote cannot be empty."),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class AppointmentActionError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppointmentActionError";
  }
}

function isValidObjectId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(value)
  );
}

function canPatientModifyAppointment(appointment: {
  status: string;
  queueStatus: string;
}): boolean {
  return (
    appointment.status === "booked" &&
    appointment.queueStatus === "not_arrived"
  );
}

function handleAppointmentActionError(
  error: unknown,
  res: Response
): boolean {
  if (error instanceof AppointmentActionError) {
    res.status(error.statusCode).json({ message: error.message });
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Book appointment
// ---------------------------------------------------------------------------

/**
 * POST /api/appointments
 * Access: Patient, Receptionist, Admin.
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

  if (
    currentUser.role === "receptionist" ||
    currentUser.role === "admin"
  ) {
    if (!parsed.data.patientId) {
      res.status(400).json({
        message:
          "patientId is required when booking as receptionist or admin.",
      });
      return;
    }

    targetPatientId = parsed.data.patientId;
  }

  if (!isValidObjectId(targetPatientId)) {
    res.status(400).json({ message: "Invalid patient ID format." });
    return;
  }

  if (!isValidObjectId(parsed.data.slotId)) {
    res.status(400).json({ message: "Invalid slot ID format." });
    return;
  }

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

  const session = await mongoose.startSession();

  // Store the appointment ID instead of the document.
  let createdAppointmentId: mongoose.Types.ObjectId | null = null;

  try {
    await session.withTransaction(async () => {
      // Atomically reserve the slot to prevent double booking.
      const slot = await AvailabilitySlot.findOneAndUpdate(
        {
          _id: parsed.data.slotId,
          status: "open",
          startTime: { $gt: new Date() },
        },
        { $set: { status: "booked" } },
        { new: true, session }
      );

      if (!slot) {
        const existingSlot = await AvailabilitySlot.findById(
          parsed.data.slotId
        ).session(session);

        if (!existingSlot) {
          throw new AppointmentActionError(
            404,
            "Availability slot not found."
          );
        }

        if (existingSlot.startTime <= new Date()) {
          throw new AppointmentActionError(
            400,
            "This appointment slot is in the past."
          );
        }

        throw new AppointmentActionError(
          409,
          "This slot is no longer available. Please select another time slot."
        );
      }

      const doctor = await User.findById(slot.doctorId).session(session);

      if (!doctor || doctor.role !== "doctor") {
        throw new AppointmentActionError(
          400,
          "The selected slot does not belong to a valid doctor."
        );
      }

      const [appointment] = await Appointment.create(
        [
          {
            patientId: targetPatientId,
            doctorId: slot.doctorId,
            slotId: slot._id,
            symptoms: parsed.data.symptoms,
            suggestedSpecialty: parsed.data.suggestedSpecialty,
            urgent: parsed.data.urgent,
            aiSummary: parsed.data.aiSummary,
            status: "booked",
            queueStatus: "not_arrived",
          },
        ],
        { session }
      );

      if (!appointment) {
        throw new Error("Could not create appointment.");
      }

      createdAppointmentId = appointment._id;
    });

    if (!createdAppointmentId) {
      res.status(500).json({
        message: "Could not create appointment.",
      });
      return;
    }

    // Retrieve the appointment using its ID.
    const appointment = await Appointment.findById(createdAppointmentId)
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .populate("slotId", "startTime endTime status")
      .lean();

    if (!appointment) {
      res.status(500).json({
        message: "Appointment was created but could not be retrieved.",
      });
      return;
    }

    const patientInfo = appointment.patientId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
    };

    const doctorInfo = appointment.doctorId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
    };

    const slotInfo = appointment.slotId as unknown as {
      _id: mongoose.Types.ObjectId;
      startTime: Date;
      endTime: Date;
    };

    res.status(201).json({
      message: "Appointment booked successfully.",
      appointment: {
        id: appointment._id,
        patientId: patientInfo?._id,
        patientName: patientInfo?.name,
        patientEmail: patientInfo?.email,
        doctorId: doctorInfo?._id,
        doctorName: doctorInfo?.name,
        doctorEmail: doctorInfo?.email,
        slot: slotInfo
          ? {
              id: slotInfo._id,
              startTime: slotInfo.startTime,
              endTime: slotInfo.endTime,
            }
          : null,
        symptoms: appointment.symptoms,
        suggestedSpecialty: appointment.suggestedSpecialty,
        urgent: appointment.urgent,
        aiSummary: appointment.aiSummary,
        status: appointment.status,
        queueStatus: appointment.queueStatus,
        createdAt: appointment.createdAt,
      },
    });
  } catch (error) {
    if (handleAppointmentActionError(error, res)) return;

    // Duplicate-key errors can occur if a slot is already assigned
    // to another booked appointment.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        message:
          "This slot is already booked. Please select another time slot.",
      });
      return;
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

// ---------------------------------------------------------------------------
// Get all appointments
// ---------------------------------------------------------------------------

/**
 * GET /api/appointments
 * Access: Doctor, Receptionist, Admin.
 */
export async function getAppointments(
  req: Request,
  res: Response
): Promise<void> {
  const currentUser = req.user!;
  const { doctorId, patientId, status, queueStatus, urgent } = req.query;

  const filter: Record<string, unknown> = {};

  if (currentUser.role === "doctor") {
    filter.doctorId = currentUser.sub;
  } else if (doctorId && typeof doctorId === "string") {
    if (!isValidObjectId(doctorId)) {
      res.status(400).json({ message: "Invalid doctor ID format." });
      return;
    }

    filter.doctorId = doctorId;
  }

  if (patientId && typeof patientId === "string") {
    if (!isValidObjectId(patientId)) {
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
    ["not_arrived", "waiting", "in_consultation", "done"].includes(
      queueStatus
    )
  ) {
    filter.queueStatus = queueStatus;
  }

  if (urgent === "true") {
    filter.urgent = true;
  } else if (urgent === "false") {
    filter.urgent = false;
  }

  const appointments = await Appointment.find(filter)
    .populate("patientId", "name email")
    .populate("doctorId", "name email")
    .populate("slotId", "startTime endTime status")
    .sort({ createdAt: -1 })
    .lean();

  const formatted = appointments.map((appointment) => {
    const patient = appointment.patientId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
    } | null;

    const doctor = appointment.doctorId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
    } | null;

    const slot = appointment.slotId as unknown as {
      _id: mongoose.Types.ObjectId;
      startTime: Date;
      endTime: Date;
      status: string;
    } | null;

    return {
      id: appointment._id,
      patient: patient
        ? {
            id: patient._id,
            name: patient.name,
            email: patient.email,
          }
        : null,
      doctor: doctor
        ? {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
          }
        : null,
      slot: slot
        ? {
            id: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status,
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
    };
  });

  res.status(200).json({
    count: formatted.length,
    appointments: formatted,
  });
}

// ---------------------------------------------------------------------------
// Get current user's appointments
// ---------------------------------------------------------------------------

/**
 * GET /api/appointments/my
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
  } else {
    res.status(403).json({
      message: "Only patients and doctors can access this endpoint.",
    });
    return;
  }

  const appointments = await Appointment.find(filter)
    .populate("patientId", "name email")
    .populate("doctorId", "name email")
    .populate("slotId", "startTime endTime status")
    .sort({ createdAt: -1 })
    .lean();

  const formatted = appointments.map((appointment) => {
    const patient = appointment.patientId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
    } | null;

    const doctor = appointment.doctorId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
    } | null;

    const slot = appointment.slotId as unknown as {
      _id: mongoose.Types.ObjectId;
      startTime: Date;
      endTime: Date;
    } | null;

    return {
      id: appointment._id,
      patient: patient
        ? {
            id: patient._id,
            name: patient.name,
            email: patient.email,
          }
        : null,
      doctor: doctor
        ? {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
          }
        : null,
      slot: slot
        ? {
            id: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
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
    };
  });

  res.status(200).json({
    count: formatted.length,
    appointments: formatted,
  });
}

// ---------------------------------------------------------------------------
// Get one appointment
// ---------------------------------------------------------------------------

/**
 * GET /api/appointments/:appointmentId
 * Access: Relevant Patient/Doctor, Receptionist, Admin.
 */
export async function getAppointmentById(
  req: Request,
  res: Response
): Promise<void> {
  const { appointmentId } = req.params;

  if (!isValidObjectId(appointmentId)) {
    res.status(400).json({ message: "Invalid appointment ID." });
    return;
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate("patientId", "name email")
    .populate("doctorId", "name email")
    .populate("slotId", "startTime endTime status")
    .lean();

  if (!appointment) {
    res.status(404).json({ message: "Appointment not found." });
    return;
  }

  const currentUser = req.user!;

  const patient = appointment.patientId as unknown as {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  } | null;

  const doctor = appointment.doctorId as unknown as {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  } | null;

  const slot = appointment.slotId as unknown as {
    _id: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    status: string;
  } | null;

  if (
    currentUser.role === "patient" &&
    String(patient?._id) !== currentUser.sub
  ) {
    res.status(403).json({
      message: "You are not authorized to view this appointment.",
    });
    return;
  }

  if (
    currentUser.role === "doctor" &&
    String(doctor?._id) !== currentUser.sub
  ) {
    res.status(403).json({
      message: "You are not authorized to view this appointment.",
    });
    return;
  }

  res.status(200).json({
    appointment: {
      id: appointment._id,
      patient: patient
        ? {
            id: patient._id,
            name: patient.name,
            email: patient.email,
          }
        : null,
      doctor: doctor
        ? {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
          }
        : null,
      slot: slot
        ? {
            id: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status,
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

// ---------------------------------------------------------------------------
// Update appointment symptoms
// ---------------------------------------------------------------------------

/**
 * PATCH /api/appointments/:appointmentId/symptoms
 * Access: Patient (own appointment, before arrival).
 */
export async function updateAppointmentSymptoms(
  req: Request,
  res: Response
): Promise<void> {
  const { appointmentId } = req.params;

  if (!isValidObjectId(appointmentId)) {
    res.status(400).json({ message: "Invalid appointment ID." });
    return;
  }

  const parsed = updateSymptomsSchema.safeParse(req.body);

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

  if (String(appointment.patientId) !== currentUser.sub) {
    res.status(403).json({
      message: "You are not authorized to update this appointment.",
    });
    return;
  }

  if (!canPatientModifyAppointment(appointment)) {
    res.status(400).json({
      message:
        "Symptoms can only be updated before you arrive for a booked appointment.",
    });
    return;
  }

  appointment.symptoms = parsed.data.symptoms;

  // The previous AI results may no longer match the updated symptoms.
  appointment.aiSummary = undefined;
  appointment.suggestedSpecialty = undefined;

  // Keep the existing urgent flag until a new intake assessment is made.
  await appointment.save();

  res.status(200).json({
    message: "Appointment symptoms updated successfully.",
    appointment: {
      id: appointment._id,
      symptoms: appointment.symptoms,
      suggestedSpecialty: appointment.suggestedSpecialty,
      urgent: appointment.urgent,
      aiSummary: appointment.aiSummary,
      updatedAt: appointment.updatedAt,
    },
  });
}

// ---------------------------------------------------------------------------
// Reschedule appointment
// ---------------------------------------------------------------------------

/**
 * PATCH /api/appointments/:appointmentId/reschedule
 * Access: Patient (own appointment, before arrival).
 *
 * The patient keeps the same doctor and appointment record.
 * The old slot is released and the new slot is reserved atomically.
 */
export async function rescheduleAppointment(
  req: Request,
  res: Response
): Promise<void> {
  const { appointmentId } = req.params;

  if (!isValidObjectId(appointmentId)) {
    res.status(400).json({ message: "Invalid appointment ID." });
    return;
  }

  const parsed = rescheduleAppointmentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  if (!isValidObjectId(parsed.data.slotId)) {
    res.status(400).json({ message: "Invalid new slot ID." });
    return;
  }

  const currentUser = req.user!;
  const session = await mongoose.startSession();

  let updatedAppointmentId: mongoose.Types.ObjectId | null = null;

  try {
    await session.withTransaction(async () => {
      const appointment = await Appointment.findById(
        appointmentId
      ).session(session);

      if (!appointment) {
        throw new AppointmentActionError(
          404,
          "Appointment not found."
        );
      }

      if (String(appointment.patientId) !== currentUser.sub) {
        throw new AppointmentActionError(
          403,
          "You are not authorized to reschedule this appointment."
        );
      }

      if (!canPatientModifyAppointment(appointment)) {
        throw new AppointmentActionError(
          400,
          "Only booked appointments can be rescheduled before arrival."
        );
      }

      if (String(appointment.slotId) === parsed.data.slotId) {
        throw new AppointmentActionError(
          400,
          "Please select a different appointment slot."
        );
      }

      const requestedSlot = await AvailabilitySlot.findById(
        parsed.data.slotId
      ).session(session);

      if (!requestedSlot) {
        throw new AppointmentActionError(
          404,
          "The selected availability slot was not found."
        );
      }

      if (
        String(requestedSlot.doctorId) !== String(appointment.doctorId)
      ) {
        throw new AppointmentActionError(
          400,
          "You can only reschedule with the same doctor."
        );
      }

      if (requestedSlot.startTime <= new Date()) {
        throw new AppointmentActionError(
          400,
          "You cannot reschedule to a slot in the past."
        );
      }

      // Atomically reserve the new slot.
      const newSlot = await AvailabilitySlot.findOneAndUpdate(
        {
          _id: parsed.data.slotId,
          status: "open",
          startTime: { $gt: new Date() },
        },
        { $set: { status: "booked" } },
        { new: true, session }
      );

      if (!newSlot) {
        throw new AppointmentActionError(
          409,
          "This slot is no longer available. Please choose another time."
        );
      }

      // Release the old slot.
      const oldSlot = await AvailabilitySlot.findOneAndUpdate(
        {
          _id: appointment.slotId,
          status: "booked",
        },
        { $set: { status: "open" } },
        { new: true, session }
      );

      if (!oldSlot) {
        throw new AppointmentActionError(
          409,
          "The current appointment slot could not be released. No changes were made."
        );
      }

      appointment.slotId = newSlot._id;
      await appointment.save({ session });

      updatedAppointmentId = appointment._id;
    });

    if (!updatedAppointmentId) {
      res.status(500).json({
        message: "Could not reschedule appointment.",
      });
      return;
    }

    const updatedAppointment = await Appointment.findById(
      updatedAppointmentId
    )
      .populate("doctorId", "name email")
      .populate("slotId", "startTime endTime status")
      .lean();

    if (!updatedAppointment) {
      res.status(404).json({ message: "Appointment not found." });
      return;
    }

    const doctor = updatedAppointment.doctorId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      email: string;
    } | null;

    const slot = updatedAppointment.slotId as unknown as {
      _id: mongoose.Types.ObjectId;
      startTime: Date;
      endTime: Date;
    } | null;

    res.status(200).json({
      message: "Appointment rescheduled successfully.",
      appointment: {
        id: updatedAppointment._id,
        doctor: doctor
          ? {
              id: doctor._id,
              name: doctor.name,
              email: doctor.email,
            }
          : null,
        slot: slot
          ? {
              id: slot._id,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }
          : null,
        status: updatedAppointment.status,
        queueStatus: updatedAppointment.queueStatus,
        updatedAt: updatedAppointment.updatedAt,
      },
    });
  } catch (error) {
    if (handleAppointmentActionError(error, res)) return;
    throw error;
  } finally {
    await session.endSession();
  }
}

// ---------------------------------------------------------------------------
// Cancel appointment
// ---------------------------------------------------------------------------

/**
 * PATCH /api/appointments/:appointmentId/cancel
 * Access: Patient (own appointment), assigned Doctor, Receptionist, Admin.
 */
export async function cancelAppointment(
  req: Request,
  res: Response
): Promise<void> {
  const { appointmentId } = req.params;

  if (!isValidObjectId(appointmentId)) {
    res.status(400).json({ message: "Invalid appointment ID." });
    return;
  }

  const currentUser = req.user!;
  const session = await mongoose.startSession();

  let cancelledAppointmentId: mongoose.Types.ObjectId | null = null;

  try {
    await session.withTransaction(async () => {
      const appointment = await Appointment.findById(
        appointmentId
      ).session(session);

      if (!appointment) {
        throw new AppointmentActionError(
          404,
          "Appointment not found."
        );
      }

      if (
        currentUser.role === "patient" &&
        String(appointment.patientId) !== currentUser.sub
      ) {
        throw new AppointmentActionError(
          403,
          "You are not authorized to cancel this appointment."
        );
      }

      if (
        currentUser.role === "doctor" &&
        String(appointment.doctorId) !== currentUser.sub
      ) {
        throw new AppointmentActionError(
          403,
          "You are not authorized to cancel this appointment."
        );
      }

      if (appointment.status === "cancelled") {
        throw new AppointmentActionError(
          400,
          "Appointment is already cancelled."
        );
      }

      if (appointment.status === "completed") {
        throw new AppointmentActionError(
          400,
          "Cannot cancel a completed appointment."
        );
      }

      if (
        currentUser.role === "patient" &&
        appointment.queueStatus !== "not_arrived"
      ) {
        throw new AppointmentActionError(
          400,
          "You can only cancel an appointment before arriving. Please contact reception for assistance."
        );
      }

      // Release the booked slot inside the same transaction.
      const releasedSlot = await AvailabilitySlot.findOneAndUpdate(
        {
          _id: appointment.slotId,
          status: "booked",
        },
        { $set: { status: "open" } },
        { new: true, session }
      );

      if (!releasedSlot) {
        throw new AppointmentActionError(
          409,
          "The appointment slot could not be released. No changes were made."
        );
      }

      appointment.status = "cancelled";
      await appointment.save({ session });

      cancelledAppointmentId = appointment._id;
    });

    if (!cancelledAppointmentId) {
      res.status(500).json({
        message: "Could not cancel appointment.",
      });
      return;
    }

    const cancelledAppointment = await Appointment.findById(
      cancelledAppointmentId
    ).lean();

    res.status(200).json({
      message: "Appointment cancelled successfully. Slot has been reopened.",
      appointment: {
        id: cancelledAppointment?._id,
        status: cancelledAppointment?.status,
        updatedAt: cancelledAppointment?.updatedAt,
      },
    });
  } catch (error) {
    if (handleAppointmentActionError(error, res)) return;
    throw error;
  } finally {
    await session.endSession();
  }
}

// ---------------------------------------------------------------------------
// Update doctor note
// ---------------------------------------------------------------------------

/**
 * PATCH /api/appointments/:appointmentId/note
 * Access: Assigned Doctor or Admin.
 */
export async function updateDoctorNote(
  req: Request,
  res: Response
): Promise<void> {
  const { appointmentId } = req.params;

  if (!isValidObjectId(appointmentId)) {
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
        "You are not authorized to add notes for this appointment.",
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
