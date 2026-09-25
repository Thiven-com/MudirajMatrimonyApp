import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";

import Feather from "react-native-vector-icons/Feather";
import Fonts from "../constants/Fonts";

import {
  getMemberCareerById,
  updateMemberCareerById,
} from "../utils/Functions";

// ===
// COLORS
// ===

const COLORS = {
  background: "#FFFFFF",
  white: "#FFFFFF",

  text: "#1F1F1F",
  label: "#6B6B6B",
  secondary: "#666666",
  placeholder: "#A0A0A0",

  border: "#E6E6E6",
  fieldBg: "#FAFAFA",

  red: "#EF3340",
  iconBg: "#FDEDEE",
  bannerBg: "#FDEFF0",
  bannerIconBg: "#FBE1E3",
  clearBg: "#FDE9EB",
  backBg: "#F1F1F3",

  overlay: "rgba(0,0,0,0.4)",
};

// ===
// DROPDOWN OPTIONS
// (replace with your API / master data when available)
// ===

const OCCUPATION_OPTIONS = [
  "Software Engineer",
  "Doctor",
  "Teacher",
  "Accountant",
  "Civil Engineer",
  "Mechanical Engineer",
  "Business Owner",
  "Government Employee",
  "Lawyer",
  "Designer",
  "Other",
];

const INDUSTRY_OPTIONS = [
  "Information Technology",
  "Healthcare",
  "Education",
  "Banking & Finance",
  "Manufacturing",
  "Construction",
  "Retail",
  "Government",
  "Media & Entertainment",
  "Other",
];

const LOCATION_OPTIONS = [
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Mumbai, Maharashtra",
  "Pune, Maharashtra",
  "Delhi, NCR",
  "Kolkata, West Bengal",
  "Ahmedabad, Gujarat",
  "Kochi, Kerala",
  "Visakhapatnam, Andhra Pradesh",
];

const WORK_MODE_OPTIONS = ["On-site", "Remote", "Hybrid"];

const INCOME_OPTIONS = [
  "Below 3 LPA",
  "3 - 5 LPA",
  "5 - 10 LPA",
  "10 - 15 LPA",
  "15 - 25 LPA",
  "25 - 50 LPA",
  "Above 50 LPA",
];

const ABOUT_MAX_LENGTH = 500;

// ===
// FIELD ROW  (icon circle + label + control)
// ===

function FieldRow({ icon, label, required, children }) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.iconCircle}>{icon}</View>

      <View style={styles.fieldBody}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>

        {children}
      </View>
    </View>
  );
}

// ===
// SELECT FIELD  (dropdown that opens a bottom sheet)
// ===

function SelectField({
  value,
  placeholder,
  options,
  onSelect,
  title,
  disabled = false,
  searchable = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // If the saved value isn't in the list, still show it as an option
  const allOptions = useMemo(() => {
    if (value && !options.includes(value)) {
      return [value, ...options];
    }

    return options;
  }, [options, value]);
  const filtered = useMemo(() => {
    if (!query.trim()) return allOptions;

    return allOptions.filter((item) =>
      item.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [allOptions, query]);
  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <TouchableOpacity
        style={styles.inputBox}
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[styles.inputText, !value && styles.placeholderText]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>

        <Feather name="chevron-down" size={20} color={COLORS.text} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <Pressable style={styles.modalOverlay} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => { }}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>{title}</Text>

            {searchable && (
              <View style={styles.searchBox}>
                <Feather name="search" size={18} color={COLORS.placeholder} />

                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor={COLORS.placeholder}
                  value={query}
                  onChangeText={setQuery}
                />
              </View>
            )}

            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item === value;

                return (
                  <TouchableOpacity
                    style={styles.optionRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(item);
                      close();
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>

                    {selected && (
                      <Feather name="check" size={20} color={COLORS.red} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No results found</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ===
// TEXT FIELD WITH CLEAR (X) BUTTON
// ===

function ClearableInput({ value, onChangeText, placeholder, editable = true }) {
  return (
    <View style={styles.inputBox}>
      <TextInput
        style={[styles.inputText, styles.textInputFlex]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        editable={editable}
      />

      {!!value && editable && (
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => onChangeText("")}
        >
          <Feather name="x" size={22} color="#555555" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ===
// EDIT CAREER
// ===

export default function EditCareer({ navigation, route }) {
  const careerId = route?.params?.id || route?.params?.careerId;
  const [occupation, setOccupation] = useState("");
  const [industry, setIndustry] = useState("");
  const [company, setCompany] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [designation, setDesignation] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [about, setAbout] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      onBackPress();
    }
  }, [navigation]);

  const onBackPress = () => {
    if (saving) {
      return true;
    }

    navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [route, saving]),
  );


  const loadCareer = useCallback(async () => {
    try {
      setLoading(true);

      if (!careerId) {
        Alert.alert("Error", "Career ID is missing.", [
          {
            text: "OK",
            onPress: onBackPress,
          },
        ]);

        return;
      }

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        Alert.alert("Session Expired", "Please login again.", [
          {
            text: "OK",
            onPress: onBackPress,
          },
        ]);

        return;
      }

      // -----------------------------------------
      // GET SINGLE CAREER
      // GET /api/member/career/{id}
      // -----------------------------------------

      console.log("===");

      console.log("EDIT CAREER SCREEN");

      console.log("CAREER ID:", careerId);

      console.log("===");

      const response = await getMemberCareerById(accessToken, careerId);

      console.log("GET SINGLE CAREER RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      // -----------------------------------------
      // NORMALIZE RESPONSE
      // -----------------------------------------

      let careerData = null;

      if (response?.data?.data && typeof response.data.data === "object") {
        careerData = response.data.data;
      } else if (response?.data && typeof response.data === "object") {
        careerData = response.data;
      } else if (response?.career && typeof response.career === "object") {
        careerData = response.career;
      } else if (response && typeof response === "object") {
        careerData = response;
      }

      if (!careerData) {
        throw new Error("Career details not found.");
      }

      setOccupation(String(careerData?.occupation || ""));

      setIndustry(String(careerData?.industry || ""));

      setCompany(
        String(
          careerData?.company ||
          careerData?.company_name ||
          careerData?.companyName ||
          "",
        ),
      );

      setJobLocation(
        String(careerData?.job_location || careerData?.jobLocation || ""),
      );

      setWorkMode(String(careerData?.work_mode || careerData?.workMode || ""));

      setDesignation(
        String(
          careerData?.designation ||
          careerData?.job_title ||
          careerData?.jobTitle ||
          careerData?.position ||
          careerData?.role ||
          "",
        ),
      );

      setAnnualIncome(
        String(careerData?.annual_income || careerData?.annualIncome || ""),
      );

      setAbout(
        String(careerData?.about || careerData?.description || "").slice(
          0,
          ABOUT_MAX_LENGTH,
        ),
      );

      setStart(
        String(
          careerData?.start ||
          careerData?.start_year ||
          careerData?.startYear ||
          careerData?.career_start ||
          "",
        ),
      );

      setEnd(
        String(
          careerData?.end ||
          careerData?.end_year ||
          careerData?.endYear ||
          careerData?.career_end ||
          "",
        ),
      );
    } catch (error) {
      console.error("LOAD CAREER BY ID ERROR:", error);

      Alert.alert("Error", error?.message || "Unable to load career details.");
    } finally {
      setLoading(false);
    }
  }, [careerId, handleBack]);

  useEffect(() => {
    loadCareer();
  }, [loadCareer]);
  const handleClear = () => {
    Alert.alert("Clear Form", "Clear all the details on this screen?", [
      { text: "Cancel", style: "cancel" },

      {
        text: "Clear",
        style: "destructive",

        onPress: () => {
          setOccupation("");
          setIndustry("");
          setCompany("");
          setJobLocation("");
          setWorkMode("");
          setDesignation("");
          setAnnualIncome("");
          setAbout("");
        },
      },
    ]);
  };

  // =======
  // SAVE / UPDATE CAREER
  // PUT /api/member/career/{id}
  // =======

  const handleSave = async () => {
    if (saving) {
      return;
    }

    // -----------------------------------------------------
    // CLEAN VALUES
    // -----------------------------------------------------

    const cleanCompany = String(company || "").trim();

    const cleanDesignation = String(designation || "").trim();

    const cleanAbout = String(about || "").trim();

    // -----------------------------------------------------
    // VALIDATION  (fields marked * in the UI)
    // -----------------------------------------------------

    if (!occupation) {
      Alert.alert("Required", "Please select occupation.");
      return;
    }

    if (!industry) {
      Alert.alert("Required", "Please select industry.");
      return;
    }

    if (!jobLocation) {
      Alert.alert("Required", "Please select job location.");
      return;
    }

    if (!cleanDesignation) {
      Alert.alert("Required", "Please enter designation.");
      return;
    }

    if (!annualIncome) {
      Alert.alert("Required", "Please select annual income.");
      return;
    }

    // -----------------------------------------------------
    // CAREER ID
    // -----------------------------------------------------

    const id = Number(careerId);

    if (!Number.isInteger(id) || id <= 0) {
      Alert.alert("Error", "Valid Career ID is required.");
      return;
    }

    try {
      setSaving(true);

      // -------------------------------------------------
      // GET TOKEN
      // -------------------------------------------------

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        Alert.alert("Session Expired", "Please login again.");

        return;
      }

      // -------------------------------------------------
      // REQUEST BODY
      // -------------------------------------------------

      const startYear = Number(start);

      const endYear = Number(end);

      const body = {
        occupation,

        industry,

        company: cleanCompany,

        job_location: jobLocation,

        work_mode: workMode,

        designation: cleanDesignation,

        annual_income: annualIncome,

        about: cleanAbout,

        // keep existing years unchanged
        ...(Number.isInteger(startYear) && startYear > 0
          ? { start: startYear }
          : {}),

        ...(Number.isInteger(endYear) && endYear > 0 ? { end: endYear } : {}),
      };

      // -------------------------------------------------
      // DEBUG
      // -------------------------------------------------

      console.log("===");

      console.log("UPDATE CAREER BUTTON CLICKED");

      console.log("METHOD: PUT");

      console.log("URL:", `/api/member/career/${id}`);

      console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

      console.log("===");

      // -------------------------------------------------
      // CALL PUT API
      // -------------------------------------------------

      const response = await updateMemberCareerById(accessToken, id, body);

      console.log("CAREER UPDATE RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      Alert.alert("Success", "Career updated successfully.", [
        {
          text: "OK",
          onPress: onBackPress,
        },
      ]);
    } catch (error) {
      console.error("UPDATE CAREER ERROR:", error);

      Alert.alert("Error", error?.message || "Unable to update career.");
    } finally {
      setSaving(false);
    }
  };

  // =======
  // LOADING SCREEN
  // =======

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.red} />

          <Text style={styles.loadingText}>Loading career details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // =======
  // UI
  // =======

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* ====== HEADER ====== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onBackPress}
        >
          <Feather name="chevron-left" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Edit Career Information
        </Text>

        <TouchableOpacity
          style={styles.clearButton}
          activeOpacity={0.8}
          onPress={handleClear}
          disabled={saving}
        >
          <Feather name="trash-2" size={18} color={COLORS.red} />

          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ====== BANNER ====== */}

          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Feather name="briefcase" size={26} color={COLORS.red} />
            </View>

            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerTitle}>Edit Your Career Details</Text>

              <Text style={styles.bannerSubtitle}>
                Update your professional information
              </Text>
            </View>
          </View>

          {/* ====== OCCUPATION ====== */}

          <FieldRow
            label="Occupation"
            required
            icon={<Feather name="briefcase" size={24} color={COLORS.red} />}
          >
            <SelectField
              title="Select Occupation"
              placeholder="Select occupation"
              value={occupation}
              options={OCCUPATION_OPTIONS}
              onSelect={setOccupation}
              disabled={saving}
            />
          </FieldRow>

          {/* ====== INDUSTRY ====== */}

          <FieldRow
            label="Industry"
            required
            icon={<Feather name="grid" size={24} color={COLORS.red} />}
          >
            <SelectField
              title="Select Industry"
              placeholder="Select industry"
              value={industry}
              options={INDUSTRY_OPTIONS}
              onSelect={setIndustry}
              disabled={saving}
            />
          </FieldRow>

          {/* ====== COMPANY ====== */}

          <FieldRow
            label="Company Name"
            icon={<Feather name="home" size={24} color={COLORS.red} />}
          >
            <ClearableInput
              value={company}
              onChangeText={setCompany}
              placeholder="Enter company name"
              editable={!saving}
            />
          </FieldRow>

          {/* ====== JOB LOCATION ====== */}

          <FieldRow
            label="Job Location"
            required
            icon={<Feather name="map-pin" size={24} color={COLORS.red} />}
          >
            <SelectField
              title="Select Job Location"
              placeholder="Select job location"
              value={jobLocation}
              options={LOCATION_OPTIONS}
              onSelect={setJobLocation}
              disabled={saving}
              searchable
            />
          </FieldRow>

          {/* ====== WORK MODE ====== */}

          <FieldRow
            label="Work Mode"
            icon={<Feather name="monitor" size={24} color={COLORS.red} />}
          >
            <SelectField
              title="Select Work Mode"
              placeholder="Select work mode"
              value={workMode}
              options={WORK_MODE_OPTIONS}
              onSelect={setWorkMode}
              disabled={saving}
            />
          </FieldRow>

          {/* ====== DESIGNATION ====== */}

          <FieldRow
            label="Designation"
            required
            icon={<Feather name="user" size={24} color={COLORS.red} />}
          >
            <ClearableInput
              value={designation}
              onChangeText={setDesignation}
              placeholder="Enter designation"
              editable={!saving}
            />
          </FieldRow>

          {/* ====== ANNUAL INCOME ====== */}

          <FieldRow
            label="Annual Income"
            required
            icon={<Feather name="dollar-sign" size={24} color={COLORS.red} />}
          >
            <SelectField
              title="Select Annual Income"
              placeholder="Select annual income"
              value={annualIncome}
              options={INCOME_OPTIONS}
              onSelect={setAnnualIncome}
              disabled={saving}
            />
          </FieldRow>

          {/* ====== ABOUT ====== */}

          <FieldRow
            label="About Your Career"
            icon={<Feather name="file-text" size={24} color={COLORS.red} />}
          >
            <View style={[styles.inputBox, styles.textAreaBox]}>
              <TextInput
                style={[styles.inputText, styles.textArea]}
                value={about}
                onChangeText={(text) =>
                  setAbout(text.slice(0, ABOUT_MAX_LENGTH))
                }
                placeholder="Tell us about your career"
                placeholderTextColor={COLORS.placeholder}
                multiline
                textAlignVertical="top"
                maxLength={ABOUT_MAX_LENGTH}
                editable={!saving}
              />
            </View>

            <Text style={styles.counter}>
              {about.length}/{ABOUT_MAX_LENGTH}
            </Text>
          </FieldRow>
        </ScrollView>

        {/* ====== SAVE BUTTON ====== */}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Feather name="save" size={22} color={COLORS.white} />
            )}

            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ===
// STYLES
// ===

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  // ---------- LOADING ----------

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 10,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
    color: COLORS.secondary,
  },

  // ---------- HEADER ----------

  header: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backBg,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.xl,
    color: COLORS.text,
  },

  clearButton: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.clearBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  clearButtonText: {
    marginLeft: 6,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.base,
    color: COLORS.red,
  },

  // ---------- SCROLL ----------

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // ---------- BANNER ----------

  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bannerBg,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.bannerIconBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  bannerTextWrap: {
    flex: 1,
  },

  bannerTitle: {
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.lg,
    color: COLORS.text,
    marginBottom: 4,
  },

  bannerSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: COLORS.label,
  },

  // ---------- FIELD ROW ----------

  fieldRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    marginTop: 14,
  },

  fieldBody: {
    flex: 1,
  },

  label: {
    fontFamily: Fonts.medium,
    fontSize: Fonts.size.md,
    color: COLORS.label,
    marginBottom: 8,
  },

  required: {
    color: COLORS.red,
    fontFamily: Fonts.bold,
  },

  // ---------- INPUT BOX ----------

  inputBox: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.fieldBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
  },

  inputText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.lg,
    color: COLORS.text,
    paddingVertical: 12,
    includeFontPadding: false,
  },

  textInputFlex: {
    marginRight: 8,
  },

  placeholderText: {
    color: COLORS.placeholder,
  },

  // ---------- TEXT AREA ----------

  textAreaBox: {
    alignItems: "flex-start",
    paddingVertical: 4,
  },

  textArea: {
    minHeight: 96,
    lineHeight: 24,
  },

  counter: {
    alignSelf: "flex-end",
    marginTop: 8,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: COLORS.label,
  },

  // ---------- FOOTER ----------

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: "#F3F3F3",
  },

  saveButton: {
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    marginLeft: 10,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.lg,
    color: COLORS.white,
  },

  // ---------- DROPDOWN SHEET ----------

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: COLORS.overlay,
  },

  sheet: {
    maxHeight: "70%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDDDDD",
    marginBottom: 14,
  },

  sheetTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.lg,
    color: COLORS.text,
    marginBottom: 12,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.fieldBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,
    paddingVertical: 10,
    marginLeft: 8,
    color: COLORS.text,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F3F3",
  },

  optionText: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.base,
    color: COLORS.text,
  },

  optionTextSelected: {
    color: COLORS.red,
    fontFamily: Fonts.semiBold,
  },

  emptyText: {
    textAlign: "center",
    color: COLORS.label,
    paddingVertical: 24,
  },
});
