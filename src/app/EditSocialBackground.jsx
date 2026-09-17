import { useEffect, useState } from "react";

import {
  Alert,
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
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getMemberSpiritualBackground,
  updateMemberSpiritualBackground,
} from "../utils/Functions";

// =========================================================
// EDIT SOCIAL / SPIRITUAL BACKGROUND
// =========================================================

const EditSocialBackground = () => {
  const router = useRouter();

  // =========================================================
  // DISPLAY VALUES
  // =========================================================

  const [religion, setReligion] = useState("");

  const [caste, setCaste] = useState("");

  const [subCaste, setSubCaste] = useState("");

  const [ethnicity, setEthnicity] = useState("");

  const [personalValues, setPersonalValues] = useState("");

  const [familyValue, setFamilyValue] = useState("");

  const [communityValue, setCommunityValue] = useState("");

  // =========================================================
  // IDS
  // =========================================================

  const [religionId, setReligionId] = useState("");

  const [casteId, setCasteId] = useState("");

  const [subCasteId, setSubCasteId] = useState("");

  const [familyValueId, setFamilyValueId] = useState("");

  // =========================================================
  // SAVE STATE
  // =========================================================

  const [saving, setSaving] = useState(false);

  // Last API response shown directly on the screen.
  const [apiResponse, setApiResponse] = useState(null);

  // =========================================================
  // GET VALUE
  // =========================================================

  const getValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "object") {
      return String(value?.name ?? value?.title ?? value?.value ?? "");
    }

    return String(value);
  };

  // =========================================================
  // GET ID
  // =========================================================

  const getObjectId = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "object") {
      return (
        value?.id ??
        value?.religion_id ??
        value?.caste_id ??
        value?.sub_caste_id ??
        value?.family_value_id ??
        ""
      );
    }

    return value;
  };

  // ---------------------------------------------------------
  // STRICT ID HELPERS
  // ---------------------------------------------------------

  // Return a valid positive integer ID or an empty string.
  // IMPORTANT: "Joint Family", "Hindu", etc. are names, NOT IDs.
  const getNumericId = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    if (typeof value === "object") {
      return getNumericId(
        value?.id ??
          value?.value ??
          value?.religion_id ??
          value?.caste_id ??
          value?.sub_caste_id ??
          value?.family_value_id,
      );
    }

    const raw = String(value).trim();

    if (!/^\d+$/.test(raw)) {
      return "";
    }

    const numeric = Number(raw);

    if (!Number.isInteger(numeric) || numeric <= 0) {
      return "";
    }

    return String(numeric);
  };

  const parsePositiveId = (value) => {
    const numericId = getNumericId(value);

    if (!numericId) {
      return null;
    }

    return Number(numericId);
  };

  // =========================================================
  // LOAD GET API
  // =========================================================

  const loadSpiritualBackground = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("======================================");

      console.log("LOAD SPIRITUAL BACKGROUND");

      console.log("TOKEN EXISTS:", !!accessToken);

      console.log("======================================");

      if (!accessToken) {
        Alert.alert(
          "Login Required",
          "Access token is missing. Please login again.",
        );

        return;
      }

      // ---------------------------------------------------
      // GET API
      // ---------------------------------------------------

      const response = await getMemberSpiritualBackground(accessToken);

      console.log("SPIRITUAL GET RESPONSE:", JSON.stringify(response, null, 2));

      setApiResponse(response ?? null);

      // ---------------------------------------------------
      // FIND DATA
      // ---------------------------------------------------

      // If the member has no saved spiritual background yet,
      // keep the form editable. Do not block the user.
      if (response?.result === false && !response?.data) {
        console.log("NO EXISTING SPIRITUAL DATA - FORM REMAINS EDITABLE");

        return;
      }

      let data = {};

      // The Functions.js helper returns the API JSON body directly.
      // Normal API shape:
      // { result: true, data: { ...spiritual fields... } }
      if (
        response?.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        data = response.data;
      } else if (
        response?.result?.data &&
        typeof response.result.data === "object" &&
        !Array.isArray(response.result.data)
      ) {
        data = response.result.data;
      } else if (
        response?.data?.data &&
        typeof response.data.data === "object" &&
        !Array.isArray(response.data.data)
      ) {
        data = response.data.data;
      } else if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
        data = response;
      }

      console.log("NORMALIZED SPIRITUAL DATA:", JSON.stringify(data, null, 2));

      console.log("SPIRITUAL DATA:", JSON.stringify(data, null, 2));

      // ===================================================
      // RELIGION
      // ===================================================

      const religionObject =
        data?.religion && typeof data.religion === "object"
          ? data.religion
          : null;

      const receivedReligionId = getNumericId(
        data?.religion_id ?? data?.religionId ?? getObjectId(religionObject),
      );

      const receivedReligionName =
        data?.religion?.name ??
        data?.religion_name ??
        (typeof data?.religion === "string" ? data.religion : "");

      setReligionId(receivedReligionId);

      setReligion(getValue(receivedReligionName));

      // ===================================================
      // CASTE
      // ===================================================

      const casteObject =
        data?.caste && typeof data.caste === "object" ? data.caste : null;

      const receivedCasteId = getNumericId(
        data?.caste_id ?? data?.casteId ?? getObjectId(casteObject),
      );

      const receivedCasteName =
        data?.caste?.name ??
        data?.caste_name ??
        (typeof data?.caste === "string" ? data.caste : "");

      setCasteId(receivedCasteId);

      setCaste(getValue(receivedCasteName));

      // ===================================================
      // SUB CASTE
      // ===================================================

      const subCasteObject =
        data?.sub_caste && typeof data.sub_caste === "object"
          ? data.sub_caste
          : null;

      const receivedSubCasteId = getNumericId(
        data?.sub_caste_id ?? data?.subCasteId ?? getObjectId(subCasteObject),
      );

      const receivedSubCasteName =
        data?.sub_caste?.name ??
        data?.sub_caste_name ??
        data?.subCaste ??
        (typeof data?.sub_caste === "string" ? data.sub_caste : "") ??
        "";

      setSubCasteId(receivedSubCasteId);

      setSubCaste(getValue(receivedSubCasteName));

      // ===================================================
      // ETHNICITY
      // ===================================================

      const receivedEthnicity =
        data?.ethnicity ?? data?.ethnicity_name ?? data?.ethnicity?.name ?? "";

      setEthnicity(getValue(receivedEthnicity));

      // ===================================================
      // PERSONAL VALUE
      // ===================================================

      const receivedPersonalValue =
        data?.personal_value ??
        data?.personal_values ??
        data?.personalValues ??
        "";

      setPersonalValues(getValue(receivedPersonalValue));

      // ===================================================
      // FAMILY VALUE
      // ===================================================

      const familyValueObject =
        data?.family_value && typeof data.family_value === "object"
          ? data.family_value
          : null;

      // IMPORTANT:
      // If the backend returns:
      //   family_value_id: "Joint Family"
      // that is NOT an ID. Keep the name in familyValue and
      // leave familyValueId empty until a real numeric ID exists.
      const rawFamilyValueId =
        data?.family_value_id ??
        data?.familyValueId ??
        getObjectId(familyValueObject) ??
        "";

      const receivedFamilyValueId = getNumericId(rawFamilyValueId);

      const receivedFamilyValueName =
        data?.family_value?.name ??
        data?.family_value_name ??
        data?.family_values ??
        data?.familyValue ??
        (typeof data?.family_value === "string"
          ? data.family_value
          : typeof rawFamilyValueId === "string" &&
              !/^\d+$/.test(rawFamilyValueId.trim())
            ? rawFamilyValueId
            : "");

      setFamilyValueId(receivedFamilyValueId);

      setFamilyValue(getValue(receivedFamilyValueName));

      // ===================================================
      // COMMUNITY VALUE
      // ===================================================

      const receivedCommunityValue =
        data?.community_value ??
        data?.community_values ??
        data?.communityValue ??
        "";

      setCommunityValue(getValue(receivedCommunityValue));

      // ===================================================
      // DEBUG IDS
      // ===================================================

      console.log("======================================");

      console.log("IDS FROM GET RESPONSE");

      console.log("RELIGION ID:", receivedReligionId);

      console.log("CASTE ID:", receivedCasteId);

      console.log("SUB CASTE ID:", receivedSubCasteId);

      console.log("FAMILY VALUE ID:", receivedFamilyValueId);

      console.log(
        "NORMALIZED IDS:",
        JSON.stringify(
          {
            religion_id: receivedReligionId,
            caste_id: receivedCasteId,
            sub_caste_id: receivedSubCasteId,
            family_value_id: receivedFamilyValueId,
          },
          null,
          2,
        ),
      );

      console.log("======================================");
    } catch (error) {
      console.error("GET SPIRITUAL BACKGROUND ERROR:", error);

      Alert.alert(
        "Error",
        error?.message || "Unable to load spiritual background.",
      );
    }
  };

  // =========================================================
  // LOAD SCREEN
  // =========================================================

  useEffect(() => {
    loadSpiritualBackground();
  }, []);

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      const accessToken = await AsyncStorage.getItem("authToken");

      console.log("======================================");
      console.log("SPIRITUAL BACKGROUND UPDATE");
      console.log("TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        Alert.alert(
          "Login Required",
          "Access token is missing. Please login again.",
        );
        return;
      }

      // IMPORTANT:
      // IDs come from the GET response. They are never generated
      // from the text entered by the user.
      const religion_id = parsePositiveId(religionId);
      const caste_id = parsePositiveId(casteId);
      const sub_caste_id = parsePositiveId(subCasteId);
      const family_value_id = parsePositiveId(familyValueId);

      console.log("IDS BEFORE UPDATE:", {
        religion_id,
        caste_id,
        sub_caste_id,
        family_value_id,
      });

      if (!religion_id) {
        Alert.alert(
          "Religion ID Required",
          "Enter a valid numeric Religion ID.",
        );
        return;
      }

      if (!caste_id) {
        Alert.alert("Caste ID Required", "Enter a valid numeric Caste ID.");
        return;
      }

      if (!sub_caste_id) {
        Alert.alert(
          "Sub Caste ID Required",
          "Enter a valid numeric Sub Caste ID.",
        );
        return;
      }

      if (!family_value_id) {
        Alert.alert(
          "Family Value ID Required",
          "Enter a valid numeric Family Value ID. Do not enter the family value name here.",
        );
        return;
      }

      const payload = {
        religion_id,
        caste_id,
        sub_caste_id,
        ethnicity: String(ethnicity ?? "").trim(),
        personal_value: String(personalValues ?? "").trim(),
        family_value_id,
        community_value: String(communityValue ?? "").trim(),
      };

      console.log("POST ENDPOINT:");
      console.log("/api/member/spiritual-background/update");

      console.log("POST PAYLOAD:", JSON.stringify(payload, null, 2));

      const response = await updateMemberSpiritualBackground(
        accessToken,
        payload,
      );

      console.log("UPDATE API RESPONSE:", JSON.stringify(response, null, 2));

      setApiResponse(response ?? null);

      const isSuccess =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true ||
        response?.statusCode === 200 ||
        response?.statusCode === 201;

      if (!isSuccess) {
        Alert.alert(
          "Update Failed",
          response?.message ||
            response?.error ||
            "Spiritual & Social Background was not updated.",
        );
        return;
      }

      // Keep the exact IDs that were sent.
      setReligionId(String(religion_id));
      setCasteId(String(caste_id));
      setSubCasteId(String(sub_caste_id));
      setFamilyValueId(String(family_value_id));

      // Keep the edited text locally as well.
      setReligion(String(religion ?? "").trim());
      setCaste(String(caste ?? "").trim());
      setSubCaste(String(subCaste ?? "").trim());
      setEthnicity(String(ethnicity ?? "").trim());
      setPersonalValues(String(personalValues ?? "").trim());
      setFamilyValue(String(familyValue ?? "").trim());
      setCommunityValue(String(communityValue ?? "").trim());

      console.log("UPDATE SUCCESS");
      console.log("FINAL IDS:", {
        religion_id,
        caste_id,
        sub_caste_id,
        family_value_id,
      });

      // Show the successful API response on this screen, then
      // return automatically to the details screen.
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (error) {
      console.error("UPDATE SPIRITUAL BACKGROUND ERROR:", error);

      console.error(
        "UPDATE ERROR RESPONSE:",
        JSON.stringify(error?.response?.data ?? error, null, 2),
      );

      Alert.alert(
        "Update Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while updating.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // NORMAL INPUT
  // =========================================================

  const InputField = ({
    label,
    value,
    onChangeText,
    icon,
    iconColor,
    placeholder,
  }) => {
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: iconColor + "18",
              },
            ]}
          >
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>

          <Text style={styles.fieldLabel}>{label}</Text>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#AAAAAA"
            style={styles.input}
            autoCapitalize="words"
          />
        </View>
      </View>
    );
  };

  // =========================================================
  // ID DISPLAY
  // =========================================================

  const IdField = ({ label, value, onChangeText }) => {
    return (
      <View style={styles.idContainer}>
        <Text style={styles.idLabel}>{label}</Text>

        <View style={styles.idBox}>
          <Ionicons name="key-outline" size={15} color="#999999" />

          <TextInput
            value={String(value ?? "")}
            onChangeText={(valueText) => {
              // IDs must contain digits only.
              const cleanId = String(valueText ?? "").replace(/\D/g, "");

              onChangeText(cleanId);
            }}
            keyboardType="number-pad"
            placeholder="Enter ID"
            placeholderTextColor="#AAAAAA"
            style={styles.idInput}
            maxLength={10}
          />
        </View>
      </View>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={25} color="#D92332" />
            </TouchableOpacity>

            <Text style={styles.headerTitle} numberOfLines={1}>
              Edit Social Background
            </Text>

            <View style={styles.headerRight} />
          </View>

          {/* FORM */}

          <View style={styles.form}>
            {/* =================================================
                RELIGION
            ================================================= */}

            <InputField
              label="Religion"
              value={religion}
              onChangeText={setReligion}
              icon="flower-outline"
              iconColor="#E83E75"
              placeholder="Religion"
            />

            <IdField
              label="Religion ID"
              value={religionId}
              onChangeText={setReligionId}
            />

            {/* =================================================
                CASTE
            ================================================= */}

            <InputField
              label="Caste"
              value={caste}
              onChangeText={setCaste}
              icon="people-outline"
              iconColor="#F4B83F"
              placeholder="Caste"
            />

            <IdField
              label="Caste ID"
              value={casteId}
              onChangeText={setCasteId}
            />

            {/* =================================================
                SUB CASTE
            ================================================= */}

            <InputField
              label="Sub Caste"
              value={subCaste}
              onChangeText={setSubCaste}
              icon="planet-outline"
              iconColor="#8D5BE8"
              placeholder="Sub caste"
            />

            <IdField
              label="Sub Caste ID"
              value={subCasteId}
              onChangeText={setSubCasteId}
            />

            {/* =================================================
                ETHNICITY
            ================================================= */}

            <InputField
              label="Ethnicity"
              value={ethnicity}
              onChangeText={setEthnicity}
              icon="globe-outline"
              iconColor="#4E9BE8"
              placeholder="Enter ethnicity"
            />

            {/* =================================================
                PERSONAL VALUE
            ================================================= */}

            <InputField
              label="Personal Value"
              value={personalValues}
              onChangeText={setPersonalValues}
              icon="star-outline"
              iconColor="#F0B63D"
              placeholder="Enter personal value"
            />

            {/* =================================================
                FAMILY VALUE
            ================================================= */}

            <InputField
              label="Family Value"
              value={familyValue}
              onChangeText={setFamilyValue}
              icon="home-outline"
              iconColor="#63B85A"
              placeholder="Family value"
            />

            <IdField
              label="Family Value ID"
              value={familyValueId}
              onChangeText={setFamilyValueId}
            />

            <Text style={styles.idHelpText}>
              IDs must be numeric. Example: 1, 2, 3
            </Text>

            {/* =================================================
                COMMUNITY VALUE
            ================================================= */}

            <InputField
              label="Community Value"
              value={communityValue}
              onChangeText={setCommunityValue}
              icon="people-circle-outline"
              iconColor="#E84887"
              placeholder="Enter community value"
            />

            {/* =================================================
                SAVE
            ================================================= */}

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={handleSave}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>Save Details</Text>
            </TouchableOpacity>

            {/* CANCEL */}

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 30,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingTop: 20,
    paddingBottom: 25,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // =======================================================
  // HEADER
  // =======================================================

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
  },

  headerRight: {
    width: 30,
  },

  // =======================================================
  // FORM
  // =======================================================

  form: {
    paddingHorizontal: 14,
    paddingTop: 20,
  },

  fieldContainer: {
    marginBottom: 8,
  },

  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  iconCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 9,
  },

  fieldLabel: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "600",
  },

  inputWrapper: {
    height: 45,

    borderWidth: 1,
    borderColor: "#E4E4E4",

    borderRadius: 7,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
  },

  input: {
    flex: 1,

    paddingHorizontal: 12,

    color: "#444444",

    fontSize: 13,

    fontWeight: "500",
  },

  // =======================================================
  // ID FIELD
  // =======================================================

  idContainer: {
    marginBottom: 14,
    marginLeft: 34,
  },

  idLabel: {
    color: "#999999",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 5,
  },

  idBox: {
    height: 34,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,

    borderWidth: 1,
    borderColor: "#EEEEEE",

    borderRadius: 6,

    backgroundColor: "#F8F8F8",
  },

  idText: {
    marginLeft: 7,
    color: "#777777",
    fontSize: 12,
    fontWeight: "600",
  },

  idInput: {
    flex: 1,
    marginLeft: 7,
    paddingVertical: 0,
    color: "#444444",
    fontSize: 12,
    fontWeight: "600",
    minHeight: 32,
  },

  idHelpText: {
    marginTop: 4,
    marginBottom: 4,
    color: "#888888",
    fontSize: 10,
    lineHeight: 14,
  },

  responseContainer: {
    marginTop: 12,
    marginBottom: 2,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 7,
    backgroundColor: "#FAFAFA",
  },

  responseTitle: {
    color: "#555555",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
  },

  responseText: {
    color: "#D92332",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 5,
  },

  responseJson: {
    color: "#666666",
    fontSize: 10,
    lineHeight: 15,
  },

  // =======================================================
  // SAVE
  // =======================================================

  saveButton: {
    height: 46,

    borderRadius: 7,

    backgroundColor: "#D92332",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 12,

    shadowColor: "#D92332",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,

    shadowRadius: 4,

    elevation: 2,
  },

  saveButtonText: {
    color: "#FFFFFF",

    fontSize: 14,

    fontWeight: "700",

    marginLeft: 7,
  },

  // =======================================================
  // CANCEL
  // =======================================================

  cancelButton: {
    height: 40,

    alignItems: "center",

    justifyContent: "center",

    marginTop: 5,
  },

  cancelButtonText: {
    color: "#777777",

    fontSize: 13,

    fontWeight: "600",
  },
});

export default EditSocialBackground;
