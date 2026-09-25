import { useCallback, useState } from "react";
import {
  BackHandler,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Feather from "react-native-vector-icons/Feather";

import { Colors } from "../constants/colors";
import Fonts from "../constants/Fonts";

import { useFocusEffect } from "@react-navigation/native";

const FILTERS = [
  { key: "all", label: "All", icon: "notifications" },
  { key: "matches", label: "Matches", icon: "heart-outline" },
  { key: "messages", label: "Messages", icon: "chatbubble-ellipses-outline" },
  { key: "system", label: "System", icon: "megaphone-outline" },
  { key: "payments", label: "Payments", icon: "card-outline" },
];

const NOTIFICATION_SECTIONS = [
  {
    title: "Today",
    items: [
      {
        id: "1",
        icon: "heart",
        iconColor: Colors.primaryRed,
        iconBg: "#FCE4D6",
        title: "New Interest Received",
        description: "Anusha Mudhiraj, 27, has shown interest in your profile.",
        time: "10:30 AM",
        unread: true,
      },
      {
        id: "2",
        icon: "eye-outline",
        iconColor: "#B8860B",
        iconBg: "#FCEFC9",
        title: "Profile Viewed",
        description: "5 members viewed your profile in the last 24 hours.",
        time: "09:15 AM",
        unread: true,
      },
      {
        id: "3",
        icon: "chatbubble-ellipses",
        iconColor: Colors.primaryRed,
        iconBg: "#FCE4D6",
        title: "New Message",
        description: "You have a new message from Sireesha Mudhiraj.",
        time: "08:45 AM",
        unread: true,
      },
      {
        id: "4",
        icon: "star",
        iconColor: "#1F7A3D",
        iconBg: "#DCF3E3",
        title: "Profile Shortlisted",
        description: "Rohini Mudhiraj has shortlisted your profile.",
        time: "07:20 AM",
        unread: true,
      },
    ],
  },
  {
    title: "Yesterday",
    items: [
      {
        id: "5",
        icon: "diamond",
        iconColor: "#6B4FD6",
        iconBg: "#E4DFF9",
        title: "Welcome to Premium",
        description: "Thank you for upgrading to Premium Membership.",
        time: "Yesterday, 09:30 PM",
        unread: false,
      },
      {
        id: "6",
        icon: "card",
        iconColor: "#B8860B",
        iconBg: "#FCEFC9",
        title: "Payment Successful",
        description:
          "Your payment of ₹2,999 for Premium Membership was successful.",
        time: "Yesterday, 09:28 PM",
        unread: false,
      },
      {
        id: "7",
        icon: "notifications",
        iconColor: "#2E6FE0",
        iconBg: "#DDE8FC",
        title: "Subscription Reminder",
        description: "Your Premium Membership will expire in 5 days.",
        time: "Yesterday, 06:10 PM",
        unread: false,
      },
      {
        id: "8",
        icon: "gift",
        iconColor: Colors.primaryRed,
        iconBg: "#FCE4D6",
        title: "Exclusive Offer",
        description:
          "Get 20% off on 12 Months Premium Plan. Limited time offer!",
        time: "Yesterday, 04:45 PM",
        unread: false,
      },
    ],
  },
  {
    title: "Earlier",
    items: [
      {
        id: "9",
        icon: "megaphone",
        iconColor: "#1F7A3D",
        iconBg: "#DCF3E3",
        title: "Community Update",
        description: "New advanced search filters are now available. Try now!",
        time: "18 May 2024, 11:30 AM",
        unread: false,
      },
    ],
  },
];

export default function NotificationsScreen({ navigation, route }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleMarkAllRead = () => {
    // TODO: mark all notifications as read
    console.log("Mark all as read");
  };

  const onBackPress = () => {
    navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => {
        subscription.remove();
      };
    }, [route]));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* ====== HEADER ====== */}
      <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Feather name="menu" size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated with your matches and activities
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
            style={{ marginRight: 16 }}
          >
            <Feather name="bell" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
          >
            <Feather name="settings" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ====== FILTER CHIPS ====== */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Feather
                  name={filter.icon}
                  size={15}
                  color={isActive ? Colors.white : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {" "}
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {NOTIFICATION_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.title === "Today" && (
                <TouchableOpacity
                  style={styles.markReadRow}
                  activeOpacity={0.7}
                  onPress={handleMarkAllRead}
                >
                  <Text style={styles.markReadText}>Mark all as read</Text>
                  <Feather
                    name="check"
                    size={14}
                    color={Colors.primaryRed}
                    style={{ marginLeft: 3 }}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  isLast={index === section.items.length - 1}
                  onPress={() => onBackPress(item)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ====== SUBCOMPONENTS ======
function NotificationRow({ item, isLast, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.notificationRow, !isLast && styles.notificationRowDivider]}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View
        style={[
          styles.notificationIconCircle,
          { backgroundColor: item.iconBg },
        ]}
      >
        <Feather name={item.icon} size={18} color={item.iconColor} />
      </View>

      <View style={styles.notificationTextBlock}>
        <View style={styles.notificationTopRow}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationDescription}>{item.description}</Text>
      </View>

      {item.unread && <View style={styles.unreadDot} />}
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
    paddingTop: 16,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* ===== FILTER CHIPS ===== */
  filterBar: {
    backgroundColor: Colors.background,
    paddingTop: 14,
    paddingBottom: 4,
  },
  filterScrollContent: {
    paddingHorizontal: 18,
    gap: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryRed,
    borderColor: Colors.primaryRed,
  },
  filterChipText: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },

  /* ===== SECTIONS ===== */
  section: {
    marginTop: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: Colors.primaryRed,
  },
  markReadRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  markReadText: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
    color: Colors.primaryRed,
  },
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },

  /* ===== NOTIFICATION ROW ===== */
  notificationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
  },
  notificationRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationTextBlock: {
    flex: 1,
  },
  notificationTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  notificationTitle: {
    flex: 1,
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  notificationDescription: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryRed,
    marginLeft: 8,
    marginTop: 4,
  },
});
