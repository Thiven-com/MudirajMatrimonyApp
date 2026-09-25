import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
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
import Feather from "react-native-vector-icons/Feather";
import Fonts from "../constants/Fonts";

import {
  getMemberCities,
  getMemberCountries,
  getMemberPresentAddress,
  getMemberStates,
  updateMemberAddress,
} from "../utils/Functions";

const COLORS = {
  background: "#F5F6F8",
  white: "#FFFFFF",
  text: "#333333",
  label: "#666666",
  placeholder: "#999999",
  border: "#E5E5E5",
  red: "#ED1B2F",
  lightRed: "#FFF0F2",
};

const emptyAddress = {
  country_id: "",
  state_id: "",
  city_id: "",
  country: "",
  state: "",
  city: "",
  postal_code: "",
  address: "",
};

const getToken = async () => {
  const token =
    (await AsyncStorage.getItem("authToken")) ||
    (await AsyncStorage.getItem("access_token")) ||
    (await AsyncStorage.getItem("accessToken")) ||
    (await AsyncStorage.getItem("token"));

  return token;
};

const unwrap = (response) => {
  // getMethod() returns the API JSON body directly.
  // Example:
  // { result: true, data: { country, state, city, postal_code } }
  return response ?? {};
};

const getList = (response, keys = []) => {
  const body = unwrap(response);

  const visited = new Set();

  const findArray = (value, depth = 0) => {
    if (value == null || depth > 6) return null;

    if (Array.isArray(value)) return value;
    if (typeof value !== "object") return null;
    if (visited.has(value)) return null;

    visited.add(value);

    // Requested keys first.
    for (const key of keys) {
      if (Array.isArray(value?.[key])) {
        return value[key];
      }
    }

    // Common API/Laravel response keys.
    for (const key of [
      "data",
      "result",
      "results",
      "items",
      "list",
      "countries",
      "states",
      "cities",
    ]) {
      if (Array.isArray(value?.[key])) {
        return value[key];
      }
    }

    // Search nested objects.
    for (const child of Object.values(value)) {
      const found = findArray(child, depth + 1);
      if (found) return found;
    }

    return null;
  };

  return findArray(body) || [];
};

const normalizeOption = (item, type) => {
  if (item == null) return null;

  const id =
    typeof item === "object"
      ? (item.id ?? item[`${type}_id`] ?? item[`${type}Id`] ?? item.value)
      : item;

  const name =
    typeof item === "object"
      ? (item.name ??
        item[`${type}_name`] ??
        item[`${type}Name`] ??
        item.label ??
        item.title ??
        item.city_name ??
        item.cityName ??
        item.state_name ??
        item.stateName ??
        item.country_name ??
        item.countryName)
      : item;

  if (id == null || String(id).trim() === "" || !String(name || "").trim()) {
    return null;
  }

  return {
    ...(typeof item === "object" ? item : {}),
    id: String(id),
    name: String(name).trim(),
  };
};

/*
 * One shared parser for countries / states / cities.
 * Handles: [..]  |  { data: [..] }  |  { data: { states: [..] } }
 *          { result: [..] }  |  { data: { data: [..] } }  | etc.
 *
 * FIX: loadMemberStates used to read only
 *   response.data.states || response.states || response.data
 * so any other response shape (data.data, result, ...) gave an empty list.
 */
const extractOptions = (response, type) => {
  const plural = type === "city" ? "cities" : `${type}s`;

  const body = unwrap(response);

  const raw = Array.isArray(body) ? body : getList(body, [plural]);

  return raw.map((item) => normalizeOption(item, type)).filter(Boolean);
};

const findByName = (list, name) => {
  const target = String(name || "")
    .trim()
    .toLowerCase();

  if (!target) return null;

  return (
    (list || []).find((item) => item.name.toLowerCase() === target) || null
  );
};

const normalizeAddress = (response) => {
  const body = unwrap(response);

  let address = null;

  if (
    body?.data &&
    typeof body.data === "object" &&
    !Array.isArray(body.data)
  ) {
    address = body.data;
  }

  if (!address && body?.address) {
    address = body.address;
  }

  if (!address && body?.data?.address) {
    address = body.data.address;
  }

  if (!address && body?.data?.data) {
    address = body.data.data;
  }

  // Also support an address object returned directly.
  if (
    !address &&
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    (body.country ||
      body.state ||
      body.city ||
      body.country_id ||
      body.state_id ||
      body.city_id ||
      body.postal_code)
  ) {
    address = body;
  }

  if (!address || typeof address !== "object" || Array.isArray(address)) {

    return null;
  }

  const country =
    typeof address.country === "object"
      ? String(
        address.country?.name ?? address.country?.country_name ?? "",
      ).trim()
      : String(address.country ?? "").trim();

  const state =
    typeof address.state === "object"
      ? String(address.state?.name ?? address.state?.state_name ?? "").trim()
      : String(address.state ?? "").trim();

  const city =
    typeof address.city === "object"
      ? String(address.city?.name ?? address.city?.city_name ?? "").trim()
      : String(address.city ?? "").trim();

  const normalized = {
    country_id: String(
      address.country_id ?? address.country?.id ?? address.countryId ?? "",
    ),

    state_id: String(
      address.state_id ?? address.state?.id ?? address.stateId ?? "",
    ),

    city_id: String(
      address.city_id ?? address.city?.id ?? address.cityId ?? "",
    ),

    country,
    state,
    city,

    postal_code: String(
      address.postal_code ?? address.postalCode ?? address.pincode ?? "",
    ).trim(),

    address: String(
      address.address ??
      address.full_address ??
      address.fullAddress ??
      address.address_line ??
      address.addressLine ??
      "",
    ).trim(),
  };

  return normalized;
};

const isSuccess = (response) => {
  const body = unwrap(response);
  return (
    body?.result === true ||
    body?.result === 1 ||
    body?.success === true ||
    body?.success === 1 ||
    body?.status === true ||
    body?.status === 200 ||
    response?.status === 200
  );
};

const apiMessage = (response, fallback) => {
  const body = unwrap(response);
  return (
    body?.message || body?.msg || response?.message || response?.msg || fallback
  );
};

export default function PresentAddress({ navigation, route }) {

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
      return true;
    }
    return false;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack,
      );

      return () => subscription.remove();
    }, [handleBack]),
  );

  const [presentAddress, setPresentAddress] = useState(null);
  const [presentAddressForm, setPresentAddressForm] = useState(emptyAddress);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [addressDropdown, setAddressDropdown] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [countriesLoading, setCountriesLoading] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [savingPresentAddress, setSavingPresentAddress] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(true);
  const [editing, setEditing] = useState(false);

  /* ===
       LOAD SAVED PRESENT ADDRESS
    === */

  const loadMemberPresentAddress = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setPresentAddress(null);
        return null;
      }

      const response = await getMemberPresentAddress(token);

      const address = normalizeAddress(response);
      setPresentAddress(address);

      return address;
    } catch (error) {
      console.error(
        "LOAD PRESENT ADDRESS ERROR:",
        error?.response?.data || error,
      );
      setPresentAddress(null);
      return null;
    }
  }, []);

  /* ===
       LOAD COUNTRIES
    === */

  const loadMemberCountries = useCallback(async () => {
    try {
      const token = await getToken();

      if (!token) {
        return [];
      }

      setCountriesLoading(true);

      const response = await getMemberCountries(token);

      const normalized = extractOptions(response, "country");

      setCountries(normalized);

      return normalized;
    } catch (error) {
      console.error(
        "LOAD COUNTRIES ERROR:",
        error?.response?.data || error?.message || error,
      );

      setCountries([]);
      return [];
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  /* ===
       LOAD STATES  (needs country id)
    === */

  const loadMemberStates = useCallback(async (countryId) => {
    if (!countryId) {
      setStates([]);
      return [];
    }

    try {
      setStatesLoading(true);

      const token = await getToken();

      if (!token) {
        setStates([]);
        return [];
      }

      const response = await getMemberStates(token, countryId);

      const normalized = extractOptions(response, "state");

      setStates(normalized);

      return normalized;
    } catch (error) {
      console.error("LOAD STATES ERROR:", error?.response?.data || error);

      setStates([]);
      return [];
    } finally {
      setStatesLoading(false);
    }
  }, []);

  /* ===
       LOAD CITIES  (needs STATE id)
    === */

  const loadMemberCities = useCallback(async (stateId) => {
    const numericStateId = Number(stateId);

    if (!Number.isFinite(numericStateId) || numericStateId <= 0) {
      setCities([]);
      return [];
    }

    try {
      const token = await getToken();

      if (!token) {
        setCities([]);
        return [];
      }

      setCitiesLoading(true);

      const response = await getMemberCities(token, numericStateId);

      const normalizedCities = extractOptions(response, "city");

      setCities(normalizedCities);

      return normalizedCities;
    } catch (error) {
      console.error("LOAD CITIES ERROR:", error?.response?.data || error);

      setCities([]);
      return [];
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  /* ===
       INITIAL LOAD
    === */

  useEffect(() => {
    loadMemberPresentAddress();
    loadMemberCountries();
  }, [loadMemberPresentAddress, loadMemberCountries]);

  /*
   * FIX: the old "load states/cities when editing" effect depended on
   * country_id / state_id. But the saved-address API returns NAMES only,
   * so those IDs were always "" -> nothing was ever loaded, and the State
   * / City dropdowns kept saying "Please select country first".
   *
   * resolveAddressIds() looks the IDs up from the names, loads the
   * state / city lists, and hands back a form that has real IDs.
   */
  const resolveAddressIds = async (address) => {
    const resolved = { ...address };

    /* ---------- COUNTRY ---------- */

    if (!resolved.country_id && resolved.country) {
      let countryList = countries;

      if (countryList.length === 0) {
        countryList = await loadMemberCountries();
      }

      const match = findByName(countryList, resolved.country);

      if (match) {
        resolved.country_id = match.id;
        resolved.country = match.name;
      } else {

      }
    }

    /* ---------- STATE ---------- */

    if (resolved.country_id) {
      const stateList = await loadMemberStates(resolved.country_id);

      if (!resolved.state_id && resolved.state) {
        const match = findByName(stateList, resolved.state);

        if (match) {
          resolved.state_id = match.id;
          resolved.state = match.name;
        } else {

        }
      }
    }

    /* ---------- CITY ---------- */

    if (resolved.state_id) {
      const cityList = await loadMemberCities(resolved.state_id);

      if (!resolved.city_id && resolved.city) {
        const match = findByName(cityList, resolved.city);

        if (match) {
          resolved.city_id = match.id;
          resolved.city = match.name;
        } else {
        }
      }
    }

    return resolved;
  };

  /* ===
       DROPDOWNS
    === */

  const selectAddressOption = async (option) => {
    if (!option || !addressDropdown) return;

    if (addressDropdown === "country") {
      setPresentAddressForm((prev) => ({
        ...prev,
        country_id: String(option.id),
        country: option.name,
        state_id: "",
        state: "",
        city_id: "",
        city: "",
      }));
      setStates([]);
      setCities([]);
      setAddressDropdown(null);
      await loadMemberStates(option.id);
      return;
    }

    if (addressDropdown === "state") {
      const selectedStateId = String(option.id);

      setPresentAddressForm((prev) => ({
        ...prev,
        state_id: selectedStateId,
        state: option.name,
        city_id: "",
        city: "",
      }));

      setCities([]);
      setAddressDropdown(null);

      // City endpoint requires the selected STATE ID.
      await loadMemberCities(selectedStateId);
      return;
    }

    setPresentAddressForm((prev) => ({
      ...prev,
      city_id: String(option.id),
      city: option.name,
    }));
    setAddressDropdown(null);
  };

  const openDropdown = async (type) => {
    if (type === "state" && !presentAddressForm.country_id) {
      Alert.alert("Select Country", "Please select country first.");
      return;
    }

    if (type === "city" && !presentAddressForm.state_id) {
      Alert.alert("Select State", "Please select state first.");
      return;
    }

    setSearchText("");
    setAddressDropdown(type);

    // Only fetch when the list is empty (it is already loaded otherwise).
    if (type === "country" && countries.length === 0) {
      await loadMemberCountries();
    }

    if (type === "state" && states.length === 0) {
      await loadMemberStates(presentAddressForm.country_id);
    }

    if (type === "city" && cities.length === 0) {
      await loadMemberCities(presentAddressForm.state_id);
    }
  };

  const retryDropdown = () => {
    if (addressDropdown === "country") {
      loadMemberCountries();
    } else if (addressDropdown === "state") {
      loadMemberStates(presentAddressForm.country_id);
    } else if (addressDropdown === "city") {
      loadMemberCities(presentAddressForm.state_id);
    }
  };

  /* ===
       EDIT / ADD / CANCEL
    === */

  const handleEdit = async () => {
    const base = {
      ...emptyAddress,
      ...(presentAddress || {}),
    };

    setPresentAddressForm(base);
    setEditing(true);

    if (!presentAddress) return;

    try {
      setResolvingAddress(true);

      const resolved = await resolveAddressIds(base);

      setPresentAddressForm(resolved);
    } catch (error) {
      console.error("RESOLVE ADDRESS IDS ERROR:", error);
    } finally {
      setResolvingAddress(false);
    }
  };

  const handleAddNew = () => {
    setPresentAddressForm({ ...emptyAddress });
    setStates([]);
    setCities([]);
    setEditing(true);
  };

  const handleCancel = () => {
    if (presentAddress) {
      setPresentAddressForm({
        ...emptyAddress,
        ...presentAddress,
      });
    } else {
      setPresentAddressForm({ ...emptyAddress });
    }
    setEditing(false);
    setAddressDropdown(null);
  };

  /* ===
       SAVE
    === */

  const handleSavePresentAddress = async () => {
    if (savingPresentAddress || resolvingAddress) return;

    const token = await getToken();

    if (!token) {
      Alert.alert(
        "Login Required",
        "Access token is missing. Please login again.",
      );
      return;
    }

    const countryId = Number(presentAddressForm.country_id);
    const stateId = Number(presentAddressForm.state_id);
    const cityId = Number(presentAddressForm.city_id);
    const postalCode = String(presentAddressForm.postal_code || "").trim();

    if (!Number.isInteger(countryId) || countryId <= 0) {
      Alert.alert("Missing Country", "Please select a valid country.");
      return;
    }
    if (!Number.isInteger(stateId) || stateId <= 0) {
      Alert.alert("Missing State", "Please select a valid state.");
      return;
    }
    if (!Number.isInteger(cityId) || cityId <= 0) {
      Alert.alert("Missing City", "Please select a valid city.");
      return;
    }
    if (!postalCode) {
      Alert.alert("Missing Postal Code", "Please enter postal code.");
      return;
    }

    // This matches the documented address-update fields used by this screen.
    const body = {
      country_id: countryId,
      state_id: stateId,
      city_id: cityId,
      postal_code: postalCode,
      address_type: "present",
    };

    try {
      setSavingPresentAddress(true);

      const response = await updateMemberAddress(token, body);

      if (!isSuccess(response)) {
        Alert.alert(
          "Update Failed",
          apiMessage(response, "Unable to update present address."),
        );
        return;
      }

      const updated = await loadMemberPresentAddress();

      setEditing(false);
      setAddressDropdown(null);

      Alert.alert(
        "Success",
        apiMessage(response, "Present address updated successfully."),
      );

    } catch (error) {
      console.error(
        "UPDATE PRESENT ADDRESS ERROR:",
        error?.response?.data || error,
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        "Something went wrong while updating present address.",
      );
    } finally {
      setSavingPresentAddress(false);
    }
  };

  /* ===
       DERIVED
    === */

  const currentAddressText = useMemo(() => {
    if (!presentAddress) return "No present address saved.";

    const parts = [
      presentAddress.address,
      presentAddress.city,
      presentAddress.state,
      presentAddress.country,
      presentAddress.postal_code,
    ].filter(Boolean);

    return parts.length ? parts.join(", ") : "Present address saved";
  }, [presentAddress]);

  const displayList = useMemo(() => {
    const list =
      addressDropdown === "country"
        ? countries
        : addressDropdown === "state"
          ? states
          : cities;

    const query = searchText.trim().toLowerCase();

    if (!query) return list;

    return list.filter((item) => item.name.toLowerCase().includes(query));
  }, [addressDropdown, countries, states, cities, searchText]);

  const dropdownTitle =
    addressDropdown === "country"
      ? "Select Country"
      : addressDropdown === "state"
        ? "Select State"
        : "Select City";

  const dropdownLoading =
    addressDropdown === "country"
      ? countriesLoading
      : addressDropdown === "state"
        ? statesLoading
        : citiesLoading;

  /* ===
       DROPDOWN MODAL
    === */

  const renderDropdown = () => (
    <Modal
      visible={!!addressDropdown}
      transparent
      animationType="fade"
      onRequestClose={() => setAddressDropdown(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{dropdownTitle}</Text>
            <TouchableOpacity
              onPress={() => setAddressDropdown(null)}
              style={styles.closeButton}
            >
              <Feather name="x" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={`Search ${addressDropdown || ""}`}
            placeholderTextColor={COLORS.placeholder}
          />

          {dropdownLoading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="small" color={COLORS.red} />
              <Text style={styles.loaderText}>Loading...</Text>
            </View>
          ) : displayList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="map-pin" size={28} color="#BBBBBB" />

              <Text style={styles.emptyText}>
                No {addressDropdown || ""} found
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryDropdown}
                activeOpacity={0.8}
              >
                <Feather name="refresh-cw" size={15} color={COLORS.red} />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.optionList}
            >
              {displayList.map((item) => {
                const selected =
                  (addressDropdown === "country" &&
                    String(item.id) ===
                    String(presentAddressForm.country_id)) ||
                  (addressDropdown === "state" &&
                    String(item.id) === String(presentAddressForm.state_id)) ||
                  (addressDropdown === "city" &&
                    String(item.id) === String(presentAddressForm.city_id));

                return (
                  <TouchableOpacity
                    key={`${addressDropdown}-${item.id}`}
                    style={[
                      styles.optionRow,
                      selected && styles.selectedOption,
                    ]}
                    onPress={() => selectAddressOption(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.selectedOptionText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selected && (
                      <Feather name="check" size={18} color={COLORS.red} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  /* ===
       UI
    === */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={18} color={COLORS.red} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Present Address</Text>

          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
          >
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* SAVED PRESENT ADDRESS */}
            {!editing ? (
              <>
                <View style={styles.currentAddressCard}>
                  <View style={styles.locationIcon}>
                    <Feather name="map-pin" size={25} color={COLORS.red} />
                  </View>

                  <View style={styles.currentAddressDetails}>
                    <Text style={styles.addressTypeSmall}>Present Address</Text>

                    <Text style={styles.currentAddressText} numberOfLines={6}>
                      {currentAddressText}
                    </Text>

                    <Text style={styles.addressLoadedText}>
                      {presentAddress
                        ? "Present address loaded from API"
                        : "No present address saved"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.editAddressButton}
                    onPress={handleEdit}
                    activeOpacity={0.7}
                  >
                    <Feather name="edit-2" size={11} color={COLORS.red} />
                    <Text style={styles.editAddressText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.addNewAddress}
                  onPress={handleAddNew}
                  activeOpacity={0.8}
                >
                  <Feather name="plus" size={18} color={COLORS.red} />
                  <Text style={styles.addNewAddressText}>Add New Address</Text>
                </TouchableOpacity>

                {!presentAddress && (
                  <View style={styles.noAddressHint}>
                    <Feather name="info" size={18} color="#888888" />
                    <Text style={styles.noAddressHintText}>
                      Add your present address to display it here.
                    </Text>
                  </View>
                )}
              </>
            ) : (
              /* ADD / EDIT ADDRESS FORM */
              <View style={styles.formContainer}>
                <View style={styles.formHeader}>
                  <View>
                    <Text style={styles.formTitle}>
                      {presentAddress
                        ? "Edit Present Address"
                        : "Add Present Address"}
                    </Text>
                    <Text style={styles.formSubtitle}>
                      Enter your current address details
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.formCloseButton}
                    onPress={handleCancel}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={19} color={COLORS.red} />
                  </TouchableOpacity>
                </View>

                {resolvingAddress && (
                  <View style={styles.resolvingRow}>
                    <ActivityIndicator size="small" color={COLORS.red} />
                    <Text style={styles.resolvingText}>
                      Loading state and city details...
                    </Text>
                  </View>
                )}

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Address Type<Text style={styles.required}> *</Text>
                  </Text>

                  <View style={styles.addressTypeBox}>
                    <Text style={styles.addressTypeText}>Present Address</Text>
                    <Feather name="map-pin" size={17} color={COLORS.red} />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Country<Text style={styles.required}> *</Text>
                  </Text>

                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => openDropdown("country")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !presentAddressForm.country && styles.placeholderText,
                      ]}
                      numberOfLines={1}
                    >
                      {presentAddressForm.country || "Select Country"}
                    </Text>

                    <Feather name="chevron-down" size={17} color="#888" />
                  </TouchableOpacity>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    State<Text style={styles.required}> *</Text>
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      !presentAddressForm.country_id && styles.dropdownDisabled,
                    ]}
                    onPress={() => openDropdown("state")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !presentAddressForm.state && styles.placeholderText,
                      ]}
                      numberOfLines={1}
                    >
                      {presentAddressForm.state || "Select State"}
                    </Text>

                    <Feather
                      name="chevron-down"
                      size={17}
                      color={presentAddressForm.country_id ? "#888" : "#BBBBBB"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    City<Text style={styles.required}> *</Text>
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.dropdown,
                      !presentAddressForm.state_id && styles.dropdownDisabled,
                    ]}
                    onPress={() => openDropdown("city")}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownText,
                        !presentAddressForm.city && styles.placeholderText,
                      ]}
                      numberOfLines={1}
                    >
                      {presentAddressForm.city || "Select City"}
                    </Text>

                    <Feather
                      name="chevron-down"
                      size={17}
                      color={presentAddressForm.state_id ? "#888" : "#BBBBBB"}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Postal Code<Text style={styles.required}> *</Text>
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={presentAddressForm.postal_code}
                    onChangeText={(text) =>
                      setPresentAddressForm((prev) => ({
                        ...prev,
                        postal_code: text.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    keyboardType="number-pad"
                    maxLength={10}
                    placeholder="Enter postal code"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={styles.fieldAddress}>
                  <Text style={styles.label}>Address</Text>

                  <TextInput
                    style={styles.addressInput}
                    multiline
                    textAlignVertical="top"
                    value={presentAddressForm.address}
                    onChangeText={(text) =>
                      setPresentAddressForm((prev) => ({
                        ...prev,
                        address: text,
                      }))
                    }
                    placeholder="Enter address"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <TouchableOpacity
                  style={styles.defaultRow}
                  onPress={() => setDefaultAddress((v) => !v)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      !defaultAddress && styles.checkboxOff,
                    ]}
                  >
                    {defaultAddress && (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>

                  <Text style={styles.defaultText}>Set as default address</Text>
                </TouchableOpacity>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    activeOpacity={0.8}
                    disabled={savingPresentAddress}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      (savingPresentAddress || resolvingAddress) &&
                      styles.saveButtonDisabled,
                    ]}
                    onPress={handleSavePresentAddress}
                    activeOpacity={0.85}
                    disabled={savingPresentAddress || resolvingAddress}
                  >
                    {savingPresentAddress ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {presentAddress ? "Update Address" : "Save Address"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {renderDropdown()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 4,
  },
  header: {
    height: 58,
    width: "100%",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  backButton: {
    position: "absolute",
    left: 4,
    top: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.semiBold,
    color: "#222222",
    textAlign: "center",
  },
  menuButton: {
    position: "absolute",
    right: 4,
    top: 8,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#E6E6E6",
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    overflow: "hidden",
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 20,
  },
  currentAddressCard: {
    width: "100%",
    minHeight: 105,
    backgroundColor: "#FFFCFC",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  locationIcon: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  currentAddressDetails: {
    flex: 1,
    paddingRight: 7,
  },
  currentAddressText: {
    fontSize: Fonts.size.md,
    lineHeight: 20,
    color: "#555555",
  },

  addressTypeSmall: {
    fontSize: Fonts.size.sm,
    color: "#999999",
    marginBottom: 4,
    fontFamily: Fonts.medium,
  },

  noAddressHint: {
    width: "100%",
    minHeight: 48,
    borderRadius: 6,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 14,
  },

  noAddressHintText: {
    flex: 1,
    fontSize: Fonts.size.sm,
    color: "#777777",
    marginLeft: 7,
    lineHeight: 17,
  },

  formContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 5,
    marginTop: 10,
  },

  formHeader: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  formTitle: {
    fontSize: Fonts.size.base,
    color: "#333333",
    fontFamily: Fonts.bold,
  },

  formSubtitle: {
    fontSize: Fonts.size.sm,
    color: "#999999",
    marginTop: 3,
  },

  formCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF0F2",
    alignItems: "center",
    justifyContent: "center",
  },

  resolvingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 6,
  },

  resolvingText: {
    marginLeft: 8,
    fontSize: Fonts.size.sm,
    color: "#777777",
  },

  addressTypeBox: {
    width: "100%",
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 4,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  addressTypeText: {
    fontSize: Fonts.size.md,
    color: "#555555",
    fontFamily: Fonts.medium,
  },
  addressLoadedText: {
    marginTop: 6,
    fontSize: Fonts.size.sm,
    color: "#777777",
  },

  editAddressButton: {
    height: 28,
    minWidth: 48,
    borderRadius: 8,
    backgroundColor: COLORS.lightRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  editAddressText: {
    fontSize: Fonts.size.sm,
    color: COLORS.red,
    fontFamily: Fonts.bold,
    marginLeft: 3,
  },
  addNewAddress: {
    minHeight: 53,
    width: "100%",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 5,
    backgroundColor: "#FFFCFC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  addNewAddressText: {
    fontSize: Fonts.size.md,
    color: COLORS.red,
    fontFamily: Fonts.bold,
    marginLeft: 5,
  },
  field: {
    width: "100%",
    marginBottom: 20,
  },
  fieldAddress: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: Fonts.size.md,
    color: "#555555",
    fontFamily: Fonts.medium,
    marginBottom: 8,
  },
  required: {
    color: COLORS.red,
    fontSize: Fonts.size.sm,
  },
  dropdown: {
    width: "100%",
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownDisabled: {
    width: "100%",
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 4,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    flex: 1,
    fontSize: Fonts.size.md,
    color: "#555555",
  },
  placeholderText: {
    color: COLORS.placeholder,
  },
  input: {
    width: "100%",
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 0,
    fontSize: Fonts.size.md,
    color: "#555555",
  },
  addressInput: {
    width: "100%",
    height: 80,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: Fonts.size.md,
    color: "#555555",
  },
  defaultRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  checkboxOff: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  defaultText: {
    fontSize: Fonts.size.md,
    color: "#2E2B2B",
  },
  buttonRow: {
    width: "100%",
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelButton: {
    width: "39%",
    height: 44,
    borderRadius: 4,
    backgroundColor: "#FFF0F2",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: Fonts.size.base,
    color: COLORS.red,
    fontFamily: Fonts.bold,
  },
  saveButton: {
    width: "49%",
    height: 44,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    fontSize: Fonts.size.base,
    color: COLORS.white,
    fontFamily: Fonts.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    maxHeight: "78%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
    color: "#222",
  },
  closeButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInput: {
    height: 42,
    margin: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 7,
    color: "#333",
    fontSize: Fonts.size.md,
  },
  optionList: {
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  optionRow: {
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  selectedOption: {
    backgroundColor: "#FFF4F5",
  },
  optionText: {
    flex: 1,
    fontSize: Fonts.size.md,
    color: "#444",
  },
  selectedOptionText: {
    color: COLORS.red,
    fontFamily: Fonts.semiBold,
  },
  retryButton: {
    marginTop: 12,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 7,
    backgroundColor: "#FFF0F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    marginLeft: 6,
    fontSize: Fonts.size.md,
    color: COLORS.red,
    fontFamily: Fonts.bold,
  },

  loaderBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  loaderText: {
    fontSize: Fonts.size.md,
    color: "#666",
  },
  emptyBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: Fonts.size.md,
    color: "#888",
  },
});
