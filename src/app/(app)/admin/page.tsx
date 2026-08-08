"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Users, BookOpen, CheckCircle, Brain, TrendingUp, ArrowRight, BarChart3, Plus, Sparkles } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/overview").then((r) => setStats(r)).finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Students", value: stats.total_students, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: "Total Lessons", value: stats.total_lessons, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-100" },
        { label: "Completions", value: stats.total_completions, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "AI Conversations", value: stats.total_ai_chats, icon: Brain, color: "text-coral-500", bg: "bg-coral-50" },
      ]
    : [];

  const completionRate =
    stats?.total_lessons > 0
      ? Math.round((stats.total_completions / Math.max(stats.total_students * stats.total_lessons, 1)) * 100)
      : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Platform overview and analytics</p>
        </div>
        <Link href="/admin/lessons" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Lesson
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-ink-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <TrendingUp size={17} className="text-indigo-500" /> Most Active Lessons
          </h2>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-surface-600 rounded animate-pulse" />)}</div>
          ) : stats?.top_lessons?.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No AI sessions yet</p>
          ) : (
            <div className="space-y-3">
              {(stats?.top_lessons || []).map((l: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-surface-600 text-slate-400 text-xs font-display font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-slate-300 truncate">{l.title}</p>
                  <span className="badge-blue text-xs">{l.chats} chats</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-display font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <BarChart3 size={17} className="text-indigo-500" /> Performance
          </h2>
          {loading ? (
            <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-surface-600 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-surface-700 rounded-xl p-4 border border-surface-500">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Avg Quiz Score</span>
                  <span className="font-display font-bold text-ink-900">{stats?.avg_quiz_score}%</span>
                </div>
                <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${stats?.avg_quiz_score || 0}%` }} />
                </div>
              </div>
              <div className="bg-surface-700 rounded-xl p-4 border border-surface-500">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Completion Rate</span>
                  <span className="font-display font-bold text-ink-900">{completionRate}%</span>
                </div>
                <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(completionRate, 100)}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {[
          { to: "/admin/lessons", icon: BookOpen, label: "Manage Lessons", desc: "Create, edit, publish lessons", color: "text-indigo-500", bg: "bg-indigo-50" },
          { to: "/admin/users", icon: Users, label: "Manage Users", desc: "View and manage students", color: "text-indigo-600", bg: "bg-indigo-100" },
          { to: "/admin/lessons", icon: Sparkles, label: "AI Features", desc: "Generate quizzes with Gemini", color: "text-coral-500", bg: "bg-coral-50" },
        ].map(({ to, icon: Icon, label, desc, color, bg }) => (
          <Link key={to + label} href={to} className="card hover:border-indigo-300 transition-all group flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon size={19} className={color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-ink-900 text-sm">{label}</p>
              <p className="text-slate-500 text-xs">{desc}</p>
            </div>
            <ArrowRight size={15} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
