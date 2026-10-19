const API = "https://generativelanguage.googleapis.com/v1beta";
export const DEFAULT_MODEL = "gemini-2.5-flash";

// Server key wins; a visitor-supplied key is only used when none is configured.
export const resolveKey = (userKey) => process.env.GEMINI_API_KEY || (userKey || "").trim();

async function call(path, key, init = {}) {
  const r = await fetch(`${API}${path}`, { ...init, headers: { "Content-Type": "application/json", "x-goog-api-key": key, ...init.headers } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error?.message || `Gemini returned HTTP ${r.status}`);
  return d;
}

export async function listModels(key) {
  const d = await call("/models?pageSize=200", key);
  return d.models
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent") && /gemini/.test(m.name) && !/embed|tts|image|audio|live|vision/.test(m.name))
    .map((m) => m.name.replace("models/", ""))
    .sort()
    .reverse();
}

const SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    summary: { type: "STRING" },
    steps: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          tool: { type: "STRING" },
          why: { type: "STRING" },
          prompts: {
            type: "ARRAY",
            items: { type: "OBJECT", properties: { label: { type: "STRING" }, text: { type: "STRING" } }, required: ["label", "text"] },
          },
          tips: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["title", "tool", "why", "prompts"],
      },
    },
  },
  required: ["title", "summary", "steps"],
};

export async function generatePlan(key, model, { system, user }) {
  if (!/^[\w.-]+$/.test(model)) throw new Error("Invalid model name");
  const d = await call(`/models/${model}:generateContent`, key, {
    method: "POST",
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.8 },
    }),
  });
  const text = (d.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || "").join("");
  if (!text) throw new Error(d.promptFeedback?.blockReason ? `Blocked (${d.promptFeedback.blockReason})` : "Empty response, try again.");
  return JSON.parse(text);
}
