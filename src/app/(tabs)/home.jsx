
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

/* =====================================================
   COLORS
===================================================== */

const COLORS = {
  background: "#FFFDFC",
  white: "#FFFFFF",

  red: "#C91412",
  darkRed: "#A30F0D",
  brightRed: "#E11B17",

  gold: "#F5B400",
  yellow: "#FFC400",
  lightGold: "#FFF4D0",

  text: "#211B19",
  gray: "#6F6662",
  lightGray: "#918984",

  border: "#F0E5DC",

  green: "#12A150",

  shadow: "#B7A59B",
};

/* =====================================================
   ASSETS
===================================================== */

const LOGO = require("../../../assets/images/logo.png");

const HERO_IMAGE = require("../../../assets/images/Match1.png");

const MATCH_IMAGES = {
  Match1: require("../../../assets/images/Match1.png"),
  Match2: require("../../../assets/images/Match2.png"),
  Match3: require("../../../assets/images/Match3.png"),
};

/* =====================================================
   DATA
===================================================== */

const QUICK_STATS = [
  {
    id: "1",
    label: "Matches",
    icon: "people",
    color: COLORS.red,
  },
  {
    id: "2",
    label: "Visitors",
    icon: "eye-outline",
    count: 12,
    color: COLORS.gold,
  },
  {
    id: "3",
    label: "Likes",
    icon: "heart",
    count: 8,
    color: COLORS.red,
  },
  {
    id: "4",
    label: "Messages",
    icon: "chatbubble-ellipses",
    count: 5,
    color: COLORS.gold,
  },
  {
    id: "5",
    label: "Shortlist",
    icon: "star",
    color: COLORS.gold,
  },
];

const MATCHES = [
  {
    id: "1",
    name: "Priyanka",
    age: 25,
    profession: "Software Engineer",
    location: "Hyderabad, Telangana",
    height: `5'4"`,
    religion: "Hindu - Mudhiraj",
    image: MATCH_IMAGES.Match1,
  },
  {
    id: "2",
    name: "Rohit",
    age: 27,
    profession: "Civil Engineer",
    location: "Vijayawada, Andhra Pradesh",
    height: `5'7"`,
    religion: "Hindu - Mudhiraj",
    image: MATCH_IMAGES.Match2,
  },
  {
    id: "3",
    name: "Deepika",
    age: 23,
    profession: "Teacher",
    location: "Warangal, Telangana",
    height: `5'3"`,
    religion: "Hindu - Mudhiraj",
    image: MATCH_IMAGES.Match3,
  },
];

const WHY_CHOOSE = [
  {
    id: "1",
    icon: "shield-checkmark-outline",
    title: "100%",
    subtitle: "Verified Profiles",
    color: COLORS.red,
  },
  {
    id: "2",
    icon: "people-outline",
    title: "Trusted",
    subtitle: "Community",
    color: COLORS.gold,
  },
  {
    id: "3",
    icon: "lock-closed-outline",
    title: "Privacy",
    subtitle: "Protected",
    color: COLORS.red,
  },
  {
    id: "4",
    icon: "headset-outline",
    title: "Dedicated",
    subtitle: "Support",
    color: COLORS.gold,
  },
];

/* =====================================================
   HOME SCREEN
===================================================== */

export default function HomeScreen() {
  const router = useRouter();

  const openNotifications = () => {
    router.push("/notifications");
  };

  const openPremium = () => {
    router.push("/premium");
  };

  const openMatches = () => {
    router.push("/matches");
  };

  const openProfile = (id) => {
    router.push(`/profile/${id}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          {/* MENU */}

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Feather
              name="menu"
              size={28}
              color={COLORS.red}
            />
          </TouchableOpacity>

          {/* LOGO + TITLE */}

          <View style={styles.headerCenter}>

            <View style={styles.logoRow}>

              <Image
                source={LOGO}
                style={styles.logo}
                resizeMode="contain"
              />

              <View style={styles.brandContainer}>

                <Text style={styles.brandName}>
                  MUDHIRAJ
                </Text>

                <View style={styles.brandDividerRow}>
                  <View style={styles.smallLine} />

                  <MaterialCommunityIcons
                    name="ornament-variant"
                    size={13}
                    color={COLORS.gold}
                  />

                  <Text style={styles.brandMatrimony}>
                    MATRIMONY
                  </Text>

                  <MaterialCommunityIcons
                    name="ornament-variant"
                    size={13}
                    color={COLORS.gold}
                    style={{
                      transform: [{ scaleX: -1 }],
                    }}
                  />

                  <View style={styles.smallLine} />
                </View>

              </View>
            </View>

            <Text style={styles.tagline}>
              మన బంధం.. మన సంప్రదాయం.. మన ముదిరాజ్
            </Text>

          </View>

          {/* NOTIFICATION */}

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={openNotifications}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={27}
              color={COLORS.text}
            />

            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                3
              </Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* =================================================
            SEARCH
        ================================================= */}

        <View style={styles.searchBox}>

          <Ionicons
            name="search-outline"
            size={27}
            color={COLORS.gray}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, location or profession"
            placeholderTextColor={COLORS.lightGray}
          />

          <TouchableOpacity
            style={styles.filterButton}
            activeOpacity={0.8}
            onPress={() => router.push("/search")}
          >
            <Ionicons
              name="options-outline"
              size={24}
              color={COLORS.darkRed}
            />
          </TouchableOpacity>

        </View>

        {/* =================================================
            HERO BANNER
        ================================================= */}

        <TouchableOpacity
          style={styles.heroCard}
          onPress={openPremium}
          activeOpacity={0.95}
        >

          <LinearGradient
            colors={[
              "#B60000",
              "#D90D08",
              "#E51A09",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >

            {/* HERO TEXT */}

            <View style={styles.heroText}>

              <Text style={styles.heroFind}>
                Find Your
              </Text>

              <Text style={styles.heroMatch}>
                Perfect Match
              </Text>

              <View style={styles.heroDivider}>
                <View style={styles.heroLine} />

                <MaterialCommunityIcons
                  name="ornament-variant"
                  size={15}
                  color={COLORS.gold}
                />

                <View style={styles.heroLine} />
              </View>

              <Text style={styles.teluguText}>
                సంస్కారం మనది...
              </Text>

              <Text style={styles.teluguText}>
                సంబంధం మనది...
              </Text>

              <TouchableOpacity
                style={styles.heroButton}
                onPress={openPremium}
                activeOpacity={0.85}
              >
                <FontAwesome5
                  name="crown"
                  size={14}
                  color={COLORS.darkRed}
                />

                <Text style={styles.heroButtonText}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>

            </View>

            {/* HERO IMAGE */}

            <Image
              source={HERO_IMAGE}
              style={styles.heroImage}
              resizeMode="cover"
            />

          </LinearGradient>

        </TouchableOpacity>

        {/* =================================================
            QUICK STATS
        ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >

          {QUICK_STATS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.statCard}
              activeOpacity={0.8}
            >

              <View style={styles.statIconContainer}>

                <Ionicons
                  name={item.icon}
                  size={28}
                  color={item.color}
                />

                {item.count !== undefined && (
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>
                      {item.count}
                    </Text>
                  </View>
                )}

              </View>

              <Text style={styles.statLabel}>
                {item.label}
              </Text>

            </TouchableOpacity>
          ))}

        </ScrollView>

        {/* =================================================
            RECOMMENDED MATCHES HEADER
        ================================================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Recommended Matches
          </Text>

          <TouchableOpacity
            onPress={openMatches}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAll}>
              See All
            </Text>
          </TouchableOpacity>

        </View>

        {/* =================================================
            MATCH CARDS
        ================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.matchesContainer}
        >

          {MATCHES.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onPress={() => openProfile(match.id)}
            />
          ))}

        </ScrollView>

        {/* =================================================
            PREMIUM BANNER
        ================================================= */}

        <LinearGradient
          colors={[
            "#FFF1C5",
            "#FFD84D",
            "#FFC400",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.premiumBanner}
        >

          <View style={styles.premiumCrown}>

            <FontAwesome5
              name="crown"
              size={28}
              color={COLORS.gold}
            />

          </View>

          <View style={styles.premiumTextContainer}>

            <Text style={styles.premiumTitle}>
              Go Premium, Get Better Matches
            </Text>

            <Text style={styles.premiumSubtitle}>
              Unlock all features & connect with
            </Text>

            <Text style={styles.premiumSubtitle}>
              the right life partner
            </Text>

          </View>

          <TouchableOpacity
            style={styles.upgradeNowButton}
            onPress={openPremium}
            activeOpacity={0.85}
          >

            <Text style={styles.upgradeNowText}>
              Upgrade Now
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#FFFFFF"
            />

          </TouchableOpacity>

        </LinearGradient>

        {/* =================================================
            WHY CHOOSE
        ================================================= */}

        <View style={styles.whyHeader}>

          <View style={styles.whyLine} />

          <Text style={styles.whyTitle}>
            Why Choose Mudhiraj Matrimony?
          </Text>

          <View style={styles.whyLine} />

        </View>

        <View style={styles.whyGrid}>

          {WHY_CHOOSE.map((item) => (
            <View
              key={item.id}
              style={styles.whyCard}
            >

              <View
                style={[
                  styles.whyIcon,
                  {
                    backgroundColor:
                      item.color === COLORS.gold
                        ? "#FFF7DF"
                        : "#FFF0EF",
                  },
                ]}
              >

                <Ionicons
                  name={item.icon}
                  size={30}
                  color={item.color}
                />

              </View>

              <Text style={styles.whyCardTitle}>
                {item.title}
              </Text>

              <Text style={styles.whyCardSubtitle}>
                {item.subtitle}
              </Text>

            </View>
          ))}

        </View>

        {/* =================================================
            BOTTOM SPACE
        ================================================= */}

        <View style={{ height: 25 }} />

      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================================================
   MATCH CARD
===================================================== */

function MatchCard({ match, onPress }) {
  return (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={onPress}
      activeOpacity={0.9}
    >

      {/* IMAGE */}

      <View style={styles.matchImageContainer}>

        <Image
          source={match.image}
          style={styles.matchImage}
          resizeMode="cover"
        />

        {/* ONLINE */}

        <View style={styles.onlineBadge}>

          <View style={styles.onlineDot} />

          <Text style={styles.onlineText}>
            Online
          </Text>

        </View>

        {/* HEART */}

        <TouchableOpacity
          style={styles.heartButton}
          activeOpacity={0.8}
        >

          <Ionicons
            name="heart"
            size={19}
            color={COLORS.red}
          />

        </TouchableOpacity>

      </View>

      {/* INFO */}

      <View style={styles.matchInfo}>

        <View style={styles.nameRow}>

          <Text
            style={styles.matchName}
            numberOfLines={1}
          >
            {match.name}, {match.age}
          </Text>

          <Ionicons
            name="checkmark-circle"
            size={16}
            color={COLORS.green}
          />

        </View>

        <Text
          style={styles.profession}
          numberOfLines={1}
        >
          {match.profession}
        </Text>

        <View style={styles.detailRow}>

          <Ionicons
            name="location-outline"
            size={14}
            color={COLORS.red}
          />

          <Text
            style={styles.detailText}
            numberOfLines={1}
          >
            {match.location}
          </Text>

        </View>

        <View style={styles.detailRow}>

          <Ionicons
            name="resize-outline"
            size={14}
            color={COLORS.red}
          />

          <Text style={styles.detailText}>
            {match.height}
          </Text>

          <Ionicons
            name="people-outline"
            size={14}
            color={COLORS.red}
            style={{ marginLeft: 8 }}
          />

          <Text
            style={styles.detailText}
            numberOfLines={1}
          >
            {match.religion}
          </Text>

        </View>

      </View>

    </TouchableOpacity>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({

  /* =================================================
     MAIN
  ================================================= */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 92,
  },

  /* =================================================
     HEADER
  ================================================= */

  header: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  menuButton: {
    width: 42,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 58,
    height: 58,
  },

  brandContainer: {
    alignItems: "center",
    marginLeft: 5,
  },

  brandName: {
    color: COLORS.red,
    fontSize: width < 380 ? 22 : 25,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  brandDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
  },

  smallLine: {
    width: 18,
    height: 1,
    backgroundColor: COLORS.gold,
    marginHorizontal: 3,
  },

  brandMatrimony: {
    color: COLORS.text,
    fontSize: width < 380 ? 12 : 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginHorizontal: 3,
  },

  tagline: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
    textAlign: "center",
  },

  notificationButton: {
    width: 42,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-end",
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    top: 2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.brightRed,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },

  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },

  /* =================================================
     SEARCH
  ================================================= */

  searchBox: {
    height: 58,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 5,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: 10,
  },

  filterButton: {
    width: 47,
    height: 47,
    borderRadius: 13,
    backgroundColor: "#FFD548",
    justifyContent: "center",
    alignItems: "center",
  },

  /* =================================================
     HERO
  ================================================= */

  heroCard: {
    height: width < 400 ? 205 : 225,
    borderRadius: 21,
    overflow: "hidden",
    marginBottom: 15,

    shadowColor: COLORS.red,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 5,
  },

  heroGradient: {
    flex: 1,
    flexDirection: "row",
    overflow: "hidden",
  },

  heroText: {
    flex: 1,
    paddingLeft: 18,
    paddingTop: 22,
    paddingBottom: 15,
    zIndex: 2,
  },

  heroFind: {
    color: COLORS.white,
    fontSize: width < 400 ? 24 : 27,
    fontWeight: "500",
  },

  heroMatch: {
    color: "#FFD328",
    fontSize: width < 400 ? 24 : 28,
    fontWeight: "900",
    marginTop: 1,
  },

  heroDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },

  heroLine: {
    width: 27,
    height: 1,
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },

  teluguText: {
    color: COLORS.white,
    fontSize: width < 400 ? 13 : 14,
    fontWeight: "600",
    lineHeight: 21,
  },

  heroButton: {
    height: 38,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.yellow,
    borderRadius: 11,
    paddingHorizontal: 12,
    marginTop: 10,
  },

  heroButtonText: {
    color: "#3B1D00",
    fontSize: width < 400 ? 10.5 : 11.5,
    fontWeight: "800",
    marginLeft: 6,
  },

  heroImage: {
    width: width * 0.48,
    height: "100%",
    marginLeft: -5,
  },

  /* =================================================
     QUICK STATS
  ================================================= */

  statsContainer: {
    paddingVertical: 2,
    paddingBottom: 18,
    paddingRight: 8,
  },

  statCard: {
    width: 82,
    height: 88,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,

    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  statIconContainer: {
    position: "relative",
    marginBottom: 7,
  },

  statBadge: {
    position: "absolute",
    top: -9,
    right: -13,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: COLORS.brightRed,
    justifyContent: "center",
    alignItems: "center",
  },

  statBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },

  statLabel: {
    color: COLORS.text,
    fontSize: 11.5,
    fontWeight: "700",
  },

  /* =================================================
     SECTION HEADER
  ================================================= */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  seeAll: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "800",
  },

  /* =================================================
     MATCHES
  ================================================= */

  matchesContainer: {
    paddingBottom: 18,
    paddingRight: 10,
  },

  matchCard: {
    width: width < 400 ? 220 : 230,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    overflow: "hidden",
    marginRight: 12,

    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
  },

  matchImageContainer: {
    width: "100%",
    height: width < 300 ? 205 : 180,
    position: "relative",
  },

  matchImage: {
    width: "100%",
    height: "100%",
  },

  onlineBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#11A84A",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 4,
  },

  onlineText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },

  heartButton: {
    position: "absolute",
    right: 9,
    bottom: -15,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },

  matchInfo: {
    paddingHorizontal: 11,
    paddingTop: 17,
    paddingBottom: 12,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  matchName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginRight: 4,
    maxWidth: "88%",
  },

  profession: {
    color: COLORS.gray,
    fontSize: 12,
    marginBottom: 7,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  detailText: {
    flexShrink: 1,
    color: COLORS.gray,
    fontSize: 10.5,
    marginLeft: 4,
  },

  /* =================================================
     PREMIUM
  ================================================= */

  premiumBanner: {
    minHeight: 105,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 20,

    shadowColor: COLORS.gold,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 3,
  },

  premiumCrown: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.darkRed,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  premiumTextContainer: {
    flex: 1,
  },

  premiumTitle: {
    color: COLORS.darkRed,
    fontSize: width < 400 ? 13 : 14,
    fontWeight: "900",
    marginBottom: 3,
  },

  premiumSubtitle: {
    color: COLORS.text,
    fontSize: 10.5,
    lineHeight: 15,
  },

  upgradeNowButton: {
    minWidth: 95,
    height: 43,
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  upgradeNowText: {
    color: COLORS.white,
    fontSize: 11.5,
    fontWeight: "900",
    marginRight: 2,
  },

  /* =================================================
     WHY CHOOSE
  ================================================= */

  whyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  whyLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.7,
  },

  whyTitle: {
    color: COLORS.text,
    fontSize: width < 400 ? 15 : 17,
    fontWeight: "900",
    marginHorizontal: 9,
    textAlign: "center",
  },

  whyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  whyCard: {
    width: "23.5%",
    minHeight: 112,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,

    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  whyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 7,
  },

  whyCardTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },

  whyCardSubtitle: {
    color: COLORS.gray,
    fontSize: 9.5,
    textAlign: "center",
    marginTop: 2,
  },

});