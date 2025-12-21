import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';
import { PRIVACY_POLICY_DATA, getFormattedLastUpdated } from '../utils/privacyPolicyData';

export default function PrivacyModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const [isClosing, setIsClosing] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animate modal content slide up/down
  React.useEffect(() => {
    if (visible && !isClosing) {
      setIsClosing(false);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else if (!visible) {
      slideAnim.setValue(0);
      setIsClosing(false);
    }
  }, [visible, slideAnim, isClosing]);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsClosing(false);
      onClose();
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={visible || isClosing}
      transparent={true}
      animationType='none'
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={handleClose} />
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY }],
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.modalBody}>
              <Text style={styles.lastUpdated}>Last Updated: {getFormattedLastUpdated()}</Text>

              {PRIVACY_POLICY_DATA.sections.map((section, index) => (
                <View key={index}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.content.map((paragraph, pIndex) => (
                    <Text key={pIndex} style={styles.bodyText}>
                      {paragraph}
                    </Text>
                  ))}
                  {section.listItems && section.listItems.map((item, itemIndex) => (
                    <Text key={itemIndex} style={styles.listItem}>
                      • {item}
                    </Text>
                  ))}
                  {section.additionalContent && section.additionalContent.map((paragraph, pIndex) => (
                    <Text key={`additional-${pIndex}`} style={styles.bodyText}>
                      {paragraph}
                    </Text>
                  ))}
                </View>
              ))}

              <View style={styles.spacer} />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: 300,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...type.title,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    ...type.title,
    color: colors.text,
    fontSize: 24,
    fontWeight: '300',
  },
  modalScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.8 - 100,
  },
  modalBody: {
    padding: 20,
  },
  lastUpdated: {
    ...type.body,
    color: colors.textDim,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  sectionTitle: {
    ...type.subtitle,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  bodyText: {
    ...type.body,
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  listItem: {
    ...type.body,
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  spacer: {
    height: 20,
  },
});
