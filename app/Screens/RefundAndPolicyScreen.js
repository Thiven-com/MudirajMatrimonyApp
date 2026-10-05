import React from "react";

import {
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

const CREAM = "#FFFBF2";
const YELLOW = "#FDEFB2";
const PINK = "#FCE3E3";
const GOLD = "#F2C418";
const RED = Colors.primaryRed || "#C91E26";

/*
  Feather icon mapping from original Ionicons:

  document-text-outline -> file-text
  card                  -> credit-card
  time-outline          -> clock
  rupee                 -> custom ₹ icon
  close-circle-outline  -> x-circle
  warning               -> alert-triangle
  headset-outline       -> headset
  information           -> info
  heart-outline         -> heart
  arrow-back             -> arrow-left
  leaf                  -> feather
  refresh                -> refresh-cw
  shield                 -> shield
  checkmark              -> check
  chevron-forward        -> chevron-right
  flower                 -> sun
*/

const POLICIES = [
  {
    icon: "file-text",
    tone: "pink",
    title: "Eligibility for Refund",
    description:
      "Refunds are applicable under specific conditions as mentioned in this policy.",
  },
  {
    icon: "credit-card",
    tone: "yellow",
    title: "Non-Refundable Services",
    description:
      "Certain payments such as profile creation fees, verification charges, or consumed services are non-refundable.",
  },
  {
    icon: "clock",
    tone: "pink",
    title: "Refund Request Timeline",
    description:
      "Refund requests must be raised within the specified time period from the date of purchase.",
  },
  {
    icon: "rupee",
    tone: "yellow",
    title: "Refund Process",
    description:
      "Approved refunds will be processed to the original payment method within 7–10 working days.",
  },
  {
    icon: "x-circle",
    tone: "pink",
    title: "Cancellation by User",
    description:
      "If you choose to cancel a plan, refunds will be provided as per the terms of the selected package.",
  },
  {
    icon: "alert-triangle",
    tone: "yellow",
    title: "Exceptions",
    description:
      "Refunds may not be provided in cases of policy violations, misuse, or fraudulent activities.",
  },
  {
    icon: "headphones",
    tone: "pink",
    title: "Need Help?",
    description:
      "If you have any questions about refunds, feel free to contact our support team.",
  },
];

const LAST_UPDATED = "August 20, 2025";

/* ============================================================
   MAIN SCREEN
============================================================ */

export default function RefundPolicy({ navigation }) {
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
        {/* TOP BAR */}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => {
              if (navigation?.canGoBack?.()) {
                navigation.goBack();
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
            Refund Policy
          </Text>

          {/* Spacer keeps title centred */}

          <View style={styles.backButtonSpacer} />
        </View>

        {/* HERO */}

        <View style={styles.hero}>
          <HeroArt />

          <View style={styles.heroTextBlock}>
            <Text style={styles.eyebrow}>
              {"TRANSPARENT POLICIES\nFOR YOUR TRUST"}
            </Text>

            <Text style={styles.headingRed}>
              Our Refund
            </Text>

            <Text style={styles.headingBlack}>
              Policy
            </Text>

            <View style={styles.headingUnderline} />

            <Text style={styles.heroDescription}>
              We believe in complete transparency. This Refund Policy explains
              when and how refunds are processed for Mudhiraj World Matrimony
              services.
            </Text>
          </View>
        </View>

        {/* POLICY LIST */}

        <View style={styles.list}>
          {POLICIES.map((item) => (
            <PolicyCard
              key={item.title}
              item={item}
            />
          ))}
        </View>

        {/* LAST UPDATED */}

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
            color={GOLD}
            style={styles.updatedHeart}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   HERO ARTWORK
   Drawn completely with Views and icons.
   No image file required.
============================================================ */

function HeroArt() {
  return (
    <View
      style={styles.heroArt}
      pointerEvents="none"
    >
      {/* Yellow backdrop */}

      <View style={styles.artYellowCircle} />

      {/* Leaves + hearts */}

      <Feather
        name="feather"
        size={44}
        color="#E9C75A"
        style={styles.artLeafTop}
      />

      <Feather
        name="heart"
        size={24}
        color={RED}
        style={styles.artHeartTop}
      />

      <Feather
        name="heart"
        size={18}
        color={RED}
        style={styles.artHeartRight}
      />

      <Feather
        name="heart"
        size={22}
        color={RED}
        style={styles.artHeartBottom}
      />

      {/* Calendar */}

      <View style={styles.artCalendar}>
        <Feather
          name="check"
          size={26}
          color={RED}
        />
      </View>

      {/* Phone */}

      <View style={styles.artPhone}>
        <Feather
          name="refresh-cw"
          size={92}
          color={RED}
          style={styles.artRefresh}
        />

        <View style={styles.artRupeeCoin}>
          <Text style={styles.artRupeeText}>
            ₹
          </Text>
        </View>
      </View>

      {/* Coins */}

      <View style={styles.artCoins}>
        <View
          style={[
            styles.artCoin,
            {
              bottom: 0,
              left: 0,
            },
          ]}
        />

        <View
          style={[
            styles.artCoin,
            {
              bottom: 10,
              left: 0,
            },
          ]}
        />

        <View
          style={[
            styles.artCoin,
            {
              bottom: 20,
              left: 0,
            },
          ]}
        />

        <View
          style={[
            styles.artCoin,
            {
              bottom: 0,
              left: 36,
            },
          ]}
        />

        <View
          style={[
            styles.artCoin,
            {
              bottom: 10,
              left: 36,
            },
          ]}
        />
      </View>

      {/* Shield */}

      <View style={styles.artShield}>
        <Feather
          name="shield"
          size={74}
          color={RED}
        />

        <Feather
          name="check"
          size={34}
          color="#FFFFFF"
          style={styles.artShieldCheck}
        />
      </View>

      {/* Flower */}

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
   POLICY CARD
============================================================ */

function PolicyCard({ item }) {
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
        {item.icon === "rupee" ? (
          <View style={styles.rupeeRing}>
            <Text style={styles.rupeeRingText}>
              ₹
            </Text>
          </View>
        ) : (
          <Feather
            name={item.icon}
            size={28}
            color={RED}
          />
        )}
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

  /* ---------- TOP BAR ---------- */

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

  /* ---------- HERO ---------- */

  hero: {
    minHeight: 300,
    marginTop: 14,
    paddingHorizontal: 22,
    position: "relative",
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
    backgroundColor: GOLD,
    marginTop: 10,
    marginBottom: 14,
  },

  heroDescription: {
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: Fonts.body.regular,
    color: "#4A4A4A",
  },

  /* ---------- HERO ART ---------- */

  heroArt: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "50%",
    height: 300,
  },

  artYellowCircle: {
    position: "absolute",
    right: -50,
    top: 70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#FBE27A",
  },

  artLeafTop: {
    position: "absolute",
    right: 14,
    top: 2,
  },

  artHeartTop: {
    position: "absolute",
    left: 30,
    top: 18,
  },

  artHeartRight: {
    position: "absolute",
    right: 4,
    top: 150,
  },

  artHeartBottom: {
    position: "absolute",
    left: 24,
    top: 232,
  },

  artCalendar: {
    position: "absolute",
    left: 6,
    top: 124,
    width: 62,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 12,
    borderTopColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },

  artPhone: {
    position: "absolute",
    right: 30,
    top: 46,
    width: 130,
    height: 190,
    borderRadius: 22,
    borderWidth: 7,
    borderColor: RED,
    backgroundColor: "#FFF7EC",
    alignItems: "center",
    justifyContent: "center",
  },

  artRefresh: {
    position: "absolute",
  },

  artRupeeCoin: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F8C21A",
    alignItems: "center",
    justifyContent: "center",
  },

  artRupeeText: {
    fontSize: 28,
    fontFamily: Fonts.body.bold,
    color: RED,
  },

  artCoins: {
    position: "absolute",
    left: 40,
    top: 232,
    width: 100,
    height: 50,
  },

  artCoin: {
    position: "absolute",
    width: 58,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F8C21A",
    borderWidth: 1.5,
    borderColor: "#D9A30F",
  },

  artShield: {
    position: "absolute",
    right: 4,
    top: 190,
    alignItems: "center",
    justifyContent: "center",
  },

  artShieldCheck: {
    position: "absolute",
  },

  artFlower: {
    position: "absolute",
    right: 0,
    top: 262,
  },

  /* ---------- LIST ---------- */

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

  rupeeRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: RED,
    alignItems: "center",
    justifyContent: "center",
  },

  rupeeRingText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: Fonts.body.bold,
    color: RED,
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

  /* ---------- LAST UPDATED ---------- */

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