
import { Schema, model, type Document, Types } from "mongoose";

export interface IAppointment {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  slotId: Types.ObjectId;
  symptoms: string;
  suggestedSpecialty?: string | undefined;
  urgent: boolean;
  aiSummary?: string | undefined;
  status: "booked" | "cancelled" | "completed";
  queueStatus: "not_arrived" | "waiting" | "in_consultation" | "done";
  doctorNote?: string | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export type AppointmentDocument = Document<
  Types.ObjectId,
  Record<string, unknown>,
  IAppointment
> &
  IAppointment;

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "AvailabilitySlot",
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
    },
    suggestedSpecialty: {
      type: String,
      trim: true,
      lowercase: true,
    },
    urgent: {
      type: Boolean,
      default: false,
      index: true,
    },
    aiSummary: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
      required: true,
      index: true,
    },
    queueStatus: {
      type: String,
      enum: ["not_arrived", "waiting", "in_consultation", "done"],
      default: "not_arrived",
      required: true,
      index: true,
    },
    doctorNote: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Only booked appointments must have unique availability slots.
// Cancelled appointments remain in history without blocking slot reuse.
appointmentSchema.index(
  { slotId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "booked" },
    name: "unique_booked_appointment_per_slot",
  }
);

// Indexes for common queries
appointmentSchema.index({ patientId: 1, status: 1, createdAt: -1 });
appointmentSchema.index({ doctorId: 1, status: 1, createdAt: -1 });
appointmentSchema.index({ doctorId: 1, queueStatus: 1 });

export const Appointment = model<IAppointment>(
  "Appointment",
  appointmentSchema
);
