
import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { AvailabilitySlot } from "../models/AvailabilitySlot.js";
import { User } from "../models/User.js";

// ---------------------------------------------------------------------------
// Validation Schemas
// ---------------------------------------------------------------------------

const createSlotSchema = z
  .object({
    doctorId: z.string().optional(),
    startTime: z
      .string()
      .datetime({ message: "startTime must be a valid ISO 8601 date string." }),
    endTime: z
      .string()
      .datetime({ message: "endTime must be a valid ISO 8601 date string." }),
    status: z.enum(["open", "unavailable"]).optional().default("open"),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "endTime must be after startTime.",
    path: ["endTime"],
  })
  .refine((data) => new Date(data.startTime) > new Date(), {
    message: "startTime cannot be in the past.",
    path: ["startTime"],
  });

const updateSlotSchema = z
  .object({
    startTime: z
      .string()
      .datetime({ message: "startTime must be a valid ISO 8601 date string." })
      .optional(),
    endTime: z
      .string()
      .datetime({ message: "endTime must be a valid ISO 8601 date string." })
      .optional(),
    status: z
      .enum(["open", "unavailable"], {
        message: "Status can only be updated to 'open' or 'unavailable'.",
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    {
      message: "endTime must be after startTime.",
      path: ["endTime"],
    }
  );

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function canManageSlots(role: string): boolean {
  return ["doctor", "receptionist", "admin"].includes(role);
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/slots
 * Creates a new availability slot.
 * Access: Doctor (for self), Receptionist or Admin (for any doctor).
 */
export async function createSlot(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = createSlotSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const currentUser = req.user!;

  if (!canManageSlots(currentUser.role)) {
    res.status(403).json({
      message: "You are not allowed to create availability slots.",
    });
    return;
  }

  let targetDoctorId = currentUser.sub;

  // Receptionist and admin must specify the doctor.
  if (
    currentUser.role === "receptionist" ||
    currentUser.role === "admin"
  ) {
    if (!parsed.data.doctorId) {
      res.status(400).json({
        message:
          "doctorId is required when creating a slot as receptionist or admin.",
      });
      return;
    }

    targetDoctorId = parsed.data.doctorId;
  }

  // Doctors cannot create slots for another doctor.
  if (
    currentUser.role === "doctor" &&
    parsed.data.doctorId &&
    parsed.data.doctorId !== currentUser.sub
  ) {
    res.status(403).json({
      message: "You can only create availability for yourself.",
    });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(targetDoctorId)) {
    res.status(400).json({ message: "Invalid doctor ID format." });
    return;
  }

  const doctor = await User.findById(targetDoctorId).lean();

  if (!doctor) {
    res.status(404).json({ message: "Doctor not found." });
    return;
  }

  if (doctor.role !== "doctor") {
    res.status(400).json({
      message:
        "Availability slots can only be created for users with the doctor role.",
    });
    return;
  }

  const start = new Date(parsed.data.startTime);
  const end = new Date(parsed.data.endTime);

  // Prevent overlapping slots for the same doctor.
  const hasOverlap = await AvailabilitySlot.findOne({
    doctorId: targetDoctorId,
    startTime: { $lt: end },
    endTime: { $gt: start },
  }).lean();

  if (hasOverlap) {
    res.status(409).json({
      message: "This slot overlaps with an existing slot for the doctor.",
    });
    return;
  }

  const slot = await AvailabilitySlot.create({
    doctorId: targetDoctorId,
    startTime: start,
    endTime: end,
    status: parsed.data.status,
  });

  res.status(201).json({
    message: "Availability slot created successfully.",
    slot: {
      id: slot._id,
      doctorId: doctor._id,
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      createdAt: slot.createdAt,
    },
  });
}

/**
 * GET /api/slots
 * Lists availability slots with optional filters:
 * ?doctorId=...
 * ?date=YYYY-MM-DD
 * ?startDate=...&endDate=...
 * ?status=open|booked|unavailable
 *
 * Doctors automatically see only their own slots.
 * Other authenticated users can use filters.
 */
export async function getSlots(
  req: Request,
  res: Response
): Promise<void> {
  const { doctorId, date, startDate, endDate, status } = req.query;

  const filter: Record<string, unknown> = {};

  // Doctors can only view their own availability.
  if (req.user?.role === "doctor") {
    filter.doctorId = req.user.sub;
  } else if (doctorId && typeof doctorId === "string") {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      res.status(400).json({ message: "Invalid doctor ID format." });
      return;
    }

    filter.doctorId = doctorId;
  }

  // Filter by a single date.
  if (date && typeof date === "string") {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    if (isNaN(dayStart.getTime())) {
      res.status(400).json({
        message: "Invalid date format. Expected YYYY-MM-DD.",
      });
      return;
    }

    filter.startTime = {
      $gte: dayStart,
      $lte: dayEnd,
    };
  } else if (startDate || endDate) {
    const timeFilter: Record<string, Date> = {};

    if (startDate && typeof startDate === "string") {
      const start = new Date(startDate);

      if (isNaN(start.getTime())) {
        res.status(400).json({ message: "Invalid startDate." });
        return;
      }

      timeFilter.$gte = start;
    }

    if (endDate && typeof endDate === "string") {
      const end = new Date(endDate);

      if (isNaN(end.getTime())) {
        res.status(400).json({ message: "Invalid endDate." });
        return;
      }

      timeFilter.$lte = end;
    }

    if (Object.keys(timeFilter).length > 0) {
      filter.startTime = timeFilter;
    }
  }

  // Filter by status.
  if (status && typeof status === "string") {
    if (!["open", "booked", "unavailable"].includes(status)) {
      res.status(400).json({ message: "Invalid slot status." });
      return;
    }

    filter.status = status;
  } else if (req.user?.role === "patient") {
    filter.status = "open";
  }

  const slots = await AvailabilitySlot.find(filter)
    .populate<{
      doctorId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        role: string;
      };
    }>("doctorId", "name email role")
    .sort({ startTime: 1 })
    .lean();

  const formatted = slots
    .filter((slot) => slot.doctorId != null)
    .map((slot) => ({
      id: slot._id,
      doctorId: slot.doctorId._id,
      doctorName: slot.doctorId.name,
      doctorEmail: slot.doctorId.email,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    }));

  res.status(200).json({
    count: formatted.length,
    slots: formatted,
  });
}

/**
 * GET /api/slots/:slotId
 * Retrieves a single availability slot by ID.
 * Access: Authenticated users.
 */
export async function getSlotById(
  req: Request,
  res: Response
): Promise<void> {
  const { slotId } = req.params;

  if (
    !slotId ||
    typeof slotId !== "string" ||
    !mongoose.Types.ObjectId.isValid(slotId)
  ) {
    res.status(400).json({ message: "Invalid slot ID." });
    return;
  }

  const slot = await AvailabilitySlot.findById(slotId)
    .populate<{
      doctorId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        role: string;
      };
    }>("doctorId", "name email role")
    .lean();

  if (!slot || !slot.doctorId) {
    res.status(404).json({
      message: "Availability slot not found.",
    });
    return;
  }

  // Doctors can only view their own slots.
  if (
    req.user?.role === "doctor" &&
    slot.doctorId._id.toString() !== req.user.sub
  ) {
    res.status(403).json({
      message: "You are only allowed to view your own slots.",
    });
    return;
  }

  res.status(200).json({
    slot: {
      id: slot._id,
      doctorId: slot.doctorId._id,
      doctorName: slot.doctorId.name,
      doctorEmail: slot.doctorId.email,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    },
  });
}

/**
 * PATCH /api/slots/:slotId
 * Updates a slot's date, time or status.
 * Access: Doctor (own slot), Receptionist or Admin.
 */
export async function updateSlot(
  req: Request,
  res: Response
): Promise<void> {
  const { slotId } = req.params;

  if (
    !slotId ||
    typeof slotId !== "string" ||
    !mongoose.Types.ObjectId.isValid(slotId)
  ) {
    res.status(400).json({ message: "Invalid slot ID." });
    return;
  }

  const currentUser = req.user!;

  if (!canManageSlots(currentUser.role)) {
    res.status(403).json({
      message: "You are not allowed to update availability slots.",
    });
    return;
  }

  const parsed = updateSlotSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const slot = await AvailabilitySlot.findById(slotId);

  if (!slot) {
    res.status(404).json({
      message: "Availability slot not found.",
    });
    return;
  }

  // A doctor can only update their own slot.
  if (
    currentUser.role === "doctor" &&
    slot.doctorId.toString() !== currentUser.sub
  ) {
    res.status(403).json({
      message: "You are only allowed to update your own slots.",
    });
    return;
  }

  // Booked slots cannot be modified.
  if (slot.status === "booked") {
    res.status(400).json({
      message:
        "Cannot modify a booked slot. Cancel the associated appointment first.",
    });
    return;
  }

  const newStart = parsed.data.startTime
    ? new Date(parsed.data.startTime)
    : slot.startTime;

  const newEnd = parsed.data.endTime
    ? new Date(parsed.data.endTime)
    : slot.endTime;

  if (newStart >= newEnd) {
    res.status(400).json({
      message: "endTime must be after startTime.",
    });
    return;
  }

  // A newly selected start time cannot be in the past.
  if (parsed.data.startTime && newStart <= new Date()) {
    res.status(400).json({
      message: "startTime cannot be in the past.",
    });
    return;
  }

  // A past slot cannot be reopened.
  if (parsed.data.status === "open" && newStart <= new Date()) {
    res.status(400).json({
      message: "A past availability slot cannot be opened.",
    });
    return;
  }

  const timeChanged =
    newStart.getTime() !== slot.startTime.getTime() ||
    newEnd.getTime() !== slot.endTime.getTime();

  if (timeChanged) {
    // Prevent overlapping slots belonging to the same doctor.
    const overlap = await AvailabilitySlot.findOne({
      _id: { $ne: slot._id },
      doctorId: slot.doctorId,
      startTime: { $lt: newEnd },
      endTime: { $gt: newStart },
    }).lean();

    if (overlap) {
      res.status(409).json({
        message:
          "Updated slot time overlaps with an existing slot for this doctor.",
      });
      return;
    }

    slot.startTime = newStart;
    slot.endTime = newEnd;
  }

  if (parsed.data.status) {
    slot.status = parsed.data.status;
  }

  await slot.save();

  const doctor = await User.findById(slot.doctorId).lean();

  res.status(200).json({
    message: "Availability slot updated successfully.",
    slot: {
      id: slot._id,
      doctorId: slot.doctorId,
      doctorName: doctor?.name,
      doctorEmail: doctor?.email,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    },
  });
}

/**
 * DELETE /api/slots/:slotId
 * Deletes an unbooked availability slot.
 * Access: Doctor (own slot), Receptionist or Admin.
 */
export async function deleteSlot(
  req: Request,
  res: Response
): Promise<void> {
  const { slotId } = req.params;

  if (
    !slotId ||
    typeof slotId !== "string" ||
    !mongoose.Types.ObjectId.isValid(slotId)
  ) {
    res.status(400).json({ message: "Invalid slot ID." });
    return;
  }

  const currentUser = req.user!;

  if (!canManageSlots(currentUser.role)) {
    res.status(403).json({
      message: "You are not allowed to delete availability slots.",
    });
    return;
  }

  const slot = await AvailabilitySlot.findById(slotId);

  if (!slot) {
    res.status(404).json({
      message: "Availability slot not found.",
    });
    return;
  }

  // A doctor can only delete their own slot.
  if (
    currentUser.role === "doctor" &&
    slot.doctorId.toString() !== currentUser.sub
  ) {
    res.status(403).json({
      message: "You are only allowed to delete your own slots.",
    });
    return;
  }

  // Booked slots cannot be deleted.
  if (slot.status === "booked") {
    res.status(400).json({
      message:
        "Cannot delete a booked slot. Cancel the associated appointment first.",
    });
    return;
  }

  await AvailabilitySlot.findByIdAndDelete(slotId);

  res.status(200).json({
    message: "Availability slot deleted successfully.",
  });
}
