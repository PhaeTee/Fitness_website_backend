import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { generate_jwt } from "../middlewares/authMiddleware.js";
import { generateOtp, sendOtp, verifyOtp } from "../service/otpService.js";

export const register = async (req, res) => {
  try {
    console.log("1. Register started");

    // get values from user form
    const { name, email, password } = req.body;

    console.log("2. Request data received:", { name, email });

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email and password" });
    }

    // check if user already exist
    const exist_user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("3. User check completed");

    if (exist_user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // hash the password
    const hashed_password = await bcrypt.hash(password, 5);

    console.log("4. Password hashed");

    // generate OTP
    const otp = generateOtp();

    console.log("5. OTP generated");

    const expiresAt = new Date(Date.now() + 600000);

    // check verification table
    const unverified_user = await prisma.verification.findUnique({
      where: { email },
    });

    console.log("6. Verification check completed");

    if (unverified_user) {
      await prisma.verification.update({
        where: { email },
        data: {
          name,
          password: hashed_password,
          otp,
          otpExpiresAt: expiresAt,
        },
      });

      console.log("7. Existing verification updated");
    } else {
      await prisma.verification.create({
        data: {
          name,
          email,
          password: hashed_password,
          otp,
          otpExpiresAt: expiresAt,
        },
      });

      console.log("7. New verification created");
    }

    console.log("8. About to send OTP");

    // send OTP
    await sendOtp(email, otp);

    console.log("9. OTP sent successfully");

    return res.status(201).json({
      message: "Please verify your email.",
    });
  } catch (error) {
    console.error("[/register] FULL ERROR:", error);

    return res.sendStatus(500);
  }
};

// login endpoint
export const login = async (req, res) => {
  try {
    // get email and password
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide, email and password" });
    }

    // check if user exist
    const exist_user = await prisma.user.findUnique({
      where: { email },
    });
    if (!exist_user) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    const is_password_match = await bcrypt.compare(
      password,
      exist_user.password,
    );
    if (!is_password_match)
      return res.status(400).json({ message: "invalid password" });

    if (!exist_user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email",
      });
    }

    // console.log("exist_user_password: ", typeof exist_user.password);
    // compare password

    // return (jwt token)
    const token = await generate_jwt({ user_id: exist_user.id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({ message: "Login successful" });
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
      select: {
        name: true,
        email: true,

        subscriptions: {
          where: {
            status: "ACTIVE",
            endDate: {
              gt: new Date(),
            },
          },
          select: {
            status: true,
            endDate: true,

            plan: {
              select: {
                name: true,
              },
            },
          },
        },

        membershipCard: {
          select: {
            accessId: true,
          },
        },
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
    // const new_user = await prisma.user.update({
    await prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        password: hashed_password,
      },
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("[auth/change_password] error occured: ", error.message);
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

    // Find the pending veri
    const unverified_user = await prisma.verification.findUnique({
      where: { email },
    });

    if (!unverified_user) {
      return res.status(404).json({
        message: "verification request not found",
      });
    }

    // Check the OTP
    const code = verifyOtp(
      unverified_user.otp,
      otp,
      unverified_user.otpExpiresAt,
    );

    if (!code.success) {
      return res.status(400).json({
        message: code.message,
      });
    }

    // create
    await prisma.user.create({
      data: {
        name: unverified_user.name,
        email: unverified_user.email,
        password: unverified_user.password,
        isVerified: true,
      },
    });

    await prisma.verification.delete({
      where: { email },
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

export const resendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Find the pending verification
    const unverified_user = await prisma.verification.findUnique({
      where: { email },
    });

    if (!unverified_user) {
      return res.status(404).json({
        message: "Verification request not found",
      });
    }

    // Generate a new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 600000);

    // Update the OTP
    await prisma.verification.update({
      where: { email },
      data: {
        otp,
        otpExpiresAt: expiresAt,
      },
    });

    console.log("2. OTP saved");

    // Send the new OTP
    await sendOtp(email, otp);

    console.log("3. OTP email sent");

    return res.status(200).json({
      message: "A new verification code has been sent",
    });
  } catch (error) {
    console.log("[/resend-otp] error:", error.message);

    return res.status(500).json({
      message: "Failed to resend OTP",
    });
  }
};
