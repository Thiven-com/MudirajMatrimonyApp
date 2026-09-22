import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  BackHandler,
  Modal,
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

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import {
  getLanguages,
  getMemberLanguages,
  updateMemberLanguages,
} from "../utils/Functions";

/* =========================================================
   WHY THIS FILE LOOKS DIFFERENT FROM THE OLD ONE

   updateMemberLanguages() (Functions.js) sends:

     { mothere_tongue: Number(id), known_languages: [ids] }

   It calls Number(...) on whatever you give it and DROPS
   anything that isn't a valid positive integer. The previous
   version of this screen collected free-typed language NAMES
   ("Telugu", "English", ...), so every save silently sent
   mothere_tongue: null and known_languages: [] — nothing was
   actually being saved.

   This version loads the real language list from
   getLanguages() and lets the user pick from it, so the
   screen always works in IDs, matching what the API expects.
========================================================= */

/* =========================================================
   RESPONSE NORMALIZERS
========================================================= */

// Recursively searches an API response for an array of
// language-like objects (anything with a "name" or "language"
// field), regardless of how deeply the backend nests it
// (response.data, response.data.data, response.result.languages,
// etc). This is more robust than guessing specific paths, since
// we don't have a confirmed shape for /api/get_languages.
const looksLikeLanguageItem = (item) =>
  item !== null &&
  typeof item === "object" &&
  !Array.isArray(item) &&
  (item.name !== undefined ||
    item.language !== undefined ||
    item.language_name !== undefined);

const findLanguageArray = (data, depth = 0) => {
  if (!data || typeof data !== "object" || depth > 6) {
    return null;
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && data.every(looksLikeLanguageItem)) {
      return data;
    }

    // Array might contain further nested wrappers (unlikely, but cheap to check)
    for (const entry of data) {
      const found = findLanguageArray(entry, depth + 1);

      if (found) return found;
    }

    return null;
  }

  for (const key of Object.keys(data)) {
    const value = data[key];

    if (value && typeof value === "object") {
      const found = findLanguageArray(value, depth + 1);

      if (found) return found;
    }
  }

  return null;
};

const extractArray = (response) => findLanguageArray(response) ?? [];

// Normalizes one language master-list row into { id, name }.
const normalizeLanguageOption = (item) => {
  if (item === null || item === undefined) return null;

  if (typeof item === "string" || typeof item === "number") {
    // Master list should really return objects with an id, but
    // handle a bare string/number gracefully just in case.
    return { id: null, name: String(item).trim() };
  }

  if (typeof item === "object") {
    const id = item?.id ?? item?.language_id ?? item?.languageId ?? null;

    const name =
      item?.name ??
      item?.language ??
      item?.language_name ??
      item?.languageName ??
      item?.title ??
      "";

    const numericId = Number(id);

    return {
      id: Number.isInteger(numericId) && numericId > 0 ? numericId : null,
      name: String(name).trim(),
    };
  }

  return null;
};

// Pulls the member's currently saved selection out of
// getMemberLanguages(), which may return names, ids, or
// objects depending on the backend version.
const extractMemberSelection = (response) => {
  let data = response?.data ?? response ?? {};

  if (
    data &&
    typeof data === "object" &&
    data.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
  ) {
    data = data.data;
  }

  const motherTongueRaw =
    data?.mother_tongue ??
    data?.mothere_tongue ??
    data?.motherTongue ??
    data?.mother_tongue_id ??
    null;

  const knownLanguagesRaw =
    data?.known_languages ?? data?.knownLanguages ?? data?.languages ?? [];

  return { motherTongueRaw, knownLanguagesRaw };
};

// Resolves a raw value (id, name, or object) from the member's
// saved data to an entry in the loaded language options list.
const resolveToOption = (rawValue, options) => {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  if (typeof rawValue === "object") {
    const id = Number(
      rawValue?.id ?? rawValue?.language_id ?? rawValue?.languageId,
    );

    if (Number.isInteger(id) && id > 0) {
      const match = options.find((option) => option.id === id);

      if (match) return match;
    }

    const name = String(
      rawValue?.name ?? rawValue?.language ?? rawValue?.language_name ?? "",
    )
      .trim()
      .toLowerCase();

    return options.find((option) => option.name.toLowerCase() === name) ?? null;
  }

  // Numeric-looking value -> try matching by ID first.
  const numeric = Number(rawValue);

  if (
    Number.isInteger(numeric) &&
    numeric > 0 &&
    String(rawValue).trim() === String(numeric)
  ) {
    const match = options.find((option) => option.id === numeric);

    if (match) return match;
  }

  // Otherwise treat it as a name.
  const name = String(rawValue).trim().toLowerCase();

  return options.find((option) => option.name.toLowerCase() === name) ?? null;
};

/* =========================================================
   API SUCCESS CHECK
========================================================= */

const isApiSuccess = (response) => {
  if (!response) return false;

  if (response?.success === true || response?.success === 1) return true;
  if (response?.result === true || response?.result === 1) return true;
  if (response?.data?.success === true || response?.data?.success === 1)
    return true;
  if (response?.data?.result === true || response?.data?.result === 1)
    return true;

  return false;
};

/* =========================================================
   EDIT LANGUAGES SCREEN
========================================================= */

export default function EditLanguages() {
  const navigation = useNavigation();
  const route = useRoute();

  const rawField = route?.params?.field;
  const field = Array.isArray(rawField) ? rawField[0] : rawField;

  const isMotherTongue = field === "motherTongue";

  /* =======================================================
     STATE
  ======================================================= */

  // Master list of { id, name } loaded from getLanguages().
  const [languageOptions, setLanguageOptions] = useState([]);

  // Selected mother tongue: { id, name } | null
  const [motherTongue, setMotherTongue] = useState(null);

  // Selected known languages: array of { id, name }
  const [knownLanguages, setKnownLanguages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Picker modal visibility ("motherTongue" | "knownLanguages" | null)
  const [activePicker, setActivePicker] = useState(null);

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  /* =======================================================
     ANDROID HARDWARE BACK
     Same pattern as ChatsScreen / OtpScreen / EditCareer /
     EditEducation / EditFamilyInformation: intercept the
     hardware back button and route it through handleBack(),
     ignored while saving.
  ======================================================= */

  useEffect(() => {
    const handleHardwareBack = () => {
      if (saving) {
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
  }, [handleBack, saving]);

  /* =======================================================
     LOAD MASTER LIST + MEMBER'S CURRENT SELECTION
  ======================================================= */

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        setErrorMessage("Access token is missing. Please login again.");

        return;
      }

      // ---------------------------------------------------
      // MASTER LIST (needed to resolve names <-> ids)
      // ---------------------------------------------------

      const languagesResponse = await getLanguages(accessToken);

      console.log(
        "RAW getLanguages() RESPONSE:",
        JSON.stringify(languagesResponse, null, 2),
      );

      const options = extractArray(languagesResponse)
        .map(normalizeLanguageOption)
        .filter((option) => option && option.id && option.name);

      console.log("LANGUAGE MASTER LIST:", JSON.stringify(options, null, 2));

      setLanguageOptions(options);

      // ---------------------------------------------------
      // MEMBER'S CURRENT SELECTION
      // ---------------------------------------------------

      const memberResponse = await getMemberLanguages(accessToken);

      const { motherTongueRaw, knownLanguagesRaw } =
        extractMemberSelection(memberResponse);

      const resolvedMotherTongue = resolveToOption(motherTongueRaw, options);

      const knownArray = Array.isArray(knownLanguagesRaw)
        ? knownLanguagesRaw
        : [];

      const resolvedKnown = knownArray
        .map((item) => resolveToOption(item, options))
        .filter(Boolean);

      // De-dupe by id
      const uniqueKnown = [
        ...new Map(resolvedKnown.map((item) => [item.id, item])).values(),
      ];

      setMotherTongue(resolvedMotherTongue);
      setKnownLanguages(uniqueKnown);

      console.log("RESOLVED MOTHER TONGUE:", resolvedMotherTongue);
      console.log("RESOLVED KNOWN LANGUAGES:", uniqueKnown);
    } catch (error) {
      console.error("EDIT LANGUAGES LOAD ERROR:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load languages.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /* =======================================================
     ADD / REMOVE KNOWN LANGUAGE
  ======================================================= */

  const toggleKnownLanguage = useCallback((option) => {
    setKnownLanguages((previous) => {
      const exists = previous.some((item) => item.id === option.id);

      if (exists) {
        return previous.filter((item) => item.id !== option.id);
      }

      return [...previous, option];
    });
  }, []);

  const handleRemoveKnownLanguage = useCallback((id) => {
    setKnownLanguages((previous) => previous.filter((item) => item.id !== id));
  }, []);

  /* =======================================================
     SELECT MOTHER TONGUE
  ======================================================= */

  const handleSelectMotherTongue = useCallback((option) => {
    setMotherTongue(option);
    setActivePicker(null);
  }, []);

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = useCallback(async () => {
    if (saving) return;

    if (isMotherTongue) {
      if (!motherTongue?.id) {
        Alert.alert("Required", "Please select your mother tongue.");

        return;
      }
    } else {
      if (knownLanguages.length === 0) {
        Alert.alert("Required", "Please add at least one known language.");

        return;
      }
    }

    try {
      setSaving(true);

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        throw new Error("Access token is missing. Please login again.");
      }

      const requestBody = {
        mother_tongue: motherTongue?.id ?? null,
        known_languages: knownLanguages.map((item) => item.id),
      };

      console.log(
        "LANGUAGE UPDATE REQUEST BODY:",
        JSON.stringify(requestBody, null, 2),
      );

      const response = await updateMemberLanguages(accessToken, requestBody);

      console.log(
        "LANGUAGE UPDATE RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      if (isApiSuccess(response)) {
        const successMessage =
          response?.message ||
          response?.data?.message ||
          "Languages updated successfully.";

        Alert.alert(
          "Success",
          successMessage,
          [{ text: "OK", onPress: handleBack }],
          { cancelable: false },
        );

        return;
      }

      const failureMessage =
        response?.message ||
        response?.data?.message ||
        "Unable to update languages.";

      Alert.alert("Update Failed", failureMessage);
    } catch (error) {
      console.error("LANGUAGE UPDATE ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update languages.";

      Alert.alert("Update Failed", message);
    } finally {
      setSaving(false);
    }
  }, [saving, isMotherTongue, motherTongue, knownLanguages, handleBack]);

  const handleRetry = useCallback(() => {
    loadData();
  }, [loadData]);

  /* =======================================================
     PICKER MODAL OPTIONS

     For "knownLanguages" mode, already-selected languages
     show a checkmark and tapping toggles them (multi-select,
     stays open). For "motherTongue" mode, tapping an option
     selects it and closes the modal (single-select).
  ======================================================= */

  const isKnownLanguagesPicker = activePicker === "knownLanguages";

  const renderPickerOption = (option) => {
    const isSelected = isKnownLanguagesPicker
      ? knownLanguages.some((item) => item.id === option.id)
      : motherTongue?.id === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={styles.modalOption}
        activeOpacity={0.7}
        onPress={() =>
          isKnownLanguagesPicker
            ? toggleKnownLanguage(option)
            : handleSelectMotherTongue(option)
        }
      >
        <Text
          style={[
            styles.modalOptionText,
            isSelected && styles.modalOptionTextSelected,
          ]}
        >
          {option.name}
        </Text>

        {isSelected ? <Feather name="check" size={18} color="#D7192A" /> : null}
      </TouchableOpacity>
    );
  };

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ===================================================
          HEADER
      =================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={24} color="#222222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isMotherTongue ? "Edit Mother Tongue" : "Edit Languages"}
        </Text>

        <View style={styles.headerRight} />
      </View>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Feather name="alert-circle" size={22} color="#D7192A" />
            </View>

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Unable to load languages</Text>

              <Text style={styles.errorText}>{errorMessage}</Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {loading ? (
          <Text style={styles.loadingText}>Loading languages...</Text>
        ) : (
          <>
            {/* =============================================
                MOTHER TONGUE
            ============================================= */}

            {isMotherTongue && (
              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <View style={styles.iconBox}>
                    <Feather name="globe" size={21} color="#D7192A" />
                  </View>

                  <View>
                    <Text style={styles.label}>Mother Tongue</Text>

                    <Text style={styles.labelSubText}>
                      Select your mother tongue
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.selectBox}
                  activeOpacity={0.7}
                  onPress={() => setActivePicker("motherTongue")}
                >
                  <Text
                    style={[
                      styles.selectValue,
                      !motherTongue && styles.selectPlaceholder,
                    ]}
                  >
                    {motherTongue?.name || "Select mother tongue"}
                  </Text>

                  <Feather name="chevron-down" size={18} color="#999999" />
                </TouchableOpacity>

                <Text style={styles.helperText}>
                  Your mother tongue will be shown on your profile.
                </Text>
              </View>
            )}

            {/* =============================================
                KNOWN LANGUAGES
            ============================================= */}

            {!isMotherTongue && (
              <View style={styles.section}>
                <View style={styles.labelRow}>
                  <View style={styles.iconBox}>
                    <Feather name="message-circle" size={21} color="#D7192A" />
                  </View>

                  <View>
                    <Text style={styles.label}>Known Languages</Text>

                    <Text style={styles.labelSubText}>
                      Select the languages you know
                    </Text>
                  </View>
                </View>

                {/* -----------------------------------------
                    SELECTED LANGUAGES
                ------------------------------------------ */}

                <View style={styles.languagesContainer}>
                  {knownLanguages.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Feather name="globe" size={25} color="#AAAAAA" />

                      <Text style={styles.emptyText}>
                        No known languages added
                      </Text>
                    </View>
                  ) : (
                    knownLanguages.map((language) => (
                      <View key={language.id} style={styles.languageChip}>
                        <View style={styles.chipIcon}>
                          <Feather name="globe" size={14} color="#D7192A" />
                        </View>

                        <Text style={styles.languageChipText}>
                          {language.name}
                        </Text>

                        <TouchableOpacity
                          onPress={() => handleRemoveKnownLanguage(language.id)}
                          style={styles.removeButton}
                          activeOpacity={0.7}
                        >
                          <Feather name="x-circle" size={20} color="#D7192A" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>

                {/* -----------------------------------------
                    ADD LANGUAGE BUTTON
                ------------------------------------------ */}

                <TouchableOpacity
                  style={styles.addLanguageButton}
                  onPress={() => setActivePicker("knownLanguages")}
                  activeOpacity={0.8}
                >
                  <Feather name="plus" size={20} color="#D7192A" />

                  <Text style={styles.addLanguageButtonText}>
                    Add a language
                  </Text>
                </TouchableOpacity>

                <Text style={styles.helperText}>
                  Tap to select from the list. Selected languages are checked.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ===================================================
          SAVE BUTTON
      =================================================== */}

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || loading}
          activeOpacity={0.85}
        >
          <Feather name="check-circle" size={22} color="#FFFFFF" />

          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===================================================
          PICKER MODAL
      =================================================== */}

      <Modal
        visible={!!activePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePicker(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActivePicker(null)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isKnownLanguagesPicker
                  ? "Select Known Languages"
                  : "Select Mother Tongue"}
              </Text>

              <TouchableOpacity onPress={() => setActivePicker(null)}>
                <Feather name="x" size={22} color="#777777" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalOptionsList}>
              {languageOptions.length === 0 ? (
                <Text style={styles.modalEmptyText}>
                  No languages available.
                </Text>
              ) : (
                languageOptions.map(renderPickerOption)
              )}
            </ScrollView>

            {isKnownLanguagesPicker ? (
              <TouchableOpacity
                style={styles.modalDoneButton}
                activeOpacity={0.85}
                onPress={() => setActivePicker(null)}
              >
                <Text style={styles.modalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            ) : null}
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
    backgroundColor: "#FFFFFF",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#F8F8F8",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },

  headerRight: {
    width: 42,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },

  loadingText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 13,
    color: "#888888",
  },

  section: {
    width: "100%",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2",
    marginRight: 12,
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222222",
  },

  labelSubText: {
    marginTop: 3,
    fontSize: 12,
    color: "#888888",
  },

  // ---- select box (mother tongue) ----

  selectBox: {
    width: "100%",
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectValue: {
    fontSize: 16,
    color: "#222222",
    flex: 1,
  },

  selectPlaceholder: {
    color: "#999999",
  },

  helperText: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 19,
    color: "#888888",
  },

  // ---- known languages ----

  languagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },

  languageChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD5D8",
    borderRadius: 22,
    paddingLeft: 10,
    paddingRight: 7,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 9,
  },

  chipIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 7,
  },

  languageChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },

  removeButton: {
    width: 26,
    height: 26,
    marginLeft: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyContainer: {
    width: "100%",
    minHeight: 70,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#DDDDDD",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    backgroundColor: "#FAFAFA",
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: "#999999",
  },

  addLanguageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderWidth: 1,
    borderColor: "#FFD5D8",
    borderRadius: 12,
    backgroundColor: "#FFF7F7",
  },

  addLanguageButtonText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#D7192A",
  },

  // ---- error ----

  errorContainer: {
    flexDirection: "row",
    width: "100%",
    padding: 14,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFD5D8",
    backgroundColor: "#FFF5F5",
  },

  errorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE8EA",
  },

  errorContent: {
    flex: 1,
    marginLeft: 10,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D7192A",
  },

  errorText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#777777",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 9,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#D7192A",
  },

  retryText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ---- bottom save ----

  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },

  saveButton: {
    width: "100%",
    height: 54,
    borderRadius: 14,
    backgroundColor: "#D7192A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ---- picker modal ----

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "70%",
    paddingBottom: 10,
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
    color: "#D7192A",
    fontWeight: "700",
  },

  modalEmptyText: {
    textAlign: "center",
    paddingVertical: 30,
    color: "#999999",
    fontSize: 13,
  },

  modalDoneButton: {
    marginHorizontal: 18,
    marginTop: 8,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#D7192A",
    alignItems: "center",
    justifyContent: "center",
  },

  modalDoneButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
