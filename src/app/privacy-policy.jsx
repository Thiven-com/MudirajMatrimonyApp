
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

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  red: "#D71920",
  darkRed: "#B40000",
  yellow: "#F5A900",

  white: "#FFFFFF",
  black: "#181818",

  text: "#303236",
  gray: "#66686D",
  lightGray: "#EEEEEE",

  lightRed: "#FFF3F3",
  lightYellow: "#FFF9E9",

  border: "#E8E8E8",
};

/* =========================================================
   PRIVACY POLICY SCREEN
========================================================= */

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.red}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>

          {/* Decorative Pattern */}

          <View style={styles.headerPattern}>

            <Text style={styles.patternText}>
              ❖ ❖ ❖ ❖
            </Text>

            <Text style={styles.patternText}>
              ❖ ❖ ❖ ❖ ❖
            </Text>

            <Text style={styles.patternText}>
              ❖ ❖ ❖
            </Text>

            <Text style={styles.patternText}>
              ❖ ❖ ❖ ❖
            </Text>

          </View>

          {/* Back Button */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={COLORS.white}
            />
          </TouchableOpacity>

          {/* Header Text */}

          <View style={styles.headerTextContainer}>

            <Text style={styles.headerTitle}>
              Privacy Policy
            </Text>

            <Text style={styles.headerSubtitle}>
              Your privacy is important to us
            </Text>

          </View>

        </View>


        {/* =================================================
            MAIN WHITE CONTAINER
        ================================================= */}

        <View style={styles.mainContainer}>

          {/* =================================================
              INTRO CARD
          ================================================= */}

          <View style={styles.introSection}>

            {/* LEFT ILLUSTRATION */}

            <View style={styles.privacyIllustration}>

              <View style={styles.shieldBackground}>

                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={55}
                  color={COLORS.red}
                />

              </View>

              {/* Small person icon */}

              <View style={styles.personCircle}>

                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.red}
                />

              </View>

            </View>


            {/* INTRO TEXT */}

            <View style={styles.introContent}>

              <Text style={styles.introTitle}>
                We Respect Your Privacy
              </Text>

              <Text style={styles.introDescription}>
                This Privacy Policy explains how Mudhiraj Matrimony
                collects, uses, protects and shares your information
                when you use our app and services.
              </Text>

              <View style={styles.updatedRow}>

                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={COLORS.red}
                />

                <Text style={styles.updatedText}>
                  Last Updated: 15 May 2024
                </Text>

              </View>

            </View>

          </View>


          <View style={styles.divider} />


          {/* =================================================
              1. INFORMATION WE COLLECT
          ================================================= */}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              1. Information We Collect
            </Text>

            <Text style={styles.sectionSubtitle}>
              We collect information that you provide to us directly,
              such as:
            </Text>


            <PrivacyListItem
              icon="person-outline"
              title="Personal Information"
              description="Name, email address, phone number, date of birth, gender and profile details."
            />


            <PrivacyListItem
              icon="card-outline"
              title="Profile Information"
              description="Photos, preferences, interests, education, occupation and other information you add to your profile."
            />


            <PrivacyListItem
              icon="heart-outline"
              title="Usage Information"
              description="Information about how you use our app, features you access, pages you visit and actions you take."
            />


            <PrivacyListItem
              icon="phone-portrait-outline"
              title="Device Information"
              description="Device type, operating system, IP address, unique device identifiers and other technical information."
              last
            />

          </View>


          {/* =================================================
              2. HOW WE USE
          ================================================= */}

          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              2. How We Use Your Information
            </Text>

            <Text style={styles.sectionSubtitle}>
              We use the information we collect to:
            </Text>


            <View style={styles.useGrid}>

              <UseItem
                icon="people-outline"
                text={
                  <>
                    Provide and improve{"\n"}
                    our services
                  </>
                }
              />


              <UseItem
                icon="heart-outline"
                text={
                  <>
                    Match you with suitable{"\n"}
                    profiles and show relevant{"\n"}
                    suggestions
                  </>
                }
              />


              <UseItem
                icon="notifications-outline"
                text={
                  <>
                    Send you important{"\n"}
                    updates, notifications and{"\n"}
                    promotional messages
                  </>
                }
              />


              <UseItem
                icon="shield-checkmark-outline"
                text={
                  <>
                    Ensure safety, prevent{"\n"}
                    fraud and enforce our{"\n"}
                    Terms of Use
                  </>
                }
              />


              <UseItem
                icon="bar-chart-outline"
                text={
                  <>
                    Analyze usage and{"\n"}
                    improve user experience
                  </>
                }
              />


              <UseItem
                icon="headset-outline"
                text={
                  <>
                    Provide customer support{"\n"}
                    and assistance
                  </>
                }
              />

            </View>

          </View>


          {/* =================================================
              POLICY ROWS
          ================================================= */}

          <PolicyRow
            number="3."
            title="How We Share Your Information"
            description="We do not sell your personal information. We may share your information only in limited circumstances as described in this policy."
          />


          <PolicyRow
            number="4."
            title="Data Security"
            description="We use industry-standard security measures to protect your data from unauthorized access, alteration or disclosure."
          />


          <PolicyRow
            number="5."
            title="Your Choices"
            description="You can review, update or delete your information and manage your communication preferences anytime."
          />


          <PolicyRow
            number="6."
            title="Changes to This Policy"
            description="We may update this Privacy Policy from time to time. We will notify you of any changes by updating the Last Updated date above."
          />


          <PolicyRow
            number="7."
            title="Contact Us"
            description="If you have any questions or concerns about this Privacy Policy, please contact us."
          />


          {/* =================================================
              TRUST CARD
          ================================================= */}

          <View style={styles.trustCard}>

            {/* Icon */}

            <View style={styles.trustIcon}>

              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={25}
                color={COLORS.red}
              />

            </View>


            {/* Text */}

            <View style={styles.trustText}>

              <Text style={styles.trustTitle}>
                Your trust is our priority.
              </Text>

              <Text style={styles.trustDescription}>
                We are committed to protecting your privacy and
                safeguarding your data.
              </Text>

            </View>


            {/* Contact Button */}

            <TouchableOpacity
              style={styles.contactButton}
              activeOpacity={0.8}
              onPress={() => router.push("/help-support")}
            >

              <Ionicons
                name="mail-outline"
                size={15}
                color={COLORS.red}
              />

              <Text style={styles.contactButtonText}>
                Contact Us
              </Text>

            </TouchableOpacity>

          </View>


          {/* Bottom Space */}

          <View style={{ height: 20 }} />

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


/* =========================================================
   PRIVACY LIST ITEM
========================================================= */

function PrivacyListItem({
  icon,
  title,
  description,
  last,
}) {
  return (
    <View
      style={[
        styles.privacyListItem,
        last && styles.lastPrivacyItem,
      ]}
    >

      {/* Icon */}

      <View style={styles.privacyItemIcon}>

        <Ionicons
          name={icon}
          size={17}
          color={COLORS.red}
        />

      </View>


      {/* Content */}

      <View style={styles.privacyItemContent}>

        <Text style={styles.privacyItemTitle}>
          {title}
        </Text>

        <Text style={styles.privacyItemDescription}>
          {description}
        </Text>

      </View>

    </View>
  );
}


/* =========================================================
   HOW WE USE ITEM
========================================================= */

function UseItem({
  icon,
  text,
}) {
  return (
    <View style={styles.useItem}>

      <View style={styles.useIcon}>

        <Ionicons
          name={icon}
          size={19}
          color={COLORS.red}
        />

      </View>

      <Text style={styles.useText}>
        {text}
      </Text>

    </View>
  );
}


/* =========================================================
   POLICY ROW
========================================================= */

function PolicyRow({
  number,
  title,
  description,
}) {
  return (
    <TouchableOpacity
      style={styles.policyRow}
      activeOpacity={0.8}
    >

      <View style={styles.policyContent}>

        <Text style={styles.policyTitle}>
          {number} {title}
        </Text>

        <Text style={styles.policyDescription}>
          {description}
        </Text>

      </View>


      <Ionicons
        name="chevron-forward"
        size={16}
        color="#777777"
      />

    </TouchableOpacity>
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
    flexGrow: 1,
    backgroundColor: COLORS.white,
    paddingBottom: 15,
  },


  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: 115,
    backgroundColor: COLORS.red,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    position: "relative",
    overflow: "hidden",
  },


  headerPattern: {
    position: "absolute",
    right: -32,
    top: -18,
    width: 180,
    height: 130,
    opacity: 0.10,
    transform: [
      {
        rotate: "-12deg",
      },
    ],
  },


  patternText: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: 2,
  },


  /* =======================================================
     BACK BUTTON
  ======================================================= */

  backButton: {
    width: 38,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },


  /* =======================================================
     HEADER TEXT
  ======================================================= */

  headerTextContainer: {
    flex: 1,
    marginLeft: 6,
    zIndex: 10,
  },


  headerTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 26,
  },


  headerSubtitle: {
    color: "#FFD83D",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
    lineHeight: 16,
  },


  /* =======================================================
     MAIN CONTAINER
  ======================================================= */

  mainContainer: {
    marginTop: -18,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: "hidden",
    paddingBottom: 15,
  },


  /* =======================================================
     INTRO SECTION
  ======================================================= */

  introSection: {
    minHeight: 140,
    backgroundColor: "#FFFCFC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },


  /* =======================================================
     PRIVACY ILLUSTRATION
  ======================================================= */

  privacyIllustration: {
    width: 90,
    height: 105,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },


  shieldBackground: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFF8E9",
    borderWidth: 1,
    borderColor: "#FFE6A8",
    alignItems: "center",
    justifyContent: "center",
  },


  /* =======================================================
     PERSON
  ======================================================= */

  personCircle: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: "#FFF1F1",
    borderWidth: 1.5,
    borderColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },


  /* =======================================================
     INTRO CONTENT
  ======================================================= */

  introContent: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 5,
    minWidth: 0,
  },


  introTitle: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
    lineHeight: 21,
  },


  introDescription: {
    color: "#45474B",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
  },


  /* =======================================================
     UPDATED
  ======================================================= */

  updatedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },


  updatedText: {
    color: "#45474B",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 5,
    lineHeight: 15,
  },


  /* =======================================================
     DIVIDER
  ======================================================= */

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },


  /* =======================================================
     SECTION
  ======================================================= */

  section: {
    paddingHorizontal: 14,
    paddingTop: 15,
  },


  sectionTitle: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
    lineHeight: 20,
  },


  sectionSubtitle: {
    color: "#666A70",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 17,
    marginBottom: 5,
  },


  /* =======================================================
     INFORMATION LIST
  ======================================================= */

  privacyListItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingVertical: 7,
  },


  lastPrivacyItem: {
    borderBottomWidth: 0,
  },


  /* =======================================================
     INFORMATION ICON
  ======================================================= */

  privacyItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FFD7D7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    flexShrink: 0,
  },


  privacyItemContent: {
    flex: 1,
    minWidth: 0,
  },


  privacyItemTitle: {
    color: "#25272B",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
    lineHeight: 19,
  },


  privacyItemDescription: {
    color: "#666A70",
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 16,
  },


  /* =======================================================
     HOW WE USE GRID
  ======================================================= */

  useGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },


  useItem: {
    width: "33.3333%",
    minHeight: 95,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },


  /* =======================================================
     USE ICON
  ======================================================= */

  useIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF2F2",
    borderWidth: 1,
    borderColor: "#FFDADA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },


  useText: {
    color: "#3E4146",
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
    textAlign: "center",
    paddingHorizontal: 3,
  },


  /* =======================================================
     POLICY ROW
  ======================================================= */

  policyRow: {
    minHeight: 65,
    marginHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
  },


  policyContent: {
    flex: 1,
    paddingRight: 8,
    minWidth: 0,
  },


  policyTitle: {
    color: "#25272B",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
    lineHeight: 19,
  },


  policyDescription: {
    color: "#666A70",
    fontSize: 11.5,
    fontWeight: "400",
    lineHeight: 16,
  },


  /* =======================================================
     TRUST CARD
  ======================================================= */

  trustCard: {
    marginHorizontal: 14,
    marginTop: 12,
    minHeight: 72,
    borderRadius: 10,
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD8D8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },


  /* =======================================================
     TRUST ICON
  ======================================================= */

  trustIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD3D3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flexShrink: 0,
  },


  /* =======================================================
     TRUST TEXT
  ======================================================= */

  trustText: {
    flex: 1,
    paddingRight: 6,
    minWidth: 0,
  },


  trustTitle: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
    lineHeight: 18,
  },


  trustDescription: {
    color: "#666A70",
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 16,
  },


  /* =======================================================
     CONTACT BUTTON
  ======================================================= */

  contactButton: {
    height: 36,
    minWidth: 90,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.red,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    flexShrink: 0,
  },


  contactButtonText: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },

});