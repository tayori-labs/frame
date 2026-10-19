"use client";
import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { openKeyDialog, statusLabel, useGeminiKey } from "@/lib/geminiKey";
import { useRuns } from "@/lib/runs";

const REFS = [
  ["/models", "Model directory"],
  ["/vocab", "Prompt vocabulary"],
  ["/templates", "Templates"],
  ["/finishing", "Finishing (Topaz)"],
];

export type NavWorkflow = { id: string; name: string; steps: string[] };

export default function Sidebar({ workflows }: { workflows: NavWorkflow[] }) {
  const path = usePathname();
  const key = useGeminiKey();
  const runs = useRuns();
  const [hash, setHash] = useState("");
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [path]);
  const cur = (href: string) => (path === href ? "page" : undefined);

  return (
    <nav aria-label="Guide sections">
      <Link href="/" className="brand">
        <Image src="/frame-mark.png" width={36} height={36} alt="" priority />
        <span>
          <b>Frame</b>
          <small>Ideas into every frame</small>
        </span>
      </Link>
      <Link href="/" aria-current={cur("/")}>
        Start here
      </Link>
      <Link href="/builder" className="nav-cta" aria-current={cur("/builder")}>
        Prompt builder<span className="nav-badge">AI</span>
      </Link>
      <Link href="/skill" aria-current={cur("/skill")}>
        Agent skill
      </Link>
      <button type="button" className="nav-key" onClick={openKeyDialog}>
        Gemini key
        <span className={`dot status-${key.status}`} aria-hidden="true" />
        <span className="nav-key-status">{statusLabel(key)}</span>
      </button>
      <Link
        href="/runs"
        aria-current={path.startsWith("/runs") ? "page" : undefined}
      >
        Saved runs
        {runs.length > 0 && (
          <span className="nav-key-status">{runs.length}</span>
        )}
      </Link>

      <div className="nav-label">Workflows</div>
      {workflows.map((w, i) => {
        const href = `/workflows/${w.id}`;
        return (
          <Fragment key={w.id}>
            <Link href={href} aria-current={cur(href)}>
              <span className="nav-num">{String(i + 1).padStart(2, "0")}</span>
              {w.name}
            </Link>
            {path === href && (
              <div className="nav-sub">
                {w.steps.map((t, j) => (
                  <a
                    key={t}
                    href={`#step-${j + 1}`}
                    aria-current={
                      hash === `#step-${j + 1}` ? "step" : undefined
                    }
                  >
                    {t}
                  </a>
                ))}
              </div>
            )}
          </Fragment>
        );
      })}

      <div className="nav-label">Reference</div>
      {REFS.map(([href, name]) => (
        <Link key={href} href={href} aria-current={cur(href)}>
          {name}
        </Link>
      ))}
    </nav>
  );
}
