import { messenger } from "../config/email.js";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (email, otp) => {
  console.log("===== BEFORE SEND MAIL =====");
  console.log("SMTP HOST:", process.env.SMTP_HOST);
  console.log("SMTP PORT:", process.env.SMTP_PORT);
  console.log("EMAIL USER:", process.env.EMAIL_USER);
  console.log("EMAIL PASS EXISTS:", !!process.env.EMAIL_PASS);
  console.log("============================");

  await messenger.sendMail({
    to: email,
    subject: "Verification Code",
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  });
};


export const verifyOtp = (storedOtp, providedOtp, expiresAt) => {
  if (!storedOtp || !expiresAt) {
    return {
      success: false,
      message: "No active OTP found",
    };
  }

  if (storedOtp !== providedOtp) {
    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  if (new Date() > expiresAt) {
    return {
      success: false,
      message: "OTP has expired",
    };
  }

  return {
    success: true,
  };
};