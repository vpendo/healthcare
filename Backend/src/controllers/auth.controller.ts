import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { z } from "zod";
import { DoctorProfile } from "../models/DoctorProfile.js";
import { User } from "../models/User.js";
import { sendEmail } from "../services/email.service.js";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  password: z.string().min(1, "Password is required."),
});

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
});

const verifyResetCodeSchema = z.object({
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  code: z.string().regex(/^\d{6}$/, "Reset code must be 6 digits."),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  code: z.string().regex(/^\d{6}$/, "Reset code must be 6 digits."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

const SALT_ROUNDS = 12;
const RESET_CODE_TTL_MS = 15 * 60 * 1000;

const GENERIC_FORGOT_MESSAGE =
  "If an account exists for this email, a reset code has been sent.";

const GENERIC_RESET_ERROR = "Invalid or expired reset code.";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function signToken(userId: string, role: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set.");

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1d") as string;

  return jwt.sign({ sub: userId, role }, secret, {
    algorithm: "HS256",
    expiresIn,
  } as jwt.SignOptions);
}

function hashResetCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function resetCodesMatch(storedHash: string, code: string): boolean {
  const stored = Buffer.from(storedHash, "hex");
  const incoming = Buffer.from(hashResetCode(code), "hex");

  if (stored.length !== incoming.length) return false;

  return timingSafeEqual(stored, incoming);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// ---------------------------------------------------------------------------
// Authentication controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/register
 * Public. Registers a patient account.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email }).lean();

  if (existing) {
    res.status(409).json({
      message: "An account with this email already exists.",
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "patient",
  });

  const token = signToken(String(user._id), user.role);

  res.status(201).json({
    message: "Account created successfully.",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

/**
 * POST /api/auth/login
 * Public. Validates credentials and returns a signed JWT.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select("+passwordHash").lean();

  if (!user) {
    res.status(401).json({
      message: "Invalid email or password.",
    });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    res.status(401).json({
      message: "Invalid email or password.",
    });
    return;
  }

  const token = signToken(String(user._id), user.role);

  res.status(200).json({
    message: "Login successful.",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

/**
 * POST /api/auth/logout
 * Authenticated.
 */
export function logout(_req: Request, res: Response): void {
  res.status(200).json({
    message: "Logged out successfully.",
  });
}

/**
 * GET /api/auth/me
 * Authenticated. Returns the current user's public profile.
 */
export async function me(req: Request, res: Response): Promise<void> {
  const userId = req.user!.sub;

  const user = await User.findById(userId).lean();

  if (!user) {
    res.status(404).json({
      message: "User not found.",
    });
    return;
  }

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}

/**
 * PATCH /api/auth/profile
 * Authenticated. Updates the current user's name and email.
 */
export async function updateProfile(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const userId = req.user!.sub;
  const { name, email } = parsed.data;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({
      message: "User not found.",
    });
    return;
  }

  // Check whether another user already has this email.
  const existingEmail = await User.findOne({
    email,
    _id: { $ne: userId },
  }).lean();

  if (existingEmail) {
    res.status(409).json({
      message: "An account with this email already exists.",
    });
    return;
  }

  user.name = name;
  user.email = email;

  await user.save();

  res.status(200).json({
    message: "Profile updated successfully.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

// ---------------------------------------------------------------------------
// Admin-only controllers
// ---------------------------------------------------------------------------

const doctorSpecialtySchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z.enum(["general consultation", "dental care", "optical care"], {
      message:
        "Specialty must be General consultation, Dental care, or Optical care.",
    })
  );

const createStaffSchema = z
  .object({
    name: z.string().min(1, "Name is required.").trim(),
    email: z.string().email("Invalid email address.").toLowerCase().trim(),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    specialty: doctorSpecialtySchema.optional(),
    role: z.enum(["doctor", "receptionist"], {
      message: "Role must be either 'doctor' or 'receptionist'.",
    }),
  })
  .superRefine((staff, context) => {
    if (staff.role === "doctor" && !staff.specialty) {
      context.addIssue({
        code: "custom",
        path: ["specialty"],
        message: "Specialty is required for doctor accounts.",
      });
    }
  });

const updateStaffSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .optional(),
  specialty: doctorSpecialtySchema.optional(),
});

/**
 * POST /api/auth/staff
 * Admin only. Creates a doctor or receptionist account.
 */
export async function createStaffAccount(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = createStaffSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, email, password, role } = parsed.data;

  const existing = await User.findOne({ email }).lean();

  if (existing) {
    res.status(409).json({
      message: "An account with this email already exists.",
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
  });

  if (role === "doctor") {
    const specialty = parsed.data.specialty;
    if (!specialty) {
      await User.deleteOne({ _id: user._id });
      res.status(400).json({
        message: "Specialty is required for doctor accounts.",
      });
      return;
    }

    try {
      await DoctorProfile.create({
        userId: user._id,
        specialty: specialty.toLowerCase(),
      });
    } catch (error) {
      await User.deleteOne({ _id: user._id });
      throw error;
    }
  }

  res.status(201).json({
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: parsed.data.specialty?.toLowerCase(),
      createdAt: user.createdAt,
    },
  });
}

/**
 * GET /api/auth/users
 * Admin only. Lists accounts for the admin dashboard.
 */
export async function getUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.find({
    role: { $in: ["patient", "doctor", "receptionist"] },
  })
    .select("name email role createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const doctorIds = users
    .filter((user) => user.role === "doctor")
    .map((user) => user._id);
  const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } })
    .select("userId specialty")
    .lean();
  const specialties = new Map(
    profiles.map((profile) => [String(profile.userId), profile.specialty])
  );

  res.status(200).json({
    users: users.map((user) => ({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      specialty: specialties.get(String(user._id)),
      createdAt: user.createdAt,
    })),
  });
}

/**
 * PATCH /api/auth/staff/:userId
 * Admin only. Updates a doctor or receptionist account.
 */
export async function updateStaffAccount(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.params.userId;
  if (typeof userId !== "string" || !mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Invalid user ID." });
    return;
  }

  const parsed = updateStaffSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const account = await User.findById(userId).select("+passwordHash");
  if (!account || !["doctor", "receptionist"].includes(account.role)) {
    res.status(404).json({ message: "Staff account not found." });
    return;
  }

  const { name, email, password, specialty } = parsed.data;
  const doctorSpecialty = account.role === "doctor" ? specialty : undefined;
  if (account.role === "doctor" && !doctorSpecialty) {
    res.status(400).json({
      message: "Specialty is required for doctor accounts.",
    });
    return;
  }

  const emailTaken = await User.findOne({
    email,
    _id: { $ne: account._id },
  }).lean();
  if (emailTaken) {
    res.status(409).json({
      message: "An account with this email already exists.",
    });
    return;
  }

  account.name = name;
  account.email = email;
  if (password) {
    account.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }
  await account.save();

  if (account.role === "doctor" && doctorSpecialty) {
    await DoctorProfile.findOneAndUpdate(
      { userId: account._id },
      { $set: { specialty: doctorSpecialty.toLowerCase() } },
      { upsert: true, runValidators: true }
    );
  }

  res.status(200).json({
    message: "Staff account updated successfully.",
    user: {
      id: String(account._id),
      name: account.name,
      email: account.email,
      role: account.role,
      specialty: specialty?.toLowerCase(),
    },
  });
}

/**
 * DELETE /api/auth/staff/:userId
 * Admin only. Deletes a doctor or receptionist account.
 */
export async function deleteStaffAccount(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.params.userId;
  if (typeof userId !== "string" || !mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Invalid user ID." });
    return;
  }

  const account = await User.findById(userId).select("role");
  if (!account || !["doctor", "receptionist"].includes(account.role)) {
    res.status(404).json({ message: "Staff account not found." });
    return;
  }

  if (account.role === "doctor") {
    await DoctorProfile.deleteOne({ userId: account._id });
  }
  await account.deleteOne();

  res.status(200).json({ message: "Staff account deleted successfully." });
}

// ---------------------------------------------------------------------------
// Password reset controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/forgot-password
 * Public. Sends a 6-digit reset code if the email belongs to an account.
 */
export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { email } = parsed.data;
  const user = await User.findOne({ email });

  if (user) {
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");

    const passwordResetCodeHash = hashResetCode(code);
    const passwordResetExpires = new Date(Date.now() + RESET_CODE_TTL_MS);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetCodeHash,
          passwordResetExpires,
        },
      }
    );

    try {
      await sendEmail({
        to: [{ email: user.email, name: user.name }],
        subject: "Your FamCare password reset code",
        htmlContent: `<p>Hi ${escapeHtml(user.name)},</p>
<p>Your password reset code is:</p>
<p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p>
<p>This code expires in 15 minutes. If you did not request a reset, you can ignore this email.</p>`,
      });
    } catch (err) {
      console.error("Failed to send password reset email:", err);
    }
  }

  res.status(200).json({
    message: GENERIC_FORGOT_MESSAGE,
  });
}

/**
 * POST /api/auth/verify-reset-code
 * Public. Verifies whether a 6-digit reset code is valid and unexpired.
 */
export async function verifyResetCode(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = verifyResetCodeSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, code } = parsed.data;

  const user = await User.findOne({ email }).select(
    "+passwordResetCodeHash +passwordResetExpires"
  );

  const storedHash = user?.passwordResetCodeHash;
  const expiresAt = user?.passwordResetExpires;
  const isExpired = !expiresAt || expiresAt.getTime() < Date.now();

  if (!user || !storedHash || isExpired || !resetCodesMatch(storedHash, code)) {
    res.status(400).json({
      message: GENERIC_RESET_ERROR,
    });
    return;
  }

  res.status(200).json({
    message: "Reset code is valid.",
  });
}

/**
 * POST /api/auth/reset-password
 * Public. Sets a new password with a valid reset code.
 */
export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Validation error.",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, code, newPassword } = parsed.data;

  const user = await User.findOne({ email }).select(
    "+passwordResetCodeHash +passwordResetExpires"
  );

  const storedHash = user?.passwordResetCodeHash;
  const expiresAt = user?.passwordResetExpires;
  const isExpired = !expiresAt || expiresAt.getTime() < Date.now();

  if (!user || !storedHash || isExpired || !resetCodesMatch(storedHash, code)) {
    res.status(400).json({
      message: GENERIC_RESET_ERROR,
    });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await User.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash },
      $unset: {
        passwordResetCodeHash: 1,
        passwordResetExpires: 1,
      },
    }
  );

  res.status(200).json({
    message: "Password reset successfully. You can now log in.",
  });
}
