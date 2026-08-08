import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const data = await req.json();
    const update: Record<string, unknown> = {};
    if (data.last_position !== undefined && data.last_position !== null)
      update.lastPosition = data.last_position;
    if (data.completed !== undefined && data.completed !== null)
      update.completed = data.completed;

    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: data.lesson_id } },
      create: {
        userId: user.id,
        lessonId: data.lesson_id,
        lastPosition: data.last_position ?? 0,
        completed: data.completed ?? false,
      },
      update,
    });
    return json({ updated: true });
  } catch (e) {
    return handleAuthError(e);
  }
}
