import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { json, error, handleAuthError } from "@/lib/http";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const id = parseInt(params.id, 10);
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return error("Lesson not found", 404);
    const updated = await prisma.lesson.update({
      where: { id },
      data: { isPublished: !lesson.isPublished },
    });
    return json({ is_published: updated.isPublished });
  } catch (e) {
    return handleAuthError(e);
  }
}
