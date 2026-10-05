import React from "react";

import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";
import LinearGradient from "react-native-linear-gradient";

import Fonts from "../constants/Fonts";

const { width } = Dimensions.get("window");

const isSmallScreen = width <= 360;
const isVerySmallScreen = width <= 320;

const COLORS = {
  red: "#D92323",
  darkRed: "#B81717",
  yellow: "#FFD928",
  lightYellow: "#FFF6C7",
  cream: "#FFFDF7",
  white: "#FFFFFF",
  black: "#171717",
  text: "#3D3D3D",
  gray: "#707070",
  lightRed: "#FFE9E9",
  border: "#F0E4C9",
};

const SECTIONS = [
  {
    title: "Information We Collect",
    description:
      "Learn about the types of information we collect and how we use it to provide a better matrimony experience.",
    icon: "file-text",
    bg: "#FFE8E8",
  },
  {
    title: "How We Protect Your Data",
    description:
      "We use industry-standard security measures to keep your personal information safe and secure.",
    icon: "shield",
    bg: "#FFF4C7",
  },
  {
    title: "How We Use Your Information",
    description:
      "Your information helps us match you with suitable profiles and improve our services.",
    icon: "user",
    bg: "#FFE8E8",
  },
  {
    title: "Information Sharing",
    description:
      "We do not sell your personal information to third parties. We only share it when needed.",
    icon: "users",
    bg: "#FFF4C7",
  },
  {
    title: "Your Rights",
    description:
      "You can access, update, or request deletion of your personal information at any time.",
    icon: "settings",
    bg: "#FFE8E8",
  },
  {
    title: "Contact Us",
    description:
      "If you have questions about our privacy policy, feel free to contact our support team.",
    icon: "mail",
    bg: "#FFF4C7",
  },
];

export default function PrivacyPolicy({ navigation, route }) {
  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.navigate(route?.params?.page || "Profile");
    } else {
      navigation?.navigate?.("Home");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.cream}
      />

      <View style={styles.container}>
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBack}
            style={styles.backButton}
          >
            <Feather
              name="arrow-left"
              size={isSmallScreen ? 18 : 21}
              color={COLORS.red}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Privacy Policy</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ================= HERO ================= */}

          <View style={styles.hero}>
            {/* LEFT TEXT */}

            <View style={styles.heroText}>
              <Text style={styles.heroSmallText}>YOUR TRUST</Text>

              <Text style={styles.heroSmallText}>OUR PRIORITY</Text>

              <Text style={styles.heroTitleRed}>Your Privacy</Text>

              <Text style={styles.heroTitleBlack}>Matters to Us</Text>

              <View style={styles.yellowLine} />

              <Text style={styles.heroDescription}>
                We are committed to keeping your personal information safe,
                secure, and confidential while you find your perfect match.
              </Text>
            </View>

            {/* RIGHT ILLUSTRATION */}

            <View style={styles.heroArt}>
              {/* Background */}

              <View style={styles.artCircle} />

              {/* Shield */}

              <View style={styles.shieldOuter}>
                <LinearGradient
                  colors={["#FFE74D", "#FFD000"]}
                  style={styles.shieldYellow}
                >
                  <View style={styles.shieldWhite}>
                    <LinearGradient
                      colors={["#F32929", "#D71919"]}
                      style={styles.shieldRed}
                    >
                      <Feather
                        name="lock"
                        size={isVerySmallScreen ? 27 : 34}
                        color={COLORS.white}
                      />
                    </LinearGradient>
                  </View>
                </LinearGradient>
              </View>

              {/* Heart */}

              <View style={styles.heartTop}>
                <Feather
                  name="heart"
                  size={isVerySmallScreen ? 12 : 15}
                  color={COLORS.red}
                  fill={COLORS.red}
                />
              </View>

              <View style={styles.heartBottom}>
                <Feather
                  name="heart"
                  size={isVerySmallScreen ? 11 : 14}
                  color={COLORS.red}
                  fill={COLORS.red}
                />
              </View>

              {/* Flower */}

              <View style={styles.flower}>
                <Feather
                  name="sun"
                  size={isVerySmallScreen ? 22 : 27}
                  color={COLORS.white}
                />
              </View>
            </View>
          </View>

          {/* ================= TRUST CARD ================= */}

          <View style={styles.trustCardWrapper}>
            <LinearGradient
              colors={["#FFF8D7", "#FFF0A2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.trustCard}
            >
              <View style={styles.trustIcon}>
                <Feather
                  name="shield"
                  size={isSmallScreen ? 14 : 18}
                  color={COLORS.red}
                />
              </View>

              <View style={styles.trustContent}>
                <Text style={styles.trustTitle}>
                  Your Privacy. Our Promise.
                </Text>

                <Text style={styles.trustDescription}>
                  Your personal information is handled with care.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* ================= SECTION CARDS ================= */}

          <View style={styles.sections}>
            {SECTIONS.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.85}
                style={styles.card}
              >
                {/* Icon */}

                <View
                  style={[
                    styles.cardIcon,
                    {
                      backgroundColor: item.bg,
                    },
                  ]}
                >
                  <Feather
                    name={item.icon}
                    size={isSmallScreen ? 18 : 22}
                    color={COLORS.red}
                  />
                </View>

                {/* Text */}

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  <Text
                    style={styles.cardDescription}
                    numberOfLines={3}
                  >
                    {item.description}
                  </Text>
                </View>

                {/* Arrow */}

                <Feather
                  name="chevron-right"
                  size={isSmallScreen ? 15 : 18}
                  color={COLORS.red}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* ================= LAST UPDATED ================= */}

          <View style={styles.updatedCard}>
            <View style={styles.infoCircle}>
              <Feather
                name="info"
                size={isSmallScreen ? 14 : 17}
                color={COLORS.white}
              />
            </View>

            <View style={styles.updatedText}>
              <Text style={styles.updatedTitle}>Last Updated</Text>

              <Text style={styles.updatedDate}>
                August 20, 2025
              </Text>
            </View>

            <Feather
              name="heart"
              size={isSmallScreen ? 24 : 31}
              color="#E8C93C"
            />
          </View>

          {/* ================= FOOTER ================= */}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Made with care for your privacy
            </Text>

            <View style={styles.footerRow}>
              <Text style={styles.footerBrand}>
                MUDHIRAJ WORLD
              </Text>

              <Feather
                name="heart"
                size={11}
                color={COLORS.red}
                fill={COLORS.red}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 7,
  },

  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF0B1",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontFamily: Fonts.display.bold,
    fontSize: 15,
    color: COLORS.red,
  },

  headerSpacer: {
    width: 30,
  },

  // =====================================================
  // HERO
  // =====================================================

  hero: {
    height: 205,
    flexDirection: "row",
    paddingHorizontal: 9,
    paddingTop: 8,
    position: "relative",
  },

  heroText: {
    width: "57%",
    zIndex: 5,
  },

  heroSmallText: {
    fontFamily: Fonts.body.bold,
    fontSize: 9,
    lineHeight: 11,
    color: COLORS.red,
    letterSpacing: 1.2,
    marginBottom: 1,
  },

  heroTitleRed: {
    fontFamily: Fonts.display.bold,
    fontSize: 25,
    lineHeight: 29,
    color: COLORS.red,
    marginTop: 14,
  },

  heroTitleBlack: {
    fontFamily: Fonts.display.bold,
    fontSize: 25,
    lineHeight: 29,
    color: COLORS.black,
  },

  yellowLine: {
    width: 40,
    height: 3,
    borderRadius: 3,
    backgroundColor: COLORS.yellow,
    marginTop: 9,
    marginBottom: 10,
  },

  heroDescription: {
    fontFamily: Fonts.body.regular,
    fontSize: 9.2,
    lineHeight: 13,
    color: COLORS.text,
    maxWidth: 125,
  },

  // =====================================================
  // HERO ART
  // =====================================================

  heroArt: {
    position: "absolute",
    right: 5,
    top: 12,
    width: 100,
    height: 180,
  },

  artCircle: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#FFF0A8",
    right: 0,
    top: 8,
  },

  shieldOuter: {
    position: "absolute",
    right: 22,
    top: 27,
    width: 72,
    height: 91,
  },

  shieldYellow: {
    flex: 1,
    borderRadius: 22,
    padding: 4,
    transform: [
      {
        rotate: "3deg",
      },
    ],
  },

  shieldWhite: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 3,
  },

  shieldRed: {
    flex: 1,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  heartTop: {
    position: "absolute",
    right: 0,
    top: 27,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  heartBottom: {
    position: "absolute",
    right: 0,
    top: 80,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  flower: {
    position: "absolute",
    right: 0,
    bottom: 17,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

  // =====================================================
  // TRUST CARD
  // =====================================================

  trustCardWrapper: {
    paddingHorizontal: 6,
    marginBottom: 9,
  },

  trustCard: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F2DD72",
  },

  trustIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  trustContent: {
    flex: 1,
  },

  trustTitle: {
    fontFamily: Fonts.body.semiBold,
    fontSize: 9.5,
    lineHeight: 12,
    color: COLORS.red,
    marginBottom: 1,
  },

  trustDescription: {
    fontFamily: Fonts.body.regular,
    fontSize: 7.8,
    lineHeight: 10,
    color: COLORS.gray,
  },

  // =====================================================
  // PRIVACY CARDS
  // =====================================================

  sections: {
    paddingHorizontal: 6,
  },

  card: {
    minHeight: 78,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    marginBottom: 7,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#F0E5D2",

    elevation: 1,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  cardContent: {
    flex: 1,
    paddingRight: 5,
  },

  cardTitle: {
    fontFamily: Fonts.body.semiBold,
    fontSize: 10.5,
    lineHeight: 13,
    color: COLORS.red,
    marginBottom: 3,
  },

  cardDescription: {
    fontFamily: Fonts.body.regular,
    fontSize: 8.2,
    lineHeight: 10.5,
    color: "#666666",
  },

  // =====================================================
  // LAST UPDATED
  // =====================================================

  updatedCard: {
    marginHorizontal: 6,
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: "#FFF4B8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#F0D967",
  },

  infoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

  updatedText: {
    flex: 1,
    marginLeft: 8,
  },

  updatedTitle: {
    fontFamily: Fonts.body.semiBold,
    fontSize: 8.5,
    color: COLORS.red,
    marginBottom: 1,
  },

  updatedDate: {
    fontFamily: Fonts.body.regular,
    fontSize: 7.5,
    color: COLORS.gray,
  },

  // =====================================================
  // FOOTER
  // =====================================================

  footer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 5,
  },

  footerText: {
    fontFamily: Fonts.body.regular,
    fontSize: 8,
    color: "#888888",
    marginBottom: 3,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  footerBrand: {
    fontFamily: Fonts.body.bold,
    fontSize: 8,
    letterSpacing: 1.2,
    color: COLORS.red,
  },
});