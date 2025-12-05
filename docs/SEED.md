Awesome — here’s your **Cursor/Claude-ready Markdown** that scaffolds an Expo React Native app with the exact behavior we agreed on: purple/ethereal theme, trecena day navigation with **fixed** Affirmation/Meditation icons on the right, **swipeable** day strip that pages back to Intro and forward up to “today,” and mock No’j data using `Imox-05` style keys.

> Paste this whole thing into Cursor/Claude. It creates all files as shown. Then run the install and start commands.

---

# 13-Day Stories — React Native (Expo) App Scaffold

This is a mobile-first app scaffold for daily Mayan-inspired stories. It includes:

* **Bottom toolbar** with a **swipeable day strip** (Intro → Day 1…N, clamped at Today)
* **Affirmation** and **Meditation** icons **always visible on the right** (don’t shift when the date changes)
* Purple, ethereal theme (nebula background, glassy cards)
* Data keys formatted as **`Imox-05`** (nawal-first, zero-padded tone)
* Mock **No’j** trecena with lorem ipsum content
* Sections per day: **Story Chapter**, **Sharable Horoscope**, **Mayan Reading**

---

## 0) Create project & install

```bash
# If you don't have expo yet:
npm i -g expo-cli || npx expo --version

# Create an empty Expo project (JS preferred)
npx create-expo-app 13-day-stories --template
cd 13-day-stories

# Install deps
npm i @react-navigation/native @react-navigation/stack
npm i react-native-gesture-handler react-native-reanimated
npm i react-native-safe-area-context react-native-screens
```

> iOS: open the Expo Go app; Android: use Expo Go or run emulator.

---

## 1) File tree

```
13-day-stories/
  app.json
  babel.config.js
  package.json
  App.js
  theme/
    colors.js
    typography.js
  components/
    NebulaBackground.js
    Card.js
    SectionHeader.js
    BottomToolbar.js
    DayPill.js
  screens/
    DayScreen.js
    TrecenaIntroScreen.js
    AffirmationScreen.js
    MeditationScreen.js
  data/
    mock.js
  utils/
    dateContext.js
```

Create/replace files with the code below.

---

## 2) `package.json` (ensure versions look similar; Expo will resolve)

```json
{
  "name": "13-day-stories",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "private": true,
  "scripts": {
    "start": "expo start -c",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.22",
    "expo": "~51.0.0",
    "react": "18.2.0",
    "react-native": "0.74.0",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-reanimated": "~3.10.1",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "~3.31.1"
  }
}
```

> If versions conflict, accept Expo’s suggested compatible versions.

---

## 3) `app.json`

```json
{
  "expo": {
    "name": "13-Day Stories",
    "slug": "13-day-stories",
    "scheme": "stories",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "cover",
      "backgroundColor": "#12091A"
    },
    "plugins": [],
    "ios": { "supportsTablet": false },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#12091A"
      }
    },
    "web": { "bundler": "metro", "backgroundColor": "#12091A" },
    "extra": { "easterEgg": false }
  }
}
```

---

## 4) `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin" // keep last
    ]
  };
};
```

---

## 5) `App.js`

```js
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "react-native";
import DayScreen from "./screens/DayScreen";
import TrecenaIntroScreen from "./screens/TrecenaIntroScreen";
import AffirmationScreen from "./screens/AffirmationScreen";
import MeditationScreen from "./screens/MeditationScreen";
import NebulaBackground from "./components/NebulaBackground";
import colors from "./theme/colors";

// React Navigation theme (transparent cards, purple tints)
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
    card: "transparent",
    text: "#F1E7FF",
    primary: colors.accent
  }
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <NebulaBackground />
      <StatusBar barStyle="light-content" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            presentation: "card",
            animationEnabled: false
          }}
        >
          <Stack.Screen name="TrecenaIntro" component={TrecenaIntroScreen} />
          <Stack.Screen name="Day" component={DayScreen} />
          <Stack.Screen name="Affirmation" component={AffirmationScreen} />
          <Stack.Screen name="Meditation" component={MeditationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
```

---

## 6) Theme

### `theme/colors.js`

```js
export default {
  bg: "#12091A",             // deep plum
  surface: "rgba(255,255,255,0.06)",
  surfaceAlt: "rgba(255,255,255,0.08)",
  text: "#F1E7FF",
  textDim: "rgba(241,231,255,0.7)",
  border: "rgba(255,255,255,0.12)",
  accent: "#A476FF",
  accent2: "#6E45CF",
  glow: "rgba(164,118,255,0.45)"
};
```

### `theme/typography.js`

```js
export const type = {
  title: { fontSize: 28, fontWeight: "700", letterSpacing: 0.4 },
  h2: { fontSize: 20, fontWeight: "700", letterSpacing: 0.3 },
  body: { fontSize: 16, lineHeight: 24 },
  caption: { fontSize: 12, letterSpacing: 0.2 }
};
```

---

## 7) Components

### `components/NebulaBackground.js`

```js
import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// If expo-linear-gradient not present, install: npm i expo-linear-gradient
export default function NebulaBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#0C0711", "#1C0F29", "#12091A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 1 }}
      />
      <LinearGradient
        colors={["rgba(164,118,255,0.25)", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.7, y: 0 }}
        end={{ x: 0.2, y: 1 }}
      />
    </View>
  );
}
```

> If you prefer no extra dependency, replace with a plain `View` gradient mock.

### `components/Card.js`

```js
import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "../theme/colors";

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }
  }
});
```

### `components/SectionHeader.js`

```js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../theme/colors";
import { type } from "../theme/typography";

export default function SectionHeader({ title }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  title: { ...type.h2, color: colors.text },
  rule: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 6
  }
});
```

### `components/DayPill.js`

```js
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";

export default function DayPill({ label, sublabel, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.pill,
      active && styles.active,
      pressed && { opacity: 0.85 }
    ]}>
      <Text style={[styles.label, active && styles.activeText]}>{label}</Text>
      {sublabel ? <Text style={[styles.sublabel, active && styles.activeText]}>{sublabel}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    marginRight: 10
  },
  active: {
    backgroundColor: "rgba(164,118,255,0.16)",
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 8
  },
  label: { color: colors.text, fontWeight: "700" },
  sublabel: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  activeText: { color: colors.text }
});
```

### `components/BottomToolbar.js`

```js
import React, { useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import DayPill from "./DayPill";
import colors from "../theme/colors";

/**
 * Props:
 * - center: { label, key, sublabel }
 * - left: [{ label, key, sublabel }, ...]  // up to 2
 * - onLeftSwipe(): move forward (+1) if allowed
 * - onRightSwipe(): move back (-1) if allowed
 * - onSelect(key): set center
 * - onOpenAffirmation()
 * - onOpenMeditation()
 * - canGoBack, canGoForward
 */
export default function BottomToolbar({
  center,
  left,
  onLeftSwipe,
  onRightSwipe,
  onSelect,
  onOpenAffirmation,
  onOpenMeditation,
  canGoBack,
  canGoForward
}) {
  const fling = Gesture.Fling()
    .direction(4) // left
    .onEnd(() => {
      if (canGoForward) onLeftSwipe();
    });

  const flingRight = Gesture.Fling()
    .direction(8) // right
    .onEnd(() => {
      if (canGoBack) onRightSwipe();
    });

  const composed = Gesture.Simultaneous(fling, flingRight);

  return (
    <View style={styles.wrap}>
      <GestureDetector gesture={composed}>
        <View style={styles.dayStrip}>
          <View style={styles.leftGroup}>
            {left.map((d) => (
              <DayPill
                key={d.key}
                label={d.label}
                sublabel={d.sublabel}
                active={false}
                onPress={() => onSelect(d.key)}
              />
            ))}
          </View>

          <View style={styles.center}>
            <DayPill
              key={center.key}
              label={center.label}
              sublabel={center.sublabel}
              active
              onPress={() => {}}
            />
          </View>

          <View style={styles.actions}>
            <Text style={styles.action} onPress={onOpenAffirmation}>🜂 Affirm</Text>
            <Text style={styles.action} onPress={onOpenMeditation}>☽ Meditate</Text>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: "rgba(0,0,0,0.25)"
  },
  dayStrip: {
    flexDirection: "row",
    alignItems: "center"
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center"
  },
  center: {
    flex: 1,
    alignItems: "center"
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginLeft: 8
  },
  action: {
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden"
  }
});
```

---

## 8) Data (mock No’j trecena)

### `data/mock.js`

```js
// Mock trecena = No’j; "today" is Oct 14 mapped to Imox-05 for demo

export const MOCK_TODAY_ISO = "2025-10-14";
export const MOCK_TZ = "America/Los_Angeles";

export const nojTrecena = {
  name: "No’j",
  theme: "New ideas into practical solutions",
  overview:
    "Sudden insight meets grounded problem-solving. Ideas may be early for others; incubate and socialize lightly.",
  focus: ["problem-solving", "planning", "clarity", "study", "small experiments"],
  arcLabels: [
    "Life is beautiful",
    "Serve others",
    "All things pass",
    "Simplify",
    "Effort toward the dream",
    "Clear communication",
    "Contrast teaches",
    "Interdependence",
    "Lessons & teachers",
    "Legacy reflection",
    "Wander wilderness",
    "Seed highest intention",
    "Make an offering"
  ],
  intro: {
    title: "No’j Trecena — 13 Days of Intelligence and Ideas",
    body:
      "Welcome to the No’j trecena. For the next 13 days, we explore practical insight. This is a time to gather, study, and gently prototype ideas. Approach each day as a chapter in a larger story. (Lorem ipsum intro…) "
  },
  // Keys: nawal-first with zero padded tone (Imox-05)
  days: {
    "No’j-01": mkDay(1, "No’j"),
    "Tijax-02": mkDay(2, "Tijax"),
    "Kawoq-03": mkDay(3, "Kawoq"),
    "Ajpu-04": mkDay(4, "Ajpu"),
    "Imox-05": mkDay(5, "Imox"),
    "Iq’-06": mkDay(6, "Iq’"),
    "Aq’ab’al-07": mkDay(7, "Aq’ab’al"),
    "K’at-08": mkDay(8, "K’at"),
    "Kan-09": mkDay(9, "Kan"),
    "Kame-10": mkDay(10, "Kame"),
    "Kej-11": mkDay(11, "Kej"),
    "Q’anil-12": mkDay(12, "Q’anil"),
    "Toj-13": mkDay(13, "Toj")
  }
};

// helper to generate lorem day content
function mkDay(tone, nawal) {
  const key = `${nawal}-${String(tone).padStart(2, "0")}`;
  return {
    key,
    dayIndex: tone,
    tone,
    nawal,
    dateISO: null, // filled by mapping util if you want
    storyChapter:
      "Story Chapter: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in urna ut orci viverra dictum.",
    sharable:
      "Sharable Horoscope: A whimsical, fantastical note inspired by today’s energies. Nulla facilisi. Curabitur egestas.",
    mayanReading:
      "Mayan Reading: Placeholder using tone and nawal motifs. Integer ac orci feugiat, eleifend neque a, tempor sapien."
  };
}

export const mockAppData = {
  currentTrecenaKey: "No’j",
  trecenas: { "No’j": nojTrecena }
};
```

---

## 9) Date & toolbar logic

### `utils/dateContext.js`

```js
import { mockAppData, MOCK_TODAY_ISO } from "../data/mock";

// For demo: map Oct 14 (MOCK_TODAY_ISO) to Imox-05 within No’j trecena.
const TODAY_TONE = 5;           // "Imox-05" dayIndex inside No’j
const TODAY_KEY = "Imox-05";

export function getCurrentContext() {
  const trecenaKey = mockAppData.currentTrecenaKey;
  return {
    trecenaKey,
    todayKey: TODAY_KEY,
    todayIndex: TODAY_TONE // 1..13
  };
}

/**
 * Given an active panel, produce toolbar state:
 * - center day pill
 * - up to two left pills (previous days, or Intro when at day 1)
 * - rightActions always ["affirmation","meditation"]
 * - canGoBack/canGoForward clamp at Intro and Today
 *
 * active can be: "intro" | DayKey (e.g., "Imox-05")
 */
export function getToolbarState(active, ctx) {
  const t = mockAppData.trecenas[ctx.trecenaKey];
  const days = Object.values(t.days).sort((a, b) => a.dayIndex - b.dayIndex); // 1..13

  let centerObj;
  if (active === "intro") {
    // center shows Day 1 as preview label but not active (we still show Intro screen)
    const d1 = days[0];
    centerObj = {
      label: dateLabelFor(d1.dayIndex), // mock date labels
      sublabel: d1.key, // "Imox-05"
      key: "intro"
    };
  } else {
    const d = t.days[active];
    centerObj = {
      label: dateLabelFor(d.dayIndex),
      sublabel: d.key,
      key: d.key
    };
  }

  // build left pills (up to two previous)
  let left = [];
  if (active === "intro") {
    // no prior panels
    left = [];
  } else {
    const currentIndex = t.days[active].dayIndex;
    const prev1 = currentIndex - 1;
    const prev2 = currentIndex - 2;
    if (prev2 >= 1) left.push(mkLeft(days[prev2 - 1]));
    if (prev1 >= 1) left.push(mkLeft(days[prev1 - 1]));
  }

  // clamps
  const canGoBack = active === "intro" ? false : true; // can fling right to go towards intro
  const canGoForward =
    active === "intro"
      ? true
      : t.days[active].dayIndex < ctx.todayIndex; // stop at today

  return {
    center: centerObj,
    left,
    rightActions: ["affirmation", "meditation"],
    canGoBack,
    canGoForward
  };
}

function mkLeft(d) {
  return {
    label: dateLabelFor(d.dayIndex),
    sublabel: d.key,
    key: d.key
  };
}

// Mock date label generator: Today is Day 5 => Oct 14; Day 4 => Oct 13, etc.
function dateLabelFor(dayIndex) {
  const base = new Date(MOCK_TODAY_ISO + "T12:00:00Z"); // noon to avoid TZ drift
  const deltaDays = dayIndex - 5; // 5 == today
  const d = new Date(base);
  d.setUTCDate(base.getUTCDate() + deltaDays);
  const m = d.toLocaleString("en-US", { month: "short" });
  const day = d.getUTCDate();
  return `${m} ${day}`;
}

/**
 * Transition helpers
 */
export function goForward(active, ctx) {
  const t = mockAppData.trecenas[ctx.trecenaKey];
  if (active === "intro") {
    // intro -> day1
    return findKeyByIndex(t, 1);
  }
  const idx = t.days[active].dayIndex;
  if (idx >= ctx.todayIndex) return active;
  return findKeyByIndex(t, idx + 1);
}

export function goBack(active, ctx) {
  const t = mockAppData.trecenas[ctx.trecenaKey];
  if (active === "intro") return "intro";
  const idx = t.days[active].dayIndex;
  if (idx <= 1) return "intro";
  return findKeyByIndex(t, idx - 1);
}

export function findKeyByIndex(trecena, index) {
  const entry = Object.values(trecena.days).find((d) => d.dayIndex === index);
  return entry ? entry.key : "intro";
}
```

---

## 10) Screens

### `screens/TrecenaIntroScreen.js`

```js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../theme/colors";
import { type } from "../theme/typography";
import Card from "../components/Card";
import BottomToolbar from "../components/BottomToolbar";
import { mockAppData } from "../data/mock";
import {
  getCurrentContext,
  getToolbarState,
  goForward,
  goBack
} from "../utils/dateContext";

export default function TrecenaIntroScreen({ navigation }) {
  const ctx = getCurrentContext();
  const trecena = mockAppData.trecenas[ctx.trecenaKey];
  const active = "intro";

  const tb = getToolbarState(active, ctx);

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroller}>
        <Text style={styles.title}>{trecena.intro.title}</Text>
        <Card>
          <Text style={styles.body}>{trecena.intro.body}</Text>
        </Card>
      </ScrollView>

      <BottomToolbar
        center={tb.center}
        left={tb.left}
        canGoBack={tb.canGoBack}
        canGoForward={tb.canGoForward}
        onLeftSwipe={() => {
          const next = goForward(active, ctx);
          navigation.replace("Day", { key: next });
        }}
        onRightSwipe={() => {
          // already at intro, ignore
        }}
        onSelect={(key) => {
          navigation.replace("Day", { key });
        }}
        onOpenAffirmation={() => navigation.navigate("Affirmation")}
        onOpenMeditation={() => navigation.navigate("Meditation")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 64 },
  scroller: { padding: 16, paddingBottom: 100 },
  title: { ...type.title, color: colors.text, marginBottom: 12 },
  body: { ...type.body, color: colors.text }
});
```

### `screens/DayScreen.js`

```js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../theme/colors";
import { type } from "../theme/typography";
import Card from "../components/Card";
import SectionHeader from "../components/SectionHeader";
import BottomToolbar from "../components/BottomToolbar";
import { mockAppData } from "../data/mock";
import {
  getCurrentContext,
  getToolbarState,
  goForward,
  goBack
} from "../utils/dateContext";

export default function DayScreen({ route, navigation }) {
  const { key } = route.params; // "Imox-05" etc.
  const ctx = getCurrentContext();
  const trecena = mockAppData.trecenas[ctx.trecenaKey];
  const day = trecena.days[key];

  const tb = getToolbarState(key, ctx);

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroller}>
        <Text style={styles.title}>
          {trecena.name} — {day.nawal} {String(day.tone).padStart(2, "0")}
        </Text>

        <SectionHeader title="Story Chapter" />
        <Card><Text style={styles.body}>{day.storyChapter}</Text></Card>

        <SectionHeader title="Sharable Horoscope" />
        <Card><Text style={styles.body}>{day.sharable}</Text></Card>

        <SectionHeader title="Mayan Reading" />
        <Card><Text style={styles.body}>{day.mayanReading}</Text></Card>
      </ScrollView>

      <BottomToolbar
        center={tb.center}
        left={tb.left}
        canGoBack={tb.canGoBack}
        canGoForward={tb.canGoForward}
        onLeftSwipe={() => {
          const next = goForward(key, ctx);
          if (next === key) return;
          navigation.replace("Day", { key: next });
        }}
        onRightSwipe={() => {
          const prev = goBack(key, ctx);
          if (prev === "intro") {
            navigation.replace("TrecenaIntro");
          } else {
            navigation.replace("Day", { key: prev });
          }
        }}
        onSelect={(newKey) => {
          navigation.replace("Day", { key: newKey });
        }}
        onOpenAffirmation={() => navigation.navigate("Affirmation")}
        onOpenMeditation={() => navigation.navigate("Meditation")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 64 },
  scroller: { padding: 16, paddingBottom: 100 },
  title: { ...type.title, color: colors.text, marginBottom: 12 },
  body: { ...type.body, color: colors.text }
});
```

### `screens/AffirmationScreen.js`

```js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../theme/colors";
import { type } from "../theme/typography";
import Card from "../components/Card";
import BottomToolbar from "../components/BottomToolbar";
import {
  getCurrentContext,
  getToolbarState
} from "../utils/dateContext";

export default function AffirmationScreen({ navigation }) {
  const ctx = getCurrentContext();
  // When viewing Affirmation, keep toolbar centered on "today" (doesn't change active panel)
  const tb = getToolbarState("Imox-05", ctx); // center label derived from day 5 in mock

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroller}>
        <Text style={styles.title}>Today’s Affirmation</Text>
        <Card>
          <Text style={styles.body}>
            I move with clarity and kindness; each small step seeds a brighter story.
            (Lorem ipsum placeholder…)
          </Text>
        </Card>
      </ScrollView>

      <BottomToolbar
        center={tb.center}
        left={tb.left}
        canGoBack={tb.canGoBack}
        canGoForward={tb.canGoForward}
        onLeftSwipe={() => {}}
        onRightSwipe={() => {}}
        onSelect={(key) => navigation.replace("Day", { key })}
        onOpenAffirmation={() => {}}
        onOpenMeditation={() => navigation.navigate("Meditation")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 64 },
  scroller: { padding: 16, paddingBottom: 100 },
  title: { ...type.title, color: colors.text, marginBottom: 12 },
  body: { ...type.body, color: colors.text }
});
```

### `screens/MeditationScreen.js`

```js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import colors from "../theme/colors";
import { type } from "../theme/typography";
import Card from "../components/Card";
import BottomToolbar from "../components/BottomToolbar";
import {
  getCurrentContext,
  getToolbarState
} from "../utils/dateContext";

export default function MeditationScreen({ navigation }) {
  const ctx = getCurrentContext();
  const tb = getToolbarState("Imox-05", ctx);

  return (
    <View style={styles.wrap}>
      <ScrollView contentContainerStyle={styles.scroller}>
        <Text style={styles.title}>Today’s Meditation</Text>
        <Card>
          <Text style={styles.body}>
            Breathe in through the heart, out through the belly. Visualize a violet nebula
            surrounding your thoughts. (Lorem ipsum placeholder…)
          </Text>
        </Card>
      </ScrollView>

      <BottomToolbar
        center={tb.center}
        left={tb.left}
        canGoBack={tb.canGoBack}
        canGoForward={tb.canGoForward}
        onLeftSwipe={() => {}}
        onRightSwipe={() => {}}
        onSelect={(key) => navigation.replace("Day", { key })}
        onOpenAffirmation={() => navigation.navigate("Affirmation")}
        onOpenMeditation={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: 64 },
  scroller: { padding: 16, paddingBottom: 100 },
  title: { ...type.title, color: colors.text, marginBottom: 12 },
  body: { ...type.body, color: colors.text }
});
```

---

## 11) Run it

```bash
npm run start
```

* In the app:

  * You’ll land on **Intro** (TrecenaIntro screen).
  * **Swipe left** on the bottom strip (or tap the left pills) to move into Day 1 → … → **Day 5 (Today)**.
  * **Affirmation** and **Meditation** are always on the right; tapping them opens those screens **without** shifting the day state.
  * On a day screen, **swipe left** to go forward (until Today), **swipe right** to go back and eventually to Intro.

---

## 12) Notes & TODOs

* Replace `data/mock.js` with your real trecena JSON when ready.
* The **subtitle** on pills currently shows the **`Imox-05`** key for debugging; hide when you switch to real content.
* If you want the “center pill” to **always** reflect the currently open day (even while on Affirmation/Meditation), keep as-is. If you prefer to show a neutral “Today” label on non-day screens, emit `center` accordingly in `getToolbarState`.
* Add **AsyncStorage** later to persist last viewed panel.
* You can style the **Affirmation/Meditation** icons (currently text) as SVG/emoji or use an icon lib.

---

That’s it — you’ve got a functional purple-ethereal RN app shell with your navigation rules baked in.
