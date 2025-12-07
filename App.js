import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleBottomToolbar from './components/SimpleBottomToolbar';
import NebulaBackground from './components/NebulaBackground';
import TodayScreenContent from './screens/TodayScreenContent';
import HomeScreenContent from './screens/HomeScreenContent';
import MeditationScreenContent from './screens/MeditationScreenContent';
import SettingsScreenContent from './screens/SettingsScreenContent';
import JourneyScreenContent from './screens/JourneyScreenContent';
import PersonalScreenContent from './screens/PersonalScreenContent';
import BirthdayScreenContent from './screens/BirthdayScreenContent';
import colors from './theme/colors';

const HAS_OPENED_APP_KEY = '@has_opened_app';
const BIRTHDAY_DATE_KEY = '@birthday_date';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [currentView, setCurrentView] = useState(null); // null initially, will be set after checking first time
  const [selectedDay, setSelectedDay] = useState(null); // null = no selection, number = selected day for Journey detail view
  const [birthdayDate, setBirthdayDate] = useState(null); // Selected birthday date (YYYY-MM-DD format)
  const [resetToTodayTrigger, setResetToTodayTrigger] = useState(0); // Trigger to reset Day screen to today
  const [resetMeditationTrigger, setResetMeditationTrigger] = useState(0); // Trigger to reset Meditation screen to today
  const scrollViewRef = useRef(null);
  const meditationScrollViewRef = useRef(null);

  // Load saved birthday on mount
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

    loadBirthday();
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

  // Handle Personal icon click - navigate to Birthday if birthday exists, otherwise Personal
  const handlePersonalNavigation = () => {
    if (birthdayDate) {
      setCurrentView('Birthday');
    } else {
      setCurrentView('Personal');
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
  const screensWithOwnScrollView = ['Meditation', 'Today', 'Journey', 'Personal', 'Birthday', 'Home', 'Settings'];

  // Screens that use DynamicBackground (should not show NebulaBackground)
  // Journey only uses DynamicBackground when showing a chapter detail (selectedDay !== null)
  // Birthday always uses DynamicBackground when viewing a birthday
  const screensWithDynamicBackground = ['Today', 'Meditation', 'Birthday', 'Home', 'Settings'];
  const journeyHasDynamicBackground = currentView === 'Journey' && selectedDay !== null;
  const shouldShowNebulaBackground = !screensWithDynamicBackground.includes(currentView) && !journeyHasDynamicBackground;

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
          />
        ) : currentView === 'Today' ? (
          <TodayScreenContent
            setCurrentView={setCurrentView}
            setSelectedDay={setSelectedDay}
            scrollViewRef={scrollViewRef}
            resetToTodayTrigger={resetToTodayTrigger}
            onPersonalPress={handlePersonalNavigation}
          />
        ) : currentView === 'Meditation' ? (
          <MeditationScreenContent
            setCurrentView={setCurrentView}
            scrollViewRef={meditationScrollViewRef}
            resetMeditationTrigger={resetMeditationTrigger}
            onPersonalPress={handlePersonalNavigation}
          />
        ) : currentView === 'Personal' ? (
          <PersonalScreenContent
            scrollViewRef={scrollViewRef}
            setCurrentView={setCurrentView}
            setBirthdayDate={setBirthdayDate}
          />
        ) : currentView === 'Birthday' ? (
          <BirthdayScreenContent
            scrollViewRef={scrollViewRef}
            setCurrentView={setCurrentView}
            birthdayDate={birthdayDate}
            setBirthdayDate={setBirthdayDate}
            onPersonalPress={handlePersonalNavigation}
          />
        ) : currentView === 'Home' ? (
          <HomeScreenContent
            setCurrentView={setCurrentView}
            scrollViewRef={scrollViewRef}
            onPersonalPress={handlePersonalNavigation}
            handlePersonalNavigation={handlePersonalNavigation}
          />
        ) : currentView === 'Settings' ? (
          <SettingsScreenContent
            setCurrentView={setCurrentView}
            scrollViewRef={scrollViewRef}
            setBirthdayDate={setBirthdayDate}
            birthdayDate={birthdayDate}
            onPersonalPress={handlePersonalNavigation}
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
      <SimpleBottomToolbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedDay={setSelectedDay}
        scrollViewRef={scrollViewRef}
        meditationScrollViewRef={meditationScrollViewRef}
        setResetToTodayTrigger={setResetToTodayTrigger}
        setResetMeditationTrigger={setResetMeditationTrigger}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'BlackChancery': require('./assets/fonts/black_chancery/black_chancery.ttf'),
    'Bromolek': require('./assets/fonts/bromolek/bromolek.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
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
