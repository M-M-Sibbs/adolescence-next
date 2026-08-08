import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";
import type { QuestionType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const { searchParams } = new URL(req.url);
    const lessonId = parseInt(searchParams.get("lesson_id") || "0", 10);
    const quizzes = await req.json();

    await prisma.quiz.createMany({
      data: (quizzes as any[]).map((q) => ({
        lessonId,
        question: q.question,
        type: (q.type || "multiple_choice") as QuestionType,
        options: JSON.stringify(q.options || []),
        correctAnswer: q.correct_answer,
        explanation: q.explanation || "",
      })),
    });
    return json({ created: (quizzes as any[]).length });
  } catch (e) {
    return handleAuthError(e);
  }
}
