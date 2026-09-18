import { useCallback, useState } from "react";

import {
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

import { getMemberLanguages } from "../utils/Functions";

/* =========================================================
   FIND VALUE DEEPLY INSIDE API RESPONSE
========================================================= */

const findValueDeep = (data, keys) => {
  if (data === null || data === undefined) {
    return undefined;
  }

  if (typeof data !== "object") {
    return undefined;
  }

  /* -------------------------------------------------------
     CHECK CURRENT OBJECT FIRST
  ------------------------------------------------------- */

  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null) {
      return data[key];
    }
  }

  /* -------------------------------------------------------
     SEARCH NESTED OBJECTS / ARRAYS
  ------------------------------------------------------- */

  for (const key of Object.keys(data)) {
    const value = data[key];

    if (value && typeof value === "object") {
      const found = findValueDeep(value, keys);

      if (found !== undefined) {
        return found;
      }
    }
  }

  return undefined;
};

/* =========================================================
   FIND VALUE WITH PRIORITY
   First search exact/specific keys.
   Generic "language" is searched only as fallback.
========================================================= */

const findKnownLanguageValue = (data) => {
  const specificValue = findValueDeep(data, [
    "known_languages",
    "knownLanguages",
    "known_language",
    "knownLanguage",
  ]);

  if (specificValue !== undefined) {
    return specificValue;
  }

  return findValueDeep(data, ["languages", "language"]);
};

/* =========================================================
   MOTHER TONGUE
========================================================= */

const getMotherTongue = (data) => {
  const value = findValueDeep(data, [
    "mother_tongue",
    "mothere_tongue",
    "motherTongue",
    "mother_tongue_name",
    "motherTongueName",
    "mother_language",
    "motherLanguage",
    "mother_language_name",
    "motherLanguageName",
  ]);

  console.log("========================================");

  console.log("FOUND MOTHER TONGUE:", value);

  console.log("MOTHER TONGUE TYPE:", typeof value);

  console.log("========================================");

  if (value === null || value === undefined) {
    return "";
  }

  /* -------------------------------------------------------
     OBJECT
  ------------------------------------------------------- */

  if (typeof value === "object" && !Array.isArray(value)) {
    const name =
      value?.name ??
      value?.language ??
      value?.language_name ??
      value?.languageName ??
      value?.title ??
      value?.label ??
      value?.value ??
      "";

    return String(name).trim();
  }

  /* -------------------------------------------------------
     ARRAY
  ------------------------------------------------------- */

  if (Array.isArray(value)) {
    const first = value.length > 0 ? getLanguageName(value[0]) : "";

    return first;
  }

  /* -------------------------------------------------------
     STRING / NUMBER
  ------------------------------------------------------- */

  return String(value).trim();
};

/* =========================================================
   LANGUAGE NAME
========================================================= */

const getLanguageName = (item) => {
  if (item === null || item === undefined) {
    return "";
  }

  /* -------------------------------------------------------
     STRING / NUMBER
  ------------------------------------------------------- */

  if (typeof item === "string" || typeof item === "number") {
    return String(item).trim();
  }

  /* -------------------------------------------------------
     OBJECT
  ------------------------------------------------------- */

  if (typeof item === "object" && !Array.isArray(item)) {
    return String(
      item?.name ??
        item?.language ??
        item?.language_name ??
        item?.languageName ??
        item?.title ??
        item?.label ??
        item?.value ??
        "",
    ).trim();
  }

  return "";
};

/* =========================================================
   REMOVE DUPLICATE LANGUAGES
========================================================= */

const removeDuplicateLanguages = (languages) => {
  const result = [];

  languages.forEach((language) => {
    const value = String(language || "").trim();

    if (!value) {
      return;
    }

    const exists = result.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (!exists) {
      result.push(value);
    }
  });

  return result;
};

/* =========================================================
   KNOWN LANGUAGES
========================================================= */

const getKnownLanguages = (data) => {
  const value = findKnownLanguageValue(data);

  console.log("========================================");

  console.log("FOUND KNOWN LANGUAGES:", value);

  console.log("KNOWN LANGUAGES TYPE:", typeof value);

  console.log("========================================");

  if (value === null || value === undefined) {
    return [];
  }

  /* =======================================================
     STRING
  ======================================================= */

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) {
      return [];
    }

    /* -----------------------------------------------------
       JSON ARRAY STRING

       Example:
       ["English","Hindi","Telugu"]
    ----------------------------------------------------- */

    if (text.startsWith("[") && text.endsWith("]")) {
      try {
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          const languages = parsed.map(getLanguageName).filter(Boolean);

          return removeDuplicateLanguages(languages);
        }
      } catch (error) {
        console.log("LANGUAGE JSON PARSE ERROR:", error);
      }
    }

    /* -----------------------------------------------------
       JSON OBJECT STRING

       Example:
       {"name":"Telugu"}
    ----------------------------------------------------- */

    if (text.startsWith("{") && text.endsWith("}")) {
      try {
        const parsed = JSON.parse(text);

        const language = getLanguageName(parsed);

        if (language) {
          return [language];
        }
      } catch (error) {
        console.log("LANGUAGE OBJECT JSON PARSE ERROR:", error);
      }
    }

    /* -----------------------------------------------------
       COMMA SEPARATED

       Example:
       English,Hindi,Telugu
    ----------------------------------------------------- */

    if (text.includes(",")) {
      return removeDuplicateLanguages(
        text
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      );
    }

    /* -----------------------------------------------------
       SINGLE LANGUAGE

       Example:
       Telugu
    ----------------------------------------------------- */

    return [text];
  }

  /* =======================================================
     ARRAY
  ======================================================= */

  if (Array.isArray(value)) {
    const languages = value
      .map(getLanguageName)
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    return removeDuplicateLanguages(languages);
  }

  /* =======================================================
     OBJECT
  ======================================================= */

  if (typeof value === "object") {
    /* -----------------------------------------------------
       Object containing array

       Example:
       {
         data: [...]
       }
    ----------------------------------------------------- */

    const nestedArray =
      value?.data ??
      value?.items ??
      value?.languages ??
      value?.known_languages ??
      value?.knownLanguages;

    if (Array.isArray(nestedArray)) {
      const languages = nestedArray.map(getLanguageName).filter(Boolean);

      return removeDuplicateLanguages(languages);
    }

    /* -----------------------------------------------------
       Single language object

       Example:
       {
         id: 1,
         name: "Telugu"
       }
    ----------------------------------------------------- */

    const single = getLanguageName(value);

    if (single) {
      return [single];
    }
  }

  return [];
};

/* =========================================================
   LANGUAGES SCREEN
========================================================= */

export default function Languages() {
  const [motherTongue, setMotherTongue] = useState("");

  const [knownLanguages, setKnownLanguages] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     LOAD LANGUAGES
  ======================================================= */

  const loadLanguages = useCallback(async () => {
    try {
      setErrorMessage("");

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("========================================");

      console.log("LANGUAGES SCREEN");

      console.log("GET MEMBER LANGUAGES");

      console.log("TOKEN EXISTS:", !!accessToken);

      console.log("========================================");

      /* ------------------------------------------------
             TOKEN CHECK
          ------------------------------------------------ */

      if (!accessToken) {
        setErrorMessage("Access token is missing. Please login again.");

        return;
      }

      /* ------------------------------------------------
             CALL GET API
          ------------------------------------------------ */

      const response = await getMemberLanguages(accessToken);

      console.log("========================================");

      console.log("MEMBER LANGUAGES API RESPONSE");

      console.log(JSON.stringify(response, null, 2));

      console.log("========================================");

      /* =================================================
             USE COMPLETE RESPONSE

             We intentionally pass the complete response
             to the recursive parser.

             This supports responses such as:

             {
               data: {
                 mother_tongue: "Telugu",
                 known_languages: [...]
               }
             }

             or:

             {
               result: {
                 data: {
                   mother_tongue: {...},
                   known_languages: [...]
                 }
               }
             }
          ================================================= */

      const data = response;

      /* ------------------------------------------------
             GET MOTHER TONGUE
          ------------------------------------------------ */

      const motherTongueValue = getMotherTongue(data);

      /* ------------------------------------------------
             GET KNOWN LANGUAGES
          ------------------------------------------------ */

      const knownLanguagesValue = getKnownLanguages(data);

      /* =================================================
             DISPLAY DEBUG
          ================================================= */

      console.log("========================================");

      console.log("DISPLAY VALUES");

      console.log("MOTHER TONGUE:", motherTongueValue);

      console.log("KNOWN LANGUAGES:", knownLanguagesValue);
      console.log("DISPLAY VALUES");
      console.log("MOTHER TONGUE:", motherTongueValue);
      console.log("KNOWN LANGUAGES:", knownLanguagesValue);

      console.log("========================================");

      /* ------------------------------------------------
             UPDATE SCREEN
          ------------------------------------------------ */

      setMotherTongue(motherTongueValue);

      setKnownLanguages(knownLanguagesValue);
    } catch (error) {
      console.error("========================================");

      console.error("LANGUAGES GET ERROR");

      console.error(error);

      console.error(
        "ERROR RESPONSE:",
        JSON.stringify(error?.response?.data, null, 2),
      );

      console.error("========================================");

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load languages.",
      );
    }
  }, []);

  /* =======================================================
     REFRESH WHEN SCREEN OPENS / RETURNS
  ======================================================= */

  useFocusEffect(
    useCallback(() => {
      loadLanguages();
    }, [loadLanguages]),
  );

  /* =======================================================
     EDIT MOTHER TONGUE
  ======================================================= */

  const editMotherTongue = () => {
    router.push({
      pathname: "/EditLanguages",

      params: {
        field: "motherTongue",
      },
    });
  };

  /* =======================================================
     EDIT KNOWN LANGUAGES
  ======================================================= */

  const editKnownLanguages = () => {
    router.push({
      pathname: "/EditLanguages",

      params: {
        field: "knownLanguages",
      },
    });
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ===================================================
          HEADER
      =================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#222222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Languages</Text>

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
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />

            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* =================================================
            MOTHER TONGUE
        ================================================= */}

        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="language-outline" size={22} color="#F44336" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>Mother Tongue</Text>

              <Text style={[styles.value, !motherTongue && styles.emptyValue]}>
                {motherTongue || "Not added"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={editMotherTongue}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>

        {/* =================================================
            KNOWN LANGUAGES
        ================================================= */}

        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubbles-outline" size={22} color="#F44336" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>Known Languages</Text>

              {knownLanguages.length > 0 ? (
                <View style={styles.languageList}>
                  {knownLanguages.map((language, index) => (
                    <View
                      key={`${language}-${index}`}
                      style={styles.languageChip}
                    >
                      <Text style={styles.languageText}>{language}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyValue}>Not added</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={editKnownLanguages}
            style={styles.editButton}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>

        {/* =================================================
            BOTTOM EDIT BUTTON
        ================================================= */}

        <TouchableOpacity
          style={styles.bottomEditButton}
          onPress={() => router.push("/EditLanguages")}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />

          <Text style={styles.bottomEditText}>Edit Languages</Text>
        </TouchableOpacity>
      </ScrollView>
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
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },

  headerRight: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  /* =====================================================
       ERROR
    ===================================================== */

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3F3",
    borderWidth: 1,
    borderColor: "#FFD2D2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#D32F2F",
    fontSize: 14,
  },

  /* =====================================================
       CARD
    ===================================================== */

  card: {
    width: "100%",
    minHeight: 90,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF2F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 7,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },

  emptyValue: {
    fontSize: 15,
    color: "#999999",
    fontWeight: "400",
  },

  /* =====================================================
       EDIT BUTTON
    ===================================================== */

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF2F0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  /* =====================================================
       LANGUAGES
    ===================================================== */

  languageList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingRight: 5,
  },

  languageChip: {
    backgroundColor: "#FFF2F0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },

  languageText: {
    fontSize: 14,
    color: "#F44336",
    fontWeight: "600",
  },

  /* =====================================================
       BOTTOM EDIT
    ===================================================== */

  bottomEditButton: {
    height: 52,
    backgroundColor: "#F44336",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  bottomEditText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
