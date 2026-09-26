import express from "express";
import { getPlans } from "../controllers/planControllers.js";

export const planRoutes = express.Router();

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Get all membership plans
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Plans retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                         example: Basic
 *                       price:
 *                         type: integer
 *                         example: 10000
 *                       duration:
 *                         type: integer
 *                         example: 30
 *                       benefits:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example:
 *                           - Gym access
 *                           - Access to standard gym equipment
 *                           - Digital membership card
 *                       rank:
 *                         type: integer
 *                         example: 1
 *       500:
 *         description: Failed to fetch plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch plans
 *                 error:
 *                   type: string
 *                   example: Database connection failed
 */

planRoutes.get("/", getPlans);
