import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Feather from "react-native-vector-icons/Feather";

const Fonts = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
  extraBold: "Poppins-ExtraBold",
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
    heading: 32,
    display: 38,
  },
};

const COLORS = {
  red: "#C9080C",
  darkRed: "#A90B0F",
  gold: "#F7C64A",
  green: "#19B968",
  darkGreen: "#087C42",
  text: "#535766",
  darkText: "#30343F",
  white: "#FFFFFF",
  background: "#FFFFFF",
  border: "#F0E8E4",
};

export default function PaymentSuccessScreen({ navigation }) {
  const transaction = {
    id: "#TXN123456789",
    date: "24 Sep 2026, 10:45 AM",
    method: "UPI (Google Pay)",
    amount: "₹ 1,499.00",
  };

  const handleViewOrder = () => {
    navigation?.navigate("OrderDetails");
  };

  const handleContinueShopping = () => {
    navigation?.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.red} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <LinearGradient
            colors={[COLORS.red, "#B30A12"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          />

          {/* Gold curved layer */}
          <View style={styles.goldCurve} />

          {/* White curved layer */}
          <View style={styles.whiteCurve} />
        </View>

        {/* ================= SUCCESS SECTION ================= */}
        <View style={styles.successSection}>
          {/* Confetti */}
          <View style={[styles.confetti, styles.confettiOne]} />
          <View style={[styles.confetti, styles.confettiTwo]} />
          <View style={[styles.confetti, styles.confettiThree]} />
          <View style={[styles.confetti, styles.confettiFour]} />
          <View style={[styles.confetti, styles.confettiFive]} />
          <View style={[styles.confetti, styles.confettiSix]} />

          {/* Glow */}
          <View style={styles.successGlow}>
            <View style={styles.successCircle}>
              <Feather name="check" size={72} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.successTitle}>Payment Successful!</Text>

          <Text style={styles.successSubtitle}>
            Your payment has been completed{"\n"}
            successfully.
          </Text>
        </View>

        {/* ================= TRANSACTION CARD ================= */}
        <View style={styles.transactionCard}>
          <TransactionRow
            icon="file-text"
            label="Transaction ID"
            value={transaction.id}
          />

          <View style={styles.divider} />

          <TransactionRow
            icon="calendar"
            label="Date & Time"
            value={transaction.date}
          />

          <View style={styles.divider} />

          <TransactionRow
            icon="credit-card"
            label="Payment Method"
            value={transaction.method}
          />

          <View style={styles.divider} />

          <TransactionRow
            icon="dollar-sign"
            label="Amount Paid"
            value={transaction.amount}
            amount
          />
        </View>

        {/* ================= MESSAGE ================= */}
        <View style={styles.messageContainer}>
          <Text style={styles.thankYou}>Thank you for your payment.</Text>

          <Text style={styles.processingText}>
            Your order is now being processed.
          </Text>
        </View>

        {/* ================= BUTTONS ================= */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleViewOrder}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>View Order Details</Text>

            <Feather name="arrow-right" size={23} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleContinueShopping}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   TRANSACTION ROW
========================================================= */

const TransactionRow = ({ icon, label, value, amount = false }) => {
  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionIcon}>
          <Feather name={icon} size={20} color={COLORS.red} />
        </View>

        <Text style={styles.transactionLabel}>{label}</Text>
      </View>

      <Text
        style={[styles.transactionValue, amount && styles.amountValue]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* ================= HEADER ================= */

  header: {
    height: 145,
    position: "relative",
    overflow: "hidden",
  },

  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 115,
  },

  goldCurve: {
    position: "absolute",
    width: "125%",
    height: 95,
    left: "-12%",
    bottom: -62,
    borderRadius: 100,
    backgroundColor: COLORS.gold,
  },

  whiteCurve: {
    position: "absolute",
    width: "125%",
    height: 88,
    left: "-12%",
    bottom: -70,
    borderRadius: 100,
    backgroundColor: COLORS.white,
  },

  /* ================= SUCCESS ================= */

  successSection: {
    alignItems: "center",
    paddingTop: 35,
    paddingHorizontal: 20,
    position: "relative",
  },

  successGlow: {
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: "rgba(25,185,104,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },

  successCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.green,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: COLORS.green,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 25,
    elevation: 10,
  },

  successTitle: {
    marginTop: 10,
    fontSize: Fonts.size.heading,
    fontFamily: Fonts.extraBold,
    color: COLORS.darkGreen,
    textAlign: "center",
  },

  successSubtitle: {
    marginTop: 10,
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.regular,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 28,
  },

  /* ================= CONFETTI ================= */

  confetti: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  confettiOne: {
    top: 48,
    left: 78,
    backgroundColor: COLORS.green,
  },

  confettiTwo: {
    top: 30,
    left: "50%",
    backgroundColor: COLORS.green,
  },

  confettiThree: {
    top: 70,
    right: 85,
    backgroundColor: COLORS.gold,
  },

  confettiFour: {
    top: 125,
    left: 60,
    backgroundColor: COLORS.gold,
  },

  confettiFive: {
    top: 130,
    right: 70,
    backgroundColor: COLORS.green,
  },

  confettiSix: {
    top: 160,
    left: "50%",
    backgroundColor: COLORS.gold,
  },

  /* ================= TRANSACTION CARD ================= */

  transactionCard: {
    marginHorizontal: 46,
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 12,

    backgroundColor: "#FFFDFC",

    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: "#C9BEB8",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },

  transactionRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FCEBE9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  transactionLabel: {
    fontSize: Fonts.size.base,
    fontFamily: Fonts.regular,
    color: COLORS.text,
    flex: 1,
  },

  transactionValue: {
    maxWidth: "52%",
    fontSize: Fonts.size.base,
    fontFamily: Fonts.bold,
    color: "#555967",
    textAlign: "right",
  },

  amountValue: {
    color: "#11924F",
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE7E3",
    marginLeft: 64,
  },

  /* ================= MESSAGE ================= */

  messageContainer: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },

  thankYou: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.medium,
    color: COLORS.text,
    textAlign: "center",
  },

  processingText: {
    marginTop: 5,
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.regular,
    color: COLORS.text,
    textAlign: "center",
  },

  /* ================= BUTTONS ================= */

  buttonsContainer: {
    marginHorizontal: 50,
    marginTop: 38,
  },

  primaryButton: {
    height: 64,
    borderRadius: 16,
    backgroundColor: "#D52A2F",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#C51E23",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  primaryButtonText: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
    color: COLORS.white,
    marginRight: 16,
  },

  secondaryButton: {
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#C72A2E",

    alignItems: "center",
    justifyContent: "center",

    marginTop: 16,
    backgroundColor: COLORS.white,
  },

  secondaryButtonText: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
    color: "#B52A2D",
  },

  bottomSpace: {
    height: 30,
  },
});
