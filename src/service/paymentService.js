import { prisma } from "../config/db.js";

export const finalizePayment = async (paymentId) => {
  return await prisma.$transaction(async (tx) => {
    // find the payment
    const payment = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
    });

    // find payment

    if (!payment) {
      throw new Error("Payment not found");
    }

    // If the payment was already processed, don't create another subscription
    if (payment.status === "SUCCESS") {
      return {
        payment,
        alreadyProcessed: true,
      };
    }

    if (payment.status !== "PENDING") {
      throw new Error("Payment cannot be finalized");
    }

   
    const claimedPayment = await tx.payment.updateMany({
      where: {
        id: payment.id,
        status: "PENDING",
      },
      data: {
        status: "SUCCESS",
      },
    });

   
    if (claimedPayment.count === 0) {
      return {
        payment,
        alreadyProcessed: true,
      };
    }

    
    const activeSubscription = await tx.subscription.findFirst({
      where: {
        userId: payment.userId,
        status: "ACTIVE",
        endDate: {
          gt: new Date(),
        },
      },
    });

    
    if (activeSubscription) {
      await tx.subscription.update({
        where: {
          id: activeSubscription.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    // Get the plan that was paid for
    const plan = await tx.plan.findUnique({
      where: {
        id: payment.planId,
      },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Calculate new subscription dates
    const startDate = new Date();

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    //  Create new subscription
    const subscription = await tx.subscription.create({
      data: {
        userId: payment.userId,
        planId: payment.planId,
        startDate,
        endDate,
        status: "ACTIVE",
      },
    });

    //  Return the result
    return {
      payment: {
        ...payment,
        status: "SUCCESS",
      },
      subscription,
      alreadyProcessed: false,
    };
  });
};