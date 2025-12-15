import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, AppState } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleBottomToolbar from './components/SimpleBottomToolbar';
import AdBanner from './components/AdBanner';
import NebulaBackground from './components/NebulaBackground';
import DevDatePickerPanel from './components/DevDatePickerPanel';
import { initialize as initializeAdMob } from './utils/adManager';
import { initialize as initializeIAP, cleanup as cleanupIAP } from './utils/iapManager';
import TodayScreenContent from './screens/TodayScreenContent';
import HomeScreenContent from './screens/HomeScreenContent';
import MeditationScreenContent from './screens/MeditationScreenContent';
import SettingsScreenContent from './screens/SettingsScreenContent';
import JourneyScreenContent from './screens/JourneyScreenContent';
import PersonalScreenContent from './screens/PersonalScreenContent';
import BirthdayScreenContent from './screens/BirthdayScreenContent';
import {
  setDevDateOverride,
  getDevDateOverride,
  setDevMayanOverride,
  getDevMayanOverride,
} from './utils/getActualDate';
import { scheduleAllNotifications } from './utils/notificationScheduler';
import colors from './theme/colors';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load notifications module
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.log('expo-notifications not available:', error);
}

const HAS_OPENED_APP_KEY = '@has_opened_app';
const BIRTHDAY_DATE_KEY = '@birthday_date';

// Check if we're in dev mode
const isDevMode = () => {
  return typeof __DEV__ !== 'undefined' && __DEV__;
};

function AppContent() {
  const insets = useSafeAreaInsets();
  const [currentView, setCurrentView] = useState(null); // null initially, will be set after checking first time
  const [selectedDay, setSelectedDay] = useState(null); // null = no selection, number = selected day for Journey detail view
  const [birthdayDate, setBirthdayDate] = useState(null); // Selected birthday date (YYYY-MM-DD format)
  const [resetToTodayTrigger, setResetToTodayTrigger] = useState(0); // Trigger to reset Day screen to today
  const [resetMeditationTrigger, setResetMeditationTrigger] = useState(0); // Trigger to reset Meditation screen to today
  const [showDevPanel, setShowDevPanel] = useState(false); // Dev-only date picker panel
  const [currentMayanOverride, setCurrentMayanOverride] = useState(null); // Current Mayan override state
  const scrollViewRef = useRef(null);
  const meditationScrollViewRef = useRef(null);

  // Load saved birthday and dev date override on mount
  useEffect(() => {
    const loadBirthday = async () => {
      try {
        const savedBirthday = await AsyncStorage.getItem(BIRTHDAY_DATE_KEY);
        if (savedBirthday) {
          setBirthdayDate(savedBirthday);
        }
      } catch (error) {
        console.error('Error loading birthday:', error);
      }
    };

    const loadDevDateOverride = async () => {
      if (isDevMode()) {
        try {
          const override = await getDevDateOverride();
          if (override) {
            // Update the global cache for sync access
            global.__devDateOverride = override;
          }
        } catch (error) {
          console.error('Error loading dev date override:', error);
        }
      }
    };

    const loadDevMayanOverride = async () => {
      if (isDevMode()) {
        try {
          const override = await getDevMayanOverride();
          if (override) {
            global.__devMayanOverride = override;
            setCurrentMayanOverride(override);
          }
        } catch (error) {
          console.error('Error loading dev Mayan override:', error);
        }
      }
    };

    loadBirthday();
    loadDevDateOverride();
    loadDevMayanOverride();
  }, []);

  // Save birthday when it changes
  useEffect(() => {
    const saveBirthday = async () => {
      if (birthdayDate) {
        try {
          await AsyncStorage.setItem(BIRTHDAY_DATE_KEY, birthdayDate);
        } catch (error) {
          console.error('Error saving birthday:', error);
        }
      }
    };

    saveBirthday();
  }, [birthdayDate]);

  // Check if first time opening app
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const hasOpened = await AsyncStorage.getItem(HAS_OPENED_APP_KEY);
        if (hasOpened === null) {
          // First time - show Home
          setCurrentView('Home');
          // Mark that app has been opened
          await AsyncStorage.setItem(HAS_OPENED_APP_KEY, 'true');
        } else {
          // Not first time - show Today
          setCurrentView('Today');
        }
      } catch (error) {
        console.error('Error checking first time:', error);
        // Default to Today on error
        setCurrentView('Today');
      }
    };

    checkFirstTime();
  }, []);

  // Schedule notifications on mount and when app enters foreground
  useEffect(() => {
    // Schedule on mount
    scheduleAllNotifications();

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        scheduleAllNotifications();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  // Initialize AdMob and IAP on mount
  useEffect(() => {
    // Initialize AdMob with error handling
    initializeAdMob().catch((error) => {
      console.error('Failed to initialize AdMob:', error);
      // Don't crash the app if AdMob fails
    });

    // Initialize IAP with error handling
    initializeIAP().catch((error) => {
      console.error('Failed to initialize IAP:', error);
      // Don't crash the app if IAP fails
    });

    // Cleanup IAP listeners on unmount
    return () => {
      cleanupIAP();
    };
  }, []);

  // Handle notification taps
  useEffect(() => {
    if (!Notifications) return;

    // Function to handle notification navigation
    const handleNotificationNavigation = (data) => {
      if (data && data.notificationType) {
        if (data.notificationType === 'morning' || data.notificationType === 'missYou') {
          // Morning and "miss you" notifications -> navigate to Today
          setCurrentView('Today');
          // Scroll to top after view changes
          setTimeout(() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({ y: 0, animated: true });
            }
          }, 100);
        } else if (data.notificationType === 'evening') {
          // Evening notification -> navigate to Journey with specific chapter
          if (data.mayanDate) {
            try {
              const mayanDate = JSON.parse(data.mayanDate);
              setCurrentView('Journey');
              setSelectedDay(mayanDate);
              // Scroll to top after view changes
              setTimeout(() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({ y: 0, animated: true });
                }
              }, 100);
            } catch (error) {
              console.error('Error parsing mayanDate from notification:', error);
              // Fallback to Journey without specific day
              setCurrentView('Journey');
              setTimeout(() => {
                if (scrollViewRef.current) {
                  scrollViewRef.current.scrollTo({ y: 0, animated: true });
                }
              }, 100);
            }
          } else {
            // Fallback to Journey without specific day
            setCurrentView('Journey');
            setTimeout(() => {
              if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
              }
            }, 100);
          }
        }
      }
    };

    // Check if app was opened from a notification (when app was closed)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    });

    // Listen for notification responses (when user taps notification while app is open)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    );

    return () => {
      responseSubscription?.remove();
    };
  }, []);

  // Handle Personal icon click - navigate to Birthday if birthday exists, otherwise Personal
  const handlePersonalNavigation = () => {
    if (birthdayDate) {
      setCurrentView('Birthday');
    } else {
      setCurrentView('Personal');
    }
  };

  // Dev-only: Handle header click to show dev panel
  const handleDevHeaderPress = () => {
    if (isDevMode()) {
      setShowDevPanel(true);
    }
  };

  // Dev-only: Handle date picker save - clears Mayan override, sets Gregorian date override
  const handleDevDateSave = async (dateString) => {
    if (!isDevMode()) {
      return;
    }
    try {
      // Clear Mayan override
      await setDevMayanOverride(null);
      global.__devMayanOverride = null;
      setCurrentMayanOverride(null);

      // Set dev date override (affects "today" calculations)
      await setDevDateOverride(dateString);
      // Also update birthday date
      await AsyncStorage.setItem(BIRTHDAY_DATE_KEY, dateString);
      setBirthdayDate(dateString);
      // Trigger refresh of screens that depend on "today"
      setResetToTodayTrigger((prev) => prev + 1);
      setResetMeditationTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error saving dev date:', error);
    }
  };

  // Dev-only: Handle Mayan picker save - clears Gregorian override, sets Mayan override
  const handleDevMayanSave = async (mayanOverride) => {
    if (!isDevMode()) {
      return;
    }
    try {
      // Clear Gregorian date override
      await setDevDateOverride(null);
      global.__devDateOverride = null;

      // Set Mayan override
      await setDevMayanOverride(mayanOverride);
      setCurrentMayanOverride(mayanOverride);

      // Trigger refresh of screens that depend on "today"
      setResetToTodayTrigger((prev) => prev + 1);
      setResetMeditationTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Error saving dev Mayan override:', error);
    }
  };

  // Scroll to top when view changes
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
    if (meditationScrollViewRef.current) {
      meditationScrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [currentView]);

  // View mapping object
  const viewComponents = {
    Today: TodayScreenContent,
    Home: HomeScreenContent,
    Meditation: MeditationScreenContent,
    Settings: SettingsScreenContent,
    Journey: JourneyScreenContent,
    Personal: PersonalScreenContent,
    Birthday: BirthdayScreenContent,
  };

  // Get the current component
  const CurrentComponent = viewComponents[currentView];

  // Screens that handle their own scrolling (with sticky headers)
  const screensWithOwnScrollView = [
    'Meditation',
    'Today',
    'Journey',
    'Personal',
    'Birthday',
    'Home',
    'Settings',
  ];

  // Screens that use DynamicBackground (should not show NebulaBackground)
  // Journey only uses DynamicBackground when showing a chapter detail (selectedDay !== null)
  // Birthday always uses DynamicBackground when viewing a birthday
  const screensWithDynamicBackground = ['Today', 'Meditation', 'Birthday', 'Home', 'Settings'];
  const journeyHasDynamicBackground = currentView === 'Journey' && selectedDay !== null;
  const shouldShowNebulaBackground =
    !screensWithDynamicBackground.includes(currentView) && !journeyHasDynamicBackground;

  // Don't render until we've checked first time status
  if (currentView === null) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#000000' />
      {shouldShowNebulaBackground && <NebulaBackground />}
      {screensWithOwnScrollView.includes(currentView) ? (
        // These screens handle their own ScrollView with sticky headers
        currentView === 'Journey' ? (
          <JourneyScreenContent
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            setCurrentView={setCurrentView}
            scrollViewRef={scrollViewRef}
            onPersonalPress={handlePersonalNavigation}
            onHeaderPress={isDevMode() ? handleDevHeaderPress : undefined}
            resetToTodayTrigger={resetToTodayTrigger}
          />
        ) : currentView === 'Today' ? (
          <TodayScreenContent
            setCurrentView={setCurrentView}
            setSelectedDay={setSelectedDay}
            scrollViewRef={scrollViewRef}
            resetToTodayTrigger={resetToTodayTrigger}
            onPersonalPress={handlePersonalNavigation}
            onHeaderPress={isDevMode() ? handleDevHeaderPress : undefined}
          />
        ) : currentView === 'Meditation' ? (
          <MeditationScreenContent
            setCurrentView={setCurrentView}
            scrollViewRef={meditationScrollViewRef}
            resetMeditationTrigger={resetMeditationTrigger}
            onPersonalPress={handlePersonalNavigation}
            onHeaderPress={isDevMode() ? handleDevHeaderPress : undefined}
          />
        ) : currentView === 'Personal' ? (
          <PersonalScreenContent
            scrollViewRef={scrollViewRef}
            setCurrentView={setCurrentView}
            setBirthdayDate={setBirthdayDate}
            onHeaderPress={isDevMode() ? handleDevHeaderPress : undefined}
          />
        ) : currentView === 'Birthday' ? (
          <BirthdayScreenContent
            scrollViewRef={scrollViewRef}
            setCurrentView={setCurrentView}
            birthdayDate={birthdayDate}
            setBirthdayDate={setBirthdayDate}
            onPersonalPress={handlePersonalNavigation}
            onHeaderPress={isDevMode() ? handleDevHeaderPress : undefined}
          />
        ) : currentView === 'Home' ? (
          <HomeScreenContent
            setCurrentView={setCurrentView}
            scrollViewRef={scrollViewRef}
            onPersonalPress={handlePersonalNavigation}
            handlePersonalNavigation={handlePersonalNavigation}
            setSelectedDay={setSelectedDay}
            onHeaderPress={isDevMode() ? handleDevHeaderPress : undefined}
          />
        ) : currentView === 'Settings' ? (
          <SettingsScreenContent
            setCurrentView={setCurrentView}
            scrollViewRef={scrollViewRef}
            setBirthdayDate={setBirthdayDate}
            birthdayDate={birthdayDate}
            onPersonalPress={handlePersonalNavigation}
            onHeaderPress={isDevMode() ? handleDevHeaderPress : undefined}
          />
        ) : (
          <CurrentComponent
            setCurrentView={setCurrentView}
            scrollViewRef={meditationScrollViewRef}
          />
        )
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <CurrentComponent setCurrentView={setCurrentView} />
        </ScrollView>
      )}
      <AdBanner />
      <SimpleBottomToolbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedDay={setSelectedDay}
        scrollViewRef={scrollViewRef}
        meditationScrollViewRef={meditationScrollViewRef}
        setResetToTodayTrigger={setResetToTodayTrigger}
        setResetMeditationTrigger={setResetMeditationTrigger}
        birthdayDate={birthdayDate}
      />

      {/* Dev-only: Date Picker Panel */}
      {isDevMode() && (
        <DevDatePickerPanel
          visible={showDevPanel}
          onClose={() => setShowDevPanel(false)}
          onDateSave={handleDevDateSave}
          onMayanSave={handleDevMayanSave}
          initialDate={birthdayDate || undefined}
          initialTone={currentMayanOverride?.tone}
          initialNawal={currentMayanOverride?.nawal}
        />
      )}
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    // Register with multiple name variations for Android compatibility
    // The font file's internal name is "Black Chancery" (with space)
    'Black Chancery': require('./assets/fonts/black_chancery/black_chancery.ttf'),
    BlackChancery: require('./assets/fonts/black_chancery/black_chancery.ttf'), // Fallback
    Bromolek: require('./assets/fonts/bromolek/bromolek.ttf'),
  });

  // Log font loading errors if any
  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Loading screen - fonts are loading */}
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
});
