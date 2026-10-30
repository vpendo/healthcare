
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "FamCare API is running!" });
});

// ── Swagger UI ──────────────────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Global error handler ─────────────────────────────────────────────────────
// Express 5 automatically forwards async errors to this handler.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";
  res.status(500).json({ message });
});

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`FamCare API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
}

startServer();

