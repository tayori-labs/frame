"use client";
import { useSyncExternalStore } from "react";

// Browser-side Gemini key + model choice, shared by the key dialog, the builder and every Try now panel.
const KEY = "vg-gemini-key", MODEL = "vg-gemini-model", IMAGE_MODEL = "vg-gemini-image-model";
const OPEN = "vg-open-key";

export type KeyState = {
  key: string;
  serverKey: boolean;
  status: "idle" | "checking" | "ready" | "missing" | "error";
  error: string;
  models: string[];
  imageModels: string[];
  model: string;
  imageModel: string;
};

const INITIAL: KeyState = { key: "", serverKey: false, status: "idle", error: "", models: [], imageModels: [], model: "", imageModel: "" };
let state = INITIAL;
let started = false;
const listeners = new Set<() => void>();

function set(patch: Partial<KeyState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const pick = (list: string[], saved: string | null, prefer: RegExp) =>
  saved && list.includes(saved) ? saved : list.find((n) => prefer.test(n) && !/preview|exp/.test(n)) || list[0] || "";

async function refresh() {
  set({ status: "checking", error: "" });
  try {
    const r = await fetch("/api/models", { headers: authHeaders() });
    const d = await r.json();
    set({ serverKey: Boolean(d.serverKey) });
    if (d.error) throw new Error(d.error);
    if (!d.models.length) return set({ status: "missing", models: [], imageModels: [] });
    set({
      status: "ready",
      models: d.models,
      imageModels: d.imageModels,
      model: pick(d.models, localStorage.getItem(MODEL), /^gemini-[\d.]+-flash$/),
      imageModel: pick(d.imageModels, localStorage.getItem(IMAGE_MODEL), /flash-image$/),
    });
  } catch (e) {
    set({ status: "error", error: (e as Error).message });
  }
}

function start() {
  if (started) return;
  started = true;
  set({ key: localStorage.getItem(KEY) || "" });
  refresh();
}

export function subscribe(l: () => void) {
  start();
  listeners.add(l);
  return () => listeners.delete(l);
}

export const useGeminiKey = () => useSyncExternalStore(subscribe, () => state, () => INITIAL);

export const authHeaders = (): Record<string, string> => (state.key ? { "x-user-key": state.key } : {});

export function saveKey(key: string) {
  key = key.trim();
  if (key) localStorage.setItem(KEY, key);
  else localStorage.removeItem(KEY);
  set({ key });
  return refresh();
}

export function setModel(kind: "text" | "image", name: string) {
  localStorage.setItem(kind === "text" ? MODEL : IMAGE_MODEL, name);
  set(kind === "text" ? { model: name } : { imageModel: name });
}

export const STATUS_LABEL: Record<KeyState["status"], string> = { idle: "Checking...", checking: "Checking...", ready: "Connected", missing: "Not set", error: "Key error" };
export const statusLabel = (s: KeyState) => (s.status === "ready" && s.serverKey && !s.key ? "Server key" : STATUS_LABEL[s.status]);

export const openKeyDialog = () => window.dispatchEvent(new Event(OPEN));
export const onOpenKeyDialog = (fn: () => void) => {
  window.addEventListener(OPEN, fn);
  return () => window.removeEventListener(OPEN, fn);
};
