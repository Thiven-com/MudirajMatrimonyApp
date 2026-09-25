import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  BackHandler,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";

import Fonts from "../constants/Fonts";
import { updateMemberSpiritualBackground } from "../utils/Functions";

// ===
// NAMED FIELD COMPONENT
// ===

const NamedField = ({
  label,
  value,
  onChangeText,
  idValue,
  onChangeId,
  placeholder,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.fieldRow}>
        {/* NAME INPUT */}

        <View style={[styles.inputWrapper, styles.nameInputWrapper]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A6A29C"
            autoCorrect={false}
            autoCapitalize="words"
            multiline={false}
            numberOfLines={1}
            ellipsizeMode="tail"
            returnKeyType="next"
            style={styles.input}
          />
        </View>

        {/* ID INPUT */}

        <View style={[styles.inputWrapper, styles.idInputWrapper]}>
          <TextInput
            value={idValue}
            onChangeText={(text) => onChangeId(text.replace(/\D/g, ""))}
            placeholder="ID"
            placeholderTextColor="#A6A29C"
            keyboardType="number-pad"
            multiline={false}
            numberOfLines={1}
            maxLength={10}
            style={[styles.input, styles.idInputText]}
          />
        </View>
      </View>
    </View>
  );
};

// ===
// PLAIN FIELD COMPONENT
// ===

const PlainField = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}) => {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[styles.inputWrapper, multiline && styles.multilineInputWrapper]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A6A29C"
          autoCorrect={false}
          autoCapitalize="sentences"
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          scrollEnabled={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          style={[styles.input, multiline && styles.multilineInput]}
        />
      </View>
    </View>
  );
};

// ===
// SECTION HEADING COMPONENT
// ===

const SectionHeading = ({ title }) => {
  return (
    <View style={styles.sectionHeadingRow}>
      <Text style={styles.sectionHeadingText}>{title}</Text>
      <View style={styles.sectionDivider} />
    </View>
  );
};

// ===
// MAIN COMPONENT
// ===

const EditSocialBackground = () => {
  const navigation = useNavigation();

  // ===
  // BACK
  // ===

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  // ===
  // FIELD VALUES
  // ===

  const [religion, setReligion] = useState("");
  const [religionId, setReligionId] = useState("");

  const [caste, setCaste] = useState("");
  const [casteId, setCasteId] = useState("");

  const [subCaste, setSubCaste] = useState("");
  const [subCasteId, setSubCasteId] = useState("");

  const [ethnicity, setEthnicity] = useState("");
  const [personalValues, setPersonalValues] = useState("");

  const [familyValue, setFamilyValue] = useState("");
  const [familyValueId, setFamilyValueId] = useState("");

  const [communityValue, setCommunityValue] = useState("");

  const [saving, setSaving] = useState(false);

  // ===
  // ANDROID HARDWARE BACK
  // Same pattern as EditLanguages: intercept the hardware back
  // button and route it through handleBack(), ignored while saving.
  // ===

  useEffect(() => {
    const handleHardwareBack = () => {
      if (saving) {
        return true;
      }

      handleBack();

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBack,
    );

    return () => {
      subscription.remove();
    };
  }, [handleBack, saving]);

  // ===
  // VALIDATE NUMERIC ID
  // ===

  const parsePositiveId = (value) => {
    const raw = String(value ?? "").trim();

    if (!/^\d+$/.test(raw)) {
      return null;
    }

    const numeric = Number(raw);

    if (!Number.isInteger(numeric) || numeric <= 0) {
      return null;
    }

    return numeric;
  };

  // ===
  // SAVE DATA
  // ===

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const accessToken =
        (await AsyncStorage.getItem("authToken")) ||
        (await AsyncStorage.getItem("token")) ||
        (await AsyncStorage.getItem("access_token"));

      if (!accessToken) {
        Alert.alert(
          "Login Required",
          "Access token is missing. Please login again.",
        );
        return;
      }

      const religion_id = parsePositiveId(religionId);
      const caste_id = parsePositiveId(casteId);
      const sub_caste_id = parsePositiveId(subCasteId);
      const family_value_id = parsePositiveId(familyValueId);

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
          "Enter a valid numeric Family Value ID.",
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

      console.log(
        "SOCIAL BACKGROUND PAYLOAD:",
        JSON.stringify(payload, null, 2),
      );

      console.log("ACCESS TOKEN EXISTS:", Boolean(accessToken));
      console.log("UPDATE FUNCTION PAYLOAD:", JSON.stringify(payload, null, 2));

      const response = await updateMemberSpiritualBackground(
        accessToken,
        payload,
      );

      console.log(
        "SOCIAL BACKGROUND RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      const isSuccess =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true ||
        response?.result === 1 ||
        response?.status === true ||
        response?.status === 1 ||
        response?.statusCode === 200 ||
        response?.statusCode === 201;

      if (!isSuccess) {
        Alert.alert(
          "Update Failed",
          response?.message ||
            response?.error ||
            "Social and Spiritual Background was not updated.",
        );
        return;
      }

      Alert.alert(
        "Success",
        "Social and Spiritual Background updated successfully.",
        [
          {
            text: "OK",
            onPress: handleBack,
          },
        ],
      );
    } catch (error) {
      console.error("UPDATE SOCIAL BACKGROUND ERROR:", error);

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

  // ===
  // RENDER
  // ===

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Feather name="chevron-left" size={22} color="#1F2933" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            Edit Social Background
          </Text>
        </View>

        {/* CARD */}

        <View style={styles.card}>
          <Text style={styles.helperText}>
            Enter your social and spiritual background details. Numeric
            reference IDs are required for selected fields.
          </Text>

          {/* FAITH AND HERITAGE */}

          <SectionHeading title="Faith & Heritage" />

          <NamedField
            label="Religion"
            value={religion}
            onChangeText={setReligion}
            idValue={religionId}
            onChangeId={setReligionId}
            placeholder="e.g. Hindu"
          />

          <NamedField
            label="Caste"
            value={caste}
            onChangeText={setCaste}
            idValue={casteId}
            onChangeId={setCasteId}
            placeholder="e.g. Mudhiraj"
          />

          <NamedField
            label="Sub Caste"
            value={subCaste}
            onChangeText={setSubCaste}
            idValue={subCasteId}
            onChangeId={setSubCasteId}
            placeholder="Enter sub caste"
          />

          <PlainField
            label="Ethnicity"
            value={ethnicity}
            onChangeText={setEthnicity}
            placeholder="Enter ethnicity"
          />

          {/* VALUES */}

          <SectionHeading title="Values" />

          <PlainField
            label="Personal Value"
            value={personalValues}
            onChangeText={setPersonalValues}
            placeholder="Enter personal value"
            multiline={true}
          />

          <NamedField
            label="Family Value"
            value={familyValue}
            onChangeText={setFamilyValue}
            idValue={familyValueId}
            onChangeId={setFamilyValueId}
            placeholder="e.g. Joint Family"
          />

          <PlainField
            label="Community Value"
            value={communityValue}
            onChangeText={setCommunityValue}
            placeholder="Enter community value"
            multiline={true}
          />

          {/* SAVE BUTTON */}

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.88}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Details"}
            </Text>
          </TouchableOpacity>

          {/* CANCEL BUTTON */}

          <TouchableOpacity
            style={styles.cancelButton}
            activeOpacity={0.7}
            onPress={handleBack}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ===
// STYLES
// ===

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F4",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // HEADER

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "flex-start",
    marginRight: 6,
  },

  headerTitle: {
    flex: 1,
    color: "#1F2933",
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
  },

  // CARD

  card: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAE8E5",
    padding: 20,
    minWidth: 0,
    overflow: "hidden",
  },

  helperText: {
    color: "#6B7280",
    fontSize: Fonts.size.sm,
    lineHeight: 18,
    fontFamily: Fonts.regular,
    marginBottom: 22,
  },

  // SECTION HEADING

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
  },

  sectionHeadingText: {
    color: "#A91F2B",
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
    marginRight: 12,
  },

  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#D6A329",
  },

  // FIELDS

  fieldGroup: {
    width: "100%",
    minWidth: 0,
    marginBottom: 16,
  },

  fieldLabel: {
    color: "#1F2933",
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.semiBold,
    marginBottom: 7,
  },

  fieldRow: {
    flexDirection: "row",
    width: "100%",
    minWidth: 0,
    alignItems: "center",
  },

  // INPUT WRAPPER

  inputWrapper: {
    height: 44,
    minWidth: 0,
    maxWidth: "100%",
    borderWidth: 1,
    borderColor: "#DCDAD6",
    borderRadius: 8,
    backgroundColor: "#FCFCFB",
    justifyContent: "center",
    overflow: "hidden",
  },

  nameInputWrapper: {
    flex: 2,
    minWidth: 0,
    flexShrink: 1,
    marginRight: 8,
  },

  idInputWrapper: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },

  multilineInputWrapper: {
    height: 90,
    minHeight: 90,
    justifyContent: "flex-start",
  },

  // INPUT

  input: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    height: 44,
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: "#1F2933",
    fontSize: Fonts.size.md,
    fontFamily: Fonts.medium,
    includeFontPadding: false,
  },

  multilineInput: {
    flex: 1,
    height: 90,
    minHeight: 90,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },

  idInputText: {
    textAlign: "center",
    paddingHorizontal: 4,
  },

  // SAVE BUTTON

  saveButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: "#D92332",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 16,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,
  },

  // CANCEL BUTTON

  cancelButton: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D6A329",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelButtonText: {
    color: "#A87908",
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,
  },
});

export default EditSocialBackground;
