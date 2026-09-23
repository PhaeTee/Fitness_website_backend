import { prisma } from "../config/db.js";

// Create Subscription

export const createSubscription = async (req, res) => {
  try {
    const { planId, paymentConfirmed } = req.body;

    const userId = req.user_id;

    if (!paymentConfirmed) {
      return res.status(400).json({
        message: "Payment has not been confirmed",
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

    const startDate = new Date();

    const endDate = new Date(startDate);

    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        startDate,
        endDate,
        status: "Active",
      },
    });

    res.status(201).json({
      message: "Successfully subscribed",
      data: subscription,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Subscription failed",
      error: error.message,
    });
  }
};

// Get a user's subscription data

export const getMySubscription = async (req, res) => {
  try {
    const userId = req.user_id;

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!subscription) {
      return res.status(404).json({
        message: "No subscription found",
      });
    }

    return res.status(200).json({
      message: "Subscription retrieved successfully",
      data: subscription,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to retrieve subscription",
    });
  }
};
