import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const [totalStudents, totalLessons, totalCompletions, totalAiChats, avgAgg] =
      await Promise.all([
        prisma.user.count({ where: { role: "student" } }),
        prisma.lesson.count(),
        prisma.progress.count({ where: { completed: true } }),
        prisma.aIChat.count(),
        prisma.progress.aggregate({ _avg: { score: true } }),
      ]);

    const recentChats = await prisma.aIChat.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const grouped = await prisma.aIChat.groupBy({
      by: ["lessonId"],
      where: { lessonId: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const topLessons = [];
    for (const row of grouped) {
      if (row.lessonId == null) continue;
      const lesson = await prisma.lesson.findUnique({ where: { id: row.lessonId } });
      if (lesson) topLessons.push({ title: lesson.title, chats: row._count.id });
    }

    return json({
      total_students: totalStudents,
      total_lessons: totalLessons,
      total_completions: totalCompletions,
      total_ai_chats: totalAiChats,
      avg_quiz_score: Math.round((avgAgg._avg.score || 0) * 10) / 10,
      top_lessons: topLessons,
      recent_activity: recentChats.map((c) => ({
        user_id: c.userId,
        lesson_id: c.lessonId,
        created_at: c.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
