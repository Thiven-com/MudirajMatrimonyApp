import { useCallback, useEffect, useState } from "react";



import {

  ActivityIndicator,

  BackHandler,

  SafeAreaView,

  ScrollView,

  StatusBar,

  StyleSheet,

  Text,

  TouchableOpacity,

  View,

} from "react-native";



import Ionicons from "react-native-vector-icons/Ionicons";



import { useFocusEffect, useNavigation } from "@react-navigation/native";



import AsyncStorage from "@react-native-async-storage/async-storage";



import { getMemberSpiritualBackground } from "../utils/Functions";



const SocialBackgroundScreen = ({ navigation, route }) => {



  const [socialBackground, setSocialBackground] = useState({});

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadError, setLoadError] = useState(null);



  const getValue = (value, fallback = "-") => {

    if (value === null || value === undefined || value === "") {

      return fallback;

    }



    return String(value);

  };



  const loadSpiritualBackground = useCallback(async () => {

    try {

      setLoadError(null);



      const accessToken = await AsyncStorage.getItem("authToken");



      if (!accessToken) {

        setLoadError("You're not logged in. Please login again.");

        return;

      }



      const response = await getMemberSpiritualBackground(accessToken);

      let data = {};



      if (response?.data && typeof response.data === "object") {

        data = response.data;

      } else if (response?.result && typeof response.result === "object") {

        data = response.result;

      } else if (

        response?.result?.data &&

        typeof response.result.data === "object"

      ) {

        data = response.result.data;

      } else if (typeof response === "object") {

        data = response;

      }



      setSocialBackground(data ?? {});

    } catch (error) {

      console.error("SPIRITUAL BACKGROUND SCREEN ERROR:", error);



      setLoadError(

        error?.message || "Unable to load your spiritual background.",

      );

    } finally {

      setLoading(false);

    }

  }, []);





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



  useEffect(() => {

    loadSpiritualBackground();

  }, [loadSpiritualBackground]);





  const handleRefresh = async () => {

    try {

      setRefreshing(true);



      await loadSpiritualBackground();

    } finally {

      setRefreshing(false);

    }

  };



  const religion =

    socialBackground?.religion ??

    socialBackground?.religion_name ??

    socialBackground?.religion_id ??

    "-";



  const caste =

    socialBackground?.caste ??

    socialBackground?.caste_name ??

    socialBackground?.caste_id ??

    "-";



  const subCaste =

    socialBackground?.sub_caste ??

    socialBackground?.sub_caste_name ??

    socialBackground?.sub_caste_id ??

    "-";



  const ethnicity =

    socialBackground?.ethnicity_name ?? socialBackground?.ethnicity ?? "-";



  const personalValues =

    socialBackground?.personal_values ??

    socialBackground?.personal_value ??

    "-";



  const familyValue =

    socialBackground?.family_value ??

    socialBackground?.family_values ??

    socialBackground?.family_value_id ??

    "-";



  const communityValue =

    socialBackground?.community_value ??

    socialBackground?.community_values ??

    "-";



  const details = [

    {

      label: "Religion",

      value: getValue(religion),

      icon: "flower-outline",

      iconColor: "#E83E75",

      editable: true,

    },



    {

      label: "Caste",

      value: getValue(caste),

      icon: "people-outline",

      iconColor: "#F4B83F",

      editable: true,

    },



    {

      label: "Sub Caste",

      value: getValue(subCaste),

      icon: "planet-outline",

      iconColor: "#8D5BE8",

      editable: false,

      arrow: true,

    },



    {

      label: "Ethnicity",

      value: getValue(ethnicity),

      icon: "globe-outline",

      iconColor: "#4E9BE8",

      editable: false,

      arrow: true,

    },



    {

      label: "Personal Values",

      value: getValue(personalValues),

      icon: "star-outline",

      iconColor: "#F0B63D",

      editable: false,

      arrow: true,

    },



    {

      label: "Family Value",

      value: getValue(familyValue),

      icon: "home-outline",

      iconColor: "#63B85A",

      editable: false,

      arrow: true,

    },



    {

      label: "Community Value",

      value: getValue(communityValue),

      icon: "people-circle-outline",

      iconColor: "#E84887",

      editable: false,

      arrow: true,

    },

  ];



  const handleEdit = () => {

    navigation.navigate("EditSocialBackground", { page: route?.name, prevs: route?.params });

  };



  const handleItemEdit = (item) => {

    navigation.navigate("EditSocialBackground", {

      field: item.label,

      data: socialBackground,

      page: route?.name,

      prevs: route?.params

    });

  };



  return (

    <SafeAreaView style={styles.safeArea}>

      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />



      <ScrollView

        contentContainerStyle={styles.scrollContent}

        showsVerticalScrollIndicator={false}

        refreshing={refreshing}

        onRefresh={handleRefresh}

      >

        <View style={styles.card}>



          <View style={styles.header}>

            <TouchableOpacity

              style={styles.backButton}

              activeOpacity={0.7}

              onPress={() => handleBack()}

            >

              <Ionicons name="chevron-back" size={25} color="#D92332" />

            </TouchableOpacity>



            <Text style={styles.headerTitle} numberOfLines={1}>

              Spiritual & Social Background

            </Text>



            <TouchableOpacity

              style={styles.menuButton}

              activeOpacity={0.7}

              onPress={() => console.log("MENU CLICKED")}

            >

              {/* <Ionicons name="ellipsis-vertical" size={19} color="#D92332" / > */}

            </TouchableOpacity>

          </View>



          {loading ? (

            <View style={styles.stateContainer}>

              <ActivityIndicator size="small" color="#D92332" />



              <Text style={styles.stateText}>Loading your details…</Text>

            </View>

          ) : loadError ? (



            <View style={styles.stateContainer}>

              <Ionicons name="alert-circle-outline" size={22} color="#D92332" />



              <Text style={[styles.stateText, styles.stateErrorText]}>

                {loadError}

              </Text>



              <TouchableOpacity

                style={styles.retryButton}

                activeOpacity={0.8}

                onPress={loadSpiritualBackground}

              >

                <Text style={styles.retryButtonText}>Try Again</Text>

              </TouchableOpacity>

            </View>

          ) : (

            <>



              <View style={styles.detailsContainer}>

                {details.map((item, index) => (

                  <View

                    key={item.label}

                    style={[

                      styles.row,

                      index === details.length - 1 && styles.lastRow,

                    ]}

                  >



                    <View

                      style={[

                        styles.iconCircle,

                        {

                          backgroundColor: item.iconColor + "18",

                        },

                      ]}

                    >

                      <Ionicons

                        name={item.icon}

                        size={18}

                        color={item.iconColor}

                      />

                    </View>

                    <Text style={styles.label} numberOfLines={1}>

                      {item.label}

                    </Text>





                    <View style={styles.valueContainer}>

                      <Text style={styles.value} numberOfLines={1}>

                        {item.value}

                      </Text>

                    </View>



                    {item.editable ? (

                      <TouchableOpacity

                        style={styles.actionButton}

                        activeOpacity={0.7}

                        onPress={() => handleItemEdit(item)}

                      >

                        <Ionicons name="pencil" size={12} color="#A7A7A7" />

                      </TouchableOpacity>

                    ) : (

                      <Ionicons

                        name="chevron-forward"

                        size={14}

                        color="#999999"

                        style={styles.arrow}

                      />

                    )}

                  </View>

                ))}

              </View>



              <TouchableOpacity

                style={styles.editButton}

                activeOpacity={0.85}

                onPress={handleEdit}

              >

                <Ionicons name="pencil" size={15} color="#FFFFFF" />



                <Text style={styles.editButtonText}>Edit Details</Text>

              </TouchableOpacity>

            </>

          )}

        </View>

      </ScrollView>

    </SafeAreaView>

  );

};



export default SocialBackgroundScreen;



const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F6F3" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 28 },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 8,
    paddingBottom: 22,
    shadowColor: "#6E2A2A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3ECE7",
  },
  backButton: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#FFF5F4",
  },
  headerTitle: {
    flex: 1, textAlign: "center", color: "#8F1823",
    fontSize: 17, fontWeight: "800", marginHorizontal: 10,
  },
  menuButton: { width: 42, height: 42 },
  stateContainer: { paddingHorizontal: 24, paddingTop: 70, paddingBottom: 60, alignItems: "center" },
  stateText: { marginTop: 12, color: "#7C716C", fontSize: 13, fontWeight: "500", textAlign: "center" },
  stateErrorText: { color: "#B4232D", lineHeight: 19 },
  retryButton: {
    marginTop: 18, paddingHorizontal: 22, paddingVertical: 11,
    borderRadius: 14, backgroundColor: "#B51624",
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  detailsContainer: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 12 },
  row: {
    minHeight: 72, flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFCFA", borderWidth: 1, borderColor: "#F1E8E1",
    borderRadius: 18, marginBottom: 10, paddingHorizontal: 12,
  },
  lastRow: { marginBottom: 0 },
  iconCircle: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center", marginRight: 11,
  },
  label: { width: 92, color: "#7A706A", fontSize: 12, fontWeight: "700" },
  valueContainer: { flex: 1, paddingLeft: 4, paddingRight: 6 },
  value: { color: "#292321", fontSize: 14, fontWeight: "800" },
  actionButton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#FFF0F1", justifyContent: "center", alignItems: "center",
  },
  arrow: { width: 28, textAlign: "center" },
  editButton: {
    height: 52, marginHorizontal: 14, marginTop: 18, borderRadius: 17,
    backgroundColor: "#B51624", flexDirection: "row", alignItems: "center",
    justifyContent: "center", shadowColor: "#B51624",
    shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18,
    shadowRadius: 10, elevation: 4,
  },
  editButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", marginLeft: 8 },
});
