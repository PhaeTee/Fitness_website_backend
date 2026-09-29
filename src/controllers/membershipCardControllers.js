import { prisma } from "../config/db.js";

export const getMyMembershipCard = async (req, res) => {
  try {
    const userId = req.user_id;

    // find users card

    const card = await prisma.membershipCard.findUnique({
      where: {
        userId,
      },
    });

    if (!card) {
      return res.status(404).json({
        message: "Membership card not found",
      });
    }

    // get current sub

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
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
        message: "Membership card retrieved successfully",
        data: {
          accessId: card.accessId,
          membershipStatus: "EXPIRED",
        },
      });
    }

    return res.status(200).json({
      message: "Membership card retrieved successfully",
      data: {
        accessId: card.accessId,
        name: req.user_name,
        plan: subscription.plan.name,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch {}
};

export const getMember = async (req, res) => {
  try {
    const { accessId } = req.params;

    const card = await prisma.membershipCard.findUnique({
      where: {
       accessId,
      },
      include: {
        user: {
          include: {
            subscriptions: {
              orderBy: {
                startDate: "desc",
              },
              take: 1,
              include: {
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    return res.status(200).json({
      message: "Member retrieved successfully",
      data: card,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to retrieve member",
    });
  }
};
