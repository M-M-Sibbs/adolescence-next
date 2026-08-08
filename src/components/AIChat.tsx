"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Send, Bot, User, Loader2, PenLine } from "lucide-react";
import ReactMarkdown from "react-markdown";

const MODES = [
  { value: "explain", label: "📖 Explain" },
  { value: "beginner", label: "🧒 Beginner" },
  { value: "advanced", label: "🚀 Advanced" },
  { value: "quiz", label: "🎯 Quiz Me" },
];

const STARTERS = [
  "Can you summarize this lesson?",
  "Give me a simple example",
  "What are the key concepts?",
  "Quiz me on this lesson",
  "Explain this like I'm a beginner",
];

type Message = { role: "user" | "assistant"; content: string; id: number; error?: boolean };

export default function AIChat({
  lessonId,
  lessonTitle,
}: {
  lessonId?: number | null;
  lessonTitle?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("explain");
  const [sessionId] = useState(() => `sess_${Date.now()}`);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const data = await api.post("/ai/chat", {
        message: msg,
        lesson_id: lessonId || null,
        session_id: sessionId,
        learning_mode: mode,
        conversation_history: history,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, id: Date.now() + 1 },
      ]);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "AI service unavailable. Check your GEMINI_API_KEY.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${errMsg}`, id: Date.now() + 1, error: true },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-800 rounded-xl border border-surface-600 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cream-400 bg-cream-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500/15 rounded-lg flex items-center justify-center">
            <PenLine size={14} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-ink-900">Margin tutor</p>
            <p className="text-xs text-ink-400">Reads your lesson</p>
          </div>
        </div>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="bg-surface-600 border border-surface-500 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={26} className="text-indigo-500" />
            </div>
            <p className="font-display font-semibold text-ink-900 mb-1">
              {lessonTitle ? `Ask about: ${lessonTitle}` : "Ask me anything"}
            </p>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              I&apos;ve read the lesson content and am ready to help you learn.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-surface-700 hover:bg-surface-600 border border-surface-500 text-slate-300 hover:text-ink-900 rounded-full px-3 py-1.5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === "user" ? "bg-indigo-500" : "bg-surface-600"
              }`}
            >
              {msg.role === "user" ? (
                <User size={13} className="text-white" />
              ) : (
                <Bot size={13} className="text-indigo-500" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-indigo-500 text-white rounded-tr-sm"
                  : msg.error
                    ? "bg-red-50 border border-red-200 text-red-600 rounded-tl-sm"
                    : "bg-surface-700 text-slate-200 rounded-tl-sm"
              }`}
            >
              {msg.role === "user" ? (
                <p>{msg.content}</p>
              ) : (
                <div className="ai-response">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-surface-600 flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-indigo-500" />
            </div>
            <div className="bg-surface-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="text-indigo-500 animate-spin" />
              <span className="text-slate-400 text-sm">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-surface-600 bg-surface-700">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask your AI tutor…"
            rows={1}
            className="input resize-none flex-1 text-sm py-2.5 max-h-28"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary px-3 py-2.5 flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 text-center">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
