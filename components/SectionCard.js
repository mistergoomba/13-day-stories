import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { type, headerFontFamily } from '../theme/typography';

export default function SectionCard({ headerText, children, style }) {
  return (
    <View style={[styles.sectionContainer, style]}>
      <Text style={styles.sectionHeader}>{headerText}</Text>
      <Card>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 50,
  },
  sectionHeader: {
    ...type.title,
    fontFamily: headerFontFamily,
    color: colors.text,
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
    // On Android, remove fontWeight - BlackChancery font doesn't support explicit weights
    ...(Platform.OS === 'android' && { fontWeight: undefined }),
  },
});
