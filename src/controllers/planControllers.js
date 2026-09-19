import { prisma } from "../config/db.js";

export const createPlan = async (req, res) => {
  try {
    const { name, price, duration, benefits } = req.body;

    const plan = await prisma.plan.create({
      data: {
        name,
        price: parseInt(price),
        duration: parseInt(duration),
        benefits,
      },
    });

    return res.status(201).json({ message: "Plan created successfully" });
  } catch (error) {
    console.log("[plans/create] error:", error.message);
    return res.sendStatus(500);
  }
};
