import Feather from "react-native-vector-icons/Feather";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCallback, useEffect, useState } from "react";

// NOTE: needs `npm i @react-native-clipboard/clipboard` (+ pod install on iOS)
import Clipboard from "@react-native-clipboard/clipboard";

import { getPackagePurchaseInvoice, getToken } from "../utils/Functions";

const RED = "#C8202D";
const GREEN = "#1E8E3E";

// =====================================================
// SCREEN
// =====================================================

export default function InvoiceDetails() {
  const navigation = useNavigation();
  const route = useRoute();

  const packagePaymentId = route?.params?.package_payment_id;

  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState(null);

  // ---------------- GET INVOICE DETAILS ----------------

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);

      if (!packagePaymentId) {
        Alert.alert("Invoice", "Package payment ID is missing.", [
          {
            text: "OK",
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate("HomeScreen");
              }
            },
          },
        ]);
        return;
      }

      const token = await getToken();

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your session has expired. Please login again.",
        );
        return;
      }

      const response = await getPackagePurchaseInvoice(
        token,
        Number(packagePaymentId),
      );

      if (!response) {
        throw new Error("No response received from server.");
      }

      if (
        response.result === false ||
        response.success === 0 ||
        response.success === false
      ) {
        throw new Error(response.message || "Unable to load invoice details.");
      }

      setInvoiceData(extractInvoiceData(response));
      setInvoiceUrl(extractInvoiceUrl(response));
    } catch (error) {
      console.log("Invoice Details Error:", error);
      Alert.alert(
        "Invoice",
        error?.message || "Unable to load invoice details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [packagePaymentId]);

  // ---------------- BACK ----------------

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

  // ---------------- DOWNLOAD ----------------

  const handleDownloadInvoice = async () => {
    try {
      if (!invoiceUrl) {
        Alert.alert("Invoice", "Invoice download URL is not available.");
        return;
      }

      const supported = await Linking.canOpenURL(invoiceUrl);

      if (!supported) {
        Alert.alert("Invoice", "Unable to open invoice.");
        return;
      }

      await Linking.openURL(invoiceUrl);
    } catch (error) {
      console.log("Invoice open error:", error);
      Alert.alert("Invoice", "Unable to open invoice.");
    }
  };

  // ---------------- COPY CODE ----------------

  const handleCopy = (text) => {
    if (!text || text === "N/A") return;
    Clipboard.setString(String(text));
    Alert.alert("Copied", "Purchase code copied to clipboard.");
  };

  // ---------------- HEADER ----------------

  const renderHeader = (showDownload) => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        activeOpacity={0.7}
        onPress={handleBack}
      >
        <Feather name="arrow-left" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Invoice Details</Text>

      {showDownload ? (
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={handleDownloadInvoice}
        >
          <Feather name="download" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButton} />
      )}
    </View>
  );

  // ---------------- LOADING ----------------

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={RED} />
        {renderHeader(false)}

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RED} />
          <Text style={styles.loadingText}>Loading invoice details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------------- INVOICE ----------------

  const invoice = normalizeInvoice(invoiceData);
  const isPaid = /paid|success|captured|completed/i.test(
    String(invoice.paymentStatus),
  );
  const statusLabel = isPaid ? "Paid" : invoice.paymentStatus;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />

      {renderHeader(true)}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* TOP: icon + title + paid pill */}

          <View style={styles.topRow}>
            <View style={styles.topIconBox}>
              <Feather name="file-text" size={34} color={RED} />
            </View>

            <View style={styles.topTextBlock}>
              <Text style={styles.topTitle}>Invoice</Text>
              <Text style={styles.topSubtitle}>Purchase successful</Text>
            </View>

            <View style={styles.paidPill}>
              <View style={styles.paidPillIcon}>
                <Feather name="check" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.paidPillText}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* PURCHASE CODE */}

          <View style={styles.codeBox}>
            <View style={styles.codeTextBlock}>
              <Text style={styles.codeLabel}>Purchase Code</Text>
              <Text style={styles.codeValue} numberOfLines={1}>
                {invoice.purchaseCode}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.copyButton}
              onPress={() => handleCopy(invoice.purchaseCode)}
            >
              <Feather name="copy" size={22} color={RED} />
            </TouchableOpacity>
          </View>

          {/* DETAIL ROWS */}

          <View style={styles.rowsWrapper}>
            <InfoRow
              icon="calendar"
              label="Purchase Date"
              value={invoice.paymentDate}
            />
            <InfoRow icon="user" label="Name" value={invoice.memberName} />
            <InfoRow icon="mail" label="Email" value={invoice.email} />
            <InfoRow icon="phone" label="Phone" value={invoice.mobile} />
            <InfoRow
              icon="credit-card"
              label="Payment Method"
              value={invoice.paymentMethod}
            />
            <InfoRow
              iconNode={
                <View style={styles.greenCircle}>
                  <Feather name="check" size={16} color="#FFFFFF" />
                </View>
              }
              label="Payment Status"
              value={statusLabel}
              valueStyle={isPaid ? styles.valueGreen : null}
            />
            <InfoRow
              icon="package"
              label="Package Name"
              value={invoice.packageName}
            />
            <InfoRow
              iconNode={
                <View style={styles.rupeeCircle}>
                  <Text style={styles.rupeeText}>₹</Text>
                </View>
              }
              label="Amount"
              value={formatAmount(invoice.totalAmount)}
              last
            />
          </View>

          {/* TOTAL */}

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {formatAmount(invoice.totalAmount)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// INFO ROW
// =====================================================

function InfoRow({ icon, iconNode, label, value, valueStyle, last }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconCol}>
        {iconNode || <Feather name={icon} size={24} color="#3A3F47" />}
      </View>

      <View style={[styles.infoContent, !last && styles.infoContentBorder]}>
        <Text style={styles.infoLabel} numberOfLines={1}>
          {label}
        </Text>

        <Text
          style={[styles.infoValue, valueStyle]}
          numberOfLines={2}
        >
          {value || "N/A"}
        </Text>
      </View>
    </View>
  );
}

// =====================================================
// EXTRACT INVOICE DATA
// =====================================================

function extractInvoiceData(response) {
  if (!response) {
    return {};
  }

  return (
    response?.data?.data ||
    response?.data ||
    response?.result?.data ||
    response?.result ||
    response?.invoice ||
    response
  );
}

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
// NORMALIZE INVOICE
// =====================================================

function normalizeInvoice(data) {
  const invoice = data || {};

  const packageData =
    invoice?.package ||
    invoice?.package_details ||
    invoice?.packageDetails ||
    {};

  const member =
    invoice?.member ||
    invoice?.user ||
    invoice?.user_details ||
    invoice?.member_details ||
    {};

  const amount =
    invoice?.total_amount ??
    invoice?.totalAmount ??
    invoice?.amount ??
    invoice?.paid_amount ??
    invoice?.payment_amount ??
    invoice?.price ??
    0;

  return {
    purchaseCode:
      invoice?.purchase_code ||
      invoice?.purchaseCode ||
      invoice?.invoice_number ||
      invoice?.invoiceNumber ||
      invoice?.invoice_no ||
      invoice?.invoiceNo ||
      invoice?.invoice_id ||
      "N/A",

    memberName:
      invoice?.member_name ||
      invoice?.memberName ||
      invoice?.name ||
      member?.name ||
      member?.full_name ||
      member?.fullName ||
      "N/A",

    mobile:
      invoice?.mobile ||
      invoice?.phone ||
      invoice?.phone_number ||
      member?.mobile ||
      member?.phone ||
      member?.phone_number ||
      "N/A",

    email: invoice?.email || member?.email || "N/A",

    packageName:
      invoice?.package_name ||
      invoice?.packageName ||
      invoice?.plan_name ||
      invoice?.planName ||
      packageData?.name ||
      packageData?.package_name ||
      "Premium Membership",

    totalAmount: Number(amount || 0),

    paymentMethod: formatPaymentMethod(
      invoice?.payment_method ||
        invoice?.paymentMethod ||
        invoice?.method ||
        invoice?.gateway ||
        "N/A",
    ),

    paymentDate: formatDateTime(
      invoice?.purchase_date ||
        invoice?.purchaseDate ||
        invoice?.payment_date ||
        invoice?.paymentDate ||
        invoice?.paid_at ||
        invoice?.paidAt ||
        invoice?.created_at ||
        invoice?.createdAt,
    ),

    paymentStatus:
      invoice?.payment_status ||
      invoice?.paymentStatus ||
      invoice?.status ||
      "Paid",
  };
}

// =====================================================
// FORMATTERS
// =====================================================

function formatAmount(amount) {
  return `${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}Rs`;
}

// DD-MM-YYYY HH:mm:ss
function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const p = (n) => String(n).padStart(2, "0");

  return `${p(date.getDate())}-${p(date.getMonth() + 1)}-${date.getFullYear()} ${p(
    date.getHours(),
  )}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

function formatPaymentMethod(method) {
  const value = String(method || "").toLowerCase();

  if (value === "upi") return "UPI";
  if (["card", "credit_card", "debit_card"].includes(value)) {
    return "Credit / Debit Card";
  }
  if (["netbanking", "net_banking"].includes(value)) return "Net Banking";
  if (value === "wallet") return "Wallet";
  if (value === "emi") return "EMI / Pay Later";
  if (value === "razorpay") return "Razorpay";

  return method || "N/A";
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },

  // HEADER
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: RED,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    color: "#68717D",
    fontSize: 14,
    fontWeight: "500",
  },

  // CONTAINER
  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 14,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },

  // TOP ROW
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
  },

  topIconBox: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: "#FDE7E9",
    alignItems: "center",
    justifyContent: "center",
  },

  topTextBlock: {
    flex: 1,
    marginLeft: 14,
  },

  topTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F1320",
  },

  topSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  paidPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F5E8",
    borderRadius: 24,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
  },

  paidPillIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  paidPillText: {
    marginLeft: 7,
    fontSize: 16,
    fontWeight: "700",
    color: GREEN,
  },

  dashedDivider: {
    borderTopWidth: 1,
    borderTopColor: "#E2E4E8",
    borderStyle: "dashed",
    marginBottom: 14,
  },

  // PURCHASE CODE
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEE",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  codeTextBlock: {
    flex: 1,
  },

  codeLabel: {
    fontSize: 15,
    color: "#5B616B",
  },

  codeValue: {
    fontSize: 28,
    fontWeight: "800",
    color: RED,
    marginTop: 2,
    letterSpacing: 0.5,
  },

  copyButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FADADD",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  // ROWS
  rowsWrapper: {
    marginTop: 8,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoIconCol: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  infoContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50,
    paddingVertical: 14,
  },

  infoContentBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E6E8EC",
  },

  infoLabel: {
    fontSize: 16,
    color: "#5B616B",
  },

  infoValue: {
    flexShrink: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F1320",
    textAlign: "right",
  },

  valueGreen: {
    color: GREEN,
  },

  greenCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  rupeeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#3A3F47",
    alignItems: "center",
    justifyContent: "center",
  },

  rupeeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#3A3F47",
    lineHeight: 18,
  },

  // TOTAL
  totalBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FDECEE",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },

  totalLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: RED,
  },

  totalValue: {
    fontSize: 30,
    fontWeight: "800",
    color: RED,
  },
});