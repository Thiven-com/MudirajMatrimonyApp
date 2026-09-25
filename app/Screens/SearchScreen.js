import { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";

// NOTE: adjust this path to wherever your Fonts file lives.
import Fonts from "../constants/Fonts";

import { postMemberListing } from "../utils/Functions";

/* ======
   LOGO
====== */

const LOGO = require("../assets/images/logo.png");

/* ======
   COLORS
====== */

const COLORS = {
  red: "#B5120D",
  darkRed: "#991A16",
  orange: "#F2A400",
  gold: "#F4B000",

  background: "#FBF9F6",
  white: "#FFFFFF",

  text: "#282423",
  secondary: "#615B57",

  border: "#E9E1DA",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* ======
   GET TOKEN (same pattern as matches/home/profile screens)
====== */

const getToken = async () => {
  try {
    const authToken = await AsyncStorage.getItem("authToken");
    if (authToken) return authToken;

    const userdata = await AsyncStorage.getItem("userdata");
    if (userdata) {
      try {
        const parsed = JSON.parse(userdata);
        const token =
          parsed?.data?.token || parsed?.token || parsed?.access_token || null;
        if (token) return token;
      } catch (error) {
        console.log("getToken userdata parse error:", error);
      }
    }

    const fallbackKeys = ["token", "access_token", "userToken", "auth_token"];
    for (const key of fallbackKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) return value;
    }

    return null;
  } catch (error) {
    console.log("getToken Error:", error);
    return null;
  }
};

/* ======
   FILTERS -> API BODY FOR POST /api/member/member-listing

   Confirmed real request body:
   {
     age_from, age_to, member_code, marital_status, religion_id,
     caste_id, sub_caste_id, mother_tongue, profession,
     country_id, state_id, city_id, min_height, max_height,
     member_type
   }

   *** ASSUMPTION WARNING ***
   marital_status, religion_id, caste_id, country_id, state_id,
   city_id, and member_type are numeric IDs on the backend, but
   this screen only offers plain display strings ("Never
   Married", "Hindu - Mudhiraj", "India", ...) with no real
   taxonomy/lookup API wired up. ID_MAPS below is a BEST-GUESS
   table built from this screen's own hardcoded option lists —
   it is NOT verified against your actual database. Please check
   these ids against your backend and correct any that are wrong.

   NOTE: this same mapping logic also lives in matches.js (which
   re-derives filters from route params so it can refetch on its
   own). Consider moving both copies into a shared
   utils/buildMemberFilters.js so they can't drift apart.
====== */

const ID_MAPS = {
  maritalStatus: {
    "Never Married": 1,
    Divorced: 2,
    Widowed: 3,
  },

  religion: {
    "Hindu - Mudhiraj": 1,
    Hindu: 2,
  },

  caste: {
    Mudhiraj: 2,
    Other: 3,
  },

  country: {
    India: 1,
    USA: 2,
    "United Kingdom": 3,
    Australia: 4,
    Canada: 5,
  },

  // This screen's "location" is a single city+state string with no
  // separate state selector, but the API wants state_id AND city_id
  // separately.
  location: {
    "Hyderabad, Telangana": { state_id: 1, city_id: 1 },
    "Warangal, Telangana": { state_id: 1, city_id: 2 },
    "Vijayawada, Andhra Pradesh": { state_id: 2, city_id: 3 },
    "Bengaluru, Karnataka": { state_id: 3, city_id: 4 },
  },

  // No confirmed source field for member_type on this screen yet —
  // guessing it corresponds to "Looking For" (Bride/Groom). Verify
  // against backend; could instead mean membership tier.
  lookingFor: {
    Bride: 1,
    Groom: 2,
  },
};

// "5'3\" - 5'5\"" -> { min_height: 5.3, max_height: 5.5 }
function parseHeightRange(heightLabel) {
  if (!heightLabel || typeof heightLabel !== "string") return {};

  const pairs = [...heightLabel.matchAll(/(\d+)'(\d+)"/g)].map(
    ([, feet, inches]) => Number(`${feet}.${inches}`),
  );

  if (pairs.length === 0) return {};

  const result = { min_height: pairs[0] };
  if (pairs.length > 1) result.max_height = pairs[1];
  return result;
}

// "24 - 30 yrs" -> { age_from: 24, age_to: 30 }
function parseAgeRange(ageLabel) {
  if (!ageLabel || typeof ageLabel !== "string") return {};

  const numbers = ageLabel.match(/\d+/g);
  if (!numbers || numbers.length === 0) return {};

  const age_from = Number(numbers[0]);
  const age_to = numbers.length > 1 ? Number(numbers[1]) : undefined;

  return {
    ...(Number.isFinite(age_from) ? { age_from } : {}),
    ...(Number.isFinite(age_to) ? { age_to } : {}),
  };
}

function buildFiltersFromState(filters) {
  const isSet = (value) =>
    !!value && value !== "Select" && value !== "Select City";

  const body = {
    // Always present per the confirmed sample body, even when empty.
    member_code: "",
  };

  const { age_from, age_to } = parseAgeRange(filters.age);
  if (age_from !== undefined) body.age_from = age_from;
  if (age_to !== undefined) body.age_to = age_to;

  const { min_height, max_height } = parseHeightRange(filters.height);
  if (min_height !== undefined) body.min_height = min_height;
  if (max_height !== undefined) body.max_height = max_height;

  if (isSet(filters.maritalStatus)) {
    const id = ID_MAPS.maritalStatus[filters.maritalStatus];
    if (id !== undefined) body.marital_status = id;
  }

  if (isSet(filters.religion)) {
    const id = ID_MAPS.religion[filters.religion];
    if (id !== undefined) body.religion_id = id;
  }

  if (isSet(filters.caste)) {
    const id = ID_MAPS.caste[filters.caste];
    if (id !== undefined) body.caste_id = id;
  }

  if (isSet(filters.motherTongue)) {
    body.mother_tongue = filters.motherTongue;
  }

  if (isSet(filters.profession)) {
    body.profession = filters.profession;
  }

  if (isSet(filters.country)) {
    const id = ID_MAPS.country[filters.country];
    if (id !== undefined) body.country_id = id;
  }

  if (isSet(filters.location)) {
    const ids = ID_MAPS.location[filters.location];
    if (ids) {
      body.state_id = ids.state_id;
      body.city_id = ids.city_id;
    }
  }

  if (isSet(filters.lookingFor)) {
    const id = ID_MAPS.lookingFor[filters.lookingFor];
    if (id !== undefined) body.member_type = id;
  }

  // sub_caste_id: no corresponding filter exists on this screen yet.
  // education / income / gender: not present in the confirmed API
  // body, so intentionally not sent.

  return body;
}

/* ======
   MAIN SCREEN
====== */

export default function SearchScreen() {
  const navigation = useNavigation();

  const [showFilterModal, setShowFilterModal] = useState(false);

  const [activeField, setActiveField] = useState(null);

  const [filters, setFilters] = useState({
    lookingFor: "Select",
    gender: "Select",
    age: "18 - 60",
    height: "Select",
    maritalStatus: "Select",
    religion: "Hindu - Mudhiraj",
    motherTongue: "Select",
    caste: "Mudhiraj",
    education: "Select",
    profession: "Select",
    income: "Select",
    country: "Select",
    location: "Select City",
  });

  /* ======
     RECENT SEARCHES
  ====== */

  const [recentSearches, setRecentSearches] = useState([
    "Hyderabad, Telangana",
    "24 - 30 yrs",
    "Software Engineer",
    "Hindu - Mudhiraj",
  ]);

  const [searching, setSearching] = useState(false);
  const [searchApiError, setSearchApiError] = useState("");

  /* ======
     HARDWARE BACK BUTTON
     Same useFocusEffect + BackHandler pattern used on
     HomeScreen / MatchesScreen / ProfileDetails: active only
     while this screen is focused, cleaned up on blur/unmount.
  ====== */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  /* ======
     OPTIONS
  ====== */

  const OPTIONS = useMemo(
    () => ({
      lookingFor: ["Select", "Bride", "Groom"],

      gender: ["Select", "Male", "Female"],

      age: [
        "18 - 60",
        "18 - 25 yrs",
        "24 - 30 yrs",
        "28 - 35 yrs",
        "35 - 45 yrs",
        "45+ yrs",
      ],

      height: [
        "Select",
        `4'10" - 5'2"`,
        `5'3" - 5'5"`,
        `5'6" - 5'8"`,
        `5'9" - 6'0"`,
        `6'0"+`,
      ],

      maritalStatus: ["Select", "Never Married", "Divorced", "Widowed"],

      religion: ["Hindu - Mudhiraj", "Hindu"],

      motherTongue: [
        "Select",
        "Telugu",
        "Hindi",
        "English",
        "Tamil",
        "Kannada",
      ],

      caste: ["Mudhiraj", "Other"],

      education: ["Select", "B.Tech", "M.Tech", "MBA", "MBBS", "B.Sc", "M.Sc"],

      profession: [
        "Select",
        "Software Engineer",
        "Doctor",
        "Teacher",
        "Civil Engineer",
        "Business",
      ],

      income: [
        "Select",
        "Below ₹3 LPA",
        "₹3 - ₹5 LPA",
        "₹5 - ₹10 LPA",
        "₹10+ LPA",
      ],

      country: [
        "Select",
        "India",
        "USA",
        "United Kingdom",
        "Australia",
        "Canada",
      ],

      location: [
        "Select City",
        "Hyderabad, Telangana",
        "Warangal, Telangana",
        "Vijayawada, Andhra Pradesh",
        "Bengaluru, Karnataka",
      ],
    }),
    [],
  );

  /* ======
     FUNCTIONS
  ====== */

  const openFilter = (field) => {
    setActiveField(field);
    setShowFilterModal(true);
  };

  const selectOption = (value) => {
    if (!activeField) return;

    setFilters((previous) => ({
      ...previous,
      [activeField]: value,
    }));

    setShowFilterModal(false);
    setActiveField(null);
  };

  const resetAll = () => {
    setFilters({
      lookingFor: "Select",
      gender: "Select",
      age: "18 - 60",
      height: "Select",
      maritalStatus: "Select",
      religion: "Hindu - Mudhiraj",
      motherTongue: "Select",
      caste: "Mudhiraj",
      education: "Select",
      profession: "Select",
      income: "Select",
      country: "Select",
      location: "Select City",
    });
  };

  const removeRecentSearch = (item) => {
    setRecentSearches((previous) =>
      previous.filter((search) => search !== item),
    );
  };

  const viewMatches = async () => {
    if (searching) return;

    setSearching(true);
    setSearchApiError("");

    try {
      const token = await getToken();

      if (!token) {
        setSearchApiError(
          "Authentication token not found. Please login again.",
        );
        return;
      }

      const body = buildFiltersFromState(filters);
      console.log(
        "SearchScreen -> postMemberListing body:",
        JSON.stringify(body),
      );

      const result = await postMemberListing(body, token);
      console.log(
        "SearchScreen -> postMemberListing result:",
        JSON.stringify(result),
      );

      if (!(result?.success === 1 || result?.result === true)) {
        setSearchApiError(result?.message || "Unable to search matches.");
        return;
      }

      // Matches screen re-derives the same filter body from these nav
      // params (see buildFiltersFromParams there) and refetches on its
      // own, so the person can still adjust the active tab / search box
      // once they land on that screen.
      navigation.navigate("Matches", {
        lookingFor: filters.lookingFor,
        gender: filters.gender,
        age: filters.age,
        height: filters.height,
        maritalStatus: filters.maritalStatus,
        religion: filters.religion,
        motherTongue: filters.motherTongue,
        caste: filters.caste,
        education: filters.education,
        profession: filters.profession,
        income: filters.income,
        country: filters.country,
        location: filters.location,
      });
    } catch (e) {
      console.log("SearchScreen viewMatches Error:", e);
      setSearchApiError(e?.message || "Unable to search matches.");
    } finally {
      setSearching(false);
    }
  };

  /* ======
     FILTER BOX
  ====== */

  const FilterBox = ({
    field,
    title,
    value,
    icon,
    color = COLORS.orange,
    fullWidth = false,
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => openFilter(field)}
        style={[styles.filterBox, fullWidth && styles.fullWidthFilterBox]}
      >
        <View style={styles.filterLeft}>
          {/* ICON */}

          <View
            style={[
              styles.filterIconCircle,
              {
                backgroundColor: color === COLORS.red ? "#FFF6F4" : "#FFF9EA",
              },
            ]}
          >
            <Feather name={icon} size={15} color={color} />
          </View>

          {/* TEXT */}

          <View style={styles.filterTextContainer}>
            <Text numberOfLines={1} style={styles.filterTitle}>
              {title}
            </Text>

            <Text numberOfLines={1} style={styles.filterValue}>
              {value}
            </Text>
          </View>
        </View>

        <Feather name="chevron-down" size={14} color="#5D5652" />
      </TouchableOpacity>
    );
  };

  /* ======
     SCREEN
  ====== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =======
    TOP HERO SECTION
======= */}

        <View style={styles.heroBackground}>
          {/* BACK BUTTON */}

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={22} color="#B5120D" />
          </TouchableOpacity>

          {/* LOGO */}

          {/* TITLE */}

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Search</Text>

            <Text numberOfLines={1} style={styles.mainSubtitle}>
              Find your perfect match from Mudhiraj community
            </Text>
          </View>

          {/* CURVED ORANGE / RED DESIGN */}

          <View style={styles.curveArea}>
            <View style={styles.orangeCurve} />

            <View style={styles.redCurve} />
          </View>
        </View>

        {/* =======
    SEARCH FILTER CARD
======= */}

        <View style={[styles.filterCard, { marginTop: 11 }]}>
          {/* HEADING */}

          <Text style={styles.filtersHeading}>Search Filters</Text>

          {/* GOLD DIVIDER */}

          <View style={styles.headingDivider}>
            <View style={styles.dividerLine} />

            <View style={styles.dividerCenter} />

            <View style={styles.dividerLine} />
          </View>

          {/* FILTER GRID */}

          <View style={styles.filtersGrid}>
            <FilterBox
              field="lookingFor"
              title="Looking For"
              value={filters.lookingFor}
              icon="person-outline"
              color={COLORS.orange}
            />

            <FilterBox
              field="gender"
              title="Gender"
              value={filters.gender}
              icon="person"
              color={COLORS.red}
            />

            <FilterBox
              field="age"
              title="Age"
              value={filters.age}
              icon="calendar"
              color={COLORS.red}
            />

            <FilterBox
              field="height"
              title="Height"
              value={filters.height}
              icon="resize-outline"
              color={COLORS.orange}
            />

            <FilterBox
              field="maritalStatus"
              title="Marital Status"
              value={filters.maritalStatus}
              icon="people-outline"
              color={COLORS.orange}
            />

            <FilterBox
              field="religion"
              title="Religion"
              value={filters.religion}
              icon="globe"
              color={COLORS.red}
            />

            <FilterBox
              field="motherTongue"
              title="Mother Tongue"
              value={filters.motherTongue}
              icon="language-outline"
              color={COLORS.red}
            />

            <FilterBox
              field="caste"
              title="Caste"
              value={filters.caste}
              icon="people"
              color={COLORS.orange}
            />

            <FilterBox
              field="education"
              title="Education"
              value={filters.education}
              icon="school"
              color={COLORS.orange}
            />

            <FilterBox
              field="profession"
              title="Profession"
              value={filters.profession}
              icon="briefcase"
              color={COLORS.red}
            />

            <FilterBox
              field="income"
              title="Annual Income"
              value={filters.income}
              icon="credit-card"
              color={COLORS.red}
            />

            <FilterBox
              field="country"
              title="Country Living In"
              value={filters.country}
              icon="globe-outline"
              color={COLORS.orange}
            />
          </View>

          {/* LOCATION */}

          <FilterBox
            field="location"
            title="Location"
            value={filters.location}
            icon="location"
            color={COLORS.red}
            fullWidth
          />

          {/* BOTTOM ACTIONS */}

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.resetButton}
              onPress={resetAll}
            >
              <Feather name="refresh-cw" size={15} color="#B5120D" />

              <Text style={styles.resetText}>Reset All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={viewMatches}
              disabled={searching}
              style={[
                styles.matchesButtonWrapper,
                searching && styles.matchesButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={["#C90804", "#E33B00", "#F5A500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.viewMatchesButton}
              >
                {searching ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="search" size={16} color="#FFFFFF" />
                )}

                <Text style={styles.viewMatchesText}>
                  {searching ? "Searching..." : "View Matches"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {!!searchApiError && (
            <View style={styles.searchErrorBanner}>
              <Feather name="alert-circle" size={16} color="#B42318" />
              <Text style={styles.searchErrorText}>{searchApiError}</Text>
            </View>
          )}
        </View>

        {/* =======
            RECENT SEARCHES
        ======= */}

        {recentSearches.length > 0 && (
          <View style={styles.recentCard}>
            {/* HEADER */}

            <View style={styles.recentHeader}>
              <Text style={styles.recentHeading}>Recent Searches</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRecentSearches([])}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {/* SEARCH CHIPS */}

            <View style={styles.chipsContainer}>
              {recentSearches.map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  style={styles.searchChip}
                  onPress={() =>
                    navigation.navigate("Matches", {
                      search: item,
                    })
                  }
                >
                  <Feather
                    name="clock"
                    size={15}
                    color="#625B56"
                    style={styles.chipClock}
                  />

                  <Text numberOfLines={1} style={styles.chipText}>
                    {item}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={{
                      top: 8,
                      bottom: 8,
                      left: 8,
                      right: 8,
                    }}
                    onPress={(event) => {
                      event.stopPropagation?.();
                      removeRecentSearch(item);
                    }}
                  >
                    <Feather name="x" size={15} color="#756D68" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* Bottom spacing only — NO BOTTOM TABS */}

        <View style={{ height: 35 }} />
      </ScrollView>

      {/* =======
          FILTER MODAL
      ======= */}

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable style={styles.filterModal} onPress={() => { }}>
            <View style={styles.modalHandle} />

            <View style={styles.filterModalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>

              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Feather name="x" size={27} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activeField &&
                OPTIONS[activeField]?.map((option) => (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.7}
                    onPress={() => selectOption(option)}
                    style={styles.optionItem}
                  >
                    <Text
                      style={[
                        styles.optionText,

                        filters[activeField] === option &&
                        styles.selectedOptionText,
                      ]}
                    >
                      {option}
                    </Text>

                    {filters[activeField] === option && (
                      <Feather
                        name="check-circle"
                        size={23}
                        color={COLORS.red}
                      />
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ======
   STYLES
====== */

const styles = StyleSheet.create({
  /* ======
     MAIN SCREEN
  ====== */

  safeArea: {
    flex: 1,
    backgroundColor: "#FBF9F6",
  },

  scrollContent: {
    paddingBottom: 92,
  },

  /* ======
     TOP HERO SECTION
  ====== */

  heroBackground: {
    height: 145,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#FBFAF8",
  },

  /* BACK BUTTON */

  backButton: {
    position: "absolute",
    top: 5,
    left: 6,

    width: 38,
    height: 38,

    justifyContent: "center",
    alignItems: "center",

    zIndex: 20,
  },

  /* LOGO */

  logo: {
    position: "absolute",

    width: 62,
    height: 62,

    right: 18,
    top: 14,

    resizeMode: "contain",

    zIndex: 10,
  },

  /* TITLE */

  titleSection: {
    position: "absolute",

    top: 47,
    left: 8,
    right: 95,

    zIndex: 5,
    marginTop: 10,
  },

  mainTitle: {
    fontSize: Fonts.size.title,
    fontFamily: Fonts.bold,

    color: "#9E211B",

    lineHeight: 29,
  },

  mainSubtitle: {
    marginTop: 2,

    fontSize: Fonts.size.md,
    fontFamily: Fonts.medium,

    color: "#5E5753",
  },

  /* ======
     ORANGE / RED CURVE
  ====== */

  curveArea: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: 58,

    overflow: "hidden",
  },

  orangeCurve: {
    position: "absolute",

    width: 230,
    height: 100,

    borderRadius: 100,

    right: -35,
    bottom: -68,

    backgroundColor: "#F5A300",
  },

  redCurve: {
    position: "absolute",

    width: 135,
    height: 100,

    borderRadius: 100,

    right: -58,
    bottom: -75,

    backgroundColor: "#C90A06",
  },

  /* ======
     SEARCH FILTER CARD
  ====== */

  filterCard: {
    marginHorizontal: 10,
    marginTop: 11,

    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 18,

    borderRadius: 11,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E9E2DD",

    shadowColor: "#B7ADA7",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 2,
  },

  /* FILTER HEADING */

  filtersHeading: {
    fontSize: Fonts.size.xxl,
    fontFamily: Fonts.bold,

    color: "#991D18",

    marginBottom: 15,
  },

  /* ======
     DIVIDER
  ====== */

  headingDivider: {
    flexDirection: "row",
    alignItems: "center",

    marginBottom: 20,
  },

  dividerLine: {
    flex: 1,

    height: 2,

    backgroundColor: "#EAB129",
  },

  dividerCenter: {
    width: 5,
    height: 8,

    borderRadius: 10,

    backgroundColor: "#C91611",

    marginHorizontal: 6,
  },

  /* ======
     FILTER GRID
  ====== */

  filtersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",

    justifyContent: "space-between",
  },

  /* ======
     FILTER BOX
  ====== */

  filterBox: {
    width: "49.8%",

    height: 49,

    marginBottom: 20,

    paddingLeft: 7,
    paddingRight: 6,

    borderRadius: 8,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#EEE8E3",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  fullWidthFilterBox: {
    width: "100%",

    height: 50,

    marginBottom: 0,
  },

  filterLeft: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,
  },

  /* ======
     FILTER ICON
  ====== */

  filterIconCircle: {
    width: 34,
    height: 34,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 6,
  },

  /* ======
     FILTER TEXT
  ====== */

  filterTextContainer: {
    flex: 1,
    minWidth: 30,
  },

  filterTitle: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,

    color: "#3B3633",

    lineHeight: 10,
  },

  filterValue: {
    marginTop: 1,

    fontSize: Fonts.size.xs,
    fontFamily: Fonts.medium,

    color: "#716965",

    lineHeight: 10,
  },

  /* ======
     ACTION BUTTONS
  ====== */

  actionRow: {
    height: 34,

    flexDirection: "row",
    alignItems: "center",

    marginTop: 9,
  },

  /* RESET */

  resetButton: {
    width: "40%",

    height: 44,

    flexDirection: "row",
    alignItems: "center",

    paddingLeft: 2,
  },

  resetText: {
    marginLeft: 5,

    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,

    color: "#B11B16",
  },

  /* VIEW MATCHES */

  matchesButtonWrapper: {
    flex: 1,

    height: 39,

    borderRadius: 8,

    overflow: "hidden",
  },

  matchesButtonDisabled: {
    opacity: 0.7,
  },

  viewMatchesButton: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  viewMatchesText: {
    marginLeft: 5,

    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,

    color: "#FFFFFF",
  },

  /* ======
     SEARCH API ERROR BANNER
  ====== */

  searchErrorBanner: {
    marginTop: 10,
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchErrorText: {
    flex: 1,
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: "#B42318",
  },

  /* ======
     RECENT SEARCHES
  ====== */

  recentCard: {
    marginHorizontal: 7,
    marginTop: 11,

    paddingHorizontal: 11,
    paddingTop: 11,
    paddingBottom: 9,

    borderRadius: 10,

    backgroundColor: "#FFFDF9",

    borderWidth: 1,
    borderColor: "#F0E8DD",

    shadowColor: "#C7BBB1",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.06,
    shadowRadius: 4,

    elevation: 1,
  },

  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 8,
  },

  recentHeading: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,

    color: "#91221C",
  },

  clearAllText: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,

    color: "#A51C17",

    textDecorationLine: "underline",
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",

    alignItems: "center",
  },

  searchChip: {
    height: 25,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E7DFD8",

    borderRadius: 6,

    paddingHorizontal: 6,

    marginRight: 5,
    marginBottom: 5,
  },

  chipClock: {
    marginRight: 4,
  },

  chipText: {
    maxWidth: 90,

    marginRight: 5,

    fontSize: Fonts.size.md,
    fontFamily: Fonts.medium,

    color: "#5B5551",
  },

  /* ======
     MODAL OVERLAY
  ====== */

  modalOverlay: {
    flex: 1,

    justifyContent: "flex-end",

    backgroundColor: "rgba(0,0,0,0.35)",
  },

  /* ======
     FILTER MODAL
  ====== */

  filterModal: {
    maxHeight: "72%",

    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 25,

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  modalHandle: {
    width: 42,
    height: 4,

    borderRadius: 4,

    backgroundColor: "#DDD6D1",

    alignSelf: "center",

    marginBottom: 18,
  },

  modalTitle: {
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.bold,

    color: "#302B29",
  },

  filterModalHeader: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 14,
  },

  /* ======
     FILTER OPTIONS
  ====== */

  optionItem: {
    minHeight: 55,

    paddingVertical: 12,
    paddingHorizontal: 4,

    borderBottomWidth: 1,
    borderBottomColor: "#EEE8E3",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  optionText: {
    fontSize: Fonts.size.base,
    fontFamily: Fonts.regular,

    color: "#514B47",
  },

  selectedOptionText: {
    color: COLORS.red,
    fontFamily: Fonts.bold,
  },
});
