import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import LinearGradient from "react-native-linear-gradient";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Fonts } from "../constants/Fonts";
import { getPackagesData } from "../utils/Functions";

/* =====
   RESPONSIVE SCALE
===== */

const { width } = Dimensions.get("window");

const BASE_WIDTH = 390;

const scale = (size) => {
  const factor = width / BASE_WIDTH;

  return Math.round(size * Math.min(factor, 1.12));
};

/* =====
   COLORS
===== */

const COLORS = {
  white: "#FFFFFF",

  red: "#E51F35",
  darkRed: "#B50013",
  redText: "#D7192D",

  title: "#171B35",
  text: "#34384C",
  muted: "#777A88",

  border: "#E4E5E8",

  green: "#24913A",

  purple: "#7025C4",

  blue: "#1764C0",

  orange: "#E67E00",

  yellow: "#FFD83D",
};

/* =====
   TOP FEATURES
===== */

const FEATURES = [
  {
    icon: "heart",
    label: "Express",
    label2: "Interest",
    color: "#E31E2F",
  },

  {
    icon: "user",
    label: "Contact",
    label2: "Details",
    color: "#E31E2F",
  },

  {
    icon: "image",
    label: "Photo",
    label2: "Gallery",
    color: "#E31E2F",
  },

  {
    icon: "eye",
    label: "Profile",
    label2: "Views",
    color: "#F3A500",
  },

  {
    icon: "images",
    label: "Gallery",
    label2: "Views",
    color: "#E31E2F",
  },

  {
    icon: "star",
    label: "Auto",
    label2: "Matches",
    color: "#E67E00",
  },
];

/* =====
   NORMALIZE API RESPONSE
===== */

const normalizePackage = (apiItem = {}) => {
  return {
    id: apiItem.id ?? apiItem._id ?? apiItem.package_id,
    name: apiItem.name ?? apiItem.title ?? "Package",
    subtitle: apiItem.subtitle ?? apiItem.description ?? "",
    days:
      apiItem.days ??
      (apiItem.validity_days ? `${apiItem.validity_days} Days` : ""),
    image: apiItem.image_url
      ? {
        uri: apiItem.image_url,
      }
      : apiItem.image
        ? {
          uri: apiItem.image,
        }
        : null,
    oldPrice: apiItem.old_price ?? apiItem.oldPrice ?? "",
    price: apiItem.price ?? "",
    discount: apiItem.discount_label ?? apiItem.discount ?? "",
    express: String(apiItem.express_interest_limit ?? apiItem.express ?? "0"),
    contact: String(apiItem.contact_details_limit ?? apiItem.contact ?? "0"),
    gallery: String(apiItem.gallery_limit ?? apiItem.gallery ?? "0"),
    views: apiItem.profile_views_limit ?? apiItem.views ?? "0",
    galleryView: Boolean(apiItem.gallery_image_view ?? apiItem.galleryView),
    autoMatch: Boolean(apiItem.auto_profile_match ?? apiItem.autoMatch),
    buttonColor: apiItem.button_color ?? apiItem.buttonColor ?? "#E51F35",
    badge:
      apiItem.is_popular || apiItem.badge === true
        ? "MOST POPULAR"
        : (apiItem.badge ?? null),
    dayBg: apiItem.day_bg_color ?? apiItem.dayBg ?? "#FFF2D5",
    dayColor: apiItem.day_text_color ?? apiItem.dayColor ?? "#E99A00",
  };
};

/* =====
   FEATURE ITEM
===== */

const FeatureItem = ({ icon, value, title, color, bg }) => {
  return (
    <View style={styles.packageFeature}>
      <View
        style={[
          styles.packageFeatureIcon,
          {
            backgroundColor: bg,
          },
        ]}
      >
        <Feather name={icon} size={scale(20)} color={color} />
      </View>

      <View style={styles.featureText}>
        <Text
          style={[
            styles.featureValue,
            {
              color,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {value}
        </Text>

        <Text style={styles.featureLabel} numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
};

/* =====
   EXTRA FEATURE
===== */

const ExtraFeature = ({ enabled, children }) => {
  return (
    <View style={styles.extraFeatureItem}>
      <View style={[styles.checkCircle, !enabled && styles.crossCircle]}>
        <Feather
          name={enabled ? "check" : "x"}
          size={scale(14)}
          color={enabled ? "#258A2C" : "#E11E2E"}
        />
      </View>

      <Text style={styles.extraFeatureText} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
};

/* =====
   PACKAGE CARD
===== */

const PackageCard = ({ item, onPress }) => {
  return (
    <View style={[styles.packageCard, item.badge && styles.popularCard]}>
      {/* ===
          POPULAR BADGE
      === */}

      {item.badge && (
        <View style={styles.popularBadge}>
          <MaterialCommunityIcons
            name="crown"
            size={scale(17)}
            color={COLORS.yellow}
          />

          <Text style={styles.popularText}>{item.badge}</Text>
        </View>
      )}

      {/* ===
          PACKAGE MAIN CONTENT
      === */}

      <View
        style={[styles.packageContent, item.badge && styles.popularContent]}
      >
        {/* ===
            IMAGE
        === */}

        <View style={styles.packageImageContainer}>
          {item.image ? (
            <Image
              source={item.image}
              style={styles.packageImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.packageImage,
                {
                  backgroundColor: "#F4F4F4",
                },
              ]}
            />
          )}
        </View>

        {/* ===
            RIGHT DETAILS
        === */}

        <View style={styles.packageDetails}>
          <View style={styles.packageTitleRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.packageName} numberOfLines={2}>
                {item.name}
              </Text>

              <Text style={styles.packageSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </View>

            {!!item.days && (
              <View
                style={[
                  styles.daysBadge,
                  {
                    backgroundColor: item.dayBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.daysText,
                    {
                      color: item.dayColor,
                    },
                  ]}
                >
                  {item.days}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ===
          FEATURES SECTION
      === */}

      <View style={styles.featuresSection}>
        <View style={styles.packageFeaturesGrid}>
          <FeatureItem
            icon="heart"
            value={item.express}
            title={
              <>
                Express{"\n"}
                Interest
              </>
            }
            color="#D7192D"
            bg="#FFF0ED"
          />

          <FeatureItem
            icon="user"
            value={item.contact}
            title={
              <>
                Contact{"\n"}
                Details
              </>
            }
            color="#24913A"
            bg="#EFF9E9"
          />

          <FeatureItem
            icon="image"
            value={item.gallery}
            title={
              <>
                Photo{"\n"}
                Gallery
              </>
            }
            color="#7025C4"
            bg="#F5E9FF"
          />

          <FeatureItem
            icon="eye"
            value={item.views}
            title={
              <>
                Profile{"\n"}
                Views
              </>
            }
            color="#1764C0"
            bg="#EAF3FF"
          />
        </View>

        {/* ===
            EXTRA FEATURES
        === */}

        <View style={styles.extraFeatures}>
          <ExtraFeature enabled={item.galleryView}>
            Gallery Image View
          </ExtraFeature>

          <ExtraFeature enabled={item.autoMatch}>
            Auto Profile Match
          </ExtraFeature>
        </View>

        {/* ===
            DIVIDER
        === */}

        <View style={styles.divider} />

        {/* ===
            PRICE AREA
        === */}

        <View style={styles.bottomPackageRow}>
          {/* PRICE */}

          <View style={styles.priceContainer}>
            <View style={styles.priceTexts}>
              {!!item.oldPrice && (
                <Text style={styles.oldPrice}>{item.oldPrice}</Text>
              )}

              <Text style={styles.currentPrice}>{item.price}</Text>
            </View>

            {!!item.discount && (
              <View
                style={[
                  styles.discountBadge,
                  {
                    backgroundColor: item.dayBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.discountText,
                    {
                      color: item.dayColor,
                    },
                  ]}
                >
                  {item.discount}
                </Text>
              </View>
            )}
          </View>

          {/* BUTTON */}

          <TouchableOpacity
            style={[
              styles.chooseButton,
              {
                backgroundColor: item.buttonColor,
              },
            ]}
            activeOpacity={0.85}
            onPress={() => {
              onPress?.(item);
            }}
          >
            <Text style={styles.chooseButtonText}>Choose Package</Text>

            <Feather name="chevron-right" size={scale(18)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function ChoosePackageScreen({ navigation, route }) {


  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    }
  }, [navigation]);


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => {
        subscription.remove();
      };
    }, [handleBack]),
  );

  /* ===
     FETCH PACKAGES
  === */

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);

      setError(null);

      const response = await getPackagesData();

      const rawList = Array.isArray(response)
        ? response
        : (response?.data ?? response?.packages ?? []);

      const normalized = rawList.map(normalizePackage);

      setPackages(normalized);
    } catch (err) {
      console.log("FAILED TO LOAD PACKAGES:", err);

      setError("Couldn't load packages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===
     INITIAL LOAD
  === */

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  /* ===
     CHOOSE PACKAGE
  === */

  const handleChoosePackage = (item) => {

    navigation.navigate("Payment", {
      packageId: item.id,
      package: item,
      page: route?.name, prevs: route?.params
    });
  };

  /* ===
     UI
  === */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===
            HEADER
        === */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={scale(26)} color="#D51D2C" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Choose Your Package
          </Text>

          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ===
            HERO
        === */}

        <View style={styles.hero}>
          <LinearGradient
            colors={["#B50013", "#DD172A", "#B50013"]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.heroGradient}
          >
            {/* TEXT */}

            <View style={styles.heroTextContainer}>
              <Text style={styles.heroSmallTitle}>Find Your</Text>

              <Text style={styles.heroTitle}>Perfect Match</Text>

              <Text style={styles.heroDescription}>
                Choose the perfect package and
              </Text>

              <Text style={styles.heroDescription}>
                start your journey towards happiness
              </Text>
            </View>

            {/* COUPLE */}

            <Image
              source={require("../assets/images/couple.png")}
              style={styles.coupleImage}
              resizeMode="contain"
            />

            {/* DECORATIVE HEART */}

            <Text style={styles.decorHeart}>♡</Text>
          </LinearGradient>
        </View>

        {/* ===
            TOP FEATURES
        === */}

        <View style={styles.featureBar}>
          {FEATURES.map((item, index) => (
            <View style={styles.topFeature} key={`${item.label}-${index}`}>
              <View
                style={[
                  styles.topFeatureIcon,
                  {
                    backgroundColor: index === 3 ? "#FFF7DF" : "#FFF8E9",
                  },
                ]}
              >
                <Feather name={item.icon} size={scale(21)} color={item.color} />
              </View>

              <Text style={styles.topFeatureText}>{item.label}</Text>

              <Text style={styles.topFeatureText}>{item.label2}</Text>
            </View>
          ))}
        </View>

        {/* ===
            PACKAGES
        === */}

        <View style={styles.packagesContainer}>
          <Text style={styles.sectionTitle}>
            Choose the package that suits you
          </Text>

          <Text style={styles.sectionSubtitle}>
            Get more features and better opportunities
          </Text>

          {/* ===
              LOADING
          === */}

          {loading && (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color="#E51F35" />
            </View>
          )}

          {/* ===
              ERROR
          === */}

          {!loading && error && (
            <View style={styles.stateContainer}>
              <Text style={styles.errorText}>{error}</Text>

              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.85}
                onPress={fetchPackages}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===
              EMPTY
          === */}

          {!loading && !error && packages.length === 0 && (
            <View style={styles.stateContainer}>
              <Text style={styles.errorText}>
                No packages available right now.
              </Text>
            </View>
          )}

          {/* ===
              PACKAGE LIST
          === */}

          {!loading &&
            !error &&
            packages.map((item, index) => (
              <PackageCard
                key={item.id ?? index}
                item={item}
                onPress={handleChoosePackage}
              />
            ))}
        </View>

        {/* ===
            SECURITY BAR
        === */}

        <View style={styles.securityBar}>
          {/* SECURE */}

          <View style={styles.securityItem}>
            <Feather name="shield" size={scale(25)} color="#E21D32" />

            <Text style={styles.securityText}>100% Secure{"\n"}& Verified</Text>
          </View>

          <View style={styles.securityDivider} />

          {/* SUPPORT */}

          <View style={styles.securityItem}>
            <Feather name="headphones" size={scale(25)} color="#E21D32" />

            <Text style={styles.securityText}>
              Priority{"\n"}
              Support
            </Text>
          </View>

          <View style={styles.securityDivider} />

          {/* PRICE */}

          <View style={styles.securityItem}>
            <Text style={styles.rupeeIcon}>₹</Text>

            <Text style={styles.securityText}>
              Best Price{"\n"}
              Guarantee
            </Text>
          </View>

          <View style={styles.securityDivider} />

          {/* TRUST */}

          <View style={styles.securityItem}>
            <Feather name="award" size={scale(25)} color="#E21D32" />

            <Text style={styles.securityText}>
              Trusted by{"\n"}
              Thousands
            </Text>
          </View>
        </View>

        {/* ===
            BOTTOM SECURE
        === */}

        <View style={styles.bottomSecure}>
          <Feather name="lock" size={scale(17)} color="#777987" />

          <Text style={styles.bottomSecureText}>
            Secure payments. Cancel anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====
   STYLES
===== */

const styles = StyleSheet.create({
  /* =======
     SCREEN
  ======= */

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingBottom: scale(35),
  },

  /* =======
     HEADER
  ======= */

  header: {
    height: scale(76),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  backButton: {
    position: "absolute",
    left: scale(10),
    width: scale(48),
    height: scale(48),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: scale(24),
  },

  headerTitle: {
    fontSize: scale(23),
    fontFamily: Fonts.display.bold,
    color: "#8E2026",
    letterSpacing: -0.3,
    maxWidth: "70%",
    textAlign: "center",
  },

  logoContainer: {
    position: "absolute",
    right: scale(10),
    width: scale(55),
    height: scale(55),
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: scale(52),
    height: scale(52),
  },

  /* =======
     HERO
  ======= */

  hero: {
    height: scale(218),
    overflow: "hidden",
    borderBottomLeftRadius: scale(22),
    borderBottomRightRadius: scale(22),
  },

  heroGradient: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },

  heroTextContainer: {
    position: "absolute",
    left: scale(22),
    top: scale(29),
    zIndex: 5,
    width: "65%",
  },

  // NOTE: hero titles intentionally keep their own decorative serif
  // font (Georgia / serif) rather than the app's Poppins Fonts set —
  // left untouched here since that looks like a deliberate design choice.
  heroSmallTitle: {
    color: "#FFFFFF",
    fontSize: scale(23),
    fontFamily: Fonts.bold,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: scale(2),
  },

  heroTitle: {
    color: "#FFE153",
    fontSize: scale(34),
    fontFamily: Fonts.bold,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    lineHeight: scale(40),
    marginBottom: scale(13),
  },

  heroDescription: {
    color: "#FFFFFF",
    fontSize: scale(12.5),
    fontFamily: Fonts.body.medium,
    lineHeight: scale(18),
    maxWidth: scale(245),
  },

  coupleImage: {
    position: "absolute",
    right: scale(-12),
    bottom: scale(-6),
    width: scale(235),
    height: scale(205),
    zIndex: 3,
  },

  decorHeart: {
    position: "absolute",
    right: scale(151),
    top: scale(31),
    color: "#E8B04B",
    fontSize: scale(44),
    fontFamily: Fonts.medium,
    zIndex: 2,
  },

  /* =======
     TOP FEATURE BAR
  ======= */

  featureBar: {
    marginHorizontal: scale(14),
    marginTop: scale(-31),
    height: scale(105),
    borderRadius: scale(21),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(5),
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },

  topFeature: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },

  topFeatureIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(5),
  },

  topFeatureText: {
    color: "#13182D",
    fontSize: scale(9.5),
    fontFamily: Fonts.body.bold,
    lineHeight: scale(12),
    textAlign: "center",
  },

  /* =======
     PACKAGES
  ======= */

  packagesContainer: {
    marginTop: scale(27),
    paddingHorizontal: scale(14),
  },

  sectionTitle: {
    color: "#171B35",
    fontSize: scale(19),
    fontFamily: Fonts.display.bold,
    textAlign: "center",
    marginBottom: scale(4),
  },

  sectionSubtitle: {
    color: "#777A88",
    fontSize: scale(11.5),
    fontFamily: Fonts.body.medium,
    textAlign: "center",
    marginBottom: scale(17),
  },

  /* =======
     STATES
  ======= */

  stateContainer: {
    width: "100%",
    paddingVertical: scale(34),
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    color: "#777987",
    fontSize: scale(13),
    fontFamily: Fonts.body.semiBold,
    textAlign: "center",
    marginBottom: scale(14),
  },

  retryButton: {
    minHeight: scale(42),
    minWidth: scale(120),
    paddingHorizontal: scale(18),
    borderRadius: scale(22),
    backgroundColor: "#E51F35",
    alignItems: "center",
    justifyContent: "center",
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: scale(12.5),
    fontFamily: Fonts.body.bold,
  },

  /* =======
     PACKAGE CARD
  ======= */

  packageCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: scale(18),
    marginBottom: scale(17),
    borderWidth: 1,
    borderColor: "#E4E5E8",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },

  popularCard: {
    borderColor: "#F0B323",
    borderWidth: scale(1.5),
  },

  /* =======
     POPULAR BADGE
  ======= */

  popularBadge: {
    position: "absolute",
    top: 0,
    left: scale(12),
    height: scale(31),
    minWidth: scale(132),
    paddingHorizontal: scale(10),
    backgroundColor: "#E51D2F",
    borderBottomLeftRadius: scale(3),
    borderBottomRightRadius: scale(7),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  popularText: {
    color: "#FFFFFF",
    fontSize: scale(10),
    fontFamily: Fonts.body.bold,
    letterSpacing: 0.2,
    marginLeft: scale(5),
  },

  /* =======
     PACKAGE CONTENT
  ======= */

  packageContent: {
    flexDirection: "row",
    paddingHorizontal: scale(13),
    paddingTop: scale(14),
    paddingBottom: scale(12),
  },

  popularContent: {
    paddingTop: scale(43),
  },

  /* =======
     IMAGE
  ======= */

  packageImageContainer: {
    width: scale(108),
    height: scale(108),
    borderRadius: scale(14),
    overflow: "hidden",
    backgroundColor: "#F4F4F4",
    flexShrink: 0,
  },

  packageImage: {
    width: "100%",
    height: "100%",
  },

  /* =======
     DETAILS
  ======= */

  packageDetails: {
    flex: 1,
    marginLeft: scale(13),
    minWidth: 0,
    justifyContent: "flex-start",
  },

  packageTitleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: 0,
  },

  titleContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: scale(6),
  },

  packageName: {
    color: "#111735",
    fontSize: scale(18),
    fontFamily: Fonts.display.bold,
    lineHeight: scale(22),
    letterSpacing: -0.15,
  },

  packageSubtitle: {
    color: "#5D6070",
    fontSize: scale(11.5),
    fontFamily: Fonts.body.medium,
    lineHeight: scale(16),
    marginTop: scale(4),
  },

  /* =======
     DAYS BADGE
  ======= */

  daysBadge: {
    minWidth: scale(70),
    height: scale(33),
    paddingHorizontal: scale(8),
    borderRadius: scale(11),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: scale(2),
  },

  daysText: {
    fontSize: scale(11.5),
    fontFamily: Fonts.body.bold,
    lineHeight: scale(14),
  },

  /* =======
     FEATURES
  ======= */

  featuresSection: {
    paddingHorizontal: scale(13),
    paddingBottom: scale(13),
  },

  packageFeaturesGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: scale(11),
  },

  packageFeature: {
    width: "48.5%",
    minHeight: scale(43),
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  packageFeatureIcon: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(10),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  featureText: {
    flex: 1,
    minWidth: 0,
    marginLeft: scale(7),
  },

  featureValue: {
    fontSize: scale(14),
    fontFamily: Fonts.body.bold,
    lineHeight: scale(16),
    includeFontPadding: false,
  },

  featureLabel: {
    color: "#34384C",
    fontSize: scale(10.5),
    fontFamily: Fonts.body.semiBold,
    lineHeight: scale(13),
    includeFontPadding: false,
  },

  /* =======
     EXTRA FEATURES
  ======= */

  extraFeatures: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scale(15),
  },

  extraFeatureItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  checkCircle: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: "#E4F5DC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(5),
    flexShrink: 0,
  },

  crossCircle: {
    backgroundColor: "#FFF0F0",
  },

  extraFeatureText: {
    flex: 1,
    color: "#373A4E",
    fontSize: scale(10),
    fontFamily: Fonts.body.semiBold,
    lineHeight: scale(13),
    includeFontPadding: false,
  },

  /* =======
     DIVIDER
  ======= */

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E5E5E5",
    marginTop: scale(14),
  },

  /* =======
     PRICE
  ======= */

  bottomPackageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scale(13),
    minWidth: 0,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    minWidth: 0,
  },

  priceTexts: {
    flexDirection: "row",
    alignItems: "baseline",
    flexShrink: 1,
    minWidth: 0,
  },

  oldPrice: {
    color: "#777985",
    fontSize: scale(10.5),
    fontFamily: Fonts.body.semiBold,
    textDecorationLine: "line-through",
    marginRight: scale(6),
    includeFontPadding: false,
  },

  currentPrice: {
    color: "#B7192B",
    fontSize: scale(21),
    fontFamily: Fonts.display.bold,
    lineHeight: scale(25),
    marginRight: scale(7),
    includeFontPadding: false,
  },

  /* =======
     DISCOUNT
  ======= */

  discountBadge: {
    minHeight: scale(27),
    paddingHorizontal: scale(7),
    borderRadius: scale(6),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  discountText: {
    fontSize: scale(10),
    fontFamily: Fonts.body.bold,
    lineHeight: scale(13),
    includeFontPadding: false,
  },

  /* =======
     CHOOSE BUTTON
  ======= */

  chooseButton: {
    minHeight: scale(42),
    minWidth: scale(125),
    paddingHorizontal: scale(10),
    borderRadius: scale(22),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: scale(8),
  },

  chooseButtonText: {
    color: "#FFFFFF",
    fontSize: scale(11),
    fontFamily: Fonts.body.bold,
    marginRight: scale(4),
    includeFontPadding: false,
  },

  /* =======
     SECURITY BAR
  ======= */

  securityBar: {
    marginHorizontal: scale(14),
    marginTop: scale(2),
    minHeight: scale(94),
    borderRadius: scale(17),
    backgroundColor: "#FFF7F8",
    borderWidth: 1,
    borderColor: "#F0D9DD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(3),
  },

  securityItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: scale(2),
  },

  securityText: {
    color: "#20233A",
    fontSize: scale(9.5),
    fontFamily: Fonts.body.bold,
    lineHeight: scale(13),
    textAlign: "center",
    marginTop: scale(5),
    includeFontPadding: false,
  },

  securityDivider: {
    width: 1,
    height: scale(49),
    backgroundColor: "#DACCCE",
  },

  /* =======
     RUPEE
  ======= */

  rupeeIcon: {
    width: scale(34),
    height: scale(34),
    borderWidth: 1.5,
    borderColor: "#E21D32",
    borderRadius: scale(17),
    color: "#E21D32",
    fontSize: scale(20),
    fontFamily: Fonts.body.bold,
    textAlign: "center",
    lineHeight: scale(31),
    includeFontPadding: false,
  },

  /* =======
     BOTTOM SECURE
  ======= */

  bottomSecure: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(14),
  },

  bottomSecureText: {
    color: "#777987",
    fontSize: scale(10.5),
    fontFamily: Fonts.body.medium,
    marginLeft: scale(6),
  },
});
