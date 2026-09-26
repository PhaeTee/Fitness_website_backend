import express from "express";

import {
  checkout,
  verifyPayment,
  paymentWebhook,
} from "../controllers/paymentControllers.js";

import { auth_middleware } from "../middlewares/authMiddleware.js";

export const paymentRoutes = express.Router();

/**
 * @swagger
 * /payments/checkout:
 *   post:
 *     summary: Create a payment checkout
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 format: uuid
 *                 example: 69596089-3af4-45bc-ac15-bd7be293b791
 *     responses:
 *       201:
 *         description: Checkout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Checkout created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       format: uuid
 *                     reference:
 *                       type: string
 *                       format: uuid
 *                     amount:
 *                       type: integer
 *                       example: 10000
 *                     action:
 *                       type: string
 *                       enum:
 *                         - NEW
 *                         - RENEWAL
 *                         - UPGRADE
 *                         - DOWNGRADE
 *                       example: NEW
 *                     status:
 *                       type: string
 *                       example: PENDING
 *                     paymentLink:
 *                       type: string
 *                       format: uri
 *                       example: https://checkout.flutterwave.com/example
 *       400:
 *         description: Plan is required or user already has the selected plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingPlan:
 *                       value: Plan required
 *                     existingPlan:
 *                       value: User already has this plan
 *       401:
 *         description: Authentication token is missing or invalid
 *       404:
 *         description: Plan or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     planNotFound:
 *                       value: Plan not found
 *                     userNotFound:
 *                       value: User not found
 *       500:
 *         description: Checkout failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Checkout failed
 */

paymentRoutes.post("/checkout", auth_middleware, checkout);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify a payment and activate the subscription
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference
 *               - transactionId
 *             properties:
 *               reference:
 *                 type: string
 *                 format: uuid
 *                 example: 63acb383-c7d9-4133-b9a1-04e45c4f9f22
 *               transactionId:
 *                 type: string
 *                 example: "10512348"
 *     responses:
 *       200:
 *         description: Payment verified and subscription activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment verified and subscription activated
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         userId:
 *                           type: string
 *                           format: uuid
 *                         planId:
 *                           type: string
 *                           format: uuid
 *                         amount:
 *                           type: integer
 *                           example: 10000
 *                         action:
 *                           type: string
 *                           example: NEW
 *                         status:
 *                           type: string
 *                           example: SUCCESS
 *                         reference:
 *                           type: string
 *                           format: uuid
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         userId:
 *                           type: string
 *                           format: uuid
 *                         planId:
 *                           type: string
 *                           format: uuid
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         status:
 *                           type: string
 *                           example: ACTIVE
 *                     alreadyProcessed:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid or unsuccessful payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingInformation:
 *                       value: Payment reference and transaction id are required
 *                     cannotVerify:
 *                       value: Payment cannot be verified
 *                     unsuccessful:
 *                       value: Payment was not successful
 *                     referenceMismatch:
 *                       value: Payment reference mismatch
 *                     amountMismatch:
 *                       value: Incorrect Payment amount
 *                     currencyMismatch:
 *                       value: Incorrect payment currency
 *       401:
 *         description: Authentication token is missing or invalid
 *       403:
 *         description: User is not allowed to verify this payment
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Payment verification failed
 */

paymentRoutes.post("/verify", auth_middleware, verifyPayment);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Handle Flutterwave payment webhook
 *     tags: [Payments]
 *     description: Receives payment notifications from Flutterwave, verifies the transaction, and activates the related subscription when payment is successful.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: charge.completed
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 10512348
 *                   tx_ref:
 *                     type: string
 *                     example: 63acb383-c7d9-4133-b9a1-04e45c4f9f22
 *     responses:
 *       200:
 *         description: Webhook received and processed successfully
 *       400:
 *         description: Invalid webhook data or payment information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingTransactionId:
 *                       value: Transaction ID missing
 *                     referenceMismatch:
 *                       value: Payment reference mismatch
 *                     amountMismatch:
 *                       value: Payment amount mismatch
 *                     currencyMismatch:
 *                       value: Payment currency mismatch
 *       401:
 *         description: Missing or invalid webhook signature
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     missingSignature:
 *                       value: Missing webhook signature
 *                     invalidSignature:
 *                       value: Invalid webhook signature
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Webhook processing failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Webhook processing failed
 */

paymentRoutes.post("/webhook", paymentWebhook);
