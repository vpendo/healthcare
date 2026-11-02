import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Appointment } from "../models/Appointment.js";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";

// ---------------------------------------------------------------------------
// Validation Schemas
// ---------------------------------------------------------------------------

const updateQueueStatusSchema = z.object({
  queueStatus: z.enum(["not_arrived", "waiting", "in_consultation", "done"], {
    message:
      "queueStatus must be one of: 'not_arrived', 'waiting', 'in_consultation', 'done'.",
  }),
});

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/queue/today
 * Retrieves today's appointments queue with stats, prioritizing urgent cases.
 * Access: Receptionist, Doctor, Admin.
 */
export async function getTodayQueue(
  req: Request,
  res: Response
): Promise<void> {
  const currentUser = req.user!;
  const { date, doctorId } = req.query;

  let targetDoctorId: string | undefined;

  // Doctors only see their own queue
  if (currentUser.role === "doctor") {
    targetDoctorId = currentUser.sub;
  } else if (doctorId && typeof doctorId === "string") {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      res.status(400).json({ message: "Invalid doctor ID format." });
      return;
    }
    targetDoctorId = doctorId;
  }

  // Determine target date boundary (default: today UTC)
  const now = new Date();
  const dateStr =
    typeof date === "string" && date.trim().length > 0
      ? date.trim()
      : now.toISOString().split("T")[0];

  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  if (isNaN(startOfDay.getTime())) {
    res
      .status(400)
      .json({ message: "Invalid date format. Expected YYYY-MM-DD." });
    return;
  }

  // Find all slots scheduled for this day
  const slotFilter: Record<string, unknown> = {
    startTime: { $gte: startOfDay, $lte: endOfDay },
  };
  if (targetDoctorId) {
    slotFilter.doctorId = targetDoctorId;
  }

  const slots = await AvailabilitySlot.find(slotFilter).select("_id").lean();
  const slotIds = slots.map((s) => s._id);

  // Find non-cancelled appointments linked to these slots
  const appointments = await Appointment.find({
    slotId: { $in: slotIds },
    status: { $ne: "cancelled" },
  })
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

  // Sort: Urgent cases first, then chronologically by slot startTime
  appointments.sort((a, b) => {
    if (a.urgent !== b.urgent) {
      return a.urgent ? -1 : 1;
    }
    const timeA = a.slotId?.startTime
      ? new Date(a.slotId.startTime).getTime()
      : 0;
    const timeB = b.slotId?.startTime
      ? new Date(b.slotId.startTime).getTime()
      : 0;
    return timeA - timeB;
  });

  // Calculate real-time dashboard statistics
  const stats = {
    totalToday: appointments.length,
    notArrived: appointments.filter((a) => a.queueStatus === "not_arrived")
      .length,
    waiting: appointments.filter((a) => a.queueStatus === "waiting").length,
    inConsultation: appointments.filter(
      (a) => a.queueStatus === "in_consultation"
    ).length,
    done: appointments.filter((a) => a.queueStatus === "done").length,
  };

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
    date: dateStr,
    stats,
    count: formatted.length,
    queue: formatted,
  });
}

/**
 * PATCH /api/queue/:appointmentId/status
 * Updates the clinic queue status for an appointment.
 * When status is marked 'done', automatically updates appointment status to 'completed'.
 * Access: Receptionist, Doctor (assigned), Admin.
 */
export async function updateQueueStatus(
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

  const parsed = updateQueueStatusSchema.safeParse(req.body);
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

  if (appointment.status === "cancelled") {
    res.status(400).json({
      message: "Cannot update queue status for a cancelled appointment.",
    });
    return;
  }

  const currentUser = req.user!;

  // A doctor can only update queue status for appointments assigned to them
  if (
    currentUser.role === "doctor" &&
    String(appointment.doctorId) !== currentUser.sub
  ) {
    res.status(403).json({
      message:
        "Forbidden: You are not authorized to update queue status for this appointment.",
    });
    return;
  }

  appointment.queueStatus = parsed.data.queueStatus;

  // If marked 'done', automatically set appointment status to 'completed'
  if (parsed.data.queueStatus === "done") {
    appointment.status = "completed";
  } else if (appointment.status === "completed") {
    // If reverted from done to another status, revert to booked
    appointment.status = "booked";
  }

  await appointment.save();

  res.status(200).json({
    message: "Queue status updated successfully.",
    appointment: {
      id: appointment._id,
      status: appointment.status,
      queueStatus: appointment.queueStatus,
      updatedAt: appointment.updatedAt,
    },
  });
}
