import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useFocusEffect
} from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Platform,
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
import {
  addToShortlist,
  expressInterest,
  getMemberInfo,
  getPublicProfile,
  rejectInterest,
  removeFromShortlist,
} from "../utils/Functions";

const LOGO = require("../assets/images/logo.png");
const FALLBACK_PHOTO = require("../assets/images/Match4.png");

const TABS = [
  { key: "about", label: "About", icon: "user" },
  { key: "family", label: "Family", icon: "users" },
  { key: "lifestyle", label: "Lifestyle", icon: "smile" },
  { key: "career", label: "Education & Career", icon: "briefcase" },
  { key: "photos", label: "Photos", icon: "image" },
];

/* ===
   GET TOKEN (same pattern as matches screen)
=== */
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

  const canViewContact = !!api.view_contact_check;
  const rawPhone = contact.phone ?? basic.phone ?? "";

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

export default function ProfileDetailScreen({ navigation, route }) {

  const params = route.params ?? {};
  const rawId = params.id ?? params.memberId;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

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


  const onBackPress = () => {
    navigation.navigate(route?.params?.page || "Home", route?.params?.prevs || {});
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const loadProfile = async () => {
    setLoading(true);
    setLoadError("");

    try {
      if (!id) {
        setLoadError("Missing member id.");
        return;
      }

      const token = await getToken();

      if (!token) {
        setLoadError("Authentication token not found. Please login again.");
        return;
      }

      setAuthToken(token);

      const [memberResult, publicResult] = await Promise.all([
        getMemberInfo(id, token),
        getPublicProfile(id, token),
      ]);

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

  /* ===
     Shared token resolver used by every action handler below.
  === */
  const ensureToken = async () => {
    let token = authToken;
    if (!token) {
      token = await getToken();
      setAuthToken(token);
    }
    return token;
  };

  const handleSendInterest = async () => {
    if (sendingInterest || interestSent) return;

    const targetId = profile?.id ?? id;

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
          <Feather name="alert-circle" size={50} color="#B5B5B5" />
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== TOP BAR ====== */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => onBackPress()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={26} color={Colors.primaryRed} />
          </TouchableOpacity>

          <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
        </View>

        {/* ====== PHOTO + SUMMARY ROW ====== */}
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
              <Feather name="image" size={12} color={Colors.white} />
              <Text style={styles.photoCounterText}>
                1/{profile.photoCount}
              </Text>
              <Feather
                name="maximize"
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
                <Feather
                  name="check-circle"
                  size={20}
                  color={Colors.success}
                  style={{ marginLeft: 6 }}
                />
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="share-2" size={20} color={Colors.primaryRed} />
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
                  <Feather
                    name="more-vertical"
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
                <Feather
                  name="lock"
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
                  <Feather name="shield" size={18} color={Colors.primaryRed} />
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

        {/* ====== TABS ====== */}
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
                <Feather
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

        {/* ====== TAB CONTENT ====== */}
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
                    <Feather
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

      {/* ====== STICKY BOTTOM BAR ====== */}
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
            <Feather
              name={isShortlisted ? "heart" : "heart"}
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
          onPress={() => navigation.navigate("ChatConversion", { page: route?.name, prevs: route?.params })}
        >
          <Feather name="message-circle" size={18} color={Colors.white} />

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
            <Feather
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
          <Feather name="alert-circle" size={16} color="#B42318" />
          <Text style={styles.interestErrorText}>{interestError}</Text>
        </View>
      )}

      {!!rejectError && (
        <View style={styles.interestErrorBanner}>
          <Feather name="alert-circle" size={16} color="#B42318" />
          <Text style={styles.interestErrorText}>{rejectError}</Text>
        </View>
      )}

      {!!shortlistError && (
        <View style={styles.interestErrorBanner}>
          <Feather name="alert-circle" size={16} color="#B42318" />
          <Text style={styles.interestErrorText}>{shortlistError}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// ====== SMALL SUBCOMPONENTS ======
function DetailRow({ icon, text }) {
  const isOm = icon === "om";
  return (
    <View style={styles.detailRow}>
      {isOm ? (
        <Text style={styles.omSymbol}>ॐ</Text>
      ) : (
        <Feather
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
        <Feather name={icon} size={22} color={color} />
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
      return <Feather name="calendar" size={16} color={Colors.primaryRed} />;
    case "AGE":
      return <Text style={styles.aboutIconText}>AGE</Text>;
    case "ruler":
      return <Feather name="move" size={16} color={Colors.primaryRed} />;
    case "marital":
      return <Feather name="circle" size={16} color={Colors.primaryRed} />;
    case "gender":
      return <Feather name="users" size={16} color={Colors.primaryRed} />;
    case "R":
      return <Text style={styles.aboutIconText}>R</Text>;
    case "blood":
      return <Feather name="droplet" size={16} color={Colors.primaryRed} />;
    case "om":
      return <Text style={styles.omSymbolSmall}>ॐ</Text>;
    case "people":
      return <Feather name="users" size={16} color={Colors.primaryRed} />;
    case "people2":
      return <Feather name="users" size={16} color={Colors.primaryRed} />;
    case "school":
      return <Feather name="book-open" size={16} color={Colors.primaryRed} />;
    case "briefcase":
      return <Feather name="briefcase" size={16} color={Colors.primaryRed} />;
    case "rupee":
      return <Feather name="dollar-sign" size={13} color={Colors.primaryRed} />;
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
    fontSize: Fonts.size.md,
    fontFamily: Fonts.regular,
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
  retryButtonText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
  },

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
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.semiBold,
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
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.medium,
    color: Colors.white,
    marginHorizontal: 3,
  },

  infoPanel: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  nameText: {
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.extraBold,
    color: Colors.primaryRedDark,
  },
  professionText: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    marginTop: 4,
    marginBottom: 8,
  },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  detailIcon: { marginRight: 8, width: 16 },
  omSymbol: {
    fontSize: Fonts.size.sm,
    color: Colors.primaryRed,
    marginRight: 8,
    width: 16,
    textAlign: "center",
  },
  detailText: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  lockedContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  lockedContactText: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
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
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
    color: Colors.primaryRedDark,
  },
  verifiedSubtitle: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
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
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.semiBold,
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
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.medium,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  tabLabelActive: { color: Colors.primaryRed, fontFamily: Fonts.bold },
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
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.extraBold,
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
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
    color: Colors.primaryRed,
  },
  omSymbolSmall: { fontSize: Fonts.size.sm, color: Colors.primaryRed },
  aboutItemLabel: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  aboutItemValue: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 1,
  },

  aboutDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },

  aboutMyselfText: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.regular,
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
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,
    color: Colors.primaryRed,
    marginRight: 4,
  },

  placeholderSection: { marginTop: 30, alignItems: "center" },
  placeholderText: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.regular,
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
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
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
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
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
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
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
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: "#B42318",
  },
});
