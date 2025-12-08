import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Image component with placeholder to prevent layout shift
 * 
 * For square images (horoscope, affirmation, meditation, birthday, story_primary):
 * - Width: SCREEN_WIDTH (full screen width)
 * - Height: SCREEN_WIDTH (square)
 * - Flush with header bottom and screen sides
 * 
 * For wide images (story_wide_1, story_wide_2):
 * - Width: content width (can be SCREEN_WIDTH for full-width or SCREEN_WIDTH - 32 for padded)
 * - Aspect ratio: 16:9
 * - Height calculated from width
 * 
 * @param {Object} props
 * @param {Object|string|null} props.source - Image source (require() or { uri: string })
 * @param {string} props.type - Image type: 'square' | 'wide'
 * @param {number} [props.contentWidth] - Content width for wide images (default: SCREEN_WIDTH - 32)
 * @param {string} [props.resizeMode] - Resize mode (default: 'cover' for square, 'contain' for wide)
 */
export default function ImageWithPlaceholder({ 
  source, 
  type = 'square',
  contentWidth = SCREEN_WIDTH - 32, // Default content width with 16px padding on each side
  resizeMode,
  flushTop = false, // If true, removes top margin to be flush with header
  flushBottom = false, // If true, removes bottom margin
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine dimensions based on type
  const isSquare = type === 'square';
  const width = isSquare ? SCREEN_WIDTH : contentWidth;
  const height = isSquare ? SCREEN_WIDTH : contentWidth * (9 / 16); // 16:9 aspect ratio
  const defaultResizeMode = isSquare ? 'cover' : 'contain';
  const finalResizeMode = resizeMode || defaultResizeMode;

  // Reset state when source changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [source]);

  // If no source, don't render anything
  if (!source) {
    return null;
  }

  return (
    <View style={[
      styles.container, 
      flushTop && styles.containerFlushTop,
      flushBottom && styles.containerFlushBottom,
      { width, height }
    ]}>
      {/* Placeholder - always rendered to reserve space */}
      <View style={[styles.placeholder, { width, height }]} />
      
      {/* Loading indicator */}
      {!imageLoaded && !imageError && (
        <View style={[styles.loadingContainer, { width, height }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}

      {/* Actual image */}
      {source && (
        <Image
          source={source}
          style={[styles.image, { width, height }]}
          resizeMode={finalResizeMode}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
      )}

      {/* Error state - simple placeholder */}
      {imageError && (
        <View style={[styles.errorContainer, { width, height }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 20, // Consistent padding above and below images
  },
  containerFlushTop: {
    marginTop: 0, // No top margin when flush with header
  },
  containerFlushBottom: {
    marginBottom: 0, // No bottom margin when flush
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.background || '#12091A',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: colors.background || '#12091A',
  },
});

