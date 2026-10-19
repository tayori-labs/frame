// Regenerates the skill's reference files from lib/data.ts and zips the skill.
// Usage: pnpm build:skill
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { DATA, type Pair } from "../lib/data.ts";

const root = path.join(import.meta.dirname, "..");
const skills = path.join(root, ".agents", "skills");
const skill = path.join(skills, "video-prompt-director");
const out = (name: string, text: string) => fs.writeFileSync(path.join(skill, "references", name), text.trim() + "\n");
fs.mkdirSync(path.join(skill, "references"), { recursive: true });

const fence = (t: string) => "```\n" + t + "\n```";
const table = (heads: string[], rows: string[][]) =>
  [`| ${heads.join(" | ")} |`, `| ${heads.map(() => "---").join(" | ")} |`, ...rows.map(r => `| ${r.map(c => String(c).replace(/\|/g, "/")).join(" | ")} |`)].join("\n");
const tools = (xs: Pair[]) => xs.map(([n, w]) => `${n} (${w})`).join("; ");

out("workflows.md", `# Workflows by video type

Golden rules:
${DATA.rules.map(([t, d]) => `- **${t}.** ${d}`).join("\n")}

${DATA.categories.map(c => `## ${c.name}

${c.tagline}
Specs: ${c.specs}

${c.steps.map((s, i) => [
  `### Step ${i + 1}: ${s.title}`,
  s.req.length && `- Requirements: ${s.req.join("; ")}`,
  s.models.length && `- Models: ${tools(s.models)}`,
  s.alt.length && `- Alternatives: ${tools(s.alt)}`,
  ...s.tips.map(t => `- Tip: ${t}`),
  ...s.prompts.map(p => `\nExample - ${p.label}:\n${fence(p.text)}`),
].filter(Boolean).join("\n")).join("\n\n")}`).join("\n\n")}`);

const m = DATA.models;
out("models.md", `# Models

## Image models
${table(["Model", "Use it for"], m.image)}

## Video models
${table(["Model", "Use it for", "Cost"], m.video)}

## Supporting tools
${table(["Tool", "Role"], m.other)}

## More tools
${table(["Tool", "Use it for"], m.more)}`);

const v = DATA.vocab, P = DATA.promptParts;
out("vocabulary.md", `# Prompt vocabulary

Prompt order: ${Object.values(P).map(([n]) => n.toLowerCase()).join(" -> ")}.

${([["Camera body", v.camera], ["Lens", v.lens], ["Director / DP style", v.director], ["Lighting", v.lighting], ["Shot size", v.shots], ["Camera angle", v.angles], ["Camera movement", v.moves]] as [string, Pair[]][])
    .map(([h, rows]) => `## ${h}\n${table(["Term", "Effect"], rows)}`).join("\n\n")}

## Annotated examples
${DATA.vocabExamples.map(([label, parts]) => `### ${label}\n${parts.map(([k, t]) => `- ${P[k][0]}: ${t}`).join("\n")}\n\nFull prompt:\n${fence(parts.map(p => p[1]).join(" "))}`).join("\n\n")}`);

const t = DATA.topaz;
out("templates.md", `# Templates

Text in {braces} is filled in from the user's idea.

${DATA.templates.map(([l, x]) => `## ${l}\n${fence(x)}`).join("\n\n")}

## Character sheet checklist
- 16:9 split into 3 equal panels: close-up, front full body, back full body.
- Flat grey background. White blows out skin and makes it look plastic.
- After generating, erase the face on the front full-body panel so the close-up is the only face reference.

## Topaz Video finishing (https://www.topazlabs.com/topaz-video)
Enhancement:
${t.enhancement.map(([k, x]) => `- ${k}: ${x}`).join("\n")}

Frame interpolation:
${t.interpolation.map(([k, x]) => `- ${k}: ${x}`).join("\n")}

${t.notes.map(n => `- ${n}`).join("\n")}`);

const zip = path.join(root, "public", "video-prompt-director.zip");
fs.rmSync(zip, { force: true });
execFileSync("zip", ["-rq", zip, "video-prompt-director", "-x", "*.DS_Store"], { cwd: skills });
console.log("Built references and", path.relative(root, zip));
