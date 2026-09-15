import { useCallback, useState } from "react";

import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router, useFocusEffect } from "expo-router";

import { deleteMemberEducation, getMemberEducation } from "../utils/Functions";

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EducationInformation() {
  const [educationList, setEducationList] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  /* =========================================================
       LOAD EDUCATION
    ========================================================= */

  const loadEducation = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      console.log("======================================");

      console.log("GET EDUCATION API");

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        setEducationList([]);

        setError("Access token not found. Please login again.");

        return;
      }

      const response = await getMemberEducation(accessToken);

      console.log("GET EDUCATION RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      /* =================================================
               EXTRACT ARRAY
            ================================================= */

      let educationData = [];

      if (Array.isArray(response)) {
        educationData = response;
      } else if (Array.isArray(response?.data)) {
        educationData = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        educationData = response.data.data;
      } else if (Array.isArray(response?.result)) {
        educationData = response.result;
      } else if (Array.isArray(response?.data?.result)) {
        educationData = response.data.result;
      }

      console.log("EDUCATION ARRAY:");

      console.log(JSON.stringify(educationData, null, 2));

      /* =================================================
               FORMAT DATA
            ================================================= */

      const formattedEducation = educationData
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          /*
           * IMPORTANT:
           * Only use real database ID.
           */

          const rawId =
            item.id ?? item.education_id ?? item.educationId ?? null;

          const id =
            rawId !== null && rawId !== undefined ? Number(rawId) : null;

          const degree =
            item.degree ??
            item.degree_name ??
            item.degreeName ??
            item.qualification ??
            item.qualification_name ??
            item.education ??
            "";

          const field =
            item.field ??
            item.field_of_study ??
            item.fieldOfStudy ??
            item.specialization ??
            item.specialisation ??
            item.course ??
            item.course_name ??
            item.courseName ??
            "";

          const university =
            item.university ??
            item.university_name ??
            item.universityName ??
            item.institution ??
            item.institution_name ??
            item.institutionName ??
            item.college ??
            item.college_name ??
            item.collegeName ??
            "";

          const startYear =
            item.start_year ??
            item.startYear ??
            item.from_year ??
            item.fromYear ??
            item.from ??
            "";

          const endYear =
            item.end_year ??
            item.endYear ??
            item.to_year ??
            item.toYear ??
            item.to ??
            "";

          return {
            id,

            degree: String(degree),

            field: String(field),

            university: String(university),

            startYear: String(startYear),

            endYear: String(endYear),
          };
        })
        /*
         * Do not display records without
         * a real database ID.
         */
        .filter((item) => Number.isInteger(item.id) && item.id > 0);

      console.log("FORMATTED EDUCATION:");

      console.log(JSON.stringify(formattedEducation, null, 2));

      setEducationList(formattedEducation);
    } catch (error) {
      console.error("GET EDUCATION ERROR:", error);

      setEducationList([]);

      setError(error?.message || "Unable to load education information.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
       LOAD WHEN SCREEN GETS FOCUS
    ========================================================= */

  useFocusEffect(
    useCallback(() => {
      loadEducation();
    }, [loadEducation]),
  );

  /* =========================================================
       DELETE EDUCATION
    ========================================================= */

  const handleDeleteEducation = async (educationId) => {
    const numericId = Number(educationId);

    console.log("======================================");

    console.log("DELETE BUTTON CLICKED");

    console.log("EDUCATION ID:", educationId);

    console.log("NUMERIC ID:", numericId);

    console.log("======================================");

    /* =====================================================
           VALIDATE ID
        ===================================================== */

    if (!Number.isInteger(numericId) || numericId <= 0) {
      console.log("Delete Failed : Invalid education ID.", numericId);
      Alert.alert("Delete Failed", "Invalid education ID.");

      return;
    }

    /* =====================================================
           PREVENT DOUBLE DELETE
        ===================================================== */

    if (deletingId !== null) {
      console.log("DELETE ALREADY IN PROGRESS");

      return;
    }

    console.log("Are you sure you want to delete this education?", numericId);
    Alert.alert(
      "Delete Education",
      "Are you sure you want to delete this education?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {
            try {
              setDeletingId(numericId);

              /* =================================
                               TOKEN
                            ================================= */

              const accessToken = await AsyncStorage.getItem("authToken");

              if (!accessToken) {
                Alert.alert("Login Required", "Please login again.");

                return;
              }

              /* =================================
                               LOG REQUEST
                            ================================= */

              console.log("======================================");

              console.log("DELETE EDUCATION REQUEST");

              console.log("METHOD: DELETE");

              console.log("ID:", numericId);

              console.log("TOKEN EXISTS:", !!accessToken);

              console.log("======================================");

              /* =================================
                               CALL DELETE API
                            ================================= */

              const response = await deleteMemberEducation(
                accessToken,
                numericId,
              );

              console.log("======================================");

              console.log("DELETE API RESPONSE");

              console.log(JSON.stringify(response, null, 2));

              console.log("======================================");

              /*
               * IMPORTANT
               *
               * deleteMemberEducation()
               * should return:
               *
               * {
               *    success: true,
               *    statusCode: 200
               * }
               *
               * OR
               *
               * {
               *    success: true,
               *    statusCode: 204
               * }
               *
               * Any HTTP 2xx should be treated
               * as successful.
               */

              const apiSuccess =
                response?.success === true ||
                response?.success === 1 ||
                response?.result === true ||
                response?.statusCode === 200 ||
                response?.statusCode === 201 ||
                response?.statusCode === 202 ||
                response?.statusCode === 204 ||
                response === true;

              if (apiSuccess) {
                /* =============================
                                   REMOVE FROM SCREEN IMMEDIATELY
                                ============================= */

                setEducationList((previousList) =>
                  previousList.filter((item) => Number(item.id) !== numericId),
                );

                Alert.alert("Success", "Education deleted successfully.");

                /*
                 * Reload from backend after
                 * successful deletion.
                 */

                setTimeout(() => {
                  loadEducation();
                }, 300);

                return;
              }

              Alert.alert(
                "Delete Failed",
                response?.message ||
                  response?.error ||
                  "Education could not be deleted.",
              );
            } catch (error) {
              console.error("======================================");

              console.error("DELETE EDUCATION ERROR");

              console.error(error);

              console.error("MESSAGE:", error?.message);

              console.error("======================================");

              Alert.alert(
                "Delete Failed",
                error?.message || "Unable to delete education.",
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  /* =========================================================
       ADD EDUCATION
    ========================================================= */

  const handleAddEducation = () => {
    router.push("/AddEducation");
  };

  /* =========================================================
       EDIT EDUCATION
    ========================================================= */

  const handleEdit = (item) => {
    if (!item?.id) {
      console.log("Education ID missing:", item);

      return;
    }

    console.log("EDIT EDUCATION ID:", item.id);

    router.push({
      pathname: "/EditEducation",

      params: {
        id: String(item.id),
      },
    });
  };

  /* =========================================================
       BACK
    ========================================================= */

  const handleBack = () => {
    router.back();
  };

  /* =========================================================
       MENU
    ========================================================= */

  const handleMenu = () => {
    Alert.alert("Menu", "More options");
  };

  /* =========================================================
       RENDER
    ========================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* ============================================
                    HEADER
                ============================================ */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={22} color="#EF233C" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Education Information</Text>

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
            onPress={handleMenu}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#EF233C" />
          </TouchableOpacity>
        </View>

        {/* ============================================
                    CONTENT
                ============================================ */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ========================================
                        ERROR
                    ======================================== */}

          {error !== "" && <Text style={styles.errorText}>{error}</Text>}

          {/* ========================================
                        LOADING
                    ======================================== */}

          {loading && (
            <Text style={styles.loadingText}>Loading education...</Text>
          )}

          {/* ========================================
                        EDUCATION LIST
                    ======================================== */}

          {!loading &&
            educationList.map((item) => (
              <View key={String(item.id)} style={styles.educationCard}>
                {/* ICON */}

                <View style={styles.educationIconCircle}>
                  <Ionicons name="school-outline" size={27} color="#EF233C" />
                </View>

                {/* DETAILS */}

                <View style={styles.educationDetails}>
                  <Text style={styles.degreeText} numberOfLines={1}>
                    {item.degree}
                  </Text>

                  <Text style={styles.fieldText} numberOfLines={1}>
                    {item.field}
                  </Text>

                  <Text style={styles.universityText} numberOfLines={1}>
                    {item.university}
                  </Text>

                  <Text style={styles.yearText}>
                    {item.startYear}
                    {" - "}
                    {item.endYear}
                  </Text>
                </View>

                {/* EDIT */}

                <TouchableOpacity
                  style={styles.editCircle}
                  activeOpacity={0.7}
                  onPress={() => handleEdit(item)}
                >
                  <Ionicons name="pencil-outline" size={17} color="#64748B" />
                </TouchableOpacity>

                {/* DELETE */}

                <TouchableOpacity
                  style={[
                    styles.deleteCircle,

                    deletingId === Number(item.id) && {
                      opacity: 0.4,
                    },
                  ]}
                  activeOpacity={0.7}
                  disabled={deletingId !== null}
                  onPress={() => handleDeleteEducation(item.id)}
                >
                  <Ionicons name="trash-outline" size={17} color="#EF233C" />
                </TouchableOpacity>
              </View>
            ))}

          {/* ========================================
                        ADD EDUCATION
                    ======================================== */}

          {!loading && (
            <View style={styles.addEducationSection}>
              <View style={styles.centerIconCircle}>
                <Ionicons name="briefcase-outline" size={32} color="#EF233C" />
              </View>

              <Text style={styles.addEducationTitle}>
                Add your education details
              </Text>

              <Text style={styles.addEducationDescription}>
                Help others know about your educational background
              </Text>

              <TouchableOpacity
                style={styles.addEducationButton}
                activeOpacity={0.85}
                onPress={handleAddEducation}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />

                <Text style={styles.addEducationButtonText}>Add Education</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

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

  backButton: {
    position: "absolute",
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFF1",
  },

  headerTitle: {
    fontSize: 18,
    lineHeight: 16,
    fontWeight: "700",
    color: "#171717",
    includeFontPadding: false,
    textAlign: "center",
  },

  menuButton: {
    position: "absolute",
    right: 7,
    width: 30,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 5,
    paddingBottom: 30,
  },

  loadingText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
    color: "#737B87",
  },

  errorText: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 10,
    fontSize: 11,
    color: "#EF233C",
  },

  educationCard: {
    width: "100%",
    height: 84,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    elevation: 1,
    marginBottom: 20,
    marginTop: 10,
  },

  educationIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 22,
    backgroundColor: "#FFF0F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  educationDetails: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },

  degreeText: {
    fontSize: 15,
    lineHeight: 14,
    fontWeight: "700",
    color: "#292929",
    marginBottom: 1,
    includeFontPadding: false,
  },

  fieldText: {
    fontSize: 13,
    lineHeight: 12,
    fontWeight: "400",
    color: "#737B87",
    marginBottom: 1,
    includeFontPadding: false,
  },

  universityText: {
    fontSize: 12,
    lineHeight: 12,
    fontWeight: "700",
    color: "#737B87",
    marginBottom: 1,
    includeFontPadding: false,
  },

  yearText: {
    fontSize: 12,
    lineHeight: 12,
    fontWeight: "400",
    color: "#737B87",
    includeFontPadding: false,
  },

  editCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F4F6F8",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    marginRight: 6,
  },

  deleteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF0F2",
    alignItems: "center",
    justifyContent: "center",
  },

  addEducationSection: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 15,
  },

  centerIconCircle: {
    width: 51,
    height: 51,
    borderRadius: 26,
    backgroundColor: "#fcf7f8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  addEducationTitle: {
    fontSize: 15,
    lineHeight: 15,
    fontWeight: "700",
    color: "#405064",
    textAlign: "center",
    includeFontPadding: false,
    marginBottom: 5,
  },

  addEducationDescription: {
    fontSize: 12,
    lineHeight: 13,
    fontWeight: "400",
    color: "#7D8795",
    textAlign: "center",
    includeFontPadding: false,
    marginBottom: 15,
    maxWidth: 290,
  },

  addEducationButton: {
    height: 50,
    minWidth: 120,
    paddingHorizontal: 13,
    borderRadius: 7,
    backgroundColor: "#E91E35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
  },

  addEducationButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 13,
    fontWeight: "700",
    includeFontPadding: false,
    marginLeft: 5,
  },
});
