# 🌿 **Trecena Creation Guide — Master Specification for the 13-Day Mayan Stories Project**

## 📘 **1. Purpose of This Document**

This file contains the **complete rules** for generating a 13-day Mayan trecena story cycle, including:

- Story world rules
- Narrative tone
- Chapter structure
- JSON output format
- Length requirements
- Image prompt conventions
- Energy-of-the-day format
- Horoscope voice
- Affirmation and meditation format
- Continuity across a trecena
- Birthday profile format

Any new chat must reference this file and ALL canonical sources to ensure perfect consistency.

---

## 📚 **2. Authoritative Source Files (Canonical & Required)**

The following uploaded files are ALWAYS the sources of truth:

### **mayan-calendar-reference.md**

- Complete Mayan calendar system reference
- Numbers (1–13) and Nawales (20) with detailed meanings
- All 20 trecenas with daily arcs
- Individual day interpretations
- Cycling mechanism and calendar mechanics
- Trecena reference data

### **writing-style-guide.md**

- Tone, rhythm, pacing
- Mystical but grounded poetic voice
- "Dark rainbow / mystical street poet" style
- What to avoid (clichés, spiritual bypassing, etc.)

### **Example Output Files (Reference)**

When creating new trecenas, refer to these completed examples for format and structure:

- **`data/trecena-toj.js`** — Complete JSON output for the Toj trecena, showing the full structure including prologue, epilogue, all 13 days with stories, energies, horoscopes, meditations, affirmations, birthdays, and all 7 image prompts per day.

- **`docs/trecena-rules-toj.md`** — Complete documentation of the creative decisions made during the Toj trecena creation process, including world module, prologue/epilogue choices, day-by-day decisions, and continuity notes. This serves as a template for the trecena-specific rules file created in Phase 6 of the workflow.

---

# 🌅 **3. Core Concept of the App**

Each trecena is a **13-day spiritual story cycle**.
Each day contains:

1. A **story chapter** (scene in an unfolding narrative)

2. **Energy of the Day**

   - Number meaning
   - Nawal meaning
   - Combined meaning
   - Bullet notes

3. A **daily horoscope**

4. A **daily affirmation**

5. A **daily meditation**

6. **Birthday Profile**

   - Personal energy reading for users born on this specific day.

7. **Seven image prompts**
   (story_primary, story_wide_1, story_wide_2, horoscope, affirmation, meditation, birthday)

All content is generated in **consistent JSON format**.

---

# 🌙 **4. Story Chapter Requirements**

### **Length**

- **300–600 words**
- No more unless explicitly requested.

### **Tone**

Must always be:

- mystical
- poetic
- grounded
- surreal
- emotionally resonant
- cinematic but not purple prose
- spiritually accessible, not “woo” for the sake of woo
- psychologically aware
- gently therapeutic
- symbolic but never vague

### **Narrative Style**

- Second person (“you”)
- Reader as “the traveler”
- The traveler is a **mirror-like presence** (identity-ambiguous, consciousness-forward)
- Story is **sequential**, each day building on the last
- No big plot twists — emotional and symbolic arc instead
- Internal evolution mirrored by the environment
- Environment is always metaphorically connected to the nawal + number combination
- Every chapter is a **scene**, not exposition
- Sensory-rich surrealism
- Symbolism must align with Mayan day energies

### **Pacing**

- Day 1 = emergence
- Days 2–7 = rising revelation, tension, self-understanding
- Days 8–12 = integration, growth, perspective
- Day 13 = culmination, clarity, completion

---

# 🌗 **5. Trecena Structure**

A trecena includes:

- **prologue** — 600–900 words
- **13 days** in sequence
- **epilogue** — 600–900 words

Content must reference:

- The nawal of the trecena (its overarching theme)
- The 13-day arc as a full spiritual journey
- The same symbolic world consistently across chapters

---

# 🌉 **6. Story World Modules**

Each trecena requires a **world module**. These worlds must be defined before writing the trecena, and new worlds will be added here as modules.

For future trecenas, the world module must specify:

- **Core thematic essence**
- **Environmental logic**
- **Symbolic structures**
- **Color palette progression**
- **Recurring motifs**
- **Symbolic guides (non-human)**
- **How the world evolves across the 13 days**

---

## **6A. Imox Story World — Primordial Waters & Dream-Sea**

_(Derived from trecena-imox.js)_

**Core Theme:** The primordial womb, intuition, chaos, the subconscious ocean where creation begins.

**World Essence:**

- A surreal water-world made of tide, mist, dream, and memory
- Floating structures, drifting islands, water pathways
- Environments morph with emotion and subconscious currents
- Constant sense of fluidity, tidal breath, dissolving and forming

**Recurring Motifs:**

- water mirrors, pools, tides
- floating lanterns
- bioluminescent plants
- drifting creatures of light
- wave-geometry
- soft iridescent colors

**Symbolic Presences:**

- No humans
- Only water guardians, ripple-spirits, submerged shapes, dream-creatures

---

## **6B. Aq'ab'al Story World — Dual City (Shadow + Dawn)**

_(Derived from trecena-aqabal.js)_

**Core Theme:** Liminality, dawn, thresholds, internal dawn breaking through old shadow.

**World Essence:**

- A surreal dual-reality city: broken/decayed + luminous/forming
- Two cities overlap and shift based on inner alignment
- Architecture mirrors emotional state

**Recurring Motifs:**

- flickering lights
- broken vs. forming structures
- glowing seams
- reflective doorways
- gold light emerging from cracks
- shadow guides & dream geometry

**Symbolic Presences:**

- No humans
- Silhouettes, light-figures, shadow-shapes, animal-light forms

---

## **6C. Future Trecenas**

These modules will be appended here before story generation.

---

# 🔢 **7. Daily Energy Structure**

Each day includes:

```

energy_of_the_day: {
number: {
title: "",
content: "",
keywords: []
},
nawal: {
title: "",
content: "",
keywords: []
},
combined_energy: {
title: "",
content: "",
notes: []
}
}

```

### **Rules**:

- The **number meaning** must match the traditional Mayan numerological energy
- The **nawal meaning** must match the Mayan calendar spec
- The **combined meaning** must unify the chapter’s emotional lesson with the nawal + number
- All bullet points must be actionable or reflective
- Language must be modern and non-dogmatic

---

# 🔮 **8. Horoscope Rules**

**For detailed writing style guidance, see `writing-style-guide.md`.**

## **Basic Requirements**

- Grounded mystical tone
- Poetic but direct
- ~120–200 words
- Tones: mystical, psychological, encouraging, honest
- Must match the chapter + combined energy
- No astrology clichés
- No fortune telling
- About inner alignment, not prediction
- Do not mention the specific tones, nawales, or mayan references

## **Horoscope Generation Process**

### 1. Determine Today's Energy

- Identify the **Tone (1–13)** and **Nawal (glyph)** for today.
- Identify which **Trecena** we're currently in.

### 2. Interpret the Combination

- Blend the Tone's _motion_ with the Nawal's _essence_.
- Consider how it interacts with the **ruling Trecena's theme**.
- Note patterns (e.g., repeating nawales, mirrored numbers, transition points).

### 3. Create the Message

- **Sharable Version:** Remove specific Mayan numbers/nawales and translate the energy into poetic, mystical, universal language. Blend in a bit of Libra balance and artistry.

### 5. Generate the Image

- **Format:** Square image
- **Mood:** Fantastical, vibrant, dreamlike — "dark rainbow" tone
- **Rules:** No human faces or words. Use abstract figures, light, color, and cosmic movement to capture the day's essence.
- **Goal:** Match the emotional frequency of the horoscope, not the literal symbols.

## **Horoscope Structure**

### **Horoscope**

1. Translate the full reading into **symbolic storytelling** without mentioning numbers or nawales.
2. Keep it poetic, whimsical, and grounded in fantasy or emotion.
3. End with empowerment or humor.

**Example (Sharable):**  
"The day cracks open like a geode, spilling strange light across your path. Something within you remembers how to glow, even when the world forgets how to look. The cosmos is laughing softly — take the hint and create something wild."

**Example (Sharable):**  
"The wind is restless again, carrying messages between clouds. Vision sparks behind your eyes — stories begging to be sung. Say what your silence has been sculpting. The air itself is ready to applaud."

---

# 🎂 **8B. Birthday Profile Rules**

- **Structure**:

```json
birthday: {
  title: "Poetic Title",
  content: "100-150 words explanation"
}
```

- **Content**:

  - Direct address ("To be born on X is to...")
  - Must blend the Number's meaning (e.g., 13 = Ascension/Completion) with the Nawal's meaning (e.g., Ajpu = Sun/Hero).
  - Tone: Empowering, insightful, identity-focused. Deeply respectful of the user's soul path.

---

# 💬 **9. Affirmation Rules**

- ~1 sentence
- First-person
- Present tense
- Emotionally warm
- No future tense or negativity

### Alignment Requirement

- Every affirmation must reflect the synergy of the day’s **number + nawal**.
- The affirmation must express the combined-energy lesson in a warm, first-person form.
- Affirmations should not be generic; they must be derived from:
  - the number’s core theme,
  - the nawal’s core theme,
  - and the day’s combined_energy title/content.

---

# 🧘‍♀️ **10. Meditation Rules**

- 150–250 words
- Guided visualization
- Must reference symbols from the story
- Gentle, accessible language
- Invoke ancestors/lineage respectfully and subtly
- Never culturally appropriate or overstep

---

# 🖼 **11. Image Prompt Rules**

For each day:

```
image_prompts: {
  story_primary: "",
  story_wide_1: "",
  story_wide_2: "",
  horoscope: "",
  affirmation: "",
  meditation: "",
  birthday: ""
}
```

### **Image Prompt Requirements**

- MUST be:

  - cinematic
  - surreal
  - painterly
  - meditative
  - no characters except symbolic non-human forms (silhouettes, guardians, shapes, animal-light forms)

- Color palette must fit the tone of the trecena

- No text in story/horoscope/meditation images

- Affirmation images **must include the exact affirmation text**

- Affirmation images must be "cute surreal" or "soft surreal"

- Meditation images must be soft, abstract, meditative gradients

- Prompts must indicate **aspect ratio** and **palette**

- Prompts must be detailed enough to be consistent across models

### **Core Aesthetic Principles**

- **Mood:** Dark rainbow (vibrant saturation over shadowy undertones)
- **Vibes:** Cosmic mysticism, fantasy, occult-but-playful, pulp sci-fi texture
- **No literal glyphs, sigils, or words**
- **No recognizable human faces or logos**
- **Figures are abstract or vague beings** — silhouettes and "alien-but-not" forms are welcome

### **Composition Principles**

- Use **one clear focal glow** with supporting orbits and trails
- Favor **asymmetry** with deliberate negative space
- Build depth in **3–5 atmospheric layers**: background haze → mid fog → foreground energy
- Edges: soft diffusion around lights, crisp micro-details near focal point
- Motion cues: spirals, arcs, drifting particles, magnetized dust

### **Palette & Materials**

- **Base colors:** charcoal, obsidian, deep teal, indigo
- **Accent colors:** electric magenta, viridian, gold, cyan, ultraviolet, ember orange
- **Materials:** iridescent smoke, opal sheen, oil-on-water film, nebula dust, brushed metal, velvet black
- **Lighting:** bioluminescent cores, rimlight halos, subsurface scattering on mist

### **Prompt Scaffold Structure**

When writing image prompts, use this structure:

**Base elements:**

- Aspect ratio (Square or 16:9 as specified)
- Fantasy/mystical artwork descriptor
- Dark rainbow palette
- Single radiant focal glow
- Layered atmospheric depth (nebula haze, iridescent smoke)
- Abstract beings suggested by light and shadow
- Rich depth, subtle grain, high detail
- No text, no faces

**With trecena + day flavor:**

- Background mood of [TRECENA MOOD]
- Foreground motif hints of [DAY THEMES]
- Bioluminescent core
- Spiral motion or appropriate motion cues
- Layered fog, iridescent particles
- Abstract beings suggested by negative space

**Negative prompt elements:**

- no text, no logo, no watermark, no human face, no realistic animals, no weapons, no letters, no numbers, avoid flat lighting, avoid low-contrast mush

### **Birthday Image Prompt Specifics**

- **Subject**: MUST depict the **Mayan Glyph** for the day's nawal AND the **Mayan Numeral** for the day's number.
- **Numeral format**:
  - Dots (•) = 1 (up to 4)
  - Bars (—) = 5 (up to 3)
  - Shell = 0
  - Example: Number 13 = Two bars with three dots above them.
- **Style**: Ancient stone carving, glowing energy, mystical realism. No English text.
- **Location**: Inside `image_prompts.birthday`.

### **Aspect Ratios**

- story_primary: Square
- story_wide_1: 16:9 cinematic wide
- story_wide_2: 16:9 symbolic close/detail
- horoscope: Square symbolic
- affirmation: Square with text
- meditation: Square abstract gradients
- birthday: Square symbolic/stone

### **Consistency Across Days**

- Motifs should evolve across days
- Colors gradually brighten over the trecena
- Surreal elements must match nawal energies

### **Uniqueness Rule for Multi-Trecena Image Design**

Every new trecena MUST define:

- new motifs
- new symbolic structures
- new color logic
- new visual guardians
- new atmospheric language

This ensures all 13 images across a cycle are visually distinct.

### **Image Prompt QA Checklist**

Before finalizing prompts, verify:

- Aspect ratio matches specification (Square or 16:9)
- No text or faces mentioned
- Clear focal glow with layered depth described
- Colors vibrant yet controlled (dark rainbow palette)
- Motifs match the day's energy and trecena theme
- Negative prompts included to avoid unwanted elements

**Note:** For detailed aesthetic guidance and composition principles, see `image-creation-guide.md`.

---

# ✨ **12. JSON Output Rules**

- Located inside `days: []` array
- Deliver each day as a JSON object in the trecena's `days[]` array
- NO trailing commas
- Paragraphs separated with `\n\n`
- Quote-safe formatting
- Must remain parseable JSON
- No fancy punctuation that breaks JSON
- Chapters fixed at 300–600 words

---

# 📜 **13. Prologue & Epilogue Rules**

- 600–900 words
- Prologue introduces world + traveler
- Epilogue integrates the journey
- Must echo symbols from all days

---

# 🔄 **14. Continuity Rules**

- Environment shifts gradually with inner change
- Symbols must be consistent across the trecena
- No contradictory resets
- No major plot events unless symbolic
- Nawal of the trecena must permeate entire arc

---

# 🎭 **15. Style Guide Integration**

Use `writing-style-guide.md` for tone and sentence craft
Use `mayan-calendar-reference.md` Part I for Mayan calendar reference data (Numbers and Nawales with detailed meanings)
Use `mayan-calendar-reference.md` Part II for trecena reference data
Use `data/trecena-toj.js` as the exemplar format for JSON structure
Use `docs/trecena-rules-toj.md` as the exemplar format for trecena-specific rules documentation

---

## 💼 **16. How to Start a New Chat**

Provide:

- trecena-creation-guide.md
- mayan-calendar-reference.md
- writing-style-guide.md
- any completed trecena files (e.g., `data/trecena-toj.js` and `docs/trecena-rules-toj.md` as examples)

Then say:

"I am generating the **X trecena**, starting on Day Y. Follow all rules in trecena-creation-guide.md."

---

## 🤝 **17. Collaborative Trecena Building Workflow**

When the user requests to build a new trecena, you MUST follow this collaborative workflow. **Never generate JSON until explicitly approved.** Always present options and wait for user feedback.

### **Phase 1: Trecena Discovery & Overview**

When user says "I want to build [Nawal] trecena":

1. **Acknowledge the request** and confirm the nawal name
2. **Provide brief overview**:
   - Core meaning of the nawal (from canonical sources)
   - Emotional/psychological themes
   - How it differs from existing trecenas
3. **Reference existing trecenas** for context (e.g., "Like Imox's water-world or Aq'ab'al's dual city...")
4. **Wait for user confirmation** before proceeding to world building

### **Phase 2: World Building (Present Options)**

**Present 2–3 world concept options.** Each option must include:

- **Core Theme**: One-sentence essence
- **World Essence**: 2–3 sentences describing the environment
- **Key Motifs**: 3–5 recurring visual/symbolic elements
- **Color Palette Direction**: General color scheme
- **Symbolic Guides**: Types of non-human presences

**Format example:**

```
**Option A: [World Name]**
- Core Theme: [one sentence]
- World Essence: [2-3 sentences]
- Key Motifs: [list]
- Colors: [description]
- Guides: [types]

**Option B: [World Name]**
...
```

**After user selects:**

- Expand the chosen world with full details matching Section 6 requirements
- Define: core theme, world essence, recurring motifs, symbolic presences, color palette progression
- Get user approval/refinement before proceeding

### **Phase 3: Prologue & Epilogue Planning**

**Present 2–3 options for each:**

**Prologue Options:**

- Each option: 1–2 sentence scene concept
- How the traveler enters the world
- Emotional tone
- Opening symbols/motifs

**Epilogue Options:**

- Each option: 1–2 sentence scene concept
- How the journey integrates/completes
- Emotional resolution
- Closing symbols that echo the arc

**Wait for user selections/refinements** before moving to day-by-day planning.

### **Phase 4: Day-by-Day Planning (Days 1–13)**

**For EACH day, you must present ALL of the following for user review:**

#### **A. Story Scene Options (2–3 options)**

- Brief scene concept (1–2 sentences)
- Emotional arc position (emergence/revelation/integration/culmination)
- Key symbols/motifs that will appear
- How it builds on previous days

#### **B. Image Prompt Directions (All 7 images)**

For each of the 7 image types, present 2–3 visual concept options:

- **story_primary**: Square establishing shot options
- **story_wide_1**: 16:9 cinematic wide options
- **story_wide_2**: 16:9 symbolic close/detail options
- **horoscope**: Square mystical symbolic options
- **affirmation**: Square with text (must include affirmation) options
- **meditation**: Square abstract gradient options
- **birthday**: Square Mayan glyph + numeral options

#### **C. Horoscope Direction (2–3 options)**

- Brief thematic direction (1 sentence each)
- Emotional tone options
- Key insights to explore

#### **D. Meditation Direction (2–3 options)**

- Visualization concept (1 sentence each)
- Symbols to invoke
- Emotional journey for the meditation

#### **E. Affirmation Direction (2–3 options)**

- Brief affirmation concept (not full text yet)
- Core message to express
- Energy to embody

#### **F. Birthday Profile Direction (2–3 options)**

- Title concept (poetic direction)
- Core identity theme to explore
- How number + nawal blend

**Important:**

- **Energy of the Day** (number, nawal, combined) will be auto-generated based on canonical sources—no user supervision needed
- Wait for user selections/feedback on ALL aspects (A–F) before moving to the next day
- User may request revisions to earlier days as the story develops—this is expected and welcome

**Incremental JSON Export Schedule**

To prevent context loss and keep the process clean, you must **generate and present the JSON code block** at the following specific milestones. Do not wait for the very end to generate code.

- **Milestone 1 (After Day 1 is approved):** Generate JSON containing trecena data, `prologue`, `epilogue` and `day 1`.
- **Milestone 2 (After Day 4 is approved):** Generate JSON containing `days 2–4`.
- **Milestone 3 (After Day 7 is approved):** Generate JSON containing `days 5–7`.
- **Milestone 4 (After Day 10 is approved):** Generate JSON containing `days 8–10`.
- **Milestone 5 (After Day 13 is approved):** Generate JSON containing `days 11–13`.

_Note: Continue the standard planning process (presenting options A–F) for every single day. The export happens only after the specific days listed above are finalized._

### **Phase 5: Review & Refinement**

After all 13 days are planned:

1. **Present arc summary**:

   - Overall emotional journey
   - Key continuity points
   - Symbol evolution across days
   - World transformation arc

2. **Ask for any final adjustments**:

   - "Any changes to any days before we generate?"
   - "Any motifs or symbols to strengthen?"
   - "Any continuity issues to address?"

3. **Wait for explicit approval** before JSON generation

### **Phase 6: JSON Generation & Trecena Rules Creation**

**Only proceed when user explicitly approves** (e.g., "Generate the JSON now" or "Let's build it").

**Step 1: Generate Complete JSON**

- Follow ALL rules in trecena-creation-guide.md
- Generate full trecena with prologue, all 13 days, epilogue
- Include all content: stories, energies, horoscopes, meditations, affirmations, birthdays, all 7 image prompts per day
- Ensure JSON is valid and parseable

**Step 2: Create Trecena-Specific Rules File**
After JSON generation, create a new file: `docs/trecena-rules-[nawal].md`

**Reference:** See `docs/trecena-rules-toj.md` for a complete example of this file structure.

This file must document:

```markdown
# Trecena [Nawal] — Creation Rules & Decisions

## World Module

[Full world description as defined in Phase 2]

## Prologue Choice

[Selected option and any refinements]

## Epilogue Choice

[Selected option and any refinements]

## Day-by-Day Decisions

### Day 1: [Number] [Nawal]

- Story Scene: [Selected option]
- Image Prompts: [Selected directions for all 7]
- Horoscope: [Selected direction]
- Meditation: [Selected direction]
- Affirmation: [Selected direction]
- Birthday: [Selected direction]
- Notes: [Any special decisions or refinements]

[... repeat for all 13 days ...]

## Continuity Notes

[Key symbols, motifs, or themes that must be maintained]
[Color progression decisions]
[World evolution arc]
```

**This rules file serves as:**

- Memory of all creative decisions
- Reference for future revisions
- Documentation of the trecena's unique identity

### **Workflow Flexibility**

- **User can revise earlier decisions** at any point—accommodate changes gracefully
- **User can say "take the wheel"** on specific aspects—use best judgment while staying true to established choices
- **User can request regeneration** of JSON after reviewing—make adjustments and regenerate
- **Always wait for explicit approval** before generating JSON—never assume

### **What NOT to Do**

- ❌ Never generate JSON without explicit approval
- ❌ Never skip presenting options (unless user explicitly says "take the wheel")
- ❌ Never proceed to next day without user feedback on current day
- ❌ Never forget to create the trecena-specific rules file
- ❌ Never make assumptions about user preferences—always present options

---

## 🌟 **18. What the Model Must Always Remember**

- Stories are rituals
- Worlds mirror inner transformation
- Symbols must be intentional
- Reader is mid-transformation
- Each trecena = emotional + spiritual arc
