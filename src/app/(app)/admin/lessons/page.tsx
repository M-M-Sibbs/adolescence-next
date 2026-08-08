"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, Loader2,
  BookOpen, FileText, Play, Clock, CheckCircle, AlertTriangle,
  Sparkles, HelpCircle,
} from "lucide-react";

const CATEGORIES = ["Python Programming", "React Development", "JavaScript", "AI Development", "Data Science", "Cybersecurity", "Web Development", "Other"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const emptyForm = {
  title: "", description: "", content: "", category: "Python Programming",
  difficulty: "beginner", estimated_duration: 30, is_published: false,
  video: null as File | null, pdf: null as File | null,
};

export default function AdminLessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLesson, setEditLesson] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [generatingQuiz, setGeneratingQuiz] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api.get("/lessons?published_only=false").then((r) => setLessons(r)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditLesson(null); setForm(emptyForm); setError(""); setShowModal(true); };
  const openEdit = (l: any) => {
    setEditLesson(l);
    setForm({
      ...emptyForm,
      title: l.title, description: l.description || "", content: l.content || "",
      category: l.category || "Other", difficulty: l.difficulty,
      estimated_duration: l.estimated_duration || 30, is_published: l.is_published,
    });
    setError(""); setShowModal(true);
  };

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    if (type === "file") setForm((p) => ({ ...p, [name]: target.files?.[0] || null }));
    else if (type === "checkbox") setForm((p) => ({ ...p, [name]: target.checked }));
    else setForm((p) => ({ ...p, [name]: value }));
  };

  const save = async () => {
    if (!form.title.trim()) return setError("Title is required");
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("content", form.content);
      fd.append("category", form.category);
      fd.append("difficulty", form.difficulty);
      fd.append("estimated_duration", String(form.estimated_duration));
      fd.append("is_published", String(form.is_published));
      if (form.video) fd.append("video", form.video);
      if (form.pdf) fd.append("pdf", form.pdf);

      if (editLesson) {
        await api.putForm(`/lessons/${editLesson.id}`, fd);
        setSuccessMsg("Lesson updated!");
      } else {
        await api.postForm("/lessons", fd);
        setSuccessMsg("Lesson created!");
      }
      setShowModal(false);
      load();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  };

  const togglePublish = async (lesson: any) => {
    try {
      const data = await api.post(`/lessons/${lesson.id}/publish`);
      setLessons((prev) => prev.map((l) => (l.id === lesson.id ? { ...l, is_published: data.is_published } : l)));
    } catch {}
  };

  const deleteLesson = async (id: number) => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await api.del(`/lessons/${id}`);
      setLessons((prev) => prev.filter((l) => l.id !== id));
    } finally { setDeleting(null); }
  };

  const generateQuiz = async (lessonId: number) => {
    setGeneratingQuiz(lessonId);
    try {
      const data = await api.post("/ai/generate-quiz", { lesson_id: lessonId, count: 5 });
      if (data.questions?.length) {
        await api.post(
          `/quizzes/bulk?lesson_id=${lessonId}`,
          data.questions.map((q: any) => ({
            lesson_id: lessonId,
            question: q.question,
            type: q.type || "multiple_choice",
            options: q.options || [],
            correct_answer: q.correct_answer,
            explanation: q.explanation || "",
          }))
        );
        setSuccessMsg(`Generated ${data.questions.length} quiz questions!`);
        setTimeout(() => setSuccessMsg(""), 3000);
        load();
      }
    } catch (err) {
      alert("Quiz generation failed: " + (err instanceof Error ? err.message : String(err)));
    } finally { setGeneratingQuiz(null); }
  };

  const diffColor = (d: string) =>
    ({ beginner: "badge-green", intermediate: "badge-orange", advanced: "badge-red" } as Record<string, string>)[d] || "badge-blue";

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto animate-fade-in">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-900">Lessons</h1>
            <p className="text-slate-400 text-sm mt-1">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""} total</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Lesson
          </button>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-lg px-4 py-3 mb-5 animate-fade-in">
            <CheckCircle size={15} /> {successMsg}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
        ) : lessons.length === 0 ? (
          <div className="card text-center py-16">
            <BookOpen size={40} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 font-medium">No lessons yet</p>
            <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={16} /> Create your first lesson
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="card flex flex-wrap md:flex-nowrap items-center gap-4 hover:border-surface-500 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={diffColor(lesson.difficulty)}>{lesson.difficulty}</span>
                    <span className="badge-blue">{lesson.category}</span>
                    {lesson.is_published ? (
                      <span className="badge-green flex items-center gap-1"><CheckCircle size={10} /> Published</span>
                    ) : (
                      <span className="badge text-xs bg-surface-600 text-slate-400">Draft</span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-ink-900 truncate">{lesson.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    {lesson.video_url && <span className="flex items-center gap-1"><Play size={11} /> Video</span>}
                    {lesson.pdf_url && <span className="flex items-center gap-1"><FileText size={11} /> PDF</span>}
                    {lesson.quiz_count > 0 && <span className="flex items-center gap-1"><HelpCircle size={11} /> {lesson.quiz_count} Q</span>}
                    <span className="flex items-center gap-1"><Clock size={11} /> {lesson.estimated_duration}min</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => generateQuiz(lesson.id)} disabled={generatingQuiz === lesson.id} title="Generate AI quiz"
                    className="w-8 h-8 rounded-lg bg-coral-50 hover:bg-coral-100 text-coral-500 flex items-center justify-center transition-colors">
                    {generatingQuiz === lesson.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  </button>
                  <button onClick={() => togglePublish(lesson)} title={lesson.is_published ? "Unpublish" : "Publish"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      lesson.is_published ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-500" : "bg-surface-600 hover:bg-surface-500 text-slate-400"
                    }`}>
                    {lesson.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => openEdit(lesson)} title="Edit lesson"
                    className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-500 flex items-center justify-center transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteLesson(lesson.id)} disabled={deleting === lesson.id} title="Delete lesson"
                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                    {deleting === lesson.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-surface-600 rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
              <h2 className="font-display font-bold text-ink-900 text-lg">
                {editLesson ? "Edit Lesson" : "Create New Lesson"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-ink-900 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  <AlertTriangle size={15} /> {error}
                </div>
              )}

              <div>
                <label className="text-sm text-slate-300 font-medium mb-1.5 block">Title *</label>
                <input name="title" value={form.title} onChange={handleField} className="input" placeholder="e.g. Introduction to Python" />
              </div>

              <div>
                <label className="text-sm text-slate-300 font-medium mb-1.5 block">Description</label>
                <textarea name="description" value={form.description} onChange={handleField} rows={2} className="input resize-none" placeholder="Brief overview of this lesson" />
              </div>

              <div>
                <label className="text-sm text-slate-300 font-medium mb-1.5 block">Lesson Content</label>
                <textarea name="content" value={form.content} onChange={handleField} rows={6} className="input resize-none font-mono text-sm" placeholder="Full lesson content — the AI tutor will use this to answer student questions…" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 font-medium mb-1.5 block">Category</label>
                  <select name="category" value={form.category} onChange={handleField} className="input">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 font-medium mb-1.5 block">Difficulty</label>
                  <select name="difficulty" value={form.difficulty} onChange={handleField} className="input capitalize">
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300 font-medium mb-1.5 block">Estimated Duration (minutes)</label>
                <input name="estimated_duration" type="number" min={1} value={form.estimated_duration} onChange={handleField} className="input w-32" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <Play size={13} className="text-indigo-500" /> Demo Video
                  </label>
                  <input ref={videoInputRef} name="video" type="file" accept="video/*" onChange={handleField} className="hidden" />
                  <button type="button" onClick={() => videoInputRef.current?.click()}
                    className={`w-full py-3 rounded-lg border-2 border-dashed text-sm transition-all flex items-center justify-center gap-2 ${
                      form.video ? "border-indigo-400 text-indigo-500 bg-indigo-50" : "border-surface-500 text-slate-500 hover:border-surface-400 hover:text-slate-400"
                    }`}>
                    <Upload size={14} />
                    {form.video ? form.video.name.slice(0, 20) + "…" : editLesson?.video_url ? "Replace video" : "Upload video"}
                  </button>
                </div>
                <div>
                  <label className="text-sm text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                    <FileText size={13} className="text-red-500" /> PDF Notes
                  </label>
                  <input ref={pdfInputRef} name="pdf" type="file" accept=".pdf" onChange={handleField} className="hidden" />
                  <button type="button" onClick={() => pdfInputRef.current?.click()}
                    className={`w-full py-3 rounded-lg border-2 border-dashed text-sm transition-all flex items-center justify-center gap-2 ${
                      form.pdf ? "border-red-400 text-red-500 bg-red-50" : "border-surface-500 text-slate-500 hover:border-surface-400 hover:text-slate-400"
                    }`}>
                    <Upload size={14} />
                    {form.pdf ? form.pdf.name.slice(0, 20) + "…" : editLesson?.pdf_url ? "Replace PDF" : "Upload PDF"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input name="is_published" id="publish" type="checkbox" checked={form.is_published} onChange={handleField} className="w-4 h-4 accent-indigo-500 rounded" />
                <label htmlFor="publish" className="text-sm text-slate-300 cursor-pointer">
                  Publish immediately (visible to students)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-600">
              <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? (<><Loader2 size={15} className="animate-spin" /> Saving…</>) : editLesson ? "Update Lesson" : "Create Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
