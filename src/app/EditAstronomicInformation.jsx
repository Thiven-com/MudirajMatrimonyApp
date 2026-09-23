import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { SafeAreaView } from "react-native-safe-area-context";

import Feather from "react-native-vector-icons/Feather";

import {
  getMemberAstronomic,
  updateMemberAstronomic,
} from "../utils/Functions";

/* =========================================================
   SCREEN
========================================================= */

const EditAstronomicInformation = () => {
  const navigation = useNavigation();
  const route = useRoute();

  /* =========================================================
     ROUTE PARAMS
  ========================================================= */

  const selectedField = String(
    route?.params?.field || ""
  ).toLowerCase();

  /* =========================================================
     STATE
  ========================================================= */

  const [sunSign, setSunSign] = useState("");
  const [moonSign, setMoonSign] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [cityOfBirth, setCityOfBirth] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* =========================================================
     REFS
  ========================================================= */

  const sunSignRef = useRef(null);
  const moonSignRef = useRef(null);
  const timeOfBirthRef = useRef(null);
  const cityOfBirthRef = useRef(null);

  /* =========================================================
     GET ASTRONOMIC INFORMATION
  ========================================================= */

  const loadAstronomicInformation = useCallback(
    async () => {
      try {
        setErrorMessage("");

        /* -----------------------------------------------
           GET TOKEN
        ------------------------------------------------ */

        const accessToken =
          await AsyncStorage.getItem(
            "access_token"
          );

        if (!accessToken) {
          setErrorMessage(
            "Please login again."
          );

          return;
        }

        console.log(
          "GET /api/member/astronomic"
        );

        /* -----------------------------------------------
           GET API
        ------------------------------------------------ */

        const response =
          await getMemberAstronomic(
            accessToken
          );

        console.log(
          "EDIT ASTRONOMIC RESPONSE:",
          JSON.stringify(
            response,
            null,
            2
          )
        );

        if (!response) {
          setErrorMessage(
            "Astronomic information not found."
          );

          return;
        }

        /* -----------------------------------------------
           EXTRACT DATA
        ------------------------------------------------ */

        let data = response?.data;

        if (
          data?.data &&
          typeof data.data === "object"
        ) {
          data = data.data;
        }

        /*
         * In case API response uses result
         */

        if (
          data?.result &&
          typeof data.result === "object"
        ) {
          data = data.result;
        }

        /*
         * Handle another possible nested result.data
         */

        if (
          data?.result?.data &&
          typeof data.result.data === "object"
        ) {
          data = data.result.data;
        }

        console.log(
          "EDIT ASTRONOMIC DATA:",
          JSON.stringify(
            data,
            null,
            2
          )
        );

        /* -----------------------------------------------
           SET VALUES
        ------------------------------------------------ */

        setSunSign(
          String(
            data?.sun_sign ??
            data?.sunSign ??
            ""
          )
        );

        setMoonSign(
          String(
            data?.moon_sign ??
            data?.moonSign ??
            ""
          )
        );

        setTimeOfBirth(
          String(
            data?.time_of_birth ??
            data?.timeOfBirth ??
            ""
          )
        );

        setCityOfBirth(
          String(
            data?.city_of_birth ??
            data?.cityOfBirth ??
            ""
          )
        );

        setErrorMessage("");
      } catch (error) {
        console.log(
          "EDIT ASTRONOMIC ERROR:",
          error
        );

        console.log(
          "ERROR RESPONSE:",
          JSON.stringify(
            error?.response?.data,
            null,
            2
          )
        );

        setErrorMessage(
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load astronomic information."
        );
      }
    },
    []
  );

  /* =========================================================
     LOAD WHEN SCREEN GETS FOCUS
  ========================================================= */

  useFocusEffect(
    useCallback(() => {
      loadAstronomicInformation();

      return () => {};
    }, [
      loadAstronomicInformation,
    ])
  );

  /* =========================================================
     HARDWARE BACK HANDLER
  ========================================================= */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (saving) {
          return true;
        }

        navigation.goBack();

        return true;
      };

      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );

      return () => {
        subscription.remove();
      };
    }, [
      navigation,
      saving,
    ])
  );

  /* =========================================================
     AUTO FOCUS SELECTED FIELD
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        selectedField === "sun_sign"
      ) {
        sunSignRef.current?.focus();
      }

      if (
        selectedField === "moon_sign"
      ) {
        moonSignRef.current?.focus();
      }

      if (
        selectedField === "time_of_birth"
      ) {
        timeOfBirthRef.current?.focus();
      }

      if (
        selectedField === "city_of_birth"
      ) {
        cityOfBirthRef.current?.focus();
      }
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedField]);

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setErrorMessage("");
    setSaving(true);

    try {
      /* -----------------------------------------------
         GET TOKEN
      ------------------------------------------------ */

      const accessToken =
        await AsyncStorage.getItem(
          "access_token"
        );

      console.log(
        "========================================"
      );

      console.log(
        "SAVE ASTRONOMIC INFORMATION"
      );

      console.log(
        "TOKEN EXISTS:",
        !!accessToken
      );

      if (!accessToken) {
        setErrorMessage(
          "Please login again."
        );

        Alert.alert(
          "Login Required",
          "Please login again."
        );

        return;
      }

      /* -----------------------------------------------
         VALIDATION
      ------------------------------------------------ */

      const cleanSunSign =
        String(
          sunSign || ""
        ).trim();

      const cleanMoonSign =
        String(
          moonSign || ""
        ).trim();

      const cleanTimeOfBirth =
        String(
          timeOfBirth || ""
        ).trim();

      const cleanCityOfBirth =
        String(
          cityOfBirth || ""
        ).trim();

      if (!cleanSunSign) {
        setErrorMessage(
          "Please enter Sun Sign."
        );

        Alert.alert(
          "Required",
          "Please enter Sun Sign.",
          [
            {
              text: "OK",
              onPress: () => {
                sunSignRef.current?.focus();
              },
            },
          ]
        );

        return;
      }

      if (!cleanMoonSign) {
        setErrorMessage(
          "Please enter Moon Sign."
        );

        Alert.alert(
          "Required",
          "Please enter Moon Sign.",
          [
            {
              text: "OK",
              onPress: () => {
                moonSignRef.current?.focus();
              },
            },
          ]
        );

        return;
      }

      if (!cleanTimeOfBirth) {
        setErrorMessage(
          "Please enter Time Of Birth."
        );

        Alert.alert(
          "Required",
          "Please enter Time Of Birth.",
          [
            {
              text: "OK",
              onPress: () => {
                timeOfBirthRef.current?.focus();
              },
            },
          ]
        );

        return;
      }

      if (!cleanCityOfBirth) {
        setErrorMessage(
          "Please enter City Of Birth."
        );

        Alert.alert(
          "Required",
          "Please enter City Of Birth.",
          [
            {
              text: "OK",
              onPress: () => {
                cityOfBirthRef.current?.focus();
              },
            },
          ]
        );

        return;
      }

      /* -----------------------------------------------
         REQUEST BODY
      ------------------------------------------------ */

      const body = {
        sun_sign: cleanSunSign,
        moon_sign: cleanMoonSign,
        time_of_birth: cleanTimeOfBirth,
        city_of_birth: cleanCityOfBirth,
      };

      console.log(
        "ASTRONOMIC UPDATE BODY:",
        JSON.stringify(
          body,
          null,
          2
        )
      );

      /* -----------------------------------------------
         CALL POST API
      ------------------------------------------------ */

      const response =
        await updateMemberAstronomic(
          accessToken,
          body
        );

      console.log(
        "ASTRONOMIC UPDATE RESPONSE:",
        JSON.stringify(
          response,
          null,
          2
        )
      );

      /* -----------------------------------------------
         RESPONSE DATA
      ------------------------------------------------ */

      const responseData =
        response?.data &&
        typeof response.data === "object"
          ? response.data
          : response;

      /* -----------------------------------------------
         CHECK RESPONSE
      ------------------------------------------------ */

      const success =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true ||
        responseData?.success === 1 ||
        responseData?.success === true ||
        responseData?.result === true ||
        response?.status === 200 ||
        response?.status === 201 ||
        response?.statusCode === 200 ||
        response?.statusCode === 201;

      if (success) {
        const message =
          response?.message ||
          responseData?.message ||
          "Astronomic information updated successfully.";

        Alert.alert(
          "Success",
          message,
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
          {
            cancelable: false,
          }
        );

        return;
      }

      /* -----------------------------------------------
         API RETURNED FAILURE
      ------------------------------------------------ */

      const message =
        response?.message ||
        response?.error ||
        responseData?.message ||
        responseData?.error ||
        "Unable to update astronomic information.";

      setErrorMessage(message);

      Alert.alert(
        "Update Failed",
        message
      );
    } catch (error) {
      console.error(
        "SAVE ASTRONOMIC ERROR:",
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

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to update astronomic information.";

      setErrorMessage(message);

      Alert.alert(
        "Error",
        message
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     FIELD FOCUS
  ========================================================= */

  const shouldFocus = useCallback(
    (field) => {
      return selectedField === field;
    },
    [selectedField]
  );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F7F7"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View
          style={styles.screenContainer}
        >
          <View
            style={styles.card}
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <View
              style={styles.header}
            >
              <TouchableOpacity
                style={styles.backButton}
                activeOpacity={0.7}
                onPress={() => {
                  if (!saving) {
                    navigation.goBack();
                  }
                }}
                disabled={saving}
              >
                <Feather
                  name="chevron-left"
                  size={29}
                  color="#D7192E"
                />
              </TouchableOpacity>

              <Text
                style={styles.headerTitle}
                numberOfLines={1}
              >
                Edit Astronomic Information
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={
                styles.scrollContent
              }
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
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
                  <Feather
                    name="alert-circle"
                    size={17}
                    color="#D7192E"
                  />

                  <Text
                    style={
                      styles.errorText
                    }
                  >
                    {errorMessage}
                  </Text>
                </View>
              ) : null}

              {/* =================================================
                  SUN SIGN
              ================================================= */}

              <View
                style={[
                  styles.inputSection,
                  shouldFocus(
                    "sun_sign"
                  ) &&
                    styles.selectedSection,
                ]}
              >
                <View
                  style={styles.labelRow}
                >
                  <View
                    style={
                      styles.iconCircle
                    }
                  >
                    <Feather
                      name="sun"
                      size={21}
                      color="#F5A800"
                    />
                  </View>

                  <Text
                    style={styles.label}
                  >
                    Sun Sign
                  </Text>
                </View>

                <TextInput
                  ref={sunSignRef}
                  value={sunSign}
                  onChangeText={
                    setSunSign
                  }
                  placeholder="Enter sun sign"
                  placeholderTextColor="#999999"
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    moonSignRef.current?.focus();
                  }}
                />
              </View>

              {/* =================================================
                  MOON SIGN
              ================================================= */}

              <View
                style={[
                  styles.inputSection,
                  shouldFocus(
                    "moon_sign"
                  ) &&
                    styles.selectedSection,
                ]}
              >
                <View
                  style={styles.labelRow}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor:
                          "#F2E9FF",
                      },
                    ]}
                  >
                    <Feather
                      name="moon"
                      size={21}
                      color="#8145D7"
                    />
                  </View>

                  <Text
                    style={styles.label}
                  >
                    Moon Sign
                  </Text>
                </View>

                <TextInput
                  ref={moonSignRef}
                  value={moonSign}
                  onChangeText={
                    setMoonSign
                  }
                  placeholder="Enter moon sign"
                  placeholderTextColor="#999999"
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    timeOfBirthRef.current?.focus();
                  }}
                />
              </View>

              {/* =================================================
                  TIME OF BIRTH
              ================================================= */}

              <View
                style={[
                  styles.inputSection,
                  shouldFocus(
                    "time_of_birth"
                  ) &&
                    styles.selectedSection,
                ]}
              >
                <View
                  style={styles.labelRow}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor:
                          "#FFECEF",
                      },
                    ]}
                  >
                    <Feather
                      name="clock"
                      size={21}
                      color="#D7192E"
                    />
                  </View>

                  <Text
                    style={styles.label}
                  >
                    Time Of Birth
                  </Text>
                </View>

                <TextInput
                  ref={timeOfBirthRef}
                  value={timeOfBirth}
                  onChangeText={
                    setTimeOfBirth
                  }
                  placeholder="Enter time of birth"
                  placeholderTextColor="#999999"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    cityOfBirthRef.current?.focus();
                  }}
                />
              </View>

              {/* =================================================
                  CITY OF BIRTH
              ================================================= */}

              <View
                style={[
                  styles.inputSection,
                  shouldFocus(
                    "city_of_birth"
                  ) &&
                    styles.selectedSection,
                ]}
              >
                <View
                  style={styles.labelRow}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor:
                          "#EAF7EA",
                      },
                    ]}
                  >
                    <Feather
                      name="map-pin"
                      size={21}
                      color="#2E7D32"
                    />
                  </View>

                  <Text
                    style={styles.label}
                  >
                    City Of Birth
                  </Text>
                </View>

                <TextInput
                  ref={cityOfBirthRef}
                  value={cityOfBirth}
                  onChangeText={
                    setCityOfBirth
                  }
                  placeholder="Enter city of birth"
                  placeholderTextColor="#999999"
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    cityOfBirthRef.current?.blur();
                  }}
                />
              </View>

              {/* =================================================
                  SAVE BUTTON
              ================================================= */}

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving &&
                    styles.saveButtonDisabled,
                ]}
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Feather
                    name="refresh-cw"
                    size={20}
                    color="#FFFFFF"
                  />
                ) : (
                  <Feather
                    name="check-circle"
                    size={21}
                    color="#FFFFFF"
                  />
                )}

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </Text>
              </TouchableOpacity>

              {/* =================================================
                  CANCEL
              ================================================= */}

              <TouchableOpacity
                style={
                  styles.cancelButton
                }
                activeOpacity={0.7}
                onPress={() => {
                  if (!saving) {
                    navigation.goBack();
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
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

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
    marginLeft: 5,
    color: "#C9142B",
    fontSize: 16,
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 30,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    marginLeft: 7,
    color: "#D7192E",
    fontSize: 13,
    textAlign: "left",
  },

  inputSection: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 10,
    padding: 13,
    marginBottom: 14,
  },

  selectedSection: {
    borderColor: "#D7192E",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFF5D8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  label: {
    flex: 1,
    color: "#444444",
    fontSize: 14,
    fontWeight: "700",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 8,
    paddingHorizontal: 13,
    color: "#444444",
    fontSize: 14,
    backgroundColor: "#FAFAFA",
  },

  saveButton: {
    height: 49,
    borderRadius: 9,
    backgroundColor: "#D7192E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  cancelButton: {
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  cancelText: {
    color: "#D7192E",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default EditAstronomicInformation;