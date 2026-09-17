import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

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

export default function InterestsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("sent");

  const [interests, setInterests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [actionId, setActionId] = useState(null);

  // =====================================================
  // LOAD INTERESTS
  // =====================================================

  const loadInterests = async (tab = activeTab, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
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

  // =====================================================
  // DATA HELPERS
  // =====================================================

  const getMember = (item) =>
    item?.member ??
    item?.sender ??
    item?.from_member ??
    item?.receiver ??
    item?.to_member ??
    item?.user ??
    item?.member_data ??
    {};

  const getMemberId = (item) => {
    const member = getMember(item);

    return (
      member?.id ??
      member?.member_id ??
      item?.member_id ??
      item?.sender_id ??
      item?.receiver_id ??
      item?.user_id
    );
  };

  const getInterestId = (item) =>
    item?.id ??
    item?.interest_id ??
    item?.request_id ??
    item?.interest?.id ??
    item?.interest?.interest_id;

  const getName = (item) => {
    const member = getMember(item);

    const firstName = member?.first_name ?? item?.first_name ?? "";

    const lastName = member?.last_name ?? item?.last_name ?? "";

    return (
      member?.name ??
      member?.full_name ??
      item?.name ??
      `${firstName} ${lastName}`.trim() ??
      "Member"
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

  // =====================================================
  // PROFILE NAVIGATION
  // =====================================================

  const openProfile = (item) => {
    const memberId = getMemberId(item);

    if (!memberId) {
      Alert.alert("Error", "Member ID not found.");
      return;
    }

    router.push({
      pathname: "/member-details",
      params: {
        memberId: String(memberId),
      },
    });
  };

  // =====================================================
  // TAB CHANGE
  // =====================================================

  const handleTabPress = (tabKey) => {
    if (tabKey === activeTab) return;

    setInterests([]);

    setActiveTab(tabKey);
  };

  // =====================================================
  // ACCEPT INTEREST
  // =====================================================

  const handleAccept = (item) => {
    const interestId = getInterestId(item);

    console.log("handleAccept -> raw item:", JSON.stringify(item));
    console.log("handleAccept -> resolved interestId:", interestId);

    if (!interestId) {
      setError("Interest ID not found.");
      return;
    }

    // Alert.alert does not render on react-native-web, so on web we
    // fall back to the browser's native confirm() dialog instead.
    if (Platform.OS === "web") {
      if (window.confirm("Do you want to accept this interest?")) {
        confirmAccept(interestId);
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
        onPress: () => confirmAccept(interestId),
      },
    ]);
  };

  const confirmAccept = async (interestId) => {
    if (actionId) return;

    setActionId(interestId);

    setError("");

    try {
      const token = await getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const result = await acceptInterest(token, interestId);

      console.log("Accept result:", JSON.stringify(result));

      if (result?.success === 1 || result?.result === true) {
        setInterests((prev) =>
          prev.filter((item) => getInterestId(item) !== interestId),
        );
      } else {
        setError(result?.message || "Unable to accept interest.");
      }
    } catch (err) {
      console.log("Accept Error:", err);

      setError(err?.message || "Unable to accept interest.");
    } finally {
      setActionId(null);
    }
  };

  // =====================================================
  // REJECT INTEREST
  // =====================================================

  const handleReject = (item) => {
    const interestId = getInterestId(item);

    console.log("handleReject -> raw item:", JSON.stringify(item));
    console.log("handleReject -> resolved interestId:", interestId);

    if (!interestId) {
      setError("Interest ID not found.");
      return;
    }

    if (Platform.OS === "web") {
      if (window.confirm("Do you want to reject this interest?")) {
        confirmReject(interestId);
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
        onPress: () => confirmReject(interestId),
      },
    ]);
  };

  const confirmReject = async (interestId) => {
    if (actionId) return;

    setActionId(interestId);

    setError("");

    try {
      const token = await getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const result = await rejectInterest(token, interestId);

      console.log("Reject result:", JSON.stringify(result));

      if (result?.success === 1 || result?.result === true) {
        setInterests((prev) =>
          prev.filter((item) => getInterestId(item) !== interestId),
        );
      } else {
        setError(result?.message || "Unable to reject interest.");
      }
    } catch (err) {
      console.log("Reject Error:", err);

      setError(err?.message || "Unable to reject interest.");
    } finally {
      setActionId(null);
    }
  };

  // =====================================================
  // RENDER PROFILE
  // =====================================================

  const renderItem = ({ item }) => {
    const interestId = getInterestId(item);

    const name = getName(item);

    const image = getImage(item);

    const age = getAge(item);

    const location = getLocation(item);

    const status = String(getStatus(item));

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

              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.green}
              />
            </View>

            {age ? (
              <View style={styles.infoRow}>
                <Ionicons
                  name="person-outline"
                  size={14}
                  color={COLORS.muted}
                />

                <Text style={styles.infoText}>{age} years</Text>
              </View>
            ) : null}

            {location ? (
              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={COLORS.muted}
                />

                <Text style={styles.infoText} numberOfLines={1}>
                  {location}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Status */}
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          {activeTab === "received" ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(item)}
                disabled={isActionLoading}
              >
                <Ionicons name="close" size={16} color={COLORS.primaryRed} />

                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAccept(item)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />

                    <Text style={styles.acceptText}>Accept</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sentStatus}>
              <Ionicons name="paper-plane" size={14} color={COLORS.gold} />

              <Text style={styles.sentStatusText}>Interest Sent</Text>
            </View>
          )}
        </View>

        {/* Shortlist Icon */}
        <TouchableOpacity
          style={styles.shortlistButton}
          activeOpacity={0.8}
          onPress={() => router.push("/shortlists")}
        >
          <Ionicons name="star-outline" size={18} color={COLORS.gold} />
        </TouchableOpacity>
      </View>
    );
  };

  const emptyTitle =
    activeTab === "received" ? "No Interests Received" : "No Interests Sent";

  const emptyMessage =
    activeTab === "received"
      ? "No one has sent you an interest yet."
      : "You have not sent any interests yet.";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={23} color={COLORS.white} />
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

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Interests</Text>

          <Text style={styles.headerSubtitle}>Connect with your matches</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadInterests(activeTab, true)}
        >
          <Ionicons name="refresh" size={20} color={COLORS.gold} />
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
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={COLORS.primaryRed}
          />

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
            {interests.length} profiles
          </Text>
        </View>

        <View style={styles.sectionIcon}>
          <Ionicons name="heart" size={18} color={COLORS.primaryRed} />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={interests}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          String(getInterestId(item) ?? getMemberId(item) ?? index)
        }
        contentContainerStyle={[
          styles.listContent,
          interests.length === 0 && styles.emptyList,
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
              <Ionicons name="heart-outline" size={48} color={COLORS.gold} />
            </View>

            <Text style={styles.emptyTitle}>{emptyTitle}</Text>

            <Text style={styles.emptyMessage}>{emptyMessage}</Text>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push("/matches")}
            >
              <Text style={styles.exploreButtonText}>Explore Matches</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

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
    fontSize: 21,
    fontWeight: "800",
  },

  headerSubtitle: {
    color: "#FFE5D0",
    fontSize: 11,
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
    fontSize: 14,
    fontWeight: "600",
  },

  activeTabText: {
    color: COLORS.primaryRed,
    fontWeight: "800",
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
    fontSize: 17,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
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
    fontSize: 15,
    fontWeight: "800",
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
    fontSize: 11,
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
    fontSize: 10,
    fontWeight: "700",
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
    fontSize: 10,
    fontWeight: "700",
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
    fontSize: 10,
    fontWeight: "700",
  },

  sentStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },

  sentStatusText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
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
    fontSize: 14,
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
    fontSize: 12,
  },

  retryText: {
    color: COLORS.primaryRed,
    fontWeight: "800",
    fontSize: 12,
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
    fontSize: 19,
    fontWeight: "800",
    marginTop: 18,
  },

  emptyMessage: {
    color: COLORS.muted,
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: "800",
  },
});
