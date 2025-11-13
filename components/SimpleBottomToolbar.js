import React from 'react';
import { View, StyleSheet, Text, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function SimpleBottomToolbar({ currentView, setCurrentView }) {
  const insets = useSafeAreaInsets();

  const handleHome = () => {
    console.log('Home button pressed');
    setCurrentView('Home');
  };

  const handleMeditation = () => {
    console.log('Meditation button pressed');
    setCurrentView('Meditation');
  };

  const handleToday = () => {
    console.log('Today button pressed');
    setCurrentView('Day');
  };

  const handleIndex = () => {
    console.log('Index button pressed');
    setCurrentView('Index');
  };

  const handleSettings = () => {
    console.log('Settings button pressed');
    setCurrentView('Settings');
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.toolbar}>
        {/* Home */}
        <Pressable
          style={[styles.button, currentView === 'Home' && styles.activeButton]}
          onPress={handleHome}
        >
          <Text
            style={[styles.buttonLabel, currentView === 'Home' && styles.activeButtonLabel]}
          >
            Home
          </Text>
        </Pressable>

        {/* Meditation */}
        <Pressable
          style={[styles.button, currentView === 'Meditation' && styles.activeButton]}
          onPress={handleMeditation}
        >
          <Text
            style={[styles.buttonLabel, currentView === 'Meditation' && styles.activeButtonLabel]}
          >
            Meditate
          </Text>
        </Pressable>

        {/* Today - Big center button */}
        <Pressable
          style={[styles.todayButton, currentView === 'Day' && styles.activeTodayButton]}
          onPress={handleToday}
        >
          <Text style={[styles.todayLabel, currentView === 'Day' && styles.activeTodayLabel]}>
            TODAY
          </Text>
        </Pressable>

        {/* Index */}
        <Pressable
          style={[styles.button, currentView === 'Index' && styles.activeButton]}
          onPress={handleIndex}
        >
          <Text
            style={[styles.buttonLabel, currentView === 'Index' && styles.activeButtonLabel]}
          >
            Index
          </Text>
        </Pressable>

        {/* Settings */}
        <Pressable
          style={[styles.button, currentView === 'Settings' && styles.activeButton]}
          onPress={handleSettings}
        >
          <Text
            style={[styles.buttonLabel, currentView === 'Settings' && styles.activeButtonLabel]}
          >
            Settings
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 4,
    minHeight: 50, // Minimum height for toolbar content
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    minHeight: 50, // Minimum height for toolbar content
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 50,
    height: 40,
  },
  buttonLabel: {
    ...type.caption,
    color: colors.textDim,
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
  },
  todayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 15, // Makes it pop out much more
    minWidth: 70,
    height: 50,
    // Use modern shadow syntax for web compatibility
    ...(Platform.OS === 'web'
      ? {
          boxShadow: `0 6px 15px ${colors.glow}80`,
        }
      : {
          shadowColor: colors.glow,
          shadowOpacity: 0.8,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
        }),
  },
  todayLabel: {
    ...type.caption,
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Active state styles
  activeButton: {
    backgroundColor: 'rgba(164,118,255,0.2)',
    borderColor: colors.accent,
    borderWidth: 1,
  },
  activeButtonLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  activeTodayButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  activeTodayLabel: {
    color: colors.text,
    fontWeight: '800',
  },
});
