import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
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

import {
  getPackagePurchaseHistory,
  getPackagePurchaseInvoice,
  getToken,
} from "../utils/Functions";

// =====================================================
// SCREEN
// =====================================================

export default function PurchaseHistory() {
  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // ===================================================
  // FETCH PAYMENT HISTORY
  // ===================================================

  const fetchPaymentHistory = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const token = await getToken();

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your session has expired. Please login again.",
        );
        return;
      }

      const response = await getPackagePurchaseHistory(token);

      console.log(
        "Purchase History Response:",
        JSON.stringify(response, null, 2),
      );

      // =============================================
      // ERROR RESPONSE
      // =============================================

      if (!response) {
        throw new Error("No response received from server.");
      }

      if (
        response.result === false ||
        response.success === 0 ||
        response.success === false
      ) {
        throw new Error(response.message || "Unable to load purchase history.");
      }

      // =============================================
      // NORMALIZE RESPONSE
      // =============================================

      const history = extractHistory(response);

      console.log("Purchase History Array:", JSON.stringify(history, null, 2));

      setPayments(history);
    } catch (error) {
      console.log("Purchase History Error:", error);

      Alert.alert(
        "Purchase History",
        error?.message || "Unable to load purchase history.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPaymentHistory(false);
  };

  // ===================================================
  // BACK
  // ===================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  // ===================================================
  // SUMMARY
  // ===================================================

  const summary = useMemo(() => {
    let totalSpent = 0;

    payments.forEach((payment) => {
      totalSpent += getAmount(payment);
    });

    const activePayment =
      payments.find((payment) => {
        const status = String(getStatus(payment)).toLowerCase();

        return (
          status === "paid" ||
          status === "success" ||
          status === "successful" ||
          status === "completed" ||
          status === "active"
        );
      }) || payments[0];

    return {
      totalPayments: payments.length,
      totalSpent,
      activePlan: activePayment ? getPackageName(activePayment) : "Premium",
      activeDuration: activePayment
        ? getDuration(activePayment)
        : "No Active Plan",
    };
  }, [payments]);

  // ===================================================
  // VIEW INVOICE
  // ===================================================

  const handleInvoice = async (payment) => {
    try {
      const paymentId = getPaymentId(payment);

      if (!paymentId) {
        Alert.alert("Invoice", "Package payment ID is not available.");
        return;
      }

      setInvoiceLoading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your session has expired. Please login again.",
        );
        return;
      }

      console.log("Getting invoice for package_payment_id:", paymentId);

      const response = await getPackagePurchaseInvoice(token, paymentId);

      console.log("Invoice Response:", JSON.stringify(response, null, 2));

      if (!response) {
        throw new Error("No invoice response received.");
      }

      if (
        response.result === false ||
        response.success === 0 ||
        response.success === false
      ) {
        throw new Error(response.message || "Unable to generate invoice.");
      }

      // =============================================
      // FIND INVOICE URL
      // =============================================

      const invoiceUrl = extractInvoiceUrl(response);

      console.log("Invoice URL:", invoiceUrl);

      if (invoiceUrl) {
        const supported = await Linking.canOpenURL(invoiceUrl);

        if (supported) {
          await Linking.openURL(invoiceUrl);
        } else {
          Alert.alert(
            "Invoice",
            "Invoice URL was received but could not be opened.",
          );
        }

        return;
      }

      Alert.alert(
        "Invoice",
        response.message ||
          "Invoice generated successfully, but no invoice URL was returned.",
      );
    } catch (error) {
      console.log("Invoice Error:", error);

      Alert.alert("Invoice", error?.message || "Unable to generate invoice.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  // ===================================================
  // VIEW DETAILS
  // ===================================================

  const handleDetails = (payment) => {
    const packageName = getPackageName(payment);
    const amount = getAmount(payment);
    const date = getDate(payment);
    const method = getPaymentMethod(payment);
    const transactionId = getTransactionId(payment);

    Alert.alert(
      packageName,
      `Amount: ₹${amount.toLocaleString(
        "en-IN",
      )}\n\nDate: ${date}\n\nPayment Method: ${method}\n\nTransaction ID: ${transactionId}`,
      [
        {
          text: "Close",
        },
      ],
    );
  };

  // ===================================================
  // COPY TRANSACTION ID
  // ===================================================

  const handleCopyTransaction = async (transactionId) => {
    if (!transactionId || transactionId === "N/A") {
      return;
    }

    try {
      await Clipboard.setStringAsync(String(transactionId));

      Alert.alert("Copied", "Transaction ID copied successfully.");
    } catch (error) {
      console.log("Copy error:", error);

      Alert.alert("Copy Failed", "Unable to copy transaction ID.");
    }
  };

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.primaryRed}
        />

        <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            activeOpacity={0.8}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={26} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Purchase History</Text>

            <Text style={styles.headerSubtitle}>
              Your Premium Membership Payments
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="receipt-outline" size={26} color={Colors.white} />
          </View>
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryRed} />

          <Text style={styles.loadingText}>Loading purchase history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryRed} />

      {/* =================================================
          HEADER
      ================================================= */}

      <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          activeOpacity={0.8}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={26} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Purchase History</Text>

          <Text style={styles.headerSubtitle}>
            Your Premium Membership Payments
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerIcon}
          activeOpacity={0.8}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh-outline" size={26} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primaryRed}
            colors={[Colors.primaryRed]}
          />
        }
      >
        {/* =================================================
            SUMMARY
        ================================================= */}

        <View style={styles.summaryCard}>
          {/* Total Payments */}

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons name="receipt" size={24} color={Colors.primaryRed} />
            </View>

            <Text style={styles.summaryLabel}>Total Payments</Text>

            <Text style={styles.summaryValue}>{summary.totalPayments}</Text>
          </View>

          <View style={styles.summaryDivider} />

          {/* Total Spent */}

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Text style={styles.rupeeIcon}>₹</Text>
            </View>

            <Text style={styles.summaryLabel}>Total Spent</Text>

            <Text style={styles.summaryValue}>
              ₹ {summary.totalSpent.toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          {/* Active Plan */}

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons name="diamond" size={23} color={Colors.primaryRed} />
            </View>

            <Text style={styles.summaryLabel}>Active Plan</Text>

            <Text
              style={[styles.summaryValue, styles.activePlanValue]}
              numberOfLines={1}
            >
              {summary.activePlan}
            </Text>

            <Text style={styles.activeDuration}>{summary.activeDuration}</Text>
          </View>
        </View>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {payments.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={45}
                color={Colors.primaryRed}
              />
            </View>

            <Text style={styles.emptyTitle}>No Purchase History</Text>

            <Text style={styles.emptyDescription}>
              Your premium membership purchases will appear here after you make
              a purchase.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.8}
              onPress={handleBack}
            >
              <Text style={styles.emptyButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* =================================================
                PAYMENT LIST
            ================================================= */}

            {payments.map((payment, index) => (
              <PaymentCard
                key={getPaymentId(payment) || payment?.id || index}
                payment={payment}
                onInvoice={() => handleInvoice(payment)}
                onDetails={() => handleDetails(payment)}
                onCopy={() => handleCopyTransaction(getTransactionId(payment))}
                invoiceLoading={invoiceLoading}
              />
            ))}
          </>
        )}

        {/* =================================================
            SECURITY BANNER
        ================================================= */}

        <View style={styles.securityBanner}>
          <View style={styles.securityIcon}>
            <Ionicons
              name="shield-checkmark"
              size={25}
              color={Colors.primaryRed}
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Secure Transactions</Text>

            <Text style={styles.securityDescription}>
              Your payment information is safe and secure with us.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// PAYMENT CARD
// =====================================================

function PaymentCard({
  payment,
  onInvoice,
  onDetails,
  onCopy,
  invoiceLoading,
}) {
  const packageName = getPackageName(payment);
  const duration = getDuration(payment);
  const amount = getAmount(payment);
  const date = getDate(payment);
  const status = getStatus(payment);
  const method = getPaymentMethod(payment);
  const transactionId = getTransactionId(payment);
  const router = useRouter();

  const statusValue = String(status).toLowerCase();

  const statusIsPaid =
    statusValue === "paid" ||
    statusValue === "success" ||
    statusValue === "successful" ||
    statusValue === "completed" ||
    statusValue === "active";

  return (
    <View style={styles.paymentCard}>
      {/* =================================================
          TOP
      ================================================= */}

      <View style={styles.paymentTop}>
        {/* Package Icon */}

        <View style={[styles.packageIcon, getPackageIconStyle(packageName)]}>
          <Ionicons
            name="ribbon"
            size={29}
            color={getPackageIconColor(packageName)}
          />
        </View>

        {/* Package Information */}

        <View style={styles.packageContent}>
          <Text style={styles.packageName} numberOfLines={1}>
            {packageName}
          </Text>

          <View style={styles.durationBadge}>
            <Text style={styles.durationBadgeText}>{duration}</Text>
          </View>

          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={Colors.textSecondary}
            />

            <Text style={styles.dateText}>{date}</Text>
          </View>
        </View>

        {/* Amount */}

        <View style={styles.amountSection}>
          <View style={[styles.paidBadge, !statusIsPaid && styles.unpaidBadge]}>
            <Ionicons
              name={statusIsPaid ? "checkmark-circle" : "alert-circle"}
              size={17}
              color={statusIsPaid ? "#178844" : "#B77900"}
            />

            <Text style={[styles.paidText, !statusIsPaid && styles.unpaidText]}>
              {statusIsPaid ? "Paid" : status}
            </Text>
          </View>

          <Text style={styles.amountText}>
            ₹ {amount.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>

      {/* =================================================
          TRANSACTION ID
      ================================================= */}

      <View style={styles.transactionRow}>
        <Text style={styles.transactionText} numberOfLines={1}>
          Transaction ID: {transactionId || "N/A"}
        </Text>

        {transactionId && transactionId !== "N/A" ? (
          <TouchableOpacity
            style={styles.copyButton}
            activeOpacity={0.7}
            onPress={onCopy}
          >
            <Ionicons
              name="copy-outline"
              size={21}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* =================================================
          BOTTOM
      ================================================= */}

      <View style={styles.paymentBottom}>
        {/* Payment Method */}

        <View style={styles.methodSection}>
          <View style={styles.methodIcon}>
            <Ionicons
              name={getMethodIcon(method)}
              size={22}
              color={getMethodColor(method)}
            />
          </View>

          <View>
            <Text style={styles.methodText} numberOfLines={1}>
              {method}
            </Text>

            {method.toLowerCase().includes("card") && (
              <Text style={styles.cardNumber}>**** 5678</Text>
            )}
          </View>
        </View>

        {/* Buttons */}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.invoiceButton}
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: "/InvoiceDetails",
                params: {
                  package_payment_id: String(getPaymentId(payment)),
                },
              });
            }}
          >
            <Ionicons
              name="document-text-outline"
              size={19}
              color={Colors.primaryRed}
            />

            <Text style={styles.invoiceButtonText}>Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailsButton}
            activeOpacity={0.8}
            onPress={() => {
              const paymentId = getPaymentId(payment);

              router.push({
                pathname: "/InvoiceDetails",
                params: {
                  package_payment_id: String(paymentId),
                },
              });
            }}
          >
            <Text style={styles.detailsButtonText}>Details</Text>

            <Ionicons name="chevron-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// =====================================================
// EXTRACT PURCHASE HISTORY
// =====================================================

function extractHistory(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  if (Array.isArray(response?.payments)) {
    return response.payments;
  }

  if (Array.isArray(response?.payment_history)) {
    return response.payment_history;
  }

  if (Array.isArray(response?.purchase_history)) {
    return response.purchase_history;
  }

  if (Array.isArray(response?.history)) {
    return response.history;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  if (Array.isArray(response?.result?.payments)) {
    return response.result.payments;
  }

  if (Array.isArray(response?.result?.payment_history)) {
    return response.result.payment_history;
  }

  return [];
}

// =====================================================
// EXTRACT INVOICE URL
// =====================================================

function extractInvoiceUrl(response) {
  return (
    response?.invoice_url ||
    response?.invoiceUrl ||
    response?.url ||
    response?.data?.invoice_url ||
    response?.data?.invoiceUrl ||
    response?.data?.url ||
    response?.result?.invoice_url ||
    response?.result?.invoiceUrl ||
    response?.result?.url ||
    response?.result?.data?.invoice_url ||
    response?.result?.data?.url ||
    null
  );
}

// =====================================================
// PAYMENT ID
// =====================================================

function getPaymentId(payment) {
  return (
    payment?.package_payment_id ||
    payment?.packagePaymentId ||
    payment?.payment_id ||
    payment?.paymentId ||
    payment?.id
  );
}

// =====================================================
// PACKAGE NAME
// =====================================================

function getPackageName(payment) {
  return (
    payment?.package_name ||
    payment?.packageName ||
    payment?.package?.name ||
    payment?.package?.package_name ||
    payment?.plan_name ||
    payment?.planName ||
    payment?.name ||
    "Premium Membership"
  );
}

// =====================================================
// DURATION
// =====================================================

function getDuration(payment) {
  return (
    payment?.duration ||
    payment?.package_duration ||
    payment?.packageDuration ||
    payment?.plan_duration ||
    payment?.planDuration ||
    payment?.package?.duration ||
    payment?.package?.package_duration ||
    "12 Months Plan"
  );
}

// =====================================================
// AMOUNT
// =====================================================

function getAmount(payment) {
  const amount =
    payment?.amount ??
    payment?.paid_amount ??
    payment?.payment_amount ??
    payment?.price ??
    payment?.package?.price ??
    0;

  const numericAmount = Number(String(amount).replace(/[^0-9.-]/g, ""));

  return Number.isFinite(numericAmount) ? numericAmount : 0;
}

// =====================================================
// STATUS
// =====================================================

function getStatus(payment) {
  return (
    payment?.status ||
    payment?.payment_status ||
    payment?.paymentStatus ||
    "Paid"
  );
}

// =====================================================
// DATE
// =====================================================

function getDate(payment) {
  const rawDate =
    payment?.created_at ||
    payment?.createdAt ||
    payment?.payment_date ||
    payment?.paymentDate ||
    payment?.date ||
    payment?.paid_at ||
    payment?.paidAt;

  if (!rawDate) {
    return "Payment date unavailable";
  }

  try {
    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return String(rawDate);
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return String(rawDate);
  }
}

// =====================================================
// TRANSACTION ID
// =====================================================

function getTransactionId(payment) {
  return (
    payment?.transaction_id ||
    payment?.transactionId ||
    payment?.txn_id ||
    payment?.txnId ||
    payment?.reference_id ||
    payment?.referenceId ||
    payment?.razorpay_payment_id ||
    payment?.razorpayPaymentId ||
    payment?.id?.toString() ||
    "N/A"
  );
}

// =====================================================
// PAYMENT METHOD
// =====================================================

function getPaymentMethod(payment) {
  const method =
    payment?.payment_method ||
    payment?.paymentMethod ||
    payment?.method ||
    payment?.gateway ||
    "UPI";

  return formatPaymentMethod(method);
}

// =====================================================
// FORMAT PAYMENT METHOD
// =====================================================

function formatPaymentMethod(method) {
  const value = String(method || "").toLowerCase();

  if (value === "upi") {
    return "UPI";
  }

  if (value === "card" || value === "credit_card" || value === "debit_card") {
    return "Credit / Debit Card";
  }

  if (value === "netbanking" || value === "net_banking") {
    return "Net Banking";
  }

  if (value === "wallet") {
    return "Wallet";
  }

  if (value === "emi") {
    return "EMI / Pay Later";
  }

  return String(method);
}

// =====================================================
// PAYMENT METHOD ICON
// =====================================================

function getMethodIcon(method) {
  const value = String(method || "").toLowerCase();

  if (value.includes("upi")) {
    return "phone-portrait-outline";
  }

  if (value.includes("card")) {
    return "card-outline";
  }

  if (value.includes("bank")) {
    return "business-outline";
  }

  if (value.includes("wallet")) {
    return "wallet-outline";
  }

  if (value.includes("emi")) {
    return "calendar-outline";
  }

  return "card-outline";
}

// =====================================================
// PAYMENT METHOD COLOR
// =====================================================

function getMethodColor(method) {
  const value = String(method || "").toLowerCase();

  if (value.includes("upi")) {
    return "#2674E8";
  }

  if (value.includes("phonepe")) {
    return "#6F22B9";
  }

  if (value.includes("card")) {
    return "#1769D1";
  }

  if (value.includes("wallet")) {
    return "#6F22B9";
  }

  return Colors.primaryRed;
}

// =====================================================
// PACKAGE ICON COLOR
// =====================================================

function getPackageIconColor(packageName) {
  const name = String(packageName || "").toLowerCase();

  if (name.includes("silver")) {
    return "#68727E";
  }

  if (name.includes("basic")) {
    return "#9A4B10";
  }

  return "#8A5700";
}

// =====================================================
// PACKAGE ICON BACKGROUND
// =====================================================

function getPackageIconStyle(packageName) {
  const name = String(packageName || "").toLowerCase();

  if (name.includes("silver")) {
    return {
      backgroundColor: "#E7ECF1",
    };
  }

  if (name.includes("basic")) {
    return {
      backgroundColor: "#F5D0AA",
    };
  }

  return {
    backgroundColor: "#FFE4A3",
  };
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
    minHeight: 118,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
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
    fontSize: FontSizes?.welcome || 28,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.white,
    textAlign: "center",
  },

  headerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: "#FCE4D6",
    marginTop: 2,
    textAlign: "center",
  },

  headerIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  // ===================================================
  // CONTENT
  // ===================================================

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 25,
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary,
  },

  // ===================================================
  // SUMMARY
  // ===================================================

  summaryCard: {
    backgroundColor: Colors.cardBackground || Colors.white,

    borderRadius: 18,

    paddingVertical: 18,
    paddingHorizontal: 8,

    flexDirection: "row",
    alignItems: "stretch",

    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#F1E7E2",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.07,
    shadowRadius: 8,

    elevation: 3,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },

  summaryDivider: {
    width: 1,
    backgroundColor: "#E7E0DC",
    marginVertical: 3,
  },

  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF0F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  rupeeIcon: {
    fontSize: 29,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.primaryRed,
  },

  summaryLabel: {
    fontSize: 11,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 2,
  },

  summaryValue: {
    fontSize: 17,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.primaryRed,
    textAlign: "center",
  },

  activePlanValue: {
    fontSize: 15,
  },

  activeDuration: {
    fontSize: 10,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  // ===================================================
  // PAYMENT CARD
  // ===================================================

  paymentCard: {
    backgroundColor: Colors.cardBackground || Colors.white,

    borderRadius: 18,

    padding: 16,

    marginBottom: 16,

    borderWidth: 1,
    borderColor: "#F0E6E2",

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.07,
    shadowRadius: 8,

    elevation: 3,
  },

  paymentTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  packageIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  packageContent: {
    flex: 1,
    minWidth: 0,
  },

  packageName: {
    fontSize: 18,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.textPrimary || "#101B3A",
  },

  durationBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE9EC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
    marginTop: 7,
  },

  durationBadgeText: {
    fontSize: 12,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: Colors.primaryRed,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  dateText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#687386",
    marginLeft: 7,
  },

  amountSection: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DDF5E5",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
  },

  unpaidBadge: {
    backgroundColor: "#FFF1CC",
  },

  paidText: {
    fontSize: 12,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: "#178844",
    marginLeft: 4,
  },

  unpaidText: {
    color: "#B77900",
  },

  amountText: {
    fontSize: 21,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.primaryRed,
    marginTop: 14,
  },

  // ===================================================
  // TRANSACTION
  // ===================================================

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",

    borderTopWidth: 1,
    borderTopColor: "#E9E2DE",

    marginTop: 16,
    paddingTop: 13,
  },

  transactionText: {
    flex: 1,
    textAlign: "right",
    fontSize: 11.5,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#687386",
  },

  copyButton: {
    paddingLeft: 8,
    paddingVertical: 3,
  },

  // ===================================================
  // PAYMENT BOTTOM
  // ===================================================

  paymentBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  methodSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F4F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  methodText: {
    fontSize: 12.5,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: Colors.textPrimary || "#101B3A",
  },

  cardNumber: {
    fontSize: 10,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  invoiceButton: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 12,

    borderWidth: 1.5,
    borderColor: Colors.primaryRed,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: Colors.white,
    minWidth: 90,
  },

  invoiceButtonText: {
    fontSize: 11.5,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: Colors.primaryRed,
    marginLeft: 5,
  },

  detailsButton: {
    height: 46,
    paddingHorizontal: 13,
    borderRadius: 12,

    backgroundColor: Colors.primaryRed,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  detailsButtonText: {
    fontSize: 11.5,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
    color: Colors.white,
    marginRight: 5,
  },

  // ===================================================
  // EMPTY
  // ===================================================

  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F0E6E2",
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF0F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.textPrimary || "#101B3A",
  },

  emptyDescription: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#687386",
    marginTop: 8,
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: Colors.primaryRed,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
  },

  emptyButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts?.body?.bold || Fonts.bold,
  },

  // ===================================================
  // SECURITY
  // ===================================================

  securityBanner: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFF0F1",

    borderRadius: 17,

    paddingHorizontal: 16,
    paddingVertical: 16,

    marginTop: 3,
  },

  securityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,

    backgroundColor: "#FFE0E3",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 12,
  },

  securityContent: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 15,
    fontFamily: Fonts?.display?.bold || Fonts.bold,
    color: Colors.primaryRed,
  },

  securityDescription: {
    fontSize: 11.5,
    lineHeight: 18,
    fontFamily: Fonts?.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#687386",
    marginTop: 3,
  },

  bottomSpace: {
    height: 15,
  },
});
