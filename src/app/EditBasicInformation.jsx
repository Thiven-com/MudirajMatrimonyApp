import { useState } from "react";

import {
  Alert,
  Image,
  Modal,
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

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import BASE_URL from "../constants/AppUrls";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  red: "#E51D35",
  white: "#FFFFFF",
  black: "#222222",
  text: "#555555",
  gray: "#777777",
  placeholder: "#999999",
  border: "#E8E8E8",
  background: "#F5F5F5",
  lightRed: "#E79AA3",
};

/* =========================================================
   DATE FORMAT
   UI:  YYYY-MM-DD
   API: DD-MM-YYYY
========================================================= */

const formatDateForApi = (date) => {
  if (!date) {
    return "";
  }

  const value = String(date).trim();

  /* Already DD-MM-YYYY */
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    return value;
  }

  /* YYYY-MM-DD -> DD-MM-YYYY */
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");

    return `${day}-${month}-${year}`;
  }

  return value;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EditBasicInformation() {
  /* =======================================================
       BASIC INFORMATION STATES
    ======================================================= */

  const [firstName, setFirstName] = useState("Gandhodi");

  const [lastName, setLastName] = useState("Yashwanth");

  /*
   * Email and phone are required by the API,
   * but are not displayed in the reference UI.
   *
   * Replace these with your actual profile values
   * if you already have them available.
   */
  const [email, setEmail] = useState("vasanth@gmail.com");

  const [phone, setPhone] = useState("9876543210");

  /* =======================================================
       GENDER
    ======================================================= */

  const [gender, setGender] = useState("Male");

  /* =======================================================
       DATE OF BIRTH
    ======================================================= */

  const [dateOfBirth, setDateOfBirth] = useState("2000-04-23");

  /* =======================================================
       MARITAL STATUS
    ======================================================= */

  const [maritalStatus, setMaritalStatus] = useState("Nothing selected");

  /* =======================================================
       CHILDREN
    ======================================================= */

  const [children, setChildren] = useState("Not specified");

  /* =======================================================
       PHOTO
    ======================================================= */

  const [photo, setPhoto] = useState(true);

  const PROFILE_IMAGE = require("../../assets/images/Match6.png");

  /* =======================================================
       MODALS
    ======================================================= */

  const [showMaritalModal, setShowMaritalModal] = useState(false);

  const [showChildrenModal, setShowChildrenModal] = useState(false);

  /* =======================================================
       SAVING
    ======================================================= */

  const [saving, setSaving] = useState(false);

  /* =======================================================
       MARITAL OPTIONS
    ======================================================= */

  const maritalOptions = [
    "Nothing selected",
    "Never Married",
    "Divorced",
    "Widowed",
    "Separated",
  ];

  /* =======================================================
       CHILDREN OPTIONS
    ======================================================= */

  const childrenOptions = [
    "Not specified",
    "No Children",
    "1 Child",
    "2 Children",
    "3 Children",
    "4+ Children",
  ];

  /* =======================================================
       GENDER -> API ID
    ======================================================= */

  const getGenderId = () => {
    if (gender === "Male") {
      return 1;
    }

    if (gender === "Female") {
      return 2;
    }

    if (gender === "Other") {
      return 3;
    }

    return 0;
  };

  /* =======================================================
       MARITAL STATUS -> API ID
       
       Assumption:
       1 = Never Married
       2 = Divorced
       3 = Widowed
       4 = Separated
       
       Your API example confirms marital_status is numeric
       and shows 1, but does not provide the complete mapping.
    ======================================================= */

  const getMaritalStatusId = () => {
    if (maritalStatus === "Never Married") {
      return 1;
    }

    if (maritalStatus === "Divorced") {
      return 2;
    }

    if (maritalStatus === "Widowed") {
      return 3;
    }

    if (maritalStatus === "Separated") {
      return 4;
    }

    return 0;
  };

  /* =======================================================
       CHILDREN -> API ID
    ======================================================= */

  const getChildrenId = () => {
    if (children === "No Children") {
      return 0;
    }

    if (children === "1 Child") {
      return 1;
    }

    if (children === "2 Children") {
      return 2;
    }

    if (children === "3 Children") {
      return 3;
    }

    if (children === "4+ Children") {
      return 4;
    }

    return 0;
  };

  /* =======================================================
       SAVE BASIC INFORMATION
    ======================================================= */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      // ============================================
      // TOKEN
      // ============================================

      const accessToken = await AsyncStorage.getItem("authToken");
      console.log("====================================");
      console.log("UPDATE BASIC INFORMATION");
      console.log("====================================");
      console.log("BASE URL:", BASE_URL);
      console.log("TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        Alert.alert(
          "Login Required",
          "Access token not found. Please login again.",
        );
        return;
      }

      // ============================================
      // VALIDATE
      // ============================================

      const cleanFirstName = String(firstName || "").trim();

      const cleanLastName = String(lastName || "").trim();

      const cleanEmail = String(email || "").trim();

      const cleanPhone = String(phone || "")
        .replace(/\D/g, "")
        .slice(-10);

      if (!cleanFirstName) {
        Alert.alert("Validation", "First name is required.");
        return;
      }

      if (!cleanLastName) {
        Alert.alert("Validation", "Last name is required.");
        return;
      }

      if (!cleanEmail) {
        Alert.alert("Validation", "Email is required.");
        return;
      }

      if (cleanPhone.length !== 10) {
        Alert.alert("Validation", "Enter a valid 10 digit phone number.");
        return;
      }

      // ============================================
      // GENDER
      // ============================================

      let genderId = 0;

      if (gender === "Male") {
        genderId = 1;
      } else if (gender === "Female") {
        genderId = 2;
      } else if (gender === "Other") {
        genderId = 3;
      }

      // ============================================
      // MARITAL STATUS
      // ============================================

      let maritalStatusId = 0;

      if (maritalStatus === "Never Married") {
        maritalStatusId = 1;
      } else if (maritalStatus === "Divorced") {
        maritalStatusId = 2;
      } else if (maritalStatus === "Widowed") {
        maritalStatusId = 3;
      } else if (maritalStatus === "Separated") {
        maritalStatusId = 4;
      }

      // ============================================
      // CHILDREN
      // ============================================

      let childrenId = 0;

      if (children === "No Children") {
        childrenId = 0;
      } else if (children === "1 Child") {
        childrenId = 1;
      } else if (children === "2 Children") {
        childrenId = 2;
      } else if (children === "3 Children") {
        childrenId = 3;
      } else if (children === "4+ Children") {
        childrenId = 4;
      }

      // ============================================
      // DATE
      //
      // UI = YYYY-MM-DD
      // API = DD-MM-YYYY
      // ============================================

      let apiDate = "";

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
        const [year, month, day] = dateOfBirth.split("-");

        apiDate = `${day}-${month}-${year}`;
      } else {
        apiDate = dateOfBirth;
      }

      // ============================================
      // REQUEST BODY
      // ============================================

      const requestBody = {
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: cleanEmail,
        phone: cleanPhone,
        gender: genderId,
        on_behalf: 1,
        date_of_birth: apiDate,
        marital_status: maritalStatusId,
        children: childrenId,
      };

      console.log("REQUEST BODY:", JSON.stringify(requestBody, null, 2));

      // ============================================
      // API URL
      // ============================================

      const apiUrl = `${BASE_URL}/api/member/basic-info/update`;

      console.log("FINAL API URL:", apiUrl);

      // ============================================
      // POST REQUEST
      // ============================================

      const response = await fetch(apiUrl, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Accept: "application/json",

          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(requestBody),
      });

      // ============================================
      // READ RESPONSE
      // ============================================

      const responseText = await response.text();

      console.log("HTTP STATUS:", response.status);

      console.log("RESPONSE TEXT:", responseText);

      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = {
          message: responseText,
        };
      }

      console.log("RESPONSE JSON:", JSON.stringify(responseData, null, 2));

      // ============================================
      // HTTP ERROR
      // ============================================

      if (!response.ok) {
        const serverMessage =
          responseData?.message ||
          responseData?.error ||
          responseData?.errors ||
          `Server returned HTTP ${response.status}`;

        throw new Error(
          typeof serverMessage === "string"
            ? serverMessage
            : JSON.stringify(serverMessage),
        );
      }

      // ============================================
      // API SUCCESS CHECK
      // ============================================

      if (
        responseData &&
        (responseData.success === false || responseData.result === false)
      ) {
        throw new Error(responseData.message || "API rejected the update.");
      }

      // ============================================
      // SUCCESS
      // ============================================

      Alert.alert("Success", "Basic information updated successfully.", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("====================================");

      console.error("UPDATE BASIC INFORMATION ERROR");

      console.error(error);

      console.error("====================================");

      Alert.alert(
        "Update Failed",
        error?.message || "Unable to update basic information.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
       REMOVE PHOTO
    ======================================================= */

  const handleRemovePhoto = () => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setPhoto(false);
        },
      },
    ]);
  };

  /* =======================================================
       UPLOAD PHOTO
    ======================================================= */

  const handleUploadPhoto = () => {
    Alert.alert(
      "Upload Photo",
      "Connect your image picker here to select a profile photo.",
    );
  };

  /* =======================================================
       RADIO BUTTON
    ======================================================= */

  const RadioButton = ({ label, value }) => {
    const selected = gender === value;

    return (
      <TouchableOpacity
        style={styles.radioItem}
        activeOpacity={0.7}
        onPress={() => setGender(value)}
      >
        <View
          style={[styles.radioOuter, selected && styles.radioOuterSelected]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>

        <Text style={styles.radioText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  /* =======================================================
       DROPDOWN ITEM
    ======================================================= */

  const DropdownItem = ({ title, selected, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.modalOption}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <Text
          style={[
            styles.modalOptionText,
            selected && styles.modalOptionTextSelected,
          ]}
        >
          {title}
        </Text>

        {selected && <Ionicons name="checkmark" size={18} color={COLORS.red} />}
      </TouchableOpacity>
    );
  };

  /* =======================================================
       SCREEN
    ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.screen}>
        {/* =================================================
                   HEADER
                ================================================= */}

        <View style={styles.header}>
          {/* BACK BUTTON */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={18} color="#222222" />
          </TouchableOpacity>

          {/* TITLE */}

          <Text style={styles.headerTitle}>Edit Basic Information</Text>

          {/* MENU */}

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={15} color={COLORS.red} />
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
            {/* =========================================
                           FIRST NAME
                        ========================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                First Name <Text style={styles.required}>*</Text>
              </Text>

              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                placeholderTextColor={"#A0A0A0"}
                style={styles.input}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* =========================================
                           LAST NAME
                        ========================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Last Name <Text style={styles.required}>*</Text>
              </Text>

              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                placeholderTextColor={"#A0A0A0"}
                style={styles.input}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* =========================================
                           GENDER
                        ========================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Gender <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.genderRow}>
                <RadioButton label="Male" value="Male" />

                <RadioButton label="Female" value="Female" />

                <RadioButton label="Other" value="Other" />
              </View>
            </View>

            {/* =========================================
                           DATE OF BIRTH
                        ========================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.dateInputContainer}>
                <TextInput
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={"#A0A0A0"}
                  style={styles.dateInput}
                  maxLength={10}
                  keyboardType="numbers-and-punctuation"
                />

                <TouchableOpacity
                  style={styles.calendarButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={14} color="#555555" />
                </TouchableOpacity>
              </View>
            </View>

            {/* =========================================
                           MARITAL STATUS
                        ========================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Marital Status <Text style={styles.required}>*</Text>
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.dropdown}
                onPress={() => setShowMaritalModal(true)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    maritalStatus === "Nothing selected" &&
                      styles.placeholderText,
                  ]}
                >
                  {maritalStatus}
                </Text>

                <Ionicons
                  name="chevron-down-outline"
                  size={17}
                  color="#777777"
                />
              </TouchableOpacity>
            </View>

            {/* =========================================
                           NUMBER OF CHILDREN
                        ========================================= */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Number of Children</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.dropdown}
                onPress={() => setShowChildrenModal(true)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    children === "Not specified" && styles.placeholderText,
                  ]}
                >
                  {children}
                </Text>

                <Ionicons
                  name="chevron-down-outline"
                  size={17}
                  color="#777777"
                />
              </TouchableOpacity>
            </View>

            {/* =========================================
                           UPLOAD PHOTO
                        ========================================= */}

            <View style={styles.photoSection}>
              <Text style={styles.label}>Upload Photo</Text>

              <View style={styles.photoRow}>
                {/* PROFILE PHOTO */}

                <View style={styles.profilePhotoContainer}>
                  {photo ? (
                    <Image source={PROFILE_IMAGE} style={styles.profilePhoto} />
                  ) : (
                    <View style={styles.emptyPhoto}>
                      <Ionicons
                        name="person-outline"
                        size={22}
                        color="#B5B5B5"
                      />
                    </View>
                  )}

                  {/* REMOVE */}

                  {photo && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      activeOpacity={0.8}
                      onPress={handleRemovePhoto}
                    >
                      <Ionicons name="close" size={10} color={COLORS.red} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* UPLOAD BOX */}

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.uploadBox}
                  onPress={handleUploadPhoto}
                >
                  <Ionicons
                    name="camera-outline"
                    size={18}
                    color={COLORS.red}
                    style={styles.cameraIcon}
                  />

                  <Text style={styles.uploadTitle}>Upload Photo (800x800)</Text>

                  <Text style={styles.uploadSubText}>JPG, PNG (Max 5MB)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* =========================================
                           SAVE BUTTON
                        ========================================= */}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* =====================================================
               MARITAL STATUS MODAL
            ===================================================== */}

      <Modal
        visible={showMaritalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMaritalModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaritalModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Marital Status</Text>

              <TouchableOpacity onPress={() => setShowMaritalModal(false)}>
                <Ionicons name="close" size={19} color="#333333" />
              </TouchableOpacity>
            </View>

            {maritalOptions.map((item) => (
              <DropdownItem
                key={item}
                title={item}
                selected={maritalStatus === item}
                onPress={() => {
                  setMaritalStatus(item);

                  setShowMaritalModal(false);
                }}
              />
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* =====================================================
               CHILDREN MODAL
            ===================================================== */}

      <Modal
        visible={showChildrenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChildrenModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChildrenModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Number of Children</Text>

              <TouchableOpacity onPress={() => setShowChildrenModal(false)}>
                <Ionicons name="close" size={19} color="#333333" />
              </TouchableOpacity>
            </View>

            {childrenOptions.map((item) => (
              <DropdownItem
                key={item}
                title={item}
                selected={children === item}
                onPress={() => {
                  setChildren(item);

                  setShowChildrenModal(false);
                }}
              />
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES - REFERENCE UI
========================================================= */

const styles = StyleSheet.create({
  /* =====================================================
       SAFE AREA
    ===================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  /* =====================================================
       SCREEN
    ===================================================== */

  screen: {
    flex: 1,
    backgroundColor: "#F5F5F5",

    paddingHorizontal: 7,
    paddingTop: 5,
    paddingBottom: 5,
  },

  /* =====================================================
       HEADER
    ===================================================== */

  header: {
    width: "100%",
    height: 60,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    position: "relative",

    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,

    borderWidth: 1,
    borderColor: "#E2E2E2",

    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  /* =====================================================
       BACK BUTTON
    ===================================================== */

  backButton: {
    position: "absolute",

    left: 0,
    top: 0,

    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================================
       HEADER TITLE
    ===================================================== */

  headerTitle: {
    fontSize: 18,
    lineHeight: 11,

    fontWeight: "600",

    color: "#222222",

    includeFontPadding: false,

    textAlign: "center",
  },

  /* =====================================================
       MENU BUTTON
    ===================================================== */

  menuButton: {
    position: "absolute",

    right: 0,
    top: 0,

    width: 30,
    height: 35,

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================================
       MAIN CARD
    ===================================================== */

  card: {
    width: "100%",
    height: 30,

    flex: 1,

    backgroundColor: "#FFFFFF",

    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,

    borderColor: "#E2E2E2",

    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,

    overflow: "hidden",
  },

  /* =====================================================
       SCROLL CONTENT
    ===================================================== */

  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 8,
  },

  /* =====================================================
       EACH FIELD
    ===================================================== */

  fieldContainer: {
    width: "100%",
    height: 50,

    marginBottom: 50,
  },

  /* =====================================================
       LABEL
    ===================================================== */

  label: {
    fontSize: 15,

    lineHeight: 8,

    fontWeight: "500",

    color: "#4D4D4D",

    marginBottom: 10,
    marginTop: 20,

    includeFontPadding: false,
  },

  /* =====================================================
       REQUIRED *
    ===================================================== */

  required: {
    color: "#E51D35",

    fontSize: 15,

    fontWeight: "500",
  },

  /* =====================================================
       TEXT INPUT
    ===================================================== */

  input: {
    width: "100%",

    height: 30,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E5E5E5",

    borderRadius: 4,

    paddingHorizontal: 10,
    paddingVertical: 10,

    fontSize: 13,

    lineHeight: 10,

    color: "#333333",

    includeFontPadding: false,
  },

  /* =====================================================
       GENDER ROW
    ===================================================== */

  genderRow: {
    width: "100%",

    height: 24,

    flexDirection: "row",

    alignItems: "center",
  },

  /* =====================================================
       RADIO ITEM
    ===================================================== */

  radioItem: {
    flexDirection: "row",

    alignItems: "center",

    marginRight: 20,
  },

  /* =====================================================
       RADIO OUTER
    ===================================================== */

  radioOuter: {
    width: 15,
    height: 15,

    borderRadius: 5,

    borderWidth: 1,

    borderColor: "#CCCCCC",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 6,
  },

  /* =====================================================
       SELECTED RADIO
    ===================================================== */

  radioOuterSelected: {
    borderColor: "#E51D35",
  },

  /* =====================================================
       RADIO INNER
    ===================================================== */

  radioInner: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#E51D35",
  },

  /* =====================================================
       RADIO TEXT
    ===================================================== */

  radioText: {
    fontSize: 12,

    lineHeight: 10,

    color: "#555555",

    includeFontPadding: false,
  },

  /* =====================================================
       DATE INPUT CONTAINER
    ===================================================== */

  dateInputContainer: {
    width: "100%",

    height: 25,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 4,
  },

  /* =====================================================
       DATE TEXT
    ===================================================== */

  dateInput: {
    flex: 1,

    height: 24,

    paddingHorizontal: 7,
    paddingVertical: 0,

    fontSize: 12,

    lineHeight: 10,

    color: "#3d3c3c",

    includeFontPadding: false,
  },

  /* =====================================================
       CALENDAR BUTTON
    ===================================================== */

  calendarButton: {
    width: 27,
    height: 24,

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================================
       DROPDOWN
    ===================================================== */

  dropdown: {
    width: "100%",

    height: 25,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 4,

    paddingHorizontal: 7,
  },

  /* =====================================================
       DROPDOWN TEXT
    ===================================================== */

  dropdownText: {
    flex: 1,

    fontSize: 13,

    lineHeight: 15,

    color: "#555555",

    includeFontPadding: false,
  },

  /* =====================================================
       PLACEHOLDER
    ===================================================== */

  placeholderText: {
    color: "#999999",
  },

  /* =====================================================
       PHOTO SECTION
    ===================================================== */

  photoSection: {
    width: "100%",

    marginTop: 10,

    marginBottom: 20,
  },

  /* =====================================================
       PHOTO ROW
    ===================================================== */

  photoRow: {
    width: "100%",

    height: 80,

    flexDirection: "row",

    alignItems: "center",
  },

  /* =====================================================
       PROFILE PHOTO CONTAINER
    ===================================================== */

  profilePhotoContainer: {
    width: 150,

    height: 80,

    position: "relative",

    marginRight: 30,
  },

  /* =====================================================
       PROFILE PHOTO
    ===================================================== */

  profilePhoto: {
    width: 150,

    height: 180,

    borderRadius: 4,

    backgroundColor: "#EEEEEE",

    resizeMode: "cover",
  },

  /* =====================================================
       EMPTY PHOTO
    ===================================================== */

  emptyPhoto: {
    width: 80,

    height: 75,

    borderRadius: 4,

    backgroundColor: "#F4F4F4",

    borderWidth: 1,

    borderColor: "#E4E4E4",

    alignItems: "center",

    justifyContent: "center",
  },

  /* =====================================================
       REMOVE PHOTO
    ===================================================== */

  removeButton: {
    position: "absolute",

    top: -1,

    right: -1,

    width: 14,

    height: 14,

    borderRadius: 7,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E51D35",

    alignItems: "center",

    justifyContent: "center",

    zIndex: 20,

    elevation: 3,
  },

  /* =====================================================
       UPLOAD BOX
    ===================================================== */

  uploadBox: {
    flex: 1,

    height: 105,
    width: 50,

    backgroundColor: "#FFFBFC",

    borderWidth: 1,

    borderStyle: "dashed",

    borderColor: "#E79AA3",

    borderRadius: 4,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 10,
  },

  /* =====================================================
       CAMERA ICON
    ===================================================== */

  cameraIcon: {
    marginBottom: 2,
  },

  /* =====================================================
       UPLOAD TITLE
    ===================================================== */

  uploadTitle: {
    fontSize: 10.5,

    lineHeight: 8,

    fontWeight: "500",

    color: "#555555",

    textAlign: "center",

    includeFontPadding: false,
  },

  /* =====================================================
       UPLOAD SUB TEXT
    ===================================================== */

  uploadSubText: {
    fontSize: 9.5,

    lineHeight: 9,

    color: "#999999",

    textAlign: "center",

    marginTop: 1,

    includeFontPadding: false,
  },

  /* =====================================================
       SAVE BUTTON
    ===================================================== */

  saveButton: {
    width: "100%",

    height: 37,

    marginTop: 130,

    marginBottom: 40,

    backgroundColor: "#E51D35",

    borderRadius: 5,

    alignItems: "center",

    justifyContent: "center",
  },

  /* =====================================================
       SAVE DISABLED
    ===================================================== */

  saveButtonDisabled: {
    opacity: 0.6,
  },

  /* =====================================================
       SAVE TEXT
    ===================================================== */

  saveButtonText: {
    color: "#FFFFFF",

    fontSize: 18,

    lineHeight: 10,

    fontWeight: "600",

    includeFontPadding: false,

    textAlign: "center",
  },

  /* =====================================================
       MODAL OVERLAY
    ===================================================== */

  modalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.35)",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 25,
  },

  /* =====================================================
       MODAL CARD
    ===================================================== */

  modalCard: {
    width: "100%",

    maxWidth: 350,

    backgroundColor: "#FFFFFF",

    borderRadius: 9,

    overflow: "hidden",

    elevation: 5,
  },

  /* =====================================================
       MODAL HEADER
    ===================================================== */

  modalHeader: {
    height: 43,

    paddingHorizontal: 14,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "#EEEEEE",
  },

  /* =====================================================
       MODAL TITLE
    ===================================================== */

  modalTitle: {
    fontSize: 12,

    fontWeight: "600",

    color: "#222222",
  },

  /* =====================================================
       MODAL OPTION
    ===================================================== */

  modalOption: {
    minHeight: 40,

    paddingHorizontal: 14,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "#F0F0F0",
  },

  /* =====================================================
       MODAL OPTION TEXT
    ===================================================== */

  modalOptionText: {
    fontSize: 10,

    color: "#555555",
  },

  /* =====================================================
       SELECTED MODAL OPTION
    ===================================================== */

  modalOptionTextSelected: {
    color: "#E51D35",

    fontWeight: "600",
  },
});
