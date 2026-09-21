import {
    useCallback,
    useState,
} from "react";

import {
    Alert,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

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


const LANGUAGE_CACHE_KEY =
  "member_languages_cache";


const LANGUAGE_LIST = [
  "Telugu",
  "Hindi",
  "English",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Odia",
  "Assamese",
  "Kashmiri",
  "Konkani",
  "Sanskrit",
  "Sindhi",
  "Nepali",
  "Manipuri",
  "Maithili",
  "Bodo",
  "Dogri",
  "Santali",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Portuguese",
  "Russian",
  "Arabic",
  "Chinese",
  "Japanese",
  "Korean",
  "Other",
];


// =========================================================
// HELPERS
// =========================================================

const normalizeKey = (key) =>
  String(key || "")
    .toLowerCase()
    .replace(/[_\-\s]/g, "");


const findValueDeep = (
  data,
  keys
) => {

  if (
    !data ||
    typeof data !== "object"
  ) {
    return undefined;
  }

  const wanted =
    keys.map(
      normalizeKey
    );

  for (
    const key of Object.keys(data)
  ) {

    if (
      wanted.includes(
        normalizeKey(key)
      )
    ) {

      if (
        data[key] !== null &&
        data[key] !== undefined
      ) {
        return data[key];
      }
    }
  }

  for (
    const key of Object.keys(data)
  ) {

    const value =
      data[key];

    if (
      value &&
      typeof value === "object"
    ) {

      const found =
        findValueDeep(
          value,
          keys
        );

      if (
        found !== undefined
      ) {
        return found;
      }
    }
  }

  return undefined;
};


const getLanguageName = (
  item
) => {

  if (
    item === null ||
    item === undefined
  ) {
    return "";
  }

  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item).trim();
  }

  if (
    Array.isArray(item)
  ) {

    return item.length
      ? getLanguageName(
          item[0]
        )
      : "";
  }

  return String(
    item?.name ??
    item?.language_name ??
    item?.languageName ??
    item?.language ??
    item?.title ??
    item?.label ??
    item?.value ??
    item?.text ??
    ""
  ).trim();
};


const uniqueLanguages = (
  values
) => {

  const result = [];

  if (
    !Array.isArray(values)
  ) {
    return result;
  }

  values.forEach(
    (item) => {

      const value =
        getLanguageName(
          item
        );

      if (!value) {
        return;
      }

      if (
        !result.some(
          (oldValue) =>
            oldValue.toLowerCase() ===
            value.toLowerCase()
        )
      ) {

        result.push(
          value
        );
      }
    }
  );

  return result;
};


const normalizeKnownLanguages = (
  value
) => {

  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return uniqueLanguages(
      value
    );
  }

  if (
    typeof value === "string"
  ) {

    const text =
      value.trim();

    if (!text) {
      return [];
    }

    if (
      text.startsWith("[")
    ) {

      try {

        return uniqueLanguages(
          JSON.parse(text)
        );

      } catch (error) {}
    }

    if (
      text.includes(",")
    ) {

      return uniqueLanguages(
        text.split(",")
      );
    }

    return [text];
  }

  if (
    typeof value === "object"
  ) {

    const nested =
      value?.data ??
      value?.items ??
      value?.languages ??
      value?.known_languages ??
      value?.knownLanguages ??
      value?.values ??
      value?.list;

    if (
      nested !== undefined
    ) {

      return normalizeKnownLanguages(
        nested
      );
    }

    const single =
      getLanguageName(
        value
      );

    if (single) {
      return [single];
    }
  }

  return [];
};


// =========================================================
// SCREEN
// =========================================================

export default function EditLanguages() {

  const params =
    useLocalSearchParams();

  const field =
    params?.field || "";


  const isMotherTongue =
    field === "motherTongue";


  const [
    motherTongue,
    setMotherTongue,
  ] = useState("");


  const [
    knownLanguages,
    setKnownLanguages,
  ] = useState([]);


  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);


  const [
    modalType,
    setModalType,
  ] = useState(
    isMotherTongue
      ? "motherTongue"
      : "knownLanguages"
  );


  const [
    searchText,
    setSearchText,
  ] = useState("");


  const [
    saving,
    setSaving,
  ] = useState(false);


  // =======================================================
  // LOAD CURRENT VALUES
  // =======================================================

  const loadCurrentLanguages =
    useCallback(
      async () => {

        try {

          // Cache first
          const cached =
            await AsyncStorage.getItem(
              LANGUAGE_CACHE_KEY
            );

          if (cached) {

            try {

              const parsed =
                JSON.parse(
                  cached
                );

              setMotherTongue(
                String(
                  parsed?.mother_tongue ||
                  ""
                ).trim()
              );

              setKnownLanguages(
                normalizeKnownLanguages(
                  parsed?.known_languages
                )
              );

            } catch (error) {}
          }


          // API
          const token =
            await AsyncStorage.getItem(
              "access_token"
            );

          if (!token) {
            return;
          }


          const response =
            await getMemberLanguages(
              token
            );


          console.log(
            "EDIT LANGUAGE GET RESPONSE:",
            JSON.stringify(
              response,
              null,
              2
            )
          );


          const motherValue =
            findValueDeep(
              response,
              [
                "mother_tongue",
                "mothere_tongue",
                "motherTongue",
                "mother_tongue_name",
                "motherTongueName",
                "mother_language",
                "motherLanguage",
              ]
            );


          const knownValue =
            findValueDeep(
              response,
              [
                "known_languages",
                "knownLanguages",
                "known_language",
                "knownLanguage",
                "languages_known",
                "languagesKnown",
              ]
            );


          const parsedMother =
            getLanguageName(
              motherValue
            );


          const parsedKnown =
            normalizeKnownLanguages(
              knownValue
            );


          if (
            parsedMother
          ) {

            setMotherTongue(
              parsedMother
            );
          }


          if (
            parsedKnown.length
          ) {

            setKnownLanguages(
              parsedKnown
            );
          }

        } catch (error) {

          console.log(
            "EDIT LANGUAGES LOAD ERROR:",
            error
          );
        }

      },
      []
    );


  useFocusEffect(
    useCallback(
      () => {
        loadCurrentLanguages();
      },
      [
        loadCurrentLanguages,
      ]
    )
  );


  // =======================================================
  // OPEN MODAL
  // =======================================================

  const openMotherTongue =
    () => {

      setModalType(
        "motherTongue"
      );

      setSearchText("");

      setModalVisible(
        true
      );
    };


  const openKnownLanguages =
    () => {

      setModalType(
        "knownLanguages"
      );

      setSearchText("");

      setModalVisible(
        true
      );
    };


  // =======================================================
  // SELECT MOTHER TONGUE
  // =======================================================

  const selectMotherTongue =
    (language) => {

      setMotherTongue(
        language
      );

      setModalVisible(
        false
      );

      setSearchText("");
    };


  // =======================================================
  // SELECT KNOWN LANGUAGE
  // =======================================================

  const toggleKnownLanguage =
    (language) => {

      setKnownLanguages(
        (previous) => {

          const exists =
            previous.some(
              (item) =>
                item.toLowerCase() ===
                language.toLowerCase()
            );

          if (exists) {

            return previous.filter(
              (item) =>
                item.toLowerCase() !==
                language.toLowerCase()
            );
          }

          return [
            ...previous,
            language,
          ];
        }
      );
    };


  // =======================================================
  // REMOVE LANGUAGE
  // =======================================================

  const removeLanguage =
    (language) => {

      setKnownLanguages(
        (previous) =>
          previous.filter(
            (item) =>
              item.toLowerCase() !==
              language.toLowerCase()
          )
      );
    };


  // =======================================================
  // SAVE
  // =======================================================

  const handleSave =
    async () => {

      if (saving) {
        return;
      }


      const cleanMotherTongue =
        String(
          motherTongue || ""
        ).trim();


      const cleanKnownLanguages =
        uniqueLanguages(
          knownLanguages
        );


      if (
        !cleanMotherTongue
      ) {

        Alert.alert(
          "Required",
          "Please select your mother tongue."
        );

        return;
      }


      try {

        setSaving(true);


        const token =
          await AsyncStorage.getItem(
            "access_token"
          );


        if (!token) {

          Alert.alert(
            "Login Required",
            "Access token is missing. Please login again."
          );

          return;
        }


        // -------------------------------------------------
        // ALWAYS SEND BOTH VALUES
        // -------------------------------------------------

        const requestBody = {

          mother_tongue:
            cleanMotherTongue,

          known_languages:
            cleanKnownLanguages,
        };


        console.log(
          "========================================"
        );

        console.log(
          "LANGUAGE UPDATE REQUEST"
        );

        console.log(
          "METHOD: POST"
        );

        console.log(
          "ENDPOINT: /api/member/languages/update"
        );

        console.log(
          "REQUEST BODY:",
          JSON.stringify(
            requestBody,
            null,
            2
          )
        );

        console.log(
          "========================================"
        );


        // -------------------------------------------------
        // API
        // -------------------------------------------------

        const response =
          await updateMemberLanguages(
            token,
            requestBody
          );


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


        // -------------------------------------------------
        // SUCCESS CHECK
        //
        // Important:
        // postMethod may already return only the
        // response body. Don't require statusCode
        // if success/result is missing.
        // -------------------------------------------------

        const responseStatus =
          response?.statusCode ??
          response?.status ??
          response?.data?.statusCode;


        const explicitFailure =
          response?.success === 0 ||
          response?.success === false ||
          response?.result === false;


        const explicitSuccess =
          response?.success === 1 ||
          response?.success === true ||
          response?.result === true ||
          responseStatus === 200 ||
          responseStatus === 201;


        // If API returned a normal object without
        // an explicit failure, treat it as successful.
        const success =
          !explicitFailure &&
          (
            explicitSuccess ||
            response !== null &&
            response !== undefined
          );


        if (!success) {

          Alert.alert(
            "Update Failed",
            response?.message ||
            response?.data?.message ||
            "Unable to update languages."
          );

          return;
        }


        // -------------------------------------------------
        // SAVE CACHE
        //
        // This guarantees that the new values are
        // available immediately after router.back().
        // -------------------------------------------------

        await AsyncStorage.setItem(
          LANGUAGE_CACHE_KEY,
          JSON.stringify({
            mother_tongue:
              cleanMotherTongue,

            known_languages:
              cleanKnownLanguages,
          })
        );


        console.log(
          "LANGUAGE CACHE UPDATED:"
        );

        console.log(
          JSON.stringify(
            {
              mother_tongue:
                cleanMotherTongue,

              known_languages:
                cleanKnownLanguages,
            },
            null,
            2
          )
        );


        // -------------------------------------------------
        // RETURN TO LANGUAGES SCREEN
        // -------------------------------------------------

        router.back();

      } catch (error) {

        console.error(
          "========================================"
        );

        console.error(
          "LANGUAGE UPDATE ERROR"
        );

        console.error(
          error
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


        Alert.alert(
          "Error",
          error?.response?.data?.message ||
          error?.message ||
          "Unable to update languages."
        );

      } finally {

        setSaving(false);
      }
    };


  // =======================================================
  // FILTER
  // =======================================================

  const filteredLanguages =
    LANGUAGE_LIST.filter(
      (language) =>
        language
          .toLowerCase()
          .includes(
            searchText
              .toLowerCase()
              .trim()
          )
    );


  // =======================================================
  // LANGUAGE ITEM
  // =======================================================

  const renderLanguageItem =
    ({
      item,
    }) => {

      const selected =
        modalType ===
        "motherTongue"
          ? motherTongue
              .toLowerCase() ===
            item.toLowerCase()
          : knownLanguages.some(
              (language) =>
                language.toLowerCase() ===
                item.toLowerCase()
            );


      return (
        <TouchableOpacity
          style={
            styles.languageOption
          }
          onPress={() => {

            if (
              modalType ===
              "motherTongue"
            ) {

              selectMotherTongue(
                item
              );

            } else {

              toggleKnownLanguage(
                item
              );
            }

          }}
        >

          <View
            style={
              styles.optionLeft
            }
          >

            <View
              style={
                styles.optionIcon
              }
            >

              <Ionicons
                name="language-outline"
                size={20}
                color="#F44336"
              />

            </View>


            <Text
              style={
                styles.optionText
              }
            >
              {item}
            </Text>

          </View>


          <View
            style={[
              styles.checkbox,
              selected &&
                styles.checkboxSelected,
            ]}
          >

            {selected ? (
              <Ionicons
                name="checkmark"
                size={17}
                color="#FFFFFF"
              />
            ) : null}

          </View>

        </TouchableOpacity>
      );
    };


  // =======================================================
  // UI
  // =======================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />


      {/* HEADER */}

      <View
        style={styles.header}
      >

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
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


      {/* CONTENT */}

      <View
        style={styles.container}
      >

        {/* MOTHER TONGUE */}

        <Text
          style={styles.label}
        >
          Mother Tongue
        </Text>


        <TouchableOpacity
          style={styles.dropdown}
          onPress={
            openMotherTongue
          }
        >

          <View
            style={styles.dropdownLeft}
          >

            <Ionicons
              name="language-outline"
              size={22}
              color="#F44336"
            />

            <Text
              style={[
                styles.dropdownText,
                !motherTongue &&
                  styles.placeholder,
              ]}
            >
              {motherTongue ||
                "Select Mother Tongue"}
            </Text>

          </View>


          <Ionicons
            name="chevron-down"
            size={21}
            color="#777777"
          />

        </TouchableOpacity>


        {/* KNOWN LANGUAGES */}

        <Text
          style={[
            styles.label,
            {
              marginTop: 22,
            },
          ]}
        >
          Known Languages
        </Text>


        <TouchableOpacity
          style={styles.dropdown}
          onPress={
            openKnownLanguages
          }
        >

          <View
            style={styles.dropdownLeft}
          >

            <Ionicons
              name="globe-outline"
              size={22}
              color="#F44336"
            />

            <Text
              style={[
                styles.dropdownText,
                knownLanguages.length === 0 &&
                  styles.placeholder,
              ]}
            >
              {knownLanguages.length
                ? `${knownLanguages.length} language${
                    knownLanguages.length > 1
                      ? "s"
                      : ""
                  } selected`
                : "Select Known Languages"}
            </Text>

          </View>


          <Ionicons
            name="chevron-down"
            size={21}
            color="#777777"
          />

        </TouchableOpacity>


        {/* SELECTED CHIPS */}

        {knownLanguages.length >
        0 ? (

          <View
            style={
              styles.selectedContainer
            }
          >

            {knownLanguages.map(
              (
                language,
                index
              ) => (

                <View
                  key={
                    `${language}-${index}`
                  }
                  style={
                    styles.selectedChip
                  }
                >

                  <Text
                    style={
                      styles.selectedChipText
                    }
                  >
                    {language}
                  </Text>


                  <TouchableOpacity
                    onPress={() =>
                      removeLanguage(
                        language
                      )
                    }
                  >

                    <Ionicons
                      name="close-circle"
                      size={19}
                      color="#F44336"
                    />

                  </TouchableOpacity>

                </View>

              )
            )}

          </View>

        ) : null}


        {/* SAVE */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
          ]}
          onPress={
            handleSave
          }
          disabled={saving}
        >

          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.saveButtonText
            }
          >
            {saving
              ? "Saving..."
              : "Save Languages"}
          </Text>

        </TouchableOpacity>

      </View>


      {/* LANGUAGE MODAL */}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setModalVisible(false)
        }
      >

        <View
          style={styles.modalOverlay}
        >

          <Pressable
            style={styles.modalTop}
            onPress={() =>
              setModalVisible(
                false
              )
            }
          />


          <View
            style={styles.modalContainer}
          >

            {/* MODAL HEADER */}

            <View
              style={
                styles.modalHeader
              }
            >

              <Text
                style={
                  styles.modalTitle
                }
              >
                {modalType ===
                "motherTongue"
                  ? "Select Mother Tongue"
                  : "Select Known Languages"}
              </Text>


              <TouchableOpacity
                onPress={() =>
                  setModalVisible(
                    false
                  )
                }
              >

                <Ionicons
                  name="close"
                  size={25}
                  color="#222222"
                />

              </TouchableOpacity>

            </View>


            {/* SEARCH */}

            <View
              style={
                styles.searchBox
              }
            >

              <Ionicons
                name="search-outline"
                size={20}
                color="#888888"
              />

              <TextInput
                value={
                  searchText
                }
                onChangeText={
                  setSearchText
                }
                placeholder="Search language"
                placeholderTextColor="#999999"
                style={
                  styles.searchInput
                }
              />

            </View>


            {/* LIST */}

            <FlatList
              data={
                filteredLanguages
              }
              keyExtractor={(
                item
              ) => item}
              renderItem={
                renderLanguageItem
              }
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingBottom: 25,
              }}
            />


            {/* DONE */}

            {modalType ===
            "knownLanguages" ? (

              <TouchableOpacity
                style={
                  styles.doneButton
                }
                onPress={() =>
                  setModalVisible(
                    false
                  )
                }
              >

                <Text
                  style={
                    styles.doneButtonText
                  }
                >
                  Done
                </Text>

              </TouchableOpacity>

            ) : null}

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
}


// =========================================================
// STYLES
// =========================================================

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },

    header: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor:
        "#EEEEEE",
    },

    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#222222",
    },

    headerRight: {
      width: 40,
    },

    container: {
      flex: 1,
      padding: 16,
    },

    label: {
      fontSize: 15,
      fontWeight: "600",
      color: "#444444",
      marginBottom: 8,
    },

    dropdown: {
      minHeight: 54,
      borderWidth: 1,
      borderColor: "#E2E2E2",
      borderRadius: 12,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
    },

    dropdownLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    dropdownText: {
      fontSize: 15,
      color: "#222222",
      marginLeft: 10,
      fontWeight: "500",
    },

    placeholder: {
      color: "#999999",
      fontWeight: "400",
    },

    selectedContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },

    selectedChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FFF2F0",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    selectedChipText: {
      color: "#F44336",
      fontSize: 14,
      fontWeight: "600",
      marginRight: 7,
    },

    saveButton: {
      height: 52,
      borderRadius: 12,
      backgroundColor:
        "#F44336",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 28,
    },

    saveButtonDisabled: {
      opacity: 0.6,
    },

    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.35)",
      justifyContent:
        "flex-end",
    },

    modalTop: {
      flex: 1,
    },

    modalContainer: {
      height: "75%",
      backgroundColor:
        "#FFFFFF",
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      padding: 16,
    },

    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 14,
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#222222",
    },

    searchBox: {
      height: 48,
      borderWidth: 1,
      borderColor: "#E5E5E5",
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      marginBottom: 10,
    },

    searchInput: {
      flex: 1,
      fontSize: 15,
      color: "#222222",
      marginLeft: 8,
    },

    languageOption: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F2F2F2",
    },

    optionLeft: {
      flexDirection: "row",
      alignItems: "center",
    },

    optionIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        "#FFF2F0",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    optionText: {
      fontSize: 15,
      color: "#222222",
      fontWeight: "500",
    },

    checkbox: {
      width: 22,
      height: 22,
      borderWidth: 1.5,
      borderColor: "#CCCCCC",
      borderRadius: 6,
      alignItems: "center",
      justifyContent:
        "center",
    },

    checkboxSelected: {
      backgroundColor:
        "#F44336",
      borderColor:
        "#F44336",
    },

    doneButton: {
      height: 48,
      borderRadius: 12,
      backgroundColor:
        "#F44336",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 10,
    },

    doneButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },

  });