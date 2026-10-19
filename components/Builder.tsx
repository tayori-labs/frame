"use client";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { authHeaders, openKeyDialog, statusLabel, useGeminiKey } from "@/lib/geminiKey";
import { DATA } from "@/lib/data";
import { buildBrief, DEFAULT_FORM, FIELDS, validateForm, type Form } from "@/lib/brief";
import type { Plan } from "@/lib/gemini";
import CopyButton from "./CopyButton";
import { List, Model, PromptBlock, StepHead } from "./ui";

const FORM = "vg-builder-form";
const LABELS: Partial<Record<keyof typeof FIELDS, (v: string) => string>> = {
  duration: (v) => `${v} seconds`,
  ratio: (v) => ({ "9:16": "9:16 vertical", "16:9": "16:9 widescreen", "1:1": "1:1 square", "4:5": "4:5 feed" } as Record<string, string>)[v],
};
let lastPlan: Plan | null = null;
const msg = (e: unknown) => (e as Error).message;

export default function Builder() {
  const [form, setForm] = useState<Form>(DEFAULT_FORM);
  const key = useGeminiKey();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(lastPlan);
  const result = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setForm((f) => ({ ...f, ...JSON.parse(localStorage.getItem(FORM) || "{}") }));
  }, []);

  const set = (k: keyof Form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    localStorage.setItem(FORM, JSON.stringify(next));
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
      return setError('Connect a Gemini API key first, or use "Copy brief" to paste the request into any chatbot.');
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
      requestAnimationFrame(() => result.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
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
          <option key={v} value={v}>{v === "" ? "Let AI choose" : LABELS[name]?.(v) || v}</option>
        ))}
      </select>
    </label>
  );

  const allText = (plan?.steps ?? [])
    .map((s, i) => `STEP ${i + 1}: ${s.title} - ${s.tool}\n` + (s.prompts || []).map((x) => `\n[${x.label}]\n${x.text}`).join("\n"))
    .join("\n\n");

  return (
    <>
      <div className="settings key-row">
        <span>
          Gemini <span className={`pill status-${key.status}`}>{statusLabel(key)}</span>
          {key.status === "ready" && <code>{key.model}</code>}
        </span>
        <button type="button" className="btn" onClick={openKeyDialog}>
          {key.status === "ready" ? "Change key or model" : "Set up Gemini key"}
        </button>
      </div>

      <form className="builder" onSubmit={generate} noValidate>
        <fieldset>
          <legend>Video type</legend>
          <div className="chips">
            {DATA.categories.map((c) => (
              <label key={c.id}>
                <input type="radio" name="type" value={c.id} checked={form.type === c.id} onChange={set("type")} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="field">
          <span>Your idea</span>
          <textarea name="idea" rows={4} required value={form.idea} onChange={set("idea")} placeholder="e.g. A street racer is hunted by a police chopper across a neon city and escapes into a tunnel" />
        </label>
        <div className="form-grid">
          {select("duration", "Duration")}
          {select("ratio", "Aspect ratio")}
          {select("audio", "Audio")}
          {select("budget", "Priority")}
        </div>
        <h3>Look (optional)</h3>
        <div className="form-grid">
          {select("camera", "Camera")}
          {select("lens", "Lens")}
          {select("director", "Director / style")}
          {select("lighting", "Lighting")}
        </div>
        <label className="field">
          <span>Characters, products &amp; props (optional)</span>
          <textarea name="assets" rows={3} value={form.assets} onChange={set("assets")} placeholder="e.g. Young man with twist-out hair and a cream hoodie; blacked-out muscle car with red LED light bars" />
        </label>
        <label className="field">
          <span>Notes / must avoid (optional)</span>
          <textarea name="notes" rows={2} value={form.notes} onChange={set("notes")} placeholder="e.g. No on-screen text, keep generation cost low" />
        </label>
        <div className="actions">
          <button type="submit" className="btn primary" disabled={busy}>{busy ? "Generating..." : "Generate prompts"}</button>
          <CopyButton className="btn" text={briefText}>Copy brief</CopyButton>
        </div>
      </form>

      <div ref={result} aria-live="polite">
        {busy && <p className="note">Writing your plan. This usually takes 20-60 seconds.</p>}
        {error && <p className="note error">{error}</p>}
        {plan && !busy && (
          <>
            <div className="plan-head">
              <h2>{plan.title}</h2>
              <CopyButton text={allText}>Copy all</CopyButton>
            </div>
            <p className="lead">{plan.summary}</p>
            {plan.steps.map((s, i) => (
              <section className="step" key={i}>
                <StepHead n={i + 1} title={s.title} />
                <h3>Tool</h3>
                <div className="models"><Model m={[s.tool, s.why]} /></div>
                {s.prompts?.length > 0 && (<><h3>Prompts</h3>{s.prompts.map((x, j) => <PromptBlock key={j} label={x.label} text={x.text} />)}</>)}
                {s.tips && s.tips.length > 0 && (<><h3>Tips</h3><List items={s.tips} className="tips" /></>)}
              </section>
            ))}
          </>
        )}
      </div>
    </>
  );
}
