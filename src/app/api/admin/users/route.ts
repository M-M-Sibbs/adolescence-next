import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return json(
      users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        is_active: u.isActive,
        created_at: u.createdAt ? u.createdAt.toISOString() : null,
      }))
    );
  } catch (e) {
    return handleAuthError(e);
  }
}
