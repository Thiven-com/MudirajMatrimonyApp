import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getInterestRequests,
  getMyInterests,
  getToken,
  rejectInterest,
} from "../utils/Functions";

const FALLBACK_IMAGE = "https://via.placeholder.com/300x300.png?text=Profile";

// "sent"     -> interests THIS member sent to others   (getMyInterests)
// "received" -> interests OTHER members sent to this one (getInterestRequests)
const TABS = [
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
];

export default function MyInterestsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("sent");

  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState(null);

  const loadInterests = async (tab, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = await getToken();

      console.log("loadInterests Token:", token ? "FOUND" : "NOT FOUND");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const result =
        tab === "received"
          ? await getInterestRequests(token)
          : await getMyInterests(token);

      console.log(
        `get${tab === "received" ? "InterestRequests" : "MyInterests"} result:`,
        JSON.stringify(result),
      );

      if (result?.success === 1 || result?.result === true) {
        const data = Array.isArray(result?.data) ? result.data : [];

        setInterests(data);
      } else {
        setInterests([]);
        setError(
          result?.message ||
            `Unable to load ${tab === "received" ? "received" : "sent"} interests.`,
        );
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

  const handleTabPress = (tabKey) => {
    if (tabKey === activeTab) return;
    setInterests([]);
    setActiveTab(tabKey);
  };

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

  const getInterestId = (item) => item?.id ?? item?.interest_id;

  const getName = (item) => {
    const member = getMember(item);

    return (
      member?.name ??
      member?.full_name ??
      member?.first_name ??
      item?.name ??
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

  const getStatus = (item) => {
    return (
      item?.status ?? item?.interest_status ?? item?.request_status ?? "pending"
    );
  };

  const openProfile = (item) => {
    const memberId = getMemberId(item);

    if (!memberId) {
      return;
    }

    router.push({
      pathname: "/member-details",
      params: {
        memberId: String(memberId),
      },
    });
  };

  const handleReject = (item) => {
    const interestId = getInterestId(item);

    if (!interestId) {
      console.log("handleReject: missing interest id", item);
      setError("Unable to reject this interest.");
      return;
    }

    Alert.alert(
      "Reject Interest",
      "Are you sure you want to reject this interest?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => confirmReject(interestId),
        },
      ],
    );
  };

  const confirmReject = async (interestId) => {
    setRejectingId(interestId);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const result = await rejectInterest(token, interestId);

      console.log("rejectInterest result:", JSON.stringify(result));

      if (result?.success === 1 || result?.result === true) {
        setInterests((prev) =>
          prev.filter((i) => getInterestId(i) !== interestId),
        );
      } else {
        setError(result?.message || "Unable to reject interest.");
      }
    } catch (err) {
      console.log("confirmReject Error:", err);
      setError(err?.message || "Unable to reject interest.");
    } finally {
      setRejectingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const name = getName(item);
    const image = getImage(item);
    const age = getAge(item);
    const location = getLocation(item);
    const status = String(getStatus(item));
    const interestId = getInterestId(item);
    const isRejecting = rejectingId === interestId;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => openProfile(item)}
      >
        <Image source={{ uri: image }} style={styles.profileImage} />

        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>

            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>

          {age ? (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color="#777" />

              <Text style={styles.infoText}>{age} years</Text>
            </View>
          ) : null}

          {location ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#777" />

              <Text style={styles.infoText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}

          <View style={styles.bottomRow}>
            <View style={styles.status}>
              <View style={styles.statusDot} />

              <Text style={styles.statusText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>

            {activeTab === "received" && status.toLowerCase() === "pending" ? (
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleReject(item);
                }}
                disabled={isRejecting}
              >
                {isRejecting ? (
                  <ActivityIndicator size="small" color="#B42318" />
                ) : (
                  <Text style={styles.rejectButtonText}>Reject</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const emptyTitle =
    activeTab === "received" ? "No Interests Received" : "No Interests Sent";
  const emptyText =
    activeTab === "received"
      ? "No one has sent you an interest yet."
      : "You don't have any interests right now.";

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Interests</Text>
        </View>

        <TabBar activeTab={activeTab} onPress={handleTabPress} />

        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#7B1E3A" />

          <Text style={styles.loadingText}>Loading interests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Interests</Text>

          <Text style={styles.subtitle}>{interests.length} interests</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadInterests(activeTab, true)}
        >
          <Ionicons name="refresh" size={21} color="#7B1E3A" />
        </TouchableOpacity>
      </View>

      <TabBar activeTab={activeTab} onPress={handleTabPress} />

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={20} color="#B42318" />

          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={interests}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          String(item?.id ?? item?.interest_id ?? getMemberId(item) ?? index)
        }
        contentContainerStyle={[
          styles.list,
          interests.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadInterests(activeTab, true)}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={60} color="#AAA" />

            <Text style={styles.emptyTitle}>{emptyTitle}</Text>

            <Text style={styles.emptyText}>{emptyText}</Text>

            <TouchableOpacity
              style={styles.matchesButton}
              onPress={() => router.push("/matches")}
            >
              <Text style={styles.matchesButtonText}>Explore Matches</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ================= TAB BAR =================
function TabBar({ activeTab, onPress }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onPress(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  header: {
    minHeight: 82,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F8E9EF",
    alignItems: "center",
    justifyContent: "center",
  },

  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },

  tabItemActive: {
    backgroundColor: "#7B1E3A",
  },

  tabLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#777",
  },

  tabLabelActive: {
    color: "#FFFFFF",
  },

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  profileImage: {
    width: 92,
    height: 110,
    borderRadius: 12,
    backgroundColor: "#EEE",
  },

  details: {
    flex: 1,
    marginLeft: 14,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  infoText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 13,
    color: "#666",
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  status: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#F8E9EF",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#7B1E3A",
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7B1E3A",
  },

  rejectButton: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#B42318",
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },

  rejectButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B42318",
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#777",
  },

  errorBox: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    flexDirection: "row",
    alignItems: "center",
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#B42318",
    fontSize: 13,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#777",
    lineHeight: 21,
  },

  matchesButton: {
    marginTop: 20,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#7B1E3A",
  },

  matchesButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
