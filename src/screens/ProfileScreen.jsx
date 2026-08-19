/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

const ProfileScreen = ({ navigation }) => {
  const MENU_ITEMS = [
    {  label: 'Edit Profile', screen: 'EditProfile' },
    {  label: 'Manage Photos', screen: 'ManagePhotos' },
    { icon: '🔔', label: 'Notifications', screen: '' },
    { icon: '🔒', label: 'Privacy Settings', screen: '' },
    { icon: '👑', label: 'Premium Membership', screen: 'Premium' },
    { icon: '❓', label: 'Help & Support', screen: '' },
    { icon: '⭐', label: 'Rate the App', screen: '' },
    { icon: '📤', label: 'Share App', screen: '' },
    { icon: '🚪', label: 'Logout', screen: 'Login' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#CC0000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity>
           {/*<Text style={styles.editIcon}></Text>*/}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Text style={styles.cameraIcon}>📷</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>Your Name</Text>
          <Text style={styles.profileId}>ID: MWM123456</Text>

          {/* Profile Completion */}
          <View style={styles.completionSection}>
            <View style={styles.completionRow}>
              <Text style={styles.completionLabel}>Profile Completion</Text>
              <Text style={styles.completionPercent}>65%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '65%' }]} />
            </View>
            <Text style={styles.completionHint}>Complete your profile to get better matches</Text>
          </View>

          {/* Premium Badge */}
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => navigation.navigate('Premium')}>
            <Text style={styles.premiumText}>👑 Upgrade to Premium for better visibility</Text>
            <Text style={styles.premiumArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Profile Views', value: '124' },
            { label: 'Interests', value: '8' },
            { label: 'Shortlisted', value: '12' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statItem, i < 2 && styles.statBorder]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, index === MENU_ITEMS.length - 1 && styles.lastMenuItem]}
              onPress={() => {
                if (item.screen === 'Login') {
                  navigation.replace('Login');
                } else if (item.screen) {
                  navigation.navigate(item.screen);
                }
              }}
              activeOpacity={0.7}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, item.label === 'Logout' && styles.logoutText]}>
                {item.label}
              </Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Mudiraj World Matrimony v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  avatarSection: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFE4E4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#CC0000',
  },
  avatarEmoji: { fontSize: 48 },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CC0000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIcon: { fontSize: 14 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#222222', marginBottom: 2 },
  profileId: { fontSize: 13, color: '#999999', marginBottom: 16 },
  completionSection: { width: '100%', marginBottom: 16 },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  completionLabel: { fontSize: 13, color: '#666666' },
  completionPercent: { fontSize: 13, fontWeight: '700', color: '#CC0000' },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#CC0000',
    borderRadius: 4,
  },
  completionHint: { fontSize: 12, color: '#AAAAAA', textAlign: 'center' },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
  },
  premiumText: { fontSize: 13, color: '#8B6914', fontWeight: '600', flex: 1 },
  premiumArrow: { fontSize: 18, color: '#8B6914', fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderColor: '#EEEEEE' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#CC0000', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#888888', textAlign: 'center' },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
  },
  lastMenuItem: { borderBottomWidth: 0 },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#333333', fontWeight: '500' },
  logoutText: { color: '#CC0000' },
  menuArrow: { fontSize: 18, color: '#CCCCCC' },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#BBBBBB',
    marginTop: 20,
  },
});
export default ProfileScreen;