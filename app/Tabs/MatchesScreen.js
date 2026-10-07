import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Image,
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
import {
    useFocusEffect,
    useNavigation,
    useRoute,
} from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// NOTE: adjust this path to wherever your Fonts file lives.
import Fonts from "../constants/Fonts";

import { postMemberListing } from "../utils/Functions";

const COLORS = {
    primary: "#B20D08",
    red: "#D20A05",
    yellow: "#F8B900",
    green: "#159447",
    text: "#242424",
    gray: "#6D6D6D",
    white: "#FFFFFF",
    background: "#FAF9F7",
};

const FALLBACK_IMAGE = require("../assets/images/Match1.png");
const getToken = async () => {
    try {
        // 1. Your login screen stores the token here
        const authToken = await AsyncStorage.getItem("authToken");

        if (authToken) {
            return authToken;
        }

        // 2. Your login screen stores the complete response here
        const userdata = await AsyncStorage.getItem("userdata");

        if (userdata) {
            try {
                const parsed = JSON.parse(userdata);

                const token =
                    parsed?.data?.token ||
                    parsed?.token ||
                    parsed?.access_token ||
                    parsed?.data?.access_token ||
                    null;

                if (token) {
                    return token;
                }
            } catch (error) {
                console.log("getToken userdata parse error:", error);
            }
        }

        // 3. Fallback keys
        const fallbackKeys = ["token", "access_token", "userToken", "auth_token"];

        for (const key of fallbackKeys) {
            const value = await AsyncStorage.getItem(key);

            if (value) {
                return value;
            }
        }

        // 4. Additional fallback
        const userStr =
            (await AsyncStorage.getItem("user")) ||
            (await AsyncStorage.getItem("user_data"));

        if (userStr) {
            try {
                const parsed = JSON.parse(userStr);

                const token =
                    parsed?.data?.token || parsed?.token || parsed?.access_token || null;

                if (token) {
                    return token;
                }
            } catch (error) {
                console.log("getToken user parse error:", error);
            }
        }

        return null;
    } catch (error) {
        console.log("getToken Error:", error);

        return null;
    }
};

function formatHeight(value) {
    if (value == null || value === "") return "";

    if (typeof value === "string" && value.includes("'")) {
        return value;
    }

    const num = Number(value);

    if (!Number.isFinite(num)) {
        return String(value);
    }

    const feet = Math.floor(num);
    const inches = Math.round((num - feet) * 10);

    return `${feet}'${inches}"`;
}

const ID_MAPS = {
    // Never Married / Divorced / Widowed -> numeric id
    maritalStatus: {
        "Never Married": 1,
        Divorced: 2,
        Widowed: 3,
    },

    // Matches SearchScreen's religion options
    religion: {
        "Hindu - Mudhiraj": 1,
        Hindu: 2,
    },

    // Matches SearchScreen's caste options
    caste: {
        Mudhiraj: 2,
        Other: 3,
    },

    // Matches SearchScreen's country options
    country: {
        India: 1,
        USA: 2,
        "United Kingdom": 3,
        Australia: 4,
        Canada: 5,
    },

    // SearchScreen's "location" is a single city+state string with no
    // separate state selector, but the API wants state_id AND city_id
    // separately. Mapping each known location string to both ids.
    location: {
        "Hyderabad, Telangana": { state_id: 1, city_id: 1 },
        "Warangal, Telangana": { state_id: 1, city_id: 2 },
        "Vijayawada, Andhra Pradesh": { state_id: 2, city_id: 3 },
        "Bengaluru, Karnataka": { state_id: 3, city_id: 4 },
    },

    // No confirmed source field for member_type on SearchScreen yet —
    // guessing it corresponds to "Looking For" (Bride/Groom). Verify
    // against backend; could instead mean membership tier (Free/Premium).
    lookingFor: {
        Bride: 1,
        Groom: 2,
    },
};

// "5'3\\" - 5'5\\"" -> { min_height: 5.3, max_height: 5.5 }
// "6'0\\"+"        -> { min_height: 6.0 }               (open-ended)
function parseHeightRange(heightLabel) {
    if (!heightLabel || typeof heightLabel !== "string") return {};

    // Matches feet'inches" pairs, e.g. 5'3" or 6'0"
    const pairs = [...heightLabel.matchAll(/(\d+)'(\d+)"/g)].map(
        ([, feet, inches]) => Number(`${feet}.${inches}`),
    );

    if (pairs.length === 0) return {};

    const result = { min_height: pairs[0] };
    if (pairs.length > 1) result.max_height = pairs[1];
    return result;
}

function parseAgeRange(ageLabel) {
    if (!ageLabel || typeof ageLabel !== "string") return {};

    // e.g. "24 - 30 yrs" -> [24, 30], "45+ yrs" -> [45, undefined]
    const numbers = ageLabel.match(/\d+/g);
    if (!numbers || numbers.length === 0) return {};

    const age_from = Number(numbers[0]);
    const age_to = numbers.length > 1 ? Number(numbers[1]) : undefined;

    return {
        ...(Number.isFinite(age_from) ? { age_from } : {}),
        ...(Number.isFinite(age_to) ? { age_to } : {}),
    };
}

function buildFiltersFromParams(params) {
    if (!params) return {};

    const isSet = (value) =>
        !!value && value !== "Select" && value !== "Select City";

    const filters = {
        // Always present per the confirmed sample body, even when empty.
        member_code: "",
    };

    const { age_from, age_to } = parseAgeRange(params.age);
    if (age_from !== undefined) filters.age_from = age_from;
    if (age_to !== undefined) filters.age_to = age_to;

    const { min_height, max_height } = parseHeightRange(params.height);
    if (min_height !== undefined) filters.min_height = min_height;
    if (max_height !== undefined) filters.max_height = max_height;

    if (isSet(params.maritalStatus)) {
        const id = ID_MAPS.maritalStatus[params.maritalStatus];
        if (id !== undefined) filters.marital_status = id;
    }

    if (isSet(params.religion)) {
        const id = ID_MAPS.religion[params.religion];
        if (id !== undefined) filters.religion_id = id;
    }

    if (isSet(params.caste)) {
        const id = ID_MAPS.caste[params.caste];
        if (id !== undefined) filters.caste_id = id;
    }

    if (isSet(params.motherTongue)) {
        filters.mother_tongue = params.motherTongue;
    }

    if (isSet(params.profession)) {
        filters.profession = params.profession;
    }

    if (isSet(params.country)) {
        const id = ID_MAPS.country[params.country];
        if (id !== undefined) filters.country_id = id;
    }

    if (isSet(params.location)) {
        const ids = ID_MAPS.location[params.location];
        if (ids) {
            filters.state_id = ids.state_id;
            filters.city_id = ids.city_id;
        }
    }

    if (isSet(params.lookingFor)) {
        const id = ID_MAPS.lookingFor[params.lookingFor];
        if (id !== undefined) filters.member_type = id;
    }

    // sub_caste_id: no corresponding filter exists on SearchScreen yet.
    // education / income / gender: not present in the confirmed API body,
    // so they're intentionally not sent.

    return filters;
}

function mapMember(api) {
    const joinedName = [api.first_name, api.last_name].filter(Boolean).join(" ");

    return {
        id: api.user_id ?? api.id ?? api.member_id,

        name: (api.name ?? api.full_name ?? joinedName) || "Unknown",

        age: api.age ?? null,

        // membership: 1 = Free, 2 = Premium
        membership: Number(api.membership ?? 1),

        profession: api.profession ?? api.occupation ?? "",

        location:
            api.location ??
            [api.city, api.state, api.country].filter(Boolean).join(", "),

        education: api.education ?? api.qualification ?? "",

        height: formatHeight(api.height ?? api.max_height),

        community:
            api.community ?? [api.religion, api.caste].filter(Boolean).join(" - "),

        image: api.photo_url
            ? { uri: api.photo_url }
            : api.photo
                ? { uri: api.photo }
                : api.profile_photo
                    ? { uri: api.profile_photo }
                    : FALLBACK_IMAGE,

        online: !!(api.is_online ?? api.online),

        newMember: !!(api.is_new ?? api.new_member),

        recentlyActive: !!(api.recently_active ?? api.last_active_recent),
    };
}
/* ===
   TABS
   member_type: 0 = All, 1 = Premium, 2 = Free
\=== */

const tabs = [
    {
        key: "All Members",
        label: "All Members",
        icon: "people",
    },
    {
        key: "Premium",
        label: "Premium Members",
        icon: "radio",
    },
    {
        key: "Free",
        label: "Free",
        icon: "star-outline",
    },
];

/* ===
   COMPONENT
\=== */

export default function MatchesScreen({ navigation, route }) {

    const params = route.params || {};

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [activeTab, setActiveTab] = useState("All Members");
    const [liked, setLiked] = useState([]);

    // Seeded from SearchScreen's recent-search chips / quick search
    // (params.search), if present.
    const [searchText, setSearchText] = useState(
        typeof params.search === "string" ? params.search : "",
    );

    useFocusEffect(
        useCallback(() => {
            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress,
            );

            return () => subscription.remove();
        }, [navigation]),
    );

    const onBackPress = () => {
        navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
        return true;
    };

    const loadMatches = async () => {
        setLoading(true);
        setLoadError("");

        try {
            const token = await getToken();
            if (!token) {
                setLoadError("Authentication token not found. Please login again.");
                return;
            }

            /*
             \* IMPORTANT:
             \*
             \* postMemberListing expects:
             \*
             \* postMemberListing(filters, token)
             \*
             \* So DO NOT use:
             \*
             \* postMemberListing(token)
             */

            const filters = buildFiltersFromParams(params);
            const result = await postMemberListing(filters, token);
            if (result?.success === 1 || result?.result === true) {
                // API returns { data: { members: [...], age_from, age_to, ... } }
                // so members live at result.data.members, not result.data directly.
                const apiData = Array.isArray(result?.data?.members)
                    ? result.data.members
                    : Array.isArray(result?.data)
                        ? result.data
                        : [];

                setMatches(apiData.filter(Boolean).map(mapMember));
            } else {
                setMatches([]);

                setLoadError(result?.message || "Unable to load matches.");
            }
        } catch (e) {
            console.log("loadMatches Error:", e);

            setLoadError(e?.message || "Unable to load matches.");
        } finally {
            setLoading(false);
        }
    };

    /* ===
       INITIAL LOAD
    \=== */

    useEffect(() => {
        loadMatches();
        // Re-fetch if the person navigates back to this screen from Search
        // with a different set of filters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        params.age,
        params.height,
        params.maritalStatus,
        params.religion,
        params.caste,
        params.motherTongue,
        params.profession,
        params.country,
        params.location,
        params.lookingFor,
    ]);

    /* ===
       FILTER MATCHES
       member_type: 0 = All, 1 = Premium, 2 = Free
    \=== */

    const filteredMatches = useMemo(() => {
        const query = searchText.trim().toLowerCase();

        return matches.filter((item) => {
            const searchableText = [
                item.name,
                item.profession,
                item.location,
                item.education,
                item.community,
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch = !query || searchableText.includes(query);

            const matchesTab =
                activeTab === "All Members" ||
                (activeTab === "Premium" && item.membership === 2) ||
                (activeTab === "Free" && item.membership === 1);

            return matchesSearch && matchesTab;
        });
    }, [matches, activeTab, searchText]);

    /* ===
       LIKE
    \=== */

    const toggleLike = (id) => {
        setLiked((previous) =>
            previous.includes(id)
                ? previous.filter((item) => item !== id)
                : [...previous, id],
        );
    };

    /* ===
       CLEAR FILTERS
    \=== */

    const clearFilters = () => {
        setSearchText("");
        setActiveTab("All Members");
    };

    /* ===
       LOADING STATE
    \=== */

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={COLORS.red} />

                    <Text style={styles.centerStateText}>Loading matches...</Text>
                </View>
            </SafeAreaView>
        );
    }

    /* ===
       MAIN UI
    \=== */

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.container}>
                {/* ===
            HEADER
        \=== */}

                <View style={styles.headerArea}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => onBackPress()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={28} color="#252525" />
                    </TouchableOpacity>

                    <View style={styles.titleSection}>
                        <Text style={styles.title}>
                            <Text style={styles.titleRed}>Members</Text>
                        </Text>

                        <Text style={styles.matchesFound}>
                            {filteredMatches.length}{" "}
                            {filteredMatches.length === 1 ? "Match" : "Members"} Found
                        </Text>
                    </View>

                    {/* ===
              SEARCH
          \=== */}

                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <Ionicons
                                name="search-outline"
                                size={23}
                                color="#555"
                                style={styles.searchIcon}
                            />

                            <TextInput
                                value={searchText}
                                onChangeText={setSearchText}
                                placeholder="Search by name, location or profession"
                                placeholderTextColor="#777"
                                style={styles.searchInput}
                                returnKeyType="search"
                            />

                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchText("")}>
                                    <Ionicons name="close-circle" size={20} color="#999" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* ===
              TABS
          \=== */}

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsScroll}
                        style={styles.tabsContainer}
                    >
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;

                            return (
                                <TouchableOpacity
                                    key={tab.key}
                                    onPress={() => setActiveTab(tab.key)}
                                    style={[styles.tab, isActive && styles.activeTab]}
                                    activeOpacity={0.8}
                                >
                                    {tab.key === "Premium" ? (
                                        <View
                                            style={[
                                                styles.onlineDot,
                                                isActive && styles.onlineDotActive,
                                            ]}
                                        />
                                    ) : (
                                        <Ionicons
                                            name={tab.icon}
                                            size={20}
                                            color={isActive ? "#FFFFFF" : "#444"}
                                        />
                                    )}

                                    <Text
                                        style={[styles.tabText, isActive && styles.activeTabText]}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* ===
            MATCH LIST
        \=== */}

                <ScrollView
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* ===
              ERROR
          \=== */}

                    {!!loadError && (
                        <View style={styles.emptyState}>
                            <Ionicons name="alert-circle-outline" size={50} color="#B5B5B5" />

                            <Text style={styles.emptyTitle}>Couldn't load matches</Text>

                            <Text style={styles.emptyText}>{loadError}</Text>

                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={loadMatches}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.emptyButtonText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ===
              EMPTY
          \=== */}

                    {!loadError && filteredMatches.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={50} color="#B5B5B5" />

                            <Text style={styles.emptyTitle}>No Matches Found</Text>

                            <Text style={styles.emptyText}>
                                Try another search or clear your filters.
                            </Text>

                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={clearFilters}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.emptyButtonText}>Clear Filters</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        !loadError &&
                        filteredMatches.map((item) => (
                            <TouchableOpacity
                                key={String(item.id)}
                                style={styles.matchCard}
                                activeOpacity={0.85}
                                onPress={() =>
                                    navigation.navigate("MatchesDetail", {
                                        id: item.id,
                                        page: route?.name,
                                        prevs: route?.params,
                                    })
                                }
                            >
                                {/* ===
                    IMAGE
                \=== */}

                                <View style={styles.imageContainer}>
                                    <Image
                                        source={item.image}
                                        style={styles.profileImage}
                                        resizeMode="cover"
                                    />

                                    {item.online && (
                                        <View style={styles.onlineBadge}>
                                            <Text style={styles.onlineText}>Online</Text>
                                        </View>
                                    )}

                                    {item.membership === 2 && (
                                        <View style={styles.premiumTag}>
                                            <Text style={styles.premiumTagText}>♛ Premium</Text>
                                        </View>
                                    )}

                                    <View style={styles.communityBadge}>
                                        <MaterialCommunityIcons
                                            name="flower-outline"
                                            size={20}
                                            color="#FFD11A"
                                        />
                                    </View>
                                </View>

                                {/* ===
                    DETAILS
                \=== */}

                                <View style={styles.detailsContainer}>
                                    <View style={styles.detailsLeft}>
                                        {/* NAME */}

                                        <View style={styles.nameRow}>
                                            <Text style={styles.name} numberOfLines={1}>
                                                {item.name}
                                                {item.age ? `, ${item.age}` : ""}
                                            </Text>

                                            <Ionicons
                                                name="checkmark-circle"
                                                size={19}
                                                color={COLORS.green}
                                                style={styles.verifiedIcon}
                                            />
                                        </View>

                                        {/* PROFESSION */}

                                        {!!item.profession && (
                                            <Text style={styles.profession} numberOfLines={1}>
                                                {item.profession}
                                            </Text>
                                        )}

                                        {/* LOCATION */}

                                        {!!item.location && (
                                            <View style={styles.infoRow}>
                                                <Ionicons
                                                    name="location-outline"
                                                    size={17}
                                                    color={COLORS.red}
                                                />

                                                <Text style={styles.infoText} numberOfLines={1}>
                                                    {item.location}
                                                </Text>
                                            </View>
                                        )}

                                        {/* EDUCATION */}

                                        {!!item.education && (
                                            <View style={styles.infoRow}>
                                                <Ionicons
                                                    name="school-outline"
                                                    size={17}
                                                    color={COLORS.red}
                                                />

                                                <Text style={styles.infoText} numberOfLines={1}>
                                                    {item.education}
                                                </Text>
                                            </View>
                                        )}

                                        {/* HEIGHT */}

                                        {!!item.height && (
                                            <View style={styles.infoRow}>
                                                <MaterialCommunityIcons
                                                    name="human-male-height"
                                                    size={18}
                                                    color={COLORS.red}
                                                />

                                                <Text style={styles.infoText}>{item.height}</Text>
                                            </View>
                                        )}

                                        {/* COMMUNITY */}

                                        {!!item.community && (
                                            <View style={styles.infoRow}>
                                                <MaterialCommunityIcons
                                                    name="account-group-outline"
                                                    size={18}
                                                    color={COLORS.red}
                                                />

                                                <Text style={styles.infoText} numberOfLines={1}>
                                                    {item.community}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* ===
                      ACTIONS
                  \=== */}

                                    <View style={styles.actionsContainer}>
                                        <TouchableOpacity
                                            style={styles.heartButton}
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                toggleLike(item.id);
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name={
                                                    liked.includes(item.id) ? "heart" : "heart-outline"
                                                }
                                                size={25}
                                                color={COLORS.red}
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.chatButton}
                                            onPress={(event) => {
                                                event.stopPropagation();
                                                // Route to the chat conversation screen for this
                                                // member, passing id (and name, for the chat
                                                // header) as route params — same pattern as the
                                                // card's own navigation.navigate to MatchesDetail
                                                // above.
                                                navigation.navigate("ChatConversation", {
                                                    id: String(item.id),
                                                    name: item.name || "",
                                                    threadId: item.chat_thread_id
                                                        ? String(item.chat_thread_id)
                                                        : "",
                                                    page: route?.name,
                                                    prevs: route?.params,
                                                });
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name="chatbubble-ellipses"
                                                size={20}
                                                color="#8E1600"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    {/* ===
              PREMIUM
          \=== */}

                    <View style={styles.premiumBanner}>
                        <View style={styles.premiumIconCircle}>
                            <Text style={styles.crownText}>♛</Text>
                        </View>

                        <View style={styles.premiumTextContainer}>
                            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>

                            <Text style={styles.premiumDescription}>
                                Unlock contact details, chat unlimited{"\n"}& more premium
                                features.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.upgradeButton}
                            activeOpacity={0.8}
                            onPress={() => console.log("Upgrade Premium")}
                        >
                            <Text style={styles.buttonCrown}>♛</Text>

                            <Text style={styles.upgradeText}>Upgrade Now</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 24 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

/* ===
   STYLES
\=== */

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F7F5F2",
    },
    container: {
        flex: 1,
        backgroundColor: "#F7F5F2",
    },
    centerState: {
        flex: 1,
        minHeight: 500,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F7F5F2",
    },
    centerStateText: {
        marginTop: 14,
        fontSize: 14,
        fontFamily: Fonts.medium,
        color: "#6B625D",
    },
    headerArea: {
        backgroundColor: "#F7F5F2",
        paddingTop: 4,
        paddingBottom: 2,
    },
    backButton: {
        width: 44,
        height: 44,
        marginLeft: 18,
        marginTop: 4,
        borderRadius: 14,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ECE5DF",
        shadowColor: "#6B2B24",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 2,
    },
    titleSection: {
        paddingHorizontal: 20,
        marginTop: 14,
    },
    title: {
        fontSize: 31,
        lineHeight: 37,
        fontFamily: Fonts.bold,
        color: "#211F1D",
        letterSpacing: -0.5,
    },
    titleRed: {
        color: "#A81712",
    },
    matchesFound: {
        marginTop: 4,
        fontSize: 13,
        fontFamily: Fonts.medium,
        color: "#817770",
    },
    searchRow: {
        flexDirection: "row",
        paddingHorizontal: 18,
        marginTop: 18,
        alignItems: "center",
    },
    searchContainer: {
        flex: 1,
        height: 54,
        borderWidth: 1,
        borderColor: "#E7DED7",
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        shadowColor: "#5E332A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 9,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: "#292624",
        minWidth: 0,
        paddingVertical: 0,
    },
    tabsContainer: {
        marginTop: 14,
        maxHeight: 52,
    },
    tabsScroll: {
        paddingHorizontal: 18,
        alignItems: "center",
    },
    tab: {
        height: 44,
        paddingHorizontal: 15,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E6DED8",
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
    },
    activeTab: {
        backgroundColor: "#A81712",
        borderColor: "#A81712",
        shadowColor: "#A81712",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 7,
        elevation: 3,
    },
    tabText: {
        fontSize: 12.5,
        fontFamily: Fonts.bold,
        color: "#57504B",
        marginLeft: 7,
    },
    activeTabText: {
        color: "#FFFFFF",
        fontFamily: Fonts.bold,
    },
    onlineDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: "#159447",
    },
    onlineDotActive: {
        backgroundColor: "#FFFFFF",
    },
    list: {
        flex: 1,
        marginTop: 14,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 2,
        paddingBottom: 90,
    },
    matchCard: {
        minHeight: 188,
        maxHeight: 188,
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        marginBottom: 14,
        flexDirection: "row",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#EEE5DF",
        shadowColor: "#4A3028",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.09,
        shadowRadius: 12,
        elevation: 4,
    },
    imageContainer: {
        width: "38%",
        minHeight: 188,
        position: "relative",
        backgroundColor: "#EDE7E2",
        overflow: "hidden",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    onlineBadge: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "#159447",
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
    },
    onlineText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontFamily: Fonts.bold,
    },
    premiumTag: {
        position: "absolute",
        bottom: 10,
        left: 10,
        backgroundColor: "#A81712",
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 9,
    },
    premiumTagText: {
        color: "#FFD333",
        fontSize: 10,
        fontFamily: Fonts.bold,
    },
    communityBadge: {
        position: "absolute",
        right: 9,
        top: 9,
        width: 31,
        height: 31,
        borderRadius: 16,
        backgroundColor: "rgba(20,15,12,0.62)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
    },
    detailsContainer: {
        flex: 1,
        flexDirection: "row",
        paddingLeft: 14,
        paddingRight: 9,
        paddingVertical: 13,
    },
    detailsLeft: {
        flex: 1,
        minWidth: 0,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 2,
    },
    name: {
        flexShrink: 1,
        maxWidth: 145,
        fontSize: 18,
        lineHeight: 23,
        fontFamily: Fonts.bold,
        color: "#9F1A15",
    },
    verifiedIcon: {
        marginLeft: 5,
    },
    profession: {
        fontSize: 12.5,
        fontFamily: Fonts.medium,
        color: "#3D3936",
        marginTop: 4,
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        minWidth: 0,
    },
    infoText: {
        flex: 1,
        minWidth: 0,
        marginLeft: 7,
        fontSize: 11.5,
        fontFamily: Fonts.regular,
        color: "#6A625D",
    },
    actionsContainer: {
        width: 43,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
    },
    heartButton: {
        width: 39,
        height: 39,
        borderRadius: 20,
        backgroundColor: "#FFF5F4",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F2DAD7",
    },
    chatButton: {
        width: 39,
        height: 39,
        borderRadius: 20,
        backgroundColor: "#F8BA00",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        elevation: 3,
        shadowColor: "#8B5C00",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.14,
        shadowRadius: 5,
    },
    premiumBanner: {
        width: "100%",
        minHeight: 82,
        backgroundColor: "#FFF9EC",
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 11,
        marginTop: 3,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F1D99A",
        shadowColor: "#8D681A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 9,
        elevation: 2,
    },
    premiumIconCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: "#A81712",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    crownText: {
        fontSize: 25,
        color: "#FFD333",
        fontFamily: Fonts.bold,
    },
    premiumTextContainer: {
        flex: 1,
        justifyContent: "center",
    },
    premiumTitle: {
        fontSize: 13,
        fontFamily: Fonts.bold,
        color: "#8F1813",
        marginBottom: 3,
    },
    premiumDescription: {
        fontSize: 9.5,
        lineHeight: 13,
        color: "#756A61",
        fontFamily: Fonts.medium,
    },
    upgradeButton: {
        height: 38,
        minWidth: 88,
        backgroundColor: "#A81712",
        borderRadius: 11,
        paddingHorizontal: 9,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 7,
        shadowColor: "#8B160F",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 3,
    },
    buttonCrown: {
        fontSize: 13,
        fontFamily: Fonts.regular,
        color: "#FFD333",
        marginRight: 4,
    },
    upgradeText: {
        fontSize: 10,
        fontFamily: Fonts.bold,
        color: "#FFFFFF",
    },
    emptyState: {
        minHeight: 270,
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        marginTop: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#ECE4DE",
    },
    emptyTitle: {
        marginTop: 12,
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: "#302C29",
        textAlign: "center",
    },
    emptyText: {
        marginTop: 7,
        fontSize: 12.5,
        lineHeight: 19,
        fontFamily: Fonts.regular,
        color: "#7A716B",
        textAlign: "center",
    },
    emptyButton: {
        marginTop: 18,
        height: 43,
        paddingHorizontal: 24,
        borderRadius: 13,
        backgroundColor: "#A81712",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontFamily: Fonts.bold,
    },
});