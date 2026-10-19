"use client";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { authHeaders, openKeyDialog, useGeminiKey } from "@/lib/geminiKey";
import { DATA } from "@/lib/data";
import {
  buildBrief,
  DEFAULT_FORM,
  FIELDS,
  validateForm,
  type Form,
} from "@/lib/brief";
import type { Plan } from "@/lib/gemini";
import { planText, saveRun } from "@/lib/runs";
import CopyButton from "./CopyButton";
import PlanView from "./PlanView";

const FORM = "vg-builder-form";
const LABELS: Partial<Record<keyof typeof FIELDS, (v: string) => string>> = {
  duration: (v) => `${v} seconds`,
  ratio: (v) =>
    (
      ({
        "9:16": "9:16 vertical",
        "16:9": "16:9 widescreen",
        "1:1": "1:1 square",
        "4:5": "4:5 feed",
      }) as Record<string, string>
    )[v],
  audio: (v) =>
    (
      ({
        "SFX only, music added in edit": "SFX only",
        "Dialogue / talking to camera": "Dialogue to camera",
      }) as Record<string, string>
    )[v],
};
const ADVANCED: (keyof Form)[] = [
  "budget",
  "camera",
  "lens",
  "director",
  "lighting",
  "assets",
  "notes",
];
const SHOWCASE: [string, string][] = [
  ["", "No preference"],
  ["AI physical product", "AI physical product"],
  ["Own recording at the start", "Your recording first"],
  ["Own recording in the middle", "Your recording in the middle"],
  ["Own recording at the end", "Your recording last"],
];
const advancedOpen = (f: Form) =>
  ADVANCED.some((k) => f[k] !== DEFAULT_FORM[k]);

let lastPlan: Plan | null = null;

const EXAMPLES: { name: string; form: Form }[] = [
  {
    name: "Neon chase",
    form: {
      ...DEFAULT_FORM,
      type: "stylized",
      duration: "30",
      ratio: "16:9",
      audio: "SFX only, music added in edit",
      budget: "Best quality",
      camera: "shot on ARRI Alexa 65",
      lens: "anamorphic lens",
      director: "in the style of Wong Kar-wai",
      lighting: "volumetric lighting",
      idea: "A 30-second stylized animated short in an Arcane x Spider-Verse look. A lone street racer waits in a parked muscle car on a neon bridge, a police chopper finds him, and he tears through the city canyons until he escapes into a tunnel.",
      assets:
        "Young Black man, short twist-out hair with a high fade, white wired earbud, fine-line neck tattoos, cream oversized hoodie. Sleek blacked-out muscle car with thin red LED light bars. One dark red and black police helicopter with a white searchlight. Neon-noir skyline at night, cyan and magenta signage, a wide bridge.",
      notes:
        "One single helicopter only. No dialogue. No on-screen text. No music in the generation. Reuse the last frame of each clip for the next.",
    },
  },
  {
    name: "Rain confrontation",
    form: {
      ...DEFAULT_FORM,
      type: "film",
      duration: "15",
      ratio: "16:9",
      audio: "SFX only, music added in edit",
      budget: "Best quality",
      camera: "shot on ARRI Alexa 35",
      lens: "anamorphic lens",
      director: "in the style of Denis Villeneuve",
      lighting: "low key lighting",
      idea: "A 15-second live-action scene. Under a concrete overpass at night, in heavy rain, a woman in a soaked wool coat waits with a sealed envelope. A black sedan arrives. A man steps out, they exchange the envelope without a word, and the sedan pulls away, leaving her alone in the rain.",
      assets:
        "Woman, early 30s, dark hair plastered by rain, long charcoal wool coat, no umbrella. Man in a black suit, face half in shadow. Black sedan with one headlight out. Sealed kraft envelope. Wet concrete, sodium streetlight, rain streaks.",
      notes:
        "No dialogue. No music. Practical rain only, no studio look. Hold on her face after the car leaves.",
    },
  },
  {
    name: "Morning serum",
    form: {
      ...DEFAULT_FORM,
      type: "ugc",
      duration: "15",
      ratio: "9:16",
      audio: "Dialogue / talking to camera",
      budget: "Lowest cost",
      camera: "shot on iPhone 15 Pro",
      lens: "35mm lens",
      director: "in the style of Greta Gerwig",
      lighting: "soft light",
      idea: "A 15-second vertical talking-to-camera clip. A creator in a small bright bathroom holds up a frosted glass serum bottle, dots it on her cheek, and tells the camera it replaced three steps in her morning routine. She smiles at the result in the mirror and the clip ends on the bottle in her hand.",
      assets:
        "Woman, mid 20s, hair in a loose clip, plain white t-shirt, no makeup yet. Frosted glass dropper bottle with a blank cream label, pale gold liquid. Small bathroom mirror, daylight from a window, a plant on the sill.",
      notes:
        "Casual speech, not an ad read. No other brand logos. No on-screen captions. Keep the bottle label blank.",
      showcase: "AI physical product",
    },
  },
  {
    name: "Espresso pour",
    form: {
      ...DEFAULT_FORM,
      type: "product",
      duration: "10",
      ratio: "1:1",
      audio: "SFX only, music added in edit",
      budget: "Balanced",
      camera: "shot on RED V-Raptor",
      lens: "macro lens, extreme close-up",
      director: "shot by Roger Deakins",
      lighting: "hard light",
      idea: "A 10-second product spot. A single espresso pours in a slow ribbon into a small ceramic cup. The crema settles. The camera rises to a hero view of the cup on dark stone, steam catching a hard side light. No hands, no machine, just the pour and the finished cup.",
      assets:
        "Small matte charcoal ceramic cup. Dark espresso with thick crema. Wet dark stone surface. A thin wisp of steam. No logo, no saucer, no spoon.",
      notes:
        "No hands. No on-screen text. No brand marks. One cup only. Sound is only the pour and a faint cup tap.",
    },
  },
];
const msg = (e: unknown) => (e as Error).message;
const saveForm = (next: Form) =>
  localStorage.setItem(FORM, JSON.stringify(next));

export default function Builder() {
  const [form, setForm] = useState<Form>(DEFAULT_FORM);
  const key = useGeminiKey();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(lastPlan);
  const [moreOpen, setMoreOpen] = useState(false);
  const [undo, setUndo] = useState<{ form: Form; more: boolean } | null>(null);
  const result = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next: Form = {
      ...DEFAULT_FORM,
      ...JSON.parse(localStorage.getItem(FORM) || "{}"),
    };
    setForm(next);
    setMoreOpen(advancedOpen(next));
  }, []);

  function clearForm() {
    setUndo({ form: { ...form }, more: moreOpen });
    setForm(DEFAULT_FORM);
    saveForm(DEFAULT_FORM);
    setMoreOpen(false);
    setError("");
  }

  function undoClear() {
    if (!undo) return;
    setForm(undo.form);
    saveForm(undo.form);
    setMoreOpen(undo.more);
    setUndo(null);
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(DEFAULT_FORM);

  function applyExample(next: Form) {
    setForm(next);
    saveForm(next);
    setMoreOpen(true);
    setUndo(null);
    setError("");
  }

  const set =
    (k: keyof Form) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const next = { ...form, [k]: e.target.value };
      setForm(next);
      saveForm(next);
      setUndo(null);
    };

  function briefText() {
    try {
      const { system, user } = buildBrief(validateForm(form));
      setError("");
      return `${system}\n\n---\n\nMY VIDEO:\n${user}`;
    } catch (e) {
      setError(msg(e));
      return null;
    }
  }

  async function generate(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      validateForm(form);
    } catch (err) {
      return setError(msg(err));
    }
    if (key.status !== "ready") {
      openKeyDialog();
      return setError(
        'Connect a Gemini API key first, or use "Copy brief" to paste the request into any chatbot.',
      );
    }
    setBusy(true);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ form, model: key.model }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      lastPlan = d.plan;
      setPlan(d.plan);
      saveRun({
        label: d.plan.title,
        prompt: form.idea,
        mode: "plan",
        model: key.model,
        text: planText(d.plan),
        images: [],
        form,
        plan: d.plan,
      }).catch(() =>
        setError(
          "The plan is shown, but it couldn't be saved. This browser's storage is full.",
        ),
      );
      if (window.matchMedia("(max-width: 1239px)").matches) {
        requestAnimationFrame(() =>
          result.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        );
      }
    } catch (err) {
      setError(`Could not generate: ${msg(err)}`);
    } finally {
      setBusy(false);
    }
  }

  const select = (name: keyof typeof FIELDS, label: string) => (
    <label className="field">
      <span>{label}</span>
      <select name={name} value={form[name]} onChange={set(name)}>
        {FIELDS[name].map((v) => (
          <option key={v} value={v}>
            {v === "" ? "Let AI choose" : LABELS[name]?.(v) || v}
          </option>
        ))}
      </select>
    </label>
  );

  const allText = (plan?.steps ?? [])
    .map(
      (s, i) =>
        `STEP ${i + 1}: ${s.title} - ${s.tool}\n` +
        (s.prompts || []).map((x) => `\n[${x.label}]\n${x.text}`).join("\n"),
    )
    .join("\n\n");

  const needsKey = key.status === "missing" || key.status === "error";

  return (
    <div className="builder-layout">
      <form className="builder" onSubmit={generate} noValidate>
        <fieldset>
          <legend>Video type</legend>
          <div className="chips">
            {DATA.categories.map((c) => (
              <label key={c.id}>
                <input
                  type="radio"
                  name="type"
                  value={c.id}
                  checked={form.type === c.id}
                  onChange={set("type")}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {form.type === "ugc" && (
          <label className="field">
            <span>Product showcase</span>
            <select
              name="showcase"
              value={form.showcase}
              onChange={set("showcase")}
              aria-describedby={
                form.showcase === "Own recording in the middle"
                  ? "showcase-hint"
                  : undefined
              }
            >
              {SHOWCASE.map(([v, label]) => (
                <option key={v || "none"} value={v}>
                  {label}
                </option>
              ))}
            </select>
            {form.showcase === "Own recording in the middle" && (
              <p className="hint" id="showcase-hint">
                Your recording sits in the middle, and the talk is written as
                two parts stitched around the demo.
              </p>
            )}
          </label>
        )}
        <div className="field">
          <div className="idea-head">
            <label htmlFor="idea">Your idea</label>
            <div
              className="example-chips"
              role="group"
              aria-labelledby="example-label"
            >
              <span id="example-label">Try an example</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.name}
                  type="button"
                  title={ex.form.idea}
                  aria-pressed={form.idea === ex.form.idea}
                  onClick={() => applyExample(ex.form)}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="idea"
            name="idea"
            rows={4}
            required
            value={form.idea}
            onChange={set("idea")}
            placeholder="e.g. A street racer is hunted by a police chopper across a neon city and escapes into a tunnel"
          />
        </div>
        <div className="primary-fields">
          {select("duration", "Duration")}
          {select("ratio", "Aspect ratio")}
          {select("audio", "Audio")}
        </div>
        <details
          className="more"
          open={moreOpen}
          onToggle={(e) => setMoreOpen(e.currentTarget.open)}
        >
          <summary>More options</summary>
          <div className="more-body">
            <div className="form-grid">
              {select("budget", "Priority")}
              {select("camera", "Camera")}
              {select("lens", "Lens")}
              {select("director", "Director / style")}
              {select("lighting", "Lighting")}
            </div>
            <label className="field">
              <span>Characters, products &amp; props</span>
              <textarea
                name="assets"
                rows={3}
                value={form.assets}
                onChange={set("assets")}
                placeholder="e.g. Young man with twist-out hair and a cream hoodie; blacked-out muscle car with red LED light bars"
              />
            </label>
            <label className="field">
              <span>Notes / must avoid</span>
              <textarea
                name="notes"
                rows={2}
                value={form.notes}
                onChange={set("notes")}
                placeholder="e.g. No on-screen text, keep generation cost low"
              />
            </label>
          </div>
        </details>
        <div className="form-foot">
          {error && (
            <p className="note error" role="alert">
              {error}
            </p>
          )}
          <div className="actions">
            <button type="submit" className="btn primary" disabled={busy}>
              {busy ? "Generating..." : "Generate prompts"}
            </button>
            <CopyButton className="btn ghost" text={briefText}>
              Copy brief
            </CopyButton>
            <button
              type="button"
              className="btn ghost"
              disabled={!dirty}
              onClick={clearForm}
            >
              Clear inputs
            </button>
          </div>
          {undo && (
            <p className="hint">
              Inputs cleared.{" "}
              <button type="button" className="text-btn" onClick={undoClear}>
                Undo
              </button>
            </p>
          )}
          {needsKey && (
            <p className="hint">
              No Gemini key connected.{" "}
              <button
                type="button"
                className="text-btn"
                onClick={openKeyDialog}
              >
                Set up key
              </button>{" "}
              or use Copy brief with any chatbot.
            </p>
          )}
        </div>
      </form>
      <section
        className="result-col"
        ref={result}
        aria-live="polite"
        aria-busy={busy}
      >
        {busy && (
          <p className="note">
            Writing your plan. This usually takes 20-60 seconds.
          </p>
        )}
        {plan && !busy && (
          <>
            <div className="plan-head">
              <h2>{plan.title}</h2>
              <CopyButton text={allText}>Copy all</CopyButton>
            </div>
            <PlanView plan={plan} type={form.type} />
          </>
        )}
        {!plan && !busy && (
          <div className="result-empty">
            <p>Your plan will appear here</p>
            <p className="hint">
              Generate prompts to get a step-by-step plan with copy-ready
              prompts.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
