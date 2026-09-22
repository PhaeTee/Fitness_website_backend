import express from "express";
import { auth_middleware } from "../middlewares/authMiddleware.js";
import { createSubscription } from "../controllers/subscriptionController.js";

export const subscriptionRoutes = express.Router();

subscriptionRoutes.post("/", auth_middleware, createSubscription);
