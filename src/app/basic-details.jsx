import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
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
import Svg, { Path } from "react-native-svg";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const GENDER_OPTIONS = [
  {
    key: "male",
    label: "Male",
    icon: "person",
    activeColor: Colors.primaryRed,
  },
  { key: "female", label: "Female", icon: "person", activeColor: "#D6336C" },
  { key: "other", label: "Other", icon: "person", activeColor: "#E0A93E" },
];

export default function BasicDetailsScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [gender, setGender] = useState("male");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [motherTongue, setMotherTongue] = useState("");
  const [languages, setLanguages] = useState("");
  const [nationality, setNationality] = useState("Indian");
  const [city, setCity] = useState("");

  const handleSaveAndContinue = () => {
    console.log("Saving basic details...", {
      fullName,
      dob,
      tob,
      gender,
      maritalStatus,
      height,
      weight,
      bloodGroup,
      motherTongue,
      languages,
      nationality,
      city,
    });
    // TODO: submit to backend, then navigate to next onboarding step
    // router.push("/onboarding/next-step");
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.headerWrapper}>
        <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Basic Details</Text>

          <View style={styles.headerSpacer} />
        </LinearGradient>

        <Svg
          width={SCREEN_WIDTH}
          height={24}
          viewBox={`0 0 ${SCREEN_WIDTH} 24`}
          style={styles.headerWave}
        >
          <Path
            d={`M0,4 Q${SCREEN_WIDTH * 0.25},22 ${SCREEN_WIDTH * 0.5},10 Q${SCREEN_WIDTH * 0.75},-2 ${SCREEN_WIDTH},14`}
            stroke={Colors.goldLight}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================= PAGE TITLE ================= */}
        <Text style={styles.pageTitle}>Tell us about yourself</Text>
        <Text style={styles.pageSubtitle}>
          Please provide accurate information to help others know you better.
        </Text>

        {/* ---- Full Name ---- */}
        <FieldLabel text="Full Name" required />
        <View style={styles.inputRow}>
          <Ionicons
            name="person-outline"
            size={18}
            color={Colors.primaryRed}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor={Colors.placeholder}
          />
        </View>

        {/* ---- Date of Birth / Time of Birth ---- */}
        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Date of Birth" required />
            <SelectField
              icon="calendar-outline"
              placeholder="DD / MM / YYYY"
              value={dob}
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Time of Birth" required />
            <SelectField
              icon="time-outline"
              placeholder="Select time"
              value={tob}
            />
          </View>
        </View>

        {/* ---- Gender ---- */}
        <FieldLabel text="Gender" required />
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((option) => {
            const isActive = gender === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.genderTile,
                  isActive && {
                    borderColor: option.activeColor,
                    backgroundColor: "#FDF1EF",
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setGender(option.key)}
              >
                <Ionicons
                  name={isActive ? "person" : "person-outline"}
                  size={16}
                  color={option.activeColor}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.genderText,
                    isActive && {
                      color: option.activeColor,
                      fontFamily: Fonts.body.bold,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ---- Marital Status ---- */}
        <FieldLabel text="Marital Status" required />
        <SelectField
          icon="heart-outline"
          placeholder="Select marital status"
          value={maritalStatus}
        />

        {/* ---- Height / Weight ---- */}
        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Height" required />
            <SelectField
              icon="resize-outline"
              placeholder="Select height"
              value={height}
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Weight" optional />
            <View style={styles.inputRow}>
              <Ionicons
                name="barbell-outline"
                size={18}
                color={Colors.primaryRed}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter weight"
                placeholderTextColor={Colors.placeholder}
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>kg</Text>
            </View>
          </View>
        </View>

        {/* ---- Blood Group ---- */}
        <FieldLabel text="Blood Group" optional />
        <SelectField
          icon="water-outline"
          placeholder="Select blood group"
          value={bloodGroup}
        />

        {/* ---- Mother Tongue ---- */}
        <FieldLabel text="Mother Tongue" required />
        <SelectField
          icon="chatbubble-outline"
          placeholder="Select mother tongue"
          value={motherTongue}
        />

        {/* ---- Languages Known ---- */}
        <FieldLabel text="Languages Known" optional />
        <SelectField
          icon="language-outline"
          placeholder="Select languages"
          value={languages}
        />

        {/* ---- Nationality ---- */}
        <FieldLabel text="Nationality" required />
        <SelectField
          icon="flag-outline"
          placeholder="Select nationality"
          value={nationality}
        />

        {/* ---- Currently Living In ---- */}
        <FieldLabel text="Currently Living In" required />
        <SelectField
          icon="location-outline"
          placeholder="Enter city"
          value={city}
        />

        {/* ================= SAVE BUTTON ================= */}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSaveAndContinue}
        >
          <Text style={styles.saveButtonText}>Save & Continue</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.white}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function FieldLabel({ text, required, optional }) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabelText}>{text}</Text>
      {required && <Text style={styles.requiredAsterisk}> *</Text>}
      {optional && <Text style={styles.optionalText}> (Optional)</Text>}
    </View>
  );
}

function SelectField({ icon, placeholder, value }) {
  return (
    <TouchableOpacity style={styles.selectRow} activeOpacity={0.7}>
      <Ionicons
        name={icon}
        size={18}
        color={Colors.primaryRed}
        style={styles.inputIcon}
      />
      <Text style={[styles.selectText, value ? styles.selectTextFilled : null]}>
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
  },

  /* ===== HEADER ===== */
  headerWrapper: {
    width: "100%",
  },
  header: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 34,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSizes.welcome + 2,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
  },
  headerSpacer: {
    width: 34,
  },
  headerWave: {
    marginTop: -6,
  },

  /* ===== PAGE TITLE ===== */
  pageTitle: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 24,
    lineHeight: 19,
  },

  /* ===== FIELD LABEL ===== */
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabelText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  requiredAsterisk: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  optionalText: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  /* ===== TEXT INPUT ===== */
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 20,
    backgroundColor: Colors.cardBackground,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  unitText: {
    fontSize: 13,
    fontFamily: Fonts.body.medium,
    color: Colors.textMuted,
  },

  /* ===== SELECT FIELD ===== */
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 20,
    backgroundColor: Colors.cardBackground,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.placeholder,
  },
  selectTextFilled: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body.medium,
  },

  /* ===== TWO-COLUMN ROWS ===== */
  rowTwoCol: {
    flexDirection: "row",
    gap: 14,
  },
  colHalf: {
    flex: 1,
  },

  /* ===== GENDER ===== */
  genderRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  genderTile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    backgroundColor: Colors.cardBackground,
  },
  genderText: {
    fontSize: 13,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },

  /* ===== SAVE BUTTON ===== */
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRedDark,
    borderRadius: 16,
    paddingVertical: 17,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
