import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";

import {
  getBannerData,
  getBlogsData,
  getHappyStoriesData,
  getHowItWorksData,
  getNewMembersData,
  getPackagesData,
  getPremiumMembersData,
  getReviewsData,
  getTrustedByMillionsData,
} from "../utils/Functions";

const { width } = Dimensions.get("window");

/* =======
   COLORS
======= */

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

/* =======
   ASSETS
======= */

const LOGO = require("../assets/images/logo.png");

const HERO_IMAGE = require("../assets/images/banner9.png");

const MATCH_IMAGES = {
  Match1: require("../assets/images/Match1.png"),
  Match2: require("../assets/images/Match2.png"),
  Match3: require("../assets/images/Match3.png"),
};

/* ===
   DATA
   NOTE: icon fields below are now Feather names (a single,
   minimal icon set), swapped from the original Ionicons names.
======= */

const WHY_CHOOSE = [
  {
    id: "1",
    icon: "shield",
    title: "100%",
    subtitle: "Verified Profiles",
    color: COLORS.red,
  },
  {
    id: "2",
    icon: "users",
    title: "Trusted",
    subtitle: "Community",
    color: COLORS.gold,
  },
  {
    id: "3",
    icon: "lock",
    title: "Privacy",
    subtitle: "Protected",
    color: COLORS.red,
  },
  {
    id: "4",
    icon: "headphones",
    title: "Dedicated",
    subtitle: "Support",
    color: COLORS.gold,
  },
];

// Fallback membership plans shown until /getPackagesData returns real data.
const PACKAGES = [
  {
    id: "1",
    name: "Silver",
    price: "₹1,999",
    duration: "3 Months",
    recommended: false,
    features: [
      "50 Profile Views",
      "Chat with 10 Matches",
      "Basic Search Filters",
    ],
  },
  {
    id: "2",
    name: "Gold",
    price: "₹3,999",
    duration: "6 Months",
    recommended: true,
    features: [
      "Unlimited Profile Views",
      "Chat with 50 Matches",
      "Advanced Search Filters",
      "Priority Support",
    ],
  },
  {
    id: "3",
    name: "Platinum",
    price: "₹6,999",
    duration: "12 Months",
    recommended: false,
    features: [
      "Unlimited Everything",
      "Dedicated Relationship Manager",
      "Profile Highlighting",
      "Horoscope Matching",
    ],
  },
];

// Fallback happy-couple stories shown until /getHappyStoriesData returns real data.
const HAPPY_STORIES = [
  {
    id: "1",
    coupleName: "Ravi & Sindhu",
    marriedDate: "Feb 2025",
    story:
      "We found each other through Mudhiraj Matrimony and instantly connected over our shared values and love for family traditions.",
    image: MATCH_IMAGES.Match1,
  },
  {
    id: "2",
    coupleName: "Kiran & Anjali",
    marriedDate: "Nov 2024",
    story:
      "After months of searching, this platform helped us find a match that truly understood our community and culture.",
    image: MATCH_IMAGES.Match2,
  },
  {
    id: "3",
    coupleName: "Suresh & Padma",
    marriedDate: "Aug 2024",
    story:
      "Verified profiles gave us confidence from day one. We're grateful this app brought us together.",
    image: MATCH_IMAGES.Match3,
  },
];

// Fallback blog previews shown until /getBlogsData returns real data.
const BLOGS = [
  {
    id: "1",
    slug: "5-tips-for-a-successful-arranged-marriage",
    title: "5 Tips for a Successful Arranged Marriage",
    excerpt:
      "Discover how to build trust and understanding when starting your journey together.",
    category: "Relationships",
    readTime: "4 min read",
    image: MATCH_IMAGES.Match1,
  },
  {
    id: "2",
    slug: "understanding-mudhiraj-wedding-traditions",
    title: "Understanding Mudhiraj Wedding Traditions",
    excerpt:
      "A look at the customs and rituals that make our community's weddings special.",
    category: "Culture",
    readTime: "6 min read",
    image: MATCH_IMAGES.Match2,
  },
  {
    id: "3",
    slug: "how-to-write-a-profile-that-stands-out",
    title: "How to Write a Profile That Stands Out",
    excerpt: "Simple tips to help your profile attract the right matches.",
    category: "Tips",
    readTime: "3 min read",
    image: MATCH_IMAGES.Match3,
  },
];

// Fallback member reviews shown until /getReviewsData returns real data.
const REVIEWS = [
  {
    id: "1",
    name: "Lakshmi P.",
    rating: 5,
    comment:
      "Found my life partner within 2 months! The verification process gave me peace of mind.",
    image: MATCH_IMAGES.Match1,
  },
  {
    id: "2",
    name: "Venkat R.",
    rating: 5,
    comment:
      "Great community-focused platform. The support team was very helpful throughout.",
    image: MATCH_IMAGES.Match2,
  },
  {
    id: "3",
    name: "Sandhya K.",
    rating: 4,
    comment:
      "Easy to use app with genuine profiles. Highly recommend to anyone in our community.",
    image: MATCH_IMAGES.Match3,
  },
];

/* =======
   HOME SCREEN
======= */

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [whyChooseList, setWhyChooseList] = useState(WHY_CHOOSE);
  const [packages, setPackages] = useState(PACKAGES);
  const [happyStories, setHappyStories] = useState(HAPPY_STORIES);
  const [premiumMembers, setPremiumMembers] = useState([]);
  const [newMembers, setNewMembers] = useState([]);
  const [howItWorks, setHowItWorks] = useState([]);
  const [blogs, setBlogs] = useState(BLOGS);
  const [reviews, setReviews] = useState(REVIEWS);

  // Banner carousel state — array of { id, image, route? }.
  // Empty array means "use the static HERO_IMAGE fallback".
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const bannerScrollRef = useRef(null);

  const getToken = async () => {
    try {
      const possibleKeys = [
        "token",
        "access_token",
        "authToken",
        "userToken",
        "auth_token",
      ];
      for (const key of possibleKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) return value;
      }
      const userStr =
        (await AsyncStorage.getItem("user")) ||
        (await AsyncStorage.getItem("user_data"));
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          return (
            parsed?.token || parsed?.access_token || parsed?.data?.token || null
          );
        } catch (e) { }
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  // Normalizes an image field that might be a remote URL string, an
  // already-shaped { uri } object, or missing entirely.
  const resolveImage = (remoteValue, fallbackIndex = 0) => {
    if (!remoteValue) {
      const keys = Object.keys(MATCH_IMAGES);
      return MATCH_IMAGES[keys[fallbackIndex % keys.length]];
    }
    if (typeof remoteValue === "string") return { uri: remoteValue };
    if (typeof remoteValue === "object" && remoteValue.uri) return remoteValue;
    const keys = Object.keys(MATCH_IMAGES);
    return MATCH_IMAGES[keys[fallbackIndex % keys.length]];
  };

  // Some "icon" fields coming from the API are actually image URLs rather
  // than a Feather icon name (e.g. trusted-by-millions items). Detect that
  // so we render an <Image> instead of crashing/warning inside <Feather>.
  const isImageUrl = (value) =>
    typeof value === "string" && /^(https?:)?\/\//i.test(value.trim());

  const loadHomeData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = await getToken();

      const [
        trustedRes,
        storiesRes,
        packagesRes,
        premiumRes,
        bannerRes,
        newMembersRes,
        howItWorksRes,
        blogsRes,
        reviewsRes,
      ] = await Promise.all([
        getTrustedByMillionsData(token),
        getHappyStoriesData(token),
        getPackagesData(token),
        getPremiumMembersData(token),
        getBannerData(token),
        getNewMembersData(token),
        getHowItWorksData(token),
        getBlogsData(token),
        getReviewsData(token),
      ]);

      if (
        trustedRes?.success === 1 &&
        Array.isArray(trustedRes.data) &&
        trustedRes.data.length > 0
      ) {
        const formattedWhy = trustedRes.data
          .filter(Boolean)
          .map((item, idx) => ({
            id: String(item.id || idx + 1),
            icon:
              item.icon || item.image || (idx % 2 === 0 ? "shield" : "users"),
            title: item.title || item.name || "100%",
            subtitle:
              item.subtitle || item.review || item.description || "Verified",
            color: idx % 2 === 0 ? COLORS.red : COLORS.gold,
          }));
        setWhyChooseList(formattedWhy);
      }

      if (
        storiesRes?.success === 1 &&
        Array.isArray(storiesRes.data) &&
        storiesRes.data.length > 0
      ) {
        const formattedStories = storiesRes.data
          .filter(Boolean)
          .map((s, idx) => ({
            id: String(s.id || idx + 1),
            coupleName:
              s.couple_name || s.coupleName || s.name || `Couple ${idx + 1}`,
            marriedDate: s.married_date || s.marriedDate || s.date || "",
            story: s.story || s.description || s.message || "",
            image: resolveImage(s.photo || s.image || s.couple_photo, idx),
          }));
        setHappyStories(formattedStories);
      }

      if (
        packagesRes?.success === 1 &&
        Array.isArray(packagesRes.data) &&
        packagesRes.data.length > 0
      ) {
        const formattedPackages = packagesRes.data
          .filter(Boolean)
          .map((p, idx) => ({
            id: String(p.id || idx + 1),
            name: p.name || p.title || `Plan ${idx + 1}`,
            price: p.price || p.amount || "₹0",
            duration: p.duration || p.validity || "",
            recommended: !!(p.recommended || p.is_recommended || idx === 1),
            features: Array.isArray(p.features)
              ? p.features
              : Array.isArray(p.benefits)
                ? p.benefits
                : [],
          }));
        setPackages(formattedPackages);
      }

      if (premiumRes?.success === 1 && Array.isArray(premiumRes.data)) {
        const formattedPremium = premiumRes.data
          .filter(Boolean)
          .map((m, idx) => ({
            id: String(m.id || m.user_id || idx + 1),
            name: m.name || m.first_name || m.full_name || `Member ${idx + 1}`,
            memberId:
              m.member_id ||
              m.memberId ||
              m.member_code ||
              String(m.id || m.user_id || ""),
            age: m.age || 25,
            profession: m.profession || m.occupation || "Professional",
            location: m.location || m.city || m.residing_in || "Telangana",
            image: resolveImage(m.photo || m.profile_photo || m.image, idx),
          }));
        setPremiumMembers(formattedPremium);
      }

      if (newMembersRes?.success === 1 && Array.isArray(newMembersRes.data)) {
        const formattedNewMembers = newMembersRes.data
          .filter(Boolean)
          .map((m, idx) => ({
            id: String(m.id || m.user_id || idx + 1),
            name: m.name || m.first_name || m.full_name || `Member ${idx + 1}`,
            age: m.age || 25,
            profession: m.profession || m.occupation || "Professional",
            location: m.location || m.city || m.residing_in || "Telangana",
            joinedText: m.joined_text || m.joined_on || "New",
            image: resolveImage(m.photo || m.profile_photo || m.image, idx),
          }));
        setNewMembers(formattedNewMembers);
      }

      if (howItWorksRes?.success === 1 && Array.isArray(howItWorksRes.data)) {
        const formattedSteps = howItWorksRes.data
          .filter(Boolean)
          .map((s, idx) => ({
            id: String(s.id || idx + 1),
            step: s.step || s.order || idx + 1,
            icon:
              s.icon ||
              ["user-plus", "search", "message-circle", "heart"][idx % 4],
            title: s.title || s.name || `Step ${idx + 1}`,
            description: s.description || s.subtitle || "",
          }));
        setHowItWorks(formattedSteps);
      }

      if (
        blogsRes?.success === 1 &&
        Array.isArray(blogsRes.data) &&
        blogsRes.data.length > 0
      ) {
        const cleanText = (text) =>
          String(text || "")
            .replace(/\s+/g, " ")
            .trim();

        const formattedBlogs = blogsRes.data.filter(Boolean).map((b, idx) => ({
          id: String(b.id || idx + 1),
          slug: b.slug || null,
          title: b.title || b.name || `Blog ${idx + 1}`,
          excerpt: cleanText(b.short_description || b.description),
          category: b.category_name || b.category || "",
          readTime: b.read_time || b.readTime || "",
          image: resolveImage(
            b.banner || b.image || b.cover_image || b.photo,
            idx,
          ),
        }));
        setBlogs(formattedBlogs);
      }

      if (
        reviewsRes?.success === 1 &&
        Array.isArray(reviewsRes.data) &&
        reviewsRes.data.length > 0
      ) {
        const formattedReviews = reviewsRes.data
          .filter(Boolean)
          .map((r, idx) => ({
            id: String(r.id || idx + 1),
            name:
              r.name || r.reviewer_name || r.user_name || `Member ${idx + 1}`,
            rating: Number(r.rating || r.stars || 5),
            comment: r.comment || r.review || r.message || "",
            image: resolveImage(r.photo || r.image || r.avatar, idx),
          }));
        setReviews(formattedReviews);
      }

      if (
        bannerRes?.success === 1 &&
        Array.isArray(bannerRes.data) &&
        bannerRes.data.length > 0
      ) {
        const formattedBanners = bannerRes.data
          .filter(Boolean)
          .map((b, idx) => ({
            id: String(b.id || idx + 1),
            image: resolveImage(
              b.image || b.image_url || b.photo || b.banner_image,
              idx,
            ),
            route: b.route || b.link || b.deep_link || null,
          }));
        setBanners(formattedBanners);
        setActiveBannerIndex(0);
      } else {
        setBanners([]); // fall back to static HERO_IMAGE
      }
    } catch (err) {
      console.log("loadHomeData Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHomeData(false);
    }, []),
  );

  {
    /*const openNotifications = () => navigation.navigate("PrivacyPolicy");*/
  }
  const openSearch = () => navigation.navigate("Search");
  const openPremium = () => navigation.navigate("PremiumBenefits");
  const openPremiumBenefits = () => navigation.navigate("PremiumBenefits");
  const openProfile = (id) =>
    navigation.navigate("MatchesDetail", { id: String(id) });
  const openPackages = () => navigation.navigate("Packages");
  const openHappyStories = () => navigation.navigate("HappyStories");
  const openBlogs = () => navigation.navigate("Blogs");
  const openBlog = (blog) =>
    navigation.navigate("BlogDetail", { slug: blog.slug || blog.id });
  const openReviews = () => navigation.navigate("Reviews");

  const handleBannerPress = (banner) => {
    // if (banner?.route) navigation.navigate(banner.route);
    // else 
      openPremium();
  };

  const handleBannerScroll = (event) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    setActiveBannerIndex(index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHomeData(true)}
            colors={[COLORS.red]}
            tintColor={COLORS.red}
          />
        }
      >
        {/* ====== HEADER ====== */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <Feather name="menu" size={28} color={COLORS.red} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.logoRow}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              <View style={styles.brandContainer}>
                <Text style={styles.brandName}>MUDHIRAJ</Text>
                <View style={styles.brandDividerRow}>
                  <View style={styles.smallLine} />
                  <Feather name="circle" size={9} color={COLORS.gold} />
                  <Text style={styles.brandMatrimony}>MATRIMONY</Text>
                  <Feather name="circle" size={9} color={COLORS.gold} />
                  <View style={styles.smallLine} />
                </View>
              </View>
            </View>
            <Text style={styles.tagline}>
              మన బంధం.. మన సంప్రదాయం.. మన ముదిరాజ్
            </Text>
          </View>

          <View style={styles.headerActionsRow}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={openSearch}
              activeOpacity={0.7}
            >
              <Feather name="search" size={25} color={COLORS.text} />
            </TouchableOpacity>

            {/*<TouchableOpacity
              style={styles.headerIconButton}
              onPress={openNotifications}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={25} color={COLORS.text} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>*/}
          </View>
        </View>

        {/* ====== HERO BANNER CAROUSEL ====== */}
        {banners.length > 0 ? (
          <View style={styles.heroCard}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleBannerScroll}
            >
              {banners.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  activeOpacity={0.95}
                  onPress={() => handleBannerPress(banner)}
                  style={{ width: width - 28 }}
                >
                  <Image
                    source={banner.image}
                    style={styles.heroImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {banners.length > 1 && (
              <View style={styles.bannerDots}>
                {banners.map((banner, idx) => (
                  <View
                    key={banner.id}
                    style={[
                      styles.bannerDot,
                      idx === activeBannerIndex && styles.bannerDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.heroCard}
            onPress={openPremium}
            activeOpacity={0.95}
          >
            <Image
              source={HERO_IMAGE}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* ====== PREMIUM MEMBERS ====== */}
        {premiumMembers.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather
                  name="award"
                  size={14}
                  color={COLORS.gold}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>Premium Members</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("MatchesDetail")}
                activeOpacity={0.7}
              >
                {/*<Text style={styles.seeAll}>See All</Text>*/}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesContainer}
            >
              {premiumMembers.map((member) => (
                <PremiumMemberCard
                  key={member.id}
                  member={member}
                  onPress={() => openProfile(member.id)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* ====== NEW MEMBERS ====== */}
        {newMembers.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather
                  name="star"
                  size={15}
                  color={COLORS.gold}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>New Members</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate("NewMembers")}
                activeOpacity={0.7}
              >
                {/*<Text style={styles.seeAll}>See All</Text>*/}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesContainer}
            >
              {newMembers.map((member) => (
                <NewMemberCard
                  key={member.id}
                  member={member}
                  onPress={() => openProfile(member.id)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* ====== MEMBERSHIP PACKAGES ====== */}
        {packages.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather
                  name="gift"
                  size={13}
                  color={COLORS.red}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>Membership Plans</Text>
              </View>
              <TouchableOpacity onPress={openPackages} activeOpacity={0.7}>
                {/*<Text style={styles.seeAll}>See All</Text>*/}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesContainer}
            >
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onPress={openPremiumBenefits}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* ====== PREMIUM BANNER ====== */}
        <LinearGradient
          colors={["#FFF1C5", "#FFD84D", "#FFC400"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.premiumBanner}
        >
          <View style={styles.premiumCrown}>
            <Feather name="award" size={28} color={COLORS.gold} />
          </View>
          <View style={styles.premiumTextContainer}>
            <Text style={styles.premiumTitle}>
              Go Premium, Get Better Matches
            </Text>
            <Text style={styles.premiumSubtitle}>
              Unlock all features & connect with
            </Text>
            <Text style={styles.premiumSubtitle}>the right life partner</Text>
          </View>
          <TouchableOpacity
            style={styles.upgradeNowButton}
            onPress={openPremiumBenefits}
            activeOpacity={0.85}
          >
            <Text style={styles.upgradeNowText}>Upgrade Now</Text>
            <Feather name="chevron-right" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* ====== HAPPY STORIES ====== */}
        {happyStories.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather
                  name="heart"
                  size={16}
                  color={COLORS.red}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>Happy Stories</Text>
              </View>
              <TouchableOpacity onPress={openHappyStories} activeOpacity={0.7}>
                {/*<Text style={styles.seeAll}>See All</Text>*/}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesContainer}
            >
              {happyStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </ScrollView>
          </>
        )}

        {/* ====== HOW IT WORKS ====== */}
        {howItWorks.length > 0 && (
          <>
            <View style={styles.whyHeader}>
              <View style={styles.whyLine} />
              <Text style={styles.whyTitle}>How It Works</Text>
              <View style={styles.whyLine} />
            </View>

            <View style={styles.stepsRow}>
              {howItWorks.map((step, idx) => (
                <View key={step.id} style={styles.stepCard}>
                  <View style={styles.stepNumberBadge}>
                    <Text style={styles.stepNumberText}>{step.step}</Text>
                  </View>
                  <View style={styles.stepIconCircle}>
                    {isImageUrl(step.icon) ? (
                      <Image
                        source={{ uri: step.icon }}
                        style={styles.stepIconImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Feather name={step.icon} size={24} color={COLORS.red} />
                    )}
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  {!!step.description && (
                    <Text style={styles.stepDescription} numberOfLines={3}>
                      {step.description}
                    </Text>
                  )}
                  {idx < howItWorks.length - 1 && (
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={COLORS.gold}
                      style={styles.stepConnector}
                    />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* ====== BLOGS ====== */}
        {blogs.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Feather
                  name="file-text"
                  size={16}
                  color={COLORS.red}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>Latest Blogs</Text>
              </View>
              <TouchableOpacity onPress={openBlogs} activeOpacity={0.7}>
                {/*<Text style={styles.seeAll}>See All</Text>*/}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesContainer}
            >
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  onPress={() => openBlog(blog)}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* ====== WHY CHOOSE ====== */}
        <View style={styles.whyHeader}>
          <View style={styles.whyLine} />
          <Text style={styles.whyTitle}>Why Choose Mudhiraj Matrimony?</Text>
          <View style={styles.whyLine} />
        </View>

        <View style={styles.whyGrid}>
          {whyChooseList.map((item) => (
            <View key={item.id} style={styles.whyCard}>
              <View
                style={[
                  styles.whyIcon,
                  {
                    backgroundColor:
                      item.color === COLORS.gold ? "#FFF7DF" : "#FFF0EF",
                  },
                ]}
              >
                {isImageUrl(item.icon) ? (
                  <Image
                    source={{ uri: item.icon }}
                    style={styles.whyIconImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name={item.icon} size={30} color={item.color} />
                )}
              </View>
              <Text style={styles.whyCardTitle}>{item.title}</Text>
              <Text style={styles.whyCardSubtitle} numberOfLines={3}>
                {item.subtitle}
              </Text>
            </View>
          ))}
        </View>

        {/* ====== REVIEWS ====== */}
        {reviews.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 22 }]}>
              <View style={styles.sectionTitleRow}>
                <Feather
                  name="message-circle"
                  size={16}
                  color={COLORS.red}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionTitle}>What Our Members Say</Text>
              </View>
              <TouchableOpacity onPress={openReviews} activeOpacity={0.7}>
                {/*<Text style={styles.seeAll}>See All</Text>*/}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchesContainer}
            >
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: 25 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =======
   PREMIUM MEMBER CARD (full-bleed photo + bottom overlay)
======= */

function PremiumMemberCard({ member, onPress }) {
  return (
    <TouchableOpacity
      style={styles.premiumMemberCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={member.image}
        style={styles.premiumMemberImage}
        resizeMode="cover"
      />

      <View style={styles.premiumCrownBadge}>
        <Feather name="award" size={12} color={COLORS.darkRed} />
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.45)", "rgba(0,0,0,0.88)"]}
        style={styles.premiumMemberOverlay}
      >
        <Text style={styles.premiumMemberName} numberOfLines={1}>
          {member.name}
        </Text>
        <Text style={styles.premiumMemberId} numberOfLines={1}>
          Member ID:{" "}
          <Text style={styles.premiumMemberIdBold}>{member.memberId}</Text>
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* =======
   NEW MEMBER CARD (green "New" badge instead of Online/crown)
======= */

function NewMemberCard({ member, onPress }) {
  return (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.matchImageContainer}>
        <Image
          source={member.image}
          style={styles.matchImage}
          resizeMode="cover"
        />
        <View style={styles.newBadge}>
          <Feather name="star" size={10} color={COLORS.white} />
          <Text style={styles.newBadgeText}>{member.joinedText}</Text>
        </View>
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.matchName} numberOfLines={1}>
            {member.name}, {member.age}
          </Text>
          <Feather name="check-circle" size={16} color={COLORS.green} />
        </View>
        <Text style={styles.profession} numberOfLines={1}>
          {member.profession}
        </Text>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={14} color={COLORS.red} />
          <Text style={styles.detailText} numberOfLines={1}>
            {member.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* =======
   PACKAGE CARD
======= */

function PackageCard({ pkg, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.packageCard,
        pkg.recommended && styles.packageCardRecommended,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {pkg.recommended && (
        <View style={styles.packageBadge}>
          <Feather name="star" size={9} color={COLORS.white} />
          <Text style={styles.packageBadgeText}>BEST VALUE</Text>
        </View>
      )}

      <Text style={styles.packageName}>{pkg.name}</Text>

      <View style={styles.packagePriceRow}>
        <Text style={styles.packagePrice}>{pkg.price}</Text>
        {!!pkg.duration && (
          <Text style={styles.packageDuration}>/ {pkg.duration}</Text>
        )}
      </View>

      <View style={styles.packageFeaturesList}>
        {pkg.features.map((feature, idx) => (
          <View key={idx} style={styles.packageFeatureRow}>
            <Feather name="check-circle" size={15} color={COLORS.green} />
            <Text style={styles.packageFeatureText} numberOfLines={2}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.packageCTAButton}>
        <Text style={styles.packageCTAText}>Choose Plan</Text>
      </View>
    </TouchableOpacity>
  );
}

/* =======
   HAPPY STORY CARD
======= */

function StoryCard({ story }) {
  return (
    <View style={styles.storyCard}>
      <Image
        source={story.image}
        style={styles.storyImage}
        resizeMode="cover"
      />
      <View style={styles.storyContent}>
        <Feather
          name="heart"
          size={16}
          color={COLORS.red}
          style={{ marginBottom: 6 }}
        />
        <Text style={styles.storyText} numberOfLines={4}>
          {story.story}
        </Text>
        <View style={styles.storyFooterRow}>
          <Text style={styles.storyCoupleName} numberOfLines={1}>
            {story.coupleName}
          </Text>
          {!!story.marriedDate && (
            <View style={styles.storyDateBadge}>
              <Text style={styles.storyDateText}>{story.marriedDate}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

/* =======
   BLOG CARD
======= */

function BlogCard({ blog, onPress }) {
  return (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={blog.image} style={styles.blogImage} resizeMode="cover" />
      <View style={styles.blogContent}>
        {!!blog.category && (
          <View style={styles.blogCategoryTag}>
            <Text style={styles.blogCategoryText}>{blog.category}</Text>
          </View>
        )}
        <Text style={styles.blogTitle} numberOfLines={2}>
          {blog.title}
        </Text>
        <Text style={styles.blogExcerpt} numberOfLines={2}>
          {blog.excerpt}
        </Text>
        {!!blog.readTime && (
          <View style={styles.blogMetaRow}>
            <Feather name="clock" size={12} color={COLORS.gray} />
            <Text style={styles.blogMetaText}>{blog.readTime}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* =======
   REVIEW CARD
   NOTE: Feather has no separate filled/outline star, so the
   "unfilled" stars are shown by dimming the color instead of
   swapping the icon name (the original used star / star-outline).
======= */

function ReviewCard({ review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeaderRow}>
        <Image
          source={review.image}
          style={styles.reviewAvatar}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewName} numberOfLines={1}>
            {review.name}
          </Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Feather
                key={i}
                name="star"
                size={12}
                color={i <= review.rating ? COLORS.gold : COLORS.border}
              />
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment} numberOfLines={4}>
        {review.comment}
      </Text>
    </View>
  );
}

/* =======
   STYLES
======= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 92 },

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
  headerCenter: { flex: 1, alignItems: "center" },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 58, height: 58 },
  brandContainer: { alignItems: "center", marginLeft: 5 },
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
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    width: 40,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
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

  heroCard: {
    width: "100%",
    height: width * 0.43,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 2,
    marginBottom: 18,
    backgroundColor: "#C90000",
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 5,
  },
  heroImage: { width: "100%", height: "100%" },
  bannerDots: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  bannerDotActive: {
    width: 16,
    backgroundColor: COLORS.white,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  seeAll: { color: COLORS.red, fontSize: 13, fontWeight: "800" },

  matchesContainer: { paddingBottom: 18, paddingRight: 10 },
  matchCard: {
    width: width < 400 ? 220 : 230,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
  },
  matchImageContainer: {
    width: "100%",
    height: width < 300 ? 205 : 180,
    position: "relative",
  },
  matchImage: { width: "100%", height: "100%" },
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  newBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: "800" },
  matchInfo: { paddingHorizontal: 11, paddingTop: 17, paddingBottom: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  matchName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginRight: 4,
    maxWidth: "88%",
  },
  profession: { color: COLORS.gray, fontSize: 12, marginBottom: 7 },
  detailRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  detailText: {
    flexShrink: 1,
    color: COLORS.gray,
    fontSize: 10.5,
    marginLeft: 4,
  },

  /* ---------- Premium Member Card (full-bleed + overlay) ---------- */
  premiumMemberCard: {
    width: 170,
    height: 260,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 12,
    backgroundColor: COLORS.text,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumMemberImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  premiumCrownBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  premiumMemberOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 40,
    paddingBottom: 14,
  },
  premiumMemberName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  premiumMemberId: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "500",
  },
  premiumMemberIdBold: {
    color: COLORS.white,
    fontWeight: "800",
  },

  premiumBanner: {
    minHeight: 105,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 20,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 3 },
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
  premiumTextContainer: { flex: 1 },
  premiumTitle: {
    color: COLORS.darkRed,
    fontSize: width < 400 ? 13 : 14,
    fontWeight: "900",
    marginBottom: 3,
  },
  premiumSubtitle: { color: COLORS.text, fontSize: 10.5, lineHeight: 15 },
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

  whyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  whyLine: { flex: 1, height: 1, backgroundColor: COLORS.gold, opacity: 0.7 },
  whyTitle: {
    color: COLORS.text,
    fontSize: width < 400 ? 15 : 17,
    fontWeight: "900",
    marginHorizontal: 9,
    textAlign: "center",
  },

  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  stepCard: {
    width: "23.5%",
    alignItems: "center",
    position: "relative",
  },
  stepNumberBadge: {
    position: "absolute",
    top: -4,
    right: "18%",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.darkRed,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  stepNumberText: { color: COLORS.white, fontSize: 9, fontWeight: "900" },
  stepIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF0EF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  stepIconImage: { width: "100%", height: "100%" },
  stepTitle: {
    color: COLORS.text,
    fontSize: 11.5,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 3,
  },
  stepDescription: {
    color: COLORS.gray,
    fontSize: 9.5,
    textAlign: "center",
    lineHeight: 13,
  },
  stepConnector: {
    position: "absolute",
    top: 18,
    right: -14,
  },
  whyGrid: { flexDirection: "row", justifyContent: "space-between" },
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
    shadowOffset: { width: 0, height: 2 },
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
    overflow: "hidden",
  },
  whyIconImage: { width: "100%", height: "100%" },
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

  /* ---------- Package Card ---------- */
  packageCard: {
    width: 215,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 16,
    marginRight: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 3,
  },
  packageCardRecommended: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  packageBadge: {
    position: "absolute",
    top: -11,
    alignSelf: "center",
    backgroundColor: COLORS.darkRed,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  packageBadgeText: { color: COLORS.white, fontSize: 9, fontWeight: "800" },
  packageName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 6,
    marginBottom: 4,
  },
  packagePriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  packagePrice: { color: COLORS.red, fontSize: 22, fontWeight: "900" },
  packageDuration: { color: COLORS.gray, fontSize: 12, marginLeft: 4 },
  packageFeaturesList: { marginBottom: 14 },
  packageFeatureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 7,
    gap: 6,
  },
  packageFeatureText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11.5,
    lineHeight: 15,
  },
  packageCTAButton: {
    height: 42,
    backgroundColor: COLORS.red,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  packageCTAText: { color: COLORS.white, fontSize: 13, fontWeight: "800" },

  /* ---------- Happy Story Card ---------- */
  storyCard: {
    width: 260,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  storyImage: { width: "100%", height: 130 },
  storyContent: { padding: 14 },
  storyText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  storyFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  storyCoupleName: {
    color: COLORS.darkRed,
    fontSize: 12.5,
    fontWeight: "800",
    flexShrink: 1,
    marginRight: 6,
  },
  storyDateBadge: {
    backgroundColor: "#FFF0EF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  storyDateText: { color: COLORS.red, fontSize: 10, fontWeight: "700" },

  /* ---------- Blog Card ---------- */
  blogCard: {
    width: 220,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    overflow: "hidden",
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  blogImage: { width: "100%", height: 110 },
  blogContent: { padding: 12 },
  blogCategoryTag: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightGold,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  blogCategoryText: { color: COLORS.darkRed, fontSize: 9.5, fontWeight: "800" },
  blogTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 5,
    lineHeight: 17,
  },
  blogExcerpt: {
    color: COLORS.gray,
    fontSize: 10.5,
    lineHeight: 14,
    marginBottom: 8,
  },
  blogMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  blogMetaText: { color: COLORS.gray, fontSize: 10, fontWeight: "600" },

  /* ---------- Review Card ---------- */
  reviewCard: {
    width: 240,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    gap: 10,
  },
  reviewAvatar: { width: 42, height: 42, borderRadius: 21 },
  reviewName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 3,
  },
  starRow: { flexDirection: "row", gap: 2 },
  reviewComment: { color: COLORS.gray, fontSize: 11.5, lineHeight: 16 },
});
