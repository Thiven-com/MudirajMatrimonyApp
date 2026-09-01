import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Pressable,
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

const CURRENT_YEAR = new Date().getFullYear();

// ================= OPTION LISTS =================
const QUALIFICATION_OPTIONS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Professional Degree (MBA / MD / JD)",
  "Other",
];

const SPECIALIZATION_OPTIONS = [
  "Computer Science",
  "Information Technology",
  "Engineering",
  "Medicine",
  "Commerce",
  "Arts / Humanities",
  "Law",
  "Science",
  "Management",
  "Other",
];

const YEAR_OF_PASSING_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

const MODE_OF_STUDY_OPTIONS = [
  "Full Time",
  "Part Time",
  "Distance Learning",
  "Online",
  "Correspondence",
];

const EDUCATION_LEVEL_OPTIONS = [
  "10th / SSC",
  "12th / HSC",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "Doctorate",
];

const STREAM_OPTIONS = [
  "Science",
  "Commerce",
  "Arts / Humanities",
  "Engineering",
  "Medical",
  "Law",
  "Other",
];

const MARKING_SYSTEM_OPTIONS = ["Percentage", "CGPA", "GPA", "Grade"];

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
];

export default function EducationScreen() {
  const router = useRouter();

  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [university, setUniversity] = useState("");
  const [yearOfPassing, setYearOfPassing] = useState("");
  const [modeOfStudy, setModeOfStudy] = useState("");

  const [educationLevel, setEducationLevel] = useState("");
  const [stream, setStream] = useState("");
  const [markingSystem, setMarkingSystem] = useState("");
  const [percentage, setPercentage] = useState("");
  const [grade, setGrade] = useState("");

  const [certification, setCertification] = useState("");
  const [otherSkills, setOtherSkills] = useState("");
  const [languages, setLanguages] = useState([]); // multi-select

  // ===== Picker modal state =====
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerConfig, setPickerConfig] = useState(null);
  // pickerConfig: { title, options, value, onSelect, multiSelect }

  const openPicker = (config) => {
    setPickerConfig(config);
    setPickerVisible(true);
  };

  const closePicker = () => {
    setPickerVisible(false);
    setPickerConfig(null);
  };

  const handleAddAnotherEducation = () => {
    // TODO: push a new education entry block onto the form state
  };

  const handleSaveAndContinue = () => {
    console.log("Saving education details...", {
      qualification,
      specialization,
      university,
      yearOfPassing,
      modeOfStudy,
      educationLevel,
      stream,
      markingSystem,
      percentage,
      grade,
      certification,
      otherSkills,
      languages,
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

          <Text style={styles.headerTitle}>Education</Text>

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
            <Ionicons name="school" size={20} color={Colors.primaryRed} />
          </View>
          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>
              Your education helps build your profile
            </Text>
            <Text style={styles.introSubtitle}>
              Add details of your education.
            </Text>
          </View>
        </View>

        {/* ================= HIGHEST EDUCATION ================= */}
        <Text style={styles.sectionHeading}>Highest Education</Text>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Highest Qualification" required />
            <SelectField
              icon="school-outline"
              placeholder="Select qualification"
              value={qualification}
              compact
              onPress={() =>
                openPicker({
                  title: "Highest Qualification",
                  options: QUALIFICATION_OPTIONS,
                  value: qualification,
                  onSelect: setQualification,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Specialization" infoIcon />
            <SelectField
              icon="book-outline"
              placeholder="Select specialization"
              value={specialization}
              compact
              onPress={() =>
                openPicker({
                  title: "Specialization",
                  options: SPECIALIZATION_OPTIONS,
                  value: specialization,
                  onSelect: setSpecialization,
                })
              }
            />
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="University / College" required />
            <View style={styles.inputRow}>
              <Ionicons
                name="business-outline"
                size={17}
                color={Colors.primaryRed}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={university}
                onChangeText={setUniversity}
                placeholder="Enter university / college"
                placeholderTextColor={Colors.placeholder}
              />
            </View>
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Year of Passing" required />
            <SelectField
              icon="calendar-outline"
              placeholder="Select year"
              value={yearOfPassing}
              compact
              onPress={() =>
                openPicker({
                  title: "Year of Passing",
                  options: YEAR_OF_PASSING_OPTIONS,
                  value: yearOfPassing,
                  onSelect: setYearOfPassing,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Mode of Study" />
        <SelectField
          icon="person-outline"
          placeholder="Select mode of study"
          value={modeOfStudy}
          onPress={() =>
            openPicker({
              title: "Mode of Study",
              options: MODE_OF_STUDY_OPTIONS,
              value: modeOfStudy,
              onSelect: setModeOfStudy,
            })
          }
        />

        {/* ================= EDUCATION DETAILS ================= */}
        <Text style={styles.sectionHeading}>Education Details</Text>
        <View style={styles.sectionCard}>
          <FieldLabel text="Education Level" required />
          <SelectField
            icon="bar-chart-outline"
            placeholder="Select education level"
            value={educationLevel}
            compact
            onPress={() =>
              openPicker({
                title: "Education Level",
                options: EDUCATION_LEVEL_OPTIONS,
                value: educationLevel,
                onSelect: setEducationLevel,
              })
            }
          />

          <View style={styles.rowTwoCol}>
            <View style={styles.colHalf}>
              <FieldLabel text="Stream / Field of Study" required />
              <SelectField
                icon="book-outline"
                placeholder="Select stream / field"
                value={stream}
                compact
                onPress={() =>
                  openPicker({
                    title: "Stream / Field of Study",
                    options: STREAM_OPTIONS,
                    value: stream,
                    onSelect: setStream,
                  })
                }
              />
            </View>
            <View style={styles.colHalf}>
              <FieldLabel text="Marking System" optional />
              <SelectField
                icon="stats-chart-outline"
                placeholder="Select system"
                value={markingSystem}
                compact
                onPress={() =>
                  openPicker({
                    title: "Marking System",
                    options: MARKING_SYSTEM_OPTIONS,
                    value: markingSystem,
                    onSelect: setMarkingSystem,
                  })
                }
              />
            </View>
          </View>

          <View style={styles.rowTwoCol}>
            <View style={styles.colHalf}>
              <FieldLabel text="Percentage / CGPA" optional />
              <View style={[styles.inputRow, styles.inputRowCompact]}>
                <Ionicons
                  name="star-outline"
                  size={16}
                  color={Colors.primaryRed}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={percentage}
                  onChangeText={setPercentage}
                  placeholder="Enter percentage or CGPA"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.colHalf}>
              <FieldLabel text="Class / Grade" optional />
              <View style={[styles.inputRow, styles.inputRowCompact]}>
                <Ionicons
                  name="ribbon-outline"
                  size={16}
                  color={Colors.primaryRed}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={grade}
                  onChangeText={setGrade}
                  placeholder="Enter class / grade"
                  placeholderTextColor={Colors.placeholder}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ================= OTHER EDUCATION ================= */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>Other Education</Text>
          <Text style={styles.sectionHeadingOptional}> (Optional)</Text>
        </View>
        <TouchableOpacity
          style={styles.addAnotherButton}
          activeOpacity={0.7}
          onPress={handleAddAnotherEducation}
        >
          <Ionicons
            name="add-circle-outline"
            size={17}
            color={Colors.primaryRed}
          />
          <Text style={styles.addAnotherText}> Add Another Education</Text>
        </TouchableOpacity>

        {/* ================= ADDITIONAL INFORMATION ================= */}
        <Text style={styles.sectionHeading}>Additional Information</Text>

        <FieldLabel text="Certification / Diploma" optional />
        <View style={styles.inputRow}>
          <Ionicons
            name="document-text-outline"
            size={17}
            color={Colors.primaryRed}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={certification}
            onChangeText={setCertification}
            placeholder="Enter certification or diploma"
            placeholderTextColor={Colors.placeholder}
          />
        </View>

        <FieldLabel text="Other Skills" optional />
        <View style={styles.inputRow}>
          <Ionicons
            name="star-outline"
            size={17}
            color={Colors.primaryRed}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={otherSkills}
            onChangeText={setOtherSkills}
            placeholder="Enter your skills"
            placeholderTextColor={Colors.placeholder}
          />
        </View>

        <FieldLabel text="Languages Known" optional />
        <SelectField
          icon="language-outline"
          placeholder="Select languages"
          value={languages.join(", ")}
          onPress={() =>
            openPicker({
              title: "Languages Known",
              options: LANGUAGE_OPTIONS,
              value: languages,
              onSelect: setLanguages,
              multiSelect: true,
            })
          }
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

      <PickerModal
        visible={pickerVisible}
        config={pickerConfig}
        onClose={closePicker}
      />
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function FieldLabel({ text, required, optional, infoIcon }) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabelText}>{text}</Text>
      {required && <Text style={styles.requiredAsterisk}> *</Text>}
      {optional && <Text style={styles.optionalText}> (Optional)</Text>}
      {infoIcon && (
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={Colors.textMuted}
          style={{ marginLeft: 5 }}
        />
      )}
    </View>
  );
}

function SelectField({ icon, placeholder, value, compact, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.selectRow, compact && styles.selectRowCompact]}
      activeOpacity={0.7}
      onPress={onPress}
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

// Bottom-sheet style picker modal. Supports single-select (tap an option,
// modal closes immediately) and multi-select (tap toggles a checkbox,
// user taps "Done" to confirm).
function PickerModal({ visible, config, onClose }) {
  const { title, options, value, onSelect, multiSelect } = config || {};

  const [draftSelection, setDraftSelection] = useState([]);

  useMemo(() => {
    if (multiSelect) {
      setDraftSelection(Array.isArray(value) ? value : []);
    }
  }, [visible, multiSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!config) return null;

  const isOptionSelected = (option) =>
    multiSelect ? draftSelection.includes(option) : option === value;

  const handleOptionPress = (option) => {
    if (multiSelect) {
      setDraftSelection((prev) =>
        prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option],
      );
    } else {
      onSelect(option);
      onClose();
    }
  };

  const handleDone = () => {
    onSelect(draftSelection);
    onClose();
  };

  const handleClear = () => {
    if (multiSelect) {
      setDraftSelection([]);
    } else {
      onSelect("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose} />

      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />

        <View style={styles.modalHeaderRow}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={options}
          keyExtractor={(item) => item}
          style={styles.modalList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const selected = isOptionSelected(item);
            return (
              <TouchableOpacity
                style={styles.modalOptionRow}
                activeOpacity={0.7}
                onPress={() => handleOptionPress(item)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selected && styles.modalOptionTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {multiSelect ? (
                  <View
                    style={[
                      styles.modalCheckbox,
                      selected && styles.modalCheckboxSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={Colors.white}
                      />
                    )}
                  </View>
                ) : (
                  selected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={Colors.primaryRed}
                    />
                  )
                )}
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.modalFooterRow}>
          <TouchableOpacity
            style={styles.modalClearButton}
            activeOpacity={0.7}
            onPress={handleClear}
          >
            <Text style={styles.modalClearButtonText}>Clear</Text>
          </TouchableOpacity>

          {multiSelect && (
            <TouchableOpacity
              style={styles.modalDoneButton}
              activeOpacity={0.85}
              onPress={handleDone}
            >
              <Text style={styles.modalDoneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
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

  /* ===== SECTION HEADING ===== */
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginBottom: 14,
  },
  sectionHeadingOptional: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 14,
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
    height: 52,
    marginBottom: 20,
    backgroundColor: Colors.cardBackground,
  },
  inputRowCompact: {
    height: 50,
    marginBottom: 16,
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

  /* ===== SECTION CARD ===== */
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 22,
  },

  /* ===== ADD ANOTHER EDUCATION ===== */
  addAnotherButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 26,
  },
  addAnotherText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
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

  /* ===== PICKER MODAL ===== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  modalList: {
    marginTop: 6,
  },
  modalOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
  },
  modalOptionTextSelected: {
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  modalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCheckboxSelected: {
    backgroundColor: Colors.primaryRed,
    borderColor: Colors.primaryRed,
  },
  modalFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 12,
  },
  modalClearButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalClearButtonText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textMuted,
  },
  modalDoneButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primaryRedDark,
  },
  modalDoneButtonText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
