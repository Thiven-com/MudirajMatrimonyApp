import { useCallback, useEffect, useState } from "react";

import {
  BackHandler,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getLanguages, getMemberLanguages } from "../utils/Functions";

import Fonts from "../constants/Fonts";

/* =========================================================
   HELPERS
========================================================= */

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// Returns a positive integer id, or null.
const toId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : null;
};

// Name stored on a language object.
const readName = (item) => {
  if (item === null || item === undefined) {
    return "";
  }

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

// ID stored on a language item.
const readId = (item) => {
  if (isPlainObject(item)) {
    return toId(item.id ?? item.language_id ?? item.languageId);
  }

  if (typeof item === "number") {
    return toId(item);
  }

  // Numeric string such as "4"
  if (typeof item === "string" && /^\d+$/.test(item.trim())) {
    return toId(item.trim());
  }

  return null;
};

// Finds the first language-like array anywhere in response.
const findLanguageArray = (data, depth = 0) => {
  if (!data || typeof data !== "object" || depth > 6) {
    return null;
  }

  if (Array.isArray(data)) {
    if (
      data.length > 0 &&
      data.every((item) => isPlainObject(item) && readName(item) !== "")
    ) {
      return data;
    }

    for (const entry of data) {
      const found = findLanguageArray(entry, depth + 1);

      if (found) {
        return found;
      }
    }

    return null;
  }

  for (const key of Object.keys(data)) {
    const found = findLanguageArray(data[key], depth + 1);

    if (found) {
      return found;
    }
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

    if (id && name) {
      map.set(id, name);
    }
  });

  return map;
};

// Item from member response -> display name.
const resolveName = (item, nameMap) => {
  const id = readId(item);

  if (id && nameMap.has(id)) {
    return nameMap.get(id);
  }

  // If the item is only an ID and not found
  // in master list, don't display the ID.
  if (id && !isPlainObject(item)) {
    return "";
  }

  return readName(item);
};

// Remove duplicate language names.
const uniqueNames = (names) => {
  const seen = new Set();

  return names.filter((name) => {
    const key = String(name || "")
      .trim()
      .toLowerCase();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

// Unwrap { data: {...} } / { data: { data: {...} } }
const unwrapMember = (response) => {
  let data = response?.data ?? response ?? {};

  if (isPlainObject(data?.data)) {
    data = data.data;
  }

  return data;
};

// known_languages may be array, JSON string,
// or comma-separated string.
const toKnownArray = (value) => {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) {
      return [];
    }

    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text);

        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        // Continue with comma split
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


export default function Languages({ navigation, route }) {

  const [motherTongue, setMotherTongue] = useState("");

  const [knownLanguages, setKnownLanguages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");


  const loadLanguages = useCallback(async () => {
    try {
      setErrorMessage("");
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        setErrorMessage("Access token is missing. Please login again.");

        return;
      }

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

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
      return true;
    }
    return false;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadLanguages();
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack,
      );

      return () => subscription.remove();
    }, [handleBack, route]),
  );
  const editMotherTongue = () => {
    navigation.navigate("EditLanguages", {
      field: "motherTongue",
      page: route?.name,
      prevs: route?.params
    });
  };

  const editKnownLanguages = () => {
    navigation.navigate("EditLanguages", {
      field: "knownLanguages",
      page: route?.name,
      prevs: route?.params
    });
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => handleBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#222222" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Languages</Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ERROR */}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={22} color="#E53935" />

            <Text style={styles.errorText}>{errorMessage}</Text>

            <TouchableOpacity onPress={loadLanguages} activeOpacity={0.7}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}


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
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
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
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,
  },

  retryText: {
    marginLeft: 10,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.sm,
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
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    color: "#555555",
    marginBottom: 7,
  },

  value: {
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    color: "#222222",
  },

  emptyValue: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: "#999999",
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
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
    color: "#F44336",
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
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
    marginLeft: 8,
  },
});
