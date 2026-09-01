import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";

const { width } = Dimensions.get("window");

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const COLORS = {
  background: "#FAF7F3",
  white: "#FFFFFF",
  red: "#B70D09",
  darkRed: "#8D1713",
  gold: "#F5A400",
  goldDeep: "#FFB000",
  goldLight: "#FFF2CF",
  text: "#292321",
  gray: "#6B6259",
  mutedGray: "#8A8078",
  border: "#EFE4DA",
  green: "#149852",
  offlineGray: "#C9C0B8",
  badgeRed: "#E21B16",
  cardShadow: "#B8AAA0",
};

// ---- Replace with your real assets ----
const LOGO = require("../../../assets/images/logo.png");

const FILTERS = [
  { key: "all", label: "All Chats", icon: "chatbubble" },
  { key: "unread", label: "Unread", icon: "chatbubble-outline", dot: COLORS.badgeRed },
  { key: "online", label: "Online", icon: "ellipse", dotOnly: true, dot: COLORS.green },
  { key: "favourites", label: "Favourites", icon: "star-outline" },
];

const CHATS = [
  {
    id: "1",
    name: "Priyanka",
    profession: "Software Engineer",
    lastMessage: "Hi! Thanks for showing interest in my profile.",
    time: "10:30 AM",
    unread: 2,
    online: true,
    verified: true,
    avatar: require("../../../assets/images/Match1.png"),
  },
  {
    id: "2",
    name: "Rohit",
    profession: "Civil Engineer",
    lastMessage: "Hello! How are you?",
    time: "9:15 AM",
    unread: 1,
    online: true,
    verified: true,
    avatar: require("../../../assets/images/Match2.png"),
  },
  {
    id: "3",
    name: "Deepika",
    profession: "Teacher",
    lastMessage: "That's great 😊",
    time: "Yesterday",
    unread: 0,
    online: false,
    verified: true,
    avatar: require("../../../assets/images/Match3.png"),
  },
  {
    id: "4",
    name: "Karthik",
    profession: "Mechanical Engineer",
    lastMessage: "Can we connect over a call?",
    time: "Yesterday",
    unread: 1,
    online: false,
    verified: true,
    avatar: require("../../../assets/images/Match4.png"),
  },
  {
    id: "5",
    name: "Ananya",
    profession: "Doctor",
    lastMessage: "Thank you for your message.",
    time: "Tue",
    unread: 0,
    online: false,
    verified: true,
    avatar: require("../../../assets/images/Match1.png"),
  },
  {
    id: "6",
    name: "Sandeep",
    profession: "Business Analyst",
    lastMessage: "Profile seems interesting.",
    time: "Mon",
    unread: 0,
    online: false,
    verified: true,
    avatar: require("../../../assets/images/Match1.png"),
  },
];

export default function ChatsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const handleBack = () => {
    router.back();
  };

  const handleOpenChat = (id) => {
    router.push(`/chat/${id}`);
  };

  const handleUpgrade = () => {
    router.push("/subscriptionplans");
  };

  const filteredChats = CHATS.filter((chat) => {
    const matchesSearch = chat.name
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "unread") return chat.unread > 0;
    if (activeFilter === "online") return chat.online;
    if (activeFilter === "favourites") return false; // wire up to real favourites data

    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color={COLORS.red} />
        </TouchableOpacity>

        <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.screenTitle}>Chats</Text>
        <Text style={styles.screenSubtitle}>
          Connect, Chat & Find your perfect match
        </Text>
      </View>

      {/* ================= SEARCH BAR ================= */}

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.mutedGray} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          placeholderTextColor={COLORS.mutedGray}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity style={styles.filterIconButton} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={20} color={COLORS.darkRed} />
        </TouchableOpacity>
      </View>

      {/* ================= FILTER TABS ================= */}

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = activeFilter === item.key;

          return (
            <TouchableOpacity
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(item.key)}
              activeOpacity={0.8}
            >
              {item.dot ? (
                <View
                  style={[
                    styles.filterDot,
                    { backgroundColor: item.dot },
                  ]}
                />
              ) : (
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={active ? "#FFFFFF" : COLORS.text}
                />
              )}

              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ================= CHAT LIST ================= */}

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ChatRow chat={item} onPress={() => handleOpenChat(item.id)} />
        )}
        ListFooterComponent={
          <LinearGradient
            colors={[COLORS.darkRed, COLORS.red]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.premiumCard}
          >
            <View style={styles.crownCircle}>
              <FontAwesome5 name="crown" size={22} color={COLORS.goldDeep} />
            </View>

            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>
                Go Premium, Get Better Connections
              </Text>
              <Text style={styles.premiumSubtitle}>
                Chat unlimited & see who's interested in you.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.premiumUpgradeButton}
              activeOpacity={0.85}
              onPress={handleUpgrade}
            >
              <Text style={styles.premiumUpgradeText}>Upgrade Now</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.darkRed} />
            </TouchableOpacity>
          </LinearGradient>
        }
      />
    </SafeAreaView>
  );
}

/* ================================================= */
/* ================= CHAT ROW ======================= */
/* ================================================= */

function ChatRow({ chat, onPress }) {
  return (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrapper}>
        <Image source={chat.avatar} style={styles.avatar} resizeMode="cover" />

        <View
          style={[
            styles.statusDot,
            { backgroundColor: chat.online ? COLORS.green : COLORS.offlineGray },
          ]}
        />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
          <View style={styles.chatNameRow}>
            <Text style={styles.chatName} numberOfLines={1}>
              {chat.name}
            </Text>

            {chat.verified && (
              <Ionicons name="checkmark-circle" size={15} color={COLORS.green} />
            )}
          </View>

          <Text style={styles.chatTime}>{chat.time}</Text>
        </View>

        <Text style={styles.chatProfession} numberOfLines={1}>
          {chat.profession}
        </Text>

        <View style={styles.chatBottomRow}>
          <Text style={styles.chatLastMessage} numberOfLines={1}>
            {chat.lastMessage}
          </Text>

          {chat.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  titleBlock: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },

  screenTitle: {
    fontSize: width <= 430 ? 30 : 34,
    fontWeight: "800",
    color: COLORS.darkRed,
  },

  screenSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },

  /* ================= SEARCH BAR ================= */

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    height: 54,
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  filterIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ================= FILTER TABS ================= */

  filterRow: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: SPACING.md,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
  },

  filterChipActive: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },

  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  filterChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  filterChipTextActive: {
    color: "#FFFFFF",
  },

  /* ================= CHAT LIST ================= */

  chatList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  avatarWrapper: {
    position: "relative",
    marginRight: SPACING.md,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  chatContent: {
    flex: 1,
    minWidth: 0,
  },

  chatTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chatNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },

  chatName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.darkRed,
    flexShrink: 1,
  },

  chatTime: {
    fontSize: 11.5,
    color: COLORS.mutedGray,
    marginLeft: SPACING.sm,
  },

  chatProfession: {
    fontSize: 12.5,
    color: COLORS.gray,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 4,
  },

  chatBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chatLastMessage: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.badgeRed,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* ================= PREMIUM BANNER ================= */

  premiumCard: {
    minHeight: 90,
    borderRadius: 18,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    shadowColor: COLORS.darkRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  crownCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },

  premiumContent: {
    flex: 1,
    paddingRight: SPACING.xs,
  },

  premiumTitle: {
    color: COLORS.goldLight,
    fontSize: width <= 430 ? 13.5 : 15,
    fontWeight: "800",
    marginBottom: 3,
  },

  premiumSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: width <= 430 ? 10.5 : 12,
    lineHeight: 15,
  },

  premiumUpgradeButton: {
    height: 40,
    backgroundColor: COLORS.goldDeep,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    marginLeft: SPACING.sm,
  },

  premiumUpgradeText: {
    color: COLORS.darkRed,
    fontWeight: "800",
    fontSize: width <= 430 ? 11.5 : 13,
  },
});