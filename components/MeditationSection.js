import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function MeditationSection({ affirmationImage, meditationText, dayNumber }) {
  return (
    <>
      {/* Affirmation Image */}
      {affirmationImage && (
        <Image source={affirmationImage} style={styles.affirmationImage} resizeMode='contain' />
      )}

      {/* Meditation Card */}
      {meditationText && (
        <Card>
          <Text style={styles.meditationTitle}>
            {dayNumber ? `Day ${dayNumber}'s Meditation` : "Today's Meditation"}
          </Text>
          <Text style={styles.meditationText}>{meditationText}</Text>
        </Card>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  affirmationImage: {
    width: '100%',
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
  },
  meditationTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  meditationText: {
    ...type.body,
    color: colors.text,
    lineHeight: 26,
  },
});

