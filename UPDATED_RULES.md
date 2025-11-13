# 🌿 RULES.md — Master Specification for the 13-Day Mayan Stories Project

## 📘 1. Purpose of This Document

This file defines the complete rules for generating 13-day Mayan trecena story cycles. It ensures consistency in:

- Story world construction
- Narrative tone & pacing
- JSON formatting
- Image prompt creation
- Daily energies (number + nawal)
- Horoscopes, affirmations, meditations
- Continuity across all trecenas

Any new chat must reference this file and ALL canonical sources.

---

## 📚 2. Authoritative Source Files (Canonical & Required)

The following uploaded files are ALWAYS the sources of truth:

### **mayan-calendar-spec.md**

- Full traditional meanings of nawales
- Numerology (1–13)
- Elemental relationships
- Shadow/light dynamics
- Cosmological grounding

### **mayan-summaries.md**

- Concise, narrative-friendly summaries of each nawal
- Quick-reference keywords
- Emotional/psychological interpretations

### **mayan-calendar.md**

- Extended descriptions of each number and nawal
- Integration of shadow/light expressions
- Elemental resonance + trecena themes

### **writing-style-guide.md**

- Tone, rhythm, pacing
- Mystical but grounded poetic voice
- “Dark rainbow / mystical street poet” style
- What to avoid (clichés, spiritual bypassing, etc.)

### **Completed Trecena Files**

(e.g., `trecena-imox.js`, `trecena-aqabal.js`)

- Serve as the gold standard for:
  - JSON formatting
  - Story pacing
  - Image prompt structure
  - Tone, symbolism, and emotional arc
  - Integration of nawal + number

All future trecenas must be consistent with these foundational examples.

---

## 🌅 3. Core Concept of the App

Each trecena is a **13-day spiritual story cycle**.  
Each day includes:

1. Story chapter
2. Energy of the Day
3. Horoscope
4. Affirmation
5. Meditation
6. Six image prompts

All delivered in **clean JSON**.

---

## 🌙 4. Story Chapter Requirements

### Length

- **300–600 words**
- Never exceed unless explicitly requested.

### Tone

- mystical
- poetic
- grounded
- surreal
- cinematic
- emotionally resonant
- psychologically aware

Never overly “woo” or cliché. Symbolic but not vague.

### Style

- Second-person (“you”)
- Traveler is a **mirror-like consciousness**
- No bodily descriptions or gender
- Sequential, emotional arc
- Every chapter = a scene
- Sensory surrealism grounded in Mayan energy

### Pacing Across 13 Days

- Day 1: emergence
- Days 2–7: rising revelation
- Days 8–12: integration
- Day 13: clarity + culmination

---

## 🌉 5. Story World Modules

Each trecena requires a **world module**. Future trecenas must define:

- Core thematic essence
- Environmental logic
- Symbolic structures
- Color palette progression
- Recurring motifs
- Symbolic guides (non-human)
- How the world evolves over 13 days

### 5A. Imox — Primordial Dream-Sea World

- Fluid subconscious reality
- Dream-tides, floating structures
- Water mirrors, bioluminescent plants
- Ripple-spirits, wave geometry
- Colors: iridescent blue, lavender, soft white
- Archetype: chaos → intuition → creation

### 5B. Aq’ab’al — Dual City (Shadow + Dawn)

- Broken neon city overlaid with luminous dream-city
- Dawn emerging through cracks
- Motifs: flickering lights, reflective doorways, gold seams
- Guides: light-figures, shadow-shapes
- Colors: violet twilight → gold dawn

---

## 🔢 6. Daily Energy Structure

Must follow this exact JSON shape:

{
"number": {...},
"nawal": {...},
"combined_energy": {...}
}

### Requirements:

- Accurate number meaning
- Accurate nawal meaning
- Combined energy must unify:
  - the day’s symbolism
  - the chapter’s emotional arc
  - the number+nawal archetypes
- Bullet notes are reflective + actionable

---

## 🔮 7. Horoscope Rules

- 120–200 words
- Grounded mystical tone
- Poetic but direct
- No clichés
- No predictions or fortune telling
- Always internally aligned with the day’s symbolic meaning

---

## 💬 8. Affirmation Rules

- 1 sentence
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

## 🧘‍♀️ 9. Meditation Rules

- 150–250 words
- Gentle, guided visualization
- References symbols from the chapter
- Ancestral acknowledgements subtle & respectful

---

## 🖼 10. Image Prompt Rules

### Global Requirements (for ALL trecenas)

- cinematic
- surreal
- painterly
- meditative
- NO humans
- only symbolic forms:
  - silhouettes
  - guardians
  - shadow shapes
  - light-beings
  - abstract creatures
- No text except in affirmation image
- Palette must match trecena’s world module
- Prompts must be DIFFERENT across images (avoid repetition)

### Types

- **story_primary**: square, wide-environment establishing shot
- **story_wide_1**: 16:9 dynamic cinematic view
- **story_wide_2**: 16:9 symbolic close or alternate angle
- **horoscope**: square mystical symbolic image
- **affirmation**: MUST include exact text in the center
- **meditation**: soft, blurred, abstracted environment

### Uniqueness Rule for Multi-Trecena Image Design

Every new trecena MUST define:

- new motifs
- new symbolic structures
- new color logic
- new visual guardians
- new atmospheric language

This ensures all 13 images across a cycle are visually distinct.

---

## ✨ 11. JSON Output Rules

- Located inside `days: []` array
- NO trailing commas
- Chapter text uses `\n\n`
- Must remain parseable JSON
- No fancy punctuation that breaks JSON

---

## 📜 12. Prologue & Epilogue Rules

- 600–900 words
- Must tie into trecena’s world module
- Prologue = opening of symbolic world
- Epilogue = integration + release + next dawn

---

## 🔄 13. Continuity Rules

- Environment evolves with internal changes
- No contradictions
- Symbolic events ripple through later chapters
- Emotional tone shifts gradually
- Nawal of the trecena must permeate everything

---

## 🎭 14. Integration With Style Guide

Follow all rules in **writing-style-guide.md**, including:

- mystical grounded tone
- balanced metaphor density
- emotional clarity
- avoidance of overt “woo”

---

## 💼 15. How to Start a New Chat

Provide:

- RULES.md
- mayan-calendar-spec.md
- mayan-summaries.md
- mayan-calendar.md
- writing-style-guide.md
- any completed trecena files

Then say:

“I am generating the **X trecena**, starting on Day Y. Follow all rules in RULES.md.”

---

## 🌟 16. What the Model Must Always Remember

- Stories are rituals
- Worlds mirror inner transformation
- Symbols must be intentional
- Reader is mid-transformation
- Each trecena = emotional + spiritual arc
