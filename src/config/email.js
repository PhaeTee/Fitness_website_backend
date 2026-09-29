import "dotenv/config";
// import { createTransport } from "nodemailer";

import nodemailer from "nodemailer";

import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

export const messenger = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
