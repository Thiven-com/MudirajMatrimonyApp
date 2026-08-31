import {
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Platform,
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
// Swap this for the profile's actual photo, e.g. { uri: profile.photoUrl }
const PROFILE_PHOTO = require("../../assets/images/Match4.png");

const TABS = [
  { key: "about", label: "About", icon: "person" },
  { key: "family", label: "Family", icon: "people" },
  { key: "lifestyle", label: "Lifestyle", icon: "cafe" },
  { key: "career", label: "Education & Career", icon: "briefcase" },
  { key: "photos", label: "Photos", icon: "image" },
];

const ABOUT_LEFT = [
  { icon: "calendar", label: "Date of Birth", value: "15 May 1999" },
  { icon: "AGE", label: "Age", value: "25 Years" },
  { icon: "ruler", label: "Height", value: "5'4\"" },
  { icon: "marital", label: "Marital Status", value: "Never Married" },
  { icon: "R", label: "Mother Tongue", value: "Telugu" },
  { icon: "blood", label: "Blood Group", value: "O+" },
];

const ABOUT_RIGHT = [
  { icon: "om", label: "Religion", value: "Hindu" },
  { icon: "people", label: "Caste", value: "Mudhiraj" },
  { icon: "people2", label: "Sub Caste", value: "Godari (Gouda)" },
  { icon: "school", label: "Education", value: "B.Tech, Computer Science" },
  { icon: "briefcase", label: "Profession", value: "Software Engineer" },
  { icon: "rupee", label: "Annual Income", value: "₹ 8 - 10 LPA" },
];

const ABOUT_MYSELF_SHORT =
  "I am a simple, ambitious and family-oriented person. I love reading books, listening to music and travelling to new places.";
const ABOUT_MYSELF_FULL =
  ABOUT_MYSELF_SHORT +
  " I value honesty and kindness, and I'm looking for a partner who shares similar values and is ready to build a happy life together, with equal respect for each other's careers and families.";

export default function ProfileDetailScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [showMore, setShowMore] = useState(false);

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

        {/* ================= PHOTO + SUMMARY ROW ================= */}
        <View style={styles.summaryRow}>
          {/* Photo */}
          <View style={styles.photoCard}>
            <Image
              source={PROFILE_PHOTO}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
            <View style={styles.photoCounter}>
              <Ionicons name="images-outline" size={12} color={Colors.white} />
              <Text style={styles.photoCounterText}>1/24</Text>
              <Ionicons
                name="expand-outline"
                size={12}
                color={Colors.white}
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoPanel}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>Priyanka, 25</Text>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
                style={{ marginLeft: 6 }}
              />
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={Colors.primaryRed}
                />
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 12 }}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.professionText}>Software Engineer</Text>

            <DetailRow icon="location" text="Hyderabad, Telangana" />
            <DetailRow icon="school-outline" text="B.Tech, Computer Science" />
            <DetailRow icon="resize-outline" text="5'4&quot;" />
            <DetailRow icon="om" text="Hindu - Mudhiraj" />
            <DetailRow icon="people-outline" text="Mudhiraj (Godari Gouda)" />

            <View style={styles.verifiedBanner}>
              <View style={styles.verifiedIconCircle}>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={Colors.primaryRed}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.verifiedTitle}>100% Verified Profile</Text>
                <Text style={styles.verifiedSubtitle}>
                  Verified by Mudhiraj Matrimony
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================= QUICK ACTIONS ================= */}
        <View style={styles.quickActionsCard}>
          <QuickAction
            icon="heart"
            label="Shortlist"
            color={Colors.primaryRed}
            filled
          />
          <QuickAction
            icon="star-outline"
            label="Send Interest"
            color={Colors.gold}
          />
          <QuickAction
            icon="chatbubble-ellipses-outline"
            label="Message"
            color={Colors.primaryRed}
          />
          <QuickAction
            icon="call-outline"
            label="Request Contact"
            color={Colors.success}
          />
          <QuickAction
            icon="ellipsis-horizontal"
            label="More"
            color={Colors.textSecondary}
          />
        </View>

        {/* ================= TABS ================= */}
        <View style={styles.tabsRow}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={isActive ? Colors.primaryRed : Colors.textMuted}
                />
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.tabsDivider} />

        {/* ================= TAB CONTENT ================= */}
        {activeTab === "about" ? (
          <View style={styles.aboutSection}>
            <Text style={styles.aboutHeading}>About Priyanka</Text>

            <View style={styles.aboutGrid}>
              <View style={styles.aboutColumn}>
                {ABOUT_LEFT.map((item) => (
                  <AboutItem key={item.label} {...item} />
                ))}
              </View>
              <View style={styles.aboutColumn}>
                {ABOUT_RIGHT.map((item) => (
                  <AboutItem key={item.label} {...item} />
                ))}
              </View>
            </View>

            <View style={styles.aboutDivider} />

            <Text style={styles.aboutHeading}>About Myself</Text>
            <Text style={styles.aboutMyselfText}>
              {showMore ? ABOUT_MYSELF_FULL : ABOUT_MYSELF_SHORT}
            </Text>
            <TouchableOpacity
              style={styles.showMoreRow}
              onPress={() => setShowMore(!showMore)}
              activeOpacity={0.7}
            >
              <Text style={styles.showMoreText}>
                {showMore ? "Show Less" : "Show More"}
              </Text>
              <Ionicons
                name={showMore ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.primaryRed}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderText}>
              {TABS.find((t) => t.key === activeTab)?.label} details go here.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ================= STICKY BOTTOM BAR ================= */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomOutlineButton}
          activeOpacity={0.8}
        >
          <Ionicons name="heart-outline" size={18} color={Colors.primaryRed} />
          <Text style={styles.bottomOutlineText}>Shortlist</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomRedButton} activeOpacity={0.85}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={Colors.white}
          />
          <Text style={styles.bottomRedText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomGoldButton} activeOpacity={0.85}>
          <Ionicons name="star" size={18} color={Colors.white} />
          <Text style={styles.bottomGoldText}>Send Interest</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ================= SMALL SUBCOMPONENTS =================
function DetailRow({ icon, text }) {
  const isOm = icon === "om";
  return (
    <View style={styles.detailRow}>
      {isOm ? (
        <Text style={styles.omSymbol}>ॐ</Text>
      ) : (
        <Ionicons
          name={icon}
          size={16}
          color={Colors.primaryRed}
          style={styles.detailIcon}
        />
      )}
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, filled }) {
  return (
    <TouchableOpacity style={styles.quickAction} activeOpacity={0.7}>
      <Ionicons name={filled ? icon : icon} size={22} color={color} />
      <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function AboutItem({ icon, label, value }) {
  return (
    <View style={styles.aboutItemRow}>
      <View style={styles.aboutIconCircle}>{renderAboutIcon(icon)}</View>
      <View>
        <Text style={styles.aboutItemLabel}>{label}</Text>
        <Text style={styles.aboutItemValue}>{value}</Text>
      </View>
    </View>
  );
}

function renderAboutIcon(icon) {
  switch (icon) {
    case "calendar":
      return (
        <Ionicons name="calendar-outline" size={16} color={Colors.primaryRed} />
      );
    case "AGE":
      return <Text style={styles.aboutIconText}>AGE</Text>;
    case "ruler":
      return (
        <MaterialCommunityIcons
          name="ruler"
          size={16}
          color={Colors.primaryRed}
        />
      );
    case "marital":
      return (
        <MaterialCommunityIcons
          name="ring"
          size={16}
          color={Colors.primaryRed}
        />
      );
    case "R":
      return <Text style={styles.aboutIconText}>R</Text>;
    case "blood":
      return (
        <Ionicons name="water-outline" size={16} color={Colors.primaryRed} />
      );
    case "om":
      return <Text style={styles.omSymbolSmall}>ॐ</Text>;
    case "people":
      return (
        <Ionicons name="people-outline" size={16} color={Colors.primaryRed} />
      );
    case "people2":
      return <Ionicons name="people" size={16} color={Colors.primaryRed} />;
    case "school":
      return (
        <Ionicons name="school-outline" size={16} color={Colors.primaryRed} />
      );
    case "briefcase":
      return (
        <Ionicons
          name="briefcase-outline"
          size={16}
          color={Colors.primaryRed}
        />
      );
    case "rupee":
      return (
        <FontAwesome5 name="rupee-sign" size={13} color={Colors.primaryRed} />
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  /* ===== TOP BAR ===== */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  headerLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },

  /* ===== SUMMARY ROW ===== */
  summaryRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 4,
  },
  photoCard: {
    width: "44%",
    aspectRatio: 0.78,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.border,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  onlineBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 5,
  },
  onlineText: {
    fontSize: 11,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
  },
  photoCounter: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  photoCounterText: {
    fontSize: 10,
    fontFamily: Fonts.body.medium,
    color: Colors.white,
    marginHorizontal: 3,
  },

  infoPanel: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRedDark,
  },
  professionText: {
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
    marginTop: 4,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
    width: 16,
  },
  omSymbol: {
    fontSize: 15,
    color: Colors.primaryRed,
    marginRight: 8,
    width: 16,
    textAlign: "center",
  },
  detailText: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    flexShrink: 1,
  },

  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3D8",
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  verifiedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  verifiedTitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRedDark,
  },
  verifiedSubtitle: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  /* ===== QUICK ACTIONS ===== */
  quickActionsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.semiBold,
    marginTop: 4,
    textAlign: "center",
  },

  /* ===== TABS ===== */
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    paddingBottom: 10,
  },
  tabLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  tabLabelActive: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.bold,
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: "70%",
    backgroundColor: Colors.primaryRed,
    borderRadius: 1,
  },
  tabsDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  /* ===== ABOUT SECTION ===== */
  aboutSection: {
    marginTop: 20,
  },
  aboutHeading: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginBottom: 14,
  },
  aboutGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  aboutColumn: {
    width: "48%",
  },
  aboutItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  aboutIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.iconCircleBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  aboutIconText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  omSymbolSmall: {
    fontSize: 15,
    color: Colors.primaryRed,
  },
  aboutItemLabel: {
    fontSize: 13,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
  },
  aboutItemValue: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 1,
  },

  aboutDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },

  aboutMyselfText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  showMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  showMoreText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginRight: 4,
  },

  placeholderSection: {
    marginTop: 30,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  /* ===== STICKY BOTTOM BAR ===== */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 26 : 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomOutlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  bottomOutlineText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  bottomRedButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  bottomRedText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  bottomGoldButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  bottomGoldText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
