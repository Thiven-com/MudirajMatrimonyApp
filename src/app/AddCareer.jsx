import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Alert,
    BackHandler,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import {
    useFocusEffect,
    useNavigation,
    useRoute,
} from "@react-navigation/native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
    addMemberCareer,
} from "../utils/Functions";


/* =========================================================
   COLORS
========================================================= */

const COLORS = {
    background: "#F4F5F7",
    white: "#FFFFFF",

    text: "#333333",
    label: "#666666",
    placeholder: "#777777",

    border: "#E6E6E6",

    red: "#E91E32",
    lightRed: "#FFF0F2",

    checkbox: "#E91E32",
};


/* =========================================================
   COMPONENT
========================================================= */

export default function AddCareer() {

    // =====================================================
    // NAVIGATION
    // =====================================================

    const navigation = useNavigation();

    const route = useRoute();


    // =====================================================
    // ROUTE PARAM
    // =====================================================

    const selectedField =
        String(
            route?.params?.field || ""
        ).toLowerCase();


    // =====================================================
    // STATES
    // =====================================================

    const [designation, setDesignation] =
        useState("Manager");

    const [company, setCompany] =
        useState("Hdfc bank");

    const [startYear, setStartYear] =
        useState("2021");

    const [endYear, setEndYear] =
        useState("2025");

    const [currentlyWorking, setCurrentlyWorking] =
        useState(false);

    const [jobLocation, setJobLocation] =
        useState("Hyderabad, Telangana");

    const [jobDescription, setJobDescription] =
        useState(
            "Responsible for team management and operations."
        );

    const [saving, setSaving] =
        useState(false);

    const [showStartYears, setShowStartYears] =
        useState(false);

    const [showEndYears, setShowEndYears] =
        useState(false);


    // =====================================================
    // YEAR DATA
    // =====================================================

    const years = [
        "2015",
        "2016",
        "2017",
        "2018",
        "2019",
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
        "2025",
        "2026",
    ];


    // =====================================================
    // CLOSE OTHER DROPDOWN
    // =====================================================

    useEffect(() => {

        if (showStartYears) {
            setShowEndYears(false);
        }

    }, [showStartYears]);


    useEffect(() => {

        if (showEndYears) {
            setShowStartYears(false);
        }

    }, [showEndYears]);


    // =====================================================
    // HARDWARE BACK BUTTON
    // =====================================================

    useFocusEffect(
        useCallback(() => {

            const onBackPress = () => {

                // Don't leave screen while saving
                if (saving) {
                    return true;
                }

                navigation.goBack();

                return true;
            };


            const subscription =
                BackHandler.addEventListener(
                    "hardwareBackPress",
                    onBackPress
                );


            return () => {
                subscription.remove();
            };

        }, [
            navigation,
            saving,
        ])
    );


    // =====================================================
    // HANDLE BACK
    // =====================================================

    const handleBack = () => {

        if (saving) {
            return;
        }

        navigation.goBack();
    };


    // =====================================================
    // HANDLE START YEAR
    // =====================================================

    const handleStartYear = (year) => {

        setStartYear(year);

        setShowStartYears(false);
    };


    // =====================================================
    // HANDLE END YEAR
    // =====================================================

    const handleEndYear = (year) => {

        setEndYear(year);

        setShowEndYears(false);
    };


    // =====================================================
    // SAVE CAREER
    // =====================================================

    const handleSaveCareer = async () => {

        if (saving) {
            return;
        }


        try {

            setSaving(true);


            // =============================================
            // GET TOKEN
            // =============================================

            const accessToken =
                await AsyncStorage.getItem(
                    "access_token"
                );


            console.log(
                "================================="
            );

            console.log(
                "SAVE CAREER BUTTON CLICKED"
            );

            console.log(
                "TOKEN EXISTS:",
                !!accessToken
            );

            console.log(
                "================================="
            );


            if (!accessToken) {

                Alert.alert(
                    "Session Expired",
                    "Access token is missing. Please login again."
                );

                return;
            }


            // =============================================
            // CLEAN DATA
            // =============================================

            const cleanDesignation =
                String(
                    designation || ""
                ).trim();

            const cleanCompany =
                String(
                    company || ""
                ).trim();

            const cleanStartYear =
                Number(startYear);

            const cleanEndYear =
                Number(endYear);


            // =============================================
            // VALIDATION
            // =============================================

            if (!cleanDesignation) {

                Alert.alert(
                    "Required",
                    "Please enter designation."
                );

                return;
            }


            if (!cleanCompany) {

                Alert.alert(
                    "Required",
                    "Please enter company."
                );

                return;
            }


            if (
                !Number.isInteger(
                    cleanStartYear
                ) ||
                cleanStartYear <= 0
            ) {

                Alert.alert(
                    "Required",
                    "Please select a valid Start Year."
                );

                return;
            }


            // End year is optional when
            // currently working

            if (
                !currentlyWorking &&
                (
                    !Number.isInteger(
                        cleanEndYear
                    ) ||
                    cleanEndYear <= 0
                )
            ) {

                Alert.alert(
                    "Required",
                    "Please select a valid End Year."
                );

                return;
            }


            if (
                !currentlyWorking &&
                cleanEndYear < cleanStartYear
            ) {

                Alert.alert(
                    "Invalid Year",
                    "End Year cannot be before Start Year."
                );

                return;
            }


            // =============================================
            // PREPARE CAREER DATA
            // =============================================

            const careerData = {

                company:
                    cleanCompany,

                designation:
                    cleanDesignation,

                start:
                    cleanStartYear,

                end:
                    currentlyWorking
                        ? null
                        : cleanEndYear,

            };


            console.log(
                "CAREER DATA:",
                JSON.stringify(
                    careerData,
                    null,
                    2
                )
            );


            // =============================================
            // CALL POST API
            // =============================================

            const response =
                await addMemberCareer(
                    accessToken,
                    careerData
                );


            console.log(
                "CAREER POST RESPONSE:",
                JSON.stringify(
                    response,
                    null,
                    2
                )
            );


            // =============================================
            // SUCCESS CHECK
            // =============================================

            const isSuccess =
                response?.success === 1 ||
                response?.success === true ||
                response?.result === true ||
                response?.statusCode === 200 ||
                response?.statusCode === 201;


            if (isSuccess) {

                Alert.alert(
                    "Success",
                    "Career added successfully.",
                    [
                        {
                            text: "OK",

                            onPress: () => {
                                navigation.goBack();
                            },
                        },
                    ]
                );

            } else {

                Alert.alert(
                    "Error",
                    response?.message ||
                    response?.error ||
                    "Unable to add career."
                );

            }


        } catch (error) {

            console.error(
                "SAVE CAREER ERROR:",
                error
            );


            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong while adding career.";


            Alert.alert(
                "Error",
                errorMessage
            );


        } finally {

            setSaving(false);

        }
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <SafeAreaView
            style={styles.safeArea}
            edges={["top", "bottom"]}
        >

            <StatusBar
                barStyle="dark-content"
                backgroundColor={
                    COLORS.background
                }
            />


            <KeyboardAvoidingView
                style={styles.screen}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : undefined
                }
            >


                {/* =================================================
                    HEADER
                ================================================= */}

                <View style={styles.header}>


                    {/* BACK */}

                    <TouchableOpacity
                        style={styles.backButton}
                        activeOpacity={0.7}
                        onPress={handleBack}
                        disabled={saving}
                    >

                        <Feather
                            name="chevron-left"
                            size={18}
                            color={COLORS.red}
                        />

                    </TouchableOpacity>


                    {/* TITLE */}

                    <Text
                        style={styles.headerTitle}
                    >
                        Add Career
                    </Text>


                    {/* MENU */}

                    <TouchableOpacity
                        style={styles.menuButton}
                        activeOpacity={0.7}
                        disabled={saving}
                    >

                        <FontAwesome5
                            name="ellipsis-v"
                            size={14}
                            color={COLORS.red}
                        />

                    </TouchableOpacity>

                </View>


                {/* =================================================
                    MAIN CARD
                ================================================= */}

                <View style={styles.card}>


                    <ScrollView
                        showsVerticalScrollIndicator={
                            false
                        }
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={
                            styles.scrollContent
                        }
                    >


                        {/* =========================================
                            ROW 1
                        ========================================= */}

                        <View
                            style={
                                styles.twoColumnRow
                            }
                        >


                            {/* DESIGNATION */}

                            <View
                                style={[
                                    styles.column,

                                    selectedField ===
                                        "designation" &&
                                        styles.selectedField,
                                ]}
                            >

                                <Text
                                    style={styles.label}
                                >
                                    Designation

                                    <Text
                                        style={
                                            styles.required
                                        }
                                    >
                                        *
                                    </Text>

                                </Text>


                                <TextInput
                                    style={
                                        styles.input
                                    }
                                    value={
                                        designation
                                    }
                                    onChangeText={
                                        setDesignation
                                    }
                                    placeholder="Designation"
                                    placeholderTextColor={
                                        COLORS.placeholder
                                    }
                                    editable={!saving}
                                />

                            </View>


                            {/* COMPANY */}

                            <View
                                style={[
                                    styles.column,

                                    selectedField ===
                                        "company" &&
                                        styles.selectedField,
                                ]}
                            >

                                <Text
                                    style={styles.label}
                                >
                                    Company

                                    <Text
                                        style={
                                            styles.required
                                        }
                                    >
                                        *
                                    </Text>

                                </Text>


                                <TextInput
                                    style={
                                        styles.input
                                    }
                                    value={
                                        company
                                    }
                                    onChangeText={
                                        setCompany
                                    }
                                    placeholder="Company"
                                    placeholderTextColor={
                                        COLORS.placeholder
                                    }
                                    editable={!saving}
                                />

                            </View>

                        </View>


                        {/* =========================================
                            ROW 2
                        ========================================= */}

                        <View
                            style={
                                styles.twoColumnRow
                            }
                        >


                            {/* START YEAR */}

                            <View
                                style={
                                    styles.column
                                }
                            >

                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    Start Year

                                    <Text
                                        style={
                                            styles.required
                                        }
                                    >
                                        *
                                    </Text>

                                </Text>


                                <TouchableOpacity
                                    style={
                                        styles.selectInput
                                    }
                                    activeOpacity={
                                        0.7
                                    }
                                    disabled={
                                        saving
                                    }
                                    onPress={() => {

                                        setShowStartYears(
                                            !showStartYears
                                        );

                                        setShowEndYears(
                                            false
                                        );

                                    }}
                                >

                                    <Text
                                        style={
                                            styles.selectText
                                        }
                                    >
                                        {startYear}
                                    </Text>


                                    <Feather
                                        name={
                                            showStartYears
                                                ? "chevron-up"
                                                : "chevron-down"
                                        }
                                        size={13}
                                        color="#888888"
                                    />

                                </TouchableOpacity>


                                {/* START YEAR LIST */}

                                {showStartYears && (

                                    <View
                                        style={
                                            styles.dropdownList
                                        }
                                    >

                                        <ScrollView
                                            nestedScrollEnabled
                                            showsVerticalScrollIndicator={
                                                false
                                            }
                                            style={
                                                styles.dropdownScroll
                                            }
                                        >

                                            {years.map(
                                                (year) => (

                                                    <TouchableOpacity
                                                        key={
                                                            year
                                                        }
                                                        style={
                                                            styles.dropdownOption
                                                        }
                                                        activeOpacity={
                                                            0.7
                                                        }
                                                        onPress={() =>
                                                            handleStartYear(
                                                                year
                                                            )
                                                        }
                                                    >

                                                        <Text
                                                            style={
                                                                styles.optionText
                                                            }
                                                        >
                                                            {
                                                                year
                                                            }
                                                        </Text>

                                                    </TouchableOpacity>

                                                )
                                            )}

                                        </ScrollView>

                                    </View>

                                )}

                            </View>


                            {/* END YEAR */}

                            <View
                                style={
                                    styles.column
                                }
                            >

                                <Text
                                    style={
                                        styles.label
                                    }
                                >
                                    End Year
                                </Text>


                                <TouchableOpacity
                                    style={[
                                        styles.selectInput,

                                        currentlyWorking &&
                                            styles.disabledInput,
                                    ]}
                                    activeOpacity={
                                        0.7
                                    }
                                    disabled={
                                        saving ||
                                        currentlyWorking
                                    }
                                    onPress={() => {

                                        setShowEndYears(
                                            !showEndYears
                                        );

                                        setShowStartYears(
                                            false
                                        );

                                    }}
                                >

                                    <Text
                                        style={
                                            styles.selectText
                                        }
                                    >
                                        {currentlyWorking
                                            ? "Present"
                                            : endYear}
                                    </Text>


                                    <Feather
                                        name={
                                            showEndYears
                                                ? "chevron-up"
                                                : "chevron-down"
                                        }
                                        size={13}
                                        color="#888888"
                                    />

                                </TouchableOpacity>


                                {/* END YEAR LIST */}

                                {showEndYears &&
                                    !currentlyWorking && (

                                        <View
                                            style={
                                                styles.dropdownList
                                            }
                                        >

                                            <ScrollView
                                                nestedScrollEnabled
                                                showsVerticalScrollIndicator={
                                                    false
                                                }
                                                style={
                                                    styles.dropdownScroll
                                                }
                                            >

                                                {years.map(
                                                    (year) => (

                                                        <TouchableOpacity
                                                            key={
                                                                year
                                                            }
                                                            style={
                                                                styles.dropdownOption
                                                            }
                                                            activeOpacity={
                                                                0.7
                                                            }
                                                            onPress={() =>
                                                                handleEndYear(
                                                                    year
                                                                )
                                                            }
                                                        >

                                                            <Text
                                                                style={
                                                                    styles.optionText
                                                                }
                                                            >
                                                                {
                                                                    year
                                                                }
                                                            </Text>

                                                        </TouchableOpacity>

                                                    )
                                                )}

                                            </ScrollView>

                                        </View>

                                    )}

                            </View>

                        </View>


                        {/* =========================================
                            CURRENTLY WORKING
                        ========================================= */}

                        <View
                            style={
                                styles.currentlyWorkingRow
                            }
                        >

                            <TouchableOpacity
                                style={[
                                    styles.checkbox,

                                    currentlyWorking &&
                                        styles.checkboxSelected,
                                ]}
                                activeOpacity={
                                    0.8
                                }
                                disabled={
                                    saving
                                }
                                onPress={() => {

                                    setCurrentlyWorking(
                                        !currentlyWorking
                                    );

                                    setShowEndYears(
                                        false
                                    );

                                }}
                            >

                                {currentlyWorking && (

                                    <Feather
                                        name="check"
                                        size={12}
                                        color="#FFFFFF"
                                    />

                                )}

                            </TouchableOpacity>


                            <Text
                                style={
                                    styles.currentlyWorkingText
                                }
                            >
                                I am currently working here
                            </Text>

                        </View>


                        {/* =========================================
                            JOB LOCATION
                        ========================================= */}

                        <View
                            style={
                                styles.fullField
                            }
                        >

                            <Text
                                style={
                                    styles.label
                                }
                            >
                                Job Location
                            </Text>


                            <TextInput
                                style={
                                    styles.fullInput
                                }
                                value={
                                    jobLocation
                                }
                                onChangeText={
                                    setJobLocation
                                }
                                placeholder="Job Location"
                                placeholderTextColor={
                                    COLORS.placeholder
                                }
                                editable={!saving}
                            />

                        </View>


                        {/* =========================================
                            JOB DESCRIPTION
                        ========================================= */}

                        <View
                            style={
                                styles.descriptionField
                            }
                        >

                            <Text
                                style={
                                    styles.label
                                }
                            >
                                Job Description
                            </Text>


                            <TextInput
                                style={
                                    styles.descriptionInput
                                }
                                value={
                                    jobDescription
                                }
                                onChangeText={
                                    setJobDescription
                                }
                                placeholder="Job Description"
                                placeholderTextColor={
                                    COLORS.placeholder
                                }
                                multiline
                                textAlignVertical="top"
                                editable={!saving}
                            />

                        </View>


                        {/* =========================================
                            BUTTONS
                        ========================================= */}

                        <View
                            style={
                                styles.buttonRow
                            }
                        >


                            {/* CANCEL */}

                            <TouchableOpacity
                                style={
                                    styles.cancelButton
                                }
                                activeOpacity={
                                    0.8
                                }
                                disabled={
                                    saving
                                }
                                onPress={
                                    handleBack
                                }
                            >

                                <Text
                                    style={
                                        styles.cancelText
                                    }
                                >
                                    Cancel
                                </Text>

                            </TouchableOpacity>


                            {/* SAVE */}

                            <TouchableOpacity
                                style={[
                                    styles.saveButton,

                                    saving && {
                                        opacity: 0.6,
                                    },
                                ]}
                                activeOpacity={
                                    0.85
                                }
                                disabled={
                                    saving
                                }
                                onPress={
                                    handleSaveCareer
                                }
                            >

                                <Text
                                    style={
                                        styles.saveText
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Career"}
                                </Text>

                            </TouchableOpacity>

                        </View>

                    </ScrollView>

                </View>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

    /* =====================================================
       SAFE AREA
    ===================================================== */

    safeArea: {
        flex: 1,

        backgroundColor:
            COLORS.background,
    },


    /* =====================================================
       SCREEN
    ===================================================== */

    screen: {
        flex: 1,

        backgroundColor:
            COLORS.background,

        paddingHorizontal: 3,

        paddingTop: 3,

        paddingBottom: 3,
    },


    /* =====================================================
       HEADER
    ===================================================== */

    header: {
        width: "100%",

        height: 51,

        backgroundColor:
            COLORS.white,

        flexDirection: "row",

        alignItems: "center",

        justifyContent: "center",

        position: "relative",

        borderTopLeftRadius: 7,

        borderTopRightRadius: 7,

        borderWidth: 1,

        borderColor: "#E7E7E7",
    },


    /* =====================================================
       BACK BUTTON
    ===================================================== */

    backButton: {
        position: "absolute",

        left: 5,

        top: 10,

        width: 30,

        height: 30,

        borderRadius: 12,

        backgroundColor:
            "#FFFFFF",

        borderWidth: 1,

        borderColor: "#EEEEEE",

        alignItems: "center",

        justifyContent: "center",
    },


    /* =====================================================
       HEADER TITLE
    ===================================================== */

    headerTitle: {
        fontSize: 20,

        lineHeight: 12,

        fontWeight: "600",

        color: "#222222",

        includeFontPadding: false,

        textAlign: "center",
    },


    /* =====================================================
       MENU
    ===================================================== */

    menuButton: {
        position: "absolute",

        right: 5,

        top: 3,

        width: 22,

        height: 24,

        alignItems: "center",

        justifyContent: "center",
    },


    /* =====================================================
       CARD
    ===================================================== */

    card: {
        flex: 1,

        width: "100%",

        backgroundColor:
            COLORS.white,

        borderWidth: 1,

        borderTopWidth: 0,

        borderColor: "#E7E7E7",

        borderBottomLeftRadius: 7,

        borderBottomRightRadius: 7,

        overflow: "hidden",
    },


    /* =====================================================
       SCROLL CONTENT
    ===================================================== */

    scrollContent: {
        paddingHorizontal: 9,

        paddingTop: 7,

        paddingBottom: 20,
    },


    /* =====================================================
       TWO COLUMN ROW
    ===================================================== */

    twoColumnRow: {
        width: "100%",

        flexDirection: "row",

        justifyContent:
            "space-between",

        marginBottom: 30,
    },


    /* =====================================================
       COLUMN
    ===================================================== */

    column: {
        width: "48.5%",

        position: "relative",
    },


    /* =====================================================
       SELECTED FIELD
    ===================================================== */

    selectedField: {
        borderRadius: 5,
    },


    /* =====================================================
       LABEL
    ===================================================== */

    label: {
        fontSize: 15,

        lineHeight: 9,

        fontWeight: "700",

        color: "#555555",

        marginBottom: 20,

        marginTop: 30,

        includeFontPadding: false,
    },


    /* =====================================================
       REQUIRED
    ===================================================== */

    required: {
        color: COLORS.red,

        fontSize: 9.5,

        fontWeight: "500",
    },


    /* =====================================================
       INPUT
    ===================================================== */

    input: {
        width: "100%",

        height: 24,

        backgroundColor:
            "#FFFFFF",

        borderWidth: 1,

        borderColor:
            "#E5E5E5",

        borderRadius: 5,

        paddingHorizontal: 7,

        paddingVertical: 0,

        fontSize: 13,

        lineHeight: 9,

        color: "#3b3a3a",

        includeFontPadding: false,
    },


    /* =====================================================
       SELECT INPUT
    ===================================================== */

    selectInput: {
        width: "100%",

        height: 24,

        backgroundColor:
            "#FFFFFF",

        borderWidth: 1,

        borderColor:
            "#E5E5E5",

        borderRadius: 5,

        paddingHorizontal: 7,

        flexDirection: "row",

        alignItems: "center",

        justifyContent:
            "space-between",
    },


    /* =====================================================
       DISABLED INPUT
    ===================================================== */

    disabledInput: {
        backgroundColor: "#F5F5F5",

        borderColor: "#E0E0E0",
    },


    /* =====================================================
       SELECT TEXT
    ===================================================== */

    selectText: {
        flex: 1,

        fontSize: 13,

        lineHeight: 9,

        color: "#555555",

        includeFontPadding: false,
    },


    /* =====================================================
       DROPDOWN LIST
    ===================================================== */

    dropdownList: {
        position: "absolute",

        top: 77,

        left: 0,

        right: 0,

        backgroundColor:
            "#FFFFFF",

        borderWidth: 1,

        borderColor:
            "#E4E4E4",

        borderRadius: 5,

        zIndex: 1000,

        elevation: 6,

        overflow: "hidden",
    },


    /* =====================================================
       DROPDOWN SCROLL
    ===================================================== */

    dropdownScroll: {
        maxHeight: 130,
    },


    /* =====================================================
       DROPDOWN OPTION
    ===================================================== */

    dropdownOption: {
        height: 28,

        paddingHorizontal: 9,

        justifyContent:
            "center",

        borderBottomWidth: 1,

        borderBottomColor:
            "#F2F2F2",
    },


    /* =====================================================
       OPTION TEXT
    ===================================================== */

    optionText: {
        fontSize: 13,

        color: "#555555",

        includeFontPadding: false,
    },


    /* =====================================================
       CURRENTLY WORKING
    ===================================================== */

    currentlyWorkingRow: {
        width: "48.5%",

        marginLeft: "51.5%",

        minHeight: 20,

        flexDirection: "row",

        alignItems: "center",

        marginTop: -2,

        marginBottom: 4,
    },


    /* =====================================================
       CHECKBOX
    ===================================================== */

    checkbox: {
        width: 18,

        height: 18,

        borderRadius: 2,

        borderWidth: 1,

        borderColor:
            "#D0D0D0",

        backgroundColor:
            "#FFFFFF",

        alignItems: "center",

        justifyContent:
            "center",

        marginRight: 4,
    },


    /* =====================================================
       CHECKBOX SELECTED
    ===================================================== */

    checkboxSelected: {
        backgroundColor:
            COLORS.checkbox,

        borderColor:
            COLORS.checkbox,
    },


    /* =====================================================
       CURRENTLY WORKING TEXT
    ===================================================== */

    currentlyWorkingText: {
        fontSize: 12,

        lineHeight: 7,

        color: "#3b3b3b",

        includeFontPadding: false,
    },


    /* =====================================================
       FULL FIELD
    ===================================================== */

    fullField: {
        width: "100%",

        marginBottom: 20,
    },


    /* =====================================================
       FULL INPUT
    ===================================================== */

    fullInput: {
        width: "100%",

        height: 34,

        backgroundColor:
            "#FFFFFF",

        borderWidth: 1,

        borderColor:
            "#E5E5E5",

        borderRadius: 5,

        paddingHorizontal: 17,

        paddingVertical: 10,

        fontSize: 13,

        lineHeight: 9,

        color: "#555555",

        includeFontPadding: false,
    },


    /* =====================================================
       DESCRIPTION FIELD
    ===================================================== */

    descriptionField: {
        width: "100%",

        marginBottom: 20,
    },


    /* =====================================================
       DESCRIPTION INPUT
    ===================================================== */

    descriptionInput: {
        width: "100%",

        height: 59,

        backgroundColor:
            "#FFFFFF",

        borderWidth: 1,

        borderColor:
            "#E5E5E5",

        borderRadius: 5,

        paddingHorizontal: 7,

        paddingTop: 6,

        paddingBottom: 10,

        fontSize: 13,

        lineHeight: 9,

        color: "#3d3c3c",

        includeFontPadding: false,
    },


    /* =====================================================
       BUTTON ROW
    ===================================================== */

    buttonRow: {
        width: "100%",

        minHeight: 37,

        flexDirection: "row",

        justifyContent:
            "space-between",

        alignItems: "center",

        marginTop: 20,

        marginBottom: 5,
    },


    /* =====================================================
       CANCEL BUTTON
    ===================================================== */

    cancelButton: {
        width: "38.5%",

        height: 37,

        borderRadius: 5,

        backgroundColor:
            "#F8DDE1",

        alignItems: "center",

        justifyContent:
            "center",
    },


    /* =====================================================
       CANCEL TEXT
    ===================================================== */

    cancelText: {
        fontSize: 15,

        lineHeight: 9,

        fontWeight: "700",

        color: "#B94A55",

        includeFontPadding: false,
    },


    /* =====================================================
       SAVE BUTTON
    ===================================================== */

    saveButton: {
        width: "38.5%",

        height: 37,

        borderRadius: 5,

        backgroundColor:
            COLORS.red,

        alignItems: "center",

        justifyContent:
            "center",
    },


    /* =====================================================
       SAVE TEXT
    ===================================================== */

    saveText: {
        fontSize: 15,

        lineHeight: 9,

        fontWeight: "600",

        color: "#FFFFFF",

        includeFontPadding: false,
    },

});