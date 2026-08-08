import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { json, handleAuthError } from "@/lib/http";
import { lessonToDict } from "@/lib/lessons";
import { uploadFile, extractPdfText } from "@/lib/upload";
import type { DifficultyLevel } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const publishedOnly = searchParams.get("published_only") !== "false";

    const where: Record<string, unknown> = {};
    if (publishedOnly && user.role === "student") where.isPublished = true;
    if (category) where.category = category;

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    const result = await Promise.all(lessons.map((l) => lessonToDict(l, user.id)));
    return json(result);
  } catch (e) {
    return handleAuthError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
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
      createdBy: admin.id,
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

    const lesson = await prisma.lesson.create({ data: data as never });
    return json(await lessonToDict(lesson, admin.id));
  } catch (e) {
    return handleAuthError(e);
  }
}
