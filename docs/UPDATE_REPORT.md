# Documentation Update Report: Splitting Full Trecena Build into Separate Workflows

## 📋 Overview of Changes

The user wants to split "Build a Full Trecena" into 4 separate request types, each with its own collaborative workflow. This report outlines all sections that need to be updated.

---

## 🔄 **1. Section 16: Types of User Requests**

**Location:** Lines 621-677
**Status:** ⚠️ **MAJOR REWRITE REQUIRED**

### Current State:

- Request Type 1: Build a Full Trecena
- Request Type 2: Build Images for a Particular Day
- Request Type 3: Generate Birthday Data Only
- Request Type 4: Generate All Birthday Images

### New Structure Needed:

**Request Type 1: Build a Story**

- Build prologue, epilogue, all 13 chapters
- Generate story_primary, story_wide_1, story_wide_2 image prompts
- Only present chapter options (no horoscope, affirmation, birthday, meditation options)
- Epilogue option selection happens later (not during initial planning)
- Output: Story JSON only (prologue, epilogue, chapters, story image prompts)

**Request Type 2: Build Horoscopes**

- Present 3 options for each horoscope (one day at a time)
- User chooses one option per day
- Output: Horoscope JSON + horoscope image prompts for all 13 days
- Horoscopes should be considerably longer with fantastical metaphors

**Request Type 3: Build Affirmations**

- Present 3 options for each affirmation (one day at a time)
- User chooses one option per day
- Output: Affirmation JSON + affirmation image prompts for all 13 days

**Request Type 4: Build Meditations**

- Present 3 options for each meditation (one day at a time)
- User chooses one option per day
- Output: Meditation JSON for all 13 days (no meditation images - already documented)

**Request Type 5: Build Images for a Particular Day** (renumbered from Type 2)

- Keep existing functionality

**Request Type 6: Generate Birthday Data Only** (renumbered from Type 3)

- Keep existing functionality

**Request Type 7: Generate All Birthday Images** (renumbered from Type 4)

- Keep existing functionality

---

## 📝 **2. Section 8: Horoscope Rules**

**Location:** Lines 291-344
**Status:** ⚠️ **UPDATE REQUIRED**

### Changes Needed:

**Line 299:** Update length requirement

- **Current:** `~120–200 words`
- **New:** `~240–400 words` (doubled, with emphasis on being considerably longer)

**Line 297-300:** Add requirement for fantastical metaphors

- Add bullet point: "Must include fantastical metaphors and vivid imagery"
- Emphasize poetic, symbolic storytelling with rich metaphorical language

**Line 320-323:** Update "Create the Message" section

- Add emphasis on fantastical metaphors
- Clarify that horoscopes should be longer, more immersive experiences

---

## 💬 **3. Section 9: Affirmation Rules**

**Location:** Lines 371-388
**Status:** ✅ **MINOR UPDATE** (may need workflow clarification)

### Changes Needed:

- No content changes to rules themselves
- May need to reference that affirmations are built separately with options workflow
- Consider if length needs adjustment (currently ~1 sentence)

---

## 🧘‍♀️ **4. Section 10: Meditation Rules**

**Location:** Lines 390-405
**Status:** ✅ **MINOR UPDATE** (may need workflow clarification)

### Changes Needed:

- No content changes to rules themselves
- May need to reference that meditations are built separately with options workflow
- Current length (150–250 words) seems appropriate

---

## 🤝 **5. Section 18: Collaborative Trecena Building Workflow**

**Location:** Lines 695-921
**Status:** ⚠️ **MAJOR RESTRUCTURE REQUIRED**

### Changes Needed:

**Rename to:** "Collaborative Story Building Workflow" (for Request Type 1)

**Phase 1: Trecena Discovery & Overview** (Lines 699-709)

- Keep as-is, but change context to "building a story for [Nawal] trecena"

**Phase 2: World Building** (Lines 711-739)

- Keep as-is

**Phase 3: Prologue & Epilogue Planning** (Lines 741-759)

- **CHANGE:** Only present Prologue options initially
- **CHANGE:** Epilogue options are presented later (after all chapters are done, or as separate step)
- Update instructions to reflect this change

**Phase 4: Day-by-Day Planning** (Lines 761-815)

- **MAJOR CHANGE:** Only present **Chapter Options (2-3 options)** for each day
- **REMOVE:** Horoscope Direction options (Section B)
- **REMOVE:** Meditation Direction options (Section C)
- **REMOVE:** Affirmation Direction options (Section D)
- **REMOVE:** Birthday Profile Direction options (Section E)
- **KEEP:** Image prompts are automatically inferred from chapter choices (story_primary, story_wide_1, story_wide_2)
- Update instructions to reflect story-only focus

**Phase 5: Review & Refinement** (Lines 817-834)

- Keep as-is, but focus on story arc only

**Phase 6: JSON Generation** (Lines 836+)

- Update to reflect story JSON only (prologue, epilogue, chapters, story image prompts)
- Remove references to horoscope, affirmation, meditation, birthday content

### New Sections Needed:

**Add Section 19: Collaborative Horoscope Building Workflow**

- Present 3 options for each day's horoscope
- User selects one per day
- Output JSON with horoscopes + horoscope image prompts

**Add Section 20: Collaborative Affirmation Building Workflow**

- Present 3 options for each day's affirmation
- User selects one per day
- Output JSON with affirmations + affirmation image prompts

**Add Section 21: Collaborative Meditation Building Workflow**

- Present 3 options for each day's meditation
- User selects one per day
- Output JSON with meditations (no images)

---

## 📘 **6. Section 17: How to Start a New Chat**

**Location:** Lines 680-692
**Status:** ⚠️ **UPDATE REQUIRED**

### Changes Needed:

- Update the description to reflect the new 7 request types
- Reference the new workflow sections (18, 19, 20, 21)

---

## 📄 **7. Document Introduction/Header**

**Location:** Lines 1-20 (and user's provided intro)
**Status:** ⚠️ **UPDATE REQUIRED**

### User's Current Intro (needs updating):

```
As a user, I may ask for one of four things: (1) Build a full trecena following the collaborative workflow in `trecena-creation-guide.md` Section 18, (2) Build images for a particular day (generate 6 images per day in sequence), (3) Generate just the birthday data, energy of the day data, and birthday image prompt for all 13 days of a trecena (no options or questions, just generate immediately following the rules), or (4) Generate all birthday images in a JSON with birthday image prompts for all 13 days. See `trecena-creation-guide.md` Section 16 for detailed instructions for each request type.
```

### New Intro Should Be:

```
As a user, I may ask for one of seven things: (1) Build a story (prologue, epilogue, chapters, and story image prompts) following the collaborative workflow in `trecena-creation-guide.md` Section 18, (2) Build horoscopes (3 options per day, user selects one) following Section 19, (3) Build affirmations (3 options per day, user selects one) following Section 20, (4) Build meditations (3 options per day, user selects one) following Section 21, (5) Build images for a particular day (generate 6 images per day in sequence), (6) Generate just the birthday data, energy of the day data, and birthday image prompt for all 13 days of a trecena (no options or questions, just generate immediately following the rules), or (7) Generate all birthday images in a JSON with birthday image prompts for all 13 days. See `trecena-creation-guide.md` Section 16 for detailed instructions for each request type.
```

---

## 📊 **8. Section 1: Purpose of This Document**

**Location:** Lines 5-18
**Status:** ✅ **MINOR UPDATE** (optional)

### Potential Update:

- May want to clarify that workflows are now split by content type

---

## 🔍 **9. Section 2: Authoritative Source Files**

**Location:** Lines 23-60
**Status:** ✅ **NO CHANGES NEEDED**

---

## 📝 **10. JSON Structure Examples**

**Location:** Various sections
**Status:** ⚠️ **REVIEW NEEDED**

### Considerations:

- Ensure JSON examples reflect that story, horoscopes, affirmations, meditations can be separate
- May need to add example JSON structures for each separate workflow output

---

## ✅ Summary of Required Updates

### High Priority (Must Update):

1. ✅ **Section 16** - Complete rewrite of request types
2. ✅ **Section 8** - Update horoscope length and add fantastical metaphors requirement
3. ✅ **Section 18** - Restructure for story-only workflow, remove other content types
4. ✅ **Section 17** - Update to reference new sections
5. ✅ **Add Section 19** - Horoscope building workflow
6. ✅ **Add Section 20** - Affirmation building workflow
7. ✅ **Add Section 21** - Meditation building workflow
8. ✅ **Update Intro** - User's provided intro section

### Medium Priority (Should Review):

9. ⚠️ **Section 9** - May need workflow reference
10. ⚠️ **Section 10** - May need workflow reference
11. ⚠️ **JSON Examples** - Review for consistency

### Low Priority (Optional):

12. ⚠️ **Section 1** - Optional clarification

---

## 🎯 Key Points to Remember:

1. **Story Building** = Only chapters, prologue, epilogue, story image prompts
2. **Horoscopes** = 3 options per day, considerably longer (240-400 words), fantastical metaphors
3. **Affirmations** = 3 options per day
4. **Meditations** = 3 options per day
5. **Epilogue** = Selected later, not during initial story planning
6. **Image Prompts** = Inferred from content choices (no separate options needed)
