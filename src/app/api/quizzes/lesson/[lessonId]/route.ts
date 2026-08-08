import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";

export async function GET(req: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const user = await requireUser(req);
    const lessonId = parseInt(params.lessonId, 10);
    const quizzes = await prisma.quiz.findMany({ where: { lessonId } });
    const result = quizzes.map((q) => {
      const base: Record<string, unknown> = {
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options ? JSON.parse(q.options) : [],
      };
      if (user.role === "admin") {
        base.correct_answer = q.correctAnswer;
        base.explanation = q.explanation;
      }
      return base;
    });
    return json(result);
  } catch (e) {
    return handleAuthError(e);
  }
}
