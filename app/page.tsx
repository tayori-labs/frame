import Image from "next/image";
import Link from "next/link";
import { DATA } from "@/lib/data";

const PIPELINE = ["Plan with Claude", "Build assets (sheets, frames)", "Fix in an editor model", "Write the motion prompt", "Generate 2-4 takes", "Upscale in Topaz", "Edit + music"];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <Image src="/header.jpg" alt="A glowing film strip of cinematic scenes arcing over a city at sunset" fill priority sizes="(max-width: 760px) 100vw, calc(100vw - 240px)" />
        </div>
        <div className="hero-body">
          <h1>Frame</h1>
          <p className="tagline">Ideas into every frame</p>
          <p className="lead">A step-by-step playbook for each video type: what you need, which model to use, and copy-ready prompts for every step.</p>
          <div className="actions">
            <Link className="btn primary" href="/builder">Open the prompt builder</Link>
            <Link className="btn" href={`/workflows/${DATA.categories[0].id}`}>Browse workflows</Link>
          </div>
        </div>
      </section>

      <h2>The pipeline every category follows</h2>
      <div className="flow">
        {PIPELINE.map((s, i) => (
          <span key={s} style={{ display: "contents" }}>
            {i > 0 && "\u2192"}
            <span>{s}</span>
          </span>
        ))}
      </div>

      <h2>Pick a category</h2>
      <div className="grid">
        {DATA.categories.map((c) => (
          <Link key={c.id} className="card" href={`/workflows/${c.id}`}>
            <b>{c.name}</b>
            <span>{c.tagline}</span>
          </Link>
        ))}
      </div>

      <h2>Golden rules</h2>
      <div className="rules">
        {DATA.rules.map(([t, d]) => (
          <div key={t} className="card">
            <b>{t}</b>
            <span>{d}</span>
          </div>
        ))}
      </div>
      <p className="note">
        <b>How to read prompts:</b> <mark>{"{highlighted}"}</mark> text is a placeholder you replace.
      </p>
    </>
  );
}
