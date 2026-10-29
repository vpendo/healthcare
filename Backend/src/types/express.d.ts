declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: "patient" | "receptionist" | "doctor";
      };
    }
  }
}

// This file must contain at least one import or export to be a module
export {};
