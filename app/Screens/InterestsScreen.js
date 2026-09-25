import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import Feather from "react-native-vector-icons/Feather";
import Fonts from "../constants/Fonts";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  acceptInterest,
  getInterestRequests,
  getMyInterests,
  getToken,
  rejectInterest,
} from "../utils/Functions";

const COLORS = {
  primaryRed: "#C00000",
  darkRed: "#8B0000",
  gold: "#D9A441",
  background: "#FFFDF9",
  white: "#FFFFFF",
  text: "#292929",
  muted: "#777777",
  border: "#F0E4DE",
  green: "#239B56",
};

const FALLBACK_IMAGE = "https://via.placeholder.com/300x300.png?text=Profile";

// Screen that opens when a profile (photo / name) is tapped.
// Change this one line if your registered screen name is different
// (e.g. "MatchesDetails" or "MatchesDetail").
const PROFILE_ROUTE = "matchesdetail";

const TABS = [
  {
    key: "sent",
    label: "Sent",
  },
  {
    key: "received",
    label: "Received",
  },
];

// =======
// HELPERS
// =======

/*
 * Alert.alert does nothing on Expo Web, so use window.alert there.
 */
const notify = (title, message) => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert(`${title}\n\n${message}`);
    }

    return;
  }

  Alert.alert(title, message);
};

/*
 * FIX: the old check was
 *     result?.success === 1 || result?.result === true
 * so a perfectly good response like { success: true, ... } or
 * { status: "success" } or { statusCode: 200 } was treated as a failure:
 * the card never disappeared and an error was shown.
 *
 * This accepts the common "success" shapes and still rejects
 * explicit failures.
 */
const isApiSuccess = (result) => {
  if (result === true) return true;

  if (!result || typeof result !== "object") return false;

  const NEGATIVE = [false, 0, "0", "false", "error", "failed", "fail"];

  const POSITIVE = [
    true,
    1,
    "1",
    "true",
    "success",
    "ok",
    "accepted",
    "rejected",
  ];

  const flags = [result.success, result.result, result.status].filter(
    (value) => value !== undefined && value !== null,
  );

  if (flags.some((value) => NEGATIVE.includes(value))) return false;

  if (flags.some((value) => POSITIVE.includes(value))) return true;

  // Fall back to an HTTP-style status code if one is present.
  const code = Number(
    result.statusCode ??
      result.status_code ??
      result.code ??
      (typeof result.status === "number" ? result.status : undefined),
  );

  if (Number.isFinite(code) && code > 0) {
    return code >= 200 && code < 300;
  }

  return false;
};

const apiMessage = (result, fallback) =>
  String(result?.message || result?.msg || result?.error || fallback);

/*
 * The "received" API returns EVERY interest sent to you - including the
 * ones you already accepted (status "approved") or rejected. That is why an
 * accepted card kept coming back after the refresh, still with
 * Accept / Reject buttons.
 *
 * Only PENDING interests get action buttons now.
 */
const ACCEPTED_STATUSES = ["approved", "accepted"];

const REJECTED_STATUSES = ["rejected", "declined", "denied"];

// false -> Received tab lists only pending requests (handled ones disappear)
// true  -> handled ones stay in the list, shown with a status and no buttons
const SHOW_HANDLED_ON_RECEIVED = false;

const normalizeStatus = (value) =>
  String(value ?? "pending")
    .trim()
    .toLowerCase();

const isAcceptedStatus = (value) =>
  ACCEPTED_STATUSES.includes(normalizeStatus(value));

const isRejectedStatus = (value) =>
  REJECTED_STATUSES.includes(normalizeStatus(value));

const isPendingStatus = (value) =>
  !isAcceptedStatus(value) && !isRejectedStatus(value);

export default function InterestsScreen() {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState("sent");

  const [interests, setInterests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [actionId, setActionId] = useState(null);

  // =======
  // BACK
  // =======

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  // =======
  // ANDROID HARDWARE BACK
  // Same pattern as EditSocialBackground / EducationInformation:
  // intercept the hardware back button and route it through
  // handleBack(), ignored while an accept/reject is in progress.
  // =======

  useEffect(() => {
    const handleHardwareBack = () => {
      if (actionId !== null) {
        return true;
      }

      handleBack();

      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleHardwareBack,
    );

    return () => {
      subscription.remove();
    };
  }, [handleBack, actionId]);

  // =======
  // LOAD INTERESTS
  // silent = true -> refresh in the background (no spinner)
  // =======

  const loadInterests = async (
    tab = activeTab,
    refresh = false,
    silent = false,
  ) => {
    if (refresh) {
      setRefreshing(true);
    } else if (!silent) {
      setLoading(true);
    }

    setError("");

    try {
      const token = await getToken();

      if (!token) {
        setError("Please login again.");
        setInterests([]);
        return;
      }

      const result =
        tab === "received"
          ? await getInterestRequests(token)
          : await getMyInterests(token);

      console.log("Interests API result:", JSON.stringify(result));

      if (result?.success === 1 || result?.result === true) {
        setInterests(Array.isArray(result?.data) ? result.data : []);
      } else {
        setInterests([]);

        setError(result?.message || "Unable to load interests.");
      }
    } catch (err) {
      console.log("loadInterests Error:", err);

      setInterests([]);

      setError(err?.message || "Unable to load interests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInterests(activeTab);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]),
  );

  // =======
  // DATA HELPERS
  // =======

  /*
   * The profile we show is the OTHER person:
   *   Received tab -> the sender
   *   Sent tab     -> the receiver
   * (Looking at `sender` first on the Sent tab would give you your own
   *  profile, and the click would open the wrong member.)
   */
  const getMember = (item) =>
    activeTab === "received"
      ? (item?.member ??
        item?.sender ??
        item?.from_member ??
        item?.user ??
        item?.member_data ??
        item?.receiver ??
        item?.to_member ??
        {})
      : (item?.member ??
        item?.receiver ??
        item?.to_member ??
        item?.user ??
        item?.member_data ??
        item?.sender ??
        item?.from_member ??
        {});

  const getMemberId = (item) => {
    const member = getMember(item);

    const otherId =
      activeTab === "received"
        ? (item?.sender_id ?? item?.receiver_id)
        : (item?.receiver_id ?? item?.sender_id);

    return (
      member?.id ??
      member?.member_id ??
      item?.member_id ??
      otherId ??
      item?.user_id
    );
  };

  /*
   * FIX: prefer the explicit interest / request id keys. The generic
   * `item.id` is checked LAST, because on some list responses `id` is
   * the member's id, and accept/reject then get called with the wrong
   * id (server replies "not found" and nothing happens).
   */
  const getInterestId = (item) =>
    item?.interest_id ??
    item?.request_id ??
    item?.interest?.interest_id ??
    item?.interest?.id ??
    item?.id;

  const getName = (item) => {
    const member = getMember(item);

    const firstName = member?.first_name ?? item?.first_name ?? "";

    const lastName = member?.last_name ?? item?.last_name ?? "";

    return (
      member?.name ??
      member?.full_name ??
      item?.name ??
      (`${firstName} ${lastName}`.trim() || "Member")
    );
  };

  const getImage = (item) => {
    const member = getMember(item);

    return (
      member?.photo ??
      member?.profile_photo ??
      member?.image ??
      member?.avatar ??
      item?.photo ??
      item?.image ??
      FALLBACK_IMAGE
    );
  };

  const getAge = (item) => {
    const member = getMember(item);

    return member?.age ?? member?.age_years ?? item?.age ?? "";
  };

  const getLocation = (item) => {
    const member = getMember(item);

    return (
      member?.city_name ??
      member?.city ??
      member?.location ??
      item?.location ??
      ""
    );
  };

  const getStatus = (item) =>
    item?.status ?? item?.interest_status ?? item?.request_status ?? "pending";

  // =======
  // PROFILE NAVIGATION
  // =======

  const openProfile = (item) => {
    const memberId = getMemberId(item);

    console.log("OPEN PROFILE -> memberId:", memberId, "route:", PROFILE_ROUTE);

    if (!memberId) {
      notify("Error", "Member ID not found.");
      return;
    }

    navigation.navigate(PROFILE_ROUTE, {
      // Same value under both names, so the details screen can read
      // either `memberId` or `id`.
      memberId: String(memberId),
      id: String(memberId),
    });
  };

  // =======
  // TAB CHANGE
  // =======

  const handleTabPress = (tabKey) => {
    if (tabKey === activeTab) return;

    setInterests([]);

    setActiveTab(tabKey);
  };

  // =======
  // ACCEPT / REJECT  (shared flow)
  // =======

  const runInterestAction = async (type, interestId) => {
    if (actionId !== null) return;

    const isAccept = type === "accept";

    const verb = isAccept ? "accept" : "reject";

    setActionId(interestId);

    setError("");

    try {
      const token = await getToken();

      if (!token) {
        setError("Please login again.");

        notify("Login Required", "Please login again.");

        return;
      }

      console.log(`${verb.toUpperCase()} INTEREST -> ID:`, interestId);

      const result = isAccept
        ? await acceptInterest(token, interestId)
        : await rejectInterest(token, interestId);

      console.log(`${verb} result:`, JSON.stringify(result));

      /* ---------- FAILED ---------- */

      if (!isApiSuccess(result)) {
        const message = apiMessage(result, `Unable to ${verb} interest.`);

        setError(message);

        notify(isAccept ? "Accept Failed" : "Reject Failed", message);

        return;
      }

      /* ---------- SUCCESS: update the card right away ---------- */

      setInterests((prev) =>
        SHOW_HANDLED_ON_RECEIVED
          ? prev.map((item) =>
              String(getInterestId(item)) === String(interestId)
                ? { ...item, status: isAccept ? "approved" : "rejected" }
                : item,
            )
          : prev.filter(
              (item) => String(getInterestId(item)) !== String(interestId),
            ),
      );

      notify(
        isAccept ? "Interest Accepted" : "Interest Rejected",
        apiMessage(
          result,
          isAccept
            ? "Interest accepted successfully."
            : "Interest rejected successfully.",
        ),
      );

      /* ---------- re-sync with the server (no spinner) ---------- */

      loadInterests(activeTab, false, true);
    } catch (err) {
      console.log(`${verb} Error:`, err);

      const message = err?.message || `Unable to ${verb} interest.`;

      setError(message);

      notify(isAccept ? "Accept Failed" : "Reject Failed", message);
    } finally {
      setActionId(null);
    }
  };

  // =======
  // ACCEPT INTEREST
  // =======

  const handleAccept = (item) => {
    const interestId = getInterestId(item);

    console.log("handleAccept -> raw item:", JSON.stringify(item));
    console.log("handleAccept -> resolved interestId:", interestId);

    if (interestId === undefined || interestId === null || interestId === "") {
      setError("Interest ID not found.");

      notify("Error", "Interest ID not found.");

      return;
    }

    // Alert.alert does not render on react-native-web, so on web we
    // fall back to the browser's native confirm() dialog instead.
    if (Platform.OS === "web") {
      if (window.confirm("Do you want to accept this interest?")) {
        runInterestAction("accept", interestId);
      }
      return;
    }

    Alert.alert("Accept Interest", "Do you want to accept this interest?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Accept",
        onPress: () => runInterestAction("accept", interestId),
      },
    ]);
  };

  // =======
  // REJECT INTEREST
  // =======

  const handleReject = (item) => {
    const interestId = getInterestId(item);

    console.log("handleReject -> raw item:", JSON.stringify(item));
    console.log("handleReject -> resolved interestId:", interestId);

    if (interestId === undefined || interestId === null || interestId === "") {
      setError("Interest ID not found.");

      notify("Error", "Interest ID not found.");

      return;
    }

    if (Platform.OS === "web") {
      if (window.confirm("Do you want to reject this interest?")) {
        runInterestAction("reject", interestId);
      }
      return;
    }

    Alert.alert("Reject Interest", "Do you want to reject this interest?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => runInterestAction("reject", interestId),
      },
    ]);
  };

  // =======
  // RENDER PROFILE
  // =======

  const renderItem = ({ item }) => {
    const interestId = getInterestId(item);

    const name = getName(item);

    const image = getImage(item);

    const age = getAge(item);

    const location = getLocation(item);

    const status = String(getStatus(item));

    const isAccepted = isAcceptedStatus(status);

    const isRejected = isRejectedStatus(status);

    const isPending = isPendingStatus(status);

    const isActionLoading = actionId === interestId;

    return (
      <View style={styles.card}>
        {/* Profile Image */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openProfile(item)}
        >
          <Image source={{ uri: image }} style={styles.profileImage} />
        </TouchableOpacity>

        {/* Details */}
        <View style={styles.details}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openProfile(item)}
          >
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>

              <Feather name="check-circle" size={16} color={COLORS.green} />
            </View>

            {age ? (
              <View style={styles.infoRow}>
                <Feather name="user" size={14} color={COLORS.muted} />

                <Text style={styles.infoText}>{age} years</Text>
              </View>
            ) : null}

            {location ? (
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={14} color={COLORS.muted} />

                <Text style={styles.infoText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Status */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                isAccepted && styles.statusBadgeGreen,
                isRejected && styles.statusBadgeRed,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  isAccepted && { backgroundColor: COLORS.green },
                  isRejected && { backgroundColor: COLORS.primaryRed },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  isAccepted && styles.statusTextGreen,
                  isRejected && styles.statusTextRed,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          {activeTab === "received" ? (
            isPending ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleReject(item)}
                  disabled={actionId !== null}
                >
                  <Feather name="x" size={16} color={COLORS.primaryRed} />

                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(item)}
                  disabled={actionId !== null}
                >
                  {isActionLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <>
                      <Feather name="check" size={16} color={COLORS.white} />

                      <Text style={styles.acceptText}>Accept</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.sentStatus}>
                <Feather
                  name={isAccepted ? "check-circle" : "x-circle"}
                  size={15}
                  color={isAccepted ? COLORS.green : COLORS.primaryRed}
                />

                <Text
                  style={[
                    styles.sentStatusText,
                    { color: isAccepted ? COLORS.green : COLORS.primaryRed },
                  ]}
                >
                  {isAccepted ? "Interest Accepted" : "Interest Rejected"}
                </Text>
              </View>
            )
          ) : (
            <View style={styles.sentStatus}>
              <Feather name="send" size={14} color={COLORS.gold} />

              <Text style={styles.sentStatusText}>Interest Sent</Text>
            </View>
          )}
        </View>

        {/* Shortlist Icon */}
        <TouchableOpacity
          style={styles.shortlistButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("shortlists")}
        >
          <Feather name="star" size={18} color={COLORS.gold} />
        </TouchableOpacity>
      </View>
    );
  };

  const visibleInterests =
    activeTab === "received" && !SHOW_HANDLED_ON_RECEIVED
      ? interests.filter((item) => isPendingStatus(getStatus(item)))
      : interests;

  const emptyTitle =
    activeTab === "received" ? "No Interests Received" : "No Interests Sent";

  const emptyMessage =
    activeTab === "received"
      ? "No pending interest requests right now."
      : "You have not sent any interests yet.";

  // =======
  // LOADING
  // =======

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={23} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Interests</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryRed} />

          <Text style={styles.loadingText}>Loading interests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // =======
  // MAIN UI
  // =======

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={23} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Interests</Text>

          <Text style={styles.headerSubtitle}>Connect with your matches</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadInterests(activeTab, true)}
        >
          <Feather name="refresh-cw" size={20} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={20} color={COLORS.primaryRed} />

          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity onPress={() => loadInterests(activeTab)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>
            {activeTab === "received" ? "Received Interests" : "Sent Interests"}
          </Text>

          <Text style={styles.sectionSubtitle}>
            {visibleInterests.length} profiles
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Feather name="heart" size={18} color={COLORS.primaryRed} />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={visibleInterests}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          String(getInterestId(item) ?? getMemberId(item) ?? index)
        }
        contentContainerStyle={[
          styles.listContent,
          visibleInterests.length === 0 && styles.emptyList,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadInterests(activeTab, true)}
            colors={[COLORS.primaryRed]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="heart" size={48} color={COLORS.gold} />
            </View>

            <Text style={styles.emptyTitle}>{emptyTitle}</Text>

            <Text style={styles.emptyMessage}>{emptyMessage}</Text>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate("matches")}
            >
              <Text style={styles.exploreButtonText}>Explore Matches</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// =======
// STYLES  (unchanged)
// =======

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 84,
    paddingHorizontal: 15,
    backgroundColor: COLORS.primaryRed,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 6,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: Fonts.size.xl,
    fontFamily: Fonts.extraBold,
  },

  headerSubtitle: {
    color: "#FFE5D0",
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    marginTop: 3,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A80000",
    alignItems: "center",
    justifyContent: "center",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  activeTab: {
    borderBottomColor: COLORS.primaryRed,
  },

  tabText: {
    color: COLORS.muted,
    fontSize: Fonts.size.md,
    fontFamily: Fonts.semiBold,
  },

  activeTabText: {
    color: COLORS.primaryRed,
    fontFamily: Fonts.extraBold,
  },

  sectionHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.extraBold,
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF0F1",
    alignItems: "center",
    justifyContent: "center",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  emptyList: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },

  profileImage: {
    width: 102,
    height: 126,
    borderRadius: 14,
    backgroundColor: "#F5E9E1",
  },

  details: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 3,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingRight: 24,
  },

  name: {
    flexShrink: 1,
    fontSize: Fonts.size.md,
    fontFamily: Fonts.extraBold,
    color: COLORS.text,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  infoText: {
    flex: 1,
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: COLORS.muted,
  },

  statusRow: {
    marginTop: 10,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFF5E1",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
    marginRight: 5,
  },

  statusText: {
    color: "#9B6A0D",
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
  },

  statusBadgeGreen: {
    backgroundColor: "#E6F6EC",
  },

  statusBadgeRed: {
    backgroundColor: "#FFECEC",
  },

  statusTextGreen: {
    color: "#1E7A47",
  },

  statusTextRed: {
    color: COLORS.primaryRed,
  },

  actionRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 10,
  },

  rejectButton: {
    flex: 1,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#F1C7C7",
    backgroundColor: "#FFF5F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  rejectText: {
    color: COLORS.primaryRed,
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
  },

  acceptButton: {
    flex: 1,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  acceptText: {
    color: COLORS.white,
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
  },

  sentStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },

  sentStatusText: {
    color: COLORS.gold,
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
  },

  shortlistButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF7E3",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
    fontSize: Fonts.size.md,
    fontFamily: Fonts.regular,
  },

  errorBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFF0F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: COLORS.primaryRed,
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
  },

  retryText: {
    color: COLORS.primaryRed,
    fontFamily: Fonts.extraBold,
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.extraBold,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 70,
  },

  emptyIconCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#FFF5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.extraBold,
    marginTop: 18,
  },

  emptyMessage: {
    color: COLORS.muted,
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  exploreButton: {
    marginTop: 22,
    backgroundColor: COLORS.primaryRed,
    borderRadius: 12,
    paddingHorizontal: 26,
    paddingVertical: 13,
  },

  exploreButtonText: {
    color: COLORS.white,
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.extraBold,
  },
});
