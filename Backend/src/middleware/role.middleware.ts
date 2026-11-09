import type { Request, Response, NextFunction } from "express";
import type { JwtUserPayload } from "./auth.middleware.js";

type Role = JwtUserPayload["role"];

/**
 * Returns middleware that allows only users whose role is in `allowedRoles`.
 * Must be used after the `authenticate` middleware.
 *
 * @example
 *   router.post("/slots", authenticate, requireRole("doctor", "receptionist"), ...)
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      // authenticate should have run first
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: "Forbidden: insufficient permissions." });
      return;
    }

    next();
  };
}
