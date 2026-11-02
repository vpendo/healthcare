import { Router } from "express";
import {
  bookAppointment,
  getAppointments,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  updateDoctorNote,
} from "../controllers/appointment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Patient appointments and booking management
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book an appointment
 *     description: Atomically reserves an open availability slot and books an appointment. Patients book for themselves; receptionists/admins book by supplying patientId.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotId
 *               - symptoms
 *             properties:
 *               slotId:
 *                 type: string
 *                 description: Availability slot ID to reserve
 *                 example: 665f1a2b3c4d5e6f7a8b9c0d
 *               patientId:
 *                 type: string
 *                 description: Target patient user ID (required when booking as receptionist/admin)
 *                 example: 665f1a2b3c4d5e6f7a8b9c0e
 *               symptoms:
 *                 type: string
 *                 description: Patient description of symptoms or reason for visit
 *                 example: "Persistent dry cough and mild fever for 3 days."
 *               suggestedSpecialty:
 *                 type: string
 *                 description: Optional specialty recommendation
 *                 example: "pulmonology"
 *               urgent:
 *                 type: boolean
 *                 description: Flag indicating clinical urgency
 *                 default: false
 *               aiSummary:
 *                 type: string
 *                 description: Optional triage summary from AI assistant
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Validation error or invalid user role
 *       404:
 *         description: Slot or patient not found
 *       409:
 *         description: Slot is no longer available (double-booking prevented)
 */
router.post(
  "/",
  authenticate,
  requireRole("patient", "receptionist", "admin"),
  bookAppointment
);

/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Get my appointments
 *     description: Retrieve all appointments associated with the authenticated patient or doctor.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of current user's appointments
 *       401:
 *         description: Not authenticated
 */
router.get("/my", authenticate, getMyAppointments);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: List all appointments
 *     description: Retrieve appointments with optional filters. Doctors only view their own assigned appointments.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter appointments by doctor ID
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter appointments by patient ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [booked, cancelled, completed]
 *         description: Filter by appointment status
 *       - in: query
 *         name: queueStatus
 *         schema:
 *           type: string
 *           enum: [not_arrived, waiting, in_consultation, done]
 *         description: Filter by clinic queue status
 *       - in: query
 *         name: urgent
 *         schema:
 *           type: boolean
 *         description: Filter by urgency flag
 *     responses:
 *       200:
 *         description: Filtered list of appointments
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/",
  authenticate,
  requireRole("doctor", "receptionist", "admin"),
  getAppointments
);

/**
 * @swagger
 * /api/appointments/{appointmentId}:
 *   get:
 *     summary: Get appointment details
 *     description: Retrieve full details for a single appointment.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment details
 *       403:
 *         description: Forbidden - Not authorized to view this appointment
 *       404:
 *         description: Appointment not found
 */
router.get("/:appointmentId", authenticate, getAppointmentById);

/**
 * @swagger
 * /api/appointments/{appointmentId}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     description: Cancels an existing booked appointment and automatically reopens its availability slot.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled and slot reopened
 *       400:
 *         description: Already cancelled or completed
 *       403:
 *         description: Forbidden - Not authorized to cancel this appointment
 *       404:
 *         description: Appointment not found
 */
router.patch("/:appointmentId/cancel", authenticate, cancelAppointment);

/**
 * @swagger
 * /api/appointments/{appointmentId}/note:
 *   patch:
 *     summary: Add or update doctor consultation notes
 *     description: Allows the assigned doctor or admin to record medical notes on an appointment.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorNote
 *             properties:
 *               doctorNote:
 *                 type: string
 *                 example: "Patient exhibits clear lungs, throat inflammation. Prescribed amoxicillin 500mg 3x daily for 7 days."
 *     responses:
 *       200:
 *         description: Doctor note updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Not authorized to add notes to this appointment
 *       404:
 *         description: Appointment not found
 */
router.patch(
  "/:appointmentId/note",
  authenticate,
  requireRole("doctor", "admin"),
  updateDoctorNote
);

export default router;
