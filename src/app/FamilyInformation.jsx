import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  BackHandler,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";
import Fonts from "../constants/Fonts";

import { getMemberFamilyInfo } from "../utils/Functions";

/* =========================================================
   FAMILY INFORMATION SCREEN
========================================================= */

export default function FamilyInformation() {
  const navigation = useNavigation();

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  /* =======================================================
     FAMILY STATE
  ======================================================= */

  const [familyData, setFamilyData] = useState({
    father: "",

    mother: "",

    sibling: "",
  });

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] = useState(true);

  /* =======================================================
     ERROR
  ======================================================= */

  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     ANDROID HARDWARE BACK
     Same pattern as EditSocialBackground / EducationInformation:
     intercept the hardware back button and route it through
     handleBack(), ignored while the screen is loading.
  ======================================================= */

  useEffect(() => {
    const handleHardwareBack = () => {
      if (loading) {
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
  }, [handleBack, loading]);

  /* =======================================================
     GET FAMILY INFORMATION
  ======================================================= */

  const loadFamilyInformation = useCallback(async () => {
    try {
      setLoading(true);

      setErrorMessage("");

      /* =================================================
           GET ACCESS TOKEN
        ================================================= */

      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("========================================");

      console.log("FAMILY INFORMATION SCREEN");

      console.log("TOKEN EXISTS:", !!accessToken);

      console.log("========================================");

      /* =================================================
           TOKEN CHECK
        ================================================= */

      if (!accessToken) {
        setErrorMessage("Please login again.");

        return;
      }

      /* =================================================
           CALL GET API
        ================================================= */

      const response = await getMemberFamilyInfo(accessToken);

      console.log("========================================");

      console.log("FAMILY API FULL RESPONSE:");

      console.log(JSON.stringify(response, null, 2));

      console.log("========================================");

      /* =================================================
           RESPONSE DATA
        ================================================= */

      let data = response?.data;

      /*
       * Handle possible response:
       *
       * {
       *   data: {
       *     father: "...",
       *     mother: "...",
       *     sibling: "..."
       *   }
       * }
       *
       * Also handles:
       *
       * {
       *   data: {
       *     data: {...}
       *   }
       * }
       */

      if (
        data &&
        typeof data === "object" &&
        data.data &&
        typeof data.data === "object"
      ) {
        data = data.data;
      }

      /* =================================================
           RESULT OBJECT
        ================================================= */

      if (
        data &&
        typeof data === "object" &&
        data.result &&
        typeof data.result === "object"
      ) {
        data = data.result;
      }

      console.log("FAMILY DATA USED BY SCREEN:", JSON.stringify(data, null, 2));

      /* =================================================
           SET FAMILY DATA
        ================================================= */

      setFamilyData({
        father: data?.father ?? data?.father_name ?? "",

        mother: data?.mother ?? data?.mother_name ?? "",

        sibling: data?.sibling ?? data?.siblings ?? data?.sibling_count ?? "",
      });
    } catch (error) {
      console.error("========================================");

      console.error("FAMILY INFORMATION SCREEN ERROR");

      console.error(error);

      console.error(
        "ERROR RESPONSE:",
        JSON.stringify(error?.response?.data, null, 2),
      );

      console.error("========================================");

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load family information.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD API WHEN SCREEN OPENS
  ======================================================= */

  useEffect(() => {
    loadFamilyInformation();
  }, [loadFamilyInformation]);

  /* =======================================================
     EDIT SINGLE FIELD
  ======================================================= */

  const handleEdit = (field) => {
    console.log("EDIT FAMILY FIELD:", field);

    navigation.navigate("EditFamilyInformation", {
      field,
    });
  };

  /* =======================================================
     EDIT DETAILS
  ======================================================= */

  const handleEditDetails = () => {
    console.log("EDIT FAMILY DETAILS CLICKED");

    navigation.navigate("EditFamilyInformation");
  };

  /* =======================================================
     MORE BUTTON
  ======================================================= */

  const handleMore = () => {
    console.log("FAMILY INFORMATION MORE CLICKED");
  };

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D7192A" />

          <Text style={styles.loadingText}>Loading family information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     MAIN SCREEN
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />

      <View style={styles.screen}>
        {/* =================================================
            CARD
        ================================================= */}

        <View style={styles.card}>
          {/* ===============================================
              HEADER
          =============================================== */}

          <View style={styles.header}>
            {/* HEADER ICON */}

            <View style={styles.headerIconContainer}>
              <Feather name="users" size={15} color="#D7192A" />
            </View>

            {/* TITLE */}

            <Text style={styles.headerTitle}>Family Information</Text>

            {/* MORE */}

            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleMore}
              activeOpacity={0.7}
            >
              <Feather name="more-vertical" size={17} color="#D7192A" />
            </TouchableOpacity>
          </View>

          {/* ===============================================
              DIVIDER
          =============================================== */}

          <View style={styles.divider} />

          {/* ===============================================
              ERROR
          =============================================== */}

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#D7192A" />

              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* ===============================================
              FATHER
          =============================================== */}

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => handleEdit("father")}
          >
            <View style={[styles.personIcon, styles.fatherIcon]}>
              <Feather name="user" size={14} color="#4A9BE8" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>Father</Text>

              <Text style={styles.value} numberOfLines={1}>
                {familyData.father || "Not added"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* ===============================================
              MOTHER
          =============================================== */}

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => handleEdit("mother")}
          >
            <View style={[styles.personIcon, styles.motherIcon]}>
              <Feather name="user" size={14} color="#E65A91" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>Mother</Text>

              <Text style={styles.value} numberOfLines={1}>
                {familyData.mother || "Not added"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* ===============================================
              SIBLING
          =============================================== */}

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() => handleEdit("sibling")}
          >
            <View style={[styles.personIcon, styles.siblingIcon]}>
              <Feather name="users" size={14} color="#4CAF78" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.label}>Sibling</Text>

              <Text style={styles.value} numberOfLines={1}>
                {familyData.sibling || "Not added"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* ===============================================
              EDIT DETAILS
          =============================================== */}

          <TouchableOpacity
            style={styles.editDetailsButton}
            onPress={handleEditDetails}
            activeOpacity={0.85}
          >
            <Feather name="edit" size={15} color="#FFFFFF" />

            <Text style={styles.editDetailsText}>Edit Details</Text>
          </TouchableOpacity>
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
    backgroundColor: "#F5F6F8",
  },

  /* =====================================================
       SCREEN
    ===================================================== */

  screen: {
    flex: 1,

    backgroundColor: "#F5F6F8",

    paddingHorizontal: 12,

    paddingTop: 12,
    paddingLeft: 6,
    paddingRight: 6,
  },

  /* =====================================================
       LOADING
    ===================================================== */

  loadingContainer: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#F5F6F8",
  },

  loadingText: {
    marginTop: 12,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,

    color: "#777777",
  },

  /* =====================================================
       CARD
    ===================================================== */

  card: {
    width: "100%",

    backgroundColor: "#FFFFFF",

    borderRadius: 12,

    paddingHorizontal: 10,

    paddingTop: 10,

    paddingBottom: 370,

    borderWidth: 1,

    borderColor: "#ECECF0",

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 6,

    elevation: 3,
  },

  /* =====================================================
       HEADER
    ===================================================== */

  header: {
    minHeight: 32,

    flexDirection: "row",

    alignItems: "center",

    marginBottom: 30,
  },

  /* =====================================================
       HEADER ICON
    ===================================================== */

  headerIconContainer: {
    width: 30,

    height: 30,

    borderRadius: 15,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#FFF0F2",

    marginRight: 9,
  },

  /* =====================================================
       HEADER TITLE
    ===================================================== */

  headerTitle: {
    flex: 1,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.lg,

    color: "#222222",
  },

  /* =====================================================
       MORE
    ===================================================== */

  moreButton: {
    width: 30,

    height: 30,

    borderRadius: 15,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#FFF7F8",
  },

  /* =====================================================
       DIVIDER
    ===================================================== */

  divider: {
    height: 1,

    backgroundColor: "#F0F0F0",

    marginBottom: 30,
  },

  /* =====================================================
       ERROR
    ===================================================== */

  errorBox: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFF1F2",

    borderRadius: 8,

    paddingHorizontal: 10,

    paddingVertical: 8,

    marginBottom: 50,
  },

  errorText: {
    flex: 1,

    marginLeft: 7,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,

    color: "#D7192A",
  },

  /* =====================================================
       ROW
    ===================================================== */

  row: {
    minHeight: 60,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: "#F5F5F5",
  },

  /* =====================================================
       PERSON ICON
    ===================================================== */

  personIcon: {
    width: 32,

    height: 32,

    borderRadius: 16,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 11,
  },

  fatherIcon: {
    backgroundColor: "#EAF5FF",
  },

  motherIcon: {
    backgroundColor: "#FFF0F6",
  },

  siblingIcon: {
    backgroundColor: "#EAF8F0",
  },

  /* =====================================================
       TEXT
    ===================================================== */

  textContainer: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",
  },

  label: {
    width: 65,

    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,

    color: "#444444",
  },

  value: {
    flex: 1,

    fontFamily: Fonts.regular,
    fontSize: Fonts.size.sm,

    color: "#777777",

    marginLeft: 8,
  },

  /* =====================================================
       EDIT ICON
    ===================================================== */

  editIconButton: {
    width: 29,

    height: 29,

    borderRadius: 15,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#F5F5F6",

    marginLeft: 8,
  },

  /* =====================================================
       EDIT DETAILS
    ===================================================== */

  editDetailsButton: {
    height: 43,

    width: "100%",

    marginTop: 90,

    borderRadius: 9,

    backgroundColor: "#D7192A",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    shadowColor: "#D7192A",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.18,

    shadowRadius: 5,

    elevation: 2,
  },

  editDetailsText: {
    marginLeft: 7,

    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,

    color: "#FFFFFF",
  },
});
