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

import Feather from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";

import { Fonts } from "../constants/Fonts";
import { getChatList, getToken } from "../utils/Functions";

const { width } = Dimensions.get("window");
const BASE_WIDTH = 390;
const scale = (size) => {
  const factor = width / BASE_WIDTH;
  return Math.round(size * Math.min(factor, 1.12));
};

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
  { key: "all", label: "All Chats", icon: "grid" },
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
  { key: "favourites", label: "Favourites", icon: "star" },
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

export default function ChatsScreen({ navigation, route }) {

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

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

  const handleBack = useCallback(() => {
    if (navigation?.canGoBack?.()) {
      navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleBack();
          return true;
        },
      );

      return () => subscription.remove();
    }, [handleBack]),
  );

  const handleOpenChatting = useCallback(
    (chat) => {
      // Register this screen in your Stack as "ChatConversion".
      navigation.navigate("ChatConversion", {
        id: chat.threadId,
        memberId: chat.memberId,
        threadId: chat.threadId,
        name: chat.name,
        profession: chat.profession,
        online: chat.online ? "true" : "false",
        avatarUrl: chat.avatarUrl || "",
      });
    },
    [navigation],
  );

  const handleUpgrade = useCallback(() => {
    navigation.navigate("SubscriptionPlans");
  }, [navigation]);

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
          <Feather name="arrow-left" size={23} color={COLORS.red} />
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
        <Feather name="search" size={20} color={COLORS.mutedGray} />

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          placeholderTextColor={COLORS.mutedGray}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
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
                <Feather
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
              <Feather
                name="check-circle"
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
        <Feather name="message-square" size={30} color={COLORS.red} />
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
          <Feather name="refresh-cw" size={15} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F4F1",
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0E8E1",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F2",
  },

  headerTitle: {
    fontSize: scale(16),
    fontFamily: Fonts.display.bold,
    color: COLORS.darkRed,
    letterSpacing: 0.2,
  },

  headerRightSpace: {
    width: 40,
    height: 40,
  },

  titleBlock: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },

  screenTitle: {
    fontSize: width <= 430 ? 30 : 34,
    fontFamily: Fonts.display.bold,
    color: COLORS.text,
    letterSpacing: -0.7,
  },

  screenSubtitle: {
    fontSize: scale(13),
    fontFamily: Fonts.body.medium,
    color: COLORS.gray,
    marginTop: 5,
    lineHeight: 19,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 12,
    paddingHorizontal: 15,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE3DB",
    shadowColor: "#8D7164",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: scale(14),
    fontFamily: Fonts.body.regular,
    color: COLORS.text,
    paddingVertical: 0,
  },

  filterRow: {
    paddingHorizontal: 18,
    paddingVertical: 5,
    gap: 9,
    alignItems: "center",
  },

  filterChip: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7DDD5",
    backgroundColor: "#FFFFFF",
    gap: 7,
  },

  filterChipActive: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 3,
  },

  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  filterChipText: {
    fontSize: scale(12.5),
    fontFamily: Fonts.body.semiBold,
    color: COLORS.text,
  },

  filterChipTextActive: {
    color: "#FFFFFF",
  },

  filtersList: {
    height: 55,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: "#F7F4F1",
  },

  chatFlatList: {
    flex: 1,
    alignSelf: "stretch",
  },

  chatList: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 26,
  },

  chatListEmpty: {
    flexGrow: 1,
  },

  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 84,
    marginBottom: 10,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE5DE",
    shadowColor: "#80685D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F2ECE6",
    borderWidth: 2,
    borderColor: "#FFF7F3",
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarFallbackText: {
    color: "#FFFFFF",
    fontSize: scale(17),
    fontFamily: Fonts.display.bold,
  },

  statusDot: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },

  chatContent: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 1,
  },

  chatTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  chatNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 5,
  },

  chatName: {
    flexShrink: 1,
    fontSize: scale(15.5),
    fontFamily: Fonts.display.bold,
    color: COLORS.text,
    letterSpacing: -0.1,
  },

  chatTime: {
    flexShrink: 0,
    fontSize: scale(10.5),
    fontFamily: Fonts.body.medium,
    color: COLORS.mutedGray,
    marginLeft: 8,
  },

  chatProfession: {
    fontSize: scale(11.5),
    fontFamily: Fonts.body.semiBold,
    color: COLORS.red,
    marginTop: 2,
    marginBottom: 5,
  },

  chatBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  chatLastMessage: {
    flex: 1,
    marginRight: 8,
    fontSize: scale(12.5),
    fontFamily: Fonts.body.regular,
    color: COLORS.mutedGray,
  },

  chatLastMessageUnread: {
    color: COLORS.text,
    fontFamily: Fonts.body.semiBold,
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: COLORS.badgeRed,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.badgeRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },

  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: scale(10.5),
    fontFamily: Fonts.body.bold,
  },

  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F4F1",
  },

  loadingText: {
    marginTop: 12,
    fontSize: scale(12),
    fontFamily: Fonts.body.medium,
    color: COLORS.mutedGray,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F7F4F1",
  },

  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0E6",
    borderWidth: 1,
    borderColor: "#F5D7C7",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: scale(19),
    fontFamily: Fonts.display.bold,
    color: COLORS.darkRed,
    textAlign: "center",
    marginBottom: 7,
  },

  emptySubtitle: {
    maxWidth: 300,
    fontSize: scale(12.5),
    fontFamily: Fonts.body.regular,
    lineHeight: 19,
    color: COLORS.mutedGray,
    textAlign: "center",
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: 21,
    backgroundColor: COLORS.red,
    marginTop: 18,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 3,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: scale(12),
    fontFamily: Fonts.body.bold,
  },
});
