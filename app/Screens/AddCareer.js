import { useCallback, useState } from "react";

import {
  BackHandler,
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";

import Fonts from "../constants/Fonts";
import { addMemberCareer } from "../utils/Functions";

const COLORS = {
  background: "#F4F5F7",
  white: "#FFFFFF",

  text: "#333333",
  label: "#666666",
  placeholder: "#777777",

  border: "#E6E6E6",

  red: "#E91E32",
  lightRed: "#FFF0F2",

  checkbox: "#E91E32",
};

export default function AddCareer() {
  const navigation = useNavigation();

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

  /* ============================================================
     HARDWARE BACK BUTTON
     Same useFocusEffect + BackHandler pattern used on the other
     screens: active only while this screen is focused, cleaned
     up on blur/unmount.
  ============================================================ */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const handleSaveCareer = async () => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      // ================================================
      // GET TOKEN
      // ================================================

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("=================================");

      console.log("SAVE CAREER BUTTON CLICKED");

      console.log("TOKEN EXISTS:", !!accessToken);

      console.log("=================================");

      if (!accessToken) {
        throw new Error("Access token is missing. Please login again.");
      }

      // ================================================
      // PREPARE CAREER DATA
      // ================================================

      const careerData = {
        company: String(company || "").trim(),

        designation: String(designation || "").trim(),

        start: Number(startYear),

        end: Number(endYear),
      };

      console.log("CAREER DATA:", JSON.stringify(careerData, null, 2));

      // ================================================
      // CALL POST API
      // ================================================

      const response = await addMemberCareer(accessToken, careerData);

      console.log("CAREER POST RESPONSE:", JSON.stringify(response, null, 2));

      // ================================================
      // SUCCESS
      // ================================================

      if (
        response?.success === 1 ||
        response?.result === true ||
        response?.statusCode === 200 ||
        response?.statusCode === 201
      ) {
        alert("Career added successfully.");

        // Go back to Career Information
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        {/* =================================================
                    HEADER
                ================================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={16} color={COLORS.red} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Career</Text>

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <Feather name="more-vertical" size={16} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        {/* =================================================
                    MAIN CARD
                ================================================= */}

        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* =================================================
                            ROW 1
                        ================================================= */}

            <View style={styles.twoColumnRow}>
              {/* DESIGNATION */}

              <View style={styles.column}>
                <Text style={styles.label}>
                  Designation
                  <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  style={styles.input}
                  value={designation}
                  onChangeText={setDesignation}
                  placeholder="Designation"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              {/* COMPANY */}

              <View style={styles.column}>
                <Text style={styles.label}>
                  Company
                  <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="Company"
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>
            </View>

            {/* =================================================
                            ROW 2
                        ================================================= */}

            <View style={styles.twoColumnRow}>
              {/* START YEAR */}

              <View style={styles.column}>
                <Text style={styles.label}>
                  Start Year
                  <Text style={styles.required}>*</Text>
                </Text>

                <TouchableOpacity
                  style={styles.selectInput}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectText}>{startYear}</Text>

                  <Feather name="chevron-down" size={11} color="#888888" />
                </TouchableOpacity>
              </View>

              {/* END YEAR */}

              <View style={styles.column}>
                <Text style={styles.label}>End Year</Text>

                <TouchableOpacity
                  style={styles.selectInput}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectText}>{endYear}</Text>

                  <Feather name="chevron-down" size={11} color="#888888" />
                </TouchableOpacity>
              </View>
            </View>

            {/* =================================================
                            CURRENTLY WORKING
                        ================================================= */}

            <View style={styles.currentlyWorkingRow}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  currentlyWorking && styles.checkboxSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setCurrentlyWorking(!currentlyWorking)}
              >
                {currentlyWorking && (
                  <Feather name="check" size={10} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <Text style={styles.currentlyWorkingText}>
                I am currently working here
              </Text>
            </View>

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
                style={[
                  styles.saveButton,
                  saving && {
                    opacity: 0.6,
                  },
                ]}
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
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =====================================================
       SAFE AREA
    ===================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* =====================================================
       SCREEN
    ===================================================== */

  screen: {
    flex: 1,

    backgroundColor: COLORS.background,

    paddingHorizontal: 3,

    paddingTop: 3,

    paddingBottom: 3,
  },

  /* =====================================================
       HEADER
    ===================================================== */

  header: {
    width: "100%",

    height: 51,

    backgroundColor: COLORS.white,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    position: "relative",

    borderTopLeftRadius: 7,

    borderTopRightRadius: 7,

    borderWidth: 1,

    borderColor: "#E7E7E7",
  },

  /* =====================================================
       BACK BUTTON
    ===================================================== */

  backButton: {
    position: "absolute",

    left: 5,

    top: 10,

    width: 30,

    height: 30,

    borderRadius: 12,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#EEEEEE",

    alignItems: "center",

    justifyContent: "center",
  },

  /* =====================================================
       HEADER TITLE
    ===================================================== */

  headerTitle: {
    fontSize: 20,

    lineHeight: 12,

    fontFamily: Fonts.semiBold,

    color: "#222222",

    includeFontPadding: false,

    textAlign: "center",
  },

  /* =====================================================
       MENU
    ===================================================== */

  menuButton: {
    position: "absolute",

    right: 5,

    top: 3,

    width: 22,

    height: 24,

    alignItems: "center",

    justifyContent: "center",
  },

  /* =====================================================
       CARD
    ===================================================== */

  card: {
    flex: 1,

    width: "100%",

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderTopWidth: 0,

    borderColor: "#E7E7E7",

    borderBottomLeftRadius: 7,

    borderBottomRightRadius: 7,

    overflow: "hidden",
  },

  /* =====================================================
       SCROLL CONTENT
    ===================================================== */

  scrollContent: {
    paddingHorizontal: 9,

    paddingTop: 7,

    paddingBottom: 6,
  },

  /* =====================================================
       TWO COLUMN ROW
    ===================================================== */

  twoColumnRow: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 30,
  },

  /* =====================================================
       COLUMN
    ===================================================== */

  column: {
    width: "48.5%",
  },

  /* =====================================================
       LABEL
    ===================================================== */

  label: {
    fontSize: 15,

    lineHeight: 9,

    fontFamily: Fonts.bold,

    color: "#555555",

    marginBottom: 20,
    marginTop: 30,

    includeFontPadding: false,
  },

  /* =====================================================
       REQUIRED
    ===================================================== */

  required: {
    color: COLORS.red,

    fontSize: 9.5,

    fontFamily: Fonts.medium,
  },

  /* =====================================================
       SMALL INPUT
    ===================================================== */

  input: {
    fontFamily: Fonts.regular,
    width: "100%",

    height: 24,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 5,

    paddingHorizontal: 7,

    paddingVertical: 0,

    fontSize: 13,

    lineHeight: 9,

    color: "#3b3a3a",

    includeFontPadding: false,
  },

  /* =====================================================
       SELECT INPUT
    ===================================================== */

  selectInput: {
    width: "100%",

    height: 24,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 5,

    paddingHorizontal: 7,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  /* =====================================================
       SELECT TEXT
    ===================================================== */

  selectText: {
    fontFamily: Fonts.regular,
    flex: 1,

    fontSize: 13,

    lineHeight: 9,

    color: "#555555",

    includeFontPadding: false,
  },

  /* =====================================================
       CURRENTLY WORKING
    ===================================================== */

  currentlyWorkingRow: {
    width: "48.5%",

    marginLeft: "51.5%",

    height: 17,

    flexDirection: "row",

    alignItems: "center",

    marginTop: -2,

    marginBottom: 4,
  },

  /* =====================================================
       CHECKBOX
    ===================================================== */

  checkbox: {
    width: 18,

    height: 18,

    borderRadius: 2,

    borderWidth: 1,

    borderColor: "#D0D0D0",

    backgroundColor: "#FFFFFF",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 4,
  },

  /* =====================================================
       CHECKBOX SELECTED
    ===================================================== */

  checkboxSelected: {
    backgroundColor: COLORS.checkbox,

    borderColor: COLORS.checkbox,
  },

  /* =====================================================
       CURRENTLY WORKING TEXT
    ===================================================== */

  currentlyWorkingText: {
    fontFamily: Fonts.regular,
    fontSize: 12,

    lineHeight: 7,

    color: "#3b3b3b",

    includeFontPadding: false,
  },

  /* =====================================================
       FULL WIDTH FIELD
    ===================================================== */

  fullField: {
    width: "100%",

    marginBottom: 20,
  },

  /* =====================================================
       FULL INPUT
    ===================================================== */

  fullInput: {
    fontFamily: Fonts.regular,
    width: "100%",

    height: 34,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 5,

    paddingHorizontal: 17,

    paddingVertical: 10,

    fontSize: 13,

    lineHeight: 9,

    color: "#555555",

    includeFontPadding: false,
  },

  /* =====================================================
       DESCRIPTION FIELD
    ===================================================== */

  descriptionField: {
    width: "100%",

    marginBottom: 20,
  },

  /* =====================================================
       DESCRIPTION INPUT
    ===================================================== */

  descriptionInput: {
    fontFamily: Fonts.regular,
    width: "100%",

    height: 59,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 5,

    paddingHorizontal: 7,

    paddingTop: 6,

    paddingBottom: 10,

    fontSize: 13,

    lineHeight: 9,

    color: "#3d3c3c",

    includeFontPadding: false,
  },

  /* =====================================================
       BUTTON ROW
    ===================================================== */

  buttonRow: {
    width: "100%",

    height: 29,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginTop: 20,
  },

  /* =====================================================
       CANCEL BUTTON
    ===================================================== */

  cancelButton: {
    width: "38.5%",

    height: 37,

    borderRadius: 5,

    backgroundColor: "#F8DDE1",

    alignItems: "center",

    justifyContent: "center",
  },

  /* =====================================================
       CANCEL TEXT
    ===================================================== */

  cancelText: {
    fontSize: 15,

    lineHeight: 9,

    fontFamily: Fonts.bold,

    color: "#B94A55",

    includeFontPadding: false,
  },

  /* =====================================================
       SAVE BUTTON
    ===================================================== */

  saveButton: {
    width: "38.5%",

    height: 37,

    borderRadius: 5,

    backgroundColor: COLORS.red,

    alignItems: "center",

    justifyContent: "center",
  },

  /* =====================================================
       SAVE TEXT
    ===================================================== */

  saveText: {
    fontSize: 15,

    lineHeight: 9,

    fontFamily: Fonts.semiBold,

    color: "#FFFFFF",

    includeFontPadding: false,
  },
});
