import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function MayanCalendarExplanation() {
  return (
    <Card>
      <Text style={styles.explanationText}>
        The energies and stories presented here are based on the Mayan calendar, a sacred
        timekeeping system that has guided indigenous communities for thousands of years.
        {'\n\n'}
        Each day carries unique combinations of number and nawal (day sign) energies that offer
        insight, guidance, and reflection.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  explanationText: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});

