import { useNavigation } from "@react-navigation/native";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colors } from "../constants/colors";
import Fonts from "../constants/Fonts";

// Swap for real profile photos, e.g. { uri: profile.photoUrl }
const PHOTO_PLACEHOLDER = require("../assets/images/Match7.png");

// ====== MOCK DATA ======
// Replace with the recently-viewed feed from your backend.
const RECENTLY_VIEWED_PROFILES = [
  {
    id: "1",
    name: "Ananya Sharma",
    age: 26,
    verified: true,
    photo: PHOTO_PLACEHOLDER,
    profession: "Software Engineer",
    education: "B.Tech - Computer Science",
    location: "Delhi, India",
    viewedLabel: "Viewed 2 hours ago",
    tags: [
      { icon: "star", label: "Hindu" },
      { icon: "feather", label: "Kashyapa" },
      { icon: "user", label: "Never Married" },
    ],
  },
  {
    id: "2",
    name: "Meghna Iyer",
    age: 25,
    verified: true,
    photo: PHOTO_PLACEHOLDER,
    profession: "Product Manager",
    education: "MBA - Marketing",
    location: "Bengaluru, India",
    viewedLabel: "Viewed yesterday",
    tags: [
      { icon: "star", label: "Hindu" },
      { icon: "users", label: "Iyer" },
      { icon: "user", label: "Never Married" },
    ],
  },
  {
    id: "3",
    name: "Prachi Deshmukh",
    age: 24,
    verified: true,
    photo: PHOTO_PLACEHOLDER,
    profession: "Data Analyst",
    education: "B.Sc - Statistics",
    location: "Pune, India",
    viewedLabel: "Viewed 2 days ago",
    tags: [
      { icon: "star", label: "Hindu" },
      { icon: "feather", label: "Deshmukh" },
      { icon: "user", label: "Never Married" },
    ],
  },
  {
    id: "4",
    name: "Neha Reddy",
    age: 27,
    verified: true,
    photo: PHOTO_PLACEHOLDER,
    profession: "Chartered Accountant",
    education: "CA",
    location: "Hyderabad, India",
    viewedLabel: "Viewed 3 days ago",
    tags: [
      { icon: "star", label: "Hindu" },
      { icon: "feather", label: "Reddy" },
      { icon: "user", label: "Never Married" },
    ],
  },
];

export default function RecentlyViewedScreen() {
  const navigation = useNavigation();

  const handleViewProfile = (profile) => {
    navigation.navigate("ProfileDetail", { id: profile.id });
  };

  const handleInterested = (profile) => {
    // TODO: send an "interested" action to the backend
    console.log("Interested in", profile.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* ====== HEADER ====== */}
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={Colors.primaryRed} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Recently Viewed
        </Text>

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="filter" size={16} color={Colors.primaryRed} />
          <Text style={styles.filterButtonText}> Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== INTRO BANNER ====== */}
        <View style={styles.introBanner}>
          <View style={styles.introIconCircle}>
            <Feather name="eye" size={20} color={Colors.primaryRed} />
          </View>
          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>
              Profiles you have recently viewed
            </Text>
            <Text style={styles.introSubtitle}>
              You can connect with them or view their profile again.
            </Text>
          </View>
        </View>

        {/* ====== PROFILE LIST ====== */}
        {RECENTLY_VIEWED_PROFILES.map((profile) => (
          <ProfileRow
            key={profile.id}
            profile={profile}
            onInterested={() => handleInterested(profile)}
            onViewProfile={() => handleViewProfile(profile)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ====== SUBCOMPONENTS ======
function ProfileRow({ profile, onInterested, onViewProfile }) {
  return (
    <View style={styles.profileRow}>
      <Image
        source={profile.photo}
        style={styles.rowPhoto}
        resizeMode="cover"
      />

      <View style={styles.rowBody}>
        <View style={styles.rowTopLine}>
          <View style={styles.rowNameRow}>
            <Text style={styles.rowNameText} numberOfLines={1}>
              {profile.name}, {profile.age}
            </Text>
            {profile.verified && (
              <Ionicons
                name="check-circle"
                size={15}
                color="#3E9B5C"
                style={{ marginLeft: 5 }}
              />
            )}
          </View>
          <Text style={styles.viewedLabel} numberOfLines={1}>
            {profile.viewedLabel}
          </Text>
        </View>

        <RowDetail icon="briefcase-outline" text={profile.profession} />
        <RowDetail icon="school-outline" text={profile.education} />
        <RowDetail icon="location-outline" text={profile.location} />

        <View style={styles.tagRow}>
          {profile.tags.map((tag) => (
            <View key={tag.label} style={styles.tagPill}>
              <Feather name={tag.icon} size={11} color={Colors.primaryRed} />
              <Text style={styles.tagPillText}> {tag.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.rowActions}>
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
          <Feather name="heart" size={18} color={Colors.primaryRed} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RowDetail({ icon, text }) {
  return (
    <View style={styles.rowDetailRow}>
      <Feather name={icon} size={12.5} color={Colors.textMuted} />
      <Text style={styles.rowDetailText} numberOfLines={1}>
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
    paddingTop: 4,
    paddingBottom: 24,
  },

  /* ===== HEADER ===== */
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: Fonts.size.xxl,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    marginHorizontal: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,
    color: Colors.primaryRed,
  },

  /* ===== INTRO BANNER ===== */
  introBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FBE6E4",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
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
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  introSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },

  /* ===== PROFILE ROW ===== */
  profileRow: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  rowPhoto: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  rowBody: {
    flex: 1,
    marginLeft: 12,
  },
  rowTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  rowNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  rowNameText: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  viewedLabel: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  rowDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  rowDetailText: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
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
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
    color: Colors.primaryRed,
  },

  /* ===== ROW ACTIONS ===== */
  rowActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 8,
  },
  viewProfileButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "#FCE4D6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "auto",
  },
  viewProfileButtonText: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
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
    marginTop: 8,
  },
});
