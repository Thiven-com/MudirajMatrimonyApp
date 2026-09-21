import {
  useCallback,
  useState,
} from "react";

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

import {
  router,
  useFocusEffect,
} from "expo-router";

import {
  getMemberFamilyInfo,
} from "../utils/Functions";

const FAMILY_CACHE_KEY = "member_family_info_cache";

export default function FamilyInformation() {
  const [familyData, setFamilyData] = useState({
    father: "",
    mother: "",
    sibling: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  // -------------------------------------------------------
  // CLEAN VALUE
  // -------------------------------------------------------

  const cleanValue = useCallback((value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value).trim();
  }, []);

  // -------------------------------------------------------
  // EXTRACT FAMILY DATA
  // Handles:
  // response
  // response.data
  // response.data.data
  // response.result
  // response.result.data
  // -------------------------------------------------------

  const extractFamilyData = useCallback(
    (response) => {
      console.log(
        "========== FAMILY RAW RESPONSE =========="
      );

      console.log(
        JSON.stringify(
          response,
          null,
          2
        )
      );

      let data = response;

      // Axios-like response
      if (
        data?.data &&
        typeof data.data === "object"
      ) {
        data = data.data;
      }

      // Another nested data
      if (
        data?.data &&
        typeof data.data === "object"
      ) {
        data = data.data;
      }

      // result object
      if (
        data?.result &&
        typeof data.result === "object" &&
        !Array.isArray(data.result)
      ) {
        data = data.result;
      }

      // result.data
      if (
        data?.data &&
        typeof data.data === "object"
      ) {
        data = data.data;
      }

      console.log(
        "========== FAMILY EXTRACTED DATA =========="
      );

      console.log(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      const father =
        data?.father ??
        data?.father_name ??
        data?.fatherName ??
        "";

      const mother =
        data?.mother ??
        data?.mother_name ??
        data?.motherName ??
        "";

      const sibling =
        data?.sibling ??
        data?.siblings ??
        data?.sibling_count ??
        data?.siblings_count ??
        data?.siblingCount ??
        "";

      return {
        father: cleanValue(father),
        mother: cleanValue(mother),
        sibling: cleanValue(sibling),
      };
    },
    [cleanValue]
  );

  // -------------------------------------------------------
  // LOAD CACHE
  // NO LOADING SCREEN
  // -------------------------------------------------------

  const loadCache = useCallback(
    async () => {
      try {
        const cached =
          await AsyncStorage.getItem(
            FAMILY_CACHE_KEY
          );

        if (!cached) {
          return false;
        }

        const parsed =
          JSON.parse(cached);

        if (
          !parsed ||
          typeof parsed !== "object"
        ) {
          return false;
        }

        const cachedData = {
          father: cleanValue(
            parsed.father
          ),
          mother: cleanValue(
            parsed.mother
          ),
          sibling: cleanValue(
            parsed.sibling
          ),
        };

        setFamilyData(cachedData);

        console.log(
          "========== FAMILY CACHE =========="
        );

        console.log(
          JSON.stringify(
            cachedData,
            null,
            2
          )
        );

        return true;
      } catch (error) {
        console.log(
          "FAMILY CACHE ERROR:",
          error?.message
        );

        return false;
      }
    },
    [cleanValue]
  );

  // -------------------------------------------------------
  // SAVE CACHE
  // -------------------------------------------------------

  const saveCache = useCallback(
    async (data) => {
      try {
        const cacheData = {
          father: cleanValue(
            data?.father
          ),
          mother: cleanValue(
            data?.mother
          ),
          sibling: cleanValue(
            data?.sibling
          ),
        };

        await AsyncStorage.setItem(
          FAMILY_CACHE_KEY,
          JSON.stringify(cacheData)
        );

        console.log(
          "FAMILY CACHE SAVED:",
          JSON.stringify(
            cacheData,
            null,
            2
          )
        );
      } catch (error) {
        console.log(
          "FAMILY CACHE SAVE ERROR:",
          error?.message
        );
      }
    },
    [cleanValue]
  );

  // -------------------------------------------------------
  // GET FAMILY INFORMATION
  // -------------------------------------------------------

  const loadFamilyInformation =
    useCallback(async () => {
      try {
        setErrorMessage("");

        const accessToken =
          await AsyncStorage.getItem(
            "access_token"
          );

        console.log(
          "========================================"
        );

        console.log(
          "GET MEMBER FAMILY INFORMATION"
        );

        console.log(
          "TOKEN EXISTS:",
          !!accessToken
        );

        console.log(
          "TOKEN LENGTH:",
          accessToken?.length || 0
        );

        console.log(
          "========================================"
        );

        if (!accessToken) {
          setErrorMessage(
            "Please login again."
          );

          return;
        }

        // -------------------------------------------------
        // GET API
        // -------------------------------------------------

        const response =
          await getMemberFamilyInfo(
            accessToken
          );

        console.log(
          "========================================"
        );

        console.log(
          "FAMILY API RESPONSE RECEIVED"
        );

        console.log(
          JSON.stringify(
            response,
            null,
            2
          )
        );

        console.log(
          "========================================"
        );

        const newData =
          extractFamilyData(
            response
          );

        console.log(
          "FAMILY DATA FOR SCREEN:",
          JSON.stringify(
            newData,
            null,
            2
          )
        );

        const hasData =
          newData.father !== "" ||
          newData.mother !== "" ||
          newData.sibling !== "";

        if (hasData) {
          setFamilyData(
            newData
          );

          await saveCache(
            newData
          );
        } else {
          console.log(
            "FAMILY API RETURNED EMPTY DATA"
          );
        }
      } catch (error) {
        console.error(
          "========================================"
        );

        console.error(
          "FAMILY INFORMATION GET ERROR"
        );

        console.error(
          "MESSAGE:",
          error?.message
        );

        console.error(
          "STATUS:",
          error?.response?.status
        );

        console.error(
          "RESPONSE:",
          JSON.stringify(
            error?.response?.data,
            null,
            2
          )
        );

        console.error(
          "========================================"
        );

        // Do NOT remove cached values
        setErrorMessage(
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load family information."
        );
      }
    }, [
      extractFamilyData,
      saveCache,
    ]);

  // -------------------------------------------------------
  // SCREEN FOCUS
  // -------------------------------------------------------

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const refreshFamily = async () => {
        // Show saved data immediately
        await loadCache();

        if (!mounted) {
          return;
        }

        // Get latest server data
        await loadFamilyInformation();
      };

      refreshFamily();

      return () => {
        mounted = false;
      };
    }, [
      loadCache,
      loadFamilyInformation,
    ])
  );

  // -------------------------------------------------------
  // EDIT FIELD
  // -------------------------------------------------------

  const handleEdit = useCallback(
    (field) => {
      console.log(
        "EDIT FAMILY FIELD:",
        field
      );

      router.push({
        pathname:
          "/EditFamilyInformation",
        params: {
          field,
        },
      });
    },
    []
  );

  // -------------------------------------------------------
  // EDIT ALL
  // -------------------------------------------------------

  const handleEditDetails =
    useCallback(() => {
      router.push(
        "/EditFamilyInformation"
      );
    }, []);

  // -------------------------------------------------------
  // MORE
  // -------------------------------------------------------

  const handleMore = () => {
    console.log(
      "FAMILY INFORMATION MORE CLICKED"
    );
  };

  // -------------------------------------------------------
  // UI
  // NO LOADING
  // -------------------------------------------------------

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F6F8"
      />

      <View style={styles.screen}>
        <View style={styles.card}>

          {/* HEADER */}

          <View style={styles.header}>
            <View
              style={
                styles.headerIconContainer
              }
            >
              <Ionicons
                name="people-outline"
                size={17}
                color="#D7192A"
              />
            </View>

            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              Family Information
            </Text>

            <TouchableOpacity
              style={styles.moreButton}
              onPress={handleMore}
              activeOpacity={0.7}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={19}
                color="#D7192A"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* ERROR */}

          {errorMessage ? (
            <View
              style={styles.errorBox}
            >
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#D7192A"
              />

              <Text
                style={styles.errorText}
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* FATHER */}

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() =>
              handleEdit("father")
            }
          >
            <View
              style={[
                styles.personIcon,
                styles.fatherIcon,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={15}
                color="#4A9BE8"
              />
            </View>

            <View
              style={styles.textContainer}
            >
              <Text
                style={styles.label}
              >
                Father
              </Text>

              <Text
                style={styles.value}
                numberOfLines={1}
              >
                {familyData.father ||
                  "Not added"}
              </Text>
            </View>

            <View
              style={styles.editIconButton}
            >
              <Ionicons
                name="create-outline"
                size={15}
                color="#777777"
              />
            </View>
          </TouchableOpacity>

          {/* MOTHER */}

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() =>
              handleEdit("mother")
            }
          >
            <View
              style={[
                styles.personIcon,
                styles.motherIcon,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={15}
                color="#E65A91"
              />
            </View>

            <View
              style={styles.textContainer}
            >
              <Text
                style={styles.label}
              >
                Mother
              </Text>

              <Text
                style={styles.value}
                numberOfLines={1}
              >
                {familyData.mother ||
                  "Not added"}
              </Text>
            </View>

            <View
              style={styles.editIconButton}
            >
              <Ionicons
                name="create-outline"
                size={15}
                color="#777777"
              />
            </View>
          </TouchableOpacity>

          {/* SIBLING */}

          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.8}
            onPress={() =>
              handleEdit("sibling")
            }
          >
            <View
              style={[
                styles.personIcon,
                styles.siblingIcon,
              ]}
            >
              <Ionicons
                name="people-outline"
                size={15}
                color="#4CAF78"
              />
            </View>

            <View
              style={styles.textContainer}
            >
              <Text
                style={styles.label}
              >
                Sibling
              </Text>

              <Text
                style={styles.value}
                numberOfLines={1}
              >
                {familyData.sibling ||
                  "Not added"}
              </Text>
            </View>

            <View
              style={styles.editIconButton}
            >
              <Ionicons
                name="create-outline"
                size={15}
                color="#777777"
              />
            </View>
          </TouchableOpacity>

          {/* EDIT DETAILS */}

          <TouchableOpacity
            style={
              styles.editDetailsButton
            }
            onPress={
              handleEditDetails
            }
            activeOpacity={0.85}
          >
            <Ionicons
              name="create-outline"
              size={16}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.editDetailsText
              }
            >
              Edit Details
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F5F6F8",
    paddingHorizontal: 6,
    paddingTop: 12,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: "#ECECF0",
    boxShadow:
      "0px 2px 6px rgba(0,0,0,0.08)",
    elevation: 3,
  },

  header: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  headerIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F2",
    marginRight: 9,
  },

  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#222222",
  },

  moreButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7F8",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 20,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    lineHeight: 17,
    color: "#D7192A",
  },

  row: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },

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

  textContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    width: 65,
    fontSize: 13,
    fontWeight: "600",
    color: "#444444",
  },

  value: {
    flex: 1,
    fontSize: 13,
    color: "#777777",
    marginLeft: 8,
  },

  editIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F6",
    marginLeft: 8,
  },

  editDetailsButton: {
    height: 45,
    width: "100%",
    marginTop: 25,
    borderRadius: 9,
    backgroundColor: "#D7192A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0px 3px 5px rgba(215,25,42,0.18)",
    elevation: 2,
  },

  editDetailsText: {
    marginLeft: 7,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});