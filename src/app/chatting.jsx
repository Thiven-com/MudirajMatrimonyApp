import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const LOGO = require("../../assets/images/logo.png");
// Swap for the participant's actual photo, e.g. { uri: participant.photoUrl }
const AVATAR_PLACEHOLDER = require("../../assets/images/Match6.png");

const PARTICIPANT = {
  name: "Priya Sharma",
  online: true,
  verified: true,
};

const MESSAGES = [
  {
    id: "1",
    sender: "them",
    text: "Hello! Thank you for showing interest in my profile.",
    time: "10:30 AM",
  },
  {
    id: "2",
    sender: "me",
    text: "Hello Priya! Nice to connect with you. I liked your profile and would love to know you better.",
    time: "10:32 AM",
    read: true,
  },
  {
    id: "3",
    sender: "them",
    text: "Nice to meet you too! \ud83d\ude0a\nCan you tell me a bit about yourself?",
    time: "10:34 AM",
  },
  {
    id: "4",
    sender: "me",
    text: "Sure! I am a Software Engineer working in Hyderabad. I come from a Mudhiraj family and value our traditions a lot. How about you?",
    time: "10:36 AM",
    read: true,
  },
  {
    id: "5",
    sender: "them",
    text: "That's great! I'm also proud of our community and traditions.\nI work as a Software Engineer too.",
    time: "10:38 AM",
  },
  {
    id: "6",
    sender: "me",
    text: "That's wonderful! \ud83d\ude0a We have a lot in common. Would you like to connect on a call sometime?",
    time: "10:40 AM",
    read: true,
  },
  {
    id: "7",
    sender: "them",
    text: "Yes, sure! We can plan for a call over the weekend.",
    time: "10:41 AM",
    reaction: "\u2764\ufe0f",
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState(MESSAGES);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "me",
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: false,
      },
    ]);
    setDraft("");
    // TODO: send `text` to your backend / socket here
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <LinearGradient
        colors={
          Colors.gradientLogo || Colors.gradientHeader || ["#B3151C", "#8E0F16"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>

        <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerBrandTitle}>MUDHIRAJ WORLD</Text>
          <Text style={styles.headerBrandSubtitle}>M A T R I M O N Y</Text>
          <Text style={styles.headerTagline}>Our Community, Our Pride</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="call" size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginLeft: 18 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ================= PARTICIPANT ROW ================= */}
      <View style={styles.participantRow}>
        <View style={styles.participantAvatarWrapper}>
          <Image source={AVATAR_PLACEHOLDER} style={styles.participantAvatar} />
        </View>

        <View style={styles.participantInfo}>
          <View style={styles.participantNameRow}>
            <Text style={styles.participantName}>{PARTICIPANT.name}</Text>
            {PARTICIPANT.online && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.participantStatusRow}>
            <Text style={styles.participantStatusText}>
              {PARTICIPANT.online ? "Online" : "Offline"}
            </Text>
            {PARTICIPANT.verified && (
              <View style={styles.verifiedRow}>
                <Ionicons
                  name="shield-checkmark"
                  size={13}
                  color={Colors.logoRed}
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.viewProfileButton} activeOpacity={0.8}>
          <Text style={styles.viewProfileText}>View Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ================= CHAT BODY ================= */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Encryption notice */}
          <View style={styles.encryptionBanner}>
            <Ionicons name="lock-closed" size={14} color={Colors.textPrimary} />
            <Text style={styles.encryptionText}>
              Messages are end-to-end encrypted. Your privacy is our priority.
            </Text>
          </View>

          {/* Date separator */}
          <View style={styles.dateSeparatorRow}>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>Today</Text>
            </View>
          </View>

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        {/* ================= INPUT BAR ================= */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.plusButton} activeOpacity={0.85}>
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.placeholder}
              value={draft}
              onChangeText={setDraft}
              multiline
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="happy-outline" size={20} color={Colors.logoRed} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.micOrSendButton}
            activeOpacity={0.85}
            onPress={draft.trim() ? handleSend : undefined}
          >
            <Ionicons
              name={draft.trim() ? "send" : "mic"}
              size={20}
              color={Colors.logoRed}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================= MESSAGE BUBBLE =================
function MessageBubble({ message }) {
  const isMine = message.sender === "me";

  return (
    <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
      {!isMine && (
        <Image source={AVATAR_PLACEHOLDER} style={styles.messageAvatar} />
      )}

      <View style={styles.messageColumn}>
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          <Text style={styles.bubbleText}>{message.text}</Text>
          <View style={styles.bubbleMetaRow}>
            <Text style={styles.bubbleTime}>{message.time}</Text>
            {isMine && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={message.read ? Colors.logoRed : Colors.textMuted}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
        </View>

        {message.reaction && (
          <Text
            style={[styles.reactionText, isMine && styles.reactionTextMine]}
          >
            {message.reaction}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },

  /* ===== HEADER ===== */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerBrandTitle: {
    fontSize: 18,
    fontFamily: Fonts.display.extraBold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  headerBrandSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.body.semiBold,
    color: Colors.white,
    letterSpacing: 3,
    marginTop: 1,
  },
  headerTagline: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.white,
    marginTop: 2,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* ===== PARTICIPANT ROW ===== */
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  participantAvatarWrapper: {
    position: "relative",
  },
  participantAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  participantInfo: {
    flex: 1,
  },
  participantNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantName: {
    fontSize: 17,
    fontFamily: Fonts.display.bold,
    color: Colors.logoRed,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.success,
    marginLeft: 8,
  },
  participantStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  participantStatusText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginRight: 10,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: Fonts.body.semiBold,
    color: Colors.logoRed,
  },
  viewProfileButton: {
    borderWidth: 1.3,
    borderColor: Colors.logoGold,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  viewProfileText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.logoRed,
  },

  /* ===== CHAT BODY ===== */
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  encryptionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CC",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  encryptionText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    lineHeight: 15,
  },
  dateSeparatorRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  datePill: {
    backgroundColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  datePillText: {
    fontSize: 12,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },

  /* ===== MESSAGE BUBBLES ===== */
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
    maxWidth: "88%",
  },
  messageRowMine: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageColumn: {
    flexShrink: 1,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleTheirs: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleMine: {
    backgroundColor: "#FFF3CC",
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bubbleMetaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  bubbleTime: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  reactionText: {
    fontSize: 16,
    marginTop: 4,
    marginLeft: 4,
  },
  reactionTextMine: {
    alignSelf: "flex-end",
    marginRight: 4,
    marginLeft: 0,
  },

  /* ===== INPUT BAR ===== */
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  plusButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.logoRed,
    alignItems: "center",
    justifyContent: "center",
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 4,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    maxHeight: 90,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  micOrSendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
