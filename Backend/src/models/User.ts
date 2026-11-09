import { Schema, model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "patient" | "receptionist" | "doctor" | "admin";
  passwordResetCodeHash?: string;
  passwordResetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["patient", "receptionist", "doctor", "admin"],
      default: "patient",
      required: true,
    },
    passwordResetCodeHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
