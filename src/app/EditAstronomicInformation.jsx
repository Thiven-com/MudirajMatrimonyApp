import { useEffect, useState } from "react";

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

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";

import {
  getMemberAstronomic,
  updateMemberAstronomic,
} from "../utils/Functions";

const EditAstronomicInformation = () => {
  /* =========================================================
     ROUTER PARAMS
  ========================================================= */

  const params = useLocalSearchParams();

  const selectedField = params?.field || "";

  /* =========================================================
     STATE
  ========================================================= */

  const [sunSign, setSunSign] = useState("");
  const [moonSign, setMoonSign] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [cityOfBirth, setCityOfBirth] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =========================================================
     GET ASTRONOMIC INFORMATION
  ========================================================= */

  const loadAstronomicInformation = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        setErrorMessage("Please login again.");
        return;
      }

      console.log("GET /api/member/astronomic");

      const response = await getMemberAstronomic(accessToken);

      console.log(
        "EDIT ASTRONOMIC RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      if (!response) {
        setErrorMessage("Astronomic information not found.");
        return;
      }

      let data = response?.data;

      if (data?.data) {
        data = data.data;
      }

      /*
       * In case API response uses result
       */
      if (data?.result) {
        data = data.result;
      }

      console.log("EDIT ASTRONOMIC DATA:", JSON.stringify(data, null, 2));

      setSunSign(String(data?.sun_sign ?? data?.sunSign ?? ""));

      setMoonSign(String(data?.moon_sign ?? data?.moonSign ?? ""));

      setTimeOfBirth(String(data?.time_of_birth ?? data?.timeOfBirth ?? ""));

      setCityOfBirth(String(data?.city_of_birth ?? data?.cityOfBirth ?? ""));

      setErrorMessage("");
    } catch (error) {
      console.log("EDIT ASTRONOMIC ERROR:", error);

      console.log(
        "ERROR RESPONSE:",
        JSON.stringify(error?.response?.data, null, 2),
      );

      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to load astronomic information.",
      );
    }
  };

  /* =========================================================
     LOAD WHEN SCREEN OPENS
  ========================================================= */

  useEffect(() => {
    loadAstronomicInformation();
  }, []);

  const handleSave = async () => {
    if (saving) {
      return;
    }

    try {
      setErrorMessage("");
      setSaving(true);

      // -----------------------------------------------------
      // GET TOKEN
      // -----------------------------------------------------

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("========================================");

      console.log("SAVE ASTRONOMIC INFORMATION");

      console.log("TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        setErrorMessage("Please login again.");

        return;
      }

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

      const cleanSunSign = String(sunSign || "").trim();

      const cleanMoonSign = String(moonSign || "").trim();

      const cleanTimeOfBirth = String(timeOfBirth || "").trim();

      const cleanCityOfBirth = String(cityOfBirth || "").trim();

      if (!cleanSunSign) {
        setErrorMessage("Please enter Sun Sign.");

        return;
      }

      if (!cleanMoonSign) {
        setErrorMessage("Please enter Moon Sign.");

        return;
      }

      if (!cleanTimeOfBirth) {
        setErrorMessage("Please enter Time Of Birth.");

        return;
      }

      if (!cleanCityOfBirth) {
        setErrorMessage("Please enter City Of Birth.");

        return;
      }

      // -----------------------------------------------------
      // REQUEST BODY
      // -----------------------------------------------------

      const body = {
        sun_sign: cleanSunSign,
        moon_sign: cleanMoonSign,
        time_of_birth: cleanTimeOfBirth,
        city_of_birth: cleanCityOfBirth,
      };

      console.log("ASTRONOMIC UPDATE BODY:", JSON.stringify(body, null, 2));

      // -----------------------------------------------------
      // CALL POST API
      // -----------------------------------------------------

      const response = await updateMemberAstronomic(accessToken, body);

      console.log(
        "ASTRONOMIC UPDATE RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      // -----------------------------------------------------
      // CHECK RESPONSE
      // -----------------------------------------------------

      const success =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true;

      if (success) {
        Alert.alert(
          "Success",
          response?.message || "Astronomic information updated successfully.",
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
              },
            },
          ],
        );

        return;
      }

      // -----------------------------------------------------
      // API RETURNED FAILURE
      // -----------------------------------------------------

      const message =
        response?.message ||
        response?.error ||
        "Unable to update astronomic information.";

      setErrorMessage(message);

      Alert.alert("Update Failed", message);
    } catch (error) {
      console.error("SAVE ASTRONOMIC ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update astronomic information.";

      setErrorMessage(message);

      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     FIELD FOCUS
  ========================================================= */

  const shouldFocus = (field) => {
    return selectedField === field;
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F7" />

      <View style={styles.screenContainer}>
        <View style={styles.card}>
          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={29} color="#D7192E" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit Astronomic Information</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* =================================================
                ERROR
            ================================================= */}

            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* =================================================
                SUN SIGN
            ================================================= */}

            <View
              style={[
                styles.inputSection,
                shouldFocus("sun_sign") && styles.selectedSection,
              ]}
            >
              <View style={styles.labelRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="sunny" size={22} color="#F5A800" />
                </View>

                <Text style={styles.label}>Sun Sign</Text>
              </View>

              <TextInput
                value={sunSign}
                onChangeText={setSunSign}
                placeholder="Enter sun sign"
                placeholderTextColor="#999999"
                style={styles.input}
              />
            </View>

            {/* =================================================
                MOON SIGN
            ================================================= */}

            <View
              style={[
                styles.inputSection,
                shouldFocus("moon_sign") && styles.selectedSection,
              ]}
            >
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: "#F2E9FF",
                    },
                  ]}
                >
                  <Ionicons name="moon-outline" size={22} color="#8145D7" />
                </View>

                <Text style={styles.label}>Moon Sign</Text>
              </View>

              <TextInput
                value={moonSign}
                onChangeText={setMoonSign}
                placeholder="Enter moon sign"
                placeholderTextColor="#999999"
                style={styles.input}
              />
            </View>

            {/* =================================================
                TIME OF BIRTH
            ================================================= */}

            <View
              style={[
                styles.inputSection,
                shouldFocus("time_of_birth") && styles.selectedSection,
              ]}
            >
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: "#FFECEF",
                    },
                  ]}
                >
                  <Ionicons name="time-outline" size={22} color="#D7192E" />
                </View>

                <Text style={styles.label}>Time Of Birth</Text>
              </View>

              <TextInput
                value={timeOfBirth}
                onChangeText={setTimeOfBirth}
                placeholder="Enter time of birth"
                placeholderTextColor="#999999"
                style={styles.input}
              />
            </View>

            {/* =================================================
                CITY OF BIRTH
            ================================================= */}

            <View
              style={[
                styles.inputSection,
                shouldFocus("city_of_birth") && styles.selectedSection,
              ]}
            >
              <View style={styles.labelRow}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: "#EAF7EA",
                    },
                  ]}
                >
                  <Ionicons name="location-outline" size={22} color="#2E7D32" />
                </View>

                <Text style={styles.label}>City Of Birth</Text>
              </View>

              <TextInput
                value={cityOfBirth}
                onChangeText={setCityOfBirth}
                placeholder="Enter city of birth"
                placeholderTextColor="#999999"
                style={styles.input}
              />
            </View>

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            {/* =================================================
                CANCEL
            ================================================= */}

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  screenContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
  },

  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    paddingHorizontal: 8,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 5,
    color: "#C9142B",
    fontSize: 16,
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 30,
  },

  errorContainer: {
    backgroundColor: "#FFF0F2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  errorText: {
    color: "#D7192E",
    fontSize: 13,
    textAlign: "center",
  },

  inputSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 10,
    padding: 13,
    marginBottom: 14,
  },

  selectedSection: {
    borderColor: "#D7192E",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF5D8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  label: {
    flex: 1,
    color: "#444444",
    fontSize: 14,
    fontWeight: "700",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 8,
    paddingHorizontal: 13,
    color: "#444444",
    fontSize: 14,
    backgroundColor: "#FAFAFA",
  },

  saveButton: {
    height: 49,
    borderRadius: 9,
    backgroundColor: "#D7192E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  cancelButton: {
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  cancelText: {
    color: "#D7192E",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default EditAstronomicInformation;
