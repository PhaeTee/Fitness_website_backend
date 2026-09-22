import express from "express";
import { userRoute } from "./routes/userRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { logger } from "./middlewares/logger.js";
import { auth_middleware } from "./middlewares/authMiddleware.js";
import { planRoutes } from "./routes/planRoutes.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
// app.use(auth_middleware);
app.use("/users", userRoute);
app.use("/auth", authRoutes);

app.use("/plans", planRoutes);
