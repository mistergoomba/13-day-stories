import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function HoroscopeSection({ horoscopeImage, horoscopeText }) {
  return (
    <>
      {/* Horoscope Image */}
      {horoscopeImage && (
        <Image source={horoscopeImage} style={styles.horoscopeImage} resizeMode='contain' />
      )}

      {/* Horoscope Text */}
      <Card>
        <Text style={styles.horoscopeText}>{horoscopeText}</Text>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  horoscopeImage: {
    width: '100%',
    height: 400,
    marginBottom: 16,
    borderRadius: 8,
  },
  horoscopeText: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
  },
});

