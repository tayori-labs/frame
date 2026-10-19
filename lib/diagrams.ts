// Inline SVG diagrams. Keep this file ASCII-only.
const S = (w: number, h: number, label: string, body: string) => `<svg class="dg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
const T = (x: number, y: number, s: string | number, c = "", a = "middle") => `<text x="${x}" y="${y}" class="${c}" text-anchor="${a}">${s}</text>`;
const R = (x: number, y: number, w: number, h: number, c = "box", rx = 8) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${c}"/>`;
const L = (x1: number, y1: number, x2: number, y2: number, c = "ln") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c}"/>`;
function A(x1: number, y1: number, x2: number, y2: number, c = "ln") {
  const a = Math.atan2(y2 - y1, x2 - x1), p = (d: number) => `${x2 - 9 * Math.cos(a + d)},${y2 - 9 * Math.sin(a + d)}`;
  return L(x1, y1, x2, y2, c) + `<polygon points="${x2},${y2} ${p(0.45)} ${p(-0.45)}" class="${c}-h"/>`;
}
const B = (x: number, y: number, w: number, h: number, title: string, sub: string, c = "box") =>
  R(x, y, w, h, c) + T(x + w / 2, y + h / 2 - (sub ? 3 : -4), title, "t") + (sub ? T(x + w / 2, y + h / 2 + 14, sub, "m") : "");
const badge = (x: number, y: number, n: string | number) => `<circle cx="${x}" cy="${y}" r="11" class="a"/>` + T(x, y + 4, n, "badge");

// Simple figure, origin at top of head, ~182 units tall. mode: front | back | erased
type Mode = "front" | "back" | "erased";
function head(mode: Mode) {
  if (mode === "erased") return `<circle cx="0" cy="16" r="14" class="greybg erase"/>`;
  if (mode === "back") return `<circle cx="0" cy="16" r="14" class="hair"/>`;
  return `<circle cx="0" cy="16" r="14" class="skin"/><path d="M-14 15 A14 14 0 0 1 14 15 Q0 7 -14 15Z" class="hair"/>` +
    `<circle cx="-5" cy="17" r="1.6" class="eye"/><circle cx="5" cy="17" r="1.6" class="eye"/><path d="M-4 23 Q0 25 4 23" class="mouth"/>`;
}
const person = (cx: number, y0: number, s: number, mode: Mode = "front") =>
  `<g transform="translate(${cx} ${y0}) scale(${s})"><rect x="-4" y="28" width="8" height="6" class="skin"/>` +
  `<rect x="-34" y="34" width="11" height="62" rx="5" class="cloth"/><rect x="23" y="34" width="11" height="62" rx="5" class="cloth"/>` +
  `<rect x="-22" y="32" width="44" height="72" rx="8" class="cloth"/>` +
  `<rect x="-19" y="100" width="16" height="82" rx="5" class="pants"/><rect x="3" y="100" width="16" height="82" rx="5" class="pants"/>` +
  head(mode) + `</g>`;

export const DIAGRAMS = {
  charSheet: S(640, 500, "Character sheet layout", [
    T(20, 18, "16:9 frame - 3 equal panels - flat grey background (never white)", "m", "start"),
    R(20, 28, 600, 338, "greybg", 6), L(220, 28, 220, 366, "div"), L(420, 28, 420, 366, "div"),
    badge(38, 46, 1), badge(238, 46, 2), badge(438, 46, 3),
    `<g transform="translate(120 90) scale(4)"><path d="M-24 60 Q-23 35 0 33 Q23 35 24 60Z" class="cloth"/><rect x="-4" y="27" width="8" height="8" class="skin"/>${head("front")}</g>`,
    person(320, 70, 1.5, "erased"), A(372, 66, 344, 86, "acc"), T(376, 62, "face", "a sm", "start"), T(376, 75, "erased", "a sm", "start"),
    person(520, 70, 1.5, "back"),
    ...[["Close-up", "Head & shoulders", "AI reads the face here"], ["Front full body", "Neutral standing pose", "Erase the face after"], ["Back full body", "Same pose & scale", "Hair, back of outfit, posture"]]
      .map(([t, a, b], i) => T(120 + i * 200, 390, t, "t") + T(120 + i * 200, 407, a, "m") + T(120 + i * 200, 422, b, "m")),
    ...[["Describe", "subject only"], ["Paste the", "sheet prompt"], ["Generate", "at 16:9"], ["Erase face on", "full-body panel"], ["Upload as", "reference"]]
      .map(([t, s], i) => B(20 + i * 122.5, 444, 110, 50, `${i + 1}. ${t}`, s) + (i < 4 ? A(132 + i * 122.5, 469, 141 + i * 122.5, 469) : "")),
  ].join("")),

  propSheet: S(640, 310, "Prop sheet layout", [
    T(20, 18, "2 equal panels - flat grey background - no environment", "m", "start"),
    R(20, 28, 600, 220, "greybg", 6), L(320, 28, 320, 248, "div"), badge(38, 46, 1), badge(338, 46, 2),
    `<path d="M105 248 V150 Q105 118 140 112 H200 Q235 118 235 150 V248Z" class="prop"/>`, R(140, 62, 60, 52, "steel", 6),
    `<circle cx="170" cy="190" r="22" class="logo"/>`, T(170, 194, "LOGO", "sm"),
    `<path d="M448 232 V122 Q448 108 462 106 H478 Q492 108 492 122 V232Z" class="prop"/>`, R(460, 86, 20, 21, "steel", 3),
    `<circle cx="470" cy="160" r="5" class="logo"/>`,
    T(170, 272, "Close-up", "t"), T(170, 289, "Detail, texture, logo, materials", "m"),
    T(470, 272, "Full view", "t"), T(470, 289, "Whole shape and proportions", "m"),
  ].join("")),

  fiveBlock: S(640, 345, "Five-block video prompt structure", [
    ["ASSET BINDING", "Tag every upload as &lt;&lt;&lt;image_N&gt;&gt;&gt;: what it is, what it looks and sounds like", "WHAT"],
    ["SUMMARY", "2-3 plain lines: who, where, what happens, the feeling. Lock the pairings.", "STORY"],
    ["STYLE", "Camera, lens, lighting, colour grade, texture. Locks the look across shots.", "LOOK"],
    ["DETAILED PLOT", "Timecoded beats: shot + angle, camera move, action, transition.", "SHOTS"],
    ["OVERALL REQUIREMENTS", "Ratio, cast count, consistency, audio rules, avoid list, last run's mistakes.", "RULES"],
  ].map(([t, s, k], i) => {
    const y = 6 + i * 68;
    return R(10, y, 620, 60) + R(10, y, 6, 60, "a", 3) + badge(42, y + 30, i + 1) + T(64, y + 25, t, "t", "start") + T(64, y + 44, s, "m", "start") + T(615, y + 25, k, "a sm", "end");
  }).join("")),

  promptMap: S(640, 300, "Anatomy of a prompt", (() => {
    const rows = [
      [["CAMERA", "Shot on ARRI Alexa 65"], ["LENS", "Panavision 40mm lens"], ["DIRECTOR", "in the style of Denis Villeneuve"]],
      [["SHOT + MOVE", "Extreme wide, slow jib up"], ["SUBJECT + ACTION", "A lone figure in a dust storm"]],
      [["LIGHTING", "diffused sunless glow"], ["PALETTE + MOOD", "burnt-orange, silent"]],
    ];
    const cols = ["#f5c451", "#7cc4ff", "#c792ea", "#80deea", "#5fd38d", "#ff8a65", "#f78fb3"];
    let out = "", n = 0;
    rows.forEach((row, r) => {
      let x = 20;
      row.forEach(([k, v]) => {
        const w = v.length * 6.9 + 24, y = 40 + r * 90, c = cols[n++];
        out += T(x + 2, y - 8, k, "sm", "start").replace("<text", `<text style="fill:${c}"`) +
          `<rect x="${x}" y="${y}" width="${w}" height="36" rx="8" class="chip" style="stroke:${c}"/>` + T(x + 12, y + 23, v, "", "start");
        x += w + 14;
      });
    });
    return out + T(320, 286, "A prompt is a set of dials: change one chip, keep the rest, and compare.", "m");
  })()),

  speedRamp: S(640, 290, "Speed ramp curve", [
    R(245, 40, 220, 160, "zone", 0),
    L(60, 200, 610, 200), L(60, 40, 60, 200),
    T(52, 54, "100%", "m", "end"), T(52, 189, "10%", "m", "end"), T(22, 125, "speed", "m", "start"),
    ...[[0, 60], [3, 225], [7, 445], [10, 610]].map(([t, x]) => L(x, 200, x, 205) + T(x, 218, t + "s", "m")),
    `<path d="M60 50 L225 50 C245 50 240 185 265 185 L445 185 C470 185 465 50 485 50 L610 50" class="acc"/>`,
    T(142, 40, "Normal speed", "sm"), T(547, 40, "Normal speed", "sm"), T(355, 172, "Extreme slow motion (~10%)", "a sm"),
    T(236, 118, "ramp down", "m", "end"), T(476, 118, "ramp up", "m", "start"),
    B(60, 234, 160, 48, "Shot 1", "low push-in, launch"), B(228, 234, 212, 48, "Shot 2", "lateral tracking, sweat hangs"), B(448, 234, 162, 48, "Shot 3", "face close-up, real time"),
  ].join("")),

  shotSizes: S(640, 400, "Shot sizes", (() => {
    const fr = [
      ["#f78fb3", 20, 20, 600, 372], ["#5fd38d", 175, 44, 170, 322], ["#c792ea", 195, 50, 130, 176], ["#7cc4ff", 215, 56, 90, 78], ["#f5c451", 236, 74, 48, 18],
    ] as const;
    const lab = [[1, 304, "Full shot", "Body language, movement"], [2, 194, "Medium shot", "Dialogue, conversation"], [3, 126, "Close-up", "Emotion, detail"], [4, 83, "Extreme close-up", "Tension, tiny details"]] as const;
    return `<path d="M20 351 L60 300 L95 330 L135 285 L170 340" class="ln"/><circle cx="560" cy="64" r="14" class="sun"/>` + L(20, 351, 620, 351) +
      person(260, 60, 1.6) +
      fr.map(([c, x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="frame" style="stroke:${c}"/>`).join("") +
      T(32, 42, "Wide shot", "t", "start").replace("<text", `<text style="fill:${fr[0][0]}"`) + T(32, 58, "Subject in their world", "m", "start") +
      lab.map(([i, y, t, s]) => {
        const [c, x, , w] = fr[i];
        return L(x + w, y, 410, y, "lead") + T(418, y + 4, t, "t", "start").replace("<text", `<text style="fill:${c}"`) + T(418, y + 18, s, "m", "start");
      }).join("");
  })()),

  cameraAngles: S(760, 370, "Camera angles", (() => {
    const cam = (x: number, y: number, deg: number) => `<g transform="translate(${x} ${y}) rotate(${deg})"><rect x="-14" y="-9" width="20" height="18" rx="3" class="cam"/><polygon points="6,-5 16,-10 16,10 6,5" class="a"/></g>`;
    const cams = [
      [500, 24, 500, 76, "Bird's-eye", "Overview, scale", 524, 22, "start"],
      [330, 46, 480, 110, "High angle", "Subject feels small", 308, 44, "end"],
      [300, 102, 476, 102, "Eye level", "Neutral, direct connection", 278, 100, "end"],
      [330, 270, 480, 170, "Low angle", "Powerful, heroic", 308, 270, "end"],
      [420, 330, 488, 130, "Worm's-eye", "Larger than life", 398, 336, "end"],
    ] as const;
    return L(440, 335, 580, 335) + person(500, 80, 1.4) +
      cams.map(([x, y, tx, ty, t, s, lx, ly, a]) => L(x, y, tx, ty, "sight") + cam(x, y, Math.atan2(ty - y, tx - x) * 180 / Math.PI) + T(lx, ly, t, "t", a) + T(lx, ly + 15, s, "m", a)).join("") +
      `<g transform="translate(675 210) rotate(-12)"><rect x="-58" y="-62" width="116" height="110" rx="4" class="frame" style="stroke:#9aa0ab"/>${person(0, -54, 0.55)}</g>` +
      T(675, 300, "Dutch angle", "t") + T(675, 315, "Unease, tension", "m");
  })()),

  ugcTimeline: S(640, 200, "UGC script timeline", [
    ...([[0, 2, "Hook", "a"], [2, 6, "Problem", "box"], [6, 15, "Demo / proof", "box"], [15, 20, "CTA", "box"]] as const).map(([s, e, t, c]) => {
      const x = 20 + s * 30, w = (e - s) * 30;
      return R(x + 1, 90, w - 2, 36, c, 6) + T(x + w / 2, 113, t, c === "a" ? "t dark" : "t");
    }),
    T(20, 50, "Pattern-interrupt line", "a sm", "start"), L(50, 56, 50, 88, "lead"),
    T(140, 76, "Talking head", "m"), T(335, 76, "Product in hand + B-roll", "m"), T(545, 76, "Talking head + CTA", "m"),
    ...[0, 2, 6, 15, 20].map(t => T(20 + t * 30, 146, t + "s", "m")),
    T(320, 184, "9:16 vertical - cut every 2-3s - open on the hook line, never a logo", "m"),
  ].join("")),

  motionPipeline: S(640, 210, "Code-drawn animation pipeline", [
    `<path d="M320 60 C320 18 192 18 192 52" class="ln"/><polygon points="192,60 187,50 197,50" class="ln-h"/>`, T(256, 14, "checks sample frames, fixes", "m"),
    ...[["Style refs", "+ rough brief"], ["Claude Code", "plans, writes code"], ["Chrome", "renders frames"], ["ffmpeg", "joins + soundtrack"], ["MP4", "ready to post"]]
      .map(([t, s], i) => B(10 + i * 128, 62, 108, 62, t, s, i === 4 ? "box hi" : "box") + (i < 4 ? A(120 + i * 128, 93, 136 + i * 128, 93) : "")),
    T(192, 148, "hook > build-up > payoff", "a sm"),
    T(320, 190, "~25-30 min per 15s clip - Opus 5.5 on high - watch your usage limit", "m"),
  ].join("")),

  topazFlow: S(640, 220, "Topaz upscale flow", [
    R(30, 60, 72, 128, "box", 4), T(66, 120, "720p", "t"), T(66, 136, "generated", "m"),
    A(110, 124, 146, 124), B(150, 94, 140, 60, "Proteus", "upscale, detail 20"),
    A(298, 124, 334, 124), B(338, 94, 140, 60, "Apollo", "interpolate to 30 FPS"),
    A(486, 124, 516, 124), R(520, 16, 108, 192, "box hi", 6), T(574, 104, "1080 x 1920", "t"), T(574, 122, "30 FPS", "m"), T(574, 138, "Instagram-ready", "m"),
  ].join("")),
};

export type DiagramName = keyof typeof DIAGRAMS;
