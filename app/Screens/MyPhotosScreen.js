import Feather from "react-native-vector-icons/Feather";
import LinearGradient from "react-native-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BASE_URL from "../constants/AppUrls";
import { Colors } from "../constants/colors";
import Fonts from "../constants/Fonts";

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
  (Dimensions.get("window").width -
    H_PADDING * 2 -
    GAP * (COLUMNS - 1)) /
  COLUMNS;

const TILE_HEIGHT = TILE_WIDTH * 1.25;

const DANGER = "#D92D20";
const DANGER_SOFT = "#FEE4E2";

/* ============================================================
   HELPERS
============================================================ */

const toAbsoluteUrl = (value) => {
  if (!value) return "";

  if (
    /^(https?:|file:|content:|data:)/i.test(value)
  ) {
    return value;
  }

  return `${String(BASE_URL).replace(
    /\/+$/,
    "",
  )}/${String(value).replace(/^\/+/, "")}`;
};


const extractList = (result) => {
  if (Array.isArray(result)) {
    return result;
  }

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
      const uri = toAbsoluteUrl(
        item?.image_path,
      );

      return uri
        ? {
            id: item?.image_id ?? null,
            uri,
          }
        : null;
    })
    .filter(Boolean);


/* ============================================================
   SCREEN
============================================================ */

export default function MyGalleryScreen({
  navigation,
  route,
}) {
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [viewerIndex, setViewerIndex] =
    useState(null);

  const [menuIndex, setMenuIndex] =
    useState(null);

  const [deleteIndex, setDeleteIndex] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);


  /* ==========================================================
     BACK HANDLER
  ========================================================== */

  const closeDeleteDialog = () => {
    if (!deleting) {
      setDeleteIndex(null);
    }
  };


  const onBackPress = () => {
    if (menuIndex !== null) {
      setMenuIndex(null);
      return true;
    }

    if (deleteIndex !== null) {
      closeDeleteDialog();
      return true;
    }

    if (viewerIndex !== null) {
      setViewerIndex(null);
      return true;
    }

    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation.navigate(
        route?.params?.page || "Home",
        route?.params?.prevs || {},
      );
    }

    return true;
  };


  useFocusEffect(
    useCallback(() => {
      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress,
        );

      return () =>
        subscription.remove();
    }, [
      navigation,
      route,
      menuIndex,
      deleteIndex,
      viewerIndex,
      deleting,
    ]),
  );


  /* ==========================================================
     LOAD PHOTOS
  ========================================================== */

  const loadPhotos = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        }

        const token = await getToken();

        if (!token) {
          return;
        }

        const result =
          await getGalleryImages(token);

        const list =
          extractPhotos(result);

        console.log(
          "GALLERY PARSED:",
          list.length,
          list[0],
        );

        setPhotos(list);
      } catch (error) {
        console.log(
          "loadPhotos error:",
          error,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );


  /* ==========================================================
     RELOAD WHEN SCREEN FOCUSES
  ========================================================== */

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );


  /* ==========================================================
     ADD PHOTO
  ========================================================== */

  const handleAddPress = () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(
        "Limit reached",
        `You can add up to ${MAX_PHOTOS} photos. Delete one to add another.`,
      );

      return;
    }

    navigation.navigate("Addphoto");
  };


  /* ==========================================================
     SHARE
  ========================================================== */

  const handleShare = async (index) => {
    const photo = photos[index];

    if (!photo) {
      return;
    }

    try {
      await Share.share({
        message: photo.uri,
        url: photo.uri,
      });
    } catch (error) {
      console.log(
        "share error:",
        error,
      );
    }
  };


  /* ==========================================================
     DOWNLOAD
  ========================================================== */

  const handleDownload = (index) => {
    const photo = photos[index];

    if (photo) {
      Linking.openURL(
        photo.uri,
      ).catch(() => {});
    }
  };


  /* ==========================================================
     DELETE PHOTO
  ========================================================== */

  const performDelete = async () => {
    const photo =
      photos[deleteIndex];

    if (!photo || deleting) {
      return;
    }

    try {
      setDeleting(true);

      const token =
        await getToken();

      await deleteGalleryImage(
        token,
        photo.id,
      );

      const removedIndex =
        deleteIndex;

      const remaining =
        photos.length - 1;

      setPhotos((prev) =>
        prev.filter(
          (_, i) =>
            i !== removedIndex,
        ),
      );

      setViewerIndex((current) => {
        if (
          current === null ||
          remaining <= 0
        ) {
          return null;
        }

        return Math.min(
          current,
          remaining - 1,
        );
      });

      setDeleteIndex(null);
    } catch (error) {
      setDeleteIndex(null);

      Alert.alert(
        "Delete failed",
        error?.message ||
          "Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  };


  /* ==========================================================
     RENDER VALUES
  ========================================================== */

  const canAdd =
    photos.length < MAX_PHOTOS;

  const viewerOpen =
    viewerIndex !== null &&
    !!photos[viewerIndex];


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <SafeAreaView
      style={styles.root}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#D7192A"
      />


      {/* ======================================================
          HEADER
      ====================================================== */}

      <LinearGradient
        colors={
          Colors.gradientLogo
        }
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerBack}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Feather
  name="arrow-left"
  size={26}
  color="#FFFFFF"
/>
        </TouchableOpacity>


        <Text
          style={styles.headerTitle}
        >
          My Gallery
        </Text>


        <View
          style={
            styles.headerPrivate
          }
        >
       <Feather
  name="shield"
  size={26}
  color="#FFFFFF"
/>

          <Text
            style={
              styles.headerPrivateText
            }
          >
            Your photos{"\n"}
            are private
          </Text>
        </View>
      </LinearGradient>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadPhotos(true)
            }
            tintColor={
              Colors.primaryRed
            }
            colors={[
              Colors.primaryRed,
            ]}
          />
        }
      >


        {/* ====================================================
            PRIVATE GALLERY
        ==================================================== */}

        <View
          style={
            styles.privateCard
          }
        >
          <View
            style={
              styles.lockCircle
            }
          >
         <Feather
  name="lock"
  size={24}
  color={Colors.primaryRed}
/>
          </View>


          <View
            style={
              styles.privateContent
            }
          >
            <Text
              style={
                styles.privateTitle
              }
            >
              Private Gallery
            </Text>

            <Text
              style={
                styles.privateText
              }
            >
              Only approved members can
              view your photos.
            </Text>
          </View>
        </View>


        {/* ====================================================
            GRID
        ==================================================== */}

        {loading ? (
          <View
            style={
              styles.loadingBox
            }
          >
            <ActivityIndicator
              size="large"
              color={
                Colors.primaryRed
              }
            />
          </View>
        ) : (
          <View
            style={styles.grid}
          >

            {/* ADD PHOTO */}

            {canAdd && (
              <TouchableOpacity
                style={
                  styles.addTile
                }
                activeOpacity={0.8}
                onPress={
                  handleAddPress
                }
              >
             <Feather
  name="camera"
  size={34}
  color={Colors.primaryRed}
/>

                <Text
                  style={
                    styles.addText
                  }
                >
                  Add Photo
                </Text>
              </TouchableOpacity>
            )}


            {/* PHOTOS */}

            {photos.map(
              (photo, index) => (
                <Pressable
                  key={
                    photo.id ??
                    photo.uri
                  }
                  style={
                    styles.tile
                  }
                  onPress={() =>
                    setViewerIndex(
                      index,
                    )
                  }
                >
                  <Image
                    source={{
                      uri: photo.uri,
                    }}
                    style={
                      styles.fill
                    }
                  />


                  {/* MENU */}

                  <TouchableOpacity
                    style={
                      styles.menuButton
                    }
                    hitSlop={{
                      top: 8,
                      bottom: 8,
                      left: 8,
                      right: 8,
                    }}
                    onPress={() =>
                      setMenuIndex(
                        index,
                      )
                    }
                  >
                    <Feather
                      name="ellipsis-vertical"
                      size={15}
                      color="#1B1B1B"
                    />
                  </TouchableOpacity>
                </Pressable>
              ),
            )}
          </View>
        )}


        {/* ====================================================
            FOOTER
        ==================================================== */}

        <View
          style={styles.footer}
        >
          <Text
            style={
              styles.footerText
            }
          >
            {photos.length}{" "}
            {photos.length === 1
              ? "Photo"
              : "Photos"}
          </Text>

          <Text
            style={
              styles.footerText
            }
          >
            Maximum {MAX_PHOTOS}{" "}
            photos allowed
          </Text>
        </View>
      </ScrollView>


      {/* ======================================================
          DELETE DIALOG - GRID
      ====================================================== */}

      {deleteIndex !== null &&
        !viewerOpen && (
          <DeleteDialog
            deleting={deleting}
            onCancel={
              closeDeleteDialog
            }
            onConfirm={
              performDelete
            }
          />
        )}


      {/* ======================================================
          PHOTO OPTIONS
      ====================================================== */}

      <Modal
        visible={
          menuIndex !== null
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setMenuIndex(null)
        }
      >
        <Pressable
          style={styles.backdrop}
          onPress={() =>
            setMenuIndex(null)
          }
        />

        <View
          style={styles.sheet}
        >
          <View
            style={
              styles.sheetHandle
            }
          />

          <Text
            style={
              styles.sheetTitle
            }
          >
            Photo options
          </Text>


          {/* VIEW */}

          <SheetRow
            icon="expand-outline"
            label="View photo"
            tint="#1F6FEB"
            tintBg="#E6F0FF"
            onPress={() => {
              const index =
                menuIndex;

              setMenuIndex(null);

              setViewerIndex(
                index,
              );
            }}
          />


          {/* DOWNLOAD */}

          <SheetRow
            icon="download-outline"
            label="Download"
            tint="#039855"
            tintBg="#DCFAE6"
            onPress={() => {
              const index =
                menuIndex;

              setMenuIndex(null);

              handleDownload(
                index,
              );
            }}
          />


          {/* DELETE */}

          <SheetRow
            icon="trash-outline"
            label="Delete photo"
            tint={DANGER}
            tintBg={
              DANGER_SOFT
            }
            danger
            onPress={() => {
              const index =
                menuIndex;

              setMenuIndex(null);

              setDeleteIndex(
                index,
              );
            }}
          />


          {/* CANCEL */}

          <TouchableOpacity
            style={
              styles.sheetCancel
            }
            activeOpacity={0.8}
            onPress={() =>
              setMenuIndex(null)
            }
          >
            <Text
              style={
                styles.sheetCancelText
              }
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>


      {/* ======================================================
          FULL SCREEN VIEWER
      ====================================================== */}

      <Modal
        visible={viewerOpen}
        animationType="fade"
        onRequestClose={() =>
          setViewerIndex(null)
        }
      >
        {viewerOpen && (
          <View
            style={styles.viewer}
          >
            <StatusBar
              barStyle="light-content"
              backgroundColor="#000000"
            />


            {/* VIEWER HEADER */}

            <View
              style={
                styles.viewerTop
              }
            >
              <TouchableOpacity
                style={
                  styles.viewerIconBtn
                }
                onPress={() =>
                  setViewerIndex(
                    null,
                  )
                }
              >
              <Feather
  name="arrow-left"
  size={24}
  color="#FFFFFF"
/>
              </TouchableOpacity>


              <Text
                style={
                  styles.viewerCount
                }
              >
                {viewerIndex + 1}{" "}
                of {photos.length}
              </Text>


              <TouchableOpacity
                style={
                  styles.viewerIconBtn
                }
                onPress={() =>
                  setDeleteIndex(
                    viewerIndex,
                  )
                }
              >
             <Feather
  name="trash-2"
  size={22}
  color="#FFFFFF"
/>
              </TouchableOpacity>
            </View>


            {/* IMAGE */}

            <View
              style={
                styles.viewerStage
              }
            >
              <Image
                source={{
                  uri:
                    photos[
                      viewerIndex
                    ].uri,
                }}
                style={
                  styles.fill
                }
                resizeMode="cover"
              />


              {/* PREVIOUS */}

              {viewerIndex > 0 && (
                <TouchableOpacity
                  style={[
                    styles.arrow,
                    styles.arrowLeft,
                  ]}
                  onPress={() =>
                    setViewerIndex(
                      viewerIndex - 1,
                    )
                  }
                >
                <Feather
  name="chevron-left"
  size={22}
  color="#111"
/>
                </TouchableOpacity>
              )}


              {/* NEXT */}

              {viewerIndex <
                photos.length - 1 && (
                <TouchableOpacity
                  style={[
                    styles.arrow,
                    styles.arrowRight,
                  ]}
                  onPress={() =>
                    setViewerIndex(
                      viewerIndex + 1,
                    )
                  }
                >
                  <Feather
                    name="chevron-right"
                    size={22}
                    color="#111"
                  />
                </TouchableOpacity>
              )}
            </View>


            {/* VIEWER ACTIONS */}

            <View
              style={
                styles.viewerBottom
              }
            >
              <ViewerAction
                icon="download-outline"
                label="Download"
                onPress={() =>
                  handleDownload(
                    viewerIndex,
                  )
                }
              />

              <ViewerAction
                icon="share-social-outline"
                label="Share"
                onPress={() =>
                  handleShare(
                    viewerIndex,
                  )
                }
              />

              <ViewerAction
                icon="trash-outline"
                label="Delete"
                danger
                onPress={() =>
                  setDeleteIndex(
                    viewerIndex,
                  )
                }
              />
            </View>


            {/* DELETE DIALOG */}

            {deleteIndex !== null && (
              <DeleteDialog
                deleting={
                  deleting
                }
                onCancel={
                  closeDeleteDialog
                }
                onConfirm={
                  performDelete
                }
              />
            )}
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}


/* ============================================================
   SUB COMPONENTS
============================================================ */

function SheetRow({
  icon,
  label,
  tint,
  tintBg,
  danger,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={
        styles.sheetRow
      }
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View
        style={[
          styles.sheetIcon,
          {
            backgroundColor:
              tintBg,
          },
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={tint}
        />
      </View>


      <Text
        style={[
          styles.sheetLabel,
          danger && {
            color: DANGER,
          },
        ]}
      >
        {label}
      </Text>


    <Feather
  name="chevron-right"
  size={18}
  color={danger ? "#F4A6A0" : "#B6BBC3"}
/>
    </TouchableOpacity>
  );
}


function ViewerAction({
  icon,
  label,
  danger,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={
        styles.viewerAction
      }
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.viewerActionCircle,
          danger &&
            styles.viewerActionDanger,
        ]}
      >
    <Feather
  name={icon}
  size={22}
  color={danger ? "#FF6B60" : "#FFFFFF"}
/>
      </View>

      <Text
        style={[
          styles.viewerActionText,
          danger && {
            color: "#FF8A80",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}


function DeleteDialog({
  deleting,
  onCancel,
  onConfirm,
}) {
  return (
    <View
      style={
        styles.dialogOverlay
      }
    >
      <View
        style={
          styles.dialogCard
        }
      >

        <View
          style={
            styles.dialogIconOuter
          }
        >
          <View
            style={
              styles.dialogIconInner
            }
          >
         <Feather
  name="trash-2"
  size={26}
  color={DANGER}
/>
          </View>
        </View>


        <Text
          style={
            styles.dialogTitle
          }
        >
          Delete this photo?
        </Text>


        <Text
          style={
            styles.dialogText
          }
        >
          This photo will be
          permanently removed
          from your gallery. This
          action can't be undone.
        </Text>


        <View
          style={
            styles.dialogActions
          }
        >

          <TouchableOpacity
            style={
              styles.dialogCancel
            }
            activeOpacity={0.8}
            disabled={deleting}
            onPress={onCancel}
          >
            <Text
              style={
                styles.dialogCancelText
              }
            >
              Cancel
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.dialogDelete,
              deleting && {
                opacity: 0.7,
              },
            ]}
            activeOpacity={0.85}
            disabled={deleting}
            onPress={onConfirm}
          >
            {deleting ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={
                  styles.dialogDeleteText
                }
              >
                Delete
              </Text>
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

const styles =
  StyleSheet.create({

    root: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
    },

    fill: {
      width: "100%",
      height: "100%",
    },


    /* HEADER */

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 18,
    },

    headerBack: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerTitle: {
      flex: 1,
      marginLeft: 10,
      fontSize: 22,
      fontFamily:
        Fonts.display?.bold ||
        Fonts.bold,
      color: "#FFFFFF",
    },

    headerPrivate: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    headerPrivateText: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily:
        Fonts.body?.regular ||
        Fonts.regular,
      color: "#FFFFFF",
    },


    /* CONTENT */

    content: {
      paddingHorizontal:
        H_PADDING,
      paddingTop: 16,
    },


    /* PRIVATE CARD */

    privateCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FDECEC",
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
    },

    lockCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor:
        "#F9D3D3",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 14,
    },

    privateContent: {
      flex: 1,
    },

    privateTitle: {
      fontSize: 16,
      fontFamily:
        Fonts.body?.bold ||
        Fonts.bold,
      color:
        Colors.textPrimary ||
        "#111",
    },

    privateText: {
      marginTop: 3,
      fontSize: 13,
      lineHeight: 18,
      fontFamily:
        Fonts.body?.regular ||
        Fonts.regular,
      color:
        Colors.textSecondary ||
        "#555",
    },


    /* GRID */

    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: GAP,
    },

    tile: {
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor:
        "#F1F1F1",
    },

    addTile: {
      width: TILE_WIDTH,
      height: TILE_HEIGHT,
      borderRadius: 10,
      backgroundColor:
        "#FDF1F1",
      borderWidth: 1.2,
      borderColor:
        "#EBB9B9",
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent:
        "center",
    },

    addText: {
      marginTop: 10,
      fontSize: 14,
      fontFamily:
        Fonts.body?.bold ||
        Fonts.bold,
      color:
        Colors.primaryRed,
    },

    menuButton: {
      position: "absolute",
      top: 7,
      right: 7,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        "rgba(255,255,255,0.92)",
      alignItems: "center",
      justifyContent:
        "center",
    },

    loadingBox: {
      paddingVertical: 60,
      alignItems: "center",
    },


    /* FOOTER */

    footer: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 22,
    },

    footerText: {
      fontSize: 13.5,
      fontFamily:
        Fonts.body?.regular ||
        Fonts.regular,
      color: "#7A7F87",
    },


    /* OPTIONS SHEET */

    backdrop: {
      flex: 1,
      backgroundColor:
        "rgba(16,24,40,0.55)",
    },

    sheet: {
      backgroundColor:
        "#FFFFFF",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 16,
    },

    sheetHandle: {
      alignSelf: "center",
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor:
        "#D0D5DD",
      marginBottom: 14,
    },

    sheetTitle: {
      fontSize: 17,
      fontFamily:
        Fonts.body?.bold ||
        Fonts.bold,
      color:
        Colors.textPrimary ||
        "#101828",
      marginBottom: 12,
    },

    sheetRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#F9FAFB",
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
      justifyContent:
        "center",
      marginRight: 12,
    },

    sheetLabel: {
      flex: 1,
      fontSize: 15.5,
      fontFamily:
        Fonts.body?.regular ||
        Fonts.regular,
      color:
        Colors.textPrimary ||
        "#101828",
    },

    sheetCancel: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#E4E7EC",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 6,
    },

    sheetCancelText: {
      fontSize: 15.5,
      fontFamily:
        Fonts.body?.bold ||
        Fonts.bold,
      color: "#344054",
    },


    /* DELETE DIALOG */

    dialogOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        "rgba(16,24,40,0.6)",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 28,
      zIndex: 100,
      elevation: 100,
    },

    dialogCard: {
      width: "100%",
      backgroundColor:
        "#FFFFFF",
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
      backgroundColor:
        "#FEF3F2",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 16,
    },

    dialogIconInner: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor:
        DANGER_SOFT,
      alignItems: "center",
      justifyContent:
        "center",
    },

    dialogTitle: {
      fontSize: 18,
      fontFamily:
        Fonts.body?.bold ||
        Fonts.bold,
      color: "#101828",
    },

    dialogText: {
      marginTop: 8,
      marginBottom: 22,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 21,
      fontFamily:
        Fonts.body?.regular ||
        Fonts.regular,
      color: "#667085",
    },

    dialogActions: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
    },

    dialogCancel: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        "#D0D5DD",
      alignItems: "center",
      justifyContent:
        "center",
    },

    dialogCancelText: {
      fontSize: 15,
      fontFamily:
        Fonts.body?.bold ||
        Fonts.bold,
      color: "#344054",
    },

    dialogDelete: {
      flex: 1,
      height: 48,
      borderRadius: 12,
      backgroundColor:
        DANGER,
      alignItems: "center",
      justifyContent:
        "center",
    },

    dialogDeleteText: {
      fontSize: 15,
      fontFamily:
        Fonts.body?.bold ||
        Fonts.bold,
      color: "#FFFFFF",
    },


    /* VIEWER */

    viewer: {
      flex: 1,
      backgroundColor:
        "#000000",
    },

    viewerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 12,
    },

    viewerIconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor:
        "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent:
        "center",
    },

    viewerCount: {
      fontSize: 17,
      fontFamily:
        Fonts.body?.bold ||
        Fonts.bold,
      color: "#FFFFFF",
    },

    viewerStage: {
      flex: 1,
      backgroundColor: "#111",
    },

    arrow: {
      position: "absolute",
      top: "50%",
      marginTop: -24,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    arrowLeft: {
      left: 20,
    },

    arrowRight: {
      right: 20,
    },

    viewerBottom: {
      flexDirection: "row",
      justifyContent:
        "space-around",
      paddingTop: 20,
    },

    viewerAction: {
      alignItems: "center",
      minWidth: 80,
    },

    viewerActionCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor:
        "rgba(255,255,255,0.14)",
      alignItems: "center",
      justifyContent:
        "center",
    },

    viewerActionDanger: {
      backgroundColor:
        "rgba(217,45,32,0.22)",
    },

    viewerActionText: {
      marginTop: 8,
      fontSize: 13,
      fontFamily:
        Fonts.body?.regular ||
        Fonts.regular,
      color: "#FFFFFF",
    },
  });