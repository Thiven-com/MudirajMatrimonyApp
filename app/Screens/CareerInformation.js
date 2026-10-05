import { useCallback, useEffect, useState } from "react";

import {
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Feather from "react-native-vector-icons/Feather";

import { useFocusEffect } from "@react-navigation/native";
import { BackHandler } from "react-native";

import { deleteMemberCareerById, getMemberCareer } from "../utils/Functions";

// =========================================================
// COLORS
// =========================================================

const COLORS = {
  background: "#F5F6F8",
  white: "#FFFFFF",

  text: "#222222",
  secondary: "#666666",
  lightText: "#888888",

  border: "#E6E6E6",

  red: "#ED1B2F",
  darkRed: "#C91428",

  lightRed: "#FFF0F2",

  editBg: "#F5F6F8",

  green: "#20A464",
  lightGreen: "#EAF8F0",
};

// =========================================================
// CAREER INFORMATION
// =========================================================

export default function CareerInformation({ navigation }) {
  const [careers, setCareers] = useState([]);

  const [loading, setLoading] = useState(false);

  // -------------------------------------------------------
  // DELETE
  // -------------------------------------------------------

  const [confirmVisible, setConfirmVisible] = useState(false);

  const [selectedCareerId, setSelectedCareerId] = useState(null);

  const [deleting, setDeleting] = useState(false);

  // -------------------------------------------------------
  // ALERT
  // -------------------------------------------------------

  const [alertVisible, setAlertVisible] = useState(false);

  const [alertTitle, setAlertTitle] = useState("");

  const [alertMessage, setAlertMessage] = useState("");

  const [alertType, setAlertType] = useState("success");

  // =======================================================
  // SHOW ALERT
  // =======================================================

  const showAlert = (title, message, type = "success") => {
    setAlertTitle(String(title || ""));

    setAlertMessage(String(message || ""));

    setAlertType(type);

    setAlertVisible(true);
  };

  // =======================================================
  // CLOSE ALERT
  // =======================================================

  const closeAlert = () => {
    setAlertVisible(false);
  };

  // =======================================================
  // NORMALIZE API RESPONSE
  // =======================================================

  const normalizeCareerResponse = useCallback((response) => {


    console.log(JSON.stringify(response, null, 2));

    let data = response;

    // response.data

    if (data?.data && typeof data.data === "object") {
      data = data.data;
    }

    // response.data.data

    if (data?.data && typeof data.data === "object") {
      data = data.data;
    }

    // result object

    if (
      data?.result &&
      typeof data.result === "object" &&
      !Array.isArray(data.result)
    ) {
      data = data.result;
    }

    // careers array

    if (Array.isArray(data?.careers)) {
      return data.careers;
    }

    // direct array

    if (Array.isArray(data)) {
      return data;
    }

    // data array

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    // result array

    if (Array.isArray(data?.result)) {
      return data.result;
    }

    // single career

    if (
      data &&
      typeof data === "object" &&
      (data.id ||
        data.career_id ||
        data.careerId ||
        data.company ||
        data.designation)
    ) {
      return [data];
    }

    return [];
  }, []);

  // =======================================================
  // GET CAREER
  // =======================================================

  const loadCareer = useCallback(async () => {
    try {
      setLoading(true);

      const accessToken = await AsyncStorage.getItem("authToken");

     

      console.log("GET CAREER");

      console.log("TOKEN EXISTS:", !!accessToken);

  

      if (!accessToken) {
        showAlert("Session Expired", "Please login again.", "error");

        return;
      }

      const response = await getMemberCareer(accessToken);

      console.log("GET CAREER API RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      const careerData = normalizeCareerResponse(response);

      

      console.log(JSON.stringify(careerData, null, 2));

      setCareers(Array.isArray(careerData) ? careerData : []);
    } catch (error) {

      showAlert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load career information.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [normalizeCareerResponse]);

  // =======================================================
  // LOAD SCREEN
  // =======================================================

  useEffect(() => {
    loadCareer();
  }, [loadCareer]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    await loadCareer();
  };

  // =======================================================
  // ADD CAREER
  // =======================================================

  const handleAddCareer = () => {
    navigation.navigate("AddCareer");
  };

  // =======================================================
  // GET CAREER ID
  // =======================================================

  const getCareerId = (career) => {
    return career?.id ?? career?.career_id ?? career?.careerId ?? null;
  };

  // =======================================================
  // DELETE CLICK
  // =======================================================

  const handleDeleteCareer = (career) => {
    const careerId = getCareerId(career);

    console.log("DELETE CAREER:", JSON.stringify(career, null, 2));

    if (
      careerId === null ||
      careerId === undefined ||
      String(careerId).trim() === ""
    ) {
      showAlert("Delete Error", "Career ID not found.", "error");

      return;
    }

    const deleteId = Number(careerId);

    if (!Number.isInteger(deleteId) || deleteId <= 0) {
      showAlert("Delete Error", `Invalid career ID: ${careerId}`, "error");

      return;
    }

    setSelectedCareerId(deleteId);

    setConfirmVisible(true);
  };

  // =======================================================
  // CANCEL DELETE
  // =======================================================

  const cancelDelete = () => {
    setConfirmVisible(false);

    setSelectedCareerId(null);
  };

  // =======================================================
  // CONFIRM DELETE
  // =======================================================

  const confirmDelete = async () => {
    const deleteId = selectedCareerId;

    if (deleteId === null || deleteId === undefined) {
      setConfirmVisible(false);

      showAlert("Delete Error", "Career ID not found.", "error");

      return;
    }

    setConfirmVisible(false);

    await executeDeleteCareer(deleteId);
  };

  // =======================================================
  // DELETE API
  // =======================================================

  const executeDeleteCareer = async (deleteId) => {
    try {
      setDeleting(true);

    

      console.log("DELETE CAREER");

      console.log("CAREER ID:", deleteId);

     
      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        showAlert("Session Expired", "Please login again.", "error");

        return;
      }

      const response = await deleteMemberCareerById(accessToken, deleteId);

      console.log("DELETE RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      const responseData =
        response?.data && typeof response.data === "object"
          ? response.data
          : response;

      const statusCode =
        response?.statusCode ??
        response?.status ??
        responseData?.statusCode ??
        responseData?.status;

      const success = response?.success ?? responseData?.success;

      const result = response?.result ?? responseData?.result;

      const serverMessage =
        response?.message ??
        responseData?.message ??
        responseData?.msg ??
        response?.msg ??
        "";

      const httpFailure = statusCode !== undefined && Number(statusCode) >= 400;

      const apiFailure = success === false || success === 0 || result === false;

      if (httpFailure || apiFailure) {
        showAlert(
          "Delete Failed",
          serverMessage || `Unable to delete Career ID ${deleteId}.`,
          "error",
        );

        return;
      }

      // Remove immediately

      setCareers((previousCareers) =>
        previousCareers.filter(
          (item) => String(getCareerId(item)) !== String(deleteId),
        ),
      );

      setSelectedCareerId(null);

      showAlert(
        "Delete Successful",
        serverMessage || "Career deleted successfully.",
        "success",
      );

      // Reload latest server data

      await loadCareer();
    } catch (error) {
      console.error("DELETE CAREER ERROR:", error);

      showAlert(
        "Delete Failed",
        error?.response?.data?.message ||
          error?.response?.data?.msg ||
          error?.message ||
          "Unable to delete career.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (navigation?.canGoBack?.()) {
            navigation.goBack();
          }
          return true;
        },
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  // =======================================================
  // RENDER CAREER ITEM
  // =======================================================

  const renderCareerItem = (career, index) => {
    // -----------------------------------------------------
    // ID
    // -----------------------------------------------------

    const careerId = getCareerId(career);

    // -----------------------------------------------------
    // DESIGNATION
    // API: designation
    // -----------------------------------------------------

    const designation =
      career?.designation ||
      career?.job_title ||
      career?.jobTitle ||
      career?.position ||
      career?.role ||
      "Career";

    // -----------------------------------------------------
    // COMPANY
    // API: company
    // -----------------------------------------------------

    const company =
      career?.company || career?.company_name || career?.companyName || "";

    // -----------------------------------------------------
    // START
    // API: start
    // -----------------------------------------------------

    const start =
      career?.start ?? career?.start_year ?? career?.startYear ?? "";

    // -----------------------------------------------------
    // END
    // API: end
    // -----------------------------------------------------

    const end = career?.end ?? career?.end_year ?? career?.endYear ?? "";

    // -----------------------------------------------------
    // PRESENT
    // API: present
    // -----------------------------------------------------

    const isPresent =
      career?.present === true ||
      career?.present === 1 ||
      career?.present === "1" ||
      career?.present === "true";

    // -----------------------------------------------------
    // YEAR DISPLAY
    // -----------------------------------------------------

    let duration = "";

    if (start && isPresent) {
      duration = `${start} - Present`;
    } else if (start && end) {
      duration = `${start} - ${end}`;
    } else if (start) {
      duration = String(start);
    }

    return (
      <View key={careerId ?? `career-${index}`} style={styles.careerItem}>
        {/* ================================================
            CAREER ICON
        ================================================= */}

        <View style={styles.briefcaseCircle}>
          <Feather name="briefcase" size={25} color={COLORS.red} />
        </View>

        {/* ================================================
            DETAILS
        ================================================= */}

        <View style={styles.careerDetails}>
          {/* DESIGNATION */}

          <Text style={styles.jobTitle} numberOfLines={1}>
            {designation}
          </Text>

          {/* COMPANY */}

          {!!company && (
            <Text style={styles.companyName} numberOfLines={1}>
              {company}
            </Text>
          )}

          {/* YEAR */}

          {!!duration && (
            <View style={styles.durationRow}>
              <Feather
                name="calendar"
                size={14}
                color={COLORS.lightText}
              />

              <Text style={styles.duration}>{duration}</Text>
            </View>
          )}

          {/* CURRENTLY WORKING */}

          {isPresent && (
            <View style={styles.presentBadge}>
              <View style={styles.presentDot} />

              <Text style={styles.presentText}>Currently working</Text>
            </View>
          )}
        </View>

        {/* ================================================
            ACTIONS
        ================================================= */}

        <View style={styles.actionButtons}>
          {/* EDIT */}

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
            onPress={() => {
              if (careerId === null || careerId === undefined) {
                showAlert("Error", "Career ID not found.", "error");

                return;
              }

              navigation.navigate("EditCareer", { id: String(careerId) });
            }}
          >
            <Feather name="edit-2" size={21} color="#333333" />
          </TouchableOpacity>

          {/* DELETE */}

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.7}
            disabled={deleting}
            onPress={() => handleDeleteCareer(career)}
          >
            <Feather name="trash-2" size={20} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          {/* BACK */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={24} color={COLORS.red} />
          </TouchableOpacity>

          {/* TITLE */}

          <Text style={styles.headerTitle}>Career Information</Text>

          {/* REFRESH */}

          <TouchableOpacity
            style={styles.refreshButton}
            activeOpacity={0.7}
            disabled={loading}
            onPress={handleRefresh}
          >
            <Feather name="refresh-cw" size={25} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        {/* =================================================
            CONTENT
        ================================================= */}

        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* =============================================
                CAREER LIST
            ============================================= */}

            {careers.length > 0 ? (
              <View>
                {careers.map(renderCareerItem)}

                {/* =========================================
                    ADD CAREER SECTION
                ========================================= */}

                <View style={styles.addCareerSection}>
                  <View style={styles.addIconCircle}>
                    <Feather
                      name="briefcase"
                      size={30}
                      color={COLORS.red}
                    />
                  </View>

                  <Text style={styles.addCareerTitle}>
                    Add your career details
                  </Text>

                  <Text style={styles.addCareerDescription}>
                    Help others know about your professional
                  </Text>

                  <Text style={styles.addCareerDescription}>background</Text>

                  <TouchableOpacity
                    style={styles.addButton}
                    activeOpacity={0.85}
                    onPress={handleAddCareer}
                  >
                    <Feather name="plus" size={22} color={COLORS.white} />

                    <Text style={styles.addButtonText}>Add Career</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ===========================================
                 EMPTY STATE
              =========================================== */

              <View style={styles.emptyCareerSection}>
                <View style={styles.addIconCircle}>
                  <Feather
                    name="briefcase"
                    size={30}
                    color={COLORS.red}
                  />
                </View>

                <Text style={styles.addCareerTitle}>
                  Add your career details
                </Text>

                <Text style={styles.addCareerDescription}>
                  Help others know about your professional
                </Text>

                <Text style={styles.addCareerDescription}>background</Text>

                <TouchableOpacity
                  style={styles.addButton}
                  activeOpacity={0.85}
                  onPress={handleAddCareer}
                >
                  <Feather name="plus" size={22} color={COLORS.white} />

                  <Text style={styles.addButtonText}>Add Career</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      <Modal
        visible={confirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIconCircle}>
              <Feather name="trash-2" size={28} color={COLORS.red} />
            </View>

            <Text style={styles.modalTitle}>Delete Career</Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to delete this career?
            </Text>

            <View style={styles.modalButtons}>
              {/* CANCEL */}

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                disabled={deleting}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {/* DELETE */}

              <TouchableOpacity
                style={styles.confirmDeleteButton}
                activeOpacity={0.8}
                disabled={deleting}
                onPress={confirmDelete}
              >
                <Feather name="trash-2" size={17} color={COLORS.white} />

                <Text style={styles.confirmDeleteText}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          SUCCESS / ERROR MODAL
      ===================================================== */}

      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <View
              style={[
                styles.alertIconCircle,

                alertType === "error"
                  ? styles.errorIconCircle
                  : styles.successIconCircle,
              ]}
            >
              <Feather
                name={alertType === "error" ? "close" : "checkmark"}
                size={30}
                color={COLORS.white}
              />
            </View>

            <Text style={styles.alertTitle}>{alertTitle}</Text>

            <Text style={styles.alertMessage}>{alertMessage}</Text>

            <TouchableOpacity
              style={
                alertType === "error"
                  ? styles.errorOkButton
                  : styles.successOkButton
              }
              activeOpacity={0.8}
              onPress={closeAlert}
            >
              <Text style={styles.alertOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  // =======================================================
  // SCREEN
  // =======================================================

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingTop: 5,
    paddingBottom: 5,
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    height: 70,

    width: "100%",

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: COLORS.border,

    borderTopLeftRadius: 14,

    borderTopRightRadius: 14,

    alignItems: "center",

    justifyContent: "center",

    position: "relative",
  },

  backButton: {
    position: "absolute",

    left: 10,

    width: 42,

    height: 42,

    borderRadius: 21,

    borderWidth: 1,

    borderColor: "#EEEEEE",

    backgroundColor: COLORS.white,

    alignItems: "center",

    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 22,

    fontWeight: "700",

    color: COLORS.text,

    textAlign: "center",
  },

  refreshButton: {
    position: "absolute",

    right: 12,

    width: 42,

    height: 42,

    alignItems: "center",

    justifyContent: "center",
  },

  // =======================================================
  // CARD
  // =======================================================

  card: {
    flex: 1,

    width: "100%",

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderTopWidth: 0,

    borderColor: COLORS.border,

    borderBottomLeftRadius: 14,

    borderBottomRightRadius: 14,

    overflow: "hidden",
  },

  scrollContent: {
    paddingHorizontal: 10,

    paddingTop: 10,

    paddingBottom: 30,
  },

  // =======================================================
  // CAREER CARD
  // =======================================================

  careerItem: {
    width: "100%",

    minHeight: 112,

    backgroundColor: COLORS.white,

    borderWidth: 1,

    borderColor: "#E7E7E7",

    borderRadius: 14,

    paddingHorizontal: 13,

    paddingVertical: 14,

    marginBottom: 12,

    flexDirection: "row",

    alignItems: "center",

    shadowColor: "#000",

    shadowOpacity: 0.03,

    shadowRadius: 4,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  // =======================================================
  // BRIEFCASE
  // =======================================================

  briefcaseCircle: {
    width: 58,

    height: 58,

    borderRadius: 29,

    backgroundColor: COLORS.lightRed,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 13,
  },

  // =======================================================
  // DETAILS
  // =======================================================

  careerDetails: {
    flex: 1,

    minWidth: 0,

    justifyContent: "center",
  },

  jobTitle: {
    fontSize: 18,

    lineHeight: 22,

    fontWeight: "700",

    color: COLORS.text,

    marginBottom: 3,

    includeFontPadding: false,
  },

  companyName: {
    fontSize: 15,

    lineHeight: 20,

    color: COLORS.secondary,

    marginBottom: 4,

    includeFontPadding: false,
  },

  // =======================================================
  // YEAR
  // =======================================================

  durationRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  duration: {
    fontSize: 14,

    lineHeight: 18,

    color: COLORS.lightText,

    marginLeft: 5,

    fontWeight: "500",

    includeFontPadding: false,
  },

  // =======================================================
  // PRESENT BADGE
  // =======================================================

  presentBadge: {
    alignSelf: "flex-start",

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: COLORS.lightGreen,

    borderRadius: 10,

    paddingHorizontal: 8,

    paddingVertical: 4,

    marginTop: 7,
  },

  presentDot: {
    width: 6,

    height: 6,

    borderRadius: 3,

    backgroundColor: COLORS.green,

    marginRight: 5,
  },

  presentText: {
    fontSize: 10,

    fontWeight: "700",

    color: COLORS.green,
  },

  // =======================================================
  // ACTIONS
  // =======================================================

  actionButtons: {
    marginLeft: 8,

    alignItems: "center",

    justifyContent: "center",

    gap: 9,
  },

  editButton: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: COLORS.editBg,

    alignItems: "center",

    justifyContent: "center",
  },

  deleteButton: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: COLORS.lightRed,

    borderWidth: 1,

    borderColor: "#F7D5DA",

    alignItems: "center",

    justifyContent: "center",
  },

  // =======================================================
  // ADD CAREER
  // =======================================================

  addCareerSection: {
    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 20,

    paddingTop: 35,

    paddingBottom: 30,
  },

  emptyCareerSection: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 20,

    paddingBottom: 40,
  },

  addIconCircle: {
    width: 72,

    height: 72,

    borderRadius: 36,

    backgroundColor: COLORS.lightRed,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 15,
  },

  addCareerTitle: {
    fontSize: 20,

    lineHeight: 25,

    fontWeight: "700",

    color: COLORS.text,

    textAlign: "center",

    marginBottom: 5,

    includeFontPadding: false,
  },

  addCareerDescription: {
    fontSize: 14,

    lineHeight: 19,

    color: COLORS.lightText,

    textAlign: "center",

    includeFontPadding: false,
  },

  addButton: {
    minWidth: 160,

    height: 48,

    paddingHorizontal: 20,

    marginTop: 16,

    borderRadius: 9,

    backgroundColor: COLORS.red,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    elevation: 2,
  },

  addButtonText: {
    fontSize: 16,

    fontWeight: "700",

    color: COLORS.white,

    marginLeft: 6,
  },

  // =======================================================
  // MODAL
  // =======================================================

  modalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.45)",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 20,
  },

  // =======================================================
  // DELETE MODAL
  // =======================================================

  confirmModal: {
    width: "100%",

    maxWidth: 400,

    backgroundColor: COLORS.white,

    borderRadius: 18,

    paddingHorizontal: 22,

    paddingVertical: 25,

    alignItems: "center",
  },

  confirmIconCircle: {
    width: 64,

    height: 64,

    borderRadius: 32,

    backgroundColor: COLORS.lightRed,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 20,

    lineHeight: 25,

    fontWeight: "700",

    color: COLORS.text,

    textAlign: "center",

    marginBottom: 8,
  },

  modalMessage: {
    fontSize: 14,

    lineHeight: 21,

    color: COLORS.secondary,

    textAlign: "center",

    marginBottom: 22,
  },

  modalButtons: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "space-between",
  },

  cancelButton: {
    flex: 1,

    height: 46,

    borderRadius: 9,

    borderWidth: 1,

    borderColor: COLORS.border,

    backgroundColor: COLORS.white,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 6,
  },

  cancelButtonText: {
    fontSize: 15,

    fontWeight: "600",

    color: COLORS.secondary,
  },

  confirmDeleteButton: {
    flex: 1,

    height: 46,

    borderRadius: 9,

    backgroundColor: COLORS.red,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginLeft: 6,
  },

  confirmDeleteText: {
    fontSize: 15,

    fontWeight: "700",

    color: COLORS.white,

    marginLeft: 5,
  },

  // =======================================================
  // ALERT MODAL
  // =======================================================

  alertModal: {
    width: "100%",

    maxWidth: 400,

    backgroundColor: COLORS.white,

    borderRadius: 18,

    paddingHorizontal: 22,

    paddingVertical: 25,

    alignItems: "center",
  },

  alertIconCircle: {
    width: 64,

    height: 64,

    borderRadius: 32,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 14,
  },

  successIconCircle: {
    backgroundColor: COLORS.green,
  },

  errorIconCircle: {
    backgroundColor: COLORS.red,
  },

  alertTitle: {
    fontSize: 20,

    lineHeight: 25,

    fontWeight: "700",

    color: COLORS.text,

    textAlign: "center",

    marginBottom: 8,
  },

  alertMessage: {
    fontSize: 14,

    lineHeight: 21,

    color: COLORS.secondary,

    textAlign: "center",

    marginBottom: 20,
  },

  successOkButton: {
    width: "100%",

    height: 46,

    borderRadius: 9,

    backgroundColor: COLORS.green,

    alignItems: "center",

    justifyContent: "center",
  },

  errorOkButton: {
    width: "100%",

    height: 46,

    borderRadius: 9,

    backgroundColor: COLORS.red,

    alignItems: "center",

    justifyContent: "center",
  },

  alertOkText: {
    fontSize: 15,

    fontWeight: "700",

    color: COLORS.white,
  },
});
