import { prisma } from "../config/db.js";

export const verifyMembership = async (req, res) => {
  try {
    const { accessId } = req.params;

    const card = await prisma.membershipCard.findUnique({
      where: {
        accessId,
      },
      include: {
        user: true,
      },
    });

    if (!card) {
      return res.status(404).json({
        message: "Membership card not found",
      });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: card.userId,
        status: "ACTIVE",
        endDate: {
          gt: new Date(),
        },
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return res.status(200).json({
        message: "Membership is not active",
        data: {
          accessId: card.accessId,
          name: card.user.name,
          membershipStatus: "EXPIRED",
        },
      });
    }

    return res.status(200).json({
      message: "Membership verified successfully",
      data: {
        accessId: card.accessId,
        name: card.user.name,
        plan: subscription.plan.name,
        membershipStatus: "ACTIVE",
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to verify membership",
    });
  }
};