import { PromptBlock, StepHead } from "@/components/ui";

export const metadata = { title: "Agent skill" };

const REPO = "https://github.com/tayori-labs/frame/tree/main/skills/video-prompt-director";
const FLOW = ["Asks only for missing details", "Picks the matching workflow", "Splits into 15s generations", "Writes every prompt in full", "Checks against a checklist"];
const TREE = [
  ["video-prompt-director/", ""],
  ["\u251c\u2500\u2500 SKILL.md", "instructions, output format, checklist"],
  ["\u2514\u2500\u2500 references/", ""],
  ["    \u251c\u2500\u2500 workflows.md", "step-by-step workflow + example prompts per video type"],
  ["    \u251c\u2500\u2500 templates.md", "5-block prompt, character / prop sheets, speed ramp, Topaz"],
  ["    \u251c\u2500\u2500 vocabulary.md", "camera, lens, director, lighting, shots + annotated examples"],
  ["    \u2514\u2500\u2500 models.md", "which model for which task, with costs"],
];
const EXAMPLES = [
  ["Quick idea", "Use the video-prompt-director skill: a 30s cinematic chase of a detective and a thief across Mumbai rooftops at dusk, 9:16, Fincher style."],
  ["UGC ad", "Make me UGC prompts for a 20-second TikTok ad for a matte black insulated water bottle. The creator is a gym-going woman in her twenties, talking to camera."],
  ["Stylized animation", "Plan a 15-second Arcane x Spider-Verse style animation of a girl on a hoverboard escaping drones through a floating market. SFX only, 16:9."],
];

export default function Skill() {
  return (
    <>
      <h1>Agent skill</h1>
      <p className="lead">
        Install this guide into your own AI assistant. Give it a video idea and it returns a step-by-step plan with refined, paste-ready prompts, just like the prompt
        builder, but inside Claude, Cursor or any agent that supports Agent Skills.
      </p>
      <div className="actions">
        <a className="btn primary" href="/video-prompt-director.zip" download>Download skill (.zip)</a>
        <a className="btn" href={REPO} target="_blank" rel="noopener">View on GitHub</a>
      </div>

      <h2>What the skill does</h2>
      <div className="flow">
        {FLOW.map((s, i) => (
          <span key={s} style={{ display: "contents" }}>
            {i > 0 && "\u2192"}
            <span>{s}</span>
          </span>
        ))}
      </div>

      <h2>What&apos;s inside</h2>
      <pre className="tree">
        {TREE.map(([path, note]) => (
          <span key={path} style={{ display: "block" }}>
            {path.padEnd(22)}
            <span>{note}</span>
          </span>
        ))}
      </pre>

      <h2>Install</h2>
      <section className="step">
        <StepHead n={1} title="Claude Code" />
        <p className="tips">Unzip into your personal skills folder (all projects) or a project&apos;s <code>.claude/skills</code> folder, then start a new session.</p>
        <PromptBlock label="Personal (all projects)" text="unzip video-prompt-director.zip -d ~/.claude/skills/" />
        <PromptBlock label="This project only" text="unzip video-prompt-director.zip -d .claude/skills/" />
      </section>
      <section className="step">
        <StepHead n={2} title="Claude app (web & desktop)" />
        <ul className="tips">
          <li>Open <b>Settings, Capabilities</b> and make sure code execution / Skills is turned on.</li>
          <li>In the Skills section choose <b>Upload skill</b> and select <code>video-prompt-director.zip</code>.</li>
          <li>Start a new chat. Claude loads the skill whenever you ask for video prompts.</li>
        </ul>
      </section>
      <section className="step">
        <StepHead n={3} title="Cursor" />
        <p className="tips">Unzip into your personal or project skills folder, then open a new chat.</p>
        <PromptBlock label="Personal (all projects)" text="unzip video-prompt-director.zip -d ~/.cursor/skills/" />
        <PromptBlock label="This project only" text="unzip video-prompt-director.zip -d .cursor/skills/" />
      </section>
      <section className="step">
        <StepHead n={4} title="Other agents" />
        <p className="tips">
          Any tool that supports the Agent Skills format (a folder with a <code>SKILL.md</code>) works: copy the <code>video-prompt-director</code> folder into that
          tool&apos;s skills directory (many use <code>~/.agents/skills/</code>). Check the tool&apos;s docs for the exact path.
        </p>
      </section>
      <section className="step">
        <StepHead n={5} title="ChatGPT or Gemini (no skill support)" />
        <ul className="tips">
          <li>Create a Custom GPT, Gem or Project.</li>
          <li>Paste the contents of <a className="inline" href={`${REPO}/SKILL.md`} target="_blank" rel="noopener">SKILL.md</a> into its instructions.</li>
          <li>Upload the four files from <a className="inline" href={`${REPO}/references`} target="_blank" rel="noopener">references/</a> as knowledge files.</li>
        </ul>
      </section>

      <h2>How to use it</h2>
      <p className="lead">Just describe the video. Mention the skill by name if your assistant doesn&apos;t pick it up on its own.</p>
      {EXAMPLES.map(([label, text]) => <PromptBlock key={label} label={label} text={text} />)}

      <h2>What you get back</h2>
      <ul>
        <li>A title and a one-line plan of how the video is split into generations.</li>
        <li>Numbered steps, each with one tool, why it was picked, and full prompts ready to paste.</li>
        <li>Character and prop sheet prompts first, so everything stays consistent across clips.</li>
        <li>Video prompts in the 5-block structure with timecoded beats, audio rules and an avoid list.</li>
        <li>A finishing note for upscaling and editing.</li>
      </ul>

      <h2>Keeping it in sync</h2>
      <p className="tips">The reference files are generated from this site&apos;s <code>lib/data.js</code>. After editing it, rebuild the skill and the zip:</p>
      <PromptBlock label="Rebuild" text="pnpm build:skill" />
    </>
  );
}
