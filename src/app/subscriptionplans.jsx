import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const LOGO = require("../../assets/images/logo.png");

// Top feature strip shown under the title.
const TOP_FEATURES = [
  {
    icon: "shield-checkmark-outline",
    title: "Contact Details",
    desc: "View unlimited contacts",
  },
  {
    icon: "chatbubble-ellipses-outline",
    title: "Chat Unlimited",
    desc: "Chat without any restrictions",
  },
  {
    icon: "eye-outline",
    title: "Profile Boost",
    desc: "Increase your profile visibility",
  },
  {
    icon: "ribbon-outline",
    title: "Premium Badge",
    desc: "Stand out with premium badge",
  },
];

// `popular` drives the "Most Popular" ribbon on a single plan.
const PLANS = [
  {
    id: "12m",
    name: "12 Months",
    tag: "Best Value",
    desc: "Access all Premium features",
    save: "Save 60%",
    price: "\u20B9 2,999",
    original: "\u20B97,488 /12 Months",
    perMonth: "\u20B9 250 / Month",
    popular: true,
  },
  {
    id: "6m",
    name: "6 Months",
    tag: "Great Savings",
    desc: "Access all Premium features",
    save: "Save 40%",
    price: "\u20B9 1,999",
    original: "\u20B93,744 /6 Months",
    perMonth: "\u20B9 333 / Month",
    popular: false,
  },
  {
    id: "3m",
    name: "3 Months",
    tag: "Good Start",
    desc: "Access all Premium features",
    save: "Save 20%",
    price: "\u20B9 999",
    original: "\u20B91,872 /3 Months",
    perMonth: "\u20B9 333 / Month",
    popular: false,
  },
];

// `free` is a label, or `false` to render a cross instead.
const TABLE_ROWS = [
  { icon: "person-outline", label: "View Contact Details", free: "Limited" },
  { icon: "chatbubble-outline", label: "Chat with Matches", free: "Limited" },
  { icon: "eye-outline", label: "Profile Visibility", free: "Normal" },
  { icon: "star-outline", label: "Send Interest", free: "Limited" },
  { icon: "ribbon-outline", label: "Premium Badge", free: false },
  { icon: "headset-outline", label: "Priority Customer Support", free: false },
];

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState("12m");

  const handleUpgrade = () => {
    // Wire this up to your checkout flow, e.g.:
    // router.push(`/checkout?plan=${selectedPlan}`);
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= TOP BAR ================= */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={26} color={Colors.primaryRed} />
          </TouchableOpacity>
          <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
        </View>

        {/* ================= TITLE ================= */}
        <View style={styles.titleRow}>
          <View style={styles.titleIconCircle}>
            <FontAwesome5 name="crown" size={19} color={Colors.gold} />
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.titleText}>Choose Your Plan</Text>
            <Text style={styles.subtitleText}>
              Go Premium & get the best matchmaking experience
            </Text>
          </View>
        </View>

        {/* ================= TOP FEATURES ================= */}
        <View style={styles.featuresBar}>
          {TOP_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.featureIconCircle}>
                <Ionicons name={f.icon} size={18} color={Colors.primaryRed} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* ================= PLANS HEADING ================= */}
        <View style={styles.sectionHeadingRow}>
          <Ionicons name="sparkles" size={17} color={Colors.primaryRed} />
          <Text style={styles.sectionHeading}>Premium Plans</Text>
        </View>

        {/* ================= PLAN CARDS ================= */}
        <View style={styles.planList}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onPress={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>

        {/* ================= FEATURES TABLE ================= */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderText, styles.tableColFeature]}>
              Features
            </Text>
            <Text
              style={[
                styles.tableHeaderText,
                styles.tableColValue,
                { color: Colors.textMuted },
              ]}
            >
              Free
            </Text>
            <Text
              style={[
                styles.tableHeaderText,
                styles.tableColValue,
                { color: Colors.primaryRed },
              ]}
            >
              Premium
            </Text>
          </View>

          {TABLE_ROWS.map((row, i) => (
            <View
              key={row.label}
              style={[
                styles.tableRow,
                i === TABLE_ROWS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.tableColFeature, styles.tableFeatureCell]}>
                <View style={styles.tableRowIconCircle}>
                  <Ionicons name={row.icon} size={13} color={Colors.gold} />
                </View>
                <Text style={styles.tableFeatureLabel}>{row.label}</Text>
              </View>

              <View style={styles.tableColValue}>
                {row.free === false ? (
                  <Ionicons name="close" size={16} color={Colors.primaryRed} />
                ) : (
                  <Text style={styles.tableFreeText}>{row.free}</Text>
                )}
              </View>

              <View style={styles.tableColValue}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={Colors.success}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ================= SECURE PAYMENTS ================= */}
        <View style={styles.secureBox}>
          <View style={styles.secureIconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={Colors.primaryRed}
            />
          </View>
          <View style={styles.secureTextBlock}>
            <Text style={styles.secureTitle}>Safe & Secure Payments</Text>
            <Text style={styles.secureSubtitle}>
              Your payment details are 100% secure with us.
            </Text>
          </View>
        </View>

        {/* ================= CTA ================= */}
        <TouchableOpacity
          style={styles.upgradeButton}
          activeOpacity={0.85}
          onPress={handleUpgrade}
        >
          <FontAwesome5 name="crown" size={15} color={Colors.white} />
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          <Ionicons name="chevron-forward" size={17} color={Colors.white} />
        </TouchableOpacity>

        {/* ================= GUARANTEE ================= */}
        <View style={styles.guaranteeRow}>
          <View style={styles.guaranteeDot}>
            <Ionicons name="checkmark" size={11} color={Colors.white} />
          </View>
          <Text style={styles.guaranteeText}>7-Day Money Back Guarantee</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function PlanCard({ plan, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.planCard, selected && styles.planCardSelected]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}

      <View style={styles.radioOuter}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      </View>

      <View style={styles.planInfo}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planTag}>{plan.tag}</Text>
        <Text style={styles.planDesc}>{plan.desc}</Text>
      </View>

      <View style={styles.planPriceBlock}>
        <View style={styles.saveBadge}>
          <Text style={styles.saveBadgeText}>{plan.save}</Text>
        </View>
        <Text style={styles.planPrice}>{plan.price}</Text>
        <Text style={styles.planPriceOriginal}>{plan.original}</Text>
        <View style={styles.pricePerMonth}>
          <Text style={styles.pricePerMonthText}>{plan.perMonth}</Text>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  /* ===== TOP BAR ===== */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  /* ===== TITLE ===== */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  titleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FDF3D8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  titleTextBlock: {
    flex: 1,
  },
  titleText: {
    fontSize: FontSizes.welcome + 2,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRedDark,
  },
  subtitleText: {
    fontSize: FontSizes.subtitle + 1,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 4,
  },

  /* ===== TOP FEATURES ===== */
  featuresBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  featureItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 3,
  },
  featureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FDF3D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 9,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 12,
  },

  /* ===== SECTION HEADING ===== */
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },

  /* ===== PLAN CARDS ===== */
  planList: {
    marginBottom: 26,
  },
  planCard: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    backgroundColor: Colors.cardBackground,
  },
  planCardSelected: {
    borderColor: Colors.primaryRed,
    backgroundColor: "#FDEAE0",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 14,
    backgroundColor: Colors.primaryRed,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    zIndex: 2,
  },
  popularBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  radioOuter: {
    marginTop: 4,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.primaryRed,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryRed,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  planTag: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.success,
    marginTop: 2,
  },
  planDesc: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  planPriceBlock: {
    alignItems: "flex-end",
  },
  saveBadge: {
    backgroundColor: Colors.success,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  saveBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  planPrice: {
    fontSize: 18,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  planPriceOriginal: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  pricePerMonth: {
    backgroundColor: "#FDF3D8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  pricePerMonthText: {
    fontSize: 10,
    fontFamily: Fonts.body.medium,
    color: Colors.gold,
  },

  /* ===== FEATURES TABLE ===== */
  tableCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 22,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#FDF3D8",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  tableColFeature: {
    flex: 1.6,
  },
  tableColValue: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  tableFeatureCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableRowIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FDF3D8",
    alignItems: "center",
    justifyContent: "center",
  },
  tableFeatureLabel: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  tableFreeText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },

  /* ===== SECURE PAYMENTS ===== */
  secureBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 22,
  },
  secureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FDF3D8",
    alignItems: "center",
    justifyContent: "center",
  },
  secureTextBlock: {
    flex: 1,
  },
  secureTitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  secureSubtitle: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },

  /* ===== CTA ===== */
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 16,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  /* ===== GUARANTEE ===== */
  guaranteeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  guaranteeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  guaranteeText: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
});
