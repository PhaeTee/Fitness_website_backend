import "dotenv/config";
import { createTransport } from "nodemailer";

console.log(process.env["EMAIL_USER"]);

export const messenger = createTransport({
  host: process.env["SMTP_HOST"],
  port: Number(process.env["SMTP_PORT"]),
  secure: false,
  auth: {
    user: process.env["EMAIL_USER"],
    pass: process.env["EMAIL_PASS"],
  },
});
