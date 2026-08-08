import { GoogleGenAI } from "@google/genai";
import type { Lesson, User } from "@prisma/client";

export const LEARNING_MODES: Record<string, string> = {
  explain: "You are a helpful tutor. Explain concepts clearly and thoroughly.",
  beginner:
    "You are a patient teacher. Explain everything like the student is 10 years old. Use very simple language, analogies, and examples.",
  advanced:
    "You are an expert mentor. Provide deep technical explanations, discuss edge cases, best practices, and advanced concepts.",
  quiz:
    "You are a quiz master. Generate practice questions based on the lesson content. Give feedback on answers.",
};

// Current-generation models. Newer keys get 2.5/2.0; 1.5 is being retired (404s).
export const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-001",
];

const PLACEHOLDERS = new Set(["", "your-gemini-api-key-here", "your-api-key-here"]);

export function getApiKey(): string {
  return (process.env.GEMINI_API_KEY || "").trim();
}

export class AIConfigError extends Error {
  status: number;
  constructor(message: string, status = 503) {
    super(message);
    this.status = status;
  }
}

export function makeClient(): GoogleGenAI {
  const key = getApiKey();
  if (!key || PLACEHOLDERS.has(key)) {
    throw new AIConfigError(
      "GEMINI_API_KEY is not set. Add your key from https://aistudio.google.com/apikey",
      503
    );
  }
  return new GoogleGenAI({ apiKey: key });
}

export function getLessonContext(lesson: Lesson): string {
  let context = `LESSON CONTEXT:
Title: ${lesson.title}
Category: ${lesson.category}
Difficulty: ${lesson.difficulty}

Description: ${lesson.description || "N/A"}

Lesson Content:
${lesson.content || "No content provided"}
`;
  if (lesson.transcript) {
    context += `\n\nPDF/Notes Content:\n${lesson.transcript.slice(0, 3000)}`;
  }
  return context;
}

export function buildSystemPrompt(
  user: User,
  mode: string,
  lessonContext: string
): string {
  const modeInstruction = LEARNING_MODES[mode] || LEARNING_MODES.explain;
  return `You are Adolescence AI Tutor — an intelligent educational assistant.

${modeInstruction}

STUDENT: ${user.name}

${lessonContext || "The student is asking a general question."}

RULES:
- Always be encouraging and supportive
- Use code examples when relevant (markdown code blocks)
- Keep answers focused and educational
`;
}

type HistoryItem = { role: string; content: string };

function shouldFallback(msg: string): boolean {
  const m = msg.toLowerCase();
  return [
    "not found",
    "does not exist",
    "not supported",
    "404",
    "429",
    "quota",
    "resource_exhausted",
    "rate limit",
  ].some((s) => m.includes(s));
}

/** Friendly, user-facing error for quota/access problems. */
export function friendlyAIError(err: unknown): { detail: string; status: number } {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  if (msg.includes("429") || msg.includes("quota") || msg.includes("resource_exhausted")) {
    return {
      status: 429,
      detail:
        "Your Gemini API key has no available quota (free-tier limit is 0). This usually means " +
        "the key's Google Cloud project wasn't granted the free Gemini tier, or needs billing. " +
        "Create a new key at https://aistudio.google.com/apikey (it should start with 'AIza').",
    };
  }
  if (msg.includes("404") || msg.includes("not found")) {
    return {
      status: 502,
      detail:
        "None of the configured Gemini models are available to your key. " +
        "Open /api/ai/list-models to see which models your key supports.",
    };
  }
  return { status: 500, detail: `AI error: ${err instanceof Error ? err.message : String(err)}` };
}

/** Chat with fallback across models. Returns the text reply. */
export async function generateChat(
  client: GoogleGenAI,
  systemPrompt: string,
  history: HistoryItem[],
  message: string
): Promise<string> {
  const contents = [
    ...history.slice(-10).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  let lastErr: unknown = null;
  for (const model of MODELS) {
    try {
      const res = await client.models.generateContent({
        model,
        contents,
        config: { systemInstruction: systemPrompt },
      });
      return res.text ?? "";
    } catch (e) {
      lastErr = e;
      if (shouldFallback(e instanceof Error ? e.message : String(e))) continue;
      throw e;
    }
  }
  throw lastErr ?? new Error("No available Gemini model found");
}

/** Single-prompt generation with fallback (used for quiz generation). */
export async function generateText(client: GoogleGenAI, prompt: string): Promise<string> {
  let lastErr: unknown = null;
  for (const model of MODELS) {
    try {
      const res = await client.models.generateContent({ model, contents: prompt });
      return res.text ?? "";
    } catch (e) {
      lastErr = e;
      if (shouldFallback(e instanceof Error ? e.message : String(e))) continue;
      throw e;
    }
  }
  throw lastErr ?? new Error("No available Gemini model found");
}
