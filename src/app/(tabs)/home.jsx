import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const COLORS = {
  red: "#D71920",
  yellow: "#FFC400",
  gold: "#E9A900",
  white: "#FFFFFF",
  green: "#0CB44B",
};

const profiles = [
  {
    id: 1,
    name: "Priyanka",
    age: 25,
    profession: "Software Engineer",
    location: "Hyderabad, Telangana",
    height: "5'4\"",
    religion: "Hindu - Mudhiraj",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700",
  },
  {
    id: 2,
    name: "Rohit",
    age: 27,
    profession: "Civil Engineer",
    location: "Vijayawada, Andhra Pradesh",
    height: "5'7\"",
    religion: "Hindu - Mudhiraj",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700",
  },
  {
    id: 3,
    name: "Deepika",
    age: 23,
    profession: "Teacher",
    location: "Warangal, Telangana",
    height: "5'3\"",
    religion: "Hindu - Mudhiraj",
    image:
      "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=700",
  },
];

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState([]);

  const toggleLike = (id) => {
    setLiked((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const goTo = (route) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.container}>
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {}}
          >
            <Ionicons
              name="menu"
              size={40}
              color={COLORS.red}
            />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoOm}>ॐ</Text>
              <Text style={styles.logoSmall}>M</Text>
            </View>

            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>
                MUDH I RAJ
              </Text>

              <Text style={styles.logoSubtitle}>
                MATRIMONY
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Ionicons
              name="notifications-outline"
              size={34}
              color="#333"
            />

            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= TAGLINE ================= */}

        <Text style={styles.tagline}>
          మన బంధం.. మన సంబంధం.. మన ముదిరాజ్
        </Text>

        {/* ================= SEARCH ================= */}

        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={32}
            color="#777"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, location or profession"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {}}
          >
            <Ionicons
              name="options-outline"
              size={30}
              color="#222"
            />
          </TouchableOpacity>
        </View>

        {/* ================= CONTENT ================= */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ================= HERO ================= */}

          <View style={styles.heroBanner}>
            <View style={styles.heroText}>
              <Text style={styles.findText}>
                Find Your
              </Text>

              <Text style={styles.perfectText}>
                Perfect Match
              </Text>

              <View style={styles.decorativeLine}>
                <View style={styles.decorLine} />

                <Text style={styles.decorHeart}>
                  ❧
                </Text>

                <View style={styles.decorLine} />
              </View>

              <Text style={styles.teluguHero}>
                సంస్కారం మనది...
              </Text>

              <Text style={styles.teluguHero}>
                సంబంధం మనది...
              </Text>

              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => {}}
              >
                <Ionicons
                  name="ribbon"
                  size={22}
                  color="#6B4500"
                />

                <Text style={styles.premiumButtonText}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroCouple}>
              <View style={styles.personCircle}>
                <Ionicons
                  name="people"
                  size={100}
                  color="#FFE082"
                />
              </View>
            </View>

            <View style={styles.flag}>
              <Text style={styles.flagText}>
                🚩
              </Text>
            </View>
          </View>

          {/* ================= QUICK ACTIONS ================= */}

          <View style={styles.quickActions}>
            <QuickAction
              icon="people"
              color="#C9141B"
              title="Matches"
              onPress={() => goTo("/matches")}
            />

            <QuickAction
              icon="person-add"
              color="#F2B600"
              title="Visitors"
              badge="12"
            />

            <QuickAction
              icon="heart"
              color="#D71920"
              title="Likes"
              badge="8"
            />

            <QuickAction
              icon="chatbubble-ellipses"
              color="#F2B600"
              title="Messages"
              badge="5"
              onPress={() => goTo("/chats")}
            />

            <QuickAction
              icon="star"
              color="#F2B600"
              title="Shortlist"
            />
          </View>

          {/* ================= RECOMMENDED ================= */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recommended Matches
            </Text>

            <TouchableOpacity
              onPress={() => goTo("/matches")}
            >
              <Text style={styles.seeAll}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.profileScroll}
          >
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isLiked={liked.includes(profile.id)}
                onLike={() => toggleLike(profile.id)}
                onPress={() =>
                  router.push({
                    pathname: "/profile-details",
                    params: {
                      id: String(profile.id),
                    },
                  })
                }
              />
            ))}
          </ScrollView>

          {/* ================= PREMIUM BANNER ================= */}

          <TouchableOpacity
            style={styles.upgradeBanner}
            onPress={() => {}}
            activeOpacity={0.9}
          >
            <View style={styles.crownCircle}>
              <Ionicons
                name="trophy"
                size={42}
                color="#FFD200"
              />
            </View>

            <View style={styles.upgradeTextContainer}>
              <Text style={styles.upgradeTitle}>
                Go Premium, Get Better Matches
              </Text>

              <Text style={styles.upgradeDescription}>
                Unlock all features & connect with
              </Text>

              <Text style={styles.upgradeDescription}>
                the right life partner
              </Text>
            </View>

            <View style={styles.upgradeNow}>
              <Text style={styles.upgradeNowText}>
                Upgrade Now
              </Text>

              <Ionicons
                name="chevron-forward"
                size={22}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          {/* ================= WHY CHOOSE ================= */}

          <View style={styles.whyHeader}>
            <View style={styles.smallLine} />

            <Text style={styles.whyTitle}>
              Why Choose Mudhiraj Matrimony?
            </Text>

            <View style={styles.smallLine} />
          </View>

          <View style={styles.features}>
            <Feature
              icon="shield-checkmark"
              title="100%"
              subtitle="Verified Profiles"
              color="#D71920"
            />

            <Feature
              icon="people"
              title="Trusted"
              subtitle="Community"
              color="#F0AD00"
            />

            <Feature
              icon="lock-closed"
              title="Privacy"
              subtitle="Protected"
              color="#D71920"
            />

            <Feature
              icon="headset"
              title="Dedicated"
              subtitle="Support"
              color="#F0AD00"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ========================================================= */
/* QUICK ACTION */
/* ========================================================= */

function QuickAction({
  icon,
  color,
  title,
  badge,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.quickCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {badge ? (
        <View style={styles.quickBadge}>
          <Text style={styles.quickBadgeText}>
            {badge}
          </Text>
        </View>
      ) : null}

      <Ionicons
        name={icon}
        size={42}
        color={color}
      />

      <View style={styles.quickDivider} />

      <Text style={styles.quickTitle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* ========================================================= */
/* PROFILE CARD */
/* ========================================================= */

function ProfileCard({
  profile,
  isLiked,
  onLike,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.profileCard}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: profile.image }}
          style={styles.profileImage}
        />

        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />

          <Text style={styles.onlineText}>
            Online
          </Text>
        </View>

        <TouchableOpacity
          style={styles.heartButton}
          onPress={onLike}
        >
          <Ionicons
            name={
              isLiked
                ? "heart"
                : "heart-outline"
            }
            size={30}
            color="#D71920"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text
            style={styles.profileName}
            numberOfLines={1}
          >
            {profile.name}, {profile.age}
          </Text>

          <Ionicons
            name="checkmark-circle"
            size={18}
            color="#10B94B"
          />
        </View>

        <Text style={styles.profession}>
          {profile.profession}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={17}
            color="#D71920"
          />

          <Text
            style={styles.infoText}
            numberOfLines={1}
          >
            {profile.location}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="man-outline"
            size={17}
            color="#D71920"
          />

          <Text style={styles.infoText}>
            {profile.height}
          </Text>

          <Ionicons
            name="people-outline"
            size={17}
            color="#D71920"
          />

          <Text
            style={styles.infoText}
            numberOfLines={1}
          >
            {profile.religion}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ========================================================= */
/* FEATURE */
/* ========================================================= */

function Feature({
  icon,
  title,
  subtitle,
  color,
}) {
  return (
    <View style={styles.featureCard}>
      <Ionicons
        name={icon}
        size={44}
        color={color}
      />

      <Text style={styles.featureTitle}>
        {title}
      </Text>

      <Text style={styles.featureSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingBottom: 30,
  },

  /* HEADER */

  header: {
    height: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },

  menuButton: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  logoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E7A600",
    backgroundColor: "#D71920",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  logoOm: {
    color: "#FFD200",
    fontSize: 22,
    fontWeight: "bold",
  },

  logoSmall: {
    color: "#FFD200",
    fontSize: 9,
    fontWeight: "bold",
  },

  logoTextContainer: {
    alignItems: "center",
  },

  logoTitle: {
    fontSize: 27,
    fontWeight: "900",
    color: COLORS.red,
    letterSpacing: 1,
  },

  logoSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 2,
    marginTop: 2,
  },

  notificationButton: {
    width: 48,
    alignItems: "flex-end",
    position: "relative",
  },

  notificationBadge: {
    position: "absolute",
    right: -3,
    top: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.red,
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  tagline: {
    textAlign: "center",
    color: COLORS.red,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 13,
  },

  /* SEARCH */

  searchWrapper: {
    height: 78,
    marginHorizontal: 26,
    borderWidth: 1.5,
    borderColor: "#F3B300",
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 7,
    marginBottom: 17,
  },

  searchInput: {
    flex: 1,
    fontSize: 18,
    marginLeft: 12,
    color: "#333",
  },

  filterButton: {
    width: 63,
    height: 63,
    borderRadius: 17,
    backgroundColor: "#FFD43D",
    alignItems: "center",
    justifyContent: "center",
  },

  /* HERO */

  heroBanner: {
    height: Math.min(
      Math.max(width * 0.46, 275),
      350
    ),
    marginHorizontal: 23,
    borderRadius: 25,
    backgroundColor: "#C90008",
    overflow: "hidden",
    position: "relative",
    flexDirection: "row",
  },

  heroText: {
    paddingLeft: 29,
    paddingTop: 40,
    zIndex: 5,
    width: "67%",
  },

  findText: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "500",
  },

  perfectText: {
    color: "#FFD000",
    fontSize: 33,
    fontWeight: "900",
    marginTop: 2,
  },

  decorativeLine: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },

  decorLine: {
    width: 65,
    height: 1,
    backgroundColor: "#FFFFFF",
  },

  decorHeart: {
    color: "#FFFFFF",
    fontSize: 18,
    marginHorizontal: 4,
  },

  teluguHero: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
  },

  premiumButton: {
    marginTop: 18,
    backgroundColor: "#FFD000",
    borderRadius: 19,
    height: 49,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  premiumButtonText: {
    color: "#5A3B00",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 7,
  },

  heroCouple: {
    position: "absolute",
    right: 15,
    bottom: -10,
    width: "40%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  personCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor:
      "rgba(255,190,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  flag: {
    position: "absolute",
    right: 10,
    top: 18,
  },

  flagText: {
    fontSize: 40,
  },

  /* QUICK ACTIONS */

  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 25,
    marginTop: 27,
    justifyContent: "space-between",
  },

  quickCard: {
    width: (width - 70) / 5,
    minHeight: 120,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0E0D4",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    elevation: 3,
    shadowColor: "#C69C78",
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  quickBadge: {
    position: "absolute",
    right: -2,
    top: -8,
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

  quickBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  quickDivider: {
    width: "80%",
    height: 1,
    backgroundColor: "#EEEEEE",
    marginTop: 10,
    marginBottom: 8,
  },

  quickTitle: {
    fontSize: 13,
    color: "#222",
    fontWeight: "600",
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 28,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#222",
  },

  seeAll: {
    color: COLORS.red,
    fontSize: 17,
    fontWeight: "700",
  },

  /* PROFILE */

  profileScroll: {
    paddingHorizontal: 25,
    paddingTop: 17,
    paddingBottom: 10,
  },

  profileCard: {
    width: Math.max(width * 0.31, 245),
    marginRight: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0DED0",
    elevation: 3,
    shadowColor: "#B98C70",
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  profileImageContainer: {
    height: 240,
    position: "relative",
    backgroundColor: "#EEE",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  onlineBadge: {
    position: "absolute",
    top: 12,
    left: 11,
    paddingHorizontal: 9,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 5,
  },

  onlineText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  heartButton: {
    position: "absolute",
    right: 10,
    bottom: -17,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },

  profileInfo: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileName: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#202020",
    marginRight: 5,
  },

  profession: {
    fontSize: 15,
    color: "#333",
    marginTop: 5,
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  infoText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
    flexShrink: 1,
    marginRight: 8,
  },

  /* UPGRADE */

  upgradeBanner: {
    marginHorizontal: 25,
    marginTop: 25,
    minHeight: 118,
    borderRadius: 22,
    backgroundColor: "#FFD21C",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },

  crownCircle: {
    width: 105,
    height: 125,
    marginLeft: -20,
    borderRadius: 63,
    backgroundColor: "#C80008",
    alignItems: "center",
    justifyContent: "center",
  },

  upgradeTextContainer: {
    flex: 1,
    paddingLeft: 12,
  },

  upgradeTitle: {
    fontSize: 17,
    color: "#B20D12",
    fontWeight: "900",
  },

  upgradeDescription: {
    color: "#222",
    fontSize: 13,
    marginTop: 4,
  },

  upgradeNow: {
    marginRight: 12,
    backgroundColor: COLORS.red,
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
  },

  upgradeNowText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  /* WHY */

  whyHeader: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  smallLine: {
    height: 1,
    width: 30,
    backgroundColor: COLORS.red,
    marginHorizontal: 6,
  },

  whyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#222",
  },

  features: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    marginTop: 20,
  },

  featureCard: {
    width: (width - 80) / 4,
    minHeight: 125,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F0DED0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    elevation: 2,
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginTop: 5,
  },

  featureSubtitle: {
    fontSize: 11,
    color: "#222",
    textAlign: "center",
    marginTop: 4,
  },
});