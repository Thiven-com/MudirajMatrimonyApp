import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  BackHandler,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Feather from "react-native-vector-icons/Feather";

import { Colors } from "../constants/colors";
import Fonts from "../constants/Fonts";

// ================= MOCK DATA =================
// Replace with the real topics / channels config from your backend.
const QUICK_HELP_TOPICS = [
  {
    key: "account",
    icon: "user",
    iconColor: Colors.primaryRed,
    iconBg: "#FCE4D6",
    title: "Account Help",
    subtitle: "Login, profile & account settings",
  },
  {
    key: "privacy",
    icon: "shield",
    iconColor: "#B8860B",
    iconBg: "#FCEFC9",
    title: "Privacy & Safety",
    subtitle: "Privacy settings, blocking users",
  },
  {
    key: "matches",
    icon: "heart",
    iconColor: Colors.primaryRed,
    iconBg: "#FCE4D6",
    title: "Matches & Interests",
    subtitle: "Sending interests, messages & more",
  },
  {
    key: "payments",
    icon: "credit-card",
    iconColor: "#B8860B",
    iconBg: "#FCEFC9",
    title: "Payments & Plans",
    subtitle: "Membership, payments & refunds",
  },
  {
    key: "search",
    icon: "search",
    iconColor: "#B8860B",
    iconBg: "#FCEFC9",
    title: "Search & Filters",
    subtitle: "Search, filters & preferences",
  },
  {
    key: "notifications",
    icon: "bell",
    iconColor: Colors.primaryRed,
    iconBg: "#FCE4D6",
    title: "Notifications",
    subtitle: "Manage alerts & notifications",
  },
  {
    key: "photos",
    icon: "image",
    iconColor: "#B8860B",
    iconBg: "#FCEFC9",
    title: "Photos & Profile",
    subtitle: "Upload photos, profile tips",
  },
  {
    key: "other",
    icon: "more-horizontal",
    iconColor: Colors.primaryRed,
    iconBg: "#FCE4D6",
    title: "Other Topics",
    subtitle: "More help topics and guides",
  },
];

const SUPPORT_CHANNELS = [
  {
    key: "chat",
    icon: "message-circle",
    title: "Chat with Us",
    subtitle: "Chat live with our support team",
    status: "Online",
    ctaLabel: "Start Chat",
  },
  {
    key: "email",
    icon: "mail",
    iconBg: "#FCEFC9",
    title: "Email Support",
    subtitle: "Send us an email and we'll respond within 24 hours",
    ctaLabel: "Send Email",
  },
  {
    key: "call",
    icon: "phone",
    title: "Call Us",
    subtitle: "Speak with our support team\nMon - Sat, 9:00 AM - 6:00 PM",
    ctaLabel: "Call Now",
  },
];

const TAB_ITEMS = [
  { key: "home", label: "Home", icon: "home", activeIcon: "home" },
  {
    key: "matches",
    label: "Matches",
    icon: "heart",
    activeIcon: "heart",
  },
  {
    key: "messages",
    label: "Messages",
    icon: "message-circle",
    activeIcon: "message-circle",
    badge: 2,
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: "bell",
    activeIcon: "bell",
    badge: 5,
  },
  {
    key: "profile",
    label: "Profile",
    icon: "user",
    activeIcon: "user",
  },
];

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    }
    return false;
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const handleTopicPress = (topic) => {
    // TODO: navigate to the topic's help articles
    console.log("Open topic", topic.key);
  };

  const handleChannelPress = (channel) => {
    // TODO: start chat / open mail client / dial support number
    console.log("Open channel", channel.key);
  };

  const handleNavigate = (target) => {
    // TODO: navigate to the relevant sub-screen
    console.log("Navigate to", target);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Help &amp; Support</Text>
          <Text style={styles.headerSubtitle}>We're here to help you</Text>
        </View>

        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Feather name="headphones" size={24} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HERO SEARCH BANNER ================= */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconCircle}>
            <Feather name="headphones" size={30} color={Colors.primaryRed} />
            <View style={styles.heroIconBubble}>
              <Feather name="more-horizontal" size={12} color={Colors.white} />
            </View>
          </View>

          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Search for answers, browse topics or contact our support team.
          </Text>

          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help topics..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Feather name="search" size={18} color={Colors.primaryRed} />
          </View>
        </View>

        {/* ================= QUICK HELP TOPICS ================= */}
        <Text style={styles.sectionHeading}>Quick Help Topics</Text>
        <View style={styles.topicsGrid}>
          {QUICK_HELP_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.key}
              style={styles.topicCard}
              activeOpacity={0.8}
              onPress={() => handleTopicPress(topic)}
            >
              <View
                style={[
                  styles.topicIconCircle,
                  { backgroundColor: topic.iconBg },
                ]}
              >
                <Feather name={topic.icon} size={22} color={topic.iconColor} />
              </View>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicSubtitle}>{topic.subtitle}</Text>
              <Feather
                name="chevron-right"
                size={15}
                color={Colors.textMuted}
                style={styles.topicChevron}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= NEED MORE HELP ================= */}
        <Text style={styles.sectionHeading}>Need More Help?</Text>
        <View style={styles.channelsCard}>
          {SUPPORT_CHANNELS.map((channel, index) => (
            <View
              key={channel.key}
              style={[
                styles.channelRow,
                index !== SUPPORT_CHANNELS.length - 1 &&
                  styles.channelRowDivider,
              ]}
            >
              <View
                style={[
                  styles.channelIconCircle,
                  { backgroundColor: channel.iconBg || "#FCE4D6" },
                ]}
              >
                <Feather
                  name={channel.icon}
                  size={19}
                  color={Colors.primaryRed}
                />
              </View>

              <View style={styles.channelTextBlock}>
                <View style={styles.channelTitleRow}>
                  <Text style={styles.channelTitle}>{channel.title}</Text>
                  {channel.status && (
                    <View style={styles.statusPill}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusPillText}>
                        {channel.status}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.channelSubtitle}>{channel.subtitle}</Text>
              </View>

              <TouchableOpacity
                style={styles.channelButton}
                activeOpacity={0.8}
                onPress={() => handleChannelPress(channel)}
              >
                <Text style={styles.channelButtonText}>{channel.ctaLabel}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ================= FAQS ================= */}
        <TouchableOpacity
          style={styles.faqRow}
          activeOpacity={0.8}
          onPress={() => handleNavigate("faqs")}
        >
          <View style={styles.faqIconCircle}>
            <Feather name="help-circle" size={22} color="#B8860B" />
          </View>
          <View style={styles.faqTextBlock}>
            <Text style={styles.faqTitle}>FAQs</Text>
            <Text style={styles.faqSubtitle}>
              Find answers to common questions
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* ================= STAY SAFE ONLINE ================= */}
        <View style={styles.safeBanner}>
          <View style={styles.safeIconCircle}>
            <Feather name="shield" size={19} color={Colors.primaryRed} />
          </View>
          <View style={styles.safeTextBlock}>
            <Text style={styles.safeTitle}>Stay Safe Online</Text>
            <Text style={styles.safeSubtitle}>
              We will never ask for your password or payment details. Report
              suspicious profiles.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.safetyTipsButton}
            activeOpacity={0.8}
            onPress={() => handleNavigate("safety-tips")}
          >
            <Text style={styles.safetyTipsButtonText}>Safety Tips</Text>
          </TouchableOpacity>
        </View>
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
                <Feather
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
    fontSize: Fonts.size.xxl,
    fontFamily: Fonts.extraBold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: "#FCE4D6",
    marginTop: 2,
  },

  /* ===== HERO BANNER ===== */
  heroBanner: {
    backgroundColor: "#FDF3E7",
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  heroIconBubble: {
    position: "absolute",
    bottom: -2,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8A93A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FDF3E7",
  },
  heroTitle: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: Fonts.size.md,
    fontFamily: Fonts.regular,
    color: Colors.textPrimary,
  },

  /* ===== SECTION HEADING ===== */
  sectionHeading: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  /* ===== QUICK HELP TOPICS ===== */
  topicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  topicCard: {
    width: "48.5%",
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  topicIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  topicTitle: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  topicSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  topicChevron: {
    alignSelf: "flex-start",
    marginTop: 8,
  },

  /* ===== NEED MORE HELP CARD ===== */
  channelsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  channelRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  channelIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  channelTextBlock: {
    flex: 1,
    marginRight: 10,
  },
  channelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  channelTitle: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: Colors.primaryRed,
    marginRight: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCF3E3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1F7A3D",
    marginRight: 4,
  },
  statusPillText: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
    color: "#1F7A3D",
  },
  channelSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  channelButton: {
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  channelButtonText: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
    color: Colors.primaryRed,
  },

  /* ===== FAQ ROW ===== */
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3E7",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  faqIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  faqTextBlock: {
    flex: 1,
  },
  faqTitle: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
  },
  faqSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },

  /* ===== STAY SAFE ONLINE ===== */
  safeBanner: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "#FBE6E4",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F4C6C0",
  },
  safeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  safeTextBlock: {
    flex: 1,
    minWidth: 160,
  },
  safeTitle: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: Colors.primaryRed,
  },
  safeSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  safetyTipsButton: {
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginLeft: 10,
    marginTop: 8,
  },
  safetyTipsButtonText: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
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
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  tabLabel: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 3,
  },
  tabLabelActive: {
    color: Colors.primaryRed,
    fontFamily: Fonts.bold,
  },
});
