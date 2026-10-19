"use client";
import { useState, type ReactNode } from "react";

// `text` may be a function so callers can validate/compute lazily; returning null cancels the copy.
type Props = { text: string | (() => string | null); className?: string; children?: ReactNode; doneLabel?: ReactNode };

export default function CopyButton({ text, className = "copy", children = "Copy", doneLabel = "Copied" }: Props) {
  const [done, setDone] = useState(false);
  async function copy() {
    const value = typeof text === "function" ? text() : text;
    if (value == null) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value });
      document.body.append(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1200);
  }
  return (
    <button type="button" className={`${className}${done ? " done" : ""}`} onClick={copy}>
      {done ? doneLabel : children}
    </button>
  );
}
