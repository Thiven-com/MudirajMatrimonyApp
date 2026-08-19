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
} from 'react-native';
import { ROUTES } from '../navigation/routes';

// ─── Brand Palette (matches ChatConversationScreen / ChatListScreen) ──
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
const VISITORS = [
  { id: 'v1', name: 'Anjali Reddy', age: 26, location: 'Hyderabad', avatar: 'https://i.pravatar.cc/150?img=32', online: true, time: '5 min ago', premium: false, isNew: true },
  { id: 'v2', name: 'Deepika Rao', age: 28, location: 'Bangalore', avatar: 'https://i.pravatar.cc/150?img=44', online: false, time: '20 min ago', premium: true, isNew: true },
  { id: 'v3', name: 'Sneha Kumar', age: 25, location: 'Chennai', avatar: 'https://i.pravatar.cc/150?img=45', online: true, time: '1 hour ago', premium: false, isNew: false },
  { id: 'section-yesterday', name: 'Yesterday', section: true },
  { id: 'v4', name: 'Pooja Sharma', age: 27, location: 'Pune', avatar: 'https://i.pravatar.cc/150?img=48', online: false, time: 'Yesterday, 8:14 PM', premium: false, isNew: false },
  { id: 'v5', name: 'Kavya Nair', age: 24, location: 'Kochi', avatar: 'https://i.pravatar.cc/150?img=49', online: false, time: 'Yesterday, 6:02 PM', premium: true, isNew: false },
  { id: 'section-earlier', name: 'Earlier', section: true },
  { id: 'v6', name: 'Meera Iyer', age: 29, location: 'Coimbatore', avatar: 'https://i.pravatar.cc/150?img=50', online: false, time: '3 days ago', premium: false, isNew: false },
  { id: 'v7', name: 'Ritu Singh', age: 26, location: 'Vijayawada', avatar: 'https://i.pravatar.cc/150?img=41', online: false, time: '5 days ago', premium: false, isNew: false },
];

const FILTERS = ['All', 'Today', 'This Week'];

export default function VisitorsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const isPremiumUser = false; // toggle to simulate a premium account

  const visitorCount = VISITORS.filter(v => !v.section).length;

  const handleViewProfile = (item) => {
    navigation?.navigate?.(ROUTES.PROFILE_DETAIL, { profile: item });
  };

  const renderItem = ({ item }) => {
    if (item.section) {
      return <Text style={styles.sectionLabel}>{item.name}</Text>;
    }

    const locked = item.premium && !isPremiumUser;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => !locked && handleViewProfile(item)}>
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: item.avatar }}
            style={[styles.avatar, locked && styles.avatarBlurred]}
            blurRadius={locked ? 12 : 0}
          />
          {item.online && !locked && <View style={styles.onlineDot} />}
          {locked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
          {item.isNew && !locked && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {locked ? 'Premium Member' : `${item.name}, ${item.age}`}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {locked ? 'Upgrade to view profile' : item.location}
          </Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, locked && styles.actionBtnGold]}
          activeOpacity={0.85}
          onPress={() =>
            locked
              ? navigation?.navigate?.(ROUTES.PREMIUM)
              : handleViewProfile(item)
          }>
          <Text style={[styles.actionBtnText, locked && styles.actionBtnTextGold]}>
            {locked ? 'Unlock' : 'View'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.headerTitle}>Profile Visitors</Text>
          <Text style={styles.headerSubtitle}>{visitorCount} people viewed your profile</Text>
        </View>
        <View style={{ width: 30 }} />
      </View>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.85}>
            <Text
              style={[
                styles.filterChipText,
                activeFilter === filter && styles.filterChipTextActive,
              ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Upgrade Banner (shown to non-premium users) */}
      {!isPremiumUser && (
        <TouchableOpacity style={styles.upgradeBanner} activeOpacity={0.9}>
          <Text style={styles.upgradeIcon}>👑</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeTitle}>See everyone who visited you</Text>
            <Text style={styles.upgradeDesc}>Upgrade to Premium to unlock all profiles</Text>
          </View>
          <Text style={styles.upgradeArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Visitors List */}
      <FlatList
        data={VISITORS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👀</Text>
            <Text style={styles.emptyTitle}>No visitors yet</Text>
            <Text style={styles.emptyDesc}>
              Complete your profile to get noticed by more people
            </Text>
          </View>
        }
      />
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

  // Filter Tabs
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: COLORS.redSoft,
  },
  filterChipActive: { backgroundColor: COLORS.red },
  filterChipText: { fontSize: 13, fontWeight: '600', color: COLORS.red },
  filterChipTextActive: { color: COLORS.white },

  // Upgrade Banner
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E8',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F5E0A3',
    gap: 10,
  },
  upgradeIcon: { fontSize: 26 },
  upgradeTitle: { fontSize: 13.5, fontWeight: '700', color: '#8B6D00' },
  upgradeDesc: { fontSize: 11.5, color: '#A9873A', marginTop: 1 },
  upgradeArrow: { fontSize: 22, color: '#C9A227', fontWeight: '700' },

  // List
  list: { padding: 16, paddingBottom: 30 },
  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EEEEEE' },
  avatarBlurred: { opacity: 0.9 },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: { fontSize: 18 },
  newBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: COLORS.red,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: { fontSize: 8.5, fontWeight: '800', color: COLORS.white },

  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardMeta: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 2 },
  cardTime: { fontSize: 11, color: '#B0B0B0', marginTop: 3 },

  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.red,
  },
  actionBtnText: { fontSize: 12.5, fontWeight: '700', color: COLORS.red },
  actionBtnGold: { borderColor: COLORS.gold, backgroundColor: '#FFF8E8' },
  actionBtnTextGold: { color: '#8B6D00' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },
});