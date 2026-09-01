
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
    red: "#D71920",
    darkRed: "#B90000",
    yellow: "#F5A900",

    white: "#FFFFFF",
    black: "#171717",

    text: "#252525",
    gray: "#5F6368",

    lightRed: "#FFF2F2",
    lightYellow: "#FFF9E8",

    border: "#EEEEEE",

    heroBg: "#FFFDF6",
    heroBorder: "#FFF0C8",

    storyBg: "#FFF7F7",
    storyBorder: "#FFDADA",

    statsBg: "#FFFAED",
    statsBorder: "#FFE9B0",

    contactBg: "#FFF8E6",
    contactBorder: "#FFE8AE",
};

/* =========================================================
   ABOUT US SCREEN
========================================================= */

export default function AboutUsScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>

            <StatusBar
                barStyle="light-content"
                backgroundColor={COLORS.red}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.scrollContent}
            >

                {/* =================================================
            HEADER
        ================================================= */}

                <View style={styles.header}>

                    {/* Decorative Background Pattern */}

                    <View style={styles.headerPattern}>

                        <Text style={styles.patternLine}>
                            ❖ ❖ ❖ ❖
                        </Text>

                        <Text style={styles.patternLine}>
                            ❖ ❖ ❖
                        </Text>

                        <Text style={styles.patternLine}>
                            ❖ ❖
                        </Text>

                        <Text style={styles.patternLine}>
                            ❖
                        </Text>

                    </View>

                    {/* Back Button */}

                    <TouchableOpacity
                        style={styles.backButton}
                        activeOpacity={0.75}
                        onPress={() => router.back()}
                    >

                        <Ionicons
                            name="arrow-back"
                            size={25}
                            color={COLORS.white}
                        />

                    </TouchableOpacity>

                    {/* Header Content */}

                    <View style={styles.headerText}>

                        <Text style={styles.headerTitle}>
                            About Us
                        </Text>

                        <Text style={styles.headerSubtitle}>
                            Learn more about Mudhiraj Matrimony
                        </Text>

                    </View>

                </View>

                {/* =================================================
            MAIN CONTAINER
        ================================================= */}

                <View style={styles.mainContainer}>

                    {/* =================================================
              HERO SECTION
          ================================================= */}

                    <View style={styles.heroSection}>

                        {/* Hero Illustration */}

                        <View style={styles.heroIconWrapper}>

                            <View style={styles.heroIconCircle}>

                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={59}
                                    color={COLORS.red}
                                />

                                <View style={styles.heroPeople}>

                                    <Ionicons
                                        name="people"
                                        size={32}
                                        color={COLORS.red}
                                    />

                                </View>

                            </View>

                            {/* Decorative Stars */}

                            <Text style={styles.starOne}>
                                ✦
                            </Text>

                            <Text style={styles.starTwo}>
                                ✦
                            </Text>

                            <Text style={styles.starThree}>
                                ✦
                            </Text>

                            <Text style={styles.starFour}>
                                ✦
                            </Text>

                        </View>

                        {/* Hero Text */}

                        <View style={styles.heroContent}>

                            <Text style={styles.heroTitleRed}>
                                Connecting Mudhiraj Families,
                            </Text>

                            <Text style={styles.heroTitleBlack}>
                                Creating Lifelong Bonds
                            </Text>

                            <View style={styles.heroUnderline} />

                            <Text style={styles.heroDescription}>
                                Mudhiraj Matrimony is a trusted platform
                                dedicated to the Mudhiraj community. Our
                                mission is to help individuals find compatible
                                life partners and build happy, meaningful
                                relationships.
                            </Text>

                        </View>

                    </View>

                    {/* =================================================
              OUR MISSION
          ================================================= */}

                    <View style={styles.infoSection}>

                        <View style={styles.infoIconWrapper}>

                            <Ionicons
                                name="locate-outline"
                                size={25}
                                color={COLORS.red}
                            />

                        </View>

                        <View style={styles.infoContent}>

                            <Text style={styles.infoTitle}>
                                Our Mission
                            </Text>

                            <Text style={styles.infoDescription}>
                                To provide a safe, reliable and user-friendly
                                platform that helps Mudhiraj individuals and
                                families find the perfect match with confidence
                                and ease.
                            </Text>

                        </View>

                    </View>

                    <View style={styles.horizontalDivider} />

                    {/* =================================================
              OUR VISION
          ================================================= */}

                    <View style={styles.infoSection}>

                        <View style={styles.infoIconWrapper}>

                            <Ionicons
                                name="eye-outline"
                                size={25}
                                color={COLORS.yellow}
                            />

                        </View>

                        <View style={styles.infoContent}>

                            <Text style={styles.infoTitle}>
                                Our Vision
                            </Text>

                            <Text style={styles.infoDescription}>
                                To be the most trusted and preferred matrimonial
                                service for the Mudhiraj community, known for
                                our commitment to happiness, privacy and values.
                            </Text>

                        </View>

                    </View>

                    {/* =================================================
              WHY CHOOSE US
          ================================================= */}

                    <View style={styles.sectionHeadingRow}>

                        <Ionicons
                            name="star-outline"
                            size={23}
                            color={COLORS.red}
                        />

                        <Text style={styles.sectionHeading}>
                            Why Choose Us?
                        </Text>

                    </View>

                    {/* =================================================
              WHY CHOOSE US GRID
          ================================================= */}

                    <View style={styles.chooseGrid}>

                        {/* CARD 1 */}

                        <View style={styles.chooseCard}>

                            <View
                                style={[
                                    styles.chooseIcon,
                                    styles.chooseRedIcon,
                                ]}
                            >
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={26}
                                    color={COLORS.red}
                                />
                            </View>

                            <Text style={styles.chooseTitle}>
                                Trusted & Secure
                            </Text>

                            <Text style={styles.chooseDescription}>
                                100% verified profiles
                            </Text>

                            <Text style={styles.chooseDescription}>
                                and secure platform
                            </Text>

                        </View>


                        {/* CARD 2 */}

                        <View style={styles.chooseCard}>

                            <View
                                style={[
                                    styles.chooseIcon,
                                    styles.chooseYellowIcon,
                                ]}
                            >
                                <Ionicons
                                    name="people-outline"
                                    size={26}
                                    color={COLORS.yellow}
                                />
                            </View>

                            <Text style={styles.chooseTitle}>
                                Community Focused
                            </Text>

                            <Text style={styles.chooseDescription}>
                                Exclusively for the
                            </Text>

                            <Text style={styles.chooseDescription}>
                                Mudhiraj community
                            </Text>

                        </View>


                        {/* CARD 3 */}

                        <View style={styles.chooseCard}>

                            <View
                                style={[
                                    styles.chooseIcon,
                                    styles.chooseRedIcon,
                                ]}
                            >
                                <Ionicons
                                    name="heart-outline"
                                    size={27}
                                    color={COLORS.red}
                                />
                            </View>

                            <Text style={styles.chooseTitle}>
                                Better Matches
                            </Text>

                            <Text style={styles.chooseDescription}>
                                Advanced matching
                            </Text>

                            <Text style={styles.chooseDescription}>
                                for better compatibility
                            </Text>

                        </View>


                        {/* CARD 4 */}

                        <View style={styles.chooseCard}>

                            <View
                                style={[
                                    styles.chooseIcon,
                                    styles.chooseYellowIcon,
                                ]}
                            >
                                <Ionicons
                                    name="headset-outline"
                                    size={26}
                                    color={COLORS.yellow}
                                />
                            </View>

                            <Text style={styles.chooseTitle}>
                                Dedicated Support
                            </Text>

                            <Text style={styles.chooseDescription}>
                                We are here to help
                            </Text>

                            <Text style={styles.chooseDescription}>
                                you at every step
                            </Text>

                        </View>
                    </View>

                    {/* =================================================
              OUR STORY
          ================================================= */}

                    <View style={styles.storyCard}>

                        <View style={styles.storyHeading}>

                            <View style={styles.storyHeadingIcon}>

                                <Ionicons
                                    name="book-outline"
                                    size={22}
                                    color={COLORS.red}
                                />

                            </View>

                            <Text style={styles.storyTitle}>
                                Our Story
                            </Text>

                        </View>

                        <Text style={styles.storyText}>
                            Mudhiraj Matrimony was created with a simple
                            belief – every individual deserves a life partner
                            who understands their values, traditions and
                            dreams.
                        </Text>

                        <Text style={styles.storyText}>
                            We combine tradition with technology to make
                            your journey of finding the right match simple,
                            respectful and successful.
                        </Text>

                        {/* Decorative Illustration */}

                        <View style={styles.storyDecoration}>

                            <Ionicons
                                name="heart"
                                size={19}
                                color="#F5C4C4"
                            />

                            <Ionicons
                                name="people"
                                size={48}
                                color="#F3BABA"
                            />

                        </View>

                    </View>

                    {/* =================================================
              STATISTICS
          ================================================= */}

                    <View style={styles.statsCard}>

                        {/* STAT 1 */}

                        <View style={styles.statItem}>

                            <Ionicons
                                name="people-outline"
                                size={24}
                                color={COLORS.red}
                            />

                            <Text style={styles.statNumber}>
                                10K+
                            </Text>

                            <Text style={styles.statLabel}>
                                Happy Families
                            </Text>

                        </View>

                        <View style={styles.statDivider} />

                        {/* STAT 2 */}

                        <View style={styles.statItem}>

                            <Ionicons
                                name="person-outline"
                                size={24}
                                color={COLORS.yellow}
                            />

                            <Text style={styles.statNumber}>
                                25K+
                            </Text>

                            <Text style={styles.statLabel}>
                                Members
                            </Text>

                        </View>

                        <View style={styles.statDivider} />

                        {/* STAT 3 */}

                        <View style={styles.statItem}>

                            <Ionicons
                                name="shield-checkmark-outline"
                                size={24}
                                color={COLORS.red}
                            />

                            <Text style={styles.statNumber}>
                                100%
                            </Text>

                            <Text style={styles.statLabel}>
                                Verified
                            </Text>

                        </View>

                        <View style={styles.statDivider} />

                        {/* STAT 4 */}

                        <View style={styles.statItem}>

                            <Ionicons
                                name="happy-outline"
                                size={24}
                                color={COLORS.yellow}
                            />

                            <Text style={styles.statNumber}>
                                4.8/5
                            </Text>

                            <Text style={styles.statLabel}>
                                Rating
                            </Text>

                        </View>

                    </View>

                    {/* =================================================
              COMMITMENT
          ================================================= */}

                    <View style={styles.commitmentCard}>

                        {/* =========================
      OUR COMMITMENT
  ========================= */}

                        <View style={styles.commitmentItem}>

                            <View style={styles.commitmentIconRed}>
                                <Ionicons
                                    name="shield-checkmark"
                                    size={18}
                                    color={COLORS.red}
                                />
                            </View>

                            <View style={styles.commitmentText}>

                                <Text style={styles.commitmentTitle}>
                                    Our Commitment
                                </Text>

                                <Text style={styles.commitmentDescription}>
                                    We are committed to your privacy and security.
                                </Text>

                                <Text style={styles.commitmentDescription}>
                                    Your trust is our top priority.
                                </Text>

                            </View>

                        </View>


                        {/* =========================
      VERTICAL DIVIDER
  ========================= */}

                        <View style={styles.commitmentDividerVertical} />


                        {/* =========================
      YOUR PRIVACY
  ========================= */}

                        <View style={styles.commitmentItem}>

                            <View style={styles.commitmentIconYellow}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={18}
                                    color={COLORS.yellow}
                                />
                            </View>

                            <View style={styles.commitmentText}>

                                <Text style={styles.commitmentTitle}>
                                    Your Privacy is Important to us.
                                </Text>

                                <Text style={styles.commitmentDescription}>
                                    We do not share your information
                                </Text>

                                <Text style={styles.commitmentDescription}>
                                    with anyone.
                                </Text>

                            </View>

                        </View>

                    </View>

                    {/* =================================================
              CONTACT SUPPORT
          ================================================= */}

                    <View style={styles.contactCard}>

                        {/* Contact Icon */}

                        <View style={styles.contactIcon}>

                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={26}
                                color={COLORS.white}
                            />

                        </View>

                        {/* Contact Text */}

                        <View style={styles.contactText}>

                            <Text style={styles.contactTitle}>
                                Have Questions?
                            </Text>

                            <Text style={styles.contactDescription}>
                                We're here to help you.
                            </Text>

                        </View>

                        {/* Contact Button */}

                        <TouchableOpacity
                            style={styles.contactButton}
                            activeOpacity={0.8}
                            onPress={() => router.push("/help-support")}
                        >

                            <Text style={styles.contactButtonText}>
                                Contact Support
                            </Text>

                            <Ionicons
                                name="chevron-forward"
                                size={18}
                                color={COLORS.white}
                            />

                        </TouchableOpacity>

                    </View>

                    {/* Bottom Space */}

                    <View style={styles.bottomSpace} />

                </View>

            </ScrollView>

        </SafeAreaView>
    );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

    /* =======================================================
       SCREEN
    ======================================================= */

    safeArea: {
        flex: 1,
        backgroundColor: COLORS.white,
    },

    scrollContent: {
        backgroundColor: COLORS.white,
        paddingBottom: 0,
    },

    /* =======================================================
       HEADER
    ======================================================= */

    header: {
        height: 145,

        backgroundColor: COLORS.red,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 16,

        position: "relative",

        overflow: "hidden",
    },

    headerPattern: {
        position: "absolute",

        right: -15,
        top: -8,

        width: 185,
        height: 150,

        opacity: 0.12,

        transform: [
            {
                rotate: "-12deg",
            },
        ],
    },

    patternLine: {
        color: COLORS.white,

        fontSize: 20,

        lineHeight: 31,

        letterSpacing: 2,
    },

    backButton: {
        width: 40,
        height: 48,

        alignItems: "center",
        justifyContent: "center",

        zIndex: 10,
    },

    headerText: {
        flex: 1,

        marginLeft: 7,

        paddingRight: 12,

        zIndex: 10,
    },

    headerTitle: {
        color: COLORS.white,

        fontSize: 24,

        fontWeight: "700",

        lineHeight: 30,
    },

    headerSubtitle: {
        color: COLORS.yellow,

        fontSize: 12.5,

        fontWeight: "500",

        lineHeight: 17,

        marginTop: 3,
    },

    /* =======================================================
       MAIN CONTAINER
    ======================================================= */

    mainContainer: {
        marginTop: -25,

        backgroundColor: COLORS.white,

        borderTopLeftRadius: 23,
        borderTopRightRadius: 23,

        paddingTop: 12,

        paddingBottom: 15,

        overflow: "hidden",
    },

    /* =======================================================
       HERO
    ======================================================= */

    heroSection: {
        marginHorizontal: 12,

        minHeight: 155,

        backgroundColor: COLORS.heroBg,

        borderRadius: 13,

        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 10,

        paddingVertical: 13,

        borderWidth: 1,

        borderColor: COLORS.heroBorder,
    },

    heroIconWrapper: {
        width: 102,

        height: 128,

        justifyContent: "center",

        alignItems: "center",

        position: "relative",
    },

    heroIconCircle: {
        width: 92,

        height: 92,

        borderRadius: 46,

        backgroundColor: "#FFF6DC",

        justifyContent: "center",

        alignItems: "center",

        borderWidth: 1,

        borderColor: "#FFE5A2",

        position: "relative",
    },

    heroPeople: {
        position: "absolute",

        bottom: 11,

        justifyContent: "center",

        alignItems: "center",
    },

    starOne: {
        position: "absolute",

        top: 8,

        left: 3,

        color: "#F6C342",

        fontSize: 11,
    },

    starTwo: {
        position: "absolute",

        top: 16,

        right: 0,

        color: "#F6C342",

        fontSize: 10,
    },

    starThree: {
        position: "absolute",

        bottom: 12,

        left: 0,

        color: "#F6C342",

        fontSize: 12,
    },

    starFour: {
        position: "absolute",

        bottom: 4,

        right: 5,

        color: "#F6C342",

        fontSize: 10,
    },

    heroContent: {
        flex: 1,

        paddingLeft: 7,

        paddingRight: 5,
    },

    heroTitleRed: {
        color: "#C51A1F",

        fontSize: 14,

        fontWeight: "700",

        lineHeight: 18,
    },

    heroTitleBlack: {
        color: COLORS.black,

        fontSize: 14,

        fontWeight: "700",

        lineHeight: 18,

        marginTop: 1,
    },

    heroUnderline: {
        width: 43,

        height: 2,

        backgroundColor: COLORS.yellow,

        marginTop: 7,

        marginBottom: 8,
    },

    heroDescription: {
        color: "#484B50",

        fontSize: 10.5,

        lineHeight: 15.5,
    },

    /* =======================================================
       DIVIDER
    ======================================================= */

    horizontalDivider: {
        height: 1,

        backgroundColor: "#EEEEEE",

        marginHorizontal: 18,
    },

    /* =======================================================
       MISSION / VISION
    ======================================================= */

    infoSection: {
        minHeight: 91,

        flexDirection: "row",

        paddingHorizontal: 19,

        paddingVertical: 13,

        alignItems: "flex-start",
    },

    infoIconWrapper: {
        width: 32,

        alignItems: "center",

        paddingTop: 1,
    },

    infoContent: {
        flex: 1,

        paddingLeft: 7,
    },

    infoTitle: {
        color: COLORS.red,

        fontSize: 14,

        fontWeight: "700",

        lineHeight: 18,

        marginBottom: 4,
    },

    infoDescription: {
        color: "#555960",

        fontSize: 10.5,

        lineHeight: 16,
    },

    /* =======================================================
       SECTION HEADING
    ======================================================= */

    sectionHeadingRow: {
        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 18,

        marginTop: 6,

        marginBottom: 9,
    },

    sectionHeading: {
        color: COLORS.red,

        fontSize: 15,

        fontWeight: "700",

        lineHeight: 20,

        marginLeft: 7,
    },

    /* =======================================================
   WHY CHOOSE US GRID
======================================================= */

    chooseGrid: {
        flexDirection: "row",
        justifyContent: "space-between",

        paddingHorizontal: 12,
        paddingTop: 2,
        paddingBottom: 4,

        width: "100%",
    },

    /* =======================================================
       EACH CARD
    ======================================================= */

    chooseCard: {
        width: (width - 42) / 4,

        height: 104,

        backgroundColor: COLORS.white,

        borderRadius: 8,

        borderWidth: 1,
        borderColor: "#EAEAEA",

        alignItems: "center",
        justifyContent: "flex-start",

        paddingTop: 7,
        paddingHorizontal: 2,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.04,
        shadowRadius: 2,

        elevation: 1,
    },

    /* =======================================================
       ICON CIRCLE
    ======================================================= */

    chooseIcon: {
        width: 42,
        height: 42,

        borderRadius: 21,

        alignItems: "center",
        justifyContent: "center",

        marginBottom: 5,
    },

    /* =======================================================
       RED ICON
    ======================================================= */

    chooseRedIcon: {
        backgroundColor: "#FFF1F1",

        borderWidth: 1,
        borderColor: "#FFD8D8",
    },

    /* =======================================================
       YELLOW ICON
    ======================================================= */

    chooseYellowIcon: {
        backgroundColor: "#FFF8E5",

        borderWidth: 1,
        borderColor: "#FFE4A3",
    },

    /* =======================================================
       CARD TITLE
    ======================================================= */

    chooseTitle: {
        color: "#1D1D1D",

        fontSize: 8.5,

        fontWeight: "700",

        textAlign: "center",

        lineHeight: 11,

        width: "100%",

        marginBottom: 2,
    },

    /* =======================================================
       CARD DESCRIPTION
    ======================================================= */

    chooseDescription: {
        color: "#5C6065",

        fontSize: 7.2,

        fontWeight: "400",

        textAlign: "center",

        lineHeight: 10,

        width: "100%",
    },
    /* =======================================================
       STORY
    ======================================================= */

    storyCard: {
        marginHorizontal: 12,

        marginTop: 9,

        minHeight: 138,

        borderRadius: 11,

        borderWidth: 1,

        borderColor: COLORS.storyBorder,

        backgroundColor: COLORS.storyBg,

        paddingHorizontal: 12,

        paddingVertical: 11,

        position: "relative",

        overflow: "hidden",
    },

    storyHeading: {
        flexDirection: "row",

        alignItems: "center",

        marginBottom: 7,
    },

    storyHeadingIcon: {
        width: 25,

        alignItems: "center",

        justifyContent: "center",
    },

    storyTitle: {
        color: COLORS.red,

        fontSize: 14,

        fontWeight: "700",

        lineHeight: 18,

        marginLeft: 5,
    },

    storyText: {
        color: "#51555A",

        fontSize: 10,

        lineHeight: 15,

        paddingRight: 56,

        marginBottom: 4,
    },

    storyDecoration: {
        position: "absolute",

        right: 13,

        bottom: 7,

        alignItems: "center",

        opacity: 0.55,
    },

    /* =======================================================
       STATISTICS
    ======================================================= */

    statsCard: {
        marginHorizontal: 12,

        marginTop: 9,

        minHeight: 78,

        borderRadius: 10,

        backgroundColor: COLORS.statsBg,

        borderWidth: 1,

        borderColor: COLORS.statsBorder,

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "space-around",

        paddingHorizontal: 2,
    },

    statItem: {
        flex: 1,

        alignItems: "center",

        justifyContent: "center",

        paddingHorizontal: 2,
    },

    statDivider: {
        width: 1,

        height: 52,

        backgroundColor: "#E9DFC6",
    },

    statNumber: {
        color: COLORS.black,

        fontSize: 12,

        lineHeight: 16,

        fontWeight: "700",

        marginTop: 3,
    },

    statLabel: {
        color: "#383B3F",

        fontSize: 8,

        lineHeight: 11,

        marginTop: 2,

        textAlign: "center",
    },

   /* =======================================================
   COMMITMENT CARD
======================================================= */

commitmentCard: {
  marginHorizontal: 12,

  marginTop: 10,

  minHeight: 72,

  backgroundColor: COLORS.white,

  borderRadius: 10,

  borderWidth: 1,
  borderColor: "#EDEDED",

  flexDirection: "row",

  alignItems: "center",

  paddingHorizontal: 9,

  overflow: "hidden",

  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.03,
  shadowRadius: 2,
  elevation: 1,
},

/* =======================================================
   EACH SIDE
======================================================= */

commitmentItem: {
  flex: 1,

  flexDirection: "row",

  alignItems: "center",

  minWidth: 0,

  paddingVertical: 7,
},

/* =======================================================
   RED ICON
======================================================= */

commitmentIconRed: {
  width: 34,
  height: 34,

  borderRadius: 17,

  backgroundColor: "#FFF0F0",

  borderWidth: 1,
  borderColor: "#FFD7D7",

  alignItems: "center",
  justifyContent: "center",

  marginRight: 7,
},

/* =======================================================
   YELLOW ICON
======================================================= */

commitmentIconYellow: {
  width: 34,
  height: 34,

  borderRadius: 17,

  backgroundColor: "#FFF8E5",

  borderWidth: 1,
  borderColor: "#FFE5A5",

  alignItems: "center",
  justifyContent: "center",

  marginRight: 7,
},

/* =======================================================
   TEXT
======================================================= */

commitmentText: {
  flex: 1,

  minWidth: 0,

  paddingRight: 3,
},

/* =======================================================
   TITLE
======================================================= */

commitmentTitle: {
  color: COLORS.red,

  fontSize: 8.5,

  fontWeight: "700",

  lineHeight: 11,

  marginBottom: 2,

  includeFontPadding: false,
},

/* =======================================================
   DESCRIPTION
======================================================= */

commitmentDescription: {
  color: "#555960",

  fontSize: 7,

  fontWeight: "400",

  lineHeight: 9.5,

  includeFontPadding: false,
},

/* =======================================================
   CENTER VERTICAL DIVIDER
======================================================= */

commitmentDividerVertical: {
  width: 1,

  height: 48,

  backgroundColor: "#E8E8E8",

  marginHorizontal: 6,
},
    /* =======================================================
       CONTACT CARD
    ======================================================= */

    contactCard: {
        marginHorizontal: 12,

        marginTop: 9,

        minHeight: 72,

        borderRadius: 10,

        backgroundColor: COLORS.contactBg,

        borderWidth: 1,

        borderColor: COLORS.contactBorder,

        flexDirection: "row",

        alignItems: "center",

        paddingHorizontal: 9,
    },

    contactIcon: {
        width: 41,

        height: 41,

        borderRadius: 21,

        backgroundColor: COLORS.yellow,

        alignItems: "center",

        justifyContent: "center",

        marginRight: 8,
    },

    contactText: {
        flex: 1,

        paddingRight: 3,
    },

    contactTitle: {
        color: COLORS.black,

        fontSize: 12,

        lineHeight: 16,

        fontWeight: "700",

        marginBottom: 2,
    },

    contactDescription: {
        color: "#4F5358",

        fontSize: 9.5,

        lineHeight: 13,
    },

    contactButton: {
        height: 38,

        paddingHorizontal: 9,

        backgroundColor: COLORS.red,

        borderRadius: 7,

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",

        marginLeft: 5,
    },

    contactButtonText: {
        color: COLORS.white,

        fontSize: 9.5,

        lineHeight: 13,

        fontWeight: "700",

        marginRight: 3,
    },

    /* =======================================================
       BOTTOM SPACE
    ======================================================= */

    bottomSpace: {
        height: 20,
    },

});