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
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import {
  getMemberFamilyInfo,
  updateMemberFamilyInfo,
} from "../utils/Functions";

/* =========================================================
   CACHE KEY
========================================================= */

const FAMILY_CACHE_KEY = "member_family_info_cache";

/* =========================================================
   SCREEN
========================================================= */

export default function EditFamilyInformation() {
  const navigation = useNavigation();
  const route = useRoute();

  /* =======================================================
     ROUTE PARAMS
  ======================================================= */

  const selectedField = String(
    route?.params?.field || ""
  ).toLowerCase();

  /* =======================================================
     INPUT STATES
  ======================================================= */

  const [father, setFather] = useState("");
  const [mother, setMother] = useState("");
  const [sibling, setSibling] = useState("");

  /* =======================================================
     SCREEN STATES
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

  const cleanString = useCallback((value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value).trim();
  }, []);

  /* =======================================================
     EXTRACT FAMILY DATA
  ======================================================= */

  const extractFamilyData = useCallback(
    (response) => {
      let data = response;

      /*
        Handle:
        response.data
        response.data.data
        response.result
        response.result.data
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
    },
    [cleanString]
  );

  /* =======================================================
     APPLY DATA
  ======================================================= */

  const applyFamilyData = useCallback(
    (data) => {
      if (!data) {
        return;
      }

      setFather(
        cleanString(data.father)
      );

      setMother(
        cleanString(data.mother)
      );

      setSibling(
        cleanString(data.sibling)
      );
    },
    [cleanString]
  );

  /* =======================================================
     LOAD FAMILY INFORMATION
  ======================================================= */

  const loadFamilyInformation =
    useCallback(async () => {
      try {
        setErrorMessage("");

        /* -----------------------------------------------
           LOAD CACHE FIRST
        ------------------------------------------------ */

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
              parsed
            );

            applyFamilyData(parsed);
          }
        } catch (cacheError) {
          console.log(
            "CACHE READ ERROR:",
            cacheError?.message
          );
        }

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

        /* -----------------------------------------------
           GET API
        ------------------------------------------------ */

        console.log(
          "GET FAMILY INFORMATION"
        );

        const response =
          await getMemberFamilyInfo(
            accessToken
          );

        console.log(
          "FAMILY GET RESPONSE:",
          JSON.stringify(
            response,
            null,
            2
          )
        );

        /* -----------------------------------------------
           EXTRACT DATA
        ------------------------------------------------ */

        const familyData =
          extractFamilyData(response);

        console.log(
          "EXTRACTED FAMILY DATA:",
          familyData
        );

        /* -----------------------------------------------
           CHECK API DATA
        ------------------------------------------------ */

        const hasApiValue =
          familyData.father !== "" ||
          familyData.mother !== "" ||
          familyData.sibling !== "";

        if (hasApiValue) {
          applyFamilyData(
            familyData
          );

          await AsyncStorage.setItem(
            FAMILY_CACHE_KEY,
            JSON.stringify(
              familyData
            )
          );
        }
      } catch (error) {
        console.error(
          "GET FAMILY INFORMATION ERROR:",
          error
        );

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
     LOAD WHEN SCREEN GETS FOCUS
  ======================================================= */

  useFocusEffect(
    useCallback(() => {
      loadFamilyInformation();

      return () => {};
    }, [loadFamilyInformation])
  );

  /* =======================================================
     HARDWARE BACK HANDLER
  ======================================================= */

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

  /* =======================================================
     AUTO FOCUS
  ======================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
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
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedField]);

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    if (saving) {
      return;
    }

    setErrorMessage("");

    const fatherValue =
      father.trim();

    const motherValue =
      mother.trim();

    const siblingValue =
      sibling.trim();

    /* -----------------------------------------------
       VALIDATION
    ------------------------------------------------ */

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

    /* -----------------------------------------------
       TOKEN
    ------------------------------------------------ */

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

    setSaving(true);

    try {
      const body = {
        father: fatherValue,
        mother: motherValue,
        sibling: siblingValue,
      };

      console.log(
        "========================================"
      );

      console.log(
        "UPDATE FAMILY INFORMATION"
      );

      console.log(
        "METHOD: POST"
      );

      console.log(
        "ENDPOINT: /api/member/family-info/update"
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
        "========================================"
      );

      /* -----------------------------------------------
         UPDATE API
      ------------------------------------------------ */

      const response =
        await updateMemberFamilyInfo(
          accessToken,
          body
        );

      console.log(
        "FAMILY UPDATE RESPONSE:",
        JSON.stringify(
          response,
          null,
          2
        )
      );

      /* -----------------------------------------------
         RESPONSE HANDLING
      ------------------------------------------------ */

      const responseData =
        response?.data &&
        typeof response.data === "object"
          ? response.data
          : response;

      const responseStatus =
        response?.statusCode ??
        response?.status ??
        responseData?.statusCode ??
        responseData?.status;

      const explicitFailure =
        response?.success === false ||
        response?.success === 0 ||
        response?.result === false ||
        responseData?.success === false ||
        responseData?.success === 0 ||
        responseData?.result === false;

      const success =
        !explicitFailure &&
        (
          responseStatus === 200 ||
          responseStatus === 201 ||
          responseStatus === 204 ||
          response?.success === true ||
          response?.success === 1 ||
          responseData?.success === true ||
          responseData?.success === 1 ||
          response !== null
        );

      const message =
        response?.message ||
        responseData?.message ||
        responseData?.msg ||
        "Family information updated successfully.";

      /* -----------------------------------------------
         SUCCESS
      ------------------------------------------------ */

      if (success) {
        const updatedFamilyData = {
          father: fatherValue,
          mother: motherValue,
          sibling: siblingValue,
        };

        /* -------------------------------------------
           UPDATE CACHE
        -------------------------------------------- */

        await AsyncStorage.setItem(
          FAMILY_CACHE_KEY,
          JSON.stringify(
            updatedFamilyData
          )
        );

        /* -------------------------------------------
           KEEP SCREEN VALUES
        -------------------------------------------- */

        setFather(fatherValue);
        setMother(motherValue);
        setSibling(siblingValue);

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
      } else {
        setErrorMessage(message);

        Alert.alert(
          "Update Failed",
          message
        );
      }
    } catch (error) {
      console.error(
        "SAVE FAMILY INFORMATION ERROR:",
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
        error?.response?.data?.msg ||
        error?.message ||
        "Unable to update family information.";

      setErrorMessage(message);

      Alert.alert(
        "Update Failed",
        message
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
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
          keyboardShouldPersistTaps="always"
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
                    navigation.goBack();
                  }
                }}
                disabled={saving}
              >
                <Feather
                  name="chevron-left"
                  size={25}
                  color="#D7192A"
                />
              </TouchableOpacity>

              <View
                style={
                  styles.headerIconContainer
                }
              >
                <FontAwesome5
                  name="users"
                  size={16}
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
                <Feather
                  name="alert-circle"
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

            <View
              style={styles.fieldContainer}
            >
              <View
                style={styles.fieldHeader}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        "#4A9BE818",
                    },
                  ]}
                >
                  <Feather
                    name="user"
                    size={18}
                    color="#4A9BE8"
                  />
                </View>

                <Text
                  style={styles.fieldLabel}
                >
                  Father
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  selectedField === "father" &&
                    styles.selectedInputWrapper,
                ]}
              >
                <TextInput
                  ref={fatherRef}
                  value={father}
                  onChangeText={setFather}
                  placeholder="Enter father's name"
                  placeholderTextColor="#A5A5A5"
                  style={styles.input}
                  keyboardType="default"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    motherRef.current?.focus();
                  }}
                />
              </View>
            </View>

            {/* MOTHER */}

            <View
              style={styles.fieldContainer}
            >
              <View
                style={styles.fieldHeader}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        "#E65A9118",
                    },
                  ]}
                >
                  <Feather
                    name="user"
                    size={18}
                    color="#E65A91"
                  />
                </View>

                <Text
                  style={styles.fieldLabel}
                >
                  Mother
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  selectedField === "mother" &&
                    styles.selectedInputWrapper,
                ]}
              >
                <TextInput
                  ref={motherRef}
                  value={mother}
                  onChangeText={setMother}
                  placeholder="Enter mother's name"
                  placeholderTextColor="#A5A5A5"
                  style={styles.input}
                  keyboardType="default"
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    siblingRef.current?.focus();
                  }}
                />
              </View>
            </View>

            {/* SIBLING */}

            <View
              style={styles.fieldContainer}
            >
              <View
                style={styles.fieldHeader}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        "#4CAF7818",
                    },
                  ]}
                >
                  <FontAwesome5
                    name="users"
                    size={16}
                    color="#4CAF78"
                  />
                </View>

                <Text
                  style={styles.fieldLabel}
                >
                  Sibling
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  selectedField === "sibling" &&
                    styles.selectedInputWrapper,
                ]}
              >
                <TextInput
                  ref={siblingRef}
                  value={sibling}
                  onChangeText={(text) => {
                    const numbersOnly =
                      String(text || "").replace(
                        /[^0-9]/g,
                        ""
                      );

                    setSibling(
                      numbersOnly
                    );
                  }}
                  placeholder="Enter number of siblings"
                  placeholderTextColor="#A5A5A5"
                  style={styles.input}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!saving}
                  returnKeyType="done"
                  maxLength={3}
                  onSubmitEditing={() => {
                    siblingRef.current?.blur();
                  }}
                />
              </View>
            </View>

            {/* SAVE */}

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
              <Feather
                name={
                  saving
                    ? "refresh-cw"
                    : "check-circle"
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 30,
  },

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

  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginTop: 10,
    marginBottom: 16,
  },

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

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: "#777777",
    marginBottom: 20,
  },

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
  },

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