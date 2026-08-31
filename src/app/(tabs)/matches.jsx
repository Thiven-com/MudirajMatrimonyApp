import { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const COLORS = {
  primary: "#B20D08",
  red: "#D20A05",
  yellow: "#F8B900",
  green: "#159447",
  text: "#242424",
  gray: "#6D6D6D",
  white: "#FFFFFF",
  background: "#FAF9F7",
};

/* =========================
   MATCH DATA
========================= */

const matches = [
  {
    id: 1,
    name: "Priyanka",
    age: 25,
    profession: "Software Engineer",
    location: "Hyderabad, Telangana",
    education: "B.Tech, Computer Science",
    height: `5'4"`,
    community: "Hindu - Mudhiraj",
    image: require("../../../assets/images/Match3.png"),
    online: true,
    newMember: true,
    recentlyActive: true,
  },

  {
    id: 2,
    name: "Deepika",
    age: 23,
    profession: "Teacher",
    location: "Warangal, Telangana",
    education: "B.Ed",
    height: `5'3"`,
    community: "Hindu - Mudhiraj",
    image: require("../../../assets/images/Match3.png"),
    online: true,
    newMember: true,
    recentlyActive: false,
  },

  {
    id: 3,
    name: "Rohit",
    age: 27,
    profession: "Civil Engineer",
    location: "Vijayawada, Andhra Pradesh",
    education: "B.Tech, Civil Engineering",
    height: `5'7"`,
    community: "Hindu - Mudhiraj",
    image: require("../../../assets/images/Match3.png"),
    online: false,
    newMember: false,
    recentlyActive: true,
  },

  {
    id: 4,
    name: "Ananya",
    age: 26,
    profession: "Doctor",
    location: "Bengaluru, Karnataka",
    education: "MBBS, MD",
    height: `5'5"`,
    community: "Hindu - Mudhiraj",
    image: require("../../../assets/images/Match3.png"),
    online: true,
    newMember: false,
    recentlyActive: true,
  },

  {
    id: 5,
    name: "Kiran",
    age: 28,
    profession: "Business Analyst",
    location: "Hyderabad, Telangana",
    education: "MBA",
    height: `5'8"`,
    community: "Hindu - Mudhiraj",
    image: require("../../../assets/images/Match3.png"),
    online: false,
    newMember: true,
    recentlyActive: false,
  },
];

/* =========================
   TABS
========================= */

const tabs = [
  {
    key: "All Matches",
    label: "All Matches",
    icon: "people",
  },

  {
    key: "Online Now",
    label: "Online Now",
    icon: "radio",
  },

  {
    key: "New Members",
    label: "New Members",
    icon: "star-outline",
  },

  {
    key: "Recently Active",
    label: "Recently Active",
    icon: "time-outline",
  },
];

/* =========================
   COMPONENT
========================= */

export default function MatchesScreen() {
  const [activeTab, setActiveTab] =
    useState("All Matches");

  const [liked, setLiked] = useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [showFilters, setShowFilters] =
    useState(false);

  const [selectedProfession, setSelectedProfession] =
    useState("All");

  const [selectedLocation, setSelectedLocation] =
    useState("All");

  /* =========================
     PROFESSION LIST
  ========================= */

  const professions = [
    "All",
    ...Array.from(
      new Set(matches.map((item) => item.profession))
    ),
  ];

  /* =========================
     LOCATION LIST
  ========================= */

  const locations = [
    "All",
    ...Array.from(
      new Set(matches.map((item) => item.location))
    ),
  ];

  /* =========================
     FILTER MATCHES
  ========================= */

  const filteredMatches = useMemo(() => {
    const query = searchText
      .trim()
      .toLowerCase();

    return matches.filter((item) => {
      const searchableText = [
        item.name,
        item.profession,
        item.location,
        item.education,
        item.community,
      ]
        .join(" ")
        .toLowerCase();

      /* SEARCH */

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      /* TABS */

      const matchesTab =
        activeTab === "All Matches" ||
        (activeTab === "Online Now" &&
          item.online) ||
        (activeTab === "New Members" &&
          item.newMember) ||
        (activeTab === "Recently Active" &&
          item.recentlyActive);

      /* PROFESSION FILTER */

      const matchesProfession =
        selectedProfession === "All" ||
        item.profession === selectedProfession;

      /* LOCATION FILTER */

      const matchesLocation =
        selectedLocation === "All" ||
        item.location === selectedLocation;

      return (
        matchesSearch &&
        matchesTab &&
        matchesProfession &&
        matchesLocation
      );
    });
  }, [
    activeTab,
    searchText,
    selectedProfession,
    selectedLocation,
  ]);

  /* =========================
     LIKE
  ========================= */

  const toggleLike = (id) => {
    setLiked((previous) =>
      previous.includes(id)
        ? previous.filter(
          (item) => item !== id
        )
        : [...previous, id]
    );
  };

  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {
    setSearchText("");

    setSelectedProfession("All");

    setSelectedLocation("All");

    setActiveTab("All Matches");
  };

  /* =========================
     NEXT SELECT VALUE
  ========================= */

  const getNextValue = (
    values,
    currentValue
  ) => {
    const index =
      values.indexOf(currentValue);

    return values[
      (index + 1) % values.length
    ];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.container}>

        {/* ================= HEADER ================= */}

        <View style={styles.headerArea}>

          {/* BACK BUTTON */}

          <TouchableOpacity
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color="#252525"
            />
          </TouchableOpacity>

          {/* TITLE */}

          <View style={styles.titleSection}>
            <Text style={styles.title}>
              <Text style={styles.titleRed}>
                Matches
              </Text>{" "}
              for You
            </Text>

            <Text style={styles.matchesFound}>
              {filteredMatches.length}{" "}
              {filteredMatches.length === 1
                ? "Match"
                : "Matches"}{" "}
              Found
            </Text>
          </View>

          {/* ================= SEARCH ================= */}

          <View style={styles.searchRow}>

            <View style={styles.searchContainer}>

              <Ionicons
                name="search-outline"
                size={23}
                color="#555"
                style={styles.searchIcon}
              />

              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search by name, location or profession"
                placeholderTextColor="#777"
                style={styles.searchInput}
                returnKeyType="search"
              />

              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() =>
                    setSearchText("")
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              )}

            </View>

            {/* FILTER BUTTON */}

            <TouchableOpacity
              style={[
                styles.filterButton,
                showFilters &&
                styles.filterButtonActive,
              ]}
              onPress={() =>
                setShowFilters((value) => !value)
              }
            >
              <Ionicons
                name="options-outline"
                size={23}
                color="#1B1B1B"
              />

              <Text style={styles.filterText}>
                Filters
              </Text>
            </TouchableOpacity>

          </View>

          {/* ================= FILTER PANEL ================= */}

          {showFilters && (
            <View style={styles.filterPanel}>

              <View
                style={styles.filterPanelHeader}
              >
                <Text
                  style={styles.filterPanelTitle}
                >
                  Filter Matches
                </Text>

                <TouchableOpacity
                  onPress={clearFilters}
                >
                  <Text style={styles.clearText}>
                    Clear All
                  </Text>
                </TouchableOpacity>

              </View>

              {/* PROFESSION */}

              <Text style={styles.filterLabel}>
                Profession
              </Text>

              <TouchableOpacity
                style={styles.selectBox}
                onPress={() =>
                  setSelectedProfession(
                    getNextValue(
                      professions,
                      selectedProfession
                    )
                  )
                }
              >
                <Text
                  style={styles.selectText}
                  numberOfLines={1}
                >
                  {selectedProfession}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>

              {/* LOCATION */}

              <Text style={styles.filterLabel}>
                Location
              </Text>

              <TouchableOpacity
                style={styles.selectBox}
                onPress={() =>
                  setSelectedLocation(
                    getNextValue(
                      locations,
                      selectedLocation
                    )
                  )
                }
              >
                <Text
                  style={styles.selectText}
                  numberOfLines={1}
                >
                  {selectedLocation}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={20}
                  color="#555"
                />
              </TouchableOpacity>

              <Text style={styles.filterHint}>
                Tap a selection box to change
                available options.
              </Text>

            </View>
          )}

          {/* ================= ACTION TABS ================= */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.tabsScroll
            }
            style={styles.tabsContainer}
          >
            {tabs.map((tab) => {
              const isActive =
                activeTab === tab.key;

              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() =>
                    setActiveTab(tab.key)
                  }
                  style={[
                    styles.tab,
                    isActive &&
                    styles.activeTab,
                  ]}
                >

                  {tab.key ===
                    "Online Now" ? (
                    <View
                      style={[
                        styles.onlineDot,
                        isActive &&
                        styles.onlineDotActive,
                      ]}
                    />
                  ) : (
                    <Ionicons
                      name={tab.icon}
                      size={20}
                      color={
                        isActive
                          ? "#FFFFFF"
                          : "#444"
                      }
                    />
                  )}

                  <Text
                    style={[
                      styles.tabText,
                      isActive &&
                      styles.activeTabText,
                    ]}
                  >
                    {tab.label}
                  </Text>

                </TouchableOpacity>
              );
            })}
          </ScrollView>

        </View>

        {/* ================= MATCH LIST ================= */}

        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >

          {/* EMPTY STATE */}

          {filteredMatches.length === 0 ? (

            <View style={styles.emptyState}>

              <Ionicons
                name="search-outline"
                size={50}
                color="#B5B5B5"
              />

              <Text style={styles.emptyTitle}>
                No Matches Found
              </Text>

              <Text style={styles.emptyText}>
                Try another search or clear
                your filters.
              </Text>

              <TouchableOpacity
                style={styles.emptyButton}
                onPress={clearFilters}
              >
                <Text
                  style={styles.emptyButtonText}
                >
                  Clear Filters
                </Text>
              </TouchableOpacity>

            </View>

          ) : (

            filteredMatches.map((item) => (

              <View
                key={item.id}
                style={styles.matchCard}
              >

                {/* ================= IMAGE ================= */}

                <View
                  style={styles.imageContainer}
                >

                  <Image
                    source={item.image}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />

                  {/* ONLINE */}

                  {item.online && (
                    <View
                      style={styles.onlineBadge}
                    >
                      <Text
                        style={styles.onlineText}
                      >
                        Online
                      </Text>
                    </View>
                  )}

                  {/* COMMUNITY BADGE */}

                  <View
                    style={styles.communityBadge}
                  >
                    <MaterialCommunityIcons
                      name="flower-outline"
                      size={20}
                      color="#FFD11A"
                    />
                  </View>

                </View>

                {/* ================= DETAILS ================= */}

                <View
                  style={styles.detailsContainer}
                >

                  <View
                    style={styles.detailsLeft}
                  >

                    {/* NAME */}

                    <View style={styles.nameRow}>

                      <Text
                        style={styles.name}
                        numberOfLines={1}
                      >
                        {item.name}, {item.age}
                      </Text>

                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color={COLORS.green}
                        style={styles.verifiedIcon}
                      />

                    </View>

                    {/* PROFESSION */}

                    <Text
                      style={styles.profession}
                      numberOfLines={1}
                    >
                      {item.profession}
                    </Text>

                    {/* LOCATION */}

                    <View style={styles.infoRow}>

                      <Ionicons
                        name="location-outline"
                        size={17}
                        color={COLORS.red}
                      />

                      <Text
                        style={styles.infoText}
                        numberOfLines={1}
                      >
                        {item.location}
                      </Text>

                    </View>

                    {/* EDUCATION */}

                    <View style={styles.infoRow}>

                      <Ionicons
                        name="school-outline"
                        size={17}
                        color={COLORS.red}
                      />

                      <Text
                        style={styles.infoText}
                        numberOfLines={1}
                      >
                        {item.education}
                      </Text>

                    </View>

                    {/* HEIGHT */}

                    <View style={styles.infoRow}>

                      <MaterialCommunityIcons
                        name="human-male-height"
                        size={18}
                        color={COLORS.red}
                      />

                      <Text style={styles.infoText}>
                        {item.height}
                      </Text>

                    </View>

                    {/* COMMUNITY */}

                    <View style={styles.infoRow}>

                      <MaterialCommunityIcons
                        name="account-group-outline"
                        size={18}
                        color={COLORS.red}
                      />

                      <Text
                        style={styles.infoText}
                        numberOfLines={1}
                      >
                        {item.community}
                      </Text>

                    </View>

                  </View>

                  {/* ================= ACTION BUTTONS ================= */}

                  <View
                    style={styles.actionsContainer}
                  >

                    {/* LIKE */}

                    <TouchableOpacity
                      style={styles.heartButton}
                      onPress={() =>
                        toggleLike(item.id)
                      }
                    >
                      <Ionicons
                        name={
                          liked.includes(item.id)
                            ? "heart"
                            : "heart-outline"
                        }
                        size={25}
                        color={COLORS.red}
                      />
                    </TouchableOpacity>

                    {/* CHAT */}

                    <TouchableOpacity
                      style={styles.chatButton}
                    >
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={20}
                        color="#8E1600"
                      />
                    </TouchableOpacity>

                  </View>

                </View>

              </View>
            ))
          )}

          {/* ================= PREMIUM ================= */}

          <View style={styles.premiumBanner}>

            {/* LEFT PREMIUM ICON */}
            <View style={styles.premiumIconCircle}>
              <Text style={styles.crownText}>♛</Text>
            </View>

            {/* PREMIUM TEXT */}
            <View style={styles.premiumTextContainer}>
              <Text style={styles.premiumTitle}>
                Upgrade to Premium
              </Text>

              <Text style={styles.premiumDescription}>
                Unlock contact details, chat unlimited{"\n"}& more premium features.
              </Text>
            </View>

            {/* UPGRADE BUTTON */}
            <TouchableOpacity
              style={styles.upgradeButton}
              activeOpacity={0.8}
              onPress={() => console.log("Upgrade Premium")}
            >
              <Text style={styles.buttonCrown}>♛</Text>

              <Text style={styles.upgradeText}>
                Upgrade Now
              </Text>
            </TouchableOpacity>

          </View>

          <View style={{ height: 24 }} />

        </ScrollView>


      </View>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ================= HEADER ================= */

  headerArea: {
    backgroundColor: COLORS.background,
  },

  backButton: {
    width: 50,
    height: 46,
    justifyContent: "center",
    marginLeft: 20,
    marginTop: 4,
  },

  titleSection: {
    paddingHorizontal: 28,
    marginTop: 16,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#242424",
  },

  titleRed: {
    color: "#A81712",
  },

  matchesFound: {
    marginTop: 5,
    fontSize: 16,
    color: "#666",
  },

  /* ================= SEARCH ================= */

  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 24,
    alignItems: "center",
  },

  searchContainer: {
    flex: 1,
    height: 58,
    borderWidth: 1,
    borderColor: "#E2DDD8",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  searchIcon: {
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    minWidth: 0,
  },

  filterButton: {
    width: 80,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.yellow,
    marginLeft: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  filterButtonActive: {
    borderWidth: 2,
    borderColor: "#E4A600",
  },

  filterText: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "800",
    color: "#1C1C1C",
  },

  /* ================= FILTER PANEL ================= */

  filterPanel: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEE7E1",
    padding: 10,
  },

  filterPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  filterPanelTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#222",
  },

  clearText: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "700",
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginTop: 8,
    marginBottom: 5,
  },

  selectBox: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E0DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },

  filterHint: {
    marginTop: 8,
    fontSize: 11,
    color: "#888",
  },

  /* ================= TABS ================= */

  tabsContainer: {
    marginTop: 18,
    maxHeight: 54,
  },

  tabsScroll: {
    paddingHorizontal: 20,
    alignItems: "center",
  },

  tab: {
    height: 48,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E1DDD8",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 9,
  },

  activeTab: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginLeft: 7,
  },

  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.green,
  },

  onlineDotActive: {
    backgroundColor: "#FFFFFF",
  },

  /* ================= LIST ================= */

  list: {
    flex: 1,
    marginTop: 16,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 92,
  },

  /* ================= MATCH CARD ================= */

  matchCard: {
    minHeight: 190,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 14,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEE8E3",

    shadowColor: "#888",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  /* IMAGE */

  imageContainer: {
    width: "37%",
    minHeight: 190,
    position: "relative",
    backgroundColor: "#EEE",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  onlineBadge: {
    position: "absolute",
    top: 10,
    left: 9,
    backgroundColor: "#13934A",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  onlineText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  communityBadge: {
    position: "absolute",
    right: 8,
    top: 10,
  },

  /* DETAILS */

  detailsContainer: {
    flex: 1,
    flexDirection: "row",
    paddingLeft: 13,
    paddingVertical: 14,
  },

  detailsLeft: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    maxWidth: 135,
    fontSize: 21,
    fontWeight: "800",
    color: "#A81C16",
  },

  verifiedIcon: {
    marginLeft: 5,
  },

  profession: {
    fontSize: 15,
    color: "#333",
    marginTop: 7,
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  infoText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
    fontSize: 12,
    color: "#626262",
  },

  /* ================= ACTIONS ================= */

  actionsContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  heartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#EEE9E5",

    shadowColor: "#888",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8BA00",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 13,
    elevation: 3,
  },

  /* ================= PREMIUM ================= */

  premiumBanner: {
  width: "100%",
  minHeight: 76,

  backgroundColor: "#FFFFFF",

  borderRadius: 10,

  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 12,
  paddingVertical: 10,

  marginTop: 12,
  marginBottom: 16,

  borderWidth: 1,
  borderColor: "#F0E8E3",

  shadowColor: "#A99A92",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 4,
},

/* LEFT RED CIRCLE */

premiumIconCircle: {
  width: 48,
  height: 48,
  borderRadius: 24,

  backgroundColor: "#C90804",

  justifyContent: "center",
  alignItems: "center",

  marginRight: 10,

  shadowColor: "#C90804",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},

crownText: {
  fontSize: 27,
  color: "#FFD333",
  fontWeight: "bold",
},

/* TEXT AREA */

premiumTextContainer: {
  flex: 1,
  justifyContent: "center",
},

premiumTitle: {
  fontSize: 14,
  fontWeight: "800",
  color: "#A51B16",

  marginBottom: 3,
},

premiumDescription: {
  fontSize: 9,
  lineHeight: 13,
  color: "#716864",
  fontWeight: "500",
},

/* RED BUTTON */

upgradeButton: {
  height: 38,
  minWidth: 82,

  backgroundColor: "#C90804",

  borderRadius: 7,

  paddingHorizontal: 9,

  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",

  marginLeft: 8,

  shadowColor: "#B00000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},

buttonCrown: {
  fontSize: 13,
  color: "#FFD333",
  marginRight: 4,
},

upgradeText: {
  fontSize: 10,
  fontWeight: "800",
  color: "#FFFFFF",
},

  /* ================= EMPTY STATE ================= */

  emptyState: {
    minHeight: 260,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 16,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
  },

  emptyText: {
    marginTop: 7,
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 18,
    backgroundColor: COLORS.red,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },



});