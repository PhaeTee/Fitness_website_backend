import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import cors from "cors";
import { userRoute } from "./routes/userRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { logger } from "./middlewares/logger.js";
import { auth_middleware } from "./middlewares/authMiddleware.js";
import { planRoutes } from "./routes/planRoutes.js";
import { subscriptionRoutes } from "./routes/subscriptionRoutes.js";
import { paymentRoutes } from "./routes/paymentRoutes.js";
import { membershipCardRoutes } from "./routes/membershipCardRoutes.js";
import { adminRoutes } from "./routes/adminRoutes.js";



export const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "https://fit-zone-xi.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,

//     // remember to add "credentials: "include" to your frontend's fetch for cookies"
//   }),
// );

// app.use(express.json());

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(logger);
// app.use(auth_middleware);
app.use("/users", userRoute);
app.use("/auth", authRoutes);

app.use("/plans", planRoutes);
app.use("/subscriptions", subscriptionRoutes);

app.use("/payments", paymentRoutes);
app.use("/membership-card", membershipCardRoutes);
app.use("/admin", adminRoutes);
