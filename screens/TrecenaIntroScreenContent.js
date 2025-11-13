import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';
import { mockAppData } from '../data/mock';
import { getCurrentContext } from '../utils/dateContext';

export default function TrecenaIntroScreenContent({ navigation }) {
  const ctx = getCurrentContext();
  const trecena = mockAppData.trecenas[ctx.trecenaKey];

  return (
    <View style={styles.content}>
      <Text style={styles.title}>{trecena.intro.title}</Text>
      <Card>
        <Text style={styles.body}>{trecena.intro.body}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  title: { ...type.title, color: colors.text, marginBottom: 12 },
  body: { ...type.body, color: colors.text },
});
