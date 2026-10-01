import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

import {
  createPayment,
  getPackageDetails,
  getPaymentTypes,
  getToken,
} from "../utils/Functions";

// =====================================================
// FALLBACK PACKAGE
// =====================================================

const DEFAULT_PLAN = {
  name: "Premium Membership",
  duration: "12 Months Plan",
  badge: "Best Value",
  price: 2999,
  originalPrice: 4999,
  discountPercent: 40,
};

// =====================================================
// FALLBACK PAYMENT METHODS
// =====================================================

const FALLBACK_PAYMENT_METHODS = [
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
    recommended: false,
  },
  {
    key: "netbanking",
    icon: "business-outline",
    label: "Net Banking",
    subtitle: "All major banks supported",
    recommended: false,
  },
  {
    key: "wallet",
    icon: "wallet-outline",
    label: "Wallets",
    subtitle: "PhonePe, Paytm, Amazon Pay & more",
    recommended: false,
  },
  {
    key: "emi",
    icon: "calendar-outline",
    label: "EMI / Pay Later",
    subtitle: "Pay in easy installments",
    recommended: false,
  },
];

// =====================================================
// TRUST BADGES
// =====================================================

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

// =====================================================
// PAYMENT ICON
// =====================================================

const getPaymentIcon = (value) => {
  const text = String(value || "").toLowerCase();

  if (text.includes("upi")) {
    return "flash-outline";
  }

  if (
    text.includes("card") ||
    text.includes("credit") ||
    text.includes("debit")
  ) {
    return "card-outline";
  }

  if (text.includes("bank") || text.includes("netbank")) {
    return "business-outline";
  }

  if (
    text.includes("wallet") ||
    text.includes("paytm") ||
    text.includes("phonepe")
  ) {
    return "wallet-outline";
  }

  if (text.includes("emi") || text.includes("later")) {
    return "calendar-outline";
  }

  return "card-outline";
};

// =====================================================
// PAYMENT LABEL
// =====================================================

const getPaymentLabel = (item) => {
  return (
    item?.label ||
    item?.name ||
    item?.title ||
    item?.payment_method_name ||
    item?.payment_type_name ||
    item?.payment_method ||
    "Payment"
  );
};

// =====================================================
// PAYMENT KEY
// =====================================================

const getPaymentKey = (item, index) => {
  const value =
    item?.key ||
    item?.slug ||
    item?.code ||
    item?.payment_method ||
    item?.payment_type ||
    item?.name ||
    item?.title;

  if (value) {
    return String(value).toLowerCase().trim().replace(/\s+/g, "_");
  }

  return `payment_${index}`;
};

// =====================================================
// GET PACKAGE DATA
// =====================================================

const extractPackageData = (response) => {
  if (!response) {
    return null;
  }

  /*
   * Possible API structures:
   *
   * {
   *   result: true,
   *   data: {...}
   * }
   *
   * {
   *   success: 1,
   *   data: {...}
   * }
   *
   * {
   *   data: {
   *      package: {...}
   *   }
   * }
   *
   * {
   *   package: {...}
   * }
   */

  let data = response?.data;

  if (data?.package) {
    data = data.package;
  }

  if (data?.package_details) {
    data = data.package_details;
  }

  if (data?.packageDetails) {
    data = data.packageDetails;
  }

  if (!data && response?.package) {
    data = response.package;
  }

  if (!data && response?.package_details) {
    data = response.package_details;
  }

  if (!data && response?.packageDetails) {
    data = response.packageDetails;
  }

  if (!data && typeof response === "object") {
    data = response;
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  return data;
};

// =====================================================
// PAYMENT SCREEN
// =====================================================

export default function PaymentScreen() {
  const router = useRouter();

  // Example:
  // /payment?packageId=3

  const { packageId } = useLocalSearchParams();

  // ===================================================
  // STATES
  // ===================================================

  const [plan, setPlan] = useState(DEFAULT_PLAN);

  const [paymentMethods, setPaymentMethods] = useState(
    FALLBACK_PAYMENT_METHODS,
  );

  const [selectedMethod, setSelectedMethod] = useState("upi");

  const [isLoadingPackage, setIsLoadingPackage] = useState(true);

  const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(true);

  const [isPaying, setIsPaying] = useState(false);

  // ===================================================
  // PACKAGE ID
  // ===================================================

  const selectedPackageId = Number(
    Array.isArray(packageId) ? packageId[0] : packageId,
  );

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    loadPackageDetails();
    loadPaymentTypes();
  }, [packageId]);

  // ===================================================
  // LOAD PACKAGE DETAILS
  // ===================================================

  const loadPackageDetails = async () => {
    try {
      setIsLoadingPackage(true);

      console.log("=================================");
      console.log("GET PACKAGE DETAILS");
      console.log("=================================");

      console.log("Package ID:", selectedPackageId);

      if (!selectedPackageId || Number.isNaN(selectedPackageId)) {
        console.log("Package ID is missing.");

        Alert.alert(
          "Error",
          "Package ID is missing. Please select a package again.",
        );

        return;
      }

      const token = await getToken();

      console.log("Token exists:", !!token);

      if (!token) {
        Alert.alert("Login Required", "Please login again.");

        return;
      }

      // -----------------------------------------------
      // POST /api/package-details
      // -----------------------------------------------

      const response = await getPackageDetails(token, selectedPackageId);

      console.log("=================================");

      console.log("PACKAGE DETAILS RESPONSE");

      console.log("=================================");

      console.log(JSON.stringify(response, null, 2));

      console.log("=================================");

      // -----------------------------------------------
      // CHECK API FAILURE
      // -----------------------------------------------

      if (
        response?.success === 0 ||
        response?.success === false ||
        response?.result === false
      ) {
        Alert.alert(
          "Package Error",
          response?.message || "Unable to load package details.",
        );

        return;
      }

      // -----------------------------------------------
      // EXTRACT DATA
      // -----------------------------------------------

      const data = extractPackageData(response);

      console.log("Extracted package data:", data);

      if (!data) {
        console.log("Package data not found in response.");

        return;
      }

      // -----------------------------------------------
      // GET PACKAGE NAME
      // -----------------------------------------------

      const packageName =
        data?.name ||
        data?.package_name ||
        data?.packageName ||
        data?.title ||
        "Premium Membership";

      // -----------------------------------------------
      // GET DURATION
      // -----------------------------------------------

      let duration =
        data?.duration ||
        data?.validity ||
        data?.package_duration ||
        data?.package_validity ||
        data?.duration_text ||
        "";

      if (!duration && data?.duration_days) {
        duration = `${data.duration_days} Days`;
      }

      if (!duration && data?.validity_days) {
        duration = `${data.validity_days} Days`;
      }

      if (!duration) {
        duration = "12 Months Plan";
      }

      // -----------------------------------------------
      // GET PRICE
      // -----------------------------------------------

      const price = Number(
        data?.price ??
          data?.amount ??
          data?.package_price ??
          data?.selling_price ??
          data?.discounted_price ??
          DEFAULT_PLAN.price,
      );

      // -----------------------------------------------
      // GET ORIGINAL PRICE
      // -----------------------------------------------

      const originalPrice = Number(
        data?.original_price ??
          data?.originalPrice ??
          data?.mrp ??
          data?.old_price ??
          data?.actual_price ??
          price,
      );

      // -----------------------------------------------
      // GET DISCOUNT
      // -----------------------------------------------

      let discountPercent = Number(
        data?.discount_percent ??
          data?.discount_percentage ??
          data?.discount ??
          0,
      );

      if (!discountPercent && originalPrice > price) {
        discountPercent = Math.round(
          ((originalPrice - price) / originalPrice) * 100,
        );
      }

      // -----------------------------------------------
      // CREATE PLAN
      // -----------------------------------------------

      const formattedPlan = {
        name: packageName,
        duration,
        badge: data?.badge || data?.label || "Best Value",
        price,
        originalPrice,
        discountPercent,
      };

      console.log("Formatted Plan:", formattedPlan);

      setPlan(formattedPlan);
    } catch (error) {
      console.error("=================================");

      console.error("PACKAGE DETAILS ERROR");

      console.error("=================================");

      console.error(error);

      console.error("Error message:", error?.message);

      console.error("=================================");
    } finally {
      setIsLoadingPackage(false);
    }
  };

  // ===================================================
  // LOAD PAYMENT TYPES
  // ===================================================

  const loadPaymentTypes = async () => {
    try {
      setIsLoadingPaymentTypes(true);

      console.log("=================================");
      console.log("GET PAYMENT TYPES");
      console.log("=================================");

      const token = await getToken();

      console.log("Token exists:", !!token);

      if (!token) {
        console.log("Token not available. Using fallback payment methods.");

        setPaymentMethods(FALLBACK_PAYMENT_METHODS);

        setSelectedMethod("upi");

        return;
      }

      // -----------------------------------------------
      // GET /api/payment-types
      // -----------------------------------------------

      const response = await getPaymentTypes(token);

      console.log("=================================");

      console.log("PAYMENT TYPES RESPONSE");

      console.log("=================================");

      console.log(JSON.stringify(response, null, 2));

      console.log("=================================");

      // -----------------------------------------------
      // GET DATA
      // -----------------------------------------------

      let apiData = [];

      if (Array.isArray(response)) {
        apiData = response;
      } else if (Array.isArray(response?.data)) {
        apiData = response.data;
      } else if (Array.isArray(response?.payment_types)) {
        apiData = response.payment_types;
      } else if (Array.isArray(response?.paymentTypes)) {
        apiData = response.paymentTypes;
      } else if (Array.isArray(response?.result)) {
        apiData = response.result;
      }

      // -----------------------------------------------
      // MAP API DATA
      // -----------------------------------------------

      if (apiData.length > 0) {
        const formattedMethods = apiData.map((item, index) => {
          const key = getPaymentKey(item, index);

          const label = getPaymentLabel(item);

          return {
            key,

            icon:
              item?.icon ||
              getPaymentIcon(
                item?.key || item?.name || item?.title || item?.payment_method,
              ),

            label,

            subtitle:
              item?.subtitle || item?.description || `Pay using ${label}`,

            recommended: item?.recommended === true || item?.recommended === 1,
          };
        });

        console.log("Formatted Payment Methods:", formattedMethods);

        setPaymentMethods(formattedMethods);

        if (formattedMethods.length > 0) {
          const recommended = formattedMethods.find((item) => item.recommended);

          setSelectedMethod(
            recommended ? recommended.key : formattedMethods[0].key,
          );
        }
      } else {
        console.log("No payment types returned. Using fallback methods.");

        setPaymentMethods(FALLBACK_PAYMENT_METHODS);

        setSelectedMethod("upi");
      }
    } catch (error) {
      console.error("=================================");

      console.error("PAYMENT TYPES ERROR");

      console.error("=================================");

      console.error(error);

      console.error("Error message:", error?.message);

      console.error("=================================");

      setPaymentMethods(FALLBACK_PAYMENT_METHODS);

      setSelectedMethod("upi");
    } finally {
      setIsLoadingPaymentTypes(false);
    }
  };

  // ===================================================
  // CREATE PAYMENT
  // ===================================================

  const handlePay = async () => {
    if (isPaying) {
      return;
    }

    try {
      setIsPaying(true);

      console.log("=================================");
      console.log("START CREATE PAYMENT");
      console.log("=================================");

      // -----------------------------------------------
      // CHECK PACKAGE ID
      // -----------------------------------------------

      if (!selectedPackageId || Number.isNaN(selectedPackageId)) {
        Alert.alert(
          "Payment Error",
          "Package ID is missing. Please select the package again.",
        );

        return;
      }

      // -----------------------------------------------
      // CHECK PAYMENT METHOD
      // -----------------------------------------------

      if (!selectedMethod) {
        Alert.alert("Payment Error", "Please select a payment method.");

        return;
      }

      // -----------------------------------------------
      // GET TOKEN
      // -----------------------------------------------

      const token = await getToken();

      console.log("Token exists:", !!token);

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your login session has expired. Please login again.",
        );

        return;
      }

      // -----------------------------------------------
      // AMOUNT
      // -----------------------------------------------

      const amount = Number(plan.price);

      if (!amount || amount <= 0) {
        Alert.alert("Payment Error", "Invalid package amount.");

        return;
      }

      // -----------------------------------------------
      // LOG REQUEST
      // -----------------------------------------------

      console.log("=================================");
      console.log("CREATE PAYMENT REQUEST");
      console.log("=================================");

      console.log("API:", "POST /api/createpayment");

      console.log("Package ID:", selectedPackageId);

      console.log("Payment Type:", "package");

      console.log("Amount:", amount);

      console.log("Payment Method:", selectedMethod);

      console.log("=================================");

      // -----------------------------------------------
      // CREATE PAYMENT
      // -----------------------------------------------

      const response = await createPayment(
        token,
        selectedPackageId,
        amount,
        selectedMethod,
      );

      // -----------------------------------------------
      // LOG RESPONSE
      // -----------------------------------------------

      console.log("=================================");
      console.log("CREATE PAYMENT RESPONSE");
      console.log("=================================");

      console.log(JSON.stringify(response, null, 2));

      console.log("=================================");

      // -----------------------------------------------
      // NO RESPONSE
      // -----------------------------------------------

      if (!response) {
        Alert.alert("Payment Failed", "No response received from the server.");

        return;
      }

      // -----------------------------------------------
      // FAILURE
      // -----------------------------------------------

      if (
        response.success === 0 ||
        response.success === false ||
        response.result === false
      ) {
        Alert.alert(
          "Payment Failed",
          response.message || "Unable to create payment.",
        );

        return;
      }

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      if (response.success === 1 || response.success === true) {
        const razorpayOrderId = response.paymentOrderId;

        console.log("Razorpay Order ID:", razorpayOrderId);

        if (!razorpayOrderId) {
          Alert.alert("Payment Error", "Razorpay order ID was not received.");

          return;
        }

        /*
         * IMPORTANT
         *
         * /api/createpayment only creates
         * the Razorpay order.
         *
         * NEXT:
         *
         * Razorpay Checkout
         *        ↓
         * Payment
         *        ↓
         * razorpay_payment_id
         * razorpay_order_id
         * razorpay_signature
         *        ↓
         * Backend verification
         *
         * Do NOT navigate to
         * PaymentSuccessful yet.
         */

        Alert.alert(
          "Payment Order Created",
          `Razorpay Order ID:\n${razorpayOrderId}`,
        );

        return;
      }

      // -----------------------------------------------
      // UNKNOWN RESPONSE
      // -----------------------------------------------

      Alert.alert(
        "Payment Status",
        response.message || "Unexpected server response.",
      );
    } catch (error) {
      console.error("=================================");

      console.error("CREATE PAYMENT ERROR");

      console.error("=================================");

      console.error(error);

      console.error("Error message:", error?.message);

      console.error("=================================");

      Alert.alert(
        "Payment Failed",
        error?.message || "Something went wrong while creating the payment.",
      );
    } finally {
      setIsPaying(false);
    }
  };

  // ===================================================
  // BACK
  // ===================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  // ===================================================
  // DISCOUNT
  // ===================================================

  const discountAmount = Math.max(
    0,
    Number(plan.originalPrice) - Number(plan.price),
  );

  // ===================================================
  // UI
  // ===================================================

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryRed} />

      {/* =================================================
          HEADER
      ================================================= */}

      <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
        <TouchableOpacity
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          activeOpacity={0.75}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Payment</Text>

          <Text style={styles.headerSubtitle}>Secure & Safe Transactions</Text>
        </View>

        <View style={styles.headerSecureBlock}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={Colors.white}
          />

          <Text style={styles.headerSecureText}>{"100% Secure\nPayment"}</Text>
        </View>
      </LinearGradient>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            PLAN CARD
        ================================================= */}

        {isLoadingPackage ? (
          <View style={styles.packageLoading}>
            <ActivityIndicator size="small" color={Colors.primaryRed} />

            <Text style={styles.loadingText}>Loading package details...</Text>
          </View>
        ) : (
          <View style={styles.planCard}>
            <View style={styles.planIconCircle}>
              <Ionicons name="ribbon" size={26} color={Colors.white} />
            </View>

            <View style={styles.planTextBlock}>
              <Text style={styles.planName}>{plan.name}</Text>

              <View style={styles.planMetaRow}>
                <Text style={styles.planDuration}>{plan.duration}</Text>

                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              </View>
            </View>

            <View style={styles.planPriceBlock}>
              <Text style={styles.planPrice}>
                ₹ {Number(plan.price).toLocaleString("en-IN")}
              </Text>

              {Number(plan.originalPrice) > Number(plan.price) && (
                <Text style={styles.planOriginalPrice}>
                  ₹ {Number(plan.originalPrice).toLocaleString("en-IN")}
                </Text>
              )}
            </View>

            <View style={styles.planDiscountBlock}>
              <Text style={styles.planDiscountPercent}>
                {plan.discountPercent}%
              </Text>

              <Text style={styles.planDiscountLabel}>OFF</Text>
            </View>
          </View>
        )}

        {/* =================================================
            PAYMENT METHODS
        ================================================= */}

        <Text style={styles.sectionHeading}>Select Payment Method</Text>

        {isLoadingPaymentTypes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primaryRed} />

            <Text style={styles.loadingText}>Loading payment methods...</Text>
          </View>
        ) : (
          <View style={styles.methodsList}>
            {paymentMethods.map((method) => (
              <PaymentMethodRow
                key={method.key}
                method={method}
                selected={selectedMethod === method.key}
                onSelect={() => setSelectedMethod(method.key)}
              />
            ))}
          </View>
        )}

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <Text style={styles.sectionHeading}>Order Summary</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan</Text>

            <Text style={styles.summaryValue}>{plan.name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>

            <Text style={styles.summaryValue}>{plan.duration}</Text>
          </View>

          {Number(plan.originalPrice) > Number(plan.price) && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Original Price</Text>

              <Text style={styles.summaryStrikeValue}>
                ₹ {Number(plan.originalPrice).toLocaleString("en-IN")}
              </Text>
            </View>
          )}

          {discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryDiscountLabel}>
                Discount ({plan.discountPercent}
                %)
              </Text>

              <Text style={styles.summaryDiscountValue}>
                - ₹ {discountAmount.toLocaleString("en-IN")}
              </Text>
            </View>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>

            <Text style={styles.summaryTotalValue}>
              ₹ {Number(plan.price).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* =================================================
            TRUST BADGES
        ================================================= */}

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

      {/* =================================================
          FOOTER
      ================================================= */}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, isPaying && styles.payButtonDisabled]}
          activeOpacity={0.85}
          onPress={handlePay}
          disabled={isPaying || isLoadingPackage || isLoadingPaymentTypes}
        >
          <Ionicons
            name={isPaying ? "hourglass-outline" : "lock-closed"}
            size={18}
            color={Colors.white}
          />

          <Text style={styles.payButtonText}>
            {isPaying
              ? "Creating Payment..."
              : `Pay ₹ ${Number(plan.price).toLocaleString("en-IN")} Securely`}
          </Text>

          {!isPaying && (
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          )}
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
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// =====================================================
// PAYMENT METHOD ROW
// =====================================================

function PaymentMethodRow({ method, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.methodRow, selected && styles.methodRowSelected]}
      activeOpacity={0.8}
      onPress={onSelect}
    >
      <View style={styles.methodIconCircle}>
        <Ionicons
          name={method.icon || "card-outline"}
          size={20}
          color={Colors.primaryRed}
        />
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

  // ===================================================
  // CONTENT
  // ===================================================

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },

  // ===================================================
  // PACKAGE LOADING
  // ===================================================

  packageLoading: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E8E1DB",
  },

  loadingContainer: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1DB",
    minHeight: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  loadingText: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 8,
  },

  // ===================================================
  // PLAN CARD
  // ===================================================

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
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
    marginTop: 2,
  },

  planDiscountBlock: {
    backgroundColor: Colors.primaryRed,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  planDiscountPercent: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  planDiscountLabel: {
    fontSize: 9,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  // ===================================================
  // SECTION
  // ===================================================

  sectionHeading: {
    fontSize: 17,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginBottom: 10,
  },

  // ===================================================
  // PAYMENT METHODS
  // ===================================================

  methodsList: {
    marginBottom: 22,
  },

  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8E1DB",
    padding: 13,
    marginBottom: 10,
  },

  methodRowSelected: {
    borderColor: Colors.primaryRed,
    backgroundColor: "#FFF8F3",
  },

  methodIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FCEFE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  methodTextBlock: {
    flex: 1,
  },

  methodLabel: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  methodSubtitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  recommendedPill: {
    backgroundColor: "#FCE9A8",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },

  recommendedPillText: {
    fontSize: 9,
    fontFamily: Fonts.body.bold,
    color: "#7A5B00",
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#B9B1AA",
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: Colors.primaryRed,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryRed,
  },

  // ===================================================
  // SUMMARY
  // ===================================================

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E1DB",
    marginBottom: 22,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },

  summaryValue: {
    flex: 1.4,
    fontSize: 13,
    fontFamily: Fonts.body.medium,
    color: Colors.textPrimary,
    textAlign: "right",
  },

  summaryStrikeValue: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
  },

  summaryDiscountLabel: {
    fontSize: 13,
    fontFamily: Fonts.body.medium,
    color: "#278A4A",
  },

  summaryDiscountValue: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: "#278A4A",
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#EAE3DD",
    marginVertical: 4,
    marginBottom: 14,
  },

  summaryTotalLabel: {
    fontSize: 16,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },

  summaryTotalValue: {
    fontSize: 19,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },

  // ===================================================
  // TRUST
  // ===================================================

  trustBanner: {
    backgroundColor: "#FDF3E7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  trustTitle: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginLeft: 8,
  },

  trustSubtitle: {
    width: "100%",
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginLeft: 28,
    marginTop: 2,
  },

  // ===================================================
  // FOOTER
  // ===================================================

  footer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E1DB",
  },

  payButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  payButtonDisabled: {
    opacity: 0.6,
  },

  payButtonText: {
    fontSize: 15,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
    marginHorizontal: 10,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingHorizontal: 4,
  },

  termsText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  termsLink: {
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
});
