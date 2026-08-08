import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { json, error, handleAuthError } from "@/lib/http";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const id = parseInt(params.id, 10);
    const quiz = await prisma.quiz.findUnique({ where: { id } });
    if (!quiz) return error("Quiz not found", 404);
    await prisma.quiz.delete({ where: { id } });
    return json({ message: "Deleted" });
  } catch (e) {
    return handleAuthError(e);
  }
}
