/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import useCustomBackHandler from '../navigation/useCustomBackHandler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  red:        '#cc0000',
  white:      '#ffffff',
  text:       '#0a0a0a',
  textMuted:  '#737373',
  border:     '#e5e5e5',
  bg:         '#fcfafa',
  unread:     '#cc0000',
};

const TABS = [
  { key: 'chats', label: 'Chats' },
  { key: 'requests', label: 'Requests' },
  { key: 'notifications', label: 'Notifications' },
];

// ─── Sample data ───
const SAMPLE_CHATS = [
  { id: 'c1', name: 'Pirate talks', avatar: 'https://i.pravatar.cc/150?img=12', lastMessage: 'Charan Chv: Pongal and chantey tiffen today', time: '7:46 am', unread: 2, group: true },
  { id: 'c2', name: 'Priya Sharma', avatar: 'https://i.pravatar.cc/150?img=47', lastMessage: 'Sure, looking forward to it! 😊', time: '12:18 pm', unread: 0, online: true },
  { id: 'c3', name: 'Balaji', avatar: 'https://i.pravatar.cc/150?img=8', lastMessage: 'Ok', time: '1:33 pm', unread: 0 },
  { id: 'c4', name: 'Bhanu Prakash', avatar: 'https://i.pravatar.cc/150?img=15', lastMessage: 'See you tomorrow!', time: 'Yesterday', unread: 1 },
];

const SAMPLE_REQUESTS = [
  { id: 'r1', name: 'Ananya Rao', avatar: 'https://i.pravatar.cc/150?img=25', subtitle: 'Wants to connect with you', time: '2h ago' },
  { id: 'r2', name: 'Vikram Singh', avatar: 'https://i.pravatar.cc/150?img=19', subtitle: 'Sent you a message request', time: '5h ago' },
  { id: 'r3', name: 'Neha Kapoor', avatar: 'https://i.pravatar.cc/150?img=32', subtitle: 'Wants to connect with you', time: 'Yesterday' },
];

const SAMPLE_NOTIFICATIONS = [
  { id: 'n1', name: 'Balaji', avatar: 'https://i.pravatar.cc/150?img=8', subtitle: 'liked your photo', time: '10m ago' },
  { id: 'n2', name: 'Charan Chv', avatar: 'https://i.pravatar.cc/150?img=33', subtitle: 'commented on your post', time: '1h ago' },
  { id: 'n3', name: 'System', avatar: 'https://i.pravatar.cc/150?img=68', subtitle: 'Your profile was viewed 12 times today', time: '3h ago' },
];

export default function MessagesScreen({ navigation }) {
  const route = useRoute();
  useCustomBackHandler(navigation, route);

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        if (idx !== activeIndex) setActiveIndex(idx);
      },
    }
  );

  const indicatorWidth = SCREEN_WIDTH / TABS.length;
  const translateX = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH * (TABS.length - 1)],
    outputRange: [0, indicatorWidth * (TABS.length - 1)],
    extrapolate: 'clamp',
  });

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRow}
      activeOpacity={0.7}
      onPress={() => navigation?.navigate?.('ChatConversation', { chat: item, page: 'Messages' })}
    >
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatTopRow}>
          <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.chatTime, item.unread > 0 && styles.chatTimeUnread]}>{item.time}</Text>
        </View>
        <View style={styles.chatBottomRow}>
          <Text style={[styles.chatLastMsg, item.unread > 0 && styles.chatLastMsgUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRequestItem = ({ item }) => (
    <View style={styles.chatRow}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatTopRow}>
          <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text style={styles.chatLastMsg} numberOfLines={1}>{item.subtitle}</Text>
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85}>
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineBtn} activeOpacity={0.85}>
            <Text style={styles.declineBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // NOTE: no onPress here by default — tapping a notification currently
  // does nothing. If you want it to navigate somewhere (e.g. back to the
  // profile that liked/commented), add:
  //   onPress={() => navigation?.navigate?.('ProfileDetail', { page: 'Messages' })}
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity style={styles.chatRow} activeOpacity={0.7}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatTopRow}>
          <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text style={styles.chatLastMsg} numberOfLines={1}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.red} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Tab labels — visual only, driven purely by swipe position */}
      <View style={styles.tabLabelsRow}>
        {TABS.map((tab, i) => {
          const opacity = scrollX.interpolate({
            inputRange: TABS.map((_, idx) => idx * SCREEN_WIDTH),
            outputRange: TABS.map((_, idx) => (idx === i ? 1 : 0.55)),
            extrapolate: 'clamp',
          });
          return (
            <View key={tab.key} style={styles.tabLabelWrap}>
              <Animated.Text style={[styles.tabLabel, { opacity }]}>
                {tab.label}
              </Animated.Text>
            </View>
          );
        })}
        <Animated.View
          style={[styles.indicator, { width: indicatorWidth, transform: [{ translateX }] }]}
        />
      </View>

      {/* Swipeable pages — finger scroll only, no tab buttons */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}
      >
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <FlatList
            data={SAMPLE_CHATS}
            keyExtractor={item => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <FlatList
            data={SAMPLE_REQUESTS}
            keyExtractor={item => item.id}
            renderItem={renderRequestItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <FlatList
            data={SAMPLE_NOTIFICATIONS}
            keyExtractor={item => item.id}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerIcon: { fontSize: 18, color: COLORS.white },

  tabLabelsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.red,
    position: 'relative',
  },
  tabLabelWrap: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },

  pager: { flex: 1 },
  listContent: { paddingBottom: 12 },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  avatarWrap: { position: 'relative', marginRight: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#2ecc71',
    borderWidth: 2, borderColor: COLORS.white,
  },

  chatInfo: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { fontSize: 15.5, fontWeight: '600', color: COLORS.text, flex: 1, marginRight: 8 },
  chatTime: { fontSize: 12, color: COLORS.textMuted },
  chatTimeUnread: { color: COLORS.unread, fontWeight: '700' },

  chatBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
  chatLastMsg: { fontSize: 13.5, color: COLORS.textMuted, flex: 1, marginRight: 8 },
  chatLastMsgUnread: { color: COLORS.text, fontWeight: '500' },

  unreadBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.unread,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: { fontSize: 11.5, color: COLORS.white, fontWeight: '700' },

  requestActions: { flexDirection: 'row', marginTop: 8, gap: 10 },
  acceptBtn: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
  },
  acceptBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  declineBtn: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declineBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
});
