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
// Swap each of these for the profile's actual photo, e.g. { uri: profile.photoUrl }
const PROFILE_PHOTO = require("../../assets/images/Match5.png");

const SORT_OPTIONS = [
  { key: "recent", label: "Recently Added" },
  { key: "name", label: "Name (A-Z)" },
  { key: "age", label: "Age" },
];

const AGE_RANGES = [
  { key: "20-25", label: "20 - 25", test: (age) => age >= 20 && age <= 25 },
  { key: "26-30", label: "26 - 30", test: (age) => age >= 26 && age <= 30 },
  { key: "31+", label: "31+", test: (age) => age >= 31 },
];

const SHORTLISTED_PROFILES = [
  {
    id: "1",
    name: "Priyanka",
    age: 25,
    profession: "Software Engineer",
    location: "Hyderabad, Telangana",
    education: "B.Tech, Computer Science",
    height: "5'4\"",
    religionCaste: "Hindu - Mudhiraj",
    online: true,
    verified: true,
  },
  {
    id: "2",
    name: "Deepika",
    age: 23,
    profession: "Teacher",
    location: "Warangal, Telangana",
    education: "B.Ed",
    height: "5'3\"",
    religionCaste: "Hindu - Mudhiraj",
    online: true,
    verified: true,
  },
  {
    id: "3",
    name: "Rohit",
    age: 27,
    profession: "Civil Engineer",
    location: "Vijayawada, Andhra Pradesh",
    education: "B.Tech, Civil Engineering",
    height: "5'7\"",
    religionCaste: "Hindu - Mudhiraj",
    online: false,
    verified: true,
  },
  {
    id: "4",
    name: "Ananya",
    age: 26,
    profession: "Doctor",
    location: "Bengaluru, Karnataka",
    education: "MBBS, MD",
    height: "5'5\"",
    religionCaste: "Hindu - Mudhiraj",
    online: false,
    verified: false,
  },
];

const PROFESSION_OPTIONS = [
  ...new Set(SHORTLISTED_PROFILES.map((p) => p.profession)),
];

const BOTTOM_TABS = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  {
    key: "matches",
    label: "Matches",
    icon: "people-outline",
    activeIcon: "people",
  },
  {
    key: "search",
    label: "Search",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    key: "chats",
    label: "Chats",
    icon: "chatbubble-ellipses-outline",
    activeIcon: "chatbubble-ellipses",
    badge: 2,
  },
  {
    key: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

const EMPTY_FILTERS = {
  onlineOnly: false,
  verifiedOnly: false,
  ageRange: null,
  professions: [],
};

export default function ShortlistedProfilesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [shortlisted, setShortlisted] = useState(
    () => new Set(SHORTLISTED_PROFILES.map((p) => p.id)),
  );

  // Applied filters
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // Draft filters edited inside the sheet, committed on "Apply Filters"
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const activeFilterCount =
    (filters.onlineOnly ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.ageRange ? 1 : 0) +
    filters.professions.length;

  const toggleShortlist = (id) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openFilters = () => {
    setDraftFilters(filters);
    setFiltersVisible(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFiltersVisible(false);
  };

  const resetDraftFilters = () => setDraftFilters(EMPTY_FILTERS);

  const toggleDraftProfession = (profession) => {
    setDraftFilters((prev) => {
      const has = prev.professions.includes(profession);
      return {
        ...prev,
        professions: has
          ? prev.professions.filter((p) => p !== profession)
          : [...prev.professions, profession],
      };
    });
  };

  const visibleProfiles = useMemo(() => {
    let list = SHORTLISTED_PROFILES.filter(
      (p) =>
        shortlisted.has(p.id) &&
        p.name.toLowerCase().includes(search.toLowerCase()),
    );

    if (filters.onlineOnly) list = list.filter((p) => p.online);
    if (filters.verifiedOnly) list = list.filter((p) => p.verified);
    if (filters.ageRange) {
      const range = AGE_RANGES.find((r) => r.key === filters.ageRange);
      if (range) list = list.filter((p) => range.test(p.age));
    }
    if (filters.professions.length > 0) {
      list = list.filter((p) => filters.professions.includes(p.profession));
    }

    if (sortBy === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "age") {
      list = [...list].sort((a, b) => a.age - b.age);
    }
    // "recent" keeps the original (most-recently-shortlisted-first) order
    return list;
  }, [search, sortBy, shortlisted, filters]);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sortBy)?.label;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
            <Ionicons name="heart" size={22} color={Colors.gold} />
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.titleText}>Shortlisted Profiles</Text>
            <Text style={styles.subtitleText}>
              Profiles you have shortlisted
            </Text>
          </View>
        </View>

        {/* ================= STAT CARDS ================= */}
        <View style={styles.statsRow}>
          <StatCard
            icon="heart"
            iconBg={Colors.gold}
            value="12"
            label="Total Shortlisted"
          />
          <StatCard
            icon="eye"
            iconBg={Colors.primaryRed}
            value="4"
            label="Viewed Your Profile"
          />
          <StatCard
            icon="people"
            iconBg={Colors.gold}
            value="2"
            label="Interested in You"
          />
        </View>

        {/* ================= SEARCH + FILTERS ================= */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={19} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search in shortlisted profiles"
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

        {/* ================= ACTIVE FILTER CHIPS ================= */}
        {activeFilterCount > 0 && (
          <View style={styles.activeChipsRow}>
            {filters.onlineOnly && (
              <ActiveChip
                label="Online now"
                onRemove={() =>
                  setFilters((f) => ({ ...f, onlineOnly: false }))
                }
              />
            )}
            {filters.verifiedOnly && (
              <ActiveChip
                label="Verified only"
                onRemove={() =>
                  setFilters((f) => ({ ...f, verifiedOnly: false }))
                }
              />
            )}
            {filters.ageRange && (
              <ActiveChip
                label={`Age ${AGE_RANGES.find((r) => r.key === filters.ageRange)?.label}`}
                onRemove={() => setFilters((f) => ({ ...f, ageRange: null }))}
              />
            )}
            {filters.professions.map((prof) => (
              <ActiveChip
                key={prof}
                label={prof}
                onRemove={() =>
                  setFilters((f) => ({
                    ...f,
                    professions: f.professions.filter((p) => p !== prof),
                  }))
                }
              />
            ))}
            <TouchableOpacity
              onPress={() => setFilters(EMPTY_FILTERS)}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= SORT ROW ================= */}
        <View style={styles.sortRow}>
          <View style={styles.sortLeft}>
            <Text style={styles.sortLabel}>Sort by: </Text>
            <TouchableOpacity
              style={styles.sortValueRow}
              onPress={() => setSortMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.sortValue}>{currentSortLabel}</Text>
              <Ionicons
                name="chevron-down"
                size={15}
                color={Colors.primaryRed}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileCount}>
            {visibleProfiles.length} Profiles
          </Text>
        </View>

        {/* ================= PROFILE LIST ================= */}
        <View style={styles.profileList}>
          {visibleProfiles.length > 0 ? (
            visibleProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isShortlisted={shortlisted.has(profile.id)}
                onToggleShortlist={() => toggleShortlist(profile.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="heart-dislike-outline"
                size={30}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyStateText}>
                No shortlisted profiles match your filters.
              </Text>
            </View>
          )}
        </View>

        {/* ================= PREMIUM BANNER ================= */}
        <View style={styles.premiumBanner}>
          <View style={styles.premiumIconCircle}>
            <Ionicons name="ribbon" size={20} color={Colors.primaryRed} />
          </View>
          <View style={styles.premiumTextBlock}>
            <Text style={styles.premiumTitle}>
              Go Premium, Get Better Matches
            </Text>
            <Text style={styles.premiumSubtitle}>
              Chat unlimited, see who's interested in you & more premium
              benefits.
            </Text>
          </View>
          <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.85}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= BOTTOM TAB BAR ================= */}
      {/* If your app already uses an expo-router <Tabs> layout, remove this
          block and place this screen's content inside that layout instead. */}
      <View style={styles.bottomTabBar}>
        {BOTTOM_TABS.map((tab) => {
          const isActive = tab.key === "profile";
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.bottomTabItem}
              activeOpacity={0.7}
            >
              <View>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? Colors.primaryRed : Colors.textMuted}
                />
                {tab.badge ? (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.bottomTabLabel,
                  isActive && styles.bottomTabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ================= SORT DROPDOWN MODAL ================= */}
      <Modal
        visible={sortMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.sortModalOverlay}
          activeOpacity={1}
          onPress={() => setSortMenuVisible(false)}
        >
          <View style={styles.sortMenu}>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.sortMenuOption}
                onPress={() => {
                  setSortBy(option.key);
                  setSortMenuVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.sortMenuOptionText,
                    sortBy === option.key && styles.sortMenuOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.key && (
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

      {/* ================= FILTERS BOTTOM SHEET ================= */}
      <Modal
        visible={filtersVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFiltersVisible(false)}
      >
        <TouchableOpacity
          style={styles.filtersModalOverlay}
          activeOpacity={1}
          onPress={() => setFiltersVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.filtersModalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Filter Profiles</Text>
                <TouchableOpacity
                  onPress={() => setFiltersVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSectionLabel}>Show only</Text>
              <View style={styles.modalToggleRow}>
                <ToggleChip
                  icon="radio-button-on"
                  label="Online now"
                  active={draftFilters.onlineOnly}
                  onPress={() =>
                    setDraftFilters((f) => ({
                      ...f,
                      onlineOnly: !f.onlineOnly,
                    }))
                  }
                />
                <ToggleChip
                  icon="checkmark-circle"
                  label="Verified profiles only"
                  active={draftFilters.verifiedOnly}
                  onPress={() =>
                    setDraftFilters((f) => ({
                      ...f,
                      verifiedOnly: !f.verifiedOnly,
                    }))
                  }
                />
              </View>

              <Text style={styles.modalSectionLabel}>Age range</Text>
              <View style={styles.modalToggleRow}>
                {AGE_RANGES.map((range) => (
                  <ToggleChip
                    key={range.key}
                    icon="calendar-outline"
                    label={range.label}
                    active={draftFilters.ageRange === range.key}
                    onPress={() =>
                      setDraftFilters((f) => ({
                        ...f,
                        ageRange: f.ageRange === range.key ? null : range.key,
                      }))
                    }
                  />
                ))}
              </View>

              <Text style={styles.modalSectionLabel}>Profession</Text>
              <View style={styles.modalToggleRow}>
                {PROFESSION_OPTIONS.map((prof) => (
                  <ToggleChip
                    key={prof}
                    icon="briefcase-outline"
                    label={prof}
                    active={draftFilters.professions.includes(prof)}
                    onPress={() => toggleDraftProfession(prof)}
                  />
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
            </ScrollView>
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

function ProfileCard({ profile, isShortlisted, onToggleShortlist }) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profilePhotoWrapper}>
        <Image
          source={PROFILE_PHOTO}
          style={styles.profilePhoto}
          resizeMode="cover"
        />
        {profile.online && (
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineBadgeText}>Online</Text>
          </View>
        )}
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.profileNameRow}>
          <Text style={styles.profileName}>
            {profile.name}, {profile.age}
          </Text>
          {profile.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.success}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
        <Text style={styles.profileProfession}>{profile.profession}</Text>

        <DetailLine icon="location" text={profile.location} />
        <DetailLine icon="school-outline" text={profile.education} />
        <DetailLine icon="resize-outline" text={profile.height} />
        <DetailLine icon="people-outline" text={profile.religionCaste} />
      </View>

      <View style={styles.profileActions}>
        <TouchableOpacity style={styles.messageButton} activeOpacity={0.8}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={Colors.primaryRed}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortlistAction}
          activeOpacity={0.7}
          onPress={onToggleShortlist}
        >
          <Ionicons
            name={isShortlisted ? "heart" : "heart-outline"}
            size={22}
            color={Colors.primaryRed}
          />
          <Text style={styles.shortlistLabel}>
            {isShortlisted ? "Shortlisted" : "Shortlist"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailLine({ icon, text }) {
  return (
    <View style={styles.detailLine}>
      <Ionicons
        name={icon}
        size={13}
        color={Colors.primaryRed}
        style={styles.detailIcon}
      />
      <Text style={styles.detailText} numberOfLines={1}>
        {text}
      </Text>
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

function ActiveChip({ label, onRemove }) {
  return (
    <View style={styles.activeChip}>
      <Text style={styles.activeChipText}>{label}</Text>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="close" size={13} color={Colors.primaryRed} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginBottom: 22,
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
    marginBottom: 18,
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

  /* ===== SEARCH + FILTERS ===== */
  searchRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
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

  /* ===== ACTIVE FILTER CHIPS ===== */
  activeChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
    alignItems: "center",
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDEAE0",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  activeChipText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.semiBold,
    color: Colors.primaryRed,
  },
  clearAllButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textMuted,
    textDecorationLine: "underline",
  },

  /* ===== SORT ROW ===== */
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sortLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortLabel: {
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  sortValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  sortValue: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  profileCount: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },

  /* ===== PROFILE LIST ===== */
  profileList: {
    gap: 16,
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 12,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  profilePhotoWrapper: {
    width: "32%",
    aspectRatio: 0.85,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.border,
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
  },
  onlineBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  onlineBadgeText: {
    fontSize: 9.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRedDark,
  },
  profileProfession: {
    fontSize: 12.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textPrimary,
    marginTop: 2,
    marginBottom: 6,
  },
  detailLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 6,
    width: 14,
  },
  detailText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    flexShrink: 1,
  },

  profileActions: {
    width: 56,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  messageButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.iconCircleBg,
    alignItems: "center",
    justifyContent: "center",
  },
  shortlistAction: {
    alignItems: "center",
  },
  shortlistLabel: {
    fontSize: 9.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginTop: 3,
    textAlign: "center",
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

  /* ===== PREMIUM BANNER ===== */
  premiumBanner: {
    backgroundColor: "#FDF3D8",
    borderRadius: 16,
    padding: 16,
  },
  premiumIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  premiumTextBlock: {
    marginBottom: 12,
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
    paddingVertical: 13,
    gap: 5,
  },
  upgradeButtonText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  /* ===== BOTTOM TAB BAR ===== */
  bottomTabBar: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 22 : 10,
  },
  bottomTabItem: {
    flex: 1,
    alignItems: "center",
  },
  bottomTabLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textMuted,
    marginTop: 3,
  },
  bottomTabLabelActive: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.bold,
  },
  tabBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: Colors.primaryRed,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  /* ===== SORT DROPDOWN ===== */
  sortModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  sortMenu: {
    position: "absolute",
    top: 220,
    left: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    paddingVertical: 6,
    minWidth: 180,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sortMenuOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortMenuOptionText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
  },
  sortMenuOptionTextActive: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.bold,
  },

  /* ===== FILTERS MODAL ===== */
  filtersModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  filtersModalCard: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    maxHeight: "80%",
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
