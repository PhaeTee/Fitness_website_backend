import { prisma } from "../config/db.js";

export const admin_middleware = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user_id,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to verify admin access",
    });
  }
};