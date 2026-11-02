import { Schema, model, type Document, Types } from "mongoose";

export interface IAvailabilitySlot {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: "open" | "booked" | "unavailable";
  createdAt?: Date;
  updatedAt?: Date;
}

export type AvailabilitySlotDocument = Document<
  Types.ObjectId,
  Record<string, unknown>,
  IAvailabilitySlot
> &
  IAvailabilitySlot;

const availabilitySlotSchema = new Schema<IAvailabilitySlot>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "booked", "unavailable"],
      default: "open",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent exact duplicate slot start times for the same doctor
availabilitySlotSchema.index({ doctorId: 1, startTime: 1 }, { unique: true });

// Optimize querying available slots for a specific doctor
availabilitySlotSchema.index({ doctorId: 1, status: 1, startTime: 1 });

export const AvailabilitySlot = model<IAvailabilitySlot>(
  "AvailabilitySlot",
  availabilitySlotSchema
);
