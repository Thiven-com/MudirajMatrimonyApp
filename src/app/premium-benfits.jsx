import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const BENEFITS = [
  {
    icon: "eye-outline",
    title: "View Contact Details",
    description: "View phone number & email of interested matches",
    tag: "Connect directly with interested matches",
  },
  {
    icon: "chatbubble-ellipses-outline",
    title: "Send Unlimited Interests",
    description: "Express interest to as many profiles as you want",
    tag: "No limits, more chances of finding the one",
  },
  {
    icon: "search-outline",
    title: "Advanced Search Filters",
    description: "Search by community, location, profession & more",
    tag: "Find matches that truly match your preferences",
  },
  {
    icon: "person-outline",
    title: "Profile Highlight",
    description: "Stand out in search results and get more visibility",
    tag: "Your profile will be shown at the top",
  },
  {
    icon: "people-outline",
    title: "See Who Viewed You",
    description: "Know who visited your profile and interested in you",
    tag: "Stay informed and respond better",
  },
  {
    icon: "chatbox-ellipses-outline",
    title: "Priority Customer Support",
    description: "Get quick help from our dedicated support team",
    tag: "We're here to help you anytime",
  },
];

const PLANS = [
  {
    key: "3m",
    duration: "3 Months",
    price: "₹ 999",
    strikePrice: "₹ 1,499",
    save: "Save 33%",
    mostPopular: false,
  },
  {
    key: "12m",
    duration: "12 Months",
    price: "₹ 2,999",
    strikePrice: "₹ 4,999",
    save: "Save 40%",
    mostPopular: true,
  },
  {
    key: "6m",
    duration: "6 Months",
    price: "₹ 1,799",
    strikePrice: "₹ 2,499",
    save: "Save 28%",
    mostPopular: false,
  },
];

const TRUST_BADGES = [
  {
    icon: "shield-checkmark-outline",
    title: "100% Safe & Secure",
    description: "Your privacy is our top priority",
  },
  {
    icon: "ribbon-outline",
    title: "Trusted by Thousands",
    description: "Join 10,000+ happy Mudhiraj families",
  },
  {
    icon: "lock-closed-outline",
    title: "Secure Payments",
    description: "Your payments are safe with us",
  },
  {
    icon: "headset-outline",
    title: "24/7 Support",
    description: "We're here to help you anytime",
  },
];

export default function PremiumBenefitsScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("12m");

  const handleUpgrade = () => {
    console.log("Upgrading with plan:", selectedPlan);
    // TODO: kick off your payment flow here
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <LinearGradient colors={Colors.gradientHeader} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Premium Benefits</Text>
          <Text style={styles.headerSubtitle}>
            Upgrade to Premium & get the best matchmaking experience
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HERO CARD ================= */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIconWrapper}>
              <View style={styles.heroShield}>
                <Ionicons name="ribbon" size={28} color={Colors.primaryRed} />
              </View>
              <Ionicons
                name="sparkles"
                size={14}
                color={Colors.gold}
                style={styles.sparkleTopLeft}
              />
              <Ionicons
                name="sparkles"
                size={10}
                color={Colors.gold}
                style={styles.sparkleBottomRight}
              />
            </View>

            <Text style={styles.heroLine1}>Go Premium &</Text>
            <Text style={styles.heroLine2}>
              Find Your Perfect Match Faster!
            </Text>
            <Text style={styles.heroDescription}>
              Get exclusive features and stand out to connect with the right
              matches.
            </Text>
          </View>

          <TrustMedal />
        </View>

        {/* ================= ALL PREMIUM BENEFITS ================= */}
        <View style={styles.sectionHeadingRow}>
          <View style={styles.sectionHeadingIcon}>
            <Ionicons name="star" size={13} color={Colors.white} />
          </View>
          <Text style={styles.sectionHeading}>All Premium Benefits</Text>
        </View>

        <View style={styles.benefitsCard}>
          {BENEFITS.map((benefit, index) => (
            <View
              key={benefit.title}
              style={[
                styles.benefitRow,
                index === BENEFITS.length - 1 && styles.benefitRowLast,
              ]}
            >
              <View style={styles.benefitIconCircle}>
                <Ionicons
                  name={benefit.icon}
                  size={19}
                  color={Colors.primaryRed}
                />
              </View>

              <View style={styles.benefitTextBlock}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              </View>

              <View style={styles.benefitTagBox}>
                <Text style={styles.benefitTagText}>{benefit.tag}</Text>
              </View>

              <View style={styles.benefitCheckCircle}>
                <Ionicons name="checkmark" size={15} color={Colors.white} />
              </View>
            </View>
          ))}
        </View>

        {/* ================= CHOOSE YOUR PLAN ================= */}
        <View style={styles.sectionHeadingRow}>
          <Ionicons name="pricetag" size={17} color={Colors.primaryRed} />
          <Text style={styles.sectionHeading}>Choose Your Premium Plan</Text>
        </View>

        <View style={styles.plansRow}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              isSelected={selectedPlan === plan.key}
              onSelect={() => setSelectedPlan(plan.key)}
            />
          ))}
        </View>

        {/* ================= TRUST BADGES ================= */}
        <View style={styles.trustBadgesCard}>
          {TRUST_BADGES.map((badge) => (
            <View key={badge.title} style={styles.trustBadgeItem}>
              <View style={styles.trustBadgeIconCircle}>
                <Ionicons
                  name={badge.icon}
                  size={17}
                  color={Colors.primaryRed}
                />
              </View>
              <View style={styles.trustBadgeTextBlock}>
                <Text style={styles.trustBadgeTitle}>{badge.title}</Text>
                <Text style={styles.trustBadgeDescription}>
                  {badge.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ================= UPGRADE BUTTON ================= */}
        <TouchableOpacity
          style={styles.upgradeButtonTouchable}
          activeOpacity={0.85}
          onPress={handleUpgrade}
        >
          <Svg width="100%" height={56} style={StyleSheet.absoluteFillObject}>
            <Defs>
              <SvgGradient
                id="premiumBenefitsBtnGrad"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <Stop offset="0" stopColor={Colors.primaryRed} />
                <Stop offset="1" stopColor={Colors.primaryRedDark} />
              </SvgGradient>
            </Defs>
            <Path
              d="M14,0 H1000 V56 H14 A14,14 0 0 1 0,42 V14 A14,14 0 0 1 14,0 Z"
              fill="url(#premiumBenefitsBtnGrad)"
            />
          </Svg>
          <View style={styles.upgradeButtonContent}>
            <Text style={styles.upgradeButtonText}>
              Upgrade Now & Get Premium Benefits
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={Colors.white}
              style={{ marginLeft: 8 }}
            />
          </View>
        </TouchableOpacity>

        {/* ================= FOOTER ================= */}
        <View style={styles.footerRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={13}
            color={Colors.textMuted}
          />
          <Text style={styles.footerText}>
            You can cancel or change your plan anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= TRUST MEDAL =================
function TrustMedal() {
  return (
    <View style={styles.medalWrapper}>
      <View style={styles.medalCircle}>
        <Text style={styles.medalTrustedBy}>TRUSTED BY</Text>
        <Text style={styles.medalNumber}>10,000+</Text>
        <Text style={styles.medalFamilies}>MUDHIRAJ{"\n"}FAMILIES</Text>
      </View>
      <View style={styles.medalRibbons}>
        <View
          style={[
            styles.medalRibbon,
            { transform: [{ rotate: "-18deg" }], marginRight: -6 },
          ]}
        />
        <View
          style={[
            styles.medalRibbon,
            { transform: [{ rotate: "18deg" }], marginLeft: -6 },
          ]}
        />
      </View>
    </View>
  );
}

// ================= PLAN CARD =================
function PlanCard({ plan, isSelected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.planCardSelected]}
      activeOpacity={0.9}
      onPress={onSelect}
    >
      {plan.mostPopular && (
        <View style={styles.mostPopularBadge}>
          <Text style={styles.mostPopularText}>MOST POPULAR</Text>
        </View>
      )}

      <Text style={styles.planDuration}>{plan.duration}</Text>
      <Text style={styles.planLabel}>Plan</Text>
      <Text style={styles.planPrice}>{plan.price}</Text>
      <Text style={styles.planStrikePrice}>{plan.strikePrice}</Text>

      <View style={[styles.saveButton, isSelected && styles.saveButtonFilled]}>
        <Text
          style={[
            styles.saveButtonText,
            isSelected && styles.saveButtonTextFilled,
          ]}
        >
          {plan.save}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },

  /* ===== HEADER ===== */
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 4 : 14,
    paddingBottom: 18,
    gap: 14,
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.title,
    fontFamily: Fonts.display.extraBold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.goldLight,
    marginTop: 4,
  },

  /* ===== HERO CARD ===== */
  heroCard: {
    flexDirection: "row",
    backgroundColor: "#FFF9E8",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F0DFA3",
    padding: 18,
    marginTop: -20,
    marginBottom: 22,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  heroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  heroIconWrapper: {
    marginBottom: 10,
    position: "relative",
    width: 54,
  },
  heroShield: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FDF3D8",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkleTopLeft: {
    position: "absolute",
    top: -6,
    left: -6,
  },
  sparkleBottomRight: {
    position: "absolute",
    bottom: -4,
    right: -4,
  },
  heroLine1: {
    fontSize: 19,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  heroLine2: {
    fontSize: 19,
    fontFamily: Fonts.display.extraBold,
    color: Colors.textPrimary,
    marginTop: 1,
  },
  heroDescription: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },

  /* ===== TRUST MEDAL ===== */
  medalWrapper: {
    width: 92,
    alignItems: "center",
  },
  medalCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.gold,
    borderWidth: 3,
    borderColor: Colors.goldLight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  medalTrustedBy: {
    fontSize: 6.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRedDark,
    letterSpacing: 0.5,
  },
  medalNumber: {
    fontSize: 14,
    fontFamily: Fonts.display.extraBold,
    color: Colors.primaryRedDark,
    marginTop: 1,
  },
  medalFamilies: {
    fontSize: 6.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRedDark,
    textAlign: "center",
    marginTop: 1,
    lineHeight: 8,
  },
  medalRibbons: {
    flexDirection: "row",
    marginTop: -6,
  },
  medalRibbon: {
    width: 16,
    height: 26,
    backgroundColor: Colors.primaryRed,
  },

  /* ===== SECTION HEADINGS ===== */
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionHeadingIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeading: {
    fontSize: FontSizes.welcome - 3,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },

  /* ===== BENEFITS ===== */
  benefitsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 22,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  benefitRowLast: {
    borderBottomWidth: 0,
  },
  benefitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FDF3D8",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitTextBlock: {
    flex: 1.1,
  },
  benefitTitle: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  benefitDescription: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  benefitTagBox: {
    flex: 1,
    backgroundColor: "#FDEAE0",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  benefitTagText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.medium,
    color: Colors.primaryRed,
    lineHeight: 14,
  },
  benefitCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ===== PLANS ===== */
  plansRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  planCard: {
    flex: 1,
    borderWidth: 1.3,
    borderColor: Colors.border,
    borderRadius: 14,
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 8,
    backgroundColor: Colors.cardBackground,
    position: "relative",
  },
  planCardSelected: {
    borderColor: Colors.primaryRed,
  },
  mostPopularBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: Colors.gold,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  mostPopularText: {
    fontSize: 8.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  planDuration: {
    fontSize: 16,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginTop: 6,
  },
  planLabel: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 6,
  },
  planPrice: {
    fontSize: 19,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  planStrikePrice: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textDecorationLine: "line-through",
    marginTop: 1,
    marginBottom: 10,
  },
  saveButton: {
    borderWidth: 1.3,
    borderColor: Colors.primaryRed,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonFilled: {
    backgroundColor: Colors.primaryRed,
  },
  saveButtonText: {
    fontSize: 11,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  saveButtonTextFilled: {
    color: Colors.white,
  },

  /* ===== TRUST BADGES ===== */
  trustBadgesCard: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#FDF3D8",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  trustBadgeItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingRight: 6,
    gap: 8,
  },
  trustBadgeIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  trustBadgeTextBlock: {
    flex: 1,
  },
  trustBadgeTitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  trustBadgeDescription: {
    fontSize: 10,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 1,
    lineHeight: 13,
  },

  /* ===== UPGRADE BUTTON ===== */
  upgradeButtonTouchable: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: Colors.primaryRedDark,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 14,
  },
  upgradeButtonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.body.bold,
    textAlign: "center",
  },

  /* ===== FOOTER ===== */
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
});
