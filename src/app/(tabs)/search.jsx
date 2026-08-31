import { useMemo, useState } from "react";

import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";


/* ============================================================
   LOGO
============================================================ */

const LOGO = require("../../../assets/images/logo3.png");


/* ============================================================
   COLORS
============================================================ */

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


/* ============================================================
   MAIN SCREEN
============================================================ */

export default function SearchScreen() {

  const router = useRouter();

  const [showFilterModal, setShowFilterModal] =
    useState(false);

  const [activeField, setActiveField] =
    useState(null);

  const [showQuickSearch, setShowQuickSearch] =
    useState(false);

  const [quickSearch, setQuickSearch] =
    useState("");

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


  /* ============================================================
     RECENT SEARCHES
  ============================================================ */

  const [recentSearches, setRecentSearches] = useState([
    "Hyderabad, Telangana",
    "24 - 30 yrs",
    "Software Engineer",
    "Hindu - Mudhiraj",
  ]);


  /* ============================================================
     OPTIONS
  ============================================================ */

  const OPTIONS = useMemo(
    () => ({
      lookingFor: [
        "Select",
        "Bride",
        "Groom",
      ],

      gender: [
        "Select",
        "Male",
        "Female",
      ],

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

      maritalStatus: [
        "Select",
        "Never Married",
        "Divorced",
        "Widowed",
      ],

      religion: [
        "Hindu - Mudhiraj",
        "Hindu",
      ],

      motherTongue: [
        "Select",
        "Telugu",
        "Hindi",
        "English",
        "Tamil",
        "Kannada",
      ],

      caste: [
        "Mudhiraj",
        "Other",
      ],

      education: [
        "Select",
        "B.Tech",
        "M.Tech",
        "MBA",
        "MBBS",
        "B.Sc",
        "M.Sc",
      ],

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
    []
  );


  /* ============================================================
     FUNCTIONS
  ============================================================ */

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

    setQuickSearch("");
  };


  const removeRecentSearch = (item) => {

    setRecentSearches((previous) =>
      previous.filter((search) => search !== item)
    );
  };


  const performQuickSearch = () => {

    const value = quickSearch.trim();

    if (!value) return;

    if (!recentSearches.includes(value)) {
      setRecentSearches((previous) => [
        value,
        ...previous,
      ]);
    }

    setShowQuickSearch(false);

    router.push({
      pathname: "/matches",
      params: {
        search: value,
      },
    });
  };


  const viewMatches = () => {

    router.push({
      pathname: "/matches",

      params: {
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
      },
    });
  };


  /* ============================================================
     FILTER BOX
  ============================================================ */

  const FilterBox = ({
    field,
    title,
    value,
    icon,
    material = false,
    color = COLORS.orange,
    fullWidth = false,
  }) => {

    return (

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => openFilter(field)}
        style={[
          styles.filterBox,
          fullWidth && styles.fullWidthFilterBox,
        ]}
      >

        <View style={styles.filterLeft}>

          {/* ICON */}

          <View
            style={[
              styles.filterIconCircle,
              {
                backgroundColor:
                  color === COLORS.red
                    ? "#FFF6F4"
                    : "#FFF9EA",
              },
            ]}
          >

            {material ? (

              <MaterialCommunityIcons
                name={icon}
                size={15}
                color={color}
              />

            ) : (

              <Ionicons
                name={icon}
                size={15}
                color={color}
              />

            )}

          </View>


          {/* TEXT */}

          <View style={styles.filterTextContainer}>

            <Text
              numberOfLines={1}
              style={styles.filterTitle}
            >
              {title}
            </Text>

            <Text
              numberOfLines={1}
              style={styles.filterValue}
            >
              {value}
            </Text>

          </View>

        </View>


        <Ionicons
          name="chevron-down"
          size={14}
          color="#5D5652"
        />

      </TouchableOpacity>

    );
  };


  /* ============================================================
     SCREEN
  ============================================================ */

  return (

    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* =====================================================
    TOP HERO SECTION
===================================================== */}

        <View style={styles.heroBackground}>

          {/* BACK BUTTON */}

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#B5120D"
            />
          </TouchableOpacity>


          {/* LOGO */}

          <Image
            source={LOGO}
            style={styles.logo}
          />


          {/* TITLE */}

          <View style={styles.titleSection}>

            <Text style={styles.mainTitle}>
              Search
            </Text>

            <Text
              numberOfLines={1}
              style={styles.mainSubtitle}
            >
              Find your perfect match from Mudhiraj community
            </Text>

          </View>


          {/* CURVED ORANGE / RED DESIGN */}

          <View style={styles.curveArea}>

            <View style={styles.orangeCurve} />

            <View style={styles.redCurve} />

          </View>

        </View>


        {/* =====================================================
    QUICK SEARCH
===================================================== */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setShowQuickSearch(true)}
          style={styles.quickSearchCard}
        >

          {/* SEARCH ICON */}

          <View style={styles.quickIconCircle}>

            <Ionicons
              name="search-outline"
              size={23}
              color="#E7A000"
            />

          </View>


          {/* TEXT */}

          <View style={styles.quickTextArea}>

            <Text style={styles.quickTitle}>
              Quick Search
            </Text>

            <Text
              numberOfLines={1}
              style={styles.quickSubtitle}
            >
              Search by name, location or profession
            </Text>

          </View>


          {/* RIGHT ARROW */}

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#B5120D"
          />

        </TouchableOpacity>


        {/* =====================================================
    SEARCH FILTER CARD
===================================================== */}

        <View style={styles.filterCard}>

          {/* HEADING */}

          <Text style={styles.filtersHeading}>
            Search Filters
          </Text>


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
              icon="om"
              material
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
              icon="currency-inr"
              material
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

              <Ionicons
                name="refresh"
                size={15}
                color="#B5120D"
              />

              <Text style={styles.resetText}>
                Reset All
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              activeOpacity={0.85}
              onPress={viewMatches}
              style={styles.matchesButtonWrapper}
            >

              <LinearGradient
                colors={[
                  "#C90804",
                  "#E33B00",
                  "#F5A500",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.viewMatchesButton}
              >

                <Ionicons
                  name="search-outline"
                  size={16}
                  color="#FFFFFF"
                />

                <Text style={styles.viewMatchesText}>
                  View Matches
                </Text>

              </LinearGradient>

            </TouchableOpacity>

          </View>

        </View>

        {/* =====================================================
            RECENT SEARCHES
        ===================================================== */}


        {recentSearches.length > 0 && (

          <View style={styles.recentCard}>

            {/* HEADER */}

            <View style={styles.recentHeader}>

              <Text style={styles.recentHeading}>
                Recent Searches
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setRecentSearches([])}
              >
                <Text style={styles.clearAllText}>
                  Clear All
                </Text>
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
                    router.push({
                      pathname: "/matches",
                      params: {
                        search: item,
                      },
                    })
                  }
                >

                  <Ionicons
                    name="time-outline"
                    size={15}
                    color="#625B56"
                    style={styles.chipClock}
                  />


                  <Text
                    numberOfLines={1}
                    style={styles.chipText}
                  >
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

                    <Ionicons
                      name="close"
                      size={15}
                      color="#756D68"
                    />

                  </TouchableOpacity>

                </TouchableOpacity>

              ))}

            </View>

          </View>

        )}
        {/* Bottom spacing only — NO BOTTOM TABS */}

        <View style={{ height: 35 }} />

      </ScrollView>



      {/* =====================================================
          QUICK SEARCH MODAL
      ===================================================== */}

      <Modal
        visible={showQuickSearch}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowQuickSearch(false)
        }
      >

        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >

          <Pressable
            style={styles.modalOverlay}
            onPress={() =>
              setShowQuickSearch(false)
            }
          >

            <Pressable
              style={styles.quickModalCard}
              onPress={() => { }}
            >

              <View style={styles.modalHandle} />


              <Text style={styles.modalTitle}>
                Quick Search
              </Text>


              <View style={styles.quickInputContainer}>

                <Ionicons
                  name="search"
                  size={23}
                  color={COLORS.orange}
                />

                <TextInput
                  value={quickSearch}
                  onChangeText={setQuickSearch}
                  placeholder="Name, location or profession"
                  placeholderTextColor="#999"
                  style={styles.quickInput}
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={performQuickSearch}
                />

              </View>


              <TouchableOpacity
                activeOpacity={0.85}
                onPress={performQuickSearch}
              >

                <LinearGradient
                  colors={[
                    "#C90804",
                    "#F2A400",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.quickSearchButton}
                >

                  <Ionicons
                    name="search"
                    size={24}
                    color="#FFFFFF"
                  />

                  <Text style={styles.quickSearchButtonText}>
                    Search Matches
                  </Text>

                </LinearGradient>

              </TouchableOpacity>

            </Pressable>

          </Pressable>

        </KeyboardAvoidingView>

      </Modal>



      {/* =====================================================
          FILTER MODAL
      ===================================================== */}

      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowFilterModal(false)
        }
      >

        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowFilterModal(false)
          }
        >

          <Pressable
            style={styles.filterModal}
            onPress={() => { }}
          >

            <View style={styles.modalHandle} />


            <View style={styles.filterModalHeader}>

              <Text style={styles.modalTitle}>
                Select Option
              </Text>


              <TouchableOpacity
                onPress={() =>
                  setShowFilterModal(false)
                }
              >

                <Ionicons
                  name="close"
                  size={27}
                  color="#333"
                />

              </TouchableOpacity>

            </View>


            <ScrollView
              showsVerticalScrollIndicator={false}
            >

              {activeField &&
                OPTIONS[activeField]?.map(
                  (option) => (

                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.7}
                      onPress={() =>
                        selectOption(option)
                      }
                      style={styles.optionItem}
                    >

                      <Text
                        style={[
                          styles.optionText,

                          filters[activeField] ===
                          option &&
                          styles.selectedOptionText,
                        ]}
                      >
                        {option}
                      </Text>


                      {filters[activeField] ===
                        option && (

                          <Ionicons
                            name="checkmark-circle"
                            size={23}
                            color={COLORS.red}
                          />

                        )}

                    </TouchableOpacity>

                  )
                )}

            </ScrollView>

          </Pressable>

        </Pressable>

      </Modal>

    </SafeAreaView>
  );
}



/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  /* ============================================================
     MAIN SCREEN
  ============================================================ */

  safeArea: {
    flex: 1,
    backgroundColor: "#FBF9F6",
  },

  scrollContent: {
    paddingBottom: 92,
  },


  /* ============================================================
     TOP HERO SECTION
  ============================================================ */

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
    marginTop:10,
  },


  mainTitle: {
    fontSize: 34,
    fontWeight: "800",

    color: "#9E211B",

    lineHeight: 29,
  },


  mainSubtitle: {
    marginTop: 2,

    fontSize: 13,
    fontWeight: "500",

    color: "#5E5753",
  },


  /* ============================================================
     ORANGE / RED CURVE
  ============================================================ */

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


  /* ============================================================
     QUICK SEARCH
  ============================================================ */

  quickSearchCard: {
    height: 45,

    marginHorizontal: 6,
    marginTop: -4,

    paddingHorizontal: 10,

    borderRadius: 9,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#EAE2DC",

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#B5AAA3",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 2,
  },


  quickIconCircle: {
    width: 28,
    height: 28,

    borderRadius: 14,

    backgroundColor: "#FFF9EA",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 8,
  },


  quickTextArea: {
    flex: 1,
  },


  quickTitle: {
    fontSize: 15,
    fontWeight: "700",

    color: "#302B29",

    marginBottom: 1,
  },


  quickSubtitle: {
    fontSize: 9.5,
    fontWeight: "500",

    color: "#655E59",
  },


  /* ============================================================
     SEARCH FILTER CARD
  ============================================================ */

  filterCard: {
    marginHorizontal: 10,
    marginTop: 11,

    paddingHorizontal: 20,
    paddingTop: 11,
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
    fontSize: 25,
    fontWeight: "800",

    color: "#991D18",

    marginBottom: 15,
  },


  /* ============================================================
     DIVIDER
  ============================================================ */

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


  /* ============================================================
     FILTER GRID
  ============================================================ */

  filtersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",

    justifyContent: "space-between",
  },


  /* ============================================================
     FILTER BOX
  ============================================================ */

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


  /* ============================================================
     FILTER ICON
  ============================================================ */

  filterIconCircle: {
    width: 34,
    height: 34,

    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 6,
  },


  /* ============================================================
     FILTER TEXT
  ============================================================ */

  filterTextContainer: {
    flex: 1,
    minWidth: 20,
  },


  filterTitle: {
    fontSize: 13,
    fontWeight: "700",

    color: "#3B3633",

    lineHeight: 9,
  },


  filterValue: {
    marginTop: 1,

    fontSize: 10,
    fontWeight: "500",

    color: "#716965",

    lineHeight: 10,
  },


  /* ============================================================
     ACTION BUTTONS
  ============================================================ */

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

    fontSize: 15,
    fontWeight: "700",

    color: "#B11B16",
  },


  /* VIEW MATCHES */

  matchesButtonWrapper: {
    flex: 1,

    height: 39,

    borderRadius: 8,

    overflow: "hidden",
  },


  viewMatchesButton: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },


  viewMatchesText: {
    marginLeft: 5,

    fontSize: 15,
    fontWeight: "800",

    color: "#FFFFFF",
  },


  /* ============================================================
     RECENT SEARCHES
  ============================================================ */

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
    fontSize: 15,
    fontWeight: "800",

    color: "#91221C",
  },


  clearAllText: {
    fontSize: 13,
    fontWeight: "700",

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

    fontSize: 13,
    fontWeight: "500",

    color: "#5B5551",
  },


  /* ============================================================
     MODAL OVERLAY
  ============================================================ */

  modalOverlay: {
    flex: 1,

    justifyContent: "flex-end",

    backgroundColor: "rgba(0,0,0,0.35)",
  },


  /* ============================================================
     QUICK SEARCH MODAL
  ============================================================ */

  quickModalCard: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,

    backgroundColor: "#FFFFFF",

    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },


  /* ============================================================
     FILTER MODAL
  ============================================================ */

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
    fontSize: 21,
    fontWeight: "800",

    color: "#302B29",
  },


  filterModalHeader: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 14,
  },


  /* ============================================================
     QUICK SEARCH INPUT
  ============================================================ */

  quickInputContainer: {
    height: 54,

    marginTop: 18,

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: "#E6DED8",

    borderRadius: 14,

    flexDirection: "row",
    alignItems: "center",
  },


  quickInput: {
    flex: 1,

    height: "100%",

    marginLeft: 10,

    fontSize: 15,

    color: "#302B29",
  },


  quickSearchButton: {
    height: 54,

    marginTop: 14,

    borderRadius: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },


  quickSearchButtonText: {
    marginLeft: 8,

    color: "#FFFFFF",

    fontSize: 16,
    fontWeight: "800",
  },


  /* ============================================================
     FILTER OPTIONS
  ============================================================ */

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
    fontSize: 16,

    color: "#514B47",
  },


  selectedOptionText: {
    color: COLORS.red,
    fontWeight: "700",
  },

});