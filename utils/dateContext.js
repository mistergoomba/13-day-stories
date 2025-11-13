import { mockAppData, MOCK_TODAY_ISO } from '../data/mock';

// For demo: map Oct 14 (MOCK_TODAY_ISO) to Imox-05 within No'j trecena.
const TODAY_TONE = 5; // "Imox-05" dayIndex inside No'j
const TODAY_KEY = 'Imox-05';

export function getCurrentContext() {
  const trecenaKey = mockAppData.currentTrecenaKey;
  return {
    trecenaKey,
    todayKey: TODAY_KEY,
    todayIndex: TODAY_TONE, // 1..13
  };
}

/**
 * Given an active panel, produce toolbar state:
 * - center day pill
 * - up to two left pills (previous days, or Intro when at day 1)
 * - rightActions always ["affirmation","meditation"]
 * - canGoBack/canGoForward clamp at Intro and Today
 *
 * active can be: "intro" | DayKey (e.g., "Imox-05")
 */
export function getToolbarState(active, ctx) {
  const t = mockAppData.trecenas[ctx.trecenaKey];
  const days = Object.values(t.days).sort((a, b) => a.dayIndex - b.dayIndex); // 1..13

  let centerObj;
  if (active === 'intro') {
    // center shows Day 1 as preview label but not active (we still show Intro screen)
    const d1 = days[0];
    centerObj = {
      label: dateLabelFor(d1.dayIndex), // "Oct 10" for Day 1
      sublabel: d1.key, // "No'j-01"
      key: 'intro',
    };
  } else {
    const d = t.days[active];
    centerObj = {
      label: dateLabelFor(d.dayIndex),
      sublabel: d.key,
      key: d.key,
    };
  }

  // build left pills (up to two previous items in sequence)
  let left = [];

  // Create the full sequence: [Intro, Day1, Day2, Day3, ...]
  const sequence = [
    { label: 'Intro', sublabel: "No'j Trecena", key: 'intro' },
    ...days.map((d) => mkLeft(d)),
  ];

  if (active === 'intro') {
    // no prior panels
    left = [];
  } else {
    const currentIndex = t.days[active].dayIndex; // 1-based day index
    const currentSequenceIndex = currentIndex; // Day 1 = index 1, Day 2 = index 2, etc.

    // Add the 2 previous items in sequence
    if (currentSequenceIndex >= 2) {
      left.push(sequence[currentSequenceIndex - 2]); // 2 items back
    }
    if (currentSequenceIndex >= 1) {
      left.push(sequence[currentSequenceIndex - 1]); // 1 item back
    }
  }

  // clamps
  const canGoBack = active === 'intro' ? false : true; // can fling right to go towards intro
  const canGoForward = active === 'intro' ? true : t.days[active].dayIndex < ctx.todayIndex; // stop at today

  return {
    center: centerObj,
    left,
    rightActions: ['affirmation', 'meditation'],
    canGoBack,
    canGoForward,
  };
}

function mkLeft(d) {
  return {
    label: dateLabelFor(d.dayIndex),
    sublabel: d.key,
    key: d.key,
  };
}

// Mock date label generator: Today is Day 5 => Oct 14; Day 4 => Oct 13, etc.
function dateLabelFor(dayIndex) {
  const base = new Date(MOCK_TODAY_ISO + 'T12:00:00Z'); // noon to avoid TZ drift
  const deltaDays = dayIndex - 5; // 5 == today
  const d = new Date(base);
  d.setUTCDate(base.getUTCDate() + deltaDays);
  const m = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getUTCDate();
  return `${m} ${day}`;
}

/**
 * Transition helpers
 */
export function goForward(active, ctx) {
  const t = mockAppData.trecenas[ctx.trecenaKey];
  if (active === 'intro') {
    // intro -> day1
    return findKeyByIndex(t, 1);
  }
  const idx = t.days[active].dayIndex;
  if (idx >= ctx.todayIndex) return active;
  return findKeyByIndex(t, idx + 1);
}

export function goBack(active, ctx) {
  const t = mockAppData.trecenas[ctx.trecenaKey];
  if (active === 'intro') return 'intro';
  const idx = t.days[active].dayIndex;
  if (idx <= 1) return 'intro';
  return findKeyByIndex(t, idx - 1);
}

export function findKeyByIndex(trecena, index) {
  const entry = Object.values(trecena.days).find((d) => d.dayIndex === index);
  return entry ? entry.key : 'intro';
}
