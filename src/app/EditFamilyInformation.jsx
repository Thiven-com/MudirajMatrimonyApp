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
   EDIT FAMILY INFORMATION
========================================================= */

export default function EditFamilyInformation() {

  /* =======================================================
     ROUTER PARAMS
  ======================================================= */

  const params =
    useLocalSearchParams();

  const selectedField =
    params?.field || "";


  /* =======================================================
     STATES
  ======================================================= */

  const [
    father,
    setFather,
  ] = useState("");

  const [
    mother,
    setMother,
  ] = useState("");

  const [
    sibling,
    setSibling,
  ] = useState("");


  /* =======================================================
     SCREEN STATES
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /* =======================================================
     INPUT REFS
  ======================================================= */

  const fatherRef =
    useRef(null);

  const motherRef =
    useRef(null);

  const siblingRef =
    useRef(null);


  /* =======================================================
     GET FAMILY INFORMATION
  ======================================================= */

  const loadFamilyInformation =
    useCallback(async () => {

      try {

        setLoading(true);

        setErrorMessage("");


        /* =================================================
           ACCESS TOKEN
        ================================================= */

        const accessToken =
          await AsyncStorage.getItem(
            "access_token"
          );


        console.log(
          "========================================"
        );

        console.log(
          "EDIT FAMILY INFORMATION"
        );

        console.log(
          "SELECTED FIELD:",
          selectedField
        );

        console.log(
          "TOKEN EXISTS:",
          !!accessToken
        );

        console.log(
          "========================================"
        );


        /* =================================================
           TOKEN CHECK
        ================================================= */

        if (!accessToken) {

          setErrorMessage(
            "Please login again."
          );

          return;
        }


        /* =================================================
           CALL GET API
        ================================================= */

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


        /* =================================================
           RESPONSE DATA
        ================================================= */

        let data =
          response?.data;


        /*
         * Possible response:
         *
         * response.data
         *
         * OR
         *
         * response.data.data
         *
         * OR
         *
         * response.data.result
         */


        if (
          data &&
          typeof data === "object" &&
          data.data &&
          typeof data.data === "object"
        ) {

          data =
            data.data;

        }


        if (
          data &&
          typeof data === "object" &&
          data.result &&
          typeof data.result === "object"
        ) {

          data =
            data.result;

        }


        console.log(
          "FAMILY DATA:",
          JSON.stringify(
            data,
            null,
            2
          )
        );


        /* =================================================
           FATHER
        ================================================= */

        const fatherValue =
          data?.father ??
          data?.father_name ??
          data?.fatherName ??
          "";


        /* =================================================
           MOTHER
        ================================================= */

        const motherValue =
          data?.mother ??
          data?.mother_name ??
          data?.motherName ??
          "";


        /* =================================================
           SIBLING
        ================================================= */

        const siblingValue =
          data?.sibling ??
          data?.siblings ??
          data?.sibling_count ??
          data?.siblings_count ??
          data?.siblingCount ??
          "";


        /* =================================================
           SET VALUES
        ================================================= */

        setFather(
          String(
            fatherValue ?? ""
          )
        );

        setMother(
          String(
            motherValue ?? ""
          )
        );

        setSibling(
          String(
            siblingValue ?? ""
          )
        );


        setErrorMessage("");


      } catch (error) {

        console.error(
          "========================================"
        );

        console.error(
          "EDIT FAMILY INFORMATION GET ERROR"
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


        setErrorMessage(
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load family information."
        );


      } finally {

        setLoading(false);

      }

    }, [selectedField]);


  /* =======================================================
     LOAD API
  ======================================================= */

  useEffect(() => {

    loadFamilyInformation();

  }, [
    loadFamilyInformation,
  ]);


  /* =======================================================
     AUTO FOCUS SELECTED FIELD
  ======================================================= */

  useEffect(() => {

    if (loading) {
      return;
    }


    const timer =
      setTimeout(() => {

        if (
          selectedField === "father"
        ) {

          fatherRef.current?.focus();

        }

        if (
          selectedField === "mother"
        ) {

          motherRef.current?.focus();

        }

        if (
          selectedField === "sibling"
        ) {

          siblingRef.current?.focus();

        }

      }, 300);


    return () => {
      clearTimeout(timer);
    };

  }, [
    loading,
    selectedField,
  ]);


  






  // =======================================================
// SAVE FAMILY INFORMATION
// =======================================================

const handleSave = async () => {

  if (saving) {
    return;
  }

  try {

    // ---------------------------------------------------
    // CLEAN VALUES
    // ---------------------------------------------------

    const fatherValue =
      String(father || "").trim();

    const motherValue =
      String(mother || "").trim();

    const siblingValue =
      String(sibling || "").trim();


    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!fatherValue) {
      Alert.alert(
        "Required",
        "Please enter father's name."
      );
      fatherRef.current?.focus();
      return;
    }

    if (!motherValue) {
      Alert.alert(
        "Required",
        "Please enter mother's name."
      );
      motherRef.current?.focus();
      return;
    }

    if (!siblingValue) {
      Alert.alert(
        "Required",
        "Please enter sibling information."
      );
      siblingRef.current?.focus();
      return;
    }


    // ---------------------------------------------------
    // SIBLING VALIDATION
    // ---------------------------------------------------

    if (!/^\d+$/.test(siblingValue)) {
      Alert.alert(
        "Invalid Value",
        "Sibling must contain numbers only."
      );
      siblingRef.current?.focus();
      return;
    }


    // ---------------------------------------------------
    // GET TOKEN
    // ---------------------------------------------------

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


    // ---------------------------------------------------
    // SET SAVING
    // ---------------------------------------------------

    setSaving(true);
    setErrorMessage("");


    // ---------------------------------------------------
    // REQUEST BODY
    // ---------------------------------------------------

    const body = {
      father: fatherValue,
      mother: motherValue,
      sibling: siblingValue,
    };


    // ---------------------------------------------------
    // DEBUG
    // ---------------------------------------------------

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
      "FATHER:",
      fatherValue
    );

    console.log(
      "MOTHER:",
      motherValue
    );

    console.log(
      "SIBLING:",
      siblingValue
    );

    console.log(
      "BODY:",
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


    // ---------------------------------------------------
    // CALL UPDATE API
    // ---------------------------------------------------

    const response =
      await updateMemberFamilyInfo(
        accessToken,
        body
      );


    // ---------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------

    console.log(
      "========================================"
    );

    console.log(
      "FAMILY UPDATE RESPONSE:"
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


    // ---------------------------------------------------
    // CHECK SUCCESS
    // ---------------------------------------------------

    const responseData =
      response?.data;

    const success =
      response?.success === 1 ||
      response?.success === true ||
      responseData?.success === 1 ||
      responseData?.success === true ||
      response?.result === true ||
      responseData?.result === true;


    const message =
      response?.message ||
      responseData?.message ||
      "Family information updated successfully.";


    // ---------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------

    if (success) {

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
        ]
      );

    } else {

      // -------------------------------------------------
      // API RETURNED FAILURE
      // -------------------------------------------------

      const errorMessage =
        message ||
        "Unable to update family information.";

      setErrorMessage(
        errorMessage
      );

      Alert.alert(
        "Update Failed",
        errorMessage
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


    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Unable to update family information.";

    setErrorMessage(
      errorMessage
    );

    Alert.alert(
      "Update Failed",
      errorMessage
    );

  } finally {

    setSaving(false);

  }
};


  /* =======================================================
     INPUT COMPONENT
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
  }) => {

    const isSelected =
      selectedField === fieldName;


    return (

      <View
        style={styles.fieldContainer}
      >

        {/* ===============================================
            LABEL
        =============================================== */}

        <View
          style={styles.fieldHeader}
        >

          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  iconColor + "18",
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


        {/* ===============================================
            INPUT
        =============================================== */}

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

            onChangeText={
              onChangeText
            }

            placeholder={
              placeholder
            }

            placeholderTextColor="#AAAAAA"

            style={styles.input}

            keyboardType={
              keyboardType
            }

            autoCapitalize={
              autoCapitalize
            }

            returnKeyType="next"

            editable={!saving}

          />

        </View>

      </View>

    );

  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <SafeAreaView
        style={styles.safeArea}
      >

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F5F6F8"
        />


        <View
          style={styles.loadingContainer}
        >

          <Ionicons
            name="people-outline"
            size={30}
            color="#D7192A"
          />


          <Text
            style={styles.loadingText}
          >
            Loading family information...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  /* =======================================================
     MAIN UI
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
          showsVerticalScrollIndicator={
            false
          }

          keyboardShouldPersistTaps="handled"

          contentContainerStyle={
            styles.scrollContent
          }
        >


          {/* =============================================
              CARD
          ============================================= */}

          <View
            style={styles.card}
          >


            {/* ===========================================
                HEADER
            =========================================== */}

            <View
              style={styles.header}
            >

              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={() =>
                  router.back()
                }
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


            {/* ===========================================
                DIVIDER
            =========================================== */}

            <View
              style={styles.divider}
            />


            {/* ===========================================
                ERROR
            =========================================== */}

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


            {/* ===========================================
                DESCRIPTION
            =========================================== */}

            <Text
              style={styles.description}
            >
              Update your family information below.
            </Text>


            {/* ===========================================
                FATHER
            =========================================== */}

            <InputField
              label="Father"
              value={father}
              onChangeText={setFather}
              inputRef={fatherRef}
              icon="person-outline"
              iconColor="#4A9BE8"
              placeholder="Enter father's name"
              fieldName="father"
            />


            {/* ===========================================
                MOTHER
            =========================================== */}

            <InputField
              label="Mother"
              value={mother}
              onChangeText={setMother}
              inputRef={motherRef}
              icon="person-outline"
              iconColor="#E65A91"
              placeholder="Enter mother's name"
              fieldName="mother"
            />


            {/* ===========================================
                SIBLING
            =========================================== */}

            <InputField
              label="Sibling"
              value={sibling}
              onChangeText={setSibling}
              inputRef={siblingRef}
              icon="people-outline"
              iconColor="#4CAF78"
              placeholder="Enter number of siblings"
              keyboardType="number-pad"
              autoCapitalize="none"
              fieldName="sibling"
            />


            {/* ===========================================
                SAVE
            =========================================== */}

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
                name="checkmark-circle-outline"
                size={18}
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


            {/* ===========================================
                CANCEL
            =========================================== */}

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.75}
              onPress={() =>
                router.back()
              }
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
       LOADING
    ===================================================== */

    loadingContainer: {
      flex: 1,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "#F5F6F8",
    },


    loadingText: {
      marginTop: 12,

      fontSize: 13,

      color: "#777777",
    },


    /* =====================================================
       CARD
    ===================================================== */

    card: {
      width: "100%",

      backgroundColor:
        "#FFFFFF",

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
      minHeight: 38,

      flexDirection: "row",

      alignItems: "center",
    },


    backButton: {
      width: 34,

      height: 34,

      borderRadius: 17,

      alignItems: "center",

      justifyContent: "center",

      marginRight: 6,

      backgroundColor:
        "#FFF5F6",
    },


    headerIconContainer: {
      width: 30,

      height: 30,

      borderRadius: 15,

      alignItems: "center",

      justifyContent: "center",

      backgroundColor:
        "#FFF0F2",

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

      backgroundColor:
        "#F0F0F0",

      marginTop: 10,

      marginBottom: 16,
    },


    /* =====================================================
       ERROR
    ===================================================== */

    errorBox: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor:
        "#FFF1F2",

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

      marginBottom: 18,
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
      minHeight: 46,

      borderWidth: 1,

      borderColor: "#E3E3E6",

      borderRadius: 9,

      backgroundColor:
        "#FAFAFB",

      justifyContent: "center",
    },


    selectedInputWrapper: {
      borderColor:
        "#D7192A",

      backgroundColor:
        "#FFF9FA",
    },


    input: {
      minHeight: 46,

      paddingHorizontal: 13,

      paddingVertical: 10,

      fontSize: 14,

      color: "#222222",
    },


    /* =====================================================
       SAVE
    ===================================================== */

    saveButton: {
      height: 45,

      borderRadius: 9,

      backgroundColor:
        "#D7192A",

      flexDirection: "row",

      alignItems: "center",

      justifyContent: "center",

      marginTop: 4,

      shadowColor:
        "#D7192A",

      shadowOffset: {
        width: 0,

        height: 3,
      },

      shadowOpacity: 0.18,

      shadowRadius: 5,

      elevation: 2,
    },


    disabledButton: {
      opacity: 0.6,
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