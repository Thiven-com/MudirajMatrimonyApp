import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import Fonts from "../constants/Fonts";
import { deleteMemberEducation, getMemberEducation } from "../utils/Functions";

export default function EducationInformation() {
  const navigation = useNavigation();

  const [educationList, setEducationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  /* ===
       BACK
    === */

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  /* ===
       ANDROID HARDWARE BACK
       Same pattern as EditSocialBackground / EditLanguages:
       intercept the hardware back button and route it through
       handleBack(), ignored while a delete is in progress.
    === */

  useEffect(() => {
    const handleHardwareBack = () => {
      if (deletingId !== null) {
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
  }, [handleBack, deletingId]);

  /* ===
       LOAD EDUCATION
    === */

  const loadEducation = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("GET EDUCATION TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        setEducationList([]);
        setError("Access token not found. Please login again.");
        return;
      }

      const response = await getMemberEducation(accessToken);

      console.log("GET EDUCATION RESPONSE:", JSON.stringify(response, null, 2));

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

      console.log("EDUCATION ARRAY:", JSON.stringify(educationData, null, 2));

      const formattedEducation = educationData
        .filter((item) => item && typeof item === "object")
        .map((item) => {
          const rawId =
            item.id ?? item.education_id ?? item.educationId ?? null;

          const id = rawId !== null ? Number(rawId) : null;

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
        .filter((item) => Number.isInteger(item.id) && item.id > 0);

      console.log(
        "FORMATTED EDUCATION:",
        JSON.stringify(formattedEducation, null, 2),
      );

      setEducationList(formattedEducation);
    } catch (err) {
      console.error("GET EDUCATION ERROR:", err);

      setEducationList([]);

      setError(err?.message || "Unable to load education information.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ===
       LOAD WHEN SCREEN FOCUSES
    === */

  useFocusEffect(
    useCallback(() => {
      loadEducation();
    }, [loadEducation]),
  );

  /* ===
   DELETE EDUCATION
=== */

  const handleDeleteEducation = (educationId) => {
    console.log("===");
    console.log("DELETE BUTTON CLICKED");
    console.log("RAW EDUCATION ID:", educationId);

    const numericId = Number(educationId);

    console.log("NUMERIC EDUCATION ID:", numericId);

    // -----------------------------------------------------
    // VALIDATE ID
    // -----------------------------------------------------

    if (!Number.isInteger(numericId) || numericId <= 0) {
      console.error("INVALID EDUCATION ID:", educationId);

      Alert.alert("Delete Failed", "Invalid education ID.");

      return;
    }

    // -----------------------------------------------------
    // PREVENT MULTIPLE DELETE REQUESTS
    // -----------------------------------------------------

    if (deletingId !== null) {
      console.log("DELETE ALREADY IN PROGRESS:", deletingId);

      return;
    }

    // -----------------------------------------------------
    // WEB
    // -----------------------------------------------------

    if (Platform.OS === "web") {
      console.log("WEB PLATFORM - CALLING DELETE API");

      performDelete(numericId);

      return;
    }

    // -----------------------------------------------------
    // ANDROID / IOS
    // -----------------------------------------------------

    Alert.alert(
      "Delete Education",
      "Are you sure you want to delete this education?",
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
          onPress: () => {
            console.log("DELETE CONFIRMED - CALLING API");

            performDelete(numericId);
          },
        },
      ],
    );
  };
  /* ===
   PERFORM DELETE
=== */

  const performDelete = async (numericId) => {
    try {
      console.log("===");
      console.log("PERFORM DELETE CALLED");
      console.log("EDUCATION ID:", numericId);

      setDeletingId(numericId);

      // -------------------------------------------------
      // GET ACCESS TOKEN
      // -------------------------------------------------

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("ACCESS TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        Alert.alert(
          "Login Required",
          "Your session has expired. Please login again.",
        );

        return;
      }

      // -------------------------------------------------
      // CALL DELETE API
      // -------------------------------------------------

      console.log("CALLING deleteMemberEducation...");

      const response = await deleteMemberEducation(accessToken, numericId);

      console.log("DELETE API RESPONSE:", JSON.stringify(response, null, 2));

      // -------------------------------------------------
      // CHECK RESPONSE
      // -------------------------------------------------

      const statusCode = Number(response?.statusCode ?? response?.status ?? 0);

      const success =
        response?.success === true ||
        response?.result === true ||
        (statusCode >= 200 && statusCode < 300);

      console.log("DELETE STATUS:", statusCode);

      console.log("DELETE SUCCESS:", success);

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      if (success) {
        console.log("===");

        console.log("EDUCATION DELETE SUCCESS");

        console.log("DELETED EDUCATION ID:", numericId);

        // Remove from screen
        setEducationList((previousList) =>
          previousList.filter((item) => Number(item.id) !== Number(numericId)),
        );

        // Show success message
        if (Platform.OS === "web") {
          window.alert(response?.message || "Education deleted successfully.");
        } else {
          Alert.alert(
            "Success",
            response?.message || "Education deleted successfully.",
          );
        }

        return;
      }

      // -------------------------------------------------
      // FAILURE
      // -------------------------------------------------

      const message =
        response?.message ||
        response?.data?.message ||
        response?.data?.error ||
        "Education could not be deleted.";

      if (Platform.OS === "web") {
        window.alert(`Delete Failed: ${message}`);
      } else {
        Alert.alert("Delete Failed", message);
      }
    } catch (error) {
      console.error("===");

      console.error("DELETE EDUCATION ERROR:", error);

      console.error("ERROR MESSAGE:", error?.message);

      console.error("ERROR STATUS:", error?.response?.status);

      console.error("ERROR DATA:", error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to delete education.";

      if (Platform.OS === "web") {
        window.alert(`Delete Failed: ${message}`);
      } else {
        Alert.alert("Delete Failed", String(message));
      }
    } finally {
      console.log("DELETE PROCESS FINISHED");

      setDeletingId(null);
    }
  };

  /* ===
       ADD EDUCATION
    === */

  const handleAddEducation = () => {
    navigation.navigate("AddEducation");
  };

  /* ===
       EDIT EDUCATION
    === */

  const handleEdit = (item) => {
    if (!item?.id) {
      Alert.alert("Error", "Education ID is missing.");

      return;
    }

    console.log("EDIT EDUCATION ID:", item.id);

    navigation.navigate("EditEducation", {
      id: String(item.id),
    });
  };

  /* ===
       MENU
    === */

  const handleMenu = () => {
    Alert.alert("Menu", "More options");
  };

  /* ===
       RENDER
    === */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Feather name="chevron-left" size={22} color="#EF233C" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Education Information</Text>

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
            onPress={handleMenu}
          >
            <Feather name="more-vertical" size={20} color="#EF233C" />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ERROR */}

          {error !== "" && (
            <Text style={styles.errorText}>{String(error)}</Text>
          )}

          {/* LOADING */}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#EF233C" />

              <Text style={styles.loadingText}>Loading education...</Text>
            </View>
          )}

          {/* EDUCATION LIST */}

          {!loading &&
            educationList.map((item) => {
              const isDeleting = deletingId === Number(item.id);

              return (
                <View key={String(item.id)} style={styles.educationCard}>
                  {/* ICON */}

                  <View style={styles.educationIconCircle}>
                    <Feather name="book-open" size={24} color="#EF233C" />
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

                  {/* EDIT BUTTON */}

                  <TouchableOpacity
                    style={styles.editCircle}
                    activeOpacity={0.7}
                    disabled={deletingId !== null}
                    onPress={() => handleEdit(item)}
                  >
                    <Feather name="edit-2" size={15} color="#64748B" />
                  </TouchableOpacity>

                  {/* DELETE BUTTON */}

                  <TouchableOpacity
                    style={[
                      styles.deleteCircle,
                      deletingId === Number(item.id) && styles.deleteDisabled,
                    ]}
                    activeOpacity={0.7}
                    disabled={deletingId !== null}
                    onPress={() => handleDeleteEducation(item.id)}
                  >
                    <Feather name="trash-2" size={15} color="#EF233C" />
                  </TouchableOpacity>
                </View>
              );
            })}

          {/* ADD EDUCATION */}

          {!loading && (
            <View style={styles.addEducationSection}>
              <View style={styles.centerIconCircle}>
                <Feather name="briefcase" size={28} color="#EF233C" />
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
                <Feather name="plus" size={19} color="#FFFFFF" />

                <Text style={styles.addEducationButtonText}>Add Education</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ===
   STYLES
=== */

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
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.lg,
    lineHeight: 20,
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

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  loadingText: {
    textAlign: "center",
    marginTop: 8,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
    color: "#737B87",
  },

  errorText: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 10,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.xs,
    color: "#EF233C",
  },

  educationCard: {
    width: "100%",
    minHeight: 84,
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
    borderRadius: 24,
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
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
    lineHeight: 17,
    color: "#292929",
    marginBottom: 1,
    includeFontPadding: false,
  },

  fieldText: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    lineHeight: 15,
    color: "#737B87",
    marginBottom: 1,
    includeFontPadding: false,
  },

  universityText: {
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.sm,
    lineHeight: 14,
    color: "#737B87",
    marginBottom: 1,
    includeFontPadding: false,
  },

  yearText: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
    lineHeight: 14,
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

  deleteDisabled: {
    opacity: 0.4,
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
    backgroundColor: "#FCF7F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  addEducationTitle: {
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
    lineHeight: 18,
    color: "#405064",
    textAlign: "center",
    includeFontPadding: false,
    marginBottom: 5,
  },

  addEducationDescription: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
    lineHeight: 16,
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
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
    lineHeight: 18,
    includeFontPadding: false,
    marginLeft: 5,
  },
});
