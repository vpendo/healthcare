import { Router } from "express";
import {
  getTodayQueue,
  updateQueueStatus,
} from "../controllers/queue.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Queue
 *   description: Clinic queue management and live daily patient tracking
 */

/**
 * @swagger
 * /api/queue/today:
 *   get:
 *     summary: Get today's appointment queue
 *     description: Retrieves the live appointment queue for today sorted by urgency and time, including real-time summary statistics for dashboard cards.
 *     tags: [Queue]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2026-11-02"
 *         description: Optional date filter in YYYY-MM-DD format (defaults to today)
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Optional doctor ID filter (receptionists/admins can filter by doctor; doctors automatically see only their own)
 *     responses:
 *       200:
 *         description: Today's queue with summary statistics
 *       400:
 *         description: Invalid date or doctor ID format
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  "/today",
  authenticate,
  requireRole("receptionist", "doctor", "admin"),
  getTodayQueue
);

/**
 * @swagger
 * /api/queue/{appointmentId}/status:
 *   patch:
 *     summary: Update queue status
 *     description: Updates the clinical queue status (not_arrived -> waiting -> in_consultation -> done). When marked 'done', automatically updates appointment status to 'completed'.
 *     tags: [Queue]
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
 *               - queueStatus
 *             properties:
 *               queueStatus:
 *                 type: string
 *                 enum: [not_arrived, waiting, in_consultation, done]
 *                 example: "waiting"
 *     responses:
 *       200:
 *         description: Queue status updated successfully
 *       400:
 *         description: Validation error or cancelled appointment
 *       403:
 *         description: Forbidden - Not authorized
 *       404:
 *         description: Appointment not found
 */
router.patch(
  "/:appointmentId/status",
  authenticate,
  requireRole("receptionist", "doctor", "admin"),
  updateQueueStatus
);

export default router;
