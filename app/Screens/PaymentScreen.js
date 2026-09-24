import { useCallback, useState } from "react";

import {
  BackHandler,
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

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Colors } from "../constants/colors";
import Fonts from "../constants/Fonts";

/* =========================================================
   PLAN DATA
========================================================= */

const PLAN = {
  name: "Premium Membership",
  duration: "12 Months Plan",
  badge: "Best Value",
  price: 2999,
  originalPrice: 4999,
  discountPercent: 40,
};

/* =========================================================
   PAYMENT METHODS
========================================================= */

const PAYMENT_METHODS = [
  {
    key: "upi",
    icon: "zap",
    label: "UPI",
    subtitle: "Pay using any UPI App",
    recommended: true,
  },

  {
    key: "card",
    icon: "credit-card",
    label: "Debit / Credit Cards",
    subtitle: "Visa, MasterCard, RuPay",
  },

  {
    key: "netbanking",
    icon: "briefcase",
    label: "Net Banking",
    subtitle: "All major banks supported",
  },

  {
    key: "wallet",
    icon: "wallet",
    label: "Wallets",
    subtitle: "PhonePe, Paytm, Amazon Pay & more",
  },

  {
    key: "emi",
    icon: "calendar",
    label: "EMI / Pay Later",
    subtitle: "Pay in easy installments",
  },
];

/* =========================================================
   TRUST BADGES
========================================================= */

const TRUST_BADGES = [
  {
    icon: "shield",
    title: "100% Secure",
    subtitle: "Your payments are safe with us",
  },

  {
    icon: "award",
    title: "Trusted by Thousands",
    subtitle: "Join 1L+ happy Mudhiraj families",
  },

  {
    icon: "headphones",
    title: "24/7 Support",
    subtitle: "We're here to help you anytime",
  },
];

const discountAmount = PLAN.originalPrice - PLAN.price;

/* =========================================================
   PAYMENT SCREEN
========================================================= */

export default function PaymentScreen() {
  const navigation = useNavigation();

  const [selectedMethod, setSelectedMethod] = useState("upi");

  /* =======================================================
     BACK HANDLER
  ======================================================= */

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  /* =======================================================
     ANDROID HARDWARE BACK
  ======================================================= */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();

        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => {
        subscription.remove();
      };
    }, [handleBack]),
  );

  /* =======================================================
     PAYMENT
  ======================================================= */

  const handlePay = () => {
    console.log("Paying with:", selectedMethod);

    console.log("Selected plan:", PLAN);

    /*
      TODO:
      Connect your actual payment API
      here.

      Example:

      navigation.navigate("PaymentGateway", {
        paymentMethod: selectedMethod,
        amount: PLAN.price,
      });
    */
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryRed} />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <LinearGradient
        colors={Colors.gradientLogo}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 0,
        }}
        style={styles.header}
      >
        {/* BACK */}

        <TouchableOpacity
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          activeOpacity={0.75}
          onPress={handleBack}
          style={styles.headerBackButton}
        >
          <Feather name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>

        {/* TITLE */}

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Payment</Text>

          <Text style={styles.headerSubtitle}>Secure & Safe Transactions</Text>
        </View>

        {/* SECURE */}

        <View style={styles.headerSecureBlock}>
          <Feather name="shield" size={20} color={Colors.white} />

          <Text style={styles.headerSecureText}>{"100% Secure\nPayment"}</Text>
        </View>
      </LinearGradient>

      {/* =====================================================
          SCROLL CONTENT
      ===================================================== */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            PLAN CARD
        ================================================= */}

        <View style={styles.planCard}>
          {/* ICON */}

          <View style={styles.planIconCircle}>
            <Feather name="award" size={26} color={Colors.white} />
          </View>

          {/* PLAN NAME */}

          <View style={styles.planTextBlock}>
            <Text style={styles.planName}>{PLAN.name}</Text>

            <View style={styles.planMetaRow}>
              <Text style={styles.planDuration}>{PLAN.duration}</Text>

              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{PLAN.badge}</Text>
              </View>
            </View>
          </View>

          {/* PRICE */}

          <View style={styles.planPriceBlock}>
            <Text style={styles.planPrice}>
              ₹ {PLAN.price.toLocaleString("en-IN")}
            </Text>

            <Text style={styles.planOriginalPrice}>
              ₹ {PLAN.originalPrice.toLocaleString("en-IN")}
            </Text>
          </View>

          {/* DISCOUNT */}

          <View style={styles.planDiscountBlock}>
            <Text style={styles.planDiscountPercent}>
              {PLAN.discountPercent}%
            </Text>

            <Text style={styles.planDiscountLabel}>OFF</Text>
          </View>
        </View>

        {/* =================================================
            PAYMENT METHODS
        ================================================= */}

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

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <Text style={styles.sectionHeading}>Order Summary</Text>

        <View style={styles.summaryCard}>
          {/* PLAN */}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan</Text>

            <Text style={styles.summaryValue}>
              12 Months Premium Membership
            </Text>
          </View>

          {/* ORIGINAL PRICE */}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Original Price</Text>

            <Text style={styles.summaryStrikeValue}>
              ₹ {PLAN.originalPrice.toLocaleString("en-IN")}
            </Text>
          </View>

          {/* DISCOUNT */}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryDiscountLabel}>
              Discount ({PLAN.discountPercent}%)
            </Text>

            <Text style={styles.summaryDiscountValue}>
              - ₹ {discountAmount.toLocaleString("en-IN")}
            </Text>
          </View>

          {/* DIVIDER */}

          <View style={styles.summaryDivider} />

          {/* TOTAL */}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>

            <Text style={styles.summaryTotalValue}>
              ₹ {PLAN.price.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* =================================================
            TRUST BADGES
        ================================================= */}

        <View style={styles.trustBanner}>
          {TRUST_BADGES.map((badge) => (
            <View key={badge.title} style={styles.trustItem}>
              <Feather name={badge.icon} size={20} color={Colors.primaryRed} />

              <Text style={styles.trustTitle}>{badge.title}</Text>

              <Text style={styles.trustSubtitle}>{badge.subtitle}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* =====================================================
          STICKY PAY FOOTER
      ===================================================== */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payButton}
          activeOpacity={0.85}
          onPress={handlePay}
        >
          <Feather name="lock" size={18} color={Colors.white} />

          <Text style={styles.payButtonText}>
            Pay ₹ {PLAN.price.toLocaleString("en-IN")} Securely
          </Text>

          <Feather name="arrow-right" size={18} color={Colors.white} />
        </TouchableOpacity>

        {/* TERMS */}

        <View style={styles.termsRow}>
          <Feather name="shield" size={13} color={Colors.primaryRed} />

          <Text style={styles.termsText}>
            {" "}
            By proceeding, you agree to our{" "}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   PAYMENT METHOD ROW
========================================================= */

function PaymentMethodRow({ method, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.methodRow, selected && styles.methodRowSelected]}
      activeOpacity={0.8}
      onPress={onSelect}
    >
      {/* ICON */}

      <View style={styles.methodIconCircle}>
        <Feather name={method.icon} size={20} color={Colors.primaryRed} />
      </View>

      {/* TEXT */}

      <View style={styles.methodTextBlock}>
        <Text style={styles.methodLabel}>{method.label}</Text>

        <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
      </View>

      {/* RECOMMENDED */}

      {method.recommended && (
        <View style={styles.recommendedPill}>
          <Text style={styles.recommendedPillText}>Recommended</Text>
        </View>
      )}

      {/* RADIO */}

      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =====================================================
     SAFE AREA
  ===================================================== */

  safeArea: {
    flex: 1,

    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 18,

    paddingTop: 18,

    paddingBottom: 24,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

    paddingVertical: 18,
  },

  headerBackButton: {
    alignItems: "center",

    justifyContent: "center",

    width: 32,

    height: 32,
  },

  headerTitleBlock: {
    flex: 1,

    marginLeft: 14,
  },

  headerTitle: {
    fontSize: Fonts.size.xxl,

    fontFamily: Fonts.extraBold,

    color: Colors.white,
  },

  headerSubtitle: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.regular,

    color: "#FCE4D6",

    marginTop: 2,
  },

  headerSecureBlock: {
    flexDirection: "row",

    alignItems: "center",
  },

  headerSecureText: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.bold,

    color: Colors.white,

    marginLeft: 6,

    lineHeight: 15,
  },

  /* =====================================================
     PLAN CARD
  ===================================================== */

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

    minWidth: 0,
  },

  planName: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

    color: Colors.primaryRed,
  },

  planMetaRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 4,

    flexWrap: "wrap",
  },

  planDuration: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.regular,

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
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.bold,

    color: "#7A5B00",
  },

  planPriceBlock: {
    alignItems: "flex-end",

    marginRight: 12,
  },

  planPrice: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

    color: Colors.primaryRed,
  },

  planOriginalPrice: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.regular,

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
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

    color: Colors.primaryRed,
  },

  planDiscountLabel: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.bold,

    color: Colors.primaryRed,
  },

  /* =====================================================
     SECTION HEADING
  ===================================================== */

  sectionHeading: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

    color: Colors.textPrimary,

    marginBottom: 12,
  },

  /* =====================================================
     PAYMENT METHODS
  ===================================================== */

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

    minWidth: 0,
  },

  methodLabel: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

    color: Colors.textPrimary,
  },

  methodSubtitle: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.regular,

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
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.bold,

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

  /* =====================================================
     ORDER SUMMARY
  ===================================================== */

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
    fontSize: Fonts.size.md,

    fontFamily: Fonts.regular,

    color: Colors.textSecondary,

    flexShrink: 1,
  },

  summaryValue: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.bold,

    color: Colors.textPrimary,

    textAlign: "right",

    marginLeft: 10,

    flexShrink: 1,
  },

  summaryStrikeValue: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.regular,

    color: Colors.textMuted,

    textDecorationLine: "line-through",
  },

  summaryDiscountLabel: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.regular,

    color: "#1F7A3D",
  },

  summaryDiscountValue: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.bold,

    color: "#1F7A3D",
  },

  summaryDivider: {
    borderTopWidth: 1,

    borderTopColor: Colors.border,

    borderStyle: "dashed",

    marginVertical: 6,
  },

  summaryTotalLabel: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

    color: Colors.textPrimary,
  },

  summaryTotalValue: {
    fontSize: Fonts.size.lg,

    fontFamily: Fonts.extraBold,

    color: Colors.primaryRed,
  },

  /* =====================================================
     TRUST BANNER
  ===================================================== */

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
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.bold,

    color: Colors.textPrimary,

    marginTop: 6,

    textAlign: "center",
  },

  trustSubtitle: {
    fontSize: Fonts.size.xs,

    fontFamily: Fonts.regular,

    color: Colors.textMuted,

    marginTop: 2,

    textAlign: "center",
  },

  /* =====================================================
     STICKY FOOTER
  ===================================================== */

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
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

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
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.regular,

    color: Colors.textMuted,

    textAlign: "center",

    flexShrink: 1,
  },

  termsLink: {
    color: Colors.primaryRed,

    fontFamily: Fonts.bold,
  },
});
