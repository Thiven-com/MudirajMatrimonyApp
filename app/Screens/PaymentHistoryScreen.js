import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  RefreshControl,
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
import Clipboard from "@react-native-clipboard/clipboard";

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

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
  const navigation = useNavigation();
  const route = useRoute();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // =====================================================
  // BACK HANDLER
  // =====================================================

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(
        route?.params?.page || "Home",
        route?.params?.prevs || {},
      );
    }

    return true;
  }, [navigation, route]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack,
      );

      return () => subscription.remove();
    }, [handleBack]),
  );

  // =====================================================
  // HELPERS
  // =====================================================

  const extractHistory = useCallback((response) => {
    if (!response) {
      return [];
    }

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

    if (Array.isArray(response?.data?.payments)) {
      return response.data.payments;
    }

    if (Array.isArray(response?.result?.payments)) {
      return response.result.payments;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.result?.data)) {
      return response.result.data;
    }

    return [];
  }, []);

  const formatDate = useCallback((dateValue) => {
    if (!dateValue) {
      return "-";
    }

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return String(dateValue);
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return String(dateValue);
    }
  }, []);

  const formatDateTime = useCallback((dateValue) => {
    if (!dateValue) {
      return "-";
    }

    try {
      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return String(dateValue);
      }

      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return String(dateValue);
    }
  }, []);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || value === "") {
      return "₹0";
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    return `₹${numericValue.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }, []);

  const getPaymentId = useCallback((item) => {
    return (
      item?.package_payment_id ??
      item?.payment_id ??
      item?.id ??
      item?.transaction_id ??
      item?.transactionId
    );
  }, []);

  const getTransactionId = useCallback((item) => {
    return (
      item?.transaction_id ??
      item?.transactionId ??
      item?.txn_id ??
      item?.txnId ??
      item?.payment_reference ??
      item?.reference_id ??
      item?.reference
    );
  }, []);

  const getPackageName = useCallback((item) => {
    return (
      item?.package_name ??
      item?.package?.name ??
      item?.package?.package_name ??
      item?.name ??
      item?.title ??
      "Membership Package"
    );
  }, []);

  const getAmount = useCallback((item) => {
    return (
      item?.amount ??
      item?.paid_amount ??
      item?.payment_amount ??
      item?.price ??
      item?.package_amount ??
      0
    );
  }, []);

  const getPaymentDate = useCallback((item) => {
    return (
      item?.payment_date ??
      item?.paid_at ??
      item?.created_at ??
      item?.date ??
      item?.purchase_date
    );
  }, []);

  const getPaymentMethod = useCallback((item) => {
    return (
      item?.payment_method ??
      item?.method ??
      item?.payment_type ??
      item?.gateway ??
      "Card"
    );
  }, []);

  const getStatus = useCallback((item) => {
    const status =
      item?.status ??
      item?.payment_status ??
      item?.transaction_status ??
      "success";

    return String(status);
  }, []);

  const getMethodIcon = useCallback((method) => {
    const value = String(method || "").toLowerCase();

    if (value.includes("upi")) {
      return "smartphone";
    }

    if (value.includes("card")) {
      return "credit-card";
    }

    if (value.includes("bank")) {
      return "briefcase";
    }

    if (value.includes("wallet")) {
      return "briefcase";
    }

    if (value.includes("emi")) {
      return "calendar";
    }

    return "credit-card";
  }, []);

  const isSuccessful = useCallback((status) => {
    const value = String(status || "").toLowerCase();

    return (
      value === "success" ||
      value === "successful" ||
      value === "paid" ||
      value === "completed" ||
      value === "active"
    );
  }, []);

  // =====================================================
  // FETCH PAYMENT HISTORY
  // =====================================================

  const fetchPaymentHistory = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const token = await getToken();

        if (!token) {
          Alert.alert(
            "Session Expired",
            "Please login again to view your purchase history.",
          );
          setPayments([]);
          return;
        }

        const response = await getPackagePurchaseHistory(token);

        const history = extractHistory(response);

        setPayments(history);
      } catch (error) {
        console.log("Purchase history error:", error);

        Alert.alert(
          "Error",
          error?.message ||
            "Unable to load your purchase history. Please try again.",
        );

        setPayments([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [extractHistory],
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchPaymentHistory(true);
  }, [fetchPaymentHistory]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPaymentHistory(false);
  }, [fetchPaymentHistory]);

  // =====================================================
  // INVOICE
  // =====================================================

  const handleInvoice = useCallback(
    async (payment) => {
      const paymentId = getPaymentId(payment);

      if (!paymentId) {
        Alert.alert(
          "Invoice Unavailable",
          "Payment ID is not available for this transaction.",
        );
        return;
      }

      try {
        setInvoiceLoading(true);

        const token = await getToken();

        if (!token) {
          Alert.alert(
            "Session Expired",
            "Please login again to download your invoice.",
          );
          return;
        }

        const response = await getPackagePurchaseInvoice(
          token,
          paymentId,
        );

        const invoiceUrl =
          response?.invoice_url ??
          response?.url ??
          response?.data?.invoice_url ??
          response?.data?.url ??
          response?.result?.invoice_url ??
          response?.result?.url;

        if (!invoiceUrl) {
          Alert.alert(
            "Invoice Unavailable",
            "Invoice link is not available for this payment.",
          );
          return;
        }

        const supported = await Linking.canOpenURL(invoiceUrl);

        if (!supported) {
          Alert.alert(
            "Unable to Open Invoice",
            "Your device cannot open this invoice link.",
          );
          return;
        }

        await Linking.openURL(invoiceUrl);
      } catch (error) {
        console.log("Invoice error:", error);

        Alert.alert(
          "Invoice Error",
          error?.message ||
            "Unable to open invoice. Please try again.",
        );
      } finally {
        setInvoiceLoading(false);
      }
    },
    [getPaymentId],
  );

  // =====================================================
  // DETAILS
  // =====================================================

  const handleDetails = useCallback(
    (payment) => {
      const transactionId = getTransactionId(payment);
      const packageName = getPackageName(payment);
      const amount = getAmount(payment);
      const paymentDate = getPaymentDate(payment);
      const paymentMethod = getPaymentMethod(payment);
      const status = getStatus(payment);

      Alert.alert(
        "Payment Details",
        `Package: ${packageName}\n\n` +
          `Amount: ${formatCurrency(amount)}\n\n` +
          `Payment Method: ${paymentMethod}\n\n` +
          `Transaction ID: ${transactionId || "-"}\n\n` +
          `Date: ${formatDateTime(paymentDate)}\n\n` +
          `Status: ${status}`,
        [
          {
            text: "Close",
            style: "cancel",
          },
        ],
      );
    },
    [
      formatCurrency,
      formatDateTime,
      getAmount,
      getPackageName,
      getPaymentDate,
      getPaymentMethod,
      getStatus,
      getTransactionId,
    ],
  );

  // =====================================================
  // COPY TRANSACTION ID
  // =====================================================

  const handleCopyTransaction = useCallback(
    async (transactionId) => {
      if (!transactionId) {
        Alert.alert(
          "Unavailable",
          "Transaction ID is not available.",
        );
        return;
      }

      try {
        await Clipboard.setString(String(transactionId));

        Alert.alert(
          "Copied",
          "Transaction ID copied to clipboard.",
        );
      } catch (error) {
      }
    },
    [],
  );

  // =====================================================
  // SUMMARY
  // =====================================================

  const summary = useMemo(() => {
    const successfulPayments = payments.filter((item) =>
      isSuccessful(getStatus(item)),
    );

    const totalSpent = successfulPayments.reduce((sum, item) => {
      const amount = Number(getAmount(item));

      if (Number.isNaN(amount)) {
        return sum;
      }

      return sum + amount;
    }, 0);

    return {
      totalPayments: payments.length,
      successfulPayments: successfulPayments.length,
      totalSpent,
    };
  }, [payments, getAmount, getStatus, isSuccessful]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors?.primary || "#D92332"}
        />

        <LinearGradient
          colors={[
            Colors?.primary || "#D92332",
            Colors?.primaryDark || "#B51E2A",
          ]}
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
          />

          <Text style={styles.loadingText}>
            Loading purchase history...
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // =====================================================
  // EMPTY STATE
  // =====================================================

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Feather
            name="file-text"
            size={42}
            color="#D92332"
          />
        </View>

        <Text style={styles.emptyTitle}>
          No Purchase History
        </Text>

        <Text style={styles.emptyDescription}>
          You haven't made any package purchases yet.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.emptyButton}
          onPress={() =>
            navigation.navigate(
              route?.params?.packagePage || "Packages",
            )
          }
        >
          <Text style={styles.emptyButtonText}>
            View Packages
          </Text>

          <Feather
            name="arrow-right"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors?.primary || "#D92332"}
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <LinearGradient
        colors={[
          Colors?.primary || "#D92332",
          Colors?.primaryDark || "#B51E2A",
        ]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.backButton}
            onPress={handleBack}
          >
            <Feather
              name="arrow-left"
              size={23}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              Purchase History
            </Text>

            <Text style={styles.headerSubtitle}>
              Your membership payments
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Feather
              name="refresh-cw"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#D92332"
            colors={["#D92332"]}
          />
        }
      >
        {/* =================================================
            SUMMARY CARD
        ================================================= */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Feather
                name="file-text"
                size={24}
                color="#D92332"
              />
            </View>

            <View style={styles.summaryHeaderText}>
              <Text style={styles.summaryTitle}>
                Payment Summary
              </Text>

              <Text style={styles.summarySubtitle}>
                Overview of your purchases
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {summary.totalPayments}
              </Text>

              <Text style={styles.summaryLabel}>
                Total Payments
              </Text>
            </View>

            <View style={styles.summaryVerticalDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {summary.successfulPayments}
              </Text>

              <Text style={styles.summaryLabel}>
                Successful
              </Text>
            </View>

            <View style={styles.summaryVerticalDivider} />

            <View style={styles.summaryItem}>
              <Text
                style={[
                  styles.summaryValue,
                  styles.amountValue,
                ]}
              >
                {formatCurrency(summary.totalSpent)}
              </Text>

              <Text style={styles.summaryLabel}>
                Total Spent
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            PURCHASE HISTORY
        ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Payment History
            </Text>

            <Text style={styles.sectionSubtitle}>
              {payments.length} transaction
              {payments.length === 1 ? "" : "s"}
            </Text>
          </View>

          <View style={styles.receiptIcon}>
            <Feather
              name="receipt"
              size={21}
              color="#D92332"
            />
          </View>
        </View>

        {payments.length === 0
          ? renderEmptyState()
          : payments.map((payment, index) => (
              <PaymentCard
                key={
                  getPaymentId(payment) ??
                  payment?.transaction_id ??
                  index
                }
                payment={payment}
                navigation={navigation}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getPaymentId={getPaymentId}
                getTransactionId={getTransactionId}
                getPackageName={getPackageName}
                getAmount={getAmount}
                getPaymentDate={getPaymentDate}
                getPaymentMethod={getPaymentMethod}
                getStatus={getStatus}
                getMethodIcon={getMethodIcon}
                isSuccessful={isSuccessful}
                handleInvoice={handleInvoice}
                handleDetails={handleDetails}
                handleCopyTransaction={
                  handleCopyTransaction
                }
                invoiceLoading={invoiceLoading}
              />
            ))}

        {/* =================================================
            SECURITY BANNER
        ================================================= */}

        <View style={styles.securityBanner}>
          <View style={styles.securityIcon}>
            <Feather
              name="shield"
              size={24}
              color="#2E7D32"
            />
          </View>

          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>
              Your payments are secure
            </Text>

            <Text style={styles.securityDescription}>
              All your payment transactions are securely
              recorded and protected.
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
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
  navigation,
  formatCurrency,
  formatDate,
  getPaymentId,
  getTransactionId,
  getPackageName,
  getAmount,
  getPaymentDate,
  getPaymentMethod,
  getStatus,
  getMethodIcon,
  isSuccessful,
  handleInvoice,
  handleDetails,
  handleCopyTransaction,
  invoiceLoading,
}) {
  const paymentId = getPaymentId(payment);
  const transactionId = getTransactionId(payment);
  const packageName = getPackageName(payment);
  const amount = getAmount(payment);
  const paymentDate = getPaymentDate(payment);
  const paymentMethod = getPaymentMethod(payment);
  const status = getStatus(payment);

  const successful = isSuccessful(status);

  const normalizedStatus = String(status || "")
    .toLowerCase()
    .trim();

  const statusText = successful
    ? "Successful"
    : normalizedStatus
      ? normalizedStatus.charAt(0).toUpperCase() +
        normalizedStatus.slice(1)
      : "Pending";

  return (
    <View style={styles.paymentCard}>
      {/* =================================================
          CARD HEADER
      ================================================= */}

      <View style={styles.paymentHeader}>
        <View style={styles.packageIcon}>
          <Feather
            name="award"
            size={25}
            color="#D92332"
          />
        </View>

        <View style={styles.packageInfo}>
          <Text
            style={styles.packageName}
            numberOfLines={2}
          >
            {packageName}
          </Text>

          <Text style={styles.paymentDate}>
            {formatDate(paymentDate)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            successful
              ? styles.statusSuccess
              : styles.statusPending,
          ]}
        >
          <Feather
            name={
              successful
                ? "check-circle"
                : "alert-circle"
            }
            size={13}
            color={
              successful
                ? "#2E7D32"
                : "#F57C00"
            }
          />

          <Text
            style={[
              styles.statusText,
              successful
                ? styles.statusSuccessText
                : styles.statusPendingText,
            ]}
          >
            {statusText}
          </Text>
        </View>
      </View>

      {/* =================================================
          AMOUNT
      ================================================= */}

      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>
          Amount Paid
        </Text>

        <Text style={styles.amount}>
          {formatCurrency(amount)}
        </Text>
      </View>

      {/* =================================================
          DETAILS
      ================================================= */}

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={styles.detailIcon}>
              <Feather
                name={getMethodIcon(paymentMethod)}
                size={17}
                color="#666666"
              />
            </View>

            <Text style={styles.detailLabel}>
              Payment Method
            </Text>
          </View>

          <Text style={styles.detailValue}>
            {paymentMethod || "-"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={styles.detailIcon}>
              <Feather
                name="calendar"
                size={17}
                color="#666666"
              />
            </View>

            <Text style={styles.detailLabel}>
              Payment Date
            </Text>
          </View>

          <Text style={styles.detailValue}>
            {formatDate(paymentDate)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailLeft}>
            <View style={styles.detailIcon}>
              <Feather
                name="check-circle"
                size={17}
                color="#666666"
              />
            </View>

            <Text style={styles.detailLabel}>
              Status
            </Text>
          </View>

          <Text
            style={[
              styles.detailValue,
              successful && styles.successDetailValue,
            ]}
          >
            {statusText}
          </Text>
        </View>
      </View>

      {/* =================================================
          TRANSACTION ID
      ================================================= */}

      {transactionId ? (
        <View style={styles.transactionContainer}>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionTitleContainer}>
              <Feather
                name="file-text"
                size={15}
                color="#777777"
              />

              <Text style={styles.transactionLabel}>
                Transaction ID
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                handleCopyTransaction(transactionId)
              }
            >
              <Feather
                name="copy"
                size={17}
                color="#D92332"
              />
            </TouchableOpacity>
          </View>

          <Text
            style={styles.transactionId}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {String(transactionId)}
          </Text>
        </View>
      ) : null}

      {/* =================================================
          ACTIONS
      ================================================= */}

      <View style={styles.actionContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.detailsButton}
          onPress={() => handleDetails(payment)}
        >
          <Feather
            name="file-text"
            size={17}
            color="#D92332"
          />

          <Text style={styles.detailsButtonText}>
            Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.invoiceButton}
          disabled={invoiceLoading}
          onPress={() => handleInvoice(payment)}
        >
          {invoiceLoading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Feather
                name="file-text"
                size={17}
                color="#FFFFFF"
              />

              <Text style={styles.invoiceButtonText}>
                Invoice
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* =================================================
          PACKAGE PAYMENT DETAILS
      ================================================= */}

      {paymentId ? (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.viewPaymentButton}
          onPress={() =>
            navigation.navigate("Invoice", {
              package_payment_id: paymentId,
            })
          }
        >
          <View style={styles.viewPaymentLeft}>
            <Feather
              name="file-text"
              size={16}
              color="#777777"
            />

            <Text style={styles.viewPaymentText}>
              View payment details
            </Text>
          </View>

          <Feather
            name="chevron-right"
            size={18}
            color="#777777"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 14,
  },

  headerTitle: {
    fontFamily: Fonts?.bold || undefined,
    fontSize: FontSizes?.large || 20,
    color: "#FFFFFF",
  },

  headerSubtitle: {
    marginTop: 3,
    fontFamily: Fonts?.regular || undefined,
    fontSize: FontSizes?.small || 12,
    color: "rgba(255,255,255,0.82)",
  },

  // ===================================================
  // CONTAINER
  // ===================================================

  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },

  // ===================================================
  // SUMMARY CARD
  // ===================================================

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  summaryTitle: {
    fontFamily: Fonts?.bold || undefined,
    fontSize: 17,
    color: "#222222",
  },

  summarySubtitle: {
    marginTop: 3,
    fontFamily: Fonts?.regular || undefined,
    fontSize: 12,
    color: "#888888",
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 18,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryValue: {
    fontFamily: Fonts?.bold || undefined,
    fontSize: 18,
    color: "#222222",
  },

  amountValue: {
    fontSize: 16,
    color: "#D92332",
  },

  summaryLabel: {
    marginTop: 5,
    fontFamily: Fonts?.regular || undefined,
    fontSize: 11,
    color: "#888888",
    textAlign: "center",
  },

  summaryVerticalDivider: {
    width: 1,
    height: 38,
    backgroundColor: "#EEEEEE",
  },

  // ===================================================
  // SECTION
  // ===================================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontFamily: Fonts?.bold || undefined,
    fontSize: 18,
    color: "#222222",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontFamily: Fonts?.regular || undefined,
    fontSize: 12,
    color: "#888888",
  },

  receiptIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
  },

  // ===================================================
  // PAYMENT CARD
  // ===================================================

  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  paymentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
  },

  packageInfo: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 8,
  },

  packageName: {
    fontFamily: Fonts?.bold || undefined,
    fontSize: 15,
    color: "#222222",
    lineHeight: 21,
  },

  paymentDate: {
    marginTop: 5,
    fontFamily: Fonts?.regular || undefined,
    fontSize: 12,
    color: "#888888",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusSuccess: {
    backgroundColor: "#E8F5E9",
  },

  statusPending: {
    backgroundColor: "#FFF3E0",
  },

  statusText: {
    marginLeft: 4,
    fontFamily: Fonts?.semiBold || Fonts?.medium || undefined,
    fontSize: 10,
  },

  statusSuccessText: {
    color: "#2E7D32",
  },

  statusPendingText: {
    color: "#F57C00",
  },

  // ===================================================
  // AMOUNT
  // ===================================================

  amountSection: {
    marginTop: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  amountLabel: {
    fontFamily: Fonts?.regular || undefined,
    fontSize: 12,
    color: "#777777",
  },

  amount: {
    fontFamily: Fonts?.bold || undefined,
    fontSize: 21,
    color: "#D92332",
  },

  // ===================================================
  // DETAILS
  // ===================================================

  detailsContainer: {
    marginTop: 15,
  },

  detailRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  detailIcon: {
    width: 30,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  detailLabel: {
    fontFamily: Fonts?.regular || undefined,
    fontSize: 12,
    color: "#777777",
  },

  detailValue: {
    maxWidth: "50%",
    fontFamily: Fonts?.medium || Fonts?.regular || undefined,
    fontSize: 12,
    color: "#333333",
    textAlign: "right",
  },

  successDetailValue: {
    color: "#2E7D32",
  },

  // ===================================================
  // TRANSACTION
  // ===================================================

  transactionContainer: {
    marginTop: 10,
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  transactionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  transactionLabel: {
    marginLeft: 6,
    fontFamily: Fonts?.medium || Fonts?.regular || undefined,
    fontSize: 11,
    color: "#777777",
  },

  transactionId: {
    marginTop: 7,
    fontFamily: Fonts?.regular || undefined,
    fontSize: 11,
    color: "#444444",
  },

  // ===================================================
  // ACTION BUTTONS
  // ===================================================

  actionContainer: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },

  detailsButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#D92332",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  detailsButtonText: {
    marginLeft: 7,
    fontFamily: Fonts?.semiBold || Fonts?.medium || undefined,
    fontSize: 13,
    color: "#D92332",
  },

  invoiceButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: "#D92332",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  invoiceButtonText: {
    marginLeft: 7,
    fontFamily: Fonts?.semiBold || Fonts?.medium || undefined,
    fontSize: 13,
    color: "#FFFFFF",
  },

  // ===================================================
  // VIEW PAYMENT
  // ===================================================

  viewPaymentButton: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  viewPaymentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  viewPaymentText: {
    marginLeft: 7,
    fontFamily: Fonts?.medium || Fonts?.regular || undefined,
    fontSize: 12,
    color: "#777777",
  },

  // ===================================================
  // EMPTY STATE
  // ===================================================

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 38,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  emptyIconContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 17,
    fontFamily: Fonts?.bold || undefined,
    fontSize: 18,
    color: "#222222",
  },

  emptyDescription: {
    marginTop: 7,
    fontFamily: Fonts?.regular || undefined,
    fontSize: 13,
    color: "#888888",
    textAlign: "center",
    lineHeight: 20,
  },

  emptyButton: {
    marginTop: 20,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: "#D92332",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonText: {
    marginRight: 8,
    fontFamily: Fonts?.semiBold || Fonts?.medium || undefined,
    fontSize: 13,
    color: "#FFFFFF",
  },

  // ===================================================
  // SECURITY
  // ===================================================

  securityBanner: {
    marginTop: 6,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#EAF6EB",
    borderWidth: 1,
    borderColor: "#D5EBD7",
    flexDirection: "row",
    alignItems: "center",
  },

  securityIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DFF0E1",
    alignItems: "center",
    justifyContent: "center",
  },

  securityContent: {
    flex: 1,
    marginLeft: 11,
  },

  securityTitle: {
    fontFamily: Fonts?.bold || undefined,
    fontSize: 13,
    color: "#2E7D32",
  },

  securityDescription: {
    marginTop: 3,
    fontFamily: Fonts?.regular || undefined,
    fontSize: 11,
    color: "#558B5A",
    lineHeight: 17,
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 13,
    fontFamily: Fonts?.medium || Fonts?.regular || undefined,
    fontSize: 13,
    color: "#FFFFFF",
  },

  bottomSpace: {
    height: 20,
  },
});