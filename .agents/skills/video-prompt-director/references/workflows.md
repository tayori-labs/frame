# Workflows by video type

Golden rules:
- **Your input frame decides everything.** A strong reference image (character sheet, location, hero frame) matters more than a long prompt.
- **Match the model to the task.** Never use one model for everything — realism, text, editing and motion each have a best tool.
- **A prompt is a set of dials, not a spell.** Be able to point at any word and say what it controls: camera, lens, director, lighting, shot.
- **Generate 2–4 variations per prompt.** Pick the best take. Tweak one dial between iterations, not five.
- **SFX only — music in the edit.** Ask for diegetic sound and 'No music'. Add the score yourself so cuts stay in your control.
- **Repeat the constraints that drift.** 'One single helicopter only', 'these pairings must never swap' — say it in summary AND requirements.
- **Feed the last frame forward.** Use the final frame of the previous clip as a placement reference for the next generation.
- **Generate 720p, upscale later.** Cheaper generations; Topaz brings it to 1080p/4K and smooths frame rate.

## Stylized Animation

Arcane × Spider-Verse look — painterly 3D cel-shaded shorts that feel like a movie.
Specs: 5–15s per generation · 16:9 or 9:16 · 2–3 cuts per clip

### Step 1: Plan the story & asset list
- Requirements: One-line idea (who, where, what happens); Target length (split into 5–15s generations); Aspect ratio
- Models: Claude Opus 5.5 (Breaks idea into clips + asset list)
- Alternatives: ChatGPT / Gemini (Same job if you don't have Claude)
- Tip: Characters + locations are the two assets that power every shot. List vehicles/props separately.

Example - Story breakdown:
```
I want to make a {30}-second stylized animated short in the {Arcane × Spider-Verse} style.
Idea: {e.g. a street racer is hunted by a police chopper across a neon cyberpunk city}.
1. Split it into {3} Seedance 2.0 generations of 5–15 seconds each, with a 1-line purpose for each (calm intro → build → action payoff).
2. List every asset I need to generate first: characters, vehicles, props, locations — one-line visual description each.
3. Note which clip should reuse the last frame of the previous clip for continuity.
```

### Step 2: Build character sheets in Midjourney
- Requirements: 16:9 canvas, 3 equal panels; Flat grey background (never white); Front close-up + front full-body + back full-body
- Models: Midjourney V8.1 / V7 (raw mode) (Trained deepest on stylized concept art & comic colour theory)
- Alternatives: Nano Banana Pro/2 (Fix details, swap outfits); Niji (Midjourney anime model) (If you want a flatter anime look)
- Tip: Write the subject in plain language, then paste the style snippet at the END of every prompt.
- Tip: After generating, erase ONLY the face in the front full-body panel so the AI pulls facial data from the close-up alone.

Example - Character sheet (paste snippet at end):
```
{A young Black man, short twist-out hair with high fade, white wired earbud, fine-line neck tattoos, gold rings, cream oversized hoodie, calm focused expression}, in 3 panel character sheet against grey studio background, 1 front facing close up and two full body of front and back, 3D cel-shaded painterly animation in the style of {Arcane × Spider-Verse}, bold hand-painted brushstrokes, confident graphic line accents. --ar 16:9 --style raw
```

### Step 3: Build locations & props
- Requirements: Location: wide, readable lighting; Props/vehicles: 2-panel sheet on grey
- Models: Midjourney V8.1 / V7 (raw) (Same style snippet keeps everything coherent)
- Alternatives: Seedream 5.0 (Good colour combinations); Nano Banana Pro/2 (Insert or fix elements)
- Tip: Use the location snippet (no character-sheet wording) for environments.

Example - Location:
```
{Neon-noir cyberpunk skyline at night, towering skyscrapers with cyan, magenta and red signage, a glowing red emblem, a wide bridge spanning toward the city}, 3D cel-shaded painterly animation in the style of {Arcane × Spider-Verse}, bold hand-painted brushstrokes, confident graphic line accents. --ar 16:9 --style raw
```

Example - Vehicle / prop sheet:
```
{Sleek blacked-out modern muscle car, glossy mirror-black, sharp faceted body panels, thin red LED light bars, dark multi-spoke wheels with red calipers}. 2-panel prop sheet on a flat neutral grey studio background, evenly lit, no environment, no cast shadows on the backdrop. Panel 1: front-facing close-up of the {car}. Panel 2: full view shot of the {car}. 3D cel-shaded painterly animation in the style of {Arcane × Spider-Verse}, bold hand-painted brushstrokes, confident graphic line accents. --ar 16:9 --style raw
```

### Step 4: Let Claude write the motion prompt
- Requirements: Upload character + location + prop sheets to Claude; Rough idea of the clip
- Models: Claude Opus 5.5 (Writes Seedance-ready, multi-cut prompts)
- Alternatives: ChatGPT / Gemini (Vision-capable alternative)
- Tip: Ask for the 5-block structure (see Templates tab) so every prompt stays consistent.

Example - Ask Claude:
```
I've attached my assets: {image_1 = muscle car sheet, image_2 = city location, image_3 = character sheet}.
Write a Seedance 2.0 prompt for a {13}-second, {3}-cut clip: {calm intro — driver vibing in the parked car before the chase}.
Format:
- Bind each <<<image_N>>> with a precise visual description and what it's a reference for.
- SPATIAL line: where everything sits.
- Style line: "3D cel-shaded painterly animation, {Arcane × Spider-Verse} — bold hand-painted brushstrokes, confident graphic linework, visible canvas texture. Cinematic anamorphic framing. Hollywood-level animated cinematography."
- Each CUT: shot size + angle, camera move, speed (normal/fast), exact action.
- SFX only line. No dialogue. No music.
```

### Step 5: Generate in Seedance 2.0
- Requirements: Upload assets in the same order as the <<<image_N>>> tags; 2–4 generations per prompt
- Models: Seedance 2.0 (Hollywood-level complex shots & VFX, 1080p/2K)
- Alternatives: Seedance 2.5 (Best adherence, but 720p only and $0.34/s); Kling 3.0 (Cheapest — fine for simple, low-motion shots)
- Tip: Repeat 'one single helicopter only' type constraints in every cut to stop duplicates.
- Tip: Use a frame from the previous output as a placement reference (e.g. car's position on the bridge).

Example - Example — calm intro (13s, 3 cuts):
```
<<<image_3>>> — Young Black man, short twist-out hair with high fade, white wired earbud in his ear, fine-line neck and hand tattoos, gold rings, cream oversized hoodie, calm focused expression. For Character reference.
<<<image_1>>> — Sleek blacked-out modern muscle car, glossy mirror-black, sharp faceted body panels, thin red LED light bars front and rear, dark multi-spoke wheels with red calipers. Vehicle reference, all angles.
<<<image_2>>> — Neon-noir cyberpunk skyline at night, towering skyscrapers with cyan, magenta and red signage, a glowing red emblem, a wide bridge spanning toward the city. Environment, location and lighting reference.
SPATIAL: <<<image_3>>> sits low inside <<<image_1>>>. <<<image_1>>> is parked on the left edge of a wide bridge in <<<image_2>>>, the neon skyline filling the background. Night, dry road, clear air.
3D cel-shaded painterly animation, {Arcane × Spider-Verse} — bold hand-painted brushstrokes, Cinematic anamorphic framing, Hollywood-level animated cinematography. A multi-cut sequence of 13 seconds duration, calm and atmospheric — the stillness before the chase.
CUT — extreme macro close-up, slow smooth dolly-back with a slight arc, normal speed — opens tight on the white wired earbud seated in <<<image_3>>>'s ear, diamond stud subtly glinting beside it, the cable trailing down his neck past a fine-line tattoo. The camera pulls back and arcs around, revealing <<<image_3>>> low in the seat, warm amber light on his face against the cool blue night, head tipped back, eyes half-closed, subtly nodding to the music, tattooed ringed hand loose on the wheel.
CUT — low diagonal angle, slow creeping push, normal speed — camera low and off the front corner of <<<image_1>>>, front and side together in one diagonal view, red light bars glowing, neon rim-lighting every faceted edge. Slow, deliberate — savoring the car. Coiled, cool, ready.
CUT — wide establishing shot, slow majestic jib up, normal speed — <<<image_1>>> parked on the left edge of the wide bridge, small against the vast glowing <<<image_2>>> skyline. The camera cranes slowly upward and back. Serene, breathtaking, still.
SFX only: distant neon-city hum and electrical buzz, the faint tick of the parked engine, a low ambient bass drone. No dialogue. No music.
```

Example - Example — chopper arrives (5s, 2 cuts):
```
<<<image_4>>> — a single police patrol helicopter, dark red and black body with a white-and-red side stripe, bubble cockpit with two helmeted officers, a powerful white searchlight beam underneath. One helicopter only.
<<<image_1>>> — sleek blacked-out modern muscle car (as above). Vehicle reference.
<<<image_2>>> — neon-noir cyberpunk skyline at night with a wide bridge. Environment, location and lighting reference.
<<<image_3>>> is only for reference of the car's placement on the bridge. Frame from the previous video output.
SPATIAL: the black muscle car is parked on the left side of the bridge, facing forward. The chopper approaches from behind and above, descending toward it. One single helicopter throughout.
3D cel-shaded painterly animation, {Arcane × Spider-Verse} — bold hand-painted brushstrokes, confident graphic linework, visible canvas texture. Cinematic anamorphic framing, dynamic kinetic camera. A two-cut sequence of 5 sec duration.
CUT — fast dynamic shot, rapid whip zoom, fast speed — a single patrolling chopper tears across the frame against the neon skyline, rotor blades blurring, searchlight sweeping. Only one helicopter in frame.
CUT — high aerial over-the-shoulder shot looking straight down, smooth descending push, normal speed — the camera rides above and behind the chopper as it drops into the foreground, looking down at the black muscle car on the bridge. The searchlight locks onto the car, pinning it in a bright pool of light. One single helicopter only.
SFX only: heavy rotor chop building from a distant thud to a loud overhead beat, wind, tense low droning bass, faint electric hum of the city. No dialogue. No music.
```

Example - Example — the chase (10s, 3 cuts):
```
{Bind car, helicopter, city, and police cruiser references as <<<image_1..5>>>.}
SPATIAL: the black muscle car races through the canyon streets of the neon city at night, pursued by police cruisers and tracked from above by the single chopper with its searchlight. One helicopter throughout. High-speed chase.
3D cel-shaded painterly animation, {Arcane × Spider-Verse} — bold hand-painted brushstrokes, confident graphic linework, visible canvas texture. Cinematic anamorphic framing, aggressive kinetic handheld camera, heavy motion blur, speed lines. A three-cut high-action sequence of 10 seconds duration.
CUT — low chase tracking shot, camera racing along the asphalt behind the car, fast speed — weaving between traffic, skyscrapers streaking past in heavy motion blur, two police cruisers with red-and-blue strobes chasing, the chopper's searchlight raking across the car. Speed lines, violent energy.
CUT — high aerial god's-eye shot, sweeping fast crane move, fast speed — straight down on the neon grid, the car a small dark dart cutting through glowing avenues, the searchlight chasing it as a moving pool of white light. One helicopter only.
CUT — low front three-quarter hero angle, hard tracking-backward push, fast speed — camera racing backward ahead of the car as it powers toward the lens, headlights blazing, cyan and magenta reflections on the faceted body, strobes flaring behind. Explosive forward drive.
SFX only: engine at full throttle, tires screeching, heavy chopper chop, wailing sirens, wind, driving low bass rumble. No dialogue. No music — music added in edit.
```

### Step 6: Upscale, edit, add music
- Requirements: Best takes from each clip; Topaz Video (see Finishing tab); Editor + music track
- Models: Topaz Video (Proteus + Apollo) (Upscale + frame interpolation)
- Alternatives: CapCut / DaVinci Resolve (Cut, colour match, music)
- Tip: Instagram: export 1080×1920 at 30 FPS — anything higher gets recompressed anyway.

## Cinematic Filmmaking

Live-action short films, trailers and scenes that look shot on a real camera.
Specs: 10–20s per generation · 16:9 (2.39:1 feel) · 4–8 beats per clip

### Step 1: Write the scene as beats
- Requirements: Logline + mood; Duration per clip; Cast & props list
- Models: Claude Opus 5.5 (Scene breakdown + shot list)
- Alternatives: ChatGPT / Gemini (Alternative)
- Tip: Every beat answers 4 questions: shot size + angle, camera motion, action, transition.

Example - Beat sheet:
```
Act as a film director and cinematographer. Break this scene into a {20}-second shot list for an AI video model.
Scene: {a black-eyed woman on a skull-nosed scrambler chases a studded leather-clad rider across a red desert; she fires, misses as he jumps a ravine; he smirks back}.
For each beat give: timecode, shot size + angle, camera motion, the exact action, and the transition into the next beat (hard cut, whip pan, match cut).
Then list every character and prop that needs its own reference sheet.
```

### Step 2: Choose your look (the dials)
- Requirements: Camera body; Lens; Director / DP style + film vibe; Lighting type; Palette + mood
- Models: Your vocabulary (See the Vocabulary tab)
- Tip: Formula: Shot on {camera}, {lens}, in the style of {director}, {film} vibe. {subject + action}. {environment}. {lighting}. {palette}, {mood}.

Example - Look formula:
```
Shot on {ARRI Alexa 65}, {Panavision Sphero 65 40mm lens}, in the style of {Denis Villeneuve}, {Blade Runner 2049} vibe. {Subject and action}. {Environment}. {Lighting: diffused sunless glow / hard midday sun / chiaroscuro}. {Palette}, {mood}.
```

### Step 3: Generate hero frames
- Requirements: One still per key shot (your input frame); Same look line across all stills
- Models: Soul 2.0 (Best photoreal humans, skin, lighting); Soul Cinema (Film-grade stills, movie composition)
- Alternatives: Midjourney (More artistic / experimental looks); Flux (image) (Strong photoreal stills)
- Tip: Your input frame decides everything — don't move to video until the still is right.

Example - Epic sci-fi (Villeneuve):
```
Shot on ARRI Alexa 65, Panavision Sphero 65 40mm lens, in the style of Denis Villeneuve, Blade Runner 2049 vibe. A lone figure in a long charcoal coat walks through a vast orange dust storm, dwarfed by the colossal weathered statue of a seated woman half-buried in sand beside them, the horizon dissolving into glowing amber haze. Monumental scale, tiny human in enormous negative space, diffused sunless glow, silhouetted forms, dust suspended in the air. Saturated burnt-orange and ochre palette, deep shadow, silent and monumental.
```

Example - Thriller (Fincher):
```
Shot on RED Monstro 8K, Zeiss Master Prime 32mm, in the style of David Fincher, Zodiac vibe. A man in a rumpled shirt sits alone in a fluorescent-lit 1970s newsroom at 2am, surrounded by paper stacks, mid-thought with a pen against his lip. Locked-off symmetrical frame, cold green-tinted overheads, sickly institutional palette, fine skin texture and tired under-eye shadow, clinical stillness, dread underneath.
```

Example - Melancholic drama (Cuarón):
```
Shot on Kodak Vision3 500T, 24mm wide-angle lens, in the style of Alfonso Cuarón, 1917 continuous war-film grade vibe. A woman in a polka dot frock with brunette hair drives an expensive luxury car down a busy New York street, looking away from the camera, her hair flying in the wind. Vivid colour palette, melancholic mood, fashion-film framing, evening sky and buildings behind, halation.
```

Example - Romantic (Tarantino / Godfather grade):
```
Shot on RED V-Raptor, 35mm lens, in the style of Quentin Tarantino, The Godfather warm amber grade. A woman seated alone near a fountain in Italy in her wedding dress, bouquet in hand, wearing her veil, romantic yet sad, sunny blue sky, local people in the background, rich palette, pleasant.
```

### Step 4: Lock characters & props
- Requirements: 16:9 three-panel sheet per character; Grey background; Face erased on front full-body panel; 2-panel sheet per prop
- Models: Soul 2.0 (Realistic character sheets); Nano Banana Pro/2 (Surgical fixes, outfit swaps, face erase)
- Alternatives: GPT 2.0 (General editing); Photoshop / any editor (Grey brush over the full-body face)
- Tip: White backgrounds blow out skin — grey gives natural tones and real shadows.
- Tip: Same-size panels only; random layouts make the face get averaged and drift.

Example - Character sheet:
```
{Photorealistic: pale woman, large solid black eyes, extremely long straight platinum blonde hair, dark iridescent metallic green turtleneck bodysuit, gold chain belt, hot pink spiked boots}.
3-panel character sheet on a flat neutral grey studio background, evenly lit, no environment, no props, no cast shadows on the backdrop.
Panel 1: front-facing close-up of the head and shoulders.
Panel 2: full body, front view, neutral standing pose.
Panel 3: full body, back view, same pose and scale.
Consistent proportions and costume across all three panels.
```

Example - Prop sheet:
```
{prop description only}.
2-panel prop sheet on a flat neutral grey studio background, evenly lit, no environment, no cast shadows on the backdrop.
Panel 1: front-facing close-up of the {prop}.
Panel 2: full view shot of the {prop}.
```

Example - Erase face (Nano Banana):
```
Edit this character sheet: in the MIDDLE panel only, paint over the face with flat neutral grey matching the background. Keep every other pixel, panel and detail exactly identical.
```

### Step 5: Write the 5-block video prompt
- Requirements: All sheets uploaded to Claude; Your beat sheet
- Models: Claude Opus 5.5 (Fills the 5-block Seedance structure)
- Alternatives: ChatGPT / Gemini (Alternative)
- Tip: Block 5 is where you list what went wrong last time.
- Tip: Describe sounds per asset in Block 1 — the model ties audio to visuals.

Example - Ask Claude:
```
Using my attached reference sheets and the beat sheet below, write a Seedance prompt in exactly these 5 blocks:
[1 — ASSET BINDING] describe every <<<image_N>>>, what it is a reference for, and what it sounds like.
[2 — SUMMARY] who uses which asset ("these pairings must never swap") + 2–3 lines of plot and feeling.
[3 — STYLE] camera, lenses per shot type, lighting, grade, grain, overall feel.
[4 — DETAILED PLOT] timecoded beats; each with shot size + angle, camera motion, action, transition.
[5 — OVERALL REQUIREMENTS] aspect ratio, cast count, consistency rules, audio rules (SFX only, no music), strictly avoid list.
Beat sheet: {paste}
```

Example - Blank 5-block template:
```
[1 — ASSET BINDING]
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
Strictly avoid: {animation / live-action}, {3D CG render look}, additional characters, text, logos or watermarks, letterboxing or black bars, {slow motion}.
```

### Step 6: Generate the video
- Requirements: References uploaded in tag order; 3–4 takes per prompt
- Models: Seedance 2.5 (Best realism, acting & prompt adherence — 720p, $0.34/s); Seedance 2.0 (Complex shots & VFX at 1080p/2K)
- Alternatives: Flux 3 (Raw retro realism, closest to Seedance, $0.17/s); Kling 3.0 (Cheapest, simple low-motion shots); MiniMax H3 (~1/3 of Seedance cost but often plastic); Google Veo (Strong realism with native audio)
- Tip: Generate at 720p and upscale — the cost difference adds up fast on 20s clips.

### Step 7: Fix shots without regenerating
- Requirements: The take that's 90% right
- Models: Seedance 2.5 (Best video editing/manipulation); Gemini Omni Flash (Cheap decent video edits (~$0.10/s at 720p))
- Alternatives: Runway (video-to-video) (Restyle / object edits)
- Tip: Gemini Omni Flash is for editing only — not text-to-video or image-to-video.

Example - Video edit:
```
Keep the entire video identical — same camera move, timing, characters, lighting and grade. Only change: {remove the extra rider in the background from 4s onward / make the laser bolt bright saturated green / stop the wheel from warping on landing}.
```

### Step 8: Upscale, grade, sound design
- Requirements: Topaz settings (Finishing tab); Editor; Score / music
- Models: Topaz Video (Upscale + interpolation)
- Alternatives: DaVinci Resolve (Colour match across clips); ElevenLabs / Suno (Extra SFX, voice, score)

## UGC Content

Selfie-style creator videos: reviews, unboxings, testimonials, talking heads.
Specs: 15–30s · 9:16 vertical · hook in first 2s

### Step 1: Script the hook
- Requirements: Product + 1 key benefit; Target viewer; 15–30s length
- Models: Claude Opus 5.5 (Hooks + scripts)
- Alternatives: ChatGPT (Alternative)
- Tip: Keep each spoken line under ~8 seconds — one line per generation is easiest to lip-sync.

Example - UGC scripts:
```
Write 3 UGC scripts for {product} aimed at {target viewer}, {20} seconds each, 9:16.
Structure: Hook (0–2s, pattern-interrupt line) → Problem (2–6s) → Demo/proof (6–15s) → CTA (15–20s).
Spoken like a real person filming on their phone: casual, a little imperfect, no marketing words.
For each line, add a one-line visual note (selfie talking, hands-on product close-up, B-roll).
```

### Step 2: Create the creator persona
- Requirements: Age, look, setting that matches the audience; Phone-camera realism
- Models: Soul 2.0 (Most believable skin and lighting)
- Alternatives: Nano Banana Pro/2 (Change outfit/room while keeping the face); Flux (image) (Photoreal alternative)
- Tip: 'Shot on iPhone 15 Pro' gives modern phone realism and a candid feel.
- Tip: Make a 3-panel character sheet of the persona so every clip keeps the same face.

Example - Persona selfie frame:
```
Shot on iPhone 15 Pro, front camera, handheld selfie angle at arm's length. A {26-year-old woman with curly dark hair, light freckles, no-makeup look, oversized grey sweatshirt} sitting on her bed in a {small, lived-in apartment bedroom}, soft window daylight from the side, slightly messy background. Candid, mid-sentence expression, natural skin texture with pores, imperfect framing, 9:16 vertical. No text, no logos.
```

Example - Persona character sheet:
```
{Photorealistic: the same woman — curly dark hair, light freckles, oversized grey sweatshirt, joggers}.
3-panel character sheet on a flat neutral grey studio background, evenly lit, no environment, no props, no cast shadows on the backdrop.
Panel 1: front-facing close-up of the head and shoulders.
Panel 2: full body, front view, neutral standing pose.
Panel 3: full body, back view, same pose and scale.
Consistent proportions and costume across all three panels.
```

### Step 3: Put the real product in her hands
- Requirements: Clean product photo; Legible label
- Models: Nano Banana Pro/2 (Insert subjects/products precisely); GPT 2.0 (Cleanest text/label rendering)
- Alternatives: Reve (Clean branded finish)
- Tip: Use the product photo as a second reference so the packaging doesn't get reinvented.

Example - Product insert:
```
Using image 1 (the creator) and image 2 (the product): place the exact product from image 2 in her right hand, held toward the camera at chest height. Keep the label text, colours and shape identical to image 2. Keep her face, clothes, room and lighting unchanged. Natural grip, realistic scale.
```

### Step 4: Generate the talking-head clips
- Requirements: Persona frame with product; One script line per clip; 9:16
- Models: Seedance 2.5 (Best acting & lip movement); Gemini Omni Flash (Good talking heads, best value (~$0.10/s))
- Alternatives: Google Veo (Native speech + lip-sync from text); HeyGen / Arcads (Avatar UGC with your own voice track); ElevenLabs (Generate the voice-over separately)
- Tip: Put dialogue in quotes and state the tone of voice.
- Tip: Ask for slight handheld shake — locked-off cameras read as fake UGC.

Example - Talking head:
```
<<<image_1>>> — the creator holding {product}. Character, product, room and lighting reference.
[SUMMARY] The woman from <<<image_1>>> films herself on her phone in her bedroom, talking excitedly to camera about {product}.
[STYLE] Shot on iPhone 15 Pro front camera, handheld selfie at arm's length, subtle natural hand shake, soft window daylight, natural skin texture, candid social-media realism, 9:16 vertical.
[PLOT] 0-6s: Medium close-up selfie. She leans in, raises the product next to her face and says, in a casual, slightly surprised tone: "{Okay, I didn't expect this to actually work, but look at this.}" Small natural gestures, eye contact with the lens, a quick laugh at the end.
[REQUIREMENTS] Same face, hair, outfit and product label throughout; label stays legible. Accurate lip-sync to the dialogue. Room tone and her voice only, no music, no subtitles.
Strictly avoid: studio lighting, cinematic depth of field, extra people, warped hands or text, watermarks.
```

### Step 5: Generate B-roll inserts
- Requirements: Product close-ups, hands-on demo, texture shots
- Models: Kling 3.0 (Cheapest, crisp 1080p for simple motion)
- Alternatives: Seedance 2.0 (If the shot needs liquid/VFX motion)

Example - B-roll:
```
Shot on iPhone 15 Pro, close-up, handheld. Her hand {twists open the cap of the product and squeezes a small amount onto her fingertip}, soft window daylight, natural skin, slight focus breathing, 9:16. Label stays sharp and legible. No music.
```

### Step 6: Edit, caption, upscale
- Requirements: Cut to the beat of speech; Big burned-in captions
- Models: Topaz Video (1080×1920 @ 30 FPS for Instagram/TikTok)
- Alternatives: CapCut (Auto-captions, fast UGC edits)
- Tip: Cut every 2–3s; open on the hook line, not a logo.

## Motion Graphics

Code-drawn 2D animation — explainers, infographics, loops. No video model involved.
Specs: 15s recommended · any ratio · ~25–30 min build per 15s

### Step 1: Pick a style that code draws well
- Requirements: 1–3 reference images or videos (style only)
- Models: Midjourney / Recraft V4.1 (Make style references if you have none)
- Alternatives: Pinterest / Dribbble (Find references instead of generating)
- Tip: Best: flat vector, minimal line art, paper-cut / layered, grainy risograph.
- Tip: Skip photorealism here — that's a job for video models.

Example - Style reference:
```
Flat vector illustration of {a tiny astronaut watering a plant on a floating island}, limited {4}-colour palette ({cream, coral, navy, mustard}), clean geometric shapes, subtle grainy risograph texture, generous negative space, no gradients on outlines --ar 9:16
```

### Step 2: Install the tools
- Requirements: Claude Code desktop app (not web); Google Chrome (renders frames); ffmpeg (joins frames + audio into MP4); The motion-studio animation skill (skill.md)
- Models: Claude Code + Opus 5.5 (high) (Best quality/usage balance)
- Tip: Drag skill.md into Claude Code and say 'Install this as a personal skill'.
- Tip: Open a NEW chat afterwards — the old chat won't see the skill.
- Tip: Install ffmpeg on macOS: brew install ffmpeg

Example - Install message:
```
Install this as a personal skill.
```

### Step 3: Give the brief
- Requirements: Type /motion-studi… and select the skill; References uploaded; Topic, duration, ratio
- Models: Claude Code (Opus 5.5 high) (Plans hook → build-up → payoff, draws every frame)
- Tip: References act as STYLE only — say so explicitly if you also want the subject copied.
- Tip: A rough idea is enough; the skill does the directing.

Example - Brief:
```
/motion-studio
Make a {15}-second {9:16} animation about {how compound interest works}.
Use the attached references for STYLE only (shapes, palette, texture, line weight) — not their subject.
Structure it as a mini-film: hook (0–3s), build-up, payoff ending on {a single bold number}.
Compose a soundtrack in code synced to the key beats. Export a ready-to-post MP4.
```

### Step 4: Review sample frames & iterate
- Requirements: Patience — usage limits hit fast
- Models: Claude Code (Checks frames and fixes what looks off)
- Tip: Expect 25–30+ minutes per 15s. Check usage in between.

Example - Iteration:
```
Show me frames at {2s, 7s and 12s}. Then fix: {the title text is too small on mobile; slow the transition at 6s; make the grain subtler}. Re-render only the affected section, then re-export the MP4.
```

### Step 5: Alternatives without the skill
- Alternatives: Remotion (Video as React code — Claude can write it); Motion Canvas (Code-driven explainer animation); After Effects / Jitter (Manual motion design tools); Kling 3.0 (Animate a flat illustration image-to-video (simple motion))

Example - Remotion via Claude Code:
```
Create a Remotion project that renders a {15}-second {1080×1920} flat-vector animation about {topic}. Palette {hex codes}. Scenes: {hook}, {build-up}, {payoff}. Use spring easing, no stock assets — draw everything with SVG. Render to out/video.mp4.
```

## Slow-Motion & Sports

Speed-ramped action — sportswear ads, impact shots, hero moments.
Specs: 10s · 3 shots · 9:16 · normal → ~10% → normal

### Step 1: Create the reference frame
- Requirements: Athlete + location + art style + lighting in ONE frame
- Models: Soul 2.0 / Soul Cinema (Photoreal athlete, commercial look)
- Alternatives: Midjourney (Stylized version); Nano Banana Pro/2 (Fix shoes, logos, outfit details)

Example - Reference frame:
```
Shot on 35mm, long lens, premium sportswear commercial. A lean, powerfully built young sprinter, short hair, deeply tanned, cropped black-blue patterned sleeveless vest, black running shorts, neon volt-yellow racing shoes, in a coiled starting stance on an empty red rubberized track with crisp white lane lines, green infield, dense treeline behind, clear teal-blue sky. Harsh high midday sun, hard short shadows, specular highlights on skin. Organic film grain, gentle halation, muted cool grade, 9:16.
```

### Step 2: Plan the speed curve
- Requirements: The exact trigger moment (impact, takeoff, splash); Where the ramp down and ramp up happen
- Models: Claude Opus 5.5 (Turns your idea into a timed shot list)
- Tip: Think like an editor: full speed → dramatic drop at the impact beat → back to normal. The contrast is what makes it cinematic.
- Tip: Slow-mo must look like real high-frame-rate footage — explicitly ban motion blur in that section.

Example - Speed-ramp structure:
```
[Your scene plays out at normal speed] ... just as [THE EXACT TRIGGER MOMENT], the speed dramatically ramps to [X]% slow motion, [CAMERA MOTION that sells the beat] ... then the speed ramps back to normal [as the action continues].
```

Example - Key phrases:
```
Normal speed.
Speed ramp down into slow motion at the {3}-second mark.
Extreme slow motion, roughly {10}% speed.
Speed ramp back up to normal at the {7}-second mark.
The speed ramps rapidly back to full.
```

### Step 3: Write the full sectioned prompt
- Requirements: Reference frame; Speed plan
- Models: Seedance 2.5 (Best realism + adherence); Seedance 2.0 (1080p/2K)
- Alternatives: Flux 3 (Cheaper realism); Kling 3.0 (Only for simple slow pans — weak at complex ramps)

Example - Full example — sprinter:
```
<<<image_1>>> is the reference for the location, the runner, the art style and the lighting for the entire video. He is the only person on the track.
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
[Strictly exclude] Animation, illustration, painterly texture, 3D CG render, video game look, additional runners, spectators, text, logos, watermarks, letterboxing, motion blur during the slow-motion section.
```

Example - Adapt to any sport:
```
{Your scene plays out at normal speed: a skateboarder rolls toward a 10-stair handrail} ... just as {his board leaves the lip}, the speed dramatically ramps to {10}% slow motion, {the camera orbits 90° around him at normal speed as the board flips beneath his feet, every grain of dust suspended} ... then the speed ramps back to normal {as he lands, wheels slamming the concrete, and rolls away}.
```

### Step 4: Upscale & smooth in Topaz
- Requirements: Generate at 720p to save cost
- Models: Topaz Video (Proteus enhancement + Apollo interpolation)
- Tip: See the Finishing tab for the exact settings.

## Product Ads & Branding

Product hero shots, posters and short commercial spots.
Specs: 5–15s · 1:1, 4:5 or 9:16 · end card with text

### Step 1: Product reference sheet
- Requirements: Real product photos (if it exists); 2-panel grey sheet
- Models: Nano Banana Pro/2 (Clean up real photos, remove background clutter); Reve (Clean branded product renders)
- Alternatives: Recraft V4.1 (Design-y, illustrated product looks)

Example - Product sheet:
```
{A matte black 500ml insulated water bottle with a brushed steel cap and a small embossed white logo}.
2-panel prop sheet on a flat neutral grey studio background, evenly lit, no environment, no cast shadows on the backdrop.
Panel 1: front-facing close-up of the {prop}.
Panel 2: full view shot of the {prop}.
```

### Step 2: Hero still
- Requirements: Surface, lighting, mood; Lens choice (macro for texture)
- Models: Reve (Clean ad finish); Soul Cinema (Cinematic product moments)
- Alternatives: Midjourney (Bolder art direction)
- Tip: 'Macro lens' for texture, 'Zeiss Master Prime' for clinical sharpness, 'soft light' for premium calm, 'hard light' for drama.

Example - Hero still:
```
Shot on Sony Venice 2, macro lens, premium commercial. {The matte black bottle} standing on {wet black slate}, droplets beading on its surface, one hard rim light from behind carving its silhouette, soft fill from the front, dark moody background with faint volumetric haze. Clinically sharp, high contrast, {4:5}. No text.
```

### Step 3: Poster / text-heavy frames
- Requirements: Exact headline + tagline text; Brand colours
- Models: GPT 2.0 (Cleanest typography); Seedream 5.0 (Posters with good colour/design); Recraft V4.1 (Refined poster detail & branding)
- Alternatives: Ideogram (Strong text rendering)
- Tip: Put exact text in quotes and say where it goes.

Example - Poster:
```
Minimal product poster, {4:5}. {The matte black bottle} centered on a {deep forest-green} background with soft studio light. Headline at top in bold condensed sans-serif: "{STAY COLD. 24 HOURS.}" Small tagline at bottom: "{Built for the long day.}" Plenty of negative space, clean grid alignment, no other text.
```

### Step 4: Animate the product
- Requirements: Hero still as start frame
- Models: Kling 3.0 (Simple turntables & slow pushes — lowest cost); Seedance 2.0 (Splashes, particles, VFX reveals)
- Alternatives: Seedance 2.5 (Max realism); Google Veo (Alternative)
- Tip: Keep logo stable: add 'no warping of the logo or label' to every prompt.

Example - Simple (Kling 3.0):
```
<<<image_1>>> start frame. Slow smooth 90° orbit around the bottle, normal speed, droplets slowly sliding down its surface, rim light gliding across the edge. Locked focus on the product. No warping of the logo or cap. No text.
```

Example - VFX reveal (Seedance 2.0):
```
<<<image_1>>> — PRODUCT REFERENCE, the bottle. Use for shape, finish and logo.
0-2s: Darkness. A crack of hard rim light reveals the bottle's silhouette. Slow push in.
2-4s: Hard cut. Ice-cold water erupts upward around the bottle in a frozen crown splash, extreme slow motion, roughly 10% speed, every droplet crisp.
4-6s: Speed ramps back to normal; frost blooms across the surface as the camera arcs to a clean front hero angle. Final frame holds.
Requirements: stable product geometry and logo, no text, premium commercial grade. SFX only: low whoosh, liquid splash, crackle of frost. No music.
```

### Step 5: Upscale & assemble
- Requirements: Clips + poster end card
- Models: Topaz Video (1080p/4K)
- Alternatives: CapCut / DaVinci Resolve (Edit + music + end card)
