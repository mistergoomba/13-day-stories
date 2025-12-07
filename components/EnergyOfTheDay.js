import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function EnergyOfTheDay({ dayData, energyOfTheDay, tagColor }) {
  if (!dayData || !energyOfTheDay) {
    return null;
  }

  // Use provided tagColor or fall back to default purple
  const tagBackgroundColor = tagColor || colors.accent2;

  return (
    <>
      {/* Number Energy */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>{energyOfTheDay.number.title}</Text>
        <Card>
          <Text style={styles.energyTitle}>The Number {dayData.number}</Text>
          <Text style={styles.energyContent}>{energyOfTheDay.number.content}</Text>
          <View style={styles.keywordsContainer}>
            {energyOfTheDay.number.keywords.map((keyword, index) => (
              <View
                key={index}
                style={[styles.keywordTag, { backgroundColor: tagBackgroundColor }]}
              >
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Nawal Energy */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>{energyOfTheDay.nawal.title}</Text>
        <Card>
          <Text style={styles.energyTitle}>The Nawal {dayData.nawal}</Text>
          <Text style={styles.energyContent}>{energyOfTheDay.nawal.content}</Text>
          <View style={styles.keywordsContainer}>
            {energyOfTheDay.nawal.keywords.map((keyword, index) => (
              <View
                key={index}
                style={[styles.keywordTag, { backgroundColor: tagBackgroundColor }]}
              >
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Combined Energy */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>{energyOfTheDay.combined_energy.title}</Text>
        <Card>
          <Text style={styles.energyTitle}>
            The Energy of {dayData.number} {dayData.nawal}
          </Text>
          <Text style={styles.energyContent}>{energyOfTheDay.combined_energy.content}</Text>
          {energyOfTheDay.combined_energy.notes && (
            <View style={styles.notesContainer}>
              {energyOfTheDay.combined_energy.notes.map((note, index) => (
                <View key={index} style={styles.noteItem}>
                  <Text style={[styles.noteBullet, { color: tagBackgroundColor }]}>•</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    ...type.title,
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    paddingTop: 35,
    textAlign: 'center',
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
    marginBottom: 25,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordTag: {
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
