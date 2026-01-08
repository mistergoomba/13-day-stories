/**
 * Notification Prompt Manager
 * Handles the logic for when to show the notification prompt based on user behavior
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayMayanDateSync } from './calendarUtils';

// AsyncStorage keys
const HAS_VIEWED_TODAY_KEY = '@has_viewed_today_tab';
const NOTIFICATION_PROMPT_DISMISSAL_COUNT_KEY = '@notification_prompt_dismissal_count';
const NOTIFICATION_PROMPT_LAST_DISMISSAL_DATE_KEY = '@notification_prompt_last_dismissal_date';
const NOTIFICATION_PROMPT_LAST_DISMISSAL_TRECENA_KEY = '@notification_prompt_last_dismissal_trecena';
const APP_OPEN_COUNT_KEY = '@app_open_count';
const NOTIFICATION_PROMPT_PERMANENTLY_DISMISSED_KEY = '@notification_prompt_permanently_dismissed';

const MAX_DISMISSALS = 3;
const MIN_DAYS_BETWEEN_ATTEMPTS = 14;
const MIN_APP_OPENS_FOR_THIRD_ATTEMPT = 10;

/**
 * Check if user has viewed the Today tab for the first time
 * @returns {Promise<boolean>}
 */
export async function hasViewedTodayTab() {
  try {
    const hasViewed = await AsyncStorage.getItem(HAS_VIEWED_TODAY_KEY);
    return hasViewed === 'true';
  } catch (error) {
    console.error('Error checking if Today tab viewed:', error);
    return false;
  }
}

/**
 * Mark that user has viewed the Today tab
 * @returns {Promise<void>}
 */
export async function markTodayTabViewed() {
  try {
    await AsyncStorage.setItem(HAS_VIEWED_TODAY_KEY, 'true');
  } catch (error) {
    console.error('Error marking Today tab as viewed:', error);
  }
}

/**
 * Get notification prompt dismissal count
 * @returns {Promise<number>}
 */
export async function getDismissalCount() {
  try {
    const count = await AsyncStorage.getItem(NOTIFICATION_PROMPT_DISMISSAL_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting dismissal count:', error);
    return 0;
  }
}

/**
 * Increment dismissal count and save last dismissal info
 * @returns {Promise<void>}
 */
export async function recordDismissal() {
  try {
    const currentCount = await getDismissalCount();
    const newCount = currentCount + 1;
    
    await AsyncStorage.setItem(NOTIFICATION_PROMPT_DISMISSAL_COUNT_KEY, newCount.toString());
    
    // Save current date and trecena
    const today = new Date();
    const todayMayan = getTodayMayanDateSync();
    
    await AsyncStorage.setItem(
      NOTIFICATION_PROMPT_LAST_DISMISSAL_DATE_KEY,
      today.toISOString()
    );
    await AsyncStorage.setItem(
      NOTIFICATION_PROMPT_LAST_DISMISSAL_TRECENA_KEY,
      todayMayan.trecena
    );
    
    // If max dismissals reached, mark as permanently dismissed
    if (newCount >= MAX_DISMISSALS) {
      await AsyncStorage.setItem(NOTIFICATION_PROMPT_PERMANENTLY_DISMISSED_KEY, 'true');
    }
  } catch (error) {
    console.error('Error recording dismissal:', error);
  }
}

/**
 * Check if prompt has been permanently dismissed (3+ dismissals)
 * @returns {Promise<boolean>}
 */
export async function isPermanentlyDismissed() {
  try {
    const dismissed = await AsyncStorage.getItem(NOTIFICATION_PROMPT_PERMANENTLY_DISMISSED_KEY);
    return dismissed === 'true';
  } catch (error) {
    console.error('Error checking permanent dismissal:', error);
    return false;
  }
}

/**
 * Check if it's a new Trecena cycle since last dismissal
 * @returns {Promise<boolean>}
 */
export async function isNewTrecenaCycle() {
  try {
    const lastDismissalTrecena = await AsyncStorage.getItem(
      NOTIFICATION_PROMPT_LAST_DISMISSAL_TRECENA_KEY
    );
    
    if (!lastDismissalTrecena) {
      return false; // No previous dismissal
    }
    
    const todayMayan = getTodayMayanDateSync();
    
    // Check if we're in a new trecena (different from last dismissal)
    // Also check if we're on day 1 of the trecena (new cycle beginning)
    return (
      todayMayan.trecena !== lastDismissalTrecena && 
      todayMayan.tone === 1
    );
  } catch (error) {
    console.error('Error checking new trecena cycle:', error);
    return false;
  }
}

/**
 * Check if enough time has passed since last dismissal
 * @returns {Promise<boolean>}
 */
export async function hasEnoughTimePassed() {
  try {
    const lastDismissalDate = await AsyncStorage.getItem(
      NOTIFICATION_PROMPT_LAST_DISMISSAL_DATE_KEY
    );
    
    if (!lastDismissalDate) {
      return true; // No previous dismissal
    }
    
    const lastDate = new Date(lastDismissalDate);
    const today = new Date();
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= MIN_DAYS_BETWEEN_ATTEMPTS;
  } catch (error) {
    console.error('Error checking time passed:', error);
    return false;
  }
}

/**
 * Increment app open count
 * @returns {Promise<number>} New app open count
 */
export async function incrementAppOpenCount() {
  try {
    const currentCount = await AsyncStorage.getItem(APP_OPEN_COUNT_KEY);
    const newCount = (currentCount ? parseInt(currentCount, 10) : 0) + 1;
    await AsyncStorage.setItem(APP_OPEN_COUNT_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing app open count:', error);
    return 0;
  }
}

/**
 * Get app open count
 * @returns {Promise<number>}
 */
export async function getAppOpenCount() {
  try {
    const count = await AsyncStorage.getItem(APP_OPEN_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting app open count:', error);
    return 0;
  }
}

/**
 * Determine if notification prompt should be shown
 * @returns {Promise<{shouldShow: boolean, reason: string}>}
 */
export async function shouldShowNotificationPrompt() {
  try {
    // Check if notifications are already enabled
    const notificationsEnabled = await AsyncStorage.getItem('@notifications_enabled');
    if (notificationsEnabled === 'true') {
      return { shouldShow: false, reason: 'notifications_already_enabled' };
    }
    
    // Check if permanently dismissed
    if (await isPermanentlyDismissed()) {
      return { shouldShow: false, reason: 'permanently_dismissed' };
    }
    
    const dismissalCount = await getDismissalCount();
    
    // First attempt: Show after first Today tab view (handled separately with timer)
    if (dismissalCount === 0) {
      return { shouldShow: false, reason: 'first_attempt_handled_by_timer' };
    }
    
    // Second attempt: New Trecena cycle
    if (dismissalCount === 1) {
      const isNewCycle = await isNewTrecenaCycle();
      if (isNewCycle) {
        return { shouldShow: true, reason: 'new_trecena_cycle' };
      }
      return { shouldShow: false, reason: 'waiting_for_new_trecena' };
    }
    
    // Third attempt: Enough time passed OR enough app opens
    if (dismissalCount === 2) {
      const timePassed = await hasEnoughTimePassed();
      const appOpens = await getAppOpenCount();
      
      if (timePassed || appOpens >= MIN_APP_OPENS_FOR_THIRD_ATTEMPT) {
        return { shouldShow: true, reason: 'time_or_opens_condition_met' };
      }
      return { shouldShow: false, reason: 'waiting_for_time_or_opens' };
    }
    
    // After 3 dismissals, don't show
    return { shouldShow: false, reason: 'max_dismissals_reached' };
  } catch (error) {
    console.error('Error determining if prompt should show:', error);
    return { shouldShow: false, reason: 'error' };
  }
}

