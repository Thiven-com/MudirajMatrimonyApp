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

const JOB_DESCRIPTION_MAX_LENGTH = 300;
const CURRENT_YEAR = new Date().getFullYear();

// ================= OPTION LISTS =================
const EMPLOYMENT_STATUS_OPTIONS = [
  "Employed",
  "Business Owner",
  "Self Employed",
  "Not Working",
  "Student",
  "Retired",
];

const OCCUPATION_OPTIONS = [
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
  "Pilot / Aviation",
  "Merchant Navy",
  "Defence Personnel",
  "Scientist / Researcher",
  "Artist / Actor",
  "Farmer",
  "Homemaker",
  "Other",
];

const INDUSTRY_OPTIONS = [
  "Information Technology",
  "Banking & Finance",
  "Healthcare & Pharma",
  "Education",
  "Government / Public Sector",
  "Manufacturing",
  "Retail & E-commerce",
  "Real Estate & Construction",
  "Media & Entertainment",
  "Hospitality & Travel",
  "Legal Services",
  "Agriculture",
  "Telecommunications",
  "Automotive",
  "Energy & Utilities",
  "Non-Profit / NGO",
  "Other",
];

// Reused for both Work Location and Business Location.
const LOCATION_OPTIONS = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Kochi",
  "Lucknow",
  "Surat",
  "Nagpur",
  "Indore",
  "Other (India)",
  "Outside India",
];

const ANNUAL_INCOME_OPTIONS = [
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
  "Prefer not to say",
];

const INCOME_CURRENCY_OPTIONS = [
  "INR",
  "USD",
  "GBP",
  "EUR",
  "AED",
  "CAD",
  "AUD",
  "SGD",
];

const WORK_EXPERIENCE_OPTIONS = [
  "Fresher / 0 years",
  "1 - 2 years",
  "3 - 5 years",
  "6 - 10 years",
  "11 - 15 years",
  "16 - 20 years",
  "20+ years",
];

const WORK_TYPE_OPTIONS = [
  "Full Time",
  "Part Time",
  "Contract",
  "Freelance",
  "Internship",
];

const BUSINESS_TYPE_OPTIONS = [
  "Proprietorship",
  "Partnership",
  "Private Limited",
  "Public Limited",
  "LLP",
  "Family Business",
  "Other",
];

const BUSINESS_SINCE_YEAR_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  String(CURRENT_YEAR - i),
);

export default function CareerScreen() {
  const router = useRouter();

  // Work Details
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [occupation, setOccupation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [incomeCurrency, setIncomeCurrency] = useState("INR");
  const [jobTitle, setJobTitle] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [workType, setWorkType] = useState("");

  // Business Details
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessSinceYear, setBusinessSinceYear] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");

  // Additional Information
  const [jobDescription, setJobDescription] = useState("");

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
    console.log("Saving career details...", {
      employmentStatus,
      occupation,
      companyName,
      industry,
      workLocation,
      annualIncome,
      incomeCurrency,
      jobTitle,
      workExperience,
      workType,
      businessType,
      businessName,
      businessSinceYear,
      businessLocation,
      jobDescription,
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

          <Text style={styles.headerTitle}>Career</Text>

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
            <Ionicons name="briefcase" size={20} color={Colors.primaryRed} />
          </View>
          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>
              Tell us about your professional life
            </Text>
            <Text style={styles.introSubtitle}>
              This information helps in finding the right match for you.
            </Text>
          </View>
        </View>

        {/* ================= WORK DETAILS ================= */}
        <Text style={styles.sectionHeading}>Work Details</Text>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Employment Status" required />
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
          <View style={styles.colHalf}>
            <FieldLabel text="Occupation / Profession" required />
            <SelectField
              icon="person-outline"
              placeholder="Select occupation"
              value={occupation}
              compact
              onPress={() =>
                openPicker({
                  title: "Occupation / Profession",
                  options: OCCUPATION_OPTIONS,
                  value: occupation,
                  onSelect: setOccupation,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Company / Organization Name" required />
        <View style={styles.inputRow}>
          <Ionicons
            name="business-outline"
            size={17}
            color={Colors.primaryRed}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Enter company / organization name"
            placeholderTextColor={Colors.placeholder}
          />
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Industry" required />
            <SelectField
              icon="stats-chart-outline"
              placeholder="Select industry"
              value={industry}
              compact
              onPress={() =>
                openPicker({
                  title: "Industry",
                  options: INDUSTRY_OPTIONS,
                  value: industry,
                  onSelect: setIndustry,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Work Location" required />
            <SelectField
              icon="location-outline"
              placeholder="Select work location"
              value={workLocation}
              compact
              onPress={() =>
                openPicker({
                  title: "Work Location",
                  options: LOCATION_OPTIONS,
                  value: workLocation,
                  onSelect: setWorkLocation,
                })
              }
            />
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Annual Income" required />
            <SelectField
              icon="cash-outline"
              placeholder="Select annual income"
              value={annualIncome}
              compact
              onPress={() =>
                openPicker({
                  title: "Annual Income",
                  options: ANNUAL_INCOME_OPTIONS,
                  value: annualIncome,
                  onSelect: setAnnualIncome,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Income Currency" />
            <SelectField
              icon="cash-outline"
              placeholder="Select currency"
              value={incomeCurrency}
              compact
              onPress={() =>
                openPicker({
                  title: "Income Currency",
                  options: INCOME_CURRENCY_OPTIONS,
                  value: incomeCurrency,
                  onSelect: setIncomeCurrency,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Job Title / Designation" />
        <View style={styles.inputRow}>
          <Ionicons
            name="id-card-outline"
            size={17}
            color={Colors.primaryRed}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="Enter job title / designation"
            placeholderTextColor={Colors.placeholder}
          />
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Work Experience (In Years)" required />
            <SelectField
              icon="time-outline"
              placeholder="Select experience"
              value={workExperience}
              compact
              onPress={() =>
                openPicker({
                  title: "Work Experience",
                  options: WORK_EXPERIENCE_OPTIONS,
                  value: workExperience,
                  onSelect: setWorkExperience,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Work Type" />
            <SelectField
              icon="people-outline"
              placeholder="Select work type"
              value={workType}
              compact
              onPress={() =>
                openPicker({
                  title: "Work Type",
                  options: WORK_TYPE_OPTIONS,
                  value: workType,
                  onSelect: setWorkType,
                })
              }
            />
          </View>
        </View>

        {/* ================= BUSINESS DETAILS ================= */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>Business Details</Text>
          <Text style={styles.sectionHeadingOptional}> (Optional)</Text>
        </View>

        <View style={styles.sectionCard}>
          <FieldLabel text="Business Type" />
          <SelectField
            icon="storefront-outline"
            placeholder="Select business type"
            value={businessType}
            compact
            onPress={() =>
              openPicker({
                title: "Business Type",
                options: BUSINESS_TYPE_OPTIONS,
                value: businessType,
                onSelect: setBusinessType,
              })
            }
          />

          <View style={styles.rowTwoCol}>
            <View style={styles.colHalf}>
              <FieldLabel text="Business Name" />
              <View style={[styles.inputRow, styles.inputRowCompact]}>
                <Ionicons
                  name="business-outline"
                  size={16}
                  color={Colors.primaryRed}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="Enter business name"
                  placeholderTextColor={Colors.placeholder}
                />
              </View>
            </View>
            <View style={styles.colHalf}>
              <FieldLabel text="Since (Year)" />
              <SelectField
                icon="calendar-outline"
                placeholder="Select year"
                value={businessSinceYear}
                compact
                onPress={() =>
                  openPicker({
                    title: "Business Since (Year)",
                    options: BUSINESS_SINCE_YEAR_OPTIONS,
                    value: businessSinceYear,
                    onSelect: setBusinessSinceYear,
                  })
                }
              />
            </View>
          </View>

          <FieldLabel text="Business Location" />
          <SelectField
            icon="location-outline"
            placeholder="Select business location"
            value={businessLocation}
            compact
            onPress={() =>
              openPicker({
                title: "Business Location",
                options: LOCATION_OPTIONS,
                value: businessLocation,
                onSelect: setBusinessLocation,
              })
            }
          />
        </View>

        {/* ================= ADDITIONAL INFORMATION ================= */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>Additional Information</Text>
          <Text style={styles.sectionHeadingOptional}> (Optional)</Text>
        </View>

        <FieldLabel text="Job Description / Key Responsibilities" />
        <View style={styles.textAreaRow}>
          <Ionicons
            name="document-text-outline"
            size={17}
            color={Colors.primaryRed}
            style={styles.textAreaIcon}
          />
          <TextInput
            style={styles.textArea}
            value={jobDescription}
            onChangeText={(text) => {
              if (text.length <= JOB_DESCRIPTION_MAX_LENGTH) {
                setJobDescription(text);
              }
            }}
            placeholder="Enter your job description"
            placeholderTextColor={Colors.placeholder}
            multiline
            textAlignVertical="top"
            maxLength={JOB_DESCRIPTION_MAX_LENGTH}
          />
        </View>
        <Text style={styles.charCount}>
          {jobDescription.length}/{JOB_DESCRIPTION_MAX_LENGTH}
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
// user taps "Done" to confirm). None of the Career fields use multi-select
// today, but the option is wired up for parity with the Education screen
// and for any future field (e.g. a multi-select "Skills" list).
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

  /* ===== TEXT AREA (Job Description) ===== */
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
