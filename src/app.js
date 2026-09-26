import express from "express";
import { userRoute } from "./routes/userRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { logger } from "./middlewares/logger.js";
import { auth_middleware } from "./middlewares/authMiddleware.js";
import { planRoutes } from "./routes/planRoutes.js";
import { subscriptionRoutes } from "./routes/subscriptionRoutes.js";
import { paymentRoutes } from "./routes/paymentRoutes.js";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,

    // remember to add "credentials: "include" to your frontend's fetch for cookies"
  }),
);

// app.use(express.json());

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.use(logger);
// app.use(auth_middleware);
app.use("/users", userRoute);
app.use("/auth", authRoutes);

app.use("/plans", planRoutes);
app.use("/subscriptions", subscriptionRoutes);
