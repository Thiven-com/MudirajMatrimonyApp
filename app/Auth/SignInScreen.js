import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";

import {
    BackHandler,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import LinearGradient from "react-native-linear-gradient";

import Svg, {
    Defs,
    Path,
    Stop,
    LinearGradient as SvgGradient,
} from "react-native-svg";

import Feather from "react-native-vector-icons/Feather";

import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "../constants/colors";
import { Fonts } from "../constants/Fonts";
import { sendLoginOtp } from "../utils/Functions";

const LOGO = require("../assets/images/logo.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOBILE_LENGTH = 10;

const HEADER_HEIGHT = 250;
const EDGE_Y = HEADER_HEIGHT * 0.78;
const PEAK_Y = HEADER_HEIGHT * 0.40;
const CTRL_Y = HEADER_HEIGHT * 0.10;

export default function LoginScreen() {
    const navigation = useNavigation();

    const [mobile, setMobile] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState("");

    // ----------------------------------------------------
    // BACK HANDLER
    // ----------------------------------------------------

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return true;
        }

        return false;
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                handleBack,
            );

            return () => subscription.remove();
        }, [handleBack]),
    );

    // ----------------------------------------------------
    // LOGIN
    // ----------------------------------------------------

    const handleLogin = async () => {
        if (loading) return;

        const cleanedMobile = mobile.trim();

        if (cleanedMobile.length !== MOBILE_LENGTH) {
            setErrorText(
                `Enter a valid ${MOBILE_LENGTH}-digit mobile number`,
            );
            return;
        }

        setErrorText("");
        setLoading(true);

        try {
            const result = await sendLoginOtp(cleanedMobile);

            if (
                result?.userNotFound === true ||
                result?.message?.toLowerCase().includes("user not found")
            ) {
                setErrorText(
                    "📝 No account found. Redirecting to registration...",
                );

                setTimeout(() => {
                    navigation.replace("SignUp");
                }, 2000);

                return;
            }

            if (
                result?.result === false ||
                result?.success === 0
            ) {
                setErrorText(
                    result?.message ||
                    "Unable to send OTP right now.",
                );

                return;
            }

            // OTP sent successfully
            navigation.navigate("VerifyOTP", {
                mobile: cleanedMobile,
                sessionToken: result?.sessionToken || "",
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

    // ----------------------------------------------------
    // UI
    // ----------------------------------------------------

    return (
        <KeyboardAvoidingView
            style={styles.keyboardContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <SafeAreaView
                style={styles.safeArea}
                edges={["bottom", "left", "right"]}
            >
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
                    <View style={styles.container}>

                        {/* ================================================= */}
                        {/* HEADER */}
                        {/* ================================================= */}

                        <View style={styles.headerContainer}>
                            <HeaderWave width={SCREEN_WIDTH} />

                            {/* Decorative circles */}
                            <View
                                style={[
                                    styles.headerCircle,
                                    styles.circleOne,
                                ]}
                            />

                            <View
                                style={[
                                    styles.headerCircle,
                                    styles.circleTwo,
                                ]}
                            />

                            {/* Logo */}
                            <View style={styles.logoShadow}>
                                <View style={styles.logoRing}>
                                    <Image
                                        source={LOGO}
                                        style={styles.logoImage}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>

                            {/* Small decorative icon */}
                            <View style={styles.headerBadge}>
                                <Feather
                                    name="heart"
                                    size={15}
                                    color={Colors.primaryRed}
                                />
                            </View>
                        </View>

                        {/* ================================================= */}
                        {/* TITLE */}
                        {/* ================================================= */}

                        <View style={styles.titleBlock}>
                            <Text style={styles.welcomeSmall}>
                                WELCOME BACK
                            </Text>

                            <Text style={styles.title}>
                                Welcome Back
                            </Text>

                            <Text style={styles.subtitle}>
                                Login to continue your journey
                            </Text>
                        </View>

                        {/* ================================================= */}
                        {/* LOGIN / REGISTER TABS */}
                        {/* ================================================= */}

                        <View style={styles.tabContainer}>
                            <View style={styles.tabRow}>

                                <View style={styles.activeTabContainer}>
                                    <Text
                                        style={[
                                            styles.tabText,
                                            styles.tabActive,
                                        ]}
                                    >
                                        Login
                                    </Text>

                                    <View style={styles.activeTabLine} />
                                </View>

                                <TouchableOpacity
                                    style={styles.inactiveTab}
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        navigation.navigate("SignUp")
                                    }
                                >
                                    <Text style={styles.tabText}>
                                        Register
                                    </Text>
                                </TouchableOpacity>

                            </View>
                        </View>

                        {/* ================================================= */}
                        {/* FORM CARD */}
                        {/* ================================================= */}

                        <View style={styles.formCard}>

                            <View style={styles.formHeader}>
                                <View style={styles.formIcon}>
                                    <Feather
                                        name="smartphone"
                                        size={21}
                                        color={Colors.primaryRed}
                                    />
                                </View>

                                <View style={styles.formHeaderText}>
                                    <Text style={styles.formTitle}>
                                        Login with Mobile
                                    </Text>

                                    <Text style={styles.formSubtitle}>
                                        We'll send a secure OTP to verify
                                        your number
                                    </Text>
                                </View>
                            </View>

                            {/* Mobile label */}
                            <Text style={styles.fieldLabel}>
                                Mobile Number
                            </Text>

                            {/* Mobile input */}
                            <View
                                style={[
                                    styles.inputWrap,
                                    errorText &&
                                    styles.inputWrapError,
                                ]}
                            >
                                <View style={styles.countrySection}>
                                    <View style={styles.indiaFlag}>
                                        <View
                                            style={[
                                                styles.flagStripe,
                                                styles.flagOrange,
                                            ]}
                                        />

                                        <View
                                            style={[
                                                styles.flagStripe,
                                                styles.flagWhite,
                                            ]}
                                        >
                                            <View
                                                style={
                                                    styles.flagCircle
                                                }
                                            />
                                        </View>

                                        <View
                                            style={[
                                                styles.flagStripe,
                                                styles.flagGreen,
                                            ]}
                                        />
                                    </View>

                                    <Text style={styles.codeText}>
                                        +91
                                    </Text>

                                    <Feather
                                        name="chevron-down"
                                        size={15}
                                        color={Colors.textMuted}
                                    />
                                </View>

                                <View style={styles.inputDivider} />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter 10-digit mobile number"
                                    placeholderTextColor={
                                        Colors.placeholder
                                    }
                                    keyboardType="phone-pad"
                                    value={mobile}
                                    maxLength={10}
                                    onChangeText={(value) => {
                                        const cleaned =
                                            value.replace(
                                                /[^0-9]/g,
                                                "",
                                            );

                                        setMobile(cleaned);

                                        if (errorText) {
                                            setErrorText("");
                                        }
                                    }}
                                    underlineColorAndroid="transparent"
                                    editable={!loading}
                                />

                                {mobile.length === MOBILE_LENGTH &&
                                    !loading ? (
                                    <View style={styles.validIcon}>
                                        <Feather
                                            name="check"
                                            size={15}
                                            color="#FFFFFF"
                                        />
                                    </View>
                                ) : null}
                            </View>

                            {/* Error */}
                            {errorText ? (
                                <View style={styles.errorContainer}>
                                    <Feather
                                        name="alert-circle"
                                        size={16}
                                        color={Colors.error}
                                    />

                                    <Text style={styles.errorText}>
                                        {errorText}
                                    </Text>
                                </View>
                            ) : null}

                            {/* ================================================= */}
                            {/* LOGIN BUTTON */}
                            {/* ================================================= */}

                            <TouchableOpacity
                                style={styles.loginButtonTouchable}
                                activeOpacity={0.88}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={[
                                        "#A80000",
                                        "#C00000",
                                        "#E02929",
                                        "#F59E0B",
                                    ]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[
                                        styles.loginButton,
                                        loading &&
                                        styles.loginButtonDisabled,
                                    ]}
                                >
                                    {loading ? (
                                        <>
                                            <View
                                                style={
                                                    styles.loadingDot
                                                }
                                            />

                                            <Text
                                                style={
                                                    styles.loginButtonText
                                                }
                                            >
                                                Sending OTP...
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text
                                                style={
                                                    styles.loginButtonText
                                                }
                                            >
                                                Send OTP
                                            </Text>

                                            <View
                                                style={
                                                    styles.buttonArrow
                                                }
                                            >
                                                <Feather
                                                    name="arrow-right"
                                                    size={18}
                                                    color="#FFFFFF"
                                                />
                                            </View>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Security message */}
                            <View style={styles.securityRow}>
                                <Feather
                                    name="shield"
                                    size={14}
                                    color={Colors.primaryRed}
                                />

                                <Text style={styles.securityText}>
                                    Your number is secure and will only be
                                    used for account verification
                                </Text>
                            </View>
                        </View>

                        {/* ================================================= */}
                        {/* REGISTER */}
                        {/* ================================================= */}

                        <View style={styles.registerCard}>
                            <View style={styles.registerIcon}>
                                <Feather
                                    name="user-plus"
                                    size={17}
                                    color={Colors.primaryRed}
                                />
                            </View>

                            <View style={styles.registerContent}>
                                <Text style={styles.registerText}>
                                    New to Mudiraj World Matrimony?
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        navigation.navigate("SignUp")
                                    }
                                >
                                    <Text style={styles.registerLink}>
                                        Create an account
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.registerArrow}
                                activeOpacity={0.7}
                                onPress={() =>
                                    navigation.navigate("SignUp")
                                }
                            >
                                <Feather
                                    name="chevron-right"
                                    size={18}
                                    color={Colors.primaryRed}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* ================================================= */}
                        {/* BOTTOM BRANDING */}
                        {/* ================================================= */}

                        <View style={styles.bottomBranding}>

                            <View style={styles.decorativeLine} />

                            <View style={styles.brandingContent}>
                                <Feather
                                    name="heart"
                                    size={13}
                                    color="#C00000"
                                />

                                <Text style={styles.brandingText}>
                                    Find your perfect match
                                </Text>

                                <Feather
                                    name="heart"
                                    size={13}
                                    color="#C00000"
                                />
                            </View>

                            <Text style={styles.brandingSubText}>
                                Trusted matrimonial platform
                            </Text>
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

// ============================================================
// HEADER WAVE
// ============================================================

function HeaderWave({ width }) {
    const w = width;

    const redPath = `
        M0,0
        H${w}
        V${EDGE_Y}
        Q${w * 0.75},${CTRL_Y}
        ${w / 2},${PEAK_Y}
        Q${w * 0.25},${CTRL_Y}
        0,${EDGE_Y}
        Z
    `;

    const goldPath = `
        M0,${EDGE_Y + 10}
        Q${w * 0.25},${CTRL_Y + 10}
        ${w / 2},${PEAK_Y + 10}
        Q${w * 0.75},${CTRL_Y + 10}
        ${w},${EDGE_Y + 10}
    `;

    return (
        <Svg
            width={w}
            height={HEADER_HEIGHT}
            viewBox={`0 0 ${w} ${HEADER_HEIGHT}`}
            style={StyleSheet.absoluteFillObject}
        >
            <Defs>
                <SvgGradient
                    id="loginHeaderRedGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <Stop
                        offset="0"
                        stopColor={Colors.primaryRed}
                    />

                    <Stop
                        offset="1"
                        stopColor={Colors.primaryRedDark}
                    />
                </SvgGradient>

                <SvgGradient
                    id="loginHeaderGoldGrad"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                >
                    <Stop
                        offset="0"
                        stopColor={Colors.goldLight}
                    />

                    <Stop
                        offset="0.5"
                        stopColor={Colors.gold}
                    />

                    <Stop
                        offset="1"
                        stopColor={Colors.goldLight}
                    />
                </SvgGradient>
            </Defs>

            <Path
                d={redPath}
                fill="url(#loginHeaderRedGrad)"
            />

            <Path
                d={goldPath}
                stroke="url(#loginHeaderGoldGrad)"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
            />
        </Svg>
    );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

    // --------------------------------------------------------
    // SCREEN
    // --------------------------------------------------------

    keyboardContainer: {
        flex: 1,
    },

    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
        backgroundColor: Colors.background,
    },

    container: {
        flex: 1,
        width: "100%",
        backgroundColor: Colors.background,
    },

    // --------------------------------------------------------
    // HEADER
    // --------------------------------------------------------

    headerContainer: {
        width: "100%",
        height: 230,
        position: "relative",
        alignItems: "center",
        backgroundColor: Colors.primaryRed,
        overflow: "hidden",
    },

    headerCircle: {
        position: "absolute",
        borderRadius: 100,
        backgroundColor: "rgba(255,255,255,0.07)",
    },

    circleOne: {
        width: 180,
        height: 180,
        left: -85,
        top: -80,
    },

    circleTwo: {
        width: 150,
        height: 150,
        right: -60,
        top: 20,
    },

    logoShadow: {
        position: "absolute",
        top: 48,
        alignItems: "center",
        justifyContent: "center",
        width: 136,
        height: 136,
        borderRadius: 68,
        backgroundColor: "rgba(0,0,0,0.15)",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: {
            width: 0,
            height: 7,
        },
        elevation: 10,
    },

    logoRing: {
        width: 126,
        height: 126,
        borderRadius: 63,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "rgba(255,255,255,0.95)",
    },

    logoImage: {
        width: 112,
        height: 112,
        borderRadius: 56,
    },

    headerBadge: {
        position: "absolute",
        top: 50,
        right: 25,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    titleBlock: {
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 22,
    },

    welcomeSmall: {
        fontSize: 11,
        letterSpacing: 2,
        color: Colors.primaryRed,
        fontFamily: Fonts.body.bold,
        marginBottom: 5,
    },

    title: {
        fontSize: 31,
        lineHeight: 38,
        fontFamily: Fonts.display.bold,
        color: Colors.primaryRed,
        textAlign: "center",
    },

    subtitle: {
        marginTop: 5,
        fontSize: 15,
        lineHeight: 21,
        fontFamily: Fonts.body.regular,
        color: Colors.textSecondary,
        textAlign: "center",
    },

    // --------------------------------------------------------
    // TABS
    // --------------------------------------------------------

    tabContainer: {
        width: "88%",
        alignSelf: "center",
        marginTop: 22,
        marginBottom: 15,
    },

    tabRow: {
        flexDirection: "row",
        height: 50,
        borderRadius: 16,
        padding: 4,
        backgroundColor: "#F7F1F1",
        borderWidth: 1,
        borderColor: "#EFE1E1",
    },

    activeTabContainer: {
        flex: 1,
        borderRadius: 13,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        elevation: 2,
    },

    inactiveTab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    tabText: {
        fontSize: 15,
        fontFamily: Fonts.body.bold,
        color: Colors.textMuted,
    },

    tabActive: {
        color: Colors.primaryRed,
    },

    activeTabLine: {
        position: "absolute",
        bottom: 4,
        width: 25,
        height: 3,
        borderRadius: 2,
        backgroundColor: Colors.primaryRed,
    },

    // --------------------------------------------------------
    // FORM CARD
    // --------------------------------------------------------

    formCard: {
        width: "92%",
        alignSelf: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 18,
        borderWidth: 1,
        borderColor: "#F0E4E4",

        shadowColor: "#700000",
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: {
            width: 0,
            height: 7,
        },

        elevation: 4,
    },

    formHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },

    formIcon: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: "#FFF2F2",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    formHeaderText: {
        flex: 1,
    },

    formTitle: {
        fontSize: 16,
        fontFamily: Fonts.body.bold,
        color: Colors.textPrimary,
        marginBottom: 3,
    },

    formSubtitle: {
        fontSize: 11.5,
        lineHeight: 17,
        fontFamily: Fonts.body.regular,
        color: Colors.textSecondary,
    },

    // --------------------------------------------------------
    // INPUT
    // --------------------------------------------------------

    fieldLabel: {
        fontSize: 13,
        fontFamily: Fonts.body.bold,
        color: Colors.textPrimary,
        marginBottom: 8,
    },

    inputWrap: {
        minHeight: 58,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAFAFA",
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 15,
        paddingHorizontal: 12,
    },

    inputWrapError: {
        borderColor: Colors.error,
        backgroundColor: "#FFF8F8",
    },

    countrySection: {
        flexDirection: "row",
        alignItems: "center",
        minWidth: 76,
    },

    indiaFlag: {
        width: 22,
        height: 16,
        borderRadius: 2,
        overflow: "hidden",
        marginRight: 7,
        borderWidth: 0.5,
        borderColor: "#DDD",
    },

    flagStripe: {
        height: 5.33,
        width: "100%",
    },

    flagOrange: {
        backgroundColor: "#FF9933",
    },

    flagWhite: {
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },

    flagGreen: {
        backgroundColor: "#138808",
    },

    flagCircle: {
        width: 4,
        height: 4,
        borderRadius: 2,
        borderWidth: 0.7,
        borderColor: "#000080",
    },

    codeText: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontFamily: Fonts.body.bold,
        marginRight: 4,
    },

    inputDivider: {
        width: 1,
        height: 28,
        backgroundColor: "#E1E1E1",
        marginHorizontal: 10,
    },

    input: {
        flex: 1,
        minHeight: 56,
        fontSize: 16,
        color: Colors.textPrimary,
        fontFamily: Fonts.body.medium,
        paddingVertical: Platform.OS === "ios" ? 14 : 8,
    },

    validIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#16A34A",
        alignItems: "center",
        justifyContent: "center",
    },

    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF2F2",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 8,
        marginBottom: 10,
    },

    errorText: {
        flex: 1,
        color: Colors.error,
        fontSize: 12,
        lineHeight: 17,
        fontFamily: Fonts.body.medium,
        marginLeft: 7,
    },

    // --------------------------------------------------------
    // LOGIN BUTTON
    // --------------------------------------------------------

    loginButtonTouchable: {
        width: "100%",
        height: 56,
        borderRadius: 15,
        overflow: "hidden",
        marginTop: 18,

        shadowColor: "#C00000",
        shadowOpacity: 0.22,
        shadowRadius: 9,
        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 5,
    },

    loginButton: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    loginButtonDisabled: {
        opacity: 0.75,
    },

    loginButtonText: {
        color: Colors.white,
        fontSize: 17,
        fontFamily: Fonts.body.bold,
        letterSpacing: 0.2,
    },

    buttonArrow: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
    },

    loadingDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: "#FFFFFF",
        marginRight: 10,
    },

    // --------------------------------------------------------
    // SECURITY
    // --------------------------------------------------------

    securityRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "center",
        marginTop: 13,
        paddingHorizontal: 6,
    },

    securityText: {
        flex: 1,
        marginLeft: 6,
        fontSize: 10.5,
        lineHeight: 15,
        color: Colors.textMuted,
        fontFamily: Fonts.body.regular,
        textAlign: "center",
    },

    // --------------------------------------------------------
    // REGISTER CARD
    // --------------------------------------------------------

    registerCard: {
        width: "92%",
        minHeight: 68,
        alignSelf: "center",
        marginTop: 16,
        borderRadius: 17,
        backgroundColor: "#FFF9F9",
        borderWidth: 1,
        borderColor: "#F3DEDE",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 13,
    },

    registerIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#F0D8D8",
    },

    registerContent: {
        flex: 1,
    },

    registerText: {
        fontSize: 11.5,
        fontFamily: Fonts.body.regular,
        color: Colors.textSecondary,
        marginBottom: 3,
    },

    registerLink: {
        fontSize: 13,
        fontFamily: Fonts.body.bold,
        color: Colors.primaryRed,
    },

    registerArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#F0D8D8",
    },

    // --------------------------------------------------------
    // BOTTOM BRANDING
    // --------------------------------------------------------

    bottomBranding: {
        width: "100%",
        alignItems: "center",
        marginTop: 22,
        paddingBottom: 5,
    },

    decorativeLine: {
        width: 55,
        height: 3,
        borderRadius: 2,
        backgroundColor: Colors.gold,
        marginBottom: 9,
    },

    brandingContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    brandingText: {
        marginHorizontal: 8,
        fontSize: 11,
        color: Colors.textSecondary,
        fontFamily: Fonts.body.medium,
    },

    brandingSubText: {
        marginTop: 4,
        fontSize: 9.5,
        color: Colors.textMuted,
        fontFamily: Fonts.body.regular,
    },
});