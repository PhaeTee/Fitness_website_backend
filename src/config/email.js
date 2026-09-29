console.log("🔥🔥🔥 EMAIL.JS FILE LOADED 🔥🔥🔥");

import "dotenv/config";
import { createTransport } from "nodemailer";

console.log("===== SMTP CONFIG =====");
console.log("SMTP HOST:", process.env.SMTP_HOST);
console.log("SMTP PORT:", process.env.SMTP_PORT);
console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);
console.log("=======================");

export const messenger = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
