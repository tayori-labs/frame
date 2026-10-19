"use client";
import { useEffect, useRef, useState } from "react";
import { DATA } from "@/lib/data";
import { buildBrief, DEFAULT_FORM, FIELDS, validateForm } from "@/lib/brief";
import CopyButton from "./CopyButton";
import { List, Model, PromptBlock, StepHead } from "./ui";

const KEY = "vg-gemini-key", MODEL = "vg-gemini-model", FORM = "vg-builder-form";
const DEFAULT_MODEL = "gemini-2.5-flash";
const LABELS = {
  duration: (v) => `${v} seconds`,
  ratio: (v) => ({ "9:16": "9:16 vertical", "16:9": "16:9 widescreen", "1:1": "1:1 square", "4:5": "4:5 feed" })[v],
};
let lastPlan = null;

export default function Builder() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [key, setKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [models, setModels] = useState([]);
  const [status, setStatus] = useState("");
  const [serverKey, setServerKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(lastPlan);
  const settings = useRef(null);
  const result = useRef(null);

  async function loadModels(k) {
    setStatus("Checking...");
    try {
      const r = await fetch("/api/models", { headers: k ? { "x-user-key": k } : {} });
      const d = await r.json();
      setServerKey(d.serverKey);
      if (d.error) throw new Error(d.error);
      if (!d.models.length) return setStatus("Not set"), false;
      const saved = localStorage.getItem(MODEL);
      const pick = d.models.includes(saved) ? saved : d.models.find((n) => /flash/.test(n) && !/lite|preview|exp/.test(n)) || d.models[0];
      setModels(d.models);
      setModel(pick);
      localStorage.setItem(MODEL, pick);
      setStatus(d.serverKey ? "Server key" : "Connected");
      return true;
    } catch (e) {
      setStatus("Key error");
      setError(e.message);
    }
  }

  useEffect(() => {
    const k = localStorage.getItem(KEY) || "";
    setForm((f) => ({ ...f, ...JSON.parse(localStorage.getItem(FORM) || "{}") }));
    setKey(k);
    setModel(localStorage.getItem(MODEL) || DEFAULT_MODEL);
    loadModels(k).then((ok) => {
      if (!ok && settings.current) settings.current.open = true;
    });
  }, []);

  const set = (k) => (e) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    localStorage.setItem(FORM, JSON.stringify(next));
  };

  function saveKey() {
    const k = key.trim();
    localStorage.setItem(KEY, k);
    setError("");
    loadModels(k);
  }

  function briefText() {
    try {
      const { system, user } = buildBrief(validateForm(form));
      setError("");
      return `${system}\n\n---\n\nMY VIDEO:\n${user}`;
    } catch (e) {
      setError(e.message);
      return null;
    }
  }

  async function generate(e) {
    e.preventDefault();
    setError("");
    try {
      validateForm(form);
    } catch (err) {
      return setError(err.message);
    }
    if (!serverKey && !key.trim()) {
      settings.current.open = true;
      return setError('Add your Gemini API key above, or use "Copy brief" to paste the request into any chatbot.');
    }
    setBusy(true);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(key.trim() ? { "x-user-key": key.trim() } : {}) },
        body: JSON.stringify({ form, model }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      lastPlan = d.plan;
      setPlan(d.plan);
      requestAnimationFrame(() => result.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setError(`Could not generate: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  const select = (name, label) => (
    <label className="field">
      <span>{label}</span>
      <select name={name} value={form[name]} onChange={set(name)}>
        {FIELDS[name].map((v) => (
          <option key={v} value={v}>{v === "" ? "Let AI choose" : LABELS[name]?.(v) || v}</option>
        ))}
      </select>
    </label>
  );

  const allText = plan?.steps
    .map((s, i) => `STEP ${i + 1}: ${s.title} - ${s.tool}\n` + (s.prompts || []).map((x) => `\n[${x.label}]\n${x.text}`).join("\n"))
    .join("\n\n");

  return (
    <>
      <details className="settings" ref={settings}>
        <summary>
          Gemini API key {status && <span className="pill">{status}</span>}
        </summary>
        <div className="form-grid">
          <label className="field">
            <span>{serverKey ? "Your own key (optional, used only if the server has none)" : "API key"}</span>
            <input type="password" autoComplete="off" spellCheck={false} placeholder="Paste your key" value={key} onChange={(e) => setKey(e.target.value)} onBlur={saveKey} />
          </label>
          <label className="field">
            <span>Model</span>
            <select value={model} onChange={(e) => { setModel(e.target.value); localStorage.setItem(MODEL, e.target.value); }}>
              {(models.length ? models : [model]).map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <p className="hint">
          {serverKey ? "This site has a Gemini key configured, so you can generate right away. " : ""}
          Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>. Your key is saved only in this browser and
          sent with your requests to Google through this site. No key? Use &quot;Copy brief&quot; and paste it into any chatbot.
        </p>
      </details>

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
                {s.tips?.length > 0 && (<><h3>Tips</h3><List items={s.tips} className="tips" /></>)}
              </section>
            ))}
          </>
        )}
      </div>
    </>
  );
}
