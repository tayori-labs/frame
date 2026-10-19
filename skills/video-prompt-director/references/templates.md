# Templates

Text in {braces} is filled in from the user's idea.

## Seedance 5-block prompt
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

## Character sheet (16:9, 3 panels)
```
{subject description only}.
3-panel character sheet on a flat neutral grey studio background, evenly lit, no environment, no props, no cast shadows on the backdrop.
Panel 1: front-facing close-up of the head and shoulders.
Panel 2: full body, front view, neutral standing pose.
Panel 3: full body, back view, same pose and scale.
Consistent proportions and costume across all three panels.
```

## Prop sheet (2 panels)
```
{prop description only}.
2-panel prop sheet on a flat neutral grey studio background, evenly lit, no environment, no cast shadows on the backdrop.
Panel 1: front-facing close-up of the {prop}.
Panel 2: full view shot of the {prop}.
```

## Arcane × Spider-Verse — character snippet
```
in 3 panel character sheet against grey studio background, 1 front facing close up and two full body of front and back, 3D cel-shaded painterly animation in the style of Spider-Verse and Arcane, bold hand-painted brushstrokes, confident graphic line accents.
```

## Arcane × Spider-Verse — location snippet
```
3D cel-shaded painterly animation in the style of Spider-Verse and Arcane, bold hand-painted brushstrokes, confident graphic line accents.
```

## Speed-ramp structure
```
[Your scene plays out at normal speed] ... just as [THE EXACT TRIGGER MOMENT], the speed dramatically ramps to [X]% slow motion, [CAMERA MOTION that sells the beat] ... then the speed ramps back to normal [as the action continues].
```

## Still-image look formula
```
Shot on {camera}, {lens}, in the style of {director}, {film} vibe. {Subject + action}. {Environment}. {Lighting}. {Palette}, {mood}.
```

## Character sheet checklist
- 16:9 split into 3 equal panels: close-up, front full body, back full body.
- Flat grey background. White blows out skin and makes it look plastic.
- After generating, erase the face on the front full-body panel so the close-up is the only face reference.

## Topaz Video finishing (https://www.topazlabs.com/topaz-video)
Enhancement:
- Output resolution: Custom — width 1080 (height 1920), aspect locked
- Resize method: Prioritize width
- Video type: Progressive
- AI model: Proteus
- Add noise: 0
- Recover detail: 20
- Focus fix: Off
- Grain: Off
- Advanced tuning: Automatic

Frame interpolation:
- Frame rate: 30 FPS
- Slow motion: None
- AI model: Apollo
- Duplicate frames: Replace
- Sensitivity: 10
- Scene detection: Off

- Instagram/TikTok: 1080p @ 30 FPS — platforms recompress anything higher.
- Other uses (YouTube, client delivery): 2K/4K, 60 FPS+, ~80 Mbps bitrate.
- Generating at 720p and upscaling here is the cheapest path to crisp 1080p.
