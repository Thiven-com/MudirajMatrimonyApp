import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getChatView,
  getOldMessages,
  getToken,
  sendChatReply,
} from "../utils/Functions"; // adjust path to your actual file

const { width } = Dimensions.get("window");

const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

// Flip this to false once the sender_name/receiver_name mapping has been
// confirmed against several real conversations and you're ready to ship.
const DEBUG_SHOW_RAW_NAMES = true;

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
  bubbleSent: "#B70D09",
  bubbleReceived: "#FFFFFF",
  debugBanner: "#FFE9A8",
};

const FALLBACK_AVATAR = require("../../assets/images/Match1.png");

/**
 * Maps the "partner" (other member of the chat) using the ACTUAL shape
 * returned by getChatView:
 *   {
 *     receiver_name, receiver_photo,   <- despite the name, this is the
 *                                          LOGGED-IN user in this endpoint
 *     sender_name, auth_user_photo,    <- despite the name, this is the
 *                                          OTHER member of the chat
 *     messages: [...]
 *   }
 *
 * Confirmed by comparing against the chat list, which correctly showed
 * "harijana sony" as the other participant: the chat-view response had
 * that name under `sender_name`, not `receiver_name`. So for the header
 * we want `sender_name` / `auth_user_photo`, not `receiver_name` /
 * `receiver_photo` as the field names would suggest.
 *
 * If the backend ever fixes/renames these fields, this is the only place
 * that needs to change.
 */
function mapChatPartner(payload, fallbackId) {
  if (!payload) return null;
  return {
    id: String(fallbackId ?? ""),
    name: payload.sender_name ?? "",
    profession: "",
    // The API doesn't return an online/active flag in this response,
    // default to false rather than guessing.
    online: false,
    verified: true,
    avatarUrl: payload.auth_user_photo ?? null,
  };
}

/**
 * Maps a single message using the ACTUAL fields returned:
 *   { id, chat_thread_id, sender_user_id, message, attachment, seen }
 *
 * There's no `from_me` / `is_sender` flag and no timestamp field at all.
 * Since this is always a 1-on-1 thread, we can derive direction by
 * comparing sender_user_id against the OTHER member's id (receiverId,
 * i.e. the routeMemberId / user_id passed in from the chat list):
 *   sender_user_id === receiverId  -> message came from them
 *   otherwise                      -> message is from the logged-in user
 *
 * Note: this is a different (and correctly-named) `sender_user_id` field
 * on each message object — it is NOT related to the confusing
 * `sender_name` / `receiver_name` naming on the chat-view payload above,
 * so it does not need the same swap.
 */
function mapMessage(item, receiverId) {
  const senderId = item.sender_user_id;
  const fromMe =
    receiverId != null && senderId != null
      ? Number(senderId) !== Number(receiverId)
      : false;

  return {
    id: String(item.id ?? item.message_id ?? `m${Math.random()}`),
    fromMe,
    text: item.message ?? item.text ?? item.body ?? "",
    // No created_at field is returned by this endpoint — render blank
    // rather than fabricating a time. Swap this for a real field name
    // if/when the backend starts returning one (e.g. created_at_formatted).
    time: item.time ?? item.created_at_formatted ?? item.created_at ?? "",
    attachment: item.attachment ?? null,
    // seen: 1 means the OTHER person has read a message we sent.
    status: fromMe ? (item.seen === 1 ? "read" : "sent") : undefined,
  };
}

export default function ChatConversationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params || {};

  // These three can, in principle, all be different values:
  //  - chatId: the conversation/thread's own id (API's `id` field)
  //  - routeMemberId: the other member's user id (API's `sender_user_id`
  //    value that identifies THEM, used to derive message direction)
  //  - routeThreadId: same as chatId, sent explicitly for clarity
  const chatId = Array.isArray(params.id) ? params.id[0] : params.id;

  const routeMemberId = Array.isArray(params.memberId)
    ? params.memberId[0]
    : params.memberId;

  const routeThreadId = Array.isArray(params.threadId)
    ? params.threadId[0]
    : params.threadId;

  // getChatView is keyed by the CONVERSATION's own id (the backend
  // looks up a ChatThread record by this id) — NOT the other member's
  // user id. Confirmed by the "No query results for model
  // [App\Models\ChatThread] 32" error, which showed the backend was
  // being passed the member's user id (32) instead of the thread id (1).
  const resolvedChatId = chatId || routeThreadId;

  // The other member's user id — used to figure out which side of the
  // conversation a message belongs to (see mapMessage above), and as a
  // fallback id for profile links.
  const memberId = routeMemberId || chatId;

  console.log("ChatConversationScreen params:", {
    chatId,
    routeMemberId,
    routeThreadId,
    resolvedChatId,
    memberId,
  });

  // threadId comes from ChatsScreen's nav params when available;
  // falls back to whatever chat-view returns if missing (e.g. deep link).
  const [chatThreadId, setChatThreadId] = useState(
    resolvedChatId ? String(resolvedChatId) : null,
  );

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);

  // Raw name fields from the last successful getChatView response, kept
  // only so the debug banner can show both side by side. Safe to remove
  // along with DEBUG_SHOW_RAW_NAMES once the mapping is verified.
  const [debugNames, setDebugNames] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const listRef = useRef(null);

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

  /* ================= INITIAL LOAD ================= */

  const loadChatView = useCallback(async () => {
    if (!resolvedChatId) {
      setErrorMessage("No conversation selected.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const token = await getToken();
      const result = await getChatView(resolvedChatId, token);

      // This endpoint responds with `result: true` (not `success`), so
      // check both to stay compatible with other endpoints too.
      const isSuccess =
        result?.success === 1 ||
        result?.success === true ||
        result?.result === true;

      if (isSuccess) {
        const payload = result?.data || result;

        const partner = mapChatPartner(payload, memberId);

        // API returns messages NEWEST-first (id 5, 4, 3, 2, 1). The
        // FlatList expects oldest-first so it reads top-to-bottom and
        // scrollToEnd() lands on the latest message — reverse here.
        const rawMessages = Array.isArray(payload?.messages)
          ? [...payload.messages].reverse()
          : [];

        setChat(partner);
        setMessages(rawMessages.map((m) => mapMessage(m, memberId)));
        setHasMoreOlder(true);
        setDebugNames({
          receiver_name: payload?.receiver_name ?? null,
          sender_name: payload?.sender_name ?? null,
        });

        if (!chatThreadId) {
          setChatThreadId(
            String(
              payload?.chat_thread_id ??
                payload?.thread_id ??
                payload?.id ??
                resolvedChatId,
            ),
          );
        }

        requestAnimationFrame(() => {
          listRef.current?.scrollToEnd({ animated: false });
        });
      } else {
        setErrorMessage(result?.message || "Unable to load this chat.");
      }
    } catch (err) {
      console.log("loadChatView Error:", err);
      setErrorMessage("Something went wrong loading this chat.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedChatId]);

  useEffect(() => {
    loadChatView();
  }, [loadChatView]);

  /* ================= LOAD OLDER MESSAGES ================= */

  const handleLoadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMoreOlder || messages.length === 0) return;

    const firstMessageId = messages[0]?.id;
    if (!firstMessageId || isNaN(Number(firstMessageId))) return;

    setLoadingOlder(true);

    try {
      const token = await getToken();
      const result = await getOldMessages(Number(firstMessageId), token);
      console.log("getOldMessages response:", JSON.stringify(result));

      const isSuccess = result?.success === 1 || result?.result === true;

      if (isSuccess) {
        const rawOld = Array.isArray(result.data) ? result.data : [];

        if (rawOld.length === 0) {
          setHasMoreOlder(false);
        } else {
          // Same ordering caveat as the initial load: assume this page
          // also comes back newest-first and reverse before prepending.
          const olderMapped = [...rawOld]
            .reverse()
            .map((m) => mapMessage(m, memberId));
          setMessages((prev) => [...olderMapped, ...prev]);
        }
      } else {
        console.log("getOldMessages failed:", result.message);
      }
    } catch (err) {
      console.log("handleLoadOlderMessages Error:", err);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMoreOlder, messages, memberId]);

  /* ================= SEND MESSAGE ================= */

  const handleBack = () => navigation.goBack();

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    if (!chatThreadId) {
      console.log("handleSend: missing chatThreadId, cannot send.");
      return;
    }

    const optimisticId = `m${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId,
      fromMe: true,
      text: trimmed,
      time: formatTime(new Date()),
      status: "sending",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setMessage("");
    setSending(true);

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });

    try {
      const token = await getToken();
      const result = await sendChatReply(chatThreadId, trimmed, token);
      const isSuccess = result?.success === 1 || result?.result === true;

      if (isSuccess) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, status: "sent" } : m,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticId ? { ...m, status: "failed" } : m,
          ),
        );
        console.log("sendChatReply failed:", result.message);
      }
    } catch (err) {
      console.log("handleSend Error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticId ? { ...m, status: "failed" } : m,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.red} />
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !chat) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.red} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>
            {errorMessage || "This conversation could not be found."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadChatView}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const avatarSource = chat.avatarUrl
    ? { uri: chat.avatarUrl }
    : FALLBACK_AVATAR;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.red} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerProfile}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Profile", { id: chat.id })}
        >
          <View style={styles.headerAvatarWrapper}>
            <Image source={avatarSource} style={styles.headerAvatar} />
            <View
              style={[
                styles.headerStatusDot,
                {
                  backgroundColor: chat.online
                    ? COLORS.green
                    : COLORS.offlineGray,
                },
              ]}
            />
          </View>

          <View style={styles.headerNameBlock}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>
                {chat.name}
              </Text>
              {chat.verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={COLORS.green}
                />
              )}
            </View>
            <Text style={styles.headerStatus}>
              {chat.online ? "Online" : "Offline"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
            <Ionicons name="call-outline" size={20} color={COLORS.darkRed} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={COLORS.darkRed}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= DEBUG: RAW NAME FIELDS ================= */}
      {/* Remove this block (and DEBUG_SHOW_RAW_NAMES) once you've
          confirmed sender_name/auth_user_photo is the right pairing
          across several real conversations, not just this one. */}
      {DEBUG_SHOW_RAW_NAMES && debugNames && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText} numberOfLines={1}>
            receiver_name: "{String(debugNames.receiver_name)}" | sender_name: "
            {String(debugNames.sender_name)}" → using sender_name
          </Text>
        </View>
      )}

      {/* ================= SAFETY NOTICE ================= */}
      <View style={styles.safetyBanner}>
        <Ionicons name="shield-checkmark" size={14} color={COLORS.green} />
        <Text style={styles.safetyText}>
          Never share OTPs, bank details or make payments outside the app.
        </Text>
      </View>

      {/* ================= MESSAGES ================= */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          onScroll={({ nativeEvent }) => {
            if (nativeEvent.contentOffset.y <= 20) {
              handleLoadOlderMessages();
            }
          }}
          scrollEventThrottle={100}
          ListHeaderComponent={
            <>
              {loadingOlder && (
                <View style={styles.olderLoaderRow}>
                  <ActivityIndicator size="small" color={COLORS.red} />
                </View>
              )}
              <View style={styles.dateSeparator}>
                <Text style={styles.dateSeparatorText}>Today</Text>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.emptyText}>
                No messages yet. Say hello 👋
              </Text>
            </View>
          }
          renderItem={({ item }) => <MessageBubble message={item} />}
        />

        {/* ================= INPUT BAR ================= */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
            <Ionicons name="add" size={24} color={COLORS.darkRed} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message"
              placeholderTextColor={COLORS.mutedGray}
              value={message}
              onChangeText={setMessage}
              multiline
              editable={!sending}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || sending) && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleSend}
            disabled={!message.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={18} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================================================= */
/* ================= MESSAGE BUBBLE ================= */
/* ================================================= */

function MessageBubble({ message }) {
  const { fromMe, text, time, status, attachment } = message;

  return (
    <View
      style={[
        styles.bubbleRow,
        fromMe ? styles.bubbleRowRight : styles.bubbleRowLeft,
      ]}
    >
      <View
        style={[
          styles.bubble,
          fromMe ? styles.bubbleSent : styles.bubbleReceived,
        ]}
      >
        {attachment ? (
          <Image
            source={{ uri: attachment }}
            style={styles.bubbleAttachment}
            resizeMode="cover"
          />
        ) : null}

        {!!text && (
          <Text
            style={fromMe ? styles.bubbleTextSent : styles.bubbleTextReceived}
          >
            {text}
          </Text>
        )}

        <View style={styles.bubbleMeta}>
          {!!time && (
            <Text
              style={fromMe ? styles.bubbleTimeSent : styles.bubbleTimeReceived}
            >
              {time}
            </Text>
          )}

          {fromMe && status === "failed" ? (
            <Ionicons
              name="alert-circle"
              size={14}
              color={COLORS.badgeRed}
              style={{ marginLeft: 3 }}
            />
          ) : (
            fromMe && (
              <MaterialIcons
                name={status === "read" ? "done-all" : "done"}
                size={14}
                color={
                  status === "read" ? COLORS.goldLight : "rgba(255,255,255,0.7)"
                }
                style={{ marginLeft: 3 }}
              />
            )
          )}
        </View>
      </View>
    </View>
  );
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

/* ================================================= */
/* ================= STYLES ========================= */
/* ================================================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },

  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl * 2,
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.mutedGray,
    textAlign: "center",
    marginBottom: SPACING.md,
  },

  retryButton: {
    backgroundColor: COLORS.red,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
  },

  retryButtonText: { color: COLORS.white, fontWeight: "700" },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerProfile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.xs,
  },

  headerAvatarWrapper: { position: "relative", marginRight: SPACING.sm },

  headerAvatar: { width: 42, height: 42, borderRadius: 21 },

  headerStatusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  headerNameBlock: { flexShrink: 1 },

  headerNameRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  headerName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.darkRed,
    maxWidth: width * 0.4,
  },

  headerStatus: { fontSize: 11.5, color: COLORS.mutedGray, marginTop: 1 },

  headerActions: { flexDirection: "row", alignItems: "center" },

  headerIconButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.xs,
  },

  /* ================= DEBUG BANNER ================= */

  debugBanner: {
    backgroundColor: COLORS.debugBanner,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },

  debugText: { fontSize: 10, color: COLORS.text },

  /* ================= SAFETY BANNER ================= */

  safetyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
  },

  safetyText: { fontSize: 11, color: COLORS.gray, flexShrink: 1 },

  /* ================= MESSAGES ================= */

  messageList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  olderLoaderRow: {
    paddingVertical: SPACING.sm,
    alignItems: "center",
  },

  dateSeparator: {
    alignSelf: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginBottom: SPACING.md,
  },

  dateSeparatorText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.mutedGray,
  },

  bubbleRow: { flexDirection: "row", marginBottom: SPACING.sm },

  bubbleRowLeft: { justifyContent: "flex-start" },

  bubbleRowRight: { justifyContent: "flex-end" },

  bubble: {
    maxWidth: width * 0.75,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },

  bubbleSent: {
    backgroundColor: COLORS.bubbleSent,
    borderBottomRightRadius: 4,
  },

  bubbleReceived: {
    backgroundColor: COLORS.bubbleReceived,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  bubbleAttachment: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },

  bubbleTextSent: { fontSize: 14, color: COLORS.white, lineHeight: 19 },

  bubbleTextReceived: { fontSize: 14, color: COLORS.text, lineHeight: 19 },

  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 4,
  },

  bubbleTimeSent: { fontSize: 10, color: "rgba(255,255,255,0.75)" },

  bubbleTimeReceived: { fontSize: 10, color: COLORS.mutedGray },

  /* ================= INPUT BAR ================= */

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.xs,
  },

  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === "ios" ? SPACING.sm : 2,
    maxHeight: 100,
    justifyContent: "center",
  },

  textInput: { fontSize: 14, color: COLORS.text, maxHeight: 90 },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.red,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
  },

  sendButtonDisabled: { backgroundColor: COLORS.offlineGray },
});
