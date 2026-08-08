import { getApiKey, MODELS } from "@/lib/gemini";
import { GoogleGenAI } from "@google/genai";
import { json } from "@/lib/http";

const PLACEHOLDERS = new Set(["", "your-gemini-api-key-here", "your-api-key-here"]);

export async function GET() {
  const key = getApiKey();
  const masked = key.length > 10 ? `${key.slice(0, 6)}...${key.slice(-4)}` : "(empty)";
  if (!key || PLACEHOLDERS.has(key)) {
    return json({ ok: false, stage: "key", key_loaded: masked, detail: "No real GEMINI_API_KEY set" });
  }

  let client: GoogleGenAI;
  try {
    client = new GoogleGenAI({ apiKey: key });
  } catch (e) {
    return json({ ok: false, stage: "client_init", key_loaded: masked, detail: String(e) });
  }

  const results: Record<string, unknown> = {};
  for (const model of MODELS) {
    try {
      const r = await client.models.generateContent({ model, contents: "Say OK" });
      results[model] = { ok: true, reply: (r.text || "").trim().slice(0, 40) };
    } catch (e) {
      results[model] = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
  const anyOk = Object.values(results).some((v: any) => v.ok);
  return json({ ok: anyOk, stage: "model_call", key_loaded: masked, models: results });
}
