import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Image,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const LOGO = require("../../assets/images/logo.png");
// Swap each of these for the visitor's actual avatar, e.g. { uri: visitor.photoUrl }
const AVATAR_PLACEHOLDER = require("../../assets/images/Match5.png");

const FILTER_TABS = [
  { key: "all", label: "All Visitors", icon: "people" },
  { key: "recent", label: "Recent Visitors", icon: "time-outline" },
  { key: "frequent", label: "Frequent Visitors", icon: "flame-outline" },
  { key: "hidden", label: "Hidden Visitors", icon: "eye-off-outline" },
];

// `tags` drives which filter tab(s) a visitor shows up under.
// `verified` / `online` back the extra options in the Filters sheet.
const VISITORS = [
  {
    id: "1",
    name: "Priyanka",
    age: 25,
    profession: "Software Engineer",
    location: "Hyderabad, Telangana",
    time: "Just now",
    online: true,
    verified: true,
    tags: ["recent", "frequent"],
  },
  {
    id: "2",
    name: "Rohit",
    age: 27,
    profession: "Civil Engineer",
    location: "Vijayawada, Andhra Pradesh",
    time: "10 min ago",
    online: true,
    verified: true,
    tags: ["recent"],
  },
  {
    id: "3",
    name: "Deepika",
    age: 23,
    profession: "Teacher",
    location: "Warangal, Telangana",
    time: "1 hour ago",
    online: false,
    verified: true,
    tags: ["recent", "hidden"],
  },
  {
    id: "4",
    name: "Karthik",
    age: 28,
    profession: "Mechanical Engineer",
    location: "Hyderabad, Telangana",
    time: "3 hours ago",
    online: false,
    verified: true,
    tags: ["frequent"],
  },
  {
    id: "5",
    name: "Ananya",
    age: 26,
    profession: "Doctor",
    location: "Bengaluru, Karnataka",
    time: "5 hours ago",
    online: false,
    verified: false,
    tags: ["hidden"],
  },
];

const FILTER_TAB_HEADINGS = {
  all: "Recent Visitors",
  recent: "Recent Visitors",
  frequent: "Frequent Visitors",
  hidden: "Hidden Visitors",
};

const SORT_OPTIONS = [
  { key: "newest", label: "Most Recent" },
  { key: "frequent", label: "Most Frequent" },
];

export default function ProfileVisitorsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);

  // Applied filter-sheet options
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Draft options edited inside the sheet, committed on "Apply Filters"
  const [draftOnlineOnly, setDraftOnlineOnly] = useState(onlineOnly);
  const [draftVerifiedOnly, setDraftVerifiedOnly] = useState(verifiedOnly);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);

  const activeFilterCount = (onlineOnly ? 1 : 0) + (verifiedOnly ? 1 : 0);

  const openFilters = () => {
    setDraftOnlineOnly(onlineOnly);
    setDraftVerifiedOnly(verifiedOnly);
    setDraftSortBy(sortBy);
    setFiltersVisible(true);
  };

  const applyFilters = () => {
    setOnlineOnly(draftOnlineOnly);
    setVerifiedOnly(draftVerifiedOnly);
    setSortBy(draftSortBy);
    setFiltersVisible(false);
  };

  const resetFilters = () => {
    setDraftOnlineOnly(false);
    setDraftVerifiedOnly(false);
    setDraftSortBy("newest");
  };

  const filteredVisitors = useMemo(() => {
    let list = VISITORS.filter((v) =>
      v.name.toLowerCase().includes(search.toLowerCase()),
    );

    if (activeFilter !== "all") {
      list = list.filter((v) => v.tags.includes(activeFilter));
    }
    if (onlineOnly) {
      list = list.filter((v) => v.online);
    }
    if (verifiedOnly) {
      list = list.filter((v) => v.verified);
    }
    if (sortBy === "frequent") {
      list = [...list].sort(
        (a, b) =>
          (b.tags.includes("frequent") ? 1 : 0) -
          (a.tags.includes("frequent") ? 1 : 0),
      );
    }
    return list;
  }, [search, activeFilter, onlineOnly, verifiedOnly, sortBy]);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= TOP BAR ================= */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={26} color={Colors.primaryRed} />
          </TouchableOpacity>
          <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
        </View>

        {/* ================= TITLE ================= */}
        <View style={styles.titleRow}>
          <View style={styles.titleIconCircle}>
            <Ionicons name="eye-outline" size={24} color={Colors.gold} />
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.titleText}>Profile Visitors</Text>
            <Text style={styles.subtitleText}>
              People who viewed your profile
            </Text>
          </View>
        </View>

        {/* ================= STAT CARDS ================= */}
        <View style={styles.statsRow}>
          <StatCard
            icon="people"
            iconBg="#F6C244"
            value="28"
            label="Total Visitors"
          />
          <StatCard
            icon="eye"
            iconBg="#F4A8A0"
            value="12"
            label="Viewed in Last 7 Days"
          />
          <StatCard
            icon="lock-closed"
            iconBg="#F6C244"
            value="06"
            label="Viewed in Last 24 Hrs"
          />
        </View>

        {/* ================= PREMIUM BANNER ================= */}
        <View style={styles.premiumBanner}>
          <View style={styles.premiumIconCircle}>
            <Ionicons name="ribbon" size={22} color={Colors.white} />
          </View>
          <View style={styles.premiumTextBlock}>
            <Text style={styles.premiumTitle}>
              Go Premium, Get More Visibility
            </Text>
            <Text style={styles.premiumSubtitle}>
              Increase your profile visibility and get more matches.
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.85}>
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          <Ionicons name="chevron-forward" size={17} color={Colors.white} />
        </TouchableOpacity>

        {/* ================= SEARCH + FILTERS ================= */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={19} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search visitors"
              placeholderTextColor={Colors.placeholder}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={styles.filtersButton}
            activeOpacity={0.85}
            onPress={openFilters}
          >
            <Ionicons name="options-outline" size={19} color={Colors.white} />
            <Text style={styles.filtersButtonText}>Filters</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filtersCountBadge}>
                <Text style={styles.filtersCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ================= FILTER TABS ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsRow}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon}
                  size={16}
                  color={isActive ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ================= VISITORS HEADING ================= */}
        <View style={styles.recentHeadingRow}>
          <Text style={styles.recentHeading}>
            {FILTER_TAB_HEADINGS[activeFilter]}
          </Text>
          <Text style={styles.recentCount}>
            {filteredVisitors.length} Visitor
            {filteredVisitors.length === 1 ? "" : "s"}
          </Text>
        </View>

        {/* ================= VISITOR LIST ================= */}
        <View style={styles.visitorList}>
          {filteredVisitors.length > 0 ? (
            filteredVisitors.map((visitor) => (
              <VisitorCard key={visitor.id} visitor={visitor} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="eye-off-outline"
                size={30}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyStateText}>
                No visitors match these filters.
              </Text>
            </View>
          )}
        </View>

        {/* ================= UNLOCK PREMIUM BANNER ================= */}
        <View style={styles.unlockBanner}>
          <View style={styles.unlockIconCircle}>
            <Ionicons name="ribbon-outline" size={22} color={Colors.gold} />
          </View>
          <View style={styles.unlockTextBlock}>
            <Text style={styles.unlockTitle}>Unlock Visitor Details</Text>
            <Text style={styles.unlockSubtitle}>
              Upgrade to Premium to see who viewed your profile & when they
              viewed.
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.unlockButton} activeOpacity={0.85}>
          <Text style={styles.unlockButtonText}>Upgrade Now</Text>
          <Ionicons name="chevron-forward" size={15} color={Colors.white} />
        </TouchableOpacity>
      </ScrollView>

      {/* ================= FILTERS BOTTOM SHEET ================= */}
      <Modal
        visible={filtersVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFiltersVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filter Visitors</Text>
              <TouchableOpacity
                onPress={() => setFiltersVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionLabel}>Show only</Text>
            <View style={styles.modalToggleRow}>
              <ToggleChip
                icon="radio-button-on"
                label="Online now"
                active={draftOnlineOnly}
                onPress={() => setDraftOnlineOnly(!draftOnlineOnly)}
              />
              <ToggleChip
                icon="checkmark-circle"
                label="Verified profiles only"
                active={draftVerifiedOnly}
                onPress={() => setDraftVerifiedOnly(!draftVerifiedOnly)}
              />
            </View>

            <Text style={styles.modalSectionLabel}>Sort by</Text>
            <View style={styles.modalToggleRow}>
              {SORT_OPTIONS.map((option) => (
                <ToggleChip
                  key={option.key}
                  icon={
                    option.key === "newest" ? "time-outline" : "flame-outline"
                  }
                  label={option.label}
                  active={draftSortBy === option.key}
                  onPress={() => setDraftSortBy(option.key)}
                />
              ))}
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalResetButton}
                onPress={resetFilters}
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

// ================= SUBCOMPONENTS =================
function StatCard({ icon, iconBg, value, label }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={17} color={Colors.white} />
      </View>
      <View style={styles.statTextBlock}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function VisitorCard({ visitor }) {
  return (
    <View style={styles.visitorCard}>
      <View style={styles.avatarWrapper}>
        <Image source={AVATAR_PLACEHOLDER} style={styles.avatar} />
        {visitor.online && <View style={styles.avatarOnlineDot} />}
      </View>

      <View style={styles.visitorInfo}>
        <View style={styles.visitorNameRow}>
          <Text style={styles.visitorName}>
            {visitor.name}, {visitor.age}
          </Text>
          {visitor.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.success}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
        <Text style={styles.visitorProfession}>{visitor.profession}</Text>
        <View style={styles.visitorLocationRow}>
          <Ionicons name="location" size={13} color={Colors.primaryRed} />
          <Text style={styles.visitorLocation}>{visitor.location}</Text>
        </View>
      </View>

      <View style={styles.visitorRight}>
        <Text style={styles.visitorTime}>{visitor.time}</Text>
        <TouchableOpacity style={styles.viewProfileButton} activeOpacity={0.8}>
          <Ionicons name="eye-outline" size={14} color={Colors.gold} />
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ToggleChip({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.toggleChip, active && styles.toggleChipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? Colors.white : Colors.textSecondary}
      />
      <Text
        style={[styles.toggleChipText, active && styles.toggleChipTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  /* ===== TOP BAR ===== */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  /* ===== TITLE ===== */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  titleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FDF3D8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  titleTextBlock: {
    flex: 1,
  },
  titleText: {
    fontSize: FontSizes.welcome + 2,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRedDark,
  },
  subtitleText: {
    fontSize: FontSizes.subtitle + 1,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 4,
  },

  /* ===== STAT CARDS ===== */
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3D8",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 10,
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  statTextBlock: {
    flexShrink: 1,
  },
  statValue: {
    fontSize: 19,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 13,
  },

  /* ===== PREMIUM BANNER ===== */
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDEAE0",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 12,
  },
  premiumIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumTextBlock: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 15,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  premiumSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 6,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  /* ===== SEARCH + FILTERS ===== */
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    paddingVertical: 14,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gold,
    borderRadius: 14,
    paddingHorizontal: 18,
    gap: 7,
  },
  filtersButtonText: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  filtersCountBadge: {
    backgroundColor: Colors.white,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    marginLeft: 2,
  },
  filtersCountText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: Colors.gold,
  },

  /* ===== FILTER TABS ===== */
  filterTabsRow: {
    gap: 12,
    paddingBottom: 24,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 7,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryRed,
    borderColor: Colors.primaryRed,
  },
  filterTabText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.white,
    fontFamily: Fonts.body.bold,
  },

  /* ===== VISITORS HEADING ===== */
  recentHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  recentHeading: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  recentCount: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== VISITOR LIST ===== */
  visitorList: {
    marginBottom: 22,
  },
  visitorCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 14,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarOnlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  visitorInfo: {
    flex: 1,
  },
  visitorNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  visitorName: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRedDark,
  },
  visitorProfession: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    marginTop: 3,
  },
  visitorLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  visitorLocation: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  visitorRight: {
    alignItems: "flex-end",
  },
  visitorTime: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: Colors.gold,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
  },
  viewProfileText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
    color: Colors.gold,
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
  },

  /* ===== UNLOCK PREMIUM BANNER ===== */
  unlockBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDEAE0",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  unlockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockTextBlock: {
    flex: 1,
  },
  unlockTitle: {
    fontSize: 14.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  unlockSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 12,
    paddingVertical: 13,
    gap: 5,
  },
  unlockButtonText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  /* ===== FILTERS MODAL ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
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
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
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
