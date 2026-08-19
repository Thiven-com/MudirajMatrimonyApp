/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

// ─── Brand Palette (matches ChatConversationScreen / VisitorsScreen) ──
const COLORS = {
  red:        '#cc0000',
  redDark:    '#9e0000',
  redSoft:    '#fdecec',
  white:      '#ffffff',
  text:       '#0a0a0a',
  textMuted:  '#737373',
  border:     '#e5e5e5',
  online:     '#2ecc71',
  bg:         '#fcfafa',
  gold:       '#e8b923',
};

// ─── Sample Data ──
const INITIAL_SHORTLISTED = [
  { id: 's1', name: 'Anjali Reddy', age: 26, location: 'Hyderabad', profession: 'Software Engineer', avatar: 'https://i.pravatar.cc/150?img=32', online: true, matchPercent: 92, savedOn: '2 days ago' },
  { id: 's2', name: 'Deepika Rao', age: 28, location: 'Bangalore', profession: 'Doctor', avatar: 'https://i.pravatar.cc/150?img=44', online: false, matchPercent: 87, savedOn: '4 days ago' },
  { id: 's3', name: 'Sneha Kumar', age: 25, location: 'Chennai', profession: 'Marketing Manager', avatar: 'https://i.pravatar.cc/150?img=45', online: true, matchPercent: 84, savedOn: '1 week ago' },
  { id: 's4', name: 'Pooja Sharma', age: 27, location: 'Pune', profession: 'Chartered Accountant', avatar: 'https://i.pravatar.cc/150?img=48', online: false, matchPercent: 79, savedOn: '1 week ago' },
  { id: 's5', name: 'Kavya Nair', age: 24, location: 'Kochi', profession: 'Architect', avatar: 'https://i.pravatar.cc/150?img=49', online: false, matchPercent: 75, savedOn: '2 weeks ago' },
];

const TABS = ['My Shortlist', 'Shortlisted Me'];

export default function ShortlistedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('My Shortlist');
  const [shortlisted, setShortlisted] = useState(INITIAL_SHORTLISTED);

  const handleRemove = (id, name) => {
    Alert.alert(
      'Remove from Shortlist',
      `Remove ${name} from your shortlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setShortlisted(prev => prev.filter(item => item.id !== id)),
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardTop} activeOpacity={0.85}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {item.online && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}, {item.age}
            </Text>
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{item.matchPercent}% Match</Text>
            </View>
          </View>
          <Text style={styles.cardMeta} numberOfLines={1}>{item.profession}</Text>
          <Text style={styles.cardMeta} numberOfLines={1}>{item.location}</Text>
          <Text style={styles.cardSavedOn}>Shortlisted {item.savedOn}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.removeBtn}
          activeOpacity={0.85}
          onPress={() => handleRemove(item.id, item.name)}>
          <Text style={styles.removeBtnIcon}>✕</Text>
          <Text style={styles.removeBtnText}>Remove</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.messageBtn} activeOpacity={0.85}>
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.viewBtn} activeOpacity={0.85}>
          <Text style={styles.viewBtnText}>View Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.red} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Shortlisted</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'My Shortlist'
              ? `${shortlisted.length} profiles saved`
              : 'People who shortlisted you'}
          </Text>
        </View>
        <View style={{ width: 30 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.85}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {activeTab === 'My Shortlist' ? (
        <FlatList
          data={shortlisted}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyTitle}>No shortlisted profiles</Text>
              <Text style={styles.emptyDesc}>
                Profiles you shortlist will appear here so you can revisit them anytime
              </Text>
              <TouchableOpacity style={styles.emptyCta} activeOpacity={0.85}>
                <Text style={styles.emptyCtaText}>Browse Profiles</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💫</Text>
          <Text style={styles.emptyTitle}>No one yet</Text>
          <Text style={styles.emptyDesc}>
            When someone shortlists your profile, they'll show up here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    backgroundColor: COLORS.red,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backBtn: { padding: 4, marginRight: 12 },
  backArrow: { fontSize: 22, color: COLORS.white, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.red },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '50%',
    backgroundColor: COLORS.red,
    borderRadius: 2,
  },

  // List
  list: { padding: 16, paddingBottom: 30 },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEEEEE' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  cardName: { fontSize: 15.5, fontWeight: '700', color: COLORS.text, flexShrink: 1 },
  matchBadge: {
    backgroundColor: '#E8FFE8',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#00AA44' },
  cardMeta: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 1 },
  cardSavedOn: { fontSize: 11, color: '#B0B0B0', marginTop: 4 },

  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#F2F2F2',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 4,
  },
  removeBtnIcon: { fontSize: 11, color: COLORS.textMuted },
  removeBtnText: { fontSize: 12.5, fontWeight: '600', color: COLORS.textMuted },
  messageBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.red,
  },
  messageBtnText: { fontSize: 12.5, fontWeight: '700', color: COLORS.red },
  viewBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.red,
  },
  viewBtnText: { fontSize: 12.5, fontWeight: '700', color: COLORS.white },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },
  emptyCta: {
    marginTop: 18,
    backgroundColor: COLORS.red,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 24,
  },
  emptyCtaText: { fontSize: 13.5, fontWeight: '700', color: COLORS.white },
});
