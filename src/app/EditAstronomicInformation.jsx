import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Path } from "react-native-svg";
import Feather from "react-native-vector-icons/Feather";

import { Colors } from "../constants/colors";
import {
  getMemberAstronomic,
  updateMemberAstronomic,
} from "../utils/Functions";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

export default function EditAstronomicInformation() {
  const navigation = useNavigation();

  // State
  const [sunSign, setSunSign] = useState("");
  const [moonSign, setMoonSign] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [cityOfBirth, setCityOfBirth] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modals & Selectors
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedTimeDate, setSelectedTimeDate] = useState(new Date());
  const [zodiacSelectorType, setZodiacSelectorType] = useState(null); // 'sun' | 'moon' | null

  // Draft States for Modal Editing
  const [draftSunSign, setDraftSunSign] = useState("");
  const [draftMoonSign, setDraftMoonSign] = useState("");
  const [draftTimeOfBirth, setDraftTimeOfBirth] = useState("");
  const [draftCityOfBirth, setDraftCityOfBirth] = useState("");

  /* =========================================================
     BACKHANDLER & FOCUS EFFECT
  ========================================================= */

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (zodiacSelectorType !== null) {
          setZodiacSelectorType(null);
          return true;
        }
        if (isTimePickerVisible) {
          setIsTimePickerVisible(false);
          return true;
        }
        if (isEditingModalOpen) {
          closeEditor();
          return true;
        }
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [
      navigation,
      isEditingModalOpen,
      zodiacSelectorType,
      isTimePickerVisible,
    ]),
  );

  /* =========================================================
     GET ASTRONOMIC INFORMATION
  ========================================================= */

  const loadAstronomicInformation = async () => {
    try {
      setLoading(true);
      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        setErrorMessage("Please login again.");
        return;
      }

      const response = await getMemberAstronomic(accessToken);

      if (!response) {
        setErrorMessage("Astronomic information not found.");
        return;
      }

      let data = response?.data;
      if (data?.data) data = data.data;
      if (data?.result) data = data.result;

      const loadedSun = String(data?.sun_sign ?? data?.sunSign ?? "");
      const loadedMoon = String(data?.moon_sign ?? data?.moonSign ?? "");
      const loadedTime = String(data?.time_of_birth ?? data?.timeOfBirth ?? "");
      const loadedCity = String(data?.city_of_birth ?? data?.cityOfBirth ?? "");

      setSunSign(loadedSun);
      setMoonSign(loadedMoon);
      setTimeOfBirth(loadedTime);
      setCityOfBirth(loadedCity);

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message ||
          "Unable to load astronomic information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAstronomicInformation();
  }, []);

  /* =========================================================
     EDITOR MODAL & TIME PICKER HANDLERS
  ========================================================= */

  const openEditor = () => {
    setDraftSunSign(sunSign);
    setDraftMoonSign(moonSign);
    setDraftTimeOfBirth(timeOfBirth);
    setDraftCityOfBirth(cityOfBirth);
    setIsEditingModalOpen(true);
  };

  const closeEditor = () => {
    setIsEditingModalOpen(false);
    setZodiacSelectorType(null);
    setIsTimePickerVisible(false);
  };

  const handleTimeChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setIsTimePickerVisible(false);
    }

    if (selectedDate) {
      setSelectedTimeDate(selectedDate);
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

      setDraftTimeOfBirth(`${formattedHours}:${formattedMinutes} ${ampm}`);
    }
  };

  /* =========================================================
     SAVE HANDLER
  ========================================================= */

  const handleSave = async () => {
    if (saving) return;

    try {
      setErrorMessage("");
      setSaving(true);

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        setErrorMessage("Please login again.");
        return;
      }

      const cleanSunSign = String(draftSunSign || "").trim();
      const cleanMoonSign = String(draftMoonSign || "").trim();
      const cleanTimeOfBirth = String(draftTimeOfBirth || "").trim();
      const cleanCityOfBirth = String(draftCityOfBirth || "").trim();

      if (!cleanSunSign) {
        Alert.alert("Validation Error", "Please select a Sun Sign.");
        return;
      }

      if (!cleanMoonSign) {
        Alert.alert("Validation Error", "Please select a Moon Sign.");
        return;
      }

      if (!cleanTimeOfBirth) {
        Alert.alert("Validation Error", "Please select Time Of Birth.");
        return;
      }

      if (!cleanCityOfBirth) {
        Alert.alert("Validation Error", "Please enter City Of Birth.");
        return;
      }

      const body = {
        sun_sign: cleanSunSign,
        moon_sign: cleanMoonSign,
        time_of_birth: cleanTimeOfBirth,
        city_of_birth: cleanCityOfBirth,
      };

      const response = await updateMemberAstronomic(accessToken, body);

      const success =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true;

      if (success) {
        setSunSign(cleanSunSign);
        setMoonSign(cleanMoonSign);
        setTimeOfBirth(cleanTimeOfBirth);
        setCityOfBirth(cleanCityOfBirth);

        closeEditor();
        Alert.alert("Success", "Astronomic details updated successfully!");
        return;
      }

      const message =
        response?.message ||
        response?.error ||
        "Unable to update astronomic details.";

      setErrorMessage(message);
      Alert.alert("Update Failed", message);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update astronomic details.";

      setErrorMessage(message);
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const astronomicItems = [
    {
      icon: "sun",
      iconBg: "#FFF5D8",
      iconColor: "#F5A800",
      label: "Sun Sign",
      value: sunSign || "Not specified",
    },
    {
      icon: "moon",
      iconBg: "#F2E9FF",
      iconColor: "#8145D7",
      label: "Moon Sign",
      value: moonSign || "Not specified",
    },
    {
      icon: "clock",
      iconBg: "#FFECEF",
      iconColor: Colors.primaryRed || "#D7192E",
      label: "Time of Birth",
      value: timeOfBirth || "Not specified",
    },
    {
      icon: "map-pin",
      iconBg: "#EAF7EA",
      iconColor: "#2E7D32",
      label: "City of Birth",
      value: cityOfBirth || "Not specified",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={Colors.gradientLogo || ["#D7192E", "#900C1C"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <View style={styles.backButtonCircle}>
              <Feather
                name="arrow-left"
                size={20}
                color={Colors.primaryRed || "#D7192E"}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Astronomic Information</Text>
        </LinearGradient>

        <Svg
          width={SCREEN_WIDTH}
          height={24}
          viewBox={`0 0 ${SCREEN_WIDTH} 24`}
          style={styles.headerWave}
        >
          <Path
            d={`M0,4 Q${SCREEN_WIDTH * 0.25},22 ${SCREEN_WIDTH * 0.5},10 Q${
              SCREEN_WIDTH * 0.75
            },-2 ${SCREEN_WIDTH},14`}
            stroke={Colors.goldLight || "#FFD700"}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TITLE */}
        <View style={styles.titleRow}>
          <View style={styles.titleIconWrapper}>
            <Feather
              name="compass"
              size={26}
              color={Colors.primaryRed || "#D7192E"}
            />
            <Feather
              name="edit-2"
              size={12}
              color={Colors.primaryRed || "#D7192E"}
              style={styles.titleIconPencil}
            />
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.titleText}>Astronomic Details</Text>
            <Text style={styles.subtitleText}>
              Manage horoscope and astrological properties
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator
              size="large"
              color={Colors.primaryRed || "#D7192E"}
            />
          </View>
        ) : (
          /* ASTRONOMIC DETAILS CARD */
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Astrology & Birth Chart</Text>
              <TouchableOpacity style={styles.editRow} onPress={openEditor}>
                <Feather
                  name="edit-3"
                  size={14}
                  color={Colors.primaryRed || "#D7192E"}
                />
                <Text style={styles.sectionLink}> Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
              {astronomicItems.map((item) => (
                <View key={item.label} style={styles.gridItem}>
                  <View
                    style={[
                      styles.infoIconCircle,
                      { backgroundColor: item.iconBg },
                    ]}
                  >
                    <Feather
                      name={item.icon}
                      size={16}
                      color={item.iconColor}
                    />
                  </View>
                  <View style={styles.gridTextContent}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* EDITING SHEET MODAL */}
      <Modal
        visible={isEditingModalOpen}
        transparent
        animationType="slide"
        onRequestClose={closeEditor}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Astronomic Info</Text>
              <TouchableOpacity onPress={closeEditor}>
                <Feather name="x" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              {/* SUN SIGN INPUT */}
              <View style={styles.sheetInputGroup}>
                <Text style={styles.sheetLabel}>Sun Sign</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  activeOpacity={0.8}
                  onPress={() => setZodiacSelectorType("sun")}
                >
                  <Text
                    style={
                      draftSunSign
                        ? styles.pickerValue
                        : styles.pickerPlaceholder
                    }
                  >
                    {draftSunSign || "Select Sun Sign"}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#888888" />
                </TouchableOpacity>
              </View>

              {/* MOON SIGN INPUT */}
              <View style={styles.sheetInputGroup}>
                <Text style={styles.sheetLabel}>Moon Sign</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  activeOpacity={0.8}
                  onPress={() => setZodiacSelectorType("moon")}
                >
                  <Text
                    style={
                      draftMoonSign
                        ? styles.pickerValue
                        : styles.pickerPlaceholder
                    }
                  >
                    {draftMoonSign || "Select Moon Sign"}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#888888" />
                </TouchableOpacity>
              </View>

              {/* TIME OF BIRTH INPUT */}
              <View style={styles.sheetInputGroup}>
                <Text style={styles.sheetLabel}>Time Of Birth</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  activeOpacity={0.8}
                  onPress={() => setIsTimePickerVisible(true)}
                >
                  <Text
                    style={
                      draftTimeOfBirth
                        ? styles.pickerValue
                        : styles.pickerPlaceholder
                    }
                  >
                    {draftTimeOfBirth || "Select Time Of Birth"}
                  </Text>
                  <Feather name="clock" size={18} color="#888888" />
                </TouchableOpacity>
              </View>

              {/* CITY OF BIRTH INPUT */}
              <View style={styles.sheetInputGroup}>
                <Text style={styles.sheetLabel}>City Of Birth</Text>
                <TextInput
                  style={styles.sheetInput}
                  value={draftCityOfBirth}
                  onChangeText={setDraftCityOfBirth}
                  placeholder="Enter city of birth"
                  placeholderTextColor="#999999"
                />
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={[
                  styles.sheetSaveButton,
                  saving && styles.sheetSaveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.sheetSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* REACT NATIVE COMMUNITY DATETIME PICKER */}
      {isTimePickerVisible && (
        <DateTimePicker
          value={selectedTimeDate}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}

      {/* ZODIAC SELECTOR MODAL */}
      <Modal
        visible={zodiacSelectorType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setZodiacSelectorType(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setZodiacSelectorType(null)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Select {zodiacSelectorType === "sun" ? "Sun" : "Moon"} Sign
            </Text>
            <ScrollView style={{ maxHeight: 280 }}>
              {ZODIAC_SIGNS.map((sign) => (
                <TouchableOpacity
                  key={sign}
                  style={styles.modalOption}
                  onPress={() => {
                    if (zodiacSelectorType === "sun") setDraftSunSign(sign);
                    else setDraftMoonSign(sign);
                    setZodiacSelectorType(null);
                  }}
                >
                  <Text style={styles.modalOptionText}>{sign}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9F9F9" },
  headerWrapper: { position: "relative" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  backButton: { marginRight: 15 },
  backButtonCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  headerWave: { marginTop: -2 },
  scrollContent: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 40 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  titleIconWrapper: { position: "relative", marginRight: 12 },
  titleIconPencil: { position: "absolute", bottom: -2, right: -2 },
  titleTextBlock: { flex: 1 },
  titleText: { fontSize: 18, fontWeight: "700", color: "#333333" },
  subtitleText: { fontSize: 12, color: "#666666" },
  loaderContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    backgroundColor: "#FFF0F2",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: { color: "#D7192E", fontSize: 13, textAlign: "center" },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#333333" },
  editRow: { flexDirection: "row", alignItems: "center" },
  sectionLink: {
    color: Colors.primaryRed || "#D7192E",
    fontSize: 13,
    fontWeight: "600",
  },
  gridContainer: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  gridTextContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#888888" },
  infoValue: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "600",
    marginTop: 2,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    padding: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#333333" },
  sheetBody: { marginBottom: 15 },
  sheetInputGroup: { marginBottom: 14 },
  sheetLabel: { fontSize: 12, color: "#666666", marginBottom: 6 },
  sheetInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333333",
  },
  pickerTrigger: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  pickerValue: { fontSize: 14, color: "#333333" },
  pickerPlaceholder: { fontSize: 14, color: "#999999" },
  sheetFooter: { paddingTop: 5 },
  sheetSaveButton: {
    backgroundColor: Colors.primaryRed || "#D7192E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  sheetSaveButtonDisabled: { opacity: 0.6 },
  sheetSaveText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 20 },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 15,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalOptionText: { fontSize: 15, color: "#444444" },
});
