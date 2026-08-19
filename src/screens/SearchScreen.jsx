/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { ROUTES } from '../navigation/routes';

const SearchScreen = ({ navigation }) => {
  const [minAge, setMinAge] = useState('21');
  const [maxAge, setMaxAge] = useState('35');
  const [minHeight, setMinHeight] = useState('4.5 ft');
  const [maxHeight, setMaxHeight] = useState('6.5 ft');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [motherTongue, setMotherTongue] = useState('');
  const [caste, setCaste] = useState('Mudiraj');
  const [location, setLocation] = useState('');

  // Advanced fields (hidden by default, revealed via header menu)
  const [profession, setProfession] = useState('');
  const [income, setIncome] = useState('');
  const [diet, setDiet] = useState('');
  const [manglik, setManglik] = useState('');

  const [searchText, setSearchText] = useState('');

  const handleShowMatches = () => {
    const filters = {
      searchText: searchText.trim(),
      minAge: Number(minAge) || null,
      maxAge: Number(maxAge) || null,
      maritalStatus,
      motherTongue,
      caste,
      location,
      profession,
      income,
      diet,
      manglik,
    };
    navigation.navigate(ROUTES.MAIN_TABS, {
      screen: ROUTES.MATCHES,
      params: { filters },
    });
  };

  const MARITAL_OPTIONS = ['Never Married', 'Divorced', 'Widowed'];
  const TONGUE_OPTIONS = ['Telugu', 'Hindi', 'Tamil', 'Kannada'];
  const LOCATION_OPTIONS = ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Guntur'];
  const PROFESSION_OPTIONS = ['Software Engineer', 'Doctor', 'Teacher', 'Business', 'Government Employee'];
  const INCOME_OPTIONS = ['Any', '0–3 LPA', '3–6 LPA', '6–10 LPA', '10+ LPA'];
  const DIET_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian'];
  const MANGLIK_OPTIONS = ['Yes', 'No', "Doesn't Matter"];

  const [showMarital, setShowMarital] = useState(false);
  const [showTongue, setShowTongue] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showProfession, setShowProfession] = useState(false);
  const [showIncome, setShowIncome] = useState(false);
  const [showDiet, setShowDiet] = useState(false);
  const [showManglik, setShowManglik] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [advancedVisible, setAdvancedVisible] = useState(false);

  const handleResetAll = () => {
    setMenuVisible(false);
    setMinAge('21');
    setMaxAge('35');
    setMinHeight('4.5 ft');
    setMaxHeight('6.5 ft');
    setMaritalStatus('');
    setMotherTongue('');
    setLocation('');
    setProfession('');
    setIncome('');
    setDiet('');
    setManglik('');
  };

  const handleSaveSearch = () => {
    setMenuVisible(false);
    Alert.alert('Search Saved', "We'll notify you when new matches fit these filters.");
  };

  const handleSavedSearches = () => {
    setMenuVisible(false);
    // TODO: navigate to a Saved Searches screen once it exists
    navigation?.navigate?.('SavedSearches');
  };

  const handleAdvancedFilters = () => {
    setMenuVisible(false);
    setAdvancedVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#cc0000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 5h16l-6 8v5l-4-2v-3L4 5z"
              stroke="#FFFFFF"
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Header Filter Menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity style={styles.menuItem} onPress={handleAdvancedFilters}>
              <Text style={styles.menuItemText}>Advanced Filters</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleSaveSearch}>
              <Text style={styles.menuItemText}>Save This Search</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleSavedSearches}>
              <Text style={styles.menuItemText}>Saved Searches</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleResetAll}>
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Svg width={18} height={18} viewBox="0 0 22 22" fill="none">
          <Circle cx="9.5" cy="9.5" r="6" stroke="#666" strokeWidth="1.8" />
          <Line x1="14.2" y1="14.2" x2="19" y2="19" stroke="#666" strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, education, profession..."
          placeholderTextColor="#AAAAAA"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Text style={styles.sectionTitle}>Basic Details</Text>

        {/* Age */}
        <Text style={styles.fieldLabel}>Age</Text>
        <View style={styles.rangeRow}>
          <View style={styles.rangeBox}>
            <TextInput
              style={styles.rangeInput}
              value={minAge}
              onChangeText={setMinAge}
              keyboardType="numeric"
            />
            <Text style={styles.dropArrow}>▾</Text>
          </View>
          <Text style={styles.rangeDash}>–</Text>
          <View style={styles.rangeBox}>
            <TextInput
              style={styles.rangeInput}
              value={maxAge}
              onChangeText={setMaxAge}
              keyboardType="numeric"
            />
            <Text style={styles.dropArrow}>▾</Text>
          </View>
        </View>

        {/* Height */}
        <Text style={styles.fieldLabel}>Height</Text>
        <View style={styles.rangeRow}>
          <View style={styles.rangeBox}>
            <TextInput
              style={styles.rangeInput}
              value={minHeight}
              onChangeText={setMinHeight}
            />
            <Text style={styles.dropArrow}>▾</Text>
          </View>
          <Text style={styles.rangeDash}>–</Text>
          <View style={styles.rangeBox}>
            <TextInput
              style={styles.rangeInput}
              value={maxHeight}
              onChangeText={setMaxHeight}
            />
            <Text style={styles.dropArrow}>▾</Text>
          </View>
        </View>

        {/* Marital Status */}
        <Text style={styles.fieldLabel}>Marital Status</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowMarital(!showMarital)}>
          <Text style={maritalStatus ? styles.dropValue : styles.dropPlaceholder}>
            {maritalStatus || 'Select'}
          </Text>
          <Text style={styles.dropArrow}>▾</Text>
        </TouchableOpacity>
        {showMarital && (
          <View style={styles.dropdownMenu}>
            {MARITAL_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => { setMaritalStatus(opt); setShowMarital(false); }}>
                <Text style={styles.dropdownItemText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mother Tongue */}
        <Text style={styles.fieldLabel}>Mother Tongue</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowTongue(!showTongue)}>
          <Text style={motherTongue ? styles.dropValue : styles.dropPlaceholder}>
            {motherTongue || 'Select'}
          </Text>
          <Text style={styles.dropArrow}>▾</Text>
        </TouchableOpacity>
        {showTongue && (
          <View style={styles.dropdownMenu}>
            {TONGUE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => { setMotherTongue(opt); setShowTongue(false); }}>
                <Text style={styles.dropdownItemText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Caste */}
        <Text style={styles.fieldLabel}>Caste / Community</Text>
        <View style={styles.dropdown}>
          <Text style={styles.dropValue}>{caste}</Text>
          <Text style={styles.dropArrow}>▾</Text>
        </View>

        {/* Location */}
        <Text style={styles.fieldLabel}>Location</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowLocation(!showLocation)}>
          <Text style={location ? styles.dropValue : styles.dropPlaceholder}>
            {location || 'Select'}
          </Text>
          <Text style={styles.dropArrow}>▾</Text>
        </TouchableOpacity>
        {showLocation && (
          <View style={styles.dropdownMenu}>
            {LOCATION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => { setLocation(opt); setShowLocation(false); }}>
                <Text style={styles.dropdownItemText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Advanced Filters — revealed via header menu */}
        {advancedVisible && (
          <>
            <View style={styles.advancedDivider} />
            <View style={styles.advancedHeaderRow}>
              <Text style={styles.sectionTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setAdvancedVisible(false)}>
                <Text style={styles.advancedHide}>Hide</Text>
              </TouchableOpacity>
            </View>

            {/* Profession */}
            <Text style={styles.fieldLabel}>Profession</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowProfession(!showProfession)}>
              <Text style={profession ? styles.dropValue : styles.dropPlaceholder}>
                {profession || 'Select'}
              </Text>
              <Text style={styles.dropArrow}>▾</Text>
            </TouchableOpacity>
            {showProfession && (
              <View style={styles.dropdownMenu}>
                {PROFESSION_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => { setProfession(opt); setShowProfession(false); }}>
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Annual Income */}
            <Text style={styles.fieldLabel}>Annual Income</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowIncome(!showIncome)}>
              <Text style={income ? styles.dropValue : styles.dropPlaceholder}>
                {income || 'Select'}
              </Text>
              <Text style={styles.dropArrow}>▾</Text>
            </TouchableOpacity>
            {showIncome && (
              <View style={styles.dropdownMenu}>
                {INCOME_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => { setIncome(opt); setShowIncome(false); }}>
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Diet */}
            <Text style={styles.fieldLabel}>Diet</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDiet(!showDiet)}>
              <Text style={diet ? styles.dropValue : styles.dropPlaceholder}>
                {diet || 'Select'}
              </Text>
              <Text style={styles.dropArrow}>▾</Text>
            </TouchableOpacity>
            {showDiet && (
              <View style={styles.dropdownMenu}>
                {DIET_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => { setDiet(opt); setShowDiet(false); }}>
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Manglik */}
            <Text style={styles.fieldLabel}>Manglik</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowManglik(!showManglik)}>
              <Text style={manglik ? styles.dropValue : styles.dropPlaceholder}>
                {manglik || 'Select'}
              </Text>
              <Text style={styles.dropArrow}>▾</Text>
            </TouchableOpacity>
            {showManglik && (
              <View style={styles.dropdownMenu}>
                {MANGLIK_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => { setManglik(opt); setShowManglik(false); }}>
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        <View style={{ height: 24 }} />

        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleShowMatches}
          activeOpacity={0.85}>
          <Text style={styles.searchBtnText}>Show Matches </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetAll}>
          <Text style={styles.resetText}>Reset Filters</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#cc0000',
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  backArrow: { fontSize: 22, color: '#ffffff', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  filterIcon: { fontSize: 20 },

  // Header menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  menuBox: {
    position: 'absolute',
    top: 92,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 190,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuItem: { paddingVertical: 12, paddingHorizontal: 16 },
  menuItemText: { fontSize: 14.5, fontWeight: '600', color: '#222222' },
  menuItemDanger: { color: '#CC0000' },
  menuDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 8 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#333333' },
  scroll: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222222', marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#444444', marginBottom: 8, marginTop: 16 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rangeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  rangeInput: { flex: 1, fontSize: 15, color: '#333333' },
  rangeDash: { fontSize: 16, color: '#999999', fontWeight: '500' },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FAFAFA',
  },
  dropPlaceholder: { fontSize: 15, color: '#AAAAAA' },
  dropValue: { fontSize: 15, color: '#333333' },
  dropArrow: { fontSize: 14, color: '#999999' },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: { fontSize: 14, color: '#333333' },

  // Advanced filters section
  advancedDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 24,
    marginBottom: 20,
  },
  advancedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advancedHide: { fontSize: 13, fontWeight: '700', color: '#CC0000', marginBottom: 16 },

  searchBtn: {
    backgroundColor: '#CC0000',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resetBtn: { alignItems: 'center', paddingVertical: 12 },
  resetText: { color: '#CC0000', fontSize: 14, fontWeight: '600' },
});

export default SearchScreen;