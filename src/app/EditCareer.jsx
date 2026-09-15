import { useCallback, useEffect, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
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

import { router, useLocalSearchParams } from "expo-router";

import {
    getMemberCareerById,
    updateMemberCareerById,
} from "../utils/Functions";

// =========================================================
// COLORS
// =========================================================

const COLORS = {
  background: "#F5F6F8",
  white: "#FFFFFF",

  text: "#222222",
  secondary: "#666666",
  lightText: "#888888",

  border: "#E5E5E5",

  red: "#ED1B2F",
  lightRed: "#FFF0F2",

  inputBackground: "#FFFFFF",
};

// =========================================================
// EDIT CAREER
// =========================================================

export default function EditCareer() {
  // =====================================================
  // GET ROUTE PARAM
  // =====================================================

  const params = useLocalSearchParams();

  const careerId = params?.id || params?.careerId;

  // =====================================================
  // STATE
  // =====================================================

  const [company, setCompany] = useState("");

  const [designation, setDesignation] = useState("");

  const [start, setStart] = useState("");

  const [end, setEnd] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD CAREER BY ID
  // =====================================================

  const loadCareer = useCallback(async () => {
    try {
      setLoading(true);

      // -----------------------------------------
      // CHECK CAREER ID
      // -----------------------------------------

      if (!careerId) {
        Alert.alert("Error", "Career ID is missing.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);

        return;
      }

      // -----------------------------------------
      // GET TOKEN
      // -----------------------------------------

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        Alert.alert("Session Expired", "Please login again.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);

        return;
      }

      // -----------------------------------------
      // DEBUG
      // -----------------------------------------

      console.log("======================================");

      console.log("EDIT CAREER SCREEN");

      console.log("CAREER ID:", careerId);

      console.log("CALLING GET CAREER BY ID");

      console.log("======================================");

      // -----------------------------------------
      // GET SINGLE CAREER
      // GET /api/member/career/{id}
      // -----------------------------------------

      const response = await getMemberCareerById(accessToken, careerId);

      console.log("======================================");

      console.log("GET SINGLE CAREER RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      console.log("======================================");

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

      console.log("NORMALIZED CAREER:", JSON.stringify(careerData, null, 2));

      if (!careerData) {
        throw new Error("Career details not found.");
      }

      // -----------------------------------------
      // SET FORM VALUES
      // -----------------------------------------

      setCompany(
        String(
          careerData?.company ||
            careerData?.company_name ||
            careerData?.companyName ||
            "",
        ),
      );

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
  }, [careerId]);

  // =====================================================
  // LOAD ON SCREEN OPEN
  // =====================================================

  useEffect(() => {
    loadCareer();
  }, [loadCareer]);

  // =========================================================
  // SAVE / UPDATE CAREER
  // PUT /api/member/career/{id}
  // =========================================================

  const handleSave = async () => {
    if (saving) {
      return;
    }

    // -----------------------------------------------------
    // CLEAN VALUES
    // -----------------------------------------------------

    const cleanCompany = String(company || "").trim();

    const cleanDesignation = String(designation || "").trim();

    const cleanStart = String(start || "").trim();

    const cleanEnd = String(end || "").trim();

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!cleanCompany) {
      Alert.alert("Required", "Please enter company name.");
      return;
    }

    if (!cleanDesignation) {
      Alert.alert("Required", "Please enter designation.");
      return;
    }

    if (!cleanStart) {
      Alert.alert("Required", "Please enter start year.");
      return;
    }

    if (!cleanEnd) {
      Alert.alert("Required", "Please enter end year.");
      return;
    }

    const startYear = Number(cleanStart);

    const endYear = Number(cleanEnd);

    if (!Number.isInteger(startYear) || startYear <= 0) {
      Alert.alert("Invalid Year", "Please enter a valid start year.");
      return;
    }

    if (!Number.isInteger(endYear) || endYear <= 0) {
      Alert.alert("Invalid Year", "Please enter a valid end year.");
      return;
    }

    if (endYear < startYear) {
      Alert.alert("Invalid Year", "End year cannot be before start year.");
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

      const accessToken = await AsyncStorage.getItem("access_token");

      if (!accessToken) {
        Alert.alert("Session Expired", "Please login again.");

        return;
      }

      // -------------------------------------------------
      // REQUEST BODY
      // -------------------------------------------------

      const body = {
        company: cleanCompany,

        designation: cleanDesignation,

        start: startYear,

        end: endYear,
      };

      // -------------------------------------------------
      // DEBUG
      // -------------------------------------------------

      console.log("======================================");

      console.log("UPDATE CAREER BUTTON CLICKED");

      console.log("METHOD: PUT");

      console.log("CAREER ID:", id);

      console.log("URL:", `/api/member/career/${id}`);

      console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

      console.log("======================================");

      // -------------------------------------------------
      // CALL PUT API
      // -------------------------------------------------

      const response = await updateMemberCareerById(accessToken, id, body);

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      console.log("======================================");

      console.log("CAREER UPDATE RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      console.log("======================================");

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      Alert.alert("Success", "Career updated successfully.", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("UPDATE CAREER ERROR:", error);

      Alert.alert("Error", error?.message || "Unable to update career.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.red} />

          <Text style={styles.loadingText}>Loading career details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screen}>
          {/* =====================================
                        HEADER
                    ===================================== */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.red} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit Career</Text>

            <View style={styles.headerRight} />
          </View>

          {/* =====================================
                        FORM
                    ===================================== */}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* =================================
                            CAREER ID
                        ================================= */}

            <View style={styles.idContainer}>
              <Ionicons name="briefcase-outline" size={18} color={COLORS.red} />

              <Text style={styles.idText}>Career ID: {careerId}</Text>
            </View>

            {/* =================================
                            COMPANY
                        ================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Company</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="business-outline"
                  size={19}
                  color={COLORS.lightText}
                />

                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={setCompany}
                  placeholder="Enter company name"
                  placeholderTextColor={"#AAAAAA"}
                  autoCapitalize="words"
                  editable={!saving}
                />
              </View>
            </View>

            {/* =================================
                            DESIGNATION
                        ================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Designation</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={COLORS.lightText}
                />

                <TextInput
                  style={styles.input}
                  value={designation}
                  onChangeText={setDesignation}
                  placeholder="Enter designation"
                  placeholderTextColor={"#AAAAAA"}
                  autoCapitalize="words"
                  editable={!saving}
                />
              </View>
            </View>

            {/* =================================
                            START YEAR
                        ================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Start Year</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={COLORS.lightText}
                />

                <TextInput
                  style={styles.input}
                  value={start}
                  onChangeText={(value) =>
                    setStart(value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="e.g. 2024"
                  placeholderTextColor={"#AAAAAA"}
                  keyboardType="number-pad"
                  maxLength={4}
                  editable={!saving}
                />
              </View>
            </View>

            {/* =================================
                            END YEAR
                        ================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>End Year</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={COLORS.lightText}
                />

                <TextInput
                  style={styles.input}
                  value={end}
                  onChangeText={(value) =>
                    setEnd(value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="e.g. 2025"
                  placeholderTextColor={"#AAAAAA"}
                  keyboardType="number-pad"
                  maxLength={4}
                  editable={!saving}
                />
              </View>
            </View>

            {/* =================================
                            SAVE BUTTON
                        ================================= */}

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              )}

              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            {/* =================================
                            CANCEL
                        ================================= */}

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =========================================================
// UPDATE CAREER API
// =========================================================
//
// IMPORTANT:
//
// You need to use the HTTP method provided by your backend
// for updating:
//
// PUT /api/member/career/{id}
// OR
// PATCH /api/member/career/{id}
// OR
// POST /api/member/career/{id}
//
//
//
// Change this function's method if your API specifies
// something different.
// =========================================================

async function updateCareerById(accessToken, careerId, body) {
  // -----------------------------------------------
  // IMPORT BASE URL dynamically
  // -----------------------------------------------

  const BASE_URL = require("../constants/AppUrls").default;

  const id = Number(careerId);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid career ID.");
  }

  const URL = `${BASE_URL}/api/member/career/${id}`;

  console.log("======================================");

  console.log("UPDATE MEMBER CAREER API");

  console.log("METHOD: PUT");

  console.log("URL:", URL);

  console.log("BODY:", JSON.stringify(body, null, 2));

  console.log("======================================");

  const response = await fetch(URL, {
    method: "PUT",

    headers: {
      Accept: "application/json",

      "Content-Type": "application/json",

      Authorization: `Bearer ${accessToken}`,
    },

    body: JSON.stringify(body),
  });

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      message: text,
    };
  }

  console.log("UPDATE CAREER STATUS:", response.status);

  console.log("UPDATE CAREER RESPONSE:", JSON.stringify(data, null, 2));

  if (response.status >= 200 && response.status < 300) {
    return {
      success: true,
      result: true,
      statusCode: response.status,
      data,
    };
  }

  throw new Error(
    data?.message ||
      data?.error ||
      `Career update failed with status ${response.status}`,
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboard: {
    flex: 1,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 5,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 58,
    width: "100%",
    backgroundColor: COLORS.white,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,

    borderWidth: 1,
    borderColor: COLORS.border,

    position: "relative",
  },

  backButton: {
    position: "absolute",
    left: 8,
    top: 8,

    width: 34,
    height: 34,

    borderRadius: 17,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "600",
    color: COLORS.text,

    includeFontPadding: false,
  },

  headerRight: {
    position: "absolute",
    right: 8,
    width: 34,
    height: 34,
  },

  // =====================================================
  // SCROLL
  // =====================================================

  scrollView: {
    flex: 1,

    backgroundColor: COLORS.white,

    borderWidth: 1,
    borderTopWidth: 0,

    borderColor: COLORS.border,

    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 10,

    fontSize: 13,
    color: COLORS.secondary,
  },

  // =====================================================
  // ID
  // =====================================================

  idContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: COLORS.lightRed,

    borderRadius: 8,

    paddingHorizontal: 12,
    paddingVertical: 10,

    marginBottom: 22,
  },

  idText: {
    marginLeft: 8,

    fontSize: 13,
    fontWeight: "500",

    color: COLORS.red,
  },

  // =====================================================
  // FIELD
  // =====================================================

  fieldContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",

    color: COLORS.text,

    marginBottom: 7,

    includeFontPadding: false,
  },

  inputWrapper: {
    height: 50,

    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 13,

    backgroundColor: COLORS.inputBackground,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 8,
  },

  input: {
    flex: 1,

    height: "100%",

    marginLeft: 10,

    fontSize: 15,

    color: COLORS.text,

    paddingVertical: 0,

    includeFontPadding: false,
  },

  // =====================================================
  // SAVE
  // =====================================================

  saveButton: {
    height: 48,

    width: "100%",

    marginTop: 12,

    borderRadius: 8,

    backgroundColor: COLORS.red,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    marginLeft: 7,

    fontSize: 16,

    fontWeight: "600",

    color: COLORS.white,

    includeFontPadding: false,
  },

  // =====================================================
  // CANCEL
  // =====================================================

  cancelButton: {
    height: 46,

    width: "100%",

    marginTop: 10,

    borderRadius: 8,

    borderWidth: 1,

    borderColor: COLORS.border,

    backgroundColor: COLORS.white,

    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 15,

    fontWeight: "600",

    color: COLORS.secondary,
  },

  bottomSpace: {
    height: 20,
  },
});
