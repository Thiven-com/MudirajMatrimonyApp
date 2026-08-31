import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

// ================= MOCK DATA =================
// Replace `value`/`onToggle` wiring with real settings state from your backend.
const TAB_ITEMS = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  {
    key: "matches",
    label: "Matches",
    icon: "heart-outline",
    activeIcon: "heart",
  },
  {
    key: "messages",
    label: "Messages",
    icon: "chatbubble-ellipses-outline",
    activeIcon: "chatbubble-ellipses",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "notifications-outline",
    activeIcon: "notifications",
    badge: 5,
  },
  {
    key: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function PrivacySettingsScreen() {
  const router = useRouter();

  const [hideProfile, setHideProfile] = useState(false);
  const [hideContact, setHideContact] = useState(true);

  const handleNavigate = (target) => {
    // TODO: navigate to the relevant sub-screen
    console.log("Navigate to", target);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          <Text style={styles.headerSubtitle}>
            Control your privacy and manage who can see your information
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= INTRO BANNER ================= */}
        <View style={styles.introBanner}>
          <View style={styles.introIconCircle}>
            <Ionicons
              name="shield-outline"
              size={26}
              color={Colors.primaryRed}
            />
            <View style={styles.introIconLockBadge}>
              <Ionicons name="lock-closed" size={11} color={Colors.white} />
            </View>
          </View>

          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>Your Privacy Matters</Text>
            <Text style={styles.introSubtitle}>
              We are committed to protecting your privacy and giving you full
              control over your information.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.privacyTipsButton}
          activeOpacity={0.8}
          onPress={() => handleNavigate("privacy-tips")}
        >
          <Ionicons
            name="lock-closed-outline"
            size={15}
            color={Colors.primaryRed}
          />
          <Text style={styles.privacyTipsButtonText}> Privacy Tips</Text>
        </TouchableOpacity>

        {/* ================= PROFILE VISIBILITY ================= */}
        <Text style={styles.sectionHeading}>Profile Visibility</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="eye-off-outline"
            iconColor={Colors.primaryRed}
            iconBg="#FCE4D6"
            title="Hide My Profile"
            subtitle="Your profile will not be visible in search results."
            control={
              <Switch
                value={hideProfile}
                onValueChange={setHideProfile}
                trackColor={{ false: Colors.border, true: Colors.primaryRed }}
                thumbColor={Colors.white}
              />
            }
          />
          <SettingRow
            icon="people-outline"
            iconColor="#B8860B"
            iconBg="#FCEFC9"
            title="Who Can View My Profile"
            subtitle="Choose who can view your profile details."
            control={<ValuePickerControl label="Members I Approve" />}
            onPress={() => handleNavigate("who-can-view-profile")}
          />
          <SettingRow
            icon="call-outline"
            iconColor={Colors.primaryRed}
            iconBg="#FCE4D6"
            title="Hide Contact Information"
            subtitle="Hide your phone number and email from others."
            control={
              <Switch
                value={hideContact}
                onValueChange={setHideContact}
                trackColor={{ false: Colors.border, true: Colors.primaryRed }}
                thumbColor={Colors.white}
              />
            }
          />
          <SettingRow
            icon="image-outline"
            iconColor="#B8860B"
            iconBg="#FCEFC9"
            title="Photo Privacy"
            subtitle="Choose who can view your photos."
            control={<ValuePickerControl label="Members I Approve" />}
            onPress={() => handleNavigate("photo-privacy")}
            isLast
          />
        </View>

        {/* ================= COMMUNICATION PRIVACY ================= */}
        <Text style={styles.sectionHeading}>Communication Privacy</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="chatbubble-ellipses-outline"
            iconColor={Colors.primaryRed}
            iconBg="#FCE4D6"
            title="Who Can Send Interests"
            subtitle="Choose who can send interest to your profile."
            control={<ValuePickerControl label="Members I Approve" />}
            onPress={() => handleNavigate("who-can-send-interests")}
          />
          <SettingRow
            icon="mail-outline"
            iconColor="#B8860B"
            iconBg="#FCEFC9"
            title="Who Can Send Messages"
            subtitle="Choose who can send you messages."
            control={<ValuePickerControl label="Members I Approve" />}
            onPress={() => handleNavigate("who-can-send-messages")}
          />
          <SettingRow
            icon="person-remove-outline"
            iconColor={Colors.primaryRed}
            iconBg="#FCE4D6"
            title="Block Members"
            subtitle="View and manage members you have blocked."
            control={
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textMuted}
              />
            }
            onPress={() => handleNavigate("blocked-members")}
            isLast
          />
        </View>

        {/* ================= DATA & ACTIVITY ================= */}
        <Text style={styles.sectionHeading}>Data &amp; Activity</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="download-outline"
            iconColor="#B8860B"
            iconBg="#FCEFC9"
            title="Download My Data"
            subtitle="Download a copy of your account data."
            control={
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textMuted}
              />
            }
            onPress={() => handleNavigate("download-data")}
          />
          <SettingRow
            icon="trash-outline"
            iconColor={Colors.primaryRed}
            iconBg="#FCE4D6"
            title="Delete My Account"
            subtitle="Permanently delete your account and data."
            control={
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Colors.textMuted}
              />
            }
            onPress={() => handleNavigate("delete-account")}
            isLast
          />
        </View>

        {/* ================= SECURE BANNER ================= */}
        <TouchableOpacity
          style={styles.secureBanner}
          activeOpacity={0.8}
          onPress={() => handleNavigate("learn-more-security")}
        >
          <View style={styles.secureIconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={Colors.primaryRed}
            />
          </View>
          <View style={styles.secureTextBlock}>
            <Text style={styles.secureTitle}>
              100% Secure &amp; Confidential
            </Text>
            <Text style={styles.secureSubtitle}>
              Your data is encrypted and never shared with third parties.
            </Text>
          </View>
          <View style={styles.secureLearnMoreRow}>
            <Ionicons name="lock-closed" size={12} color={Colors.primaryRed} />
            <Text style={styles.secureLearnMoreText}> Learn More</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= BOTTOM TAB BAR ================= */}
      <View style={styles.tabBar}>
        {TAB_ITEMS.map((tab) => {
          const isActive = tab.key === "profile";
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={styles.tabIconWrapper}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? Colors.primaryRed : Colors.textMuted}
                />
                {!!tab.badge && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function SettingRow({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  control,
  onPress,
  isLast,
}) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.settingRow, !isLast && styles.settingRowDivider]}
      activeOpacity={onPress ? 0.75 : undefined}
      onPress={onPress}
    >
      <View style={[styles.settingIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>

      <View style={styles.settingTextBlock}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.settingControl}>{control}</View>
    </Wrapper>
  );
}

function ValuePickerControl({ label }) {
  return (
    <View style={styles.valuePickerControl}>
      <Text style={styles.valuePickerText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  headerTitleBlock: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: "#FCE4D6",
    marginTop: 3,
  },

  /* ===== INTRO BANNER ===== */
  introBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FDF3E7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  introIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  introIconLockBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E8A93A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FDF3E7",
  },
  introTextBlock: {
    flex: 1,
  },
  introTitle: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  introSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  privacyTipsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginBottom: 22,
  },
  privacyTipsButtonText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== SECTIONS ===== */
  sectionHeading: {
    fontSize: 14.5,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },

  /* ===== SETTING ROW ===== */
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  settingRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingTextBlock: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 13.5,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  settingControl: {
    alignItems: "flex-end",
  },
  valuePickerControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  valuePickerText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginRight: 2,
  },

  /* ===== SECURE BANNER ===== */
  secureBanner: {
    backgroundColor: "#FBE6E4",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  secureIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  secureTextBlock: {
    flex: 1,
    minWidth: 180,
  },
  secureTitle: {
    fontSize: 13,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  secureSubtitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  secureLearnMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 44,
  },
  secureLearnMoreText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== BOTTOM TAB BAR ===== */
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardBackground,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 4 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabIconWrapper: {
    position: "relative",
  },
  tabBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  tabBadgeText: {
    fontSize: 9,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  tabLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.bold,
  },
});
