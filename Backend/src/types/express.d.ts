declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: "patient" | "receptionist" | "doctor" | "admin";
      };
    }
  }
}

// This file must contain at least one import or export to be a module
export {};
