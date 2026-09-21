import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Alert,
    KeyboardAvoidingView,
    Platform,
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
import {
    router,
    useLocalSearchParams,
} from "expo-router";

import {
    getMemberFamilyInfo,
    updateMemberFamilyInfo,
} from "../utils/Functions";

/* =========================================================
   CACHE KEY
========================================================= */

const FAMILY_CACHE_KEY = "member_family_info_cache";

/* =========================================================
   EDIT FAMILY INFORMATION
========================================================= */

export default function EditFamilyInformation() {
  /* =======================================================
     ROUTER PARAMS
  ======================================================= */

  const params = useLocalSearchParams();

  const selectedField = String(
    params?.field || ""
  ).toLowerCase();

  /* =======================================================
     INPUT STATES
  ======================================================= */

  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [sibling, setSibling] = useState("");

  /* =======================================================
     SCREEN STATES

     IMPORTANT:
     No loading state is used.
  ======================================================= */

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     REFS
  ======================================================= */

  const fatherRef = useRef(null);
  const motherRef = useRef(null);
  const siblingRef = useRef(null);

  /* =======================================================
     HELPERS
  ======================================================= */

  const cleanString = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value).trim();
  };

  /* =======================================================
     EXTRACT API DATA
  ======================================================= */

  const extractFamilyData = useCallback((response) => {
    let data = response;

    /*
      Possible structures:

      {
        data: {
          father: "...",
          mother: "...",
          sibling: "..."
        }
      }

      OR

      {
        data: {
          data: {
            father: "...",
            mother: "...",
            sibling: "..."
          }
        }
      }

      OR

      {
        result: {
          father: "...",
          mother: "...",
          sibling: "..."
        }
      }
    */

    if (
      data?.data &&
      typeof data.data === "object" &&
      !Array.isArray(data.data)
    ) {
      data = data.data;
    }

    if (
      data?.data &&
      typeof data.data === "object" &&
      !Array.isArray(data.data)
    ) {
      data = data.data;
    }

    if (
      data?.result &&
      typeof data.result === "object" &&
      !Array.isArray(data.result)
    ) {
      data = data.result;
    }

    if (
      data?.result?.data &&
      typeof data.result.data === "object" &&
      !Array.isArray(data.result.data)
    ) {
      data = data.result.data;
    }

    const fatherValue =
      data?.father ??
      data?.father_name ??
      data?.fatherName ??
      "";

    const motherValue =
      data?.mother ??
      data?.mother_name ??
      data?.motherName ??
      "";

    const siblingValue =
      data?.sibling ??
      data?.siblings ??
      data?.sibling_count ??
      data?.siblings_count ??
      data?.siblingCount ??
      "";

    return {
      father: cleanString(fatherValue),
      mother: cleanString(motherValue),
      sibling: cleanString(siblingValue),
    };
  }, []);

  /* =======================================================
     APPLY DATA TO INPUTS
  ======================================================= */

  const applyFamilyData = useCallback(
    (data) => {
      if (!data) {
        return;
      }

      if (
        data.father !== undefined &&
        data.father !== null
      ) {
        setFather(
          cleanString(data.father)
        );
      }

      if (
        data.mother !== undefined &&
        data.mother !== null
      ) {
        setMother(
          cleanString(data.mother)
        );
      }

      if (
        data.sibling !== undefined &&
        data.sibling !== null
      ) {
        setSibling(
          cleanString(data.sibling)
        );
      }
    },
    []
  );

  /* =======================================================
     LOAD FAMILY INFORMATION

     No loading UI.
     API runs in background.
  ======================================================= */

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
          "EDIT FAMILY INFORMATION - GET"
        );

        console.log(
          "TOKEN EXISTS:",
          !!accessToken
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

        /*
          --------------------------------------------------
          FIRST: LOAD CACHE
          --------------------------------------------------
          This makes the inputs show immediately.
        */

        try {
          const cached =
            await AsyncStorage.getItem(
              FAMILY_CACHE_KEY
            );

          if (cached) {
            const parsed =
              JSON.parse(cached);

            console.log(
              "FAMILY CACHE:",
              JSON.stringify(
                parsed,
                null,
                2
              )
            );

            applyFamilyData(parsed);
          }
        } catch (cacheError) {
          console.log(
            "FAMILY CACHE READ ERROR:",
            cacheError?.message
          );
        }

        /*
          --------------------------------------------------
          SECOND: GET LATEST API DATA
          --------------------------------------------------
        */

        const response =
          await getMemberFamilyInfo(
            accessToken
          );

        console.log(
          "========================================"
        );

        console.log(
          "EDIT FAMILY API RESPONSE"
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

        const familyData =
          extractFamilyData(response);

        console.log(
          "EXTRACTED FAMILY DATA:",
          JSON.stringify(
            familyData,
            null,
            2
          )
        );

        /*
          Only replace values when API actually
          contains a value.
        */

        const hasApiValue =
          familyData.father !== "" ||
          familyData.mother !== "" ||
          familyData.sibling !== "";

        if (hasApiValue) {
          applyFamilyData(
            familyData
          );

          /*
            Save latest API values into cache.
          */

          await AsyncStorage.setItem(
            FAMILY_CACHE_KEY,
            JSON.stringify(
              familyData
            )
          );
        }
      } catch (error) {
        console.error(
          "========================================"
        );

        console.error(
          "GET FAMILY INFORMATION ERROR"
        );

        console.error(
          error
        );

        console.error(
          "MESSAGE:",
          error?.message
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

        /*
          Don't destroy existing input values if
          GET fails.
        */

        setErrorMessage(
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load family information."
        );
      }
    }, [
      applyFamilyData,
      extractFamilyData,
    ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadFamilyInformation();
  }, [
    loadFamilyInformation,
  ]);

  /* =======================================================
     AUTO FOCUS

     No loading dependency.
  ======================================================= */

  useEffect(() => {
    const timer =
      setTimeout(() => {
        if (
          selectedField === "father"
        ) {
          fatherRef.current?.focus();
        } else if (
          selectedField === "mother"
        ) {
          motherRef.current?.focus();
        } else if (
          selectedField === "sibling"
        ) {
          siblingRef.current?.focus();
        }
      }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedField]);

  /* =======================================================
     SAVE FAMILY INFORMATION
  ======================================================= */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    try {
      setErrorMessage("");

      /*
        Clean input values.
      */

      const fatherValue =
        String(father || "").trim();

      const motherValue =
        String(mother || "").trim();

      const siblingValue =
        String(sibling || "").trim();

      /* ===================================================
         VALIDATION
      =================================================== */

      if (!fatherValue) {
        Alert.alert(
          "Required",
          "Please enter father's name.",
          [
            {
              text: "OK",
              onPress: () => {
                fatherRef.current?.focus();
              },
            },
          ]
        );

        return;
      }

      if (!motherValue) {
        Alert.alert(
          "Required",
          "Please enter mother's name.",
          [
            {
              text: "OK",
              onPress: () => {
                motherRef.current?.focus();
              },
            },
          ]
        );

        return;
      }

      if (!siblingValue) {
        Alert.alert(
          "Required",
          "Please enter sibling information.",
          [
            {
              text: "OK",
              onPress: () => {
                siblingRef.current?.focus();
              },
            },
          ]
        );

        return;
      }

      /*
        Sibling must be a number.
      */

      if (!/^\d+$/.test(siblingValue)) {
        Alert.alert(
          "Invalid Value",
          "Sibling must contain numbers only.",
          [
            {
              text: "OK",
              onPress: () => {
                siblingRef.current?.focus();
              },
            },
          ]
        );

        return;
      }

      /* ===================================================
         TOKEN
      =================================================== */

      const accessToken =
        await AsyncStorage.getItem(
          "access_token"
        );

      if (!accessToken) {
        Alert.alert(
          "Login Required",
          "Your session has expired. Please login again."
        );

        return;
      }

      /* ===================================================
         SET SAVING
      =================================================== */

      setSaving(true);

      /* ===================================================
         REQUEST BODY
      =================================================== */

      const body = {
        father: fatherValue,
        mother: motherValue,
        sibling: siblingValue,
      };

      console.log(
        "========================================"
      );

      console.log(
        "SAVE FAMILY INFORMATION"
      );

      console.log(
        "METHOD:",
        "POST"
      );

      console.log(
        "ENDPOINT:",
        "/api/member/family-info/update"
      );

      console.log(
        "REQUEST BODY:",
        JSON.stringify(
          body,
          null,
          2
        )
      );

      console.log(
        "TOKEN EXISTS:",
        !!accessToken
      );

      console.log(
        "========================================"
      );

      /* ===================================================
         UPDATE API
      =================================================== */

      const response =
        await updateMemberFamilyInfo(
          accessToken,
          body
        );

      console.log(
        "========================================"
      );

      console.log(
        "FAMILY UPDATE RESPONSE"
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

      /* ===================================================
         RESPONSE CHECK
      =================================================== */

      const responseData =
        response?.data;

      const responseStatus =
        response?.statusCode ??
        response?.status ??
        responseData?.statusCode ??
        responseData?.status;

      const explicitFailure =
        response?.success === 0 ||
        response?.success === false ||
        response?.result === false ||
        responseData?.success === 0 ||
        responseData?.success === false ||
        responseData?.result === false;

      const explicitSuccess =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true ||
        responseData?.success === 1 ||
        responseData?.success === true ||
        responseData?.result === true ||
        responseStatus === 200 ||
        responseStatus === 201;

      /*
        Axios/API wrapper may return an object
        without success:true.

        Therefore don't reject a normal non-null
        response unless the server explicitly says
        failure.
      */

      const success =
        !explicitFailure &&
        (
          explicitSuccess ||
          (
            response !== null &&
            response !== undefined
          )
        );

      const message =
        response?.message ||
        responseData?.message ||
        "Family information updated successfully.";

      /* ===================================================
         SUCCESS
      =================================================== */

      if (success) {
        /*
          IMPORTANT:
          Save the exact values locally immediately.
          The Family Information screen can use this
          while the GET API refreshes.
        */

        const updatedFamilyData = {
          father: fatherValue,
          mother: motherValue,
          sibling: siblingValue,
        };

        await AsyncStorage.setItem(
          FAMILY_CACHE_KEY,
          JSON.stringify(
            updatedFamilyData
          )
        );

        console.log(
          "FAMILY CACHE UPDATED:",
          JSON.stringify(
            updatedFamilyData,
            null,
            2
          )
        );

        /*
          Small delay gives AsyncStorage time to
          complete before going back.
        */

        Alert.alert(
          "Success",
          message,
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
              },
            },
          ],
          {
            cancelable: false,
          }
        );
      } else {
        setErrorMessage(
          message ||
          "Unable to update family information."
        );

        Alert.alert(
          "Update Failed",
          message ||
          "Unable to update family information."
        );
      }
    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "SAVE FAMILY INFORMATION ERROR"
      );

      console.error(
        error
      );

      console.error(
        "ERROR MESSAGE:",
        error?.message
      );

      console.error(
        "ERROR RESPONSE:",
        JSON.stringify(
          error?.response?.data,
          null,
          2
        )
      );

      console.error(
        "========================================"
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update family information.";

      setErrorMessage(
        message
      );

      Alert.alert(
        "Update Failed",
        message
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     INPUT FIELD
  ======================================================= */

  const InputField = ({
    label,
    value,
    onChangeText,
    inputRef,
    icon,
    iconColor,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "words",
    fieldName,
    maxLength,
  }) => {
    const isSelected =
      selectedField === fieldName;

    return (
      <View
        style={styles.fieldContainer}
      >
        {/* LABEL */}

        <View
          style={styles.fieldHeader}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  `${iconColor}18`,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={18}
              color={iconColor}
            />
          </View>

          <Text
            style={styles.fieldLabel}
          >
            {label}
          </Text>
        </View>

        {/* INPUT */}

        <View
          style={[
            styles.inputWrapper,
            isSelected &&
              styles.selectedInputWrapper,
          ]}
        >
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A5A5A5"
            style={styles.input}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            editable={!saving}
            returnKeyType={
              fieldName === "sibling"
                ? "done"
                : "next"
            }
            blurOnSubmit={
              fieldName === "sibling"
            }
            maxLength={maxLength}
            onSubmitEditing={() => {
              if (
                fieldName === "father"
              ) {
                motherRef.current?.focus();
              } else if (
                fieldName === "mother"
              ) {
                siblingRef.current?.focus();
              }
            }}
          />
        </View>
      </View>
    );
  };

  /* =======================================================
     MAIN UI

     NO LOADING SECTION
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F6F8"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={styles.card}
          >
            {/* HEADER */}

            <View
              style={styles.header}
            >
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={() => {
                  if (!saving) {
                    router.back();
                  }
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={25}
                  color="#D7192A"
                />
              </TouchableOpacity>

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
                Edit Family Information
              </Text>

              <View
                style={styles.headerRight}
              />
            </View>

            {/* DIVIDER */}

            <View
              style={styles.divider}
            />

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

            {/* DESCRIPTION */}

            <Text
              style={styles.description}
            >
              Update your family information below.
            </Text>

            {/* FATHER */}

            <InputField
              label="Father"
              value={father}
              onChangeText={setFather}
              inputRef={fatherRef}
              icon="person-outline"
              iconColor="#4A9BE8"
              placeholder="Enter father's name"
              autoCapitalize="words"
              fieldName="father"
              maxLength={100}
            />

            {/* MOTHER */}

            <InputField
              label="Mother"
              value={mother}
              onChangeText={setMother}
              inputRef={motherRef}
              icon="person-outline"
              iconColor="#E65A91"
              placeholder="Enter mother's name"
              autoCapitalize="words"
              fieldName="mother"
              maxLength={100}
            />

            {/* SIBLING */}

            <InputField
              label="Sibling"
              value={sibling}
              onChangeText={(text) => {
                /*
                  Only allow numbers.
                */

                const numbersOnly =
                  String(text || "").replace(
                    /[^0-9]/g,
                    ""
                  );

                setSibling(
                  numbersOnly
                );
              }}
              inputRef={siblingRef}
              icon="people-outline"
              iconColor="#4CAF78"
              placeholder="Enter number of siblings"
              keyboardType="number-pad"
              autoCapitalize="none"
              fieldName="sibling"
              maxLength={3}
            />

            {/* SAVE BUTTON */}

            <TouchableOpacity
              style={[
                styles.saveButton,
                saving &&
                  styles.disabledButton,
              ]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons
                name={
                  saving
                    ? "sync-outline"
                    : "checkmark-circle-outline"
                }
                size={19}
                color="#FFFFFF"
              />

              <Text
                style={styles.saveText}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.75}
              onPress={() => {
                if (!saving) {
                  router.back();
                }
              }}
              disabled={saving}
            >
              <Text
                style={styles.cancelText}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    /* =====================================================
       BASIC
    ===================================================== */

    flex: {
      flex: 1,
    },

    safeArea: {
      flex: 1,
      backgroundColor: "#F5F6F8",
    },

    /* =====================================================
       SCROLL
    ===================================================== */

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 30,
    },

    /* =====================================================
       CARD
    ===================================================== */

    card: {
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 20,

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
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
    },

    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 6,
      backgroundColor: "#FFF5F6",
    },

    headerIconContainer: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFF0F2",
      marginRight: 8,
    },

    headerTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: "700",
      color: "#222222",
    },

    headerRight: {
      width: 10,
    },

    /* =====================================================
       DIVIDER
    ===================================================== */

    divider: {
      height: 1,
      backgroundColor: "#F0F0F0",
      marginTop: 10,
      marginBottom: 16,
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
      paddingVertical: 9,
      marginBottom: 14,
    },

    errorText: {
      flex: 1,
      marginLeft: 7,
      fontSize: 12,
      lineHeight: 17,
      color: "#D7192A",
    },

    /* =====================================================
       DESCRIPTION
    ===================================================== */

    description: {
      fontSize: 13,
      lineHeight: 19,
      color: "#777777",
      marginBottom: 20,
    },

    /* =====================================================
       FIELD
    ===================================================== */

    fieldContainer: {
      marginBottom: 18,
    },

    fieldHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },

    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 9,
    },

    fieldLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: "#333333",
    },

    /* =====================================================
       INPUT
    ===================================================== */

    inputWrapper: {
      width: "100%",
      minHeight: 50,
      borderWidth: 1,
      borderColor: "#E3E3E6",
      borderRadius: 9,
      backgroundColor: "#FAFAFB",
      justifyContent: "center",
    },

    selectedInputWrapper: {
      borderColor: "#D7192A",
      backgroundColor: "#FFF9FA",
    },

    input: {
      width: "100%",
      minHeight: 50,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: "#222222",
      includeFontPadding: false,
    },

    /* =====================================================
       SAVE
    ===================================================== */

    saveButton: {
      width: "100%",
      height: 48,
      borderRadius: 9,
      backgroundColor: "#D7192A",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      marginTop: 4,

      shadowColor: "#D7192A",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.18,
      shadowRadius: 5,
      elevation: 2,
    },

    disabledButton: {
      opacity: 0.65,
    },

    saveText: {
      marginLeft: 7,
      fontSize: 14,
      fontWeight: "700",
      color: "#FFFFFF",
    },

    /* =====================================================
       CANCEL
    ===================================================== */

    cancelButton: {
      width: "100%",
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 7,
    },

    cancelText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#777777",
    },
  });