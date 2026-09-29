import { useCallback, useEffect, useState } from "react";

import {
  BackHandler,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import Fonts from "../constants/Fonts";
import { deleteMemberCareerById, getMemberCareer } from "../utils/Functions";

// =====
// COLORS
// =====

const COLORS = {
  background: "#F5F6F8",
  white: "#FFFFFF",
  text: "#222222",
  secondary: "#666666",
  lightText: "#777777",
  border: "#E8E8E8",
  red: "#ED1B2F",
  lightRed: "#FFF0F2",
  iconBg: "#FFF0F2",
  editBg: "#F5F6F8",
  green: "#20A464",
  lightGreen: "#EAF8F0",
  darkRed: "#C91428",
};

// =====
// CAREER INFORMATION
// =====

export default function CareerInformation({ navigation, route }) {

  const [careers, setCareers] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  useFocusEffect(
    useCallback(() => {

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation, confirmVisible, alertVisible]),
  );

  const onBackPress = () => {
    if (confirmVisible) {
      setConfirmVisible(false);
      setSelectedCareerId(null);
      return true;
    }

    if (alertVisible) {
      setAlertVisible(false);
      return true;
    }

    navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    return true;
  };

  // ===
  // SHOW CUSTOM ALERT
  // ===

  const showAlert = (title, message, type = "success") => {
    setAlertTitle(String(title || ""));
    setAlertMessage(String(message || ""));
    setAlertType(type);
    setAlertVisible(true);
  };

  // ===
  // CLOSE ALERT
  // ===

  const closeAlert = () => {
    setAlertVisible(false);
  };

  // ===
  // NORMALIZE CAREER RESPONSE
  // ===

  const normalizeCareerResponse = useCallback((response) => {

    let data = response;

    if (data?.data && typeof data.data === "object") {
      data = data.data;
    }

    if (data?.data && typeof data.data === "object") {
      data = data.data;
    }

    if (
      data?.result &&
      typeof data.result === "object" &&
      !Array.isArray(data.result)
    ) {
      data = data.result;
    }

    if (Array.isArray(data?.careers)) {
      return data.careers;
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.result)) {
      return data.result;
    }

    if (
      data &&
      typeof data === "object" &&
      (data.id ||
        data.career_id ||
        data.careerId ||
        data.company ||
        data.company_name ||
        data.designation)
    ) {
      return [data];
    }

    return [];
  }, []);

  // ===
  // GET CAREER
  // ===

  const loadCareer = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        showAlert("Session Expired", "Please login again.", "error");

        return;
      }

      const response = await getMemberCareer(accessToken);
      const careerData = normalizeCareerResponse(response);

      setCareers(Array.isArray(careerData) ? careerData : []);
    } catch (error) {
      console.error(
        "RESPONSE:",
        JSON.stringify(error?.response?.data, null, 2),
      );

      showAlert(
        "Error",
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load career information.",
        "error",
      );
    }
  }, [normalizeCareerResponse]);

  // ===
  // LOAD SCREEN
  // ===

  useEffect(() => {
    loadCareer();
  }, [loadCareer]);

  // ===
  // REFRESH
  // ===

  const handleRefresh = async () => {

    await loadCareer();
  };

  // ===
  // ADD CAREER
  // ===

  const handleAddCareer = () => {

    navigation.navigate("AddCareer");
  };

  // ===
  // GET CAREER ID
  // ===

  const getCareerId = (career) => {
    return career?.id ?? career?.career_id ?? career?.careerId ?? null;
  };

  // ===
  // OPEN DELETE CONFIRMATION
  // ===

  const handleDeleteCareer = (career) => {
    const careerId = getCareerId(career);

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

  // ===
  // CANCEL DELETE
  // ===

  const cancelDelete = () => {

    setConfirmVisible(false);
    setSelectedCareerId(null);
  };

  // ===
  // CONFIRM DELETE
  // ===

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

  // ===
  // DELETE CAREER API
  // ===

  const executeDeleteCareer = async (deleteId) => {
    try {
      setDeleting(true);
      const accessToken = await AsyncStorage.getItem("authToken");
      if (!accessToken) {
        showAlert("Session Expired", "Please login again.", "error");

        return;
      }
      const response = await deleteMemberCareerById(accessToken, deleteId);
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
        console.error("DELETE API FAILED");

        showAlert(
          "Delete Failed",
          serverMessage || `Unable to delete Career ID ${deleteId}.`,
          "error",
        );

        return;
      }


      setCareers((previousCareers) =>
        previousCareers.filter(
          (item) => String(getCareerId(item)) !== String(deleteId),
        ),
      );


      const successMessage =
        serverMessage || `Career ID ${deleteId} deleted successfully.`;

      showAlert("Delete Successful", successMessage, "success");

      setSelectedCareerId(null);


      await loadCareer();

    } catch (error) {

      console.error(
        "RESPONSE:",
        JSON.stringify(error?.response?.data, null, 2),
      );

      console.error("===");

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        `Unable to delete Career ID ${deleteId}.`;

      showAlert("Delete Failed", errorMessage, "error");
    } finally {
      setDeleting(false);
    }
  };

  // ===
  // RENDER CAREER ITEM
  // ===

  const renderCareerItem = (career, index) => {
    const careerId = getCareerId(career);

    const jobTitle =
      career?.job_title ||
      career?.jobTitle ||
      career?.designation ||
      career?.position ||
      career?.occupation ||
      career?.role ||
      "Career";

    const companyName =
      career?.company_name ||
      career?.companyName ||
      career?.company ||
      career?.institution ||
      career?.organization ||
      "";

    const startYear =
      career?.start ??
      career?.start_year ??
      career?.startYear ??
      career?.career_start ??
      "";

    const endYear =
      career?.end ??
      career?.end_year ??
      career?.endYear ??
      career?.career_end ??
      "";

    const isPresent =
      career?.present === true ||
      career?.present === 1 ||
      career?.is_present === true ||
      career?.is_present === 1;

    let duration = "";

    if (startYear && isPresent) {
      duration = `${startYear} - Present`;
    } else if (startYear && endYear) {
      duration = `${startYear} - ${endYear}`;
    } else if (startYear) {
      duration = String(startYear);
    }

    return (
      <View key={careerId ?? `career-${index}`} style={styles.careerItem}>
        {/* CAREER ICON */}

        <View style={styles.briefcaseCircle}>
          <Feather name="briefcase" size={20} color={COLORS.red} />
        </View>

        {/* DETAILS */}

        <View style={styles.careerDetails}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {jobTitle}
          </Text>

          {!!companyName && (
            <Text style={styles.companyName} numberOfLines={1}>
              {companyName}
            </Text>
          )}

          {!!duration && (
            <Text style={styles.duration} numberOfLines={1}>
              {duration}
            </Text>
          )}
        </View>

        {/* ACTION BUTTONS */}

        <View style={styles.actionButtons}>
          {/* EDIT */}

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
            onPress={() => {
              if (careerId === undefined || careerId === null) {
                showAlert("Error", "Career ID not found.", "error");

                return;
              }

              navigation.navigate("EditCareer", {
                id: String(careerId),
                page: route?.name, prevs: route?.params
              });
            }}
          >
            <Feather name="edit-2" size={15} color="#444444" />
          </TouchableOpacity>

          {/* DELETE */}

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.7}
            disabled={deleting}
            onPress={() => handleDeleteCareer(career)}
          >
            <Feather name="trash-2" size={17} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ===
  // RENDER
  // ===

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        {/* ======
                    HEADER
                ====== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => onBackPress()}
          >
            <Feather name="chevron-left" size={19} color={COLORS.red} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Career Information</Text>

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
            onPress={handleRefresh}
          >
            <Feather name="refresh-ccw" size={18} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        {/* ======
                    MAIN CARD
                ====== */}

        <View style={styles.card}>
          {careers.length > 0 ? (
            <View style={styles.careerList}>
              {careers.map(renderCareerItem)}

              {/* ADD CAREER */}

              <View style={styles.addCareerSection}>
                <View style={styles.addIconCircle}>
                  <Feather name="briefcase" size={24} color={COLORS.red} />
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
                  <Feather name="plus" size={18} color={COLORS.white} />

                  <Text style={styles.addButtonText}>Add Career</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyCareerSection}>
              <View style={styles.addIconCircle}>
                <Ionicons
                  name="briefcase-outline"
                  size={24}
                  color={COLORS.red}
                />
              </View>

              <Text style={styles.addCareerTitle}>Add your career details</Text>

              <Text style={styles.addCareerDescription}>
                Help others know about your professional
              </Text>

              <Text style={styles.addCareerDescription}>background</Text>

              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.85}
                onPress={handleAddCareer}
              >
                <Feather name="plus" size={18} color={COLORS.white} />

                <Text style={styles.addButtonText}>Add Career</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* =====
                DELETE CONFIRMATION MODAL
            ===== */}

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
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={cancelDelete}
                disabled={deleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteButton}
                activeOpacity={0.8}
                onPress={confirmDelete}
                disabled={deleting}
              >
                <Feather name="trash-2" size={16} color={COLORS.white} />

                <Text style={styles.confirmDeleteText}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====
                SUCCESS / ERROR MODAL
            ===== */}

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
                name={alertType === "error" ? "x" : "check"}
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

// =====
// STYLES
// =====

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 4,
  },

  // =====
  // HEADER
  // =====

  header: {
    width: "100%",
    height: 62,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  backButton: {
    position: "absolute",
    left: 7,
    top: 5,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontFamily: Fonts.semiBold,
    color: COLORS.text,
    includeFontPadding: false,
    textAlign: "center",
  },

  menuButton: {
    position: "absolute",
    right: 8,
    top: 5,
    width: 30,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
  },

  // =====
  // CARD
  // =====

  card: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: "hidden",
  },

  careerList: {
    flex: 1,
  },

  // =====
  // CAREER ITEM
  // =====

  careerItem: {
    width: "100%",
    minHeight: 82,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 9,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },

  briefcaseCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  careerDetails: {
    flex: 1,
    justifyContent: "center",
  },

  jobTitle: {
    fontSize: 18,
    lineHeight: 21,
    fontFamily: Fonts.medium,
    color: COLORS.text,
    marginBottom: 2,
    includeFontPadding: false,
  },

  companyName: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 16,
    color: COLORS.secondary,
    marginBottom: 1,
    includeFontPadding: false,
  },

  duration: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    color: COLORS.lightText,
    includeFontPadding: false,
  },

  // =====
  // ACTION BUTTONS
  // =====

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },

  editButton: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: COLORS.editBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.lightRed,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFD9DE",
  },

  // =====
  // ADD CAREER
  // =====

  addCareerSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  emptyCareerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  addIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  addCareerTitle: {
    fontSize: 18,
    lineHeight: 21,
    fontFamily: Fonts.semiBold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
    includeFontPadding: false,
  },

  addCareerDescription: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    color: COLORS.lightText,
    textAlign: "center",
    includeFontPadding: false,
  },

  addButton: {
    height: 41,
    minWidth: 131,
    paddingHorizontal: 15,
    marginTop: 10,
    borderRadius: 7,
    backgroundColor: COLORS.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Fonts.semiBold,
    color: COLORS.white,
    marginLeft: 4,
    includeFontPadding: false,
  },

  // =====
  // MODAL OVERLAY
  // =====

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  // =====
  // CONFIRM MODAL
  // =====

  confirmModal: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 25,
    alignItems: "center",
  },

  confirmIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.lightRed,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Fonts.bold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },

  modalMessage: {
    fontFamily: Fonts.regular,
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
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  cancelButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: COLORS.secondary,
  },

  confirmDeleteButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  confirmDeleteText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: COLORS.white,
    marginLeft: 5,
  },

  // =====
  // SUCCESS / ERROR MODAL
  // =====

  alertModal: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 25,
    alignItems: "center",
  },

  alertIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
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
    fontFamily: Fonts.bold,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Fonts.bold,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },

  alertMessage: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.secondary,
    textAlign: "center",
    marginBottom: 20,
  },

  successOkButton: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
  },

  errorOkButton: {
    width: "100%",
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

  alertOkText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: COLORS.white,
  },
});
