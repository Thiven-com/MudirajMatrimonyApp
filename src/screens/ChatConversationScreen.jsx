import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  Alert,
} from 'react-native';

// ─── Brand Palette (matches ChatListScreen / ManagePhotosScreen) ──
const COLORS = {
  red:          '#cc0000',
  redDark:      '#9e0000',
  redSoft:      '#fdecec',
  bubbleMine:   '#cc0000',
  bubbleTheirs: '#f5f5f5',
  white:        '#ffffff',
  text:         '#0a0a0a',
  textOnRed:    '#ffffff',
  textMuted:    '#737373',
  border:       '#e5e5e5',
  online:       '#2ecc71',
  bg:           '#fcfafa',
  inputBarBg:   '#f0f0f0',
  pillBg:       '#ffffff',
};

const SAMPLE_MESSAGES = [
  { id: 'm1', text: 'Hi! I saw your profile, would love to know more about you 😊', sender: 'them', time: '11:40 AM', status: 'read' },
  { id: 'm2', text: "Hello! Nice to connect with you too. I'm working as a software engineer in Bangalore.", sender: 'me', time: '11:42 AM', status: 'read' },
  { id: 'm3', text: 'That sounds great! I work in marketing. What are your hobbies?', sender: 'them', time: '11:43 AM', status: 'read' },
  { id: 'm4', text: 'I love trekking and photography. Also enjoy cooking on weekends 👨‍🍳', sender: 'me', time: '11:46 AM', status: 'read' },
  { id: 'm5', text: 'date-separator', sender: 'system', date: 'Today' },
  { id: 'm6', text: 'Good morning! How was your weekend?', sender: 'them', time: '9:15 AM', status: 'read' },
  { id: 'm7', text: 'It was great, went on a short trek near Nandi Hills. How about yours?', sender: 'me', time: '9:20 AM', status: 'read' },
  { id: 'm8', text: 'Sounds lovely! Mine was quite relaxed, spent time with family.', sender: 'them', time: '9:22 AM', status: 'read' },
  { id: 'm9', text: 'Sure, looking forward to it! 😊', sender: 'them', time: '12:18 PM', status: 'sent' },
];

export default function ChatConversationScreen({ route, navigation }) {
  const chat = route?.params?.chat || {
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?img=47',
    online: true,
  };

  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [input, setInput] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const listRef = useRef(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newMsg = {
      id: Date.now().toString(),
      text: trimmed,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const handleClearChat = () => {
    setMenuVisible(false);
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear this chat? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setMessages([]),
        },
      ],
    );
  };

  const handleBlock = () => {
    setMenuVisible(false);
    Alert.alert(
      `Block ${chat.name}?`,
      'They will no longer be able to message you or see your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            // TODO: plug in your actual block API call here
            navigation?.goBack?.();
          },
        },
      ],
    );
  };

  const renderMessage = ({ item }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateSeparatorText}>{item.date}</Text>
        </View>
      );
    }

    const isMine = item.sender === 'me';
    return (
      <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.text}</Text>
          <View style={styles.bubbleMeta}>
            <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>{item.time}</Text>
            {isMine && (
              <Text style={styles.ticks}>
                {item.status === 'read' ? '✓✓' : item.status === 'delivered' ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const hasText = input.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.red} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerProfile} activeOpacity={0.8}>
          <View style={styles.headerAvatarWrap}>
            <Image source={{ uri: chat.avatar }} style={styles.headerAvatar} />
            {chat.online && <View style={styles.headerOnlineDot} />}
          </View>
          <View>
            <Text style={styles.headerName}>{chat.name}</Text>
            <Text style={styles.headerStatus}>{chat.online ? 'Online' : 'Last seen recently'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={styles.headerIconTxt}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Header Options Menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
              <Text style={styles.menuItemText}>Clear Chat</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Block</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <KeyboardAvoidingView
        style={styles.flexArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        {/* WhatsApp-style Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.pill}>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.pillIcon}>🙂</Text>
            </TouchableOpacity>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message"
              placeholderTextColor={COLORS.textMuted}
              style={styles.input}
              multiline
            />

            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.pillIconBtn}>
              <Text style={styles.pillIcon}>📎</Text>
            </TouchableOpacity>

            {!hasText && (
              <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.pillIconBtn}>
                <Text style={styles.pillIcon}>📷</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSend}
            disabled={!hasText}
            activeOpacity={0.85}
          >
            <Text style={styles.sendIcon}>{hasText ? '➤' : '🎤'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flexArea: { flex: 1 },

  // Header
  header: {
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  backBtn: { padding: 4, marginRight: 4 },
  backArrow: { fontSize: 22, color: COLORS.white, fontWeight: '600' },

  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  headerAvatarWrap: { position: 'relative', marginRight: 10 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19 },
  headerOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: COLORS.online,
    borderWidth: 1.5, borderColor: COLORS.red,
  },
  headerName: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  headerStatus: { fontSize: 11.5, color: 'rgba(255,255,255,0.85)', marginTop: 1 },

  headerIconBtn: { padding: 6 },
  headerIconTxt: { fontSize: 20, color: COLORS.white, fontWeight: '700' },

  // Header Options Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menuBox: {
    position: 'absolute',
    top: 92,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 170,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  menuItemDanger: {
    color: COLORS.red,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },

  // Messages
  messagesList: { paddingHorizontal: 14, paddingVertical: 16, paddingBottom: 8 },

  dateSeparator: { alignItems: 'center', marginVertical: 14 },
  dateSeparatorText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    fontWeight: '600',
  },

  bubbleRow: { marginBottom: 10, flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },

  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMine: { backgroundColor: COLORS.bubbleMine, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: COLORS.bubbleTheirs, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },

  bubbleText: { fontSize: 14.5, lineHeight: 20, color: COLORS.text },
  bubbleTextMine: { color: COLORS.white },

  bubbleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 },
  bubbleTime: { fontSize: 10.5, color: COLORS.textMuted },
  bubbleTimeMine: { color: 'rgba(255,255,255,0.8)' },
  ticks: { fontSize: 11, color: 'rgba(255,255,255,0.9)' },

  // ─── WhatsApp-style Input Bar ───
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: COLORS.inputBarBg,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.pillBg,
    borderRadius: 26,
    paddingHorizontal: 10,
    paddingVertical:  8,
    marginRight: 8,
    maxHeight: 120,
  },
  pillIconBtn: { paddingHorizontal: 4, paddingBottom: 6 },
  pillIcon: { fontSize: 20 },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: 8,
    paddingVertical:  6,
    maxHeight: 100,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.red,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sendIcon: { fontSize: 17, color: COLORS.white, marginLeft: 2 },
});
