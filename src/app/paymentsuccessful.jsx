import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

// =====================================================
// PAYMENT DATA
// =====================================================

const PAYMENT_DATA = {
  transactionId: "TXN202609300001",
  dateTime: "30 Sep 2026, 10:30 AM",
  paymentMethod: "UPI",
  amount: 2999,

  packageName: "Premium Membership",
  packageDuration: "12 Months Plan",

  benefits: [
    {
      icon: "heart-outline",
      title: "Express Interests",
    },
    {
      icon: "call-outline",
      title: "Contact Details",
    },
    {
      icon: "images-outline",
      title: "Photo Gallery",
    },
    {
      icon: "eye-outline",
      title: "Profile Views",
    },
  ],
};

// =====================================================
// SCREEN
// =====================================================

export default function PaymentSuccessScreen() {
  const router = useRouter();

  // ===================================================
  // BACK
  // ===================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  // ===================================================
  // HOME
  // ===================================================

  const handleHome = () => {
    router.replace("/(tabs)");
  };

  // ===================================================
  // PAYMENT HISTORY
  // ===================================================

  const handlePaymentHistory = () => {
    router.push("/payment-history");
  };

  // ===================================================
  // SUBSCRIPTION
  // ===================================================

  const handleSubscription = () => {
    router.push("/SubscriptionPlansScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryRed} />

      {/* =================================================
          HEADER
      ================================================= */}

      <LinearGradient
        colors={Colors.gradientLogo}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerBackButton}
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={25} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Payment Successful</Text>

          <Text style={styles.headerSubtitle}>
            Your transaction has been completed
          </Text>
        </View>

        <View style={styles.headerRight} />
      </LinearGradient>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =================================================
            SUCCESS ICON
        ================================================= */}

        <View style={styles.successSection}>
          <View style={styles.successOuterCircle}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={52} color={Colors.white} />
            </View>
          </View>

          <Text style={styles.successTitle}>Payment Successful!</Text>

          <Text style={styles.successDescription}>
            Your payment has been completed successfully. Welcome to Premium
            Membership!
          </Text>
        </View>

        {/* =================================================
            TRANSACTION DETAILS
        ================================================= */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Ionicons
                name="receipt-outline"
                size={20}
                color={Colors.primaryRed}
              />
            </View>

            <Text style={styles.cardTitle}>Transaction Details</Text>
          </View>

          <View style={styles.divider} />

          {/* Transaction ID */}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>

            <View style={styles.transactionValue}>
              <Text style={styles.detailValue} numberOfLines={1}>
                {PAYMENT_DATA.transactionId}
              </Text>

              <Ionicons name="checkmark-circle" size={17} color="#2E9B5B" />
            </View>
          </View>

          {/* Date */}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>

            <Text style={styles.detailValue}>{PAYMENT_DATA.dateTime}</Text>
          </View>

          {/* Payment Method */}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>

            <View style={styles.methodValue}>
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color={Colors.primaryRed}
              />

              <Text style={styles.detailValue}>
                {PAYMENT_DATA.paymentMethod}
              </Text>
            </View>
          </View>

          {/* Amount */}

          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Amount Paid</Text>

            <Text style={styles.amountValue}>
              ₹ {PAYMENT_DATA.amount.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* =================================================
            PACKAGE DETAILS
        ================================================= */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardHeaderIcon, styles.goldIcon]}>
              <Ionicons name="diamond-outline" size={20} color="#D4A017" />
            </View>

            <Text style={styles.cardTitle}>Package Details</Text>
          </View>

          <View style={styles.divider} />

          {/* Package Header */}

          <LinearGradient
            colors={["#FFF4EE", "#FFF9E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.packageHeader}
          >
            <View style={styles.packageIcon}>
              <Ionicons name="diamond" size={25} color="#D4A017" />
            </View>

            <View style={styles.packageInfo}>
              <Text style={styles.packageName}>{PAYMENT_DATA.packageName}</Text>

              <Text style={styles.packageDuration}>
                {PAYMENT_DATA.packageDuration}
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#178844" />

              <Text style={styles.activeBadgeText}>ACTIVE</Text>
            </View>
          </LinearGradient>

          {/* Benefits */}

          <Text style={styles.benefitsTitle}>Your Premium Benefits</Text>

          <View style={styles.benefitsGrid}>
            {PAYMENT_DATA.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons
                    name={benefit.icon}
                    size={19}
                    color={Colors.primaryRed}
                  />
                </View>

                <Text style={styles.benefitText} numberOfLines={2}>
                  {benefit.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        <View style={styles.messageBox}>
          <View style={styles.messageIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#2E9B5B"
            />
          </View>

          <View style={styles.messageContent}>
            <Text style={styles.messageTitle}>You're all set!</Text>

            <Text style={styles.messageText}>
              Your premium membership is now active. Start exploring profiles
              and connect with your matches.
            </Text>
          </View>
        </View>

        {/* =================================================
            VIEW SUBSCRIPTION
        ================================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSubscription}
          style={styles.primaryButtonWrapper}
        >
          <LinearGradient
            colors={[Colors.primaryRed, "#8E220B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Ionicons name="diamond-outline" size={20} color={Colors.white} />

            <Text style={styles.primaryButtonText}>
              View Subscription Details
            </Text>

            <Ionicons name="chevron-forward" size={19} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* =================================================
            PAYMENT HISTORY
        ================================================= */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePaymentHistory}
          style={styles.historyButton}
        >
          <Ionicons
            name="receipt-outline"
            size={20}
            color={Colors.primaryRed}
          />

          <Text style={styles.historyButtonText}>Payment History</Text>

          <Ionicons
            name="chevron-forward"
            size={19}
            color={Colors.primaryRed}
          />
        </TouchableOpacity>

        {/* =================================================
            HOME
        ================================================= */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleHome}
          style={styles.homeButton}
        >
          <Ionicons name="home-outline" size={20} color={Colors.primaryRed} />

          <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>

        {/* =================================================
            FOOTER
        ================================================= */}

        <Text style={styles.footerText}>
          Thank you for choosing us for your matrimonial journey ❤️
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  headerBackButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: FontSizes?.welcome || 20,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.white,
    textAlign: "center",
  },

  headerSubtitle: {
    fontSize: 11,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: "#FCE4D6",
    marginTop: 2,
    textAlign: "center",
  },

  headerRight: {
    width: 42,
  },

  // ===================================================
  // CONTENT
  // ===================================================

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
  },

  // ===================================================
  // SUCCESS
  // ===================================================

  successSection: {
    alignItems: "center",
    marginBottom: 24,
  },

  successOuterCircle: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: "#E8F7EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 17,
  },

  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#2E9B5B",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,

    elevation: 5,
  },

  successTitle: {
    fontSize: 24,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.textPrimary || "#111111",
    marginBottom: 7,
  },

  successDescription: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#666666",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // ===================================================
  // CARD
  // ===================================================

  card: {
    backgroundColor: Colors.cardBackground || Colors.white,

    borderRadius: 16,

    padding: 16,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: "#ECE2DE",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardHeaderIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "#FFF0F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  goldIcon: {
    backgroundColor: "#FFF8E3",
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.textPrimary || "#222222",
  },

  divider: {
    height: 1,
    backgroundColor: "#E9E1DD",
    marginVertical: 14,
  },

  // ===================================================
  // TRANSACTION
  // ===================================================

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  detailLabel: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textMuted || "#888888",
  },

  detailValue: {
    fontSize: 11.5,
    fontFamily: Fonts?.body?.medium || Fonts.medium,
    color: Colors.textPrimary || "#222222",
    textAlign: "right",
  },

  transactionValue: {
    flex: 1.6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
  },

  methodValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#FFF8E5",

    borderRadius: 10,

    paddingHorizontal: 13,
    paddingVertical: 12,

    marginTop: 9,
  },

  amountLabel: {
    fontSize: 14,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: Colors.textPrimary || "#222222",
  },

  amountValue: {
    fontSize: 19,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.primaryRed,
  },

  // ===================================================
  // PACKAGE
  // ===================================================

  packageHeader: {
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 13,

    padding: 12,
  },

  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,

    backgroundColor: Colors.white,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 10,
  },

  packageInfo: {
    flex: 1,
  },

  packageName: {
    fontSize: 14,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.textPrimary || "#222222",
  },

  packageDuration: {
    fontSize: 11,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#666666",
    marginTop: 3,
  },

  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DDF5E5",
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 3,
  },

  activeBadgeText: {
    fontSize: 9,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: "#178844",
  },

  benefitsTitle: {
    fontSize: 13,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: Colors.textPrimary || "#222222",
    marginTop: 17,
    marginBottom: 11,
  },

  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  benefitItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF0F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  benefitText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Fonts?.body?.medium || Fonts.medium,
    color: Colors.textSecondary || "#666666",
  },

  // ===================================================
  // MESSAGE
  // ===================================================

  messageBox: {
    flexDirection: "row",
    backgroundColor: "#EAF8EF",
    borderRadius: 13,
    padding: 13,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D5EFDF",
  },

  messageIcon: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  messageContent: {
    flex: 1,
  },

  messageTitle: {
    fontSize: 14,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: "#2E9B5B",
    marginBottom: 3,
  },

  messageText: {
    fontSize: 11,
    lineHeight: 17,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#666666",
  },

  // ===================================================
  // SUBSCRIPTION BUTTON
  // ===================================================

  primaryButtonWrapper: {
    borderRadius: 13,
    overflow: "hidden",
    marginBottom: 10,
  },

  primaryButton: {
    height: 53,
    paddingHorizontal: 15,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,
  },

  primaryButtonText: {
    flex: 1,
    textAlign: "center",

    color: Colors.white,

    fontSize: 13,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
  },

  // ===================================================
  // PAYMENT HISTORY
  // ===================================================

  historyButton: {
    height: 53,

    borderRadius: 13,

    borderWidth: 1.5,
    borderColor: Colors.primaryRed,

    backgroundColor: Colors.white,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 15,

    marginBottom: 10,
  },

  historyButtonText: {
    flex: 1,

    textAlign: "center",

    fontSize: 13,
    fontFamily: Fonts?.body?.bold || Fonts.bold,

    color: Colors.primaryRed,
  },

  // ===================================================
  // HOME
  // ===================================================

  homeButton: {
    height: 53,

    borderRadius: 13,

    borderWidth: 1.5,
    borderColor: "#D9D1CD",

    backgroundColor: Colors.white,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,
  },

  homeButtonText: {
    fontSize: 13,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: Colors.primaryRed,
  },

  // ===================================================
  // FOOTER
  // ===================================================

  footerText: {
    textAlign: "center",

    fontSize: 10,

    fontFamily: Fonts?.body?.regular || Fonts.regular,

    color: Colors.textMuted || "#888888",

    marginTop: 17,

    paddingHorizontal: 20,
  },

  bottomSpace: {
    height: 10,
  },
});
