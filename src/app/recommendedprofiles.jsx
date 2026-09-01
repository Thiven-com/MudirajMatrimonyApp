import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Dimensions,
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

// Swap for real profile photos, e.g. { uri: profile.photoUrl }
const PHOTO_PLACEHOLDER = require("../../assets/images/Match7.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ================= MOCK DATA =================
// Replace with the recommendations feed from your backend. `matchPercent`
// drives the green badge color intensity; `tags` renders as the pill row.
const RECOMMENDED_PROFILES = [
  {
    id: "1",
    name: "Ananya Sharma",
    age: 26,
    matchPercent: 97,
    verified: true,
    photo: PHOTO_PLACEHOLDER,
    profession: "Software Engineer",
    education: "B.Tech - Computer Science",
    location: "Delhi, India",
    tags: [
      { icon: "sparkles-outline", label: "Hindu" },
      { icon: "flower-outline", label: "Kashyapa" },
      { icon: "person-outline", label: "Never Married" },
    ],
  },
  {
    id: "2",
    name: "Meghna Iyer",
    age: 25,
    matchPercent: 94,
    verified: true,
    photo: PHOTO_PLACEHOLDER,
    profession: "Product Manager",
    education: "MBA - Marketing",
    location: "Bengaluru, India",
    tags: [
      { icon: "sparkles-outline", label: "Hindu" },
      { icon: "flower-outline", label: "Iyengar" },
      { icon: "person-outline", label: "Never Married" },
    ],
  },
  {
    id: "3",
    name: "Prachi Deshmukh",
    age: 24,
    matchPercent: 92,
    verified: true,
    photo: PHOTO_PLACEHOLDER,
    profession: "Data Analyst",
    education: "B.Sc - Statistics",
    location: "Pune, India",
    tags: [
      { icon: "sparkles-outline", label: "Hindu" },
      { icon: "flower-outline", label: "Deshmukh" },
      { icon: "person-outline", label: "Never Married" },
    ],
  },
  {
    id: "4",
    name: "Neha Reddy",
    age: 27,
    matchPercent: 90,
    verified: true,
    photo: PHOTO_PLACEHOLDER,
    profession: "Chartered Accountant",
    education: "CA",
    location: "Hyderabad, India",
    tags: [
      { icon: "sparkles-outline", label: "Hindu" },
      { icon: "flower-outline", label: "Reddy" },
      { icon: "person-outline", label: "Never Married" },
    ],
  },
];

export default function RecommendedProfilesScreen() {
  const router = useRouter();

  const handleReject = (profile) => {
    // TODO: remove profile from the recommendation queue
    console.log("Rejected", profile.id);
  };

  const handleInterested = (profile) => {
    // TODO: send an "interested" action to the backend
    console.log("Interested in", profile.id);
  };

  const handleBookmark = (profile) => {
    // TODO: toggle shortlist / bookmark state
    console.log("Bookmarked", profile.id);
  };

  const handleViewProfile = (profile) => {
    router.push(`/profile/${profile.id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Ionicons name="menu" size={24} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Recommended Profiles
        </Text>

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="filter-outline" size={16} color={Colors.white} />
          <Text style={styles.filterButtonText}> Filter</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= INTRO BANNER ================= */}
        <View style={styles.introBanner}>
          <View style={styles.introIconCircle}>
            <Ionicons name="heart-half" size={20} color={Colors.primaryRed} />
          </View>
          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>
              Handpicked profiles that match your preferences.
            </Text>
            <Text style={styles.introSubtitle}>
              Explore and connect with your perfect match.
            </Text>
          </View>
        </View>

        {/* ================= SECTION HEADER ================= */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>Best Matches for You</Text>
            <View style={styles.sectionHeadingUnderlineRow}>
              <View style={styles.sectionHeadingUnderline} />
              <View style={styles.sectionHeadingUnderlineDot} />
            </View>
          </View>

          <TouchableOpacity style={styles.sortByRow} activeOpacity={0.7}>
            <Text style={styles.sortByLabel}>Sort by: </Text>
            <Text style={styles.sortByValue}>Best Match</Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={Colors.primaryRed}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
        </View>

        {/* ================= PROFILE GRID ================= */}
        <View style={styles.gridTwoCol}>
          {RECOMMENDED_PROFILES.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onReject={() => handleReject(profile)}
              onInterested={() => handleInterested(profile)}
              onBookmark={() => handleBookmark(profile)}
              onViewProfile={() => handleViewProfile(profile)}
            />
          ))}
        </View>

        {/* ================= UPDATE PREFERENCES BANNER ================= */}
        <TouchableOpacity
          style={styles.updateBanner}
          activeOpacity={0.8}
          onPress={() => router.push("/onboarding/partner-preference")}
        >
          <View style={styles.updateIconCircle}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color={Colors.primaryRed}
            />
          </View>
          <View style={styles.updateTextBlock}>
            <Text style={styles.updateText}>
              These profiles are recommended based on your preferences and
              activity.
            </Text>
            <Text style={styles.updateSubtext}>
              Update your preferences to get better matches.
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.updateLinkRow}>
          <Text style={styles.updateLinkText}>Update Preferences</Text>
          <Ionicons
            name="chevron-forward"
            size={13}
            color={Colors.primaryRed}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function ProfileCard({
  profile,
  onReject,
  onInterested,
  onBookmark,
  onViewProfile,
}) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.photoWrapper}>
        <Image
          source={profile.photo}
          style={styles.cardPhoto}
          resizeMode="cover"
        />

        <View style={styles.matchBadge}>
          <Text style={styles.matchBadgeText}>
            {profile.matchPercent}% Match
          </Text>
        </View>

        <TouchableOpacity
          style={styles.bookmarkButton}
          activeOpacity={0.8}
          onPress={onBookmark}
        >
          <Ionicons
            name="bookmark-outline"
            size={16}
            color={Colors.primaryRed}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardNameText} numberOfLines={1}>
            {profile.name}, {profile.age}
          </Text>
          {profile.verified && (
            <Ionicons
              name="checkmark-circle"
              size={15}
              color="#3E9B5C"
              style={{ marginLeft: 5 }}
            />
          )}
        </View>

        <CardDetailRow icon="briefcase-outline" text={profile.profession} />
        <CardDetailRow icon="school-outline" text={profile.education} />
        <CardDetailRow icon="location-outline" text={profile.location} />

        <View style={styles.tagRow}>
          {profile.tags.map((tag) => (
            <View key={tag.label} style={styles.tagPill}>
              <Ionicons name={tag.icon} size={11} color={Colors.primaryRed} />
              <Text style={styles.tagPillText}> {tag.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            style={styles.rejectButton}
            activeOpacity={0.8}
            onPress={onReject}
          >
            <Ionicons name="close" size={18} color={Colors.primaryRed} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewProfileButton}
            activeOpacity={0.85}
            onPress={onViewProfile}
          >
            <Text style={styles.viewProfileButtonText}>View Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interestButton}
            activeOpacity={0.8}
            onPress={onInterested}
          >
            <Ionicons
              name="heart-outline"
              size={18}
              color={Colors.primaryRed}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function CardDetailRow({ icon, text }) {
  return (
    <View style={styles.cardDetailRow}>
      <Ionicons name={icon} size={12.5} color={Colors.textMuted} />
      <Text style={styles.cardDetailText} numberOfLines={1}>
        {" "}
        {text}
      </Text>
    </View>
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
    paddingBottom: 24,
  },

  /* ===== HEADER ===== */
  header: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
    marginHorizontal: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  /* ===== INTRO BANNER ===== */
  introBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FDF3D8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  introIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FCE4D6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  introTextBlock: {
    flex: 1,
  },
  introTitle: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  introSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },

  /* ===== SECTION HEADER ===== */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  sectionHeadingUnderlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sectionHeadingUnderline: {
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.primaryRed,
  },
  sectionHeadingUnderlineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryRed,
    marginLeft: 3,
  },
  sortByRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  sortByLabel: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  sortByValue: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== PROFILE GRID ===== */
  gridTwoCol: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  profileCard: {
    width: "48.5%",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  photoWrapper: {
    width: "100%",
    aspectRatio: 0.92,
    backgroundColor: Colors.border,
    position: "relative",
  },
  cardPhoto: {
    width: "100%",
    height: "100%",
  },
  matchBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#1F7A3D",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  matchBadgeText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  bookmarkButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  cardBody: {
    padding: 12,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  cardNameText: {
    fontSize: 14,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  cardDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardDetailText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    flexShrink: 1,
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCE4D6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagPillText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
  },
  viewProfileButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FCE4D6",
    alignItems: "center",
    justifyContent: "center",
  },
  viewProfileButtonText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  interestButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ===== UPDATE PREFERENCES BANNER ===== */
  updateBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F1EEFB",
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  updateIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E4DFF9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  updateTextBlock: {
    flex: 1,
  },
  updateText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  updateSubtext: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  updateLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 8,
  },
  updateLinkText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginRight: 2,
  },
});
