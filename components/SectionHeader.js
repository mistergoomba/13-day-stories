import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function SectionHeader({ title }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  title: { ...type.h2, color: colors.text },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 6,
  },
});
