import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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

import * as ImagePicker from "expo-image-picker";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

// Namespace import so the file still loads if one of the optional
// "get profile" functions below does not exist in your Functions.js.
import * as Api from "../utils/Functions";

import BASE_URL from "../constants/AppUrls";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  red: "#E51D35",
  white: "#FFFFFF",
  black: "#222222",
  text: "#555555",
  gray: "#777777",
  placeholder: "#999999",
  border: "#E8E8E8",
  background: "#F5F5F5",
  lightRed: "#E79AA3",
};

/* =========================================================
   CONFIG
   Functions tried (in this order) to load the member's
   existing basic information. Called as fn(token).
   Put your real function name first if you have one.
========================================================= */

const PROFILE_FUNCTIONS = [
  "getMemberBasicInfo",
  "getMemberBasicInformation",
  "getBasicInfo",
  "getMemberProfile",
  "getMemberDetails",
  "getMyProfile",
  "getProfile",
];

/* =========================================================
   OPTIONS  (fixed dropdown choices - these are UI options,
   not user data)
========================================================= */

const MARITAL_PLACEHOLDER = "Nothing selected";

const CHILDREN_PLACEHOLDER = "Not specified";

const maritalOptions = [
  MARITAL_PLACEHOLDER,
  "Never Married",
  "Divorced",
  "Widowed",
  "Separated",
];

const childrenOptions = [
  CHILDREN_PLACEHOLDER,
  "No Children",
  "1 Child",
  "2 Children",
  "3 Children",
  "4+ Children",
];

/*
 * Label <-> API id maps.
 *
 * Assumption (unchanged from before):
 *   marital_status: 1 Never Married, 2 Divorced, 3 Widowed, 4 Separated
 *   gender:         1 Male, 2 Female, 3 Other
 *   children:       0 none ... 4 = "4+"
 */
const GENDER_MAP = { 1: "Male", 2: "Female", 3: "Other" };

const MARITAL_MAP = {
  1: "Never Married",
  2: "Divorced",
  3: "Widowed",
  4: "Separated",
};

const CHILDREN_MAP = {
  0: "No Children",
  1: "1 Child",
  2: "2 Children",
  3: "3 Children",
  4: "4+ Children",
};

const idFromLabel = (map, label) => {
  const entry = Object.entries(map).find(([, value]) => value === label);

  return entry ? Number(entry[0]) : null;
};

/* =========================================================
   HELPERS
========================================================= */

// Safe string for any API value (handles { id, name } objects).
const toText = (value) => {
  if (value == null) return "";

  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return toText(
      value.name ?? value.label ?? value.title ?? value.value ?? value.text,
    );
  }

  return String(value).trim();
};

const firstText = (source, keys) => {
  for (const key of keys) {
    const text = toText(source?.[key]);

    if (text) return text;
  }

  return "";
};

// 1 / "1" / "Male" / { id: 1, name: "Male" }  ->  "Male"
const resolveLabel = (value, map, fallback = "") => {
  if (value == null || value === "") return fallback;

  if (typeof value === "object" && value.id != null) {
    const byId = map[toText(value.id)];

    if (byId) return byId;
  }

  const text = toText(value);

  if (!text) return fallback;

  if (map[text] !== undefined) return map[text];

  const found = Object.values(map).find(
    (label) => label.toLowerCase() === text.toLowerCase(),
  );

  return found ?? fallback;
};

const toUri = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return toText(
      value.url ?? value.photo_url ?? value.photo ?? value.path ?? value.src,
    );
  }

  return "";
};

// Turns a picked { uri, name, type } into whatever FormData.append
// needs on this platform. React Native's fetch polyfill accepts the
// plain { uri, name, type } object directly on iOS/Android, but a
// real browser (Expo Web) requires an actual Blob/File — passing the
// object literal there throws before the request is ever sent.
const buildPhotoFilePart = async (photo) => {
  if (Platform.OS !== "web") {
    return { uri: photo.uri, name: photo.name, type: photo.type };
  }

  const response = await fetch(photo.uri);
  const blob = await response.blob();

  if (typeof File !== "undefined") {
    return new File([blob], photo.name, { type: photo.type || blob.type });
  }

  return blob;
};

/* =========================================================
   DATE FORMAT
   UI:  YYYY-MM-DD
   API: DD-MM-YYYY
========================================================= */

const formatDateForApi = (date) => {
  if (!date) {
    return "";
  }

  const value = String(date).trim();

  /* Already DD-MM-YYYY */
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    return value;
  }

  /* YYYY-MM-DD -> DD-MM-YYYY */
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");

    return `${day}-${month}-${year}`;
  }

  return value;
};

// API value (DD-MM-YYYY, YYYY-MM-DD or ISO) -> YYYY-MM-DD for the input
const formatDateForUi = (value) => {
  const text = toText(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  if (/^\d{2}-\d{2}-\d{4}/.test(text)) {
    const [day, month, year] = text.slice(0, 10).split("-");

    return `${year}-${month}-${day}`;
  }

  return text;
};

// Alert.alert / confirm dialogs do nothing on Expo Web.
const notify = (title, message, onOk) => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert(`${title}\n\n${message}`);
    }

    if (onOk) onOk();

    return;
  }

  Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
};

/* =========================================================
   TOKEN
========================================================= */

// Read token from all commonly used storage keys.
// Some projects store authToken as a plain string,
// while others store a JSON object.
const getAccessToken = async () => {
  const tokenKeys = [
    "authToken",
    "access_token",
    "accessToken",
    "token",
    "userToken",
    "auth_token",
  ];

  for (const key of tokenKeys) {
    const storedValue = await AsyncStorage.getItem(key);

    if (!storedValue) continue;

    let accessToken = null;

    try {
      const parsedValue = JSON.parse(storedValue);

      if (typeof parsedValue === "object" && parsedValue !== null) {
        accessToken =
          parsedValue.token ||
          parsedValue.access_token ||
          parsedValue.authToken ||
          parsedValue.accessToken ||
          parsedValue.userToken ||
          null;
      } else if (typeof parsedValue === "string") {
        accessToken = parsedValue;
      }
    } catch {
      accessToken = storedValue;
    }

    if (accessToken) return accessToken;
  }

  return null;
};

/* =========================================================
   PROFILE LOADING
========================================================= */

// Pull the member object out of many possible response shapes.
const extractProfile = (response) => {
  if (!response || typeof response !== "object") return null;

  let profile =
    response?.data?.basic_info ??
    response?.data?.basicInfo ??
    response?.data?.member ??
    response?.data?.user ??
    response?.data ??
    response?.member ??
    response?.user ??
    response;

  if (Array.isArray(profile)) profile = profile[0];

  if (!profile || typeof profile !== "object") return null;

  const looksLikeProfile = [
    "first_name",
    "last_name",
    "firstName",
    "lastName",
    "name",
    "email",
    "phone",
  ].some((key) => profile[key] != null);

  return looksLikeProfile ? profile : null;
};

// Last resort: the user object saved at login time.
const readStoredUser = async () => {
  for (const key of ["userdata", "user", "user_data"]) {
    try {
      const stored = await AsyncStorage.getItem(key);

      if (!stored) continue;

      const parsed = JSON.parse(stored);

      const candidate =
        parsed?.data?.user ?? parsed?.user ?? parsed?.data ?? parsed;

      const profile = extractProfile({ data: candidate });

      if (profile) return profile;
    } catch (error) {
      console.log(`readStoredUser(${key}) error:`, error);
    }
  }

  return null;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function EditBasicInformation() {
  /* =======================================================
       FORM STATE  (all start EMPTY - filled from the API)
    ======================================================= */

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  /*
   * Email and phone are required by the API but are not part of the
   * reference UI. They are loaded from the member's profile. If they
   * cannot be loaded, two extra fields appear so the member can enter
   * them (we never send made-up values).
   */
  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [contactMissing, setContactMissing] = useState(false);

  const [gender, setGender] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState("");

  const [maritalStatus, setMaritalStatus] = useState(MARITAL_PLACEHOLDER);

  const [children, setChildren] = useState(CHILDREN_PLACEHOLDER);

  // "on behalf" comes from the profile; 1 = myself (API default)
  const [onBehalf, setOnBehalf] = useState(1);

  const [photoUrl, setPhotoUrl] = useState("");

  // Newly picked local photo, waiting to be uploaded on Save.
  // { uri, name, type } — null until the member picks something new.
  const [newPhoto, setNewPhoto] = useState(null);

  // True when the member removed their existing photo and it still
  // needs to be cleared on the server on Save.
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [showMaritalModal, setShowMaritalModal] = useState(false);

  const [showChildrenModal, setShowChildrenModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  /* =======================================================
       LOAD MEMBER'S REAL DATA
    ======================================================= */

  const applyProfile = useCallback((p) => {
    const joinedName = firstText(p, ["name", "full_name"]);

    const [nameFirst = "", ...nameRest] = joinedName.split(" ");

    const first = firstText(p, ["first_name", "firstName"]) || nameFirst;

    const last =
      firstText(p, ["last_name", "lastName"]) || nameRest.join(" ").trim();

    const emailValue = firstText(p, ["email", "email_address"]);

    const phoneValue = firstText(p, [
      "phone",
      "mobile",
      "phone_number",
      "mobile_number",
    ]);

    setFirstName(first);

    setLastName(last);

    setEmail(emailValue);

    setPhone(phoneValue);

    setContactMissing(!emailValue || phoneValue.replace(/\D/g, "").length < 10);

    setGender(resolveLabel(p.gender, GENDER_MAP, ""));

    setDateOfBirth(
      formatDateForUi(p.date_of_birth ?? p.dob ?? p.birth_date ?? ""),
    );

    setMaritalStatus(
      resolveLabel(p.marital_status, MARITAL_MAP, MARITAL_PLACEHOLDER),
    );

    setChildren(resolveLabel(p.children, CHILDREN_MAP, CHILDREN_PLACEHOLDER));

    const behalf = Number(toText(p.on_behalf));

    setOnBehalf(Number.isFinite(behalf) && behalf > 0 ? behalf : 1);

    const photo = [p.photo_url, p.photo, p.profile_photo, p.image, p.avatar]
      .map(toUri)
      .find(Boolean);

    setPhotoUrl(photo || "");
    setNewPhoto(null);
    setPhotoRemoved(false);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const token = await getAccessToken();

      if (!token) {
        console.log("EditBasicInformation: no token, nothing to load");

        return;
      }

      let profile = null;

      /* ---------- 1. your Functions.js ---------- */

      for (const name of PROFILE_FUNCTIONS) {
        if (typeof Api[name] !== "function") continue;

        try {
          const response = await Api[name](token);

          console.log(`${name} response:`, JSON.stringify(response));

          profile = extractProfile(response);

          if (profile) break;
        } catch (error) {
          console.log(`${name} error:`, error);
        }
      }

      /* ---------- 2. GET the same resource the update route uses ---------- */

      if (!profile) {
        try {
          const response = await fetch(`${BASE_URL}/api/member/basic-info`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("GET basic-info status:", response.status);

          if (response.ok) {
            profile = extractProfile(await response.json());
          }
        } catch (error) {
          console.log("GET basic-info error:", error);
        }
      }

      /* ---------- 3. user object saved at login ---------- */

      if (!profile) {
        profile = await readStoredUser();
      }

      if (profile) {
        console.log("BASIC INFO LOADED:", JSON.stringify(profile));

        applyProfile(profile);
      } else {
        console.log("BASIC INFO: nothing found, starting with empty form");

        // Could not load anything -> let the member type email / phone.
        setContactMissing(true);
      }
    } catch (error) {
      console.log("loadProfile error:", error);
    } finally {
      setLoading(false);
    }
  }, [applyProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /* =======================================================
       SAVE BASIC INFORMATION
    ======================================================= */

  const handleSave = async () => {
    if (saving || loading) {
      return;
    }

    try {
      setSaving(true);

      // ============================================
      // TOKEN
      // ============================================

      const accessToken = await getAccessToken();

      console.log("====================================");
      console.log("UPDATE BASIC INFORMATION");
      console.log("====================================");
      console.log("BASE URL:", BASE_URL);
      console.log("TOKEN EXISTS:", !!accessToken);

      if (!accessToken) {
        notify("Login Required", "Access token not found. Please login again.");
        return;
      }

      // ============================================
      // VALIDATE
      // ============================================

      const cleanFirstName = String(firstName || "").trim();

      const cleanLastName = String(lastName || "").trim();

      const cleanEmail = String(email || "").trim();

      const cleanPhone = String(phone || "")
        .replace(/\D/g, "")
        .slice(-10);

      if (!cleanFirstName) {
        notify("Validation", "First name is required.");
        return;
      }

      if (!cleanLastName) {
        notify("Validation", "Last name is required.");
        return;
      }

      const genderId = idFromLabel(GENDER_MAP, gender);

      if (!genderId) {
        notify("Validation", "Please select gender.");
        return;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateOfBirth || "").trim())) {
        notify("Validation", "Enter date of birth as YYYY-MM-DD.");
        return;
      }

      const maritalStatusId = idFromLabel(MARITAL_MAP, maritalStatus);

      if (!maritalStatusId) {
        notify("Validation", "Please select marital status.");
        return;
      }

      if (!cleanEmail) {
        notify("Validation", "Email is required.");
        return;
      }

      if (cleanPhone.length !== 10) {
        notify("Validation", "Enter a valid 10 digit phone number.");
        return;
      }

      // "Not specified" -> 0, same as before
      const childrenId = idFromLabel(CHILDREN_MAP, children) ?? 0;

      // ============================================
      // REQUEST BODY
      // ============================================

      const fields = {
        first_name: cleanFirstName,
        last_name: cleanLastName,
        email: cleanEmail,
        phone: cleanPhone,
        gender: genderId,
        on_behalf: onBehalf,
        date_of_birth: formatDateForApi(String(dateOfBirth).trim()),
        marital_status: maritalStatusId,
        children: childrenId,
      };

      // A new photo was picked, or the existing one was removed ->
      // send multipart/form-data so the file (or the removal flag)
      // reaches the server together with the rest of the form.
      const hasPhotoChange = !!newPhoto || photoRemoved;

      let requestBody;
      let requestHeaders;

      if (hasPhotoChange) {
        const formData = new FormData();

        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        if (newPhoto) {
          const photoPart = await buildPhotoFilePart(newPhoto);

          // Web's FormData.append needs the filename as a 3rd arg;
          // React Native's polyfill ignores the extra arg harmlessly.
          formData.append("photo", photoPart, newPhoto.name);
        } else if (photoRemoved) {
          // TODO: confirm the field your API expects to clear a photo.
          formData.append("remove_photo", "1");
        }

        requestBody = formData;

        requestHeaders = {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          // Deliberately no Content-Type here — fetch sets the
          // multipart boundary itself when the body is FormData.
        };

        console.log("REQUEST BODY (multipart):", {
          ...fields,
          photo: newPhoto ? newPhoto.name : undefined,
          remove_photo: photoRemoved ? "1" : undefined,
        });
      } else {
        requestBody = JSON.stringify(fields);

        requestHeaders = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        };

        console.log("REQUEST BODY:", JSON.stringify(fields, null, 2));
      }

      // ============================================
      // API URL
      // ============================================

      const apiUrl = `${BASE_URL}/api/member/basic-info/update`;

      console.log("FINAL API URL:", apiUrl);

      // ============================================
      // POST REQUEST
      // ============================================

      const response = await fetch(apiUrl, {
        method: "POST",

        headers: requestHeaders,

        body: requestBody,
      });

      // ============================================
      // READ RESPONSE
      // ============================================

      const responseText = await response.text();

      console.log("HTTP STATUS:", response.status);

      console.log("RESPONSE TEXT:", responseText);

      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = {
          message: responseText,
        };
      }

      console.log("RESPONSE JSON:", JSON.stringify(responseData, null, 2));

      // ============================================
      // HTTP ERROR
      // ============================================

      if (!response.ok) {
        const serverMessage =
          responseData?.message ||
          responseData?.error ||
          responseData?.errors ||
          `Server returned HTTP ${response.status}`;

        const readableMessage =
          typeof serverMessage === "string"
            ? serverMessage
            : typeof serverMessage === "object"
              ? Object.values(serverMessage)
                  .flat()
                  .map((item) => String(item))
                  .join("\n")
              : String(serverMessage);

        throw new Error(readableMessage);
      }

      // ============================================
      // API SUCCESS CHECK
      // ============================================

      if (
        responseData &&
        (responseData.success === false ||
          responseData.result === false ||
          responseData.status === false)
      ) {
        throw new Error(
          responseData.message ||
            responseData.error ||
            "API rejected the update.",
        );
      }

      // ============================================
      // SUCCESS
      // ============================================

      // The server now has the new photo (or the removal); clear the
      // local "pending" flags and reload so photoUrl reflects the
      // final server-hosted URL, not the local picker uri.
      setNewPhoto(null);
      setPhotoRemoved(false);

      await loadProfile();

      notify("Success", "Basic information updated successfully.", () => {
        router.back();
      });
    } catch (error) {
      console.error("====================================");

      console.error("UPDATE BASIC INFORMATION ERROR");

      console.error(error);

      console.error("====================================");

      notify(
        "Update Failed",
        error?.message || "Unable to update basic information.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
       REMOVE PHOTO
    ======================================================= */

  const clearPhoto = () => {
    setPhotoUrl("");
    setNewPhoto(null);
    setPhotoRemoved(true);
  };

  const handleRemovePhoto = () => {
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Are you sure you want to remove this photo?")
      ) {
        clearPhoto();
      }

      return;
    }

    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: clearPhoto,
      },
    ]);
  };

  /* =======================================================
       UPLOAD PHOTO
    ======================================================= */

  const handleUploadPhoto = async () => {
    if (uploadingPhoto) return;

    try {
      setUploadingPhoto(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        notify(
          "Permission Needed",
          "Please allow photo library access to choose a profile photo.",
        );

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      const fileName =
        asset.fileName ||
        asset.uri.split("/").pop() ||
        `photo-${Date.now()}.jpg`;

      const extensionMatch = /\.(\w+)$/.exec(fileName);

      const extension = (extensionMatch?.[1] || "jpg").toLowerCase();

      const mimeType =
        asset.mimeType || (extension === "png" ? "image/png" : "image/jpeg");

      // Preview immediately; the actual upload happens on Save so it
      // travels together with the rest of the form in one request.
      setPhotoUrl(asset.uri);

      setNewPhoto({ uri: asset.uri, name: fileName, type: mimeType });

      setPhotoRemoved(false);
    } catch (error) {
      console.error("PICK PHOTO ERROR:", error);

      notify("Error", error?.message || "Unable to select a photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* =======================================================
       RADIO BUTTON
    ======================================================= */

  const RadioButton = ({ label, value }) => {
    const selected = gender === value;

    return (
      <TouchableOpacity
        style={styles.radioItem}
        activeOpacity={0.7}
        onPress={() => setGender(value)}
      >
        <View
          style={[styles.radioOuter, selected && styles.radioOuterSelected]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>

        <Text style={styles.radioText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  /* =======================================================
       DROPDOWN ITEM
    ======================================================= */

  const DropdownItem = ({ title, selected, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.modalOption}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <Text
          style={[
            styles.modalOptionText,
            selected && styles.modalOptionTextSelected,
          ]}
        >
          {title}
        </Text>

        {selected && <Ionicons name="checkmark" size={18} color={COLORS.red} />}
      </TouchableOpacity>
    );
  };

  /* =======================================================
       SCREEN
    ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.screen}>
        {/* =================================================
                   HEADER
                ================================================= */}

        <View style={styles.header}>
          {/* BACK BUTTON */}

          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={18} color="#222222" />
          </TouchableOpacity>

          {/* TITLE */}

          <Text style={styles.headerTitle}>Edit Basic Information</Text>

          {/* MENU */}

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={15} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        {/* =================================================
                   MAIN CARD
                ================================================= */}

        <View style={styles.card}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={COLORS.red} />

              <Text style={styles.loaderText}>Loading your details...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* =========================================
                           FIRST NAME
                        ========================================= */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                  placeholderTextColor={"#A0A0A0"}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* =========================================
                           LAST NAME
                        ========================================= */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                  placeholderTextColor={"#A0A0A0"}
                  style={styles.input}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>

              {/* =========================================
                           EMAIL + PHONE
                           (only when they could not be loaded)
                        ========================================= */}

              {contactMissing && (
                <>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      Email <Text style={styles.required}>*</Text>
                    </Text>

                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      placeholderTextColor={"#A0A0A0"}
                      style={styles.input}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.label}>
                      Phone <Text style={styles.required}>*</Text>
                    </Text>

                    <TextInput
                      value={phone}
                      onChangeText={(text) =>
                        setPhone(text.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="10 digit phone number"
                      placeholderTextColor={"#A0A0A0"}
                      style={styles.input}
                      keyboardType="number-pad"
                      maxLength={10}
                      returnKeyType="next"
                    />
                  </View>
                </>
              )}

              {/* =========================================
                           GENDER
                        ========================================= */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.genderRow}>
                  <RadioButton label="Male" value="Male" />

                  <RadioButton label="Female" value="Female" />

                  <RadioButton label="Other" value="Other" />
                </View>
              </View>

              {/* =========================================
                           DATE OF BIRTH
                        ========================================= */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Date of Birth <Text style={styles.required}>*</Text>
                </Text>

                <View style={styles.dateInputContainer}>
                  <TextInput
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={"#A0A0A0"}
                    style={styles.dateInput}
                    maxLength={10}
                    keyboardType="numbers-and-punctuation"
                  />

                  <TouchableOpacity
                    style={styles.calendarButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#555555"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* =========================================
                           MARITAL STATUS
                        ========================================= */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Marital Status <Text style={styles.required}>*</Text>
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.dropdown}
                  onPress={() => setShowMaritalModal(true)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      maritalStatus === MARITAL_PLACEHOLDER &&
                        styles.placeholderText,
                    ]}
                  >
                    {maritalStatus}
                  </Text>

                  <Ionicons
                    name="chevron-down-outline"
                    size={17}
                    color="#777777"
                  />
                </TouchableOpacity>
              </View>

              {/* =========================================
                           NUMBER OF CHILDREN
                        ========================================= */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Number of Children</Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.dropdown}
                  onPress={() => setShowChildrenModal(true)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      children === CHILDREN_PLACEHOLDER &&
                        styles.placeholderText,
                    ]}
                  >
                    {children}
                  </Text>

                  <Ionicons
                    name="chevron-down-outline"
                    size={17}
                    color="#777777"
                  />
                </TouchableOpacity>
              </View>

              {/* =========================================
                           UPLOAD PHOTO
                        ========================================= */}

              <View style={styles.photoSection}>
                <Text style={styles.label}>Upload Photo</Text>

                <View style={styles.photoRow}>
                  {/* PROFILE PHOTO */}

                  <View style={styles.profilePhotoContainer}>
                    {photoUrl ? (
                      <Image
                        source={{ uri: photoUrl }}
                        style={styles.profilePhoto}
                      />
                    ) : (
                      <View style={styles.emptyPhoto}>
                        <Ionicons
                          name="person-outline"
                          size={22}
                          color="#B5B5B5"
                        />
                      </View>
                    )}

                    {/* REMOVE */}

                    {!!photoUrl && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        activeOpacity={0.8}
                        onPress={handleRemovePhoto}
                      >
                        <Ionicons name="close" size={10} color={COLORS.red} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* UPLOAD BOX */}

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.uploadBox}
                    onPress={handleUploadPhoto}
                    disabled={uploadingPhoto}
                  >
                    {uploadingPhoto ? (
                      <ActivityIndicator size="small" color={COLORS.red} />
                    ) : (
                      <>
                        <Ionicons
                          name="camera-outline"
                          size={18}
                          color={COLORS.red}
                          style={styles.cameraIcon}
                        />

                        <Text style={styles.uploadTitle}>
                          Upload Photo (800x800)
                        </Text>

                        <Text style={styles.uploadSubText}>
                          JPG, PNG (Max 5MB)
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* =========================================
                           SAVE BUTTON
                        ========================================= */}

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>

      {/* =====================================================
               MARITAL STATUS MODAL
            ===================================================== */}

      <Modal
        visible={showMaritalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMaritalModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaritalModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Marital Status</Text>

              <TouchableOpacity onPress={() => setShowMaritalModal(false)}>
                <Ionicons name="close" size={19} color="#333333" />
              </TouchableOpacity>
            </View>

            {maritalOptions.map((item) => (
              <DropdownItem
                key={item}
                title={item}
                selected={maritalStatus === item}
                onPress={() => {
                  setMaritalStatus(item);

                  setShowMaritalModal(false);
                }}
              />
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* =====================================================
               CHILDREN MODAL
            ===================================================== */}

      <Modal
        visible={showChildrenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChildrenModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChildrenModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Number of Children</Text>

              <TouchableOpacity onPress={() => setShowChildrenModal(false)}>
                <Ionicons name="close" size={19} color="#333333" />
              </TouchableOpacity>
            </View>

            {childrenOptions.map((item) => (
              <DropdownItem
                key={item}
                title={item}
                selected={children === item}
                onPress={() => {
                  setChildren(item);

                  setShowChildrenModal(false);
                }}
              />
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES - REFERENCE UI
========================================================= */

const styles = StyleSheet.create({
  /* =====================================================
       SAFE AREA
    ===================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  /* =====================================================
       SCREEN
    ===================================================== */

  screen: {
    flex: 1,
    backgroundColor: "#F5F5F5",

    paddingHorizontal: 7,
    paddingTop: 5,
    paddingBottom: 5,
  },

  /* =====================================================
       HEADER
    ===================================================== */

  header: {
    width: "100%",
    height: 60,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    position: "relative",

    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,

    borderWidth: 1,
    borderColor: "#E2E2E2",

    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  /* =====================================================
       BACK BUTTON
    ===================================================== */

  backButton: {
    position: "absolute",

    left: 0,
    top: 0,

    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================================
       HEADER TITLE
    ===================================================== */

  headerTitle: {
    fontSize: 18,
    lineHeight: 11,

    fontWeight: "600",

    color: "#222222",

    includeFontPadding: false,

    textAlign: "center",
  },

  /* =====================================================
       MENU BUTTON
    ===================================================== */

  menuButton: {
    position: "absolute",

    right: 0,
    top: 0,

    width: 30,
    height: 35,

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================================
       MAIN CARD
    ===================================================== */

  card: {
    width: "100%",
    height: 30,

    flex: 1,

    backgroundColor: "#FFFFFF",

    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,

    borderColor: "#E2E2E2",

    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,

    overflow: "hidden",
  },

  /* =====================================================
       LOADER
    ===================================================== */

  loaderContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  loaderText: {
    marginTop: 10,

    fontSize: 13,

    color: "#777777",
  },

  /* =====================================================
       SCROLL CONTENT
    ===================================================== */

  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 8,
  },

  /* =====================================================
       EACH FIELD
    ===================================================== */

  fieldContainer: {
    width: "100%",
    height: 50,

    marginBottom: 50,
  },

  /* =====================================================
       LABEL
    ===================================================== */

  label: {
    fontSize: 15,

    lineHeight: 8,

    fontWeight: "500",

    color: "#4D4D4D",

    marginBottom: 10,
    marginTop: 20,

    includeFontPadding: false,
  },

  /* =====================================================
       REQUIRED *
    ===================================================== */

  required: {
    color: "#E51D35",

    fontSize: 15,

    fontWeight: "500",
  },

  /* =====================================================
       TEXT INPUT
    ===================================================== */

  input: {
    width: "100%",

    height: 30,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E5E5E5",

    borderRadius: 4,

    paddingHorizontal: 10,
    paddingVertical: 10,

    fontSize: 13,

    lineHeight: 10,

    color: "#333333",

    includeFontPadding: false,
  },

  /* =====================================================
       GENDER ROW
    ===================================================== */

  genderRow: {
    width: "100%",

    height: 24,

    flexDirection: "row",

    alignItems: "center",
  },

  /* =====================================================
       RADIO ITEM
    ===================================================== */

  radioItem: {
    flexDirection: "row",

    alignItems: "center",

    marginRight: 20,
  },

  /* =====================================================
       RADIO OUTER
    ===================================================== */

  radioOuter: {
    width: 15,
    height: 15,

    borderRadius: 5,

    borderWidth: 1,

    borderColor: "#CCCCCC",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 6,
  },

  /* =====================================================
       SELECTED RADIO
    ===================================================== */

  radioOuterSelected: {
    borderColor: "#E51D35",
  },

  /* =====================================================
       RADIO INNER
    ===================================================== */

  radioInner: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#E51D35",
  },

  /* =====================================================
       RADIO TEXT
    ===================================================== */

  radioText: {
    fontSize: 12,

    lineHeight: 10,

    color: "#555555",

    includeFontPadding: false,
  },

  /* =====================================================
       DATE INPUT CONTAINER
    ===================================================== */

  dateInputContainer: {
    width: "100%",

    height: 25,

    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 4,
  },

  /* =====================================================
       DATE TEXT
    ===================================================== */

  dateInput: {
    flex: 1,

    height: 24,

    paddingHorizontal: 7,
    paddingVertical: 0,

    fontSize: 12,

    lineHeight: 10,

    color: "#3d3c3c",

    includeFontPadding: false,
  },

  /* =====================================================
       CALENDAR BUTTON
    ===================================================== */

  calendarButton: {
    width: 27,
    height: 24,

    alignItems: "center",
    justifyContent: "center",
  },

  /* =====================================================
       DROPDOWN
    ===================================================== */

  dropdown: {
    width: "100%",

    height: 25,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E5E5E5",

    borderRadius: 4,

    paddingHorizontal: 7,
  },

  /* =====================================================
       DROPDOWN TEXT
    ===================================================== */

  dropdownText: {
    flex: 1,

    fontSize: 13,

    lineHeight: 15,

    color: "#555555",

    includeFontPadding: false,
  },

  /* =====================================================
       PLACEHOLDER
    ===================================================== */

  placeholderText: {
    color: "#999999",
  },

  /* =====================================================
       PHOTO SECTION
    ===================================================== */

  photoSection: {
    width: "100%",

    marginTop: 10,

    marginBottom: 20,
  },

  /* =====================================================
       PHOTO ROW
    ===================================================== */

  photoRow: {
    width: "100%",

    height: 80,

    flexDirection: "row",

    alignItems: "center",
  },

  /* =====================================================
       PROFILE PHOTO CONTAINER
    ===================================================== */

  profilePhotoContainer: {
    width: 150,

    height: 80,

    position: "relative",

    marginRight: 30,
  },

  /* =====================================================
       PROFILE PHOTO
    ===================================================== */

  profilePhoto: {
    width: 150,

    height: 180,

    borderRadius: 4,

    backgroundColor: "#EEEEEE",

    resizeMode: "cover",
  },

  /* =====================================================
       EMPTY PHOTO
    ===================================================== */

  emptyPhoto: {
    width: 80,

    height: 75,

    borderRadius: 4,

    backgroundColor: "#F4F4F4",

    borderWidth: 1,

    borderColor: "#E4E4E4",

    alignItems: "center",

    justifyContent: "center",
  },

  /* =====================================================
       REMOVE PHOTO
    ===================================================== */

  removeButton: {
    position: "absolute",

    top: -1,

    right: -1,

    width: 14,

    height: 14,

    borderRadius: 7,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#E51D35",

    alignItems: "center",

    justifyContent: "center",

    zIndex: 20,

    elevation: 3,
  },

  /* =====================================================
       UPLOAD BOX
    ===================================================== */

  uploadBox: {
    flex: 1,

    height: 105,
    width: 50,

    backgroundColor: "#FFFBFC",

    borderWidth: 1,

    borderStyle: "dashed",

    borderColor: "#E79AA3",

    borderRadius: 4,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 10,
  },

  /* =====================================================
       CAMERA ICON
    ===================================================== */

  cameraIcon: {
    marginBottom: 2,
  },

  /* =====================================================
       UPLOAD TITLE
    ===================================================== */

  uploadTitle: {
    fontSize: 10.5,

    lineHeight: 8,

    fontWeight: "500",

    color: "#555555",

    textAlign: "center",

    includeFontPadding: false,
  },

  /* =====================================================
       UPLOAD SUB TEXT
    ===================================================== */

  uploadSubText: {
    fontSize: 9.5,

    lineHeight: 9,

    color: "#999999",

    textAlign: "center",

    marginTop: 1,

    includeFontPadding: false,
  },

  /* =====================================================
       SAVE BUTTON
    ===================================================== */

  saveButton: {
    width: "100%",

    height: 37,

    marginTop: 130,

    marginBottom: 40,

    backgroundColor: "#E51D35",

    borderRadius: 5,

    alignItems: "center",

    justifyContent: "center",
  },

  /* =====================================================
       SAVE DISABLED
    ===================================================== */

  saveButtonDisabled: {
    opacity: 0.6,
  },

  /* =====================================================
       SAVE TEXT
    ===================================================== */

  saveButtonText: {
    color: "#FFFFFF",

    fontSize: 18,

    lineHeight: 10,

    fontWeight: "600",

    includeFontPadding: false,

    textAlign: "center",
  },

  /* =====================================================
       MODAL OVERLAY
    ===================================================== */

  modalOverlay: {
    flex: 1,

    backgroundColor: "rgba(0,0,0,0.35)",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 25,
  },

  /* =====================================================
       MODAL CARD
    ===================================================== */

  modalCard: {
    width: "100%",

    maxWidth: 350,

    backgroundColor: "#FFFFFF",

    borderRadius: 9,

    overflow: "hidden",

    elevation: 5,
  },

  /* =====================================================
       MODAL HEADER
    ===================================================== */

  modalHeader: {
    height: 43,

    paddingHorizontal: 14,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "#EEEEEE",
  },

  /* =====================================================
       MODAL TITLE
    ===================================================== */

  modalTitle: {
    fontSize: 12,

    fontWeight: "600",

    color: "#222222",
  },

  /* =====================================================
       MODAL OPTION
    ===================================================== */

  modalOption: {
    minHeight: 40,

    paddingHorizontal: 14,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "#F0F0F0",
  },

  /* =====================================================
       MODAL OPTION TEXT
    ===================================================== */

  modalOptionText: {
    fontSize: 10,

    color: "#555555",
  },

  /* =====================================================
       SELECTED MODAL OPTION
    ===================================================== */

  modalOptionTextSelected: {
    color: "#E51D35",

    fontWeight: "600",
  },
});
