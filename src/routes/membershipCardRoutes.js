import express from "express";
import { getMyMembershipCard } from "../controllers/membershipCardControllers.js";
import { auth_middleware } from "../middlewares/authMiddleware.js";

export const membershipCardRoutes = express.Router();


/**
 * @swagger
 * /membership-card:
 *   get:
 *     summary: Get the user's membership card
 *     tags:
 *       - Membership Card
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Membership card retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Membership card retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     cardNumber:
 *                       type: string
 *                       example: GYM-A1B2C3D4
 *                     name:
 *                       type: string
 *                       example: Faith
 *                     plan:
 *                       type: string
 *                       example: Basic
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-25T01:39:57.066Z
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-10-25T01:39:57.066Z
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Membership card not found
 *       500:
 *         description: Failed to retrieve membership card
 */


membershipCardRoutes.get("/", auth_middleware, getMyMembershipCard);
