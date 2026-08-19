import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRoute } from '@react-navigation/native';
import useCustomBackHandler from '../navigation/useCustomBackHandler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RED = '#CC0000';

const PROFILES = [
  { id: '1', name: 'Swathi Mudiraj', age: 26, city: 'Vijayawada', edu: 'B.Tech, Software Engineer', caste: 'Mudiraj, Hindu', isOnline: true, isNew: true, isPremium: false },
  { id: '2', name: 'Keerthi Mudiraj', age: 24, city: 'Visakhapatnam', edu: 'M.Sc, Biotechnologist', caste: 'Mudiraj, Hindu', isOnline: false, isNew: false, isPremium: true },
  { id: '3', name: 'Sindhu Mudiraj', age: 27, city: 'Hyderabad', edu: 'MBA, HR Manager', caste: 'Mudiraj, Hindu', isOnline: true, isNew: false, isPremium: true },
  { id: '4', name: 'Pravallika Mudiraj', age: 25, city: 'Guntur', edu: 'B.Com, Accountant', caste: 'Mudiraj, Hindu', isOnline: false, isNew: true, isPremium: false },
  { id: '5', name: 'Likhitha Mudiraj', age: 23, city: 'Hyderabad', edu: 'B.Tech, Data Analyst', caste: 'Mudiraj, Hindu', isOnline: true, isNew: true, isPremium: false },
  { id: '6', name: 'Anitha Mudiraj', age: 28, city: 'Nellore', edu: 'M.Tech, Engineer', caste: 'Mudiraj, Hindu', isOnline: false, isNew: false, isPremium: true },
];

const TABS = ['All', 'New', 'Online', 'Premium'];
const CITY_OPTIONS = ['All Cities', 'Vijayawada', 'Visakhapatnam', 'Hyderabad', 'Guntur', 'Nellore'];

const DEFAULT_FILTERS = {
  minAge: '',
  maxAge: '',
  city: 'All Cities',
  onlineOnly: false,
};

const MatchesScreen = ({ navigation }) => {
  const route = useRoute();
  useCustomBackHandler(navigation, route);

  const [liked, setLiked] = useState([]);
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const activeFilterCount =
    (filters.minAge ? 1 : 0) +
    (filters.maxAge ? 1 : 0) +
    (filters.city !== 'All Cities' ? 1 : 0) +
    (filters.onlineOnly ? 1 : 0);

  const openFilters = () => {
    setDraftFilters(filters); // start editing from currently-applied filters
    setFilterVisible(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFilterVisible(false);
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
  };

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

  const toggleLike = (id) => {
    setLiked(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getFiltered = (tab) => {
    let result = PROFILES;

    if (tab === 'New') result = result.filter(p => p.isNew);
    else if (tab === 'Online') result = result.filter(p => p.isOnline);
    else if (tab === 'Premium') result = result.filter(p => p.isPremium);

    // Apply header filter modal criteria on top of the tab filter
    if (filters.minAge) result = result.filter(p => p.age >= parseInt(filters.minAge, 10));
    if (filters.maxAge) result = result.filter(p => p.age <= parseInt(filters.maxAge, 10));
    if (filters.city !== 'All Cities') result = result.filter(p => p.city === filters.city);
    if (filters.onlineOnly) result = result.filter(p => p.isOnline);

    return result;
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProfileDetail', { profile: item, page: 'Matches' })}
      activeOpacity={0.85}>

      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>👩</Text>
        </View>
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.verified}>✅</Text>
        </View>
        <Text style={styles.detail}>{item.age}, {item.city}</Text>
        <Text style={styles.detail}>{item.edu}</Text>
        <Text style={styles.caste}>{item.caste}</Text>
      </View>

      {/* Like Button */}
      <TouchableOpacity
        style={styles.likeBtn}
        onPress={() => toggleLike(item.id)}>
        <Text style={styles.likeIcon}>
          {liked.includes(item.id) ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#CC0000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity onPress={openFilters} style={styles.filterBtn}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 5h16l-6 8v5l-4-2v-3L4 5z"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </Svg>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs — labels are visual only; active state driven by swipe position.
          Tapping still works as a shortcut (jumps the pager), but the main
          navigation is via finger swipe on the content below. */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab, i) => {
          const opacity = scrollX.interpolate({
            inputRange: TABS.map((_, idx) => idx * SCREEN_WIDTH),
            outputRange: TABS.map((_, idx) => (idx === i ? 1 : 0.55)),
            extrapolate: 'clamp',
          });
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true })}>
              <Animated.Text style={[styles.tabText, { opacity }]}>
                {tab}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
        <Animated.View
          style={[styles.indicator, { width: indicatorWidth, transform: [{ translateX }] }]}
        />
      </View>

      {/* Swipeable pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.pager}>
        {TABS.map(tab => (
          <View key={tab} style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <FlatList
              data={getFiltered(tab)}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={renderCard}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No profiles match your filters.</Text>
              }
            />
          </View>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Matches</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Age Range */}
              <Text style={styles.filterLabel}>Age Range</Text>
              <View style={styles.ageRow}>
                <TextInput
                  style={styles.ageInput}
                  placeholder="Min"
                  placeholderTextColor="#BBBBBB"
                  keyboardType="number-pad"
                  value={draftFilters.minAge}
                  onChangeText={(v) => setDraftFilters(prev => ({ ...prev, minAge: v }))}
                />
                <Text style={styles.ageSeparator}>—</Text>
                <TextInput
                  style={styles.ageInput}
                  placeholder="Max"
                  placeholderTextColor="#BBBBBB"
                  keyboardType="number-pad"
                  value={draftFilters.maxAge}
                  onChangeText={(v) => setDraftFilters(prev => ({ ...prev, maxAge: v }))}
                />
              </View>

              {/* City */}
              <Text style={styles.filterLabel}>City</Text>
              <View style={styles.chipRow}>
                {CITY_OPTIONS.map(city => (
                  <TouchableOpacity
                    key={city}
                    style={[styles.chip, draftFilters.city === city && styles.chipActive]}
                    onPress={() => setDraftFilters(prev => ({ ...prev, city }))}>
                    <Text style={[styles.chipText, draftFilters.city === city && styles.chipTextActive]}>
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Online only toggle */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setDraftFilters(prev => ({ ...prev, onlineOnly: !prev.onlineOnly }))}>
                <Text style={styles.filterLabel}>Show online profiles only</Text>
                <View style={[styles.toggle, draftFilters.onlineOnly && styles.toggleOn]}>
                  <View style={[styles.toggleKnob, draftFilters.onlineOnly && styles.toggleKnobOn]} />
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                <Text style={styles.resetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  backArrow: { color: '#FFFFFF', fontSize: 22, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  filterBtn: { position: 'relative', padding: 2 },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '800', color: '#8B6914' },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    position: 'relative',
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  tabText: { fontSize: 14, color: '#CC0000', fontWeight: '600' },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2.5,
    backgroundColor: '#CC0000',
    borderRadius: 2,
  },
  pager: { flex: 1 },
  list: { padding: 16, gap: 12 },
  emptyText: { textAlign: 'center', color: '#999999', marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 12,
  },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#FFE4E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 34 },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00CC44',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  info: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#222222' },
  verified: { fontSize: 14 },
  detail: { fontSize: 13, color: '#666666', marginBottom: 2 },
  caste: { fontSize: 12, color: '#999999' },
  likeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: { fontSize: 16 },

  // Filter modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#222222' },
  modalClose: { fontSize: 18, color: '#999999', padding: 4 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#444444', marginBottom: 10, marginTop: 14 },
  ageRow: { flexDirection: 'row', alignItems: 'center' },
  ageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222222',
    backgroundColor: '#FAFAFA',
  },
  ageSeparator: { marginHorizontal: 10, color: '#999999', fontSize: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
  },
  chipActive: { backgroundColor: RED, borderColor: RED },
  chipText: { fontSize: 13, color: '#666666', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E5E5',
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: RED },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobOn: { transform: [{ translateX: 18 }] },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: '#666666' },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 26,
    backgroundColor: RED,
    alignItems: 'center',
  },
  applyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default MatchesScreen;