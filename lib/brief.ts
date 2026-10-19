import { DATA } from "./data";

export const FIELDS = {
  type: DATA.categories.map((c) => c.id),
  duration: ["5", "10", "15", "30", "60"],
  ratio: ["9:16", "16:9", "1:1", "4:5"],
  audio: [
    "SFX only, music added in edit",
    "Dialogue / talking to camera",
    "Voice-over + SFX",
    "No audio",
  ],
  budget: ["Best quality", "Balanced", "Lowest cost"],
  camera: ["", ...DATA.vocab.camera.map(([t]) => t)],
  lens: ["", ...DATA.vocab.lens.map(([t]) => t)],
  director: ["", ...DATA.vocab.director.map(([t]) => t)],
  lighting: ["", ...DATA.vocab.lighting.map(([t]) => t)],
  showcase: [
    "",
    "AI physical product",
    "Own recording at the start",
    "Own recording in the middle",
    "Own recording at the end",
  ],
};
const TEXT_LIMITS = { idea: 2000, assets: 1500, notes: 1000 };
export type Form = Record<
  keyof typeof FIELDS | keyof typeof TEXT_LIMITS,
  string
>;

export const DEFAULT_FORM = Object.fromEntries([
  ...Object.entries(FIELDS).map(([k, v]) => [
    k,
    k === "duration" ? "15" : v[0],
  ]),
  ...Object.keys(TEXT_LIMITS).map((k) => [k, ""]),
]) as Form;

// Returns a clean form object or throws with a user-facing message.
export function validateForm(input: unknown): Form {
  const src = (input ?? {}) as Record<string, unknown>;
  const f = {} as Form;
  for (const [k, allowed] of Object.entries(FIELDS) as [
    keyof typeof FIELDS,
    string[],
  ][]) {
    const v = String(src[k] ?? "");
    if (!allowed.includes(v)) throw new Error(`Invalid value for ${k}`);
    f[k] = v;
  }
  for (const [k, max] of Object.entries(TEXT_LIMITS) as [
    keyof typeof TEXT_LIMITS,
    number,
  ][]) {
    const v = String(src[k] ?? "").trim();
    if (v.length > max)
      throw new Error(`${k} is too long (max ${max} characters)`);
    f[k] = v;
  }
  if (!f.idea) throw new Error("Describe your idea first");
  return f;
}

const words = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);

// Which guide step a generated plan step came from. guideStep wins; otherwise the closest title.
export function guideTarget(
  type: string,
  step: { title: string; guideStep?: number },
) {
  const c = DATA.categories.find((x) => x.id === type);
  if (!c) return { href: "/workflows", label: "Open the guide" };
  const n = Number(step.guideStep);
  let index = Number.isInteger(n) && n >= 1 && n <= c.steps.length ? n - 1 : -1;
  if (index < 0) {
    const tw = words(step.title);
    let best = -1;
    let score = 0;
    c.steps.forEach((s, i) => {
      const shared = words(s.title).filter((w) => tw.includes(w)).length;
      if (shared > score) {
        score = shared;
        best = i;
      }
    });
    index = best;
  }
  return {
    href:
      index >= 0
        ? `/workflows/${c.id}#step-${index + 1}`
        : `/workflows/${c.id}`,
    label: index >= 0 ? c.steps[index].title : c.name,
  };
}

export function buildBrief(f: Form) {
  const c = DATA.categories.find((x) => x.id === f.type)!;
  const m = DATA.models;
  const list = (rows: string[][]) =>
    rows
      .map(([n, w, cost]) => `- ${n}: ${w}${cost ? ` (${cost})` : ""}`)
      .join("\n");
  const tools = (xs: [string, string][]) =>
    xs.map(([n, w]) => `${n} (${w})`).join("; ");
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
- Set guideStep to the 1-based STEP number in the reference workflow this step is adapted from. If you merge steps, use the earliest one.
- Each step names one primary tool from the lists above and says in one sentence why.
- Write every prompt in full, specific to the idea, ready to paste. No {placeholders}. Refer to uploads as <<<image_N>>> with a one-line description of what that image is.
- Image prompts use the look formula (camera, lens, director / style, shot, subject, lighting, palette + mood). Use the character / prop sheet templates for anything that must stay consistent.
- Video prompts use the 5-block structure (or the CUT format from the examples) with timecoded beats. One generation is at most 15 seconds, so split longer videos into numbered generation prompts that together cover the full duration.
- Respect the duration, aspect ratio, audio rule and priority (quality vs cost) when choosing models and writing prompts.
- If the user sets a product showcase, follow it. A physical product is generated in frame. A recording is the user's own footage, never generated. A recording in the middle means two talking-head generations and an edit step that stitches that footage between them.
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
    showcaseNote(f),
  ]
    .filter(Boolean)
    .join("\n");
  return { system, user };
}

function showcaseNote(f: Form) {
  if (f.type !== "ugc" || !f.showcase) return "";
  if (f.showcase === "AI physical product")
    return "Product showcase: a physical product, generated in the video and held by the creator. Do not ask for a screen recording and do not split the script.";
  if (f.showcase === "Own recording at the start")
    return "Product showcase: a digital product. The user supplies their own product recording and it plays FIRST. Do not generate the product UI. Write one talking-head generation that starts after the recording, plus an edit step that places the recording in front of it.";
  if (f.showcase === "Own recording in the middle")
    return "Product showcase: a digital product. The user supplies their own product recording and it sits in the MIDDLE. Do not generate the product UI. Write the talk as two generations that will be stitched around that recording: part 1 is the hook and problem and ends by handing off to the demo; part 2 is the reaction and CTA and starts after the demo. Add an edit step that stitches part 1, then the user's recording, then part 2.";
  return "Product showcase: a digital product. The user supplies their own product recording and it plays LAST. Do not generate the product UI. Write one talking-head generation, plus an edit step that appends the recording after it.";
}

{
  const base = { ...DEFAULT_FORM, type: "ugc" };
  const mid = showcaseNote({
    ...base,
    showcase: "Own recording in the middle",
  });
  if (
    !mid.includes("two generations") ||
    !mid.includes("part 1") ||
    showcaseNote({
      ...base,
      type: "film",
      showcase: "Own recording in the middle",
    }) ||
    showcaseNote(base)
  ) {
    throw new Error("showcase note");
  }
}
