import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generate_jwt } from "../middlewares/authMiddleware.js";
import { generateOtp, sendOtp, verifyOtp } from "../service/otpService.js";
import cookie from "cookie-parser";

export const register = async (req, res) => {
  try {
    // get values from user form
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide name, email and password" });
    }

    // check if user already exist
    const exist_user = await prisma.user.findUnique({ where: { email } });
    if (exist_user)
      return res.status(400).json({ message: "user already exist" });

    // hash the password
    const hashed_password = await bcrypt.hash(password, 5);

    // send otp
    const otp = generateOtp();

    const expiresAt = new Date(Date.now() + 600000);

    // save to db

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashed_password,
        otp,
        otpExpiresAt: expiresAt,
      },
    });

    // send otp
    await sendOtp(email, otp);

    return res.status(201).json({
      message: "Please verify your email.",
    });
  } catch (error) {
    console.log("[/register] error: ", error.message);
    return res.sendStatus(500);
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check the OTP
    const result = verifyOtp(user.otp, otp, user.otpExpiresAt);

    if (!result.success) {
      return res.status(400).json({
        message: result.message,
      });
    }

    // Mark the user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log("[/verify-otp] error:", error.message);

    return res.status(500).json({
      message: "Failed to verify OTP",
    });
  }
};

// login endpoint
export const login = async (req, res) => {
  try {
    console.log("username:", req.user_name);
    // get email and password
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide, email and password" });
    }

    // check if user exist
    const exist_user = await prisma.user.findUnique({ where: { email } });
    if (!exist_user)
      return res.status(400).json({ message: "invalid credentials 1" });

    console.log("exist_user_password: ", typeof exist_user.password);
    // compare password
    const is_password_match = await bcrypt.compare(
      password,
      exist_user.password,
    );
    if (!is_password_match)
      return res.status(400).json({ message: "invalid credentials 2" });

    // return (jwt token)
    const token = await generate_jwt({ user_id: exist_user.id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.log("[/login] error: ", error.message);
    return res.sendStatus(500);
  }
};

// auth user profile
export const me = async (req, res) => {
  try {
    const user_id = req.user_id;
    console.log("user_id: ", user_id);
    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
    if (!user) return res.sendStatus(404);

    return res
      .status(200)
      .json({ message: "user retrieved successfully", data: user });
  } catch (error) {
    console.log("[auth/me] error occured: ", error.message);
    return res.sendStatus(500);
  }
};

// change password
export const change_password = async (req, res) => {
  try {
    const user_id = req.user_id;
    if (!user_id) return res.sendStatus(401);

    // const user = await prisma.user.findUnique({ where: { id: user_id } });
    // if (!user) return res.sendStatus(404);

    const new_password = req.body.password;
    if (!new_password)
      return res.status(400).json({ message: "password field is required" });

    const hashed_password = await bcrypt.hash(new_password, 5);

    // modify the user password
    const new_user = await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        password: hashed_password,
      },
    });

    return res.sendStatus(200);
  } catch (error) {
    console.log("[auth/change_password] error occured: ", error.message);
    return res.sendStatus(500);
  }
};
