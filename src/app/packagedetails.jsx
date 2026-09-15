import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ============================================================
   RESPONSIVE WIDTH
============================================================ */

const { width } = Dimensions.get("window");

const BASE_WIDTH = 390;

const scale = (size) => {
  const factor = width / BASE_WIDTH;
  return Math.round(size * Math.min(factor, 1.12));
};

/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  white: "#FFFFFF",
  background: "#F8F8F8",

  red: "#C91820",
  redDark: "#8D080E",
  redDeep: "#680308",

  gold: "#F2B41B",
  goldLight: "#FFD866",
  goldBright: "#FFD42E",

  text: "#171923",
  textSecondary: "#5B6172",
  border: "#E9E9E9",

  pink: "#FCE5E9",
  pinkIcon: "#D91F35",

  green: "#E7F5E8",
  greenIcon: "#20933D",

  purple: "#F0E7FF",
  purpleIcon: "#7432D8",

  blue: "#E5F0FF",
  blueIcon: "#1764D1",

  orange: "#FFF1DA",
  orangeIcon: "#F28A00",
};

/* ============================================================
   BENEFITS
============================================================ */

const BENEFITS = [
  {
    icon: "mail-open-outline",
    title: "Express Interest",
    description: "Send interest to other profiles",
    value: "50",
    background: COLORS.pink,
    iconColor: COLORS.pinkIcon,
    valueBackground: "#FDE9ED",
    valueColor: "#C5162A",
  },

  {
    icon: "person-outline",
    title: "Contact Details",
    description: "View contact information",
    value: "100",
    background: COLORS.green,
    iconColor: COLORS.greenIcon,
    valueBackground: "#E8F6E9",
    valueColor: "#218C3B",
  },

  {
    icon: "images-outline",
    title: "Photo Gallery Access",
    description: "View photos in other profiles",
    value: "25",
    background: COLORS.purple,
    iconColor: COLORS.purpleIcon,
    valueBackground: "#F1E9FF",
    valueColor: "#7127D1",
  },

  {
    icon: "eye-outline",
    title: "Profile Image Views",
    description: "View full profile images",
    value: "Unlimited",
    background: COLORS.blue,
    iconColor: COLORS.blueIcon,
    valueBackground: "#E7F0FF",
    valueColor: "#175BC5",
  },

  {
    icon: "images-outline",
    title: "Gallery Image Views",
    description: "View all gallery images",
    included: true,
    background: COLORS.orange,
    iconColor: COLORS.orangeIcon,
    valueBackground: "#E8F7E9",
    valueColor: "#21863A",
  },

  {
    icon: "hardware-chip-outline",
    title: "Auto Profile Match",
    description: "Get auto matched profiles daily",
    included: true,
    background: "#FFE7ED",
    iconColor: "#DF1740",
    valueBackground: "#E8F7E9",
    valueColor: "#21863A",
  },
];

/* ============================================================
   SECURITY ITEMS
============================================================ */

const SECURITY_ITEMS = [
  {
    icon: "shield-checkmark-outline",
    title: "100% Secure",
    subtitle: "Payments",
  },

  {
    icon: "headset-outline",
    title: "24/7 Priority",
    subtitle: "Support",
  },

  {
    icon: "ribbon-outline",
    title: "Trusted by",
    subtitle: "Thousands",
  },
];

/* ============================================================
   MAIN SCREEN
============================================================ */

export default function PackageDetails() {
  const handleBack = () => {
    router.back();
  };

  const handlePayment = () => {
    router.push("/payment");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />

      {/* ======================================================
    HEADER
====================================================== */}

      <View style={styles.header}>

        {/* BACK */}

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleBack}
        >
          <Ionicons
            name="chevron-back"
            size={scale(20)}
            color="#B00008"
          />
        </TouchableOpacity>


        {/* TITLE */}

        <Text style={styles.headerTitle}>
          Package Details
        </Text>


        {/* LOGO */}

        <Image
          source={require("../../assets/images/logo3.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />

      </View>
      {/* ======================================================
          SCROLL CONTENT
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ====================================================
    PREMIUM GOLD PACKAGE
==================================================== */}

        <View style={styles.heroWrapper}>

          <ImageBackground
            source={require("../../assets/images/package-background.png")}
            style={styles.hero}
            imageStyle={styles.heroBackgroundImage}
            resizeMode="cover"
          >

            {/* GOLD SHIELD + RED/GOLD BACKGROUND ARE PART OF THE BACKGROUND IMAGE */}

            <View style={styles.packageRightContent}>

              {/* MOST POPULAR */}

              <View style={styles.popularBadge}>

                <Ionicons
                  name="star"
                  size={scale(7)}
                  color="#FFFFFF"
                />

                <Text style={styles.popularText}>
                  MOST POPULAR
                </Text>

              </View>


              {/* PACKAGE TITLE */}

              <Text
                style={styles.packageTitle}
                numberOfLines={1}
              >
                Gold Connect Package
              </Text>


              {/* SUBTITLE */}

              <Text
                style={styles.packageSubtitle}
                numberOfLines={1}
              >
                Best value for serious match seekers
              </Text>


              {/* ==================================================
          STATISTICS
      ================================================== */}

              <View style={styles.statsCard}>

                {/* DAYS */}

                <View style={styles.statItem}>

                  <View style={styles.statTopRow}>

                    <Ionicons
                      name="calendar-outline"
                      size={scale(14)}
                      color="#E51A25"
                    />

                    <Text style={styles.statValue}>
                      90
                    </Text>

                  </View>

                  <Text style={styles.statLabel}>
                    Days
                  </Text>

                  <Text style={styles.statSubLabel}>
                    Validity
                  </Text>

                </View>


                <View style={styles.statDivider} />


                {/* EXPRESS */}

                <View style={styles.statItem}>

                  <View style={styles.statTopRow}>

                    <Ionicons
                      name="heart-outline"
                      size={scale(14)}
                      color="#E51A25"
                    />

                    <Text style={styles.statValue}>
                      50
                    </Text>

                  </View>

                  <Text style={styles.statLabel}>
                    Express
                  </Text>

                  <Text style={styles.statSubLabel}>
                    Interest
                  </Text>

                </View>


                <View style={styles.statDivider} />


                {/* CONTACT */}

                <View style={styles.statItem}>

                  <View style={styles.statTopRow}>

                    <Ionicons
                      name="person-outline"
                      size={scale(14)}
                      color="#E51A25"
                    />

                    <Text style={styles.statValue}>
                      100
                    </Text>

                  </View>

                  <Text style={styles.statLabel}>
                    Contact
                  </Text>

                  <Text style={styles.statSubLabel}>
                    Details
                  </Text>

                </View>


                <View style={styles.statDivider} />


                {/* PHOTO */}

                <View style={styles.statItem}>

                  <View style={styles.statTopRow}>

                    <Ionicons
                      name="images-outline"
                      size={scale(14)}
                      color="#D92A8A"
                    />

                    <Text style={styles.statValue}>
                      25
                    </Text>

                  </View>

                  <Text style={styles.statLabel}>
                    Photo
                  </Text>

                  <Text style={styles.statSubLabel}>
                    Gallery
                  </Text>

                </View>

              </View>


              {/* ==================================================
          PRICE
      ================================================== */}

              <View style={styles.priceRow}>

                <Text style={styles.oldPrice}>
                  ₹2,999
                </Text>

                <Text style={styles.currentPrice}>
                  ₹1,999
                </Text>

                <View style={styles.discountBadge}>

                  <Text style={styles.discountText}>
                    33% OFF
                  </Text>

                </View>

              </View>

            </View>

          </ImageBackground>

        </View>

        {/* ======================================================
            BENEFITS HEADER
        ====================================================== */}

        <View style={styles.sectionHeader}>

          <View style={styles.sectionIcon}>

            <Ionicons
              name="gift-outline"
              size={scale(23)}
              color={COLORS.red}
            />

          </View>

          <Text style={styles.sectionTitle}>
            Package Benefits
          </Text>

          <View style={styles.sectionLine} />

          <View style={styles.sectionDecoration}>

            <View style={styles.smallDiamond} />

            <View style={styles.smallDot} />

            <View style={styles.smallDiamond} />

          </View>

        </View>

        {/* ======================================================
            BENEFITS
        ====================================================== */}

        <View style={styles.benefitsContainer}>

          {BENEFITS.map((item, index) => (
            <BenefitCard
              key={index}
              item={item}
            />
          ))}

        </View>

        {/* ======================================================
            SECURITY / TRUST
        ====================================================== */}

        <View style={styles.securityCard}>

          {SECURITY_ITEMS.map((item, index) => (

            <React.Fragment key={index}>

              <View style={styles.securityItem}>

                <View style={styles.securityIconBox}>

                  <Ionicons
                    name={item.icon}
                    size={scale(28)}
                    color="#D94B59"
                  />

                </View>

                <View style={styles.securityText}>

                  <Text style={styles.securityTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.securitySubtitle}>
                    {item.subtitle}
                  </Text>

                </View>

              </View>

              {index < SECURITY_ITEMS.length - 1 && (
                <View style={styles.securityDivider} />
              )}

            </React.Fragment>

          ))}

        </View>

        {/* SPACE FOR FIXED FOOTER */}

        <View
          style={{
            height: scale(145),
          }}
        />

      </ScrollView>

      {/* ======================================================
          FIXED PAYMENT FOOTER
      ====================================================== */}

      <View style={styles.paymentArea}>

        <View style={styles.paymentCard}>

          {/* ==================================================
              AMOUNT
          ================================================== */}

          <View style={styles.amountContainer}>

            <Text style={styles.payableText}>
              Payable Amount
            </Text>

            <Text style={styles.amount}>
              ₹ 1,999
            </Text>

            <View style={styles.saveBadge}>

              <Text style={styles.saveText}>
                You Save ₹ 1,000
              </Text>

            </View>

          </View>

          {/* ==================================================
              PAYMENT BUTTON
          ================================================== */}

          <TouchableOpacity
            style={styles.paymentButton}
            activeOpacity={0.85}
            onPress={handlePayment}
          >

            <Text style={styles.paymentButtonText}>
              Continue to Payment
            </Text>

            <Ionicons
              name="arrow-forward"
              size={scale(25)}
              color="#FFFFFF"
            />

          </TouchableOpacity>

        </View>

        {/* SECURE MESSAGE */}

        <View style={styles.secureBottom}>

          <Ionicons
            name="lock-closed"
            size={scale(15)}
            color="#89909F"
          />

          <Text style={styles.secureText}>
            Secure payments. Cancel anytime.
          </Text>

        </View>

      </View>

    </SafeAreaView>
  );
}

/* ============================================================
   PACKAGE STAT
============================================================ */

function PackageStat({
  icon,
  value,
  label,
  subLabel,
  color,
}) {
  return (
    <View style={styles.statItem}>

      <View style={styles.statTop}>

        <View style={styles.statIcon}>

          <Ionicons
            name={icon}
            size={scale(20)}
            color={color}
          />

        </View>

        <Text
          style={[
            styles.statValue,
            {
              color:
                color === COLORS.purpleIcon
                  ? "#6F238A"
                  : COLORS.text,
            },
          ]}
        >
          {value}
        </Text>

      </View>

      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={styles.statSubLabel}>
        {subLabel}
      </Text>

    </View>
  );
}

/* ============================================================
   BENEFIT CARD
============================================================ */

function BenefitCard({ item }) {
  return (
    <View style={styles.benefitCard}>

      {/* ICON */}

      <View
        style={[
          styles.benefitIconCircle,
          {
            backgroundColor: item.background,
          },
        ]}
      >

        <Ionicons
          name={item.icon}
          size={scale(30)}
          color={item.iconColor}
        />

      </View>

      {/* CONTENT */}

      <View style={styles.benefitContent}>

        <Text style={styles.benefitTitle}>
          {item.title}
        </Text>

        <Text style={styles.benefitDescription}>
          {item.description}
        </Text>

      </View>

      {/* VALUE */}

      {item.included ? (

        <View
          style={[
            styles.includedBadge,
            {
              backgroundColor: item.valueBackground,
            },
          ]}
        >

          <View style={styles.checkCircle}>

            <Ionicons
              name="checkmark"
              size={scale(13)}
              color="#FFFFFF"
            />

          </View>

          <Text
            style={[
              styles.includedText,
              {
                color: item.valueColor,
              },
            ]}
          >
            Included
          </Text>

        </View>

      ) : (

        <View
          style={[
            styles.benefitValueBadge,
            {
              backgroundColor: item.valueBackground,
            },
          ]}
        >

          <Text
            style={[
              styles.benefitValue,
              {
                color: item.valueColor,
              },
            ]}
          >
            {item.value}
          </Text>

        </View>

      )}

    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({

  /* ==========================================================
     SCREEN
  ========================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ======================================================
   HEADER
====================================================== */

header: {
  height: scale(62),

  width: "100%",

  backgroundColor: "#FFFFFF",

  flexDirection: "row",

  alignItems: "center",

  justifyContent: "center",

  position: "relative",

  borderBottomWidth: 0.5,

  borderBottomColor: "#EEEEEE",
},

backButton: {
  position: "absolute",

  left: scale(8),

  width: scale(35),

  height: scale(35),

  alignItems: "center",

  justifyContent: "center",
},

headerTitle: {
  fontSize: scale(18),

  fontWeight: "700",

  color: "#A80008",

  textAlign: "center",
},

headerLogo: {
  position: "absolute",

  right: scale(8),

  width: scale(40),

  height: scale(40),
},


/* ======================================================
   SCROLL
====================================================== */

scrollContent: {
  paddingHorizontal: scale(12),

  paddingTop: scale(8),

  paddingBottom: scale(30),
},


/* ======================================================
   HERO WRAPPER
====================================================== */

heroWrapper: {
  width: "100%",

  alignItems: "center",

  justifyContent: "center",
},


/* ======================================================
   MAIN RED CARD
====================================================== */

hero: {
  width: "100%",

  height: scale(200),

  borderRadius: scale(9),

  overflow: "hidden",

  flexDirection: "row",

  borderWidth: 1,

  borderColor: "#6C0004",

  elevation: 3,

  shadowColor: "#000",

  shadowOffset: {
    width: 0,
    height: 2,
  },

  shadowOpacity: 0.18,

  shadowRadius: 3,

  position: "relative",
},

heroBackgroundImage: {
  width: "100%",
  height: "100%",
  borderRadius: scale(9),
},

/* Background image already contains the Gold Connect shield. */
goldImageSection: {
  display: "none",
},

goldConnectImage: {
  display: "none",
},

/* ======================================================
   RIGHT CONTENT
====================================================== */

packageRightContent: {
  position: "absolute",

  right: 0,

  top: 0,

  width: "61%",

  height: "100%",

  paddingTop: scale(11),

  paddingRight: scale(7),

  paddingLeft: scale(1),

  paddingBottom: scale(5),

  justifyContent: "flex-start",

  zIndex: 5,
},


/* ======================================================
   MOST POPULAR
====================================================== */

popularBadge: {
  alignSelf: "flex-start",

  height: scale(17),

  paddingHorizontal: scale(8),

  borderRadius: scale(3),

  backgroundColor: "#F6B900",

  flexDirection: "row",

  alignItems: "center",

  justifyContent: "center",

  marginBottom: scale(5),
},

popularText: {
  color: "#FFFFFF",

  fontSize: scale(6.5),

  fontWeight: "800",

  marginLeft: scale(2),

  letterSpacing: 0.2,
},


/* ======================================================
   TITLE
====================================================== */

packageTitle: {
  color: "#FFFFFF",

  fontSize: scale(13.5),

  fontWeight: "800",

  lineHeight: scale(18),

  marginBottom: scale(2),
},


/* ======================================================
   SUBTITLE
====================================================== */

packageSubtitle: {
  color: "#FFEAEA",

  fontSize: scale(7),

  fontWeight: "500",

  lineHeight: scale(10),

  marginBottom: scale(7),
},


/* ======================================================
   STATISTICS CARD
====================================================== */

statsCard: {
  width: "100%",

  height: scale(61),

  backgroundColor: "#FFFFFF",

  borderRadius: scale(6),

  flexDirection: "row",

  alignItems: "center",

  justifyContent: "space-around",

  paddingHorizontal: scale(2),

  marginTop: scale(2),

  elevation: 2,
},


/* ======================================================
   STAT ITEM
====================================================== */

statItem: {
  flex: 1,

  height: "100%",

  alignItems: "center",

  justifyContent: "center",
},

statTopRow: {
  flexDirection: "row",

  alignItems: "center",

  justifyContent: "center",

  marginBottom: scale(1),
},

statValue: {
  color: "#252525",

  fontSize: scale(13.5),

  fontWeight: "800",

  marginLeft: scale(2),
},

statLabel: {
  color: "#444444",

  fontSize: scale(9),

  fontWeight: "600",

  lineHeight: scale(9),
},

statSubLabel: {
  color: "#777777",

  fontSize: scale(8),

  fontWeight: "400",

  lineHeight: scale(8),
},


/* ======================================================
   DIVIDER
====================================================== */

statDivider: {
  width: 1,

  height: scale(38),

  backgroundColor: "#E8E8E8",
},


/* ======================================================
   PRICE
====================================================== */

priceRow: {
  width: "100%",

  flexDirection: "row",

  alignItems: "center",

  justifyContent: "flex-end",

  marginTop: scale(7),

  paddingRight: scale(2),
},

oldPrice: {
  color: "#FFE0E0",

  fontSize: scale(7.5),

  fontWeight: "500",

  textDecorationLine: "line-through",

  marginRight: scale(5),
},

currentPrice: {
  color: "#FFD21A",

  fontSize: scale(17),

  fontWeight: "900",

  lineHeight: scale(20),

  marginRight: scale(5),
},

discountBadge: {
  backgroundColor: "#FFC400",

  paddingHorizontal: scale(5),

  height: scale(20),

  borderRadius: scale(3),

  alignItems: "center",

  justifyContent: "center",
},

discountText: {
  color: "#6D3900",

  fontSize: scale(6.5),

  fontWeight: "900",
},
  /* ==========================================================
     SECTION HEADER
  ========================================================== */

  sectionHeader: {
    marginTop: scale(25),

    paddingHorizontal: scale(19),

    flexDirection: "row",

    alignItems: "center",

    width: "100%",
  },

  sectionIcon: {
    width: scale(39),
    height: scale(39),

    borderRadius: scale(20),

    backgroundColor: "#FFF1F2",

    alignItems: "center",
    justifyContent: "center",

    marginRight: scale(8),
  },

  sectionTitle: {
    fontSize: scale(20),

    fontWeight: "900",

    color: COLORS.red,

    flexShrink: 0,
  },

  sectionLine: {
    flex: 1,

    height: 1,

    backgroundColor: "#E8B53C",

    marginLeft: scale(9),
  },

  sectionDecoration: {
    flexDirection: "row",

    alignItems: "center",

    marginLeft: scale(6),
  },

  smallDiamond: {
    width: scale(6),
    height: scale(6),

    backgroundColor: "#E8A51C",

    transform: [
      {
        rotate: "45deg",
      },
    ],

    marginHorizontal: scale(3),
  },

  smallDot: {
    width: scale(4),
    height: scale(4),

    borderRadius: scale(2),

    backgroundColor: "#E8A51C",
  },

  /* ==========================================================
     BENEFITS CONTAINER
  ========================================================== */

  benefitsContainer: {
    paddingHorizontal: scale(15),

    marginTop: scale(13),
  },

  /* ==========================================================
     BENEFIT CARD
  ========================================================== */

  benefitCard: {
    minHeight: scale(88),

    width: "100%",

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: "#E8E8E8",

    borderRadius: scale(15),

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: scale(13),

    marginBottom: scale(9),

    shadowColor: "#000",

    shadowOpacity: 0.035,

    shadowRadius: 5,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  /* ==========================================================
     BENEFIT ICON
  ========================================================== */

  benefitIconCircle: {
    width: scale(58),
    height: scale(58),

    borderRadius: scale(29),

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  /* ==========================================================
     BENEFIT CONTENT
  ========================================================== */

  benefitContent: {
    flex: 1,

    minWidth: 0,

    paddingHorizontal: scale(12),
  },

  benefitTitle: {
    fontSize: scale(15.5),

    fontWeight: "800",

    color: COLORS.text,

    marginBottom: scale(4),

    flexShrink: 1,
  },

  benefitDescription: {
    fontSize: scale(12.5),

    color: COLORS.textSecondary,

    lineHeight: scale(18),

    flexShrink: 1,
  },

  /* ==========================================================
     VALUE BADGE
  ========================================================== */

  benefitValueBadge: {
    minWidth: scale(58),

    minHeight: scale(42),

    paddingHorizontal: scale(8),

    borderRadius: scale(11),

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  benefitValue: {
    fontSize: scale(18),

    fontWeight: "900",

    textAlign: "center",
  },

  /* ==========================================================
     INCLUDED BADGE
  ========================================================== */

  includedBadge: {
    minHeight: scale(40),

    paddingHorizontal: scale(8),

    borderRadius: scale(11),

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  checkCircle: {
    width: scale(21),
    height: scale(21),

    borderRadius: scale(11),

    backgroundColor: COLORS.greenIcon,

    alignItems: "center",
    justifyContent: "center",

    marginRight: scale(5),
  },

  includedText: {
    fontSize: scale(11.5),

    fontWeight: "900",
  },

  /* ==========================================================
     SECURITY CARD
  ========================================================== */

  securityCard: {
    marginHorizontal: scale(15),

    marginTop: scale(10),

    minHeight: scale(86),

    backgroundColor: "#FFF1F4",

    borderWidth: 1,

    borderColor: "#FFD8DE",

    borderRadius: scale(15),

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: scale(7),
  },

  securityItem: {
    flex: 1,

    minWidth: 0,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  securityIconBox: {
    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  securityText: {
    marginLeft: scale(6),

    flexShrink: 1,
  },

  securityTitle: {
    color: COLORS.text,

    fontSize: scale(10.8),

    fontWeight: "800",

    lineHeight: scale(16),
  },

  securitySubtitle: {
    color: COLORS.text,

    fontSize: scale(10.8),

    fontWeight: "700",

    lineHeight: scale(16),
  },

  securityDivider: {
    width: 1,

    height: scale(48),

    backgroundColor: "#F2B7BF",

    marginHorizontal: scale(3),
  },

  /* ==========================================================
     FIXED PAYMENT AREA
  ========================================================== */

  paymentArea: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: COLORS.white,

    paddingHorizontal: scale(11),

    paddingTop: scale(2),

    paddingBottom: scale(3),

    borderTopWidth: 1,

    borderTopColor: "#EDEDED",

    shadowColor: "#000",

    shadowOpacity: 0.15,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: -4,
    },

    elevation: 14,

    zIndex: 50,
  },

  /* ==========================================================
     PAYMENT CARD
  ========================================================== */

  paymentCard: {
    minHeight: scale(86),

    width: "100%",

    backgroundColor: COLORS.white,

    borderRadius: scale(15),

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: scale(13),

    shadowColor: "#000",

    shadowOpacity: 0.09,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 5,
  },

  /* ==========================================================
     AMOUNT
  ========================================================== */

  amountContainer: {
    flex: 1,

    minWidth: 0,

    paddingRight: scale(8),
  },

  payableText: {
    fontSize: scale(12.5),

    color: COLORS.textSecondary,

    fontWeight: "600",

    marginBottom: scale(3),
  },

  amount: {
    fontSize: scale(23),

    color: COLORS.text,

    fontWeight: "900",

    marginBottom: scale(4),
  },

  saveBadge: {
    alignSelf: "flex-start",

    backgroundColor: "#E8F6E8",

    paddingHorizontal: scale(7),

    paddingVertical: scale(5),

    borderRadius: scale(8),
  },

  saveText: {
    color: "#25883C",

    fontSize: scale(10.5),

    fontWeight: "800",
  },

  /* ==========================================================
     PAYMENT BUTTON
  ========================================================== */

  paymentButton: {
    width: scale(150),

    minHeight: scale(30),

    backgroundColor: "#D90E17",

    borderRadius: scale(14),

    paddingHorizontal: scale(5),

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#B30009",

    shadowOpacity: 0.25,

    shadowRadius: 7,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,

    flexShrink: 0,
  },

  paymentButtonText: {
    color: COLORS.white,

    fontSize: scale(10.5),

    fontWeight: "700",

    marginRight: scale(7),

    textAlign: "center",

    flexShrink: 1,
  },

  /* ==========================================================
     SECURE MESSAGE
  ========================================================== */

  secureBottom: {
    height: scale(27),

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  secureText: {
    color: "#818899",

    fontSize: scale(11.5),

    fontWeight: "500",

    marginLeft: scale(6),
  },

});