/**
 * Notification Configuration
 * Centralized configuration for all notification messages and settings
 */

export const NOTIFICATION_CONFIG = {
  // Default times
  defaultMorningTime: { hour: 8, minute: 0 },
  defaultEveningTime: { hour: 20, minute: 0 },
  
  // How many days ahead to schedule (14 days)
  daysAhead: 14,
  
  // Minimum days before scheduling "we miss you" notifications
  minDaysForMissYou: 14,
  
  // Notification message templates (arrays for randomization)
  messages: {
    morning: [
      // 1. Standard/Direct
      (mayanDate, energyTitle) => 
        `Today is ${mayanDate.formatted}. Explore the energy of "${energyTitle}" and see what it reveals.`,
      // 2. Inspiring/Call to Action
      (mayanDate, energyTitle) => 
        `Rise and shine. Today is ${mayanDate.formatted}: A powerful day for "${energyTitle}".`,
      // 3. Question/Curiosity
      (mayanDate, energyTitle) => 
        `How will the energy of "${energyTitle}" shape your path today? Check your daily guidance.`,
      // 4. Short/Punchy
      (mayanDate, energyTitle) => 
        `New energy arrived: ${mayanDate.formatted}. The theme is "${energyTitle}".`,
      // 5. Personal
      (mayanDate, energyTitle) => 
        `Your reading for ${mayanDate.formatted} is ready. Discover the power of "${energyTitle}".`,
      // 6. Mystical
      (mayanDate, energyTitle) => 
        `Tap into the rhythm of the 13 days. Today holds the vibration of "${energyTitle}".`,
    ],
    
    evening: [
      // 1. Transition Focus
      (currentDay, nextNawal, chapterNum) => 
        `Day ${currentDay} complete. As we transition to ${nextNawal}, reflect with Chapter ${chapterNum}.`,
      // 2. Relax/Unwind
      (currentDay, nextNawal, chapterNum) => 
        `The sun has set on Day ${currentDay}. Unwind with Chapter ${chapterNum} before you sleep.`,
      // 3. Story Focus
      (currentDay, nextNawal, chapterNum) => 
        `The story continues. Read Chapter ${chapterNum} to close out this phase of the cycle.`,
      // 4. Intention Setting
      (currentDay, nextNawal, chapterNum) => 
        `End your day with intention. See how the story evolves in Chapter ${chapterNum}.`,
      // 5. Short/Direct
      (currentDay, nextNawal, chapterNum) => 
        `Ready for the next part of the story? Chapter ${chapterNum} is waiting for you.`,
      // 6. Cycle Reminder
      (currentDay, nextNawal, chapterNum) => 
        `13 Days, 13 Stories. You have completed Day ${currentDay}. Continue the journey with Chapter ${chapterNum}.`,
    ],
    
    missYou: [
      // 1. Gentle Nudge
      (energyTitle) => `We miss you. Get in sync with the energy of "${energyTitle}".`,
      // 2. Invitation
      (energyTitle) => `The energy of "${energyTitle}" is waiting for you. Come see what today holds.`,
      // 3. FOMO (Fear Of Missing Out) - Light
      (energyTitle) => `The cycle continues without you! Catch up on the energy of "${energyTitle}".`,
      // 4. Alignment
      (energyTitle) => `Feeling out of sync? Realign yourself with today's "${energyTitle}" energy.`,
      // 5. Urgency - Light
      (energyTitle) => `Don't let the day slip by. Your guidance for "${energyTitle}" is inside.`,
      // 6. Self-Care
      (energyTitle) => `Take a moment for yourself. Explore the meaning of "${energyTitle}" today.`,
    ]
  }
};

