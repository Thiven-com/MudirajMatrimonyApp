/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const RECOMMENDED = [
  {
    id: '1',
    name: 'Rakesh Mudiraj',
    age: 28,
    city: 'Hyderabad',
    edu: 'B.Com, Business',
    caste: 'Mudiraj, Hindu',
    isNew: true,
  },
  {
    id: '2',
    name: 'Suresh Mudiraj',
    age: 30,
    city: 'Vijayawada',
    edu: 'B.Tech, Engineer',
    caste: 'Mudiraj, Hindu',
    isNew: false,
  },
];

const QUICK_LINKS = [
  { icon: '❤️', label: 'Matches' },
  { icon: '🔍', label: 'Search' },
  { icon: '👁️', label: 'Visitors' },
  { icon: '⭐', label: 'Shortlisted' },
];

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#cc0000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>Mudiraj World</Text>
          <Text style={styles.headerSub}>Matrimony</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Premium Banner */}
        <View style={styles.premiumBanner}>
          <View style={styles.premiumLeft}>
            <Text style={styles.premiumTitle}>Premium Membership</Text>
            <Text style={styles.premiumDesc}>Get more visibility{'\n'}and better matches</Text>
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => navigation.navigate('Premium')}>
              <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          {QUICK_LINKS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickItem}
              onPress={() => {
                if (item.label === 'Matches') navigation.navigate('Matches');
                if (item.label === 'Search') navigation.navigate('Search');
if(item.label === 'Visitors') navigation.navigate('Visitors');
if(item.label === 'Shortlisted') navigation.navigate('Shortlisted');
              }}>
              <View style={styles.quickIcon}>
                <Text style={styles.quickEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended Matches</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {RECOMMENDED.map(profile => (
            <TouchableOpacity
              key={profile.id}
              style={styles.profileCard}
              onPress={() => navigation.navigate('ProfileDetail', { profile })}
              activeOpacity={0.85}>
              {profile.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>New</Text>
                </View>
              )}
              <View style={styles.profileAvatar}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.verifiedIcon}>✅</Text>
                </View>
                <Text style={styles.profileDetail}>
                  {profile.age}, {profile.city}
                </Text>
                <Text style={styles.profileDetail}>{profile.edu}</Text>
                <Text style={styles.profileCaste}>{profile.caste}</Text>
              </View>
              <TouchableOpacity style={styles.heartBtn}>
                <Text style={styles.heartIcon}>🤍</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#CC0000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 46,
    paddingHorizontal: 20,
  },
  headerBrand: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#FFCCCC', fontSize: 13, fontWeight: '500' },
  bellBtn: { position: 'relative', padding: 4 },
  bellIcon: { fontSize: 22 },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    borderWidth: 1.5,
    borderColor: '#CC0000',
  },
  premiumBanner: {
    margin: 16,
    backgroundColor: '#8B0000',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
paddingBottom: 50,
paddingTop: 50,
marginBottom: 3,
  },
  premiumLeft: { flex: 1 },
  premiumTitle: { color: '#FFD700', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  premiumDesc: { color: '#FFCCCC', fontSize: 13, lineHeight: 20, marginBottom: 14 },
  upgradeBtn: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  upgradeBtnText: { color: '#8B0000', fontSize: 13, fontWeight: '800' },
  crownEmoji: { fontSize: 50, marginLeft: 10 },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 16,
  },
  quickItem: { alignItems: 'center', gap: 6 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickEmoji: { fontSize: 22 },
  quickLabel: { fontSize: 12, color: '#555555', fontWeight: '500' },
  section: { paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#222222' },
  viewAll: { fontSize: 13, color: '#CC0000', fontWeight: '600' },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#CC0000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 1,
  },
  newBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarEmoji: { fontSize: 36 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#222222' },
  verifiedIcon: { fontSize: 14 },
  profileDetail: { fontSize: 13, color: '#666666', marginBottom: 2 },
  profileCaste: { fontSize: 12, color: '#999999' },
  heartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: { fontSize: 16 },
});
export default HomeScreen;
