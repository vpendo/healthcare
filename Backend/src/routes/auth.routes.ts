import { Router } from "express";
import {
  register,
  login,
  logout,
  me,
  updateProfile,
  createStaffAccount,
  getUsers,
  updateStaffAccount,
  deleteStaffAccount,
  forgotPassword,
  verifyResetCode,
  resetPassword,
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
 *       401:
 *         description: Invalid credentials
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
 *       401:
 *         description: Missing or invalid token
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
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: User not found
 */
router.get("/me", authenticate, me);

/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     summary: Update the current user's profile
 *     description: Updates the authenticated user's name and email address. The user ID is obtained from the authentication token.
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use
 */
router.patch("/profile", authenticate, updateProfile);

/**
 * @swagger
 * /api/auth/staff:
 *   post:
 *     summary: Create a doctor or receptionist account
 *     description: Admin only. Creates a new staff account with the specified role.
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
 *               specialty:
 *                 type: string
 *                 description: Required for doctor accounts
 *                 example: general practice
 *     responses:
 *       201:
 *         description: Staff account created successfully
 *       400:
 *         description: Validation error or invalid role
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Email already in use
 */
router.post("/staff", authenticate, requireRole("admin"), createStaffAccount);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: List clinic accounts
 *     description: Admin-only list of patient, doctor, and receptionist accounts.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accounts returned successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get("/users", authenticate, requireRole("admin"), getUsers);

/**
 * @swagger
 * /api/auth/staff/{userId}:
 *   patch:
 *     summary: Update a doctor or receptionist account
 *     description: Admin-only update of staff details, optional password, and doctor specialty.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               specialty:
 *                 type: string
 *                 description: Required when updating a doctor account
 *     responses:
 *       200:
 *         description: Staff account updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Staff account not found
 *       409:
 *         description: Email already in use
 *   delete:
 *     summary: Delete a doctor or receptionist account
 *     description: Admin-only deletion of a staff account and its doctor profile, if applicable.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff account deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Staff account not found
 */
router.patch(
  "/staff/:userId",
  authenticate,
  requireRole("admin"),
  updateStaffAccount
);
router.delete(
  "/staff/:userId",
  authenticate,
  requireRole("admin"),
  deleteStaffAccount
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset code
 *     description: If the email belongs to an account, a 6-digit code is emailed. The response is the same whether or not the email exists.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *     responses:
 *       200:
 *         description: Generic acknowledgement
 *       400:
 *         description: Validation error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verify a 6-digit password reset code
 *     description: Checks whether a reset code is valid and unexpired without resetting the password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               code:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 example: "482193"
 *     responses:
 *       200:
 *         description: Reset code is valid
 *       400:
 *         description: Invalid or expired code
 */
router.post("/verify-reset-code", verifyResetCode);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with a 6-digit code
 *     description: Sets a new password when a valid, unexpired reset code is provided. The user must log in afterwards.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane@example.com
 *               code:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 example: "482193"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: newSecurePass123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error or invalid/expired code
 */
router.post("/reset-password", resetPassword);

export default router;
