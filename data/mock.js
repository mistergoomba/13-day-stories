// Mock trecena = No'j; "today" is Oct 14 mapped to Imox-05 for demo

export const MOCK_TODAY_ISO = '2025-10-14';
export const MOCK_TZ = 'America/Los_Angeles';

export const nojTrecena = {
  name: "No'j",
  theme: 'New ideas into practical solutions',
  overview:
    'Sudden insight meets grounded problem-solving. Ideas may be early for others; incubate and socialize lightly.',
  focus: ['problem-solving', 'planning', 'clarity', 'study', 'small experiments'],
  arcLabels: [
    'Life is beautiful',
    'Serve others',
    'All things pass',
    'Simplify',
    'Effort toward the dream',
    'Clear communication',
    'Contrast teaches',
    'Interdependence',
    'Lessons & teachers',
    'Legacy reflection',
    'Wander wilderness',
    'Seed highest intention',
    'Make an offering',
  ],
  intro: {
    title: "No'j Trecena — 13 Days of Intelligence and Ideas",
    body: "Welcome to the No'j trecena. For the next 13 days, we explore practical insight. This is a time to gather, study, and gently prototype ideas. Approach each day as a chapter in a larger story. (Lorem ipsum intro…) ",
  },
  // Keys: nawal-first with zero padded tone (Imox-05)
  days: {
    "No'j-01": mkDay(1, "No'j"),
    'Tijax-02': mkDay(2, 'Tijax'),
    'Kawoq-03': mkDay(3, 'Kawoq'),
    'Ajpu-04': mkDay(4, 'Ajpu'),
    'Imox-05': mkDay(5, 'Imox'),
    "Iq'-06": mkDay(6, "Iq'"),
    "Aq'ab'al-07": mkDay(7, "Aq'ab'al"),
    "K'at-08": mkDay(8, "K'at"),
    'Kan-09': mkDay(9, 'Kan'),
    'Kame-10': mkDay(10, 'Kame'),
    'Kej-11': mkDay(11, 'Kej'),
    "Q'anil-12": mkDay(12, "Q'anil"),
    'Toj-13': mkDay(13, 'Toj'),
  },
};

// helper to generate lorem day content
function mkDay(tone, nawal) {
  const key = `${nawal}-${String(tone).padStart(2, '0')}`;
  return {
    key,
    dayIndex: tone,
    tone,
    nawal,
    dateISO: null, // filled by mapping util if you want
    storyChapter:
      'Story Chapter: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in urna ut orci viverra dictum.',
    sharable:
      "Sharable Horoscope: A whimsical, fantastical note inspired by today's energies. Nulla facilisi. Curabitur egestas.",
    mayanReading:
      'Mayan Reading: Placeholder using tone and nawal motifs. Integer ac orci feugiat, eleifend neque a, tempor sapien.',
  };
}

export const mockAppData = {
  currentTrecenaKey: "No'j",
  trecenas: { "No'j": nojTrecena },
};
