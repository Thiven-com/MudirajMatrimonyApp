import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

import {
  BackHandler,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit3,
  Lock,
  MessageCircle,
  Shield,
} from "react-native-feather";

import { useNavigation, useRoute } from "@react-navigation/native";

import { Colors } from "../../constants/colors";
import { Fonts, FontSizes } from "../../constants/Fonts";

import { verifyLoginOtp } from "../../utils/Functions";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const mobile = route?.params?.mobile || "98765 43210";

  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const [loading, setLoading] = useState(false);

  const [errorText, setErrorText] = useState("");

  const [isPendingApproval, setIsPendingApproval] = useState(false);

  /* =========================================================
     TIMER
  ========================================================= */

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [secondsLeft]);

  /* =========================================================
     ANDROID HARDWARE BACK
  ========================================================= */

  useEffect(() => {
    const handleHardwareBack = () => {
      if (loading) {
        return true;
      }

      Keyboard.dismiss();

      if (navigation.canGoBack()) {
        navigation.goBack();
      }

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBack,
    );

    return () => {
      subscription.remove();
    };
  }, [navigation, loading]);

  /* =========================================================
     VALUES
  ========================================================= */

  const formattedTimer = `00:${String(secondsLeft).padStart(2, "0")}`;

  const isOtpComplete = otp.every((value) => value.length === 1);

  /* =========================================================
     OTP CHANGE
  ========================================================= */

  const handleOtpChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);

    const newOtp = [...otp];

    newOtp[index] = digit;

    setOtp(newOtp);
    setErrorText("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === OTP_LENGTH - 1) {
      Keyboard.dismiss();
    }
  };

  /* =========================================================
     BACKSPACE
  ========================================================= */

  const handleOtpKeyPress = (event, index) => {
    const key = event?.nativeEvent?.key;

    if (key === "Backspace" && otp[index] === "" && index > 0) {
      const newOtp = [...otp];

      newOtp[index - 1] = "";

      setOtp(newOtp);

      inputRefs.current[index - 1]?.focus();
    }
  };

  /* =========================================================
     VERIFY OTP
  ========================================================= */

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      setErrorText(`Please enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }

    if (loading) {
      return;
    }

    Keyboard.dismiss();

    setLoading(true);
    setErrorText("");
    setIsPendingApproval(false);

    try {
      const result = await verifyLoginOtp(mobile, code);

      console.log("OTP verification result:", result);

      /* ============================================
         USER NOT FOUND
      ============================================ */

      if (result?.userNotFound === true) {
        setErrorText("User account not found. Redirecting to registration...");

        setTimeout(() => {
          navigation.replace("Register");
        }, 1500);

        return;
      }

      /* ============================================
         ADMIN APPROVAL
      ============================================ */

      if (
        result?.result === false &&
        typeof result?.message === "string" &&
        result.message.toLowerCase().includes("approval")
      ) {
        setIsPendingApproval(true);

        setErrorText(
          result.message || "Your account is pending admin approval.",
        );

        return;
      }

      /* ============================================
         OTP FAILED
      ============================================ */

      if (result?.result === false || result?.success === 0) {
        setErrorText(
          result?.message || "OTP verification failed. Please try again.",
        );

        return;
      }

      /* ============================================
         LOGIN SUCCESS
      ============================================ */

      if (result?.user || result?.token) {
        try {
          if (result?.token) {
            await AsyncStorage.setItem("authToken", String(result.token));
          }

          if (result?.user) {
            await AsyncStorage.setItem("userData", JSON.stringify(result.user));
          }
        } catch (storageError) {
          console.log("Storage error:", storageError);

          setErrorText("Login succeeded, but your session could not be saved.");

          return;
        }

        navigation.replace("Home");

        return;
      }

      /* ============================================
         UNKNOWN SERVER RESPONSE
      ============================================ */

      setErrorText(result?.message || "Unexpected response from server.");
    } catch (error) {
      console.log("OTP verification error:", error);

      setErrorText(error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RESEND OTP
  ========================================================= */

  const handleResend = () => {
    if (secondsLeft > 0) {
      return;
    }

    setOtp(Array(OTP_LENGTH).fill(""));

    setSecondsLeft(RESEND_SECONDS);

    setErrorText("");
    setIsPendingApproval(false);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    // TODO:
    // Add your resend OTP API here.
    console.log("Resend OTP:", mobile);
  };

  /* =========================================================
     EDIT MOBILE NUMBER
  ========================================================= */

  const handleEditNumber = () => {
    if (loading) {
      return;
    }

    Keyboard.dismiss();

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  /* =========================================================
     WHATSAPP
  ========================================================= */

  const handleWhatsappVerification = () => {
    console.log("WhatsApp verification:", mobile);

    // TODO:
    // Add WhatsApp verification API here.
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.container}>
        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleEditNumber}
            disabled={loading}
          >
            <ArrowLeft width={21} height={21} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={styles.progressActive} />
            </View>

            <Text style={styles.progressText}>Mobile verification</Text>
          </View>
        </View>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <View style={styles.content}>
          {/* ===================================================
              HEADING
          =================================================== */}

          <View style={styles.headingContainer}>
            <View style={styles.headingIcon}>
              <Shield width={28} height={28} color={Colors.primaryRed} />
            </View>

            <Text style={styles.heading}>Verify your mobile</Text>

            <Text style={styles.description}>
              Enter the {OTP_LENGTH}-digit OTP sent to your mobile number.
            </Text>
          </View>

          {/* ===================================================
              MOBILE CARD
          =================================================== */}

          <TouchableOpacity
            style={styles.mobileCard}
            activeOpacity={0.75}
            onPress={handleEditNumber}
            disabled={loading}
          >
            <View style={styles.countryCircle}>
              <Text style={styles.countryText}>+91</Text>
            </View>

            <View style={styles.mobileDetails}>
              <Text style={styles.mobileLabel}>OTP sent to</Text>

              <Text style={styles.mobileNumber}>+91 {mobile}</Text>
            </View>

            <Edit3 width={18} height={18} color={Colors.primaryRed} />
          </TouchableOpacity>

          {/* ===================================================
              OTP TITLE
          =================================================== */}

          <Text style={styles.otpLabel}>Enter OTP</Text>

          {/* ===================================================
              OTP INPUT
          =================================================== */}

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(event) => handleOtpKeyPress(event, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                editable={!loading}
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* ===================================================
              ERROR
          =================================================== */}

          {!isPendingApproval && errorText !== "" && (
            <View style={styles.errorBox}>
              <AlertCircle width={18} height={18} color={Colors.primaryRed} />

              <Text style={styles.errorText}>{errorText}</Text>
            </View>
          )}

          {/* ===================================================
              PENDING APPROVAL
          =================================================== */}

          {isPendingApproval && (
            <View style={styles.pendingBox}>
              <View style={styles.pendingIcon}>
                <Clock
                  width={24}
                  height={24}
                  color={Colors.warning || "#D97706"}
                />
              </View>

              <Text style={styles.pendingTitle}>Awaiting Admin Approval</Text>

              <Text style={styles.pendingDescription}>
                Your mobile number has been verified. Your account is currently
                waiting for admin approval.
              </Text>
            </View>
          )}

          {/* ===================================================
              RESEND
          =================================================== */}

          {!isPendingApproval && (
            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>Didn't receive the code?</Text>

              {secondsLeft > 0 ? (
                <Text style={styles.timerText}>
                  Resend OTP in{" "}
                  <Text style={styles.timer}>{formattedTimer}</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ===================================================
              VERIFY BUTTON
          =================================================== */}

          {!isPendingApproval && (
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (!isOtpComplete || loading) && styles.verifyDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleVerify}
              disabled={!isOtpComplete || loading}
            >
              <Shield width={20} height={20} color={Colors.white} />

              <Text style={styles.verifyText}>
                {loading ? "VERIFYING..." : "VERIFY OTP"}
              </Text>
            </TouchableOpacity>
          )}

          {/* ===================================================
              WHATSAPP BUTTON
          =================================================== */}

          {!isPendingApproval && (
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={handleWhatsappVerification}
              disabled={loading}
            >
              <MessageCircle width={20} height={20} color={Colors.primaryRed} />

              <Text style={styles.secondaryText}>Verify with WhatsApp</Text>
            </TouchableOpacity>
          )}

          {/* ===================================================
              BACK TO LOGIN
          =================================================== */}

          {isPendingApproval && (
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() => navigation.replace("Login")}
            >
              <ArrowLeft width={18} height={18} color={Colors.primaryRed} />

              <Text style={styles.secondaryText}>Back to Login</Text>
            </TouchableOpacity>
          )}

          {/* ===================================================
              PRIVACY
          =================================================== */}

          <View style={styles.privacyCard}>
            <View style={styles.privacyIcon}>
              <Lock width={17} height={17} color={Colors.primaryRed} />
            </View>

            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Your privacy is protected</Text>

              <Text style={styles.privacyDescription}>
                We never share your mobile number with anyone.
              </Text>
            </View>

            <CheckCircle width={18} height={18} color="#2E9B65" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  container: {
    flex: 1,
    alignItems: "center",
  },

  /* ============================================================
     TOP BAR
  ============================================================ */

  topBar: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 8 : 18,
    marginBottom: 34,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },

  progressContainer: {
    flex: 1,
    marginLeft: 14,
  },

  progressTrack: {
    height: 5,
    borderRadius: 10,
    backgroundColor: "#E8E8E8",
    overflow: "hidden",
  },

  progressActive: {
    width: "85%",
    height: "100%",
    backgroundColor: Colors.primaryRed,
    borderRadius: 10,
  },

  progressText: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 10,
    fontFamily: Fonts.body.medium,
    color: Colors.textMuted,
  },

  /* ============================================================
     CONTENT
  ============================================================ */

  content: {
    width: "90%",
    flex: 1,
  },

  /* ============================================================
     HEADING
  ============================================================ */

  headingContainer: {
    alignItems: "center",
    marginBottom: 23,
  },

  headingIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FCE9E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  heading: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },

  description: {
    maxWidth: 310,
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },

  /* ============================================================
     MOBILE
  ============================================================ */

  mobileCard: {
    width: "100%",
    minHeight: 68,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 24,
  },

  countryCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FCE9E7",
    alignItems: "center",
    justifyContent: "center",
  },

  countryText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  mobileDetails: {
    flex: 1,
    marginLeft: 12,
  },

  mobileLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 2,
  },

  mobileNumber: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  /* ============================================================
     OTP
  ============================================================ */

  otpLabel: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 12,
  },

  otpRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  otpInput: {
    width: 58,
    height: 62,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,

    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },

  otpInputFilled: {
    borderWidth: 2,
    borderColor: Colors.primaryRed,
    backgroundColor: "#FFF9F8",
  },

  /* ============================================================
     ERROR
  ============================================================ */

  errorBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEECEC",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.primaryRed,
    lineHeight: 17,
  },

  /* ============================================================
     PENDING
  ============================================================ */

  pendingBox: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FFF8E8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3DFA8",
    padding: 18,
    marginBottom: 18,
  },

  pendingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF0C9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  pendingTitle: {
    fontSize: 16,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginBottom: 5,
    textAlign: "center",
  },

  pendingDescription: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
    textAlign: "center",
  },

  /* ============================================================
     RESEND
  ============================================================ */

  resendContainer: {
    alignItems: "center",
    marginBottom: 19,
  },

  resendLabel: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 4,
  },

  timerText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
  },

  timer: {
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  resendLink: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ============================================================
     VERIFY
  ============================================================ */

  verifyButton: {
    width: "100%",
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,

    elevation: 4,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  verifyDisabled: {
    opacity: 0.45,
  },

  verifyText: {
    fontSize: FontSizes.button,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
    letterSpacing: 0.8,
  },

  /* ============================================================
     SECONDARY
  ============================================================ */

  secondaryButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    marginTop: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.3,
    borderColor: Colors.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginLeft: 8,
  },

  /* ============================================================
     PRIVACY
  ============================================================ */

  privacyCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5FC",
    borderRadius: 15,
    padding: 12,
    marginTop: 18,
  },

  privacyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FCE9E7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  privacyContent: {
    flex: 1,
  },

  privacyTitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },

  privacyDescription: {
    fontSize: 10,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 14,
  },
});
