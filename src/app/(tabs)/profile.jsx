import { useCallback, useEffect } from "react";

import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";

import LinearGradient from "react-native-linear-gradient";

import { useNavigation } from "@react-navigation/native";

/* =========================================================
   DIMENSIONS
========================================================= */

const { width } = Dimensions.get("window");

/* =========================================================
   SPACING
========================================================= */

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  background: "#FFFDFC",
  white: "#FFFFFF",

  red: "#C91412",
  darkRed: "#A30F0D",

  gold: "#F5B400",
  goldLight: "#FFF4D0",

  text: "#292321",
  gray: "#625B57",

  border: "#F0E5DC",

  green: "#12A150",

  cardShadow: "#9B8D82",
};

/* =========================================================
   ASSETS
   NOTE: adjust these relative paths to match where this
   screen lives in your project structure.
========================================================= */

const PROFILE_IMAGE = require("../../../assets/images/Match1.png");
const LOGO = require("../../../assets/images/logo.png");

/* =========================================================
   PROFILE DETAILS SCREEN
========================================================= */

export default function ProfileDetailsScreen() {
  const navigation = useNavigation();

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  /* =======================================================
     ANDROID HARDWARE BACK
     Mirrors the pattern used on ChatsScreen: intercept the
     hardware back button and route it through the same
     handleBack() the header's back arrow uses.
  ======================================================= */

  useEffect(() => {
    const handleHardwareBack = () => {
      handleBack();

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBack,
    );

    return () => {
      subscription.remove();
    };
  }, [handleBack]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleMessage = () => {
    Alert.alert("Message", "Opening chat...");

    // Adjust this route/params to match your navigator
    // navigation.navigate("ChatConversion", { ... });
  };

  const handleShortlist = () => {
    Alert.alert("Shortlist", "Profile added to shortlist");
  };

  const handleUpgrade = () => {
    navigation.navigate("SubscriptionPlans");
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= BACK BUTTON ================= */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="arrow-left" size={30} color={COLORS.red} />
        </TouchableOpacity>

        {/* ================= PROFILE CARD ================= */}

        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            {/* ================= PROFILE IMAGE ================= */}

            <View style={styles.imageWrapper}>
              <Image source={PROFILE_IMAGE} style={styles.profileImage} />

              {/* ONLINE */}

              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />

                <Text style={styles.onlineText}>Online</Text>
              </View>

              {/* PHOTO COUNT */}

              <View style={styles.photoCount}>
                <Feather name="image" size={17} color="#253B85" />

                <Text style={styles.photoCountText}>5</Text>
              </View>
            </View>

            {/* ================= DETAILS ================= */}

            <View style={styles.detailsContainer}>
              {/* NAME + LOGO */}

              <View style={styles.nameLogoRow}>
                <View style={styles.nameContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.profileName} numberOfLines={2}>
                      Priyanka, 25
                    </Text>

                    <Feather
                      name="check-circle"
                      size={22}
                      color={COLORS.green}
                      style={styles.verifiedIcon}
                    />
                  </View>

                  <Text style={styles.profession}>Software Engineer</Text>
                </View>

                <Image source={LOGO} style={styles.logo} />
              </View>

              {/* DETAILS */}

              <DetailRow icon="map-pin" text="Hyderabad, Telangana" />

              <DetailRow icon="book-open" text="B.Tech, Computer Science" />

              <DetailRow icon="maximize-2" text={`5'4"`} />

              <DetailRow icon="users" text="Hindu - Mudhiraj" />

              {/* VERIFIED */}

              <View style={styles.verifiedBox}>
                <Feather name="shield" size={23} color={COLORS.red} />

                <Text style={styles.verifiedText}>100% Verified Profile</Text>
              </View>
            </View>
          </View>

          {/* ================= BUTTONS ================= */}

          <View style={styles.profileButtons}>
            <TouchableOpacity
              style={styles.shortlistButton}
              onPress={handleShortlist}
              activeOpacity={0.8}
            >
              <Feather name="heart" size={25} color="#E21B16" />

              <Text style={styles.shortlistText}>Add to Shortlist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleMessage}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#C90804", "#E51B08", "#FFAE00"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.messageGradient}
              >
                <Feather name="message-circle" size={25} color="#FFFFFF" />

                <Text style={styles.messageText}>Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= ACTION MENU ================= */}

        <View style={styles.actionCard}>
          <ActionItem icon="user" title="View Contact" active crown />

          <ActionItem icon="star" title="Send Interest" />

          <ActionItem icon="bell" title="Remind" />

          <ActionItem icon="share-2" title="Share Profile" />

          <ActionItem icon="slash" title="Block/Report" />
        </View>

        {/* ================= PREMIUM ================= */}

        <LinearGradient
          colors={["#C90804", "#E61B06", "#FFB000"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.premiumCard}
        >
          <View style={styles.crownCircle}>
            <Feather name="award" size={34} color="#FFD84E" />
          </View>

          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>
              Go Premium, Get Better Matches
            </Text>

            <Text style={styles.premiumSubtitle}>
              Unlock contact details, chat unlimited
              {"\n"}& more premium features.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.upgradeButton}
            activeOpacity={0.8}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeText}>Upgrade Now</Text>

            <Feather name="chevron-right" size={20} color={COLORS.red} />
          </TouchableOpacity>
        </LinearGradient>

        {/* ================= ABOUT ================= */}

        <InfoSection title="About Priyanka">
          <View style={styles.infoGrid}>
            {/* LEFT */}

            <View style={styles.infoColumn}>
              <InfoItem
                icon="calendar"
                title="Date of Birth"
                value="15 May 1999"
              />

              <InfoItem icon="maximize-2" title="Height" value={`5'4"`} />

              <InfoItem
                icon="circle"
                title="Marital Status"
                value="Never Married"
              />

              <InfoItem
                icon="message-square"
                title="Mother Tongue"
                value="Telugu"
              />

              <InfoItem
                icon="briefcase"
                title="Profession"
                value="Software Engineer"
              />

              <InfoItem
                icon="dollar-sign"
                title="Annual Income"
                value="₹ 8 - 10 LPA"
              />
            </View>

            {/* RIGHT */}

            <View style={styles.infoColumn}>
              <InfoItem icon="sun" title="Religion" value="Hindu" />

              <InfoItem icon="users" title="Caste" value="Mudhiraj" />

              <InfoItem
                icon="user-check"
                title="Sub Caste"
                value="Godari (Gouda)"
              />

              <InfoItem
                icon="book-open"
                title="Education"
                value="B.Tech, Computer Science"
              />

              <InfoItem
                icon="grid"
                title="Company"
                value="Infosys, Hyderabad"
              />

              <InfoItem icon="globe" title="Country Living In" value="India" />
            </View>
          </View>
        </InfoSection>

        {/* ================= PARTNER PREFERENCES ================= */}

        <InfoSection title="Partner Preferences">
          <View style={styles.preferenceGrid}>
            <View style={styles.preferenceColumn}>
              <InfoItem icon="user" title="Age" value="23 - 30 Years" />

              <InfoItem
                icon="maximize-2"
                title="Height"
                value={`5'3" - 6'0"`}
              />
            </View>

            <View style={styles.preferenceColumn}>
              <InfoItem
                icon="book-open"
                title="Education"
                value="Any Graduate and above"
              />

              <InfoItem
                icon="map-pin"
                title="Location"
                value="Telangana / Hyderabad"
              />
            </View>
          </View>
        </InfoSection>

        {/* Bottom Space */}

        <View style={{ height: 35 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================================================= */
/* ================= DETAIL ROW ==================== */
/* ================================================= */

function DetailRow({ icon, text }) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon} size={18} color={COLORS.red} />

      <Text style={styles.detailText} numberOfLines={2}>
        {text}
      </Text>
    </View>
  );
}

/* ================================================= */
/* ================= ACTION ITEM ================== */
/* ================================================= */

function ActionItem({ icon, title, active = false, crown = false }) {
  return (
    <TouchableOpacity
      style={styles.actionItem}
      activeOpacity={0.7}
      onPress={() => Alert.alert(title, `${title} selected`)}
    >
      <View style={styles.actionIconWrapper}>
        <Feather
          name={icon}
          size={27}
          color={active ? COLORS.red : "#B56B00"}
        />

        {crown && (
          <View style={styles.smallCrown}>
            <Feather name="award" size={11} color="#A76A00" />
          </View>
        )}
      </View>

      <Text
        style={[styles.actionText, active && styles.activeActionText]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* ================================================= */
/* ================= INFO SECTION ================= */
/* ================================================= */

function InfoSection({ title, children }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />

        <Feather
          name="circle"
          size={10}
          color={COLORS.gold}
          style={styles.ornament}
        />

        <View style={styles.dividerLine} />
      </View>

      {children}
    </View>
  );
}

/* ================================================= */
/* ================= INFO ITEM ==================== */
/* ================================================= */

function InfoItem({ icon, title, value }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIconCircle}>
        <Feather name={icon} size={22} color={COLORS.red} />
      </View>

      <View style={styles.infoTextContainer}>
        <Text style={styles.infoTitle}>{title}</Text>

        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ================================================= */
/* ================= STYLESHEET =================== */
/* ================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 6,
    paddingBottom: 100,
  },

  /* ================= BACK ================= */

  backButton: {
    width: 48,
    height: 48,

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 2,
    marginBottom: 8,
  },

  /* ================= PROFILE CARD ================= */

  profileCard: {
    backgroundColor: COLORS.white,

    borderRadius: 22,

    borderWidth: 1,
    borderColor: "#EAD9C8",

    padding: 10,

    shadowColor: COLORS.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    elevation: 5,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  /* ================= IMAGE ================= */

  imageWrapper: {
    width: width * 0.39,
    height: width * 0.43,

    borderRadius: 16,

    position: "relative",

    marginRight: 10,
  },

  profileImage: {
    width: "100%",
    height: "100%",

    borderRadius: 16,

    resizeMode: "cover",
  },

  onlineBadge: {
    position: "absolute",

    top: 8,
    left: 8,

    backgroundColor: COLORS.green,

    paddingHorizontal: 8,
    paddingVertical: 5,

    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",
  },

  onlineDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: COLORS.white,

    marginRight: 5,
  },

  onlineText: {
    color: COLORS.white,

    fontSize: 11,
    fontWeight: "700",
  },

  photoCount: {
    position: "absolute",

    right: -4,
    bottom: 6,

    minWidth: 50,
    height: 34,

    backgroundColor: COLORS.white,

    borderRadius: 9,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,

    gap: 4,
  },

  photoCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },

  /* ================= DETAILS ================= */

  detailsContainer: {
    flex: 1,
    paddingTop: 3,
  },

  nameLogoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  nameContent: {
    flex: 1,
    minWidth: 0,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileName: {
    fontSize: width <= 430 ? 18 : 21,

    fontWeight: "800",

    color: COLORS.darkRed,

    flexShrink: 1,
  },

  verifiedIcon: {
    marginLeft: 5,
  },

  profession: {
    fontSize: width <= 430 ? 14 : 16,

    fontWeight: "600",

    color: COLORS.text,

    marginTop: 5,
    marginBottom: 9,
  },

  /* ================= LOGO ================= */

  logo: {
    width: 40,
    height: 40,

    resizeMode: "contain",

    marginTop: -6,
    marginLeft: 4,
  },

  detailRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 7,
  },

  detailText: {
    marginLeft: 8,

    fontSize: width <= 430 ? 12 : 14,

    color: "#5C5551",

    flex: 1,
  },

  /* ================= VERIFIED ================= */

  verifiedBox: {
    minHeight: 40,

    backgroundColor: "#FFF7F3",

    borderRadius: 10,

    paddingHorizontal: 10,

    flexDirection: "row",
    alignItems: "center",

    alignSelf: "flex-start",

    marginTop: 4,

    gap: 7,
  },

  verifiedText: {
    color: COLORS.darkRed,

    fontSize: width <= 430 ? 11 : 13,

    fontWeight: "800",
  },

  /* ================= PROFILE BUTTONS ================= */

  profileButtons: {
    flexDirection: "row",

    marginTop: 12,

    gap: 10,
  },

  shortlistButton: {
    flex: 1,

    height: 56,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#E5CFC3",

    borderRadius: 16,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  shortlistText: {
    fontSize: width <= 430 ? 13 : 15,

    fontWeight: "700",

    color: "#423936",
  },

  messageButton: {
    flex: 1,

    height: 56,

    borderRadius: 15,

    overflow: "hidden",

    shadowColor: COLORS.red,
    shadowOpacity: 0.2,
    shadowRadius: 8,

    elevation: 4,
  },

  messageGradient: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 8,
  },

  messageText: {
    color: COLORS.white,

    fontSize: width <= 430 ? 14 : 16,

    fontWeight: "800",
  },

  /* ================= ACTION CARD ================= */

  actionCard: {
    marginTop: 14,

    backgroundColor: COLORS.white,

    borderRadius: 22,

    minHeight: 112,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#F0E5DC",

    shadowColor: "#B7A79C",
    shadowOpacity: 0.09,
    shadowRadius: 10,

    elevation: 3,
  },

  actionItem: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    minHeight: 90,

    paddingHorizontal: 2,
  },

  actionIconWrapper: {
    height: 35,

    justifyContent: "center",
    alignItems: "center",

    position: "relative",
  },

  smallCrown: {
    position: "absolute",

    top: -7,
    right: -13,

    width: 25,
    height: 25,

    borderRadius: 13,

    backgroundColor: "#FFE39B",

    justifyContent: "center",
    alignItems: "center",
  },

  actionText: {
    marginTop: 7,

    textAlign: "center",

    fontSize: width <= 430 ? 9 : 11,

    color: "#453C38",

    fontWeight: "600",
  },

  activeActionText: {
    color: COLORS.red,

    fontWeight: "800",
  },

  /* ================= PREMIUM ================= */

  premiumCard: {
    marginTop: 16,

    minHeight: 70,

    borderRadius: 18,

    paddingHorizontal: 10,
    paddingVertical: 10,

    flexDirection: "row",

    alignItems: "center",

    overflow: "hidden",

    shadowColor: "#D20B05",
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 5,
  },

  crownCircle: {
    width: 60,
    height: 60,

    borderRadius: 35,

    borderWidth: 1.5,
    borderColor: "#FFD34D",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  premiumContent: {
    flex: 1,
  },

  premiumTitle: {
    color: COLORS.white,

    fontSize: width <= 430 ? 14 : 17,

    fontWeight: "800",

    marginBottom: 5,
  },

  premiumSubtitle: {
    color: COLORS.white,

    fontSize: width <= 430 ? 10 : 12,

    lineHeight: 16,
  },

  upgradeButton: {
    height: 52,

    backgroundColor: COLORS.white,

    borderRadius: 14,

    paddingHorizontal: 11,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 3,

    marginLeft: 7,
  },

  upgradeText: {
    color: COLORS.red,

    fontWeight: "800",

    fontSize: width <= 430 ? 11 : 14,
  },

  /* ================= INFO SECTION ================= */

  infoSection: {
    backgroundColor: COLORS.white,

    marginTop: 16,

    borderRadius: 22,

    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,

    shadowColor: "#B8AAA0",
    shadowOpacity: 0.07,
    shadowRadius: 10,

    elevation: 3,
  },

  sectionTitle: {
    color: COLORS.darkRed,

    fontSize: width <= 430 ? 20 : 23,

    fontWeight: "800",
  },

  /* ================= DIVIDER ================= */

  divider: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 10,
    marginBottom: 13,
  },

  dividerLine: {
    flex: 1,

    height: 1,

    backgroundColor: "#E8B936",
  },

  ornament: {
    marginHorizontal: 6,
  },

  /* ================= INFO GRID ================= */

  infoGrid: {
    flexDirection: "row",

    gap: 25,
  },

  infoColumn: {
    flex: 1,

    minWidth: 0,
  },

  infoItem: {
    minHeight: 58,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 2,
  },

  infoIconCircle: {
    width: 43,
    height: 43,

    borderRadius: 22,

    backgroundColor: "#FFF7F3",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 8,
  },

  infoTextContainer: {
    flex: 1,

    minWidth: 0,
  },

  infoTitle: {
    fontSize: width <= 430 ? 11 : 13,

    color: "#322B28",

    fontWeight: "700",

    marginBottom: 3,
  },

  infoValue: {
    fontSize: width <= 430 ? 11 : 13,

    color: "#645C57",

    lineHeight: 16,
  },

  /* ================= PARTNER PREFERENCES ================= */

  preferenceGrid: {
    flexDirection: "row",

    gap: 10,
  },

  preferenceColumn: {
    flex: 1,

    minWidth: 0,
  },
});
