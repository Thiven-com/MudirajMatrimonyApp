import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
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
import { sendLoginOtp } from "../../utils/Functions";

const LOGO = require("../../../assets/images/logo.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Header wave geometry — reversed curve: edges dip down, center arches up
// (same geometry used on the OTP screen)
const HEADER_HEIGHT = 210;
const EDGE_Y = HEADER_HEIGHT * 0.7;
const PEAK_Y = HEADER_HEIGHT * 0.33;
const CTRL_Y = HEADER_HEIGHT * 0.05;

const MOBILE_LENGTH = 10;

export default function LoginScreen() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleLogin = async () => {
    if (loading) return;

    const cleanedMobile = mobile.trim();
    if (cleanedMobile.length !== MOBILE_LENGTH) {
      setErrorText(`Enter a valid ${MOBILE_LENGTH}-digit mobile number`);
      return;
    }

    setErrorText("");
    setLoading(true);

    try {
      const result = await sendLoginOtp(cleanedMobile);
      console.log("sendLoginOtp() raw result:", JSON.stringify(result));

      if (result?.result === false || result?.success === 0) {
        setErrorText(result?.message || "Unable to send OTP right now.");
        return;
      }

      router.push({ pathname: "/otp", params: { mobile: cleanedMobile } });
    } catch (error) {
      console.log("login Error:", error);
      setErrorText(
        error?.message ||
          "Something went wrong while sending the OTP. Please try again.",
      );
    } finally {
      setLoading(false);
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

          {/* Center Logo Ring */}
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

        {/* ================= WELCOME SECTION ================= */}
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <View style={styles.subRow}>
          <Text style={styles.subOrnament}>✦—</Text>
          <Text style={styles.subText}>Login to continue to your account</Text>
          <Text style={styles.subOrnament}>—✦</Text>
        </View>

        {/* ================= FORM CARD ================= */}
        <View style={styles.formCard}>
          <View style={styles.inputRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={17} color={Colors.primaryRed} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
              underlineColorAndroid="transparent"
            />
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
              <Ionicons
                name="chevron-down"
                size={15}
                color={Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* ================= REMEMBER ME ================= */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.8}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && (
                <Ionicons name="checkmark" size={12} color={Colors.white} />
              )}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
        </View>

        {/* ================= LOGIN BUTTON ================= */}
        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        <TouchableOpacity
          style={styles.loginButtonTouchable}
          activeOpacity={0.85}
          onPress={handleLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={["#C00000", "#DC2626", "#F59E0B", "#FBBF24"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          >
            <MaterialCommunityIcons
              name="login"
              size={22}
              color={Colors.white}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.loginButtonText}>
              {loading ? "SENDING..." : "SEND OTP"}
            </Text>
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

        {/* ================= REGISTER LINK ================= */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => router.push("/register")}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>

        {/* ================= HERITAGE WATERMARK FOOTER ================= */}
        <View style={styles.skylineWrapper}>
          <HeritageSkyline />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= HEADER WAVE (reversed: edges dip, center arches up) =================
// Same geometry as the OTP screen's HeaderWave.
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
        <SvgGradient id="loginHeaderRedGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.primaryRed} />
          <Stop offset="1" stopColor={Colors.primaryRedDark} />
        </SvgGradient>
        <SvgGradient id="loginHeaderGoldGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Colors.goldLight} />
          <Stop offset="0.5" stopColor={Colors.gold} />
          <Stop offset="1" stopColor={Colors.goldLight} />
        </SvgGradient>
      </Defs>
      <Path d={redPath} fill="url(#loginHeaderRedGrad)" />
      <Path
        d={goldPath}
        stroke="url(#loginHeaderGoldGrad)"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Stylized Heritage Monument Skyline (Indian Temple / Charminar Silhouette)
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

  /* ===== HEADER STYLES ===== */
  headerContainer: {
    width: "100%",
    height: HEADER_HEIGHT,
    position: "relative",
    alignItems: "center",
    marginBottom: 55,
  },
  logoRing: {
    position: "absolute",
    top: PEAK_Y - 62,
    alignSelf: "center",
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.white,
    elevation: 9,
    shadowColor: "#000",
    shadowOpacity: 0.2,
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

  /* ===== WELCOME SECTION ===== */
  welcomeText: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginTop: 18,
    textAlign: "center",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  subOrnament: {
    color: Colors.gold,
    fontSize: FontSizes.subtitle,
    marginHorizontal: 6,
  },
  subText: {
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  /* ===== FORM CARD ===== */
  formCard: {
    width: "90%",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
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
  input: {
    flex: 1,
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    paddingHorizontal: 0,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 6,
  },
  countryCodeText: {
    fontSize: FontSizes.tagline,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginRight: 3,
  },

  /* ===== OPTIONS ROW ===== */
  optionsRow: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.checkboxBorder,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryRed,
  },
  rememberText: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  forgotText: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.semiBold,
    color: Colors.primaryRed,
  },

  /* ===== LOGIN BUTTON ===== */
  loginButtonTouchable: {
    width: "90%",
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#E67E00",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  loginButton: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
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

  /* ===== REGISTER ROW ===== */
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 16,
  },
  registerText: {
    fontSize: FontSizes.link,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSizes.link,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
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
  monumentPillar: {
    alignItems: "center",
  },
  domeTop: {
    width: 14,
    height: 10,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: "#E4B8B8",
  },
  towerBody: {
    width: 12,
    height: 28,
    backgroundColor: "#E4B8B8",
  },
  monumentTower: {
    alignItems: "center",
  },
  spireTop: {
    width: 2,
    height: 6,
    backgroundColor: "#D99E9E",
  },
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
  templeBlock: {
    alignItems: "center",
  },
  kalashPeak: {
    width: 3,
    height: 5,
    backgroundColor: "#D99E9E",
  },
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
  grandArchBlock: {
    alignItems: "center",
  },
  charminarTowers: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 44,
  },
  miniMinaret: {
    alignItems: "center",
  },
  miniMinaretBody: {
    width: 6,
    height: 18,
    backgroundColor: "#E4B8B8",
  },
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
