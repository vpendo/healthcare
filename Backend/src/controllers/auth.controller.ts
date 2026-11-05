import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
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

  // expiresIn can be e.g. "7d" or "2h"; falls back to "1d"
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
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/register
 * Public. Registers a patient account.
 * Doctor / receptionist accounts are provisioned separately.
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
    res
      .status(409)
      .json({ message: "An account with this email already exists." });
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

  // passwordHash is excluded from queries by default (select: false), so we
  // explicitly re-include it here.
  const user = await User.findOne({ email }).select("+passwordHash").lean();
  if (!user) {
    // Generic message to avoid leaking which field is wrong
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    res.status(401).json({ message: "Invalid email or password." });
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
 * Authenticated. With Bearer tokens the client is responsible for discarding
 * the token. This endpoint signals that intent and can be extended with a
 * token-denylist if needed.
 */
export function logout(_req: Request, res: Response): void {
  res.status(200).json({ message: "Logged out successfully." });
}

/**
 * GET /api/auth/me
 * Authenticated. Returns the current user's public profile.
 */
export async function me(req: Request, res: Response): Promise<void> {
  // req.user is guaranteed by the authenticate middleware
  const userId = req.user!.sub;

  const user = await User.findById(userId).lean();
  if (!user) {
    res.status(404).json({ message: "User not found." });
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

// ---------------------------------------------------------------------------
// Admin-only controllers
// ---------------------------------------------------------------------------

const createStaffSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  role: z.enum(["doctor", "receptionist"], {
    message: "Role must be either 'doctor' or 'receptionist'.",
  }),
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
    res
      .status(409)
      .json({ message: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ name, email, passwordHash, role });

  res.status(201).json({
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
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
 * POST /api/auth/forgot-password
 * Public. Sends a 6-digit reset code if the email belongs to an account.
 * Always returns the same message so callers cannot probe for registered emails.
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
      { $set: { passwordResetCodeHash, passwordResetExpires } }
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

  res.status(200).json({ message: GENERIC_FORGOT_MESSAGE });
}

/**
 * POST /api/auth/verify-reset-code
 * Public. Verifies whether a 6-digit reset code is valid and unexpired
 * without modifying the account. Useful for step-by-step UI flows.
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
    res.status(400).json({ message: GENERIC_RESET_ERROR });
    return;
  }

  res.status(200).json({
    message: "Reset code is valid.",
  });
}

/**
 * POST /api/auth/reset-password
 * Public. Sets a new password when a valid, unexpired reset code is provided.
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
    res.status(400).json({ message: GENERIC_RESET_ERROR });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await User.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash },
      $unset: { passwordResetCodeHash: 1, passwordResetExpires: 1 },
    }
  );

  res.status(200).json({
    message: "Password reset successfully. You can now log in.",
  });
}
