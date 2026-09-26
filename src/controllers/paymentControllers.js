import { prisma } from "../config/db.js";
import crypto from "crypto";
import axios from "axios";
import { finalizePayment } from "../service/paymentService.js";

export const checkout = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user_id;
    let action;
    const reference = crypto.randomUUID();

    // check that plan was provided

    if (!planId) {
      return res.status(400).json({
        message: "Plan required",
      });
    }

    // find the plan

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

    // find the user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // check if the user has an active subscription

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

    // check what kind pf purchase this is
    if (activeSubscription) {
      if (planId === activeSubscription.planId) {
        return res.status(400).json({
          message: "User already has this plan",
        });
      }

      //   if higher upgrade, if lower, downgrade

      if (plan.rank > activeSubscription.plan.rank) {
        action = "UPGRADE";
      } else {
        action = "DOWNGRADE";
      }
    } else {
      const previousSubscription = await prisma.subscription.findUnique({
        where: {
          userId: userId,
        },
        orderBy: {
          endDate: "desc",
        },
      });

      if (!previousSubscription) {
        action = "NEW";
      } else if (previousSubscription.planId === planId) {
        action = "RENEWAL";
      } else {
        action = "NEW";
      }
    }

    // create payment record

    const payment = await prisma.payment.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        action,
        status: "PENDING",
        reference,
      },
    });

    // send to fw in return fw will give the user a link

    const flutterwaveResponse = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: reference,
        amount: plan.price,
        currency: "NGN",
        redirect_url: process.env.FLW_REDIRECT_URL,
        customer: {
          email: user.email,
          name: user.name,
        },
        customizations: {
          title: "fitness website",
          description: `${plan.name} Membership`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // return flutterwave chceckout link

    return res.status(201).json({
      message: "Checkout created successfully",
      data: {
        paymentId: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        action: payment.action,
        status: payment.status,
        paymentLink: flutterwaveResponse.data.data.link,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Checkout failed",
    });
  }
};

// verification controller
export const verifyPayment = async (req, res) => {
  try {
    const { reference, transactionId } = req.body;
    const userId = req.user_id;

    // check information are available

    if (!reference || !transactionId) {
      return res.status(400).json({
        message: "Payment reference and transaction id are required",
      });
    }

    // find payment

    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    //  check if payment belongs to the logged-in user

    if (payment.userId !== userId) {
      return res.status(403).json({
        message: "You are not allowed to verify this payment",
      });
    }

    //  check if payment was already processed

    if (payment.status === "SUCCESS") {
      return res.status(200).json({
        message: "Payment already verified",
        data: payment,
      });
    }

    // only pending payments can be verified

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        message: "Payment cannot be verified",
      });
    }

    // ask fw for txn status

    const verificationResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // update our db

    const transaction = verificationResponse.data.data;

    // check if its successful

    if (transaction.status !== "successful") {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "FAILED",
        },
      });

      return res.status(400).json({
        message: "Payment was not successful",
      });
    }

    // ensure fw ref matches our ref

    if (transaction.tx_ref !== payment.reference) {
      return res.status(400).json({
        message: "Payment reference mismatch",
      });
    }

    // check amt matches

    if (Number(transaction.amount) !== payment.amount) {
      return res.status(400).json({
        message: "Incorrect Payment amount",
      });
    }

    // ccheck currency

    if (transaction.currency !== "NGN") {
      return res.status(400).json({
        message: "Incorrect payment currency",
      });
    }

    const result = await finalizePayment(payment.id);

    return res.status(200).json({
      message: "Payment verified and subscription activated",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Payment verification failed ",
    });
  }
};

// webhook controller
export const paymentWebhook = async (req, res) => {
  try {
    // Get fw signature
    const signature = req.headers["flutterwave-signature"];

    // Make sure a signature was provided
    if (!signature) {
      return res.status(401).json({
        message: "Missing webhook signature",
      });
    }

    //  Verify that the webhook came from Flutterwave
    const expectedSignature = crypto
      .createHmac("sha256", process.env.FLW_SECRET_HASH)
      .update(req.rawBody)
      .digest("base64");

    if (signature !== expectedSignature) {
      return res.status(401).json({
        message: "Invalid webhook signature",
      });
    }

    //  Get the webhook information
    const { event, data } = req.body;

    console.log("Flutterwave webhook:", event);

    if (event !== "charge.completed") {
      return res.sendStatus(200);
    }

    //  Make sure the webhook contains a transaction ID
    if (!data?.id) {
      return res.status(400).json({
        message: "Transaction ID missing",
      });
    }

    //  Find our payment using Flutterwave's transaction reference
    const payment = await prisma.payment.findUnique({
      where: {
        reference: data.tx_ref,
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Ignore duplicate webhook notifications
    if (payment.status === "SUCCESS") {
      return res.sendStatus(200);
    }

    //  Verify the transaction directly with Flutterwave
    const verificationResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${data.id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const transaction = verificationResponse.data.data;

    if (transaction.status !== "successful") {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "FAILED",
        },
      });

      return res.sendStatus(200);
    }

    if (transaction.tx_ref !== payment.reference) {
      return res.status(400).json({
        message: "Payment reference mismatch",
      });
    }

    if (Number(transaction.amount) !== payment.amount) {
      return res.status(400).json({
        message: "Payment amount mismatch",
      });
    }

    if (transaction.currency !== "NGN") {
      return res.status(400).json({
        message: "Payment currency mismatch",
      });
    }

    await finalizePayment(payment.id);

    return res.sendStatus(200);
  } catch (error) {
    console.error(error.response?.data || error);

    return res.status(500).json({
      message: "Webhook processing failed",
    });
  }
};
