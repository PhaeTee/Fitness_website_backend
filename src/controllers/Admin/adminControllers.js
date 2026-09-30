import { prisma } from "../../config/db.js";

export const getMembers = async (req, res) => {
  try {
    const { status } = req.query;

    let where = {};

    switch (status) {
      case "active":
        where = {
          subscriptions: {
            some: {
              status: "ACTIVE",
              endDate: {
                gt: new Date(),
              },
            },
          },
        };
        break;

      case "expired":
        where = {
          subscriptions: {
            some: {
              endDate: {
                lte: new Date(),
              },
            },
          },
          NOT: {
            subscriptions: {
              some: {
                status: "ACTIVE",
                endDate: {
                  gt: new Date(),
                },
              },
            },
          },
        };
        break;

      case "no-membership":
        where = {
          subscriptions: {
            none: {},
          },
        };
        break;

      default:
        where = {};
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        membershipCard: {
          select: {
            cardNumber: true,
          },
        },
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
    });

    return res.status(200).json({
      message: "Members retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to retrieve members",
    });
  }
};

// export const getMember = async (req, res) => {
//   try {
//     const { cardNumber } = req.params;

//     const card = await prisma.membershipCard.findUnique({
//       where: {
//         cardNumber,
//       },
//       include: {
//         user: {
//           include: {
//             subscriptions: {
//               orderBy: {
//                 startDate: "desc",
//               },
//               take: 1,
//               include: {
//                 plan: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!card) {
//       return res.status(404).json({
//         message: "Member not found",
//       });
//     }

//     return res.status(200).json({
//       message: "Member retrieved successfully",
//       data: card,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(500).json({
//       message: "Failed to retrieve member",
//     });
//   }
// };

export const getDashboard = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();

    const activeMembers = await prisma.user.count({
      where: {
        subscriptions: {
          some: {
            status: "ACTIVE",
            endDate: {
              gt: new Date(),
            },
          },
        },
      },
    });

    const expiredMembers = await prisma.user.count({
      where: {
        subscriptions: {
          some: {
            endDate: {
              lte: new Date(),
            },
          },
        },
        NOT: {
          subscriptions: {
            some: {
              status: "ACTIVE",
              endDate: {
                gt: new Date(),
              },
            },
          },
        },
      },
    });

    const usersWithoutMembership = await prisma.user.count({
      where: {
        subscriptions: {
          none: {},
        },
      },
    });

    return res.status(200).json({
      message: "Dashboard retrieved successfully",
      data: {
        totalUsers,
        activeMembers,
        expiredMembers,
        usersWithoutMembership,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to retrieve dashboard",
    });
  }
};



export const verifyMembership = async (req, res) => {
  try {
    const { cardNumber } = req.body;

    if (!cardNumber) {
      return res.status(400).json({
        message: "Card number is required",
      });
    }

    const card = await prisma.membershipCard.findUnique({
      where: {
        cardNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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
        message: "Invalid membership card",
      });
    }

    const subscription = card.user.subscriptions[0];

    if (
      !subscription ||
      subscription.status !== "ACTIVE" ||
      subscription.endDate <= new Date()
    ) {
      return res.status(200).json({
        message: "Membership is not active",
        data: {
          cardNumber: card.cardNumber,
          name: card.user.name,
          membershipStatus: "EXPIRED",
        },
      });
    }

    return res.status(200).json({
      message: "Membership verified successfully",
      data: {
        cardNumber: card.cardNumber,
        name: card.user.name,
        email: card.user.email,
        plan: subscription.plan.name,
        membershipStatus: "ACTIVE",
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch (error) {
    console.log("[admin/verify-membership] error:", error);

    return res.status(500).json({
      message: "Failed to verify membership",
    });
  }
};