import { useCallback, useState } from "react";

import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  BackHandler,
  Platform,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { addMemberCareer } from "../utils/Functions";

const COLORS = {
  background: "#F6F7F9",
  white: "#FFFFFF",

  text: "#222222",
  label: "#4A4A4A",
  placeholder: "#999999",

  border: "#DDDDDD",

  red: "#E91E32",
  lightRed: "#FFF0F2",

  checkbox: "#E91E32",

  green: "#039855",
};

export default function AddCareer({ navigation }) {
  const handleBack = useCallback(() => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return undefined;

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack,
      );

      return () => subscription.remove();
    }, [handleBack]),
  );
  /* =========================================================
     FORM STATES
  ========================================================= */

  const [designation, setDesignation] = useState("Manager");

  const [company, setCompany] = useState("Hdfc bank");

  const [startYear, setStartYear] = useState("2021");

  const [endYear, setEndYear] = useState("2025");

  const [currentlyWorking, setCurrentlyWorking] = useState(false);

  const [jobLocation, setJobLocation] = useState("Hyderabad, Telangana");

  const [jobDescription, setJobDescription] = useState(
    "Responsible for team management and operations.",
  );

  const [saving, setSaving] = useState(false);

  /* =========================================================
     YEAR PICKER STATES
  ========================================================= */

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: currentYear - 1970 + 1 }, (_, index) =>
    String(currentYear - index),
  );

  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  const [yearPickerType, setYearPickerType] = useState(null);

  /* =========================================================
     OPEN YEAR PICKER
  ========================================================= */

  const openYearPicker = (type) => {
    setYearPickerType(type);
    setYearPickerVisible(true);
  };

  /* =========================================================
     SELECT YEAR
  ========================================================= */

  const selectYear = (year) => {
    if (yearPickerType === "start") {
      setStartYear(year);

      // If start year is greater than current end year,
      // automatically update end year.
      if (!currentlyWorking && Number(year) > Number(endYear)) {
        setEndYear(year);
      }
    }

    if (yearPickerType === "end") {
      // Do not allow end year before start year
      if (Number(year) < Number(startYear)) {
        return;
      }

      setEndYear(year);
    }

    setYearPickerVisible(false);
    setYearPickerType(null);
  };

  /* =========================================================
     CLOSE YEAR PICKER
  ========================================================= */

  const closeYearPicker = () => {
    setYearPickerVisible(false);
    setYearPickerType(null);
  };

  /* =========================================================
     SAVE CAREER
  ========================================================= */

  const handleSaveCareer = async () => {
    if (saving) {
      return;
    }

    /* -----------------------------
       BASIC VALIDATION
    ----------------------------- */

    if (!designation.trim()) {
      alert("Please enter designation.");
      return;
    }

    if (!company.trim()) {
      alert("Please enter company.");
      return;
    }

    if (!startYear) {
      alert("Please select start year.");
      return;
    }

    if (!currentlyWorking && !endYear) {
      alert("Please select end year.");
      return;
    }

    try {
      setSaving(true);

      /* -----------------------------
         GET TOKEN
      ----------------------------- */

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("=================================");
      console.log("SAVE CAREER BUTTON CLICKED");
      console.log("TOKEN EXISTS:", !!accessToken);
      console.log("=================================");

      if (!accessToken) {
        throw new Error("Access token is missing. Please login again.");
      }

      /* -----------------------------
         CAREER DATA
      ----------------------------- */

      const careerData = {
        company: String(company || "").trim(),

        designation: String(designation || "").trim(),

        start: Number(startYear),

        end: currentlyWorking ? Number(currentYear) : Number(endYear),
      };

      console.log("CAREER DATA:", JSON.stringify(careerData, null, 2));

      /* -----------------------------
         POST API
      ----------------------------- */

      const response = await addMemberCareer(accessToken, careerData);

      console.log("CAREER POST RESPONSE:", JSON.stringify(response, null, 2));

      /* -----------------------------
         SUCCESS
      ----------------------------- */

      if (
        response?.success === 1 ||
        response?.result === true ||
        response?.statusCode === 200 ||
        response?.statusCode === 201
      ) {
        alert("Career added successfully.");

        navigation.goBack();
      } else {
        alert(response?.message || "Unable to add career.");
      }
    } catch (error) {
      console.error("SAVE CAREER ERROR:", error);

      alert(error?.message || "Something went wrong while adding career.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>
          {/* BACK */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={23} color={COLORS.red} />
          </TouchableOpacity>

          {/* TITLE */}

          <Text style={styles.headerTitle}>Add Career</Text>

          {/* MENU */}

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <Feather name="more-vertical" size={20} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        {/* =====================================================
            MAIN CARD
        ===================================================== */}

        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* =================================================
                DESIGNATION + COMPANY
            ================================================= */}

            <View style={styles.twoColumnRow}>
              {/* DESIGNATION */}

              <View style={styles.column}>
                <Text style={styles.label}>
                  Designation
                  <Text style={styles.required}> *</Text>
                </Text>

                <TextInput
                  style={styles.input}
                  value={designation}
                  onChangeText={setDesignation}
                  placeholder="Designation"
                  placeholderTextColor={COLORS.placeholder}
                  returnKeyType="next"
                />
              </View>

              {/* COMPANY */}

              <View style={styles.column}>
                <Text style={styles.label}>
                  Company
                  <Text style={styles.required}> *</Text>
                </Text>

                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="Company"
                  placeholderTextColor={COLORS.placeholder}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* =================================================
                START YEAR + END YEAR
            ================================================= */}

            <View style={styles.twoColumnRow}>
              {/* START YEAR */}

              <View style={styles.column}>
                <Text style={styles.label}>
                  Start Year
                  <Text style={styles.required}> *</Text>
                </Text>

                <TouchableOpacity
                  style={styles.selectInput}
                  activeOpacity={0.8}
                  onPress={() => openYearPicker("start")}
                >
                  <Text style={styles.selectText}>
                    {startYear || "Select year"}
                  </Text>

                  <Feather name="chevron-down" size={18} color="#777777" />
                </TouchableOpacity>
              </View>

              {/* END YEAR */}

              <View style={styles.column}>
                <Text style={styles.label}>End Year</Text>

                <TouchableOpacity
                  style={[
                    styles.selectInput,

                    currentlyWorking && styles.disabledSelect,
                  ]}
                  activeOpacity={0.8}
                  disabled={currentlyWorking}
                  onPress={() => openYearPicker("end")}
                >
                  <Text
                    style={[
                      styles.selectText,

                      currentlyWorking && styles.disabledText,
                    ]}
                  >
                    {currentlyWorking ? "Present" : endYear || "Select year"}
                  </Text>

                  <Feather
                    name="chevron-down"
                    size={18}
                    color={currentlyWorking ? "#BDBDBD" : "#777777"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* =================================================
                CURRENTLY WORKING
            ================================================= */}

            <TouchableOpacity
              style={styles.currentlyWorkingRow}
              activeOpacity={0.8}
              onPress={() => setCurrentlyWorking(!currentlyWorking)}
            >
              <View
                style={[
                  styles.checkbox,

                  currentlyWorking && styles.checkboxSelected,
                ]}
              >
                {currentlyWorking && (
                  <Feather name="check" size={16} color="#FFFFFF" />
                )}
              </View>

              <Text style={styles.currentlyWorkingText}>
                I am currently working here
              </Text>
            </TouchableOpacity>

            {/* =================================================
                JOB LOCATION
            ================================================= */}

            <View style={styles.fullField}>
              <Text style={styles.label}>Job Location</Text>

              <TextInput
                style={styles.fullInput}
                value={jobLocation}
                onChangeText={setJobLocation}
                placeholder="Job Location"
                placeholderTextColor={COLORS.placeholder}
              />
            </View>

            {/* =================================================
                JOB DESCRIPTION
            ================================================= */}

            <View style={styles.descriptionField}>
              <Text style={styles.label}>Job Description</Text>

              <TextInput
                style={styles.descriptionInput}
                value={jobDescription}
                onChangeText={setJobDescription}
                placeholder="Job Description"
                placeholderTextColor={COLORS.placeholder}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <View style={styles.buttonRow}>
              {/* CANCEL */}

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              {/* SAVE */}

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                activeOpacity={0.85}
                disabled={saving}
                onPress={handleSaveCareer}
              >
                <Text style={styles.saveText}>
                  {saving ? "Saving..." : "Save Career"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* =====================================================
            YEAR PICKER MODAL
        ===================================================== */}

        <Modal
          visible={yearPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={closeYearPicker}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.yearPickerContainer}>
              {/* MODAL HEADER */}

              <View style={styles.yearPickerHeader}>
                <Text style={styles.yearPickerTitle}>
                  Select {yearPickerType === "start" ? "Start" : "End"} Year
                </Text>

                <TouchableOpacity
                  onPress={closeYearPicker}
                  style={styles.closeButton}
                >
                  <Feather name="x" size={24} color="#333333" />
                </TouchableOpacity>
              </View>

              {/* YEARS */}

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.yearList}
              >
                {years.map((year) => {
                  const selected =
                    yearPickerType === "start"
                      ? startYear === year
                      : endYear === year;

                  const disabled =
                    yearPickerType === "end" &&
                    Number(year) < Number(startYear);

                  return (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.yearItem,

                        selected && styles.selectedYearItem,

                        disabled && styles.disabledYearItem,
                      ]}
                      disabled={disabled}
                      activeOpacity={0.7}
                      onPress={() => selectYear(year)}
                    >
                      <Text
                        style={[
                          styles.yearItemText,

                          selected && styles.selectedYearText,

                          disabled && styles.disabledYearText,
                        ]}
                      >
                        {year}
                      </Text>

                      {selected && (
                        <Feather
                          name="check"
                          size={21}
                          color={COLORS.red}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     SAFE AREA
  ======================================================= */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* =======================================================
     SCREEN
  ======================================================= */

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    height: 64,

    backgroundColor: COLORS.white,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    borderBottomWidth: 1,

    borderBottomColor: "#EAEAEA",

    position: "relative",
  },

  /* =======================================================
     BACK BUTTON
  ======================================================= */

  backButton: {
    position: "absolute",

    left: 15,

    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: "#E5E5E5",

    alignItems: "center",

    justifyContent: "center",
  },

  /* =======================================================
     HEADER TITLE
  ======================================================= */

  headerTitle: {
    fontSize: 23,

    fontWeight: "700",

    color: COLORS.text,

    textAlign: "center",
  },

  /* =======================================================
     MENU BUTTON
  ======================================================= */

  menuButton: {
    position: "absolute",

    right: 15,

    width: 40,

    height: 40,

    alignItems: "center",

    justifyContent: "center",
  },

  /* =======================================================
     MAIN CARD
  ======================================================= */

  card: {
    flex: 1,

    backgroundColor: COLORS.white,

    marginHorizontal: 8,

    marginTop: 8,

    marginBottom: 8,

    borderRadius: 14,

    borderWidth: 1,

    borderColor: "#E6E6E6",

    overflow: "hidden",
  },

  /* =======================================================
     SCROLL CONTENT
  ======================================================= */

  scrollContent: {
    paddingHorizontal: 18,

    paddingTop: 8,

    paddingBottom: 35,
  },

  /* =======================================================
     TWO COLUMN
  ======================================================= */

  twoColumnRow: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 20,
  },

  /* =======================================================
     COLUMN
  ======================================================= */

  column: {
    width: "48%",
  },

  /* =======================================================
     LABEL
  ======================================================= */

  label: {
    fontSize: 15,

    fontWeight: "700",

    color: COLORS.label,

    marginBottom: 9,
  },

  /* =======================================================
     REQUIRED
  ======================================================= */

  required: {
    color: COLORS.red,

    fontSize: 15,

    fontWeight: "700",
  },

  /* =======================================================
     TEXT INPUT
  ======================================================= */

  input: {
    width: "100%",

    height: 46,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: 8,

    paddingHorizontal: 13,

    fontSize: 15,

    color: COLORS.text,
  },

  /* =======================================================
     YEAR SELECT
  ======================================================= */

  selectInput: {
    width: "100%",

    height: 46,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: 8,

    paddingHorizontal: 13,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  selectText: {
    flex: 1,

    fontSize: 15,

    color: COLORS.text,
  },

  disabledSelect: {
    backgroundColor: "#F5F5F5",

    borderColor: "#E5E5E5",
  },

  disabledText: {
    color: "#999999",
  },

  /* =======================================================
     CURRENTLY WORKING
  ======================================================= */

  currentlyWorkingRow: {
    width: "100%",

    minHeight: 40,

    flexDirection: "row",

    alignItems: "center",

    marginTop: -5,

    marginBottom: 22,
  },

  checkbox: {
    width: 22,

    height: 22,

    borderRadius: 5,

    borderWidth: 1.5,

    borderColor: "#CCCCCC",

    backgroundColor: COLORS.white,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 9,
  },

  checkboxSelected: {
    backgroundColor: COLORS.checkbox,

    borderColor: COLORS.checkbox,
  },

  currentlyWorkingText: {
    flex: 1,

    fontSize: 14,

    color: "#444444",
  },

  /* =======================================================
     FULL FIELD
  ======================================================= */

  fullField: {
    width: "100%",

    marginBottom: 21,
  },

  /* =======================================================
     FULL INPUT
  ======================================================= */

  fullInput: {
    width: "100%",

    height: 46,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: 8,

    paddingHorizontal: 13,

    fontSize: 15,

    color: COLORS.text,
  },

  /* =======================================================
     DESCRIPTION
  ======================================================= */

  descriptionField: {
    width: "100%",

    marginBottom: 25,
  },

  descriptionInput: {
    width: "100%",

    minHeight: 110,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: 8,

    paddingHorizontal: 13,

    paddingTop: 12,

    paddingBottom: 12,

    fontSize: 15,

    color: COLORS.text,

    textAlignVertical: "top",
  },

  /* =======================================================
     BUTTON ROW
  ======================================================= */

  buttonRow: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 2,
  },

  /* =======================================================
     CANCEL
  ======================================================= */

  cancelButton: {
    width: "47%",

    height: 48,

    borderRadius: 8,

    backgroundColor: "#F9DEE2",

    alignItems: "center",

    justifyContent: "center",
  },

  cancelText: {
    fontSize: 16,

    fontWeight: "700",

    color: "#B94A55",
  },

  /* =======================================================
     SAVE
  ======================================================= */

  saveButton: {
    width: "47%",

    height: 48,

    borderRadius: 8,

    backgroundColor: COLORS.red,

    alignItems: "center",

    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.white,
  },

  /* =======================================================
     MODAL OVERLAY
  ======================================================= */

  modalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.45)",

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 24,
  },

  /* =======================================================
     YEAR PICKER
  ======================================================= */

  yearPickerContainer: {
    width: "100%",

    maxHeight: "75%",

    backgroundColor: COLORS.white,

    borderRadius: 16,

    overflow: "hidden",

    elevation: 10,

    shadowColor: "#000",

    shadowOpacity: 0.2,

    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  /* =======================================================
     YEAR PICKER HEADER
  ======================================================= */

  yearPickerHeader: {
    height: 60,

    paddingHorizontal: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "#EEEEEE",
  },

  yearPickerTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.text,
  },

  closeButton: {
    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: "#F5F5F5",

    alignItems: "center",

    justifyContent: "center",
  },

  /* =======================================================
     YEAR LIST
  ======================================================= */

  yearList: {
    padding: 10,
  },

  /* =======================================================
     YEAR ITEM
  ======================================================= */

  yearItem: {
    height: 48,

    paddingHorizontal: 15,

    borderRadius: 8,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 4,
  },

  selectedYearItem: {
    backgroundColor: COLORS.lightRed,
  },

  disabledYearItem: {
    opacity: 0.35,
  },

  yearItemText: {
    fontSize: 16,

    color: COLORS.text,
  },

  selectedYearText: {
    color: COLORS.red,

    fontWeight: "700",
  },

  disabledYearText: {
    color: "#999999",
  },
});
