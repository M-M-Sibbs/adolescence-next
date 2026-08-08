import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { json, error, handleAuthError } from "@/lib/http";
import type { QuestionType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const data = await req.json();
    const lesson = await prisma.lesson.findUnique({ where: { id: data.lesson_id } });
    if (!lesson) return error("Lesson not found", 404);

    const quiz = await prisma.quiz.create({
      data: {
        lessonId: data.lesson_id,
        question: data.question,
        type: (data.type || "multiple_choice") as QuestionType,
        options: JSON.stringify(data.options || []),
        correctAnswer: data.correct_answer,
        explanation: data.explanation || "",
      },
    });
    return json({ id: quiz.id, message: "Quiz created" });
  } catch (e) {
    return handleAuthError(e);
  }
}
