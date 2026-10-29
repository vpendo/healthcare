
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "FamCare API is running!" });
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

