import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

import Feather from "react-native-vector-icons/Feather";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Fonts from "../constants/Fonts";

import { useNavigation, useRoute } from "@react-navigation/native";

import {
  getMemberEducationById,
  updateMemberEducation,
} from "../utils/Functions";

/* ===
   MAIN COMPONENT
=== */

export default function EditEducation({ navigation, route }) {

  const rawId = route?.params?.id;
  const educationId = Array.isArray(rawId) ? rawId[0] : rawId;

  /* ====
     STATES
  ==== */

  const [degree, setDegree] = useState("");

  const [institution, setInstitution] = useState("");

  const [startYear, setStartYear] = useState("");

  const [endYear, setEndYear] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  /* ====
     BACK
  ==== */

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      onBackPress();
      return true;
    }
  }, [navigation]);

  const onBackPress = () => {
    if (saving) {
      return true;
    }

    navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    return true;
  };

  useEffect(() => {
    const handleHardwareBack = () => {
      if (saving) {
        return true;
      }

      handleBack();

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBack,
    );

    return () => {
      subscription.remove();
    };
  }, [handleBack, saving]);

  /* ====
     LOAD SINGLE EDUCATION
  ==== */

  useEffect(() => {
    if (educationId) {
      loadEducation();
    } else {
      setLoading(false);

      Alert.alert("Error", "Education ID is missing.", [
        {
          text: "OK",
          onPress: handleBack,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [educationId]);

  /* ====
     GET SINGLE EDUCATION API
     GET /api/member/education/{id}
  ==== */

  const loadEducation = async () => {
    try {
      setLoading(true);

      console.log("===");

      console.log("EDIT EDUCATION SCREEN");

      console.log("EDUCATION ID:", educationId);

      console.log("===");

      /* =======
         GET ACCESS TOKEN
      ======= */

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("ACCESS TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        Alert.alert("Login Required", "Please login again.", [
          {
            text: "OK",
            onPress: handleBack,
          },
        ]);

        return;
      }

      /* =======
         VALIDATE ID
      ======= */

      const numericId = Number(educationId);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        Alert.alert("Error", "Invalid education ID.", [
          {
            text: "OK",
            onPress: handleBack,
          },
        ]);

        return;
      }

      /* =======
         CALL GET SINGLE EDUCATION API
      ======= */

      const response = await getMemberEducationById(accessToken, numericId);

      console.log("===");

      console.log("SINGLE EDUCATION RESPONSE");

      console.log(JSON.stringify(response, null, 2));

      console.log("===");

      /* =======
         EXTRACT DATA

         Supports:

         {
           data: {...}
         }

         OR

         {
           result: {...}
         }

         OR

         {...}
      ======= */

      let education = null;

      if (
        response?.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        education = response.data;
      } else if (
        response?.result &&
        typeof response.result === "object" &&
        !Array.isArray(response.result)
      ) {
        education = response.result;
      } else if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
        education = response;
      }

      console.log("EDUCATION OBJECT:", education);

      if (!education) {
        Alert.alert("Not Found", "Education information was not found.");

        return;
      }

      /* =======
         DEGREE
      ======= */

      setDegree(
        String(
          education.degree ??
          education.degree_name ??
          education.qualification ??
          "",
        ),
      );

      /* =======
         INSTITUTION
      ======= */

      setInstitution(
        String(
          education.institution ??
          education.institution_name ??
          education.college ??
          education.college_name ??
          "",
        ),
      );

      /* =======
         START YEAR

         API:
         education_start
      ======= */

      setStartYear(
        String(
          education.education_start ??
          education.start_year ??
          education.startYear ??
          "",
        ),
      );

      /* =======
         END YEAR

         API:
         education_end
      ======= */

      setEndYear(
        String(
          education.education_end ??
          education.end_year ??
          education.endYear ??
          "",
        ),
      );
    } catch (error) {
      console.error("===");

      console.error("GET SINGLE EDUCATION ERROR");

      console.error(error);

      console.error("===");

      Alert.alert(
        "Error",
        error?.message || "Unable to load education information.",
      );
    } finally {
      setLoading(false);
    }
  };
  // ====
  // SAVE / UPDATE EDUCATION
  // PUT /api/member/education/{id}
  // ====

  const handleSave = async () => {
    // -----------------------------------------------------
    // PREVENT DOUBLE CLICK
    // -----------------------------------------------------

    if (saving) {
      return;
    }

    try {
      // ---------------------------------------------------
      // GET TOKEN
      // ---------------------------------------------------

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        Alert.alert(
          "Login Required",
          "Your session has expired. Please login again.",
        );

        return;
      }

      // ---------------------------------------------------
      // VALIDATE EDUCATION ID
      // ---------------------------------------------------

      const numericId = Number(educationId);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        Alert.alert("Error", "Invalid education ID.");

        return;
      }

      // ---------------------------------------------------
      // CLEAN FORM VALUES
      // ---------------------------------------------------

      const cleanDegree = String(degree || "").trim();

      const cleanInstitution = String(institution || "").trim();

      const cleanStartYear = Number(startYear);

      const cleanEndYear = Number(endYear);

      // ---------------------------------------------------
      // DEGREE VALIDATION
      // ---------------------------------------------------

      if (!cleanDegree) {
        Alert.alert("Required", "Please enter Degree / Course.");

        return;
      }

      // ---------------------------------------------------
      // INSTITUTION VALIDATION
      // ---------------------------------------------------

      if (!cleanInstitution) {
        Alert.alert("Required", "Please enter Institution / College.");

        return;
      }

      // ---------------------------------------------------
      // START YEAR VALIDATION
      // ---------------------------------------------------

      if (!Number.isInteger(cleanStartYear) || cleanStartYear <= 0) {
        Alert.alert("Required", "Please enter a valid Start Year.");

        return;
      }

      // ---------------------------------------------------
      // END YEAR VALIDATION
      // ---------------------------------------------------

      if (!Number.isInteger(cleanEndYear) || cleanEndYear <= 0) {
        Alert.alert("Required", "Please enter a valid End Year.");

        return;
      }

      // ---------------------------------------------------
      // YEAR ORDER VALIDATION
      // ---------------------------------------------------

      if (cleanEndYear < cleanStartYear) {
        Alert.alert("Invalid Year", "End Year cannot be before Start Year.");

        return;
      }

      // ---------------------------------------------------
      // START SAVING
      // ---------------------------------------------------

      setSaving(true);

      // ---------------------------------------------------
      // REQUEST BODY
      // ---------------------------------------------------

      const payload = {
        degree: cleanDegree,

        institution: cleanInstitution,

        education_start: cleanStartYear,

        education_end: cleanEndYear,
      };

      // ---------------------------------------------------
      // DEBUG
      // ---------------------------------------------------

      console.log("===");

      console.log("UPDATE EDUCATION SCREEN");

      console.log("METHOD: PUT");

      console.log("EDUCATION ID:", numericId);

      console.log("REQUEST BODY:");

      console.log(JSON.stringify(payload, null, 2));

      console.log("===");

      // ---------------------------------------------------
      // CALL UPDATE API
      // ---------------------------------------------------

      const response = await updateMemberEducation(
        accessToken,
        numericId,
        payload,
      );

      // ---------------------------------------------------
      // DEBUG RESPONSE
      // ---------------------------------------------------

      console.log("===");

      console.log("UPDATE EDUCATION RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      console.log("===");

      // ---------------------------------------------------
      // CHECK RESPONSE
      // ---------------------------------------------------

      const success =
        response?.success === true ||
        response?.success === 1 ||
        response?.result === true ||
        response?.status === true ||
        response?.statusCode === 200 ||
        response?.statusCode === 201;

      // ---------------------------------------------------
      // SUCCESS
      // ---------------------------------------------------

      if (success) {
        Alert.alert("Success", "Education updated successfully.", [
          {
            text: "OK",
            onPress: handleBack,
          },
        ]);

        return;
      }

      // ---------------------------------------------------
      // HANDLE RESPONSE WITHOUT SUCCESS FLAG
      // ---------------------------------------------------

      if (response && !response?.message && !response?.error) {
        Alert.alert("Success", "Education updated successfully.", [
          {
            text: "OK",
            onPress: handleBack,
          },
        ]);

        return;
      }

      // ---------------------------------------------------
      // API RETURNED ERROR
      // ---------------------------------------------------

      Alert.alert(
        "Update Failed",
        response?.message || response?.error || "Unable to update education.",
      );
    } catch (error) {
      // ---------------------------------------------------
      // ERROR LOG
      // ---------------------------------------------------

      console.error("===");

      console.error("UPDATE EDUCATION ERROR");

      console.error(error);

      console.error("ERROR MESSAGE:", error?.message);

      console.error("===");

      // ---------------------------------------------------
      // ERROR MESSAGE
      // ---------------------------------------------------

      Alert.alert(
        "Update Failed",
        error?.message || "Unable to update education. Please try again.",
      );
    } finally {
      // ---------------------------------------------------
      // STOP LOADING
      // ---------------------------------------------------

      setSaving(false);
    }
  };

  /* ====
     LOADING SCREEN
  ==== */

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#EF233C" />

          <Text style={styles.loadingText}>Loading education...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ====
     SCREEN
  ==== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* ===
            HEADER
        === */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Feather name="chevron-left" size={21} color="#EF233C" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Education</Text>

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          </TouchableOpacity>
        </View>

        {/* ===
            CONTENT
        === */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===
              DEGREE / COURSE
          === */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Degree / Course
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={degree}
              onChangeText={setDegree}
              placeholder="B.Tech"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          {/* ===
              SPECIALIZATION
              
              This field is kept in UI because it appears
              in your Add Education design.

              It is NOT sent to the API because your
              provided API does not contain this field.
          === */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Specialization</Text>

            <TextInput
              placeholder="Computer Science"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          {/* ===
              INSTITUTION
          === */}

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>
              Institution / College
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              value={institution}
              onChangeText={setInstitution}
              placeholder="Gates Institute of Technology"
              placeholderTextColor="#9AA0A6"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>

          {/* ===
              START YEAR + END YEAR
          === */}

          <View style={styles.yearRow}>
            {/* START YEAR */}

            <View style={styles.yearField}>
              <Text style={styles.label}>
                Start Year
                <Text style={styles.required}> *</Text>
              </Text>

              <View style={styles.dropdownInput}>
                <TextInput
                  value={startYear}
                  onChangeText={setStartYear}
                  placeholder="2020"
                  placeholderTextColor="#9AA0A6"
                  style={styles.yearInput}
                  keyboardType="number-pad"
                  maxLength={4}
                />

                <Feather name="chevron-down" size={14} color="#7A8491" />
              </View>
            </View>

            {/* END YEAR */}

            <View style={styles.yearField}>
              <Text style={styles.label}>
                End Year
                <Text style={styles.required}> *</Text>
              </Text>

              <View style={styles.dropdownInput}>
                <TextInput
                  value={endYear}
                  onChangeText={setEndYear}
                  placeholder="2024"
                  placeholderTextColor="#9AA0A6"
                  style={styles.yearInput}
                  keyboardType="number-pad"
                  maxLength={4}
                />

                <Feather name="chevron-down" size={14} color="#7A8491" />
              </View>
            </View>
          </View>

          {/* ===
              STATUS
          === */}

          <Text style={[styles.label, styles.statusLabel]}>Status</Text>

          <View style={styles.radioRow}>
            {/* COMPLETED */}

            <TouchableOpacity style={styles.radioOption} activeOpacity={0.7}>
              <View style={[styles.radioOuter, styles.radioSelected]}>
                <View style={styles.radioInner} />
              </View>

              <Text style={styles.radioText}>Completed</Text>
            </TouchableOpacity>

            {/* PURSUING */}

            <TouchableOpacity style={styles.radioOption} activeOpacity={0.7}>
              <View style={styles.radioOuter} />

              <Text style={styles.radioText}>Pursuing</Text>
            </TouchableOpacity>

            {/* DISCONTINUED */}

            <TouchableOpacity style={styles.radioOption} activeOpacity={0.7}>
              <View style={styles.radioOuter} />

              <Text style={styles.radioText}>Discontinued</Text>
            </TouchableOpacity>
          </View>

          {/* ===
              BUTTONS
          === */}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.85}
              onPress={handleBack}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              activeOpacity={0.85}
              disabled={saving}
              onPress={handleSave}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>Save Education</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ===
   STYLES
=== */

const styles = StyleSheet.create({
  /* =======
       SAFE AREA
    ======= */

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* =======
       CONTAINER
    ======= */

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* =======
       HEADER
    ======= */

  header: {
    height: 53,
    width: "100%",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",

    position: "relative",
  },

  /* =======
       BACK BUTTON
    ======= */

  backButton: {
    position: "absolute",

    left: 8,

    width: 30,
    height: 30,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#ECEFF1",
  },

  /* =======
       HEADER TITLE
    ======= */

  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.xl,
    lineHeight: 15,

    color: "#171717",

    includeFontPadding: false,

    textAlign: "center",
  },

  /* =======
       MENU
    ======= */

  menuButton: {
    position: "absolute",

    right: 7,

    width: 30,
    height: 32,

    alignItems: "center",
    justifyContent: "center",
  },

  /* =======
       SCROLL VIEW
    ======= */

  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingHorizontal: 9,
    paddingTop: 8,
    paddingBottom: 20,
  },

  /* =======
       FIELD
    ======= */

  fieldContainer: {
    width: "100%",
    marginBottom: 20,
    marginTop: 20,
  },

  /* =======
       LABEL
    ======= */

  label: {
    fontFamily: Fonts.medium,
    fontSize: Fonts.size.lg,

    lineHeight: 11,

    color: "#4B5563",

    marginBottom: 18,

    includeFontPadding: false,
  },

  required: {
    color: "#EF233C",
  },

  /* =======
       INPUT
    ======= */

  input: {
    width: "100%",

    height: 34,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    borderRadius: 8,

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 10,

    paddingVertical: 0,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,

    color: "#374151",

    includeFontPadding: false,
  },

  /* =======
       YEAR ROW
    ======= */

  yearRow: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    marginBottom: 20,
  },

  yearField: {
    width: "48.5%",
  },

  /* =======
       YEAR DROPDOWN
    ======= */

  dropdownInput: {
    width: "100%",

    height: 34,

    borderWidth: 1,
    borderColor: "#E5E7EB",

    borderRadius: 8,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    paddingRight: 8,
  },

  yearInput: {
    flex: 1,

    height: 32,

    paddingHorizontal: 10,

    paddingVertical: 0,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,

    color: "#374151",

    includeFontPadding: false,
  },

  /* =======
       STATUS
    ======= */

  statusLabel: {
    marginTop: 1,
    marginBottom: 25,
  },

  /* =======
       RADIO
    ======= */

  radioRow: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 15,
  },

  radioOption: {
    flexDirection: "row",

    alignItems: "center",

    marginRight: 14,
  },

  radioOuter: {
    width: 15,
    height: 15,

    borderRadius: 7,

    borderWidth: 1,

    borderColor: "#D5D9DE",

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
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,

    color: "#4B5563",

    includeFontPadding: false,
  },

  /* =======
       BUTTON ROW
    ======= */

  buttonRow: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 20,
  },

  /* =======
       CANCEL BUTTON
    ======= */

  cancelButton: {
    width: "46.5%",

    height: 40,

    borderRadius: 7,

    backgroundColor: "#FFF0F2",

    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,

    color: "#EF233C",

    includeFontPadding: false,
  },

  /* =======
       SAVE BUTTON
    ======= */

  saveButton: {
    width: "52%",

    height: 40,

    borderRadius: 7,

    backgroundColor: "#E91E35",

    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,

    color: "#FFFFFF",

    includeFontPadding: false,
  },

  /* =======
       LOADING
    ======= */

  loadingContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FFFFFF",
  },

  loadingText: {
    marginTop: 8,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,

    color: "#737B87",

    includeFontPadding: false,
  },
});
