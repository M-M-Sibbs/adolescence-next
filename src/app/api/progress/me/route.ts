import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const list = await prisma.progress.findMany({ where: { userId: user.id } });
    const completed = list.filter((p) => p.completed).length;
    const avg = list.length ? list.reduce((s, p) => s + (p.score || 0), 0) / list.length : 0;
    const aiSessions = await prisma.aIChat.count({ where: { userId: user.id } });

    return json({
      lessons_completed: completed,
      lessons_in_progress: list.length - completed,
      average_score: Math.round(avg * 10) / 10,
      ai_sessions: aiSessions,
      details: list.map((p) => ({
        lesson_id: p.lessonId,
        completed: p.completed,
        score: p.score,
        last_position: p.lastPosition,
        quiz_attempts: p.quizAttempts,
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
