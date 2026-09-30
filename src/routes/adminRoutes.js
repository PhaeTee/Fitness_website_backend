import express from "express";
import { auth_middleware } from "../middlewares/authMiddleware.js";
import { admin_middleware } from "../middlewares/adminMiddleware.js";
import {
  getMembers,
  getDashboard,
  verifyMembership,
} from "../controllers/Admin/adminControllers.js";
export const adminRoutes = express.Router();

adminRoutes.use(auth_middleware);
adminRoutes.use(admin_middleware);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 4
 *                     activeMembers:
 *                       type: integer
 *                       example: 1
 *                     expiredMembers:
 *                       type: integer
 *                       example: 0
 *                     usersWithoutMembership:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to retrieve dashboard
 */

adminRoutes.get("/dashboard", getDashboard);

/**
 * @swagger
 * /admin/members:
 *   get:
 *     summary: Get all members
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to retrieve members
 */

adminRoutes.get("/members", getMembers);

// adminRoutes.get("/members/:accessId", getMember);

/**
 * @swagger
 * /admin/verify-membership:
 *   post:
 *     summary: Retrieve membership details using a gym card number
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accessId
 *             properties:
 *               accessId:
 *                 type: string
 *                 example: GYM-A1B2C3D4
 *     responses:
 *       200:
 *         description: Membership details retrieved successfully
 *       400:
 *         description: Card number is required
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Membership card not found
 *       500:
 *         description: Failed to retrieve membership details
 */

adminRoutes.post("/verify-membership", verifyMembership);
