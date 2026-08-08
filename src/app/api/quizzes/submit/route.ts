import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const data = await req.json();
    const answers: Array<{ quiz_id: number; answer: string }> = data.answers || [];
    const total = answers.length;
    if (total === 0) return json({ score: 0, correct: 0, total: 0, results: [] });

    let correctCount = 0;
    const results = [];
    for (const a of answers) {
      const quiz = await prisma.quiz.findUnique({ where: { id: a.quiz_id } });
      if (!quiz) continue;
      const isCorrect =
        String(a.answer || "").trim().toLowerCase() ===
        String(quiz.correctAnswer || "").trim().toLowerCase();
      if (isCorrect) correctCount++;
      results.push({
        quiz_id: quiz.id,
        is_correct: isCorrect,
        correct_answer: quiz.correctAnswer,
        explanation: quiz.explanation,
      });
    }

    const score = (correctCount / total) * 100;

    // Upsert progress; keep best score
    const existing = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId: data.lesson_id } },
    });
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: data.lesson_id } },
      create: {
        userId: user.id,
        lessonId: data.lesson_id,
        score,
        quizAttempts: 1,
        completed: score >= 70,
      },
      update: {
        score: Math.max(existing?.score || 0, score),
        quizAttempts: (existing?.quizAttempts || 0) + 1,
        completed: score >= 70 ? true : existing?.completed || false,
      },
    });

    return json({
      score: Math.round(score * 10) / 10,
      correct: correctCount,
      total,
      results,
      passed: score >= 70,
    });
  } catch (e) {
    return handleAuthError(e);
  }
}
