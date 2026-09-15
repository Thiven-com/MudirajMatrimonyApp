import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

const getToken = async () =>
  (await AsyncStorage.getItem("access_token")) ||
  (await AsyncStorage.getItem("accessToken"));

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

const normalizeAddress = (response) => {
  const body = unwrap(response);

  console.log("NORMALIZE PRESENT ADDRESS BODY:", JSON.stringify(body, null, 2));

  // Expected response:
  // {
  //   "data": {
  //     "country": "India",
  //     "state": "Andaman and Nicobar Islands",
  //     "city": "Bombuflat",
  //     "postal_code": "515801"
  //   },
  //   "result": true
  // }

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
    console.log("NO PRESENT ADDRESS DATA FOUND");
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

  console.log(
    "NORMALIZED PRESENT ADDRESS:",
    JSON.stringify(normalized, null, 2),
  );

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

export default function PresentAddress() {
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
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(true);
  const [editing, setEditing] = useState(false);

  const loadMemberPresentAddress = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        setPresentAddress(null);
        return null;
      }

      const response = await getMemberPresentAddress(token);
      console.log(
        "PRESENT ADDRESS RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      const address = normalizeAddress(response);
      setPresentAddress(address);

      if (address) {
        setPresentAddressForm((prev) => ({
          ...prev,
          ...address,
        }));
      }

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

  const loadMemberCountries = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return [];

      setCountriesLoading(true);
      const response = await getMemberCountries(token);
      console.log("COUNTRIES RESPONSE:", JSON.stringify(response, null, 2));

      const list = getList(response, ["countries"]);
      const normalized = list
        .map((item) => normalizeOption(item, "country"))
        .filter(Boolean);

      setCountries(normalized);
      return normalized;
    } catch (error) {
      console.error("LOAD COUNTRIES ERROR:", error?.response?.data || error);
      setCountries([]);
      return [];
    } finally {
      setCountriesLoading(false);
    }
  }, []);

  const loadMemberStates = useCallback(async (countryId) => {
    if (!countryId) {
      setStates([]);
      setCities([]);
      return [];
    }

    try {
      const token = await getToken();
      if (!token) return [];

      setStatesLoading(true);
      const response = await getMemberStates(token, countryId);
      console.log(
        `STATES RESPONSE (${countryId}):`,
        JSON.stringify(response, null, 2),
      );

      const list = getList(response, ["states"]);
      const normalized = list
        .map((item) => normalizeOption(item, "state"))
        .filter(Boolean);

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

  const loadMemberCities = useCallback(async (stateId) => {
    const numericStateId = Number(stateId);

    if (!Number.isFinite(numericStateId) || numericStateId <= 0) {
      console.log("CITY LOAD SKIPPED - INVALID STATE ID:", stateId);
      setCities([]);
      return [];
    }

    try {
      const token = await getToken();

      if (!token) {
        console.log("CITY LOAD SKIPPED - TOKEN MISSING");
        setCities([]);
        return [];
      }

      setCitiesLoading(true);

      console.log("========================================");
      console.log("GET MEMBER CITIES");
      console.log("URL: /api/member/cities/" + numericStateId);
      console.log("STATE ID:", numericStateId);
      console.log("TOKEN EXISTS:", !!token);
      console.log("========================================");

      const response = await getMemberCities(token, numericStateId);

      console.log(
        "CITIES API FULL RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      const body = unwrap(response);

      // The Functions.js API is:
      // GET /api/member/cities/{state_id}
      // and returns response through getMethod().
      const rawList = Array.isArray(body)
        ? body
        : Array.isArray(body?.cities)
          ? body.cities
          : Array.isArray(body?.data?.cities)
            ? body.data.cities
            : Array.isArray(body?.data?.data)
              ? body.data.data
              : Array.isArray(body?.data)
                ? body.data
                : Array.isArray(body?.result)
                  ? body.result
                  : Array.isArray(body?.data?.result)
                    ? body.data.result
                    : getList(response, ["cities"]);

      console.log("RAW CITY COUNT:", rawList.length);

      const normalizedCities = rawList
        .map((item) => normalizeOption(item, "city"))
        .filter(Boolean);

      console.log("NORMALIZED CITY COUNT:", normalizedCities.length);
      console.log(
        "NORMALIZED CITIES:",
        JSON.stringify(normalizedCities, null, 2),
      );

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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      console.log("========================================");
      console.log("PRESENT ADDRESS SCREEN - INITIAL LOAD");
      console.log("========================================");

      await Promise.all([loadMemberPresentAddress(), loadMemberCountries()]);

      if (mounted) {
        setLoadingAddress(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [loadMemberPresentAddress, loadMemberCountries]);

  // When editing an existing address, load the dependent
  // state and city lists using the saved IDs.
  useEffect(() => {
    if (!editing) return;

    let active = true;

    const loadDependencies = async () => {
      const countryId = Number(presentAddressForm.country_id);
      const stateId = Number(presentAddressForm.state_id);

      if (Number.isFinite(countryId) && countryId > 0) {
        await loadMemberStates(countryId);
      } else {
        setStates([]);
      }

      if (active && Number.isFinite(stateId) && stateId > 0) {
        await loadMemberCities(stateId);
      } else if (active) {
        setCities([]);
      }
    };

    loadDependencies();

    return () => {
      active = false;
    };
  }, [
    editing,
    presentAddressForm.country_id,
    presentAddressForm.state_id,
    loadMemberStates,
    loadMemberCities,
  ]);

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

      // City endpoint requires the selected STATE ID.
      const loadedCities = await loadMemberCities(selectedStateId);

      console.log(
        "CITIES AFTER STATE SELECTION:",
        JSON.stringify(loadedCities, null, 2),
      );

      setAddressDropdown(null);
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

    if (type === "country" && countries.length === 0) {
      await loadMemberCountries();
    }

    if (type === "state") {
      await loadMemberStates(presentAddressForm.country_id);
    }

    if (type === "city") {
      const stateId = Number(presentAddressForm.state_id);

      if (!Number.isFinite(stateId) || stateId <= 0) {
        setAddressDropdown(null);
        Alert.alert("Select State", "Please select a valid state first.");
        return;
      }

      const loadedCities = await loadMemberCities(stateId);

      console.log(
        "CITY DROPDOWN OPENED:",
        JSON.stringify(loadedCities, null, 2),
      );
    }
  };

  const handleEdit = () => {
    if (presentAddress) {
      setPresentAddressForm({
        ...emptyAddress,
        ...presentAddress,
      });
    }
    setEditing(true);
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

  const handleSavePresentAddress = async () => {
    if (savingPresentAddress) return;

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

    console.log("========================================");
    console.log("UPDATE PRESENT ADDRESS REQUEST");
    console.log("TOKEN EXISTS:", !!token);
    console.log("REQUEST BODY:", JSON.stringify(body, null, 2));

    try {
      setSavingPresentAddress(true);

      const response = await updateMemberAddress(token, body);

      console.log(
        "UPDATE PRESENT ADDRESS RESPONSE:",
        JSON.stringify(response, null, 2),
      );

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

      console.log("UPDATED PRESENT ADDRESS:", JSON.stringify(updated, null, 2));
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
              <Ionicons name="close" size={22} color="#555" />
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
              <Ionicons name="location-outline" size={28} color="#BBBBBB" />

              <Text style={styles.emptyText}>
                No {addressDropdown || ""} found
              </Text>

              {addressDropdown === "city" && presentAddressForm.state_id ? (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => loadMemberCities(presentAddressForm.state_id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={15} color={COLORS.red} />
                  <Text style={styles.retryText}>Retry Cities</Text>
                </TouchableOpacity>
              ) : null}
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
                      <Ionicons name="checkmark" size={18} color={COLORS.red} />
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={COLORS.red} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Present Address</Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              Alert.alert(
                "Present Address",
                "Use Edit to change your present address.",
              )
            }
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={COLORS.red} />
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
                    <Ionicons
                      name="location-outline"
                      size={25}
                      color={COLORS.red}
                    />
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
                    <Ionicons
                      name="pencil-outline"
                      size={11}
                      color={COLORS.red}
                    />
                    <Text style={styles.editAddressText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.addNewAddress}
                  onPress={handleAddNew}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={18} color={COLORS.red} />
                  <Text style={styles.addNewAddressText}>Add New Address</Text>
                </TouchableOpacity>

                {!presentAddress && (
                  <View style={styles.noAddressHint}>
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#888888"
                    />
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
                    <Ionicons name="close" size={19} color={COLORS.red} />
                  </TouchableOpacity>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Address Type<Text style={styles.required}> *</Text>
                  </Text>

                  <View style={styles.addressTypeBox}>
                    <Text style={styles.addressTypeText}>Present Address</Text>
                    <Ionicons
                      name="location-outline"
                      size={17}
                      color={COLORS.red}
                    />
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

                    <Ionicons name="chevron-down" size={17} color="#888" />
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

                    <Ionicons
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

                    <Ionicons
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
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
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
                      savingPresentAddress && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSavePresentAddress}
                    activeOpacity={0.85}
                    disabled={savingPresentAddress}
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
    fontSize: 20,
    fontWeight: "600",
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
  initialLoader: {
    height: 4,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 13,
    lineHeight: 20,
    color: "#555555",
  },

  addressTypeSmall: {
    fontSize: 11,
    color: "#999999",
    marginBottom: 4,
    fontWeight: "500",
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
    fontSize: 12,
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
    fontSize: 16,
    color: "#333333",
    fontWeight: "700",
  },

  formSubtitle: {
    fontSize: 11,
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
    fontSize: 15,
    color: "#555555",
    fontWeight: "500",
  },
  addressLoadedText: {
    marginTop: 6,
    fontSize: 11,
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
    fontSize: 11,
    color: COLORS.red,
    fontWeight: "700",
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
    fontSize: 15,
    color: COLORS.red,
    fontWeight: "700",
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
    fontSize: 15,
    color: "#555555",
    fontWeight: "500",
    marginBottom: 8,
  },
  required: {
    color: COLORS.red,
    fontSize: 12,
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
    fontSize: 15,
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
    fontSize: 15,
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
    fontSize: 15,
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
    fontSize: 14,
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
    fontSize: 16,
    color: COLORS.red,
    fontWeight: "700",
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
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "700",
  },
  permanentInfo: {
    marginTop: 10,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  permanentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  permanentText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#666",
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
    fontSize: 18,
    fontWeight: "700",
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
    fontSize: 14,
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
    fontSize: 14,
    color: "#444",
  },
  selectedOptionText: {
    color: COLORS.red,
    fontWeight: "600",
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
    fontSize: 13,
    color: COLORS.red,
    fontWeight: "700",
  },

  loaderBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    color: "#666",
  },
  emptyBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
  },
});
