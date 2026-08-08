"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";
import { BookOpen, CheckCircle, Brain, Trophy, ArrowRight, TrendingUp, Sparkles } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/progress/me"), api.get("/lessons")])
      .then(([progress, lessonList]) => {
        setStats(progress);
        setLessons(lessonList.slice(0, 6));
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Lessons Completed", value: stats?.lessons_completed ?? 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "In Progress", value: stats?.lessons_in_progress ?? 0, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Avg Quiz Score", value: `${stats?.average_score ?? 0}%`, icon: Trophy, color: "text-coral-500", bg: "bg-coral-50" },
    { label: "AI Sessions", value: stats?.ai_sessions ?? 0, icon: Brain, color: "text-indigo-600", bg: "bg-indigo-100" },
  ];

  const difficultyColor = (d: string) =>
    ({ beginner: "badge-green", intermediate: "badge-orange", advanced: "badge-red" } as Record<string, string>)[d] || "badge-blue";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-900">
          Good {greeting}, <span className="text-indigo-500">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Ready to continue your learning journey?</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-ink-900">{loading ? "—" : value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-indigo-50 border-indigo-100 mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-ink-900">Your AI Tutor is ready</h3>
            <p className="text-slate-400 text-sm">Open any lesson and chat with the margin tutor</p>
          </div>
        </div>
        <Link href="/lessons" className="btn-primary flex items-center gap-2 whitespace-nowrap">
          Browse Lessons <ArrowRight size={15} />
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-ink-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            Available Lessons
          </h2>
          <Link href="/lessons" className="text-indigo-500 text-sm hover:text-indigo-600 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-surface-600 rounded w-3/4 mb-3" />
                <div className="h-3 bg-surface-600 rounded w-full mb-2" />
                <div className="h-3 bg-surface-600 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="card text-center py-10 text-slate-500">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p>No lessons published yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="card hover:border-indigo-300 transition-all group cursor-pointer block">
                <div className="flex items-start justify-between mb-3">
                  <span className={difficultyColor(lesson.difficulty)}>{lesson.difficulty}</span>
                  {lesson.progress?.completed && <span className="badge-green">✓ Done</span>}
                </div>
                <h3 className="font-display font-semibold text-ink-900 group-hover:text-indigo-500 transition-colors mb-2 line-clamp-2">{lesson.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">{lesson.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="badge-blue">{lesson.category}</span>
                  <span>{lesson.estimated_duration}min</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
