import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BASE_URL from "../constants/AppUrls";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/Fonts";
import {
  deleteGalleryImage,
  getGalleryImages,
  getToken,
} from "../utils/Functions";

/* ============================================================
   CONFIG
============================================================ */

const MAX_PHOTOS = 100;
const COLUMNS = 3;
const H_PADDING = 16;
const GAP = 10;
const TILE_WIDTH =
  (Dimensions.get("window").width - H_PADDING * 2 - GAP * (COLUMNS - 1)) /
  COLUMNS;
const TILE_HEIGHT = TILE_WIDTH * 1.25;

const DANGER = "#D92D20";
const DANGER_SOFT = "#FEE4E2";

// Change to your actual route for the Add Photo screen
const ADD_PHOTO_ROUTE = "/Addphoto";

/* ============================================================
   HELPERS
============================================================ */

const toAbsoluteUrl = (value) => {
  if (!value) return "";
  if (/^(https?:|file:|content:|data:)/i.test(value)) return value;
  return `${String(BASE_URL).replace(/\/+$/, "")}/${String(value).replace(/^\/+/, "")}`;
};

const extractList = (result) => {
  if (Array.isArray(result)) return result;
  return (
    [
      result?.data,
      result?.data?.data,
      result?.data?.images,
      result?.images,
    ].find(Array.isArray) || []
  );
};

const extractPhotos = (result) =>
  extractList(result)
    .map((item) => {
      const uri = toAbsoluteUrl(item?.image_path);
      return uri ? { id: item?.image_id ?? null, uri } : null;
    })
    .filter(Boolean);

/* ============================================================
   SCREEN
============================================================ */

export default function MyGalleryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [viewerIndex, setViewerIndex] = useState(null); // full-screen viewer
  const [menuIndex, setMenuIndex] = useState(null); // options sheet
  const [deleteIndex, setDeleteIndex] = useState(null); // delete dialog
  const [deleting, setDeleting] = useState(false);

  /* ---------------- LOAD ---------------- */

  const loadPhotos = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const token = await getToken();
      if (!token) return;

      const result = await getGalleryImages(token);
      const list = extractPhotos(result);
      console.log("GALLERY PARSED:", list.length, list[0]);
      setPhotos(list);
    } catch (error) {
      console.log("loadPhotos error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time we come back from the Add Photo screen
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );

  /* ---------------- ACTIONS ---------------- */

  const handleAddPress = () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(
        "Limit reached",
        `You can add up to ${MAX_PHOTOS} photos. Delete one to add another.`,
      );
      return;
    }
    router.push(ADD_PHOTO_ROUTE);
  };

  const handleShare = async (index) => {
    const photo = photos[index];
    if (!photo) return;
    try {
      await Share.share({ message: photo.uri, url: photo.uri });
    } catch (error) {
      console.log("share error:", error);
    }
  };

  // Opens the image URL. For a true "save to camera roll", use
  // expo-file-system + expo-media-library instead.
  const handleDownload = (index) => {
    const photo = photos[index];
    if (photo) Linking.openURL(photo.uri).catch(() => {});
  };

  const performDelete = async () => {
    const photo = photos[deleteIndex];
    if (!photo || deleting) return;

    try {
      setDeleting(true);

      const token = await getToken();
      await deleteGalleryImage(token, photo.id);

      const removedIndex = deleteIndex;
      const remaining = photos.length - 1;

      setPhotos((prev) => prev.filter((_, i) => i !== removedIndex));
      setViewerIndex((current) => {
        if (current === null || remaining <= 0) return null;
        return Math.min(current, remaining - 1);
      });
      setDeleteIndex(null);
    } catch (error) {
      setDeleteIndex(null);
      Alert.alert("Delete failed", error?.message || "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    if (!deleting) setDeleteIndex(null);
  };

  /* ---------------- RENDER ---------------- */

  const canAdd = photos.length < MAX_PHOTOS;
  const viewerOpen = viewerIndex !== null && !!photos[viewerIndex];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <LinearGradient
        colors={Colors.gradientLogo}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Gallery</Text>

        <View style={styles.headerPrivate}>
          <Ionicons name="shield-checkmark-outline" size={26} color="#FFFFFF" />
          <Text style={styles.headerPrivateText}>
            Your photos{"\n"}are private
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPhotos(true)}
            tintColor={Colors.primaryRed}
            colors={[Colors.primaryRed]}
          />
        }
      >
        {/* PRIVATE GALLERY CARD */}
        <View style={styles.privateCard}>
          <View style={styles.lockCircle}>
            <Ionicons name="lock-closed" size={24} color={Colors.primaryRed} />
          </View>
          <View style={styles.privateContent}>
            <Text style={styles.privateTitle}>Private Gallery</Text>
            <Text style={styles.privateText}>
              Only approved members can view your photos.
            </Text>
          </View>
        </View>

        {/* GRID */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primaryRed} />
          </View>
        ) : (
          <View style={styles.grid}>
            {canAdd && (
              <TouchableOpacity
                style={styles.addTile}
                activeOpacity={0.8}
                onPress={handleAddPress}
              >
                <Ionicons name="camera" size={34} color={Colors.primaryRed} />
                <Text style={styles.addText}>Add Photo</Text>
              </TouchableOpacity>
            )}

            {photos.map((photo, index) => (
              <Pressable
                key={photo.id ?? photo.uri}
                style={styles.tile}
                onPress={() => setViewerIndex(index)}
              >
                <Image source={{ uri: photo.uri }} style={styles.fill} />
                <TouchableOpacity
                  style={styles.menuButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => setMenuIndex(index)}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={15}
                    color="#1B1B1B"
                  />
                </TouchableOpacity>
              </Pressable>
            ))}
          </View>
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
          </Text>
          <Text style={styles.footerText}>
            Maximum {MAX_PHOTOS} photos allowed
          </Text>
        </View>
      </ScrollView>

      {/* DELETE DIALOG (grid) — an overlay, not a Modal, so the same dialog also works over the viewer */}
      {deleteIndex !== null && !viewerOpen && (
        <DeleteDialog
          deleting={deleting}
          onCancel={closeDeleteDialog}
          onConfirm={performDelete}
        />
      )}

      {/* PHOTO OPTIONS SHEET */}
      <Modal
        visible={menuIndex !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuIndex(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuIndex(null)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Photo options</Text>

          <SheetRow
            icon="expand-outline"
            label="View photo"
            tint="#1F6FEB"
            tintBg="#E6F0FF"
            onPress={() => {
              const index = menuIndex;
              setMenuIndex(null);
              setViewerIndex(index);
            }}
          />
          <SheetRow
            icon="download-outline"
            label="Download"
            tint="#039855"
            tintBg="#DCFAE6"
            onPress={() => {
              const index = menuIndex;
              setMenuIndex(null);
              handleDownload(index);
            }}
          />
          <SheetRow
            icon="trash-outline"
            label="Delete photo"
            tint={DANGER}
            tintBg={DANGER_SOFT}
            danger
            onPress={() => {
              const index = menuIndex;
              setMenuIndex(null);
              setDeleteIndex(index);
            }}
          />

          <TouchableOpacity
            style={styles.sheetCancel}
            activeOpacity={0.8}
            onPress={() => setMenuIndex(null)}
          >
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* FULL SCREEN VIEWER */}
      <Modal
        visible={viewerOpen}
        animationType="fade"
        onRequestClose={() => setViewerIndex(null)}
      >
        {viewerOpen && (
          <View style={styles.viewer}>
            <StatusBar barStyle="light-content" />

            <View style={[styles.viewerTop, { paddingTop: insets.top + 10 }]}>
              <TouchableOpacity
                style={styles.viewerIconBtn}
                onPress={() => setViewerIndex(null)}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.viewerCount}>
                {viewerIndex + 1} of {photos.length}
              </Text>

              <TouchableOpacity
                style={styles.viewerIconBtn}
                onPress={() => setDeleteIndex(viewerIndex)}
              >
                <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.viewerStage}>
              <Image
                source={{ uri: photos[viewerIndex].uri }}
                style={styles.fill}
                resizeMode="cover"
              />

              {viewerIndex > 0 && (
                <TouchableOpacity
                  style={[styles.arrow, styles.arrowLeft]}
                  onPress={() => setViewerIndex(viewerIndex - 1)}
                >
                  <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
              )}

              {viewerIndex < photos.length - 1 && (
                <TouchableOpacity
                  style={[styles.arrow, styles.arrowRight]}
                  onPress={() => setViewerIndex(viewerIndex + 1)}
                >
                  <Ionicons name="chevron-forward" size={22} color="#111" />
                </TouchableOpacity>
              )}
            </View>

            <View
              style={[
                styles.viewerBottom,
                { paddingBottom: insets.bottom + 18 },
              ]}
            >
              <ViewerAction
                icon="download-outline"
                label="Download"
                onPress={() => handleDownload(viewerIndex)}
              />
              <ViewerAction
                icon="share-social-outline"
                label="Share"
                onPress={() => handleShare(viewerIndex)}
              />
              <ViewerAction
                icon="trash-outline"
                label="Delete"
                danger
                onPress={() => setDeleteIndex(viewerIndex)}
              />
            </View>

            {/* DELETE DIALOG (viewer) */}
            {deleteIndex !== null && (
              <DeleteDialog
                deleting={deleting}
                onCancel={closeDeleteDialog}
                onConfirm={performDelete}
              />
            )}
          </View>
        )}
      </Modal>
    </View>
  );
}

/* ============================================================
   SUB COMPONENTS
============================================================ */

function SheetRow({ icon, label, tint, tintBg, danger, onPress }) {
  return (
    <TouchableOpacity
      style={styles.sheetRow}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View style={[styles.sheetIcon, { backgroundColor: tintBg }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text style={[styles.sheetLabel, danger && { color: DANGER }]}>
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={danger ? "#F4A6A0" : "#B6BBC3"}
      />
    </TouchableOpacity>
  );
}

function ViewerAction({ icon, label, danger, onPress }) {
  return (
    <TouchableOpacity
      style={styles.viewerAction}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[styles.viewerActionCircle, danger && styles.viewerActionDanger]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={danger ? "#FF6B60" : "#FFFFFF"}
        />
      </View>
      <Text style={[styles.viewerActionText, danger && { color: "#FF8A80" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DeleteDialog({ deleting, onCancel, onConfirm }) {
  return (
    <View style={styles.dialogOverlay}>
      <View style={styles.dialogCard}>
        <View style={styles.dialogIconOuter}>
          <View style={styles.dialogIconInner}>
            <Ionicons name="trash-outline" size={26} color={DANGER} />
          </View>
        </View>

        <Text style={styles.dialogTitle}>Delete this photo?</Text>
        <Text style={styles.dialogText}>
          This photo will be permanently removed from your gallery. This action
          can't be undone.
        </Text>

        <View style={styles.dialogActions}>
          <TouchableOpacity
            style={styles.dialogCancel}
            activeOpacity={0.8}
            disabled={deleting}
            onPress={onCancel}
          >
            <Text style={styles.dialogCancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dialogDelete, deleting && { opacity: 0.7 }]}
            activeOpacity={0.85}
            disabled={deleting}
            onPress={onConfirm}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.dialogDeleteText}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  fill: { width: "100%", height: "100%" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    marginLeft: 10,
    fontSize: 22,
    fontFamily: Fonts.display?.bold || Fonts.bold,
    color: "#FFFFFF",
  },
  headerPrivate: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerPrivateText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.body?.regular || Fonts.regular,
    color: "#FFFFFF",
  },

  content: { paddingHorizontal: H_PADDING, paddingTop: 16 },

  privateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  lockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F9D3D3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  privateContent: { flex: 1 },
  privateTitle: {
    fontSize: 16,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: Colors.textPrimary || "#111",
  },
  privateText: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#555",
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: GAP },
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F1F1F1",
  },
  addTile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#FDF1F1",
    borderWidth: 1.2,
    borderColor: "#EBB9B9",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: Colors.primaryRed,
  },
  menuButton: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBox: { paddingVertical: 60, alignItems: "center" },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  footerText: {
    fontSize: 13.5,
    fontFamily: Fonts.body?.regular || Fonts.regular,
    color: "#7A7F87",
  },

  /* OPTIONS SHEET */
  backdrop: { flex: 1, backgroundColor: "rgba(16,24,40,0.55)" },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D0D5DD",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: Colors.textPrimary || "#101828",
    marginBottom: 12,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 58,
    marginBottom: 8,
  },
  sheetIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sheetLabel: {
    flex: 1,
    fontSize: 15.5,
    fontFamily: Fonts.body?.regular || Fonts.regular,
    color: Colors.textPrimary || "#101828",
  },
  sheetCancel: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4E7EC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  sheetCancelText: {
    fontSize: 15.5,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: "#344054",
  },

  /* DELETE DIALOG */
  dialogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16,24,40,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    zIndex: 100,
    elevation: 100,
  },
  dialogCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: "center",
  },
  dialogIconOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FEF3F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  dialogIconInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DANGER_SOFT,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogTitle: {
    fontSize: 18,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: "#101828",
  },
  dialogText: {
    marginTop: 8,
    marginBottom: 22,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.body?.regular || Fonts.regular,
    color: "#667085",
  },
  dialogActions: { flexDirection: "row", gap: 12, width: "100%" },
  dialogCancel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
  },
  dialogCancelText: {
    fontSize: 15,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: "#344054",
  },
  dialogDelete: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: DANGER,
    alignItems: "center",
    justifyContent: "center",
  },
  dialogDeleteText: {
    fontSize: 15,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: "#FFFFFF",
  },

  /* VIEWER */
  viewer: { flex: 1, backgroundColor: "#000000" },
  viewerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  viewerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerCount: {
    fontSize: 17,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: "#FFFFFF",
  },
  viewerStage: { flex: 1, backgroundColor: "#111" },
  arrow: {
    position: "absolute",
    top: "50%",
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowLeft: { left: 20 },
  arrowRight: { right: 20 },
  viewerBottom: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
  },
  viewerAction: { alignItems: "center", minWidth: 80 },
  viewerActionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerActionDanger: { backgroundColor: "rgba(217,45,32,0.22)" },
  viewerActionText: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: Fonts.body?.regular || Fonts.regular,
    color: "#FFFFFF",
  },
});
