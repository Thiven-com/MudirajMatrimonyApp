import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  useFocusEffect,
  useRouter,
} from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getMemberSpiritualBackground,
} from "../utils/Functions";


// ======================================================
// CACHE KEY
// ======================================================

const SOCIAL_BACKGROUND_CACHE =
  "SOCIAL_BACKGROUND_CACHE";


// ======================================================
// SAFE STRING
// ======================================================

const safeString = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "";
};


// ======================================================
// GET OBJECT NAME
// ======================================================

const getObjectName = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (
    typeof value === "object"
  ) {
    return String(
      value?.name ??
        value?.religion_name ??
        value?.caste_name ??
        value?.sub_caste_name ??
        value?.family_value_name ??
        value?.label ??
        value?.title ??
        value?.value ??
        ""
    ).trim();
  }

  return "";
};


// ======================================================
// CHECK SPIRITUAL DATA
// ======================================================

const hasSpiritualFields = (object) => {
  if (
    !object ||
    typeof object !== "object" ||
    Array.isArray(object)
  ) {
    return false;
  }

  const keys = [
    "religion_id",
    "religionId",
    "religion",
    "religion_name",
    "religionName",

    "caste_id",
    "casteId",
    "caste",
    "caste_name",
    "casteName",

    "sub_caste_id",
    "subCasteId",
    "sub_caste",
    "subCaste",
    "sub_caste_name",
    "subCasteName",

    "ethnicity",

    "personal_value",
    "personalValue",

    "family_value_id",
    "familyValueId",
    "family_value",
    "familyValue",
    "family_value_name",
    "familyValueName",

    "community_value",
    "communityValue",
  ];

  return keys.some(
    (key) =>
      Object.prototype.hasOwnProperty.call(
        object,
        key
      )
  );
};


// ======================================================
// EXTRACT RESPONSE DATA
// ======================================================

const extractResponseData = (
  response
) => {
  if (
    !response ||
    typeof response !== "object"
  ) {
    return {};
  }

  const visited =
    new Set();


  const search = (
    object,
    depth = 0
  ) => {

    if (
      !object ||
      typeof object !== "object" ||
      Array.isArray(object) ||
      depth > 10
    ) {
      return null;
    }


    if (
      visited.has(object)
    ) {
      return null;
    }


    visited.add(object);


    // ----------------------------------------------
    // Current object
    // ----------------------------------------------

    if (
      hasSpiritualFields(object)
    ) {
      return object;
    }


    // ----------------------------------------------
    // result
    // ----------------------------------------------

    if (
      object.result &&
      typeof object.result === "object" &&
      !Array.isArray(object.result)
    ) {

      const resultData =
        search(
          object.result,
          depth + 1
        );

      if (resultData) {
        return resultData;
      }
    }


    // ----------------------------------------------
    // data
    // ----------------------------------------------

    if (
      object.data &&
      typeof object.data === "object" &&
      !Array.isArray(object.data)
    ) {

      const data =
        search(
          object.data,
          depth + 1
        );

      if (data) {
        return data;
      }
    }


    // ----------------------------------------------
    // response
    // ----------------------------------------------

    if (
      object.response &&
      typeof object.response === "object" &&
      !Array.isArray(object.response)
    ) {

      const responseData =
        search(
          object.response,
          depth + 1
        );

      if (responseData) {
        return responseData;
      }
    }


    return null;
  };


  return (
    search(response) || {}
  );
};


// ======================================================
// GET FIELD VALUE
// ======================================================

const getFieldValue = (
  data,
  keys
) => {

  if (
    !data ||
    typeof data !== "object"
  ) {
    return "-";
  }


  for (
    const key of keys
  ) {

    const value =
      data?.[key];


    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {

      const text =
        getObjectName(value);


      if (text) {
        return text;
      }
    }
  }


  return "-";
};


// ======================================================
// SCREEN
// ======================================================

const SocialBackgroundScreen = () => {

  const router =
    useRouter();


  // ====================================================
  // STATE
  // ====================================================

  const [
    socialBackground,
    setSocialBackground,
  ] = useState({});


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const loadingRef =
    useRef(false);


  // ====================================================
  // GET TOKEN
  // ====================================================

  const getToken =
    useCallback(
      async () => {

        const tokenKeys = [
          "access_token",
          "accessToken",
          "token",
          "userToken",
        ];


        for (
          const key of tokenKeys
        ) {

          const token =
            await AsyncStorage.getItem(
              key
            );


          if (token) {
            return token;
          }
        }


        return null;
      },
      []
    );


  // ====================================================
  // LOAD SPIRITUAL BACKGROUND
  // ====================================================

  const loadSpiritualBackground =
    useCallback(
      async (showLoader = true) => {

        if (
          loadingRef.current
        ) {
          return;
        }


        loadingRef.current = true;


        if (showLoader) {
          setLoading(true);
        }


        try {

          console.log(
            "======================================"
          );

          console.log(
            "SOCIAL BACKGROUND SCREEN FOCUSED"
          );

          console.log(
            "LOADING LATEST DATA..."
          );

          console.log(
            "======================================"
          );


          // ------------------------------------------
          // TOKEN
          // ------------------------------------------

          const token =
            await getToken();


          if (!token) {

            console.log(
              "TOKEN NOT FOUND"
            );


            Alert.alert(
              "Session Expired",
              "Please login again."
            );


            return;
          }


          console.log(
            "TOKEN EXISTS: true"
          );


          // ------------------------------------------
          // GET API
          // ------------------------------------------

          console.log(
            "======================================"
          );

          console.log(
            "GET SPIRITUAL BACKGROUND API"
          );

          console.log(
            "ENDPOINT: /api/member/spiritual-background"
          );

          console.log(
            "======================================"
          );


          const response =
            await getMemberSpiritualBackground(
              token
            );


          console.log(
            "FULL SPIRITUAL BACKGROUND RESPONSE:"
          );


          console.log(
            JSON.stringify(
              response,
              null,
              2
            )
          );


          // ------------------------------------------
          // EXTRACT API DATA
          // ------------------------------------------

          const apiData =
            extractResponseData(
              response
            );


          console.log(
            "EXTRACTED SPIRITUAL DATA:"
          );


          console.log(
            JSON.stringify(
              apiData,
              null,
              2
            )
          );


          // ------------------------------------------
          // GET CACHE
          // ------------------------------------------

          let cachedData = {};


          try {

            const cacheString =
              await AsyncStorage.getItem(
                SOCIAL_BACKGROUND_CACHE
              );


            if (cacheString) {

              cachedData =
                JSON.parse(
                  cacheString
                );


              console.log(
                "======================================"
              );

              console.log(
                "SOCIAL BACKGROUND CACHE:"
              );


              console.log(
                JSON.stringify(
                  cachedData,
                  null,
                  2
                )
              );

              console.log(
                "======================================"
              );
            }

          } catch (cacheError) {

            console.error(
              "CACHE PARSE ERROR:",
              cacheError
            );


            cachedData = {};
          }


          // ------------------------------------------
          // MERGE API + CACHE
          // ------------------------------------------

          const finalData = {

            // RELIGION ID

            religion_id:
              apiData?.religion_id ||
              apiData?.religionId ||
              cachedData?.religion_id ||
              "",


            // RELIGION NAME

            religion_name:
              apiData?.religion_name ||
              apiData?.religionName ||
              (
                typeof apiData?.religion ===
                "string"
                  ? apiData.religion
                  : ""
              ) ||
              (
                typeof apiData?.religion ===
                "object"
                  ? getObjectName(
                      apiData.religion
                    )
                  : ""
              ) ||
              cachedData?.religion_name ||
              "",


            // CASTE ID

            caste_id:
              apiData?.caste_id ||
              apiData?.casteId ||
              cachedData?.caste_id ||
              "",


            // CASTE NAME

            caste_name:
              apiData?.caste_name ||
              apiData?.casteName ||
              (
                typeof apiData?.caste ===
                "string"
                  ? apiData.caste
                  : ""
              ) ||
              (
                typeof apiData?.caste ===
                "object"
                  ? getObjectName(
                      apiData.caste
                    )
                  : ""
              ) ||
              cachedData?.caste_name ||
              "",


            // SUB CASTE ID

            sub_caste_id:
              apiData?.sub_caste_id ||
              apiData?.subCasteId ||
              cachedData?.sub_caste_id ||
              "",


            // SUB CASTE NAME

            sub_caste_name:
              apiData?.sub_caste_name ||
              apiData?.subCasteName ||
              (
                typeof apiData?.sub_caste ===
                "string"
                  ? apiData.sub_caste
                  : ""
              ) ||
              (
                typeof apiData?.sub_caste ===
                "object"
                  ? getObjectName(
                      apiData.sub_caste
                    )
                  : ""
              ) ||
              (
                typeof apiData?.subCaste ===
                "string"
                  ? apiData.subCaste
                  : ""
              ) ||
              (
                typeof apiData?.subCaste ===
                "object"
                  ? getObjectName(
                      apiData.subCaste
                    )
                  : ""
              ) ||
              cachedData?.sub_caste_name ||
              "",


            // ETHNICITY

            ethnicity:
              apiData?.ethnicity ||
              cachedData?.ethnicity ||
              "",


            // PERSONAL VALUE

            personal_value:
              apiData?.personal_value ||
              apiData?.personalValue ||
              cachedData?.personal_value ||
              "",


            // FAMILY VALUE ID

            family_value_id:
              (
                apiData?.family_value_id &&
                !isNaN(
                  Number(
                    apiData.family_value_id
                  )
                )
              )
                ? apiData.family_value_id
                : cachedData?.family_value_id ||
                  "",


            // FAMILY VALUE NAME

            family_value_name:
              apiData?.family_value_name ||
              apiData?.familyValueName ||
              (
                typeof apiData?.family_value ===
                "string" &&
                isNaN(
                  Number(
                    apiData.family_value
                  )
                )
                  ? apiData.family_value
                  : ""
              ) ||
              (
                typeof apiData?.family_value ===
                "object"
                  ? getObjectName(
                      apiData.family_value
                    )
                  : ""
              ) ||
              (
                typeof apiData?.familyValue ===
                "string" &&
                isNaN(
                  Number(
                    apiData.familyValue
                  )
                )
                  ? apiData.familyValue
                  : ""
              ) ||
              cachedData?.family_value_name ||
              "",


            // COMMUNITY VALUE

            community_value:
              apiData?.community_value ||
              apiData?.communityValue ||
              cachedData?.community_value ||
              "",
          };


          // ------------------------------------------
          // LOG FINAL DATA
          // ------------------------------------------

          console.log(
            "======================================"
          );

          console.log(
            "FINAL SOCIAL BACKGROUND DATA:"
          );


          console.log(
            JSON.stringify(
              finalData,
              null,
              2
            )
          );


          console.log(
            "======================================"
          );


          // ------------------------------------------
          // UPDATE SCREEN
          // ------------------------------------------

          setSocialBackground(
            finalData
          );


          // ------------------------------------------
          // SAVE MERGED DATA
          // ------------------------------------------

          await AsyncStorage.setItem(
            SOCIAL_BACKGROUND_CACHE,
            JSON.stringify(
              finalData
            )
          );


          console.log(
            "SOCIAL BACKGROUND SCREEN UPDATED"
          );

        } catch (error) {

          console.error(
            "======================================"
          );

          console.error(
            "SPIRITUAL BACKGROUND SCREEN ERROR:",
            error
          );


          console.error(
            "ERROR RESPONSE:",
            JSON.stringify(
              error?.response?.data ??
                error,
              null,
              2
            )
          );


          console.error(
            "======================================"
          );


          // ----------------------------------------
          // CACHE FALLBACK
          // ----------------------------------------

          try {

            const cacheString =
              await AsyncStorage.getItem(
                SOCIAL_BACKGROUND_CACHE
              );


            if (cacheString) {

              const cachedData =
                JSON.parse(
                  cacheString
                );


              console.log(
                "USING CACHE FALLBACK"
              );


              console.log(
                JSON.stringify(
                  cachedData,
                  null,
                  2
                )
              );


              setSocialBackground(
                cachedData
              );
            }

          } catch (cacheError) {

            console.error(
              "CACHE FALLBACK ERROR:",
              cacheError
            );
          }

        } finally {

          setLoading(false);

          setRefreshing(false);

          loadingRef.current = false;
        }

      },
      [getToken]
    );


  // ====================================================
  // SCREEN FOCUS
  // ====================================================

  useFocusEffect(
    useCallback(
      () => {

        console.log(
          "SOCIAL BACKGROUND SCREEN FOCUS"
        );


        loadSpiritualBackground(
          true
        );


        return () => {

          console.log(
            "SOCIAL BACKGROUND SCREEN BLURRED"
          );

        };

      },
      [
        loadSpiritualBackground,
      ]
    )
  );


  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh =
    useCallback(
      async () => {

        if (
          loadingRef.current
        ) {
          return;
        }


        setRefreshing(true);


        await loadSpiritualBackground(
          false
        );

      },
      [
        loadSpiritualBackground,
      ]
    );


  // ====================================================
  // DISPLAY VALUES
  // ====================================================

  const religion =
    getFieldValue(
      socialBackground,
      [
        "religion_name",
        "religionName",
        "religion",
      ]
    );


  const caste =
    getFieldValue(
      socialBackground,
      [
        "caste_name",
        "casteName",
        "caste",
      ]
    );


  const subCaste =
    getFieldValue(
      socialBackground,
      [
        "sub_caste_name",
        "subCasteName",
        "sub_caste",
        "subCaste",
      ]
    );


  const ethnicity =
    getFieldValue(
      socialBackground,
      [
        "ethnicity",
      ]
    );


  const personalValue =
    getFieldValue(
      socialBackground,
      [
        "personal_value",
        "personalValue",
      ]
    );


  const familyValue =
    getFieldValue(
      socialBackground,
      [
        "family_value_name",
        "familyValueName",
        "family_value",
        "familyValue",
      ]
    );


  const communityValue =
    getFieldValue(
      socialBackground,
      [
        "community_value",
        "communityValue",
      ]
    );


  // ====================================================
  // DETAILS
  // ====================================================

  const details = [
    {
      label: "Religion",
      value: religion,
      icon: "flower-outline",
    },

    {
      label: "Caste",
      value: caste,
      icon: "people-outline",
    },

    {
      label: "Sub Caste",
      value: subCaste,
      icon: "planet-outline",
    },

    {
      label: "Ethnicity",
      value: ethnicity,
      icon: "globe-outline",
    },

    {
      label: "Personal Values",
      value: personalValue,
      icon: "star-outline",
    },

    {
      label: "Family Value",
      value: familyValue,
      icon: "home-outline",
    },

    {
      label: "Community Value",
      value: communityValue,
      icon: "people-circle-outline",
    },
  ];


  // ====================================================
  // EDIT
  // ====================================================

  const handleEdit =
    useCallback(
      () => {

        console.log(
          "OPENING EDIT SOCIAL BACKGROUND"
        );


        router.push(
          "/EditSocialBackground"
        );

      },
      [router]
    );



  // ====================================================
  // UI
  // ====================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >

        <View
          style={styles.card}
        >

          {/* ==========================================
              HEADER
          =========================================== */}

          <View
            style={styles.header}
          >

            <TouchableOpacity
              style={
                styles.backButton
              }
              activeOpacity={0.7}
              onPress={() =>
                router.back()
              }
            >

              <Ionicons
                name="chevron-back"
                size={25}
                color="#D92332"
              />

            </TouchableOpacity>


            <Text
              style={
                styles.headerTitle
              }
              numberOfLines={1}
            >
              Spiritual & Social Background
            </Text>


            <TouchableOpacity
              style={
                styles.menuButton
              }
              activeOpacity={0.7}
              onPress={handleEdit}
            >

              <Ionicons
                name="ellipsis-vertical"
                size={19}
                color="#D92332"
              />

            </TouchableOpacity>

          </View>


          {/* ==========================================
              DETAILS
          =========================================== */}

          <View
            style={
              styles.detailsContainer
            }
          >

            {details.map(
              (item, index) => (

                <View
                  key={item.label}
                  style={[
                    styles.row,
                    index ===
                      details.length - 1 &&
                      styles.lastRow,
                  ]}
                >

                  {/* ICON */}

                  <View
                    style={
                      styles.iconCircle
                    }
                  >

                    <Ionicons
                      name={item.icon}
                      size={18}
                      color="#D92332"
                    />

                  </View>


                  {/* LABEL */}

                  <Text
                    style={
                      styles.label
                    }
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>


                  {/* VALUE */}

                  <View
                    style={
                      styles.valueContainer
                    }
                  >

                    <Text
                      style={
                        styles.value
                      }
                      numberOfLines={2}
                    >
                      {item.value || "-"}
                    </Text>

                  </View>


                  {/* ARROW */}

                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color="#999999"
                  />

                </View>

              )
            )}

          </View>


          {/* ==========================================
              EDIT BUTTON
          =========================================== */}

          <TouchableOpacity
            style={
              styles.editButton
            }
            activeOpacity={0.85}
            onPress={handleEdit}
          >

            <Ionicons
              name="pencil"
              size={15}
              color="#FFFFFF"
            />


            <Text
              style={
                styles.editButtonText
              }
            >
              Edit Details
            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};


export default SocialBackgroundScreen;


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },


  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 20,
  },


  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingTop: 20,
    paddingBottom: 40,
  },


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


  detailsContainer: {
    paddingHorizontal: 12,

    paddingTop: 18,

    paddingBottom: 30,
  },


  row: {
    minHeight: 60,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: "#F1F1F1",
  },


  lastRow: {
    borderBottomWidth: 0,
  },


  iconCircle: {
    width: 32,

    height: 32,

    borderRadius: 16,

    backgroundColor: "#FFF1F2",

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

    paddingLeft: 25,

    paddingRight: 8,
  },


  value: {
    color: "#555555",

    fontSize: 13,

    fontWeight: "600",
  },


  editButton: {
    height: 40,

    marginHorizontal: 12,

    marginTop: 20,

    borderRadius: 7,

    backgroundColor: "#D92332",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },


  editButtonText: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "700",

    marginLeft: 6,
  },


 
});