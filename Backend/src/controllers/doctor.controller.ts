
import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { DoctorProfile } from "../models/DoctorProfile.js";
import { User } from "../models/User.js";

// ---------------------------------------------------------------------------
// Validation Schemas
// ---------------------------------------------------------------------------

const createDoctorProfileSchema = z.object({
  userId: z.string().optional(),
  specialty: z
    .string()
    .min(2, "Specialty must be at least 2 characters long.")
    .trim(),
});

const updateDoctorProfileSchema = z.object({
  specialty: z
    .string()
    .min(2, "Specialty must be at least 2 characters long.")
    .trim(),
});

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/doctors
 * Creates a doctor profile.
 * Access: Doctor (for themselves) or Admin (specifying userId).
 */
export async function createDoctorProfile(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = createDoctorProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const currentUser = req.user!;
  let targetUserId = currentUser.sub;

  // If an admin is creating the profile, they must supply the target doctor's userId.
  if (currentUser.role === "admin") {
    if (!parsed.data.userId) {
      res.status(400).json({
        message: "userId is required when creating a doctor profile as admin.",
      });
      return;
    }

    targetUserId = parsed.data.userId;
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    res.status(400).json({ message: "Invalid user ID format." });
    return;
  }

  // Ensure the referenced user exists and has the doctor role.
  const user = await User.findById(targetUserId).lean();

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  if (user.role !== "doctor") {
    res.status(400).json({
      message: "Only users with the doctor role can have doctor profiles.",
    });
    return;
  }

  // Check if this doctor already has a profile.
  const existingProfile = await DoctorProfile.findOne({
    userId: targetUserId,
  }).lean();

  if (existingProfile) {
    res.status(409).json({
      message: "A doctor profile already exists for this doctor.",
    });
    return;
  }

  const profile = await DoctorProfile.create({
    userId: targetUserId,
    specialty: parsed.data.specialty.toLowerCase(),
  });

  res.status(201).json({
    message: "Doctor profile created successfully.",
    profile: {
      id: profile._id,
      doctorId: user._id,
      name: user.name,
      email: user.email,
      specialty: profile.specialty,
      createdAt: profile.createdAt,
    },
  });
}

/**
 * GET /api/doctors
 * Lists all doctor profiles, optionally filtered by ?specialty=...
 * Access: Authenticated users.
 */
export async function getDoctors(
  req: Request,
  res: Response
): Promise<void> {
  const specialtyQuery = req.query.specialty as string | undefined;

  const filter: Record<string, unknown> = {};

  if (specialtyQuery && specialtyQuery.trim().length > 0) {
    filter.specialty = {
      $regex: new RegExp(specialtyQuery.trim().toLowerCase(), "i"),
    };
  }

  const profiles = await DoctorProfile.find(filter)
    .populate<{
      userId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        role: string;
      };
    }>("userId", "name email role")
    .sort({ createdAt: -1 })
    .lean();

  const formatted = profiles
    .filter((profile) => profile.userId != null)
    .map((profile) => ({
      id: profile._id,
      doctorId: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      specialty: profile.specialty,
      createdAt: profile.createdAt,
    }));

  res.status(200).json({
    count: formatted.length,
    doctors: formatted,
  });
}

/**
 * GET /api/doctors/:doctorId
 * Retrieves a doctor profile by doctor ID (the doctor's User._id).
 * Access: Authenticated users.
 */
export async function getDoctorById(
  req: Request,
  res: Response
): Promise<void> {
  const { doctorId } = req.params;

  if (
    !doctorId ||
    typeof doctorId !== "string" ||
    !mongoose.Types.ObjectId.isValid(doctorId)
  ) {
    res.status(400).json({ message: "Invalid doctor ID." });
    return;
  }

  const profile = await DoctorProfile.findOne({
    $or: [{ userId: doctorId }, { _id: doctorId }],
  })
    .populate<{
      userId: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        role: string;
      };
    }>("userId", "name email role")
    .lean();

  if (!profile || !profile.userId) {
    res.status(404).json({ message: "Doctor profile not found." });
    return;
  }

  res.status(200).json({
    doctor: {
      id: profile._id,
      doctorId: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      specialty: profile.specialty,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    },
  });
}

/**
 * PATCH /api/doctors/:doctorId
 * Updates doctor specialty or creates a missing doctor profile.
 * Access: Doctor (updating own profile) or Admin.
 */
export async function updateDoctorProfile(
  req: Request,
  res: Response
): Promise<void> {
  const { doctorId } = req.params;

  if (
    !doctorId ||
    typeof doctorId !== "string" ||
    !mongoose.Types.ObjectId.isValid(doctorId)
  ) {
    res.status(400).json({ message: "Invalid doctor ID." });
    return;
  }

  const parsed = updateDoctorProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const currentUser = req.user!;

  // Doctors can only update their own profiles.
  if (
    currentUser.role === "doctor" &&
    String(currentUser.sub) !== doctorId
  ) {
    res.status(403).json({
      message: "Forbidden: You are only allowed to update your own profile.",
    });
    return;
  }

  // Confirm that the doctor account exists.
  const user = await User.findById(doctorId);

  if (!user) {
    res.status(404).json({ message: "Doctor account not found." });
    return;
  }

  // Only users with the doctor role can have doctor profiles.
  if (user.role !== "doctor") {
    res.status(400).json({
      message: "This account does not have the doctor role.",
    });
    return;
  }

  // Find the existing profile using the doctor's User ID.
  let profile = await DoctorProfile.findOne({
    userId: doctorId,
  });

  if (profile) {
    // Update the existing profile.
    profile.specialty = parsed.data.specialty.toLowerCase();
    await profile.save();
  } else {
    // Create a profile if one does not already exist.
    profile = await DoctorProfile.create({
      userId: doctorId,
      specialty: parsed.data.specialty.toLowerCase(),
    });
  }

  res.status(200).json({
    message: "Doctor profile updated successfully.",
    doctor: {
      id: profile._id,
      doctorId: user._id,
      name: user.name,
      email: user.email,
      specialty: profile.specialty,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    },
  });
}
