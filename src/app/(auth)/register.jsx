import { useEffect, useState } from "react";

import {
  BackHandler,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
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
  Calendar,
  Check,
  ChevronDown,
  Mail,
  Phone,
  User,
  Users,
} from "react-native-feather";

import { useNavigation } from "@react-navigation/native";

import { Colors } from "../../constants/colors";
import { Fonts, FontSizes } from "../../constants/Fonts";

import { signup } from "../../utils/Functions";

/* ============================================================
   OPTIONS
============================================================ */

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

const ON_BEHALF_OPTIONS = [
  {
    label: "For Myself",
    value: 0,
  },
  {
    label: "For Someone Else",
    value: 1,
  },
];

/* ============================================================
   REGISTER SCREEN
============================================================ */

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [mobile, setMobile] = useState("");

  const [email, setEmail] = useState("");

  const [dob, setDob] = useState("");

  const [gender, setGender] = useState("");

  const [onBehalf, setOnBehalf] = useState("");

  const [agreed, setAgreed] = useState(false);

  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const [onBehalfModalVisible, setOnBehalfModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errorText, setErrorText] = useState("");

  /* ==========================================================
     ANDROID HARDWARE BACK
  ========================================================== */

  useEffect(() => {
    const handleBackPress = () => {
      if (loading) {
        return true;
      }

      Keyboard.dismiss();

      if (genderModalVisible) {
        setGenderModalVisible(false);
        return true;
      }

      if (onBehalfModalVisible) {
        setOnBehalfModalVisible(false);
        return true;
      }

      if (navigation.canGoBack()) {
        navigation.goBack();
      }

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => {
      subscription.remove();
    };
  }, [navigation, loading, genderModalVisible, onBehalfModalVisible]);

  /* ==========================================================
     REGISTER
  ========================================================== */

  const handleRegister = async () => {
    Keyboard.dismiss();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !dob.trim() ||
      !gender ||
      !onBehalf ||
      !agreed
    ) {
      setErrorText(
        "Please fill all required fields and accept the Terms & Conditions.",
      );

      return;
    }

    if (mobile.trim().length < 10) {
      setErrorText("Please enter a valid mobile number.");

      return;
    }

    if (!email.trim().includes("@")) {
      setErrorText("Please enter a valid email address.");

      return;
    }

    setErrorText("");
    setLoading(true);

    try {
      const result = await signup({
        firstName: firstName.trim(),

        lastName: lastName.trim(),

        mobile: mobile.trim(),

        email: email.trim(),

        dob,

        gender,

        onBehalf,

        agreed,
      });

      console.log("signup() result:", JSON.stringify(result));

      if (result?.result === false || result?.success === 0) {
        setErrorText(result?.message || "Unable to create account right now.");

        return;
      }

      /* ======================================================
         REGISTRATION SUCCESS
      ====================================================== */

      navigation.replace("Login");
    } catch (error) {
      console.log("signup Error:", error);

      setErrorText(error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     GENDER
  ========================================================== */

  const handleGenderSelect = (value) => {
    setGender(value);
    setGenderModalVisible(false);
    setErrorText("");
  };

  /* ==========================================================
     ON BEHALF
  ========================================================== */

  const handleOnBehalfSelect = (value) => {
    setOnBehalf(String(value));
    setOnBehalfModalVisible(false);
    setErrorText("");
  };

  /* ==========================================================
     BACK
  ========================================================== */

  const handleBack = () => {
    if (loading) {
      return;
    }

    Keyboard.dismiss();

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  /* ==========================================================
     SELECTED ON BEHALF LABEL
  ========================================================== */

  const selectedOnBehalf =
    ON_BEHALF_OPTIONS.find(
      (option) => String(option.value) === String(onBehalf),
    )?.label || "";

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ==================================================
            TOP BAR
        ================================================== */}

        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
            disabled={loading}
          >
            <ArrowLeft width={21} height={21} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={styles.progressActive} />
            </View>

            <Text style={styles.progressText}>Create your profile</Text>
          </View>
        </View>

        {/* ==================================================
            PAGE HEADING
        ================================================== */}

        <View style={styles.headingContainer}>
          <View style={styles.headingIcon}>
            <User width={27} height={27} color={Colors.primaryRed} />
          </View>

          <Text style={styles.heading}>Create Your Account</Text>

          <Text style={styles.description}>
            Join Mudiraj World and create your profile to find your perfect
            match.
          </Text>
        </View>

        {/* ==================================================
            FORM
        ================================================== */}

        <View style={styles.fieldsContainer}>
          {/* FIRST NAME */}

          <FieldCard
            icon={<User width={18} height={18} color={Colors.primaryRed} />}
            label="First Name"
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
            trailing={<User width={18} height={18} color={Colors.textMuted} />}
          />

          {/* LAST NAME */}

          <FieldCard
            icon={<User width={18} height={18} color={Colors.primaryRed} />}
            label="Last Name"
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
            trailing={<User width={18} height={18} color={Colors.textMuted} />}
          />

          {/* MOBILE */}

          <FieldCard
            icon={<Phone width={18} height={18} color={Colors.primaryRed} />}
            label="Mobile Number"
            placeholder="Enter your mobile number"
            value={mobile}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);

              setMobile(cleaned);
            }}
            keyboardType="phone-pad"
            trailing={
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>

                <ChevronDown width={15} height={15} color={Colors.textMuted} />
              </View>
            }
          />

          {/* EMAIL */}

          <FieldCard
            icon={<Mail width={18} height={18} color={Colors.primaryRed} />}
            label="Email Address"
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            trailing={<Mail width={18} height={18} color={Colors.textMuted} />}
          />

          {/* DOB */}

          <FieldCard
            icon={<Calendar width={18} height={18} color={Colors.primaryRed} />}
            label="Date of Birth"
            placeholder="DD / MM / YYYY"
            value={dob}
            onChangeText={setDob}
            keyboardType="number-pad"
            trailing={
              <Calendar width={18} height={18} color={Colors.textMuted} />
            }
          />

          {/* GENDER */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setGenderModalVisible(true)}
            disabled={loading}
          >
            <FieldCard
              icon={<Users width={18} height={18} color={Colors.primaryRed} />}
              label="Gender"
              placeholder="Select your gender"
              value={gender}
              editable={false}
              trailing={
                <ChevronDown width={20} height={20} color={Colors.textMuted} />
              }
            />
          </TouchableOpacity>

          {/* REGISTER FOR */}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setOnBehalfModalVisible(true)}
            disabled={loading}
          >
            <FieldCard
              icon={<User width={18} height={18} color={Colors.primaryRed} />}
              label="Register For"
              placeholder="Select option"
              value={selectedOnBehalf}
              editable={false}
              trailing={
                <ChevronDown width={20} height={20} color={Colors.textMuted} />
              }
            />
          </TouchableOpacity>
        </View>

        {/* ==================================================
            TERMS
        ================================================== */}

        <TouchableOpacity
          style={styles.termsRow}
          activeOpacity={0.8}
          onPress={() => setAgreed(!agreed)}
          disabled={loading}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Check width={12} height={12} color={Colors.white} />}
          </View>

          <Text style={styles.termsText}>
            I agree to the{" "}
            <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        {/* ==================================================
            ERROR
        ================================================== */}

        {errorText !== "" && (
          <View style={styles.errorContainer}>
            <AlertCircle width={18} height={18} color={Colors.primaryRed} />

            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}

        {/* ==================================================
            REGISTER BUTTON
        ================================================== */}

        <TouchableOpacity
          style={[
            styles.registerButton,
            loading && styles.registerButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleRegister}
          disabled={loading}
        >
          <User width={20} height={20} color={Colors.white} />

          <Text style={styles.registerButtonText}>
            {loading ? "REGISTERING..." : "REGISTER"}
          </Text>
        </TouchableOpacity>

        {/* ==================================================
            LOGIN
        ================================================== */}

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ====================================================
          GENDER MODAL
      ==================================================== */}

      <SelectionModal
        visible={genderModalVisible}
        title="Select Gender"
        options={GENDER_OPTIONS}
        selectedValue={gender}
        onClose={() => setGenderModalVisible(false)}
        onSelect={handleGenderSelect}
      />

      {/* ====================================================
          ON BEHALF MODAL
      ==================================================== */}

      <SelectionModal
        visible={onBehalfModalVisible}
        title="Register For"
        options={ON_BEHALF_OPTIONS}
        selectedValue={onBehalf}
        isObjectOptions
        onClose={() => setOnBehalfModalVisible(false)}
        onSelect={handleOnBehalfSelect}
      />
    </SafeAreaView>
  );
}

/* ==============================================================
   FIELD CARD
============================================================== */

function FieldCard({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  trailing,
  keyboardType,
  autoCapitalize,
  autoCorrect = true,
  editable = true,
}) {
  return (
    <View style={styles.fieldCard}>
      <View style={styles.fieldIcon}>{icon}</View>

      <View style={styles.fieldTextBlock}>
        <Text style={styles.fieldLabel}>{label}</Text>

        <TextInput
          style={styles.fieldInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          underlineColorAndroid="transparent"
        />
      </View>

      {trailing}
    </View>
  );
}

/* ==============================================================
   SELECTION MODAL
============================================================== */

function SelectionModal({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
  isObjectOptions = false,
}) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalWrapper}>
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <View style={styles.modalCard}>
        <View style={styles.modalHandle} />

        <Text style={styles.modalTitle}>{title}</Text>

        {options.map((option, index) => {
          const optionValue = isObjectOptions ? String(option.value) : option;

          const optionLabel = isObjectOptions ? option.label : option;

          const selected = String(selectedValue) === String(optionValue);

          return (
            <TouchableOpacity
              key={String(optionValue)}
              style={[
                styles.modalOption,
                index === options.length - 1 && styles.modalOptionLast,
              ]}
              activeOpacity={0.7}
              onPress={() => onSelect(isObjectOptions ? option.value : option)}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  selected && styles.modalOptionSelected,
                ]}
              >
                {optionLabel}
              </Text>

              {selected && (
                <Check width={19} height={19} color={Colors.primaryRed} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 35,
  },

  /* ============================================================
     TOP BAR
  ============================================================ */

  topBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
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
    width: "70%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: Colors.primaryRed,
  },

  progressText: {
    marginTop: 5,
    textAlign: "right",
    fontSize: 10,
    fontFamily: Fonts.body.medium,
    color: Colors.textMuted,
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
    marginBottom: 12,
  },

  heading: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    textAlign: "center",
  },

  description: {
    maxWidth: 320,
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },

  /* ============================================================
     FIELDS
  ============================================================ */

  fieldsContainer: {
    width: "100%",
  },

  fieldCard: {
    width: "100%",
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: Colors.border,

    elevation: 2,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  fieldIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: "#FCE9E7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  fieldTextBlock: {
    flex: 1,
  },

  fieldLabel: {
    fontSize: 11,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textMuted,
    marginBottom: 2,
  },

  fieldInput: {
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    padding: 0,
    minHeight: 20,

    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },

  countryCode: {
    flexDirection: "row",
    alignItems: "center",
  },

  countryCodeText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    marginRight: 3,
  },

  /* ============================================================
     TERMS
  ============================================================ */

  termsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 3,
    marginBottom: 16,
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.checkboxBorder,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    marginTop: 1,
  },

  checkboxChecked: {
    backgroundColor: Colors.primaryRed,
    borderColor: Colors.primaryRed,
  },

  termsText: {
    flex: 1,
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  termsLink: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.semiBold,
  },

  /* ============================================================
     ERROR
  ============================================================ */

  errorContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEECEC",
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
     REGISTER
  ============================================================ */

  registerButton: {
    width: "100%",
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,

    elevation: 4,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  registerButtonDisabled: {
    opacity: 0.55,
  },

  registerButtonText: {
    fontSize: FontSizes.button,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
    letterSpacing: 0.8,
  },

  /* ============================================================
     LOGIN
  ============================================================ */

  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
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

  /* ============================================================
     MODAL
  ============================================================ */

  modalWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    elevation: 10,
  },

  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#D6D6D6",
    alignSelf: "center",
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  modalOption: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  modalOptionLast: {
    borderBottomWidth: 0,
  },

  modalOptionText: {
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
  },

  modalOptionSelected: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.bold,
  },
});
