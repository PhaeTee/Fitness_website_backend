import { prisma } from "../config/db.js";


export const getPlans = async (req, res) => {
  try {
    const plans = await prisma.plan.findMany();

    res
      .status(200)
      .json({ message: "Plans retrieved successfully", data: plans });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Failed to fetch plans",   error: error.message });
  }
};

// export const createPlan = async (req, res) => {
//   try {
//     const { name, price, duration, benefits } = req.body;

//     const plan = await prisma.plan.create({
//       data: {
//         name,
//         price: parseInt(price),
//         duration: parseInt(duration),
//         benefits,
//       },
//     });

//     return res.status(201).json({ message: "Plan created successfully" });
//   } catch (error) {
//     console.log("[plans/create] error:", error.message);
//     return res.sendStatus(500);
//   }
// };
