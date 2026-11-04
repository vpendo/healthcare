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
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/slots
 * Creates a new availability slot.
 * Access: Doctor (for self) or Receptionist/Admin (for any doctor).
 */
export async function createSlot(req: Request, res: Response): Promise<void> {
  const parsed = createSlotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const currentUser = req.user!;
  let targetDoctorId = currentUser.sub;

  // Receptionist or admin can specify target doctorId
  if (currentUser.role === "receptionist" || currentUser.role === "admin") {
    if (!parsed.data.doctorId) {
      res.status(400).json({
        message:
          "doctorId is required when creating a slot as receptionist or admin.",
      });
      return;
    }
    targetDoctorId = parsed.data.doctorId;
  }

  if (!mongoose.Types.ObjectId.isValid(targetDoctorId)) {
    res.status(400).json({ message: "Invalid doctor ID format." });
    return;
  }

  // Verify the target user exists and has doctor role
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

  // Check for overlapping slots for the same doctor
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
 * ?startDate=... & ?endDate=...
 * ?status=open|booked|unavailable
 * Access: Authenticated users (Patient, Doctor, Receptionist, Admin).
 */
export async function getSlots(req: Request, res: Response): Promise<void> {
  const { doctorId, date, startDate, endDate, status } = req.query;

  const filter: Record<string, unknown> = {};

  if (doctorId && typeof doctorId === "string") {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      res.status(400).json({ message: "Invalid doctor ID format." });
      return;
    }
    filter.doctorId = doctorId;
  }

  // Filter by single date (YYYY-MM-DD)
  if (date && typeof date === "string") {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    if (isNaN(dayStart.getTime())) {
      res
        .status(400)
        .json({ message: "Invalid date format. Expected YYYY-MM-DD." });
      return;
    }

    filter.startTime = { $gte: dayStart, $lte: dayEnd };
  } else if (startDate || endDate) {
    // Filter by date range
    const timeFilter: Record<string, Date> = {};
    if (startDate && typeof startDate === "string") {
      const s = new Date(startDate);
      if (!isNaN(s.getTime())) timeFilter.$gte = s;
    }
    if (endDate && typeof endDate === "string") {
      const e = new Date(endDate);
      if (!isNaN(e.getTime())) timeFilter.$lte = e;
    }
    if (Object.keys(timeFilter).length > 0) {
      filter.startTime = timeFilter;
    }
  }

  // Filter by status
  if (status && typeof status === "string") {
    if (["open", "booked", "unavailable"].includes(status)) {
      filter.status = status;
    }
  } else if (req.user?.role === "patient") {
    // By default, patients only see open slots unless explicitly asked
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
    .filter((s) => s.doctorId != null)
    .map((s) => ({
      id: s._id,
      doctorId: s.doctorId._id,
      doctorName: s.doctorId.name,
      doctorEmail: s.doctorId.email,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      createdAt: s.createdAt,
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
export async function getSlotById(req: Request, res: Response): Promise<void> {
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
    res.status(404).json({ message: "Availability slot not found." });
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
 * Updates slot status (e.g. open <-> unavailable) or timing.
 * Access: Doctor (own slot), Receptionist, Admin.
 */
export async function updateSlot(req: Request, res: Response): Promise<void> {
  const { slotId } = req.params;

  if (
    !slotId ||
    typeof slotId !== "string" ||
    !mongoose.Types.ObjectId.isValid(slotId)
  ) {
    res.status(400).json({ message: "Invalid slot ID." });
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
    res.status(404).json({ message: "Availability slot not found." });
    return;
  }

  const currentUser = req.user!;

  // A doctor can only update their own slot
  if (
    currentUser.role === "doctor" &&
    slot.doctorId.toString() !== currentUser.sub
  ) {
    res.status(403).json({
      message: "Forbidden: You are only allowed to update your own slots.",
    });
    return;
  }

  // Cannot modify a slot that is already booked directly
  if (slot.status === "booked") {
    res.status(400).json({
      message:
        "Cannot modify a booked slot directly. Please cancel the associated appointment first.",
    });
    return;
  }

  // Handle time updates
  const newStart = parsed.data.startTime
    ? new Date(parsed.data.startTime)
    : slot.startTime;
  const newEnd = parsed.data.endTime
    ? new Date(parsed.data.endTime)
    : slot.endTime;

  if (newStart >= newEnd) {
    res.status(400).json({ message: "endTime must be after startTime." });
    return;
  }

  // If time changed, check for overlaps with other slots
  if (
    (parsed.data.startTime &&
      newStart.getTime() !== slot.startTime.getTime()) ||
    (parsed.data.endTime && newEnd.getTime() !== slot.endTime.getTime())
  ) {
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
      updatedAt: slot.updatedAt,
    },
  });
}

/**
 * DELETE /api/slots/:slotId
 * Deletes an unbooked availability slot.
 * Access: Doctor (own slot), Receptionist, Admin.
 */
export async function deleteSlot(req: Request, res: Response): Promise<void> {
  const { slotId } = req.params;

  if (
    !slotId ||
    typeof slotId !== "string" ||
    !mongoose.Types.ObjectId.isValid(slotId)
  ) {
    res.status(400).json({ message: "Invalid slot ID." });
    return;
  }

  const slot = await AvailabilitySlot.findById(slotId);
  if (!slot) {
    res.status(404).json({ message: "Availability slot not found." });
    return;
  }

  const currentUser = req.user!;

  // Doctor can only delete their own slot
  if (
    currentUser.role === "doctor" &&
    slot.doctorId.toString() !== currentUser.sub
  ) {
    res.status(403).json({
      message: "Forbidden: You are only allowed to delete your own slots.",
    });
    return;
  }

  // Cannot delete a booked slot
  if (slot.status === "booked") {
    res.status(400).json({
      message: "Cannot delete a booked slot. Cancel the appointment first.",
    });
    return;
  }

  await AvailabilitySlot.findByIdAndDelete(slotId);

  res.status(200).json({
    message: "Availability slot deleted successfully.",
  });
}
