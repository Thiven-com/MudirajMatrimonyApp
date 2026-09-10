import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
import { Fonts } from "../../constants/Fonts";
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

      // User not found - redirect to registration
      if (
        result?.userNotFound === true ||
        result?.message?.toLowerCase().includes("user not found")
      ) {
        setErrorText("📝 No account found. Redirecting to registration...");
        setTimeout(() => {
          router.replace("/register");
        }, 2000);
        return;
      }

      if (result?.result === false || result?.success === 0) {
        setErrorText(result?.message || "Unable to send OTP right now.");
        return;
      }

      // OTP sent successfully
      router.push({
        pathname: "/otp",
        params: {
          mobile: cleanedMobile,
          sessionToken: result?.sessionToken || "",
        },
      });
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.shell}>
          <View style={styles.headerContainer}>
            <HeaderWave width={SCREEN_WIDTH} />
            <View style={styles.logoRing}>
              <Image
                source={LOGO}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue your journey</Text>
          </View>

          <View style={styles.tabRow}>
            <Text style={[styles.tabText, styles.tabActive]}>Login</Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.tabText}>Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formWrapper}>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <View style={styles.inputWrap}>
              <View style={styles.codeWrap}>
                <Text style={styles.codeText}>+91</Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={Colors.textMuted}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor={Colors.placeholder}
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                underlineColorAndroid="transparent"
              />
            </View>

            {errorText ? (
              <Text style={styles.errorText}>{errorText}</Text>
            ) : null}

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
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
              >
                <Text style={styles.loginButtonText}>
                  {loading ? "PROCESSING..." : "Send OTP"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <FontAwesome name="google" size={28} color={Colors.google} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Ionicons
                  name="logo-facebook"
                  size={28}
                  color={Colors.facebook}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={28} color={Colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>
                New to Mudiraj World Matrimony?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    backgroundColor: Colors.primaryRed,
  },
  scrollContent: {
    paddingBottom: 30,
    backgroundColor: Colors.primaryRed,
  },
  shell: {
    width: "100%",
    minHeight: "100%",
    backgroundColor: Colors.background,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
    paddingBottom: 18,
  },

  headerContainer: {
    width: "100%",
    height: 240,
    position: "relative",
    alignItems: "center",
    backgroundColor: Colors.primaryRed,
  },
  logoRing: {
    position: "absolute",
    top: 54,
    alignSelf: "center",
    width: 124,
    height: 124,
    borderRadius: 62,
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
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  titleBlock: {
    alignItems: "center",
    marginTop: 80,
  },
  title: {
    fontSize: 38,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 18,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "72%",
    marginTop: 24,
    marginBottom: 18,
    alignSelf: "center",
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 26,
    fontFamily: Fonts.body.bold,
    color: Colors.textMuted,
    paddingBottom: 10,
  },
  tabActive: {
    color: Colors.primaryRed,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryRed,
    paddingHorizontal: 2,
  },

  formWrapper: {
    width: "88%",
    alignSelf: "center",
  },
  fieldLabel: {
    fontSize: 18,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 18,
    minHeight: 56,
  },
  codeWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#D5D5D5",
    marginRight: 10,
    minHeight: 28,
  },
  codeText: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: Fonts.body.medium,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: Fonts.body.regular,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },
  errorText: {
    color: Colors.error,
    textAlign: "center",
    fontSize: 14,
    fontFamily: Fonts.body.medium,
    marginBottom: 12,
  },

  loginButtonTouchable: {
    width: "100%",
    height: 58,
    borderRadius: 16,
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
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 28,
    fontFamily: Fonts.body.bold,
    letterSpacing: 0.5,
  },

  orRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D8D8D8",
  },
  orText: {
    marginHorizontal: 12,
    color: Colors.textMuted,
    fontFamily: Fonts.body.medium,
    fontSize: 16,
  },

  socialRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  socialButton: {
    flex: 1,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },

  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  registerText: {
    fontSize: 18,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 18,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  skylineWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    opacity: 0.6,
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
