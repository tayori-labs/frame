"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "./CopyButton";
import { openKeyDialog, useGeminiKey } from "@/lib/geminiKey";
import {
  RUN_MODE,
  clearRuns,
  deleteRun,
  formatRunTime,
  loadFirstImage,
  loadRun,
  planFromText,
  rerun,
  useRuns,
  type Run,
  type RunMeta,
} from "@/lib/runs";
import PlanView from "./PlanView";

const promptLine = (prompt: string) => prompt.replace(/\s+/g, " ").trim();

function Thumb({ id, label }: { id: string; label: string }) {
  const [src, setSrc] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadFirstImage(id).then((s) => live && setSrc(s));
    return () => {
      live = false;
    };
  }, [id]);
  if (!src)
    return (
      <p>
        {src === undefined
          ? "Loading preview..."
          : "No image was saved for this run."}
      </p>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`${label} preview`} />;
}

function useRetry() {
  const key = useGeminiKey();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function retry(id: string): Promise<string | null> {
    if (key.status !== "ready") {
      openKeyDialog();
      setErrors((e) => ({ ...e, [id]: "Add a Gemini key to retry." }));
      return null;
    }
    setBusyId(id);
    setErrors((e) => ({ ...e, [id]: "" }));
    try {
      return await rerun(id);
    } catch (err) {
      setErrors((e) => ({ ...e, [id]: (err as Error).message }));
      return null;
    } finally {
      setBusyId(null);
    }
  }

  return { busyId, errors, retry };
}

export function RunsIndex() {
  const runs = useRuns();
  const { busyId, errors, retry } = useRetry();

  return (
    <>
      <header className="runs-head">
        <h1>Saved runs</h1>
        <p className="lead">
          Results from Try now and the prompt builder, kept in this browser.
        </p>
      </header>
      {runs.length > 0 && (
        <div className="runs-bar">
          <span>{runs.length} saved</span>
          <button
            type="button"
            className="btn"
            onClick={() =>
              confirm("Delete every saved run in this browser?") && clearRuns()
            }
          >
            Clear all
          </button>
        </div>
      )}
      {!runs.length && (
        <p className="hint">
          Nothing saved yet. Run a prompt with Try now, or generate a plan, and
          it will show up here.
        </p>
      )}
      <div className="run-grid">
        {runs.map((r) => (
          <RunCard
            key={r.id}
            run={r}
            busy={busyId === r.id}
            error={errors[r.id]}
            onRetry={() => retry(r.id)}
            onDelete={() => confirm("Delete this run?") && deleteRun(r.id)}
          />
        ))}
      </div>
    </>
  );
}

function RunCard({
  run,
  busy,
  error,
  onRetry,
  onDelete,
}: {
  run: RunMeta;
  busy: boolean;
  error?: string;
  onRetry: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!menu.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <article className="run-card">
      <Link className="run-card-link" href={`/runs/${run.id}`}>
        <div className="run-preview">
          {run.mode === "image" ? (
            <Thumb id={run.id} label={run.label} />
          ) : (
            <p>{run.excerpt || promptLine(run.prompt)}</p>
          )}
        </div>
        <div className="run-card-body">
          <h2>{run.label}</h2>
          <small>
            {formatRunTime(run.at)} | {RUN_MODE[run.mode]}
            {run.aspect ? ` | ${run.aspect}` : ""}
          </small>
          <span>{promptLine(run.prompt)}</span>
        </div>
      </Link>
      <div className="run-menu" ref={menu} data-open={open || undefined}>
        <button
          type="button"
          className="run-menu-btn"
          aria-label="Run actions"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M2 4h12M2 8h12M2 12h12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {open && (
          <div className="run-menu-pop" role="menu">
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                onRetry();
              }}
            >
              {busy ? "Retrying..." : "Retry prompt"}
            </button>
            <button
              type="button"
              role="menuitem"
              className="danger"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {error && <p className="note error">{error}</p>}
    </article>
  );
}

export function RunDetail({ id }: { id: string }) {
  const router = useRouter();
  const { busyId, errors, retry } = useRetry();
  const [run, setRun] = useState<Run | null | undefined>(undefined);

  useEffect(() => {
    let live = true;
    setRun(undefined);
    loadRun(id).then((r) => live && setRun(r ?? null));
    return () => {
      live = false;
    };
  }, [id]);

  async function onRetry() {
    const next = await retry(id);
    if (next) router.push(`/runs/${next}`);
  }

  async function onDelete() {
    if (!confirm("Delete this run?")) return;
    await deleteRun(id);
    router.push("/runs");
  }

  const plan =
    run && run.mode === "plan" ? run.plan || planFromText(run.text) : null;

  if (run === undefined) return <p className="hint">Loading...</p>;
  if (!run) {
    return (
      <>
        <h1>Saved run</h1>
        <p className="hint">This run is no longer saved.</p>
        <Link className="btn" href="/runs">
          Back to saved runs
        </Link>
      </>
    );
  }

  return (
    <article className="run-detail">
      <p className="run-meta">
        <Link href="/runs">Saved runs</Link>
      </p>
      <h1>{run.label}</h1>
      <p className="run-meta">
        {formatRunTime(run.at)} | {RUN_MODE[run.mode]}
        {run.aspect ? ` | ${run.aspect}` : ""} | {run.model || "unknown model"}
      </p>
      {run.images.map((src, i) => (
        <figure key={i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`${run.label} result ${i + 1}`} />
          <a
            className="inline"
            href={src}
            download={`frame-${run.id}-${i + 1}.png`}
          >
            Download
          </a>
        </figure>
      ))}
      <div className="run-actions">
        <button
          type="button"
          className="btn primary"
          disabled={busyId === id}
          onClick={onRetry}
        >
          {busyId === id ? "Retrying..." : "Retry"}
        </button>
        {run.text && <CopyButton text={run.text} />}
        <button type="button" className="btn" onClick={onDelete}>
          Delete
        </button>
      </div>
      {errors[id] && <p className="note error">{errors[id]}</p>}
      {plan ? (
        <PlanView plan={plan} type={run.form?.type} />
      ) : run.text ? (
        <div className="try-text">
          <div className="try-text-head">
            <span>Output</span>
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
              {run.text}
            </Markdown>
          </div>
        </div>
      ) : null}
      {run.prompt && (
        <details>
          <summary>Prompt used</summary>
          <pre>{run.prompt}</pre>
        </details>
      )}
    </article>
  );
}
