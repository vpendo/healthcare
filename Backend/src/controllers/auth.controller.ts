import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address.").toLowerCase().trim(),
  password: z.string().min(1, "Password is required."),
});

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
    res.status(400).json({ message: "Validation error.", errors: parsed.error.flatten().fieldErrors });
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    res.status(409).json({ message: "An account with this email already exists." });
    return;
  }

  const SALT_ROUNDS = 12;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({ name, email, passwordHash, role: "patient" });

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
    res.status(400).json({ message: "Validation error.", errors: parsed.error.flatten().fieldErrors });
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
