"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AIChat from "@/components/AIChat";
import QuizPanel from "@/components/QuizPanel";
import { api } from "@/lib/api";
import {
  ArrowLeft, Play, FileText, HelpCircle, Brain,
  Clock, CheckCircle, Download, Loader2, BookOpen, AlertTriangle,
} from "lucide-react";

const TABS = [
  { id: "content", label: "Content", icon: BookOpen },
  { id: "ai", label: "AI Tutor", icon: Brain },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
];

const diffBadge = (d: string) =>
  ({ beginner: "badge-green", intermediate: "badge-orange", advanced: "badge-red" } as Record<string, string>)[d] || "badge-blue";

export default function LessonViewer() {
  const params = useParams();
  const id = String(params.id);
  const lessonIdNum = parseInt(id, 10);

  const [lesson, setLesson] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("content");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    Promise.all([api.get(`/lessons/${id}`), api.get(`/quizzes/lesson/${id}`)])
      .then(([lessonRes, quizRes]) => {
        setLesson(lessonRes);
        setQuizzes(quizRes);
        setCompleted(lessonRes.progress?.completed || false);
        if (lessonRes.progress?.last_position > 0 && videoRef.current) {
          videoRef.current.currentTime = lessonRes.progress.last_position;
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Save video position every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        api
          .post("/progress/update", {
            lesson_id: lessonIdNum,
            last_position: Math.floor(videoRef.current.currentTime),
          })
          .catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lessonIdNum]);

  const markComplete = async () => {
    setMarkingDone(true);
    try {
      await api.post("/progress/update", { lesson_id: lessonIdNum, completed: true });
      setCompleted(true);
    } finally {
      setMarkingDone(false);
    }
  };

  const generateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const data = await api.post("/ai/generate-quiz", { lesson_id: lessonIdNum, count: 5 });
      if (data.questions?.length) {
        await api.post(
          `/quizzes/bulk?lesson_id=${id}`,
          data.questions.map((q: any) => ({
            lesson_id: lessonIdNum,
            question: q.question,
            type: q.type || "multiple_choice",
            options: q.options || [],
            correct_answer: q.correct_answer,
            explanation: q.explanation || "",
          }))
        );
        const fresh = await api.get(`/quizzes/lesson/${id}`);
        setQuizzes(fresh);
        setTab("quiz");
      }
    } catch (err) {
      alert("Quiz generation failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={28} className="animate-spin text-indigo-500" />
      </div>
    );

  if (!lesson)
    return (
      <div className="p-6 text-center">
        <AlertTriangle size={40} className="mx-auto mb-3 text-coral-500" />
        <p className="text-slate-300">Lesson not found</p>
        <Link href="/lessons" className="btn-primary mt-4 inline-block">Back to Lessons</Link>
      </div>
    );

  return (
    <div className="px-4 py-4 sm:p-5 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-wrap items-start gap-4 mb-5">
        <Link href="/lessons" className="flex items-center gap-1.5 text-slate-400 hover:text-ink-900 text-sm transition-colors mt-0.5">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={diffBadge(lesson.difficulty)}>{lesson.difficulty}</span>
            <span className="badge-blue">{lesson.category}</span>
            {completed && (
              <span className="badge-green flex items-center gap-1">
                <CheckCircle size={11} /> Completed
              </span>
            )}
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900 leading-tight">{lesson.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock size={12} /> {lesson.estimated_duration} min</span>
            <span className="flex items-center gap-1"><HelpCircle size={12} /> {quizzes.length} questions</span>
            {lesson.video_url && <span className="flex items-center gap-1"><Play size={12} /> Video included</span>}
          </div>
        </div>
        {!completed && (
          <button onClick={markComplete} disabled={markingDone} className="btn-ghost text-sm flex items-center justify-center gap-2 w-full sm:w-auto py-3 sm:py-2.5">
            {markingDone ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Mark Complete
          </button>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        <div className="flex-1 min-w-0 space-y-5">
          {lesson.video_url && (
            <div className="card p-0 overflow-hidden">
              <video ref={videoRef} src={lesson.video_url} controls className="w-full max-h-[420px] bg-black" onEnded={() => markComplete()}>
                Your browser does not support video.
              </video>
              <div className="px-4 py-2.5 flex items-center justify-between border-t border-surface-600 bg-surface-700">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Play size={12} className="text-indigo-500" /> Lesson Video
                </span>
                <a href={lesson.video_url} download className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                  <Download size={12} /> Download
                </a>
              </div>
            </div>
          )}

          <div className="card p-0 overflow-hidden">
            <div className="flex border-b border-surface-600">
              {TABS.map(({ id: tid, label, icon: Icon }) => (
                <button
                  key={tid}
                  onClick={() => setTab(tid)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px active:scale-95 ${
                    tab === tid
                      ? "border-indigo-500 text-indigo-500 bg-indigo-50"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-surface-700"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {tid === "quiz" && quizzes.length > 0 && (
                    <span className="badge-blue text-xs px-1.5 py-0.5">{quizzes.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === "content" && (
                <div className="space-y-5">
                  {lesson.description && (
                    <div>
                      <h3 className="font-display font-semibold mb-2 text-sm uppercase tracking-wide text-slate-500">About</h3>
                      <p className="text-slate-300 leading-relaxed">{lesson.description}</p>
                    </div>
                  )}
                  {lesson.content && (
                    <div>
                      <h3 className="font-display font-semibold mb-3 text-sm uppercase tracking-wide text-slate-500">Lesson Content</h3>
                      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm bg-surface-700 rounded-xl p-5 border border-surface-500">
                        {lesson.content}
                      </div>
                    </div>
                  )}
                  {lesson.pdf_url && (
                    <div className="flex items-center justify-between bg-surface-700 rounded-xl px-5 py-4 border border-surface-500">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                          <FileText size={18} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink-900">Lesson PDF / Notes</p>
                          <p className="text-xs text-slate-500">Downloadable reference material</p>
                        </div>
                      </div>
                      <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm flex items-center justify-center gap-2 w-full sm:w-auto py-3 sm:py-2.5">
                        <Download size={14} /> Download
                      </a>
                    </div>
                  )}
                  {!lesson.content && !lesson.description && !lesson.pdf_url && (
                    <p className="text-slate-500 text-sm text-center py-8">No content available yet.</p>
                  )}
                </div>
              )}

              {tab === "ai" && (
                <>
                  <div className="xl:hidden h-[calc(100vh-19rem)] min-h-[380px]">
                    <AIChat lessonId={lessonIdNum} lessonTitle={lesson.title} />
                  </div>
                  <div className="hidden xl:block text-center py-8 text-slate-500 text-sm">
                    <Brain size={24} className="mx-auto mb-2 text-indigo-500 opacity-50" />
                    Your AI Tutor is visible on the right →
                  </div>
                </>
              )}

              {tab === "quiz" && (
                <QuizPanel quizzes={quizzes} lessonId={lessonIdNum} onGenerateQuiz={generateQuiz} generatingQuiz={generatingQuiz} />
              )}
            </div>
          </div>
        </div>

        <div className="hidden xl:flex xl:w-[400px] flex-shrink-0" style={{ height: "calc(100vh - 140px)", position: "sticky", top: 20 }}>
          <AIChat lessonId={lessonIdNum} lessonTitle={lesson.title} />
        </div>
      </div>
    </div>
  );
}
