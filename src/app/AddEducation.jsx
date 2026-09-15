import { useState } from "react";

import {
    Alert,
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

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import {
    addMemberEducation,
} from "../utils/Functions";

export default function AddEducation() {

  // =========================================================
  // STATES
  // =========================================================

  const [degree, setDegree] =
    useState("B.Tech");

  const [specialization, setSpecialization] =
    useState("Computer Science");

  const [institution, setInstitution] =
    useState("Gates University");

  const [startYear, setStartYear] =
    useState("2016");

  const [endYear, setEndYear] =
    useState("2020");

  const [status, setStatus] =
    useState("Completed");

  const [saving, setSaving] =
    useState(false);

  const [showStartYears, setShowStartYears] =
    useState(false);

  const [showEndYears, setShowEndYears] =
    useState(false);


  // =========================================================
  // YEAR DATA
  // =========================================================

  const years = [
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
    "2025",
    "2026",
  ];


  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    router.back();
  };


  // =========================================================
  // START YEAR
  // =========================================================

  const handleStartYear = (year) => {
    setStartYear(year);
    setShowStartYears(false);
  };


  // =========================================================
  // END YEAR
  // =========================================================

  const handleEndYear = (year) => {
    setEndYear(year);
    setShowEndYears(false);
  };

// =========================================================
// SAVE EDUCATION
// =========================================================

const handleSave = async () => {

  console.log(
    "======================================"
  );

  console.log(
    "SAVE EDUCATION BUTTON CLICKED"
  );

  // Prevent double click
  if (saving) {
    console.log(
      "Already saving..."
    );
    return;
  }

  try {

    // =====================================================
    // VALIDATION
    // =====================================================

    const cleanDegree =
      String(degree || "").trim();

    const cleanInstitution =
      String(institution || "").trim();

    const cleanStartYear =
      Number(startYear);

    const cleanEndYear =
      Number(endYear);


    console.log(
      "DEGREE:",
      cleanDegree
    );

    console.log(
      "INSTITUTION:",
      cleanInstitution
    );

    console.log(
      "START YEAR:",
      cleanStartYear
    );

    console.log(
      "END YEAR:",
      cleanEndYear
    );


    if (!cleanDegree) {

      Alert.alert(
        "Required",
        "Please enter Degree / Course."
      );

      return;
    }


    if (!cleanInstitution) {

      Alert.alert(
        "Required",
        "Please enter Institution / College."
      );

      return;
    }


    if (
      !Number.isInteger(cleanStartYear) ||
      cleanStartYear <= 0
    ) {

      Alert.alert(
        "Required",
        "Please select a valid Start Year."
      );

      return;
    }


    if (
      !Number.isInteger(cleanEndYear) ||
      cleanEndYear <= 0
    ) {

      Alert.alert(
        "Required",
        "Please select a valid End Year."
      );

      return;
    }


    if (cleanEndYear < cleanStartYear) {

      Alert.alert(
        "Invalid Year",
        "End Year cannot be before Start Year."
      );

      return;
    }


    // =====================================================
    // GET ACCESS TOKEN
    // =====================================================

    const accessToken =
      await AsyncStorage.getItem(
        "access_token"
      );


    console.log(
      "TOKEN EXISTS:",
      !!accessToken
    );


    if (!accessToken) {

      Alert.alert(
        "Session Expired",
        "Please login again."
      );

      return;
    }


    // =====================================================
    // START LOADING
    // =====================================================

    setSaving(true);


    // =====================================================
    // API REQUEST
    // =====================================================

    const payload = {

      degree: cleanDegree,

      institution: cleanInstitution,

      education_start:
        cleanStartYear,

      education_end:
        cleanEndYear,

    };


    console.log(
      "======================================"
    );

    console.log(
      "CALLING ADD EDUCATION API"
    );

    console.log(
      "PAYLOAD:",
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    console.log(
      "======================================"
    );


    const response =
      await addMemberEducation(
        accessToken,
        payload
      );


    // =====================================================
    // API RESPONSE
    // =====================================================

    console.log(
      "ADD EDUCATION RESPONSE:",
      JSON.stringify(
        response,
        null,
        2
      )
    );


    // =====================================================
    // SUCCESS
    // =====================================================

    Alert.alert(
      "Success",
      "Education saved successfully.",
      [
        {
          text: "OK",
          onPress: () => {

            router.back();

          },
        },
      ]
    );

  } catch (error) {

    console.error(
      "======================================"
    );

    console.error(
      "SAVE EDUCATION ERROR:",
      error
    );

    console.error(
      "======================================"
    );


    // =====================================================
    // ERROR MESSAGE
    // =====================================================

    const errorMessage =
      error?.message ||
      "Unable to save education. Please try again.";


    Alert.alert(
      "Error",
      errorMessage
    );

  } finally {

    setSaving(false);

  }
};


  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    router.back();
  };


  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.container}>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.header}>

          {/* BACK */}

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >

            <Ionicons
              name="chevron-back"
              size={19}
              color="#EF233C"
            />

          </TouchableOpacity>


          {/* TITLE */}

          <Text style={styles.headerTitle}>
            Add Education
          </Text>


          {/* MENU */}

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
          >

            <Ionicons
              name="ellipsis-vertical"
              size={19}
              color="#EF233C"
            />

          </TouchableOpacity>

        </View>


        {/* =====================================================
            FORM
        ===================================================== */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ===================================================
              DEGREE / COURSE
          =================================================== */}

          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Degree / Course
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              style={styles.input}
              value={degree}
              onChangeText={setDegree}
              placeholder="Enter degree / course"
              placeholderTextColor="#999999"
            />

          </View>


          {/* ===================================================
              SPECIALIZATION
          =================================================== */}

          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Specialization
            </Text>

            <TextInput
              style={styles.input}
              value={specialization}
              onChangeText={setSpecialization}
              placeholder="Enter specialization"
              placeholderTextColor="#999999"
            />

          </View>


          {/* ===================================================
              INSTITUTION / COLLEGE
          =================================================== */}

          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Institution / College
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              style={styles.input}
              value={institution}
              onChangeText={setInstitution}
              placeholder="Enter institution / college"
              placeholderTextColor="#999999"
            />

          </View>


          {/* ===================================================
              START YEAR + END YEAR
          =================================================== */}

          <View style={styles.yearRow}>

            {/* START YEAR */}

            <View
              style={[
                styles.yearColumn,
                {
                  marginRight: 12,
                },
              ]}
            >

              <Text style={styles.label}>
                Start Year
                <Text style={styles.required}> *</Text>
              </Text>


              <TouchableOpacity
                style={styles.dropdown}
                activeOpacity={0.7}
                onPress={() =>
                  setShowStartYears(
                    !showStartYears
                  )
                }
              >

                <Text
                  style={styles.dropdownText}
                >
                  {startYear}
                </Text>

                <Ionicons
                  name={
                    showStartYears
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={13}
                  color="#8B939E"
                />

              </TouchableOpacity>


              {/* START YEAR LIST */}

              {showStartYears && (

                <View
                  style={
                    styles.dropdownList
                  }
                >

                  <ScrollView
                    nestedScrollEnabled
                    style={
                      styles.dropdownScroll
                    }
                  >

                    {years.map((year) => (

                      <TouchableOpacity
                        key={year}
                        style={
                          styles.dropdownOption
                        }
                        onPress={() =>
                          handleStartYear(
                            year
                          )
                        }
                      >

                        <Text
                          style={
                            styles.optionText
                          }
                        >
                          {year}
                        </Text>

                      </TouchableOpacity>

                    ))}

                  </ScrollView>

                </View>

              )}

            </View>


            {/* END YEAR */}

            <View
              style={styles.yearColumn}
            >

              <Text style={styles.label}>
                End Year
                <Text style={styles.required}> *</Text>
              </Text>


              <TouchableOpacity
                style={styles.dropdown}
                activeOpacity={0.7}
                onPress={() =>
                  setShowEndYears(
                    !showEndYears
                  )
                }
              >

                <Text
                  style={styles.dropdownText}
                >
                  {endYear}
                </Text>

                <Ionicons
                  name={
                    showEndYears
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={13}
                  color="#8B939E"
                />

              </TouchableOpacity>


              {/* END YEAR LIST */}

              {showEndYears && (

                <View
                  style={
                    styles.dropdownList
                  }
                >

                  <ScrollView
                    nestedScrollEnabled
                    style={
                      styles.dropdownScroll
                    }
                  >

                    {years.map((year) => (

                      <TouchableOpacity
                        key={year}
                        style={
                          styles.dropdownOption
                        }
                        onPress={() =>
                          handleEndYear(
                            year
                          )
                        }
                      >

                        <Text
                          style={
                            styles.optionText
                          }
                        >
                          {year}
                        </Text>

                      </TouchableOpacity>

                    ))}

                  </ScrollView>

                </View>

              )}

            </View>

          </View>


          {/* ===================================================
              STATUS
          =================================================== */}

          <View
            style={styles.statusSection}
          >

            <Text style={styles.label}>
              Status
            </Text>


            <View
              style={styles.radioRow}
            >

              {/* COMPLETED */}

              <TouchableOpacity
                style={styles.radioOption}
                activeOpacity={0.7}
                onPress={() =>
                  setStatus("Completed")
                }
              >

                <View
                  style={[
                    styles.radioOuter,
                    status === "Completed" &&
                      styles.radioSelected,
                  ]}
                >

                  {status ===
                    "Completed" && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}

                </View>

                <Text
                  style={styles.radioText}
                >
                  Completed
                </Text>

              </TouchableOpacity>


              {/* PURSUING */}

              <TouchableOpacity
                style={styles.radioOption}
                activeOpacity={0.7}
                onPress={() =>
                  setStatus("Pursuing")
                }
              >

                <View
                  style={[
                    styles.radioOuter,
                    status === "Pursuing" &&
                      styles.radioSelected,
                  ]}
                >

                  {status ===
                    "Pursuing" && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}

                </View>

                <Text
                  style={styles.radioText}
                >
                  Pursuing
                </Text>

              </TouchableOpacity>


              {/* DISCONTINUED */}

              <TouchableOpacity
                style={styles.radioOption}
                activeOpacity={0.7}
                onPress={() =>
                  setStatus("Discontinued")
                }
              >

                <View
                  style={[
                    styles.radioOuter,
                    status ===
                      "Discontinued" &&
                      styles.radioSelected,
                  ]}
                >

                  {status ===
                    "Discontinued" && (
                    <View
                      style={
                        styles.radioInner
                      }
                    />
                  )}

                </View>

                <Text
                  style={styles.radioText}
                >
                  Discontinued
                </Text>

              </TouchableOpacity>

            </View>

          </View>


          {/* ===================================================
              BUTTONS
          =================================================== */}

          <View
            style={styles.buttonRow}
          >

            {/* CANCEL */}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
            >

              <Text
                style={styles.cancelText}
              >
                Cancel
              </Text>

            </TouchableOpacity>


            {/* SAVE */}

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >

              <Text
                style={styles.saveText}
              >
                {saving
                  ? "Saving..."
                  : "Save Education"}
              </Text>

            </TouchableOpacity>

          </View>

        </ScrollView>

      </View>

    </SafeAreaView>
  );
}


/* =============================================================
   STYLES
============================================================= */

const styles = StyleSheet.create({

  /* ===========================================================
     MAIN
  =========================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },


  /* ===========================================================
     HEADER
  =========================================================== */

  header: {
    height: 53,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderBottomWidth: 1,

    borderBottomColor: "#F0F0F0",

    position: "relative",
  },

  backButton: {
    position: "absolute",

    left: 8,

    width: 31,

    height: 31,

    borderRadius: 16,

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor: "#EEEEEE",

    backgroundColor: "#FFFFFF",
  },

  headerTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: "#222222",

    includeFontPadding: false,
  },

  menuButton: {
    position: "absolute",

    right: 7,

    width: 30,

    height: 32,

    alignItems: "center",

    justifyContent: "center",
  },


  /* ===========================================================
     SCROLL
  =========================================================== */

  scrollView: {
    flex: 1,

    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingHorizontal: 21,

    paddingTop: 8,

    paddingBottom: 20,
  },


  /* ===========================================================
     FORM FIELD
  =========================================================== */

  fieldContainer: {
    width: "100%",

    marginBottom: 40,
    marginTop:20,
  },

  label: {
    fontSize: 18,

    lineHeight: 11,

    color: "#4B5563",

    fontWeight: "400",

    marginBottom: 16,

    includeFontPadding: false,
  },

  required: {
    color: "#EF233C",

    fontWeight: "700",
  },


  /* ===========================================================
     INPUT
  =========================================================== */

  input: {
    width: "100%",

    height: 30,

    borderWidth: 1,

    borderColor: "#E7EAEE",

    borderRadius: 7,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 9,

    paddingVertical: 0,

    fontSize: 14,

    color: "#4B5563",

    includeFontPadding: false,
  },


  /* ===========================================================
     YEAR ROW
  =========================================================== */

  yearRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "flex-start",

    marginTop: 1,

    marginBottom: 17,
  },

  yearColumn: {
    flex: 1,

    position: "relative",
  },


  /* ===========================================================
     DROPDOWN
  =========================================================== */

  dropdown: {
    height: 30,

    width: "100%",

    borderWidth: 1,

    borderColor: "#E7EAEE",

    borderRadius: 7,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 9,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",
  },

  dropdownText: {
    fontSize: 12,

    color: "#4B5563",

    includeFontPadding: false,
  },


  /* ===========================================================
     DROPDOWN LIST
  =========================================================== */

  dropdownList: {
    position: "absolute",

    top: 47,

    left: 0,

    right: 0,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E4E7EB",

    borderRadius: 7,

    zIndex: 100,

    elevation: 5,

    overflow: "hidden",
  },

  dropdownScroll: {
    maxHeight: 130,
  },

  dropdownOption: {
    height: 27,

    paddingHorizontal: 9,

    justifyContent: "center",

    borderBottomWidth: 1,

    borderBottomColor: "#F4F4F4",
  },

  optionText: {
    fontSize: 13,

    color: "#4B5563",

    includeFontPadding: false,
  },


  /* ===========================================================
     STATUS
  =========================================================== */

  statusSection: {
    width: "100%",

    marginTop: 15,

    marginBottom: 11,
  },

  radioRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "flex-start",
  },

  radioOption: {
    flexDirection: "row",

    alignItems: "center",

    marginRight: 14,
  },

  radioOuter: {
    width: 16,

    height: 16,

    borderRadius: 7,

    borderWidth: 1,

    borderColor: "#D9DEE5",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 4,
  },

  radioSelected: {
    borderColor: "#EF233C",
  },

  radioInner: {
    width: 7,

    height: 7,

    borderRadius: 4,

    backgroundColor: "#EF233C",
  },

  radioText: {
    fontSize: 13,

    color: "#555E6A",

    includeFontPadding: false,
  },


  /* ===========================================================
     BUTTON ROW
  =========================================================== */

  buttonRow: {
    width: "100%",

    flexDirection: "row",

    alignItems: "center",

    marginTop: 30,
  },


  /* ===========================================================
     CANCEL
  =========================================================== */

  cancelButton: {
    flex: 1,

    height: 37,

    borderRadius: 6,

    backgroundColor: "#FFF0F2",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 8,
  },

  cancelText: {
    fontSize: 18,

    fontWeight: "600",

    color: "#E91E35",

    includeFontPadding: false,
  },


  /* ===========================================================
     SAVE
  =========================================================== */

  saveButton: {
    flex: 1.3,

    height: 37,

    borderRadius: 6,

    backgroundColor: "#E91E35",

    alignItems: "center",

    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    fontSize: 18,

    fontWeight: "700",

    color: "#FFFFFF",

    includeFontPadding: false,
  },

});