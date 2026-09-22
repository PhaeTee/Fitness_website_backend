import express from "express";
import { getPlans } from "../controllers/planControllers.js";

export const planRoutes = express.Router();

planRoutes.get("/", getPlans);
