/**
 * Notification Scheduler
 * Handles scheduling of all notifications with "wipe and replace" logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayMayanDateSync, incrementMayanDate, getDayData } from './calendarUtils';
import { convertDateToMayan } from './calendarUtils';
import { NOTIFICATION_CONFIG } from './notificationConfig';

// AsyncStorage keys
const NOTIFICATIONS_ENABLED_KEY = '@notifications_enabled';
const MORNING_ENABLED_KEY = '@morning_notifications_enabled';
const EVENING_ENABLED_KEY = '@evening_notifications_enabled';
const MORNING_TIME_KEY = '@morning_notification_time';
const EVENING_TIME_KEY = '@evening_notification_time';

// Lazy load notifications module
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('expo-notifications not available:', error);
}

/**
 * Randomly select a message from an array of message functions
 * @param {Array} messagesArray - Array of message functions
 * @param {...any} args - Arguments to pass to the message function
 * @returns {string|null} Randomly selected message or null if array is empty
 */
function getRandomMessage(messagesArray, ...args) {
  if (!messagesArray || messagesArray.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * messagesArray.length);
  return messagesArray[randomIndex](...args);
}

/**
 * Parse time string (HH:MM) to { hour, minute }
 * @param {string} timeStr - Time string in HH:MM format
 * @param {Object} defaultTime - Default time object with hour and minute
 * @returns {Object} Time object with hour and minute
 */
function parseTime(timeStr, defaultTime) {
  if (!timeStr) {
    return defaultTime;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return defaultTime;
  }
  return { hour: hours, minute: minutes };
}

/**
 * Calculate the next 13th of the month (must be > minDays away)
 * @param {Date} fromDate - Starting date
 * @param {number} minDays - Minimum days away
 * @returns {Date|null} Next 13th date or null if not found
 */
function getNext13thOfMonth(fromDate, minDays) {
  const currentYear = fromDate.getFullYear();
  const currentMonth = fromDate.getMonth();
  const currentDay = fromDate.getDate();
  
  // Start checking from current month
  let checkYear = currentYear;
  let checkMonth = currentMonth;
  
  // If today is before the 13th, check this month's 13th
  // Otherwise, start from next month
  if (currentDay < 13) {
    // Check this month's 13th
    const thisMonth13th = new Date(checkYear, checkMonth, 13);
    const daysDiff = Math.ceil((thisMonth13th.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= minDays) {
      return thisMonth13th;
    }
  }
  
  // Move to next month
  checkMonth += 1;
  if (checkMonth > 11) {
    checkMonth = 0;
    checkYear += 1;
  }
  
  // Check up to 12 months ahead
  for (let i = 0; i < 12; i++) {
    const next13th = new Date(checkYear, checkMonth, 13);
    const daysDiff = Math.ceil((next13th.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= minDays) {
      return next13th;
    }
    
    // Move to next month
    checkMonth += 1;
    if (checkMonth > 11) {
      checkMonth = 0;
      checkYear += 1;
    }
  }
  
  return null;
}

/**
 * Schedule all notifications (wipe and replace)
 * This function is called when app enters foreground
 */
export async function scheduleAllNotifications() {
  if (!Notifications) {
    console.log('Notifications not available');
    return;
  }

  try {
    // Check if notifications are enabled
    const notificationsEnabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    if (notificationsEnabled !== 'true') {
      // Cancel all notifications if disabled
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    // Check if we have permission to send notifications
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      // Cancel all notifications if permission not granted
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Notification permission not granted, cancelling scheduled notifications');
      return;
    }

    // Check individual toggles
    const morningEnabled = await AsyncStorage.getItem(MORNING_ENABLED_KEY);
    const eveningEnabled = await AsyncStorage.getItem(EVENING_ENABLED_KEY);
    const morningTimeStr = await AsyncStorage.getItem(MORNING_TIME_KEY);
    const eveningTimeStr = await AsyncStorage.getItem(EVENING_TIME_KEY);

    // Cancel all existing notifications (wipe)
    await Notifications.cancelAllScheduledNotificationsAsync();

    // If neither morning nor evening is enabled, we're done
    if (morningEnabled !== 'true' && eveningEnabled !== 'true') {
      return;
    }

    // Get notification times
    const morningTime = parseTime(morningTimeStr, NOTIFICATION_CONFIG.defaultMorningTime);
    const eveningTime = parseTime(eveningTimeStr, NOTIFICATION_CONFIG.defaultEveningTime);

    // Get today's Mayan date
    const todayMayan = getTodayMayanDateSync();
    if (!todayMayan) {
      console.error('Could not get today\'s Mayan date');
      return;
    }

    // Schedule daily notifications for next 14 days
    let currentMayanDate = { ...todayMayan };
    const today = new Date();
    const now = new Date();
    
    for (let dayOffset = 0; dayOffset < NOTIFICATION_CONFIG.daysAhead; dayOffset++) {
      // Calculate future date
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + dayOffset);
      
      // Calculate notification times for this date
      const morningDateTime = new Date(futureDate);
      morningDateTime.setHours(morningTime.hour, morningTime.minute, 0, 0);
      const eveningDateTime = new Date(futureDate);
      eveningDateTime.setHours(eveningTime.hour, eveningTime.minute, 0, 0);

      // Get day data for this Mayan date
      const dayData = await getDayData(currentMayanDate);
      
      if (dayData && dayData.energy_of_the_day && dayData.energy_of_the_day.combined_energy) {
        const energyTitle = dayData.energy_of_the_day.combined_energy.title;
        const chapterNum = dayData.number;

        // Schedule morning notification (only if time hasn't passed)
        if (morningEnabled === 'true' && now < morningDateTime) {
          const morningMessage = getRandomMessage(
            NOTIFICATION_CONFIG.messages.morning,
            currentMayanDate,
            energyTitle
          );
          
          if (morningMessage) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Daily Energy',
                body: morningMessage,
                sound: true,
              },
              trigger: {
                date: morningDateTime,
              },
            });
          }
        }

        // Schedule evening notification (only if time hasn't passed)
        if (eveningEnabled === 'true' && now < eveningDateTime) {
          // Calculate next day's nawal for transition message
          const nextMayanDate = incrementMayanDate(currentMayanDate.tone, currentMayanDate.sign);
          
          const eveningMessage = getRandomMessage(
            NOTIFICATION_CONFIG.messages.evening,
            chapterNum,
            nextMayanDate.sign,
            chapterNum
          );
          
          if (eveningMessage) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Evening Reflection',
                body: eveningMessage,
                sound: true,
              },
              trigger: {
                date: eveningDateTime,
              },
            });
          }
        }
      }

      // Move to next Mayan date
      currentMayanDate = incrementMayanDate(currentMayanDate.tone, currentMayanDate.sign);
    }

    // Schedule "we miss you" notifications for next two 13ths
    const first13th = getNext13thOfMonth(today, NOTIFICATION_CONFIG.minDaysForMissYou);
    if (first13th) {
      const first13thMayan = convertDateToMayan(first13th);
      const first13thDayData = await getDayData(first13thMayan);
      
      if (first13thDayData && first13thDayData.energy_of_the_day && first13thDayData.energy_of_the_day.combined_energy) {
        const energyTitle = first13thDayData.energy_of_the_day.combined_energy.title;
        const missYouMessage = getRandomMessage(
          NOTIFICATION_CONFIG.messages.missYou,
          energyTitle
        );
        
        if (missYouMessage) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'We Miss You',
              body: missYouMessage,
              sound: true,
            },
            trigger: {
              date: new Date(
                first13th.getFullYear(),
                first13th.getMonth(),
                first13th.getDate(),
                morningTime.hour,
                morningTime.minute
              ),
            },
          });
        }
      }

      // Get second 13th (next month after first)
      const second13th = getNext13thOfMonth(first13th, 1);
      if (second13th) {
        const second13thMayan = convertDateToMayan(second13th);
        const second13thDayData = await getDayData(second13thMayan);
        
        if (second13thDayData && second13thDayData.energy_of_the_day && second13thDayData.energy_of_the_day.combined_energy) {
          const energyTitle = second13thDayData.energy_of_the_day.combined_energy.title;
          const missYouMessage = getRandomMessage(
            NOTIFICATION_CONFIG.messages.missYou,
            energyTitle
          );
          
          if (missYouMessage) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'We Miss You',
                body: missYouMessage,
                sound: true,
              },
              trigger: {
                date: new Date(
                  second13th.getFullYear(),
                  second13th.getMonth(),
                  second13th.getDate(),
                  morningTime.hour,
                  morningTime.minute
                ),
              },
            });
          }
        }
      }
    }

    console.log('Notifications scheduled successfully');
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
}

