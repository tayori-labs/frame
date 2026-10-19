import { DATA } from "./data";

export const FIELDS = {
  type: DATA.categories.map((c) => c.id),
  duration: ["5", "10", "15", "30", "60"],
  ratio: ["9:16", "16:9", "1:1", "4:5"],
  audio: ["SFX only, music added in edit", "Dialogue / talking to camera", "Voice-over + SFX", "No audio"],
  budget: ["Best quality", "Balanced", "Lowest cost"],
  camera: ["", ...DATA.vocab.camera.map(([t]) => t)],
  lens: ["", ...DATA.vocab.lens.map(([t]) => t)],
  director: ["", ...DATA.vocab.director.map(([t]) => t)],
  lighting: ["", ...DATA.vocab.lighting.map(([t]) => t)],
};
const TEXT_LIMITS = { idea: 2000, assets: 1500, notes: 1000 };

export const DEFAULT_FORM = Object.fromEntries([
  ...Object.entries(FIELDS).map(([k, v]) => [k, k === "duration" ? "15" : v[0]]),
  ...Object.keys(TEXT_LIMITS).map((k) => [k, ""]),
]);

// Returns a clean form object or throws with a user-facing message.
export function validateForm(input) {
  const f = {};
  for (const [k, allowed] of Object.entries(FIELDS)) {
    const v = String(input?.[k] ?? "");
    if (!allowed.includes(v)) throw new Error(`Invalid value for ${k}`);
    f[k] = v;
  }
  for (const [k, max] of Object.entries(TEXT_LIMITS)) {
    const v = String(input?.[k] ?? "").trim();
    if (v.length > max) throw new Error(`${k} is too long (max ${max} characters)`);
    f[k] = v;
  }
  if (!f.idea) throw new Error("Describe your idea first");
  return f;
}

export function buildBrief(f) {
  const c = DATA.categories.find((x) => x.id === f.type);
  const m = DATA.models;
  const list = (rows) => rows.map(([n, w, cost]) => `- ${n}: ${w}${cost ? ` (${cost})` : ""}`).join("\n");
  const tools = (xs) => xs.map(([n, w]) => `${n} (${w})`).join("; ");
  const steps = c.steps
    .map((s, i) =>
      [
        `STEP ${i + 1}: ${s.title}`,
        s.req.length && `Requirements: ${s.req.join("; ")}`,
        s.models.length && `Models: ${tools(s.models)}`,
        s.alt.length && `Alternatives: ${tools(s.alt)}`,
        s.tips.length && `Tips: ${s.tips.join(" ")}`,
        ...s.prompts.map((p) => `Example prompt (${p.label}):\n${p.text}`),
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  const system = `You are a senior AI video director and prompt engineer. Turn the user's idea into a step-by-step production plan with copy-ready prompts.

GOLDEN RULES
${DATA.rules.map(([t, d]) => `- ${t}: ${d}`).join("\n")}

IMAGE MODELS
${list(m.image)}

VIDEO MODELS
${list(m.video)}

OTHER TOOLS
${list(m.other)}
${list(m.more)}

REFERENCE WORKFLOW: ${c.name} (${c.specs})
${steps}

TEMPLATES
${DATA.templates.map(([l, t]) => `${l}:\n${t}`).join("\n\n")}

HOW TO ANSWER
- Follow the reference workflow in order, adapted to the idea. Merge or skip steps that do not apply; add a step only if the idea needs it.
- Each step names one primary tool from the lists above and says in one sentence why.
- Write every prompt in full, specific to the idea, ready to paste. No {placeholders}. Refer to uploads as <<<image_N>>> with a one-line description of what that image is.
- Image prompts use the look formula (camera, lens, director / style, shot, subject, lighting, palette + mood). Use the character / prop sheet templates for anything that must stay consistent.
- Video prompts use the 5-block structure (or the CUT format from the examples) with timecoded beats. One generation is at most 15 seconds, so split longer videos into numbered generation prompts that together cover the full duration.
- Respect the duration, aspect ratio, audio rule and priority (quality vs cost) when choosing models and writing prompts.
- Tips: short and practical, at most 3 per step.
- Output: a title, a 1-2 sentence summary, then the numbered steps, each with tool, why, prompts and tips.`;

  const user = [
    `Video type: ${c.name}`,
    `Idea: ${f.idea}`,
    `Duration: ${f.duration} seconds`,
    `Aspect ratio: ${f.ratio}`,
    `Audio: ${f.audio}`,
    `Priority: ${f.budget}`,
    f.camera && `Camera: ${f.camera}`,
    f.lens && `Lens: ${f.lens}`,
    f.director && `Director / style: ${f.director}`,
    f.lighting && `Lighting: ${f.lighting}`,
    f.assets && `Characters, products and props: ${f.assets}`,
    f.notes && `Notes / must avoid: ${f.notes}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { system, user };
}
