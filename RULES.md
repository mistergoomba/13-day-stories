# 🌿 **RULES.md — Master Specification for the 13-Day Mayan Stories Project**

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

Any new chat must reference this file to ensure perfect consistency.

---

# 🌅 **2. Core Concept of the App**

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

6. **Six image prompts**
   (square story, wide story 1, wide story 2, horoscope, affirmation, meditation)

All content is generated in **consistent JSON format**.

---

# 🌙 **3. Story Chapter Requirements**

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

# 🌗 **4. Trecena Structure**

A trecena includes:

- **prologue** — 600–900 words
- **13 days** in sequence
- **epilogue** — 600–900 words

Content must reference:

- The nawal of the trecena (its overarching theme)
- The 13-day arc as a full spiritual journey
- The same symbolic world consistently across chapters

---

# 🌉 **5. Story World Modules**

Each trecena has its own symbolic world. These worlds must be defined before writing the trecena, and new worlds will be added here as modules.

---

## **5A. Imox Story World — Primordial Waters & Dream-Sea**

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

## **5B. Aq’ab’al Story World — Dual City (Shadow + Dawn)**

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

## **5C. Future Trecenas**

For future trecenas, the world module must specify:

- **Core theme of the trecena**
- **Environmental motifs**
- **Symbolic structures**
- **Color palette progression**
- **Types of symbolic guides allowed**
- **How the world evolves across the 13 days**

These modules will be appended here before story generation. (Dual City)\*\*

For the Aq’ab’al trecena, the world is a **dual-reality urban environment**:

### **Shadow City**

- Cracked neon
- Dim twilight
- Flickering signs
- Dystopian, but not evil
- Represents trauma, stagnation, emotional numbness, unspoken truths
- Wounded but alive
- A place of forgotten hopes and buried feelings

### **Dawn/Dream City**

- Ethereal
- Luminous structures
- Glowing seams of light
- Surreal geometry
- A city half-formed from hope and inner revelation
- Represents possibility, becoming, healing, transition

### **Core Theme**

**Dawn occurs inside the traveler, and the city mirrors it.**
The traveler’s inner alignment alters the world.

### **Recurring Motifs**

- flickering lights
- broken vs. forming structures
- glowing doorways
- reflective surfaces
- dream-geometry
- soft gold light
- shadow creatures or guides
- liminal alleyways

### **Character Rule**

- No named characters
- Keep all presences symbolic (shadows, shapes, guardians, silhouettes, etc.)

---

# 🔢 **6. Daily Energy Structure**

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

### Rules:

- The **number meaning** must match the traditional Mayan numerological energy
- The **nawal meaning** must match the Mayan calendar spec
- The **combined meaning** must unify the chapter’s emotional lesson with the nawal + number
- All bullet points must be actionable or reflective
- Language must be modern and non-dogmatic

---

# 🔮 **7. Horoscope Rules**

- Poetic but grounded
- ~120–200 words
- Tones: mystical, psychological, encouraging, honest
- Must match the chapter + combined energy
- No astrology clichés
- No fortune telling
- About inner alignment, not prediction

---

# 💬 **8. Affirmation Rules**

- Short
- Present tense
- First person (“I…”)
- Emotionally warm
- ~1 sentence

---

# 🧘‍♀️ **9. Meditation Rules**

- 150–250 words
- Guided visualization
- Must reference symbols from the story
- Gentle, accessible language
- Invoke ancestors/lineage respectfully and subtly
- Never culturally appropriate or overstep

---

# 🖼 **10. Image Prompt Rules**

For each day:

```
image_prompts: {
  story_primary: "",
  story_wide_1: "",
  story_wide_2: "",
  horoscope: "",
  affirmation: "",
  meditation: ""
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

- Affirmation images must be “cute surreal” or “soft surreal”

- Meditation images must be soft, abstract, meditative gradients

- Prompts must indicate **aspect ratio** and **palette**

- Prompts must be detailed enough to be consistent across models

### **Aspect Ratios**

- story_primary: Square
- story_wide_1: 16:9 cinematic wide
- story_wide_2: 16:9 symbolic close/detail
- horoscope: Square symbolic
- affirmation: Square with text
- meditation: Square abstract gradients

### **Aq’ab’al-Specific Image Behavior**

- Environments must reflect dual-city world
- Shadow City: cracked neon, dim twilight
- Dawn City: luminous gold seams, surreal geometry
- No literal humans

### **Consistency Across Days**

- Motifs should evolve across days
- Colors gradually brighten over the trecena
- Surreal elements must match nawal energies

---

# ✨ **11. JSON Output Rules**

- Deliver each day as a JSON object in the trecena’s `days[]` array
- Paragraphs separated with `

`

- Quote-safe formatting
- Chapters fixed at 300–600 words

---

# 📜 **12. Prologue & Epilogue Rules**

- 600–900 words
- Prologue introduces world + traveler
- Epilogue integrates the journey
- Must echo symbols from all days

---

# 🔄 **13. Continuity Rules**

- Environment shifts gradually with inner change
- Symbols must be consistent across the trecena
- No contradictory resets
- No major plot events unless symbolic
- Nawal of the trecena must permeate entire arc

---

# 🎭 **14. Style Guide Integration**

Use `writing-style-guide.md` for tone and sentence craft
Use `mayan-calendar.md` + `mayan-summaries.md` for accurate meanings
Use `trecena-imox.js` as the exemplar format

---

# 💼
