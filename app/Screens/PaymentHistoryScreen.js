import {
  BackHandler,
  Dimensions,
  Modal,
  Platform,
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

import Svg, { Path } from "react-native-svg";

import { Colors } from "../constants/colors";

import Fonts from "../constants/Fonts";

/* ===
   SCREEN WIDTH
=== */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const HEADER_HEIGHT = 108;

/* ===
   STATUS TABS
=== */

const STATUS_TABS = ["All", "Successful", "Pending", "Failed"];

/* ===
   DATE RANGES
=== */

const DATE_RANGES = [
  {
    key: "all",
    label: "All Time",
  },

  {
    key: "30d",
    label: "Last 30 Days",
  },

  {
    key: "3m",
    label: "Last 3 Months",
  },

  {
    key: "6m",
    label: "Last 6 Months",
  },
];

/* ===
   TRANSACTIONS
=== */

const TRANSACTIONS = [
  {
    id: "1",

    title: "Premium Membership – 12 Months",

    orderId: "MW12345678",

    date: "20 May 2024, 10:30 AM",

    dateValue: new Date(2024, 4, 20),

    amount: 2999,

    status: "Successful",

    icon: "crown",

    iconBg: "#FDF3D8",
  },

  {
    id: "2",

    title: "Premium Membership – 6 Months",

    orderId: "MW98765432",

    date: "15 Nov 2023, 09:15 AM",

    dateValue: new Date(2023, 10, 15),

    amount: 1999,

    status: "Successful",

    icon: "crown",

    iconBg: "#FDF3D8",
  },

  {
    id: "3",

    title: "Premium Membership – 3 Months",

    orderId: "MW56781234",

    date: "10 Aug 2023, 08:45 PM",

    dateValue: new Date(2023, 7, 10),

    amount: 999,

    status: "Successful",

    icon: "wallet",

    iconBg: "#FDEAE0",
  },

  {
    id: "4",

    title: "Contact Details Access",

    orderId: "MW34567890",

    date: "05 Jul 2023, 07:20 PM",

    dateValue: new Date(2023, 6, 5),

    amount: 199,

    status: "Successful",

    icon: "log-in",

    iconBg: "#EDE7F6",
  },

  {
    id: "5",

    title: "Premium Membership – 12 Months",

    orderId: "MW24681357",

    date: "18 Jun 2023, 11:05 AM",

    dateValue: new Date(2023, 5, 18),

    amount: 2999,

    status: "Failed",

    icon: "credit-card",

    iconBg: "#FDEAE0",
  },

  {
    id: "6",

    title: "Premium Membership – 12 Months",

    orderId: "MW13579246",

    date: "20 May 2023, 10:30 AM",

    dateValue: new Date(2023, 4, 20),

    amount: 2999,

    status: "Successful",

    icon: "crown",

    iconBg: "#FDF3D8",
  },

  {
    id: "7",

    title: "Profile Highlight",

    orderId: "MW11223344",

    date: "12 Apr 2023, 06:40 PM",

    dateValue: new Date(2023, 3, 12),

    amount: 149,

    status: "Successful",

    icon: "log-in",

    iconBg: "#EDE7F6",
  },
];

/* ===
   TRANSACTION TYPES
=== */

const TRANSACTION_TYPES = [
  ...new Set(TRANSACTIONS.map((transaction) => transaction.title)),
];

/* ===
   EMPTY FILTERS
=== */

const EMPTY_FILTERS = {
  types: [],
};

export default function PaymentHistoryScreen({ navigation, route }) {

  const [activeStatus, setActiveStatus] = useState("All");

  const [dateRange, setDateRange] = useState("all");

  const [dateMenuVisible, setDateMenuVisible] = useState(false);

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const activeFilterCount = filters.types.length;

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (filterSheetVisible) {
          setFilterSheetVisible(false);

          return true;
        }

        if (dateMenuVisible) {
          setDateMenuVisible(false);

          return true;
        }

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
    }, [handleBack, filterSheetVisible, dateMenuVisible]),
  );

  /* ====
     OPEN FILTER
  ==== */

  const openFilterSheet = () => {
    setDraftFilters(filters);

    setFilterSheetVisible(true);
  };

  /* ====
     APPLY FILTER
  ==== */

  const applyFilters = () => {
    setFilters(draftFilters);

    setFilterSheetVisible(false);
  };

  /* ====
     RESET FILTER
  ==== */

  const resetDraftFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
  };

  /* ====
     TOGGLE TRANSACTION TYPE
  ==== */

  const toggleDraftType = (type) => {
    setDraftFilters((previous) => {
      const has = previous.types.includes(type);

      return {
        ...previous,

        types: has
          ? previous.types.filter((item) => item !== type)
          : [...previous.types, type],
      };
    });
  };

  /* ====
     SUMMARY
  ==== */

  const summary = useMemo(() => {
    const successful = TRANSACTIONS.filter(
      (transaction) => transaction.status === "Successful",
    );

    const failed = TRANSACTIONS.filter(
      (transaction) => transaction.status === "Failed",
    );

    const totalSpent = successful.reduce(
      (sum, transaction) => sum + transaction.amount,

      0,
    );

    return {
      totalSpent,

      successfulAmount: totalSpent,

      successfulCount: successful.length,

      failedAmount: failed.reduce(
        (sum, transaction) => sum + transaction.amount,

        0,
      ),

      failedCount: failed.length,
    };
  }, []);

  /* ====
     FILTERED TRANSACTIONS
  ==== */

  const filteredTransactions = useMemo(() => {
    let list = TRANSACTIONS;

    /* STATUS */

    if (activeStatus !== "All") {
      list = list.filter((transaction) => transaction.status === activeStatus);
    }

    /* DATE */

    if (dateRange !== "all") {
      const now = new Date();

      const cutoffDays = {
        "30d": 30,
        "3m": 90,
        "6m": 180,
      }[dateRange];

      const cutoff = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);

      list = list.filter((transaction) => transaction.dateValue >= cutoff);
    }

    /* TRANSACTION TYPE */

    if (filters.types.length > 0) {
      list = list.filter((transaction) =>
        filters.types.includes(transaction.title),
      );
    }

    return list;
  }, [activeStatus, dateRange, filters]);

  /* ====
     CURRENT DATE LABEL
  ==== */

  const currentDateRangeLabel = DATE_RANGES.find(
    (range) => range.key === dateRange,
  )?.label;

  /* ====
     UI
  ==== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryRed} />

      {/* =====
          HEADER
      ===== */}

      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={Colors.gradientHeader}
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
            onPress={handleBack}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
            activeOpacity={0.8}
            style={styles.headerBackButton}
          >
            <Feather name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>

          {/* TITLE */}

          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Payment History</Text>

            <Text style={styles.headerSubtitle}>
              View your all payment transactions
            </Text>
          </View>

          {/* FILTER */}

          <TouchableOpacity
            style={styles.filterHeaderButton}
            onPress={openFilterSheet}
            activeOpacity={0.8}
          >
            <Feather name="filter" size={16} color={Colors.white} />

            <Text style={styles.filterHeaderText}>Filter</Text>

            {activeFilterCount > 0 && (
              <View style={styles.filterHeaderBadge}>
                <Text style={styles.filterHeaderBadgeText}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* GOLD LINE */}

        <Svg
          width={SCREEN_WIDTH}
          height={10}
          viewBox={`0 0 ${SCREEN_WIDTH} 10`}
        >
          <Path d={`M0,0 H${SCREEN_WIDTH} V6 H0 Z`} fill={Colors.gold} />
        </Svg>
      </View>

      {/* =====
          CONTENT
      ===== */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===
            SUMMARY CARD
        === */}

        <View style={styles.summaryCard}>
          {/* TOTAL */}

          <View style={styles.summaryLeft}>
            <View style={styles.summaryIconCircle}>
              <Feather name="credit-card" size={22} color={Colors.white} />
            </View>

            <View>
              <Text style={styles.summaryLabel}>Total Spent</Text>

              <Text style={styles.summaryAmount}>
                ₹ {summary.totalSpent.toLocaleString("en-IN")}
              </Text>

              <Text style={styles.summarySub}>All Time</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          {/* SUCCESSFUL */}

          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Successful</Text>

            <Text
              style={[
                styles.summaryStatAmount,
                {
                  color: Colors.success,
                },
              ]}
            >
              ₹ {summary.successfulAmount.toLocaleString("en-IN")}
            </Text>

            <Text style={styles.summaryStatSub}>
              {summary.successfulCount} Transactions
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          {/* FAILED */}

          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Failed</Text>

            <Text
              style={[
                styles.summaryStatAmount,
                {
                  color: Colors.primaryRed,
                },
              ]}
            >
              ₹ {summary.failedAmount.toLocaleString("en-IN")}
            </Text>

            <Text style={styles.summaryStatSub}>
              {summary.failedCount} Transactions
            </Text>
          </View>
        </View>

        {/* ===
            STATUS TABS
        === */}

        <View style={styles.tabsRow}>
          <View style={styles.statusTabsGroup}>
            {STATUS_TABS.map((status) => {
              const isActive = activeStatus === status;

              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusTab, isActive && styles.statusTabActive]}
                  onPress={() => setActiveStatus(status)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.statusTabText,
                      isActive && styles.statusTabTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ===
            DATE RANGE
        === */}

        <TouchableOpacity
          style={styles.dateRangeButton}
          onPress={() => setDateMenuVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="calendar" size={16} color={Colors.primaryRed} />

          <Text style={styles.dateRangeText}>{currentDateRangeLabel}</Text>

          <Feather name="chevron-down" size={15} color={Colors.primaryRed} />
        </TouchableOpacity>

        {/* ===
            TRANSACTION LIST
        === */}

        <View style={styles.transactionList}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} tx={transaction} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="file-text" size={30} color={Colors.textMuted} />

              <Text style={styles.emptyStateText}>
                No transactions match these filters.
              </Text>
            </View>
          )}
        </View>

        {/* ===
            NEED HELP
        === */}

        <View style={styles.helpBanner}>
          <View style={styles.helpIconCircle}>
            <Feather name="headphones" size={20} color={Colors.white} />
          </View>

          <View style={styles.helpTextBlock}>
            <Text style={styles.helpTitle}>Need Help?</Text>

            <Text style={styles.helpSubtitle}>
              If you have any queries regarding payments, please contact our
              support team.
            </Text>
          </View>
        </View>

        {/* CONTACT SUPPORT */}

        <TouchableOpacity
          style={styles.contactSupportButton}
          activeOpacity={0.8}
        >
          <Feather name="headphones" size={16} color={Colors.primaryRed} />

          <Text style={styles.contactSupportText}>Contact Support</Text>
        </TouchableOpacity>

        {/* ===
            FOOTER
        === */}

        <View style={styles.secureRow}>
          <Feather name="lock" size={13} color={Colors.textMuted} />

          <Text style={styles.secureText}>
            All transactions are secure and encrypted.
          </Text>
        </View>
      </ScrollView>

      {/* =====
          DATE RANGE MODAL
      ===== */}

      <Modal
        visible={dateMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.dateModalOverlay}
          activeOpacity={1}
          onPress={() => setDateMenuVisible(false)}
        >
          <View style={styles.dateMenu}>
            {DATE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={styles.dateMenuOption}
                onPress={() => {
                  setDateRange(range.key);

                  setDateMenuVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dateMenuOptionText,
                    dateRange === range.key && styles.dateMenuOptionTextActive,
                  ]}
                >
                  {range.label}
                </Text>

                {dateRange === range.key && (
                  <Feather name="check" size={16} color={Colors.primaryRed} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* =====
          FILTER MODAL
      ===== */}

      <Modal
        visible={filterSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.filterModalOverlay}
          activeOpacity={1}
          onPress={() => setFilterSheetVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.filterModalCard}>
            {/* HANDLE */}

            <View style={styles.modalHandle} />

            {/* HEADER */}

            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>

              <TouchableOpacity
                onPress={() => setFilterSheetVisible(false)}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
              >
                <Feather name="x" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* TRANSACTION TYPE */}

            <Text style={styles.modalSectionLabel}>Transaction Type</Text>

            <View style={styles.modalToggleRow}>
              {TRANSACTION_TYPES.map((type) => {
                const selected = draftFilters.types.includes(type);

                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.toggleChip,
                      selected && styles.toggleChipActive,
                    ]}
                    onPress={() => toggleDraftType(type)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.toggleChipText,
                        selected && styles.toggleChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ACTIONS */}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalResetButton}
                onPress={resetDraftFilters}
                activeOpacity={0.8}
              >
                <Text style={styles.modalResetText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={applyFilters}
                activeOpacity={0.85}
              >
                <Text style={styles.modalApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

/* ===
   TRANSACTION ROW
=== */

function TransactionRow({ tx }) {
  const statusStyles = {
    Successful: {
      bg: "#E8F5E9",
      color: Colors.success,
    },

    Failed: {
      bg: "#FDEAE0",
      color: Colors.primaryRed,
    },

    Pending: {
      bg: "#FFF6DC",
      color: Colors.gold,
    },
  }[tx.status];

  let iconName = tx.icon;

  if (tx.icon === "crown") {
    iconName = "award";
  }

  return (
    <TouchableOpacity style={styles.transactionRow} activeOpacity={0.7}>
      {/* ICON */}

      <View
        style={[
          styles.transactionIconCircle,
          {
            backgroundColor: tx.iconBg,
          },
        ]}
      >
        <Feather name={iconName} size={18} color={Colors.primaryRed} />
      </View>

      {/* INFO */}

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle} numberOfLines={2}>
          {tx.title}
        </Text>

        <Text style={styles.transactionMeta}>Order ID: {tx.orderId}</Text>

        <Text style={styles.transactionMeta}>{tx.date}</Text>
      </View>

      {/* RIGHT */}

      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>
          ₹ {tx.amount.toLocaleString("en-IN")}
        </Text>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: statusStyles.bg,
            },
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              {
                color: statusStyles.color,
              },
            ]}
          >
            {tx.status}
          </Text>
        </View>
      </View>

      {/* CHEVRON */}

      <Feather
        name="chevron-right"
        size={18}
        color={Colors.primaryRed}
        style={{
          marginLeft: 6,
        }}
      />
    </TouchableOpacity>
  );
}

/* ===
   STYLES
=== */

const styles = StyleSheet.create({
  /* =======
     SAFE AREA
  ======= */

  safeArea: {
    flex: 1,

    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 18,

    paddingTop: 18,

    paddingBottom: 30,
  },

  /* =======
     HEADER
  ======= */

  headerWrapper: {
    width: "100%",
  },

  header: {
    height: HEADER_HEIGHT,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

    paddingBottom: 14,

    gap: 12,
  },

  headerBackButton: {
    width: 30,

    height: 30,

    alignItems: "center",

    justifyContent: "center",
  },

  headerTitleBlock: {
    flex: 1,

    minWidth: 0,
  },

  headerTitle: {
    fontSize: Fonts.size.xxl,

    fontFamily: Fonts.extraBold,

    color: Colors.white,
  },

  headerSubtitle: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.regular,

    color: Colors.goldLight,

    marginTop: 3,
  },

  filterHeaderButton: {
    flexDirection: "row",

    alignItems: "center",

    gap: 5,
  },

  filterHeaderText: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.semiBold,

    color: Colors.white,
  },

  filterHeaderBadge: {
    backgroundColor: Colors.white,

    borderRadius: 8,

    minWidth: 16,

    height: 16,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 3,

    marginLeft: 2,
  },

  filterHeaderBadgeText: {
    fontSize: Fonts.size.xs,

    fontFamily: Fonts.bold,

    color: Colors.primaryRed,
  },

  /* =======
     SUMMARY
  ======= */

  summaryCard: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FDF3D8",

    borderRadius: 16,

    padding: 16,

    marginBottom: 18,
  },

  summaryLeft: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1.3,

    gap: 12,

    minWidth: 0,
  },

  summaryIconCircle: {
    width: 46,

    height: 46,

    borderRadius: 23,

    backgroundColor: Colors.primaryRed,

    alignItems: "center",

    justifyContent: "center",
  },

  summaryLabel: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.medium,

    color: Colors.textSecondary,
  },

  summaryAmount: {
    fontSize: Fonts.size.lg,

    fontFamily: Fonts.extraBold,

    color: Colors.primaryRed,

    marginTop: 2,
  },

  summarySub: {
    fontSize: Fonts.size.xs,

    fontFamily: Fonts.regular,

    color: Colors.textMuted,

    marginTop: 1,
  },

  summaryDivider: {
    width: 1,

    height: 46,

    backgroundColor: "#E5D6A0",

    marginHorizontal: 8,
  },

  summaryStat: {
    flex: 1,

    minWidth: 0,
  },

  summaryStatLabel: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.medium,

    color: Colors.textSecondary,
  },

  summaryStatAmount: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

    marginTop: 3,
  },

  summaryStatSub: {
    fontSize: Fonts.size.xs,

    fontFamily: Fonts.regular,

    color: Colors.textMuted,

    marginTop: 1,
  },

  /* =======
     STATUS TABS
  ======= */

  tabsRow: {
    marginBottom: 12,
  },

  statusTabsGroup: {
    flexDirection: "row",

    gap: 8,
  },

  statusTab: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 10,

    borderRadius: 10,

    borderWidth: 1,

    borderColor: Colors.border,
  },

  statusTabActive: {
    backgroundColor: Colors.primaryRed,

    borderColor: Colors.primaryRed,
  },

  statusTabText: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.semiBold,

    color: Colors.textSecondary,
  },

  statusTabTextActive: {
    color: Colors.white,
  },

  /* =======
     DATE RANGE
  ======= */

  dateRangeButton: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor: Colors.primaryRed,

    borderRadius: 10,

    paddingVertical: 10,

    gap: 6,

    marginBottom: 18,
  },

  dateRangeText: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.semiBold,

    color: Colors.primaryRed,
  },

  /* =======
     TRANSACTION LIST
  ======= */

  transactionList: {
    marginBottom: 20,
  },

  transactionRow: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: Colors.cardBackground,

    borderRadius: 14,

    padding: 12,

    marginBottom: 12,

    elevation: 1,

    shadowColor: "#000",

    shadowOpacity: 0.04,

    shadowRadius: 6,

    shadowOffset: {
      width: 0,

      height: 2,
    },
  },

  transactionIconCircle: {
    width: 42,

    height: 42,

    borderRadius: 21,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 12,

    flexShrink: 0,
  },

  transactionInfo: {
    flex: 1,

    minWidth: 0,
  },

  transactionTitle: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.bold,

    color: Colors.textPrimary,
  },

  transactionMeta: {
    fontSize: 11,

    fontFamily: Fonts.regular,

    color: Colors.textMuted,

    marginTop: 2,
  },

  transactionRight: {
    alignItems: "flex-end",

    marginLeft: 5,
  },

  transactionAmount: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.extraBold,

    color: Colors.textPrimary,
  },

  statusPill: {
    borderRadius: 8,

    paddingHorizontal: 8,

    paddingVertical: 3,

    marginTop: 5,
  },

  statusPillText: {
    fontSize: Fonts.size.xs,

    fontFamily: Fonts.bold,
  },

  /* =======
     EMPTY
  ======= */

  emptyState: {
    alignItems: "center",

    paddingVertical: 40,

    gap: 10,
  },

  emptyStateText: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.regular,

    color: Colors.textMuted,

    textAlign: "center",

    paddingHorizontal: 30,
  },

  /* =======
     HELP
  ======= */

  helpBanner: {
    flexDirection: "row",

    backgroundColor: "#FDF3D8",

    borderRadius: 16,

    padding: 16,

    marginBottom: 12,

    gap: 12,
  },

  helpIconCircle: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: Colors.gold,

    alignItems: "center",

    justifyContent: "center",
  },

  helpTextBlock: {
    flex: 1,

    minWidth: 0,
  },

  helpTitle: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.bold,

    color: Colors.primaryRed,
  },

  helpSubtitle: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.regular,

    color: Colors.textSecondary,

    marginTop: 3,

    lineHeight: 17,
  },

  contactSupportButton: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1.3,

    borderColor: Colors.primaryRed,

    borderRadius: 12,

    paddingVertical: 12,

    gap: 8,

    marginBottom: 20,
  },

  contactSupportText: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.bold,

    color: Colors.primaryRed,
  },

  /* =======
     FOOTER
  ======= */

  secureRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 6,
  },

  secureText: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.regular,

    color: Colors.textMuted,
  },

  /* =======
     DATE MODAL
  ======= */

  dateModalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.15)",
  },

  dateMenu: {
    position: "absolute",

    top: 300,

    right: 18,

    backgroundColor: Colors.cardBackground,

    borderRadius: 14,

    paddingVertical: 6,

    minWidth: 190,

    elevation: 6,

    shadowColor: "#000",

    shadowOpacity: 0.15,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,

      height: 4,
    },
  },

  dateMenuOption: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 16,

    paddingVertical: 12,
  },

  dateMenuOptionText: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.regular,

    color: Colors.textPrimary,
  },

  dateMenuOptionTextActive: {
    color: Colors.primaryRed,

    fontFamily: Fonts.bold,
  },

  /* =======
     FILTER MODAL
  ======= */

  filterModalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.4)",

    justifyContent: "flex-end",
  },

  filterModalCard: {
    backgroundColor: Colors.cardBackground,

    borderTopLeftRadius: 22,

    borderTopRightRadius: 22,

    paddingHorizontal: 22,

    paddingTop: 12,

    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },

  modalHandle: {
    width: 40,

    height: 4,

    borderRadius: 2,

    backgroundColor: Colors.border,

    alignSelf: "center",

    marginBottom: 16,
  },

  modalHeaderRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 18,
  },

  modalTitle: {
    fontSize: Fonts.size.xl,

    fontFamily: Fonts.extraBold,

    color: Colors.textPrimary,
  },

  modalSectionLabel: {
    fontSize: Fonts.size.md,

    fontFamily: Fonts.semiBold,

    color: Colors.textPrimary,

    marginBottom: 10,
  },

  modalToggleRow: {
    flexDirection: "row",

    flexWrap: "wrap",

    gap: 10,

    marginBottom: 20,
  },

  toggleChip: {
    borderWidth: 1,

    borderColor: Colors.border,

    borderRadius: 20,

    paddingHorizontal: 14,

    paddingVertical: 9,
  },

  toggleChipActive: {
    backgroundColor: Colors.primaryRed,

    borderColor: Colors.primaryRed,
  },

  toggleChipText: {
    fontSize: Fonts.size.sm,

    fontFamily: Fonts.medium,

    color: Colors.textSecondary,
  },

  toggleChipTextActive: {
    color: Colors.white,

    fontFamily: Fonts.bold,
  },

  modalActionsRow: {
    flexDirection: "row",

    gap: 12,

    marginTop: 4,
  },

  modalResetButton: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1.5,

    borderColor: Colors.primaryRed,

    borderRadius: 12,

    paddingVertical: 14,
  },

  modalResetText: {
    fontSize: 14,

    fontFamily: Fonts.bold,

    color: Colors.primaryRed,
  },

  modalApplyButton: {
    flex: 2,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: Colors.primaryRed,

    borderRadius: 12,

    paddingVertical: 14,
  },

  modalApplyText: {
    fontSize: 14,

    fontFamily: Fonts.bold,

    color: Colors.white,
  },
});
