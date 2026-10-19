"use client";
import { useRef, useState, type DragEvent, type PointerEvent } from "react";

type Pt = { x: number; y: number };
type Mode = "blur" | "grey";

const MAX_EDGE = 2560;
const UNDO_KEEP = 8;

function strokePoints(from: Pt, to: Pt, spacing: number): Pt[] {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const n = Math.max(1, Math.ceil(dist / Math.max(1, spacing)));
  const pts: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    pts.push({
      x: from.x + ((to.x - from.x) * i) / n,
      y: from.y + ((to.y - from.y) * i) / n,
    });
  }
  return pts;
}

{
  const pts = strokePoints({ x: 0, y: 0 }, { x: 30, y: 0 }, 10);
  if (pts.length !== 3 || pts[2].x !== 30 || pts[0].y !== 0)
    throw new Error("stroke points");
}

function stampBlur(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  scratch: HTMLCanvasElement,
  x: number,
  y: number,
  radius: number,
  blur: number,
) {
  const pad = Math.ceil(blur * 2);
  const d = Math.ceil((radius + pad) * 2);
  if (scratch.width !== d || scratch.height !== d) {
    scratch.width = d;
    scratch.height = d;
  }
  const o = scratch.getContext("2d");
  if (!o) return;
  o.clearRect(0, 0, d, d);
  o.filter = `blur(${blur}px)`;
  const sx = x - radius - pad;
  const sy = y - radius - pad;
  o.drawImage(source, sx, sy, d, d, 0, 0, d, d);
  o.filter = "none";
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(scratch, sx, sy);
  ctx.restore();
}

function stampGrey(
  ctx: CanvasRenderingContext2D,
  scratch: HTMLCanvasElement,
  x: number,
  y: number,
  radius: number,
  soft: number,
  color: string,
) {
  const pad = Math.ceil(soft);
  const d = Math.ceil((radius + pad) * 2);
  if (scratch.width !== d || scratch.height !== d) {
    scratch.width = d;
    scratch.height = d;
  }
  const o = scratch.getContext("2d");
  if (!o) return;
  o.clearRect(0, 0, d, d);
  o.filter = soft > 0 ? `blur(${soft}px)` : "none";
  o.fillStyle = color;
  o.beginPath();
  o.arc(d / 2, d / 2, radius, 0, Math.PI * 2);
  o.fill();
  o.filter = "none";
  ctx.drawImage(scratch, x - d / 2, y - d / 2);
}

export default function BlurTool() {
  const viewRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const scratchRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const undoRef = useRef<ImageData[]>([]);
  const originalRef = useRef<ImageData | null>(null);
  const painting = useRef(false);
  const last = useRef<Pt | null>(null);
  const readyRef = useRef(false);
  const brushRef = useRef(56);
  const amountRef = useRef(16);
  const modeRef = useRef<Mode>("blur");
  const colorRef = useRef("#8a8a8a");

  const [ready, setReady] = useState(false);
  const [scaled, setScaled] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<Mode>("blur");
  const [brush, setBrush] = useState(56);
  const [amount, setAmount] = useState(16);
  const [color, setColor] = useState("#8a8a8a");
  const [undos, setUndos] = useState(0);

  brushRef.current = brush;
  amountRef.current = amount;
  modeRef.current = mode;
  colorRef.current = color;
  readyRef.current = ready;

  function canvases() {
    const view = viewRef.current;
    if (!view) return null;
    const ctx = view.getContext("2d");
    if (!ctx) return null;
    if (!sourceRef.current)
      sourceRef.current = document.createElement("canvas");
    if (!scratchRef.current)
      scratchRef.current = document.createElement("canvas");
    return {
      view,
      ctx,
      source: sourceRef.current,
      scratch: scratchRef.current,
    };
  }

  function syncSource() {
    const pack = canvases();
    if (!pack) return;
    pack.source.width = pack.view.width;
    pack.source.height = pack.view.height;
    pack.source.getContext("2d")?.drawImage(pack.view, 0, 0);
  }

  function loadFile(file: File) {
    setError("");
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const pack = canvases();
      URL.revokeObjectURL(url);
      if (!pack) return;
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      pack.view.width = w;
      pack.view.height = h;
      pack.ctx.drawImage(img, 0, 0, w, h);
      originalRef.current = pack.ctx.getImageData(0, 0, w, h);
      undoRef.current = [];
      setUndos(0);
      setScaled(scale < 1);
      setReady(true);
      syncSource();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("That file could not be opened. Use a PNG or JPEG.");
    };
    img.src = url;
  }

  function toImage(e: PointerEvent<HTMLCanvasElement>): Pt {
    const canvas = viewRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  }

  function placeCursor(e: PointerEvent<HTMLElement>) {
    const el = cursorRef.current;
    const stage = stageRef.current;
    const canvas = viewRef.current;
    if (!el || !stage || !canvas || !readyRef.current) return;
    const stageRect = stage.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const size = (brushRef.current / canvas.width) * canvasRect.width;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${e.clientX - stageRect.left}px`;
    el.style.top = `${e.clientY - stageRect.top}px`;
    el.hidden = false;
  }

  function stampAt(p: Pt) {
    const pack = canvases();
    if (!pack) return;
    const radius = brushRef.current / 2;
    if (modeRef.current === "grey") {
      stampGrey(
        pack.ctx,
        pack.scratch,
        p.x,
        p.y,
        radius,
        amountRef.current,
        colorRef.current,
      );
      return;
    }
    stampBlur(
      pack.ctx,
      pack.source,
      pack.scratch,
      p.x,
      p.y,
      radius,
      amountRef.current,
    );
  }

  function onDown(e: PointerEvent<HTMLCanvasElement>) {
    if (!readyRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pack = canvases();
    if (!pack) return;
    // ponytail: keep the newest 8 full-frame snapshots. Raise UNDO_KEEP if memory allows.
    undoRef.current.push(
      pack.ctx.getImageData(0, 0, pack.view.width, pack.view.height),
    );
    if (undoRef.current.length > UNDO_KEEP) undoRef.current.shift();
    setUndos(undoRef.current.length);
    painting.current = true;
    const p = toImage(e);
    last.current = p;
    stampAt(p);
    placeCursor(e);
  }

  function onMove(e: PointerEvent<HTMLCanvasElement>) {
    placeCursor(e);
    if (!painting.current || !last.current) return;
    const p = toImage(e);
    const spacing = Math.max(1, brushRef.current * 0.18);
    for (const pt of strokePoints(last.current, p, spacing)) stampAt(pt);
    last.current = p;
  }

  function onUp() {
    if (!painting.current) return;
    painting.current = false;
    last.current = null;
    syncSource();
  }

  function undo() {
    const snap = undoRef.current.pop();
    const pack = canvases();
    if (!snap || !pack) return;
    pack.ctx.putImageData(snap, 0, 0);
    syncSource();
    setUndos(undoRef.current.length);
  }

  function reset() {
    const pack = canvases();
    const original = originalRef.current;
    if (!pack || !original) return;
    pack.ctx.putImageData(original, 0, 0);
    undoRef.current = [];
    setUndos(0);
    syncSource();
  }

  function download() {
    const view = viewRef.current;
    if (!view) return;
    view.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "frame-sheet.png";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  }

  return (
    <div className="blur-tool">
      <input
        ref={fileRef}
        className="blur-file"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadFile(file);
          e.target.value = "";
        }}
      />
      <div className="blur-bar">
        <button
          type="button"
          className="btn"
          onClick={() => fileRef.current?.click()}
        >
          {ready ? "Replace image" : "Open image"}
        </button>
        <div className="seg" role="group" aria-label="Brush type">
          {(["blur", "grey"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === "blur" ? "Blur" : "Grey"}
            </button>
          ))}
        </div>
        <label>
          Size
          <input
            type="range"
            min={12}
            max={220}
            value={brush}
            aria-label="Brush size"
            onChange={(e) => setBrush(Number(e.target.value))}
          />
        </label>
        <label>
          {mode === "blur" ? "Blur" : "Softness"}
          <input
            type="range"
            min={2}
            max={40}
            value={amount}
            aria-label={mode === "blur" ? "Blur amount" : "Edge softness"}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        {mode === "grey" && (
          <label>
            Grey
            <input
              type="color"
              value={color}
              aria-label="Grey colour"
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
        )}
        <button type="button" className="btn" disabled={!undos} onClick={undo}>
          Undo
        </button>
        <button type="button" className="btn" disabled={!ready} onClick={reset}>
          Reset
        </button>
        <button
          type="button"
          className="btn primary"
          disabled={!ready}
          onClick={download}
        >
          Download
        </button>
      </div>
      {error && <p className="note error">{error}</p>}
      {scaled && (
        <p className="hint">
          Scaled down so the long side is {MAX_EDGE}px. The download matches
          this size.
        </p>
      )}
      <div
        className="blur-stage"
        ref={stageRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onPointerLeave={() => {
          if (cursorRef.current) cursorRef.current.hidden = true;
        }}
      >
        <canvas
          ref={viewRef}
          className="blur-canvas"
          hidden={!ready}
          aria-label="Image. Drag to blur or cover a region."
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        {!ready && (
          <div className="blur-drop">
            <p>Drop a character sheet here, or open an image.</p>
            <p>
              Paint the face on the front full-body panel only. The close-up
              stays the face reference.
            </p>
          </div>
        )}
        <span ref={cursorRef} className="blur-cursor" hidden />
      </div>
    </div>
  );
}
