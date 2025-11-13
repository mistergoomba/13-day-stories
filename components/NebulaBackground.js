import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function NebulaBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#0C0711', '#1C0F29', '#12091A']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(164,118,255,0.25)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.7, y: 0 }}
        end={{ x: 0.2, y: 1 }}
      />
    </View>
  );
}
