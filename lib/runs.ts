"use client";
import { useSyncExternalStore } from "react";
import type { Form } from "@/lib/brief";
import type { Plan, PlanStep } from "@/lib/gemini";
import { authHeaders } from "@/lib/geminiKey";

// Generated output stays in this browser. Images are data URLs, so the list only
// keeps the small fields in memory; the full record is read when a run is opened.
// ponytail: newest 40 survive, older runs are deleted. Raise KEEP if storage allows.
const DB_NAME = "vg";
const STORE = "runs";
const IMAGES = "images";
const KEEP = 40;

export type RunMode = "text" | "image" | "plan";
export type Run = {
  id: string;
  at: number;
  label: string;
  prompt: string;
  mode: RunMode;
  model: string;
  aspect?: string;
  text: string;
  images: string[];
  form?: Form;
  plan?: Plan;
};
export type RunMeta = Pick<
  Run,
  "id" | "at" | "label" | "prompt" | "mode" | "model" | "aspect"
> & { excerpt: string };
export type NewRun = Omit<Run, "id" | "at">;

const clip = (text: string) =>
  text
    .replace(/[#>*_`|[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

const metaOf = (run: Run): RunMeta => ({
  id: run.id,
  at: run.at,
  label: run.label,
  prompt: run.prompt,
  mode: run.mode,
  model: run.model,
  aspect: run.aspect,
  excerpt: clip(run.text || ""),
});

export const RUN_MODE: Record<RunMode, string> = {
  text: "Text",
  image: "Image",
  plan: "Plan",
};
export const formatRunTime = (at: number) =>
  new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function planText(plan: Plan) {
  const steps = plan.steps
    .map((s, i) => {
      const prompts = (s.prompts || [])
        .map((x) => `### ${x.label}\n\n${x.text}`)
        .join("\n\n");
      const tips = s.tips?.length ? s.tips.map((t) => `- ${t}`).join("\n") : "";
      return `## ${i + 1}. ${s.title}\n\n**${s.tool}** - ${s.why}\n\n${prompts}${tips ? `\n\n${tips}` : ""}`;
    })
    .join("\n\n");
  return `# ${plan.title}\n\n${plan.summary}\n\n${steps}`;
}

// Older saved plans only have planText. Recover the steps so they can use the same cards.
// ponytail: assumes the planText shape; a prompt that itself starts with "### " or a trailing "- " list can split wrong.
export function planFromText(text: string): Plan | null {
  const head = text.match(/^# (.+)\n\n([\s\S]*?)\n\n## \d+\. /);
  if (!head) return null;
  const steps = text
    .split(/\n## /)
    .slice(1)
    .map((block): PlanStep | null => {
      const m = block.match(
        /^(\d+)\. (.+)\n\n\*\*(.+?)\*\* - (.+)\n\n([\s\S]*)$/,
      );
      if (!m) return null;
      const lines = m[5].split("\n");
      const tips: string[] = [];
      while (lines.length) {
        const last = lines[lines.length - 1];
        if (last === "") {
          lines.pop();
          continue;
        }
        if (!last.startsWith("- ")) break;
        tips.unshift(lines.pop()!.slice(2));
      }
      const prompts = lines
        .join("\n")
        .trim()
        .split(/\n### /)
        .map((chunk, i) => (i === 0 ? chunk : `### ${chunk}`))
        .map((chunk) => chunk.match(/^### (.+)\n\n([\s\S]*)$/))
        .filter((x): x is RegExpMatchArray => Boolean(x))
        .map((x) => ({ label: x[1].trim(), text: x[2].trim() }));
      return { title: m[2], tool: m[3], why: m[4], prompts, tips };
    })
    .filter((s): s is PlanStep => s !== null);
  if (!steps.length) return null;
  return { title: head[1], summary: head[2].trim(), steps };
}

{
  const sample: Plan = {
    title: "The Crema Pour",
    summary: "A minimalist spot.",
    steps: [
      {
        title: "Prop Reference Sheet",
        tool: "Reve",
        why: "Clean renders.",
        prompts: [
          { label: "PROP SHEET PROMPT", text: "A small cup." },
          { label: "SECOND", text: "Line two." },
        ],
        tips: ["no handle", "pick texture"],
      },
      {
        title: "Hero Still Frame",
        tool: "Soul Cinema",
        why: "Hard light.",
        prompts: [{ label: "HERO FRAME PROMPT", text: "Shot on RED." }],
      },
    ],
  };
  const back = planFromText(planText(sample));
  if (
    !back ||
    back.title !== sample.title ||
    back.summary !== sample.summary ||
    back.steps.length !== 2 ||
    back.steps[0].prompts[1]?.text !== "Line two." ||
    back.steps[0].tips?.[1] !== "pick texture" ||
    back.steps[1].tool !== "Soul Cinema" ||
    back.steps[1].prompts[0]?.text !== "Shot on RED." ||
    (back.steps[1].tips?.length ?? 0) !== 0
  ) {
    throw new Error("plan text roundtrip failed");
  }
}

let metas: RunMeta[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      const database = req.result;
      if (!database.objectStoreNames.contains(STORE))
        database
          .createObjectStore(STORE, { keyPath: "id" })
          .createIndex("at", "at");
      if (!database.objectStoreNames.contains(IMAGES))
        database.createObjectStore(IMAGES);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(t: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

async function reload() {
  const database = await db();
  try {
    const store = database.transaction(STORE).objectStore(STORE);
    const rows = (await request(store.index("at").getAll())).map(metaOf);
    metas = rows.reverse();
    loaded = true;
    emit();
  } finally {
    database.close();
  }
}

let loading: Promise<void> | null = null;
function ensure() {
  if (!loaded && !loading)
    loading = reload().catch(() => ((loaded = true), emit()));
  return loading;
}

function subscribe(l: () => void) {
  listeners.add(l);
  ensure();
  return () => listeners.delete(l);
}

const EMPTY: RunMeta[] = [];
export const useRuns = () =>
  useSyncExternalStore(
    subscribe,
    () => metas,
    () => EMPTY,
  );

export async function saveRun(input: NewRun): Promise<Run> {
  const run: Run = {
    ...input,
    id: crypto.randomUUID(),
    at: Date.now(),
    images: input.images ?? [],
  };
  const { images, ...record } = run;
  const database = await db();
  try {
    const t = database.transaction([STORE, IMAGES], "readwrite");
    const store = t.objectStore(STORE);
    store.put(record);
    if (images.length) t.objectStore(IMAGES).put(images, run.id);
    // Deletes must be queued inside onsuccess: awaiting here would commit the transaction first.
    const keys = store.index("at").getAllKeys();
    keys.onsuccess = () =>
      keys.result
        .slice(0, Math.max(0, keys.result.length - KEEP))
        .forEach((id) => {
          store.delete(id);
          t.objectStore(IMAGES).delete(id);
        });
    await done(t);
  } finally {
    database.close();
  }
  await reload();
  return run;
}

export async function loadRun(id: string): Promise<Run | undefined> {
  const database = await db();
  try {
    const t = database.transaction([STORE, IMAGES]);
    const runReq = t.objectStore(STORE).get(id);
    const imageReq = t.objectStore(IMAGES).get(id);
    const [run, stored] = await Promise.all([
      request<Run | undefined>(runReq),
      request<string[] | undefined>(imageReq),
    ]);
    if (!run) return;
    return { ...run, images: run.images?.length ? run.images : stored || [] };
  } finally {
    database.close();
  }
}

export async function deleteRun(id: string): Promise<void> {
  const database = await db();
  try {
    const t = database.transaction([STORE, IMAGES], "readwrite");
    t.objectStore(STORE).delete(id);
    t.objectStore(IMAGES).delete(id);
    await done(t);
  } finally {
    database.close();
  }
  metas = metas.filter((r) => r.id !== id);
  emit();
}

export async function clearRuns(): Promise<void> {
  const database = await db();
  try {
    const t = database.transaction([STORE, IMAGES], "readwrite");
    t.objectStore(STORE).clear();
    t.objectStore(IMAGES).clear();
    await done(t);
  } finally {
    database.close();
  }
  metas = [];
  emit();
}

export async function loadFirstImage(id: string): Promise<string | null> {
  const database = await db();
  try {
    const stored = await request<string[] | undefined>(
      database.transaction(IMAGES).objectStore(IMAGES).get(id),
    );
    return stored?.[0] || null;
  } finally {
    database.close();
  }
}

// Runs the saved prompt again and stores the new result. Returns the new run id.
export async function rerun(id: string): Promise<string> {
  const source = await loadRun(id);
  if (!source) throw new Error("This run is no longer saved.");
  const headers = { "Content-Type": "application/json", ...authHeaders() };
  if (source.mode === "plan") {
    if (!source.form)
      throw new Error(
        "This plan can't be retried. Generate it again from the prompt builder.",
      );
    const r = await fetch("/api/generate", {
      method: "POST",
      headers,
      body: JSON.stringify({ form: source.form, model: source.model }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
    const saved = await saveRun({
      label: d.plan.title,
      prompt: source.form.idea || source.prompt,
      mode: "plan",
      model: source.model,
      text: planText(d.plan),
      images: [],
      form: source.form,
      plan: d.plan,
    });
    return saved.id;
  }
  const r = await fetch("/api/try", {
    method: "POST",
    headers,
    body: JSON.stringify({
      mode: source.mode,
      model: source.model,
      prompt: source.prompt,
      ...(source.mode === "image"
        ? { aspectRatio: source.aspect || "16:9" }
        : {}),
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
  const saved = await saveRun({
    label: source.label,
    prompt: source.prompt,
    mode: source.mode,
    model: source.model,
    aspect: source.aspect,
    text: d.text || "",
    images: d.images || [],
  });
  return saved.id;
}
