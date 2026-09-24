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

import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";

import Fonts from "../../constants/Fonts";
import { getChatList, getToken } from "../../utils/Functions";

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

const AVATAR_PALETTE = [
  "#B70D09",
  "#8D1713",
  "#C97B1D",
  "#2E7D5B",
  "#3A6EA5",
  "#7C4A9E",
  "#B25B8F",
];

function getAvatarColor(name) {
  if (!name) return COLORS.mutedGray;

  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/);

  const first = parts[0]?.[0] ?? "";

  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (first + second).toUpperCase();
}

const FILTERS = [
  { key: "all", label: "All Chats", icon: "chatbubble" },
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
  { key: "favourites", label: "Favourites", icon: "star-outline" },
];

// ---- API response -> chat row model ----
// Matches the real /api/member/chat-list response shape:
// { id, user_id, active, blocked_by_user, unseen_message_count,
//   last_message, last_message_time, member_name, member_package,
//   member_photo }
function mapChat(item) {
  return {
    threadId: String(item.id ?? ""), // conversation/chat id, e.g. 1
    memberId: String(item.user_id ?? item.id ?? ""), // other member's user id, e.g. 32
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

export default function ChatsScreen() {
  const navigation = useNavigation();

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  /* ============================================================
     HARDWARE BACK BUTTON
     Same useFocusEffect + BackHandler pattern used on the other
     screens: active only while this screen is focused, cleaned
     up on blur/unmount.
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

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

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOpenChatting = (chat) => {
    navigation.navigate("ChatConversion", {
      id: chat.threadId, // conversation/chat id — matches the API's `id` field (e.g. 1)
      memberId: chat.memberId, // the other member's user id — matches the API's `user_id` field (e.g. 32)
      threadId: chat.threadId,
      name: chat.name,
      profession: chat.profession,
      online: chat.online ? "true" : "false",
    });
  };

  const handleUpgrade = () => {
    navigation.navigate("SubscriptionPlans");
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      !normalizedSearch || chat.name.toLowerCase().includes(normalizedSearch);

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
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.red} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chats</Text>

        <View style={styles.headerRightSpace} />
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
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
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
                  style={[styles.filterDot, { backgroundColor: item.dot }]}
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
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
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
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
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

/* ================================================= */
/* ================= AVATAR ========================= */
/* ================================================= */

function Avatar({ chat }) {
  const [failed, setFailed] = useState(false);

  if (chat.avatarUrl && !failed) {
    return (
      <Image
        source={{ uri: chat.avatarUrl }}
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
        { backgroundColor: getAvatarColor(chat.name) },
      ]}
    >
      <Text style={styles.avatarFallbackText}>{getInitials(chat.name)}</Text>
    </View>
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

      <View style={styles.chatContent}>
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

        {!!chat.profession && (
          <Text style={styles.chatProfession} numberOfLines={1}>
            {chat.profession}
          </Text>
        )}

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

/* ================================================= */
/* ================= EMPTY STATE ===================== */
/* ================================================= */

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

const styles = StyleSheet.create({
  /* =========================================================
     MAIN SCREEN
  ========================================================= */

  safeArea: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: COLORS.background,
  },

  /* =========================================================
     HEADER
  ========================================================= */

  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: COLORS.text,
  },

  headerRightSpace: {
    width: 34,
    height: 34,
  },

  /* =========================================================
     PAGE TITLE
  ========================================================= */

  titleBlock: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },

  screenTitle: {
    fontSize: width <= 430 ? 30 : 34,
    fontFamily: Fonts.extraBold,
    color: COLORS.darkRed,
    letterSpacing: 0.2,
  },

  screenSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },

  /* =========================================================
     SEARCH BAR
  ========================================================= */

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
    fontFamily: Fonts.regular,
    color: COLORS.text,
    paddingVertical: 0,
  },

  filterIconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
  },

  /* =========================================================
     FILTER TABS
  ========================================================= */

  filtersList: {
    height: 56,
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: SPACING.xs,
  },

  filterRow: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    alignItems: "center",
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
    fontFamily: Fonts.bold,
    color: COLORS.text,
  },

  filterChipTextActive: {
    color: "#FFFFFF",
    fontFamily: Fonts.bold,
  },

  /* =========================================================
     CHAT LIST
  ========================================================= */

  chatFlatList: {
    flex: 1,
    alignSelf: "stretch",
  },

  chatList: {
    paddingHorizontal: SPACING.md,
    paddingTop: 0,
    paddingBottom: SPACING.xl,
  },

  chatListEmpty: {
    flexGrow: 1,
  },

  /* =========================================================
     CHAT ROW
  ========================================================= */

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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    backgroundColor: "#F2ECE6",
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarFallbackText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: Fonts.extraBold,
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

  /* =========================================================
     CHAT CONTENT
  ========================================================= */

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
    fontFamily: Fonts.extraBold,
    color: COLORS.darkRed,
    flexShrink: 1,
  },

  chatTime: {
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: COLORS.mutedGray,
    marginLeft: SPACING.sm,
  },

  chatProfession: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: COLORS.gray,
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
    fontFamily: Fonts.regular,
    color: COLORS.mutedGray,
    flex: 1,
    marginRight: SPACING.sm,
  },

  chatLastMessageUnread: {
    color: COLORS.text,
    fontFamily: Fonts.medium,
  },

  /* =========================================================
     UNREAD BADGE
  ========================================================= */

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
    fontFamily: Fonts.bold,
  },

  /* =========================================================
     LOADING
  ========================================================= */

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: COLORS.mutedGray,
  },

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.extraBold,
    color: COLORS.darkRed,
    textAlign: "center",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.regular,
    color: COLORS.mutedGray,
    textAlign: "center",
    maxWidth: 290,
  },

  /* =========================================================
     RETRY BUTTON
  ========================================================= */

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.red,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: Fonts.bold,
  },

  /* =========================================================
     PREMIUM BANNER
  ========================================================= */

  premiumCard: {
    minHeight: 90,
    borderRadius: 18,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,

    shadowColor: COLORS.darkRed,
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
    fontFamily: Fonts.extraBold,
    marginBottom: 3,
  },

  premiumSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: width <= 430 ? 10.5 : 12,
    fontFamily: Fonts.regular,
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
    fontFamily: Fonts.extraBold,
    fontSize: width <= 430 ? 11.5 : 13,
  },
});
