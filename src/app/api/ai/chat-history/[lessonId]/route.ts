import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";

export async function GET(req: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const user = await requireUser(req);
    const lessonId = parseInt(params.lessonId, 10);
    const chats = await prisma.aIChat.findMany({
      where: { userId: user.id, lessonId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return json(
      chats.reverse().map((c) => ({
        id: c.id,
        message: c.message,
        response: c.response,
        learning_mode: c.learningMode,
        created_at: c.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    return handleAuthError(e);
  }
}
