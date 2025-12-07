import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated } from 'react-native';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function PrivacyModal({ visible, onClose }) {
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
              <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

              <Text style={styles.sectionTitle}>1. Introduction</Text>
              <Text style={styles.bodyText}>
                Welcome to 13-Day Stories. We are committed to protecting your privacy and ensuring you have a positive experience on our app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
              </Text>

              <Text style={styles.sectionTitle}>2. Information We Collect</Text>
              <Text style={styles.bodyText}>
                We collect minimal information necessary to provide you with personalized content:
              </Text>
              <Text style={styles.listItem}>• Birthday information (month, day, year) - used to calculate your Mayan calendar sign</Text>
              <Text style={styles.listItem}>• Notification preferences - stored locally on your device</Text>
              <Text style={styles.bodyText}>
                All data is stored locally on your device using secure storage. We do not collect, transmit, or store your personal information on our servers.
              </Text>

              <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
              <Text style={styles.bodyText}>
                The information we collect is used solely to:
              </Text>
              <Text style={styles.listItem}>• Calculate and display your personalized Mayan calendar readings</Text>
              <Text style={styles.listItem}>• Send you daily notification reminders (if enabled)</Text>
              <Text style={styles.listItem}>• Improve your app experience</Text>

              <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
              <Text style={styles.bodyText}>
                All your personal data, including your birthday and notification preferences, is stored locally on your device using secure local storage. We do not have access to this information, and it is never transmitted to our servers or third parties.
              </Text>
              <Text style={styles.bodyText}>
                You can clear all stored data at any time through the Settings > Data & Storage menu.
              </Text>

              <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
              <Text style={styles.bodyText}>
                Our app may use third-party services for analytics and app functionality. These services may collect information used to identify you. We do not share your personal information with third parties except as necessary to provide our services.
              </Text>

              <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
              <Text style={styles.bodyText}>
                Our app is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
              </Text>

              <Text style={styles.sectionTitle}>7. Your Rights</Text>
              <Text style={styles.bodyText}>
                You have the right to:
              </Text>
              <Text style={styles.listItem}>• Access your personal data stored in the app</Text>
              <Text style={styles.listItem}>• Delete your personal data at any time through the app settings</Text>
              <Text style={styles.listItem}>• Opt out of notifications at any time</Text>
              <Text style={styles.listItem}>• Request information about what data is stored on your device</Text>

              <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
              <Text style={styles.bodyText}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the app and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </Text>

              <Text style={styles.sectionTitle}>9. Contact Us</Text>
              <Text style={styles.bodyText}>
                If you have any questions about this Privacy Policy, please contact us through the app's support channels or visit our website.
              </Text>

              <View style={styles.spacer} />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

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
    maxHeight: '90%',
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
    flex: 1,
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

