import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createAccessToken } from "@/lib/auth";
import { json, error } from "@/lib/http";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) return error("Invalid credentials", 401);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await verifyPassword(body.password, user.password))) {
    return error("Invalid credentials", 401);
  }

  const token = await createAccessToken(user.id);
  return json({
    access_token: token,
    token_type: "bearer",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
