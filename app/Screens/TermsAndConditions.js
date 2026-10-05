import React from "react";

import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";

import { Colors } from "../constants/colors";
import { Fonts } from "../constants/Fonts";

/* ============================================================
   CONFIG
============================================================ */

// Optional:
// If you want to use a real image later:
//
// const HERO_IMAGE = require("../assets/images/terms-hero.png");
//
// For now, the drawn artwork will be displayed.

const HERO_IMAGE = null;

const CREAM = "#FFFBF2";
const YELLOW = "#FDEFB2";
const PINK = "#FCE3E3";
const RED = Colors.primaryRed || "#C91E26";

/* ============================================================
   TERMS
============================================================ */

const TERMS = [
  {
    icon: "file-text",
    tone: "pink",
    title: "Acceptance of Terms",
    description:
      "By using Mudhiraj World, you agree to comply with these Terms & Conditions.",
  },
  {
    icon: "users",
    tone: "yellow",
    title: "User Responsibilities",
    description:
      "You agree to provide accurate information and maintain the authenticity of your profile.",
  },
  {
    icon: "shield",
    tone: "pink",
    title: "Account Security",
    description:
      "You are responsible for keeping your account credentials safe and secure.",
  },
  {
    icon: "heart",
    tone: "yellow",
    title: "Appropriate Use",
    description:
      "You agree not to misuse the platform or engage in any fraudulent or inappropriate activities.",
  },
  {
    icon: "slash",
    tone: "pink",
    title: "Prohibited Activities",
    description:
      "Activities such as fake profiles, harassment, or illegal content are strictly prohibited.",
  },
  {
    icon: "scale",
    tone: "yellow",
    title: "Limitation of Liability",
    description:
      "Mudhiraj World is not liable for any issues arising from user interactions.",
  },
  {
    icon: "edit-3",
    tone: "pink",
    title: "Changes to Terms",
    description:
      "We may update these Terms & Conditions from time to time. Continued use means you accept the updated terms.",
  },
  {
    icon: "mail",
    tone: "yellow",
    title: "Contact Us",
    description:
      "If you have any questions about these Terms & Conditions, feel free to reach out to our support team.",
  },
];

const LAST_UPDATED = "August 20, 2025";

/* ============================================================
   MAIN SCREEN
============================================================ */

export default function TermsAndConditions({ navigation, route }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={CREAM}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => {
              if (navigation?.canGoBack?.()) {
                navigation.navigate(route?.params?.page || "Profile");
              } else {
                navigation.navigate("Home");
              }
            }}
          >
            <Feather
              name="arrow-left"
              size={22}
              color={RED}
            />
          </TouchableOpacity>

          <Text style={styles.topTitle}>
            Terms & Conditions
          </Text>

          {/* Spacer keeps title centred */}

          <View style={styles.backButtonSpacer} />
        </View>

        {/* ====================================================
            HERO
        ==================================================== */}

        <View style={styles.hero}>
          {HERO_IMAGE ? (
            <Image
              source={HERO_IMAGE}
              style={styles.heroImage}
              resizeMode="contain"
            />
          ) : (
            <HeroArt />
          )}

          <View style={styles.heroTextBlock}>
            <Text style={styles.eyebrow}>
              {"CLEAR GUIDELINES\nFOR A SAFER COMMUNITY"}
            </Text>

            <Text style={styles.headingRed}>
              Our Terms
            </Text>

            <Text style={styles.headingBlack}>
              Build Trust
            </Text>

            <View style={styles.headingUnderline} />

            <Text style={styles.heroDescription}>
              These Terms & Conditions outline the rules, responsibilities,
              and guidelines for using Mudhiraj World Matrimony.
            </Text>
          </View>
        </View>

        {/* ====================================================
            TERMS LIST
        ==================================================== */}

        <View style={styles.list}>
          {TERMS.map((item) => (
            <TermCard
              key={item.title}
              item={item}
            />
          ))}
        </View>

        {/* ====================================================
            LAST UPDATED
        ==================================================== */}

        <View style={styles.updatedBanner}>
          <View style={styles.updatedIcon}>
            <Feather
              name="info"
              size={22}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.updatedDivider} />

          <View style={styles.updatedTextBlock}>
            <Text style={styles.updatedLabel}>
              Last Updated
            </Text>

            <Text style={styles.updatedDate}>
              {LAST_UPDATED}
            </Text>
          </View>

          <Feather
            name="heart"
            size={34}
            color="#F2D56B"
            style={styles.updatedHeart}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   HERO ART
============================================================ */

function HeroArt() {
  return (
    <View
      style={styles.heroArt}
      pointerEvents="none"
    >
      {/* Yellow circle */}

      <View style={styles.artYellowCircle} />

      {/* Red heart circle */}

      <View style={styles.artRedCircle}>
        <Feather
          name="heart"
          size={64}
          color="#FFFFFF"
        />
      </View>

      {/* Top heart outline */}

      <Feather
        name="heart"
        size={54}
        color="#F2C418"
        style={styles.artHeartTop}
      />

      {/* Small top heart */}

      <Feather
        name="heart"
        size={22}
        color={RED}
        style={styles.artHeartSmallTop}
      />

      {/* Small left heart */}

      <Feather
        name="heart"
        size={20}
        color={RED}
        style={styles.artHeartSmallLeft}
      />

      {/* Flower replacement */}

      <Feather
        name="sun"
        size={34}
        color="#FFFFFF"
        style={styles.artFlower}
      />
    </View>
  );
}

/* ============================================================
   TERM CARD
============================================================ */

function TermCard({ item }) {
  const isPink = item.tone === "pink";

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.cardIcon,
          {
            backgroundColor: isPink
              ? PINK
              : YELLOW,
          },
        ]}
      >
        <Feather
          name={item.icon}
          size={28}
          color={RED}
        />
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {item.title}
        </Text>

        <Text style={styles.cardDescription}>
          {item.description}
        </Text>
      </View>

      <Feather
        name="chevron-right"
        size={22}
        color={RED}
      />
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CREAM,
  },

  scrollContent: {
    paddingBottom: 28,
  },

  /* ==========================================================
     TOP BAR
  ========================================================== */

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonSpacer: {
    width: 44,
    height: 44,
  },

  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontFamily: Fonts.display.bold,
    color: RED,
  },

  /* ==========================================================
     HERO
  ========================================================== */

  hero: {
    minHeight: 300,
    marginTop: 14,
    paddingHorizontal: 22,
    position: "relative",
  },

  heroImage: {
    position: "absolute",
    right: 0,
    top: -6,
    width: "62%",
    height: 300,
  },

  heroArt: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "46%",
    height: 300,
  },

  artYellowCircle: {
    position: "absolute",
    right: -40,
    top: 40,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#FBE27A",
  },

  artRedCircle: {
    position: "absolute",
    right: -10,
    top: 90,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },

  artHeartTop: {
    position: "absolute",
    right: 40,
    top: 8,
  },

  artHeartSmallTop: {
    position: "absolute",
    right: 6,
    top: 52,
  },

  artHeartSmallLeft: {
    position: "absolute",
    left: 6,
    top: 150,
  },

  artFlower: {
    position: "absolute",
    left: 14,
    top: 232,
    backgroundColor: "transparent",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowRadius: 3,
  },

  heroTextBlock: {
    width: "62%",
  },

  eyebrow: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: RED,
    letterSpacing: 2,
    lineHeight: 17,
    marginTop: 8,
  },

  headingRed: {
    marginTop: 6,
    fontSize: 38,
    lineHeight: 44,
    fontFamily: Fonts.display.bold,
    color: RED,
  },

  headingBlack: {
    fontSize: 38,
    lineHeight: 44,
    fontFamily: Fonts.display.bold,
    color: "#111111",
  },

  headingUnderline: {
    width: 52,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#F2C418",
    marginTop: 10,
    marginBottom: 14,
  },

  heroDescription: {
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: Fonts.body.regular,
    color: "#4A4A4A",
  },

  /* ==========================================================
     LIST
  ========================================================== */

  list: {
    paddingHorizontal: 16,
    marginTop: 4,
    gap: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#F4ECE2",

    shadowColor: "#B58A4A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 2,
  },

  cardIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  cardContent: {
    flex: 1,
    paddingRight: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: RED,
    marginBottom: 3,
  },

  cardDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: Fonts.body.regular,
    color: "#555555",
  },

  /* ==========================================================
     LAST UPDATED
  ========================================================== */

  updatedBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "#FDF0B5",
    overflow: "hidden",
  },

  updatedIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },

  updatedDivider: {
    width: 1,
    height: 40,
    backgroundColor: RED,
    marginHorizontal: 14,
    opacity: 0.6,
  },

  updatedTextBlock: {
    flex: 1,
  },

  updatedLabel: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: RED,
  },

  updatedDate: {
    marginTop: 2,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: "#555555",
  },

  updatedHeart: {
    opacity: 0.8,
  },
});