import { prisma } from "./prisma";
import type { Lesson } from "@prisma/client";

export const CATEGORIES = [
  "Python Programming",
  "React Development",
  "JavaScript",
  "AI Development",
  "Data Science",
  "Cybersecurity",
  "Web Development",
  "Other",
];

export async function lessonToDict(lesson: Lesson, userId: number) {
  const [progress, quizCount] = await Promise.all([
    prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
    }),
    prisma.quiz.count({ where: { lessonId: lesson.id } }),
  ]);

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    content: lesson.content,
    category: lesson.category,
    difficulty: lesson.difficulty || "beginner",
    estimated_duration: lesson.estimatedDuration,
    video_url: lesson.videoUrl,
    pdf_url: lesson.pdfUrl,
    is_published: lesson.isPublished,
    created_at: lesson.createdAt ? lesson.createdAt.toISOString() : null,
    quiz_count: quizCount,
    progress: progress
      ? {
          completed: progress.completed,
          score: progress.score,
          last_position: progress.lastPosition,
        }
      : null,
  };
}
