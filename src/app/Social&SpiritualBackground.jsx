import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getMemberSpiritualBackground } from "../utils/Functions";

const SocialBackgroundScreen = () => {
  const router = useRouter();

  // =========================================================
  // STATE
  // =========================================================

  const [socialBackground, setSocialBackground] = useState({});

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadError, setLoadError] = useState(null);

  // =========================================================
  // SAFE VALUE HELPER
  // =========================================================

  const getValue = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    return String(value);
  };

  // =========================================================
  // GET SPIRITUAL BACKGROUND API
  // =========================================================

  const loadSpiritualBackground = useCallback(async () => {
    try {
      setLoadError(null);

      console.log("======================================");

      console.log("LOADING SPIRITUAL BACKGROUND");

      // ---------------------------------------------------
      // GET TOKEN
      //
      // NOTE: this must use the same AsyncStorage key that
      // the rest of the app (e.g. EditSocialBackground) uses
      // to store the token, or this call is silently skipped.
      // ---------------------------------------------------

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        console.log("ACCESS TOKEN NOT FOUND");

        setLoadError("You're not logged in. Please login again.");

        return;
      }

      // ---------------------------------------------------
      // CALL API
      // ---------------------------------------------------

      const response = await getMemberSpiritualBackground(accessToken);

      // ---------------------------------------------------
      // LOG RESPONSE
      // ---------------------------------------------------

      console.log("======================================");

      console.log("SPIRITUAL BACKGROUND SCREEN RESPONSE");

      console.log(JSON.stringify(response, null, 2));

      console.log("======================================");

      // ---------------------------------------------------
      // FIND DATA
      // ---------------------------------------------------

      let data = {};

      if (response?.data && typeof response.data === "object") {
        data = response.data;
      } else if (response?.result && typeof response.result === "object") {
        data = response.result;
      } else if (
        response?.result?.data &&
        typeof response.result.data === "object"
      ) {
        data = response.result.data;
      } else if (typeof response === "object") {
        data = response;
      }

      // ---------------------------------------------------
      // SAVE DATA
      // ---------------------------------------------------

      setSocialBackground(data ?? {});
    } catch (error) {
      console.error("SPIRITUAL BACKGROUND SCREEN ERROR:", error);

      setLoadError(
        error?.message || "Unable to load your spiritual background.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // INITIAL API CALL
  // =========================================================

  useEffect(() => {
    loadSpiritualBackground();
  }, [loadSpiritualBackground]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadSpiritualBackground();
    } finally {
      setRefreshing(false);
    }
  };

  // =========================================================
  // API VALUE HELPERS
  //
  // Supports different possible API key names.
  // =========================================================

  const religion =
    socialBackground?.religion ??
    socialBackground?.religion_name ??
    socialBackground?.religion_id ??
    "-";

  const caste =
    socialBackground?.caste ??
    socialBackground?.caste_name ??
    socialBackground?.caste_id ??
    "-";

  const subCaste =
    socialBackground?.sub_caste ??
    socialBackground?.sub_caste_name ??
    socialBackground?.sub_caste_id ??
    "-";

  const ethnicity =
    socialBackground?.ethnicity_name ?? socialBackground?.ethnicity ?? "-";

  const personalValues =
    socialBackground?.personal_values ??
    socialBackground?.personal_value ??
    "-";

  const familyValue =
    socialBackground?.family_value ??
    socialBackground?.family_values ??
    socialBackground?.family_value_id ??
    "-";

  const communityValue =
    socialBackground?.community_value ??
    socialBackground?.community_values ??
    socialBackground?.community_value ??
    "-";
  // =========================================================
  // DETAILS
  // =========================================================

  const details = [
    {
      label: "Religion",
      value: getValue(religion),
      icon: "flower-outline",
      iconColor: "#E83E75",
      editable: true,
    },

    {
      label: "Caste",
      value: getValue(caste),
      icon: "people-outline",
      iconColor: "#F4B83F",
      editable: true,
    },

    {
      label: "Sub Caste",
      value: getValue(subCaste),
      icon: "planet-outline",
      iconColor: "#8D5BE8",
      editable: false,
      arrow: true,
    },

    {
      label: "Ethnicity",
      value: getValue(ethnicity),
      icon: "globe-outline",
      iconColor: "#4E9BE8",
      editable: false,
      arrow: true,
    },

    {
      label: "Personal Values",
      value: getValue(personalValues),
      icon: "star-outline",
      iconColor: "#F0B63D",
      editable: false,
      arrow: true,
    },

    {
      label: "Family Value",
      value: getValue(familyValue),
      icon: "home-outline",
      iconColor: "#63B85A",
      editable: false,
      arrow: true,
    },

    {
      label: "Community Value",
      value: getValue(communityValue),
      icon: "people-circle-outline",
      iconColor: "#E84887",
      editable: false,
      arrow: true,
    },
  ];

  // =========================================================
  // EDIT DETAILS
  // =========================================================

  const handleEdit = () => {
    console.log("EDIT DETAILS CLICKED");

    router.push("/EditSocialBackground");

    /*
      Change this route name to your actual
      edit screen route.

      Example:

      navigation.navigate(
        "EditSocialBackground"
      );
    */
  };

  // =========================================================
  // INDIVIDUAL EDIT
  // =========================================================

  const handleItemEdit = (item) => {
    console.log("EDIT ITEM:", item.label);

    /*
      If required:

      navigation.navigate(
        "EditSocialBackground",
        {
          field: item.label,
          data: socialBackground,
        }
      );
    */
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
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
              <Ionicons name="chevron-back" size={25} color="#D92332" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              Spiritual & Social Background
            </Text>

            <TouchableOpacity
              style={styles.menuButton}
              activeOpacity={0.7}
              onPress={() => console.log("MENU CLICKED")}
            >
              <Ionicons name="ellipsis-vertical" size={19} color="#D92332" />
            </TouchableOpacity>
          </View>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="small" color="#D92332" />

              <Text style={styles.stateText}>Loading your details…</Text>
            </View>
          ) : loadError ? (
            /* =================================================
                ERROR
            ================================================= */

            <View style={styles.stateContainer}>
              <Ionicons name="alert-circle-outline" size={22} color="#D92332" />

              <Text style={[styles.stateText, styles.stateErrorText]}>
                {loadError}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={loadSpiritualBackground}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* =================================================
                  DETAILS
              ================================================= */}

              <View style={styles.detailsContainer}>
                {details.map((item, index) => (
                  <View
                    key={item.label}
                    style={[
                      styles.row,

                      index === details.length - 1 && styles.lastRow,
                    ]}
                  >
                    {/* =========================================
                          LEFT ICON
                      ========================================= */}

                    <View
                      style={[
                        styles.iconCircle,

                        {
                          backgroundColor: item.iconColor + "18",
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={item.iconColor}
                      />
                    </View>

                    {/* =========================================
                          LABEL
                      ========================================= */}

                    <Text style={styles.label} numberOfLines={1}>
                      {item.label}
                    </Text>

                    {/* =========================================
                          VALUE
                      ========================================= */}

                    <View style={styles.valueContainer}>
                      <Text style={styles.value} numberOfLines={1}>
                        {item.value}
                      </Text>
                    </View>

                    {/* =========================================
                          RIGHT ACTION
                      ========================================= */}

                    {item.editable ? (
                      <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.7}
                        onPress={() => handleItemEdit(item)}
                      >
                        <Ionicons name="pencil" size={12} color="#A7A7A7" />
                      </TouchableOpacity>
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#999999"
                        style={styles.arrow}
                      />
                    )}
                  </View>
                ))}
              </View>

              {/* =================================================
                  EDIT DETAILS BUTTON
              ================================================= */}

              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.85}
                onPress={handleEdit}
              >
                <Ionicons name="pencil" size={15} color="#FFFFFF" />

                <Text style={styles.editButtonText}>Edit Details</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SocialBackgroundScreen;

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 0,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,

    paddingTop: 20,

    paddingBottom: 210,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 6,

    elevation: 3,
  },

  // =======================================================
  // HEADER
  // =======================================================

  header: {
    height: 48,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 8,

    borderBottomWidth: 1,

    borderBottomColor: "#F2F2F2",
  },

  backButton: {
    width: 30,
    height: 30,

    justifyContent: "center",

    alignItems: "center",
  },

  headerTitle: {
    flex: 1,

    textAlign: "center",

    color: "#D92332",

    fontSize: 17,

    fontWeight: "700",

    marginLeft: 4,
  },

  menuButton: {
    width: 30,
    height: 30,

    justifyContent: "center",

    alignItems: "center",
  },

  // =======================================================
  // LOADING / ERROR STATE
  // =======================================================

  stateContainer: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,

    alignItems: "center",
  },

  stateText: {
    marginTop: 10,

    color: "#8A8080",

    fontSize: 13,

    fontWeight: "500",

    textAlign: "center",
  },

  stateErrorText: {
    color: "#B23327",
  },

  retryButton: {
    marginTop: 16,

    paddingHorizontal: 18,
    paddingVertical: 9,

    borderRadius: 7,

    backgroundColor: "#D92332",
  },

  retryButtonText: {
    color: "#FFFFFF",

    fontSize: 13,

    fontWeight: "700",
  },

  // =======================================================
  // DETAILS
  // =======================================================

  detailsContainer: {
    paddingHorizontal: 12,

    paddingTop: 18,

    paddingBottom: 30,
  },

  row: {
    minHeight: 60,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 3,

    borderBottomColor: "#F5F5F5",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  iconCircle: {
    width: 20,
    height: 20,

    borderRadius: 10,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 8,
  },

  label: {
    width: 88,

    color: "#777777",

    fontSize: 13,

    fontWeight: "500",
  },

  valueContainer: {
    flex: 1,

    paddingLeft: 50,

    paddingRight: 4,
  },

  value: {
    color: "#555555",

    fontSize: 13,

    fontWeight: "600",
  },

  actionButton: {
    width: 22,
    height: 22,

    borderRadius: 11,

    backgroundColor: "#F2F2F2",

    justifyContent: "center",

    alignItems: "center",
  },

  arrow: {
    width: 25,

    textAlign: "center",
  },

  // =======================================================
  // EDIT BUTTON
  // =======================================================

  editButton: {
    height: 37,

    marginHorizontal: 12,

    marginTop: 80,

    borderRadius: 7,

    backgroundColor: "#D92332",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    shadowColor: "#D92332",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,

    shadowRadius: 4,

    elevation: 2,
  },

  editButtonText: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "700",

    marginLeft: 6,
  },
});
