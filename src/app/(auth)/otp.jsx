import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
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
import { verifyLoginOtp } from "../../utils/Functions";

const LOGO = require("../../../assets/images/logo.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Header wave geometry — reversed curve: edges dip down, center arches up
const HEADER_HEIGHT = 210;
const EDGE_Y = HEADER_HEIGHT * 0.7;
const PEAK_Y = HEADER_HEIGHT * 0.33;
const CTRL_Y = HEADER_HEIGHT * 0.05;

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mobile = params?.mobile || "98765 43210";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formattedTimer = `00:${String(secondsLeft).padStart(2, "0")}`;
  const isComplete = otp.every((digit) => digit !== "");

  const handleChange = (text, index) => {
    // Only allow single digits
    const digit = text.replace(/[^0-9]/g, "").slice(-1);

    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    // Handle both native and web events
    const key = event.nativeEvent?.key || event.key;

    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const nextOtp = [...otp];
      nextOtp[index - 1] = "";
      setOtp(nextOtp);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return;

    setLoading(true);
    setErrorText("");
    setIsPendingApproval(false);

    try {
      const result = await verifyLoginOtp(mobile, code);
      console.log("OTP verification result:", result);

      // User not found - redirect to registration
      if (result?.userNotFound === true) {
        setErrorText("User account not found. Redirecting to registration...");
        setTimeout(() => {
          router.replace("/register");
        }, 1500);
        return;
      }

      // Account exists and OTP matched, but an admin hasn't approved it yet
      if (
        result?.result === false &&
        result?.message?.toLowerCase().includes("approval")
      ) {
        setIsPendingApproval(true);
        setErrorText(
          result?.message || "Your account is pending admin approval.",
        );
        return;
      }

      // Verification failed
      if (result?.result === false || result?.success === 0) {
        setErrorText(
          result?.message || "OTP verification failed. Please try again.",
        );
        return;
      }

      // Successful login
      if (result?.user || result?.token) {
        console.log("Login successful, user:", result?.user);

        // Persist token and user so authenticated requests work after this screen
        try {
          if (result?.token) {
            await AsyncStorage.setItem("authToken", result.token);
          }
          if (result?.user) {
            await AsyncStorage.setItem("userData", JSON.stringify(result.user));
          }
        } catch (storageError) {
          console.log("Failed to persist auth data:", storageError);
          setErrorText(
            "Login succeeded but failed to save session. Please try again.",
          );
          return;
        }

        router.replace("/home");
        return;
      }

      setErrorText("Unexpected response from server.");
    } catch (error) {
      console.log("OTP verify Error:", error);
      setErrorText(error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWithWhatsapp = () => {
    console.log("Verify with WhatsApp for", mobile);
    // TODO: trigger WhatsApp-based verification flow
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    // TODO: call your resend-OTP API
  };

  const handleEditNumber = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

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
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
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
      <Text style={styles.formHeading}>Verify Your Mobile Number</Text>
      <Text style={styles.formSubtext}>
        Enter the {OTP_LENGTH}-digit OTP sent to
      </Text>

      <TouchableOpacity
        style={styles.mobileRow}
        activeOpacity={0.7}
        onPress={handleEditNumber}
      >
        <Text style={styles.mobileText}>+91 {mobile}</Text>
        <Ionicons
          name="pencil"
          size={15}
          color={Colors.primaryRed}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      {/* ================= OTP INPUT BOXES ================= */}
      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[styles.otpBox, digit !== "" && styles.otpBoxFilled]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            underlineColorAndroid="transparent"
            selectTextOnFocus
          />
        ))}
      </View>

      {/* ================= PENDING APPROVAL MESSAGE ================= */}
      {isPendingApproval && (
        <View style={styles.pendingContainer}>
          <View style={styles.pendingIconCircle}>
            <Ionicons name="time-outline" size={22} color={Colors.warning} />
          </View>
          <Text style={styles.pendingTitle}>Awaiting Admin Approval</Text>
          <Text style={styles.pendingText}>
            Your number is verified, but your account still needs to be approved
            by an admin before you can log in. This usually doesn't take long —
            please check back shortly.
          </Text>
        </View>
      )}

      {/* ================= ERROR MESSAGE ================= */}
      {!isPendingApproval && errorText.length > 0 && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={18} color={Colors.primaryRed} />
          <Text style={styles.errorText}>{errorText}</Text>
        </View>
      )}

      {!isPendingApproval && (
        <>
          {/* ================= RESEND ROW ================= */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            {secondsLeft > 0 ? (
              <Text style={styles.resendText}>
                Resend OTP in{" "}
                <Text style={styles.resendTimer}>{formattedTimer}</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ================= VERIFY BUTTON ================= */}
          <TouchableOpacity
            style={[
              styles.verifyButtonTouchable,
              !isComplete && styles.verifyButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleVerify}
            disabled={!isComplete || loading}
          >
            <Svg width="100%" height={54} style={StyleSheet.absoluteFillObject}>
              <Defs>
                <SvgGradient id="otpBtnGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={Colors.primaryRed} />
                  <Stop offset="0.55" stopColor="#DC2626" />
                  <Stop offset="1" stopColor={Colors.gold} />
                </SvgGradient>
              </Defs>
              <Path
                d={`M14,0 H${SCREEN_WIDTH} V54 H14 A14,14 0 0 1 0,40 V14 A14,14 0 0 1 14,0 Z`}
                fill="url(#otpBtnGrad)"
              />
            </Svg>
            <View style={styles.verifyButtonContent}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={Colors.white}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.verifyButtonText}>
                {loading ? "VERIFYING..." : "VERIFY OTP"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* ================= VERIFY WITH WHATSAPP ================= */}
          <TouchableOpacity
            style={styles.whatsappButton}
            activeOpacity={0.8}
            onPress={handleVerifyWithWhatsapp}
          >
            <Ionicons
              name="logo-whatsapp"
              size={20}
              color={Colors.primaryRed}
            />
            <Text style={styles.whatsappText}>Verify with WhatsApp</Text>
          </TouchableOpacity>
        </>
      )}

      {isPendingApproval && (
        <TouchableOpacity
          style={styles.whatsappButton}
          activeOpacity={0.8}
          onPress={() => router.replace("/login")}
        >
          <Ionicons name="arrow-back" size={18} color={Colors.primaryRed} />
          <Text style={styles.whatsappText}>Back to Login</Text>
        </TouchableOpacity>
      )}

      {/* ================= PRIVACY NOTE ================= */}
      <View style={styles.privacyRow}>
        <View style={styles.privacyIconCircle}>
          <Ionicons name="lock-closed" size={16} color={Colors.primaryRed} />
        </View>
        <Text style={styles.privacyText}>
          We never share your number with anyone.{"\n"}Your privacy is our
          priority.
        </Text>
      </View>

      {/* ================= HERITAGE WATERMARK FOOTER ================= */}
      <View style={styles.skylineWrapper}>
        <HeritageSkyline />
      </View>
    </SafeAreaView>
  );
}

// ================= HEADER WAVE (reversed: edges dip, center arches up) =================
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
        <SvgGradient id="otpHeaderRedGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.primaryRed} />
          <Stop offset="1" stopColor={Colors.primaryRedDark} />
        </SvgGradient>
        <SvgGradient id="otpHeaderGoldGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={Colors.goldLight} />
          <Stop offset="0.5" stopColor={Colors.gold} />
          <Stop offset="1" stopColor={Colors.goldLight} />
        </SvgGradient>
      </Defs>
      <Path d={redPath} fill="url(#otpHeaderRedGrad)" />
      <Path
        d={goldPath}
        stroke="url(#otpHeaderGoldGrad)"
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
    alignItems: "center",
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
    height: 35,
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
    textAlign: "center",
  },

  /* ===== MOBILE NUMBER ROW ===== */
  mobileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 26,
  },
  mobileText: {
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== OTP INPUT BOXES ===== */
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    gap: 16,
    marginBottom: 16,
  },
  otpBox: {
    width: 58,
    height: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBackground,
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  otpBoxFilled: {
    borderColor: Colors.primaryRed,
    borderWidth: 2,
  },

  /* ===== ERROR MESSAGE ===== */
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: "5%",
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryRed,
  },
  errorText: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.primaryRed,
    marginLeft: 8,
    flex: 1,
  },

  /* ===== PENDING APPROVAL ===== */
  pendingContainer: {
    width: "90%",
    alignItems: "center",
    backgroundColor: "#FEF6E7",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F5DFA3",
  },
  pendingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDECC8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  pendingTitle: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  pendingText: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: "center",
  },

  /* ===== RESEND ROW ===== */
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  resendText: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  resendTimer: {
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  resendLink: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== VERIFY BUTTON ===== */
  verifyButtonTouchable: {
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
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonText: {
    color: Colors.white,
    fontSize: FontSizes.button,
    fontFamily: Fonts.body.bold,
    letterSpacing: 1.2,
  },

  /* ===== WHATSAPP BUTTON ===== */
  whatsappButton: {
    width: "90%",
    height: 50,
    borderRadius: 14,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
  },
  whatsappText: {
    fontSize: FontSizes.button,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginLeft: 8,
  },

  /* ===== PRIVACY NOTE ===== */
  privacyRow: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },
  privacyIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.iconCircleBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

  /* ===== BOTTOM SKYLINE WATERMARK ===== */
  skylineWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: "auto",
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
