import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  addMemberEducation,
  getMemberEducationById,
  updateMemberEducation,
} from "../utils/Functions";

/* =========================================================
   STATIC OPTION LISTS

   The API (Functions.js) only stores: degree, institution,
   education_start, education_end. There is currently no
   backend field for "education field / specialization",
   "status", certifications, or other notes, so those from
   the original mockup are not included here. Add them back
   once the API supports them.

   Replace this list with a real master-list API if/when one
   is available (e.g. GET /education-levels).
========================================================= */

const DEGREE_OPTIONS = [
  "10th",
  "12th / Intermediate",
  "Diploma",
  "Bachelor's Degree",
  "B.Tech",
  "Master's Degree",
  "Doctorate (PhD)",
  "Other",
];

const CURRENT_YEAR = new Date().getFullYear();

// Descending list, e.g. current+5 down to 1980
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR + 5 - 1980 + 1 },
  (_, i) => String(CURRENT_YEAR + 5 - i),
);

/* =========================================================
   MAIN COMPONENT

   Handles both:
   - Add mode:  router.push("/AddEducation")
   - Edit mode: router.push({ pathname: "/EditEducation", params: { id } })
========================================================= */

export default function AddEducation() {
  const { id } = useLocalSearchParams();

  const educationId = id ? Number(id) : null;

  const isEditMode = Number.isInteger(educationId) && educationId > 0;

  /* =========================================================
       STATE
    ========================================================= */

  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Which dropdown modal is open: "degree" | "startYear" | "endYear" | null
  const [activeDropdown, setActiveDropdown] = useState(null);

  /* =========================================================
       LOAD EXISTING RECORD (EDIT MODE ONLY)
    ========================================================= */

  const loadExistingEducation = useCallback(async () => {
    if (!isEditMode) {
      return;
    }

    try {
      setLoading(true);

      console.log("======================================");

      console.log("LOADING EDUCATION FOR EDIT, ID:", educationId);

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        Alert.alert("Login Required", "Please login again.");

        return;
      }

      const response = await getMemberEducationById(accessToken, educationId);

      let data = {};

      if (response?.data && typeof response.data === "object") {
        data = response.data;
      } else if (response?.result && typeof response.result === "object") {
        data = response.result;
      } else if (typeof response === "object") {
        data = response;
      }

      setDegree(String(data?.degree ?? ""));
      setInstitution(String(data?.institution ?? ""));
      setStartYear(data?.education_start ? String(data.education_start) : "");
      setEndYear(data?.education_end ? String(data.education_end) : "");
    } catch (error) {
      console.error("LOAD EDUCATION FOR EDIT ERROR:", error);

      Alert.alert(
        "Error",
        error?.message || "Unable to load education details.",
      );
    } finally {
      setLoading(false);
    }
  }, [isEditMode, educationId]);

  useEffect(() => {
    loadExistingEducation();
  }, [loadExistingEducation]);

  /* =========================================================
       SAVE (ADD OR UPDATE)
    ========================================================= */

  const handleSave = async () => {
    try {
      console.log("======================================");

      console.log(isEditMode ? "UPDATING EDUCATION" : "ADDING EDUCATION");

      // ---------------------------------------------------
      // CLIENT-SIDE CHECKS
      //
      // (Functions.js validates these too, but checking here
      // first avoids an unnecessary network round trip.)
      // ---------------------------------------------------

      if (!degree.trim()) {
        Alert.alert("Missing Information", "Please select Degree / Course.");

        return;
      }

      if (!institution.trim()) {
        Alert.alert(
          "Missing Information",
          "Please enter Institution / College.",
        );

        return;
      }

      if (!startYear) {
        Alert.alert("Missing Information", "Please select a start year.");

        return;
      }

      if (!endYear) {
        Alert.alert("Missing Information", "Please select an end year.");

        return;
      }

      if (Number(endYear) < Number(startYear)) {
        Alert.alert("Invalid Years", "End year cannot be before start year.");

        return;
      }

      setSaving(true);

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        Alert.alert("Login Required", "Please login again.");

        return;
      }

      const payload = {
        degree: degree.trim(),
        institution: institution.trim(),
        education_start: Number(startYear),
        education_end: Number(endYear),
      };

      console.log("PAYLOAD:", JSON.stringify(payload, null, 2));

      const response = isEditMode
        ? await updateMemberEducation(accessToken, educationId, payload)
        : await addMemberEducation(accessToken, payload);

      console.log("SAVE RESPONSE:", JSON.stringify(response, null, 2));

      console.log("======================================");

      router.back();
    } catch (error) {
      console.error("SAVE EDUCATION ERROR:", error);

      Alert.alert(
        "Save Failed",
        error?.message || "Unable to save education details.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
       DROPDOWN CONFIG
    ========================================================= */

  const dropdownFields = {
    degree: {
      label: "Degree / Course",
      required: true,
      icon: "school-outline",
      value: degree,
      setValue: setDegree,
      options: DEGREE_OPTIONS,
    },
    startYear: {
      label: "Start Year",
      required: true,
      icon: "calendar-outline",
      value: startYear,
      setValue: setStartYear,
      options: YEAR_OPTIONS,
    },
    endYear: {
      label: "End Year",
      required: true,
      icon: "calendar-outline",
      value: endYear,
      setValue: setEndYear,
      options: YEAR_OPTIONS,
    },
  };

  const activeField = activeDropdown ? dropdownFields[activeDropdown] : null;

  /* =========================================================
       RENDER HELPERS
    ========================================================= */

  const renderDropdownField = (key) => {
    const field = dropdownFields[key];

    return (
      <View style={styles.fieldBlock} key={key}>
        <View style={styles.labelRow}>
          <View style={styles.labelIconCircle}>
            <Ionicons name={field.icon} size={16} color="#EF233C" />
          </View>

          <Text style={styles.fieldLabel}>
            {field.label}
            {field.required ? <Text style={styles.required}> *</Text> : null}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.selectBox}
          activeOpacity={0.7}
          onPress={() => setActiveDropdown(key)}
        >
          <Text
            style={[
              styles.selectValue,
              !field.value && styles.selectPlaceholder,
            ]}
            numberOfLines={1}
          >
            {field.value || `Select ${field.label}`}
          </Text>

          <Ionicons name="chevron-down" size={18} color="#999999" />
        </TouchableOpacity>
      </View>
    );
  };

  /* =========================================================
       RENDER
    ========================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#D92332" />

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Education Information
          </Text>

          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Tell us about your educational background
          </Text>
        </View>

        <Ionicons
          name="flower-outline"
          size={30}
          color="rgba(255,255,255,0.35)"
          style={styles.headerLotus}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* =============================================
              INFO BANNER
          ============================================= */}

          <View style={styles.infoBanner}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="school" size={24} color="#D92332" />
            </View>

            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>
                Education builds brighter futures
              </Text>

              <Text style={styles.infoBody}>
                Help us know more about your educational qualifications and
                achievements.
              </Text>
            </View>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Loading education details...</Text>
          ) : (
            <>
              {/* =========================================
                  FORM CARD
              ========================================= */}

              <View style={styles.formCard}>
                {renderDropdownField("degree")}

                <View style={styles.fieldBlock}>
                  <View style={styles.labelRow}>
                    <View style={styles.labelIconCircle}>
                      <Ionicons
                        name="business-outline"
                        size={16}
                        color="#EF233C"
                      />
                    </View>

                    <Text style={styles.fieldLabel}>
                      Institution / College
                      <Text style={styles.required}> *</Text>
                    </Text>
                  </View>

                  <View style={styles.selectBox}>
                    <TextInput
                      style={styles.textInput}
                      value={institution}
                      onChangeText={setInstitution}
                      placeholder="JNTU Hyderabad"
                      placeholderTextColor="#B0B0B0"
                    />
                  </View>
                </View>

                {renderDropdownField("startYear")}
                {renderDropdownField("endYear")}
              </View>

              {/* =========================================
                  SAVE BUTTON
              ========================================= */}

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                activeOpacity={0.85}
                onPress={handleSave}
                disabled={saving}
              >
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />

                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save Changes"}
                </Text>

                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={13}
                  color="#8A8A8A"
                />

                <Text style={styles.footerText}>
                  Your information is safe with us
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =================================================
          DROPDOWN MODAL
      ================================================= */}

      <Modal
        visible={!!activeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActiveDropdown(null)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeField ? `Select ${activeField.label}` : ""}
              </Text>

              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <Ionicons name="close" size={22} color="#777777" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalOptionsList}>
              {activeField?.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  activeOpacity={0.7}
                  onPress={() => {
                    activeField.setValue(option);

                    setActiveDropdown(null);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      activeField.value === option &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>

                  {activeField.value === option ? (
                    <Ionicons name="checkmark" size={18} color="#D92332" />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    backgroundColor: "#D92332",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  backButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTextWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },

  headerLotus: {
    width: 34,
    alignItems: "center",
    marginTop: 2,
  },

  // =======================================================
  // SCROLL / LAYOUT
  // =======================================================

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 30,
  },

  loadingText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 13,
    color: "#737B87",
  },

  // =======================================================
  // INFO BANNER
  // =======================================================

  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#FCF1DD",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  infoIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FBE3C3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  infoTextWrap: {
    flex: 1,
  },

  infoTitle: {
    color: "#D92332",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  infoBody: {
    color: "#777777",
    fontSize: 12.5,
    lineHeight: 18,
  },

  // =======================================================
  // FORM CARD
  // =======================================================

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  fieldBlock: {
    marginBottom: 20,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  labelIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FCE4E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  fieldLabel: {
    color: "#222222",
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  required: {
    color: "#D92332",
  },

  // ---- dropdown select box / text input box ----

  selectBox: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectValue: {
    color: "#333333",
    fontSize: 14.5,
    flex: 1,
  },

  selectPlaceholder: {
    color: "#B0B0B0",
  },

  textInput: {
    flex: 1,
    height: "100%",
    color: "#333333",
    fontSize: 14.5,
  },

  // =======================================================
  // SAVE BUTTON
  // =======================================================

  saveButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#D92332",
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D92332",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 8,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  footerText: {
    color: "#8A8A8A",
    fontSize: 12,
    marginLeft: 6,
  },

  // =======================================================
  // DROPDOWN MODAL
  // =======================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
    flexShrink: 1,
    marginRight: 10,
  },

  modalOptionsList: {
    paddingHorizontal: 18,
  },

  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },

  modalOptionText: {
    fontSize: 15,
    color: "#333333",
  },

  modalOptionTextSelected: {
    color: "#D92332",
    fontWeight: "700",
  },
});
