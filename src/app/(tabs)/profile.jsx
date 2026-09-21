import { useEffect, useState } from "react";

import {
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import {
  getMemberBasicInfo,
  getMemberCities,
  getMemberCountries,
  getMemberIntroduction,
  getMemberPermanentAddress,
  getMemberPresentAddress,
  getMemberStates,
  getProfileDetails,
  updateMemberAddress,
  updateMemberBasicInfo,
  updateMemberIntroduction
} from "../../utils/Functions";

/* =========================================================
   RESPONSIVE WIDTH
========================================================= */

const { width } = Dimensions.get("window");

const BASE_WIDTH = 390;

const scale = (size) => {
  const factor = width / BASE_WIDTH;
  return Math.round(size * Math.min(factor, 1.12));
};

const COLORS = {
  background: "#F7F7F8",
  white: "#FFFFFF",
  red: "#A81E25",
  redDark: "#790A10",
  redDeep: "#66070B",
  redButton: "#C91E26",
  gold: "#E6A51B",
  goldLight: "#FFD46A",
  text: "#292929",
  textSecondary: "#515151",
  border: "#EAE3E1",
  green: "#1DB36C",
  pink: "#E83E6D",
  purple: "#8337B9",
  blue: "#2C84D6",
};


/* =========================================================
   PROFILE FALLBACK DATA
========================================================= */

const PROFILE = {
  name: "Priyanka",
  age: "25",
  profession: "Software Engineer",
  location: "Hyderabad, Telangana, India",
  image: require("../../../assets/images/Match6.png"),

  about:
    "I am a simple, ambitious and family oriented person. I love traveling, listening to music and spending time with family and friends.",

  personal: [
    {
      icon: "calendar-outline",
      label: "Date of Birth",
      value: "15 May 1999",
      color: "#C33B3B",
    },
    {
      icon: "restaurant-outline",
      label: "Eating Habits",
      value: "Vegetarian",
      color: "#4B9A62",
    },
    {
      icon: "resize-outline",
      label: "Height",
      value: `5' 7" (170 cm)`,
      color: "#3E9860",
    },
    {
      icon: "body-outline",
      label: "Body Type",
      value: "Average",
      color: "#D89324",
    },
    {
      icon: "flower-outline",
      label: "Religion",
      value: "Hindu",
      color: "#D68B18",
    },
    {
      icon: "color-filter-outline",
      label: "Complexion",
      value: "Wheatish",
      color: "#5C83DB",
    },
    {
      icon: "people-outline",
      label: "Caste",
      value: "Kamma",
      color: "#5477CC",
    },
    {
      icon: "water-outline",
      label: "Blood Group",
      value: "B+",
      color: "#D55D5D",
    },
    {
      icon: "language-outline",
      label: "Mother Tongue",
      value: "Telugu",
      color: "#5B83C9",
    },
    {
      icon: "sparkles-outline",
      label: "Manglik",
      value: "Non Manglik",
      color: "#A65BC1",
    },
    {
      icon: "heart-outline",
      label: "Marital Status",
      value: "Never Married",
      color: "#D95662",
    },
    {
      icon: "accessibility-outline",
      label: "Disability",
      value: "No",
      color: "#3F82BE",
    },
  ],

  education: [
    ["Education", "B.Tech / Computer Science"],
    ["Profession", "Software Engineer"],
    ["Company", "TCS"],
    ["Annual Income", "₹12 - 15 LPA"],
  ],

  family: [
    {
      icon: "person-outline",
      label: "Father's Name",
      value: "Ramesh Kumar",
      color: "#C63A42",
    },
    {
      icon: "people-outline",
      label: "Siblings",
      value: "1 Brother (Younger)",
      color: "#B35CB3",
    },
    {
      icon: "briefcase-outline",
      label: "Father's Occupation",
      value: "Business",
      color: "#D1673C",
    },
    {
      icon: "home-outline",
      label: "Family Type",
      value: "Nuclear Family",
      color: "#5EAE73",
    },
    {
      icon: "person-outline",
      label: "Mother's Name",
      value: "Lakshmi Devi",
      color: "#4987C9",
    },
    {
      icon: "ribbon-outline",
      label: "Family Status",
      value: "Upper Middle Class",
      color: "#D25C48",
    },
  ],
};


/* =========================================================
   SECTION HEADER
========================================================= */

const SectionHeader = ({
  icon,
  title,
  showViewAll = false,
}) => {
  return (
    <View style={styles.sectionHeader}>

      <View style={styles.sectionTitleRow}>

        <View style={styles.sectionTitleIcon}>
          <Ionicons
            name={icon}
            size={scale(22)}
            color={COLORS.red}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>

      </View>

      {showViewAll && (
        <TouchableOpacity
          style={styles.viewAllButton}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              title,
              `Opening all ${title}`
            )
          }
        >
          <Text style={styles.viewAllText}>
            View All
          </Text>

          <Ionicons
            name="chevron-forward"
            size={scale(16)}
            color={COLORS.red}
          />
        </TouchableOpacity>
      )}

    </View>
  );
};


/* =========================================================
   PERSONAL ITEM
========================================================= */

const PersonalItem = ({ item }) => {
  return (
    <View style={styles.personalItem}>

      <View
        style={[
          styles.personalIcon,
          {
            backgroundColor: `${item.color}18`,
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={scale(19)}
          color={item.color}
        />
      </View>

      <View style={styles.personalTextContainer}>

        <Text
          style={styles.personalLabel}
          numberOfLines={2}
        >
          {item.label}
        </Text>

        <Text
          style={styles.personalValue}
          numberOfLines={2}
        >
          {item.value}
        </Text>

      </View>

    </View>
  );
};


/* =========================================================
   FAMILY ITEM
========================================================= */

const FamilyItem = ({ item }) => {
  return (
    <View style={styles.familyItem}>

      <View
        style={[
          styles.familyIcon,
          {
            backgroundColor: `${item.color}18`,
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={scale(19)}
          color={item.color}
        />
      </View>

      <View style={styles.familyTextContainer}>

        <Text
          style={styles.familyLabel}
          numberOfLines={2}
        >
          {item.label}
        </Text>

        <Text
          style={styles.familyValue}
          numberOfLines={2}
        >
          {item.value}
        </Text>

      </View>

    </View>
  );
};


/* =========================================================
   MAIN SCREEN
========================================================= */

export default function ProfileDetails() {

  const Logout = async () => {
    await AsyncStorage.multiRemove([
      "access_token",
      "accessToken",
    ]);
    router.replace("/login");
  };

  const [liked, setLiked] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);

  const [profileData, setProfileData] = useState(null);

  const [introduction, setIntroduction] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [savingAbout, setSavingAbout] =
    useState(false);

  const [editingAbout, setEditingAbout] =
    useState(false);

  const [aboutTextValue, setAboutTextValue] =
    useState("");

  /* =====================================================
     PRESENT / PERMANENT ADDRESS
  ===================================================== */

  const [presentAddress, setPresentAddress] =
    useState(null);

  const [permanentAddress, setPermanentAddress] =
    useState(null);

  const [savingPresentAddress, setSavingPresentAddress] =
    useState(false);

  const [presentAddressForm, setPresentAddressForm] = useState({
    country_id: "",
    state_id: "",
    city_id: "",
    country: "",
    state: "",
    city: "",
    postal_code: "",
  });

  const [addressDropdown, setAddressDropdown] = useState(null);

  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] =
    useState(false);

  const [states, setStates] = useState([]);

  const [statesLoading, setStatesLoading] =
    useState(false);

  const [cities, setCities] = useState([]);

  const [citiesLoading, setCitiesLoading] =
    useState(false);





  /* =====================================================
     BASIC INFORMATION
  ===================================================== */

  const [basicInfo, setBasicInfo] =
    useState({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      gender: 0,
      on_behalf: 0,
      date_of_birth: "",
      marital_status: 0,
      children: 0,
    });


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    loadProfileDetails();
    loadMemberIntroduction();
    loadMemberBasicInfo();
    loadMemberPresentAddress();
    loadMemberPermanentAddress();
    loadMemberCountries();

  }, []);


  useEffect(() => {
    if (!presentAddress) return;

    setPresentAddressForm({
      country_id: presentAddress.country_id ?? "",
      state_id: presentAddress.state_id ?? "",
      city_id: presentAddress.city_id ?? "",
      country: presentAddress.country || "",
      state: presentAddress.state || "",
      city: presentAddress.city || "",
      postal_code: presentAddress.postal_code || "",
    });
  }, [presentAddress]);


  useEffect(() => {

    const countryId =
      presentAddressForm.country_id;

    if (!countryId) {
      setStates([]);
      return;
    }

    loadMemberStates(countryId);

  }, [presentAddressForm.country_id]);



  useEffect(() => {

    const stateId =
      presentAddressForm.state_id;

    if (!stateId) {
      setCities([]);
      return;
    }

    loadMemberCities(stateId);

  }, [presentAddressForm.state_id]);


  const currentOption = (type) => {

    /* =========================
       COUNTRY
    ========================= */

    if (type === "country") {
      return countries;
    }

    /* =========================
       STATE
    ========================= */

    if (type === "state") {
      return states;
    }

    /* =========================
       CITY
    ========================= */

    return cities;
  };

  /* =====================================================
     GET PROFILE DETAILS
  ===================================================== */

  const loadProfileDetails = async () => {

    try {

      setLoading(true);
      setErrorText("");

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {
        setErrorText("Access token is missing.");
        return;
      }

      const result =
        await getProfileDetails(accessToken);

      console.log(
        "PROFILE DETAILS API RESPONSE:",
        JSON.stringify(result, null, 2)
      );

      if (
        result?.result === false ||
        result?.success === false ||
        result?.success === 0
      ) {

        setErrorText(
          typeof result?.message === "string"
            ? result.message
            : "Unable to load profile details."
        );

        return;
      }

      const profile =
        result?.data ||
        result?.user ||
        result?.profile ||
        result;

      setProfileData(profile);

    } catch (error) {

      console.error(
        "LOAD PROFILE ERROR:",
        error
      );

      setErrorText(
        error?.message ||
        "Unable to load profile details."
      );

    } finally {

      setLoading(false);

    }
  };


  /* =====================================================
     MESSAGE
  ===================================================== */

  const handleMessage = () => {
    router.push("/chatting");
  };


  /* =====================================================
     SHARE
  ===================================================== */

  const handleShare = () => {

    Alert.alert(
      "Share Profile",
      "Profile sharing option will open here."
    );

  };


  /* =====================================================
     INTEREST
  ===================================================== */

  const handleInterest = () => {

    router.push("/interests");

    Alert.alert(
      "Interest Sent",
      "Your interest has been sent successfully."
    );

  };


  /* =====================================================
     GET MEMBER INTRODUCTION
  ===================================================== */

  const loadMemberIntroduction = async () => {

    try {

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {
        return;
      }

      const response =
        await getMemberIntroduction(accessToken);

      console.log(
        "INTRO API RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const success =
        response?.result === true ||
        response?.result === 1 ||
        response?.success === true ||
        response?.success === 1;

      if (success) {

        const intro =
          response?.data?.introduction ||
          response?.introduction ||
          "";

        setIntroduction(intro);
        setAboutTextValue(intro);

        return;
      }

      setIntroduction("");
      setAboutTextValue("");

    } catch (error) {

      console.error(
        "LOAD INTRODUCTION ERROR:",
        error
      );

      setIntroduction("");
      setAboutTextValue("");

    }
  };


  /* =====================================================
     SAVE / UPDATE ABOUT ME
  ===================================================== */

  const handleSaveAbout = async () => {

    try {

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {

        Alert.alert(
          "Error",
          "Access token is missing. Please login again."
        );

        return;
      }

      const text =
        String(aboutTextValue || "").trim();

      if (!text) {

        Alert.alert(
          "Required",
          "Please enter your introduction."
        );

        return;
      }

      setSavingAbout(true);

      const response =
        await updateMemberIntroduction(
          accessToken,
          text
        );

      console.log(
        "ABOUT ME API RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const success =
        response?.result === true ||
        response?.result === 1 ||
        response?.success === true ||
        response?.success === 1;

      if (success) {

        setIntroduction(text);
        setEditingAbout(false);

        await loadMemberIntroduction();

        Alert.alert(
          "Success",
          response?.message ||
          "Introduction updated successfully."
        );

        return;
      }

      Alert.alert(
        "Error",
        response?.message ||
        "Unable to update introduction."
      );

    } catch (error) {

      console.error(
        "ABOUT ME UPDATE ERROR:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
        "Something went wrong while updating introduction."
      );

    } finally {

      setSavingAbout(false);

    }
  };


  /* =====================================================
     GET MEMBER BASIC INFO
  ===================================================== */

  const loadMemberBasicInfo = async () => {

    try {

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {
        return;
      }

      const response =
        await getMemberBasicInfo(accessToken);

      console.log(
        "BASIC INFO API RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const basicInfoData =
        response?.data?.data ||
        response?.data ||
        response?.user ||
        response?.profile ||
        {};

      setBasicInfo((current) => ({
        ...current,
        ...(basicInfoData && typeof basicInfoData === "object"
          ? basicInfoData
          : {}),
      }));

    } catch (error) {

      console.error(
        "LOAD BASIC INFO ERROR:",
        error
      );

    }
  };


  /* =====================================================
     UPDATE MEMBER BASIC INFO
     
     POST /api/member/basic-info/update
  ===================================================== */

  const handleSaveBasicInfo = async () => {

    try {

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {

        Alert.alert(
          "Error",
          "Access token is missing. Please login again."
        );

        return;
      }

      const response =
        await updateMemberBasicInfo(
          accessToken,
          basicInfo
        );

      console.log(
        "UPDATE BASIC INFO RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const success =
        response?.result === true ||
        response?.result === 1 ||
        response?.success === true ||
        response?.success === 1;

      if (success) {

        await loadMemberBasicInfo();

        Alert.alert(
          "Success",
          response?.message ||
          "Basic information updated successfully."
        );

      } else {

        Alert.alert(
          "Error",
          response?.message ||
          "Unable to update basic information."
        );

      }

    } catch (error) {

      console.error(
        "UPDATE BASIC INFO ERROR:",
        error
      );

      Alert.alert(
        "Error",
        error?.message ||
        "Something went wrong while updating basic information."
      );

    }
  };


  /* =========================================================
     GET MEMBER PRESENT ADDRESS
     
     GET /api/member/present/address
  ========================================================= */

  const loadMemberPresentAddress = async () => {

    try {

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      console.log(
        "PRESENT ADDRESS TOKEN EXISTS:",
        !!accessToken
      );

      if (!accessToken) {

        setPresentAddress(null);
        return;

      }

      const response =
        await getMemberPresentAddress(accessToken);

      console.log(
        "PRESENT ADDRESS FULL RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const address =
        response?.data?.data ||
        response?.data?.address ||
        response?.data ||
        response?.address ||
        null;

      const success =
        response?.result === true ||
        response?.result === 1 ||
        response?.success === true ||
        response?.success === 1 ||
        response?.status === true ||
        response?.status === 200 ||
        !!address;

      if (success && address && typeof address === "object") {

        const formattedAddress = {

          country_id:
            address.country_id ??
            address.country?.id ??
            address.countryId ??
            "",

          state_id:
            address.state_id ??
            address.state?.id ??
            address.stateId ??
            "",

          city_id:
            address.city_id ??
            address.city?.id ??
            address.cityId ??
            "",

          country:
            typeof address.country === "object"
              ? address.country?.name || ""
              : address.country || "",

          state:
            typeof address.state === "object"
              ? address.state?.name || ""
              : address.state || "",

          city:
            typeof address.city === "object"
              ? address.city?.name || ""
              : address.city || "",

          postal_code:
            address.postal_code ||
            address.postalCode ||
            "",
        };

        console.log(
          "FORMATTED PRESENT ADDRESS:",
          JSON.stringify(
            formattedAddress,
            null,
            2
          )
        );

        setPresentAddress(
          formattedAddress
        );

        return;
      }

      console.log(
        "PRESENT ADDRESS API MESSAGE:",
        response?.message ||
        "No present address found"
      );

      setPresentAddress(null);

    } catch (error) {

      console.error(
        "LOAD PRESENT ADDRESS ERROR:",
        error
      );

      setPresentAddress(null);

    }
  };


  /* =========================================================
     GET MEMBER PERMANENT ADDRESS
  ========================================================= */

  const loadMemberPermanentAddress = async () => {

    try {

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      console.log(
        "PERMANENT ADDRESS TOKEN EXISTS:",
        !!accessToken
      );

      if (!accessToken) {

        setPermanentAddress(null);
        return;

      }

      const response =
        await getMemberPermanentAddress(
          accessToken
        );

      console.log(
        "PERMANENT ADDRESS FULL RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const address =
        response?.data?.data ||
        response?.data?.address ||
        response?.data ||
        response?.address ||
        null;

      const success =
        response?.result === true ||
        response?.result === 1 ||
        response?.success === true ||
        response?.success === 1 ||
        response?.status === true ||
        response?.status === 200 ||
        !!address;

      if (success && address && typeof address === "object") {

        setPermanentAddress({

          country_id:
            address.country_id ??
            address.country?.id ??
            address.countryId ??
            "",

          state_id:
            address.state_id ??
            address.state?.id ??
            address.stateId ??
            "",

          city_id:
            address.city_id ??
            address.city?.id ??
            address.cityId ??
            "",

          country:
            typeof address.country === "object"
              ? address.country?.name || ""
              : address.country || "",

          state:
            typeof address.state === "object"
              ? address.state?.name || ""
              : address.state || "",

          city:
            typeof address.city === "object"
              ? address.city?.name || ""
              : address.city || "",

          postal_code:
            address.postal_code ||
            address.postalCode ||
            "",
        });

        return;
      }

      setPermanentAddress(null);

      console.log(
        "PERMANENT ADDRESS MESSAGE:",
        response?.message ||
        "No permanent address found"
      );

    } catch (error) {

      console.error(
        "LOAD PERMANENT ADDRESS ERROR:",
        error
      );

      setPermanentAddress(null);

    }
  };


  /* =========================================================
     SAVE / UPDATE PRESENT ADDRESS

     POST /api/member/address/update
  ========================================================= */

  const handleSavePresentAddress = async () => {
    if (savingPresentAddress) return;

    try {
      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {
        Alert.alert("Error", "Access token is missing. Please login again.");
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

      const body = {
        country_id: countryId,
        state_id: stateId,
        city_id: cityId,
        postal_code: postalCode,
        address_type: "present",
      };

      console.log("UPDATE PRESENT ADDRESS REQUEST:", JSON.stringify(body, null, 2));
      setSavingPresentAddress(true);

      const response = await updateMemberAddress(accessToken, body);
      console.log("UPDATE PRESENT ADDRESS RESPONSE:", JSON.stringify(response, null, 2));

      const responseData = response?.data?.data || response?.data || response;
      const success =
        response?.result === true ||
        response?.result === 1 ||
        response?.success === true ||
        response?.success === 1 ||
        response?.status === true ||
        response?.status === 200 ||
        responseData?.result === true ||
        responseData?.result === 1 ||
        responseData?.success === true ||
        responseData?.success === 1 ||
        responseData?.status === true ||
        responseData?.status === 200;

      if (!success) {
        Alert.alert(
          "Update Failed",
          response?.message ||
          response?.msg ||
          responseData?.message ||
          responseData?.msg ||
          "Unable to update present address."
        );
        return;
      }

      await loadMemberPresentAddress();
      Alert.alert("Success", response?.message || "Present address updated successfully.");
    } catch (error) {
      console.error("UPDATE PRESENT ADDRESS ERROR:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.message ||
        "Something went wrong while updating present address."
      );
    } finally {
      setSavingPresentAddress(false);
    }
  };

  const getDropdownTitle = () => {
    if (addressDropdown === "country") return "Select Country";
    if (addressDropdown === "state") return "Select State";
    return "Select City";
  };

  const selectAddressOption = (option) => {
    if (!option || !addressDropdown) return;

    if (addressDropdown === "country") {
      setPresentAddressForm((prev) => ({
        ...prev,
        country_id: String(option.id ?? ""),
        country: option.name || "",
        state_id: "",
        state: "",
        city_id: "",
        city: "",
      }));
    } else if (addressDropdown === "state") {
      setPresentAddressForm((prev) => ({
        ...prev,
        state_id: String(option.id ?? ""),
        state: option.name || "",
        city_id: "",
        city: "",
      }));
    } else {
      setPresentAddressForm((prev) => ({
        ...prev,
        city_id: String(option.id ?? ""),
        city: option.name || "",
      }));
    }

    setAddressDropdown(null);
  };




  /* =====================================================
   GET MEMBER COUNTRIES

   GET /api/member/countries
===================================================== */

  const loadMemberCountries = async () => {

    try {

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {
        setCountries([]);
        return;
      }

      setCountriesLoading(true);

      const response =
        await getMemberCountries(accessToken);

      console.log(
        "MEMBER COUNTRIES FULL RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const rawList =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : Array.isArray(response?.countries)
                ? response.countries
                : Array.isArray(
                  response?.data?.countries
                )
                  ? response.data.countries
                  : [];

      const normalizedCountries =
        rawList
          .map((item) => {

            if (item == null) {
              return null;
            }

            const id =
              typeof item === "object"
                ? item.id ??
                item.country_id ??
                item.countryId ??
                item.value ??
                ""
                : item;

            const name =
              typeof item === "object"
                ? item.name ??
                item.country_name ??
                item.countryName ??
                item.label ??
                ""
                : item;

            if (
              id === "" ||
              !String(name).trim()
            ) {
              return null;
            }

            return {
              ...(typeof item === "object"
                ? item
                : {}),

              id: String(id),

              name: String(name).trim(),
            };

          })
          .filter(Boolean);

      setCountries(
        normalizedCountries
      );

    } catch (error) {

      console.error(
        "LOAD COUNTRIES ERROR:",
        error
      );

      setCountries([]);

    } finally {

      setCountriesLoading(false);

    }
  };


  /* =====================================================
   GET MEMBER STATES

   GET /api/member/states/{country_id}

   Example:
   GET /api/member/states/101
===================================================== */

  const loadMemberStates = async (countryId) => {

    try {

      if (!countryId) {
        setStates([]);
        return [];
      }

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {
        setStates([]);
        return [];
      }

      setStatesLoading(true);

      console.log(
        "LOADING STATES FOR COUNTRY ID:",
        countryId
      );

      const response =
        await getMemberStates(
          accessToken,
          countryId
        );

      console.log(
        "MEMBER STATES FULL RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      /* ============================================
         HANDLE DIFFERENT API RESPONSE STRUCTURES
      ============================================ */

      const rawList =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : Array.isArray(response?.states)
                ? response.states
                : Array.isArray(response?.data?.states)
                  ? response.data.states
                  : [];

      /* ============================================
         NORMALIZE STATE OBJECTS
      ============================================ */

      const normalizedStates =
        rawList
          .map((item) => {

            if (item == null) {
              return null;
            }

            const id =
              typeof item === "object"
                ? item.id ??
                item.state_id ??
                item.stateId ??
                item.value ??
                ""
                : item;

            const name =
              typeof item === "object"
                ? item.name ??
                item.state_name ??
                item.stateName ??
                item.label ??
                ""
                : item;

            if (
              id === "" ||
              !String(name).trim()
            ) {
              return null;
            }

            return {
              ...(typeof item === "object"
                ? item
                : {}),

              id: String(id),

              name: String(name).trim(),
            };

          })
          .filter(Boolean);

      console.log(
        "NORMALIZED STATES:",
        JSON.stringify(
          normalizedStates,
          null,
          2
        )
      );

      setStates(normalizedStates);

      return normalizedStates;

    } catch (error) {

      console.error(
        "LOAD STATES ERROR:",
        error
      );

      setStates([]);

      return [];

    } finally {

      setStatesLoading(false);

    }
  };


  /* =====================================================
     GET MEMBER CITIES

     GET /api/member/cities/{state_id}

     Example:
     GET /api/member/cities/2
  ===================================================== */

  const loadMemberCities = async (stateId) => {

    try {

      if (!stateId) {
        setCities([]);
        return [];
      }

      const accessToken =
        (await AsyncStorage.getItem("access_token")) ||
        (await AsyncStorage.getItem("accessToken"));

      if (!accessToken) {
        setCities([]);
        return [];
      }

      setCitiesLoading(true);

      console.log(
        "LOADING CITIES FOR STATE ID:",
        stateId
      );

      const response =
        await getMemberCities(
          accessToken,
          stateId
        );

      console.log(
        "MEMBER CITIES FULL RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      /* ============================================
         HANDLE DIFFERENT API RESPONSE STRUCTURES
      ============================================ */

      const rawList =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : Array.isArray(response?.cities)
                ? response.cities
                : Array.isArray(response?.data?.cities)
                  ? response.data.cities
                  : [];

      /* ============================================
         NORMALIZE CITY OBJECTS
      ============================================ */

      const normalizedCities =
        rawList
          .map((item) => {

            if (item == null) {
              return null;
            }

            const id =
              typeof item === "object"
                ? item.id ??
                item.city_id ??
                item.cityId ??
                item.value ??
                ""
                : item;

            const name =
              typeof item === "object"
                ? item.name ??
                item.city_name ??
                item.cityName ??
                item.label ??
                ""
                : item;

            if (
              id === "" ||
              !String(name).trim()
            ) {
              return null;
            }

            return {
              ...(typeof item === "object"
                ? item
                : {}),

              id: String(id),

              name: String(name).trim(),
            };

          })
          .filter(Boolean);

      console.log(
        "NORMALIZED CITIES:",
        JSON.stringify(
          normalizedCities,
          null,
          2
        )
      );

      setCities(normalizedCities);

      return normalizedCities;

    } catch (error) {

      console.error(
        "LOAD CITIES ERROR:",
        error
      );

      setCities([]);

      return [];

    } finally {

      setCitiesLoading(false);

    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* =====================================================
        HEADER
    ===================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.headerSideButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color="#B71C28"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Profile Details
        </Text>

        <TouchableOpacity
          style={styles.headerSideButton}
          activeOpacity={0.8}
          onPress={() =>
            Alert.alert(
              "More Options",
              "More profile options"
            )
          }
        >
          <Ionicons
            name="ellipsis-vertical"
            size={23}
            color="#B71C28"
          />
        </TouchableOpacity>

      </View>


      {/* =====================================================
        SINGLE PAGE SCROLL
    ===================================================== */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* =================================================
          PROFILE HERO
      ================================================= */}

        <View style={styles.hero}>

          {/* Decorative background */}

          <View style={styles.heroDecorationOne} />
          <View style={styles.heroDecorationTwo} />
          <View style={styles.heroDecorationThree} />

          <View style={styles.heroContent}>

            {/* PROFILE IMAGE */}

            <View style={styles.profileImageContainer}>

              <Image
                source={PROFILE.image}
                style={styles.profileImage}
                resizeMode="cover"
              />

              {/* Online badge */}

              <View style={styles.onlineBadge}>

                <View style={styles.onlineDot} />

                <Text style={styles.onlineText}>
                  Online
                </Text>

              </View>

              {/* Bottom online indicator */}

              <View style={styles.imageOnlineIndicator}>
                <View style={styles.imageOnlineDot} />
              </View>

            </View>


            {/* PROFILE DETAILS */}

            <View style={styles.heroDetails}>

              {/* PREMIUM */}

              <View style={styles.premiumBadge}>

                <Ionicons
                  name="star"
                  size={13}
                  color="#FFD54F"
                />

                <Text style={styles.premiumText}>
                  PREMIUM MEMBER
                </Text>

              </View>


              {/* NAME */}

              <View style={styles.nameRow}>

                <Text
                  style={styles.profileName}
                  numberOfLines={1}
                >
                  {basicInfo?.first_name ||
                    PROFILE.name}
                  {basicInfo?.last_name
                    ? ` ${basicInfo.last_name}`
                    : ""}
                  , {basicInfo?.age || PROFILE.age}
                </Text>

                <View style={styles.verifiedCircle}>

                  <Ionicons
                    name="checkmark"
                    size={11}
                    color="#FFFFFF"
                  />

                </View>

              </View>


              {/* PROFESSION 
              <View style={styles.heroInfoRow}>

                <Ionicons
                  name="briefcase-outline"
                  size={15}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.heroInfoText}
                  numberOfLines={1}
                >
                  {PROFILE.profession}
                </Text>

              </View>
                  */}


              {/* LOCATION */}

              <View style={styles.heroInfoRow}>

                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.heroInfoText}
                  numberOfLines={2}
                >
                  {[
                    presentAddress?.city || presentAddressForm.city,
                    presentAddress?.state || presentAddressForm.state,
                    presentAddress?.country || presentAddressForm.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || PROFILE.location}
                </Text>
              </View>


              {/* TAGS */}

              <View style={styles.heroTags}>

                <View style={styles.heroTag}>

                  <Ionicons
                    name="resize-outline"
                    size={11}
                    color="#FFD54F"
                  />

                  <Text style={styles.heroTagText}>
                    5'7"
                  </Text>

                </View>


                <View style={styles.heroTag}>

                  <Ionicons
                    name="flower-outline"
                    size={11}
                    color="#FFD54F"
                  />

                  <Text style={styles.heroTagText}>
                    Hindu
                  </Text>

                </View>


                <View style={styles.heroTag}>

                  <Ionicons
                    name="heart-outline"
                    size={11}
                    color="#FFD54F"
                  />

                  <Text style={styles.heroTagText}>
                    Never Married
                  </Text>

                </View>

              </View>

            </View>

          </View>

        </View>


        {/* =================================================
          ABOUT ME
      ================================================= */}

        <TouchableOpacity
          style={styles.aboutCard}
          activeOpacity={0.9}
          onPress={() => setEditingAbout(true)}
        >

          <View style={styles.aboutIconBox}>

            <Ionicons
              name="person-outline"
              size={23}
              color="#D51F32"
            />

          </View>


          <View style={styles.aboutContent}>

            <Text style={styles.aboutTitle}>
              About Me
            </Text>

            <Text
              style={styles.aboutDescription}
              numberOfLines={3}
            >
              {introduction?.trim()
                ? introduction
                : PROFILE.about}
            </Text>

          </View>


          <Ionicons
            name="chevron-forward"
            size={18}
            color="#555555"
          />

        </TouchableOpacity>


        {/* =================================================
    BASIC INFORMATION
================================================= */}

        <View style={styles.sectionList}>
          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Basic Information clicked");
              router.push("/EditBasicInformation");
            }}
          >
            <View
              style={[
                styles.rowIcon,
                {
                  backgroundColor: "#FFF0F2",
                },
              ]}
            >
              <Ionicons
                name="card-outline"
                size={21}
                color="#D3263A"
              />
            </View>

            <Text style={styles.rowTitle}>
              Basic Information
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#666666"
            />
          </TouchableOpacity>







          {/* =================================================
            PRESENT ADDRESS
        ================================================= */}

          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Present Address Clicked");
              router.push("/PresentAddress");
              Alert.alert(
                "Present Address",
                presentAddress
                  ? `${presentAddress.city || ""}, ${presentAddress.state || ""
                  }`
                  : "Present address"
              )
            }}
          >

            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "#EAF9F1" },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={22}
                color="#1AA968"
              />
            </View>

            <Text style={styles.rowTitle}>
              Present Address
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#666666"
            />

          </TouchableOpacity>


          {/* =================================================
            EDUCATION
        ================================================= */}

          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Education Information Clicked");
              router.push("/EducationInformation");
              Alert.alert(
                "Education Information",
                "Education information"
              );
            }}
          >

            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "#FFF7E5" },
              ]}
            >
              <Ionicons
                name="school-outline"
                size={21}
                color="#E49A15"
              />
            </View>

            <Text style={styles.rowTitle}>
              Education Information
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                1
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#666666"
            />

          </TouchableOpacity>


          {/* =================================================
            CAREER
        ================================================= */}

          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Career Information Clicked");
              router.push("/CareerInformation");
              Alert.alert(
                "Career Information",
                "Career information"
              )
            }}
          >

            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "#FFF7E5" },
              ]}
            >
              <Ionicons
                name="briefcase-outline"
                size={20}
                color="#E49A15"
              />
            </View>

            <Text style={styles.rowTitle}>
              Career Information
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                1
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#666666"
            />

          </TouchableOpacity>


          {/* =================================================
            LANGUAGE
        ================================================= */}

          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Languages Clicked");
              router.push("/Languages");
              Alert.alert(
                "Language",
                "Language information"
              )
            }}
          >

            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "#F3EAFE" },
              ]}
            >
              <Ionicons
                name="language-outline"
                size={21}
                color="#7538B7"
              />
            </View>

            <Text style={styles.rowTitle}>
              Language
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#666666"
            />

          </TouchableOpacity>


          {/* =================================================
            SPIRITUAL
        ================================================= */}

          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Social & Spiritual Background clicked");
              router.push("/Social&SpiritualBackground");


              Alert.alert(
                "Spiritual & Social Background",
                "Information"
              )
            }}
          >

            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "#FFEAF2" },
              ]}
            >
              <Ionicons
                name="people-circle-outline"
                size={21}
                color="#D12269"
              />
            </View>

            <Text style={styles.rowTitle}>
              Spiritual & Social Background
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#666666"
            />

          </TouchableOpacity>


          {/* =================================================
            ASTRONOMIC
        ================================================= */}

          <TouchableOpacity
            style={styles.profileRow}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Astronomic Information clicked");
              router.push("/AstronomicInformation");
              Alert.alert(
                "Astronomic Information",
                "Astronomic information"
              )
            }}
          >

            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "#FFF4E5" },
              ]}
            >
              <Ionicons
                name="moon-outline"
                size={21}
                color="#E49D17"
              />
            </View>

            <Text style={styles.rowTitle}>
              Astronomic Information
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#666666"
            />

          </TouchableOpacity>


          {/* =================================================
            FAMILY
        ================================================= */}

          <TouchableOpacity
            style={[
              styles.profileRow,
              styles.lastProfileRow,
            ]}
            activeOpacity={0.8}
            onPress={() => {
              console.log("Family Information Clicked");
              router.push("/FamilyInformation");
              Alert.alert(
                "Family Information",
                "Family information"
              )
            }}
          >

            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "#FFF0F2" },
              ]}
            >
              <Ionicons
                name="people-outline"
                size={21}
                color="#D3263A"
              />
            </View>

            <Text style={styles.rowTitle}>
              Family Information
            </Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color="#666666"
            />

          </TouchableOpacity>
        </View>



        {/* =================================================
    LOGOUT
================================================= */}

        <TouchableOpacity
          style={[
            styles.profileRow,
            styles.logoutRow,
          ]}
          activeOpacity={0.8}
          onPress={Logout}
        >
          <View
            style={[
              styles.rowIcon,
              {
                backgroundColor: "#faf8f8",
              },
            ]}
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color="#e60f28"
            />
          </View>

          <Text
            style={[
              styles.rowTitle,
              styles.logoutText,
            ]}
          >
            Logout
          </Text>

         
        </TouchableOpacity>

        {/* =================================================
          PROFILE VERIFICATION
      ================================================= */}

        <View style={styles.verificationCard}>

          <View style={styles.verificationIcon}>

            <Ionicons
              name="shield-checkmark"
              size={28}
              color="#FFFFFF"
            />

          </View>

          <View style={styles.verificationContent}>

            <Text style={styles.verificationTitle}>
              Profile Verification
            </Text>

            <Text
              style={styles.verificationDescription}
              numberOfLines={2}
            >
              This profile is verified by Mudhiraj Matrimony
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color="#745B29"
          />

        </View>


        {/* Bottom space */}

        <View style={{ height: 85 }} />

      </ScrollView>


      {/* =====================================================
        ABOUT EDIT MODAL
        YOUR EXISTING ABOUT LOGIC CAN REMAIN
    ===================================================== */}

      <Modal
        visible={editingAbout}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setEditingAbout(false)
        }
      >

        <View style={styles.aboutModalOverlay}>

          <View style={styles.aboutModal}>

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>
                About Me
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setEditingAbout(false)
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#555555"
                />
              </TouchableOpacity>

            </View>

            <TextInput
              value={aboutTextValue}
              onChangeText={setAboutTextValue}
              multiline
              placeholder="Tell something about yourself"
              placeholderTextColor="#999999"
              style={styles.aboutInput}
            />

            <TouchableOpacity
              style={styles.aboutSaveButton}
              disabled={savingAbout}
              onPress={async () => {

                if (
                  typeof handleSaveAbout ===
                  "function"
                ) {
                  await handleSaveAbout();
                }

                setEditingAbout(false);

              }}
            >

              <Text style={styles.aboutSaveText}>
                {savingAbout
                  ? "Saving..."
                  : "Save"}
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </SafeAreaView >
  );
}


const styles = StyleSheet.create({

  /* =====================================================
     MAIN
  ===================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },

  scroll: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },

  scrollContent: {
    paddingBottom: 20,
  },


  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    height: 57,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  headerSideButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 19,
    fontWeight: "800",
    color: "#171717",
  },


  /* =====================================================
     HERO
  ===================================================== */

  hero: {
    height: 205,
    backgroundColor: "#A9000C",
    overflow: "hidden",
    position: "relative",
  },

  heroContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  heroDecorationOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    right: -100,
    top: -100,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  heroDecorationTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -50,
    bottom: -80,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  heroDecorationThree: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    left: -65,
    top: -50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },


  /* =====================================================
     PROFILE IMAGE
  ===================================================== */

  profileImageContainer: {
    width: 142,
    height: 158,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 6,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  onlineBadge: {
    position: "absolute",
    left: 7,
    top: 7,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.60)",
    flexDirection: "row",
    alignItems: "center",
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3DDC84",
    marginRight: 4,
  },

  onlineText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },

  imageOnlineIndicator: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  imageOnlineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#1DB36C",
  },


  /* =====================================================
     HERO DETAILS
  ===================================================== */

  heroDetails: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 13,
    justifyContent: "center",
  },

  premiumBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: 11,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginBottom: 5,
  },

  premiumText: {
    color: "#FFD54F",
    fontSize: 8,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.3,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  profileName: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  verifiedCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#20B66A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  heroInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  heroInfoText: {
    flex: 1,
    marginLeft: 6,
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "500",
  },

  heroTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 4,
  },

  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,213,79,0.25)",
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  heroTagText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "600",
    marginLeft: 3,
  },


  /* =====================================================
     ABOUT
  ===================================================== */

  aboutCard: {
    marginHorizontal: 13,
    marginTop: 10,
    minHeight: 82,
    borderRadius: 14,
    backgroundColor: "#FFF1F3",
    borderWidth: 1,
    borderColor: "#F6D9DC",
    paddingHorizontal: 11,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  aboutIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFE0E4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  aboutContent: {
    flex: 1,
  },

  aboutTitle: {
    color: "#C51F30",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },

  aboutDescription: {
    color: "#4F4F4F",
    fontSize: 12.5,
    lineHeight: 18,
  },


  /* =====================================================
     SECTION LIST
  ===================================================== */

  sectionList: {
    marginHorizontal: 13,
    marginTop: 9,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    overflow: "hidden",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  profileRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  lastProfileRow: {
    borderBottomWidth: 0,
  },

  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  rowTitle: {
    flex: 1,
    color: "#333333",
    fontSize: 13.5,
    fontWeight: "500",
  },

  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E1E2E4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  countBadgeText: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "700",
  },


  /* =====================================================
     VERIFICATION
  ===================================================== */

  verificationCard: {
    marginHorizontal: 13,
    marginTop: 25,
    minHeight: 85,
    borderRadius: 12,
    backgroundColor: "#FFF4D8",
    borderWidth: 1,
    borderColor: "#EECF87",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  verificationIcon: {
    width: 41,
    height: 41,
    borderRadius: 9,
    backgroundColor: "#EAA315",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  verificationContent: {
    flex: 1,
  },

  verificationTitle: {
    color: "#3D3323",
    fontSize: 13,
    fontWeight: "800",
  },

  verificationDescription: {
    color: "#756B59",
    fontSize: 11,
    marginTop: 2,
  },


  /* =====================================================
     FIXED EDIT PROFILE
  ===================================================== */

  bottomContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 14,
    paddingTop: 7,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 12,
  },

  editProfileButton: {
    height: 45,
    borderRadius: 9,
    backgroundColor: "#D7192A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  editProfileText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },


  /* =====================================================
     ABOUT MODAL
  ===================================================== */

  aboutModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  aboutModal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222222",
  },

  aboutInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#333333",
    textAlignVertical: "top",
  },

  aboutSaveButton: {
    height: 44,
    marginTop: 13,
    borderRadius: 9,
    backgroundColor: "#D7192A",
    alignItems: "center",
    justifyContent: "center",
  },

  aboutSaveText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

logoutRow: {
  borderBottomWidth: 0,
   marginBottom: 14,
},

logoutText: {
  color: "#D3263A",
  fontSize: 19,
  fontWeight: "700",
 
},

});