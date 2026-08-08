import { getApiKey } from "@/lib/gemini";
import { GoogleGenAI } from "@google/genai";
import { json } from "@/lib/http";

const PLACEHOLDERS = new Set(["", "your-gemini-api-key-here", "your-api-key-here"]);

export async function GET() {
  const key = getApiKey();
  const masked = key.length > 10 ? `${key.slice(0, 6)}...${key.slice(-4)}` : "(empty)";
  if (!key || PLACEHOLDERS.has(key)) {
    return json({ ok: false, detail: "No real GEMINI_API_KEY set" });
  }
  try {
    const client = new GoogleGenAI({ apiKey: key });
    const usable: string[] = [];
    const pager = await client.models.list();
    for await (const m of pager) {
      const actions = (m as any).supportedActions || (m as any).supportedGenerationMethods || [];
      if (actions.includes("generateContent")) usable.push(m.name as string);
    }
    return json({
      ok: true,
      key_loaded: masked,
      key_format_note:
        "Standard Gemini API keys start with 'AIza'. A key starting with 'AQ.' is an " +
        "OAuth/Vertex-style token and usually has NO free Gemini API tier.",
      models_supporting_generateContent: usable,
    });
  } catch (e) {
    return json({ ok: false, key_loaded: masked, error: e instanceof Error ? e.message : String(e) });
  }
}
