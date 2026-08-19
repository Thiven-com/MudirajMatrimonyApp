/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Polygon, Path, Circle } from 'react-native-svg';
import { ROUTES } from '../navigation/routes';

const { width } = Dimensions.get('window');

// ── Fallback data ────────────────────────────────────────────────────────────
// Used only for fields that a given navigation source (Visitors, Shortlisted,
// Search, etc.) doesn't provide. Real data should come from route.params.profile
// or, better, from an API call keyed by profile.id.

const DEFAULT_PROFILE = {
  name: 'Member',
  age: '—',
  city: '—',
  edu: '—',
  caste: '—',
  about: 'This member has not added an "About Me" section yet.',
  photoCount: 1,
  avatar: null,
};

const DEFAULT_DETAILS = [
  {
    group: 'Personal',
    fields: [
      ['Height', '—'],
      ['Weight', '—'],
      ['Complexion', '—'],
      ['Mother Tongue', '—'],
      ['Blood Group', '—'],
    ],
  },
  {
    group: 'Religion & Culture',
    fields: [
      ['Religion', '—'],
      ['Caste', '—'],
      ['Sub-caste', '—'],
      ['Gothra', '—'],
      ['Manglik', '—'],
    ],
  },
  {
    group: 'Education & Career',
    fields: [
      ['Education', '—'],
      ['College', '—'],
      ['Profession', '—'],
      ['Employer', '—'],
      ['Annual Income', '—'],
    ],
  },
  {
    group: 'Family',
    fields: [
      ['Father', '—'],
      ['Mother', '—'],
      ['Siblings', '—'],
      ['Family Type', '—'],
      ['Family Status', '—'],
    ],
  },
];

// ── Main Screen ───────────────────────────────────────────────────────────────

const ProfileDetailScreen = ({ route, navigation }) => {
  const [liked, setLiked] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // Whichever screen navigated here (Visitors, Shortlisted, Search…) passes
  // the tapped person as `profile`. Merge it over the defaults so any field
  // that source didn't include still renders something sensible.
  const passedProfile = route?.params?.profile || {};
  const PROFILE = { ...DEFAULT_PROFILE, ...passedProfile };

  // If the caller passed its own `details` (grouped fields), use that;
  // otherwise fall back to the placeholder groups above.
  const DETAILS = passedProfile.details || DEFAULT_DETAILS;

  const handleMessage = () => {
    navigation?.navigate?.(ROUTES.CHAT_CONVERSATION, {
      chat: {
        id: PROFILE.id,
        name: PROFILE.name,
        avatar: PROFILE.avatar,
        online: PROFILE.online ?? false,
      },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── Photo Section ── */}
        <View style={styles.photoSection}>
          {/* Photo placeholder */}
          <View style={styles.photoPlaceholder}>
            {PROFILE.avatar ? (
              <Image source={{ uri: PROFILE.avatar }} style={styles.photoImage} />
            ) : (
              <Text style={styles.photoEmoji}>👤</Text>
            )}
          </View>

          {/* Top overlay: back + more */}
          <View style={styles.photoTopRow}>
            <TouchableOpacity style={styles.overlayBtn} onPress={() => navigation?.goBack()}>
              <Text style={styles.overlayBtnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overlayBtn}>
              <Text style={styles.overlayBtnText}>•••</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom overlay: photo counter + action icons */}
          <View style={styles.photoBottomRow}>
            <Text style={styles.photoCounter}>
              {currentPhoto + 1}/{PROFILE.photoCount}
            </Text>
            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoActionBtn}
                onPress={() => setLiked(!liked)}>
                <Svg width={20} height={20} viewBox="0 0 24 24">
                  <Path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    fill={liked ? '#E53935' : 'none'}
                    stroke={liked ? '#E53935' : '#555'}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoActionBtn}>
                <Text style={styles.photoActionEmoji}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoActionBtn}>
                <Text style={styles.photoActionEmoji}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Profile Info ── */}
        <View style={styles.infoSection}>

          {/* Name + Verified */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>{PROFILE.name}</Text>
            <View style={styles.verifiedBadge}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Circle cx={12} cy={12} r={10} fill="#4CAF50" />
                <Path
                  d="M9 12l2 2 4-4"
                  fill="none"
                  stroke="#fff"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
          </View>
          {/* Age, City */}
          <Text style={styles.infoLine}>{PROFILE.age}, {PROFILE.city}</Text>

          {/* Education */}
          <Text style={styles.infoLine}>{PROFILE.edu}</Text>

          {/* Caste */}
          <Text style={styles.infoLineMuted}>{PROFILE.caste}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* About Me */}
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.aboutText}>{PROFILE.about}</Text>

          {/* Divider */}
          <View style={styles.divider} />
          {/* Profile Details */}
          {DETAILS.map(group => (
            <View key={group.group} style={styles.detailGroup}>
              <Text style={styles.detailGroupTitle}>{group.group}</Text>
              {group.fields.map(([label, value], i) => (
                <View
                  key={label}
                  style={[
                    styles.detailRow,
                    i < group.fields.length - 1 && styles.detailRowBorder,
                  ]}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
      {/* ── Bottom Action Bar ── */}
      <View style={styles.actionBar}>

        {/* Shortlist */}
        <TouchableOpacity
          style={styles.shortlistBtn}
          onPress={() => setShortlisted(!shortlisted)}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={shortlisted ? '#FFC107' : 'none'}
              stroke={shortlisted ? '#FFC107' : '#888'}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={styles.shortlistText}>Shortlist</Text>
        </TouchableOpacity>

        {/* Message */}
        <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
          <Text style={styles.messageBtnText}>💬  Message</Text>
        </TouchableOpacity>

        {/* Interest */}
        <TouchableOpacity style={styles.interestBtn}>
          <Svg width={18} height={18} viewBox="0 0 24 24" style={{ marginRight: 4 }}>
            <Path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="#fff"
              stroke="#fff"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </Svg>
          <Text style={styles.interestBtnText}>Interest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ── Photo
  photoSection: {
    width: width,
    height: width * 1.1,
    backgroundColor: '#F5D6D6',
    position: 'relative',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoEmoji: {
    fontSize: 160,
  },
  photoTopRow: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  overlayBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  overlayBtnText: {
    color: '#fff', fontSize: 16, fontWeight: '700',
  },
  photoBottomRow: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoCounter: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  photoActionBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, shadowRadius: 3,
    elevation: 3,
  },
  photoActionEmoji: { fontSize: 17 },

  // ── Info
  infoSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    marginTop: 1,
  },
  infoLine: {
    fontSize: 15,
    color: '#444444',
    marginBottom: 4,
    fontWeight: '400',
  },
  infoLineMuted: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },

  // ── About
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 24,
  },

  // ── Detail groups
  detailGroup: {
    marginBottom: 20,
  },
  detailGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999999',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '400',
  },
  detailValue: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '600',
  },

  // ── Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#EEEEEE',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 6,
    elevation: 10,
  },
  shortlistBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 14,
    paddingVertical: 10,
    gap: 3,
    backgroundColor: '#FAFAFA',
  },
  shortlistText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555555',
  },
  messageBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA000',
    borderRadius: 14,
    paddingVertical: 13,
    shadowColor: '#FFA000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6,
    elevation: 4,
  },
  messageBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  interestBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CC0000',
    borderRadius: 14,
    paddingVertical: 13,
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 6,
    elevation: 4,
  },
  interestBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProfileDetailScreen;
