import { Router } from "express";
import {
  createSlot,
  getSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
} from "../controllers/slot.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Slots
 *   description: Doctor availability slots management
 */

/**
 * @swagger
 * /api/slots:
 *   get:
 *     summary: List availability slots
 *     description: Retrieve availability slots with optional filters by doctor, date, or status. Patients default to viewing open slots.
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter slots by doctor User ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2026-11-10"
 *         description: Filter slots for a specific date (YYYY-MM-DD)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter slots starting on or after this ISO date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter slots ending on or before this ISO date-time
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, booked, unavailable]
 *         description: Filter slots by status
 *     responses:
 *       200:
 *         description: List of availability slots
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Not authenticated
 */
router.get("/", authenticate, getSlots);

/**
 * @swagger
 * /api/slots/{slotId}:
 *   get:
 *     summary: Get an availability slot by ID
 *     description: Retrieve detailed information about a single availability slot.
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability slot details
 *       404:
 *         description: Slot not found
 *       401:
 *         description: Not authenticated
 */
router.get("/:slotId", authenticate, getSlotById);

/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Create an availability slot
 *     description: Creates an availability slot for a doctor. Doctors create for themselves; receptionists and admins specify doctorId.
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - endTime
 *             properties:
 *               doctorId:
 *                 type: string
 *                 description: Target doctor's user ID (required for receptionist/admin)
 *                 example: 665f1a2b3c4d5e6f7a8b9c0d
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-10T09:00:00.000Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-11-10T09:30:00.000Z"
 *               status:
 *                 type: string
 *                 enum: [open, unavailable]
 *                 default: open
 *     responses:
 *       201:
 *         description: Slot created successfully
 *       400:
 *         description: Validation error or invalid user role
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Slot overlaps with existing slot
 */
router.post(
  "/",
  authenticate,
  requireRole("doctor", "receptionist", "admin"),
  createSlot
);

/**
 * @swagger
 * /api/slots/{slotId}:
 *   patch:
 *     summary: Update an availability slot
 *     description: Update an existing slot's status or time. Only doctors (own slots), receptionists, and admins are permitted. Booked slots cannot be modified.
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [open, unavailable]
 *     responses:
 *       200:
 *         description: Slot updated successfully
 *       400:
 *         description: Validation error or cannot modify booked slot
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Updated time overlaps with existing slot
 */
router.patch(
  "/:slotId",
  authenticate,
  requireRole("doctor", "receptionist", "admin"),
  updateSlot
);

/**
 * @swagger
 * /api/slots/{slotId}:
 *   delete:
 *     summary: Delete an availability slot
 *     description: Deletes an unbooked availability slot. Only doctors (own slots), receptionists, and admins are permitted.
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slot deleted successfully
 *       400:
 *         description: Cannot delete a booked slot
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Slot not found
 */
router.delete(
  "/:slotId",
  authenticate,
  requireRole("doctor", "receptionist", "admin"),
  deleteSlot
);

export default router;
