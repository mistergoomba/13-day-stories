/**
 * Share Utilities
 * Handles sharing functionality with pre-generated share images and caption templates
 */

import Share from 'react-native-share';
import { getApiBaseUrl } from './apiConfig';
import { downloadAndCacheImage } from './shareImageCache';

/**
 * Normalize trecena name to match trecena key format
 * @param {string} trecenaName - Trecena name (e.g., "Q'anil", "Aq'ab'al")
 * @returns {string} Normalized key
 */
function normalizeTrecenaName(trecenaName) {
  if (!trecenaName) return null;
  return trecenaName.replace(/[^a-zA-Z]/g, '').toLowerCase();
}

/**
 * Get the share image URL for a specific day and image type
 * Uses single source of truth from apiConfig.js
 * @param {string} trecenaKey - Normalized trecena key (e.g., "toj", "aqabal")
 * @param {number} day - Day number (1-13)
 * @param {string} imageType - Image type (e.g., "horoscope", "affirmation", "story_primary", "birthday")
 * @returns {string} Full URL to share image
 */
export function getShareImageUrl(trecenaKey, day, imageType) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/trecena-${trecenaKey}/${day}/${imageType}.jpg`;
}

/**
 * Extract first paragraph from text (split by \n\n or \n)
 * @param {string} text - Text to extract from
 * @param {number} maxLength - Maximum length (default: 200)
 * @returns {string} First paragraph or truncated text
 */
function getFirstParagraph(text, maxLength = 200) {
  if (!text) return '';
  
  // Try splitting by double newline first
  const paragraphs = text.split(/\n\n/);
  if (paragraphs.length > 0 && paragraphs[0].trim()) {
    const first = paragraphs[0].trim();
    if (first.length <= maxLength) return first;
    return first.substring(0, maxLength - 3) + '...';
  }
  
  // Fallback to single newline
  const lines = text.split(/\n/);
  if (lines.length > 0 && lines[0].trim()) {
    const first = lines[0].trim();
    if (first.length <= maxLength) return first;
    return first.substring(0, maxLength - 3) + '...';
  }
  
  // Fallback to truncate entire text
  if (text.length <= maxLength) return text.trim();
  return text.trim().substring(0, maxLength - 3) + '...';
}

/**
 * Get story hook/excerpt (first paragraph of chapter)
 * @param {string} chapter - Full chapter text
 * @returns {string} Story hook/excerpt
 */
function getStoryHook(chapter) {
  return getFirstParagraph(chapter, 250);
}

/**
 * Share Meditation / Affirmation
 * @param {Object} dayData - Day data object
 * @param {Object} mayanDate - Mayan date object with { tone, trecena }
 */
export async function shareMeditationAffirmation(dayData, mayanDate) {
  if (!dayData || !mayanDate) {
    console.error('Missing dayData or mayanDate for share');
    return;
  }

  const trecenaKey = normalizeTrecenaName(mayanDate.trecena);
  const shareImageUrl = getShareImageUrl(trecenaKey, mayanDate.tone, 'affirmation');

  const caption = `Claiming this energy today. ✨

Get daily affirmations, meditations, and energy readings at @13DayStories.

Download here: 13DayStories.com

#DailyAffirmation #MayanCalendar #13DayStories #Manifestation #SpiritualGrowth`;

  try {
    // Download and cache image
    const localImagePath = await downloadAndCacheImage(
      shareImageUrl,
      trecenaKey,
      mayanDate.tone,
      'affirmation'
    );

    // Share image file with text
    // Note: Instagram will only share the image (ignores text), other apps may use both
    // downloadAsync already returns file:// URI
    await Share.open({
      url: localImagePath,
      message: caption,
      title: 'Share Meditation & Affirmation',
    });
  } catch (error) {
    if (error.message !== 'User did not share') {
      console.error('Error sharing meditation/affirmation:', error);
    }
  }
}

/**
 * Share Today / Horoscope
 * @param {Object} dayData - Day data object
 * @param {Object} mayanDate - Mayan date object with { tone, trecena }
 */
export async function shareHoroscope(dayData, mayanDate) {
  if (!dayData || !mayanDate || !dayData.horoscope) {
    console.error('Missing dayData, mayanDate, or horoscope for share');
    return;
  }

  const trecenaKey = normalizeTrecenaName(mayanDate.trecena);
  const shareImageUrl = getShareImageUrl(trecenaKey, mayanDate.tone, 'horoscope');

  const firstParagraph = getFirstParagraph(dayData.horoscope, 300);

  const caption = `${firstParagraph}

Read today's full forecast and check your Mayan Energy reading at @13DayStories.

13DayStories.com

#Horoscope #EnergyReading #MayanAstrology #DailyGuidance #13DayStories #Astrology`;

  try {
    // Download and cache image
    const localImagePath = await downloadAndCacheImage(
      shareImageUrl,
      trecenaKey,
      mayanDate.tone,
      'horoscope'
    );

    // Share image file with text
    // Note: Instagram will only share the image (ignores text), other apps may use both
    await Share.open({
      url: localImagePath, // downloadAsync already returns file:// URI
      message: caption,
      title: 'Share Today\'s Horoscope',
    });
  } catch (error) {
    if (error.message !== 'User did not share') {
      console.error('Error sharing horoscope:', error);
    }
  }
}

/**
 * Share Story Chapter
 * @param {Object} dayData - Day data object
 * @param {Object} mayanDate - Mayan date object with { tone, trecena }
 * @param {Object} trecenaData - Trecena data object (optional, for trecena name)
 */
export async function shareStoryChapter(dayData, mayanDate, trecenaData = null) {
  if (!dayData || !mayanDate || !dayData.chapter) {
    console.error('Missing dayData, mayanDate, or chapter for share');
    return;
  }

  const trecenaKey = normalizeTrecenaName(mayanDate.trecena);
  const shareImageUrl = getShareImageUrl(trecenaKey, mayanDate.tone, 'story_primary');

  const dayNumber = dayData.day || mayanDate.tone;
  const trecenaName = trecenaData?.trecena || mayanDate.trecena;
  const storyHook = getStoryHook(dayData.chapter);

  const caption = `I'm currently on Day ${dayNumber} of the ${trecenaName} cycle. 📖

'${storyHook}'

Read the rest of the chapter and sync your life to the 13-day rhythm at @13DayStories.

13DayStories.com

#Storytelling #MayanCosmology #DailyStory #13DayStories #Mythology`;

  try {
    // Download and cache image
    const localImagePath = await downloadAndCacheImage(
      shareImageUrl,
      trecenaKey,
      mayanDate.tone,
      'story_primary'
    );

    // Share image file with text
    // Note: Instagram will only share the image (ignores text), other apps may use both
    await Share.open({
      url: localImagePath, // downloadAsync already returns file:// URI
      message: caption,
      title: 'Share Story Chapter',
    });
  } catch (error) {
    if (error.message !== 'User did not share') {
      console.error('Error sharing story chapter:', error);
    }
  }
}

/**
 * Share Birthday
 * @param {Object} dayData - Day data object
 * @param {Object} mayanDate - Mayan date object with { tone, trecena }
 */
export async function shareBirthday(dayData, mayanDate) {
  if (!dayData || !mayanDate || !dayData.birthday || !dayData.energy_of_the_day) {
    console.error('Missing dayData, mayanDate, birthday, or energy_of_the_day for share');
    return;
  }

  const trecenaKey = normalizeTrecenaName(mayanDate.trecena);
  const shareImageUrl = getShareImageUrl(trecenaKey, mayanDate.tone, 'birthday');

  const number = dayData.number;
  const nawal = dayData.nawal;
  const combinedEnergyTitle = dayData.energy_of_the_day?.combined_energy?.title || `${number} ${nawal}`;
  const birthdayText = getFirstParagraph(dayData.birthday?.content || '', 200);

  const caption = `I just found out my Mayan Birthday energy is ${number} ${nawal} (${combinedEnergyTitle}). 🌑

${birthdayText}

What is your ancient energy sign? Find out for free at @13DayStories.

13DayStories.com

#MayanSign #BirthdayEnergy #SpiritAnimal #13DayStories #KnowThyself`;

  try {
    // Download and cache image
    const localImagePath = await downloadAndCacheImage(
      shareImageUrl,
      trecenaKey,
      mayanDate.tone,
      'birthday'
    );

    // Share image file with text
    // Note: Instagram will only share the image (ignores text), other apps may use both
    await Share.open({
      url: localImagePath, // downloadAsync already returns file:// URI
      message: caption,
      title: 'Share Birthday Energy',
    });
  } catch (error) {
    if (error.message !== 'User did not share') {
      console.error('Error sharing birthday:', error);
    }
  }
}

