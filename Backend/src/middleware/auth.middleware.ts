import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtUserPayload {
  sub: string; // user._id
  role: "patient" | "receptionist" | "doctor";
}

/**
 * Verifies the Bearer token in the Authorization header.
 * On success, attaches the decoded payload to req.user.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided." });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Misconfiguration — should never reach production
    res.status(500).json({ message: "Server configuration error." });
    return;
  }

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as JwtUserPayload;

    // Ensure expected claims are present
    if (!payload.sub || !payload.role) {
      res.status(401).json({ message: "Invalid token claims." });
      return;
    }

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}
