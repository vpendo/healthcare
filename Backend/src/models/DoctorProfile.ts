import { Schema, model, type Types } from "mongoose";

export interface IDoctorProfile {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  specialty: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const doctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

doctorProfileSchema.index({ specialty: 1 });

export const DoctorProfile = model<IDoctorProfile>(
  "DoctorProfile",
  doctorProfileSchema
);
