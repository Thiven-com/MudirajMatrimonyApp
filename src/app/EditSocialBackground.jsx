import {
  useEffect,
  useState
} from "react";

import {
  Alert,
  Modal,
  Pressable,
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {
  getMemberCasts,
  getMemberFamilyValues,
  getMemberReligions,
  getMemberSpiritualBackground,
  getMemberSubCasts,
  updateMemberSpiritualBackground,
} from "../utils/Functions";

const CACHE_KEY = "@social_background_cache";

const EditSocialBackground = () => {
  const router = useRouter();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [religion, setReligion] = useState("");
  const [religionId, setReligionId] = useState("");

  const [caste, setCaste] = useState("");
  const [casteId, setCasteId] = useState("");

  const [subCaste, setSubCaste] = useState("");
  const [subCasteId, setSubCasteId] = useState("");

  const [ethnicity, setEthnicity] = useState("");
  const [personalValue, setPersonalValue] = useState("");

  const [familyValue, setFamilyValue] = useState("");
  const [familyValueId, setFamilyValueId] = useState("");

  const [communityValue, setCommunityValue] = useState("");

  // =========================================================
  // LIST DATA
  // =========================================================

  const [religions, setReligions] = useState([]);
  const [casts, setCasts] = useState([]);
  const [subCasts, setSubCasts] = useState([]);
  const [familyValues, setFamilyValues] = useState([]);

  // =========================================================
  // LOADING
  // =========================================================

  const [religionLoading, setReligionLoading] = useState(false);
  const [casteLoading, setCasteLoading] = useState(false);
  const [subCasteLoading, setSubCasteLoading] = useState(false);
  const [familyValueLoading, setFamilyValueLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // MODALS
  // =========================================================

  const [religionModal, setReligionModal] = useState(false);
  const [casteModal, setCasteModal] = useState(false);
  const [subCasteModal, setSubCasteModal] = useState(false);
  const [familyValueModal, setFamilyValueModal] = useState(false);

  // =========================================================
  // TOKEN
  // =========================================================

  const getToken = async () => {
    const token = await AsyncStorage.getItem("access_token");

    if (!token) {
      throw new Error("Access token is missing. Please login again.");
    }

    return token;
  };

  // =========================================================
  // GET ID
  // =========================================================
const getId = (item) => {
  if (
    item === null ||
    item === undefined
  ) {
    return "";
  }

  if (typeof item === "number") {
    return item > 0
      ? String(item)
      : "";
  }

  if (typeof item === "string") {
    const value = item.trim();

    return /^\d+$/.test(value)
      ? value
      : "";
  }

  if (typeof item !== "object") {
    return "";
  }

  const id =
    item?.id ??
    item?.religion_id ??
    item?.religionId ??
    item?.caste_id ??
    item?.casteId ??
    item?.sub_caste_id ??
    item?.subCasteId ??
    item?.family_value_id ??
    item?.familyValueId;

  if (
    id === null ||
    id === undefined
  ) {
    return "";
  }

  const value =
    String(id).trim();

  return /^\d+$/.test(value)
    ? value
    : "";
};

  // =========================================================
  // GET NAME
  // =========================================================

 const getName = (item) => {
  if (
    item === null ||
    item === undefined
  ) {
    return "";
  }

  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item).trim();
  }

  if (typeof item !== "object") {
    return "";
  }

  return String(
    item?.name ??
      item?.religion_name ??
      item?.caste_name ??
      item?.sub_caste_name ??
      item?.family_value_name ??
      item?.label ??
      item?.title ??
      item?.value ??
      ""
  ).trim();
};
  // =========================================================
  // EXTRACT ARRAY
  // =========================================================

  const extractArray = (response) => {
    let current = response;

    for (let i = 0; i < 8; i++) {
      if (Array.isArray(current)) {
        return current;
      }

      if (
        !current ||
        typeof current !== "object"
      ) {
        return [];
      }

      if (current.data !== undefined) {
        current = current.data;
        continue;
      }

      if (current.result !== undefined) {
        current = current.result;
        continue;
      }

      break;
    }

    return [];
  };

  // =========================================================
  // FORMAT LIST
  // =========================================================

  const formatList = (response) => {
    const list = extractArray(response);

    return list
      .map((item) => ({
        id: getId(item),
        name: getName(item),
      }))
      .filter(
        (item) =>
          item.id &&
          item.name
      );
  };

  // =========================================================
  // EXTRACT SPIRITUAL OBJECT
  // =========================================================

  const extractSpiritualObject = (response) => {
    let current = response;

    for (let i = 0; i < 8; i++) {
      if (
        !current ||
        typeof current !== "object" ||
        Array.isArray(current)
      ) {
        break;
      }

      if (
        current.data &&
        typeof current.data === "object" &&
        !Array.isArray(current.data)
      ) {
        current = current.data;
        continue;
      }

      if (
        current.result &&
        typeof current.result === "object" &&
        !Array.isArray(current.result)
      ) {
        current = current.result;
        continue;
      }

      break;
    }

    return current || {};
  };

  // =========================================================
  // LOAD RELIGIONS
  // =========================================================

  const loadReligions = async () => {
    try {
      setReligionLoading(true);

      const token = await getToken();

      console.log("======================================");
      console.log("GET RELIGIONS");
      console.log("GET /api/member/religions");
      console.log("======================================");

      const response =
        await getMemberReligions(token);

      console.log(
        "RELIGIONS RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const formatted =
        formatList(response);

      console.log(
        "FORMATTED RELIGIONS:",
        JSON.stringify(formatted, null, 2)
      );

      setReligions(formatted);

      return formatted;
    } catch (error) {
      console.error(
        "RELIGIONS ERROR:",
        error
      );

      setReligions([]);

      Alert.alert(
        "Religion Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load religions."
      );

      return [];
    } finally {
      setReligionLoading(false);
    }
  };

  // =========================================================
  // LOAD CASTES
  // =========================================================

  const loadCasts = async (selectedReligionId) => {
    const id = Number(selectedReligionId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      console.log(
        "CAST API NOT CALLED - INVALID RELIGION ID:",
        selectedReligionId
      );

      setCasts([]);
      return [];
    }

    try {
      setCasteLoading(true);

      const token = await getToken();

      console.log("======================================");
      console.log("GET CASTES");
      console.log(
        "GET /api/member/casts/" + id
      );
      console.log("RELIGION ID:", id);
      console.log("======================================");

      const response =
        await getMemberCasts(
          token,
          id
        );

      console.log(
        "CASTES RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const formatted =
        formatList(response);

      console.log(
        "FORMATTED CASTES:",
        JSON.stringify(formatted, null, 2)
      );

      setCasts(formatted);

      return formatted;
    } catch (error) {
      console.error(
        "CASTES ERROR:",
        error
      );

      setCasts([]);

      Alert.alert(
        "Caste Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load castes."
      );

      return [];
    } finally {
      setCasteLoading(false);
    }
  };

  // =========================================================
  // LOAD SUB CASTES
  // =========================================================

  const loadSubCasts = async (selectedCasteId) => {
    const id = Number(selectedCasteId);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      console.log(
        "SUB CASTE API NOT CALLED - INVALID CASTE ID:",
        selectedCasteId
      );

      setSubCasts([]);
      return [];
    }

    try {
      setSubCasteLoading(true);

      const token = await getToken();

      console.log("======================================");
      console.log("GET SUB CASTES");
      console.log(
        "GET /api/member/sub-casts/" + id
      );
      console.log("CASTE ID:", id);
      console.log("======================================");

      const response =
        await getMemberSubCasts(
          token,
          id
        );

      console.log(
        "SUB CASTES RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const formatted =
        formatList(response);

      console.log(
        "FORMATTED SUB CASTES:",
        JSON.stringify(formatted, null, 2)
      );

      setSubCasts(formatted);

      return formatted;
    } catch (error) {
      console.error(
        "SUB CASTES ERROR:",
        error
      );

      setSubCasts([]);

      Alert.alert(
        "Sub Caste Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load sub castes."
      );

      return [];
    } finally {
      setSubCasteLoading(false);
    }
  };

  // =========================================================
  // LOAD FAMILY VALUES
  // =========================================================

  const loadFamilyValues = async () => {
    try {
      setFamilyValueLoading(true);

      const token = await getToken();

      console.log("======================================");
      console.log("GET FAMILY VALUES");
      console.log(
        "GET /api/member/family-values"
      );
      console.log("======================================");

      const response =
        await getMemberFamilyValues(token);

      console.log(
        "FAMILY VALUES RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      const formatted =
        formatList(response);

      console.log(
        "FORMATTED FAMILY VALUES:",
        JSON.stringify(formatted, null, 2)
      );

      setFamilyValues(formatted);

      return formatted;
    } catch (error) {
      console.error(
        "FAMILY VALUES ERROR:",
        error
      );

      setFamilyValues([]);

      Alert.alert(
        "Family Value Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load family values."
      );

      return [];
    } finally {
      setFamilyValueLoading(false);
    }
  };

  // =========================================================
  // LOAD CACHE
  // =========================================================

  const getCachedBackground = async () => {
    try {
      const cached =
        await AsyncStorage.getItem(
          CACHE_KEY
        );

      if (!cached) {
        return null;
      }

      const parsed =
        JSON.parse(cached);

      console.log(
        "CACHED SOCIAL BACKGROUND:",
        JSON.stringify(
          parsed,
          null,
          2
        )
      );

      return parsed;
    } catch (error) {
      console.error(
        "CACHE READ ERROR:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // SAVE CACHE
  // =========================================================

  const saveBackgroundCache = async (
    payload
  ) => {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify(payload)
      );

      console.log(
        "SOCIAL BACKGROUND CACHE SAVED:",
        JSON.stringify(
          payload,
          null,
          2
        )
      );
    } catch (error) {
      console.error(
        "CACHE SAVE ERROR:",
        error
      );
    }
  };

  // =========================================================
  // LOAD EXISTING SPIRITUAL BACKGROUND
  // =========================================================

  const loadSpiritualBackground = async (
  religionList = religions,
  familyList = familyValues
) => {
  try {
    const token = await getToken();

    console.log("======================================");
    console.log("GET SPIRITUAL BACKGROUND");
    console.log(
      "GET /api/member/spiritual-background"
    );
    console.log("======================================");

    const response =
      await getMemberSpiritualBackground(token);

    console.log(
      "FULL SPIRITUAL RESPONSE:",
      JSON.stringify(response, null, 2)
    );

    const serverData =
      extractSpiritualObject(response);

    console.log(
      "SERVER SPIRITUAL DATA:",
      JSON.stringify(serverData, null, 2)
    );

    const cached =
      await getCachedBackground();

    // =====================================================
    // HELPER: FIND ID BY NAME
    // =====================================================

    const findIdByName = (list, name) => {
      if (!Array.isArray(list) || !name) {
        return "";
      }

      const searchName = String(name)
        .trim()
        .toLowerCase();

      if (!searchName) {
        return "";
      }

      const found = list.find((item) => {
        const itemName = String(
          item?.name ?? ""
        )
          .trim()
          .toLowerCase();

        return itemName === searchName;
      });

      return found?.id
        ? String(found.id)
        : "";
    };

    // =====================================================
    // RELIGION
    // =====================================================

    const religionRaw =
      serverData?.religion_id ??
      serverData?.religionId ??
      serverData?.religion;

    let finalReligionId =
      getId(religionRaw);

    let finalReligionName =
      getName(serverData?.religion);

    // If API gives only religion name, find its ID
    if (!finalReligionId && finalReligionName) {
      finalReligionId =
        findIdByName(
          religionList,
          finalReligionName
        );

      console.log(
        "RELIGION ID FOUND FROM NAME:",
        finalReligionName,
        "=>",
        finalReligionId
      );
    }

    // Cache fallback
    if (!finalReligionId) {
      finalReligionId =
        getId(cached?.religion_id);
    }

    if (!finalReligionName) {
      const religionItem =
        religionList.find(
          (item) =>
            String(item.id) ===
            String(finalReligionId)
        );

      finalReligionName =
        religionItem?.name ||
        cached?.religion_name ||
        "";
    }

    // =====================================================
    // FAMILY VALUE
    // =====================================================

    const familyRaw =
      serverData?.family_value_id ??
      serverData?.familyValueId ??
      serverData?.family_value ??
      serverData?.familyValue;

    let finalFamilyValueId =
      getId(familyRaw);

    let finalFamilyValueName =
      getName(
        serverData?.family_value ??
          serverData?.familyValue
      );

    // Name -> ID
    if (
      !finalFamilyValueId &&
      finalFamilyValueName
    ) {
      finalFamilyValueId =
        findIdByName(
          familyList,
          finalFamilyValueName
        );

      console.log(
        "FAMILY VALUE ID FOUND FROM NAME:",
        finalFamilyValueName,
        "=>",
        finalFamilyValueId
      );
    }

    // Cache fallback
    if (!finalFamilyValueId) {
      finalFamilyValueId =
        getId(
          cached?.family_value_id
        );
    }

    if (!finalFamilyValueName) {
      const familyItem =
        familyList.find(
          (item) =>
            String(item.id) ===
            String(finalFamilyValueId)
        );

      finalFamilyValueName =
        familyItem?.name ||
        cached?.family_value_name ||
        "";
    }

    // =====================================================
    // ETHNICITY
    // =====================================================

    const finalEthnicity =
      serverData?.ethnicity !== undefined
        ? String(
            serverData.ethnicity ?? ""
          )
        : String(
            cached?.ethnicity ?? ""
          );

    // =====================================================
    // PERSONAL VALUE
    // =====================================================

    const finalPersonalValue =
      serverData?.personal_value !== undefined
        ? String(
            serverData.personal_value ?? ""
          )
        : String(
            cached?.personal_value ?? ""
          );

    // =====================================================
    // COMMUNITY VALUE
    // =====================================================

    const finalCommunityValue =
      serverData?.community_value !== undefined
        ? String(
            serverData.community_value ?? ""
          )
        : String(
            cached?.community_value ?? ""
          );

    // =====================================================
    // SET RELIGION
    // =====================================================

    setReligionId(
      finalReligionId
    );

    setReligion(
      finalReligionName
    );

    setFamilyValueId(
      finalFamilyValueId
    );

    setFamilyValue(
      finalFamilyValueName
    );

    setEthnicity(
      finalEthnicity
    );

    setPersonalValue(
      finalPersonalValue
    );

    setCommunityValue(
      finalCommunityValue
    );

    console.log("======================================");
    console.log("RESOLVED RELIGION");
    console.log(
      "NAME:",
      finalReligionName
    );
    console.log(
      "ID:",
      finalReligionId
    );
    console.log("======================================");

    // =====================================================
    // LOAD CASTES USING RELIGION ID
    // =====================================================

    let casteList = [];

    if (finalReligionId) {
      casteList =
        await loadCasts(
          finalReligionId
        );
    } else {
      setCasts([]);
    }

    // =====================================================
    // CASTE
    // =====================================================

    const casteRaw =
      serverData?.caste_id ??
      serverData?.casteId ??
      serverData?.caste;

    let finalCasteId =
      getId(casteRaw);

    let finalCasteName =
      getName(
        serverData?.caste
      );

    // If caste ID is empty, find by name
    if (
      !finalCasteId &&
      finalCasteName
    ) {
      finalCasteId =
        findIdByName(
          casteList,
          finalCasteName
        );

      console.log(
        "CASTE ID FOUND FROM NAME:",
        finalCasteName,
        "=>",
        finalCasteId
      );
    }

    // Cache fallback
    if (!finalCasteId) {
      finalCasteId =
        getId(
          cached?.caste_id
        );
    }

    // Find caste name from ID
    if (!finalCasteName) {
      const casteItem =
        casteList.find(
          (item) =>
            String(item.id) ===
            String(finalCasteId)
        );

      finalCasteName =
        casteItem?.name ||
        cached?.caste_name ||
        "";
    }

    setCasteId(
      finalCasteId
    );

    setCaste(
      finalCasteName
    );

    console.log("======================================");
    console.log("RESOLVED CASTE");
    console.log(
      "NAME:",
      finalCasteName
    );
    console.log(
      "ID:",
      finalCasteId
    );
    console.log("======================================");

    // =====================================================
    // LOAD SUB CASTES USING RESOLVED CASTE ID
    // =====================================================

    let subCasteList = [];

    if (finalCasteId) {
      subCasteList =
        await loadSubCasts(
          finalCasteId
        );
    } else {
      setSubCasts([]);
    }

    // =====================================================
    // SUB CASTE
    // =====================================================

    const subCasteRaw =
      serverData?.sub_caste_id ??
      serverData?.subCasteId ??
      serverData?.sub_caste ??
      serverData?.subCaste;

    let finalSubCasteId =
      getId(subCasteRaw);

    let finalSubCasteName =
      getName(
        serverData?.sub_caste ??
          serverData?.subCaste
      );

    // Name -> ID
    if (
      !finalSubCasteId &&
      finalSubCasteName
    ) {
      finalSubCasteId =
        findIdByName(
          subCasteList,
          finalSubCasteName
        );

      console.log(
        "SUB CASTE ID FOUND FROM NAME:",
        finalSubCasteName,
        "=>",
        finalSubCasteId
      );
    }

    // Cache fallback
    if (!finalSubCasteId) {
      finalSubCasteId =
        getId(
          cached?.sub_caste_id
        );
    }

    // ID -> name
    if (!finalSubCasteName) {
      const subCasteItem =
        subCasteList.find(
          (item) =>
            String(item.id) ===
            String(finalSubCasteId)
        );

      finalSubCasteName =
        subCasteItem?.name ||
        cached?.sub_caste_name ||
        "";
    }

    setSubCasteId(
      finalSubCasteId
    );

    setSubCaste(
      finalSubCasteName
    );

    // =====================================================
    // FINAL DEBUG
    // =====================================================

    console.log("======================================");
    console.log(
      "FINAL RESOLVED SPIRITUAL DATA"
    );
    console.log(
      JSON.stringify(
        {
          religion_id:
            finalReligionId,

          religion:
            finalReligionName,

          caste_id:
            finalCasteId,

          caste:
            finalCasteName,

          sub_caste_id:
            finalSubCasteId,

          sub_caste:
            finalSubCasteName,

          ethnicity:
            finalEthnicity,

          personal_value:
            finalPersonalValue,

          family_value_id:
            finalFamilyValueId,

          family_value:
            finalFamilyValueName,

          community_value:
            finalCommunityValue,
        },
        null,
        2
      )
    );
    console.log("======================================");

  } catch (error) {
    console.error(
      "SPIRITUAL BACKGROUND ERROR:",
      error
    );

    console.error(
      "ERROR RESPONSE:",
      JSON.stringify(
        error?.response?.data ??
          {},
        null,
        2
      )
    );

    Alert.alert(
      "Error",
      error?.response?.data?.message ||
        error?.message ||
        "Unable to load social background."
    );
  }
};

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // IMPORTANT:
        // Load lists first.
        // Then load saved background.
        const [religionList, familyList] =
          await Promise.all([
            loadReligions(),
            loadFamilyValues(),
          ]);

        if (!mounted) {
          return;
        }

        await loadSpiritualBackground(
          religionList,
          familyList
        );
      } catch (error) {
        console.error(
          "INITIAL LOAD ERROR:",
          error
        );
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // SELECT RELIGION
  // =========================================================

  const selectReligion = async (item) => {
    const id = getId(item);
    const name = getName(item);

    if (!id) {
      Alert.alert(
        "Invalid Religion",
        "Selected religion does not have a valid ID."
      );
      return;
    }

    console.log("======================================");
    console.log(
      "RELIGION SELECTED"
    );
    console.log("NAME:", name);
    console.log("ID:", id);
    console.log(
      "CAST API:",
      `/api/member/casts/${id}`
    );
    console.log("======================================");

    setReligion(name);
    setReligionId(id);

    // Reset dependent values
    setCaste("");
    setCasteId("");

    setSubCaste("");
    setSubCasteId("");

    setCasts([]);
    setSubCasts([]);

    setReligionModal(false);

    await loadCasts(id);
  };

  // =========================================================
  // SELECT CASTE
  // =========================================================

  const selectCaste = async (item) => {
    const id = getId(item);
    const name = getName(item);

    if (!id) {
      Alert.alert(
        "Invalid Caste",
        "Selected caste does not have a valid ID."
      );
      return;
    }

    console.log("======================================");
    console.log(
      "CASTE SELECTED"
    );
    console.log("NAME:", name);
    console.log("ID:", id);
    console.log(
      "SUB CASTE API:",
      `/api/member/sub-casts/${id}`
    );
    console.log("======================================");

    setCaste(name);
    setCasteId(id);

    setSubCaste("");
    setSubCasteId("");

    setSubCasts([]);

    setCasteModal(false);

    await loadSubCasts(id);
  };

  // =========================================================
  // SELECT SUB CASTE
  // =========================================================

  const selectSubCaste = (item) => {
    const id = getId(item);
    const name = getName(item);

    if (!id) {
      Alert.alert(
        "Invalid Sub Caste",
        "Selected sub caste does not have a valid ID."
      );
      return;
    }

    setSubCaste(name);
    setSubCasteId(id);

    setSubCasteModal(false);

    console.log("======================================");
    console.log(
      "SUB CASTE SELECTED"
    );
    console.log("NAME:", name);
    console.log("ID:", id);
    console.log("======================================");
  };

  // =========================================================
  // SELECT FAMILY VALUE
  // =========================================================

  const selectFamilyValue = (item) => {
    const id = getId(item);
    const name = getName(item);

    if (!id) {
      Alert.alert(
        "Invalid Family Value",
        "Selected family value does not have a valid ID."
      );
      return;
    }

    setFamilyValue(name);
    setFamilyValueId(id);

    setFamilyValueModal(false);

    console.log("======================================");
    console.log(
      "FAMILY VALUE SELECTED"
    );
    console.log("NAME:", name);
    console.log("ID:", id);
    console.log("======================================");
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (saving) {
      return;
    }

    // =======================================================
    // VALIDATE BEFORE LOADING TOKEN
    // =======================================================

    const religion_id =
      Number(religionId);

    const caste_id =
      Number(casteId);

    const sub_caste_id =
      Number(subCasteId);

    const family_value_id =
      Number(familyValueId);

    if (
      !Number.isInteger(religion_id) ||
      religion_id <= 0
    ) {
      Alert.alert(
        "Religion Required",
        "Please select a religion."
      );
      return;
    }

    if (
      !Number.isInteger(caste_id) ||
      caste_id <= 0
    ) {
      Alert.alert(
        "Caste Required",
        "Please select a caste."
      );
      return;
    }

    if (
      !Number.isInteger(sub_caste_id) ||
      sub_caste_id <= 0
    ) {
      Alert.alert(
        "Sub Caste Required",
        "Please select a sub caste."
      );
      return;
    }

    if (
      !Number.isInteger(family_value_id) ||
      family_value_id <= 0
    ) {
      Alert.alert(
        "Family Value Required",
        "Please select a family value."
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        await getToken();

      const payload = {
        religion_id,
        caste_id,
        sub_caste_id,

        ethnicity:
          String(
            ethnicity || ""
          ).trim(),

        personal_value:
          String(
            personalValue || ""
          ).trim(),

        family_value_id,

        community_value:
          String(
            communityValue || ""
          ).trim(),
      };

      console.log("======================================");
      console.log(
        "FINAL UPDATE PAYLOAD"
      );
      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );
      console.log("======================================");

      const response =
        await updateMemberSpiritualBackground(
          token,
          payload
        );

      console.log("======================================");
      console.log(
        "UPDATE API RESPONSE"
      );
      console.log(
        JSON.stringify(
          response,
          null,
          2
        )
      );
      console.log("======================================");

      const responseData =
        response?.data &&
        typeof response.data ===
          "object"
          ? response.data
          : response;

      const success =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true ||
        response?.statusCode === 200 ||
        response?.statusCode === 201 ||
        responseData?.success === 1 ||
        responseData?.success === true;

      if (!success) {
        Alert.alert(
          "Update Failed",
          response?.message ||
            responseData?.message ||
            "Unable to update social background."
        );

        return;
      }

      // =====================================================
      // SAVE SUCCESSFUL VALUES LOCALLY
      //
      // This is a fallback because your current GET API
      // returns empty religion/caste/sub-caste IDs.
      // =====================================================

      const cacheData = {
        religion_id,
        religion_name: religion,

        caste_id,
        caste_name: caste,

        sub_caste_id,
        sub_caste_name: subCaste,

        ethnicity:
          String(
            ethnicity || ""
          ).trim(),

        personal_value:
          String(
            personalValue || ""
          ).trim(),

        family_value_id,
        family_value_name:
          familyValue,

        community_value:
          String(
            communityValue || ""
          ).trim(),

        updated_at:
          new Date().toISOString(),
      };

      await saveBackgroundCache(
        cacheData
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      Alert.alert(
        "Success",
        response?.message ||
          responseData?.message ||
          "Social & Spiritual Background updated successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              /*
               * Go back to SocialBackgroundScreen.
               *
               * That screen should use useFocusEffect
               * to call its GET API again.
               */
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "======================================"
      );
      console.error(
        "UPDATE ERROR"
      );
      console.error(
        "MESSAGE:",
        error?.message
      );
      console.error(
        "STATUS:",
        error?.response?.status
      );
      console.error(
        "RESPONSE:",
        JSON.stringify(
          error?.response?.data ??
            {},
          null,
          2
        )
      );
      console.error(
        "======================================"
      );

      Alert.alert(
        "Update Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong while updating."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // INPUT FIELD
  // =========================================================

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
  }) => {
    return (
      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons
            name={icon}
            size={17}
            color="#D92332"
          />

          <Text style={styles.label}>
            {label}
          </Text>
        </View>

        <TextInput
          value={String(value ?? "")}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#AAAAAA"
          style={styles.input}
          autoCapitalize="sentences"
        />
      </View>
    );
  };

  // =========================================================
  // DROPDOWN
  // =========================================================

  const Dropdown = ({
    label,
    value,
    placeholder,
    onPress,
    disabled,
    loading,
    icon,
  }) => {
    return (
      <View style={styles.field}>
        <View style={styles.labelRow}>
          <Ionicons
            name={icon}
            size={17}
            color="#D92332"
          />

          <Text style={styles.label}>
            {label}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={
            disabled ? 1 : 0.7
          }
          disabled={disabled}
          onPress={onPress}
          style={[
            styles.dropdown,
            disabled &&
              styles.dropdownDisabled,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.dropdownText,
              !value &&
                styles.placeholder,
            ]}
          >
            {loading
              ? "Loading..."
              : value || placeholder}
          </Text>

          <Ionicons
            name={
              loading
                ? "sync-outline"
                : "chevron-down"
            }
            size={18}
            color={
              disabled
                ? "#BBBBBB"
                : "#666666"
            }
          />
        </TouchableOpacity>
      </View>
    );
  };

  // =========================================================
  // OPTION
  // =========================================================

  const renderOption = (
    item,
    selected,
    onPress
  ) => {
    return (
      <TouchableOpacity
        key={String(item.id)}
        style={[
          styles.option,
          selected &&
            styles.selectedOption,
        ]}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.optionLeft}>
          <Text
            style={[
              styles.optionText,
              selected &&
                styles.selectedText,
            ]}
          >
            {item.name}
          </Text>

          <Text style={styles.optionId}>
            ID: {item.id}
          </Text>
        </View>

        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={21}
            color="#D92332"
          />
        )}
      </TouchableOpacity>
    );
  };

  // =========================================================
  // MODAL HEADER
  // =========================================================

  const ModalHeader = ({
    title,
    subtitle,
    onClose,
  }) => {
    return (
      <View style={styles.modalHeader}>
        <View
          style={styles.modalHeaderText}
        >
          <Text
            style={styles.modalTitle}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              style={
                styles.modalSubtitle
              }
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
        >
          <Ionicons
            name="close"
            size={23}
            color="#555555"
          />
        </TouchableOpacity>
      </View>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="chevron-back"
            size={25}
            color="#D92332"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Edit Social Background
        </Text>

        <View
          style={styles.headerRight}
        />
      </View>

      {/* CONTENT */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.card}>
          {/* RELIGION */}

          <Dropdown
            label="Religion"
            value={religion}
            placeholder="Select Religion"
            onPress={() =>
              setReligionModal(true)
            }
            disabled={
              religionLoading
            }
            loading={
              religionLoading
            }
            icon="flower-outline"
          />

          {/* CASTE */}

          <Dropdown
            label="Caste"
            value={caste}
            placeholder={
              !religionId
                ? "Select Religion First"
                : casts.length === 0
                ? "No Castes Found"
                : "Select Caste"
            }
            onPress={() =>
              setCasteModal(true)
            }
            disabled={
              !religionId ||
              casteLoading ||
              casts.length === 0
            }
            loading={
              casteLoading
            }
            icon="people-outline"
          />

          {/* SUB CASTE */}

          <Dropdown
            label="Sub Caste"
            value={subCaste}
            placeholder={
              !casteId
                ? "Select Caste First"
                : subCasts.length === 0
                ? "No Sub Castes Found"
                : "Select Sub Caste"
            }
            onPress={() =>
              setSubCasteModal(true)
            }
            disabled={
              !casteId ||
              subCasteLoading ||
              subCasts.length === 0
            }
            loading={
              subCasteLoading
            }
            icon="planet-outline"
          />

          {/* ETHNICITY */}

          <InputField
            label="Ethnicity"
            value={ethnicity}
            onChangeText={
              setEthnicity
            }
            placeholder="Enter Ethnicity"
            icon="globe-outline"
          />

          {/* PERSONAL VALUE */}

          <InputField
            label="Personal Value"
            value={personalValue}
            onChangeText={
              setPersonalValue
            }
            placeholder="Enter Personal Value"
            icon="star-outline"
          />

          {/* FAMILY VALUE */}

          <Dropdown
            label="Family Value"
            value={familyValue}
            placeholder={
              familyValues.length ===
              0
                ? "No Family Values Found"
                : "Select Family Value"
            }
            onPress={() =>
              setFamilyValueModal(
                true
              )
            }
            disabled={
              familyValueLoading ||
              familyValues.length === 0
            }
            loading={
              familyValueLoading
            }
            icon="home-outline"
          />

          {/* COMMUNITY VALUE */}

          <InputField
            label="Community Value"
            value={communityValue}
            onChangeText={
              setCommunityValue
            }
            placeholder="Enter Community Value"
            icon="people-circle-outline"
          />

          {/* SAVE */}

          <TouchableOpacity
            style={[
              styles.saveButton,
              saving &&
                styles.saveDisabled,
            ]}
            disabled={saving}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons
              name={
                saving
                  ? "sync-outline"
                  : "checkmark-circle-outline"
              }
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={styles.saveText}
            >
              {saving
                ? "Saving..."
                : "Save Details"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* =====================================================
          RELIGION MODAL
      ===================================================== */}

      <Modal
        visible={religionModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setReligionModal(false)
        }
      >
        <Pressable
          style={styles.overlay}
          onPress={() =>
            setReligionModal(false)
          }
        >
          <Pressable
            style={styles.modal}
            onPress={(e) =>
              e.stopPropagation()
            }
          >
            <ModalHeader
              title="Select Religion"
              onClose={() =>
                setReligionModal(false)
              }
            />

            {religionLoading ? (
              <View
                style={styles.empty}
              >
                <Ionicons
                  name="sync-outline"
                  size={28}
                  color="#D92332"
                />

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Loading religions...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={
                  styles.modalList
                }
                keyboardShouldPersistTaps="handled"
              >
                {religions.map(
                  (item) =>
                    renderOption(
                      item,
                      String(
                        religionId
                      ) ===
                        String(
                          item.id
                        ),
                      () =>
                        selectReligion(
                          item
                        )
                    )
                )}

                {religions.length ===
                  0 && (
                  <View
                    style={
                      styles.empty
                    }
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={28}
                      color="#AAAAAA"
                    />

                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      No religions found.
                    </Text>

                    <TouchableOpacity
                      style={
                        styles.retryButton
                      }
                      onPress={
                        loadReligions
                      }
                    >
                      <Text
                        style={
                          styles.retryText
                        }
                      >
                        Retry
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================================
          CASTE MODAL
      ===================================================== */}

      <Modal
        visible={casteModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCasteModal(false)
        }
      >
        <Pressable
          style={styles.overlay}
          onPress={() =>
            setCasteModal(false)
          }
        >
          <Pressable
            style={styles.modal}
            onPress={(e) =>
              e.stopPropagation()
            }
          >
            <ModalHeader
              title="Select Caste"
              subtitle={
                religion
                  ? `Religion: ${religion}`
                  : ""
              }
              onClose={() =>
                setCasteModal(false)
              }
            />

            {casteLoading ? (
              <View
                style={styles.empty}
              >
                <Ionicons
                  name="sync-outline"
                  size={28}
                  color="#D92332"
                />

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Loading castes...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={
                  styles.modalList
                }
                keyboardShouldPersistTaps="handled"
              >
                {casts.map(
                  (item) =>
                    renderOption(
                      item,
                      String(
                        casteId
                      ) ===
                        String(
                          item.id
                        ),
                      () =>
                        selectCaste(
                          item
                        )
                    )
                )}

                {casts.length ===
                  0 && (
                  <View
                    style={
                      styles.empty
                    }
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={28}
                      color="#AAAAAA"
                    />

                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      No castes found.
                    </Text>

                    {religionId ? (
                      <TouchableOpacity
                        style={
                          styles.retryButton
                        }
                        onPress={() =>
                          loadCasts(
                            religionId
                          )
                        }
                      >
                        <Text
                          style={
                            styles.retryText
                          }
                        >
                          Retry
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================================
          SUB CASTE MODAL
      ===================================================== */}

      <Modal
        visible={subCasteModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSubCasteModal(false)
        }
      >
        <Pressable
          style={styles.overlay}
          onPress={() =>
            setSubCasteModal(false)
          }
        >
          <Pressable
            style={styles.modal}
            onPress={(e) =>
              e.stopPropagation()
            }
          >
            <ModalHeader
              title="Select Sub Caste"
              subtitle={
                caste
                  ? `Caste: ${caste}`
                  : ""
              }
              onClose={() =>
                setSubCasteModal(
                  false
                )
              }
            />

            {subCasteLoading ? (
              <View
                style={styles.empty}
              >
                <Ionicons
                  name="sync-outline"
                  size={28}
                  color="#D92332"
                />

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Loading sub castes...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={
                  styles.modalList
                }
                keyboardShouldPersistTaps="handled"
              >
                {subCasts.map(
                  (item) =>
                    renderOption(
                      item,
                      String(
                        subCasteId
                      ) ===
                        String(
                          item.id
                        ),
                      () =>
                        selectSubCaste(
                          item
                        )
                    )
                )}

                {subCasts.length ===
                  0 && (
                  <View
                    style={
                      styles.empty
                    }
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={28}
                      color="#AAAAAA"
                    />

                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      No sub castes found.
                    </Text>

                    {casteId ? (
                      <TouchableOpacity
                        style={
                          styles.retryButton
                        }
                        onPress={() =>
                          loadSubCasts(
                            casteId
                          )
                        }
                      >
                        <Text
                          style={
                            styles.retryText
                          }
                        >
                          Retry
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================================
          FAMILY VALUE MODAL
      ===================================================== */}

      <Modal
        visible={familyValueModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setFamilyValueModal(false)
        }
      >
        <Pressable
          style={styles.overlay}
          onPress={() =>
            setFamilyValueModal(false)
          }
        >
          <Pressable
            style={styles.modal}
            onPress={(e) =>
              e.stopPropagation()
            }
          >
            <ModalHeader
              title="Select Family Value"
              onClose={() =>
                setFamilyValueModal(
                  false
                )
              }
            />

            {familyValueLoading ? (
              <View
                style={styles.empty}
              >
                <Ionicons
                  name="sync-outline"
                  size={28}
                  color="#D92332"
                />

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Loading family values...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={
                  styles.modalList
                }
                keyboardShouldPersistTaps="handled"
              >
                {familyValues.map(
                  (item) =>
                    renderOption(
                      item,
                      String(
                        familyValueId
                      ) ===
                        String(
                          item.id
                        ),
                      () =>
                        selectFamilyValue(
                          item
                        )
                    )
                )}

                {familyValues.length ===
                  0 && (
                  <View
                    style={
                      styles.empty
                    }
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={28}
                      color="#AAAAAA"
                    />

                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      No family values found.
                    </Text>

                    <TouchableOpacity
                      style={
                        styles.retryButton
                      }
                      onPress={
                        loadFamilyValues
                      }
                    >
                      <Text
                        style={
                          styles.retryText
                        }
                      >
                        Retry
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default EditSocialBackground;

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    height: 56,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#D92332",
  },

  headerRight: {
    width: 40,
  },

  content: {
    padding: 12,
    paddingBottom: 35,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    elevation: 2,
  },

  field: {
    marginBottom: 15,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  label: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "600",
    color: "#444444",
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 13,
    fontSize: 13,
    color: "#333333",
    backgroundColor: "#FFFFFF",
  },

  dropdown: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },

  dropdownDisabled: {
    backgroundColor: "#F6F6F6",
    borderColor: "#EEEEEE",
  },

  dropdownText: {
    flex: 1,
    fontSize: 13,
    color: "#333333",
    fontWeight: "500",
    marginRight: 10,
  },

  placeholder: {
    color: "#AAAAAA",
    fontWeight: "400",
  },

  saveButton: {
    height: 48,
    borderRadius: 9,
    backgroundColor: "#D92332",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 7,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    maxHeight: "78%",
    overflow: "hidden",
  },

  modalHeader: {
    minHeight: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: 10,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: "#999999",
  },

  closeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  modalList: {
    maxHeight: 500,
  },

  option: {
    minHeight: 54,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },

  optionLeft: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 10,
  },

  selectedOption: {
    backgroundColor: "#FFF3F4",
  },

  optionText: {
    fontSize: 13,
    color: "#444444",
    fontWeight: "500",
  },

  optionId: {
    marginTop: 3,
    fontSize: 10,
    color: "#999999",
  },

  selectedText: {
    color: "#D92332",
    fontWeight: "700",
  },

  empty: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: "#888888",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: "#D92332",
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});