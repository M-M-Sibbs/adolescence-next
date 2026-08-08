import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { json, error, handleAuthError } from "@/lib/http";
import {
  makeClient,
  AIConfigError,
  getLessonContext,
  generateText,
  friendlyAIError,
} from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    await requireUser(req);
  } catch (e) {
    return handleAuthError(e);
  }

  const body = await req.json().catch(() => ({}));
  const lessonId = body.lesson_id;
  const count = body.count || 5;

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return error("Lesson not found", 404);

  let client;
  try {
    client = makeClient();
  } catch (e) {
    if (e instanceof AIConfigError) return error(e.message, e.status);
    return error("AI configuration error", 500);
  }

  const prompt = `Based on this lesson, generate ${count} quiz questions.

${getLessonContext(lesson)}

Return ONLY valid JSON (no markdown) in this exact shape:
{
  "questions": [
    {
      "question": "...",
      "type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A",
      "explanation": "..."
    }
  ]
}

Mix question types: multiple_choice, true_false, fill_blank.
For true_false: options ["True","False"], correct_answer "True" or "False".
For fill_blank: options [], correct_answer is the missing word(s).`;

  let text: string;
  try {
    text = await generateText(client, prompt);
  } catch (e) {
    const { detail, status } = friendlyAIError(e);
    return error(detail, status);
  }

  try {
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return json(JSON.parse(clean));
  } catch {
    return error("Quiz generation failed: could not parse AI response", 500);
  }
}
