import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { getTodayMayanDate } from '../utils/mayanCalendar';

export default function HomeScreenContent({ setCurrentView }) {
  const insets = useSafeAreaInsets();
  const today = getTodayMayanDate();

  // Format today's date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;

  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      <Image source={require('../assets/icon.png')} style={styles.icon} resizeMode='contain' />

      <Card>
        <Text style={styles.body}>
          Welcome to 13-Day Stories, a journey through the sacred cycles of the Mayan calendar.
          {'\n\n'}
          Every day carries a unique energy, guided through these 13-day stories known as trecenas.
          Each day combines a number (1-13) and a nawal, or day sign, creating a distinct
          vibrational quality that offers insight, guidance, and reflection.
        </Text>
      </Card>

      <Card>
        <Text style={styles.body}>
          This app is deeply influenced by ancient Mayan wisdom—a timekeeping system that has guided
          indigenous communities for thousands of years. The Mayan calendar is not just a way to
          mark time, but a sacred framework for understanding the rhythms of life, the cycles of
          nature, and the patterns that shape our personal and collective journeys.
        </Text>
      </Card>

      <Card>
        <Text style={styles.body}>
          Through daily stories, horoscopes, meditations, and energy readings, we invite you to
          explore how these ancient teachings can illuminate your path, offering both practical
          guidance and spiritual depth.
        </Text>
      </Card>

      {/* Navigation Links */}
      <View style={styles.navigationContainer}>
        <Pressable
          style={styles.topNavLink}
          onPress={() => setCurrentView && setCurrentView('Today')}
        >
          <Text style={styles.navLinkText}>See the Energy of the Day</Text>
        </Pressable>

        <Pressable style={styles.navLink} onPress={() => setCurrentView && setCurrentView('Today')}>
          <Text style={styles.navLinkText}>Read today's chapter</Text>
        </Pressable>

        <Pressable
          style={styles.navLink}
          onPress={() => setCurrentView && setCurrentView('Journey')}
        >
          <Text style={styles.navLinkText}>Start from the beginning of the journey</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  icon: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    alignSelf: 'center',
  },
  body: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  navigationContainer: {
    marginTop: 24,
  },
  topNavLink: {
    backgroundColor: colors.accent2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    marginBottom: 24,
  },
  navLink: {
    backgroundColor: colors.accent2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    marginBottom: 12,
  },
  navLinkText: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
});
