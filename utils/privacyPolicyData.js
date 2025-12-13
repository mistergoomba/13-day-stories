/**
 * Shared Privacy Policy Data
 * Single source of truth for privacy policy content used in both app and web
 */

export const PRIVACY_POLICY_DATA = {
  lastUpdated: '2025-01-27', // Update this date when making changes
  
  sections: [
    {
      title: '1. Introduction',
      content: [
        'Welcome to 13-Day Stories. We are committed to protecting your privacy and ensuring you have a positive experience on our app. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.',
      ],
    },
    {
      title: '2. Information We Collect',
      content: [
        'We collect minimal information necessary to provide you with personalized content:',
      ],
      listItems: [
        'Birthday information (month, day, year) - used to calculate your Mayan calendar sign',
        'Notification preferences - stored locally on your device',
      ],
      additionalContent: [
        'All data is stored locally on your device using secure storage. We do not collect, transmit, or store your personal information on our servers.',
      ],
    },
    {
      title: '3. How We Use Your Information',
      content: [
        'The information we collect is used solely to:',
      ],
      listItems: [
        'Calculate and display your personalized Mayan calendar readings',
        'Send you daily notification reminders (if enabled)',
        'Improve your app experience',
      ],
    },
    {
      title: '4. Data Storage and Security',
      content: [
        'All your personal data, including your birthday and notification preferences, is stored locally on your device using secure local storage. We do not have access to this information, and it is never transmitted to our servers or third parties.',
        'You can clear all stored data at any time through the Settings > Data & Storage menu.',
      ],
    },
    {
      title: '5. Third-Party Services',
      content: [
        'Our app uses the following third-party services:',
      ],
      listItems: [
        'Google Mobile Ads (AdMob) - We display advertisements in our app. Google Mobile Ads may collect and use information about your device and app usage to provide personalized ads. You can learn more about how Google uses data at https://policies.google.com/privacy',
        'In-App Purchases - We use Google Play Billing and Apple App Store for in-app purchases. Payment information is processed by these platforms and is subject to their privacy policies.',
        'Analytics - We may use analytics services to understand how our app is used and to improve our services. These services may collect device identifiers and usage data.',
      ],
      additionalContent: [
        'We do not share your personal information (such as your birthday) with third parties except as necessary to provide our services. Third-party services have their own privacy policies governing the collection and use of your information.',
      ],
    },
    {
      title: '6. Advertising',
      content: [
        'Our app contains advertisements served through Google Mobile Ads (AdMob). These advertisements help us provide the app free of charge.',
      ],
      listItems: [
        'AdMob may collect device identifiers, location data (if permitted), and usage information to serve personalized advertisements',
        'You can opt out of personalized advertising through your device settings (iOS: Settings > Privacy > Apple Advertising; Android: Settings > Google > Ads)',
        'We offer a premium subscription that removes all advertisements',
      ],
      additionalContent: [
        'For more information about how Google uses data for advertising, please visit: https://policies.google.com/technologies/ads',
      ],
    },
    {
      title: '7. Children\'s Privacy',
      content: [
        'Our app is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us through our contact page at https://13daystories.com/contact so we can delete such information.',
      ],
    },
    {
      title: '8. Your Rights',
      content: [
        'You have the right to:',
      ],
      listItems: [
        'Access your personal data stored in the app',
        'Delete your personal data at any time through the app settings',
        'Opt out of notifications at any time',
        'Request information about what data is stored on your device',
        'Opt out of personalized advertising through your device settings',
      ],
    },
    {
      title: '9. Changes to This Privacy Policy',
      content: [
        'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the app and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.',
      ],
    },
    {
      title: '10. Contact Us',
      content: [
        'If you have any questions about this Privacy Policy, please contact us through our contact page:',
      ],
      listItems: [
        'Contact Form: https://13daystories.com/contact',
        'Website: https://13daystories.com',
      ],
    },
  ],
};

/**
 * Format the last updated date for display
 */
export const getFormattedLastUpdated = () => {
  const date = new Date(PRIVACY_POLICY_DATA.lastUpdated);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

