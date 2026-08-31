import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Fonts, FontSizes } from "../../constants/Fonts";

const LOGO = require("../../../assets/images/logo.png");
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DOT_COUNT = 10;
const DOT_RADIUS = 22;

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={Colors.gradientSplash}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ornamental watermark patterns in the top corners */}
      <PaisleyCorner style={styles.cornerTopLeft} />
      <PaisleyCorner style={styles.cornerTopRight} flip />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Emblem */}
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />

          {/* Title */}
          <Text style={styles.title}>MUDIRAJ WORLD</Text>

          {/* Flourish divider with heart */}
          <View style={styles.flourishRow}>
            <View style={styles.flourishLine} />
            <Ionicons
              name="heart"
              size={16}
              color={Colors.primaryRed}
              style={styles.heartIcon}
            />
            <View style={styles.flourishLine} />
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>Connect | Unite | Grow Together</Text>
        </View>

        {/* Heritage skyline with reflection */}
        <View style={styles.skylineWrapper} pointerEvents="none">
          <HeritageSkyline />
          <View style={styles.reflection}>
            <HeritageSkyline />
          </View>
          <LinearGradient
            colors={["transparent", "#F5A62300", "#F5A623"]}
            locations={[0, 0.4, 1]}
            style={styles.reflectionFade}
          />
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingBlock}>
          <DotLoader />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ================= ANIMATED DOT LOADER =================
function DotLoader() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const dots = Array.from({ length: DOT_COUNT });

  return (
    <Animated.View
      style={[styles.dotLoaderContainer, { transform: [{ rotate: spin }] }]}
    >
      {dots.map((_, i) => {
        const angle = (2 * Math.PI * i) / DOT_COUNT;
        const x = DOT_RADIUS * Math.cos(angle);
        const y = DOT_RADIUS * Math.sin(angle);
        const opacity = 0.25 + (0.75 * i) / DOT_COUNT;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                opacity,
                transform: [{ translateX: x }, { translateY: y }],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

// ================= ORNAMENTAL CORNER WATERMARK (pure RN, no SVG) =================
function PaisleyCorner({ style, flip }) {
  const rings = [120, 90, 60, 35];
  return (
    <View
      style={[
        styles.cornerBase,
        style,
        flip && { transform: [{ scaleX: -1 }] },
      ]}
      pointerEvents="none"
    >
      {rings.map((size, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            top: -size / 2,
            left: -size / 2,
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.2,
            borderColor: "#FFFFFF",
            opacity: 0.12 + i * 0.04,
          }}
        />
      ))}
    </View>
  );
}

// ================= HERITAGE SKYLINE (reused motif) =================
function HeritageSkyline() {
  return (
    <View style={styles.skylineSvgContainer}>
      <View style={styles.monumentCluster}>
        <View style={styles.monumentPillar}>
          <View style={styles.domeTop} />
          <View style={styles.towerBody} />
        </View>
        <View style={styles.monumentTower}>
          <View style={styles.spireTop} />
          <View style={styles.minaretDome} />
          <View style={styles.minaretBody}>
            <View style={styles.archHole} />
          </View>
        </View>
        <View style={styles.templeBlock}>
          <View style={styles.kalashPeak} />
          <View style={styles.onionDome} />
          <View style={styles.buildingBase}>
            <View style={styles.archWindow} />
            <View style={styles.archWindow} />
          </View>
        </View>
        <View style={styles.grandArchBlock}>
          <View style={styles.charminarTowers}>
            <View style={styles.miniMinaret}>
              <View style={styles.spireTop} />
              <View style={styles.miniMinaretBody} />
            </View>
            <View style={styles.miniMinaret}>
              <View style={styles.spireTop} />
              <View style={styles.miniMinaretBody} />
            </View>
          </View>
          <View style={styles.grandCenterArch}>
            <View style={styles.grandInnerArch} />
          </View>
        </View>
        <View style={styles.templeBlock}>
          <View style={styles.kalashPeak} />
          <View style={styles.onionDome} />
          <View style={styles.buildingBase}>
            <View style={styles.archWindow} />
            <View style={styles.archWindow} />
          </View>
        </View>
        <View style={styles.monumentTower}>
          <View style={styles.spireTop} />
          <View style={styles.minaretDome} />
          <View style={styles.minaretBody}>
            <View style={styles.archHole} />
          </View>
        </View>
        <View style={styles.monumentPillar}>
          <View style={styles.domeTop} />
          <View style={styles.towerBody} />
        </View>
      </View>
    </View>
  );
}

const SKYLINE_HEIGHT = 130;
const SKY_TONE = "#8A2E00"; // dark amber silhouette tone on the gold gradient

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primaryRed,
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    alignItems: "center",
    paddingTop: SCREEN_HEIGHT * 0.14,
    paddingHorizontal: 24,
  },

  /* Corner watermarks */
  cornerBase: {
    position: "absolute",
    width: 220,
    height: 220,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
  },

  /* Logo */
  logo: {
    width: 260,
    height: 260,
  },

  /* Title */
  title: {
    fontSize: 34,
    fontFamily: Fonts.display.extraBold,
    color: Colors.primaryRedDark,
    letterSpacing: 1.5,
    marginTop: 20,
    textAlign: "center",
  },

  /* Flourish + heart */
  flourishRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    width: "80%",
    justifyContent: "center",
  },
  flourishLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.primaryRed,
    opacity: 0.6,
  },
  heartIcon: {
    marginHorizontal: 10,
  },

  /* Tagline */
  tagline: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.body.medium,
    color: Colors.textPrimary,
    marginTop: 14,
    textAlign: "center",
  },

  /* Skyline + reflection */
  skylineWrapper: {
    width: "100%",
    height: SKYLINE_HEIGHT * 1.8,
    justifyContent: "flex-start",
  },
  reflection: {
    transform: [{ scaleY: -1 }],
    opacity: 0.35,
  },
  reflectionFade: {
    ...StyleSheet.absoluteFillObject,
    top: SKYLINE_HEIGHT,
  },
  skylineSvgContainer: {
    width: SCREEN_WIDTH,
    height: SKYLINE_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  monumentCluster: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    paddingHorizontal: 10,
  },
  monumentPillar: { alignItems: "center" },
  domeTop: {
    width: 22,
    height: 16,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    backgroundColor: SKY_TONE,
  },
  towerBody: { width: 18, height: 44, backgroundColor: SKY_TONE },
  monumentTower: { alignItems: "center" },
  spireTop: { width: 3, height: 10, backgroundColor: SKY_TONE },
  minaretDome: {
    width: 18,
    height: 12,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: SKY_TONE,
  },
  minaretBody: {
    width: 15,
    height: 64,
    backgroundColor: SKY_TONE,
    alignItems: "center",
    justifyContent: "center",
  },
  archHole: {
    width: 6,
    height: 12,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: "transparent",
  },
  templeBlock: { alignItems: "center" },
  kalashPeak: { width: 4, height: 8, backgroundColor: SKY_TONE },
  onionDome: {
    width: 42,
    height: 30,
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
    backgroundColor: SKY_TONE,
  },
  buildingBase: {
    width: 50,
    height: 42,
    backgroundColor: SKY_TONE,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 6,
  },
  archWindow: {
    width: 8,
    height: 18,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: "transparent",
  },
  grandArchBlock: { alignItems: "center" },
  charminarTowers: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 66,
  },
  miniMinaret: { alignItems: "center" },
  miniMinaretBody: { width: 9, height: 27, backgroundColor: SKY_TONE },
  grandCenterArch: {
    width: 74,
    height: 66,
    backgroundColor: SKY_TONE,
    borderTopLeftRadius: 37,
    borderTopRightRadius: 37,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  grandInnerArch: {
    width: 38,
    height: 42,
    backgroundColor: "transparent",
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },

  /* Loading */
  loadingBlock: {
    alignItems: "center",
    paddingBottom: 36,
  },
  dotLoaderContainer: {
    width: DOT_RADIUS * 2 + 12,
    height: DOT_RADIUS * 2 + 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryRed,
  },
  loadingText: {
    marginTop: 10,
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.body.medium,
    color: Colors.primaryRed,
  },
});
