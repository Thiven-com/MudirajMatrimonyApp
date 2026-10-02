import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";

import { Fonts } from "../constants/Fonts";
import { getPackagesData } from "../utils/Functions";

const { width } = Dimensions.get("window");
const BASE_WIDTH = 390;
const scale = (size) => {
  const factor = width / BASE_WIDTH;
  return Math.round(size * Math.min(factor, 1.12));
};

const COLORS = {
  red: "#C91528",
  darkRed: "#99111F",
  text: "#171B35",
  muted: "#777A88",
  border: "#E8E8EC",
  soft: "#F7F8FA",
  green: "#2B9A55",
};

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



const PackageCard = ({ item, onPress }) => {
  const isFree = Number(item.price) === 0 || String(item.price).trim() === "0";

  return (
    <View style={[styles.packageCard, item.badge && styles.popularCard]}>
      {item.badge ? (
        <View style={styles.popularBadge}>
          <Feather name="award" size={scale(13)} color="#FFFFFF" />
          <Text style={styles.popularText}>{item.badge}</Text>
        </View>
      ) : null}

      <View style={styles.cardTop}>
        <View style={styles.packageImageContainer}>
          {item.image ? (
            <Image source={item.image} style={styles.packageImage} resizeMode="cover" />
          ) : (
            <View style={[styles.packageImage, styles.imagePlaceholder]}>
              <Feather name="package" size={scale(25)} color="#A8ABB5" />
            </View>
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.packageName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.packageSubtitle} numberOfLines={1}>
                {item.subtitle || "Premium membership"}
              </Text>
            </View>

            {!!item.days && (
              <View style={[styles.daysBadge, { backgroundColor: item.dayBg }]}>
                <Text style={[styles.daysText, { color: item.dayColor }]}>
                  {item.days}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.membershipRow}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={scale(9)} color={COLORS.green} />
            </View>
            <Text style={styles.membershipText}>Membership plan</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.price}>
            {isFree ? "Free" : `₹${item.price}`}
          </Text>
          <Text style={styles.secureText}>Secure payment</Text>
        </View>

        <TouchableOpacity
          style={[styles.chooseButton, { backgroundColor: item.buttonColor || COLORS.red }]}
          activeOpacity={0.86}
          onPress={() => onPress?.(item)}
        >
          <Text style={styles.chooseButtonText}>
            {isFree ? "Get Started" : "Choose Plan"}
          </Text>
          <Feather name="chevron-right" size={scale(15)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ChoosePackageScreen({ navigation, route }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBack = useCallback(() => {
    if (navigation?.canGoBack?.()) {
      if (route?.params?.page) {
        navigation.navigate(route.params.page, route?.params?.prevs || {});
      } else {
        navigation.goBack();
      }
    }
  }, [navigation, route]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBack();
        return true;
      });
      return () => subscription.remove();
    }, [handleBack]),
  );

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPackagesData();
      const rawList = Array.isArray(response)
        ? response
        : response?.data ?? response?.packages ?? [];

      setPackages(rawList.map(normalizePackage));
    } catch (err) {
      console.log("FAILED TO LOAD PACKAGES:", err);
      setError("Couldn't load packages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleChoosePackage = (item) => {
    navigation.navigate("Payment", {
      packageId: item.id,
      package: item,
      page: route?.name,
      prevs: route?.params,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={scale(22)} color={COLORS.red} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Choose Your Package</Text>
            <Text style={styles.headerSubtitle}>Find the plan that fits you</Text>
          </View>

          <View style={styles.crownCircle}>
            <Feather name="award" size={scale(16)} color="#C88B19" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Membership Plans</Text>
            <Text style={styles.sectionSubtitle}>Unlock more ways to connect</Text>
          </View>

          <View style={styles.secureBadge}>
            <Feather name="shield" size={scale(10)} color={COLORS.green} />
            <Text style={styles.secureBadgeText}>Secure</Text>
          </View>
        </View>

        {loading && (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color={COLORS.red} />
          </View>
        )}

        {!loading && error && (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchPackages} activeOpacity={0.85}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && packages.length === 0 && (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>No packages available right now.</Text>
          </View>
        )}

        {!loading && !error && packages.map((item, index) => (
          <PackageCard key={item.id ?? index} item={item} onPress={handleChoosePackage} />
        ))}

        <View style={styles.bottomSecure}>
          <Feather name="lock" size={scale(11)} color="#8A8D98" />
          <Text style={styles.bottomSecureText}>Safe & secure membership purchase</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F8F9" },
  scrollContent: { paddingBottom: scale(22) },

  header: {
    height: scale(58),
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEF0",
    position: "relative",
  },
  backButton: {
    position: "absolute", left: scale(8), width: scale(42), height: scale(42),
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { alignItems: "center", justifyContent: "center" },
  headerTitle: {
    color: "#8E2026", fontSize: scale(16), fontFamily: Fonts.display.bold,
  },
  headerSubtitle: {
    color: "#777A88", fontSize: scale(8.5), fontFamily: Fonts.body.medium, marginTop: scale(1),
  },
  crownCircle: {
    position: "absolute", right: scale(10), width: scale(34), height: scale(34),
    borderRadius: scale(17), backgroundColor: "#FFF5D9", alignItems: "center", justifyContent: "center",
  },

  sectionHeader: {
    paddingHorizontal: scale(14), paddingTop: scale(13), paddingBottom: scale(8),
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  sectionTitle: { color: COLORS.text, fontSize: scale(15), fontFamily: Fonts.display.bold },
  sectionSubtitle: { color: COLORS.muted, fontSize: scale(9.5), fontFamily: Fonts.body.medium, marginTop: scale(2) },
  secureBadge: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#EEF9F1",
    borderRadius: scale(12), paddingHorizontal: scale(8), paddingVertical: scale(5),
  },
  secureBadgeText: { color: COLORS.green, fontSize: scale(8.5), fontFamily: Fonts.body.bold, marginLeft: scale(3) },

  stateContainer: { paddingVertical: scale(55), alignItems: "center", justifyContent: "center" },
  errorText: { color: COLORS.muted, fontSize: scale(12), fontFamily: Fonts.body.semiBold, textAlign: "center", marginBottom: scale(12) },
  retryButton: { minWidth: scale(100), minHeight: scale(38), borderRadius: scale(19), backgroundColor: COLORS.red, alignItems: "center", justifyContent: "center" },
  retryButtonText: { color: "#FFFFFF", fontSize: scale(11), fontFamily: Fonts.body.bold },

  packageCard: {
    marginHorizontal: scale(10), marginBottom: scale(9), padding: scale(10),
    backgroundColor: "#FFFFFF", borderRadius: scale(15), borderWidth: 1, borderColor: COLORS.border,
    shadowColor: "#000", shadowOpacity: 0.055, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 7, elevation: 2, overflow: "hidden",
  },
  popularCard: { borderColor: "#E8C66B", borderWidth: 1.2 },
  popularBadge: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.red, borderRadius: scale(10), paddingHorizontal: scale(7),
    paddingVertical: scale(3), marginBottom: scale(6),
  },
  popularText: { color: "#FFFFFF", fontSize: scale(7.5), fontFamily: Fonts.body.bold, marginLeft: scale(3) },

  cardTop: { flexDirection: "row", minHeight: scale(72) },
  packageImageContainer: {
    width: scale(70), height: scale(70), borderRadius: scale(11), overflow: "hidden",
    backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#ECECEF",
  },
  packageImage: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", justifyContent: "center" },
  details: { flex: 1, marginLeft: scale(10), minWidth: 0, justifyContent: "space-between", paddingVertical: scale(1) },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  titleBlock: { flex: 1, minWidth: 0, paddingRight: scale(5) },
  packageName: { color: "#111735", fontSize: scale(13.5), fontFamily: Fonts.display.bold },
  packageSubtitle: { color: "#7A7D88", fontSize: scale(8.5), fontFamily: Fonts.body.medium, marginTop: scale(3) },
  daysBadge: { paddingHorizontal: scale(7), paddingVertical: scale(4), borderRadius: scale(8), maxWidth: scale(70) },
  daysText: { fontSize: scale(7.5), fontFamily: Fonts.body.bold },

  membershipRow: { flexDirection: "row", alignItems: "center", marginTop: scale(10) },
  checkCircle: { width: scale(16), height: scale(16), borderRadius: scale(8), backgroundColor: "#EAF7EE", alignItems: "center", justifyContent: "center" },
  membershipText: { color: "#666A75", fontSize: scale(8), fontFamily: Fonts.body.semiBold, marginLeft: scale(4) },

  divider: { height: 1, backgroundColor: "#EEEEF0", marginTop: scale(9), marginBottom: scale(8) },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { color: "#B7192B", fontSize: scale(16), fontFamily: Fonts.display.bold, lineHeight: scale(19) },
  secureText: { color: "#A0A2AA", fontSize: scale(6.5), fontFamily: Fonts.body.medium, marginTop: scale(1) },
  chooseButton: { minWidth: scale(100), minHeight: scale(32), paddingHorizontal: scale(10), borderRadius: scale(16), flexDirection: "row", alignItems: "center", justifyContent: "center" },
  chooseButtonText: { color: "#FFFFFF", fontSize: scale(8.5), fontFamily: Fonts.body.bold, marginRight: scale(2) },

  bottomSecure: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: scale(4) },
  bottomSecureText: { color: "#8A8D98", fontSize: scale(7), fontFamily: Fonts.body.medium, marginLeft: scale(4) },
});
