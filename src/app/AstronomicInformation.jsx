import { useCallback, useState } from "react";

import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

import { getMemberAstronomic } from "../utils/Functions";

const AstronomicInformation = () => {
  /* =========================================================
     STATE
  ========================================================= */

  const [astronomicData, setAstronomicData] = useState({
    sun_sign: "",
    moon_sign: "",
    time_of_birth: "",
    city_of_birth: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  /* =========================================================
     GET ASTRONOMIC INFORMATION API
     
     GET:
     /api/member/astronomic
  ========================================================= */

  const getAstronomicInformation = async () => {
    try {
      console.log("========================================");
      console.log("ASTRONOMIC INFORMATION API");
      console.log("========================================");

      const accessToken = await AsyncStorage.getItem("authToken"); // fixed: variable name matches usage below

      console.log("TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        console.log("ACCESS TOKEN NOT FOUND");
        setErrorMessage("Please login again.");
        return;
      }

      console.log("GET URL:", "/api/member/astronomic");

      const response = await getMemberAstronomic(accessToken);
      // ...rest unchanged

      console.log(
        "ASTRONOMIC INFORMATION RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      /* =====================================================
         RESPONSE VALIDATION
      ===================================================== */

      if (!response) {
        console.log("EMPTY RESPONSE");
        setErrorMessage("No information found.");
        return;
      }

      /* =====================================================
         HANDLE API DATA

         Depending on your API response, data may be:
         response.data
         OR
         response.data.data

         We handle both.
      ===================================================== */

      let data = response?.data;

      if (data?.data) {
        data = data.data;
      }

      console.log("ASTRONOMIC DATA:", JSON.stringify(data, null, 2));

      /* =====================================================
         SET DATA
      ===================================================== */

      setAstronomicData({
        sun_sign: data?.sun_sign ?? data?.sunSign ?? "",

        moon_sign: data?.moon_sign ?? data?.moonSign ?? "",

        time_of_birth: data?.time_of_birth ?? data?.timeOfBirth ?? "",

        city_of_birth: data?.city_of_birth ?? data?.cityOfBirth ?? "",
      });

      setErrorMessage("");
    } catch (error) {
      console.log("ASTRONOMIC INFORMATION ERROR:", error);

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
     LOAD / REFRESH DATA WHEN SCREEN IS FOCUSED

     No loading section is shown in the UI.
     When the user returns from EditAstronomicInformation,
     the latest saved values are fetched and displayed directly.
  ========================================================= */

  useFocusEffect(
    useCallback(() => {
      getAstronomicInformation();
    }, []),
  );

  /* =========================================================
     ONLY EDIT DETAILS BUTTON
  ========================================================= */

  const handleEditDetails = () => {
    console.log("EDIT DETAILS CLICKED");

    router.push("/EditAstronomicInformation");
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

            <Text style={styles.headerTitle} numberOfLines={1}>
              Astronomic Information
            </Text>

            <TouchableOpacity
              style={styles.menuButton}
              activeOpacity={0.7}
              onPress={() => {
                console.log("MENU CLICKED");
              }}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#D7192E" />
            </TouchableOpacity>
          </View>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* =================================================
              INFORMATION
          ================================================= */}

          <View style={styles.informationContainer}>
            {/* SUN SIGN */}

            <InformationRow
              icon="sunny"
              iconColor="#F5A800"
              iconBackground="#FFF5D8"
              title="Sun Sign"
              value={astronomicData.sun_sign || "Not available"}
            />

            {/* MOON SIGN */}

            <InformationRow
              icon="moon-outline"
              iconColor="#8145D7"
              iconBackground="#F2E9FF"
              title="Moon Sign"
              value={astronomicData.moon_sign || "Not available"}
            />

            {/* TIME OF BIRTH */}

            <InformationRow
              icon="time-outline"
              iconColor="#D7192E"
              iconBackground="#FFECEF"
              title="Time Of Birth"
              value={astronomicData.time_of_birth || "Not available"}
            />

            {/* CITY OF BIRTH */}

            <InformationRow
              icon="location-outline"
              iconColor="#2E7D32"
              iconBackground="#EAF7EA"
              title="City Of Birth"
              value={astronomicData.city_of_birth || "Not available"}
            />
          </View>

          {/* =================================================
              EDIT DETAILS
          ================================================= */}

          <TouchableOpacity
            style={styles.editDetailsButton}
            activeOpacity={0.8}
            onPress={handleEditDetails}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />

            <Text style={styles.editDetailsText}>Edit Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

/* =========================================================
   INFORMATION ROW
========================================================= */

const InformationRow = ({ icon, iconColor, iconBackground, title, value }) => {
  return (
    <View style={styles.infoRow}>
      {/* ICON */}

      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons name={icon} size={27} color={iconColor} />
      </View>

      {/* TEXT */}

      <View style={styles.textContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>

        <Text style={styles.valueText} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
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
    marginLeft: 4,
    color: "#C9142B",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "left",
  },

  menuButton: {
    width: 35,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  informationContainer: {
    paddingTop: 9,
    paddingHorizontal: 8,
  },

  infoRow: {
    minHeight: 77,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F6F6F6",
  },

  iconCircle: {
    width: 53,
    height: 53,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
    marginRight: 13,
  },

  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 5,
  },

  titleText: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 5,
  },

  valueText: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "500",
  },

  editDetailsButton: {
    height: 48,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 9,
    backgroundColor: "#D7192E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    // Removed old shadow* properties
    elevation: 3,
  },

  editDetailsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  errorContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  errorText: {
    color: "#D7192E",
    fontSize: 13,
    textAlign: "center",
  },
});

export default AstronomicInformation;
