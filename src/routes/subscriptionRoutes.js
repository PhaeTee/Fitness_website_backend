import express from "express";
import { auth_middleware } from "../middlewares/authMiddleware.js";
import {
  // createSubscription,
  getMySubscription,
} from "../controllers/subscriptionController.js";

export const subscriptionRoutes = express.Router();

// subscriptionRoutes.post("/", auth_middleware, createSubscription);

/**
 * @swagger
 * /subscriptions/me:
 *   get:
 *     summary: Get the authenticated user's active subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active subscription retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Active subscription retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     planId:
 *                       type: string
 *                       format: uuid
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-09-25T01:39:57.066Z
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-10-25T01:39:57.066Z
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *                     plan:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                           example: Basic
 *                         price:
 *                           type: integer
 *                           example: 10000
 *                         duration:
 *                           type: integer
 *                           example: 30
 *                         benefits:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example:
 *                             - Gym access
 *                             - Access to standard gym equipment
 *                             - Digital membership card
 *                         rank:
 *                           type: integer
 *                           example: 1
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: No active subscription found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No active subscription found
 *       500:
 *         description: Failed to retrieve subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve subscription
 */

subscriptionRoutes.get("/me", auth_middleware, getMySubscription);
