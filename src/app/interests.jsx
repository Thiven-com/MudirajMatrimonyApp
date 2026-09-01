import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Image,
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

const LOGO = require("../../assets/images/logo.png");
// Swap each of these for the actual profile photo, e.g. { uri: interest.photoUrl }
const PHOTO_PLACEHOLDER = require("../../assets/images/Match5.png");

const TABS = [
  { key: "all", label: "All Interests", icon: "people", count: 24 },
  { key: "new", label: "New", icon: "heart", count: 8 },
  { key: "viewed", label: "Viewed", icon: "eye", count: 16 },
];

// `isNew` drives the yellow "NEW" ribbon and the New tab filter.
// `viewed` backs the Viewed tab filter.
const INTERESTS = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 24,
    verified: true,
    profession: "Software Engineer",
    location: "Hyderabad, Telangana",
    education: "B.E / B.Tech",
    height: "5'4\"",
    maritalStatus: "Never Married",
    photoCount: 5,
    isNew: true,
    viewed: false,
  },
  {
    id: "2",
    name: "Anjali Reddy",
    age: 26,
    verified: true,
    profession: "HR Manager",
    location: "Bengaluru, Karnataka",
    education: "MBA",
    height: "5'6\"",
    maritalStatus: "Never Married",
    photoCount: 5,
    isNew: true,
    viewed: false,
  },
  {
    id: "3",
    name: "Sneha Patil",
    age: 25,
    verified: true,
    profession: "Business Analyst",
    location: "Pune, Maharashtra",
    education: "B.Sc (CS)",
    height: "5'3\"",
    maritalStatus: "Never Married",
    photoCount: 4,
    isNew: true,
    viewed: true,
  },
  {
    id: "4",
    name: "Neha Singh",
    age: 23,
    verified: true,
    profession: "Content Writer",
    location: "Delhi, Delhi",
    education: "BA (English)",
    height: "5'5\"",
    maritalStatus: "Never Married",
    photoCount: 4,
    isNew: true,
    viewed: true,
  },
];

export default function InterestsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [responses, setResponses] = useState({}); // { [id]: "accepted" | "ignored" }

  const filteredInterests = useMemo(() => {
    let list = INTERESTS.filter((i) => !responses[i.id]);
    if (activeTab === "new") list = list.filter((i) => i.isNew);
    if (activeTab === "viewed") list = list.filter((i) => i.viewed);
    return list;
  }, [activeTab, responses]);

  const respond = (id, action) => {
    setResponses((prev) => ({ ...prev, [id]: action }));
  };

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

        {/* ===== TITLE ===== */}
        <View style={styles.titleRow}>
          <View style={styles.titleIconCircle}>
            <Ionicons name="people" size={22} color={Colors.primaryRed} />
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.titleText}>Interests</Text>
            <Text style={styles.subtitleText}>
              People who are interested in your profile
            </Text>
          </View>
          <TouchableOpacity style={styles.filtersButton} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={16} color={Colors.gold} />
            <Text style={styles.filtersButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* ===== TABS ===== */}
        <View style={styles.tabsRow}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={tab.icon}
                  size={14}
                  color={isActive ? Colors.white : Colors.primaryRed}
                />
                <Text
                  style={[
                    styles.tabPillText,
                    isActive && styles.tabPillTextActive,
                  ]}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ===== INTEREST CARDS ===== */}
        <View style={styles.cardsList}>
          {filteredInterests.length > 0 ? (
            filteredInterests.map((person) => (
              <InterestCard
                key={person.id}
                person={person}
                onIgnore={() => respond(person.id, "ignored")}
                onAccept={() => respond(person.id, "accepted")}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={30}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyStateText}>
                No one here right now. Check back soon!
              </Text>
            </View>
          )}
        </View>

        {/* ===== PREMIUM BANNER ===== */}
        <View style={styles.premiumBanner}>
          <View style={styles.premiumIconCircle}>
            <MaterialCommunityIcons
              name="crown"
              size={20}
              color={Colors.white}
            />
          </View>
          <View style={styles.premiumTextBlock}>
            <Text style={styles.premiumTitle}>
              Go Premium, Get More Connections!
            </Text>
            <Text style={styles.premiumSubtitle}>
              Unlock contact details, chat & more.
            </Text>
          </View>
          <TouchableOpacity style={styles.premiumButton} activeOpacity={0.85}>
            <Text style={styles.premiumButtonText}>Upgrade Now</Text>
            <Ionicons name="chevron-forward" size={15} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function InterestCard({ person, onIgnore, onAccept }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.photoWrapper}>
          <Image source={PHOTO_PLACEHOLDER} style={styles.photo} />
          {person.isNew && (
            <View style={styles.newRibbon}>
              <Text style={styles.newRibbonText}>NEW</Text>
            </View>
          )}
          <View style={styles.photoCountBadge}>
            <Ionicons name="images" size={11} color={Colors.white} />
            <Text style={styles.photoCountText}>
              {person.photoCount} Photos
            </Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>
              {person.name}, {person.age}
            </Text>
            {person.verified && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={Colors.gold}
                style={{ marginLeft: 5 }}
              />
            )}
          </View>

          <View style={styles.cardDetailRow}>
            <Ionicons
              name="briefcase-outline"
              size={13}
              color={Colors.textSecondary}
            />
            <Text style={styles.cardDetailText}>{person.profession}</Text>
          </View>
          <View style={styles.cardDetailRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color={Colors.textSecondary}
            />
            <Text style={styles.cardDetailText}>{person.location}</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardMetaRow}>
            <View style={styles.cardDetailRow}>
              <Ionicons
                name="school-outline"
                size={13}
                color={Colors.textSecondary}
              />
              <Text style={styles.cardDetailText}>{person.education}</Text>
            </View>
            <Text style={styles.cardMetaSeparator}>|</Text>
            <View style={styles.cardDetailRow}>
              <MaterialCommunityIcons
                name="human-male-height"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.cardDetailText}>{person.height}</Text>
            </View>
          </View>
          <View style={styles.cardDetailRow}>
            <Ionicons name="star" size={13} color={Colors.gold} />
            <Text style={styles.cardDetailText}>{person.maritalStatus}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          style={styles.ignoreButton}
          activeOpacity={0.8}
          onPress={onIgnore}
        >
          <Ionicons
            name="close-circle-outline"
            size={16}
            color={Colors.primaryRed}
          />
          <Text style={styles.ignoreButtonText}>Ignore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          activeOpacity={0.85}
          onPress={onAccept}
        >
          <Ionicons name="heart" size={15} color={Colors.gold} />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDF3D8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleTextBlock: {
    flex: 1,
  },
  titleText: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRedDark,
  },
  subtitleText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 3,
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.3,
    borderColor: Colors.gold,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 5,
  },
  filtersButtonText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.gold,
  },

  /* ===== TABS ===== */
  tabsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    borderWidth: 1.3,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: Colors.primaryRed,
    borderColor: Colors.primaryRed,
  },
  tabPillText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    textAlign: "center",
  },
  tabPillTextActive: {
    color: Colors.white,
  },

  /* ===== CARDS ===== */
  cardsList: {
    gap: 16,
    marginBottom: 22,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    gap: 12,
  },
  photoWrapper: {
    position: "relative",
    width: 118,
  },
  photo: {
    width: 118,
    height: 148,
    borderRadius: 14,
  },
  newRibbon: {
    position: "absolute",
    top: 8,
    right: -6,
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  newRibbonText: {
    fontSize: 9.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRedDark,
    letterSpacing: 0.5,
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(176,26,26,0.85)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },
  photoCountText: {
    fontSize: 9.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  cardInfo: {
    flex: 1,
    justifyContent: "flex-start",
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardName: {
    fontSize: 16.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRedDark,
  },
  cardDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  cardDetailText: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 6,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  cardMetaSeparator: {
    fontSize: 12,
    color: Colors.border,
  },

  cardActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  ignoreButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.3,
    borderColor: Colors.primaryRed,
    borderRadius: 10,
    paddingVertical: 11,
    gap: 6,
  },
  ignoreButtonText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 10,
    paddingVertical: 11,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
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
  },

  /* ===== PREMIUM BANNER ===== */
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3D8",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  premiumIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumTextBlock: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  premiumSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  premiumButtonText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
