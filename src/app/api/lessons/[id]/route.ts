import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { json, error, handleAuthError } from "@/lib/http";
import { lessonToDict } from "@/lib/lessons";
import { uploadFile, extractPdfText } from "@/lib/upload";
import type { DifficultyLevel } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser(req);
    const id = parseInt(params.id, 10);
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return error("Lesson not found", 404);
    if (user.role === "student" && !lesson.isPublished) return error("Lesson not available", 403);
    return json(await lessonToDict(lesson, user.id));
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin(req);
    const id = parseInt(params.id, 10);
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) return error("Lesson not found", 404);

    const form = await req.formData();
    const get = (k: string, d = "") => (form.get(k) as string | null) ?? d;
    const video = form.get("video") as File | null;
    const pdf = form.get("pdf") as File | null;

    const data: Record<string, unknown> = {
      title: get("title"),
      description: get("description"),
      content: get("content"),
      category: get("category", "Other"),
      difficulty: get("difficulty", "beginner") as DifficultyLevel,
      estimatedDuration: parseInt(get("estimated_duration", "30"), 10) || 30,
      isPublished: get("is_published", "false") === "true",
    };

    if (video && video.size > 0) {
      const { url, filename } = await uploadFile(video, "videos");
      data.videoUrl = url;
      data.videoFilename = filename;
    }
    if (pdf && pdf.size > 0) {
      const { url, filename } = await uploadFile(pdf, "pdfs");
      data.pdfUrl = url;
      data.pdfFilename = filename;
      data.transcript = await extractPdfText(pdf);
    }

    const lesson = await prisma.lesson.update({ where: { id }, data: data as never });
    return json(await lessonToDict(lesson, admin.id));
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(req);
    const id = parseInt(params.id, 10);
    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) return error("Lesson not found", 404);
    await prisma.lesson.delete({ where: { id } });
    return json({ message: "Lesson deleted" });
  } catch (e) {
    return handleAuthError(e);
  }
}
