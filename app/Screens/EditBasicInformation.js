import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import Feather from "react-native-vector-icons/Feather";
import Fonts from "../constants/Fonts";

import BASE_URL from "../constants/AppUrls";
import * as Api from "../utils/Functions";

/* ===
   COLORS
=== */

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

/* ===
   CONFIG
=== */

const PROFILE_FUNCTIONS = [
  "getMemberBasicInfo",
  "getMemberBasicInformation",
  "getBasicInfo",
  "getMemberProfile",
  "getMemberDetails",
  "getMyProfile",
  "getProfile",
];

/* ===
   OPTIONS
=== */

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

/* ===
   HELPERS
=== */

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

const buildPhotoFilePart = (photo) => {
  return {
    uri: photo.uri,
    name: photo.name,
    type: photo.type,
  };
};

/* ===
   DATE FORMAT
=== */

const formatDateForApi = (date) => {
  if (!date) return "";
  const value = String(date).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}-${month}-${year}`;
  }
  return value;
};

const formatDateForUi = (value) => {
  const text = toText(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  if (/^\d{2}-\d{2}-\d{4}/.test(text)) {
    const [day, month, year] = text.slice(0, 10).split("-");
    return `${year}-${month}-${day}`;
  }
  return text;
};

const notify = (title, message, onOk) => {
  Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
};

/* ===
   TOKEN
=== */

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

/* ===
   PROFILE LOADING
=== */

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

/* ===
   MAIN COMPONENT
=== */

export default function EditBasicInformation({ navigation, route }) {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactMissing, setContactMissing] = useState(false);
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maritalStatus, setMaritalStatus] = useState(MARITAL_PLACEHOLDER);
  const [children, setChildren] = useState(CHILDREN_PLACEHOLDER);
  const [onBehalf, setOnBehalf] = useState(1);
  const [photoUrl, setPhotoUrl] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showMaritalModal, setShowMaritalModal] = useState(false);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const onBackPress = () => {
    navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    return true;
  };
  
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [route]),
  );


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

      if (!token) return;

      let profile = null;

      for (const name of PROFILE_FUNCTIONS) {
        if (typeof Api[name] !== "function") continue;
        try {
          const response = await Api[name](token);
          profile = extractProfile(response);
          if (profile) break;
        } catch (error) {
          console.log(`${name} error:`, error);
        }
      }

      if (!profile) {
        try {
          const response = await fetch(`${BASE_URL}/api/member/basic-info`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            profile = extractProfile(await response.json());
          }
        } catch (error) {
          console.log("GET basic-info error:", error);
        }
      }

      if (!profile) {
        profile = await readStoredUser();
      }

      if (profile) {
        applyProfile(profile);
      } else {
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

  const handleSave = async () => {
    if (saving || loading) return;

    try {
      setSaving(true);
      const accessToken = await getAccessToken();

      if (!accessToken) {
        notify("Login Required", "Access token not found. Please login again.");
        return;
      }

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

      const childrenId = idFromLabel(CHILDREN_MAP, children) ?? 0;

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

      const hasPhotoChange = !!newPhoto || photoRemoved;
      let requestBody;
      let requestHeaders;

      if (hasPhotoChange) {
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, String(value));
        });

        if (newPhoto) {
          const photoPart = buildPhotoFilePart(newPhoto);
          formData.append("photo", photoPart);
        } else if (photoRemoved) {
          formData.append("remove_photo", "1");
        }

        requestBody = formData;
        requestHeaders = {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        };
      } else {
        requestBody = JSON.stringify(fields);
        requestHeaders = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        };
      }

      const response = await fetch(`${BASE_URL}/api/member/basic-info/update`, {
        method: "POST",
        headers: requestHeaders,
        body: requestBody,
      });

      const responseText = await response.text();
      let responseData = null;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { message: responseText };
      }

      if (!response.ok) {
        const serverMessage =
          responseData?.message ||
          responseData?.error ||
          responseData?.errors ||
          `Server returned HTTP ${response.status}`;

        throw new Error(
          typeof serverMessage === "object"
            ? Object.values(serverMessage).flat().join("\n")
            : String(serverMessage),
        );
      }

      if (
        responseData &&
        (responseData.success === false ||
          responseData.result === false ||
          responseData.status === false)
      ) {
        throw new Error(responseData.message || "API rejected the update.");
      }

      setNewPhoto(null);
      setPhotoRemoved(false);
      await loadProfile();

      notify("Success", "Basic information updated successfully.", () => {
        onBackPress();
      });
    } catch (error) {
      notify("Update Failed", error?.message || "Unable to update details.");
    } finally {
      setSaving(false);
    }
  };

  const clearPhoto = () => {
    setPhotoUrl("");
    setNewPhoto(null);
    setPhotoRemoved(true);
  };

  const handleRemovePhoto = () => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: clearPhoto },
    ]);
  };

  const handleUploadPhoto = async () => {
    if (uploadingPhoto) return;

    try {
      setUploadingPhoto(true);
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets?.length) return;

      const asset = result.assets[0];
      const fileName =
        asset.fileName ||
        asset.uri.split("/").pop() ||
        `photo-${Date.now()}.jpg`;

      setPhotoUrl(asset.uri);
      setNewPhoto({
        uri: asset.uri,
        name: fileName,
        type: asset.type || "image/jpeg",
      });
      setPhotoRemoved(false);
    } catch (error) {
      notify("Error", error?.message || "Unable to select a photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

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

  const DropdownItem = ({ title, selected, onPress }) => (
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
      {selected && <Feather name="check" size={18} color={COLORS.red} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.screen}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => onBackPress()}
          >
            <Feather name="chevron-left" size={22} color="#222222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Basic Information</Text>
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          </TouchableOpacity>
        </View>

        {/* MAIN CONTAINER */}
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
              {/* PROFILE PHOTO */}
              <View style={styles.photoSection}>
                <View style={styles.photoContainer}>
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      style={styles.photoImage}
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Feather name="user" size={40} color={COLORS.gray} />
                    </View>
                  )}
                </View>
                <View style={styles.photoActions}>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={handleUploadPhoto}
                    disabled={uploadingPhoto}
                  >
                    <Text style={styles.uploadBtnText}>
                      {uploadingPhoto ? "Picking..." : "Change Photo"}
                    </Text>
                  </TouchableOpacity>
                  {photoUrl ? (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={handleRemovePhoto}
                    >
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {/* FIRST NAME */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                  placeholderTextColor={COLORS.placeholder}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

              {/* LAST NAME */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                  placeholderTextColor={COLORS.placeholder}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

              {/* EMAIL & PHONE (Conditional) */}
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
                      placeholderTextColor={COLORS.placeholder}
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
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
                      placeholderTextColor={COLORS.placeholder}
                      style={styles.input}
                      keyboardType="number-pad"
                      maxLength={10}
                    />
                  </View>
                </>
              )}

              {/* GENDER */}
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

              {/* DATE OF BIRTH */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Date of Birth <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.placeholder}
                  style={styles.input}
                />
              </View>

              {/* MARITAL STATUS */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Marital Status <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  activeOpacity={0.8}
                  onPress={() => setShowMaritalModal(true)}
                >
                  <Text
                    style={
                      maritalStatus !== MARITAL_PLACEHOLDER
                        ? styles.pickerValue
                        : styles.pickerPlaceholder
                    }
                  >
                    {maritalStatus}
                  </Text>
                  <Feather name="chevron-down" size={18} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              {/* CHILDREN */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Children</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  activeOpacity={0.8}
                  onPress={() => setShowChildrenModal(true)}
                >
                  <Text
                    style={
                      children !== CHILDREN_PLACEHOLDER
                        ? styles.pickerValue
                        : styles.pickerPlaceholder
                    }
                  >
                    {children}
                  </Text>
                  <Feather name="chevron-down" size={18} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

              {/* SAVE BUTTON */}
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>

      {/* MARITAL MODAL */}
      <Modal visible={showMaritalModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaritalModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Marital Status</Text>
            {maritalOptions.map((opt) => (
              <DropdownItem
                key={opt}
                title={opt}
                selected={maritalStatus === opt}
                onPress={() => {
                  setMaritalStatus(opt);
                  setShowMaritalModal(false);
                }}
              />
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CHILDREN MODAL */}
      <Modal visible={showChildrenModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChildrenModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Children Count</Text>
            {childrenOptions.map((opt) => (
              <DropdownItem
                key={opt}
                title={opt}
                selected={children === opt}
                onPress={() => {
                  setChildren(opt);
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, paddingHorizontal: 16 },
  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
    color: COLORS.black,
  },
  menuButton: { padding: 8 },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: 10,
    padding: 16,
    elevation: 2,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loaderText: {
    marginTop: 10,
    color: COLORS.gray,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
  },
  scrollContent: { paddingBottom: 20 },
  photoSection: { alignItems: "center", marginBottom: 20 },
  photoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: "hidden",
    backgroundColor: COLORS.border,
    marginBottom: 10,
  },
  photoImage: { width: "100%", height: "100%" },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  photoActions: { flexDirection: "row", gap: 10 },
  uploadBtn: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  uploadBtnText: {
    color: COLORS.black,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
  },
  removeBtn: {
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeBtnText: {
    color: COLORS.red,
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.sm,
  },
  fieldContainer: { marginBottom: 16 },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: Fonts.size.md,
    color: COLORS.black,
    marginBottom: 6,
  },
  required: { color: COLORS.red },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: COLORS.black,
  },
  genderRow: { flexDirection: "row", justifyContent: "space-between" },
  radioItem: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  radioOuterSelected: { borderColor: COLORS.red },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.red,
  },
  radioText: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: COLORS.text,
  },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerValue: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: COLORS.black,
  },
  pickerPlaceholder: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: COLORS.placeholder,
  },
  saveButton: {
    backgroundColor: COLORS.red,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 20 },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: Fonts.size.base,
    marginBottom: 15,
    color: COLORS.black,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    fontFamily: Fonts.regular,
    fontSize: Fonts.size.md,
    color: COLORS.text,
  },
  modalOptionTextSelected: { fontFamily: Fonts.bold, color: COLORS.red },
});
