import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colors } from "../constants/colors";
import Fonts from "../constants/Fonts";
import { getMyShortlists, removeFromShortlist } from "../utils/Functions";

const FALLBACK_PHOTO = require("../assets/images/Match5.png");

/* =========================================================
   GET TOKEN (same pattern used across the app)
========================================================= */
const getToken = async () => {
    try {
        const authToken = await AsyncStorage.getItem("authToken");
        if (authToken) return authToken;

        const userdata = await AsyncStorage.getItem("userdata");
        if (userdata) {
            try {
                const parsed = JSON.parse(userdata);
                const token =
                    parsed?.data?.token || parsed?.token || parsed?.access_token || null;
                if (token) return token;
            } catch (error) {
                console.log("getToken userdata parse error:", error);
            }
        }

        return null;
    } catch (error) {
        console.log("getToken Error:", error);
        return null;
    }
};

/* =========================================================
   API -> UI MAPPING
   Adjust field names once you confirm the real response
   shape from /api/member/my-shortlists
========================================================= */
function mapShortlistProfile(api) {
    const joinedName = [api.first_name, api.last_name].filter(Boolean).join(" ");

    return {
        id: api.id ?? api.user_id ?? api.member_id,
        name: (api.name ?? api.full_name ?? joinedName) || "Unknown",
        age: api.age ?? null,
        profession: api.profession ?? api.occupation ?? "",
        location: api.location ?? [api.city, api.state].filter(Boolean).join(", "),
        education: api.education ?? api.qualification ?? "",
        religionCaste:
            api.religion_caste ??
            [api.religion, api.caste].filter(Boolean).join(", "),
        online: !!(api.is_online ?? api.online),
        verified: !!(api.is_verified ?? api.verified),
        image: api.photo_url
            ? { uri: api.photo_url }
            : api.photo
                ? { uri: api.photo }
                : FALLBACK_PHOTO,
    };
}

export default function ShortlistedProfilesScreen() {
    const navigation = useNavigation();

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return true;
        }
        return false;
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            loadShortlists();

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                handleBack,
            );

            return () => subscription.remove();
        }, [handleBack]),
    );

    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [togglingId, setTogglingId] = useState(null);

    /* =========================================================
       LOAD SHORTLISTS
    ========================================================= */
    const loadShortlists = async () => {
        setLoading(true);
        setLoadError("");

        try {
            const token = await getToken();

            if (!token) {
                setLoadError("Authentication token not found. Please login again.");
                return;
            }

            const result = await getMyShortlists(token);
            console.log("getMyShortlists result:", JSON.stringify(result));

            if (result?.success === 1 || result?.result === true) {
                const apiData =
                    result?.data?.shortlists ??
                    result?.data?.members ??
                    (Array.isArray(result?.data) ? result.data : []);

                setProfiles(apiData.filter(Boolean).map(mapShortlistProfile));
            } else {
                setProfiles([]);
                setLoadError(result?.message || "Unable to load shortlisted profiles.");
            }
        } catch (e) {
            console.log("loadShortlists Error:", e);
            setLoadError(e?.message || "Unable to load shortlisted profiles.");
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       REMOVE FROM SHORTLIST
    ========================================================= */
    const handleRemove = async (id) => {
        setTogglingId(id);

        try {
            const token = await getToken();
            if (!token) {
                setLoadError("Authentication token not found. Please login again.");
                return;
            }

            const result = await removeFromShortlist(id, token);
            console.log("removeFromShortlist result:", JSON.stringify(result));

            if (result?.success === 1 || result?.result === true) {
                setProfiles((prev) => prev.filter((p) => p.id !== id));
            } else {
                setLoadError(result?.message || "Unable to update shortlist.");
            }
        } catch (e) {
            console.log("handleRemove Error:", e);
            setLoadError(e?.message || "Unable to update shortlist.");
        } finally {
            setTogglingId(null);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color={Colors.primaryRed} />
                    <Text style={styles.centerStateText}>
                        Loading shortlisted profiles...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryRed} />

            {/* ================= HEADER ================= */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerIconButton}
                    onPress={handleBack}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="arrow-left" size={24} color={Colors.white} />
                </TouchableOpacity>

                <View style={styles.headerTextBlock}>
                    <Text style={styles.headerTitle}>Shortlists</Text>
                    <Text style={styles.headerSubtitle}>Your saved profiles</Text>
                </View>

                <TouchableOpacity
                    style={styles.headerIconButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="heart" size={22} color={Colors.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ================= SHORTLIST BANNER ================= */}
                <View style={styles.bannerCard}>
                    <View style={styles.bannerIconCircle}>
                        <Feather name="bookmark" size={20} color={Colors.white} />
                    </View>
                    <View style={styles.bannerTextBlock}>
                        <Text style={styles.bannerTitle}>Your Shortlist</Text>
                        <Text style={styles.bannerSubtitle}>
                            Keep track of profiles you are interested in.
                        </Text>
                    </View>
                    <View style={styles.bannerCountBadge}>
                        <Text style={styles.bannerCountText}>
                            {profiles.length} Profile{profiles.length === 1 ? "" : "s"}
                        </Text>
                    </View>
                </View>

                {/* ================= ERROR ================= */}
                {!!loadError && (
                    <View style={styles.errorBanner}>
                        <Feather name="alert-circle" size={16} color={Colors.primaryRed} />
                        <Text style={styles.errorBannerText}>{loadError}</Text>
                        <TouchableOpacity onPress={loadShortlists}>
                            <Text style={styles.retryLink}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ================= PROFILE LIST ================= */}
                <View style={styles.profileList}>
                    {profiles.map((profile) => (
                        <ProfileCard
                            key={profile.id}
                            profile={profile}
                            isToggling={togglingId === profile.id}
                            onRemove={() => handleRemove(profile.id)}
                        />
                    ))}
                </View>

                {/* ================= EMPTY / END-OF-LIST FOOTER ================= */}
                <View style={styles.footerEmpty}>
                    <View style={styles.footerIconCircle}>
                        <Feather name="bookmark" size={30} color={Colors.primaryRed} />
                    </View>
                    <Text style={styles.footerTitle}>
                        {profiles.length === 0
                            ? "No shortlisted profiles yet"
                            : "No more profiles in shortlist"}
                    </Text>
                    <Text style={styles.footerSubtitle}>
                        Add profiles to your shortlist for easy access.
                    </Text>
                    <TouchableOpacity
                        style={styles.exploreButton}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate("Matches")}
                    >
                        <Feather name="search" size={15} color={Colors.white} />
                        <Text style={styles.exploreButtonText}>Explore More Profiles</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ================= SUBCOMPONENTS =================

function ProfileCard({ profile, isToggling, onRemove }) {
    const metaLine1 = [profile.age, profile.location].filter(Boolean).join(", ");
    const metaLine2 = [profile.education, profile.profession]
        .filter(Boolean)
        .join(", ");

    return (
        <View style={styles.profileCard}>
            <View style={styles.photoWrapper}>
                <Image source={profile.image} style={styles.photo} resizeMode="cover" />
                {profile.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.infoColumn}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {profile.name}
                    </Text>
                    {profile.verified && (
                        <Feather
                            name="check-circle"
                            size={16}
                            color={Colors.success}
                            style={styles.verifiedIcon}
                        />
                    )}
                </View>

                {!!metaLine1 && <Text style={styles.metaText}>{metaLine1}</Text>}
                {!!metaLine2 && <Text style={styles.metaText}>{metaLine2}</Text>}
                {!!profile.religionCaste && (
                    <Text style={styles.metaText}>{profile.religionCaste}</Text>
                )}

                <View style={styles.tagsRow}>
                    {!!profile.profession && (
                        <Tag icon="briefcase" label={profile.profession} />
                    )}
                    {!!profile.location && (
                        <Tag icon="location" label={profile.location} />
                    )}
                </View>
            </View>

            <View style={styles.actionsColumn}>
                <TouchableOpacity
                    style={styles.menuButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Feather name="more-vertical" size={16} color={Colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.removeButton}
                    activeOpacity={0.8}
                    onPress={onRemove}
                    disabled={isToggling}
                >
                    {isToggling ? (
                        <ActivityIndicator size="small" color={Colors.primaryRed} />
                    ) : (
                        <>
                            <Feather name="heart" size={13} color={Colors.primaryRed} />
                            <Text style={styles.removeText}>Remove</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

function Tag({ icon, label }) {
    return (
        <View style={styles.tag}>
            <Feather name={icon} size={11} color={Colors.primaryRed} />
            <Text style={styles.tagText} numberOfLines={1}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    centerState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    centerStateText: {
        marginTop: 12,
        fontSize: Fonts.size.md,
        color: Colors.textSecondary,
    },

    /* ===== HEADER ===== */
    header: {
        backgroundColor: Colors.primaryRed,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 6,
        paddingBottom: 18,
    },
    headerIconButton: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTextBlock: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: Fonts.size.xxl,
        fontFamily: Fonts.extraBold,
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: Fonts.size.sm,
        fontFamily: Fonts.regular,
        color: "#FBDCDC",
        marginTop: 2,
    },

    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 16,
        paddingBottom: 28,
    },

    /* ===== BANNER ===== */
    bannerCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FBE6E2",
        borderRadius: 16,
        padding: 14,
        gap: 12,
        marginBottom: 18,
    },
    bannerIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: Colors.primaryRed,
        alignItems: "center",
        justifyContent: "center",
    },
    bannerTextBlock: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: Fonts.size.md,
        fontFamily: Fonts.bold,
        color: Colors.primaryRedDark,
    },
    bannerSubtitle: {
        fontSize: Fonts.size.sm,
        fontFamily: Fonts.regular,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    bannerCountBadge: {
        backgroundColor: "#F6C9C0",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    bannerCountText: {
        fontSize: Fonts.size.sm,
        fontFamily: Fonts.bold,
        color: Colors.primaryRedDark,
    },

    /* ===== ERROR ===== */
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        gap: 8,
    },
    errorBannerText: {
        flex: 1,
        fontSize: Fonts.size.sm,
        color: Colors.primaryRed,
        fontFamily: Fonts.regular,
    },
    retryLink: {
        fontSize: Fonts.size.sm,
        fontFamily: Fonts.bold,
        color: Colors.primaryRed,
        textDecorationLine: "underline",
    },

    /* ===== PROFILE LIST ===== */
    profileList: {
        gap: 14,
    },
    profileCard: {
        flexDirection: "row",
        backgroundColor: Colors.cardBackground,
        borderRadius: 18,
        padding: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    photoWrapper: {
        width: 78,
        height: 96,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: Colors.border,
    },
    photo: {
        width: "100%",
        height: "100%",
    },
    onlineDot: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.success,
        borderWidth: 2,
        borderColor: Colors.white,
    },

    infoColumn: {
        flex: 1,
        justifyContent: "center",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    name: {
        fontSize: Fonts.size.md,
        fontFamily: Fonts.bold,
        color: Colors.textPrimary,
        flexShrink: 1,
    },
    verifiedIcon: {
        marginLeft: 5,
    },
    metaText: {
        fontSize: Fonts.size.sm,
        fontFamily: Fonts.regular,
        color: Colors.textMuted,
        marginTop: 3,
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FBE6E2",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
        maxWidth: 130,
    },
    tagText: {
        fontSize: Fonts.size.xs,
        fontFamily: Fonts.semiBold,
        color: Colors.primaryRedDark,
        flexShrink: 1,
    },

    actionsColumn: {
        width: 78,
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingVertical: 2,
    },
    menuButton: {
        width: 26,
        height: 26,
        alignItems: "center",
        justifyContent: "center",
    },
    removeButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.3,
        borderColor: Colors.primaryRed,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 7,
        gap: 4,
    },
    removeText: {
        fontSize: Fonts.size.xs,
        fontFamily: Fonts.bold,
        color: Colors.primaryRed,
    },

    /* ===== FOOTER / EMPTY STATE ===== */
    footerEmpty: {
        alignItems: "center",
        paddingTop: 34,
        paddingHorizontal: 16,
    },
    footerIconCircle: {
        width: 78,
        height: 78,
        borderRadius: 39,
        backgroundColor: "#FBE6E2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    footerTitle: {
        fontSize: Fonts.size.base,
        fontFamily: Fonts.bold,
        color: Colors.textPrimary,
        textAlign: "center",
    },
    footerSubtitle: {
        fontSize: Fonts.size.sm,
        fontFamily: Fonts.regular,
        color: Colors.textMuted,
        textAlign: "center",
        marginTop: 6,
        marginBottom: 20,
    },
    exploreButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.primaryRed,
        borderRadius: 12,
        paddingHorizontal: 22,
        paddingVertical: 13,
        gap: 8,
    },
    exploreButtonText: {
        fontSize: Fonts.size.md,
        fontFamily: Fonts.bold,
        color: Colors.white,
    },
});
