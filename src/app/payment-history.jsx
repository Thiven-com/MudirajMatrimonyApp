import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_HEIGHT = 108;

const STATUS_TABS = ["All", "Successful", "Pending", "Failed"];

const DATE_RANGES = [
  { key: "all", label: "All Time" },
  { key: "30d", label: "Last 30 Days" },
  { key: "3m", label: "Last 3 Months" },
  { key: "6m", label: "Last 6 Months" },
];

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
    icon: "enter-outline",
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
    icon: "card-outline",
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
    icon: "enter-outline",
    iconBg: "#EDE7F6",
  },
];

const TRANSACTION_TYPES = [...new Set(TRANSACTIONS.map((t) => t.title))];

const EMPTY_FILTERS = { types: [] };

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [dateMenuVisible, setDateMenuVisible] = useState(false);

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const activeFilterCount = filters.types.length;

  const openFilterSheet = () => {
    setDraftFilters(filters);
    setFilterSheetVisible(true);
  };
  const applyFilters = () => {
    setFilters(draftFilters);
    setFilterSheetVisible(false);
  };
  const resetDraftFilters = () => setDraftFilters(EMPTY_FILTERS);
  const toggleDraftType = (type) => {
    setDraftFilters((prev) => {
      const has = prev.types.includes(type);
      return {
        ...prev,
        types: has
          ? prev.types.filter((t) => t !== type)
          : [...prev.types, type],
      };
    });
  };

  const summary = useMemo(() => {
    const successful = TRANSACTIONS.filter((t) => t.status === "Successful");
    const failed = TRANSACTIONS.filter((t) => t.status === "Failed");
    const totalSpent = successful.reduce((sum, t) => sum + t.amount, 0);
    return {
      totalSpent,
      successfulAmount: totalSpent,
      successfulCount: successful.length,
      failedAmount: failed.reduce((sum, t) => sum + t.amount, 0),
      failedCount: failed.length,
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    let list = TRANSACTIONS;

    if (activeStatus !== "All") {
      list = list.filter((t) => t.status === activeStatus);
    }

    if (dateRange !== "all") {
      const now = new Date();
      const cutoffDays = { "30d": 30, "3m": 90, "6m": 180 }[dateRange];
      const cutoff = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);
      list = list.filter((t) => t.dateValue >= cutoff);
    }

    if (filters.types.length > 0) {
      list = list.filter((t) => filters.types.includes(t.title));
    }

    return list;
  }, [activeStatus, dateRange, filters]);

  const currentDateRangeLabel = DATE_RANGES.find(
    (r) => r.key === dateRange,
  )?.label;

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.headerWrapper}>
        <LinearGradient colors={Colors.gradientHeader} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Payment History</Text>
            <Text style={styles.headerSubtitle}>
              View your all payment transactions
            </Text>
          </View>

          <TouchableOpacity
            style={styles.filterHeaderButton}
            onPress={openFilterSheet}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={16} color={Colors.white} />
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

        <Svg
          width={SCREEN_WIDTH}
          height={10}
          viewBox={`0 0 ${SCREEN_WIDTH} 10`}
        >
          <Path d={`M0,0 H${SCREEN_WIDTH} V6 H0 Z`} fill={Colors.gold} />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= SUMMARY CARD ================= */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <View style={styles.summaryIconCircle}>
              <Ionicons name="wallet" size={22} color={Colors.white} />
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

          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Successful</Text>
            <Text style={[styles.summaryStatAmount, { color: Colors.success }]}>
              ₹ {summary.successfulAmount.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.summaryStatSub}>
              {summary.successfulCount} Transactions
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Failed</Text>
            <Text
              style={[styles.summaryStatAmount, { color: Colors.primaryRed }]}
            >
              ₹ {summary.failedAmount.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.summaryStatSub}>
              {summary.failedCount} Transactions
            </Text>
          </View>
        </View>

        {/* ================= STATUS TABS + DATE RANGE ================= */}
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

        <TouchableOpacity
          style={styles.dateRangeButton}
          onPress={() => setDateMenuVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={Colors.primaryRed}
          />
          <Text style={styles.dateRangeText}>{currentDateRangeLabel}</Text>
          <Ionicons name="chevron-down" size={15} color={Colors.primaryRed} />
        </TouchableOpacity>

        {/* ================= TRANSACTION LIST ================= */}
        <View style={styles.transactionList}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="receipt-outline"
                size={30}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyStateText}>
                No transactions match these filters.
              </Text>
            </View>
          )}
        </View>

        {/* ================= NEED HELP ================= */}
        <View style={styles.helpBanner}>
          <View style={styles.helpIconCircle}>
            <Ionicons name="headset" size={20} color={Colors.white} />
          </View>
          <View style={styles.helpTextBlock}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpSubtitle}>
              If you have any queries regarding payments, please contact our
              support team.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.contactSupportButton}
          activeOpacity={0.8}
        >
          <Ionicons
            name="headset-outline"
            size={16}
            color={Colors.primaryRed}
          />
          <Text style={styles.contactSupportText}>Contact Support</Text>
        </TouchableOpacity>

        {/* ================= FOOTER ================= */}
        <View style={styles.secureRow}>
          <Ionicons
            name="lock-closed-outline"
            size={13}
            color={Colors.textMuted}
          />
          <Text style={styles.secureText}>
            All transactions are secure and encrypted.
          </Text>
        </View>
      </ScrollView>

      {/* ================= DATE RANGE DROPDOWN ================= */}
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
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={Colors.primaryRed}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= FILTER SHEET ================= */}
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
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity
                onPress={() => setFilterSheetVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>Transaction Type</Text>
            <View style={styles.modalToggleRow}>
              {TRANSACTION_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.toggleChip,
                    draftFilters.types.includes(type) &&
                      styles.toggleChipActive,
                  ]}
                  onPress={() => toggleDraftType(type)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.toggleChipText,
                      draftFilters.types.includes(type) &&
                        styles.toggleChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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

// ================= TRANSACTION ROW =================
function TransactionRow({ tx }) {
  const statusStyles = {
    Successful: { bg: "#E8F5E9", color: Colors.success },
    Failed: { bg: "#FDEAE0", color: Colors.primaryRed },
    Pending: { bg: "#FFF6DC", color: Colors.gold },
  }[tx.status];

  return (
    <TouchableOpacity style={styles.transactionRow} activeOpacity={0.7}>
      <View
        style={[styles.transactionIconCircle, { backgroundColor: tx.iconBg }]}
      >
        <Ionicons
          name={tx.icon === "crown" ? "ribbon" : tx.icon}
          size={18}
          color={tx.status === "Failed" ? Colors.primaryRed : Colors.primaryRed}
        />
      </View>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{tx.title}</Text>
        <Text style={styles.transactionMeta}>Order ID: {tx.orderId}</Text>
        <Text style={styles.transactionMeta}>{tx.date}</Text>
      </View>

      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>
          ₹ {tx.amount.toLocaleString("en-IN")}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: statusStyles.bg }]}>
          <Text style={[styles.statusPillText, { color: statusStyles.color }]}>
            {tx.status}
          </Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Colors.primaryRed}
        style={{ marginLeft: 6 }}
      />
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
    paddingBottom: 30,
  },

  /* ===== HEADER ===== */
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
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes.welcome + 2,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.goldLight,
    marginTop: 3,
  },
  filterHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  filterHeaderText: {
    fontSize: 13,
    fontFamily: Fonts.body.semiBold,
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
    fontSize: 9.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== SUMMARY CARD ===== */
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
    fontSize: 12,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  summaryAmount: {
    fontSize: 19,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginTop: 2,
  },
  summarySub: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
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
  },
  summaryStatLabel: {
    fontSize: 11.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  summaryStatAmount: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    marginTop: 3,
  },
  summaryStatSub: {
    fontSize: 10,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 1,
  },

  /* ===== STATUS TABS ===== */
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
    fontSize: 12.5,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textSecondary,
  },
  statusTabTextActive: {
    color: Colors.white,
  },

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
    fontSize: 12.5,
    fontFamily: Fonts.body.semiBold,
    color: Colors.primaryRed,
  },

  /* ===== TRANSACTION LIST ===== */
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
    shadowOffset: { width: 0, height: 2 },
  },
  transactionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  transactionMeta: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 14.5,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 5,
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
  },

  /* ===== EMPTY STATE ===== */
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 30,
  },

  /* ===== NEED HELP ===== */
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
  },
  helpTitle: {
    fontSize: 14.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  helpSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
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
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== FOOTER ===== */
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secureText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  /* ===== DATE RANGE DROPDOWN ===== */
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
    shadowOffset: { width: 0, height: 4 },
  },
  dateMenuOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateMenuOptionText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
  },
  dateMenuOptionTextActive: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.bold,
  },

  /* ===== FILTER SHEET ===== */
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
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontFamily: Fonts.body.semiBold,
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
    fontSize: 12.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  toggleChipTextActive: {
    color: Colors.white,
    fontFamily: Fonts.body.bold,
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
    fontFamily: Fonts.body.bold,
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
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
