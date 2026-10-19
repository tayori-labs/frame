// Prompt builder: turns an idea + parameters into a tailored step-by-step plan via the Gemini API.
// Keep this file ASCII-only.
const BUILDER = (() => {
  const KEY = "vg-gemini-key", MODEL = "vg-gemini-model", FORM = "vg-builder-form";
  const DEFAULT_MODEL = "gemini-2.5-flash";
  const API = "https://generativelanguage.googleapis.com/v1beta";
  let lastPlan = null;

  const opt = (v, label = v, on = false) => `<option value="${esc(v)}"${on ? " selected" : ""}>${esc(label)}</option>`;
  const sel = (name, label, options, auto) =>
    `<label class="field"><span>${label}</span><select name="${name}">${auto ? opt("", "Let AI choose") : ""}${options
      .map(o => (Array.isArray(o) ? opt(o[0], o[1]) : opt(o))).join("")}</select></label>`;
  const vocab = k => DATA.vocab[k].map(([t]) => t);
  const $ = s => $app.querySelector(s);

  const SCHEMA = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      summary: { type: "STRING" },
      steps: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            tool: { type: "STRING" },
            why: { type: "STRING" },
            prompts: {
              type: "ARRAY",
              items: { type: "OBJECT", properties: { label: { type: "STRING" }, text: { type: "STRING" } }, required: ["label", "text"] },
            },
            tips: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["title", "tool", "why", "prompts"],
        },
      },
    },
    required: ["title", "summary", "steps"],
  };

  function render() {
    const model = localStorage.getItem(MODEL) || DEFAULT_MODEL;
    return `
      <h1>Prompt builder</h1>
      <p class="lead">Describe your idea, pick the video type and the look, and get a step-by-step plan with copy-ready prompts written for your idea, built on the workflows in this guide.</p>
      <details class="settings"${localStorage.getItem(KEY) ? "" : " open"}>
        <summary>Gemini API key <span id="key-status" class="pill"></span></summary>
        <div class="form-grid">
          <label class="field"><span>API key</span><input id="key" type="password" autocomplete="off" spellcheck="false" placeholder="Paste your key" value="${esc(localStorage.getItem(KEY) || "")}"></label>
          <label class="field"><span>Model</span><select id="model">${opt(model, model, true)}</select></label>
        </div>
        <p class="hint">Get a free key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>. It is saved only in this browser and sent directly to Google. No key? Use "Copy brief" and paste it into any chatbot.</p>
      </details>
      <form id="builder-form" class="builder" novalidate>
        <fieldset><legend>Video type</legend><div class="chips">${DATA.categories
        .map((c, i) => `<label><input type="radio" name="type" value="${c.id}"${i === 0 ? " checked" : ""}><span>${esc(c.name)}</span></label>`).join("")}</div></fieldset>
        <label class="field"><span>Your idea</span><textarea name="idea" rows="4" required placeholder="e.g. A street racer is hunted by a police chopper across a neon city and escapes into a tunnel"></textarea></label>
        <div class="form-grid">
          ${sel("duration", "Duration", [["5", "5 seconds"], ["10", "10 seconds"], ["15", "15 seconds"], ["30", "30 seconds"], ["60", "60 seconds"]])}
          ${sel("ratio", "Aspect ratio", [["9:16", "9:16 vertical"], ["16:9", "16:9 widescreen"], ["1:1", "1:1 square"], ["4:5", "4:5 feed"]])}
          ${sel("audio", "Audio", ["SFX only, music added in edit", "Dialogue / talking to camera", "Voice-over + SFX", "No audio"])}
          ${sel("budget", "Priority", ["Best quality", "Balanced", "Lowest cost"])}
        </div>
        <h3>Look (optional)</h3>
        <div class="form-grid">
          ${sel("camera", "Camera", vocab("camera"), true)}
          ${sel("lens", "Lens", vocab("lens"), true)}
          ${sel("director", "Director / style", vocab("director"), true)}
          ${sel("lighting", "Lighting", vocab("lighting"), true)}
        </div>
        <label class="field"><span>Characters, products &amp; props (optional)</span><textarea name="assets" rows="3" placeholder="e.g. Young man with twist-out hair and a cream hoodie; blacked-out muscle car with red LED light bars"></textarea></label>
        <label class="field"><span>Notes / must avoid (optional)</span><textarea name="notes" rows="2" placeholder="e.g. No on-screen text, keep generation cost low"></textarea></label>
        <div class="actions">
          <button type="submit" class="btn primary">Generate prompts</button>
          <button type="button" id="copy-brief" class="btn">Copy brief</button>
        </div>
      </form>
      <div id="result" aria-live="polite"></div>`;
  }

  function mount() {
    const form = $("#builder-form"), key = $("#key"), model = $("#model");
    for (const [k, v] of Object.entries(JSON.parse(localStorage.getItem(FORM) || "{}"))) if (form.elements[k]) form.elements[k].value = v;
    form.addEventListener("input", () => localStorage.setItem(FORM, JSON.stringify(Object.fromEntries(new FormData(form)))));
    key.addEventListener("change", () => { localStorage.setItem(KEY, key.value.trim()); loadModels(); });
    model.addEventListener("change", () => localStorage.setItem(MODEL, model.value));
    form.addEventListener("submit", e => { e.preventDefault(); if (form.reportValidity()) generate(form); });
    $("#copy-brief").addEventListener("click", e => {
      if (!form.reportValidity()) return;
      const { system, user } = brief(form);
      copy(`${system}\n\n---\n\nMY VIDEO:\n${user}`, e.target);
    });
    loadModels();
    if (lastPlan) showPlan(lastPlan, false);
  }

  async function loadModels() {
    const k = localStorage.getItem(KEY), status = $("#key-status");
    if (!status) return;
    status.textContent = k ? "Checking..." : "Not set";
    if (!k) return;
    try {
      const r = await fetch(`${API}/models?pageSize=200`, { headers: { "x-goog-api-key": k } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
      const names = d.models
        .filter(m => m.supportedGenerationMethods?.includes("generateContent") && /gemini/.test(m.name) && !/embed|tts|image|audio|live|vision/.test(m.name))
        .map(m => m.name.replace("models/", "")).sort().reverse();
      const saved = localStorage.getItem(MODEL);
      const pick = names.includes(saved) ? saved : names.find(n => /flash/.test(n) && !/lite|preview|exp/.test(n)) || names[0];
      $("#model").innerHTML = names.map(n => opt(n, n, n === pick)).join("");
      if (pick) localStorage.setItem(MODEL, pick);
      status.textContent = "Connected";
    } catch (e) {
      status.textContent = "Key error";
      status.title = e.message;
    }
  }

  function brief(form) {
    const f = Object.fromEntries(new FormData(form));
    const c = DATA.categories.find(x => x.id === f.type);
    const m = DATA.models;
    const list = rows => rows.map(([n, w, cost]) => `- ${n}: ${w}${cost ? ` (${cost})` : ""}`).join("\n");
    const tools = xs => xs.map(([n, w]) => `${n} (${w})`).join("; ");
    const steps = c.steps.map((s, i) => [
      `STEP ${i + 1}: ${s.title}`,
      s.req.length && `Requirements: ${s.req.join("; ")}`,
      s.models.length && `Models: ${tools(s.models)}`,
      s.alt.length && `Alternatives: ${tools(s.alt)}`,
      s.tips.length && `Tips: ${s.tips.join(" ")}`,
      ...s.prompts.map(p => `Example prompt (${p.label}):\n${p.text}`),
    ].filter(Boolean).join("\n")).join("\n\n");

    const system = `You are a senior AI video director and prompt engineer. Turn the user's idea into a step-by-step production plan with copy-ready prompts.

GOLDEN RULES
${DATA.rules.map(([t, d]) => `- ${t}: ${d}`).join("\n")}

IMAGE MODELS
${list(m.image)}

VIDEO MODELS
${list(m.video)}

OTHER TOOLS
${list(m.other)}
${list(m.more)}

REFERENCE WORKFLOW: ${c.name} (${c.specs})
${steps}

TEMPLATES
${DATA.templates.map(([l, t]) => `${l}:\n${t}`).join("\n\n")}

HOW TO ANSWER
- Follow the reference workflow in order, adapted to the idea. Merge or skip steps that do not apply; add a step only if the idea needs it.
- Each step names one primary tool from the lists above and says in one sentence why.
- Write every prompt in full, specific to the idea, ready to paste. No {placeholders}. Refer to uploads as <<<image_N>>> with a one-line description of what that image is.
- Image prompts use the look formula (camera, lens, director/style, shot, subject, lighting, palette + mood). Use the character / prop sheet templates for anything that must stay consistent.
- Video prompts use the 5-block structure (or the CUT format from the examples) with timecoded beats. One generation is at most 15 seconds, so split longer videos into numbered generation prompts that together cover the full duration.
- Respect the duration, aspect ratio, audio rule and priority (quality vs cost) when choosing models and writing prompts.
- Tips: short and practical, at most 3 per step.
- Output: a title, a 1-2 sentence summary, then the numbered steps, each with tool, why, prompts and tips.`;

    const user = [
      `Video type: ${c.name}`, `Idea: ${f.idea}`, `Duration: ${f.duration} seconds`, `Aspect ratio: ${f.ratio}`, `Audio: ${f.audio}`, `Priority: ${f.budget}`,
      f.camera && `Camera: ${f.camera}`, f.lens && `Lens: ${f.lens}`, f.director && `Director / style: ${f.director}`, f.lighting && `Lighting: ${f.lighting}`,
      f.assets && `Characters, products and props: ${f.assets}`, f.notes && `Notes / must avoid: ${f.notes}`,
    ].filter(Boolean).join("\n");
    return { system, user };
  }

  async function generate(form) {
    const out = $("#result"), btn = form.querySelector("[type=submit]");
    const k = $("#key").value.trim();
    if (!k) {
      out.innerHTML = `<p class="note">Add your Gemini API key above, or use "Copy brief" to paste the request into any chatbot.</p>`;
      $(".settings").open = true;
      $("#key").focus();
      return;
    }
    if (k !== localStorage.getItem(KEY)) { localStorage.setItem(KEY, k); loadModels(); }
    btn.disabled = true;
    btn.textContent = "Generating...";
    out.innerHTML = `<p class="note">Writing your plan. This usually takes 20-60 seconds.</p>`;
    try {
      const { system, user } = brief(form);
      const model = $("#model").value || DEFAULT_MODEL;
      const r = await fetch(`${API}/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": k },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.8 },
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
      const text = (d.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || "").join("");
      if (!text) throw new Error(d.promptFeedback?.blockReason ? `Blocked (${d.promptFeedback.blockReason})` : "Empty response, try again.");
      lastPlan = JSON.parse(text);
      showPlan(lastPlan);
    } catch (e) {
      if ($("#result")) $("#result").innerHTML = `<p class="note error">Could not generate: ${esc(e.message)}</p>`;
    } finally {
      btn.disabled = false;
      btn.textContent = "Generate prompts";
    }
  }

  function showPlan(p, scroll = true) {
    const out = $("#result");
    if (!out) return;
    const all = p.steps.map((s, i) =>
      `STEP ${i + 1}: ${s.title} - ${s.tool}\n` + (s.prompts || []).map(x => `\n[${x.label}]\n${x.text}`).join("\n")).join("\n\n");
    out.innerHTML = `
      <div class="plan-head"><h2>${esc(p.title)}</h2><button class="copy" data-i="${copyBuf.push(all) - 1}">Copy all</button></div>
      <p class="lead">${esc(p.summary)}</p>
      ${p.steps.map((s, i) => `
        <section class="step">
          <div class="step-head"><span class="num">${i + 1}</span><h2>${esc(s.title)}</h2></div>
          <h3>Tool</h3><div class="models">${model([s.tool, s.why])}</div>
          ${(s.prompts || []).length ? `<h3>Prompts</h3>${s.prompts.map(x => promptBlock(x.label, x.text)).join("")}` : ""}
          ${(s.tips || []).length ? `<h3>Tips</h3><ul class="tips">${s.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
        </section>`).join("")}`;
    if (scroll) out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return { render, mount };
})();
