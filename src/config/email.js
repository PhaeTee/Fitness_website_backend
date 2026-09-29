import "dotenv/config";
import { createTransport } from "nodemailer";

import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

export const messenger = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
