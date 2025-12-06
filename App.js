import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

function AppContent() {
  const insets = useSafeAreaInsets();
  const [currentView, setCurrentView] = useState(null); // null initially, will be set after checking first time
  const [selectedDay, setSelectedDay] = useState(null); // null = no selection, number = selected day for Journey detail view
  const [birthdayDay, setBirthdayDay] = useState(null); // Selected birthday day (1-13)
  const [resetToTodayTrigger, setResetToTodayTrigger] = useState(0); // Trigger to reset Day screen to today
  const [resetMeditationTrigger, setResetMeditationTrigger] = useState(0); // Trigger to reset Meditation screen to today
  const scrollViewRef = useRef(null);
  const meditationScrollViewRef = useRef(null);

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
  const screensWithOwnScrollView = ['Meditation', 'Today', 'Journey', 'Personal', 'Birthday'];

  // Don't render until we've checked first time status
  if (currentView === null) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#000000' />
      <NebulaBackground />
      {screensWithOwnScrollView.includes(currentView) ? (
        // These screens handle their own ScrollView with sticky headers
        currentView === 'Journey' ? (
          <JourneyScreenContent
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            setCurrentView={setCurrentView}
            scrollViewRef={scrollViewRef}
          />
        ) : currentView === 'Today' ? (
          <TodayScreenContent
            setCurrentView={setCurrentView}
            setSelectedDay={setSelectedDay}
            scrollViewRef={scrollViewRef}
            resetToTodayTrigger={resetToTodayTrigger}
          />
        ) : currentView === 'Meditation' ? (
          <MeditationScreenContent
            setCurrentView={setCurrentView}
            scrollViewRef={meditationScrollViewRef}
            resetMeditationTrigger={resetMeditationTrigger}
          />
        ) : currentView === 'Personal' ? (
          <PersonalScreenContent
            scrollViewRef={scrollViewRef}
            setCurrentView={setCurrentView}
            setBirthdayDay={setBirthdayDay}
          />
        ) : currentView === 'Birthday' ? (
          <BirthdayScreenContent
            scrollViewRef={scrollViewRef}
            setCurrentView={setCurrentView}
            birthdayDay={birthdayDay}
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
