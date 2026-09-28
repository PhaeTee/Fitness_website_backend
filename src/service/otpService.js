import { messenger } from "../config/email.js";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = async (email, otp) => {
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