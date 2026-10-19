// Model tuple: [name, why]
// Placeholders inside prompts use {curly braces} and are highlighted in the UI.

const STYLE_SNIPPET_CHAR = "in 3 panel character sheet against grey studio background, 1 front facing close up and two full body of front and back, 3D cel-shaded painterly animation in the style of Spider-Verse and Arcane, bold hand-painted brushstrokes, confident graphic line accents.";
const STYLE_SNIPPET_LOC = "3D cel-shaded painterly animation in the style of Spider-Verse and Arcane, bold hand-painted brushstrokes, confident graphic line accents.";

const CHARACTER_SHEET = `{subject description only}.
3-panel character sheet on a flat neutral grey studio background, evenly lit, no environment, no props, no cast shadows on the backdrop.
Panel 1: front-facing close-up of the head and shoulders.
Panel 2: full body, front view, neutral standing pose.
Panel 3: full body, back view, same pose and scale.
Consistent proportions and costume across all three panels.`;

const PROP_SHEET = `{prop description only}.
2-panel prop sheet on a flat neutral grey studio background, evenly lit, no environment, no cast shadows on the backdrop.
Panel 1: front-facing close-up of the {prop}.
Panel 2: full view shot of the {prop}.`;

const SEEDANCE_5_BLOCK = `[1 — ASSET BINDING]
<<<image_1>>> — LOCATION REFERENCE. {terrain, colours, atmosphere, light}. Sounds like {ambient sound}. Use this for the terrain, colour, atmosphere and light of the entire video.
<<<image_2>>> — CHARACTER REFERENCE, {NAME}. Front close-up, full front and full back views of the same person. {face, hair, wardrobe, build, how they move}. Use this for face, hair, wardrobe and build.
<<<image_3>>> — PROP REFERENCE, {PROP}. {materials, colours, details}. Sounds like {prop sound}. {who uses it and how}.

[2 — SUMMARY]
{Who} from <<<image_2>>> {uses/rides/holds} {prop} from <<<image_3>>>. These pairings must never swap.
{2–3 plain-language lines: who, where, what happens, and the feeling.}

[3 — STYLE]
{Live-action / animation genre}. Shot on {camera}, {lens choices per shot type}. {Lighting}. {Colour grade}. {Texture: grain, halation, flare}. {Overall feel}. Photographic realism throughout.

[4 — DETAILED PLOT]
0-3s: {shot size + angle}. {camera motion}. {exact action}.
3-5s: Hard cut. {shot size + angle}. {camera motion}. {exact action}.
5-8s: {transition: hard cut / whip pan / match cut}. {shot}. {motion}. {action}.
{…continue until full duration. Final frame holds on {subject}.}

[5 — OVERALL REQUIREMENTS]
Hold across the entire video: {16:9 / 9:16} frame. {Exact cast count} only — no other people or vehicles. Each character keeps the exact face, hair and wardrobe from their reference sheet in every shot. Consistent grade, grain, lens character and time of day across all shots. Every shot carries a distinct camera move. Stable geometry, no warping of {props/limbs}. {Anything that went wrong last time.}
Audio: sound effects and diegetic sound only. {list sounds}. No BGM, no music, no subtitles.
Strictly avoid: {animation / live-action}, {3D CG render look}, additional characters, text, logos or watermarks, letterboxing or black bars, {slow motion}.`;

const SPEED_RAMP = `[Your scene plays out at normal speed] ... just as [THE EXACT TRIGGER MOMENT], the speed dramatically ramps to [X]% slow motion, [CAMERA MOTION that sells the beat] ... then the speed ramps back to normal [as the action continues].`;

export const DATA = {
  rules: [
    ["Your input frame decides everything", "A strong reference image (character sheet, location, hero frame) matters more than a long prompt."],
    ["Match the model to the task", "Never use one model for everything — realism, text, editing and motion each have a best tool."],
    ["A prompt is a set of dials, not a spell", "Be able to point at any word and say what it controls: camera, lens, director, lighting, shot."],
    ["Generate 2–4 variations per prompt", "Pick the best take. Tweak one dial between iterations, not five."],
    ["SFX only — music in the edit", "Ask for diegetic sound and 'No music'. Add the score yourself so cuts stay in your control."],
    ["Repeat the constraints that drift", "'One single helicopter only', 'these pairings must never swap' — say it in summary AND requirements."],
    ["Feed the last frame forward", "Use the final frame of the previous clip as a placement reference for the next generation."],
    ["Generate 720p, upscale later", "Cheaper generations; Topaz brings it to 1080p/4K and smooths frame rate."],
  ],

  categories: [
    // ---- 1
    {
      id: "stylized",
      name: "Stylized Animation",
      tagline: "Arcane × Spider-Verse look — painterly 3D cel-shaded shorts that feel like a movie.",
      specs: "5–15s per generation · 16:9 or 9:16 · 2–3 cuts per clip",
      steps: [
        {
          title: "Plan the story & asset list",
          req: ["One-line idea (who, where, what happens)", "Target length (split into 5–15s generations)", "Aspect ratio"],
          models: [["Claude Opus 5.5", "Breaks idea into clips + asset list"]],
          alt: [["ChatGPT / Gemini", "Same job if you don't have Claude"]],
          tips: ["Characters + locations are the two assets that power every shot. List vehicles/props separately."],
          prompts: [{
            label: "Story breakdown",
            text: `I want to make a {30}-second stylized animated short in the Arcane × Spider-Verse style.
Idea: {e.g. a street racer is hunted by a police chopper across a neon cyberpunk city}.
1. Split it into {3} Seedance 2.0 generations of 5–15 seconds each, with a 1-line purpose for each (calm intro → build → action payoff).
2. List every asset I need to generate first: characters, vehicles, props, locations — one-line visual description each.
3. Note which clip should reuse the last frame of the previous clip for continuity.`
          }]
        },
        {
          title: "Build character sheets in Midjourney",
          diagram: "charSheet",
          req: ["16:9 canvas, 3 equal panels", "Flat grey background (never white)", "Front close-up + front full-body + back full-body"],
          models: [["Midjourney V8.1 / V7 (raw mode)", "Trained deepest on stylized concept art & comic colour theory"]],
          alt: [["Nano Banana Pro/2", "Fix details, swap outfits"], ["Niji (Midjourney anime model)", "If you want a flatter anime look"]],
          tips: ["Write the subject in plain language, then paste the style snippet at the END of every prompt.", "After generating, erase ONLY the face in the front full-body panel so the AI pulls facial data from the close-up alone."],
          prompts: [
            { label: "Character sheet (paste snippet at end)", text: `{A young Black man, short twist-out hair with high fade, white wired earbud, fine-line neck tattoos, gold rings, cream oversized hoodie, calm focused expression}, ${STYLE_SNIPPET_CHAR} --ar 16:9 --style raw` },
          ]
        },
        {
          title: "Build locations & props",
          diagram: "propSheet",
          req: ["Location: wide, readable lighting", "Props/vehicles: 2-panel sheet on grey"],
          models: [["Midjourney V8.1 / V7 (raw)", "Same style snippet keeps everything coherent"]],
          alt: [["Seedream 5.0", "Good colour combinations", false], ["Nano Banana Pro/2", "Insert or fix elements"]],
          tips: ["Use the location snippet (no character-sheet wording) for environments."],
          prompts: [
            { label: "Location", text: `{Neon-noir cyberpunk skyline at night, towering skyscrapers with cyan, magenta and red signage, a glowing red emblem, a wide bridge spanning toward the city}, ${STYLE_SNIPPET_LOC} --ar 16:9 --style raw` },
            { label: "Vehicle / prop sheet", text: `{Sleek blacked-out modern muscle car, glossy mirror-black, sharp faceted body panels, thin red LED light bars, dark multi-spoke wheels with red calipers}. 2-panel prop sheet on a flat neutral grey studio background, evenly lit, no environment, no cast shadows on the backdrop. Panel 1: front-facing close-up of the {car}. Panel 2: full view shot of the {car}. ${STYLE_SNIPPET_LOC} --ar 16:9 --style raw` },
          ]
        },
        {
          title: "Let Claude write the motion prompt",
          diagram: "fiveBlock",
          req: ["Upload character + location + prop sheets to Claude", "Rough idea of the clip"],
          models: [["Claude Opus 5.5", "Writes Seedance-ready, multi-cut prompts"]],
          alt: [["ChatGPT / Gemini", "Vision-capable alternative"]],
          tips: ["Ask for the 5-block structure (see Templates tab) so every prompt stays consistent."],
          prompts: [{
            label: "Ask Claude",
            text: `I've attached my assets: {image_1 = muscle car sheet, image_2 = city location, image_3 = character sheet}.
Write a Seedance 2.0 prompt for a {13}-second, {3}-cut clip: {calm intro — driver vibing in the parked car before the chase}.
Format:
- Bind each <<<image_N>>> with a precise visual description and what it's a reference for.
- SPATIAL line: where everything sits.
- Style line: "3D cel-shaded painterly animation, Spider-Verse meets Arcane — bold hand-painted brushstrokes, confident graphic linework, visible canvas texture. Cinematic anamorphic framing. Hollywood-level animated cinematography."
- Each CUT: shot size + angle, camera move, speed (normal/fast), exact action.
- SFX only line. No dialogue. No music.`
          }]
        },
        {
          title: "Generate in Seedance 2.0",
          req: ["Upload assets in the same order as the <<<image_N>>> tags", "2–4 generations per prompt"],
          models: [["Seedance 2.0", "Hollywood-level complex shots & VFX, 1080p/2K"]],
          alt: [["Seedance 2.5", "Best adherence, but 720p only and $0.34/s"], ["Kling 3.0", "Cheapest — fine for simple, low-motion shots"]],
          tips: ["Repeat 'one single helicopter only' type constraints in every cut to stop duplicates.", "Use a frame from the previous output as a placement reference (e.g. car's position on the bridge)."],
          prompts: [
            {
              label: "Example — calm intro (13s, 3 cuts)", text: `<<<image_3>>> — Young Black man, short twist-out hair with high fade, white wired earbud in his ear, fine-line neck and hand tattoos, gold rings, cream oversized hoodie, calm focused expression. For Character reference.
<<<image_1>>> — Sleek blacked-out modern muscle car, glossy mirror-black, sharp faceted body panels, thin red LED light bars front and rear, dark multi-spoke wheels with red calipers. Vehicle reference, all angles.
<<<image_2>>> — Neon-noir cyberpunk skyline at night, towering skyscrapers with cyan, magenta and red signage, a glowing red emblem, a wide bridge spanning toward the city. Environment, location and lighting reference.
SPATIAL: <<<image_3>>> sits low inside <<<image_1>>>. <<<image_1>>> is parked on the left edge of a wide bridge in <<<image_2>>>, the neon skyline filling the background. Night, dry road, clear air.
3D cel-shaded painterly animation, Spider-Verse meets Arcane — bold hand-painted brushstrokes, Cinematic anamorphic framing, Hollywood-level animated cinematography. A multi-cut sequence of 13 seconds duration, calm and atmospheric — the stillness before the chase.
CUT — extreme macro close-up, slow smooth dolly-back with a slight arc, normal speed — opens tight on the white wired earbud seated in <<<image_3>>>'s ear, diamond stud subtly glinting beside it, the cable trailing down his neck past a fine-line tattoo. The camera pulls back and arcs around, revealing <<<image_3>>> low in the seat, warm amber light on his face against the cool blue night, head tipped back, eyes half-closed, subtly nodding to the music, tattooed ringed hand loose on the wheel.
CUT — low diagonal angle, slow creeping push, normal speed — camera low and off the front corner of <<<image_1>>>, front and side together in one diagonal view, red light bars glowing, neon rim-lighting every faceted edge. Slow, deliberate — savoring the car. Coiled, cool, ready.
CUT — wide establishing shot, slow majestic jib up, normal speed — <<<image_1>>> parked on the left edge of the wide bridge, small against the vast glowing <<<image_2>>> skyline. The camera cranes slowly upward and back. Serene, breathtaking, still.
SFX only: distant neon-city hum and electrical buzz, the faint tick of the parked engine, a low ambient bass drone. No dialogue. No music.` },
            {
              label: "Example — chopper arrives (5s, 2 cuts)", text: `<<<image_4>>> — a single police patrol helicopter, dark red and black body with a white-and-red side stripe, bubble cockpit with two helmeted officers, a powerful white searchlight beam underneath. One helicopter only.
<<<image_1>>> — sleek blacked-out modern muscle car (as above). Vehicle reference.
<<<image_2>>> — neon-noir cyberpunk skyline at night with a wide bridge. Environment, location and lighting reference.
<<<image_3>>> is only for reference of the car's placement on the bridge. Frame from the previous video output.
SPATIAL: the black muscle car is parked on the left side of the bridge, facing forward. The chopper approaches from behind and above, descending toward it. One single helicopter throughout.
3D cel-shaded painterly animation, Spider-Verse meets Arcane — bold hand-painted brushstrokes, confident graphic linework, visible canvas texture. Cinematic anamorphic framing, dynamic kinetic camera. A two-cut sequence of 5 sec duration.
CUT — fast dynamic shot, rapid whip zoom, fast speed — a single patrolling chopper tears across the frame against the neon skyline, rotor blades blurring, searchlight sweeping. Only one helicopter in frame.
CUT — high aerial over-the-shoulder shot looking straight down, smooth descending push, normal speed — the camera rides above and behind the chopper as it drops into the foreground, looking down at the black muscle car on the bridge. The searchlight locks onto the car, pinning it in a bright pool of light. One single helicopter only.
SFX only: heavy rotor chop building from a distant thud to a loud overhead beat, wind, tense low droning bass, faint electric hum of the city. No dialogue. No music.` },
            {
              label: "Example — the chase (10s, 3 cuts)", text: `{Bind car, helicopter, city, and police cruiser references as <<<image_1..5>>>.}
SPATIAL: the black muscle car races through the canyon streets of the neon city at night, pursued by police cruisers and tracked from above by the single chopper with its searchlight. One helicopter throughout. High-speed chase.
3D cel-shaded painterly animation, Spider-Verse meets Arcane — bold hand-painted brushstrokes, confident graphic linework, visible canvas texture. Cinematic anamorphic framing, aggressive kinetic handheld camera, heavy motion blur, speed lines. A three-cut high-action sequence of 10 seconds duration.
CUT — low chase tracking shot, camera racing along the asphalt behind the car, fast speed — weaving between traffic, skyscrapers streaking past in heavy motion blur, two police cruisers with red-and-blue strobes chasing, the chopper's searchlight raking across the car. Speed lines, violent energy.
CUT — high aerial god's-eye shot, sweeping fast crane move, fast speed — straight down on the neon grid, the car a small dark dart cutting through glowing avenues, the searchlight chasing it as a moving pool of white light. One helicopter only.
CUT — low front three-quarter hero angle, hard tracking-backward push, fast speed — camera racing backward ahead of the car as it powers toward the lens, headlights blazing, cyan and magenta reflections on the faceted body, strobes flaring behind. Explosive forward drive.
SFX only: engine at full throttle, tires screeching, heavy chopper chop, wailing sirens, wind, driving low bass rumble. No dialogue. No music — music added in edit.` },
          ]
        },
        {
          title: "Upscale, edit, add music",
          req: ["Best takes from each clip", "Topaz Video (see Finishing tab)", "Editor + music track"],
          models: [["Topaz Video (Proteus + Apollo)", "Upscale + frame interpolation"]],
          alt: [["CapCut / DaVinci Resolve", "Cut, colour match, music"]],
          tips: ["Instagram: export 1080×1920 at 30 FPS — anything higher gets recompressed anyway."],
          prompts: []
        },
      ]
    },

    // ---- 2
    {
      id: "film",
      name: "Cinematic Filmmaking",
      tagline: "Live-action short films, trailers and scenes that look shot on a real camera.",
      specs: "10–20s per generation · 16:9 (2.39:1 feel) · 4–8 beats per clip",
      steps: [
        {
          title: "Write the scene as beats",
          req: ["Logline + mood", "Duration per clip", "Cast & props list"],
          models: [["Claude Opus 5.5", "Scene breakdown + shot list"]],
          alt: [["ChatGPT / Gemini", "Alternative"]],
          tips: ["Every beat answers 4 questions: shot size + angle, camera motion, action, transition."],
          prompts: [{
            label: "Beat sheet",
            text: `Act as a film director and cinematographer. Break this scene into a {20}-second shot list for an AI video model.
Scene: {a black-eyed woman on a skull-nosed scrambler chases a studded leather-clad rider across a red desert; she fires, misses as he jumps a ravine; he smirks back}.
For each beat give: timecode, shot size + angle, camera motion, the exact action, and the transition into the next beat (hard cut, whip pan, match cut).
Then list every character and prop that needs its own reference sheet.`
          }]
        },
        {
          title: "Choose your look (the dials)",
          diagram: "promptMap",
          req: ["Camera body", "Lens", "Director / DP style + film vibe", "Lighting type", "Palette + mood"],
          models: [["Your vocabulary", "See the Vocabulary tab"]],
          alt: [],
          tips: ["Formula: Shot on {camera}, {lens}, in the style of {director}, {film} vibe. {subject + action}. {environment}. {lighting}. {palette}, {mood}."],
          prompts: [{
            label: "Look formula",
            text: `Shot on {ARRI Alexa 65}, {Panavision Sphero 65 40mm lens}, in the style of {Denis Villeneuve}, {Blade Runner 2049} vibe. {Subject and action}. {Environment}. {Lighting: diffused sunless glow / hard midday sun / chiaroscuro}. {Palette}, {mood}.`
          }]
        },
        {
          title: "Generate hero frames",
          req: ["One still per key shot (your input frame)", "Same look line across all stills"],
          models: [["Soul 2.0", "Best photoreal humans, skin, lighting"], ["Soul Cinema", "Film-grade stills, movie composition"]],
          alt: [["Midjourney", "More artistic / experimental looks"], ["Flux (image)", "Strong photoreal stills"]],
          tips: ["Your input frame decides everything — don't move to video until the still is right."],
          prompts: [
            { label: "Epic sci-fi (Villeneuve)", text: `Shot on ARRI Alexa 65, Panavision Sphero 65 40mm lens, in the style of Denis Villeneuve, Blade Runner 2049 vibe. A lone figure in a long charcoal coat walks through a vast orange dust storm, dwarfed by the colossal weathered statue of a seated woman half-buried in sand beside them, the horizon dissolving into glowing amber haze. Monumental scale, tiny human in enormous negative space, diffused sunless glow, silhouetted forms, dust suspended in the air. Saturated burnt-orange and ochre palette, deep shadow, silent and monumental.` },
            { label: "Thriller (Fincher)", text: `Shot on RED Monstro 8K, Zeiss Master Prime 32mm, in the style of David Fincher, Zodiac vibe. A man in a rumpled shirt sits alone in a fluorescent-lit 1970s newsroom at 2am, surrounded by paper stacks, mid-thought with a pen against his lip. Locked-off symmetrical frame, cold green-tinted overheads, sickly institutional palette, fine skin texture and tired under-eye shadow, clinical stillness, dread underneath.` },
            { label: "Melancholic drama (Cuarón)", text: `Shot on Kodak Vision3 500T, 24mm wide-angle lens, in the style of Alfonso Cuarón, 1917 continuous war-film grade vibe. A woman in a polka dot frock with brunette hair drives an expensive luxury car down a busy New York street, looking away from the camera, her hair flying in the wind. Vivid colour palette, melancholic mood, fashion-film framing, evening sky and buildings behind, halation.` },
            { label: "Romantic (Tarantino / Godfather grade)", text: `Shot on RED V-Raptor, 35mm lens, in the style of Quentin Tarantino, The Godfather warm amber grade. A woman seated alone near a fountain in Italy in her wedding dress, bouquet in hand, wearing her veil, romantic yet sad, sunny blue sky, local people in the background, rich palette, pleasant.` },
          ]
        },
        {
          title: "Lock characters & props",
          diagram: "charSheet",
          req: ["16:9 three-panel sheet per character", "Grey background", "Face erased on front full-body panel", "2-panel sheet per prop"],
          models: [["Soul 2.0", "Realistic character sheets"], ["Nano Banana Pro/2", "Surgical fixes, outfit swaps, face erase"]],
          alt: [["GPT 2.0", "General editing"], ["Photoshop / any editor", "Grey brush over the full-body face", false]],
          tips: ["White backgrounds blow out skin — grey gives natural tones and real shadows.", "Same-size panels only; random layouts make the face get averaged and drift."],
          prompts: [
            { label: "Character sheet", text: CHARACTER_SHEET.replace("{subject description only}", "{Photorealistic: pale woman, large solid black eyes, extremely long straight platinum blonde hair, dark iridescent metallic green turtleneck bodysuit, gold chain belt, hot pink spiked boots}") },
            { label: "Prop sheet", text: PROP_SHEET },
            { label: "Erase face (Nano Banana)", text: `Edit this character sheet: in the MIDDLE panel only, paint over the face with flat neutral grey matching the background. Keep every other pixel, panel and detail exactly identical.` },
          ]
        },
        {
          title: "Write the 5-block video prompt",
          diagram: "fiveBlock",
          req: ["All sheets uploaded to Claude", "Your beat sheet"],
          models: [["Claude Opus 5.5", "Fills the 5-block Seedance structure"]],
          alt: [["ChatGPT / Gemini", "Alternative"]],
          tips: ["Block 5 is where you list what went wrong last time.", "Describe sounds per asset in Block 1 — the model ties audio to visuals."],
          prompts: [
            {
              label: "Ask Claude", text: `Using my attached reference sheets and the beat sheet below, write a Seedance prompt in exactly these 5 blocks:
[1 — ASSET BINDING] describe every <<<image_N>>>, what it is a reference for, and what it sounds like.
[2 — SUMMARY] who uses which asset ("these pairings must never swap") + 2–3 lines of plot and feeling.
[3 — STYLE] camera, lenses per shot type, lighting, grade, grain, overall feel.
[4 — DETAILED PLOT] timecoded beats; each with shot size + angle, camera motion, action, transition.
[5 — OVERALL REQUIREMENTS] aspect ratio, cast count, consistency rules, audio rules (SFX only, no music), strictly avoid list.
Beat sheet: {paste}` },
            { label: "Blank 5-block template", text: SEEDANCE_5_BLOCK },
          ]
        },
        {
          title: "Generate the video",
          req: ["References uploaded in tag order", "3–4 takes per prompt"],
          models: [["Seedance 2.5", "Best realism, acting & prompt adherence — 720p, $0.34/s"], ["Seedance 2.0", "Complex shots & VFX at 1080p/2K"]],
          alt: [["Flux 3", "Raw retro realism, closest to Seedance, $0.17/s"], ["Kling 3.0", "Cheapest, simple low-motion shots"], ["MiniMax H3", "~1/3 of Seedance cost but often plastic"], ["Google Veo", "Strong realism with native audio"]],
          tips: ["Generate at 720p and upscale — the cost difference adds up fast on 20s clips."],
          prompts: []
        },
        {
          title: "Fix shots without regenerating",
          req: ["The take that's 90% right"],
          models: [["Seedance 2.5", "Best video editing/manipulation"], ["Gemini Omni Flash", "Cheap decent video edits (~$0.10/s at 720p)"]],
          alt: [["Runway (video-to-video)", "Restyle / object edits"]],
          tips: ["Gemini Omni Flash is for editing only — not text-to-video or image-to-video."],
          prompts: [{ label: "Video edit", text: `Keep the entire video identical — same camera move, timing, characters, lighting and grade. Only change: {remove the extra rider in the background from 4s onward / make the laser bolt bright saturated green / stop the wheel from warping on landing}.` }]
        },
        {
          title: "Upscale, grade, sound design",
          req: ["Topaz settings (Finishing tab)", "Editor", "Score / music"],
          models: [["Topaz Video", "Upscale + interpolation"]],
          alt: [["DaVinci Resolve", "Colour match across clips"], ["ElevenLabs / Suno", "Extra SFX, voice, score"]],
          tips: [],
          prompts: []
        },
      ]
    },

    // ---- 3
    {
      id: "ugc",
      name: "UGC Content",
      tagline: "Selfie-style creator videos: reviews, unboxings, testimonials, talking heads.",
      specs: "15–30s · 9:16 vertical · hook in first 2s",
      steps: [
        {
          title: "Script the hook",
          diagram: "ugcTimeline",
          req: ["Product + 1 key benefit", "Target viewer", "15–30s length"],
          models: [["Claude Opus 5.5", "Hooks + scripts"]],
          alt: [["ChatGPT", "Alternative"]],
          tips: ["Keep each spoken line under ~8 seconds — one line per generation is easiest to lip-sync."],
          prompts: [{
            label: "UGC scripts", text: `Write 3 UGC scripts for {product} aimed at {target viewer}, {20} seconds each, 9:16.
Structure: Hook (0–2s, pattern-interrupt line) → Problem (2–6s) → Demo/proof (6–15s) → CTA (15–20s).
Spoken like a real person filming on their phone: casual, a little imperfect, no marketing words.
For each line, add a one-line visual note (selfie talking, hands-on product close-up, B-roll).` }]
        },
        {
          title: "Create the creator persona",
          diagram: "charSheet",
          req: ["Age, look, setting that matches the audience", "Phone-camera realism"],
          models: [["Soul 2.0", "Most believable skin and lighting"]],
          alt: [["Nano Banana Pro/2", "Change outfit/room while keeping the face"], ["Flux (image)", "Photoreal alternative"]],
          tips: ["'Shot on iPhone 15 Pro' gives modern phone realism and a candid feel.", "Make a 3-panel character sheet of the persona so every clip keeps the same face."],
          prompts: [
            { label: "Persona selfie frame", text: `Shot on iPhone 15 Pro, front camera, handheld selfie angle at arm's length. A {26-year-old woman with curly dark hair, light freckles, no-makeup look, oversized grey sweatshirt} sitting on her bed in a {small, lived-in apartment bedroom}, soft window daylight from the side, slightly messy background. Candid, mid-sentence expression, natural skin texture with pores, imperfect framing, 9:16 vertical. No text, no logos.` },
            { label: "Persona character sheet", text: CHARACTER_SHEET.replace("{subject description only}", "{Photorealistic: the same woman — curly dark hair, light freckles, oversized grey sweatshirt, joggers}") },
          ]
        },
        {
          title: "Put the real product in her hands",
          req: ["Clean product photo", "Legible label"],
          models: [["Nano Banana Pro/2", "Insert subjects/products precisely"], ["GPT 2.0", "Cleanest text/label rendering"]],
          alt: [["Reve", "Clean branded finish"]],
          tips: ["Use the product photo as a second reference so the packaging doesn't get reinvented."],
          prompts: [{ label: "Product insert", text: `Using image 1 (the creator) and image 2 (the product): place the exact product from image 2 in her right hand, held toward the camera at chest height. Keep the label text, colours and shape identical to image 2. Keep her face, clothes, room and lighting unchanged. Natural grip, realistic scale.` }]
        },
        {
          title: "Generate the talking-head clips",
          req: ["Persona frame with product", "One script line per clip", "9:16"],
          models: [["Seedance 2.5", "Best acting & lip movement"], ["Gemini Omni Flash", "Good talking heads, best value (~$0.10/s)"]],
          alt: [["Google Veo", "Native speech + lip-sync from text"], ["HeyGen / Arcads", "Avatar UGC with your own voice track"], ["ElevenLabs", "Generate the voice-over separately"]],
          tips: ["Put dialogue in quotes and state the tone of voice.", "Ask for slight handheld shake — locked-off cameras read as fake UGC."],
          prompts: [{
            label: "Talking head", text: `<<<image_1>>> — the creator holding {product}. Character, product, room and lighting reference.
[SUMMARY] The woman from <<<image_1>>> films herself on her phone in her bedroom, talking excitedly to camera about {product}.
[STYLE] Shot on iPhone 15 Pro front camera, handheld selfie at arm's length, subtle natural hand shake, soft window daylight, natural skin texture, candid social-media realism, 9:16 vertical.
[PLOT] 0-6s: Medium close-up selfie. She leans in, raises the product next to her face and says, in a casual, slightly surprised tone: "{Okay, I didn't expect this to actually work, but look at this.}" Small natural gestures, eye contact with the lens, a quick laugh at the end.
[REQUIREMENTS] Same face, hair, outfit and product label throughout; label stays legible. Accurate lip-sync to the dialogue. Room tone and her voice only, no music, no subtitles.
Strictly avoid: studio lighting, cinematic depth of field, extra people, warped hands or text, watermarks.` }]
        },
        {
          title: "Generate B-roll inserts",
          req: ["Product close-ups, hands-on demo, texture shots"],
          models: [["Kling 3.0", "Cheapest, crisp 1080p for simple motion"]],
          alt: [["Seedance 2.0", "If the shot needs liquid/VFX motion"]],
          tips: [],
          prompts: [{ label: "B-roll", text: `Shot on iPhone 15 Pro, close-up, handheld. Her hand {twists open the cap of the product and squeezes a small amount onto her fingertip}, soft window daylight, natural skin, slight focus breathing, 9:16. Label stays sharp and legible. No music.` }]
        },
        {
          title: "Edit, caption, upscale",
          req: ["Cut to the beat of speech", "Big burned-in captions"],
          models: [["Topaz Video", "1080×1920 @ 30 FPS for Instagram/TikTok"]],
          alt: [["CapCut", "Auto-captions, fast UGC edits"]],
          tips: ["Cut every 2–3s; open on the hook line, not a logo."],
          prompts: []
        },
      ]
    },

    // ---- 4
    {
      id: "motion",
      name: "Motion Graphics",
      tagline: "Code-drawn 2D animation — explainers, infographics, loops. No video model involved.",
      specs: "15s recommended · any ratio · ~25–30 min build per 15s",
      steps: [
        {
          title: "Pick a style that code draws well",
          req: ["1–3 reference images or videos (style only)"],
          models: [["Midjourney / Recraft V4.1", "Make style references if you have none"]],
          alt: [["Pinterest / Dribbble", "Find references instead of generating"]],
          tips: ["Best: flat vector, minimal line art, paper-cut / layered, grainy risograph.", "Skip photorealism here — that's a job for video models."],
          prompts: [{ label: "Style reference", text: `Flat vector illustration of {a tiny astronaut watering a plant on a floating island}, limited {4}-colour palette ({cream, coral, navy, mustard}), clean geometric shapes, subtle grainy risograph texture, generous negative space, no gradients on outlines --ar 9:16` }]
        },
        {
          title: "Install the tools",
          diagram: "motionPipeline",
          req: ["Claude Code desktop app (not web)", "Google Chrome (renders frames)", "ffmpeg (joins frames + audio into MP4)", "The motion-studio animation skill (skill.md)"],
          models: [["Claude Code + Opus 5.5 (high)", "Best quality/usage balance"]],
          alt: [],
          tips: ["Drag skill.md into Claude Code and say 'Install this as a personal skill'.", "Open a NEW chat afterwards — the old chat won't see the skill.", "Install ffmpeg on macOS: brew install ffmpeg"],
          prompts: [{ label: "Install message", text: `Install this as a personal skill.` }]
        },
        {
          title: "Give the brief",
          req: ["Type /motion-studi… and select the skill", "References uploaded", "Topic, duration, ratio"],
          models: [["Claude Code (Opus 5.5 high)", "Plans hook → build-up → payoff, draws every frame"]],
          alt: [],
          tips: ["References act as STYLE only — say so explicitly if you also want the subject copied.", "A rough idea is enough; the skill does the directing."],
          prompts: [{
            label: "Brief", text: `/motion-studio
Make a {15}-second {9:16} animation about {how compound interest works}.
Use the attached references for STYLE only (shapes, palette, texture, line weight) — not their subject.
Structure it as a mini-film: hook (0–3s), build-up, payoff ending on {a single bold number}.
Compose a soundtrack in code synced to the key beats. Export a ready-to-post MP4.` }]
        },
        {
          title: "Review sample frames & iterate",
          req: ["Patience — usage limits hit fast"],
          models: [["Claude Code", "Checks frames and fixes what looks off"]],
          alt: [],
          tips: ["Expect 25–30+ minutes per 15s. Check usage in between."],
          prompts: [{ label: "Iteration", text: `Show me frames at {2s, 7s and 12s}. Then fix: {the title text is too small on mobile; slow the transition at 6s; make the grain subtler}. Re-render only the affected section, then re-export the MP4.` }]
        },
        {
          title: "Alternatives without the skill",
          req: [],
          models: [],
          alt: [["Remotion", "Video as React code — Claude can write it"], ["Motion Canvas", "Code-driven explainer animation"], ["After Effects / Jitter", "Manual motion design tools"], ["Kling 3.0", "Animate a flat illustration image-to-video (simple motion)"]],
          tips: [],
          prompts: [{ label: "Remotion via Claude Code", text: `Create a Remotion project that renders a {15}-second {1080×1920} flat-vector animation about {topic}. Palette {hex codes}. Scenes: {hook}, {build-up}, {payoff}. Use spring easing, no stock assets — draw everything with SVG. Render to out/video.mp4.` }]
        },
      ]
    },

    // ---- 5
    {
      id: "slowmo",
      name: "Slow-Motion & Sports",
      tagline: "Speed-ramped action — sportswear ads, impact shots, hero moments.",
      specs: "10s · 3 shots · 9:16 · normal → ~10% → normal",
      steps: [
        {
          title: "Create the reference frame",
          req: ["Athlete + location + art style + lighting in ONE frame"],
          models: [["Soul 2.0 / Soul Cinema", "Photoreal athlete, commercial look"]],
          alt: [["Midjourney", "Stylized version"], ["Nano Banana Pro/2", "Fix shoes, logos, outfit details"]],
          tips: [],
          prompts: [{ label: "Reference frame", text: `Shot on 35mm, long lens, premium sportswear commercial. A lean, powerfully built young sprinter, short hair, deeply tanned, cropped black-blue patterned sleeveless vest, black running shorts, neon volt-yellow racing shoes, in a coiled starting stance on an empty red rubberized track with crisp white lane lines, green infield, dense treeline behind, clear teal-blue sky. Harsh high midday sun, hard short shadows, specular highlights on skin. Organic film grain, gentle halation, muted cool grade, 9:16.` }]
        },
        {
          title: "Plan the speed curve",
          diagram: "speedRamp",
          req: ["The exact trigger moment (impact, takeoff, splash)", "Where the ramp down and ramp up happen"],
          models: [["Claude Opus 5.5", "Turns your idea into a timed shot list"]],
          alt: [],
          tips: ["Think like an editor: full speed → dramatic drop at the impact beat → back to normal. The contrast is what makes it cinematic.", "Slow-mo must look like real high-frame-rate footage — explicitly ban motion blur in that section."],
          prompts: [
            { label: "Speed-ramp structure", text: SPEED_RAMP },
            {
              label: "Key phrases", text: `Normal speed.
Speed ramp down into slow motion at the {3}-second mark.
Extreme slow motion, roughly {10}% speed.
Speed ramp back up to normal at the {7}-second mark.
The speed ramps rapidly back to full.` },
          ]
        },
        {
          title: "Write the full sectioned prompt",
          req: ["Reference frame", "Speed plan"],
          models: [["Seedance 2.5", "Best realism + adherence"], ["Seedance 2.0", "1080p/2K"]],
          alt: [["Flux 3", "Cheaper realism"], ["Kling 3.0", "Only for simple slow pans — weak at complex ramps"]],
          tips: [],
          prompts: [{
            label: "Full example — sprinter", text: `<<<image_1>>> is the reference for the location, the runner, the art style and the lighting for the entire video. He is the only person on the track.
One-sentence summary: A lone sprinter drives off the line and runs down an empty track under hard midday sun, live-action premium sportswear commercial style, three shots ramping from full speed into extreme slow motion and back at the finish.
[Subject] The man from <<<image_1>>>. Lean, powerfully built young runner, short hair, deeply tanned, cropped black-blue patterned sleeveless vest, black running shorts, low black ankle socks, sports watch on left wrist, neon volt-yellow racing shoes with a thin white stripe. Total focus, teeth set, driving hard.
[Environment] Red rubberized outdoor track with crisp white lane lines, green grass infield, tall dense treeline, white goalposts, thin flagpole, low metal fence. Clear teal-blue sky.
[Lighting] Harsh high midday sun, hard-edged short shadows, bright specular highlights on skin, sweat and shoes. Strong natural contrast, no fill.
[Style] Live-action cinematic film, shot on 35mm, organic film grain, shallow depth of field on a long lens, gentle halation, muted cool grade with warm red track against teal sky. Photographic realism.
[Shot list — 10 seconds, 3 shots]
0-3s: Normal speed. Extreme low shot at ground level, camera pressed to the track, tight on the neon shoes in a coiled stance across the lane line. Slow push in. He explodes off the line, grit spitting up, feet slam past over the lens. At 3s a speed ramp begins.
3-7s: Extreme slow motion, roughly 10% speed. Two full stride cycles. Lateral trucking shot at mid-body height, lane lines and treeline streaking behind. Shoe sole compressing and rebounding, quads flexing, sweat droplets suspended in the air, singlet rippling. Speed ramp back up to normal at the 7-second mark.
7-10s: Extreme close-up on his face, camera travelling backward at his speed. Speed ramps rapidly back to full — breathing hits real time, chest heaving, gasping. He crosses the finish line alone, slows to a walk, hands on head. Final frame holds wide on him alone in the lane.
[Overall requirements] Vertical 9:16. Consistent grade, grain and lens across all shots. Every shot carries a distinct move. Slow-motion reads as genuine high-frame-rate: crisp, suspended sweat and grit, not blurred. Correct running biomechanics, no warping of limbs or shoes. Natural audio only: shoe strikes, breathing dropping into a low stretched drone in slow-mo then snapping back to ragged panting, wind, distant birds. No BGM. No subtitles.
[Strictly exclude] Animation, illustration, painterly texture, 3D CG render, video game look, additional runners, spectators, text, logos, watermarks, letterboxing, motion blur during the slow-motion section.` },
          { label: "Adapt to any sport", text: `{Your scene plays out at normal speed: a skateboarder rolls toward a 10-stair handrail} ... just as {his board leaves the lip}, the speed dramatically ramps to {10}% slow motion, {the camera orbits 90° around him at normal speed as the board flips beneath his feet, every grain of dust suspended} ... then the speed ramps back to normal {as he lands, wheels slamming the concrete, and rolls away}.` }]
        },
        {
          title: "Upscale & smooth in Topaz",
          diagram: "topazFlow",
          req: ["Generate at 720p to save cost"],
          models: [["Topaz Video", "Proteus enhancement + Apollo interpolation"]],
          alt: [],
          tips: ["See the Finishing tab for the exact settings."],
          prompts: []
        },
      ]
    },

    // ---- 6
    {
      id: "product",
      name: "Product Ads & Branding",
      tagline: "Product hero shots, posters and short commercial spots.",
      specs: "5–15s · 1:1, 4:5 or 9:16 · end card with text",
      steps: [
        {
          title: "Product reference sheet",
          diagram: "propSheet",
          req: ["Real product photos (if it exists)", "2-panel grey sheet"],
          models: [["Nano Banana Pro/2", "Clean up real photos, remove background clutter"], ["Reve", "Clean branded product renders"]],
          alt: [["Recraft V4.1", "Design-y, illustrated product looks"]],
          tips: [],
          prompts: [{ label: "Product sheet", text: PROP_SHEET.replace("{prop description only}", "{A matte black 500ml insulated water bottle with a brushed steel cap and a small embossed white logo}") }]
        },
        {
          title: "Hero still",
          req: ["Surface, lighting, mood", "Lens choice (macro for texture)"],
          models: [["Reve", "Clean ad finish"], ["Soul Cinema", "Cinematic product moments"]],
          alt: [["Midjourney", "Bolder art direction"]],
          tips: ["'Macro lens' for texture, 'Zeiss Master Prime' for clinical sharpness, 'soft light' for premium calm, 'hard light' for drama."],
          prompts: [{ label: "Hero still", text: `Shot on Sony Venice 2, macro lens, premium commercial. {The matte black bottle} standing on {wet black slate}, droplets beading on its surface, one hard rim light from behind carving its silhouette, soft fill from the front, dark moody background with faint volumetric haze. Clinically sharp, high contrast, {4:5}. No text.` }]
        },
        {
          title: "Poster / text-heavy frames",
          req: ["Exact headline + tagline text", "Brand colours"],
          models: [["GPT 2.0", "Cleanest typography"], ["Seedream 5.0", "Posters with good colour/design"], ["Recraft V4.1", "Refined poster detail & branding"]],
          alt: [["Ideogram", "Strong text rendering"]],
          tips: ["Put exact text in quotes and say where it goes."],
          prompts: [{ label: "Poster", text: `Minimal product poster, {4:5}. {The matte black bottle} centered on a {deep forest-green} background with soft studio light. Headline at top in bold condensed sans-serif: "{STAY COLD. 24 HOURS.}" Small tagline at bottom: "{Built for the long day.}" Plenty of negative space, clean grid alignment, no other text.` }]
        },
        {
          title: "Animate the product",
          req: ["Hero still as start frame"],
          models: [["Kling 3.0", "Simple turntables & slow pushes — lowest cost"], ["Seedance 2.0", "Splashes, particles, VFX reveals"]],
          alt: [["Seedance 2.5", "Max realism"], ["Google Veo", "Alternative"]],
          tips: ["Keep logo stable: add 'no warping of the logo or label' to every prompt."],
          prompts: [
            { label: "Simple (Kling 3.0)", text: `<<<image_1>>> start frame. Slow smooth 90° orbit around the bottle, normal speed, droplets slowly sliding down its surface, rim light gliding across the edge. Locked focus on the product. No warping of the logo or cap. No text.` },
            {
              label: "VFX reveal (Seedance 2.0)", text: `<<<image_1>>> — PRODUCT REFERENCE, the bottle. Use for shape, finish and logo.
0-2s: Darkness. A crack of hard rim light reveals the bottle's silhouette. Slow push in.
2-4s: Hard cut. Ice-cold water erupts upward around the bottle in a frozen crown splash, extreme slow motion, roughly 10% speed, every droplet crisp.
4-6s: Speed ramps back to normal; frost blooms across the surface as the camera arcs to a clean front hero angle. Final frame holds.
Requirements: stable product geometry and logo, no text, premium commercial grade. SFX only: low whoosh, liquid splash, crackle of frost. No music.` },
          ]
        },
        {
          title: "Upscale & assemble",
          req: ["Clips + poster end card"],
          models: [["Topaz Video", "1080p/4K"]],
          alt: [["CapCut / DaVinci Resolve", "Edit + music + end card"]],
          tips: [],
          prompts: []
        },
      ]
    },
  ],

  models: {
    image: [
      ["Soul 2.0", "Best realism — photoreal humans, natural skin, believable light."],
      ["Soul Cinema", "Film-grade cinematic stills — dramatic light, filmic colour."],
      ["GPT 2.0", "Text-heavy images (signage, UI, posters) + general editing."],
      ["Nano Banana Pro/2", "Surgical editor — insert subjects, fix flaws, swap outfits/locations."],
      ["Midjourney V8.1 / V7", "Artistic & stylized. Raw mode for Arcane/Spider-Verse sheets."],
      ["Reve", "Branding, product design, ads, posters — clean finish."],
      ["Seedream 5.0", "Posters, labels, UI — good colour combos and design."],
      ["Recraft V4.1", "Refined posters, illustrations, branding."],
    ],
    video: [
      ["Seedance 2.5", "State of the art. Best realism, acting, adherence and video editing. 720p only.", "$0.34/s"],
      ["Seedance 2.0", "Hollywood-level complex shots & VFX. 1080p & 2K.", "High"],
      ["Flux 3", "Raw retro realism, closest to Seedance.", "$0.17/s HD"],
      ["Kling 3.0", "Crisp 1080p when no complex motion is needed.", "Lowest"],
      ["MiniMax H3", "Cheap, but outputs often look plastic.", "$0.13/s 2K · $0.08/s 768p"],
      ["Gemini Omni Flash", "Video editing only + talking heads. Best value.", "~$0.10/s 720p"],
    ],
    other: [
      ["Claude Opus 5.5", "Writes motion prompts from your uploaded sheets; Claude Code draws code animations."],
      ["Topaz Video", "Upscale 720p → 1080p/4K + frame interpolation."],
    ],
    more: [
      ["Google Veo", "Realistic video with native audio and dialogue — strong for UGC talking heads."],
      ["Runway", "Video-to-video restyling and edits."],
      ["HeyGen / Arcads", "Avatar-based UGC with lip-sync to your script."],
      ["ElevenLabs", "Voice-over and sound effects."],
      ["Suno", "Background music / score."],
      ["Ideogram", "Alternative for text-in-image posters."],
      ["Remotion / Motion Canvas", "Code-driven motion graphics."],
      ["CapCut / DaVinci Resolve", "Editing, captions, colour grading."],
    ],
  },

  vocab: {
    camera: [
      ["shot on ARRI Alexa 65", "Large-format — epic, clean, blockbuster scale"],
      ["shot on ARRI Alexa 35", "Gritty, textured realism, rich natural colour"],
      ["shot on ARRI Alexa Mini LF", "Modern premium commercial look"],
      ["shot on RED Komodo", "Sharp, punchy, high-detail digital"],
      ["shot on RED V-Raptor", "Ultra-high-res, crisp hero-shot quality"],
      ["shot on Sony Venice 2", "Clean, filmic, beautiful highlight roll-off"],
      ["shot on Panavision Millennium XL2", "Classic Hollywood prestige"],
      ["shot on Canon C500 Mark II", "Run-and-gun documentary realism"],
      ["shot on Kodak Portra 400 film", "Warm skin, gentle grain, nostalgic"],
      ["shot on Kodak Vision3 500T", "Cinematic stock, tungsten-balanced"],
      ["shot on 16mm film", "Heavy grain, raw indie texture"],
      ["shot on 35mm film", "Classic cinema grain, organic depth"],
      ["shot on 65mm IMAX", "Massive resolution, monumental scale"],
      ["shot on Super 8 film", "Vintage home-movie, dreamy"],
      ["shot on iPhone 15 Pro", "Modern phone realism, candid (UGC)"],
    ],
    lens: [
      ["anamorphic lens", "2.39:1 scope, oval bokeh, horizontal flares"],
      ["vintage spherical prime lens", "Soft imperfect glass, organic character"],
      ["Cooke S4 prime lens", "Flattering, warm, painterly skin"],
      ["Zeiss Master Prime lens", "Clinically sharp, modern precision"],
      ["Petzval lens", "Swirly vintage bokeh, dreamy vignette"],
      ["14mm ultra-wide lens", "Dramatic scale, strong edge distortion"],
      ["24mm wide-angle lens", "Expansive environment"],
      ["35mm lens", "Natural, versatile cinematic framing"],
      ["50mm lens", "Human-eye perspective"],
      ["85mm portrait lens", "Compressed background, creamy bokeh"],
      ["135mm telephoto lens", "Heavy compression, isolated subject"],
      ["macro lens, extreme close-up", "Pores, texture, product detail"],
      ["shallow depth of field", "Subject sharp, background melted"],
      ["deep focus, everything sharp", "Front-to-back crisp, Kubrick-style"],
      ["anamorphic lens flare, bokeh", "Streaks and glints when light hits glass"],
    ],
    director: [
      ["in the style of Denis Villeneuve", "Vast, minimal, awe-inducing sci-fi"],
      ["shot by Roger Deakins", "Master cinematography, perfect natural light"],
      ["in the style of David Fincher", "Cold, precise, dark, controlled"],
      ["in the style of Wes Anderson", "Symmetrical, pastel, whimsical"],
      ["in the style of Christopher Nolan", "IMAX-scale, tense, practical"],
      ["in the style of Terrence Malick", "Dreamy golden hour, poetic"],
      ["in the style of Wong Kar-wai", "Saturated neon, moody, romantic blur"],
      ["in the style of Stanley Kubrick", "One-point perspective, cold precision"],
      ["in the style of Quentin Tarantino", "Bold, stylized, retro-cool"],
      ["in the style of Greta Gerwig", "Warm, tactile, character-driven"],
      ["in the style of Alfonso Cuarón", "Long immersive takes, floating camera"],
      ["shot by Emmanuel Lubezki", "Natural-light wide-angle, immersive flow"],
      ["in the style of Zack Snyder", "High-contrast, desaturated, epic slow-mo"],
      ["in the style of Sofia Coppola", "Soft, pastel, quietly melancholic"],
      ["in the style of Gaspar Noé", "Neon-drenched, hypnotic"],
    ],
    lighting: [
      ["high key lighting", "Even, low contrast — happy scenes"],
      ["low key lighting", "Uneven, high contrast — dark, dramatic"],
      ["chiaroscuro", "Extreme low-key contrast — mystery, danger"],
      ["hard light", "Directional, sharp shadows — intense"],
      ["soft light", "Diffused, few shadows — romantic, gentle"],
      ["volumetric lighting", "God rays through dust, fog, rain — memorable shots"],
      ["bokeh", "Out-of-focus light — isolation, dreamy"],
      ["silhouette", "Subject against bright background — mystery, hidden identity"],
    ],
    shots: [
      ["extreme wide shot", "Sense of place and time — openers"],
      ["wide shot", "Subject in relation to environment"],
      ["full shot", "Introduce character, body language"],
      ["medium shot", "Dialogue, conversational distance"],
      ["close-up", "Emotion, detail"],
      ["extreme close-up", "Tension, intimacy, tiny details"],
    ],
    angles: [
      ["eye-level shot", "Direct connection, neutrality"],
      ["high angle shot", "Subject feels small, vulnerable"],
      ["low angle shot", "Powerful, dominant, heroic"],
      ["bird's-eye view", "Overview, scale, relationships"],
      ["worm's-eye view", "Larger than life, viewer feels vulnerable"],
      ["dutch angle", "Unease, disorientation, chaos"],
      ["over-the-shoulder shot", "POV between two characters, confrontation"],
      ["point of view (POV) shot", "What the character sees — immersion"],
    ],
    moves: [
      ["slow push in", "Builds tension / focus"],
      ["dolly back with slight arc", "Reveal from a detail"],
      ["whip zoom / whip pan", "Fast energy, transitions"],
      ["tracking shot", "Follow the subject at speed"],
      ["lateral trucking shot", "Side-on, background streaks past"],
      ["jib up / crane", "Majestic reveal of scale"],
      ["orbit", "Hero moment, 3D presence"],
      ["handheld", "Raw, urgent, real (UGC, action)"],
      ["rack focus", "Shift attention between subjects"],
      ["locked-off", "Still, clinical, controlled"],
    ],
  },

  promptParts: {
    camera: ["CAMERA", "#f5c451"],
    lens: ["LENS", "#7cc4ff"],
    director: ["DIRECTOR / STYLE", "#c792ea"],
    shot: ["SHOT + MOVE", "#80deea"],
    subject: ["SUBJECT + ACTION", "#5fd38d"],
    lighting: ["LIGHTING", "#ff8a65"],
    palette: ["PALETTE + MOOD", "#f78fb3"],
  },

  vocabExamples: [
    ["Epic sci-fi", [
      ["camera", "Shot on ARRI Alexa 65,"], ["lens", "Panavision Sphero 65 40mm lens, anamorphic lens flare,"], ["director", "in the style of Denis Villeneuve, Blade Runner 2049 vibe."],
      ["shot", "Extreme wide shot, slow majestic jib up."],
      ["subject", "A lone figure in a long charcoal coat walks through a vast orange dust storm, dwarfed by a colossal weathered statue half-buried in sand."],
      ["lighting", "Diffused sunless glow, silhouette against glowing amber haze, dust suspended in the air."],
      ["palette", "Saturated burnt-orange and ochre palette, deep shadow, silent and monumental."],
    ]],
    ["Noir thriller", [
      ["camera", "Shot on RED V-Raptor,"], ["lens", "Zeiss Master Prime 32mm lens, deep focus,"], ["director", "in the style of David Fincher, Zodiac vibe."],
      ["shot", "Locked-off symmetrical medium shot, eye-level."],
      ["subject", "A man in a rumpled shirt sits alone in a 1970s newsroom at 2am, surrounded by paper stacks, a pen pressed against his lip mid-thought."],
      ["lighting", "Low key lighting, cold green-tinted fluorescent overheads, hard shadows under the eyes."],
      ["palette", "Sickly institutional greens and greys, clinical stillness, dread underneath."],
    ]],
    ["Neon romance", [
      ["camera", "Shot on Kodak Vision3 500T,"], ["lens", "Petzval lens, shallow depth of field,"], ["director", "in the style of Wong Kar-wai, In the Mood for Love vibe."],
      ["shot", "Medium close-up, slight dutch angle, slow push in."],
      ["subject", "A woman in a red qipao waits alone under a dripping awning on a narrow Hong Kong street at night, smoke curling past her face."],
      ["lighting", "Saturated neon spill, bokeh from passing taxis, soft halation on highlights."],
      ["palette", "Deep reds and teal greens, melancholic, romantic longing."],
    ]],
    ["Whimsical comedy", [
      ["camera", "Shot on 35mm film,"], ["lens", "Cooke S4 prime lens, deep focus, everything sharp,"], ["director", "in the style of Wes Anderson, The Grand Budapest Hotel vibe."],
      ["shot", "Locked-off symmetrical wide shot, eye-level, one-point perspective."],
      ["subject", "A bellboy in a plum uniform stands perfectly centred in a pastel-pink hotel lobby, holding a tiny silver tray with a single brass key."],
      ["lighting", "High key lighting, soft even light, no harsh shadows."],
      ["palette", "Pastel pink, mustard and powder blue, whimsical and deadpan."],
    ]],
    ["Heroic action", [
      ["camera", "Shot on 65mm IMAX,"], ["lens", "14mm ultra-wide lens,"], ["director", "in the style of Zack Snyder, 300 vibe."],
      ["shot", "Low angle hero shot, slow orbit, extreme slow motion."],
      ["subject", "A lone armoured warrior rises from a battlefield of ash, cape snapping in the wind, sword raised against the storm."],
      ["lighting", "Volumetric lighting, god rays cutting through smoke, hard rim light on the armour."],
      ["palette", "High-contrast desaturated bronze, epic and defiant."],
    ]],
    ["Candid UGC", [
      ["camera", "Shot on iPhone 15 Pro,"], ["lens", "front camera, 24mm wide-angle lens,"], ["director", "candid social-media creator style."],
      ["shot", "Handheld selfie close-up at arm's length, subtle natural shake."],
      ["subject", "A 26-year-old woman with curly dark hair laughs as she holds a jar of face cream up to the camera in her small bathroom."],
      ["lighting", "Soft light from a frosted window, natural skin texture."],
      ["palette", "Warm natural tones, casual, slightly imperfect framing, 9:16 vertical."],
    ]],
  ],

  templates: [
    ["Seedance 5-block prompt", SEEDANCE_5_BLOCK, "fiveBlock"],
    ["Character sheet (16:9, 3 panels)", CHARACTER_SHEET, "charSheet"],
    ["Prop sheet (2 panels)", PROP_SHEET, "propSheet"],
    ["Arcane × Spider-Verse — character snippet", STYLE_SNIPPET_CHAR],
    ["Arcane × Spider-Verse — location snippet", STYLE_SNIPPET_LOC],
    ["Speed-ramp structure", SPEED_RAMP, "speedRamp"],
    ["Still-image look formula", `Shot on {camera}, {lens}, in the style of {director}, {film} vibe. {Subject + action}. {Environment}. {Lighting}. {Palette}, {mood}.`, "promptMap"],
  ],

  topaz: {
    enhancement: [["Output resolution", "Custom — width 1080 (height 1920), aspect locked"], ["Resize method", "Prioritize width"], ["Video type", "Progressive"], ["AI model", "Proteus"], ["Add noise", "0"], ["Recover detail", "20"], ["Focus fix", "Off"], ["Grain", "Off"], ["Advanced tuning", "Automatic"]],
    interpolation: [["Frame rate", "30 FPS"], ["Slow motion", "None"], ["AI model", "Apollo"], ["Duplicate frames", "Replace"], ["Sensitivity", "10"], ["Scene detection", "Off"]],
    notes: ["Instagram/TikTok: 1080p @ 30 FPS — platforms recompress anything higher.", "Other uses (YouTube, client delivery): 2K/4K, 60 FPS+, ~80 Mbps bitrate.", "Generating at 720p and upscaling here is the cheapest path to crisp 1080p."],
  },
};
