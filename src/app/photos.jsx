import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/Fonts";
import {
  acceptGalleryImageViewRequest,
  getGalleryImageViewRequests,
  getToken,
  rejectGalleryImageViewRequest,
} from "../utils/Functions";

/* ============================================================
   CONFIG
============================================================ */

const ADDITIONAL_PHOTO_SLOTS = 4;

const PHOTO_TIPS = [
  "Clear, recent photo with your face visible",
  "Good lighting, no heavy filters",
  "JPG, JPEG or PNG • Max 5MB",
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

/* ============================================================
   HELPERS
============================================================ */

const toText = (value) => {
  if (value == null) return "";
  if (typeof value === "object") {
    return toText(value.name ?? value.label ?? value.value ?? value.text);
  }
  return String(value).trim();
};

const pick = (source, keys) => {
  for (const key of keys) {
    const text = toText(source?.[key]);
    if (text) return text;
  }
  return "";
};

const pickUri = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "string" && value) return value;
    if (value && typeof value === "object") {
      const nested = value.url ?? value.photo_url ?? value.path ?? value.src;
      if (typeof nested === "string" && nested) return nested;
    }
  }
  return "";
};

const extractList = (result) => {
  if (Array.isArray(result)) return result;
  const candidates = [
    result?.data,
    result?.data?.requests,
    result?.data?.data,
    result?.requests,
  ];
  return candidates.find(Array.isArray) || [];
};

const normalizeStatus = (raw) => {
  const value = String(raw ?? "").toLowerCase();
  if (["1", "accepted", "accept", "approved"].includes(value))
    return "accepted";
  if (["2", "rejected", "reject", "declined"].includes(value))
    return "rejected";
  return "pending";
};

const timeAgo = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const normalizeRequest = (item) => {
  const person =
    item?.user ??
    item?.member ??
    item?.requester ??
    item?.sender ??
    item?.from_user ??
    item ??
    {};

  const fullName =
    pick(person, ["name", "full_name"]) ||
    [pick(person, ["first_name"]), pick(person, ["last_name"])]
      .filter(Boolean)
      .join(" ");

  return {
    id: item?.id,
    name: fullName || "Member",
    code: pick(person, ["member_code", "code"]),
    photo: pickUri(person, [
      "photo_url",
      "photo",
      "profile_photo",
      "image",
      "avatar",
    ]),
    status: normalizeStatus(item?.status),
    time: timeAgo(item?.created_at ?? item?.requested_at),
  };
};

/* ============================================================
   MAIN SCREEN
============================================================ */

export default function PhotosScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("gallery");

  // Gallery
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [additionalPhotos, setAdditionalPhotos] = useState(
    Array(ADDITIONAL_PHOTO_SLOTS).fill(null),
  );
  const [saving, setSaving] = useState(false);

  // Requests
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const photoCount = useMemo(
    () => (profilePhoto ? 1 : 0) + additionalPhotos.filter(Boolean).length,
    [profilePhoto, additionalPhotos],
  );

  const totalSlots = ADDITIONAL_PHOTO_SLOTS + 1;

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests],
  );

  const visibleRequests = useMemo(
    () =>
      filter === "all" ? requests : requests.filter((r) => r.status === filter),
    [requests, filter],
  );

  /* ---------------- REQUESTS ---------------- */

  const loadRequests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setRequestsLoading(true);
      setRequestsError("");

      const token = await getToken();
      if (!token) {
        setRequestsError("Please login again to see your requests.");
        setRequests([]);
        return;
      }

      const result = await getGalleryImageViewRequests(token);
      const list = extractList(result);

      if (!list.length && result?.success === 0) {
        setRequestsError(result?.message || "Unable to load requests.");
        setRequests([]);
        return;
      }

      setRequests(list.map(normalizeRequest).filter((r) => r.id != null));
    } catch (error) {
      console.log("loadRequests error:", error);
      setRequestsError(error?.message || "Unable to load requests.");
    } finally {
      setRequestsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const respondToRequest = async (request, action) => {
    if (busyId) return;

    try {
      setBusyId(request.id);
      const token = await getToken();
      if (!token) {
        Alert.alert("Login Required", "Please login again.");
        return;
      }

      const fn =
        action === "accept"
          ? acceptGalleryImageViewRequest
          : rejectGalleryImageViewRequest;

      const result = await fn(token, request.id);

      if (result?.success === 1 || result?.result === true) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === request.id
              ? { ...r, status: action === "accept" ? "accepted" : "rejected" }
              : r,
          ),
        );
      } else {
        Alert.alert("Error", result?.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error", error?.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  /* ---------------- GALLERY ---------------- */

  const pickImage = async (onPicked) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Needed",
        "Please allow photo library access to add photos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      onPicked(result.assets[0].uri);
    }
  };

  const handlePickAdditionalPhoto = (index) => {
    pickImage((uri) => {
      setAdditionalPhotos((prev) => {
        const next = [...prev];
        next[index] = uri;
        return next;
      });
    });
  };

  const handleRemoveAdditionalPhoto = (index) => {
    setAdditionalPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const handleSaveAndContinue = async () => {
    if (saving) return;

    if (!profilePhoto) {
      Alert.alert(
        "Profile Photo Required",
        "Please add a profile photo before continuing.",
      );
      return;
    }

    try {
      setSaving(true);

      console.log("Saving photos...", { profilePhoto, additionalPhotos });

      // TODO: replace with your actual upload/save call, e.g.
      // await updateMemberPhotos(accessToken, { profilePhoto, additionalPhotos });

      router.push("/profile");
    } catch (error) {
      console.error("SAVE PHOTOS ERROR:", error);
      Alert.alert(
        "Error",
        error?.message || "Something went wrong while saving your photos.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={21} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={styles.progressActive} />
          </View>
          <Text style={styles.progressText}>Step 6 of 7</Text>
        </View>
      </View>

      {/* TITLE */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Photo Gallery</Text>
        <Text style={styles.pageSubtitle}>
          Show your best moments and manage who can view them.
        </Text>
      </View>

      {/* TABS */}
      <View style={styles.tabBar}>
        <TabButton
          label="My Gallery"
          icon="images-outline"
          active={activeTab === "gallery"}
          onPress={() => setActiveTab("gallery")}
        />
        <TabButton
          label="Requests"
          icon="lock-open-outline"
          badge={pendingCount}
          active={activeTab === "requests"}
          onPress={() => setActiveTab("requests")}
        />
      </View>

      {activeTab === "gallery" ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* COUNTER */}
          <View style={styles.counterRow}>
            <Text style={styles.counterText}>
              {photoCount}/{totalSlots} photos added
            </Text>
            <View style={styles.counterTrack}>
              <View
                style={[
                  styles.counterFill,
                  { width: `${(photoCount / totalSlots) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* HERO PROFILE PHOTO */}
          <TouchableOpacity
            style={styles.heroCard}
            activeOpacity={0.85}
            onPress={() => pickImage(setProfilePhoto)}
          >
            {profilePhoto ? (
              <>
                <Image source={{ uri: profilePhoto }} style={styles.fill} />
                <View style={styles.mainBadge}>
                  <Ionicons name="star" size={11} color="#FFFFFF" />
                  <Text style={styles.mainBadgeText}>Profile photo</Text>
                </View>
                <TouchableOpacity
                  style={styles.heroEdit}
                  onPress={() => pickImage(setProfilePhoto)}
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heroRemove}
                  onPress={() => setProfilePhoto(null)}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.heroEmpty}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="person-add-outline"
                    size={30}
                    color={Colors.primaryRed}
                  />
                </View>
                <Text style={styles.heroTitle}>Add your profile photo</Text>
                <Text style={styles.heroHint}>
                  Required • Shown on your card
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* TIPS */}
          <View style={styles.tipsCard}>
            {PHOTO_TIPS.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <Ionicons name="checkmark-circle" size={15} color="#2E9B65" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* GALLERY GRID */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>More photos</Text>
            <Text style={styles.optionalText}>Optional</Text>
          </View>

          <View style={styles.grid}>
            {additionalPhotos.map((uri, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tile, !uri && styles.tileEmpty]}
                activeOpacity={0.85}
                onPress={() => handlePickAdditionalPhoto(index)}
              >
                {uri ? (
                  <>
                    <Image source={{ uri }} style={styles.fill} />
                    <TouchableOpacity
                      style={styles.tileRemove}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => handleRemoveAdditionalPhoto(index)}
                    >
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.tileIcon}>
                      <Ionicons
                        name="add"
                        size={22}
                        color={Colors.primaryRed}
                      />
                    </View>
                    <Text style={styles.tileLabel}>Add photo</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* PRIVACY */}
          <View style={styles.privacyCard}>
            <View style={styles.privacyIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color="#4F46E5"
              />
            </View>
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>You control your gallery</Text>
              <Text style={styles.privacyText}>
                Members must send a request to view your gallery. Accept or
                reject them from the Requests tab.
              </Text>
            </View>
          </View>

          {/* SAVE */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleSaveAndContinue}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save & Continue"}
            </Text>
            {!saving && (
              <Ionicons name="arrow-forward" size={19} color={Colors.white} />
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadRequests(true)}
              tintColor={Colors.primaryRed}
              colors={[Colors.primaryRed]}
            />
          }
        >
          {/* FILTER CHIPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.8}
                  onPress={() => setFilter(item.key)}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {requestsLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={Colors.primaryRed} />
              <Text style={styles.centerText}>Loading requests...</Text>
            </View>
          ) : requestsError ? (
            <View style={styles.centerBox}>
              <Ionicons name="alert-circle-outline" size={40} color="#B0B0B0" />
              <Text style={styles.centerText}>{requestsError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadRequests()}
              >
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : visibleRequests.length === 0 ? (
            <View style={styles.centerBox}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={30}
                  color={Colors.primaryRed}
                />
              </View>
              <Text style={styles.emptyTitle}>No requests yet</Text>
              <Text style={styles.centerText}>
                When members ask to view your gallery, they will appear here.
              </Text>
            </View>
          ) : (
            visibleRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                busy={busyId === request.id}
                disabled={!!busyId}
                onAccept={() => respondToRequest(request, "accept")}
                onReject={() => respondToRequest(request, "reject")}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ============================================================
   SUB COMPONENTS
============================================================ */

function TabButton({ label, icon, active, badge, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={16}
        color={active ? Colors.white : Colors.textMuted}
      />
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
      {badge > 0 && (
        <View style={[styles.badge, active && styles.badgeActive]}>
          <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
            {badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function RequestCard({ request, busy, disabled, onAccept, onReject }) {
  const initial = request.name.charAt(0).toUpperCase();

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestTop}>
        {request.photo ? (
          <Image source={{ uri: request.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
        )}

        <View style={styles.requestInfo}>
          <Text style={styles.requestName} numberOfLines={1}>
            {request.name}
          </Text>
          <Text style={styles.requestSub} numberOfLines={1}>
            {request.code ? `${request.code} • ` : ""}
            wants to view your gallery
          </Text>
          {request.time ? (
            <Text style={styles.requestTime}>{request.time}</Text>
          ) : null}
        </View>

        {request.status !== "pending" && (
          <View
            style={[
              styles.statusPill,
              request.status === "accepted"
                ? styles.statusAccepted
                : styles.statusRejected,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                request.status === "accepted"
                  ? styles.statusTextAccepted
                  : styles.statusTextRejected,
              ]}
            >
              {request.status === "accepted" ? "Accepted" : "Rejected"}
            </Text>
          </View>
        )}
      </View>

      {request.status === "pending" && (
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[styles.rejectBtn, disabled && styles.btnDisabled]}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={onReject}
          >
            <Ionicons name="close" size={16} color={Colors.primaryRed} />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptBtn, disabled && styles.btnDisabled]}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={onAccept}
          >
            {busy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                <Text style={styles.acceptText}>Accept</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  fill: { width: "100%", height: "100%" },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 35,
  },

  /* TOP BAR */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
    marginBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  progressContainer: { flex: 1, marginLeft: 14 },
  progressTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: "#E9E9E9",
    overflow: "hidden",
  },
  progressActive: {
    width: "85%",
    height: "100%",
    backgroundColor: Colors.primaryRed,
    borderRadius: 5,
  },
  progressText: {
    marginTop: 5,
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "right",
  },

  /* TITLE */
  titleSection: { paddingHorizontal: 18, marginBottom: 16 },
  pageTitle: {
    fontSize: 26,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 20,
  },

  /* TABS */
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 18,
    marginBottom: 14,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#EDEDED",
  },
  tab: {
    flex: 1,
    height: 42,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabActive: { backgroundColor: Colors.primaryRed },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.textMuted,
  },
  tabTextActive: { color: Colors.white },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: { backgroundColor: "#FFFFFF" },
  badgeText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: "#FFFFFF",
  },
  badgeTextActive: { color: Colors.primaryRed },

  /* COUNTER */
  counterRow: { marginBottom: 14 },
  counterText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  counterTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: "#E9E9E9",
    overflow: "hidden",
  },
  counterFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#2E9B65",
  },

  /* HERO */
  heroCard: {
    width: "100%",
    aspectRatio: 1.05,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFF9F8",
    borderWidth: 1.4,
    borderColor: "#E3B3AE",
    borderStyle: "dashed",
    marginBottom: 14,
  },
  heroEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 15,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  heroHint: {
    marginTop: 4,
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  mainBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  mainBadgeText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.bold,
    color: "#FFFFFF",
  },
  heroEdit: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
  },
  heroRemove: {
    position: "absolute",
    right: 56,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* TIPS */
  tipsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 22,
  },
  tipRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  /* GRID */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  optionalText: {
    fontSize: 11,
    fontFamily: Fonts.body.bold,
    color: Colors.textMuted,
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 22,
  },
  tile: {
    width: "48%",
    aspectRatio: 0.8,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tileEmpty: {
    backgroundColor: "#FFF9F8",
    borderWidth: 1.4,
    borderColor: "#E3B3AE",
    borderStyle: "dashed",
  },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  tileLabel: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  tileRemove: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* PRIVACY */
  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F5FF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 20,
  },
  privacyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  privacyContent: { flex: 1 },
  privacyTitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  privacyText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 15,
  },

  /* SAVE */
  saveButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.primaryRedDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    fontSize: 15,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  /* REQUESTS */
  chipsRow: { gap: 8, paddingBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  chipActive: {
    backgroundColor: "#FCE9E7",
    borderColor: Colors.primaryRed,
  },
  chipText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.textMuted,
  },
  chipTextActive: { color: Colors.primaryRed },

  requestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 12,
  },
  requestTop: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  avatarFallback: {
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  requestInfo: { flex: 1, marginLeft: 12 },
  requestName: {
    fontSize: 15,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  requestSub: {
    marginTop: 2,
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  requestTime: {
    marginTop: 2,
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: "#A0A0A0",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusAccepted: { backgroundColor: "#E7F6EE" },
  statusRejected: { backgroundColor: "#FCE9E7" },
  statusText: { fontSize: 10.5, fontFamily: Fonts.body.bold },
  statusTextAccepted: { color: "#2E9B65" },
  statusTextRejected: { color: Colors.primaryRed },

  requestActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  rejectBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: Colors.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  rejectText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  acceptBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  acceptText: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: "#FFFFFF",
  },
  btnDisabled: { opacity: 0.6 },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  centerText: {
    marginTop: 10,
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FCE9E7",
  },
  retryText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
});
