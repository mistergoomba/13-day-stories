import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';

export default function PersonalScreenContent({ scrollViewRef, setCurrentView, setBirthdayDay }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = 50 + insets.bottom + 20;

  const handleDaySelect = (dayNumber) => {
    if (setBirthdayDay) {
      setBirthdayDay(dayNumber);
    }
    setCurrentView && setCurrentView('Birthday');
  };

  return (
    <View style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => setCurrentView && setCurrentView('Today')}
          style={styles.backButton}
        >
          <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
            <Path
              d='M15 18L9 12L15 6'
              stroke={colors.text}
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Personal</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          <View style={styles.contentSection}>
            <Card>
              <Text style={styles.title}>Personal Message</Text>
              <Text style={styles.temporaryText}>
                This is a temporary page. In the future, you'll be able to enter your actual
                birthday to receive personalized messages based on your Mayan calendar day sign.
              </Text>
              <Text style={styles.instructionText}>
                For now, choose a number between 1 and 13 to see your birthday message:
              </Text>
            </Card>

            {/* Day Number Picker */}
            <View style={styles.dayPickerContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((day) => (
                <Pressable key={day} style={styles.dayButton} onPress={() => handleDaySelect(day)}>
                  <Text style={styles.dayButtonText}>{day}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    paddingTop: 5,
    minHeight: 56,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    paddingBottom: 6,
  },
  headerTitle: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 16,
    paddingTop: 0,
    width: '100%',
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  temporaryText: {
    ...type.body,
    color: colors.textDim,
    lineHeight: 24,
    marginBottom: 16,
  },
  instructionText: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  dayPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  dayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent2,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonText: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
});
