import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { type } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HoroscopeSection({ horoscopeImage, horoscopeText }) {
  return (
    <>
      {/* Horoscope Image */}
      {horoscopeImage && (
        <Image
          source={horoscopeImage}
          style={[styles.horoscopeImage, { height: SCREEN_WIDTH }]}
          resizeMode='cover'
        />
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
  horoscopeImage: {
    width: '100%',
    marginBottom: 16,
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
