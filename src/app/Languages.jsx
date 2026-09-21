import {
    useCallback,
    useState,
} from "react";

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    router,
    useFocusEffect,
} from "expo-router";

import {
    getMemberLanguages,
} from "../utils/Functions";


// =========================================================
// LANGUAGE CACHE KEY
// =========================================================

const LANGUAGE_CACHE_KEY =
  "member_languages_cache";


// =========================================================
// LANGUAGE NAME LIST
// =========================================================

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
// NORMALIZE KEY
// =========================================================

const normalizeKey = (key) => {
  return String(key || "")
    .toLowerCase()
    .replace(/[_\-\s]/g, "");
};


// =========================================================
// GET VALUE DEEPLY
// =========================================================

const findValueDeep = (
  data,
  possibleKeys
) => {
  if (
    data === null ||
    data === undefined
  ) {
    return undefined;
  }

  if (
    typeof data !== "object"
  ) {
    return undefined;
  }

  const wantedKeys =
    possibleKeys.map(
      normalizeKey
    );

  // Current object
  for (
    const key of Object.keys(data)
  ) {
    const normalized =
      normalizeKey(key);

    if (
      wantedKeys.includes(
        normalized
      )
    ) {
      const value =
        data[key];

      if (
        value !== null &&
        value !== undefined
      ) {
        return value;
      }
    }
  }

  // Nested objects
  for (
    const key of Object.keys(data)
  ) {
    const value =
      data[key];

    if (
      value &&
      typeof value === "object"
    ) {
      const result =
        findValueDeep(
          value,
          possibleKeys
        );

      if (
        result !== undefined
      ) {
        return result;
      }
    }
  }

  return undefined;
};


// =========================================================
// GET LANGUAGE NAME
// =========================================================

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
    if (item.length === 0) {
      return "";
    }

    return getLanguageName(
      item[0]
    );
  }

  if (
    typeof item === "object"
  ) {

    const value =
      item?.name ??
      item?.language_name ??
      item?.languageName ??
      item?.language ??
      item?.title ??
      item?.label ??
      item?.value ??
      item?.text ??
      item?.display_name ??
      item?.displayName ??
      "";

    if (
      typeof value === "object"
    ) {
      return getLanguageName(
        value
      );
    }

    return String(
      value || ""
    ).trim();
  }

  return "";
};


// =========================================================
// REMOVE DUPLICATES
// =========================================================

const uniqueLanguages = (
  languages
) => {

  const result = [];

  if (
    !Array.isArray(
      languages
    )
  ) {
    return result;
  }

  languages.forEach(
    (item) => {

      const value =
        getLanguageName(
          item
        );

      if (!value) {
        return;
      }

      const exists =
        result.some(
          (oldValue) =>
            oldValue.toLowerCase() ===
            value.toLowerCase()
        );

      if (!exists) {
        result.push(value);
      }
    }
  );

  return result;
};


// =========================================================
// NORMALIZE KNOWN LANGUAGES
// =========================================================

const normalizeKnownLanguages = (
  value
) => {

  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }


  // Array
  if (
    Array.isArray(value)
  ) {

    return uniqueLanguages(
      value
    );
  }


  // String
  if (
    typeof value === "string"
  ) {

    const text =
      value.trim();

    if (!text) {
      return [];
    }


    // JSON array
    if (
      text.startsWith("[") &&
      text.endsWith("]")
    ) {

      try {

        const parsed =
          JSON.parse(text);

        if (
          Array.isArray(
            parsed
          )
        ) {
          return uniqueLanguages(
            parsed
          );
        }

      } catch (error) {
        console.log(
          "KNOWN LANGUAGES JSON ERROR:",
          error
        );
      }
    }


    // JSON object
    if (
      text.startsWith("{") &&
      text.endsWith("}")
    ) {

      try {

        const parsed =
          JSON.parse(text);

        return normalizeKnownLanguages(
          parsed
        );

      } catch (error) {
        console.log(
          "KNOWN LANGUAGES OBJECT ERROR:",
          error
        );
      }
    }


    // Comma separated
    if (
      text.includes(",")
    ) {

      return uniqueLanguages(
        text
          .split(",")
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean)
      );
    }


    return [text];
  }


  // Object
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
      value?.list ??
      value?.results;

    if (
      Array.isArray(
        nested
      )
    ) {

      return uniqueLanguages(
        nested
      );
    }

    if (
      nested !== undefined
    ) {

      const result =
        normalizeKnownLanguages(
          nested
        );

      if (
        result.length
      ) {
        return result;
      }
    }


    const single =
      getLanguageName(
        value
      );

    if (single) {
      return [single];
    }


    // Object values
    const values =
      Object.values(
        value
      );

    const result =
      uniqueLanguages(
        values
      );

    if (
      result.length
    ) {
      return result;
    }
  }

  return [];
};


// =========================================================
// GET MOTHER TONGUE
// =========================================================

const getMotherTongue = (
  response
) => {

  const value =
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
        "mother_language_name",
        "motherLanguageName",
        "motherTongueLanguage",
        "mother_tongue_language",
      ]
    );


  console.log(
    "FOUND MOTHER TONGUE:",
    value
  );


  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return getLanguageName(
    value
  );
};


// =========================================================
// GET KNOWN LANGUAGES
// =========================================================

const getKnownLanguages = (
  response
) => {

  let value =
    findValueDeep(
      response,
      [
        "known_languages",
        "knownLanguages",
        "known_language",
        "knownLanguage",
        "languages_known",
        "languagesKnown",
        "known_language_names",
        "knownLanguageNames",
      ]
    );


  // Only fallback to generic languages
  // when known_languages doesn't exist.
  if (
    value === undefined
  ) {

    value =
      findValueDeep(
        response,
        [
          "languages",
          "language_list",
          "languageList",
        ]
      );
  }


  console.log(
    "FOUND KNOWN LANGUAGES:",
    value
  );


  return normalizeKnownLanguages(
    value
  );
};


// =========================================================
// READ CACHE
// =========================================================

const readLanguageCache =
  async () => {

    try {

      const cached =
        await AsyncStorage.getItem(
          LANGUAGE_CACHE_KEY
        );

      if (!cached) {
        return null;
      }

      const parsed =
        JSON.parse(
          cached
        );

      return parsed;

    } catch (error) {

      console.log(
        "LANGUAGE CACHE READ ERROR:",
        error
      );

      return null;
    }
  };


// =========================================================
// SAVE CACHE
// =========================================================

const saveLanguageCache =
  async (
    motherTongue,
    knownLanguages
  ) => {

    try {

      const value = {
        mother_tongue:
          String(
            motherTongue || ""
          ).trim(),

        known_languages:
          uniqueLanguages(
            knownLanguages
          ),
      };

      await AsyncStorage.setItem(
        LANGUAGE_CACHE_KEY,
        JSON.stringify(
          value
        )
      );

    } catch (error) {

      console.log(
        "LANGUAGE CACHE SAVE ERROR:",
        error
      );
    }
  };


// =========================================================
// SCREEN
// =========================================================

export default function Languages() {

  const [
    motherTongue,
    setMotherTongue,
  ] = useState("");

  const [
    knownLanguages,
    setKnownLanguages,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadLanguages =
    useCallback(
      async () => {

        try {

          setErrorMessage("");

          // -------------------------------------------------
          // FIRST: SHOW CACHE
          // This makes updated values appear immediately.
          // -------------------------------------------------

          const cached =
            await readLanguageCache();

          if (
            cached
          ) {

            const cachedMother =
              String(
                cached?.mother_tongue ||
                ""
              ).trim();

            const cachedKnown =
              normalizeKnownLanguages(
                cached?.known_languages
              );

            if (
              cachedMother
            ) {
              setMotherTongue(
                cachedMother
              );
            }

            if (
              cachedKnown.length
            ) {
              setKnownLanguages(
                cachedKnown
              );
            }
          }


          // -------------------------------------------------
          // GET API
          // -------------------------------------------------

          const accessToken =
            await AsyncStorage.getItem(
              "access_token"
            );


          console.log(
            "========================================"
          );

          console.log(
            "LOAD MEMBER LANGUAGES"
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


          setLoading(true);


          const response =
            await getMemberLanguages(
              accessToken
            );


          console.log(
            "========================================"
          );

          console.log(
            "RAW MEMBER LANGUAGES RESPONSE"
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


          const apiMother =
            getMotherTongue(
              response
            );

          const apiKnown =
            getKnownLanguages(
              response
            );


          console.log(
            "========================================"
          );

          console.log(
            "FINAL DISPLAY VALUES"
          );

          console.log(
            "MOTHER TONGUE:",
            apiMother
          );

          console.log(
            "KNOWN LANGUAGES:",
            apiKnown
          );

          console.log(
            "========================================"
          );


          // -------------------------------------------------
          // IMPORTANT:
          // If API has values, use API.
          // If API parser returns empty, keep cache.
          // -------------------------------------------------

          if (
            apiMother
          ) {

            setMotherTongue(
              apiMother
            );
          }


          if (
            apiKnown.length > 0
          ) {

            setKnownLanguages(
              apiKnown
            );
          }


          // Save successful API result
          if (
            apiMother ||
            apiKnown.length
          ) {

            await saveLanguageCache(
              apiMother ||
                cached?.mother_tongue ||
                "",
              apiKnown.length
                ? apiKnown
                : cached?.known_languages ||
                  []
            );
          }

        } catch (error) {

          console.error(
            "========================================"
          );

          console.error(
            "LANGUAGES GET ERROR"
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


          const cached =
            await readLanguageCache();

          if (
            cached
          ) {

            setMotherTongue(
              String(
                cached?.mother_tongue ||
                ""
              ).trim()
            );

            setKnownLanguages(
              normalizeKnownLanguages(
                cached?.known_languages
              )
            );

          } else {

            setErrorMessage(
              error?.response?.data?.message ||
              error?.message ||
              "Unable to load languages."
            );
          }

        } finally {

          setLoading(false);
        }

      },
      []
    );


  // =======================================================
  // REFRESH EVERY TIME SCREEN GETS FOCUS
  // =======================================================

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


  // =======================================================
  // EDIT MOTHER TONGUE
  // =======================================================

  const editMotherTongue =
    () => {

      router.push({
        pathname:
          "/EditLanguages",

        params: {
          field:
            "motherTongue",
        },
      });
    };


  // =======================================================
  // EDIT KNOWN LANGUAGES
  // =======================================================

  const editKnownLanguages =
    () => {

      router.push({
        pathname:
          "/EditLanguages",

        params: {
          field:
            "knownLanguages",
        },
      });
    };


  // =======================================================
  // RETRY
  // =======================================================

  const retry =
    () => {

      loadLanguages();
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
          Languages
        </Text>


        <View
          style={styles.headerRight}
        />

      </View>


      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ERROR */}

        {errorMessage ? (
          <View
            style={styles.errorBox}
          >

            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#E53935"
            />

            <Text
              style={styles.errorText}
            >
              {errorMessage}
            </Text>

            <TouchableOpacity
              onPress={retry}
            >

              <Text
                style={styles.retryText}
              >
                Retry
              </Text>

            </TouchableOpacity>

          </View>
        ) : null}


        {/* MOTHER TONGUE */}

        <View
          style={styles.card}
        >

          <View
            style={styles.cardLeft}
          >

            <View
              style={styles.iconCircle}
            >

              <Ionicons
                name="language-outline"
                size={23}
                color="#F44336"
              />

            </View>


            <View
              style={styles.textContainer}
            >

              <Text
                style={styles.label}
              >
                Mother Tongue
              </Text>


              {motherTongue ? (
                <Text
                  style={styles.value}
                >
                  {motherTongue}
                </Text>
              ) : (
                <Text
                  style={styles.emptyValue}
                >
                  Not added
                </Text>
              )}

            </View>

          </View>


          <TouchableOpacity
            style={styles.editButton}
            onPress={
              editMotherTongue
            }
          >

            <Ionicons
              name="create-outline"
              size={20}
              color="#F44336"
            />

          </TouchableOpacity>

        </View>


        {/* KNOWN LANGUAGES */}

        <View
          style={styles.card}
        >

          <View
            style={styles.cardLeft}
          >

            <View
              style={styles.iconCircle}
            >

              <Ionicons
                name="globe-outline"
                size={23}
                color="#F44336"
              />

            </View>


            <View
              style={styles.textContainer}
            >

              <Text
                style={styles.label}
              >
                Known Languages
              </Text>


              {knownLanguages.length >
              0 ? (

                <View
                  style={
                    styles.languageList
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
                          styles.languageChip
                        }
                      >

                        <Text
                          style={
                            styles.languageText
                          }
                        >
                          {language}
                        </Text>

                      </View>

                    )
                  )}

                </View>

              ) : (

                <Text
                  style={
                    styles.emptyValue
                  }
                >
                  Not added
                </Text>

              )}

            </View>

          </View>


          <TouchableOpacity
            style={styles.editButton}
            onPress={
              editKnownLanguages
            }
          >

            <Ionicons
              name="create-outline"
              size={20}
              color="#F44336"
            />

          </TouchableOpacity>

        </View>


        {/* EDIT BUTTON */}

        <TouchableOpacity
          style={
            styles.bottomEditButton
          }
          onPress={() =>
            router.push(
              "/EditLanguages"
            )
          }
          activeOpacity={0.85}
        >

          <Ionicons
            name="create-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.bottomEditText
            }
          >
            Edit Languages
          </Text>

        </TouchableOpacity>


        {/* SMALL STATUS */}

        {loading ? (
          <Text
            style={styles.refreshText}
          >
            Refreshing language information...
          </Text>
        ) : null}

      </ScrollView>

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
      backgroundColor:
        "#FFFFFF",
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

    scrollView: {
      flex: 1,
    },

    contentContainer: {
      padding: 16,
      paddingBottom: 40,
    },

    card: {
      width: "100%",
      minHeight: 95,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#EEEEEE",
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
      flexDirection: "row",
      alignItems:
        "flex-start",
      justifyContent:
        "space-between",

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
      alignItems:
        "flex-start",
    },

    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        "#FFF2F0",
      alignItems: "center",
      justifyContent:
        "center",
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
    },

    editButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        "#FFF2F0",
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 10,
    },

    languageList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    languageChip: {
      backgroundColor:
        "#FFF2F0",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 18,
      marginBottom: 4,
    },

    languageText: {
      fontSize: 14,
      color: "#F44336",
      fontWeight: "600",
    },

    bottomEditButton: {
      height: 52,
      backgroundColor:
        "#F44336",
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 10,
    },

    bottomEditText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FFF3F3",
      borderWidth: 1,
      borderColor:
        "#FFD2D2",
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
      color: "#F44336",
      fontWeight: "700",
      marginLeft: 8,
    },

    refreshText: {
      textAlign: "center",
      marginTop: 12,
      color: "#999999",
      fontSize: 12,
    },

  });