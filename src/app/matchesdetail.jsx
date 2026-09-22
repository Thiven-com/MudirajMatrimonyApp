import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";
import {
  addToShortlist,
  expressInterest,
  getMemberInfo,
  getPublicProfile,
  rejectInterest,
  removeFromShortlist,
} from "../utils/Functions";

const LOGO = require("../../assets/images/logo.png");
const FALLBACK_PHOTO = require("../../assets/images/Match4.png");

const TABS = [
  { key: "about", label: "About", icon: "person" },
  { key: "family", label: "Family", icon: "people" },
  { key: "lifestyle", label: "Lifestyle", icon: "cafe" },
  { key: "career", label: "Education & Career", icon: "briefcase" },
  { key: "photos", label: "Photos", icon: "image" },
];

/* =========================================================
   GET TOKEN (same pattern as matches screen)
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

    const fallbackKeys = ["token", "access_token", "userToken", "auth_token"];
    for (const key of fallbackKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) return value;
    }

    return null;
  } catch (error) {
    console.log("getToken Error:", error);
    return null;
  }
};

/* =========================================================
   TOLERANT STATUS / RESPONSE HELPERS
   Backend responses for booleans/statuses aren't always the
   exact shape we expect (1 vs true vs "1" vs "sent" vs an
   object). These helpers normalize all the shapes we've seen
   so state doesn't silently fail to restore after a reload.
========================================================= */

// Was interest sent to this member? Accepts many possible
// backend representations of "yes, sent/pending/accepted".
function isInterestSentStatus(status) {
  if (status === null || status === undefined) return false;
  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;
  const s = String(status).toLowerCase().trim();
  return [
    "sent",
    "1",
    "true",
    "pending",
    "accepted",
    "yes",
    "requested",
    "interest_sent",
    "interest sent",
  ].includes(s);
}

// Was interest rejected/declined for this member?
function isInterestRejectedStatus(status) {
  if (status === null || status === undefined) return false;
  const s = String(status).toLowerCase().trim();
  return [
    "rejected",
    "declined",
    "reject",
    "decline",
    "0_rejected",
    "no",
  ].includes(s);
}

// Is this member currently shortlisted? Accepts booleans,
// 1/0, "1"/"0", "true"/"false".
function isShortlistedValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const s = String(value).toLowerCase().trim();
  return ["1", "true", "yes", "shortlisted"].includes(s);
}

// Generic "did this API call succeed" check. Backends are
// inconsistent about success ? 1 : true : "success" etc, so
// this checks every shape we've seen instead of one strict form.
function isSuccessResponse(result) {
  if (!result) return false;
  const s = result.success;
  const r = result.result;
  const st = result.status;
  if (s === 1 || s === true || s === "1" || s === "true") return true;
  if (r === 1 || r === true || r === "1" || r === "true") return true;
  if (typeof st === "string" && st.toLowerCase() === "success") return true;
  if (st === 1 || st === true) return true;
  return false;
}

// The backend returns a "failure" response with a message like
// "Already Expressed The Interest" when interest was already sent
// in a previous call. That's not actually a failure from the user's
// point of view — it confirms the interest IS sent — so this lets
// callers recognize it and update the UI to the "already done" state
// instead of showing a retry-able error.
function isAlreadyDoneMessage(message) {
  if (!message || typeof message !== "string") return false;
  const m = message.toLowerCase();
  return (
    m.includes("already") &&
    (m.includes("interest") ||
      m.includes("shortlist") ||
      m.includes("expressed") ||
      m.includes("reject"))
  );
}

/* =========================================================
   API -> UI MAPPING
   Confirmed against a real /api/member/public-profile/:id
   response:
   {
     intoduction: { introduction: "..." },   // note: API's own typo
     basic_info: { first_name, last_name, age, religion, caste,
                    date_of_birth, gender, phone, maritial_status,
                    photo, ... },
     contact_details: { email, phone },
     education: [ {...} ],
     career: [ {...} ],
     physical_attributes: null | {...},
     photo_gallery: [ {...} ],
     view_contact_check: false,   // gates whether phone can be shown
     ...
   }
   This flattens that into the flat shape the UI expects, while
   still falling back to flat/top-level fields in case a
   different endpoint (or a future API version) sends data
   un-nested.

   routeId is passed in as a fallback for `id` since the detail
   payload itself doesn't include an id/user_id field anywhere.
========================================================= */
function getDisplayValue(value) {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => getDisplayValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return String(
      value.name ??
        value.label ??
        value.value ??
        value.title ??
        value.qualification ??
        value.degree ??
        "",
    );
  }

  return String(value);
}

function mapProfile(api, routeId) {
  const basic = api.basic_info ?? api;
  const intro = api.intoduction ?? api.introduction ?? {};
  const contact = api.contact_details ?? {};
  const educationList = Array.isArray(api.education) ? api.education : [];
  const careerList = Array.isArray(api.career) ? api.career : [];
  const physical = api.physical_attributes ?? {};

  const joinedName = [basic.first_name, basic.last_name]
    .filter(Boolean)
    .join(" ");

  // Phone is only meaningful to show once the backend says contact info
  // has been unlocked for this viewer (view_contact_check). We still
  // track whether a phone number *exists* so the UI can show a
  // "locked" state instead of just hiding the row entirely.
  const canViewContact = !!api.view_contact_check;
  const rawPhone = contact.phone ?? basic.phone ?? "";

  // Widened field lookups: different endpoints (member-info vs
  // public-profile) have been seen to use different key names for
  // the same concept, and the "success" value shape isn't consistent
  // either (1 vs true vs nested). Check every plausible key here;
  // isInterestSentStatus / isShortlistedValue handle the value shape.
  const rawInterestStatus =
    api.interest_status ??
    api.interest_sent_status ??
    api.interestStatus ??
    api.interest_sent ??
    api?.interest?.status ??
    api?.interest_details?.status ??
    null;

  const rawShortlisted =
    api.is_shortlisted ??
    api.shortlisted ??
    api.is_shortlist ??
    api?.shortlist?.status ??
    null;

  return {
    id: api.id ?? api.user_id ?? basic.id ?? routeId ?? null,
    name: (basic.name ?? basic.full_name ?? joinedName) || "Unknown",
    age: basic.age ?? null,
    gender: basic.gender ?? "",
    profession: getDisplayValue(
      basic.profession ??
        basic.occupation ??
        careerList[0]?.profession ??
        careerList[0]?.designation ??
        "",
    ),
    location: getDisplayValue(
      basic.location ?? [basic.city, basic.state].filter(Boolean).join(", "),
    ),
    education: getDisplayValue(
      educationList[0]?.qualification ??
        educationList[0]?.degree ??
        basic.education ??
        basic.qualification ??
        "",
    ),
    height: getDisplayValue(
      physical.height ?? basic.height_text ?? basic.height ?? "",
    ),
    religion: getDisplayValue(basic.religion),
    caste: getDisplayValue(basic.caste),
    subCaste: getDisplayValue(basic.sub_caste),
    dob: getDisplayValue(basic.date_of_birth ?? basic.dob ?? ""),
    maritalStatus: getDisplayValue(
      basic.maritial_status ?? basic.marital_status ?? "",
    ),
    motherTongue: getDisplayValue(
      api.mother_tongue ?? basic.mothere_tongue ?? basic.mother_tongue ?? "",
    ),
    bloodGroup: getDisplayValue(
      physical.blood_group ?? basic.blood_group ?? "",
    ),
    annualIncome: getDisplayValue(basic.annual_income ?? ""),
    aboutMyself: getDisplayValue(
      intro.introduction ?? api.about ?? api.about_myself ?? "",
    ),
    online: !!(basic.is_online ?? basic.online),
    verified: !!(basic.is_verified ?? basic.verified),
    canViewContact,
    // Only expose the actual number once the backend has unlocked it.
    phone: canViewContact ? rawPhone : "",
    // Lets the UI show a "locked" row instead of nothing when a phone
    // exists on the backend but hasn't been unlocked for this viewer.
    hasPhone: !!rawPhone,
    photoCount: Array.isArray(api.photo_gallery)
      ? api.photo_gallery.length || 1
      : (basic.photo_count ?? 1),
    image: basic.photo_url
      ? { uri: basic.photo_url }
      : basic.photo
        ? { uri: basic.photo }
        : FALLBACK_PHOTO,
    // Whether THIS member is already shortlisted / has an interest
    // already sent to them, if the API tells us up front.
    isShortlisted: isShortlistedValue(rawShortlisted),
    interestStatus: rawInterestStatus,
  };
}

export default function ProfileDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params ?? {};
  const rawId = params.id ?? params.memberId;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  console.log("PROFILE ROUTE PARAMS:", params);
  console.log("PROFILE MEMBER ID:", id);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeTab, setActiveTab] = useState("about");
  const [showMore, setShowMore] = useState(false);

  const [authToken, setAuthToken] = useState(null);

  // -- Send interest --
  const [sendingInterest, setSendingInterest] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [interestError, setInterestError] = useState("");

  // -- Reject interest --
  const [rejecting, setRejecting] = useState(false);
  const [interestRejected, setInterestRejected] = useState(false);
  const [rejectError, setRejectError] = useState("");

  // -- Shortlist (add / remove) --
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);
  const [shortlistError, setShortlistError] = useState("");

  /* =========================================================
     HARDWARE BACK BUTTON
     Same useFocusEffect + BackHandler pattern used on
     HomeScreen / MatchesScreen / ProfileDetails / SearchScreen:
     active only while this screen is focused, cleaned up on
     blur/unmount.
  ========================================================= */
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  /* =========================================================
     LOAD PROFILE
     Calls BOTH getMemberInfo (authenticated, full detail) and
     getPublicProfile (public view) in parallel, then merges
     them — memberData takes priority over publicData on any
     overlapping fields.
  ========================================================= */
  const loadProfile = async () => {
    setLoading(true);
    setLoadError("");

    try {
      if (!id) {
        setLoadError("Missing member id.");
        return;
      }

      const token = await getToken();
      console.log("loadProfile Token:", token ? "FOUND" : "NOT FOUND");
      console.log("loadProfile id:", id);

      if (!token) {
        setLoadError("Authentication token not found. Please login again.");
        return;
      }

      setAuthToken(token);

      const [memberResult, publicResult] = await Promise.all([
        getMemberInfo(id, token),
        getPublicProfile(id, token),
      ]);

      console.log("getMemberInfo result:", JSON.stringify(memberResult));
      console.log("getPublicProfile result:", JSON.stringify(publicResult));

      // Confirmed shape: { result: true, data: {...} } — data is the
      // profile object directly, NOT nested under data.member.
      const memberData = isSuccessResponse(memberResult)
        ? (memberResult?.data?.member ?? memberResult?.data ?? null)
        : null;

      const publicData = isSuccessResponse(publicResult)
        ? (publicResult?.data?.member ?? publicResult?.data ?? null)
        : null;

      if (!memberData && !publicData) {
        setLoadError(
          memberResult?.message ||
            publicResult?.message ||
            "Unable to load profile.",
        );
        return;
      }

      // Merge: public profile as the base, member info overrides/fills in on top
      const merged = { ...publicData, ...memberData };

      // DEBUG: if interest/shortlist state still doesn't persist after
      // this fix, check this log for the actual field name/value your
      // backend returns and add it to the lookups in mapProfile /
      // the isInterestSentStatus / isShortlistedValue helpers above.
      console.log(
        "loadProfile interest/shortlist raw fields:",
        JSON.stringify({
          interest_status: merged.interest_status,
          interest_sent_status: merged.interest_sent_status,
          interest_sent: merged.interest_sent,
          is_shortlisted: merged.is_shortlisted,
          shortlisted: merged.shortlisted,
        }),
      );

      const mapped = mapProfile(merged, id);

      setProfile(mapped);

      // Seed local toggle state from whatever the API already told us,
      // using tolerant checks so differing backend value shapes don't
      // silently fail to restore state after a reload/remount.
      setIsShortlisted(!!mapped.isShortlisted);

      if (isInterestSentStatus(mapped.interestStatus)) {
        setInterestSent(true);
        setInterestRejected(false);
      } else if (isInterestRejectedStatus(mapped.interestStatus)) {
        setInterestRejected(true);
        setInterestSent(false);
      } else {
        setInterestSent(false);
        setInterestRejected(false);
      }
    } catch (e) {
      console.log("loadProfile Error:", e);
      setLoadError(e?.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Shared token resolver used by every action handler below.
  ========================================================= */
  const ensureToken = async () => {
    let token = authToken;
    if (!token) {
      token = await getToken();
      setAuthToken(token);
    }
    return token;
  };

  /* =========================================================
     SEND INTEREST
     Calls POST /api/member/express-interest with the profile's
     member id. Falls back to the route's `id` param if the API
     response never echoed back an id of its own (some
     public-profile/member-info payloads don't include one).
     Guards against double-taps and missing token.
  ========================================================= */
  const handleSendInterest = async () => {
    if (sendingInterest || interestSent) return;

    const targetId = profile?.id ?? id;

    console.log("TARGET MEMBER ID:", targetId);

    if (!targetId) {
      setInterestError("Unable to identify this member.");
      return;
    }

    const token = await ensureToken();
    if (!token) {
      setInterestError("Please login again.");
      return;
    }

    setSendingInterest(true);
    setInterestError("");

    try {
      const result = await expressInterest(targetId, token);
      console.log(
        "EXPRESS INTEREST RESPONSE:",
        JSON.stringify(result, null, 2),
      );

      if (isSuccessResponse(result)) {
        setInterestSent(true);
        setInterestRejected(false);
      } else if (isAlreadyDoneMessage(result?.message)) {
        // Backend says "already expressed" — this confirms interest
        // WAS sent successfully before, so reflect that in the UI
        // instead of surfacing it as an actionable error.
        setInterestSent(true);
        setInterestRejected(false);
        setInterestError("");
      } else {
        setInterestError(result?.message || "Unable to send interest.");
      }
    } catch (e) {
      console.log("expressInterest Error:", e);
      setInterestError(e?.message || "Unable to send interest.");
    } finally {
      setSendingInterest(false);
    }
  };

  /* =========================================================
     REJECT INTEREST
     Calls POST /api/member/reject-interest (or equivalent) with
     the profile's member id — used when an incoming interest
     from this member should be declined. Guards against
     double-taps and missing token, same pattern as send interest.
  ========================================================= */
  const handleRejectInterest = async () => {
    if (rejecting || interestRejected) return;

    const targetId = profile?.id ?? id;

    if (!targetId) {
      setRejectError("Unable to identify this member.");
      return;
    }

    const token = await ensureToken();
    if (!token) {
      setRejectError("Please login again.");
      return;
    }

    setRejecting(true);
    setRejectError("");

    try {
      const result = await rejectInterest(targetId, token);
      console.log("rejectInterest result:", JSON.stringify(result));

      if (isSuccessResponse(result)) {
        setInterestRejected(true);
        setInterestSent(false);
      } else if (isAlreadyDoneMessage(result?.message)) {
        setInterestRejected(true);
        setInterestSent(false);
        setRejectError("");
      } else {
        setRejectError(result?.message || "Unable to reject interest.");
      }
    } catch (e) {
      console.log("rejectInterest Error:", e);
      setRejectError(e?.message || "Unable to reject interest.");
    } finally {
      setRejecting(false);
    }
  };

  /* =========================================================
     TOGGLE SHORTLIST
     Calls addToShortlist / removeFromShortlist depending on
     current local state. Optimistic-ish: only flips state after
     a confirmed success response. Guards against double-taps
     and missing token.
  ========================================================= */
  const handleToggleShortlist = async () => {
    if (shortlisting) return;

    const targetId = profile?.id ?? id;

    if (!targetId) {
      setShortlistError("Unable to identify this member.");
      return;
    }

    const token = await ensureToken();
    if (!token) {
      setShortlistError("Please login again.");
      return;
    }

    setShortlisting(true);
    setShortlistError("");

    try {
      const result = isShortlisted
        ? await removeFromShortlist(targetId, token)
        : await addToShortlist(targetId, token);

      console.log("toggleShortlist result:", JSON.stringify(result));

      if (isSuccessResponse(result)) {
        setIsShortlisted((prev) => !prev);
      } else if (isAlreadyDoneMessage(result?.message)) {
        // e.g. "Already shortlisted" — reflect the true end state
        // rather than showing an actionable error.
        setIsShortlisted(!isShortlisted ? true : isShortlisted);
        setShortlistError("");
      } else {
        setShortlistError(result?.message || "Unable to update shortlist.");
      }
    } catch (e) {
      console.log("toggleShortlist Error:", e);
      setShortlistError(e?.message || "Unable to update shortlist.");
    } finally {
      setShortlisting(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primaryRed} />
          <Text style={styles.centerStateText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={50} color="#B5B5B5" />
          <Text style={styles.centerStateText}>
            {loadError || "Unable to load profile."}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const ABOUT_LEFT = [
    { icon: "calendar", label: "Date of Birth", value: profile.dob },
    {
      icon: "AGE",
      label: "Age",
      value: profile.age ? `${profile.age} Years` : "",
    },
    { icon: "gender", label: "Gender", value: profile.gender },
    { icon: "ruler", label: "Height", value: profile.height },
    { icon: "marital", label: "Marital Status", value: profile.maritalStatus },
    { icon: "R", label: "Mother Tongue", value: profile.motherTongue },
    { icon: "blood", label: "Blood Group", value: profile.bloodGroup },
  ];

  const ABOUT_RIGHT = [
    { icon: "om", label: "Religion", value: profile.religion },
    { icon: "people", label: "Caste", value: profile.caste },
    { icon: "people2", label: "Sub Caste", value: profile.subCaste },
    { icon: "school", label: "Education", value: profile.education },
    { icon: "briefcase", label: "Profession", value: profile.profession },
    { icon: "rupee", label: "Annual Income", value: profile.annualIncome },
  ];

  const aboutMyselfShort = profile.aboutMyself.slice(0, 140);
  const hasMoreText = profile.aboutMyself.length > 140;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= TOP BAR ================= */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={26} color={Colors.primaryRed} />
          </TouchableOpacity>

          <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
        </View>

        {/* ================= PHOTO + SUMMARY ROW ================= */}
        <View style={styles.summaryRow}>
          <View style={styles.photoCard}>
            <Image
              source={profile.image}
              style={styles.photo}
              resizeMode="cover"
            />
            {profile.online && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            )}
            <View style={styles.photoCounter}>
              <Ionicons name="images-outline" size={12} color={Colors.white} />
              <Text style={styles.photoCounterText}>
                1/{profile.photoCount}
              </Text>
              <Ionicons
                name="expand-outline"
                size={12}
                color={Colors.white}
                style={{ marginLeft: 4 }}
              />
            </View>
          </View>

          <View style={styles.infoPanel}>
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>
                {profile.name}
                {profile.age ? `, ${profile.age}` : ""}
              </Text>
              {profile.verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.success}
                  style={{ marginLeft: 6 }}
                />
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={Colors.primaryRed}
                />
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ marginLeft: 12 }}
                onPress={handleRejectInterest}
                disabled={rejecting || interestRejected}
              >
                {rejecting ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.textSecondary}
                  />
                ) : (
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={
                      interestRejected ? Colors.textMuted : Colors.textSecondary
                    }
                  />
                )}
              </TouchableOpacity>
            </View>

            {!!profile.profession && (
              <Text style={styles.professionText}>{profile.profession}</Text>
            )}

            {!!profile.location && (
              <DetailRow icon="location" text={profile.location} />
            )}
            {!!profile.education && (
              <DetailRow icon="school-outline" text={profile.education} />
            )}
            {!!profile.height && (
              <DetailRow icon="resize-outline" text={profile.height} />
            )}
            {(!!profile.religion || !!profile.caste) && (
              <DetailRow
                icon="om"
                text={[profile.religion, profile.caste]
                  .filter(Boolean)
                  .join(" - ")}
              />
            )}
            {!!profile.subCaste && (
              <DetailRow icon="people-outline" text={profile.subCaste} />
            )}

            {/* Contact info: only show the real number once the backend
                has unlocked it (view_contact_check). If a number exists
                but isn't unlocked yet, show a locked row instead of
                leaking it or hiding it silently. */}
            {profile.canViewContact && !!profile.phone ? (
              <DetailRow icon="call-outline" text={profile.phone} />
            ) : profile.hasPhone ? (
              <View style={styles.lockedContactRow}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={Colors.textMuted}
                  style={styles.detailIcon}
                />
                <Text style={styles.lockedContactText}>
                  Contact locked — send interest or upgrade to view
                </Text>
              </View>
            ) : null}

            {profile.verified && (
              <View style={styles.verifiedBanner}>
                <View style={styles.verifiedIconCircle}>
                  <Ionicons
                    name="shield-checkmark"
                    size={18}
                    color={Colors.primaryRed}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.verifiedTitle}>
                    100% Verified Profile
                  </Text>
                  <Text style={styles.verifiedSubtitle}>
                    Verified by Mudhiraj Matrimony
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ================= QUICK ACTIONS ================= */}
        {/*<View style={styles.quickActionsCard}>
          <QuickAction
            icon={isShortlisted ? "heart" : "heart-outline"}
            label={isShortlisted ? "Shortlisted" : "Shortlist"}
            color={Colors.primaryRed}
            onPress={handleToggleShortlist}
            disabled={shortlisting}
            loading={shortlisting}
          />
          <QuickAction
            icon={interestSent ? "star" : "star-outline"}
            label={interestSent ? "Interest Sent" : "Send Interest"}
            color={Colors.gold}
            onPress={handleSendInterest}
            disabled={sendingInterest || interestSent}
            loading={sendingInterest}
          />
          <QuickAction
            icon="chatbubble-ellipses-outline"
            label="Message"
            color={Colors.primaryRed}
          />
          <QuickAction
            icon="call-outline"
            label="Request Contact"
            color={Colors.success}
          />
          <QuickAction
            icon={interestRejected ? "close-circle" : "close-circle-outline"}
            label={interestRejected ? "Rejected" : "Reject"}
            color={Colors.textSecondary}
            onPress={handleRejectInterest}
            disabled={rejecting || interestRejected}
            loading={rejecting}
          />
        </View>*/}

        {/* ================= TABS ================= */}
        <View style={styles.tabsRow}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={20}
                  color={isActive ? Colors.primaryRed : Colors.textMuted}
                />
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.tabsDivider} />

        {/* ================= TAB CONTENT ================= */}
        {activeTab === "about" ? (
          <View style={styles.aboutSection}>
            <Text style={styles.aboutHeading}>About {profile.name}</Text>

            <View style={styles.aboutGrid}>
              <View style={styles.aboutColumn}>
                {ABOUT_LEFT.filter(
                  (item) => getDisplayValue(item.value).trim() !== "",
                ).map((item) => (
                  <AboutItem key={item.label} {...item} />
                ))}
              </View>
              <View style={styles.aboutColumn}>
                {ABOUT_RIGHT.filter(
                  (item) => getDisplayValue(item.value).trim() !== "",
                ).map((item) => (
                  <AboutItem key={item.label} {...item} />
                ))}
              </View>
            </View>

            {!!profile.aboutMyself && (
              <>
                <View style={styles.aboutDivider} />
                <Text style={styles.aboutHeading}>About Myself</Text>
                <Text style={styles.aboutMyselfText}>
                  {showMore ? profile.aboutMyself : aboutMyselfShort}
                  {!showMore && hasMoreText ? "..." : ""}
                </Text>
                {hasMoreText && (
                  <TouchableOpacity
                    style={styles.showMoreRow}
                    onPress={() => setShowMore(!showMore)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showMoreText}>
                      {showMore ? "Show Less" : "Show More"}
                    </Text>
                    <Ionicons
                      name={showMore ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={Colors.primaryRed}
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ) : (
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderText}>
              {TABS.find((t) => t.key === activeTab)?.label} details go here.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ================= STICKY BOTTOM BAR ================= */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomOutlineButton}
          activeOpacity={0.8}
          onPress={handleToggleShortlist}
          disabled={shortlisting}
        >
          {shortlisting ? (
            <ActivityIndicator size="small" color={Colors.primaryRed} />
          ) : (
            <Ionicons
              name={isShortlisted ? "heart" : "heart-outline"}
              size={18}
              color={Colors.primaryRed}
            />
          )}
          <Text style={styles.bottomOutlineText}>
            {isShortlisted ? "Shortlisted" : "Shortlist"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomRedButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("ChatConversion")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={18}
            color={Colors.white}
          />

          <Text style={styles.bottomRedText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.bottomGoldButton,
            (sendingInterest || interestSent) && styles.bottomButtonDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleSendInterest}
          disabled={sendingInterest || interestSent}
        >
          {sendingInterest ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons
              name={interestSent ? "checkmark-circle" : "star"}
              size={18}
              color={Colors.white}
            />
          )}
          <Text style={styles.bottomGoldText}>
            {interestSent
              ? "Interest Sent"
              : sendingInterest
                ? "Sending..."
                : "Send Interest"}
          </Text>
        </TouchableOpacity>
      </View>

      {!!interestError && (
        <View style={styles.interestErrorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#B42318" />
          <Text style={styles.interestErrorText}>{interestError}</Text>
        </View>
      )}

      {!!rejectError && (
        <View style={styles.interestErrorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#B42318" />
          <Text style={styles.interestErrorText}>{rejectError}</Text>
        </View>
      )}

      {!!shortlistError && (
        <View style={styles.interestErrorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#B42318" />
          <Text style={styles.interestErrorText}>{shortlistError}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ================= SMALL SUBCOMPONENTS =================
function DetailRow({ icon, text }) {
  const isOm = icon === "om";
  return (
    <View style={styles.detailRow}>
      {isOm ? (
        <Text style={styles.omSymbol}>ॐ</Text>
      ) : (
        <Ionicons
          name={icon}
          size={16}
          color={Colors.primaryRed}
          style={styles.detailIcon}
        />
      )}
      <Text style={styles.detailText}>{getDisplayValue(text)}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress, disabled, loading }) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, disabled && styles.quickActionDisabled]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Ionicons name={icon} size={22} color={color} />
      )}
      <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function AboutItem({ icon, label, value }) {
  return (
    <View style={styles.aboutItemRow}>
      <View style={styles.aboutIconCircle}>{renderAboutIcon(icon)}</View>
      <View>
        <Text style={styles.aboutItemLabel}>{label}</Text>
        <Text style={styles.aboutItemValue}>{getDisplayValue(value)}</Text>
      </View>
    </View>
  );
}

function renderAboutIcon(icon) {
  switch (icon) {
    case "calendar":
      return (
        <Ionicons name="calendar-outline" size={16} color={Colors.primaryRed} />
      );
    case "AGE":
      return <Text style={styles.aboutIconText}>AGE</Text>;
    case "ruler":
      return (
        <MaterialCommunityIcons
          name="ruler"
          size={16}
          color={Colors.primaryRed}
        />
      );
    case "marital":
      return (
        <MaterialCommunityIcons
          name="ring"
          size={16}
          color={Colors.primaryRed}
        />
      );
    case "gender":
      return (
        <Ionicons
          name="male-female-outline"
          size={16}
          color={Colors.primaryRed}
        />
      );
    case "R":
      return <Text style={styles.aboutIconText}>R</Text>;
    case "blood":
      return (
        <Ionicons name="water-outline" size={16} color={Colors.primaryRed} />
      );
    case "om":
      return <Text style={styles.omSymbolSmall}>ॐ</Text>;
    case "people":
      return (
        <Ionicons name="people-outline" size={16} color={Colors.primaryRed} />
      );
    case "people2":
      return <Ionicons name="people" size={16} color={Colors.primaryRed} />;
    case "school":
      return (
        <Ionicons name="school-outline" size={16} color={Colors.primaryRed} />
      );
    case "briefcase":
      return (
        <Ionicons
          name="briefcase-outline"
          size={16}
          color={Colors.primaryRed}
        />
      );
    case "rupee":
      return (
        <FontAwesome5 name="rupee-sign" size={13} color={Colors.primaryRed} />
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 110 },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  centerStateText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 18,
    backgroundColor: Colors.primaryRed,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryButtonText: { color: Colors.white, fontWeight: "800" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  headerLogo: { width: 46, height: 46, borderRadius: 23 },

  summaryRow: { flexDirection: "row", gap: 14, marginTop: 4 },
  photoCard: {
    width: "44%",
    aspectRatio: 0.78,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.border,
  },
  photo: { width: "100%", height: "100%" },
  onlineBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 5,
  },
  onlineText: {
    fontSize: 11,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
  },
  photoCounter: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  photoCounterText: {
    fontSize: 10,
    fontFamily: Fonts.body.medium,
    color: Colors.white,
    marginHorizontal: 3,
  },

  infoPanel: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  nameText: {
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRedDark,
  },
  professionText: {
    fontSize: FontSizes.input,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
    marginTop: 4,
    marginBottom: 8,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  detailIcon: { marginRight: 8, width: 16 },
  omSymbol: {
    fontSize: 15,
    color: Colors.primaryRed,
    marginRight: 8,
    width: 16,
    textAlign: "center",
  },
  detailText: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  lockedContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  lockedContactText: {
    fontSize: FontSizes.label,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    fontStyle: "italic",
    flexShrink: 1,
  },

  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3D8",
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  verifiedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  verifiedTitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRedDark,
  },
  verifiedSubtitle: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  quickActionsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  quickAction: { alignItems: "center", flex: 1 },
  quickActionDisabled: { opacity: 0.5 },
  quickActionLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.semiBold,
    marginTop: 4,
    textAlign: "center",
  },

  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  tabItem: { alignItems: "center", flex: 1, paddingBottom: 10 },
  tabLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.body.medium,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  tabLabelActive: { color: Colors.primaryRed, fontFamily: Fonts.body.bold },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: "70%",
    backgroundColor: Colors.primaryRed,
    borderRadius: 1,
  },
  tabsDivider: { height: 1, backgroundColor: Colors.border },

  aboutSection: { marginTop: 20 },
  aboutHeading: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginBottom: 14,
  },
  aboutGrid: { flexDirection: "row", justifyContent: "space-between" },
  aboutColumn: { width: "48%" },
  aboutItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  aboutIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.iconCircleBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  aboutIconText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  omSymbolSmall: { fontSize: 15, color: Colors.primaryRed },
  aboutItemLabel: {
    fontSize: 13,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
  },
  aboutItemValue: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 1,
  },

  aboutDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },

  aboutMyselfText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  showMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  showMoreText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginRight: 4,
  },

  placeholderSection: { marginTop: 30, alignItems: "center" },
  placeholderText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 26 : 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomOutlineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  bottomOutlineText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  bottomRedButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  bottomRedText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  bottomGoldButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  bottomGoldText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  bottomButtonDisabled: {
    opacity: 0.6,
  },
  interestErrorBanner: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 92 : 78,
    left: 14,
    right: 14,
    backgroundColor: "#FDECEC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  interestErrorText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: "#B42318",
  },
});
