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
const ABOUT_MAX_LENGTH = 300;

const FAMILY_TYPE_OPTIONS = [
  { key: "joint", label: "Joint Family", icon: "people" },
  { key: "nuclear", label: "Nuclear Family", icon: "people-outline" },
  { key: "single", label: "Single Parent", icon: "person-outline" },
];

const FAMILY_LOCATION_OPTIONS = [
  { key: "native", label: "Native Place", icon: "location" },
  { key: "current", label: "Current Location", icon: "locate-outline" },
  { key: "both", label: "Both Same", icon: "location-outline" },
];

export default function FamilyDetailsScreen() {
  const router = useRouter();

  const [familyType, setFamilyType] = useState("joint");
  const [familyValues, setFamilyValues] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [brothersCount, setBrothersCount] = useState(0);
  const [sistersCount, setSistersCount] = useState(0);
  const [familyLocation, setFamilyLocation] = useState("native");
  const [familyStatus, setFamilyStatus] = useState("");
  const [aboutFamily, setAboutFamily] = useState("");

  const handleSaveAndContinue = () => {
    console.log("Saving family details...", {
      familyType,
      familyValues,
      fatherName,
      fatherOccupation,
      motherName,
      motherOccupation,
      brothersCount,
      sistersCount,
      familyLocation,
      familyStatus,
      aboutFamily,
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

          <Text style={styles.headerTitle}>Family Details</Text>

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
        {/* ================= INTRO BANNER ================= */}
        <View style={styles.introBanner}>
          <View style={styles.introIconCircle}>
            <Ionicons name="people" size={20} color={Colors.primaryRed} />
          </View>
          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>
              Family plays an important role in life.
            </Text>
            <Text style={styles.introSubtitle}>
              Help others know your family background better.
            </Text>
          </View>
        </View>

        {/* ---- Family Type ---- */}
        <FieldLabel text="Family Type" required />
        <View style={styles.tileRow}>
          {FAMILY_TYPE_OPTIONS.map((option) => {
            const isActive = familyType === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[styles.optionTile, isActive && styles.optionTileActive]}
                activeOpacity={0.8}
                onPress={() => setFamilyType(option.key)}
              >
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={isActive ? Colors.primaryRed : Colors.textSecondary}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={[
                    styles.optionTileText,
                    isActive && {
                      color: Colors.primaryRed,
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

        {/* ---- Family Values ---- */}
        <FieldLabel text="Family Values" required />
        <SelectField
          icon="heart-outline"
          placeholder="Select family values"
          value={familyValues}
        />

        {/* ================= PARENTS DETAILS ================= */}
        <Text style={styles.sectionHeading}>Parents Details</Text>
        <View style={styles.sectionCard}>
          <View style={styles.rowTwoCol}>
            <View style={styles.colHalf}>
              <FieldLabel text="Father's Name" required />
              <View style={styles.inputRow}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={Colors.primaryRed}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={fatherName}
                  onChangeText={setFatherName}
                  placeholder="Enter father's name"
                  placeholderTextColor={Colors.placeholder}
                />
              </View>
            </View>
            <View style={styles.colHalf}>
              <FieldLabel text="Father's Occupation" required />
              <SelectField
                icon="briefcase-outline"
                placeholder="Select occupation"
                value={fatherOccupation}
                compact
              />
            </View>
          </View>

          <View style={styles.rowTwoCol}>
            <View style={styles.colHalf}>
              <FieldLabel text="Mother's Name" required />
              <View style={styles.inputRow}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={Colors.primaryRed}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={motherName}
                  onChangeText={setMotherName}
                  placeholder="Enter mother's name"
                  placeholderTextColor={Colors.placeholder}
                />
              </View>
            </View>
            <View style={styles.colHalf}>
              <FieldLabel text="Mother's Occupation" required />
              <SelectField
                icon="briefcase-outline"
                placeholder="Select occupation"
                value={motherOccupation}
                compact
              />
            </View>
          </View>
        </View>

        {/* ================= SIBLINGS ================= */}
        <Text style={styles.sectionHeading}>Siblings</Text>
        <View style={styles.sectionCard}>
          <SiblingCounter
            icon="people-outline"
            label="Brother(s)"
            count={brothersCount}
            onDecrease={() => setBrothersCount((c) => Math.max(0, c - 1))}
            onIncrease={() => setBrothersCount((c) => c + 1)}
            placeholder="Select number of brothers"
          />

          <View style={styles.siblingDivider} />

          <SiblingCounter
            icon="people-outline"
            label="Sister(s)"
            count={sistersCount}
            onDecrease={() => setSistersCount((c) => Math.max(0, c - 1))}
            onIncrease={() => setSistersCount((c) => c + 1)}
            placeholder="Select number of sisters"
          />
        </View>

        {/* ---- Family Location ---- */}
        <FieldLabel text="Family Location" required />
        <View style={styles.tileRow}>
          {FAMILY_LOCATION_OPTIONS.map((option) => {
            const isActive = familyLocation === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.locationTile,
                  isActive && styles.optionTileActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setFamilyLocation(option.key)}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={isActive ? Colors.primaryRed : Colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.locationTileText,
                    isActive && {
                      color: Colors.primaryRed,
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

        {/* ---- Family Status ---- */}
        <FieldLabel text="Family Status" required />
        <SelectField
          icon="star-outline"
          placeholder="Select family status"
          value={familyStatus}
        />

        {/* ---- About My Family ---- */}
        <FieldLabel text="About My Family" optional />
        <View style={styles.aboutBox}>
          <View style={styles.aboutInputRow}>
            <Ionicons
              name="flag-outline"
              size={17}
              color={Colors.primaryRed}
              style={[styles.inputIcon, { marginTop: 2 }]}
            />
            <TextInput
              style={styles.aboutInput}
              value={aboutFamily}
              onChangeText={(text) =>
                setAboutFamily(text.slice(0, ABOUT_MAX_LENGTH))
              }
              placeholder="Tell about your family..."
              placeholderTextColor={Colors.placeholder}
              multiline
              maxLength={ABOUT_MAX_LENGTH}
            />
          </View>
          <Text style={styles.charCountText}>
            {aboutFamily.length}/{ABOUT_MAX_LENGTH}
          </Text>
        </View>

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

function SelectField({ icon, placeholder, value, compact }) {
  return (
    <TouchableOpacity
      style={[styles.selectRow, compact && styles.selectRowCompact]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={17}
        color={Colors.primaryRed}
        style={styles.inputIcon}
      />
      <Text
        style={[styles.selectText, value ? styles.selectTextFilled : null]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={15} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

function SiblingCounter({
  icon,
  label,
  count,
  onDecrease,
  onIncrease,
  placeholder,
}) {
  return (
    <View>
      <View style={styles.siblingHeaderRow}>
        <FieldLabel text={label} required />
        <View style={styles.siblingTotalRow}>
          <Text style={styles.siblingTotalLabel}>Total</Text>
          <View style={styles.siblingCounterBox}>
            <TouchableOpacity
              onPress={onDecrease}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
            >
              <Text style={styles.siblingCounterValue}>{count}</Text>
            </TouchableOpacity>
            <Ionicons
              name="chevron-down"
              size={14}
              color={Colors.textMuted}
              style={{ marginLeft: 6 }}
            />
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.selectRow}
        activeOpacity={0.7}
        onPress={onIncrease}
      >
        <Ionicons
          name={icon}
          size={17}
          color={Colors.primaryRed}
          style={styles.inputIcon}
        />
        <Text style={styles.selectText}>{placeholder}</Text>
        <Ionicons name="chevron-down" size={15} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
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

  /* ===== INTRO BANNER ===== */
  introBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FDF3D8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 22,
  },
  introIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FCE4D6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  introTextBlock: {
    flex: 1,
  },
  introTitle: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  introSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
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
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
    backgroundColor: Colors.cardBackground,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },

  /* ===== SELECT FIELD ===== */
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 20,
    backgroundColor: Colors.cardBackground,
  },
  selectRowCompact: {
    height: 50,
    marginBottom: 16,
  },
  selectText: {
    flex: 1,
    fontSize: 13.5,
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
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },

  /* ===== OPTION TILES (Family Type) ===== */
  tileRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  optionTile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
  },
  optionTileActive: {
    borderColor: Colors.primaryRed,
    backgroundColor: "#FDF1EF",
  },
  optionTileText: {
    fontSize: 12,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  /* ===== SECTION HEADING / CARD ===== */
  sectionHeading: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 22,
  },

  /* ===== SIBLINGS ===== */
  siblingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  siblingTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  siblingTotalLabel: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  siblingCounterBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  siblingCounterValue: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  siblingDivider: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    marginVertical: 16,
  },

  /* ===== LOCATION TILES ===== */
  locationTile: {
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
  locationTileText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  /* ===== ABOUT MY FAMILY ===== */
  aboutBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    marginBottom: 24,
  },
  aboutInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  aboutInput: {
    flex: 1,
    minHeight: 80,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    textAlignVertical: "top",
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  charCountText: {
    alignSelf: "flex-end",
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 4,
  },

  /* ===== SAVE BUTTON ===== */
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRedDark,
    borderRadius: 16,
    paddingVertical: 17,
    marginTop: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
