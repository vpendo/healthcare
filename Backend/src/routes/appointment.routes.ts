
import { Router } from "express";
import {
  bookAppointment,
  getAppointments,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  updateDoctorNote,
  updateAppointmentSymptoms,
  rescheduleAppointment,
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

// ---------------------------------------------------------------------------
// Book appointment
// ---------------------------------------------------------------------------

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
 *                 example: 665f1a2b3c4d5e6f7a8b9c0d
 *               patientId:
 *                 type: string
 *                 description: Required when booking as receptionist/admin
 *                 example: 665f1a2b3c4d5e6f7a8b9c0e
 *               symptoms:
 *                 type: string
 *                 example: "Persistent dry cough and mild fever for 3 days."
 *               suggestedSpecialty:
 *                 type: string
 *                 example: "pulmonology"
 *               urgent:
 *                 type: boolean
 *                 default: false
 *               aiSummary:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Validation error or invalid user role
 *       404:
 *         description: Slot or patient not found
 *       409:
 *         description: Slot is no longer available
 */
router.post(
  "/",
  authenticate,
  requireRole("patient", "receptionist", "admin"),
  bookAppointment
);

// ---------------------------------------------------------------------------
// Get my appointments
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Get my appointments
 *     description: Retrieve appointments associated with the authenticated patient or doctor.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of current user's appointments
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Only patients and doctors can access this endpoint
 */
router.get(
  "/my",
  authenticate,
  requireRole("patient", "doctor"),
  getMyAppointments
);

// ---------------------------------------------------------------------------
// List appointments
// ---------------------------------------------------------------------------

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
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [booked, cancelled, completed]
 *       - in: query
 *         name: queueStatus
 *         schema:
 *           type: string
 *           enum: [not_arrived, waiting, in_consultation, done]
 *       - in: query
 *         name: urgent
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Filtered list of appointments
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  "/",
  authenticate,
  requireRole("doctor", "receptionist", "admin"),
  getAppointments
);

// ---------------------------------------------------------------------------
// Update appointment symptoms
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/appointments/{appointmentId}/symptoms:
 *   patch:
 *     summary: Update appointment symptoms
 *     description: Allows a patient to update symptoms before arriving for their booked appointment. Previous AI summary and suggested specialty are cleared because they may no longer match the updated symptoms.
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
 *               - symptoms
 *             properties:
 *               symptoms:
 *                 type: string
 *                 example: "I have had a persistent headache and fever for two days."
 *     responses:
 *       200:
 *         description: Symptoms updated successfully
 *       400:
 *         description: Validation error or appointment cannot be modified
 *       403:
 *         description: Not authorized to update this appointment
 *       404:
 *         description: Appointment not found
 */
router.patch(
  "/:appointmentId/symptoms",
  authenticate,
  requireRole("patient"),
  updateAppointmentSymptoms
);

// ---------------------------------------------------------------------------
// Reschedule appointment
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/appointments/{appointmentId}/reschedule:
 *   patch:
 *     summary: Reschedule an appointment
 *     description: Allows a patient to select another available future slot with the same doctor before arriving. The old slot is reopened and the new slot is reserved.
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
 *               - slotId
 *             properties:
 *               slotId:
 *                 type: string
 *                 description: ID of the new available slot
 *                 example: 665f1a2b3c4d5e6f7a8b9c0d
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       400:
 *         description: Invalid slot or appointment cannot be modified
 *       403:
 *         description: Not authorized to reschedule this appointment
 *       404:
 *         description: Appointment or slot not found
 *       409:
 *         description: New slot is no longer available
 */
router.patch(
  "/:appointmentId/reschedule",
  authenticate,
  requireRole("patient"),
  rescheduleAppointment
);

// ---------------------------------------------------------------------------
// Get appointment details
// ---------------------------------------------------------------------------

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
 *         description: Not authorized to view this appointment
 *       404:
 *         description: Appointment not found
 */
router.get("/:appointmentId", authenticate, getAppointmentById);

// ---------------------------------------------------------------------------
// Cancel appointment
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/appointments/{appointmentId}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     description: Cancels an existing booked appointment and automatically reopens its availability slot. Patient cancellation is only allowed before arrival.
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
 *         description: Already cancelled, completed, or cannot be cancelled
 *       403:
 *         description: Not authorized to cancel this appointment
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment slot could not be released
 */
router.patch(
  "/:appointmentId/cancel",
  authenticate,
  cancelAppointment
);

// ---------------------------------------------------------------------------
// Update doctor note
// ---------------------------------------------------------------------------

/**
 * @swagger
 * /api/appointments/{appointmentId}/note:
 *   patch:
 *     summary: Add or update doctor consultation notes
 *     description: Allows the assigned doctor or admin to record notes on an appointment.
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
 *                 example: "Patient reports improvement after follow-up."
 *     responses:
 *       200:
 *         description: Doctor note updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized to add notes
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
