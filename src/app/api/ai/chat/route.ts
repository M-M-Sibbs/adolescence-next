import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { json, error, handleAuthError } from "@/lib/http";
import {
  makeClient,
  AIConfigError,
  getLessonContext,
  buildSystemPrompt,
  generateChat,
  friendlyAIError,
} from "@/lib/gemini";

// AI calls can take a while; allow up to 60s on Vercel.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser(req);
  } catch (e) {
    return handleAuthError(e);
  }

  const body = await req.json().catch(() => ({}));
  const message: string = body.message || "";
  const lessonId: number | null = body.lesson_id ?? null;
  const learningMode: string = body.learning_mode || "explain";
  const history = body.conversation_history || [];

  let client;
  try {
    client = makeClient();
  } catch (e) {
    if (e instanceof AIConfigError) return error(e.message, e.status);
    return error("AI configuration error", 500);
  }

  let lessonContext = "";
  if (lessonId) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (lesson) lessonContext = getLessonContext(lesson);
  }

  const systemPrompt = buildSystemPrompt(user, learningMode, lessonContext);

  let aiResponse: string;
  try {
    aiResponse = await generateChat(client, systemPrompt, history, message);
  } catch (e) {
    const { detail, status } = friendlyAIError(e);
    return error(detail, status);
  }

  const sessionId = body.session_id || crypto.randomUUID();
  await prisma.aIChat.create({
    data: {
      userId: user.id,
      lessonId: lessonId,
      sessionId,
      message,
      response: aiResponse,
      learningMode,
    },
  });

  return json({ response: aiResponse, session_id: sessionId, lesson_id: lessonId });
}
