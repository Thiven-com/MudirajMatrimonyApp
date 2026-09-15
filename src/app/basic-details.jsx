
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

// =========================================================
// API
// =========================================================
// Change this path if your Functions.js is located elsewhere.
import { updateMemberBasicInfo } from "../utils/Functions";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// =========================================================
// GENDER
// =========================================================

const GENDER_OPTIONS = [
  {
    key: "1",
    label: "Male",
    icon: "male-outline",
    activeColor: Colors.primaryRed,
  },
  {
    key: "2",
    label: "Female",
    icon: "female-outline",
    activeColor: "#D6336C",
  },
  {
    key: "3",
    label: "Other",
    icon: "person-outline",
    activeColor: "#E0A93E",
  },
];

// =========================================================
// MARITAL STATUS
// =========================================================

const MARITAL_OPTIONS = [
  {
    key: "1",
    label: "Never Married",
  },
  {
    key: "2",
    label: "Married",
  },
  {
    key: "3",
    label: "Divorced",
  },
  {
    key: "4",
    label: "Widowed",
  },
  {
    key: "5",
    label: "Separated",
  },
];

// =========================================================
// ON BEHALF
// =========================================================

const ON_BEHALF_OPTIONS = [
  {
    key: "1",
    label: "Myself",
  },
  {
    key: "2",
    label: "Parent",
  },
  {
    key: "3",
    label: "Sibling",
  },
  {
    key: "4",
    label: "Relative",
  },
  {
    key: "5",
    label: "Friend",
  },
];

// =========================================================
// CHILDREN
// =========================================================

const CHILDREN_OPTIONS = [
  {
    key: "0",
    label: "No Children",
  },
  {
    key: "1",
    label: "1 Child",
  },
  {
    key: "2",
    label: "2 Children",
  },
  {
    key: "3",
    label: "3 Children",
  },
  {
    key: "4",
    label: "4+ Children",
  },
];

// =========================================================
// BLOOD GROUP
// =========================================================

const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
];

// =========================================================
// MOTHER TONGUE
// =========================================================

const MOTHER_TONGUE_OPTIONS = [
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
  "Odia",
  "Other",
];

// =========================================================
// LANGUAGES
// =========================================================

const LANGUAGE_OPTIONS = [
  "Telugu",
  "English",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
];

// =========================================================
// NATIONALITY
// =========================================================

const NATIONALITY_OPTIONS = [
  "Indian",
  "American",
  "British",
  "Canadian",
  "Australian",
  "Other",
];

// =========================================================
// HEIGHT
// =========================================================

const HEIGHT_OPTIONS = [
  `4' 10"`,
  `4' 11"`,
  `5' 0"`,
  `5' 1"`,
  `5' 2"`,
  `5' 3"`,
  `5' 4"`,
  `5' 5"`,
  `5' 6"`,
  `5' 7"`,
  `5' 8"`,
  `5' 9"`,
  `5' 10"`,
  `5' 11"`,
  `6' 0"`,
  `6' 1"`,
  `6' 2"`,
  `6' 3"`,
  `6' 4"`,
];

// =========================================================
// COMPONENT
// =========================================================

export default function BasicDetailsScreen() {
  const router = useRouter();

  // =======================================================
  // BASIC API DETAILS
  // =======================================================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");

  const [gender, setGender] = useState("1");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [onBehalf, setOnBehalf] = useState("1");
  const [children, setChildren] = useState("0");

  // =======================================================
  // OTHER DETAILS
  // =======================================================

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [motherTongue, setMotherTongue] = useState("");
  const [languages, setLanguages] = useState("");
  const [nationality, setNationality] = useState("Indian");
  const [city, setCity] = useState("");

  // =======================================================
  // UI STATE
  // =======================================================

  const [saving, setSaving] = useState(false);
  const [dropdown, setDropdown] = useState(null);

  // =======================================================
  // OPEN DROPDOWN
  // =======================================================

  const openDropdown = (
    type,
    title,
    options,
    value,
    setter
  ) => {
    setDropdown({
      type,
      title,
      options,
      value,
      setter,
    });
  };

  // =======================================================
  // SELECT DROPDOWN VALUE
  // =======================================================

  const selectDropdownValue = (value) => {
    if (!dropdown) {
      return;
    }

    dropdown.setter(value);
    setDropdown(null);
  };

  // =======================================================
  // GET ACCESS TOKEN
  // =======================================================

  const getAccessToken = async () => {
    try {
      const token =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken")) ||
        (await AsyncStorage.getItem("varshika")) ||
        (await AsyncStorage.getItem("token"));

      console.log("=================================");
      console.log("GET ACCESS TOKEN");
      console.log("TOKEN EXISTS:", !!token);
      console.log("=================================");

      return token;
    } catch (error) {
      console.error("TOKEN ERROR:", error);
      return null;
    }
  };

  // =======================================================
  // FORMAT DOB
  // API FORMAT:
  // DD-MM-YYYY
  // =======================================================

  const formatDateForApi = (value) => {
    if (!value) {
      return "";
    }

    return String(value)
      .trim()
      .replace(/\//g, "-")
      .replace(/\s+/g, "");
  };

  // =======================================================
  // VALIDATE DOB
  // =======================================================

  const isValidDate = (value) => {
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

    if (!dateRegex.test(value)) {
      return false;
    }

    const [day, month, year] = value.split("-").map(Number);

    if (
      day < 1 ||
      day > 31 ||
      month < 1 ||
      month > 12 ||
      year < 1900
    ) {
      return false;
    }

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return false;
    }

    return true;
  };

  // =======================================================
  // VALIDATE EMAIL
  // =======================================================

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(value).trim()
    );
  };

  // =======================================================
  // SAVE & CONTINUE
  // =======================================================

  const handleSaveAndContinue = async () => {
    if (saving) {
      return;
    }

    // -------------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------------

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const cleanedPhone = phone.replace(/\D/g, "");
    const formattedDob = formatDateForApi(dob);

    if (!trimmedName) {
      Alert.alert(
        "Required",
        "Please enter your full name."
      );
      return;
    }

    if (!trimmedEmail) {
      Alert.alert(
        "Required",
        "Please enter your email address."
      );
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    if (!cleanedPhone) {
      Alert.alert(
        "Required",
        "Please enter your phone number."
      );
      return;
    }

    if (cleanedPhone.length !== 10) {
      Alert.alert(
        "Invalid Phone",
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (!formattedDob) {
      Alert.alert(
        "Required",
        "Please enter your date of birth."
      );
      return;
    }

    if (!isValidDate(formattedDob)) {
      Alert.alert(
        "Invalid Date",
        "Please enter date of birth in DD-MM-YYYY format."
      );
      return;
    }

    if (!gender) {
      Alert.alert(
        "Required",
        "Please select your gender."
      );
      return;
    }

    if (!maritalStatus) {
      Alert.alert(
        "Required",
        "Please select your marital status."
      );
      return;
    }

    if (!onBehalf) {
      Alert.alert(
        "Required",
        "Please select who this profile is created for."
      );
      return;
    }

    // -------------------------------------------------------
    // SPLIT FULL NAME
    //
    // Example:
    // Vasanth Kumar
    //
    // first_name = Vasanth
    // last_name  = Kumar
    // -------------------------------------------------------

    const nameParts = trimmedName
      .split(/\s+/)
      .filter(Boolean);

    const firstName = nameParts[0] || "";

    const lastName =
      nameParts.length > 1
        ? nameParts.slice(1).join(" ")
        : "";

    // -------------------------------------------------------
    // GET TOKEN
    // -------------------------------------------------------

    const accessToken = await getAccessToken();

    if (!accessToken) {
      Alert.alert(
        "Login Required",
        "Your login session has expired. Please login again.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );

      return;
    }

    // -------------------------------------------------------
    // API BODY
    // -------------------------------------------------------

    const basicInfo = {
      first_name: firstName,
      last_name: lastName,
      email: trimmedEmail,
      phone: cleanedPhone,
      gender: Number(gender),
      on_behalf: Number(onBehalf),
      date_of_birth: formattedDob,
      marital_status: Number(maritalStatus),
      children: Number(children || 0),
    };

    console.log("=================================");
    console.log("UPDATE BASIC INFO");
    console.log("METHOD: POST");
    console.log(
      "BODY:",
      JSON.stringify(basicInfo, null, 2)
    );
    console.log("=================================");

    // -------------------------------------------------------
    // CALL API
    // -------------------------------------------------------

    try {
      setSaving(true);

      const response = await updateMemberBasicInfo(
        accessToken,
        basicInfo
      );

      console.log(
        "UPDATE BASIC INFO RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      // -----------------------------------------------------
      // SUCCESS CHECK
      // -----------------------------------------------------

      const success =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true ||
        response?.status === true;

      if (success) {
        Alert.alert(
          "Success",
          response?.message ||
            "Basic details updated successfully.",
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
        Alert.alert(
          "Update Failed",
          response?.message ||
            response?.error ||
            "Unable to update your basic details."
        );
      }
    } catch (error) {
      console.error(
        "UPDATE BASIC INFO ERROR:",
        error
      );

      let message =
        "Something went wrong. Please try again.";

      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert(
        "Error",
        message
      );
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={[
        "top",
        "left",
        "right",
        "bottom",
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryRed}
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={Colors.gradientLogo}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
            activeOpacity={0.75}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Basic Details
          </Text>

          <View style={styles.headerSpacer} />
        </LinearGradient>

        {/* HEADER WAVE */}

        <Svg
          width={SCREEN_WIDTH}
          height={24}
          viewBox={`0 0 ${SCREEN_WIDTH} 24`}
          style={styles.headerWave}
        >
          <Path
            d={`
              M0,4
              Q${SCREEN_WIDTH * 0.25},22
              ${SCREEN_WIDTH * 0.5},10
              Q${SCREEN_WIDTH * 0.75},-2
              ${SCREEN_WIDTH},14
            `}
            stroke={Colors.goldLight}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* =================================================
          KEYBOARD
      ================================================= */}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* =================================================
              TITLE
          ================================================= */}

          <Text style={styles.pageTitle}>
            Tell us about yourself
          </Text>

          <Text style={styles.pageSubtitle}>
            Please provide accurate information
            to help others know you better.
          </Text>

          {/* =================================================
              FULL NAME
          ================================================= */}

          <FieldLabel
            text="Full Name"
            required
          />

          <InputField
            icon="person-outline"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* =================================================
              EMAIL
          ================================================= */}

          <FieldLabel
            text="Email"
            required
          />

          <InputField
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* =================================================
              PHONE
          ================================================= */}

          <FieldLabel
            text="Phone Number"
            required
          />

          <InputField
            icon="call-outline"
            value={phone}
            onChangeText={(value) => {
              const cleaned = value
                .replace(/\D/g, "")
                .slice(0, 10);

              setPhone(cleaned);
            }}
            placeholder="Enter 10-digit phone number"
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="next"
          />

          {/* =================================================
              DATE OF BIRTH
          ================================================= */}

          <FieldLabel
            text="Date of Birth"
            required
          />

          <InputField
            icon="calendar-outline"
            value={dob}
            onChangeText={(value) => {
              const cleaned = value
                .replace(/[^0-9-]/g, "")
                .slice(0, 10);

              setDob(cleaned);
            }}
            placeholder="DD-MM-YYYY"
            keyboardType="numeric"
            maxLength={10}
          />

          {/* =================================================
              GENDER
          ================================================= */}

          <FieldLabel
            text="Gender"
            required
          />

          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((option) => {
              const active =
                gender === option.key;

              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.genderTile,
                    active && {
                      borderColor:
                        option.activeColor,
                      backgroundColor:
                        "#FDF1EF",
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() =>
                    setGender(option.key)
                  }
                >
                  <Ionicons
                    name={option.icon}
                    size={18}
                    color={option.activeColor}
                    style={{
                      marginRight: 6,
                    }}
                  />

                  <Text
                    style={[
                      styles.genderText,
                      active && {
                        color:
                          option.activeColor,
                        fontFamily:
                          Fonts.body.bold,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* =================================================
              MARITAL STATUS
          ================================================= */}

          <FieldLabel
            text="Marital Status"
            required
          />

          <SelectField
            icon="heart-outline"
            placeholder="Select marital status"
            value={
              MARITAL_OPTIONS.find(
                (item) =>
                  item.key === maritalStatus
              )?.label || ""
            }
            onPress={() =>
              openDropdown(
                "maritalStatus",
                "Marital Status",
                MARITAL_OPTIONS,
                maritalStatus,
                setMaritalStatus
              )
            }
          />

          {/* =================================================
              PROFILE CREATED FOR
          ================================================= */}

          <FieldLabel
            text="Profile Created For"
            required
          />

          <SelectField
            icon="people-outline"
            placeholder="Select"
            value={
              ON_BEHALF_OPTIONS.find(
                (item) =>
                  item.key === onBehalf
              )?.label || ""
            }
            onPress={() =>
              openDropdown(
                "onBehalf",
                "Profile Created For",
                ON_BEHALF_OPTIONS,
                onBehalf,
                setOnBehalf
              )
            }
          />

          {/* =================================================
              CHILDREN
          ================================================= */}

          <FieldLabel
            text="Children"
            optional
          />

          <SelectField
            icon="happy-outline"
            placeholder="Select children"
            value={
              CHILDREN_OPTIONS.find(
                (item) =>
                  item.key === children
              )?.label || ""
            }
            onPress={() =>
              openDropdown(
                "children",
                "Children",
                CHILDREN_OPTIONS,
                children,
                setChildren
              )
            }
          />

          {/* =================================================
              HEIGHT / WEIGHT
          ================================================= */}

          <View style={styles.rowTwoCol}>
            <View style={styles.colHalf}>
              <FieldLabel
                text="Height"
                required
              />

              <SelectField
                icon="resize-outline"
                placeholder="Select height"
                value={height}
                onPress={() =>
                  openDropdown(
                    "height",
                    "Height",
                    HEIGHT_OPTIONS.map(
                      (item) => ({
                        key: item,
                        label: item,
                      })
                    ),
                    height,
                    setHeight
                  )
                }
              />
            </View>

            <View style={styles.colHalf}>
              <FieldLabel
                text="Weight"
                optional
              />

              <View style={styles.inputRow}>
                <Ionicons
                  name="barbell-outline"
                  size={18}
                  color={Colors.primaryRed}
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.textInput}
                  value={weight}
                  onChangeText={(value) =>
                    setWeight(
                      value
                        .replace(/\D/g, "")
                        .slice(0, 3)
                    )
                  }
                  placeholder="Weight"
                  placeholderTextColor={
                    Colors.placeholder
                  }
                  keyboardType="numeric"
                  maxLength={3}
                />

                <Text style={styles.unitText}>
                  kg
                </Text>
              </View>
            </View>
          </View>

          {/* =================================================
              BLOOD GROUP
          ================================================= */}

          <FieldLabel
            text="Blood Group"
            optional
          />

          <SelectField
            icon="water-outline"
            placeholder="Select blood group"
            value={bloodGroup}
            onPress={() =>
              openDropdown(
                "bloodGroup",
                "Blood Group",
                BLOOD_GROUP_OPTIONS.map(
                  (item) => ({
                    key: item,
                    label: item,
                  })
                ),
                bloodGroup,
                setBloodGroup
              )
            }
          />

          {/* =================================================
              MOTHER TONGUE
          ================================================= */}

          <FieldLabel
            text="Mother Tongue"
            required
          />

          <SelectField
            icon="chatbubble-outline"
            placeholder="Select mother tongue"
            value={motherTongue}
            onPress={() =>
              openDropdown(
                "motherTongue",
                "Mother Tongue",
                MOTHER_TONGUE_OPTIONS.map(
                  (item) => ({
                    key: item,
                    label: item,
                  })
                ),
                motherTongue,
                setMotherTongue
              )
            }
          />

          {/* =================================================
              LANGUAGES
          ================================================= */}

          <FieldLabel
            text="Languages Known"
            optional
          />

          <SelectField
            icon="language-outline"
            placeholder="Select language"
            value={languages}
            onPress={() =>
              openDropdown(
                "languages",
                "Languages Known",
                LANGUAGE_OPTIONS.map(
                  (item) => ({
                    key: item,
                    label: item,
                  })
                ),
                languages,
                setLanguages
              )
            }
          />

          {/* =================================================
              NATIONALITY
          ================================================= */}

          <FieldLabel
            text="Nationality"
            required
          />

          <SelectField
            icon="flag-outline"
            placeholder="Select nationality"
            value={nationality}
            onPress={() =>
              openDropdown(
                "nationality",
                "Nationality",
                NATIONALITY_OPTIONS.map(
                  (item) => ({
                    key: item,
                    label: item,
                  })
                ),
                nationality,
                setNationality
              )
            }
          />

          {/* =================================================
              CITY
          ================================================= */}

          <FieldLabel
            text="Currently Living In"
            required
          />

          <InputField
            icon="location-outline"
            value={city}
            onChangeText={setCity}
            placeholder="Enter your city"
            autoCapitalize="words"
          />

          {/* =================================================
              SECURITY INFO
          ================================================= */}

          <View style={styles.apiInfoBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#4D8D62"
            />

            <Text style={styles.apiInfoText}>
              Your information is securely
              saved to your profile.
            </Text>
          </View>

          {/* =================================================
              SAVE BUTTON
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && {
                opacity: 0.6,
              },
            ]}
            activeOpacity={0.8}
            disabled={saving}
            onPress={handleSaveAndContinue}
          >
            {saving ? (
              <View style={styles.saveButtonContent}>
                <ActivityIndicator
                  size="small"
                  color={Colors.white}
                />

                <Text
                  style={[
                    styles.saveButtonText,
                    {
                      marginLeft: 8,
                    },
                  ]}
                >
                  Saving...
                </Text>
              </View>
            ) : (
              <View style={styles.saveButtonContent}>
                <Text
                  style={styles.saveButtonText}
                >
                  Save & Continue
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={Colors.white}
                  style={{
                    marginLeft: 6,
                  }}
                />
              </View>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =====================================================
          DROPDOWN MODAL
      ===================================================== */}

      <Modal
        visible={!!dropdown}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setDropdown(null)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {dropdown?.title}
              </Text>

              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                activeOpacity={0.7}
                onPress={() =>
                  setDropdown(null)
                }
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#555555"
                />
              </TouchableOpacity>
            </View>

            {/* OPTIONS */}

            <ScrollView
              style={styles.dropdownScroll}
              showsVerticalScrollIndicator={
                false
              }
            >
              {dropdown?.options?.map(
                (item) => {
                  const itemKey =
                    typeof item === "string"
                      ? item
                      : item.key;

                  const itemLabel =
                    typeof item === "string"
                      ? item
                      : item.label;

                  const selected =
                    dropdown?.value ===
                    itemKey;

                  return (
                    <TouchableOpacity
                      key={String(itemKey)}
                      style={[
                        styles.dropdownItem,
                        selected &&
                          styles.dropdownItemSelected,
                      ]}
                      activeOpacity={0.75}
                      onPress={() =>
                        selectDropdownValue(
                          itemKey
                        )
                      }
                    >
                      <View
                        style={
                          styles.dropdownItemLeft
                        }
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selected &&
                              styles.dropdownItemTextSelected,
                          ]}
                        >
                          {itemLabel}
                        </Text>
                      </View>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={21}
                          color={
                            Colors.primaryRed
                          }
                        />
                      ) : (
                        <Ionicons
                          name="ellipse-outline"
                          size={19}
                          color="#D5D5D5"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// =========================================================
// FIELD LABEL
// =========================================================

function FieldLabel({
  text,
  required = false,
  optional = false,
}) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabelText}>
        {text}
      </Text>

      {required && (
        <Text style={styles.requiredAsterisk}>
          {" "}*
        </Text>
      )}

      {optional && (
        <Text style={styles.optionalText}>
          {" "}(Optional)
        </Text>
      )}
    </View>
  );
}

// =========================================================
// INPUT FIELD
// =========================================================

function InputField({
  icon,
  value,
  onChangeText,
  placeholder,
  ...props
}) {
  return (
    <View style={styles.inputRow}>
      <Ionicons
        name={icon}
        size={19}
        color={Colors.primaryRed}
        style={styles.inputIcon}
      />

      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={
          Colors.placeholder
        }
        {...props}
      />
    </View>
  );
}

// =========================================================
// SELECT FIELD
// =========================================================

function SelectField({
  icon,
  placeholder,
  value,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.selectRow}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={19}
        color={Colors.primaryRed}
        style={styles.inputIcon}
      />

      <Text
        style={[
          styles.selectText,
          value &&
            styles.selectTextFilled,
        ]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>

      <Ionicons
        name="chevron-down"
        size={17}
        color={Colors.textMuted}
      />
    </TouchableOpacity>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  // =======================================================
  // SAFE AREA
  // =======================================================

  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // =======================================================
  // HEADER
  // =======================================================

  headerWrapper: {
    width: "100%",
    backgroundColor: Colors.primaryRed,
  },

  header: {
    height: 88,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize:
      FontSizes.welcome + 2,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
  },

  headerSpacer: {
    width: 36,
  },

  headerWave: {
    marginTop: -6,
  },

  // =======================================================
  // SCROLL
  // =======================================================

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 40,
  },

  // =======================================================
  // PAGE TITLE
  // =======================================================

  pageTitle: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginBottom: 6,
  },

  pageSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 23,
    lineHeight: 19,
  },

  // =======================================================
  // LABEL
  // =======================================================

  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  fieldLabelText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  requiredAsterisk: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  optionalText: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  // =======================================================
  // INPUT
  // =======================================================

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 19,
    backgroundColor:
      Colors.cardBackground,
  },

  inputIcon: {
    marginRight: 10,
  },

  textInput: {
    flex: 1,
    height: 50,
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,

    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    }),
  },

  unitText: {
    fontSize: 13,
    fontFamily: Fonts.body.medium,
    color: Colors.textMuted,
  },

  // =======================================================
  // SELECT
  // =======================================================

  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 19,
    backgroundColor:
      Colors.cardBackground,
  },

  selectText: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.placeholder,
  },

  selectTextFilled: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body.medium,
  },

  // =======================================================
  // TWO COLUMNS
  // =======================================================

  rowTwoCol: {
    flexDirection: "row",
    gap: 12,
  },

  colHalf: {
    flex: 1,
  },

  // =======================================================
  // GENDER
  // =======================================================

  genderRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 19,
  },

  genderTile: {
    flex: 1,
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 5,
    backgroundColor:
      Colors.cardBackground,
  },

  genderText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textSecondary,
  },

  // =======================================================
  // SECURITY INFO
  // =======================================================

  apiInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF8F1",
    borderWidth: 1,
    borderColor: "#D3EBD9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 2,
    marginBottom: 16,
  },

  apiInfoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    lineHeight: 17,
    fontFamily: Fonts.body.regular,
    color: "#4D6B56",
  },

  // =======================================================
  // SAVE BUTTON
  // =======================================================

  saveButton: {
    height: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      Colors.primaryRedDark,
    borderRadius: 15,
    marginTop: 2,
  },

  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  // =======================================================
  // MODAL
  // =======================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.48)",
    justifyContent: "flex-end",
  },

  dropdownModal: {
    width: "100%",
    maxHeight: "72%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  modalHeader: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  modalTitle: {
    fontSize: 17,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
  },

  dropdownScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  // =======================================================
  // DROPDOWN ITEM
  // =======================================================

  dropdownItem: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    borderRadius: 10,
    marginVertical: 2,
  },

  dropdownItemSelected: {
    backgroundColor: "#FFF0F2",
  },

  dropdownItemLeft: {
    flex: 1,
  },

  dropdownItemText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
  },

  dropdownItemTextSelected: {
    color: Colors.primaryRed,
    fontFamily: Fonts.body.bold,
  },
});
