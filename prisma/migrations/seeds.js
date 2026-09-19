import { prisma } from "../src/config/db.js";

const plans = [
  {
    id: 1,
    name: "Basic",
    price: 10000,
    benefits: [
      "Gym access",
      "Access to standard gym equipment",
      "Digital membership card",
      "Basic locker and changing facilities",
      "Access during standard gym hours",
    ],
  },

  {
    id: 2,
    name: "Standard",
    price: 20000,
    benefits: [
      "Everything in Basic",
      "Group fitness classes",
      "Trainer guidance",
      "Fitness assessment",
      "Extended access hours",
    ],
  },

  {
    id: 3,
    name: "Premium",
    price: 30000,
    benefits: [
      "Everything in Standard",
      "Personal training sessions",
      "Priority class booking",
      "Personalized workout plan",
      "Premium member support",
    ],
  },
];

async function main() {
  await prisma.plan.createMany({
    data: plans,
  });

  console.log("Plans created successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name }, // works because name is @unique
      update: plan,
      create: plan,
    });
  }
  console.log("Plans seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
