"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { onOpenKeyDialog, saveKey, setModel, statusLabel, useGeminiKey } from "@/lib/geminiKey";

export default function KeyDialog() {
  const s = useGeminiKey();
  const ref = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState("");

  useEffect(
    () =>
      onOpenKeyDialog(() => {
        setDraft(s.key);
        ref.current?.showModal();
      }),
    [s.key],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    await saveKey(draft);
  }

  const modelSelect = (kind: "text" | "image", label: string, list: string[], value: string) => (
    <label className="field">
      <span>{label}</span>
      <select value={value} disabled={!list.length} onChange={(e) => setModel(kind, e.target.value)}>
        {list.length ? list.map((n) => <option key={n} value={n}>{n}</option>) : <option>Connect a key first</option>}
      </select>
    </label>
  );

  return (
    <dialog ref={ref} className="key-dialog" aria-labelledby="key-title" onClick={(e) => e.target === ref.current && ref.current?.close()}>
      <form onSubmit={submit}>
        <div className="key-head">
          <h2 id="key-title">Gemini API key</h2>
          <span className={`pill status-${s.status}`}>{statusLabel(s)}</span>
        </div>
        <p className="hint">
          Powers the prompt builder and every Try now window. Get a free key from{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>. It is saved only in this browser and sent with your requests to
          Google through this site. Image generation may need billing enabled on your Google project.
        </p>
        {s.serverKey && <p className="hint">This site already has a key configured, so you can run prompts without adding your own.</p>}
        <label className="field">
          <span>API key</span>
          <input type="password" autoFocus autoComplete="off" spellCheck={false} placeholder="Paste your key" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        {s.status === "error" && <p className="note error">{s.error}</p>}
        <div className="actions">
          <button type="submit" className="btn primary" disabled={s.status === "checking"}>
            {s.status === "checking" ? "Checking..." : "Save & connect"}
          </button>
          {s.key && (
            <button type="button" className="btn" onClick={() => { setDraft(""); saveKey(""); }}>
              Remove key
            </button>
          )}
          <button type="button" className="btn" onClick={() => ref.current?.close()}>
            Done
          </button>
        </div>
        <div className="form-grid">
          {modelSelect("text", "Text model", s.models, s.model)}
          {modelSelect("image", "Image model", s.imageModels, s.imageModel)}
        </div>
      </form>
    </dialog>
  );
}
