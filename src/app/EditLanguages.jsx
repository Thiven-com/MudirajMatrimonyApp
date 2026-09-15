import {
    useCallback,
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
    useFocusEffect,
    useLocalSearchParams,
} from "expo-router";

import {
    getMemberLanguages,
    updateMemberLanguages,
} from "../utils/Functions";


/* =========================================================
   RESPONSE NORMALIZER
========================================================= */

const normalizeLanguageResponse = (response) => {
  let data =
    response?.data ??
    response ??
    {};

  /*
    Response example:

    {
      success: 1,
      result: true,
      data: {
        mother_tongue: "Telugu",
        known_languages: [
          "English",
          "Hindi"
        ]
      }
    }
  */

  if (
    data &&
    typeof data === "object" &&
    data.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
  ) {
    data = data.data;
  }

  if (
    data &&
    typeof data === "object" &&
    data.result &&
    typeof data.result === "object" &&
    !Array.isArray(data.result)
  ) {
    data = data.result;
  }

  return data || {};
};


/* =========================================================
   LANGUAGE NAME
========================================================= */

const getLanguageName = (item) => {
  if (
    item === null ||
    item === undefined
  ) {
    return "";
  }

  /* STRING / NUMBER */

  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item).trim();
  }

  /* OBJECT */

  if (
    typeof item === "object"
  ) {
    return String(
      item?.name ??
      item?.language ??
      item?.language_name ??
      item?.languageName ??
      item?.title ??
      item?.value ??
      ""
    ).trim();
  }

  return "";
};


/* =========================================================
   MOTHER TONGUE VALUE
========================================================= */

const getMotherTongueValue = (data) => {
  let value =
    data?.mother_tongue ??
    data?.motherTongue ??
    data?.mother_tongue_name ??
    data?.motherTongueName ??
    data?.mother_language ??
    data?.motherLanguage ??
    "";

  if (
    typeof value === "object"
  ) {
    value =
      getLanguageName(value);
  }

  return String(
    value ?? ""
  ).trim();
};


/* =========================================================
   KNOWN LANGUAGES VALUE
========================================================= */

const getKnownLanguagesValue = (data) => {
  let value =
    data?.known_languages ??
    data?.knownLanguages ??
    data?.languages ??
    data?.language ??
    [];


  /* -----------------------------------------------
     STRING
  ------------------------------------------------ */

  if (
    typeof value === "string"
  ) {
    return value
      .split(",")
      .map(
        (item) =>
          String(item).trim()
      )
      .filter(Boolean);
  }


  /* -----------------------------------------------
     SINGLE OBJECT
  ------------------------------------------------ */

  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {

    if (
      value?.name ||
      value?.language ||
      value?.language_name
    ) {
      value = [value];
    } else {
      value = Object.values(value);
    }
  }


  /* -----------------------------------------------
     ARRAY
  ------------------------------------------------ */

  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        getLanguageName
      )
      .map(
        (item) =>
          String(item).trim()
      )
      .filter(Boolean);
  }


  return [];
};


/* =========================================================
   API SUCCESS CHECK
========================================================= */

const isApiSuccess = (response) => {

  if (!response) {
    return false;
  }


  /* success: true */

  if (
    response?.success === true ||
    response?.success === 1 ||
    response?.success === "1"
  ) {
    return true;
  }


  /* result: true */

  if (
    response?.result === true ||
    response?.result === 1 ||
    response?.result === "1"
  ) {
    return true;
  }


  /* nested success */

  if (
    response?.data?.success === true ||
    response?.data?.success === 1 ||
    response?.data?.success === "1"
  ) {
    return true;
  }


  /* nested result */

  if (
    response?.data?.result === true ||
    response?.data?.result === 1 ||
    response?.data?.result === "1"
  ) {
    return true;
  }


  return false;
};


/* =========================================================
   EDIT LANGUAGES SCREEN
========================================================= */

export default function EditLanguages() {

  const params =
    useLocalSearchParams();


  /* =======================================================
     FIELD PARAMETER
  ======================================================= */

  const field =
    Array.isArray(params?.field)
      ? params.field[0]
      : params?.field;


  /*
    motherTongue
      => Mother Tongue screen

    knownLanguages
      => Known Languages screen

    undefined
      => Known Languages by default
  */

  const isMotherTongue =
    field === "motherTongue";


  /* =======================================================
     STATE
  ======================================================= */

  const [
    motherTongue,
    setMotherTongue,
  ] = useState("");


  const [
    knownLanguages,
    setKnownLanguages,
  ] = useState([]);


  const [
    newLanguage,
    setNewLanguage,
  ] = useState("");


  /*
    Saving state is ONLY used to prevent
    double-clicking.

    No loading UI is displayed.
  */

  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /* =======================================================
     LOAD LANGUAGES
     
     NO LOADING UI
  ======================================================= */

  const loadLanguages =
    useCallback(
      async () => {

        try {

          setErrorMessage("");


          /* ---------------------------------------------
             GET TOKEN
          --------------------------------------------- */

          const accessToken =
            await AsyncStorage.getItem(
              "access_token"
            );


          console.log(
            "========================================"
          );

          console.log(
            "EDIT LANGUAGES - GET API"
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
              "Access token is missing. Please login again."
            );

            return;
          }


          /* ---------------------------------------------
             GET API
          --------------------------------------------- */

          const response =
            await getMemberLanguages(
              accessToken
            );


          console.log(
            "========================================"
          );

          console.log(
            "EDIT LANGUAGES GET RESPONSE"
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


          /* ---------------------------------------------
             NORMALIZE
          --------------------------------------------- */

          const data =
            normalizeLanguageResponse(
              response
            );


          console.log(
            "NORMALIZED DATA:",
            JSON.stringify(
              data,
              null,
              2
            )
          );


          /* ---------------------------------------------
             MOTHER TONGUE
          --------------------------------------------- */

          const motherTongueValue =
            getMotherTongueValue(
              data
            );


          /* ---------------------------------------------
             KNOWN LANGUAGES
          --------------------------------------------- */

          const knownLanguagesValue =
            getKnownLanguagesValue(
              data
            );


          /* ---------------------------------------------
             REMOVE DUPLICATES
          --------------------------------------------- */

          const uniqueLanguages = [
            ...new Map(
              knownLanguagesValue.map(
                (language) => [
                  language
                    .toLowerCase(),
                  language,
                ]
              )
            ).values(),
          ];


          /* ---------------------------------------------
             SET VALUES
          --------------------------------------------- */

          setMotherTongue(
            motherTongueValue
          );


          setKnownLanguages(
            uniqueLanguages
          );


          setErrorMessage("");


          console.log(
            "MOTHER TONGUE:",
            motherTongueValue
          );

          console.log(
            "KNOWN LANGUAGES:",
            uniqueLanguages
          );


        } catch (error) {

          console.error(
            "========================================"
          );

          console.error(
            "EDIT LANGUAGES GET ERROR"
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
            "Unable to load languages."
          );

        }

      },
      []
    );


  /* =======================================================
     LOAD WHEN SCREEN OPENS
     
     No loading screen.
  ======================================================= */

  useFocusEffect(
    useCallback(
      () => {

        loadLanguages();

      },
      [
        loadLanguages,
      ]
    )
  );


  /* =======================================================
     ADD LANGUAGE
  ======================================================= */

  const handleAddLanguage =
    useCallback(
      () => {

        const value =
          String(
            newLanguage || ""
          ).trim();


        /* ---------------------------------------------
           EMPTY
        --------------------------------------------- */

        if (!value) {

          Alert.alert(
            "Enter Language",
            "Please enter a language."
          );

          return;
        }


        /* ---------------------------------------------
           DUPLICATE
        --------------------------------------------- */

        const alreadyExists =
          knownLanguages.some(
            (item) =>
              String(item)
                .trim()
                .toLowerCase() ===
              value.toLowerCase()
          );


        if (alreadyExists) {

          Alert.alert(
            "Already Added",
            "This language is already added."
          );

          return;
        }


        /* ---------------------------------------------
           ADD
        --------------------------------------------- */

        setKnownLanguages(
          (previous) => [
            ...previous,
            value,
          ]
        );


        setNewLanguage("");

      },
      [
        newLanguage,
        knownLanguages,
      ]
    );


  /* =======================================================
     REMOVE LANGUAGE
  ======================================================= */

  const handleRemoveLanguage =
    useCallback(
      (index) => {

        setKnownLanguages(
          (previous) =>
            previous.filter(
              (_, itemIndex) =>
                itemIndex !== index
            )
        );

      },
      []
    );


  /* =======================================================
     SAVE / UPDATE LANGUAGES
     
     DIRECT API CALL
     
     NO LOADING UI
  ======================================================= */

  const handleSave =
    useCallback(
      async () => {

        /*
          Prevent double tap.
        */

        if (saving) {
          return;
        }


        /* ===============================================
           VALIDATION
        =============================================== */

        if (isMotherTongue) {

          if (
            !String(
              motherTongue || ""
            ).trim()
          ) {

            Alert.alert(
              "Required",
              "Please enter your mother tongue."
            );

            return;
          }

        } else {

          if (
            !Array.isArray(
              knownLanguages
            ) ||
            knownLanguages.length === 0
          ) {

            Alert.alert(
              "Required",
              "Please add at least one known language."
            );

            return;
          }

        }


        try {

          /*
            This state does NOT show any
            spinner or loading section.
          */

          setSaving(true);


          /* =============================================
             TOKEN
          ============================================= */

          const accessToken =
            await AsyncStorage.getItem(
              "access_token"
            );


          console.log(
            "========================================"
          );

          console.log(
            "LANGUAGE UPDATE STARTED"
          );

          console.log(
            "TOKEN EXISTS:",
            !!accessToken
          );

          console.log(
            "========================================"
          );


          if (!accessToken) {

            throw new Error(
              "Access token is missing. Please login again."
            );
          }


          /* =============================================
             CLEAN MOTHER TONGUE
          ============================================= */

          const cleanMotherTongue =
            String(
              motherTongue || ""
            ).trim();


          /* =============================================
             CLEAN KNOWN LANGUAGES
          ============================================= */

          const cleanKnownLanguages =
            Array.isArray(
              knownLanguages
            )
              ? knownLanguages
                  .map(
                    (item) =>
                      String(
                        item || ""
                      ).trim()
                  )
                  .filter(Boolean)
              : [];


          /* =============================================
             REMOVE DUPLICATES
          ============================================= */

          const uniqueKnownLanguages = [
            ...new Map(
              cleanKnownLanguages.map(
                (language) => [
                  language.toLowerCase(),
                  language,
                ]
              )
            ).values(),
          ];


          /* =============================================
             REQUEST BODY
          ============================================= */

          const requestBody = {
            mother_tongue:
              cleanMotherTongue,

            known_languages:
              uniqueKnownLanguages,
          };


          console.log(
            "========================================"
          );

          console.log(
            "LANGUAGE UPDATE REQUEST"
          );

          console.log(
            "ENDPOINT:",
            "/api/member/language/update"
          );

          console.log(
            "REQUEST BODY:"
          );

          console.log(
            JSON.stringify(
              requestBody,
              null,
              2
            )
          );

          console.log(
            "========================================"
          );


          /* =============================================
             POST API
          ============================================= */

          const response =
            await updateMemberLanguages(
              accessToken,
              requestBody
            );


          /* =============================================
             RESPONSE
          ============================================= */

          console.log(
            "========================================"
          );

          console.log(
            "LANGUAGE UPDATE RESPONSE"
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


          /* =============================================
             SUCCESS
          ============================================= */

          if (
            isApiSuccess(response)
          ) {

            const successMessage =
              response?.message ||
              response?.data?.message ||
              "Languages updated successfully.";


            /*
              Show success message briefly,
              then automatically return.

              No Saving spinner.
            */

            Alert.alert(
              "Success",
              successMessage,
              [
                {
                  text: "OK",

                  onPress: () => {

                    /*
                      Return to Languages screen.

                      Languages.jsx has
                      useFocusEffect(), so it
                      automatically calls GET again.
                    */

                    router.back();

                  },
                },
              ],
              {
                cancelable: false,
              }
            );


            return;
          }


          /* =============================================
             API FAILURE
          ============================================= */

          const failureMessage =
            response?.message ||
            response?.data?.message ||
            "Unable to update languages.";


          console.log(
            "LANGUAGE UPDATE FAILED:",
            failureMessage
          );


          Alert.alert(
            "Update Failed",
            failureMessage
          );


        } catch (error) {

          console.error(
            "========================================"
          );

          console.error(
            "LANGUAGE UPDATE ERROR"
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


          const errorResponse =
            error?.response?.data;


          const message =
            errorResponse?.message ||
            error?.message ||
            "Unable to update languages.";


          Alert.alert(
            "Update Failed",
            message
          );


        } finally {

          /*
            Only used to unlock the button.
            There is NO loading UI.
          */

          setSaving(false);

        }

      },
      [
        saving,
        isMotherTongue,
        motherTongue,
        knownLanguages,
      ]
    );


  /* =======================================================
     RETRY
     
     Retry is only shown if GET failed.
     No loading indicator.
  ======================================================= */

  const handleRetry =
    useCallback(
      () => {

        loadLanguages();

      },
      [
        loadLanguages,
      ]
    );


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (

    <SafeAreaView
      style={styles.safeArea}
    >

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />


      {/* ===================================================
          HEADER
      =================================================== */}

      <View
        style={styles.header}
      >

        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          style={
            styles.backButton
          }
          activeOpacity={0.7}
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color="#222222"
          />

        </TouchableOpacity>


        <Text
          style={styles.headerTitle}
        >
          Edit Languages
        </Text>


        <View
          style={styles.headerRight}
        />

      </View>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            styles.contentContainer
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >

          {/* =================================================
              ERROR
          ================================================= */}

          {errorMessage ? (

            <View
              style={
                styles.errorContainer
              }
            >

              <View
                style={
                  styles.errorIcon
                }
              >

                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color="#D7192A"
                />

              </View>


              <View
                style={
                  styles.errorContent
                }
              >

                <Text
                  style={
                    styles.errorTitle
                  }
                >
                  Unable to load languages
                </Text>


                <Text
                  style={
                    styles.errorText
                  }
                >
                  {errorMessage}
                </Text>


                <TouchableOpacity
                  style={
                    styles.retryButton
                  }
                  onPress={
                    handleRetry
                  }
                  activeOpacity={0.8}
                >

                  <Text
                    style={
                      styles.retryText
                    }
                  >
                    Retry
                  </Text>

                </TouchableOpacity>

              </View>

            </View>

          ) : null}


          {/* =================================================
              MOTHER TONGUE
          ================================================= */}

          {isMotherTongue && (

            <View
              style={styles.section}
            >

              <View
                style={
                  styles.labelRow
                }
              >

                <View
                  style={
                    styles.iconBox
                  }
                >

                  <Ionicons
                    name="language-outline"
                    size={21}
                    color="#D7192A"
                  />

                </View>


                <View>

                  <Text
                    style={
                      styles.label
                    }
                  >
                    Mother Tongue
                  </Text>

                  <Text
                    style={
                      styles.labelSubText
                    }
                  >
                    Enter your mother tongue
                  </Text>

                </View>

              </View>


              <TextInput
                value={
                  motherTongue
                }
                onChangeText={
                  setMotherTongue
                }
                placeholder="Enter mother tongue"
                placeholderTextColor="#999999"
                style={
                  styles.input
                }
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />


              <Text
                style={
                  styles.helperText
                }
              >
                Your mother tongue will be shown on your profile.
              </Text>

            </View>

          )}


          {/* =================================================
              KNOWN LANGUAGES
          ================================================= */}

          {!isMotherTongue && (

            <View
              style={styles.section}
            >

              <View
                style={
                  styles.labelRow
                }
              >

                <View
                  style={
                    styles.iconBox
                  }
                >

                  <Ionicons
                    name="chatbubbles-outline"
                    size={21}
                    color="#D7192A"
                  />

                </View>


                <View>

                  <Text
                    style={
                      styles.label
                    }
                  >
                    Known Languages
                  </Text>

                  <Text
                    style={
                      styles.labelSubText
                    }
                  >
                    Add the languages you know
                  </Text>

                </View>

              </View>


              {/* -----------------------------------------
                  EXISTING LANGUAGES
              ------------------------------------------ */}

              <View
                style={
                  styles.languagesContainer
                }
              >

                {knownLanguages.length ===
                0 ? (

                  <View
                    style={
                      styles.emptyContainer
                    }
                  >

                    <Ionicons
                      name="language-outline"
                      size={25}
                      color="#AAAAAA"
                    />

                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      No known languages added
                    </Text>

                  </View>

                ) : (

                  knownLanguages.map(
                    (
                      language,
                      index
                    ) => (

                      <View
                        key={
                          `${language}-${index}`
                        }
                        style={
                          styles.languageChip
                        }
                      >

                        <View
                          style={
                            styles.chipIcon
                          }
                        >

                          <Ionicons
                            name="language-outline"
                            size={14}
                            color="#D7192A"
                          />

                        </View>


                        <Text
                          style={
                            styles.languageChipText
                          }
                        >
                          {language}
                        </Text>


                        <TouchableOpacity
                          onPress={() =>
                            handleRemoveLanguage(
                              index
                            )
                          }
                          style={
                            styles.removeButton
                          }
                          activeOpacity={0.7}
                        >

                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#D7192A"
                          />

                        </TouchableOpacity>

                      </View>

                    )
                  )

                )}

              </View>


              {/* -----------------------------------------
                  ADD LANGUAGE
              ------------------------------------------ */}

              <View
                style={styles.addRow}
              >

                <TextInput
                  value={
                    newLanguage
                  }
                  onChangeText={
                    setNewLanguage
                  }
                  placeholder="Enter language"
                  placeholderTextColor="#999999"
                  style={
                    styles.addInput
                  }
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={
                    handleAddLanguage
                  }
                />


                <TouchableOpacity
                  style={
                    styles.addButton
                  }
                  onPress={
                    handleAddLanguage
                  }
                  activeOpacity={0.8}
                >

                  <Ionicons
                    name="add"
                    size={25}
                    color="#FFFFFF"
                  />

                </TouchableOpacity>

              </View>


              <Text
                style={
                  styles.helperText
                }
              >
                Add all languages you know.
              </Text>

            </View>

          )}

        </ScrollView>


        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <View
          style={
            styles.bottomContainer
          }
        >

          <TouchableOpacity
            style={
              styles.saveButton
            }
            onPress={
              handleSave
            }

            /*
              Disable only while API request
              is running.

              No spinner.
              No "Saving..." text.
            */

            disabled={
              saving
            }

            activeOpacity={0.85}
          >

            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.saveButtonText
              }
            >
              Save Changes
            </Text>

          </TouchableOpacity>

        </View>

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

    safeArea: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },


    keyboardContainer: {
      flex: 1,
    },


    scrollView: {
      flex: 1,
    },


    /* =====================================================
       HEADER
    ===================================================== */

    header: {
      height: 64,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      paddingHorizontal:
        18,

      borderBottomWidth:
        1,

      borderBottomColor:
        "#EEEEEE",

      backgroundColor:
        "#FFFFFF",
    },


    backButton: {
      width: 42,
      height: 42,

      alignItems:
        "center",

      justifyContent:
        "center",

      borderRadius:
        21,

      backgroundColor:
        "#F8F8F8",
    },


    headerTitle: {
      flex: 1,

      marginLeft:
        10,

      fontSize:
        20,

      fontWeight:
        "700",

      color:
        "#222222",
    },


    headerRight: {
      width: 42,
    },


    /* =====================================================
       CONTENT
    ===================================================== */

    contentContainer: {
      paddingHorizontal:
        20,

      paddingTop:
        25,

      paddingBottom:
        30,
    },


    /* =====================================================
       SECTION
    ===================================================== */

    section: {
      width:
        "100%",
    },


    labelRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom:
        15,
    },


    iconBox: {
      width:
        42,

      height:
        42,

      borderRadius:
        21,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFF1F2",

      marginRight:
        12,
    },


    label: {
      fontSize:
        16,

      fontWeight:
        "700",

      color:
        "#222222",
    },


    labelSubText: {
      marginTop:
        3,

      fontSize:
        12,

      color:
        "#888888",
    },


    /* =====================================================
       INPUT
    ===================================================== */

    input: {
      width:
        "100%",

      minHeight:
        54,

      borderWidth:
        1,

      borderColor:
        "#DDDDDD",

      borderRadius:
        12,

      paddingHorizontal:
        16,

      fontSize:
        16,

      color:
        "#222222",

      backgroundColor:
        "#FAFAFA",
    },


    helperText: {
      marginTop:
        9,

      fontSize:
        13,

      lineHeight:
        19,

      color:
        "#888888",
    },


    /* =====================================================
       KNOWN LANGUAGES
    ===================================================== */

    languagesContainer: {
      flexDirection:
        "row",

      flexWrap:
        "wrap",

      marginBottom:
        14,
    },


    languageChip: {
      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFF7F7",

      borderWidth:
        1,

      borderColor:
        "#FFD5D8",

      borderRadius:
        22,

      paddingLeft:
        10,

      paddingRight:
        7,

      paddingVertical:
        8,

      marginRight:
        8,

      marginBottom:
        9,
    },


    chipIcon: {
      width:
        25,

      height:
        25,

      borderRadius:
        13,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFFFF",

      marginRight:
        7,
    },


    languageChipText: {
      fontSize:
        14,

      fontWeight:
        "600",

      color:
        "#333333",
    },


    removeButton: {
      width:
        26,

      height:
        26,

      marginLeft:
        5,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    /* =====================================================
       EMPTY
    ===================================================== */

    emptyContainer: {
      width:
        "100%",

      minHeight:
        70,

      borderWidth:
        1,

      borderStyle:
        "dashed",

      borderColor:
        "#DDDDDD",

      borderRadius:
        12,

      alignItems:
        "center",

      justifyContent:
        "center",

      marginBottom:
        14,

      backgroundColor:
        "#FAFAFA",
    },


    emptyText: {
      marginTop:
        5,

      fontSize:
        13,

      color:
        "#999999",
    },


    /* =====================================================
       ADD LANGUAGE
    ===================================================== */

    addRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      width:
        "100%",
    },


    addInput: {
      flex: 1,

      minHeight:
        54,

      borderWidth:
        1,

      borderColor:
        "#DDDDDD",

      borderRadius:
        12,

      paddingHorizontal:
        16,

      fontSize:
        16,

      color:
        "#222222",

      backgroundColor:
        "#FAFAFA",
    },


    addButton: {
      width:
        54,

      height:
        54,

      marginLeft:
        10,

      borderRadius:
        12,

      backgroundColor:
        "#D7192A",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    /* =====================================================
       ERROR
    ===================================================== */

    errorContainer: {
      flexDirection:
        "row",

      width:
        "100%",

      padding:
        14,

      marginBottom:
        20,

      borderRadius:
        12,

      borderWidth:
        1,

      borderColor:
        "#FFD5D8",

      backgroundColor:
        "#FFF5F5",
    },


    errorIcon: {
      width:
        36,

      height:
        36,

      borderRadius:
        18,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFE8EA",
    },


    errorContent: {
      flex: 1,

      marginLeft:
        10,
    },


    errorTitle: {
      fontSize:
        14,

      fontWeight:
        "700",

      color:
        "#D7192A",
    },


    errorText: {
      marginTop:
        4,

      fontSize:
        12,

      lineHeight:
        18,

      color:
        "#777777",
    },


    retryButton: {
      alignSelf:
        "flex-start",

      marginTop:
        9,

      paddingHorizontal:
        14,

      paddingVertical:
        7,

      borderRadius:
        8,

      backgroundColor:
        "#D7192A",
    },


    retryText: {
      fontSize:
        12,

      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },


    /* =====================================================
       BOTTOM
    ===================================================== */

    bottomContainer: {
      paddingHorizontal:
        20,

      paddingTop:
        12,

      paddingBottom:
        20,

      borderTopWidth:
        1,

      borderTopColor:
        "#EEEEEE",

      backgroundColor:
        "#FFFFFF",
    },


    saveButton: {
      width:
        "100%",

      height:
        54,

      borderRadius:
        14,

      backgroundColor:
        "#D7192A",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    saveButtonText: {
      marginLeft:
        8,

      fontSize:
        16,

      fontWeight:
        "700",

      color:
        "#FFFFFF",
    },

  });