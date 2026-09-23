import { prisma } from "../config/db.js";

export const checkout = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user_id;

    if (!planId) {
      return res.status(400).json({
        message: "Plan required",
      });
    }

    const plan = await prisma.plan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
        status: "ACTIVE",
        endDate: {
          gt: new Date(),
        },
      },
      include: {
        plan: true,
      },
    });

    if (activeSubscription) {
      if (planId === activeSubscription.planId) {
        return res.status(400).json({
          message: "User already has this plan",
        });
      }
      if (plan.rank > activeSubscription.plan.rank) {
        return res.status(200).json({ message: "UPGRADE" });
      } else {
        return res.status(200).json({ message: "DOWNGRADE" });
      }
    } else {
      const previousSubscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
        },
        orderBy: {
          endDate: "desc",
        },
      });

      if (!previousSubscription) {
        return res.status(200).json({
          message: "NEW",
        });
      }

      if (previousSubscription.planId === planId) {
        return res.status(200).json({
          message: "RENEWAL",
        });
      }
      return res.status(200).json({
        message: "NEW",
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Checkout failed",
    });
  }
};
