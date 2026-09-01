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

const ABOUT_PARTNER_MAX_LENGTH = 300;

// ================= OPTION LISTS =================
const AGE_RANGE_OPTIONS = [
  "No Preference",
  "18 - 23 Years",
  "21 - 26 Years",
  "24 - 30 Years",
  "27 - 33 Years",
  "30 - 36 Years",
  "33 - 40 Years",
  "40+ Years",
];

const HEIGHT_RANGE_OPTIONS = [
  "No Preference",
  "4'6\" - 5'0\"",
  "5'0\" - 5'2\"",
  "5'2\" - 5'8\"",
  "5'4\" - 5'8\"",
  "5'8\" - 6'0\"",
  "6'0\" - 6'4\"",
  "Above 6'4\"",
];

const MARITAL_STATUS_OPTIONS = [
  "No Preference",
  "Never Married",
  "Divorced",
  "Widowed",
  "Awaiting Divorce",
];

const HAVE_CHILDREN_OPTIONS = [
  "No Preference",
  "Doesn't Matter",
  "No Children",
  "Have Children, Living Together",
  "Have Children, Not Living Together",
];

const PHYSICAL_STATUS_OPTIONS = [
  "No Preference",
  "Normal",
  "Physically Challenged",
];

const RELIGION_OPTIONS = [
  "No Preference",
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Parsi",
  "Jewish",
  "Other",
];

const CASTE_COMMUNITY_OPTIONS = [
  "No Preference",
  "Kamma",
  "Kapu",
  "Reddy",
  "Mudhiraj",
  "Yadav",
  "Brahmin",
  "Vysya",
  "Velama",
  "Munnuru Kapu",
  "Raju",
  "Naidu",
  "Other",
];

const GOTHRAM_OPTIONS = [
  "No Preference",
  "Kashyapa",
  "Bharadwaja",
  "Vishwamitra",
  "Vasishta",
  "Atri",
  "Gautama",
  "Kaundinya",
  "Shandilya",
  "Agastya",
  "Other",
];

const SUB_CASTE_OPTIONS = [
  "No Preference",
  "Munnuru Kapu",
  "Turpu Kapu",
  "Telaga",
  "Ontari",
  "Other",
];

const MANGLIK_OPTIONS = ["No Preference", "Yes", "No", "Doesn't Matter"];

const EDUCATION_LEVEL_OPTIONS = [
  "No Preference",
  "High School",
  "Diploma",
  "Graduate and above",
  "Master's Degree",
  "Doctorate (PhD)",
  "Professional Degree (MBA / MD / JD)",
];

const EMPLOYMENT_STATUS_OPTIONS = [
  "No Preference",
  "Employed",
  "Business Owner",
  "Self Employed",
  "Not Working",
  "Student",
];

const OCCUPATION_OPTIONS = [
  "No Preference",
  "Software Engineer",
  "Doctor",
  "Chartered Accountant",
  "Lawyer",
  "Teacher / Professor",
  "Civil Servant (Govt.)",
  "Banker",
  "Business Analyst",
  "Consultant",
  "Architect",
  "Marketing Professional",
  "Sales Professional",
  "HR Professional",
  "Designer",
  "Entrepreneur",
  "Defence Personnel",
  "Scientist / Researcher",
  "Other",
];

const ANNUAL_INCOME_OPTIONS = [
  "No Preference",
  "Below ₹2 Lakh",
  "₹2 - 5 Lakh",
  "₹5 - 8 Lakh",
  "₹8 - 12 Lakh",
  "₹12 - 18 Lakh",
  "₹18 - 25 Lakh",
  "₹25 - 40 Lakh",
  "₹40 - 60 Lakh",
  "₹60 Lakh - 1 Crore",
  "Above ₹1 Crore",
];

const DIET_OPTIONS = [
  "No Preference",
  "Vegetarian",
  "Non-Vegetarian",
  "Eggetarian",
  "Vegan",
  "Jain",
  "Occasionally Non-Veg",
];

const LOCATION_PREFERENCE_OPTIONS = [
  "No Preference",
  "Hyderabad, Telangana",
  "Vijayawada, Andhra Pradesh",
  "Visakhapatnam, Andhra Pradesh",
  "Guntur, Andhra Pradesh",
  "Warangal, Telangana",
  "Bengaluru, Karnataka",
  "Chennai, Tamil Nadu",
  "Mumbai, Maharashtra",
  "Delhi NCR",
  "Same City Only",
  "Same State Only",
  "Anywhere in India",
  "Outside India",
];

const READY_TO_RELOCATE_OPTIONS = ["No Preference", "Yes", "No", "Maybe"];

export default function PartnerPreferenceScreen() {
  const router = useRouter();

  // Basic Preferences
  const [ageRange, setAgeRange] = useState("24 - 30 Years");
  const [heightRange, setHeightRange] = useState("5'2\" - 5'8\"");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");
  const [haveChildren, setHaveChildren] = useState("No Preference");
  const [physicalStatus, setPhysicalStatus] = useState("No Preference");

  // Religious & Cultural Preferences
  const [religion, setReligion] = useState("Hindu");
  const [casteCommunity, setCasteCommunity] = useState("Mudhiraj");
  const [gothram, setGothram] = useState("No Preference");
  const [subCaste, setSubCaste] = useState("No Preference");
  const [manglik, setManglik] = useState("No Preference");

  // Education & Career
  const [educationLevel, setEducationLevel] = useState("Graduate and above");
  const [employmentStatus, setEmploymentStatus] = useState("No Preference");
  const [occupation, setOccupation] = useState("No Preference");
  const [annualIncome, setAnnualIncome] = useState("No Preference");

  // Lifestyle Preferences
  const [diet, setDiet] = useState("No Preference");
  const [locationPreference, setLocationPreference] = useState("No Preference");
  const [readyToRelocate, setReadyToRelocate] = useState("No Preference");

  // About Partner
  const [aboutPartner, setAboutPartner] = useState("");

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

  const handleSaveAndContinue = () => {
    console.log("Saving partner preference details...", {
      ageRange,
      heightRange,
      maritalStatus,
      haveChildren,
      physicalStatus,
      religion,
      casteCommunity,
      gothram,
      subCaste,
      manglik,
      educationLevel,
      employmentStatus,
      occupation,
      annualIncome,
      diet,
      locationPreference,
      readyToRelocate,
      aboutPartner,
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

          <Text style={styles.headerTitle}>Partner Preference</Text>

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
            <Ionicons
              name="heart-outline"
              size={20}
              color={Colors.primaryRed}
            />
          </View>
          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>
              Help us find your perfect match.
            </Text>
            <Text style={styles.introSubtitle}>
              Tell us what you are looking for in your life partner.
            </Text>
          </View>
        </View>

        {/* ================= BASIC PREFERENCES ================= */}
        <SectionHeading text="Basic Preferences" />

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Age Range" required />
            <SelectField
              icon="calendar-outline"
              placeholder="Select age range"
              value={ageRange}
              compact
              onPress={() =>
                openPicker({
                  title: "Age Range",
                  options: AGE_RANGE_OPTIONS,
                  value: ageRange,
                  onSelect: setAgeRange,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Height Range" />
            <SelectField
              icon="body-outline"
              placeholder="Select height range"
              value={heightRange}
              compact
              onPress={() =>
                openPicker({
                  title: "Height Range",
                  options: HEIGHT_RANGE_OPTIONS,
                  value: heightRange,
                  onSelect: setHeightRange,
                })
              }
            />
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Marital Status" required />
            <SelectField
              icon="ellipse-outline"
              placeholder="Select marital status"
              value={maritalStatus}
              compact
              onPress={() =>
                openPicker({
                  title: "Marital Status",
                  options: MARITAL_STATUS_OPTIONS,
                  value: maritalStatus,
                  onSelect: setMaritalStatus,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Have Children" />
            <SelectField
              icon="happy-outline"
              placeholder="Select preference"
              value={haveChildren}
              compact
              onPress={() =>
                openPicker({
                  title: "Have Children",
                  options: HAVE_CHILDREN_OPTIONS,
                  value: haveChildren,
                  onSelect: setHaveChildren,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Physical Status" />
        <SelectField
          icon="accessibility-outline"
          placeholder="Select physical status"
          value={physicalStatus}
          onPress={() =>
            openPicker({
              title: "Physical Status",
              options: PHYSICAL_STATUS_OPTIONS,
              value: physicalStatus,
              onSelect: setPhysicalStatus,
            })
          }
        />

        {/* ================= RELIGIOUS & CULTURAL PREFERENCES ================= */}
        <SectionHeading text="Religious & Cultural Preferences" />

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Religion" required />
            <SelectField
              icon="sparkles-outline"
              placeholder="Select religion"
              value={religion}
              compact
              onPress={() =>
                openPicker({
                  title: "Religion",
                  options: RELIGION_OPTIONS,
                  value: religion,
                  onSelect: setReligion,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Caste / Community" required />
            <SelectField
              icon="people-outline"
              placeholder="Select caste / community"
              value={casteCommunity}
              compact
              onPress={() =>
                openPicker({
                  title: "Caste / Community",
                  options: CASTE_COMMUNITY_OPTIONS,
                  value: casteCommunity,
                  onSelect: setCasteCommunity,
                })
              }
            />
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Gothram" />
            <SelectField
              icon="flower-outline"
              placeholder="Select gothram"
              value={gothram}
              compact
              onPress={() =>
                openPicker({
                  title: "Gothram",
                  options: GOTHRAM_OPTIONS,
                  value: gothram,
                  onSelect: setGothram,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Sub Caste" />
            <SelectField
              icon="shield-outline"
              placeholder="Select sub caste"
              value={subCaste}
              compact
              onPress={() =>
                openPicker({
                  title: "Sub Caste",
                  options: SUB_CASTE_OPTIONS,
                  value: subCaste,
                  onSelect: setSubCaste,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Manglik (Kuja Dosham)" />
        <SelectField
          icon="planet-outline"
          placeholder="Select preference"
          value={manglik}
          onPress={() =>
            openPicker({
              title: "Manglik (Kuja Dosham)",
              options: MANGLIK_OPTIONS,
              value: manglik,
              onSelect: setManglik,
            })
          }
        />

        {/* ================= EDUCATION & CAREER ================= */}
        <SectionHeading text="Education & Career" />

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Education Level" />
            <SelectField
              icon="school-outline"
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
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Employment Status" />
            <SelectField
              icon="briefcase-outline"
              placeholder="Select employment status"
              value={employmentStatus}
              compact
              onPress={() =>
                openPicker({
                  title: "Employment Status",
                  options: EMPLOYMENT_STATUS_OPTIONS,
                  value: employmentStatus,
                  onSelect: setEmploymentStatus,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Occupation / Profession" />
        <SelectField
          icon="person-outline"
          placeholder="Select occupation"
          value={occupation}
          onPress={() =>
            openPicker({
              title: "Occupation / Profession",
              options: OCCUPATION_OPTIONS,
              value: occupation,
              onSelect: setOccupation,
            })
          }
        />

        <FieldLabel text="Annual Income" />
        <SelectField
          icon="cash-outline"
          placeholder="Select annual income"
          value={annualIncome}
          onPress={() =>
            openPicker({
              title: "Annual Income",
              options: ANNUAL_INCOME_OPTIONS,
              value: annualIncome,
              onSelect: setAnnualIncome,
            })
          }
        />

        {/* ================= LIFESTYLE PREFERENCES ================= */}
        <SectionHeading text="Lifestyle Preferences" />

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Diet" />
            <SelectField
              icon="restaurant-outline"
              placeholder="Select diet"
              value={diet}
              compact
              onPress={() =>
                openPicker({
                  title: "Diet",
                  options: DIET_OPTIONS,
                  value: diet,
                  onSelect: setDiet,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Location Preference" />
            <SelectField
              icon="location-outline"
              placeholder="Select location preference"
              value={locationPreference}
              compact
              onPress={() =>
                openPicker({
                  title: "Location Preference",
                  options: LOCATION_PREFERENCE_OPTIONS,
                  value: locationPreference,
                  onSelect: setLocationPreference,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Ready to Relocate" />
        <SelectField
          icon="airplane-outline"
          placeholder="Select preference"
          value={readyToRelocate}
          onPress={() =>
            openPicker({
              title: "Ready to Relocate",
              options: READY_TO_RELOCATE_OPTIONS,
              value: readyToRelocate,
              onSelect: setReadyToRelocate,
            })
          }
        />

        {/* ================= ABOUT PARTNER ================= */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>About Partner</Text>
          <Text style={styles.sectionHeadingOptional}> (Optional)</Text>
        </View>

        <View style={styles.textAreaRow}>
          <Ionicons
            name="pencil-outline"
            size={17}
            color={Colors.primaryRed}
            style={styles.textAreaIcon}
          />
          <TextInput
            style={styles.textArea}
            value={aboutPartner}
            onChangeText={(text) => {
              if (text.length <= ABOUT_PARTNER_MAX_LENGTH) {
                setAboutPartner(text);
              }
            }}
            placeholder="Write about the kind of partner you are looking for..."
            placeholderTextColor={Colors.placeholder}
            multiline
            textAlignVertical="top"
            maxLength={ABOUT_PARTNER_MAX_LENGTH}
          />
        </View>
        <Text style={styles.charCount}>
          {aboutPartner.length}/{ABOUT_PARTNER_MAX_LENGTH}
        </Text>

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
function SectionHeading({ text }) {
  return (
    <View style={styles.sectionHeadingBlock}>
      <Text style={styles.sectionHeading}>{text}</Text>
      <View style={styles.sectionHeadingUnderlineRow}>
        <View style={styles.sectionHeadingUnderline} />
        <View style={styles.sectionHeadingUnderlineDot} />
      </View>
    </View>
  );
}

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
// user taps "Done" to confirm). Every field on this screen is single-select
// today; multiSelect is wired up for parity with the other onboarding
// screens in case a future field (e.g. multiple acceptable castes) needs it.
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
    fontSize: FontSizes.welcome,
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
  sectionHeadingBlock: {
    marginBottom: 14,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  sectionHeadingUnderlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sectionHeadingUnderline: {
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.goldLight,
  },
  sectionHeadingUnderlineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.goldLight,
    marginLeft: 3,
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

  /* ===== INPUT ICON ===== */
  inputIcon: {
    marginRight: 8,
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

  /* ===== TEXT AREA (About Partner) ===== */
  textAreaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 110,
    backgroundColor: Colors.cardBackground,
  },
  textAreaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    minHeight: 86,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 6,
    marginBottom: 20,
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
