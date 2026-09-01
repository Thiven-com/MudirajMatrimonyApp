import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

// ================= MOCK DATA =================
// Replace with the plan and pricing data from your backend.
const PLAN = {
  name: "Premium Membership",
  duration: "12 Months Plan",
  badge: "Best Value",
  price: 2999,
  originalPrice: 4999,
  discountPercent: 40,
};

const PAYMENT_METHODS = [
  {
    key: "upi",
    icon: "flash-outline",
    label: "UPI",
    subtitle: "Pay using any UPI App",
    recommended: true,
  },
  {
    key: "card",
    icon: "card-outline",
    label: "Debit / Credit Cards",
    subtitle: "Visa, MasterCard, RuPay",
  },
  {
    key: "netbanking",
    icon: "business-outline",
    label: "Net Banking",
    subtitle: "All major banks supported",
  },
  {
    key: "wallet",
    icon: "wallet-outline",
    label: "Wallets",
    subtitle: "PhonePe, Paytm, Amazon Pay & more",
  },
  {
    key: "emi",
    icon: "calendar-outline",
    label: "EMI / Pay Later",
    subtitle: "Pay in easy installments",
  },
];

const TRUST_BADGES = [
  {
    icon: "shield-checkmark-outline",
    title: "100% Secure",
    subtitle: "Your payments are safe with us",
  },
  {
    icon: "ribbon-outline",
    title: "Trusted by Thousands",
    subtitle: "Join 1L+ happy Mudhiraj families",
  },
  {
    icon: "headset-outline",
    title: "24/7 Support",
    subtitle: "We're here to help you anytime",
  },
];

const discountAmount = PLAN.originalPrice - PLAN.price;

export default function PaymentScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("upi");

  const handlePay = () => {
    // TODO: kick off payment for `selectedMethod`
    console.log("Paying with", selectedMethod);
    router.push("/payment-history");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>
            Secure &amp; Safe Transactions
          </Text>
        </View>

        <View style={styles.headerSecureBlock}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={Colors.white}
          />
          <Text style={styles.headerSecureText}>100% Secure{"\n"}Payment</Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= PLAN CARD ================= */}
        <View style={styles.planCard}>
          <View style={styles.planIconCircle}>
            <Ionicons name="ribbon" size={26} color={Colors.white} />
          </View>

          <View style={styles.planTextBlock}>
            <Text style={styles.planName}>{PLAN.name}</Text>
            <View style={styles.planMetaRow}>
              <Text style={styles.planDuration}>{PLAN.duration}</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{PLAN.badge}</Text>
              </View>
            </View>
          </View>

          <View style={styles.planPriceBlock}>
            <Text style={styles.planPrice}>
              ₹ {PLAN.price.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.planOriginalPrice}>
              ₹ {PLAN.originalPrice.toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.planDiscountBlock}>
            <Text style={styles.planDiscountPercent}>
              {PLAN.discountPercent}%
            </Text>
            <Text style={styles.planDiscountLabel}>OFF</Text>
          </View>
        </View>

        {/* ================= PAYMENT METHODS ================= */}
        <Text style={styles.sectionHeading}>Select Payment Method</Text>

        <View style={styles.methodsList}>
          {PAYMENT_METHODS.map((method) => (
            <PaymentMethodRow
              key={method.key}
              method={method}
              selected={selectedMethod === method.key}
              onSelect={() => setSelectedMethod(method.key)}
            />
          ))}
        </View>

        {/* ================= ORDER SUMMARY ================= */}
        <Text style={styles.sectionHeading}>Order Summary</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan</Text>
            <Text style={styles.summaryValue}>
              12 Months Premium Membership
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Original Price</Text>
            <Text style={styles.summaryStrikeValue}>
              ₹ {PLAN.originalPrice.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryDiscountLabel}>
              Discount ({PLAN.discountPercent}%)
            </Text>
            <Text style={styles.summaryDiscountValue}>
              - ₹ {discountAmount.toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
            <Text style={styles.summaryTotalValue}>
              ₹ {PLAN.price.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* ================= TRUST BADGES ================= */}
        <View style={styles.trustBanner}>
          {TRUST_BADGES.map((badge) => (
            <View key={badge.title} style={styles.trustItem}>
              <Ionicons name={badge.icon} size={20} color={Colors.primaryRed} />
              <Text style={styles.trustTitle}>{badge.title}</Text>
              <Text style={styles.trustSubtitle}>{badge.subtitle}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ================= STICKY PAY FOOTER ================= */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payButton}
          activeOpacity={0.85}
          onPress={handlePay}
        >
          <Ionicons name="lock-closed" size={18} color={Colors.white} />
          <Text style={styles.payButtonText}>
            Pay ₹ {PLAN.price.toLocaleString("en-IN")} Securely
          </Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.termsRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={13}
            color={Colors.primaryRed}
          />
          <Text style={styles.termsText}>
            {" "}
            By proceeding, you agree to our{" "}
            <Text style={styles.termsLink}>
              Terms &amp; Conditions
            </Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function PaymentMethodRow({ method, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.methodRow, selected && styles.methodRowSelected]}
      activeOpacity={0.8}
      onPress={onSelect}
    >
      <View style={styles.methodIconCircle}>
        <Ionicons name={method.icon} size={20} color={Colors.primaryRed} />
      </View>

      <View style={styles.methodTextBlock}>
        <Text style={styles.methodLabel}>{method.label}</Text>
        <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
      </View>

      {method.recommended && (
        <View style={styles.recommendedPill}>
          <Text style={styles.recommendedPillText}>Recommended</Text>
        </View>
      )}

      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },

  /* ===== HEADER ===== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  headerTitleBlock: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: "#FCE4D6",
    marginTop: 2,
  },
  headerSecureBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSecureText: {
    fontSize: 11,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
    marginLeft: 6,
    lineHeight: 15,
  },

  /* ===== PLAN CARD ===== */
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3E7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 22,
    overflow: "hidden",
  },
  planIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planTextBlock: {
    flex: 1,
  },
  planName: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  planMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  planDuration: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  planBadge: {
    backgroundColor: "#FCE9A8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planBadgeText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: "#7A5B00",
  },
  planPriceBlock: {
    alignItems: "flex-end",
    marginRight: 12,
  },
  planPrice: {
    fontSize: 16,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  planOriginalPrice: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  planDiscountBlock: {
    backgroundColor: "#FFCC00",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: "stretch",
  },
  planDiscountPercent: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  planDiscountLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== SECTION HEADING ===== */
  sectionHeading: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  /* ===== PAYMENT METHODS ===== */
  methodsList: {
    marginBottom: 22,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  methodRowSelected: {
    borderColor: Colors.primaryRed,
    backgroundColor: "#FDF3E7",
  },
  methodIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FCE4D6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  methodTextBlock: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 14,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  methodSubtitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  recommendedPill: {
    backgroundColor: "#DCF3E3",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  recommendedPillText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: "#1F7A3D",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: Colors.primaryRed,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primaryRed,
  },

  /* ===== ORDER SUMMARY ===== */
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  summaryStrikeValue: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  summaryDiscountLabel: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: "#1F7A3D",
  },
  summaryDiscountValue: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: "#1F7A3D",
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderStyle: "dashed",
    marginVertical: 6,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  summaryTotalValue: {
    fontSize: 17,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },

  /* ===== TRUST BANNER ===== */
  trustBanner: {
    flexDirection: "row",
    backgroundColor: "#FDF3E7",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  trustItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  trustTitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginTop: 6,
    textAlign: "center",
  },
  trustSubtitle: {
    fontSize: 10,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },

  /* ===== STICKY FOOTER ===== */
  footer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 26,
    height: 52,
  },
  payButtonText: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
    marginHorizontal: 10,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingHorizontal: 12,
  },
  termsText: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "center",
  },
  termsLink: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.bold,
  },
});
