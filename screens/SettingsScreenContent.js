import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function SettingsScreenContent() {
  const insets = useSafeAreaInsets();
  
  // Bottom padding for toolbar (50px min height + safe area bottom + extra spacing)
  const bottomPadding = 50 + insets.bottom + 20;
  
  return (
    <View style={[styles.content, { paddingBottom: bottomPadding }]}>
      <SectionHeader title='Settings' />

      <Card>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <Text style={styles.settingItem}>Notifications</Text>
        <Text style={styles.settingItem}>Theme</Text>
        <Text style={styles.settingItem}>Language</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.settingItem}>Profile</Text>
        <Text style={styles.settingItem}>Privacy</Text>
        <Text style={styles.settingItem}>Data & Storage</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.settingItem}>Version 1.0.0</Text>
        <Text style={styles.settingItem}>Help & Support</Text>
        <Text style={styles.settingItem}>Terms of Service</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
  },
  sectionTitle: {
    ...type.subtitle,
    color: colors.text,
    marginBottom: 12,
  },
  settingItem: {
    ...type.body,
    color: colors.textDim,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
