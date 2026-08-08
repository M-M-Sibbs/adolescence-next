import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@adolescence.app";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      },
    });

    await prisma.lesson.createMany({
      data: [
        {
          title: "Intro to Python",
          description: "Variables, loops, and functions.",
          content:
            "Python is a high-level language. Variables store data. Loops repeat work. Functions package reusable logic.",
          category: "Python Programming",
          difficulty: "beginner",
          estimatedDuration: 25,
          isPublished: true,
          createdBy: admin.id,
        },
        {
          title: "How Neural Nets Learn",
          description: "Forward pass, loss, and backpropagation.",
          content:
            "A neural network makes a prediction (forward pass), measures error (loss), then adjusts weights (backprop).",
          category: "AI Development",
          difficulty: "intermediate",
          estimatedDuration: 40,
          isPublished: true,
          createdBy: admin.id,
        },
      ],
    });
    console.log("Seeded admin + 2 lessons.");
  } else {
    console.log("Admin already exists, skipping seed.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
