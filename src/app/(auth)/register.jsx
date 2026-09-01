import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Path,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import { Colors } from "../../constants/colors";
import { Fonts, FontSizes } from "../../constants/Fonts";
import { signup } from "../../utils/Functions";

const LOGO = require("../../../assets/images/logo.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Header wave geometry — reversed curve: edges dip down, center arches up
// (same geometry used on the login / OTP screens)
const HEADER_HEIGHT = 210;
const EDGE_Y = HEADER_HEIGHT * 0.7;
const PEAK_Y = HEADER_HEIGHT * 0.33;
const CTRL_Y = HEADER_HEIGHT * 0.05;

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const handleRegister = async () => {
    if (
      !fullName.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !dob ||
      !gender ||
      !agreed
    ) {
      console.log("Registration validation failed");
      return;
    }

    try {
      const result = await signup({
        fullName: fullName.trim(),
        mobile,
        email: email.trim(),
        dob,
        gender,
        agreed,
      });

      console.log("signup() raw result:", JSON.stringify(result));

      if (result?.result === false || result?.success === 0) {
        console.log(result?.message || "Unable to create account right now.");
        return;
      }

      router.replace("/login");
    } catch (error) {
      console.log("signup Error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ================= HEADER SECTION ================= */}
        <View style={styles.headerContainer}>
          <HeaderWave width={SCREEN_WIDTH} />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <View style={styles.logoRing}>
            <Image
              source={LOGO}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ================= TITLE & TAGLINE ================= */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>MUDIRAJ WORLD</Text>
          <View style={styles.taglineRow}>
            <View style={styles.taglineLine} />
            <Text style={styles.taglineText}>
              Connect | Unite | Grow Together
            </Text>
            <View style={styles.taglineLine} />
          </View>
          <View style={styles.flourishRow}>
            <View style={styles.flourishDot} />
            <Text style={styles.flourishSymbol}>❖</Text>
            <View style={styles.flourishDot} />
          </View>
        </View>

        {/* ================= FORM HEADING ================= */}
        <Text style={styles.formHeading}>Create Your Account</Text>
        <Text style={styles.formSubtext}>
          Join Mudiraj World and find your perfect match
        </Text>

        {/* ================= FORM FIELDS ================= */}
        <View style={styles.fieldsContainer}>
          <FieldCard
            icon={
              <Ionicons
                name="person-outline"
                size={18}
                color={Colors.primaryRed}
              />
            }
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            trailing={
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.textMuted}
              />
            }
          />

          <FieldCard
            icon={
              <Ionicons
                name="call-outline"
                size={18}
                color={Colors.primaryRed}
              />
            }
            label="Mobile Number"
            placeholder="Enter your mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            trailing={
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
                <Ionicons
                  name="chevron-down"
                  size={15}
                  color={Colors.textMuted}
                />
              </View>
            }
          />

          <FieldCard
            icon={
              <Ionicons
                name="mail-outline"
                size={18}
                color={Colors.primaryRed}
              />
            }
            label="Email Address"
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            trailing={
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.textMuted}
              />
            }
          />

          <FieldCard
            icon={
              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.primaryRed}
              />
            }
            label="Date of Birth"
            placeholder="DD / MM / YYYY"
            value={dob}
            onChangeText={setDob}
            keyboardType="number-pad"
            trailing={
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.textMuted}
              />
            }
          />
          {/* For a real date picker, swap the TextInput above for
              @react-native-community/datetimepicker and format the result into `dob`. */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setGenderModalVisible(true)}
          >
            <FieldCard
              icon={
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={Colors.primaryRed}
                />
              }
              label="Gender"
              placeholder="Select your gender"
              value={gender}
              editable={false}
              pointerEvents="none"
              trailing={
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={Colors.textMuted}
                />
              }
            />
          </TouchableOpacity>
        </View>

        {/* ================= TERMS CHECKBOX ================= */}
        <TouchableOpacity
          style={styles.termsRow}
          activeOpacity={0.8}
          onPress={() => setAgreed(!agreed)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && (
              <Ionicons name="checkmark" size={12} color={Colors.white} />
            )}
          </View>
          <Text style={styles.termsText}>
            I agree to the{" "}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* ================= REGISTER BUTTON ================= */}
        <TouchableOpacity
          style={styles.registerButtonTouchable}
          activeOpacity={0.85}
          onPress={handleRegister}
        >
          <LinearGradient
            colors={["#C00000", "#DC2626", "#F59E0B", "#FBBF24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.registerButton}
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.registerButtonText}>REGISTER</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ================= OR DIVIDER ================= */}
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        {/* ================= SOCIAL BUTTONS ================= */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <FontAwesome name="google" size={18} color={Colors.google} />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Ionicons name="logo-facebook" size={20} color={Colors.facebook} />
            <Text style={styles.socialText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* ================= LOGIN LINK ================= */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* ================= HERITAGE WATERMARK FOOTER ================= */}
        <View style={styles.skylineWrapper}>
          <HeritageSkyline />
        </View>
      </ScrollView>

      {/* ================= GENDER PICKER MODAL ================= */}
      <Modal
        visible={genderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setGenderModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setGender(option);
                  setGenderModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
                {gender === option && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={Colors.primaryRed}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ================= REUSABLE FORM FIELD CARD =================
function FieldCard({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  trailing,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  editable = true,
}) {
  return (
    <View style={styles.fieldCard}>
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.fieldTextBlock}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          editable={editable}
          underlineColorAndroid="transparent"
        />
      </View>
      {trailing}
    </View>
  );
}

// ================= HEADER WAVE (reversed: edges dip, center arches up) =================
// Same geometry as the login / OTP screens' HeaderWave.
function HeaderWave({ width }) {
  const w = width;
  const redPath = `M0,0 H${w} V${EDGE_Y} Q${w * 0.75},${CTRL_Y} ${w / 2},${PEAK_Y} Q${w * 0.25},${CTRL_Y} 0,${EDGE_Y} Z`;
  const goldPath = `M0,${EDGE_Y + 10} Q${w * 0.25},${CTRL_Y + 10} ${w / 2},${PEAK_Y + 10} Q${w * 0.75},${CTRL_Y + 10} ${w},${EDGE_Y + 10}`;

  return (
    <Svg
      width={w}
      height={HEADER_HEIGHT}
      viewBox={`0 0 ${w} ${HEADER_HEIGHT}`}
      style={StyleSheet.absoluteFillObject}
    >
      <Defs>
        <SvgGradient id="registerHeaderRedGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.primaryRed} />
          <Stop offset="1" stopColor={Colors.primaryRedDark} />
        </SvgGradient>
        <SvgGradient id="registerHeaderGoldGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Colors.goldLight} />
          <Stop offset="0.5" stopColor={Colors.gold} />
          <Stop offset="1" stopColor={Colors.goldLight} />
        </SvgGradient>
      </Defs>
      <Path d={redPath} fill="url(#registerHeaderRedGrad)" />
      <Path
        d={goldPath}
        stroke="url(#registerHeaderGoldGrad)"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ================= HERITAGE SKYLINE (shared motif) =================
function HeritageSkyline() {
  return (
    <View style={styles.skylineSvgContainer}>
      <View style={styles.monumentCluster}>
        <View style={styles.monumentPillar}>
          <View style={styles.domeTop} />
          <View style={styles.towerBody} />
        </View>
        <View style={styles.monumentTower}>
          <View style={styles.spireTop} />
          <View style={styles.minaretDome} />
          <View style={styles.minaretBody}>
            <View style={styles.archHole} />
          </View>
        </View>
        <View style={styles.templeBlock}>
          <View style={styles.kalashPeak} />
          <View style={styles.onionDome} />
          <View style={styles.buildingBase}>
            <View style={styles.archWindow} />
            <View style={styles.archWindow} />
          </View>
        </View>
        <View style={styles.grandArchBlock}>
          <View style={styles.charminarTowers}>
            <View style={styles.miniMinaret}>
              <View style={styles.spireTop} />
              <View style={styles.miniMinaretBody} />
            </View>
            <View style={styles.miniMinaret}>
              <View style={styles.spireTop} />
              <View style={styles.miniMinaretBody} />
            </View>
          </View>
          <View style={styles.grandCenterArch}>
            <View style={styles.grandInnerArch} />
          </View>
        </View>
        <View style={styles.templeBlock}>
          <View style={styles.kalashPeak} />
          <View style={styles.onionDome} />
          <View style={styles.buildingBase}>
            <View style={styles.archWindow} />
            <View style={styles.archWindow} />
          </View>
        </View>
        <View style={styles.monumentTower}>
          <View style={styles.spireTop} />
          <View style={styles.minaretDome} />
          <View style={styles.minaretBody}>
            <View style={styles.archHole} />
          </View>
        </View>
        <View style={styles.monumentPillar}>
          <View style={styles.domeTop} />
          <View style={styles.towerBody} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 20,
  },

  /* ===== HEADER ===== */
  headerContainer: {
    width: "100%",
    height: HEADER_HEIGHT,
    position: "relative",
    alignItems: "center",
    marginBottom: 55,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 8 : 16,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logoRing: {
    position: "absolute",
    top: PEAK_Y - 62,
    alignSelf: "center",
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3.5,
    borderColor: Colors.white,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  logoImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },

  /* ===== TITLE & TAGLINE ===== */
  titleContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  title: {
    fontSize: FontSizes.title,
    fontFamily: Fonts.display.extraBold,
    color: Colors.primaryRedDark,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  taglineLine: {
    width: 32,
    height: 1.2,
    backgroundColor: Colors.gold,
    marginHorizontal: 8,
  },
  taglineText: {
    fontSize: FontSizes.tagline,
    fontFamily: Fonts.body.medium,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  flourishRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  flourishDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
    marginHorizontal: 3,
  },
  flourishSymbol: {
    color: Colors.gold,
    fontSize: 9,
  },

  /* ===== FORM HEADING ===== */
  formHeading: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginTop: 20,
    textAlign: "center",
  },
  formSubtext: {
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 22,
    textAlign: "center",
  },

  /* ===== FORM FIELDS ===== */
  fieldsContainer: {
    width: "90%",
  },
  fieldCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.iconCircleBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fieldTextBlock: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  fieldInput: {
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    padding: 0,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCodeText: {
    fontSize: FontSizes.tagline,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginRight: 3,
  },

  /* ===== TERMS ===== */
  termsRow: {
    width: "90%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.checkboxBorder,
    marginRight: 10,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryRed,
  },
  termsText: {
    flex: 1,
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  termsLink: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.semiBold,
  },

  /* ===== REGISTER BUTTON ===== */
  registerButtonTouchable: {
    width: "90%",
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#E67E00",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  registerButton: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: FontSizes.button,
    fontFamily: Fonts.body.bold,
    letterSpacing: 1.2,
  },

  /* ===== OR DIVIDER ===== */
  orRow: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dividerGold,
  },
  orText: {
    marginHorizontal: 12,
    color: Colors.gold,
    fontFamily: Fonts.body.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },

  /* ===== SOCIAL BUTTONS ===== */
  socialRow: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  socialText: {
    fontSize: FontSizes.social,
    fontFamily: Fonts.body.medium,
    color: Colors.textPrimary,
    marginLeft: 8,
  },

  /* ===== LOGIN ROW ===== */
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 16,
  },
  loginText: {
    fontSize: FontSizes.link,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSizes.link,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== GENDER MODAL ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionText: {
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
  },

  /* ===== BOTTOM SKYLINE WATERMARK ===== */
  skylineWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    opacity: 0.45,
  },
  skylineSvgContainer: {
    width: SCREEN_WIDTH,
    height: 70,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  monumentCluster: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 10,
  },
  monumentPillar: { alignItems: "center" },
  domeTop: {
    width: 14,
    height: 10,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: "#E4B8B8",
  },
  towerBody: { width: 12, height: 28, backgroundColor: "#E4B8B8" },
  monumentTower: { alignItems: "center" },
  spireTop: { width: 2, height: 6, backgroundColor: "#D99E9E" },
  minaretDome: {
    width: 12,
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#E4B8B8",
  },
  minaretBody: {
    width: 10,
    height: 42,
    backgroundColor: "#E4B8B8",
    alignItems: "center",
    justifyContent: "center",
  },
  archHole: {
    width: 4,
    height: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: Colors.background,
  },
  templeBlock: { alignItems: "center" },
  kalashPeak: { width: 3, height: 5, backgroundColor: "#D99E9E" },
  onionDome: {
    width: 28,
    height: 20,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: "#E4B8B8",
  },
  buildingBase: {
    width: 34,
    height: 28,
    backgroundColor: "#E4B8B8",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 4,
  },
  archWindow: {
    width: 6,
    height: 12,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    backgroundColor: Colors.background,
  },
  grandArchBlock: { alignItems: "center" },
  charminarTowers: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 44,
  },
  miniMinaret: { alignItems: "center" },
  miniMinaretBody: { width: 6, height: 18, backgroundColor: "#E4B8B8" },
  grandCenterArch: {
    width: 50,
    height: 45,
    backgroundColor: "#E4B8B8",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  grandInnerArch: {
    width: 26,
    height: 28,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
});
