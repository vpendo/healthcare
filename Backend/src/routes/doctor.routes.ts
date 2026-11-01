import { Router } from "express";
import {
  createDoctorProfile,
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
} from "../controllers/doctor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor profiles and medical specialties
 */

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: List all doctors
 *     description: Retrieve all doctor profiles with doctor details. Can be filtered by specialty.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Optional specialty filter (e.g. general practitioner, pediatrics)
 *     responses:
 *       200:
 *         description: List of doctors
 *       401:
 *         description: Not authenticated
 */
router.get("/", authenticate, getDoctors);

/**
 * @swagger
 * /api/doctors/{doctorId}:
 *   get:
 *     summary: Get doctor profile by doctor ID
 *     description: Retrieve a single doctor's profile and user details.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor's user ID
 *     responses:
 *       200:
 *         description: Doctor profile details
 *       404:
 *         description: Doctor profile not found
 *       401:
 *         description: Not authenticated
 */
router.get("/:doctorId", authenticate, getDoctorById);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Create a doctor profile
 *     description: Allows doctors to create their own profile, or receptionists to create a profile for a doctor account.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specialty
 *             properties:
 *               userId:
 *                 type: string
 *                 description: Target doctor's user ID (required when created by receptionist)
 *                 example: 665f1a2b3c4d5e6f7a8b9c0d
 *               specialty:
 *                 type: string
 *                 example: general practitioner
 *     responses:
 *       201:
 *         description: Doctor profile created successfully
 *       400:
 *         description: Validation error or invalid user role
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Profile already exists
 */
router.post(
  "/",
  authenticate,
  requireRole("doctor", "receptionist"),
  createDoctorProfile
);

/**
 * @swagger
 * /api/doctors/{doctorId}:
 *   patch:
 *     summary: Update doctor specialty
 *     description: Allows doctors to update their own specialty, or receptionists to update any doctor's profile.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
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
 *               - specialty
 *             properties:
 *               specialty:
 *                 type: string
 *                 example: pediatrics
 *     responses:
 *       200:
 *         description: Doctor profile updated successfully
 *       403:
 *         description: Forbidden - Cannot edit other doctors' profiles
 *       404:
 *         description: Doctor profile not found
 */
router.patch(
  "/:doctorId",
  authenticate,
  requireRole("doctor", "receptionist"),
  updateDoctorProfile
);

export default router;
