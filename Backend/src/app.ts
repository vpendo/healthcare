import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "FamCare API is running!" });
});

// ── Swagger UI ──────────────────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";
  res.status(500).json({ message });
});

export default app;
