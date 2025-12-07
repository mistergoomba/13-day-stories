import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import ImageWithPlaceholder from './ImageWithPlaceholder';

export default function HoroscopeSection({ horoscopeImage, horoscopeText, date, flushTop = false }) {
  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Horoscope Image */}
      <ImageWithPlaceholder
          source={horoscopeImage}
        type="square"
        flushTop={flushTop}
      />

      {/* Date Display */}
      {date && (
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </View>
      )}

      {/* Horoscope Text */}
      <View style={styles.horoscopeTextContainer}>
        <Card>
          <Text style={styles.horoscopeText}>{horoscopeText}</Text>
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  dateContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  dateText: {
    ...type.caption,
    color: colors.textDim,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  horoscopeTextContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  horoscopeText: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
  },
});
