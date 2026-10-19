"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import CopyButton from "./CopyButton";
import { authHeaders, openKeyDialog, useGeminiKey } from "@/lib/geminiKey";
import { ASPECTS, type TryResult } from "@/lib/gemini";
import { saveRun } from "@/lib/runs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type TryMode = "text" | "image";

export const Highlight = ({ text }: { text: string }) =>
  text
    .split(/(\{[^}]+\})/)
    .map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : p));

// ponytail: keyword heuristic; prompts that read as instructions to an assistant run as text, everything else renders an image.
const TEXT_START =
  /^(i\b|i'|act as|write|using my|create a|show me|install|\/|make|plan|break|give me|list)/i;
export const guessMode = (text: string): TryMode =>
  TEXT_START.test(text.trim()) ? "text" : "image";
type RefImage = { mimeType: string; data: string; url: string };

async function fileToRef(file: File): Promise<RefImage> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type))
    throw new Error("Use a PNG, JPEG, or WebP");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bmp.width * scale));
  canvas.height = Math.max(1, Math.round(bmp.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image");
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not read that image"))),
      "image/jpeg",
      0.85,
    ),
  );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const data = btoa(bin);
  return {
    mimeType: "image/jpeg",
    data,
    url: `data:image/jpeg;base64,${data}`,
  };
}

const MAX_REFS = 4;

// Highest <<<image_N>>> / image_N the prompt names, capped at what the API accepts.
function refSlotCount(draft: string) {
  let max = 0;
  for (const m of draft.matchAll(/<<<image_(\d+)(?:\.\.(\d+))?>>>/gi))
    max = Math.max(max, Number(m[2] || m[1]));
  for (const m of draft.matchAll(/\bimage[ _](\d+)\b/gi))
    max = Math.max(max, Number(m[1]));
  return Math.min(MAX_REFS, max);
}

const namesRefs = (draft: string) =>
  refSlotCount(draft) > 0 || /attached reference/i.test(draft);

// Slots are positional: image_1 is refs[0]. A later image with a hole before it would be sent under the wrong number.
function packedRefs(refs: (RefImage | null)[]) {
  const out: RefImage[] = [];
  for (let i = 0; i < refs.length; i++) {
    const img = refs[i];
    if (!img) {
      if (refs.slice(i + 1).some(Boolean))
        throw new Error(`Add image_${i + 1} before the later references.`);
      break;
    }
    out.push(img);
  }
  return out;
}

const guessAspect = (text: string) =>
  /9:16|vertical|selfie/i.test(text)
    ? "9:16"
    : /4:5/.test(text)
      ? "4:5"
      : /1:1|square/i.test(text)
        ? "1:1"
        : "16:9";

type Props = {
  label: string;
  text: string;
  children?: ReactNode;
  tryMode?: TryMode | false;
};

export default function PromptBlock({ label, text, children, tryMode }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const id = useId();
  return (
    <div className="prompt">
      <div className="prompt-head">
        <span>{label}</span>
        <span className="prompt-actions">
          {tryMode !== false && (
            <button
              type="button"
              className="copy ghost"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={id}
              onClick={() => {
                setMounted(true);
                setOpen(true);
              }}
            >
              Try now
            </button>
          )}
          <CopyButton text={text} />
        </span>
      </div>
      <pre>{children ?? <Highlight text={text} />}</pre>
      {mounted && (
        <TrySheet
          id={id}
          label={label}
          text={text}
          initialMode={tryMode || guessMode(text)}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

type SheetProps = {
  id: string;
  label: string;
  text: string;
  initialMode: TryMode;
  open: boolean;
  onClose: () => void;
};

// Stays mounted after the first open so the draft and results survive closing the sheet.
function TrySheet({ id, label, text, initialMode, open, onClose }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const s = useGeminiKey();
  useEffect(() => {
    const d = ref.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);
  const [draft, setDraft] = useState(text);
  const [mode, setMode] = useState(initialMode);
  const [aspect, setAspect] = useState(() => guessAspect(text));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TryResult | null>(null);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [refs, setRefs] = useState<(RefImage | null)[]>([]);
  const [refError, setRefError] = useState("");
  const ready = s.status === "ready";
  const model = mode === "image" ? s.imageModel : s.model;
  const slotCount = refSlotCount(draft);
  const showRefs = mode === "image" || namesRefs(draft) || refs.some(Boolean);

  async function attach(file: File | undefined, index: number) {
    if (!file) return;
    setRefError("");
    try {
      const next = await fileToRef(file);
      setRefs((xs) => {
        const copy = xs.slice();
        copy[index] = next;
        return copy.slice(0, MAX_REFS);
      });
    } catch (err) {
      setRefError((err as Error).message);
    }
  }

  async function run() {
    if (!ready) return openKeyDialog();
    let packed: RefImage[];
    try {
      packed = packedRefs(refs);
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    setSaved(null);
    const prompt = draft.replace(/\{([^{}]*)\}/g, "$1");
    try {
      const r = await fetch("/api/try", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          mode,
          model,
          aspectRatio: aspect,
          prompt,
          images: packed.map(({ mimeType, data }) => ({ mimeType, data })),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      setResult(d);
      saveRun({
        label,
        prompt,
        mode,
        model,
        aspect: mode === "image" ? aspect : undefined,
        text: d.text,
        images: d.images,
      }).then(
        () => setSaved(true),
        () => setSaved(false),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={ref}
      id={id}
      className="sheet"
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      onKeyDown={(e) => e.key === "Escape" && (e.preventDefault(), onClose())}
    >
      <div className="sheet-head">
        <div>
          <small>Try now</small>
          <h2 id={`${id}-title`}>{label}</h2>
        </div>
        <button
          type="button"
          className="btn"
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
      </div>
      <div className="try">
        <div className="try-bar">
          <div className="seg" role="group" aria-label="Output type">
            {(["text", "image"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
              >
                {m === "text" ? "Text" : "Image"}
              </button>
            ))}
          </div>
          {mode === "image" && (
            <select
              aria-label="Aspect ratio"
              value={aspect}
              onChange={(e) => setAspect(e.target.value)}
            >
              {ASPECTS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            className="try-model"
            onClick={openKeyDialog}
            title="Change key or model"
          >
            {ready ? model || "No model" : "Set up Gemini key"}
          </button>
          <button
            type="button"
            className="btn primary"
            disabled={busy || !draft.trim()}
            onClick={run}
          >
            {busy ? "Running..." : ready ? "Run" : "Add key"}
          </button>
        </div>
        <textarea
          className="try-input"
          aria-label="Prompt to run"
          value={draft}
          rows={Math.min(10, Math.max(3, draft.split("\n").length + 1))}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) =>
            (e.metaKey || e.ctrlKey) && e.key === "Enter" && run()
          }
        />
        {showRefs && (
          <div className="try-refs" aria-label="Reference images">
            {Array.from(
              { length: slotCount || Math.min(MAX_REFS, refs.length + 1) },
              (_, i) => {
                const img = refs[i];
                const named = slotCount > 0;
                if (!named && !img && i !== refs.length) return null;
                if (!named && i >= MAX_REFS) return null;
                return (
                  <div
                    className={named ? "try-ref-slot" : "try-ref-slot wide"}
                    key={i}
                  >
                    {img ? (
                      <figure>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={`Reference image ${i + 1}`} />
                        <button
                          type="button"
                          aria-label={`Remove image_${i + 1}`}
                          onClick={() =>
                            setRefs((xs) => {
                              const copy = xs.slice();
                              copy[i] = null;
                              return named ? copy : copy.filter(Boolean);
                            })
                          }
                        >
                          ×
                        </button>
                      </figure>
                    ) : (
                      <label
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          attach(e.dataTransfer.files?.[0], i);
                        }}
                      >
                        {named ? "Add" : "Add reference"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          aria-label={
                            named
                              ? `Attach image_${i + 1}`
                              : "Attach a reference image"
                          }
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            attach(file, named ? i : refs.length);
                          }}
                        />
                      </label>
                    )}
                    {named && <span>image_{i + 1}</span>}
                  </div>
                );
              },
            )}
          </div>
        )}
        {refError && <p className="note error">{refError}</p>}
        <p className="hint">
          {/\{[^}]*\}/.test(draft) &&
            "Edit the {braced} parts for your idea; braces are removed when you run. "}
          {mode === "image" &&
            /\d+-\d+s|\bcuts?\b|speed ramp/i.test(draft) &&
            "This is a video prompt, so you get a single still: a quick check of look and framing. "}
          Cmd/Ctrl + Enter to run.
        </p>
        <div aria-live="polite">
          {busy && (
            <p className="note">
              {mode === "image"
                ? "Rendering the image. This takes 10-30 seconds."
                : "Waiting for Gemini..."}
            </p>
          )}
          {error && <p className="note error">{error}</p>}
          {result && (
            <div className="try-out">
              {result.images.map((src, i) => (
                <figure key={i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Generated result ${i + 1}`} />
                  <a
                    className="inline"
                    href={src}
                    download={`frame-try-${i + 1}.png`}
                  >
                    Download
                  </a>
                </figure>
              ))}
              {result.text && (
                <div className="try-text">
                  <div className="try-text-head">
                    <span>Output</span>
                    <CopyButton text={result.text} />
                  </div>
                  <div className="try-text-body">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noopener">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {result.text}
                    </Markdown>
                  </div>
                </div>
              )}
            </div>
          )}
          {saved === true && (
            <p className="hint">
              Saved in this browser.{" "}
              <Link href="/runs" className="try-model">
                View saved runs
              </Link>
            </p>
          )}
          {saved === false && (
            <p className="note">
              Couldn't save this run. This browser's storage is full.
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
