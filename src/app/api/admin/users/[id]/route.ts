import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { json, error, handleAuthError } from "@/lib/http";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    const id = parseInt(params.id, 10);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return error("User not found", 404);
    if (user.id === admin.id) return error("Cannot delete yourself", 400);
    await prisma.user.delete({ where: { id } });
    return json({ message: "User deleted" });
  } catch (e) {
    return handleAuthError(e);
  }
}
