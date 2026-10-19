const API = "https://generativelanguage.googleapis.com/v1beta";
export const DEFAULT_MODEL = "gemini-2.5-flash";
export const DEFAULT_IMAGE_MODEL = "gemini-2.5-flash-image";
export const ASPECTS = ["16:9", "9:16", "1:1", "4:5", "3:2", "2:3"];

export type PlanStep = {
  title: string;
  tool: string;
  why: string;
  prompts: { label: string; text: string }[];
  tips?: string[];
  guideStep?: number;
};
export type Plan = { title: string; summary: string; steps: PlanStep[] };
type Part = {
  text?: string;
  thought?: boolean;
  inlineData?: { mimeType: string; data: string };
};

// Server key wins; a visitor-supplied key is only used when none is configured.
export const resolveKey = (userKey?: string | null) =>
  process.env.GEMINI_API_KEY || (userKey || "").trim();

async function call(path: string, key: string, init: RequestInit = {}) {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
      ...init.headers,
    },
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new Error(d.error?.message || `Gemini returned HTTP ${r.status}`);
  return d;
}

export async function listModels(
  key: string,
): Promise<{ text: string[]; image: string[] }> {
  const d = await call("/models?pageSize=200", key);
  const names: string[] = d.models
    .filter(
      (m: { name: string; supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        /gemini/.test(m.name) &&
        !/embed|tts|audio|live|vision/.test(m.name),
    )
    .map((m: { name: string }) => m.name.replace("models/", ""))
    .sort()
    .reverse();
  return {
    text: names.filter((n) => !/image/.test(n)),
    image: names.filter((n) => /image/.test(n)),
  };
}

async function generate(
  key: string,
  model: string,
  body: object,
): Promise<Part[]> {
  if (!/^[\w.-]+$/.test(model)) throw new Error("Invalid model name");
  const d = await call(`/models/${model}:generateContent`, key, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const parts: Part[] = (d.candidates?.[0]?.content?.parts || []).filter(
    (p: Part) => !p.thought,
  );
  if (!parts.length) {
    const reason =
      d.promptFeedback?.blockReason || d.candidates?.[0]?.finishReason;
    throw new Error(
      reason ? `No output (${reason})` : "Empty response, try again.",
    );
  }
  return parts;
}

const textOf = (parts: Part[]) => parts.map((p) => p.text || "").join("");

export type TryResult = { text: string; images: string[] };

// Runs a single guide prompt as-is: text mode answers it, image mode renders it.
export async function tryPrompt(
  key: string,
  input: unknown,
): Promise<TryResult> {
  const { mode, prompt, model, aspectRatio } = (input ?? {}) as Record<
    string,
    unknown
  >;
  if (mode !== "text" && mode !== "image") throw new Error("Invalid mode");
  if (typeof prompt !== "string" || !prompt.trim())
    throw new Error("Write a prompt first");
  if (prompt.length > 10000)
    throw new Error("Prompt is too long (max 10000 characters)");
  const image = mode === "image";
  if (image && !ASPECTS.includes(aspectRatio as string))
    throw new Error("Invalid aspect ratio");
  const parts = await generate(
    key,
    typeof model === "string" && model
      ? model
      : image
        ? DEFAULT_IMAGE_MODEL
        : DEFAULT_MODEL,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: image
        ? {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: { aspectRatio },
          }
        : { temperature: 0.8 },
    },
  );
  const images = parts
    .filter((p) => p.inlineData)
    .map((p) => `data:${p.inlineData!.mimeType};base64,${p.inlineData!.data}`);
  if (image && !images.length)
    throw new Error(
      textOf(parts) ||
        "The model returned no image. Try rephrasing the prompt.",
    );
  return { text: textOf(parts), images };
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
            items: {
              type: "OBJECT",
              properties: {
                label: { type: "STRING" },
                text: { type: "STRING" },
              },
              required: ["label", "text"],
            },
          },
          tips: { type: "ARRAY", items: { type: "STRING" } },
          guideStep: { type: "INTEGER" },
        },
        required: ["title", "tool", "why", "prompts", "guideStep"],
      },
    },
  },
  required: ["title", "summary", "steps"],
};

export async function generatePlan(
  key: string,
  model: string,
  { system, user }: { system: string; user: string },
): Promise<Plan> {
  const parts = await generate(key, model, {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: SCHEMA,
      temperature: 0.8,
    },
  });
  return JSON.parse(textOf(parts));
}
