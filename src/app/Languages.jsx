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

import { getLanguages, getMemberLanguages } from "../utils/Functions";

/* =========================================================
   WHY THIS SCREEN LOOKS UP NAMES BY ID

   get_languages (master list) and get_member_languages
   return DIFFERENT names for the same id (e.g. id 4 is
   "తెలుగు" in the master list but "Tamil" in the member
   response). The edit screen saves ids from the master
   list, so this screen must also translate ids to names
   using the master list. The server's own name is used
   only as a fallback when an id is not in the master list.
========================================================= */

/* =========================================================
   HELPERS
========================================================= */

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// Returns a positive integer id, or null.
const toId = (value) => {
  if (value === null || value === undefined || value === "") return null;

  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : null;
};

// Name stored on a language object (server's own label).
const readName = (item) => {
  if (item === null || item === undefined) return "";

  if (typeof item === "string" || typeof item === "number") {
    return String(item).trim();
  }

  if (isPlainObject(item)) {
    return String(
      item.name ??
        item.language ??
        item.language_name ??
        item.languageName ??
        item.title ??
        item.label ??
        item.value ??
        "",
    ).trim();
  }

  return "";
};

// Id stored on a language item (object with id, or a bare id).
const readId = (item) => {
  if (isPlainObject(item)) {
    return toId(item.id ?? item.language_id ?? item.languageId);
  }

  if (typeof item === "number") return toId(item);

  // A numeric string such as "4" is an id; "Telugu" is a name.
  if (typeof item === "string" && /^\d+$/.test(item.trim())) {
    return toId(item.trim());
  }

  return null;
};

// Finds the first array of language-like objects anywhere in a response.
const findLanguageArray = (data, depth = 0) => {
  if (!data || typeof data !== "object" || depth > 6) return null;

  if (Array.isArray(data)) {
    if (
      data.length > 0 &&
      data.every((item) => isPlainObject(item) && readName(item) !== "")
    ) {
      return data;
    }

    for (const entry of data) {
      const found = findLanguageArray(entry, depth + 1);

      if (found) return found;
    }

    return null;
  }

  for (const key of Object.keys(data)) {
    const found = findLanguageArray(data[key], depth + 1);

    if (found) return found;
  }

  return null;
};

// Master list response -> Map(id -> name)
const buildNameMap = (response) => {
  const list = findLanguageArray(response) ?? [];
  const map = new Map();

  list.forEach((item) => {
    const id = readId(item);
    const name = readName(item);

    if (id && name) map.set(id, name);
  });

  return map;
};

// Item from the member response -> display name.
const resolveName = (item, nameMap) => {
  const id = readId(item);

  if (id && nameMap.has(id)) return nameMap.get(id);

  // Not in the master list: fall back to the server's label,
  // but never show a bare id number as a language name.
  if (id && !isPlainObject(item)) return "";

  return readName(item);
};

const uniqueNames = (names) => {
  const seen = new Set();

  return names.filter((name) => {
    const key = String(name || "")
      .trim()
      .toLowerCase();

    if (!key || seen.has(key)) return false;

    seen.add(key);

    return true;
  });
};

// Unwraps { data: {...} } / { data: { data: {...} } }.
const unwrapMember = (response) => {
  let data = response?.data ?? response ?? {};

  if (isPlainObject(data?.data)) data = data.data;

  return data;
};

// known_languages may be an array, a JSON string, or "a,b,c".
const toKnownArray = (value) => {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) return [];

    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text);

        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        // fall through to comma split
      }
    }

    return text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (isPlainObject(value)) {
    const nested =
      value.data ?? value.items ?? value.languages ?? value.known_languages;

    return Array.isArray(nested) ? nested : [value];
  }

  return [];
};

/* =========================================================
   LANGUAGES SCREEN
========================================================= */

export default function Languages() {
  const [motherTongue, setMotherTongue] = useState("");
  const [knownLanguages, setKnownLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     LOAD LANGUAGES
  ======================================================= */

  const loadLanguages = useCallback(async () => {
    try {
      setErrorMessage("");

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        setErrorMessage("Access token is missing. Please login again.");

        return;
      }

      // The master list is optional: if it fails, fall back to
      // the names the member endpoint returns.
      const [masterResult, memberResult] = await Promise.allSettled([
        getLanguages(accessToken),
        getMemberLanguages(accessToken),
      ]);

      if (memberResult.status === "rejected") {
        throw memberResult.reason;
      }

      const nameMap =
        masterResult.status === "fulfilled"
          ? buildNameMap(masterResult.value)
          : new Map();

      const member = unwrapMember(memberResult.value);

      const motherRaw =
        member?.mother_tongue ??
        member?.mothere_tongue ??
        member?.motherTongue ??
        member?.mother_tongue_id ??
        null;

      const knownRaw =
        member?.known_languages ??
        member?.knownLanguages ??
        member?.languages ??
        [];

      setMotherTongue(motherRaw ? resolveName(motherRaw, nameMap) : "");

      setKnownLanguages(
        uniqueNames(
          toKnownArray(knownRaw).map((item) => resolveName(item, nameMap)),
        ),
      );
    } catch (error) {
      console.error("LANGUAGES LOAD ERROR:", error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load languages.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever the screen opens or you return from editing.
  useFocusEffect(
    useCallback(() => {
      loadLanguages();
    }, [loadLanguages]),
  );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const editMotherTongue = () => {
    router.push({
      pathname: "/EditLanguages",
      params: { field: "motherTongue" },
    });
  };

  const editKnownLanguages = () => {
    router.push({
      pathname: "/EditLanguages",
      params: { field: "knownLanguages" },
    });
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}

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

      {/* CONTENT */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />

            <Text style={styles.errorText}>{errorMessage}</Text>

            <TouchableOpacity onPress={loadLanguages} activeOpacity={0.7}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* MOTHER TONGUE */}

        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="language-outline" size={22} color="#F44336" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>Mother Tongue</Text>

              <Text
                style={[
                  styles.value,
                  (loading || !motherTongue) && styles.emptyValue,
                ]}
              >
                {loading ? "Loading..." : motherTongue || "Not added"}
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

        {/* KNOWN LANGUAGES */}

        <View style={styles.card}>
          <View style={styles.cardLeft}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubbles-outline" size={22} color="#F44336" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>Known Languages</Text>

              {loading ? (
                <Text style={styles.emptyValue}>Loading...</Text>
              ) : knownLanguages.length > 0 ? (
                <View style={styles.languageList}>
                  {knownLanguages.map((language) => (
                    <View key={language} style={styles.languageChip}>
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

        {/* BOTTOM EDIT BUTTON */}

        <TouchableOpacity
          style={styles.bottomEditButton}
          onPress={editKnownLanguages}
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

  retryText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "700",
    color: "#D32F2F",
  },

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
    shadowOffset: { width: 0, height: 2 },

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

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF2F0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

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
