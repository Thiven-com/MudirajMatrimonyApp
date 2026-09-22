import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";

import LinearGradient from "react-native-linear-gradient";

import { useNavigation } from "@react-navigation/native";

import { getChatList, getToken } from "../../utils/Functions";

/* =========================================================
   DIMENSIONS
========================================================= */

const { width } = Dimensions.get("window");

/* =========================================================
   SPACING
========================================================= */

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

/* =========================================================
   COLORS
========================================================= */

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

/* =========================================================
   AVATAR COLORS
========================================================= */

const AVATAR_PALETTE = [
  "#B70D09",
  "#8D1713",
  "#C97B1D",
  "#2E7D5B",
  "#3A6EA5",
  "#7C4A9E",
  "#B25B8F",
];

/* =========================================================
   GET AVATAR COLOR
========================================================= */

function getAvatarColor(name) {
  if (!name) {
    return COLORS.mutedGray;
  }

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {
  if (!name) {
    return "?";
  }

  const parts = name.trim().split(/\s+/);

  const first = parts[0]?.[0] ?? "";

  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (first + second).toUpperCase();
}

/* =========================================================
   FILTERS
========================================================= */

const FILTERS = [
  {
    key: "all",
    label: "All Chats",
    icon: "chatbubble",
  },

  {
    key: "unread",
    label: "Unread",
    icon: "chatbubble-outline",
    dot: COLORS.badgeRed,
  },

  {
    key: "online",
    label: "Online",
    icon: "ellipse",
    dotOnly: true,
    dot: COLORS.green,
  },

  {
    key: "favourites",
    label: "Favourites",
    icon: "star-outline",
  },
];

/* =========================================================
   API RESPONSE -> CHAT MODEL
========================================================= */

function mapChat(item) {
  return {
    threadId: String(item.id ?? ""),

    memberId: String(item.user_id ?? item.id ?? ""),

    name: item.member_name ?? "",

    profession: item.profession ?? "",

    lastMessage: item.last_message ?? "",

    time: item.last_message_time ?? "",

    unread: Number(item.unseen_message_count) || 0,

    online: item.active === 1,

    verified: true,

    avatarUrl: item.member_photo || null,
  };
}

/* =========================================================
   CHATS SCREEN
========================================================= */

export default function ChatsScreen() {
  const navigation = useNavigation();

  const [activeFilter, setActiveFilter] = useState("all");

  const [search, setSearch] = useState("");

  const [chats, setChats] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);

  /* =======================================================
     LOAD CHATS
  ======================================================= */

  const loadChats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage(null);

    try {
      const token = await getToken();

      const result = await getChatList(token);

      const isSuccess =
        result?.success === 1 ||
        result?.success === true ||
        result?.result === true;

      if (isSuccess) {
        const rawChats =
          result?.data?.chats ||
          result?.chats ||
          result?.data ||
          (Array.isArray(result) ? result : []);

        const mappedChats = Array.isArray(rawChats)
          ? rawChats.map(mapChat)
          : [];

        setChats(mappedChats);
      } else {
        setErrorMessage(result?.message || "Unable to load chats.");
      }
    } catch (error) {
      console.log("loadChats Error:", error);

      setErrorMessage("Something went wrong loading your chats.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  /* =======================================================
     ANDROID HARDWARE BACK
     Mirrors the same pattern used on OtpScreen: intercept the
     hardware back button and route it through the same
     handleBack() the header's back arrow uses, so both paths
     stay in sync.
  ======================================================= */

  useEffect(() => {
    const handleHardwareBack = () => {
      handleBack();

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBack,
    );

    return () => {
      subscription.remove();
    };
  }, [handleBack]);

  /* =======================================================
     OPEN CHAT
  ======================================================= */

  const handleOpenChatting = (chat) => {
    navigation.navigate("ChatConversion", {
      id: chat.memberId,

      threadId: chat.threadId,

      name: chat.name,

      profession: chat.profession,

      online: chat.online ? "true" : "false",
    });
  };

  /* =======================================================
     UPGRADE
  ======================================================= */

  const handleUpgrade = () => {
    navigation.navigate("SubscriptionPlans");
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const normalizedSearch = search.trim().toLowerCase();

  /* =======================================================
     FILTER CHAT DATA
  ======================================================= */

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      !normalizedSearch || chat.name.toLowerCase().includes(normalizedSearch);

    if (!matchesSearch) {
      return false;
    }

    if (activeFilter === "unread") {
      return chat.unread > 0;
    }

    if (activeFilter === "online") {
      return chat.online;
    }

    if (activeFilter === "favourites") {
      return false;
    }

    return true;
  });

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{
            top: 8,
            bottom: 8,
            left: 8,
            right: 8,
          }}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.red} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chats</Text>

        <View style={styles.headerRightSpace} />
      </View>

      {/* ================= TITLE ================= */}

      <View style={styles.titleBlock}>
        <Text style={styles.screenTitle}>Chats</Text>

        <Text style={styles.screenSubtitle}>
          Connect, Chat & Find your perfect match
        </Text>
      </View>

      {/* ================= SEARCH ================= */}

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.mutedGray} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          placeholderTextColor={COLORS.mutedGray}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
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
        style={styles.filtersList}
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
                    {
                      backgroundColor: item.dot,
                    },
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

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={COLORS.red} />

          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : (
        <FlatList
          style={styles.chatFlatList}
          data={filteredChats}
          keyExtractor={(item) => item.threadId}
          contentContainerStyle={[
            styles.chatList,
            filteredChats.length === 0 && styles.chatListEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadChats(true)}
              colors={[COLORS.red]}
              tintColor={COLORS.red}
            />
          }
          ListEmptyComponent={
            <EmptyState
              errorMessage={errorMessage}
              onRetry={() => loadChats()}
            />
          }
          renderItem={({ item }) => (
            <ChatRow chat={item} onPress={() => handleOpenChatting(item)} />
          )}
          ListFooterComponent={
            filteredChats.length > 0 ? (
              <LinearGradient
                colors={[COLORS.darkRed, COLORS.red]}
                start={{
                  x: 0,
                  y: 0.5,
                }}
                end={{
                  x: 1,
                  y: 0.5,
                }}
                style={styles.premiumCard}
              >
                <View style={styles.crownCircle}>
                  <FontAwesome5
                    name="crown"
                    size={22}
                    color={COLORS.goldDeep}
                  />
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

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.darkRed}
                  />
                </TouchableOpacity>
              </LinearGradient>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({ chat }) {
  const [failed, setFailed] = useState(false);

  if (chat.avatarUrl && !failed) {
    return (
      <Image
        source={{
          uri: chat.avatarUrl,
        }}
        style={styles.avatar}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.avatarFallback,
        {
          backgroundColor: getAvatarColor(chat.name),
        },
      ]}
    >
      <Text style={styles.avatarFallbackText}>{getInitials(chat.name)}</Text>
    </View>
  );
}

/* =========================================================
   CHAT ROW
========================================================= */

function ChatRow({ chat, onPress }) {
  return (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* AVATAR */}

      <View style={styles.avatarWrapper}>
        <Avatar chat={chat} />

        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: chat.online ? COLORS.green : COLORS.offlineGray,
            },
          ]}
        />
      </View>

      {/* CONTENT */}

      <View style={styles.chatContent}>
        {/* TOP ROW */}

        <View style={styles.chatTopRow}>
          <View style={styles.chatNameRow}>
            <Text style={styles.chatName} numberOfLines={1}>
              {chat.name}
            </Text>

            {chat.verified && (
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={COLORS.green}
              />
            )}
          </View>

          <Text style={styles.chatTime}>{chat.time}</Text>
        </View>

        {/* PROFESSION */}

        {!!chat.profession && (
          <Text style={styles.chatProfession} numberOfLines={1}>
            {chat.profession}
          </Text>
        )}

        {/* BOTTOM ROW */}

        <View style={styles.chatBottomRow}>
          <Text
            style={[
              styles.chatLastMessage,
              chat.unread > 0 && styles.chatLastMessageUnread,
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage || "No messages yet"}
          </Text>

          {chat.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {chat.unread > 99 ? "99+" : chat.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ errorMessage, onRetry }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="chatbubbles-outline" size={30} color={COLORS.red} />
      </View>

      <Text style={styles.emptyTitle}>
        {errorMessage ? "Unable to load chats" : "No chats yet"}
      </Text>

      <Text style={styles.emptySubtitle}>
        {errorMessage ||
          "Start connecting with your matches and your conversations will appear here."}
      </Text>

      {errorMessage && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={15} color="#FFFFFF" />

          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7F2",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.darkRed,
  },

  headerRightSpace: {
    width: 40,
    height: 40,
  },

  titleBlock: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 22,
    paddingBottom: 15,
  },

  screenTitle: {
    fontSize: width <= 430 ? 30 : 34,
    fontWeight: "900",
    color: COLORS.darkRed,
    letterSpacing: -0.5,
  },

  screenSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 5,
    lineHeight: 19,
  },

  searchBar: {
    height: 54,
    marginHorizontal: SPACING.lg,
    marginBottom: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 0,
  },

  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldLight,
  },

  filtersList: {
    height: 55,
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 7,
  },

  filterRow: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
    alignItems: "center",
  },

  filterChip: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterChipActive: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },

  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  filterChipText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: COLORS.text,
  },

  filterChipTextActive: {
    color: COLORS.white,
  },

  chatFlatList: {
    flex: 1,
  },

  chatList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 3,
    paddingBottom: 26,
  },

  chatListEmpty: {
    flexGrow: 1,
  },

  chatRow: {
    minHeight: 82,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 2,
  },

  avatarWrapper: {
    position: "relative",
    marginRight: 13,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#F3ECE5",
    borderWidth: 2,
    borderColor: "#FFF5EC",
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarFallbackText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },

  statusDot: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: COLORS.white,
  },

  chatContent: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 2,
  },

  chatTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chatNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minWidth: 0,
  },

  chatName: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "850",
    color: COLORS.darkRed,
  },

  chatTime: {
    marginLeft: 8,
    fontSize: 10.5,
    color: COLORS.mutedGray,
  },

  chatProfession: {
    marginTop: 3,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gray,
  },

  chatBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chatLastMessage: {
    flex: 1,
    marginRight: 8,
    fontSize: 12.5,
    color: COLORS.mutedGray,
  },

  chatLastMessageUnread: {
    color: COLORS.text,
    fontWeight: "700",
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.badgeRed,
  },

  unreadBadgeText: {
    color: COLORS.white,
    fontSize: 10.5,
    fontWeight: "800",
  },

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 11,
    fontSize: 13,
    color: COLORS.mutedGray,
  },

  emptyState: {
    flex: 1,
    minHeight: 330,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldLight,
    borderWidth: 1,
    borderColor: "#F7DFA8",
    marginBottom: 16,
  },

  emptyTitle: {
    marginBottom: 7,
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.darkRed,
    textAlign: "center",
  },

  emptySubtitle: {
    maxWidth: 300,
    fontSize: 12.5,
    lineHeight: 19,
    color: COLORS.mutedGray,
    textAlign: "center",
  },

  retryButton: {
    height: 42,
    marginTop: 17,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: COLORS.red,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: "800",
  },

  premiumCard: {
    minHeight: 96,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: COLORS.darkRed,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  crownCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  premiumContent: {
    flex: 1,
    paddingRight: 5,
  },

  premiumTitle: {
    marginBottom: 4,
    color: COLORS.goldLight,
    fontSize: width <= 430 ? 13 : 14.5,
    fontWeight: "900",
  },

  premiumSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: width <= 430 ? 10.5 : 11.5,
    lineHeight: 15,
  },

  premiumUpgradeButton: {
    height: 40,
    paddingHorizontal: 12,
    marginLeft: 7,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldDeep,
    gap: 3,
  },

  premiumUpgradeText: {
    color: COLORS.darkRed,
    fontSize: width <= 430 ? 10.5 : 12,
    fontWeight: "900",
  },
});
