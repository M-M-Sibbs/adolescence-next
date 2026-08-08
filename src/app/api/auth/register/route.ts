import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createAccessToken } from "@/lib/auth";
import { json, error } from "@/lib/http";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.name) {
    return error("name, email and password are required", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return error("Email already registered", 400);

  // Only allow admin role if no admins exist yet (first user)
  let role: "admin" | "student" = "student";
  if (body.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount === 0) role = "admin";
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: await hashPassword(body.password),
      role,
    },
  });

  const token = await createAccessToken(user.id);
  return json({
    access_token: token,
    token_type: "bearer",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
