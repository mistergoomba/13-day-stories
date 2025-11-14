import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function EnergyOfTheDay({ dayData, energyOfTheDay }) {
  if (!dayData || !energyOfTheDay) {
    return null;
  }

  return (
    <Card>
      {/* Number Energy */}
      <View style={styles.energyBlock}>
        <Text style={styles.energySectionTitle}>{energyOfTheDay.number.title}</Text>
        <Text style={styles.energyTitle}>The Number {dayData.number}</Text>
        <Text style={styles.energyContent}>{energyOfTheDay.number.content}</Text>
        <View style={styles.keywordsContainer}>
          {energyOfTheDay.number.keywords.map((keyword, index) => (
            <View key={index} style={styles.keywordTag}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Nawal Energy */}
      <View style={styles.energyBlock}>
        <Text style={styles.energySectionTitle}>{energyOfTheDay.nawal.title}</Text>
        <Text style={styles.energyTitle}>The Nawal {dayData.nawal}</Text>
        <Text style={styles.energyContent}>{energyOfTheDay.nawal.content}</Text>
        <View style={styles.keywordsContainer}>
          {energyOfTheDay.nawal.keywords.map((keyword, index) => (
            <View key={index} style={styles.keywordTag}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Combined Energy */}
      <View style={styles.energyBlock}>
        <Text style={styles.energySectionTitle}>{energyOfTheDay.combined_energy.title}</Text>
        <Text style={styles.energyTitle}>
          The Energy of {dayData.number} {dayData.nawal}
        </Text>
        <Text style={styles.energyContent}>{energyOfTheDay.combined_energy.content}</Text>
        {energyOfTheDay.combined_energy.notes && (
          <View style={styles.notesContainer}>
            {energyOfTheDay.combined_energy.notes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  energySectionTitle: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 20,
    fontSize: 20,
  },
  energyBlock: {
    marginBottom: 24,
  },
  energyTitle: {
    ...type.subtitle,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 12,
  },
  energyContent: {
    ...type.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordTag: {
    backgroundColor: colors.accent2,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  keywordText: {
    ...type.caption,
    color: colors.text,
    fontSize: 12,
  },
  notesContainer: {
    marginTop: 12,
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  noteBullet: {
    ...type.body,
    color: colors.accent,
    marginRight: 8,
    fontSize: 16,
  },
  noteText: {
    ...type.body,
    color: colors.text,
    flex: 1,
    lineHeight: 24,
  },
});

