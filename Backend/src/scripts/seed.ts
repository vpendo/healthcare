/**
 * Seed Script — Run once to create the admin account.
 *
 * Usage: npm run seed
 *
 * Required environment variables:
 *   MONGODB_URI     - MongoDB connection string
 *   ADMIN_EMAIL     - Admin account email
 *   ADMIN_PASSWORD  - Admin account password (min 8 characters)
 *   ADMIN_NAME      - Admin display name (optional, defaults to "Admin")
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

dotenv.config();

async function seed(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌  MONGODB_URI is not set in environment variables.");
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME ?? "Admin";

  if (!adminEmail || !adminPassword) {
    console.error(
      "❌  ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables."
    );
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error("❌  ADMIN_PASSWORD must be at least 8 characters long.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("✅  Connected to MongoDB.");

  // Check if an admin already exists — idempotent
  const existingAdmin = await User.findOne({ role: "admin" }).lean();
  if (existingAdmin) {
    console.log(
      `ℹ️   Admin account already exists (${existingAdmin.email}). Skipping.`
    );
    await mongoose.disconnect();
    return;
  }

  // Also check if the email is already taken by another role
  const emailTaken = await User.findOne({ email: adminEmail }).lean();
  if (emailTaken) {
    console.error(
      `❌  The email "${adminEmail}" is already registered with role "${emailTaken.role}".`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const SALT_ROUNDS = 12;
  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  await User.create({
    name: adminName,
    email: adminEmail,
    passwordHash,
    role: "admin",
  });

  console.log(`✅  Admin account created successfully.`);
  console.log(`    Name:  ${adminName}`);
  console.log(`    Email: ${adminEmail}`);
  console.log(`    Role:  admin`);

  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("❌  Seed script failed:", err);
  process.exit(1);
});
