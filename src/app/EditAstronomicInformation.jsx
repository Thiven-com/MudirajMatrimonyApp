import { useEffect, useState } from "react";

import {
  ActivityIndicator,
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";

import Feather from "react-native-vector-icons/Feather";

import Fonts from "../constants/Fonts";

import {
  getMemberAstronomic,
  updateMemberAstronomic,
} from "../utils/Functions";

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
   COMPONENT
========================================================= */

export default function EditAstronomicInformation() {
  const navigation = useNavigation();
  const route = useRoute();

  const selectedField = route?.params?.field || "";

  /* =======================================================
     STATES
  ======================================================= */

  const [sunSign, setSunSign] = useState("");
  const [moonSign, setMoonSign] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [cityOfBirth, setCityOfBirth] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     TOKEN
  ======================================================= */

  const getAccessToken = async () => {
    const tokenKeys = [
      "authToken",
      "access_token",
      "accessToken",
      "token",
      "userToken",
      "auth_token",
    ];

    for (const key of tokenKeys) {
      try {
        const storedValue = await AsyncStorage.getItem(key);

        if (!storedValue) continue;

        let accessToken = null;

        try {
          const parsedValue = JSON.parse(storedValue);

          if (typeof parsedValue === "object" && parsedValue !== null) {
            accessToken =
              parsedValue.token ||
              parsedValue.access_token ||
              parsedValue.authToken ||
              parsedValue.accessToken ||
              parsedValue.userToken ||
              null;
          } else if (typeof parsedValue === "string") {
            accessToken = parsedValue;
          }
        } catch {
          accessToken = storedValue;
        }

        if (accessToken) {
          return accessToken;
        }
      } catch (error) {
        console.log(`Token error (${key}):`, error);
      }
    }

    return null;
  };

  /* =======================================================
     LOAD ASTRONOMIC INFORMATION
  ======================================================= */

  const loadAstronomicInformation = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const accessToken = await getAccessToken();

      if (!accessToken) {
        setErrorMessage("Access token not found. Please login again.");
        return;
      }

      const response = await getMemberAstronomic(accessToken);

      console.log("Astronomic Information Response:", response);

      let data =
        response?.data?.data ??
        response?.data?.result ??
        response?.data ??
        response?.result ??
        response;

      if (Array.isArray(data)) {
        data = data[0];
      }

      if (
        data &&
        typeof data === "object" &&
        data.data &&
        typeof data.data === "object"
      ) {
        data = data.data;
      }

      if (!data || typeof data !== "object") {
        setErrorMessage("Unable to load astronomic information.");
        return;
      }

      setSunSign(String(data?.sun_sign ?? data?.sunSign ?? "").trim());

      setMoonSign(String(data?.moon_sign ?? data?.moonSign ?? "").trim());

      setTimeOfBirth(
        String(data?.time_of_birth ?? data?.timeOfBirth ?? "").trim(),
      );

      setCityOfBirth(
        String(data?.city_of_birth ?? data?.cityOfBirth ?? "").trim(),
      );
    } catch (error) {
      console.log("loadAstronomicInformation error:", error);

      setErrorMessage(
        error?.message || "Unable to load astronomic information.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD ON SCREEN OPEN
  ======================================================= */

  useEffect(() => {
    loadAstronomicInformation();
  }, []);

  /* =======================================================
     FOCUS SELECTED FIELD
  ======================================================= */

  const shouldFocus = (field) => {
    return selectedField === field;
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const accessToken = await getAccessToken();

      if (!accessToken) {
        Alert.alert(
          "Login Required",
          "Access token not found. Please login again.",
        );
        return;
      }

      const cleanSunSign = String(sunSign || "").trim();

      const cleanMoonSign = String(moonSign || "").trim();

      const cleanTimeOfBirth = String(timeOfBirth || "").trim();

      const cleanCityOfBirth = String(cityOfBirth || "").trim();

      /* ================================================
         VALIDATION
      ================================================= */

      if (!cleanSunSign) {
        Alert.alert("Validation", "Sun Sign is required.");
        return;
      }

      if (!cleanMoonSign) {
        Alert.alert("Validation", "Moon Sign is required.");
        return;
      }

      if (!cleanTimeOfBirth) {
        Alert.alert("Validation", "Time Of Birth is required.");
        return;
      }

      if (!cleanCityOfBirth) {
        Alert.alert("Validation", "City Of Birth is required.");
        return;
      }

      /* ================================================
         REQUEST BODY
      ================================================= */

      const body = {
        sun_sign: cleanSunSign,
        moon_sign: cleanMoonSign,
        time_of_birth: cleanTimeOfBirth,
        city_of_birth: cleanCityOfBirth,
      };

      console.log("Update Astronomic Body:", body);

      /* ================================================
         API
      ================================================= */

      const response = await updateMemberAstronomic(accessToken, body);

      console.log("Update Astronomic Response:", response);

      const success =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true;

      if (!success) {
        throw new Error(
          response?.message ||
            response?.error ||
            "Unable to update astronomic information.",
        );
      }

      Alert.alert("Success", "Astronomic information updated successfully.", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.log("handleSave error:", error);

      Alert.alert(
        "Update Failed",
        error?.message || "Unable to update astronomic information.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     INPUT COMPONENT
  ======================================================= */

  const renderInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    field,
    keyboardType = "default",
    multiline = false,
  }) => {
    const focused = shouldFocus(field);

    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          {label}
          <Text style={styles.required}> *</Text>
        </Text>

        <View
          style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}
        >
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.placeholder}
            style={[styles.input, multiline && styles.multilineInput]}
            keyboardType={keyboardType}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
          />
        </View>
      </View>
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        {/* ================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={22} color={COLORS.black} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Astronomic Information</Text>

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <Feather name="more-vertical" size={18} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        {/* ================================================
            CARD
        ================================================= */}

        <View style={styles.card}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.red} />

              <Text style={styles.loaderText}>Loading your details...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* ERROR */}

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Feather name="alert-circle" size={18} color={COLORS.red} />

                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* ========================================
                  SUN SIGN
              ======================================== */}

              {renderInput({
                label: "Sun Sign",
                value: sunSign,
                onChangeText: setSunSign,
                placeholder: "Enter Sun Sign",
                field: "sun_sign",
              })}

              {/* ========================================
                  MOON SIGN
              ======================================== */}

              {renderInput({
                label: "Moon Sign",
                value: moonSign,
                onChangeText: setMoonSign,
                placeholder: "Enter Moon Sign",
                field: "moon_sign",
              })}

              {/* ========================================
                  TIME OF BIRTH
              ======================================== */}

              {renderInput({
                label: "Time Of Birth",
                value: timeOfBirth,
                onChangeText: setTimeOfBirth,
                placeholder: "Enter Time Of Birth",
                field: "time_of_birth",
              })}

              {/* ========================================
                  CITY OF BIRTH
              ======================================== */}

              {renderInput({
                label: "City Of Birth",
                value: cityOfBirth,
                onChangeText: setCityOfBirth,
                placeholder: "Enter City Of Birth",
                field: "city_of_birth",
              })}

              {/* ========================================
                  SAVE BUTTON
              ======================================== */}

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>

              {/* ========================================
                  CANCEL BUTTON
              ======================================== */}

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
    color: COLORS.black,
  },

  menuButton: {
    padding: 8,
  },

  /* =====================================================
     CARD
  ===================================================== */

  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: 10,
    padding: 16,
    elevation: 2,
  },

  /* =====================================================
     LOADER
  ===================================================== */

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 10,
    color: COLORS.gray,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
  },

  /* =====================================================
     SCROLL
  ===================================================== */

  scrollContent: {
    paddingBottom: 25,
  },

  /* =====================================================
     ERROR
  ===================================================== */

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#F2C4C9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
    color: COLORS.red,
  },

  /* =====================================================
     FIELD
  ===================================================== */

  fieldContainer: {
    marginBottom: 18,
  },

  label: {
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    color: COLORS.black,
    marginBottom: 7,
  },

  required: {
    color: COLORS.red,
    fontFamily: Fonts.semiBold,
  },

  /* =====================================================
     INPUT
  ===================================================== */

  inputWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },

  inputWrapperFocused: {
    borderColor: COLORS.red,
  },

  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: COLORS.black,
  },

  multilineInput: {
    minHeight: 90,
  },

  /* =====================================================
     SAVE
  ===================================================== */

  saveButton: {
    height: 48,
    backgroundColor: COLORS.red,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
  },

  /* =====================================================
     CANCEL
  ===================================================== */

  cancelButton: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  cancelButtonText: {
    color: COLORS.black,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
  },
});
