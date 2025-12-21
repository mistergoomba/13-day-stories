import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import { type } from '../theme/typography';

export default function TermsOfServiceModal({ visible, onClose }) {
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
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <Pressable onPress={handleClose}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.modalBody}>
              <Text style={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

              <Text style={styles.bodyText}>
                Please read these Terms of Service ("Terms") carefully before using the 13-Day Stories mobile application ("App") operated by us.
              </Text>

              <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
              <Text style={styles.bodyText}>
                By accessing or using our App, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access the App.
              </Text>

              <Text style={styles.sectionTitle}>2. Use License</Text>
              <Text style={styles.bodyText}>
                Permission is granted to temporarily download one copy of the App for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </Text>
              <Text style={styles.listItem}>• Modify or copy the materials</Text>
              <Text style={styles.listItem}>• Use the materials for any commercial purpose or for any public display</Text>
              <Text style={styles.listItem}>• Attempt to reverse engineer any software contained in the App</Text>
              <Text style={styles.listItem}>• Remove any copyright or other proprietary notations from the materials</Text>

              <Text style={styles.sectionTitle}>3. Content and Intellectual Property</Text>
              <Text style={styles.bodyText}>
                The App and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. All content provided in the App, including but not limited to Mayan calendar readings, stories, and images, is for informational and entertainment purposes only.
              </Text>

              <Text style={styles.sectionTitle}>4. User Accounts and Data</Text>
              <Text style={styles.bodyText}>
                You are responsible for maintaining the confidentiality of any information you provide through the App. You agree that all information you provide is accurate, current, and complete. You are responsible for all activities that occur under your use of the App.
              </Text>

              <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
              <Text style={styles.bodyText}>
                You may not use the App:
              </Text>
              <Text style={styles.listItem}>• In any way that violates any applicable national or international law or regulation</Text>
              <Text style={styles.listItem}>• To transmit, or procure the sending of, any advertising or promotional material</Text>
              <Text style={styles.listItem}>• To impersonate or attempt to impersonate the company, employees, or other users</Text>
              <Text style={styles.listItem}>• In any way that infringes upon the rights of others</Text>

              <Text style={styles.sectionTitle}>6. Disclaimer</Text>
              <Text style={styles.bodyText}>
                The information on this App is provided on an "as is" basis. To the fullest extent permitted by law, we exclude all representations, warranties, and conditions relating to our App and the use of this App. The content provided is for entertainment and informational purposes only and should not be considered as professional advice.
              </Text>

              <Text style={styles.sectionTitle}>7. Limitations</Text>
              <Text style={styles.bodyText}>
                In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the App, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </Text>

              <Text style={styles.sectionTitle}>8. Accuracy of Materials</Text>
              <Text style={styles.bodyText}>
                The materials appearing in the App could include technical, typographical, or photographic errors. We do not warrant that any of the materials on the App are accurate, complete, or current. We may make changes to the materials contained in the App at any time without notice.
              </Text>

              <Text style={styles.sectionTitle}>9. Links</Text>
              <Text style={styles.bodyText}>
                We have not reviewed all of the sites linked to our App and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us. Use of any such linked website is at the user's own risk.
              </Text>

              <Text style={styles.sectionTitle}>10. Modifications</Text>
              <Text style={styles.bodyText}>
                We may revise these Terms at any time without notice. By using this App, you are agreeing to be bound by the then current version of these Terms.
              </Text>

              <Text style={styles.sectionTitle}>11. Governing Law</Text>
              <Text style={styles.bodyText}>
                These Terms shall be governed and construed in accordance with applicable laws, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </Text>

              <Text style={styles.sectionTitle}>12. Contact Information</Text>
              <Text style={styles.bodyText}>
                If you have any questions about these Terms, please contact us through the app's support channels.
              </Text>

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

