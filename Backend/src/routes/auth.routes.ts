import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  createStaffAccount,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new patient account
 *     description: Creates a new patient account. Doctor and receptionist accounts are provisioned separately by an admin.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: securePass123
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: An account with this email already exists.
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     description: "Validates credentials and returns a signed JWT. Include this token as `Authorization: Bearer <token>` on protected routes."
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: securePass123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: Invalid email or password.
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     description: "Signals logout intent. Since JWTs are stateless, the client must discard the token. A denylist can be added server-side if needed."
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               message: Logged out successfully.
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the current authenticated user's profile
 *     description: Returns the public profile of the user identified by the Bearer token.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
router.get("/me", authenticate, me);

/**
 * @swagger
 * /api/auth/staff:
 *   post:
 *     summary: Create a doctor or receptionist account
 *     description: Admin only. Creates a new staff account with the specified role (doctor or receptionist).
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Alice Smith
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alice@famcare.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: securePass123
 *               role:
 *                 type: string
 *                 enum: [doctor, receptionist]
 *                 example: doctor
 *     responses:
 *       201:
 *         description: Staff account created successfully
 *       400:
 *         description: Validation error or invalid role
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Email already in use
 */
router.post("/staff", authenticate, requireRole("admin"), createStaffAccount);

export default router;
