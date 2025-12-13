import { Platform } from 'react-native';

export const type = {
  title: { fontSize: 28, fontWeight: '700', letterSpacing: 0.4 },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: 0.3 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 12, letterSpacing: 0.2 },
};

// Font family for section headers (Chapter, Energy of the Day, Birthday title, etc.)
// Font file's internal name is "Black Chancery" (with space) - use that for Android
export const headerFontFamily = Platform.OS === 'android' ? 'Black Chancery' : 'BlackChancery';

// Font family for the actual header (SimpleHeader component)
export const headerTextFontFamily = 'Bromolek';
