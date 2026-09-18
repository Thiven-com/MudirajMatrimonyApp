import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import {
  deleteMemberCareerById,
  getMemberCareer,
  getMemberCareerById,
} from "../utils/Functions";

/* =========================================================
   COLORS
========================================================= */

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
};

/* =========================================================
   CAREER INFORMATION
========================================================= */

export default function CareerInformation() {
  /* =====================================================
       STATE
    ===================================================== */

  const [careers, setCareers] = useState([]);

  /* =====================================================
       GET CAREER
    ===================================================== */

  const loadCareer = useCallback(async () => {
    try {
      // FIX: was "access_token" — every other screen in this app
      // (Education, Profession, Social Background, Languages) stores
      // the token under "authToken". "access_token" is never set,
      // so this always returned null.
      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("========================================");

      console.log("CAREER SCREEN - GET CAREER");

      console.log("TOKEN EXISTS:", !!accessToken);

      console.log("========================================");

      if (!accessToken) {
        Alert.alert("Session Expired", "Please login again.");

        return;
      }

      /* =========================================
                   GET CAREER API
                ========================================= */

      const response = await getMemberCareer(accessToken);

      console.log("========================================");

      console.log("GET CAREER RESPONSE");

      console.log(JSON.stringify(response, null, 2));

      console.log("========================================");

      /* =========================================
                   NORMALIZE RESPONSE
                ========================================= */

      let careerData = [];

      if (Array.isArray(response)) {
        careerData = response;
      } else if (Array.isArray(response?.data)) {
        careerData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        careerData = response.data.data;
      } else if (Array.isArray(response?.data?.careers)) {
        careerData = response.data.careers;
      } else if (Array.isArray(response?.careers)) {
        careerData = response.careers;
      } else if (response?.data && typeof response.data === "object") {
        careerData = [response.data];
      } else {
        careerData = [];
      }

      console.log(
        "NORMALIZED CAREER DATA:",
        JSON.stringify(careerData, null, 2),
      );

      setCareers(Array.isArray(careerData) ? careerData : []);
    } catch (error) {
      console.error("GET CAREER ERROR:", error);

      Alert.alert(
        "Error",
        error?.message || "Unable to load career information.",
      );
    }
  }, []);

  /* =====================================================
       LOAD SCREEN
    ===================================================== */

  useEffect(() => {
    loadCareer();
  }, [loadCareer]);

  /* =====================================================
       REFRESH
       NO LOADING INDICATOR
    ===================================================== */

  const handleRefresh = async () => {
    console.log("REFRESH CAREER BUTTON CLICKED");

    await loadCareer();
  };

  /* =====================================================
       ADD CAREER
    ===================================================== */

  const handleAddCareer = () => {
    console.log("ADD CAREER BUTTON CLICKED");

    try {
      router.push("/AddCareer");
    } catch (error) {
      console.error("ADD CAREER NAVIGATION ERROR:", error);

      Alert.alert("Navigation Error", "Unable to open Add Career screen.");
    }
  };

  /* =====================================================
       DELETE CAREER
    ===================================================== */

  const handleDeleteCareer = (career) => {
    const careerId = career?.id ?? career?.career_id ?? career?.careerId;

    console.log("========================================");

    console.log("DELETE CAREER CLICKED");

    console.log("CAREER OBJECT:", JSON.stringify(career, null, 2));

    console.log("CAREER ID:", careerId);

    console.log("========================================");

    /* =========================================
           CHECK ID
        ========================================= */

    if (
      careerId === undefined ||
      careerId === null ||
      String(careerId).trim() === ""
    ) {
      Alert.alert("Delete Error", "Career ID not found.");

      return;
    }

    const deleteId = Number(careerId);

    if (!Number.isInteger(deleteId) || deleteId <= 0) {
      Alert.alert("Delete Error", `Invalid career ID: ${careerId}`);

      return;
    }

    /* =========================================
           CONFIRM DELETE
        ========================================= */

    Alert.alert(
      "Delete Career",
      `Are you sure you want to delete career ID ${deleteId}?`,
      [
        {
          text: "Cancel",
          style: "cancel",

          onPress: () => {
            console.log("DELETE CANCELLED");
          },
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            console.log("========================================");

            console.log("DELETE CONFIRMED");

            console.log("CAREER ID:", deleteId);

            console.log("========================================");

            try {
              /* =================================
                               GET TOKEN
                            ================================= */

              // FIX: was "access_token" — same mismatch as loadCareer().
              const accessToken = await AsyncStorage.getItem("authToken");

              console.log("ACCESS TOKEN EXISTS:", !!accessToken);

              if (!accessToken) {
                Alert.alert("Session Expired", "Please login again.");

                return;
              }

              /* =================================
                               DELETE API
                            ================================= */

              console.log("========================================");

              console.log("CALLING DELETE CAREER API");

              console.log("METHOD:", "DELETE");

              console.log("ENDPOINT:", `/api/member/career/${deleteId}`);

              console.log("CAREER ID:", deleteId);

              console.log("========================================");

              const response = await deleteMemberCareerById(
                accessToken,
                deleteId,
              );

              /* =================================
                               DELETE RESPONSE
                            ================================= */

              console.log("========================================");

              console.log("DELETE CAREER API RESPONSE");

              console.log(JSON.stringify(response, null, 2));

              console.log("STATUS CODE:", response?.statusCode);

              console.log("MESSAGE:", response?.message);

              console.log("DATA:", JSON.stringify(response?.data, null, 2));

              console.log("========================================");

              /* =================================
                               REMOVE FROM UI IMMEDIATELY
                            ================================= */

              setCareers((previousCareers) =>
                previousCareers.filter((item) => {
                  const itemId = item?.id ?? item?.career_id ?? item?.careerId;

                  return String(itemId) !== String(deleteId);
                }),
              );

              /* =================================
                               SUCCESS MESSAGE
                            ================================= */

              Alert.alert(
                "Delete Successful",
                response?.message ||
                  `Career ID ${deleteId} deleted successfully.`,
              );
            } catch (error) {
              console.error("========================================");

              console.error("DELETE CAREER FAILED");

              console.error("CAREER ID:", deleteId);

              console.error("ERROR:", error);

              console.error("MESSAGE:", error?.message);

              console.error("STATUS:", error?.status);

              console.error(
                "RESPONSE:",
                JSON.stringify(error?.response, null, 2),
              );

              console.error("========================================");

              Alert.alert(
                "Delete Failed",
                error?.message || `Unable to delete career ID ${deleteId}.`,
              );
            }
          },
        },
      ],
    );
  };

  /* =====================================================
       LOAD SINGLE CAREER
    ===================================================== */

  const loadSingleCareer = async (careerId) => {
    try {
      // FIX: was "access_token" — same mismatch as above.
      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        Alert.alert("Session Expired", "Please login again.");

        return;
      }

      console.log("GETTING CAREER ID:", careerId);

      const response = await getMemberCareerById(accessToken, careerId);

      console.log("SINGLE CAREER RESPONSE:", JSON.stringify(response, null, 2));

      return response;
    } catch (error) {
      console.error("LOAD SINGLE CAREER ERROR:", error);

      Alert.alert(
        "Error",
        error?.message || "Unable to load career information.",
      );
    }
  };

  /* =====================================================
       RENDER CAREER ITEM
    ===================================================== */

  const renderCareerItem = (career, index) => {
    /* ================================================
           JOB TITLE
        ================================================ */

    const jobTitle =
      career?.job_title ||
      career?.jobTitle ||
      career?.designation ||
      career?.position ||
      career?.occupation ||
      career?.role ||
      "Career";

    /* ================================================
           COMPANY
        ================================================ */

    const companyName =
      career?.company_name ||
      career?.companyName ||
      career?.company ||
      career?.institution ||
      career?.organization ||
      "";

    /* ================================================
           START YEAR
        ================================================ */

    const startYear =
      career?.start ||
      career?.start_year ||
      career?.startYear ||
      career?.career_start ||
      "";

    /* ================================================
           END YEAR
        ================================================ */

    const endYear =
      career?.end ||
      career?.end_year ||
      career?.endYear ||
      career?.career_end ||
      "";

    /* ================================================
           PRESENT
        ================================================ */

    const isPresent =
      career?.present === true ||
      career?.present === 1 ||
      career?.is_present === true ||
      career?.is_present === 1;

    /* ================================================
           DURATION
        ================================================ */

    let duration = "";

    if (startYear && isPresent) {
      duration = `${startYear} - Present`;
    } else if (startYear && endYear) {
      duration = `${startYear} - ${endYear}`;
    } else if (startYear) {
      duration = String(startYear);
    }

    /* ================================================
           CAREER ID
        ================================================ */

    const careerId = career?.id ?? career?.career_id ?? career?.careerId;

    /* ================================================
           RETURN ITEM
        ================================================ */

    return (
      <View key={careerId ?? index} style={styles.careerItem}>
        {/* =========================================
                    CAREER ICON
                ========================================= */}

        <View style={styles.briefcaseCircle}>
          <Ionicons name="briefcase-outline" size={20} color={COLORS.red} />
        </View>

        {/* =========================================
                    CAREER DETAILS
                ========================================= */}

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

        {/* =========================================
                    ACTION BUTTONS
                ========================================= */}

        <View style={styles.actionButtons}>
          {/* EDIT */}

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.7}
            onPress={() => {
              console.log("EDIT CAREER ID:", careerId);

              if (!careerId) {
                Alert.alert("Error", "Career ID not found.");

                return;
              }

              router.push({
                pathname: "/EditCareer",

                params: {
                  id: String(careerId),
                },
              });
            }}
          >
            <Ionicons name="pencil-outline" size={15} color="#444444" />
          </TouchableOpacity>

          {/* DELETE */}

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.7}
            onPress={() => handleDeleteCareer(career)}
          >
            <Ionicons name="trash-outline" size={16} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* =====================================================
       UI
    ===================================================== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        {/* =========================================
                    HEADER
                ========================================= */}

        <View style={styles.header}>
          {/* BACK */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={18} color={COLORS.red} />
          </TouchableOpacity>

          {/* TITLE */}

          <Text style={styles.headerTitle}>Career Information</Text>

          {/* REFRESH */}

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
            onPress={handleRefresh}
          >
            <Ionicons name="ellipsis-vertical" size={17} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        {/* =========================================
                    MAIN CARD
                ========================================= */}

        <View style={styles.card}>
          {careers.length > 0 ? (
            <View style={styles.careerList}>
              {/* CAREER ITEMS */}

              {careers.map(renderCareerItem)}

              {/* =================================
                                ADD CAREER
                            ================================= */}

              <View style={styles.addCareerSection}>
                <View style={styles.addIconCircle}>
                  <Ionicons
                    name="briefcase-outline"
                    size={24}
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
                  <Ionicons name="add" size={18} color={COLORS.white} />

                  <Text style={styles.addButtonText}>Add Career</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* =================================
                           NO CAREER
                        ================================= */

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
                <Ionicons name="add" size={18} color={COLORS.white} />

                <Text style={styles.addButtonText}>Add Career</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 4,
  },

  /* =====================================================
           HEADER
        ===================================================== */

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

  /* =====================================================
           BACK
        ===================================================== */

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
    elevation: 1,
  },

  /* =====================================================
           HEADER TITLE
        ===================================================== */

  headerTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "600",
    color: COLORS.text,
    includeFontPadding: false,
    textAlign: "center",
  },

  /* =====================================================
           MENU
        ===================================================== */

  menuButton: {
    position: "absolute",
    right: 8,
    top: 5,
    width: 30,
    height: 31,
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
    borderColor: COLORS.border,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: "hidden",
  },

  /* =====================================================
           CAREER LIST
        ===================================================== */

  careerList: {
    flex: 1,
  },

  /* =====================================================
           CAREER ITEM
        ===================================================== */

  careerItem: {
    width: "100%",
    minHeight: 74,
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

  /* =====================================================
           BRIEFCASE
        ===================================================== */

  briefcaseCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  /* =====================================================
           CAREER DETAILS
        ===================================================== */

  careerDetails: {
    flex: 1,
    justifyContent: "center",
  },

  /* =====================================================
           JOB TITLE
        ===================================================== */

  jobTitle: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 2,
    includeFontPadding: false,
  },

  /* =====================================================
           COMPANY
        ===================================================== */

  companyName: {
    fontSize: 13,
    lineHeight: 16,
    color: COLORS.secondary,
    marginBottom: 1,
    includeFontPadding: false,
  },

  /* =====================================================
           DURATION
        ===================================================== */

  duration: {
    fontSize: 12,
    lineHeight: 14,
    color: COLORS.lightText,
    includeFontPadding: false,
  },

  /* =====================================================
           ACTION BUTTONS
        ===================================================== */

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 5,
  },

  /* =====================================================
           EDIT
        ===================================================== */

  editButton: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: COLORS.editBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  /* =====================================================
           DELETE
        ===================================================== */

  deleteButton: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: COLORS.lightRed,
    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================================
           ADD CAREER SECTION
        ===================================================== */

  addCareerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  /* =====================================================
           EMPTY CAREER
        ===================================================== */

  emptyCareerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  /* =====================================================
           ADD ICON
        ===================================================== */

  addIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  /* =====================================================
           ADD TITLE
        ===================================================== */

  addCareerTitle: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
    includeFontPadding: false,
  },

  /* =====================================================
           DESCRIPTION
        ===================================================== */

  addCareerDescription: {
    fontSize: 14,
    lineHeight: 17,
    color: COLORS.lightText,
    textAlign: "center",
    includeFontPadding: false,
  },

  /* =====================================================
           ADD BUTTON
        ===================================================== */

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
    elevation: 1,
  },

  /* =====================================================
           ADD BUTTON TEXT
        ===================================================== */

  addButtonText: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "600",
    color: COLORS.white,
    marginLeft: 4,
    includeFontPadding: false,
  },
});
