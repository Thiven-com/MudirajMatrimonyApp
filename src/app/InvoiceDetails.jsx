import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useEffect, useState } from "react";

import { Colors } from "../constants/colors";

import { getPackagePurchaseInvoice, getToken } from "../utils/Functions";

// =====================================================
// SCREEN
// =====================================================

export default function InvoiceDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const packagePaymentId = params.package_payment_id;

  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState(null);

  // ===================================================
  // GET INVOICE DETAILS
  // ===================================================

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);

      console.log("InvoiceDetails package_payment_id:", packagePaymentId);

      if (!packagePaymentId) {
        Alert.alert("Invoice", "Package payment ID is missing.", [
          {
            text: "OK",
            onPress: () => {
              if (router.canGoBack()) {
                router.back();
              }
            },
          },
        ]);

        return;
      }

      // -----------------------------------------------
      // GET TOKEN
      // -----------------------------------------------

      const token = await getToken();

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your session has expired. Please login again.",
        );

        return;
      }

      // -----------------------------------------------
      // CALL INVOICE API
      //
      // POST:
      // /api/member/package-purchase-history-invoice
      //
      // {
      //   package_payment_id: 7
      // }
      // -----------------------------------------------

      const response = await getPackagePurchaseInvoice(
        token,
        Number(packagePaymentId),
      );

      console.log("Invoice API Response:", JSON.stringify(response, null, 2));

      // -----------------------------------------------
      // CHECK RESPONSE
      // -----------------------------------------------

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

      // -----------------------------------------------
      // FIND ACTUAL INVOICE OBJECT
      // -----------------------------------------------

      const invoice = extractInvoiceData(response);

      console.log("Extracted Invoice:", JSON.stringify(invoice, null, 2));

      setInvoiceData(invoice);

      // -----------------------------------------------
      // FIND INVOICE URL
      // -----------------------------------------------

      const url = extractInvoiceUrl(response);

      console.log("Invoice URL:", url);

      setInvoiceUrl(url);
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

  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {
    fetchInvoiceDetails();
  }, [packagePaymentId]);

  // ===================================================
  // BACK
  // ===================================================

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  // ===================================================
  // DOWNLOAD / OPEN INVOICE
  // ===================================================

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

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.primary || "#D90000"}
        />

        {/* HEADER */}

        <LinearGradient
          colors={["#E60000", "#C90000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={27} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Invoice Details</Text>

          <View style={styles.headerButton} />
        </LinearGradient>

        {/* LOADING */}

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D90000" />

          <Text style={styles.loadingText}>Loading invoice details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===================================================
  // INVOICE
  // ===================================================

  const invoice = normalizeInvoice(invoiceData);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary || "#D90000"}
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <LinearGradient
        colors={["#E60000", "#C90000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={27} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Invoice Details</Text>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={handleDownloadInvoice}
        >
          <Ionicons name="download-outline" size={27} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* =================================================
          CONTENT
      ================================================= */}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            INVOICE CARD
        ================================================= */}

        <View style={styles.invoiceCard}>
          {/* =================================================
              BRAND HEADER
          ================================================= */}

          <LinearGradient
            colors={["#E00000", "#C90000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandHeader}
          >
            <View style={styles.logoCircle}>
              <Ionicons name="people" size={42} color="#D90000" />
            </View>

            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>Mudhiraj Community</Text>

              <Text style={styles.brandTagline}>
                Unity • Culture • Progress
              </Text>
            </View>

            <View style={styles.invoiceMeta}>
              <Text style={styles.metaLabel}>Invoice No.</Text>

              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>

              <Text style={[styles.metaLabel, styles.invoiceDateLabel]}>
                Invoice Date
              </Text>

              <Text style={styles.metaValue}>{invoice.invoiceDate}</Text>
            </View>
          </LinearGradient>

          {/* =================================================
              TITLE
          ================================================= */}

          <View style={styles.invoiceTitleContainer}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>

            <Text style={styles.invoiceSubtitle}>Membership Subscription</Text>
          </View>

          {/* =================================================
              MEMBER DETAILS
          ================================================= */}

          <InvoiceSection
            icon="person"
            iconBackground="#FFE1E1"
            iconColor="#D90000"
            title="Member Details"
          >
            <DetailRow label="Name" value={invoice.memberName} />

            <DetailRow label="Member ID" value={invoice.memberId} />

            <DetailRow label="Mobile" value={invoice.mobile} />

            <DetailRow label="Email" value={invoice.email} />
          </InvoiceSection>

          {/* =================================================
              PACKAGE DETAILS
          ================================================= */}

          <InvoiceSection
            icon="diamond"
            iconBackground="#FFF0D8"
            iconColor="#C77A00"
            title="Package Details"
          >
            <DetailRow label="Package Name" value={invoice.packageName} />

            <DetailRow label="Duration" value={invoice.duration} />

            <DetailRow label="Start Date" value={invoice.startDate} />

            <DetailRow label="End Date" value={invoice.endDate} />
          </InvoiceSection>

          {/* =================================================
              AMOUNT DETAILS
          ================================================= */}

          <InvoiceSection
            icon="cash"
            iconBackground="#DCF6E5"
            iconColor="#179447"
            title="Amount Details"
          >
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Original Price</Text>

              <Text style={styles.originalPrice}>
                {formatAmount(invoice.originalPrice)}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>
                Discount ({invoice.discountPercent}
                %)
              </Text>

              <Text style={styles.discountAmount}>
                - {formatAmount(invoice.discount)}
              </Text>
            </View>

            <View style={styles.dashedLine} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>

              <Text style={styles.totalAmount}>
                {formatAmount(invoice.totalAmount)}
              </Text>
            </View>
          </InvoiceSection>

          {/* =================================================
              PAYMENT DETAILS
          ================================================= */}

          <InvoiceSection
            icon="card"
            iconBackground="#DFEAFF"
            iconColor="#1764C0"
            title="Payment Details"
          >
            <DetailRow label="Payment Method" value={invoice.paymentMethod} />

            <DetailRow label="Transaction ID" value={invoice.transactionId} />

            <DetailRow
              label="Razorpay Order ID"
              value={invoice.razorpayOrderId}
            />

            <DetailRow label="Payment Date" value={invoice.paymentDate} />

            <View style={styles.statusRow}>
              <Text style={styles.detailLabel}>Payment Status</Text>

              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#168A3D" />

                <Text style={styles.statusText}>{invoice.paymentStatus}</Text>
              </View>
            </View>
          </InvoiceSection>

          {/* =================================================
              DOWNLOAD BUTTON
          ================================================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.downloadButtonWrapper}
            onPress={handleDownloadInvoice}
          >
            <LinearGradient
              colors={["#E00000", "#C90000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.downloadButton}
            >
              <Ionicons name="download-outline" size={24} color="#FFFFFF" />

              <Text style={styles.downloadButtonText}>Download Invoice</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* =================================================
              FOOTER
          ================================================= */}

          <View style={styles.footer}>
            <Text style={styles.thankYou}>Thank You!</Text>

            <Text style={styles.footerText}>
              This is a computer generated invoice
            </Text>

            <Text style={styles.footerText}>
              and does not require a signature.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// INVOICE SECTION
// =====================================================

function InvoiceSection({ icon, iconBackground, iconColor, title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIcon,
            {
              backgroundColor: iconBackground,
            },
          ]}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>

        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel} numberOfLines={1}>
        {label}
      </Text>

      <Text style={styles.colon}>:</Text>

      <Text style={styles.detailValue} numberOfLines={3}>
        {value || "N/A"}
      </Text>
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

  // Possible API structures
  return (
    response?.data?.data ||
    response?.data ||
    response?.result?.data ||
    response?.result ||
    response?.invoice ||
    response
  );
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

  const originalPrice =
    invoice?.original_price ??
    invoice?.originalPrice ??
    invoice?.package_price ??
    invoice?.packagePrice ??
    packageData?.price ??
    amount;

  const discount =
    invoice?.discount ??
    invoice?.discount_amount ??
    invoice?.discountAmount ??
    0;

  const discountPercent =
    invoice?.discount_percent ??
    invoice?.discountPercent ??
    calculateDiscountPercent(originalPrice, discount);

  return {
    invoiceNumber:
      invoice?.invoice_number ||
      invoice?.invoiceNumber ||
      invoice?.invoice_no ||
      invoice?.invoiceNo ||
      invoice?.invoice_id ||
      "N/A",

    invoiceDate: formatDate(
      invoice?.invoice_date ||
        invoice?.invoiceDate ||
        invoice?.created_at ||
        invoice?.createdAt,
    ),

    memberName:
      invoice?.member_name ||
      invoice?.memberName ||
      member?.name ||
      member?.full_name ||
      member?.fullName ||
      "N/A",

    memberId:
      invoice?.member_id ||
      invoice?.memberId ||
      member?.member_id ||
      member?.memberId ||
      member?.id ||
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

    duration:
      invoice?.duration ||
      invoice?.package_duration ||
      invoice?.packageDuration ||
      packageData?.duration ||
      packageData?.package_duration ||
      "N/A",

    startDate: formatDate(
      invoice?.start_date ||
        invoice?.startDate ||
        invoice?.package_start_date ||
        invoice?.packageStartDate,
    ),

    endDate: formatDate(
      invoice?.end_date ||
        invoice?.endDate ||
        invoice?.package_end_date ||
        invoice?.packageEndDate,
    ),

    originalPrice: Number(originalPrice || 0),

    discount: Number(discount || 0),

    discountPercent: Number(discountPercent || 0),

    totalAmount: Number(amount || 0),

    paymentMethod: formatPaymentMethod(
      invoice?.payment_method ||
        invoice?.paymentMethod ||
        invoice?.method ||
        invoice?.gateway ||
        "N/A",
    ),

    transactionId:
      invoice?.transaction_id ||
      invoice?.transactionId ||
      invoice?.txn_id ||
      invoice?.txnId ||
      invoice?.reference_id ||
      invoice?.referenceId ||
      invoice?.razorpay_payment_id ||
      invoice?.razorpayPaymentId ||
      "N/A",

    razorpayOrderId:
      invoice?.razorpay_order_id ||
      invoice?.razorpayOrderId ||
      invoice?.payment_order_id ||
      invoice?.paymentOrderId ||
      invoice?.order_id ||
      invoice?.orderId ||
      "N/A",

    paymentDate: formatDateTime(
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
      "Paid Successfully",
  };
}

// =====================================================
// FORMAT AMOUNT
// =====================================================

function formatAmount(amount) {
  return `₹ ${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// =====================================================
// CALCULATE DISCOUNT
// =====================================================

function calculateDiscountPercent(originalPrice, discount) {
  const original = Number(originalPrice || 0);

  const discountValue = Number(discount || 0);

  if (original <= 0 || discountValue <= 0) {
    return 0;
  }

  return Math.round((discountValue / original) * 100);
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// =====================================================
// FORMAT DATE + TIME
// =====================================================

function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =====================================================
// PAYMENT METHOD
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

  return method || "N/A";
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
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,

    elevation: 5,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  headerButton: {
    width: 42,
    height: 42,

    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,

    color: "#FFFFFF",

    fontSize: 20,
    fontWeight: "700",

    marginLeft: 6,
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F7F7F7",
  },

  loadingText: {
    marginTop: 14,

    color: "#68717D",

    fontSize: 14,
    fontWeight: "500",
  },

  // ===================================================
  // CONTAINER
  // ===================================================

  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 30,
  },

  // ===================================================
  // INVOICE CARD
  // ===================================================

  invoiceCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    overflow: "hidden",

    elevation: 4,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  // ===================================================
  // BRAND HEADER
  // ===================================================

  brandHeader: {
    minHeight: 145,

    paddingHorizontal: 18,
    paddingVertical: 20,

    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 68,
    height: 68,

    borderRadius: 34,

    backgroundColor: "#FFFFFF",

    alignItems: "center",
    justifyContent: "center",

    elevation: 3,
  },

  brandInfo: {
    flex: 1,

    marginLeft: 12,
  },

  brandName: {
    color: "#FFFFFF",

    fontSize: 18,
    fontWeight: "800",
  },

  brandTagline: {
    color: "#FFFFFF",

    fontSize: 12,

    marginTop: 5,

    opacity: 0.95,
  },

  invoiceMeta: {
    alignItems: "flex-end",

    marginLeft: 8,
  },

  metaLabel: {
    color: "#FFFFFF",

    fontSize: 10,

    opacity: 0.85,
  },

  invoiceDateLabel: {
    marginTop: 9,
  },

  metaValue: {
    color: "#FFFFFF",

    fontSize: 11,
    fontWeight: "700",

    marginTop: 2,

    textAlign: "right",
  },

  // ===================================================
  // INVOICE TITLE
  // ===================================================

  invoiceTitleContainer: {
    alignItems: "center",

    paddingTop: 18,
    paddingBottom: 12,
  },

  invoiceTitle: {
    fontSize: 32,
    fontWeight: "900",

    color: "#17202A",

    letterSpacing: 1,
  },

  invoiceSubtitle: {
    fontSize: 14,

    color: "#6C727A",

    marginTop: 2,
  },

  // ===================================================
  // SECTION
  // ===================================================

  section: {
    marginHorizontal: 14,
    marginTop: 12,

    backgroundColor: "#FAFAFA",

    borderRadius: 15,

    padding: 14,

    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 13,
  },

  sectionIcon: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    marginLeft: 11,

    fontSize: 17,
    fontWeight: "800",

    color: "#171C22",
  },

  sectionContent: {
    width: "100%",
  },

  // ===================================================
  // DETAIL ROW
  // ===================================================

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",

    marginBottom: 9,
  },

  detailLabel: {
    width: "34%",

    fontSize: 13,

    color: "#68717D",

    lineHeight: 19,
  },

  colon: {
    width: "7%",

    fontSize: 13,

    color: "#68717D",

    lineHeight: 19,

    textAlign: "center",
  },

  detailValue: {
    flex: 1,

    fontSize: 13,

    color: "#171717",

    fontWeight: "500",

    lineHeight: 19,
  },

  // ===================================================
  // AMOUNT
  // ===================================================

  amountRow: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 10,
  },

  amountLabel: {
    fontSize: 14,

    color: "#69717B",
  },

  originalPrice: {
    fontSize: 14,

    color: "#68717D",

    textDecorationLine: "line-through",
  },

  discountAmount: {
    fontSize: 14,

    color: "#168A3D",

    fontWeight: "600",
  },

  dashedLine: {
    borderTopWidth: 1,

    borderTopColor: "#D5D5D5",

    borderStyle: "dashed",

    marginVertical: 6,
  },

  totalRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    backgroundColor: "#FFF0F0",

    borderRadius: 10,

    paddingHorizontal: 10,
    paddingVertical: 10,

    marginTop: 4,
  },

  totalLabel: {
    fontSize: 15,

    color: "#171717",

    fontWeight: "800",
  },

  totalAmount: {
    fontSize: 23,

    color: "#D50000",

    fontWeight: "900",
  },

  // ===================================================
  // PAYMENT STATUS
  // ===================================================

  statusRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 2,
  },

  statusBadge: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#E1F8E8",

    borderRadius: 20,

    paddingHorizontal: 10,
    paddingVertical: 6,

    flexShrink: 1,
  },

  statusText: {
    color: "#168A3D",

    fontSize: 12,

    fontWeight: "800",

    marginLeft: 5,
  },

  // ===================================================
  // DOWNLOAD
  // ===================================================

  downloadButtonWrapper: {
    marginHorizontal: 14,

    marginTop: 18,

    borderRadius: 13,

    overflow: "hidden",

    elevation: 4,

    shadowColor: "#D00000",
    shadowOpacity: 0.2,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  downloadButton: {
    height: 55,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",
  },

  downloadButtonText: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "800",

    marginLeft: 10,
  },

  // ===================================================
  // FOOTER
  // ===================================================

  footer: {
    alignItems: "center",

    paddingVertical: 22,
    paddingHorizontal: 15,
  },

  thankYou: {
    color: "#D90000",

    fontSize: 22,

    fontWeight: "700",

    fontStyle: "italic",

    marginBottom: 10,
  },

  footerText: {
    color: "#858585",

    fontSize: 11,

    textAlign: "center",

    lineHeight: 17,
  },
});
