import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Admin credentials. Override at run time with env vars if you prefer not to
// keep them in the repo, e.g.:
//   ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=secret npm run db:seed
const ADMIN_NAME = process.env.ADMIN_NAME || "Wilson Madzoka";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "wilson@adolescence.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Upsert so re-running the seed updates the password instead of failing.
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, password: hashed, role: "admin" },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
    },
  });
  console.log(`Admin ready: ${admin.email}`);

  // Remove the old demo account if it is still around.
  const demo = await prisma.user.findUnique({
    where: { email: "admin@adolescence.app" },
  });
  if (demo && demo.email !== ADMIN_EMAIL) {
    await prisma.user.delete({ where: { id: demo.id } });
    console.log("Removed old demo admin account.");
  }

  // Sample lessons, only if the library is empty.
  const lessonCount = await prisma.lesson.count();
  if (lessonCount === 0) {
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
    console.log("Seeded 2 sample lessons.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
