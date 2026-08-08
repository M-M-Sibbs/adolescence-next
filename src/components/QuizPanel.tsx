"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, Trophy, RotateCcw, Loader2, HelpCircle, Sparkles } from "lucide-react";

type Quiz = {
  id: number;
  question: string;
  type: string;
  options?: string[];
};

export default function QuizPanel({
  quizzes,
  lessonId,
  onGenerateQuiz,
  generatingQuiz,
}: {
  quizzes: Quiz[];
  lessonId: number;
  onGenerateQuiz: () => void;
  generatingQuiz: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = (quizId: number, answer: string) => {
    if (results) return;
    setAnswers((prev) => ({ ...prev, [quizId]: answer }));
  };

  const submit = async () => {
    if (Object.keys(answers).length === 0) return;
    setSubmitting(true);
    try {
      const data = await api.post("/quizzes/submit", {
        lesson_id: lessonId,
        answers: Object.entries(answers).map(([quiz_id, answer]) => ({
          quiz_id: parseInt(quiz_id, 10),
          answer,
        })),
      });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setResults(null);
  };

  if (quizzes.length === 0) {
    return (
      <div className="card text-center py-10">
        <HelpCircle size={36} className="mx-auto mb-3 text-slate-600" />
        <p className="text-slate-400 font-medium mb-1">No quizzes yet</p>
        <p className="text-slate-500 text-sm mb-5">Generate AI-powered quiz questions from this lesson</p>
        <button onClick={onGenerateQuiz} disabled={generatingQuiz} className="btn-primary inline-flex items-center gap-2">
          {generatingQuiz ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {generatingQuiz ? "Generating…" : "Generate AI Quiz"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results && (
        <div className={`card border-2 text-center py-6 ${results.passed ? "border-emerald-400 bg-emerald-50" : "border-coral-400 bg-coral-50"}`}>
          <Trophy size={32} className={`mx-auto mb-2 ${results.passed ? "text-emerald-500" : "text-coral-500"}`} />
          <p className="font-display text-2xl font-bold text-ink-900">{results.score}%</p>
          <p className={`text-sm mt-1 ${results.passed ? "text-emerald-600" : "text-coral-600"}`}>
            {results.passed ? "🎉 Passed! Great work!" : `${results.correct}/${results.total} correct — keep studying!`}
          </p>
          <button onClick={reset} className="btn-ghost mt-4 inline-flex items-center gap-2 text-sm">
            <RotateCcw size={14} /> Try Again
          </button>
        </div>
      )}

      {quizzes.map((quiz, idx) => {
        const result = results?.results?.find((r: any) => r.quiz_id === quiz.id);
        const userAnswer = answers[quiz.id];
        const isCorrect = result?.is_correct;
        const showResult = !!results;

        return (
          <div key={quiz.id} className={`card transition-all ${showResult ? (isCorrect ? "border-emerald-300" : "border-red-300") : ""}`}>
            <div className="flex items-start gap-3 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-display font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-slate-100 font-medium leading-snug">{quiz.question}</p>
                {quiz.type === "fill_blank" && <p className="text-slate-500 text-xs mt-1">Fill in the blank</p>}
              </div>
              {showResult &&
                (isCorrect ? (
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle size={18} className="text-red-500 flex-shrink-0" />
                ))}
            </div>

            {quiz.type === "fill_blank" ? (
              <input
                className="input text-sm"
                placeholder="Your answer…"
                value={userAnswer || ""}
                onChange={(e) => handleAnswer(quiz.id, e.target.value)}
                disabled={showResult}
              />
            ) : (
              <div className="space-y-2">
                {(quiz.options || []).map((opt, oIdx) => {
                  const optVal = quiz.type === "true_false" ? opt : opt.charAt(0);
                  const selected = userAnswer === optVal;
                  const isThisCorrect = showResult && result?.correct_answer === optVal;
                  const isThisWrong = showResult && selected && !isCorrect;

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswer(quiz.id, optVal)}
                      disabled={showResult}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                        isThisCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                          : isThisWrong
                            ? "border-red-500 bg-red-50 text-red-600"
                            : selected
                              ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                              : "border-surface-500 bg-surface-700 text-slate-300 hover:border-surface-400 hover:bg-surface-600"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {showResult && result?.explanation && (
              <div className="mt-3 text-xs text-slate-400 bg-surface-700 rounded-lg px-3 py-2 border border-surface-500">
                💡 {result.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!results && (
        <div className="flex items-center gap-3">
          <button onClick={submit} disabled={submitting || Object.keys(answers).length === 0} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Checking…
              </>
            ) : (
              "Submit Answers"
            )}
          </button>
          <button onClick={onGenerateQuiz} disabled={generatingQuiz} className="btn-ghost flex items-center gap-2 text-sm">
            {generatingQuiz ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            More
          </button>
        </div>
      )}
    </div>
  );
}
