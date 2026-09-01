import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import Svg, { Path } from "react-native-svg";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

// Swap for the user's actual uploaded photos, e.g. { uri: photo.url }
const PHOTO_PLACEHOLDER = require("../../assets/images/Match7.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PROFILE = {
  name: "Priya Sharma",
  age: 24,
  id: "MW123456",
  profession: "Software Engineer",
  location: "Hyderabad, Telangana, India",
  height: "5'4\" (162 cm)",
  maritalStatus: "Never Married",
  community: "Mudhiraj",
  religion: "Hindu",
  isOnline: true,
  totalPhotos: 6,
};

const ABOUT_ME =
  "I am a simple, positive and family-oriented person. I believe in our traditions and values. Looking for a life partner who understands and respects family values.";

const EDUCATION_CAREER = [
  { icon: "school-outline", label: "Education", value: "B.E / B.Tech" },
  {
    icon: "briefcase-outline",
    label: "Profession",
    value: "Software Engineer",
  },
  { icon: "business-outline", label: "Employed In", value: "Private Company" },
];

const FAMILY_DETAILS = [
  {
    icon: "person-outline",
    label: "Father",
    value: "Rajesh Sharma (Business)",
  },
  {
    icon: "person-outline",
    label: "Mother",
    value: "Suman Sharma (Homemaker)",
  },
  { icon: "people-outline", label: "Siblings", value: "1 Brother (Younger)" },
];

const LIFESTYLE = [
  {
    icon: "leaf-outline",
    iconColor: "#3E9B5C",
    label: "Diet",
    value: "Vegetarian",
  },
  { icon: "ban-outline", iconColor: "#E0566B", label: "Smoke", value: "No" },
  { icon: "ban-outline", iconColor: "#E0566B", label: "Drink", value: "No" },
  {
    icon: "body-outline",
    iconColor: "#3E7FE0",
    label: "Body Type",
    value: "Slim",
  },
];

const COMMUNITY_HOROSCOPE = [
  { icon: "people-outline", label: "Community", value: "Mudhiraj" },
  { icon: "book-outline", label: "Gothram", value: "Kashyap" },
  { icon: "moon-outline", label: "Rashi", value: "Kanya (Virgo)" },
  { icon: "star-outline", label: "Nakshatram", value: "Hasta" },
];

const PARTNER_PREFERENCES = [
  { icon: "time-outline", label: "Age", value: "23 - 28 Years" },
  { icon: "resize-outline", label: "Height", value: "5'2\" - 5'10\"" },
  { icon: "school-outline", label: "Education", value: "Graduate and above" },
  { icon: "location-outline", label: "Location", value: "India" },
];

const STATS = [
  { icon: "eye-outline", label: "Profile Views", value: "23" },
  { icon: "heart", label: "Interests Received", value: "15", color: "#D64550" },
  { icon: "star", label: "Shortlisted By", value: "8", color: "#E0A93E" },
  {
    icon: "chatbubble-ellipses",
    label: "Response Rate",
    value: "High",
    color: "#3E9B5C",
  },
];

export default function ProfilePreviewScreen() {
  const router = useRouter();
  const [thumbnails] = useState(new Array(5).fill(0));

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER — back button only ================= */}
      <View style={styles.headerWrapper}>
        <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={20} color={Colors.primaryRed} />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        <Svg
          width={SCREEN_WIDTH}
          height={24}
          viewBox={`0 0 ${SCREEN_WIDTH} 24`}
          style={styles.headerWave}
        >
          <Path
            d={`M0,4 Q${SCREEN_WIDTH * 0.25},22 ${SCREEN_WIDTH * 0.5},10 Q${SCREEN_WIDTH * 0.75},-2 ${SCREEN_WIDTH},14`}
            stroke={Colors.goldLight}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= COMPLETION BANNER ================= */}
        <View style={styles.completionBanner}>
          <Ionicons name="ribbon-outline" size={16} color="#E08A1E" />
          <Text style={styles.completionText}>
            Your profile is <Text style={styles.completionHighlight}>85%</Text>{" "}
            complete
          </Text>
          <TouchableOpacity style={styles.completeNowRow}>
            <Text style={styles.completeNowText}>Complete Now</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={Colors.primaryRed}
            />
          </TouchableOpacity>
        </View>

        {/* ================= PAGE TITLE ================= */}
        <View style={styles.titleRow}>
          <View style={styles.titleTextBlock}>
            <Text style={styles.titleText}>Profile Preview</Text>
            <Text style={styles.subtitleText}>
              This is how others see your profile
            </Text>
          </View>
          <TouchableOpacity
            style={styles.previewSettingsButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name="eye-outline"
              size={15}
              color="#E08A1E"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.previewSettingsText}>Preview Settings</Text>
          </TouchableOpacity>
        </View>

        {/* ================= PROFILE CARD ================= */}
        <View style={styles.profileCard}>
          <View style={styles.photoWrapper}>
            <Image
              source={PHOTO_PLACEHOLDER}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.45)"]}
              style={styles.photoShade}
              pointerEvents="none"
            />

            <TouchableOpacity style={styles.expandButton} activeOpacity={0.8}>
              <Ionicons
                name="expand-outline"
                size={16}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.photoCountBadge}>
              <Ionicons name="image-outline" size={12} color={Colors.white} />
              <Text style={styles.photoCountText}>
                {" "}
                {PROFILE.totalPhotos} Photos
              </Text>
            </View>

            {PROFILE.isOnline && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            )}
          </View>

          {/* ---- Name / details ---- */}
          <View style={styles.detailsBlock}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>
                {PROFILE.name}, {PROFILE.age}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#E0A93E"
                style={{ marginLeft: 6 }}
              />
            </View>

            <View style={styles.idRow}>
              <Text style={styles.idText}>ID: {PROFILE.id}</Text>
              <Ionicons
                name="copy-outline"
                size={13}
                color={Colors.textMuted}
                style={{ marginLeft: 6 }}
              />
            </View>

            <DetailRow icon="briefcase-outline" text={PROFILE.profession} />
            <DetailRow icon="location-outline" text={PROFILE.location} />
            <DetailRow
              icon="male-female-outline"
              text={`${PROFILE.height}  •  ${PROFILE.maritalStatus}`}
            />
            <DetailRow
              icon="people-outline"
              text={`${PROFILE.community}  •  ${PROFILE.religion}`}
            />

            {/* ---- Action icons ---- */}
            <View style={styles.actionsRow}>
              <ActionIcon
                icon="heart"
                color="#D64550"
                bg="#FCE4E6"
                label="Interested"
              />
              <ActionIcon
                icon="star"
                color="#E0A93E"
                bg="#FDF0D0"
                label="Shortlist"
              />
              <ActionIcon
                icon="chatbubble-ellipses"
                color="#3E9B5C"
                bg="#DDF3E3"
                label="Message"
              />
            </View>

            {/* ---- Contact available banner ---- */}
            <View style={styles.contactBanner}>
              <View style={styles.contactHeaderRow}>
                <Ionicons name="checkmark-circle" size={16} color="#E08A1E" />
                <Text style={styles.contactTitle}> Contact Available</Text>
              </View>
              <Text style={styles.contactSubtitle}>
                Premium members can view full contact details
              </Text>
              <TouchableOpacity
                style={styles.upgradeSmallButton}
                activeOpacity={0.85}
              >
                <Text style={styles.upgradeSmallButtonText}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ---- Thumbnail strip ---- */}
          <View style={styles.thumbnailRow}>
            {thumbnails.map((_, i) => (
              <View key={i} style={styles.thumbnailTile}>
                <Image
                  source={PHOTO_PLACEHOLDER}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </View>
            ))}
            <View style={[styles.thumbnailTile, styles.moreThumbnailTile]}>
              <Text style={styles.moreThumbnailText}>+2</Text>
            </View>
          </View>
        </View>

        {/* ================= TWO-COLUMN SECTIONS ================= */}
        <View style={styles.gridTwoCol}>
          <InfoCard title="About Me" icon="create-outline">
            <Text style={styles.aboutMeText}>{ABOUT_ME}</Text>
          </InfoCard>

          <InfoCard title="Education & Career" icon="school-outline">
            {EDUCATION_CAREER.map((item) => (
              <InfoRow key={item.label} {...item} />
            ))}
          </InfoCard>

          <InfoCard title="Family Details" icon="people-outline">
            {FAMILY_DETAILS.map((item) => (
              <InfoRow key={item.label} {...item} />
            ))}
          </InfoCard>

          <InfoCard title="Lifestyle" icon="flower-outline">
            {LIFESTYLE.map((item) => (
              <InfoRow key={item.label} {...item} />
            ))}
          </InfoCard>

          <InfoCard title="Community & Horoscope" icon="people-outline">
            {COMMUNITY_HOROSCOPE.map((item) => (
              <InfoRow key={item.label} {...item} />
            ))}
          </InfoCard>

          <InfoCard title="Partner Preferences" icon="person-outline">
            {PARTNER_PREFERENCES.map((item) => (
              <InfoRow key={item.label} {...item} />
            ))}
          </InfoCard>
        </View>

        {/* ================= STATS BAR ================= */}
        <View style={styles.statsBar}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <View style={styles.statHeaderRow}>
                <Ionicons
                  name={stat.icon}
                  size={13}
                  color={stat.color ?? Colors.textMuted}
                />
                <Text style={styles.statLabel}> {stat.label}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* ================= BOTTOM ACTIONS ================= */}
        <View style={styles.bottomActionsRow}>
          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8}>
            <Ionicons
              name="share-social-outline"
              size={16}
              color={Colors.primaryRed}
            />
            <Text style={styles.outlineButtonText}> Share Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} activeOpacity={0.8}>
            <Ionicons name="eye-outline" size={16} color={Colors.primaryRed} />
            <Text style={styles.outlineButtonText}> View as Others</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.premiumButton} activeOpacity={0.85}>
          <Ionicons name="diamond-outline" size={17} color={Colors.white} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.premiumButtonTitle}>Go Premium</Text>
            <Text style={styles.premiumButtonSubtitle}>
              Get 5x More Responses
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function DetailRow({ icon, text }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={13} color={Colors.primaryRed} />
      <Text style={styles.detailText}> {text}</Text>
    </View>
  );
}

function ActionIcon({ icon, color, bg, label }) {
  return (
    <View style={styles.actionIconItem}>
      <View style={[styles.actionIconCircle, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.actionIconLabel, { color }]}>{label}</Text>
    </View>
  );
}

function InfoCard({ title, icon, children }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardHeaderRow}>
        <View style={styles.infoCardTitleRow}>
          <Ionicons
            name={icon}
            size={15}
            color={Colors.primaryRed}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.infoCardTitle}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.viewAllRow} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons
            name="chevron-forward"
            size={13}
            color={Colors.primaryRed}
          />
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ icon, iconColor, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons
        name={icon}
        size={14}
        color={iconColor ?? Colors.textMuted}
        style={{ marginRight: 8 }}
      />
      <View style={styles.infoRowTextBlock}>
        <Text style={styles.infoRowLabel}>{label}</Text>
        <Text style={styles.infoRowValue}>{value}</Text>
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 30,
  },

  /* ===== HEADER — back button only ===== */
  headerWrapper: {
    width: "100%",
  },
  header: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {},
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  headerWave: {
    marginTop: -6,
  },

  /* ===== COMPLETION BANNER ===== */
  completionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3D8",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 16,
    marginBottom: 22,
    gap: 8,
  },
  completionText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: "#5A3E12",
  },
  completionHighlight: {
    fontFamily: Fonts.body.bold,
    color: "#5A3E12",
  },
  completeNowRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  completeNowText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== PAGE TITLE ===== */
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  titleTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  titleText: {
    fontSize: FontSizes.welcome + 2,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  subtitleText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 4,
  },
  previewSettingsButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E0A93E",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewSettingsText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: "#E08A1E",
  },

  /* ===== PROFILE CARD ===== */
  profileCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 12,
    marginBottom: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  photoWrapper: {
    width: "100%",
    aspectRatio: 0.86,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.border,
    position: "relative",
  },
  mainPhoto: {
    width: "100%",
    height: "100%",
  },
  photoShade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  expandButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoCountBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(179,21,28,0.9)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  photoCountText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#3E9B5C",
    marginRight: 5,
  },
  onlineText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  detailsBlock: {
    paddingTop: 16,
    paddingHorizontal: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },
  idText: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  detailText: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
    marginBottom: 16,
  },
  actionIconItem: {
    alignItems: "center",
  },
  actionIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actionIconLabel: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
  },

  contactBanner: {
    backgroundColor: "#FDF3D8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  contactHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  contactTitle: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: "#5A3E12",
  },
  contactSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: "#8A6A2E",
    marginBottom: 10,
  },
  upgradeSmallButton: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: "#E0A93E",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  upgradeSmallButtonText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: "#8A6A2E",
  },

  thumbnailRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  thumbnailTile: {
    flex: 1,
    aspectRatio: 0.82,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: Colors.border,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  moreThumbnailTile: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(179,21,28,0.08)",
  },
  moreThumbnailText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== TWO-COLUMN INFO SECTIONS ===== */
  gridTwoCol: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoCard: {
    width: "48.5%",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  infoCardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  infoCardTitle: {
    fontSize: 13,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    flexShrink: 1,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginRight: 2,
  },
  aboutMeText: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  infoRowTextBlock: {
    flexShrink: 1,
  },
  infoRowLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  infoRowValue: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginTop: 1,
  },

  /* ===== STATS BAR ===== */
  statsBar: {
    flexDirection: "row",
    backgroundColor: "#FDF3D8",
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  statValue: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },

  /* ===== BOTTOM ACTIONS ===== */
  bottomActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  outlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderRadius: 14,
    paddingVertical: 13,
  },
  outlineButtonText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRedDark,
    borderRadius: 14,
    paddingVertical: 14,
  },
  premiumButtonTitle: {
    fontSize: 14.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  premiumButtonSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: "rgba(255,255,255,0.85)",
    marginTop: 1,
  },
});
