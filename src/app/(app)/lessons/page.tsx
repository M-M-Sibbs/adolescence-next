"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BookOpen, Search, Clock, CheckCircle, Play, FileText, HelpCircle } from "lucide-react";

const CATEGORIES = ["All", "Python Programming", "React Development", "JavaScript", "AI Development", "Data Science", "Cybersecurity", "Web Development", "Other"];
const DIFFICULTIES = ["All", "beginner", "intermediate", "advanced"];

const diffBadge = (d: string) =>
  ({ beginner: "badge-green", intermediate: "badge-orange", advanced: "badge-red" } as Record<string, string>)[d] || "badge-blue";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  useEffect(() => {
    api.get("/lessons").then((r) => setLessons(r)).finally(() => setLoading(false));
  }, []);

  const filtered = lessons.filter((l) => {
    const matchSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || l.category === category;
    const matchDiff = difficulty === "All" || l.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="px-4 py-5 sm:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Lessons</h1>
        <p className="text-slate-400 text-sm">Select a lesson to start learning with your AI tutor</p>
      </div>

      <div className="card mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search lessons…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input md:w-52" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input md:w-40" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-4 bg-surface-600 rounded w-1/2" />
              <div className="h-5 bg-surface-600 rounded w-3/4" />
              <div className="h-3 bg-surface-600 rounded w-full" />
              <div className="h-3 bg-surface-600 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <BookOpen size={40} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 font-medium">No lessons found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p className="text-slate-500 text-sm mb-4">{filtered.length} lesson{filtered.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`} className="card hover:border-indigo-300 transition-all duration-200 group flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={diffBadge(lesson.difficulty)}>{lesson.difficulty}</span>
                  <div className="flex items-center gap-2">
                    {lesson.video_url && <Play size={13} className="text-slate-500" />}
                    {lesson.pdf_url && <FileText size={13} className="text-slate-500" />}
                    {lesson.quiz_count > 0 && <HelpCircle size={13} className="text-slate-500" />}
                    {lesson.progress?.completed && <CheckCircle size={14} className="text-emerald-500" />}
                  </div>
                </div>

                <h3 className="font-display font-semibold text-ink-900 group-hover:text-indigo-500 transition-colors mb-2 line-clamp-2 flex-1">
                  {lesson.title}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{lesson.description}</p>

                <div className="flex items-center justify-between text-xs mt-auto pt-3 border-t border-surface-600">
                  <span className="badge-blue">{lesson.category}</span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {lesson.estimated_duration}min
                  </span>
                </div>

                {lesson.progress && !lesson.progress.completed && (
                  <div className="mt-3 h-1 bg-surface-600 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "40%" }} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
