/* eslint-disable curly */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const MAX_PHOTOS = 6;

const SAMPLE_PHOTOS = [
  { id: '1', uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200', isPrimary: true },
  { id: '2', uri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', isPrimary: false },
  { id: '3', uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', isPrimary: false },
  { id: '4', uri: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', isPrimary: false },
];

// Red is the brand color — used for the header, primary badge, and CTA.
const COLORS = {
  red:          '#cc0000',
  redDark:      '#9e0000',
  white:        '#ffffff',
  text:         '#0a0a0a',
  textMuted:    '#737373',
  border:       '#e5e5e5',
  surfaceMuted: '#f5f5f5',
  dark:         '#171717',
  light:        '#fafafa',
};

export default function ManagePhotosScreen({ navigation }) {
  const [photos, setPhotos] = useState(SAMPLE_PHOTOS);
  const [saving, setSaving] = useState(false);

  const primaryPhoto    = photos.find(p => p.isPrimary);
  const secondaryPhotos = photos.filter(p => !p.isPrimary);

  const handleDelete = (id) => {
    Alert.alert('Remove photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setPhotos(prev => {
            const next = prev.filter(p => p.id !== id);
            if (next.length && !next.some(p => p.isPrimary)) {
              next[0] = { ...next[0], isPrimary: true };
            }
            return next;
          });
        },
      },
    ]);
  };

  const handleAddPhoto = () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit reached', `You can upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Could not open photo library.');
          return;
        }
        const asset = response.assets?.[0];
        if (!asset?.uri) return;

        const newPhoto = {
          id: Date.now().toString(),
          uri: asset.uri,
          isPrimary: photos.length === 0,
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
    );
  };

  const handleSave = () => {
    setSaving(true);
    // Replace with your actual upload/save API call.
    setTimeout(() => {
      setSaving(false);
      Alert.alert('Saved', 'Your photos have been updated.');
    }, 600);
  };

  // Lay remaining photos + an "add" slot out two-per-row
  const gridItems = [
    ...secondaryPhotos,
    ...(photos.length < MAX_PHOTOS ? [{ id: '__add__' }] : []),
  ];
  const rows = [];
  for (let i = 0; i < gridItems.length; i += 2) {
    rows.push(gridItems.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.red} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerLabel}>
          <Text style={styles.headerLabelIcon}>🖼️</Text>
          <Text style={styles.headerLabelText}>Manage Photos</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Your Photos</Text>
            <Text style={styles.subtitle}>
              Profiles with photos get more interests. Add up to {MAX_PHOTOS} clear photos of yourself.
            </Text>
          </View>
          <Text style={styles.counter}>{photos.length} of {MAX_PHOTOS}</Text>
        </View>

        {/* Photo grid */}
        <View style={styles.grid}>
          {primaryPhoto && (
            <View style={styles.primaryCard}>
              <Image source={{ uri: primaryPhoto.uri }} style={styles.primaryImage} />
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeStar}>⭐</Text>
                <Text style={styles.primaryBadgeText}>Primary</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtnLg}
                onPress={() => handleDelete(primaryPhoto.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.deleteIcon}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}

          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {row.map(item =>
                item.id === '__add__' ? (
                  <TouchableOpacity key="add" style={styles.addSlot} onPress={handleAddPhoto} activeOpacity={0.7}>
                    <View style={styles.addSlotIcon}>
                      <Text style={styles.addSlotPlus}>+</Text>
                    </View>
                    <Text style={styles.addSlotLabel}>Add Photo</Text>
                  </TouchableOpacity>
                ) : (
                  <View key={item.id} style={styles.photoCard}>
                    <Image source={{ uri: item.uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.deleteBtnSm}
                      onPress={() => handleDelete(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteIcon}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                )
              )}
            </View>
          ))}
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesIcon}>
            <Text style={styles.guidelinesIconText}>🛡️</Text>
          </View>
          <View style={styles.guidelinesContent}>
            <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>
            <View style={styles.guidelinesList}>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineCheck}>✓</Text>
                <Text style={styles.guidelineText}>Use recent, clear face photos</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineCheck}>✓</Text>
                <Text style={styles.guidelineText}>Avoid group or blurry images</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnIcon}>{saving ? '…' : '⬆'}</Text>
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.red,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: COLORS.white, fontWeight: '600' },
  headerLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerLabelIcon: { fontSize: 14 },
  headerLabelText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSpacer: { width: 36 },

  body: { paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 40 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  titleBlock: { gap: 8, flex: 1 },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '600', letterSpacing: -0.4, color: COLORS.text },
  subtitle: { fontSize: 14, lineHeight: 24, color: COLORS.textMuted, maxWidth: 220 },
  counter: { fontSize: 14, lineHeight: 20, color: COLORS.red, fontWeight: '700', paddingTop: 4 },

  grid: { marginTop: 24, gap: 16 },

  primaryCard: { position: 'relative', borderRadius: 24, overflow: 'hidden' },
  primaryImage: { width: '100%', height: 224, resizeMode: 'cover' },
  primaryBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.red,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  primaryBadgeStar: { fontSize: 12, color: COLORS.white },
  primaryBadgeText: { fontSize: 12, lineHeight: 16, fontWeight: '600', color: COLORS.white },
  deleteBtnLg: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  deleteIcon: { fontSize: 14, color: COLORS.text },

  gridRow: { flexDirection: 'row', gap: 16 },
  photoCard: { width: '48%', position: 'relative', borderRadius: 24, overflow: 'hidden' },
  photoImage: { width: '100%', height: 160, resizeMode: 'cover' },
  deleteBtnSm: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  addSlot: {
    width: '48%',
    height: 160,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.red,
    backgroundColor: 'rgba(204,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  addSlotIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSlotPlus: { fontSize: 24, color: COLORS.white, lineHeight: 26 },
  addSlotLabel: { fontSize: 14, lineHeight: 20, fontWeight: '500', color: COLORS.red },

  guidelinesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 24,
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  guidelinesIcon: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidelinesIconText: { fontSize: 14 },
  guidelinesContent: { flex: 1, gap: 12 },
  guidelinesTitle: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: COLORS.text },
  guidelinesList: { gap: 8 },
  guidelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  guidelineCheck: { fontSize: 14, lineHeight: 20, color: COLORS.red, marginTop: 1, fontWeight: '700' },
  guidelineText: { flex: 1, fontSize: 14, lineHeight: 20, color: COLORS.textMuted },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    height: 56,
    borderRadius: 999,
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnIcon: { fontSize: 16, color: COLORS.white },
  saveBtnText: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: COLORS.white },
});
