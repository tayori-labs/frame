# Frame

Ideas into every frame. A step-by-step guide to AI video generation: workflows per video type, model picks, prompt vocabulary, templates, a Gemini-powered prompt builder and an installable agent skill.

## Run

```
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Gemini key (prompt builder)

Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY`. Without it, visitors can paste their own key on the builder page (stored only in their browser).

## Agent skill

`.agents/skills/video-prompt-director` is generated from `lib/data.ts`. `pnpm build:skill` regenerates its references and `public/video-prompt-director.zip` (also run automatically by `dev` and `build`).

Install it into any agent straight from this repo:

```
npx skills add tayori-labs/frame
```
