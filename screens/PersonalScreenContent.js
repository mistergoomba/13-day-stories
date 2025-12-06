import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import Card from '../components/Card';

export default function PersonalScreenContent({ scrollViewRef, setCurrentView }) {
  const insets = useSafeAreaInsets();
  const bottomPadding = 50 + insets.bottom + 20;

  return (
    <View style={styles.container}>
      {/* Header - Fixed at top */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable
          onPress={() => setCurrentView && setCurrentView('Today')}
          style={styles.backButton}
        >
          <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
            <Path
              d='M15 18L9 12L15 6'
              stroke={colors.text}
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Personal</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { paddingBottom: bottomPadding }]}>
          <View style={styles.contentSection}>
            <Card>
              <Text style={styles.title}>Personal Message</Text>
              <Text style={styles.placeholderText}>
                Your personal message based on your birthday will appear here.
              </Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    paddingTop: 5,
    minHeight: 56,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    paddingBottom: 6,
  },
  headerTitle: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingBottom: 16,
    paddingTop: 0,
    width: '100%',
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  placeholderText: {
    ...type.body,
    color: colors.textDim,
    lineHeight: 24,
  },
});

