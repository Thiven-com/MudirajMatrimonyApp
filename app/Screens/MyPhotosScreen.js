import { useCallback, useEffect, useState } from "react";

import {
  Alert,
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker";
import Feather from "react-native-vector-icons/Feather";

import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { Colors } from "../constants/colors";
import Fonts from "../constants/Fonts";

// If you already have an API for photos, import it here.
// Example:
// import {
//   getMemberPhotos,
//   updateMemberPhotos,
// } from "../utils/Functions";

/* =====
   PHOTO GUIDELINES
===== */

const PHOTO_GUIDELINES = [
  "Use a clear, recent photo",
  "Your face should be clearly visible",
  "Good lighting and background",
  "JPG, JPEG or PNG format",
  "Maximum file size 5MB",
  "No filters or heavily edited photos",
];

/* =====
   ADDITIONAL PHOTO COUNT
===== */

const ADDITIONAL_PHOTO_SLOTS = 4;

/* =====
   MY PHOTOS
===== */

export default function MyPhotos() {
  const navigation = useNavigation();

  /* ===
     STATE
  === */

  const [profilePhoto, setProfilePhoto] = useState(null);

  const [additionalPhotos, setAdditionalPhotos] = useState(
    Array(ADDITIONAL_PHOTO_SLOTS).fill(null),
  );

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  /* ===
     BACK
  === */

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  /* ===
     ANDROID HARDWARE BACK
     
     Same pattern as Languages.jsx
  === */

  useEffect(() => {
    const handleHardwareBack = () => {
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
  }, [handleBack]);

  /* ===
     IMAGE PICKER
     
     React Native CLI
     No Expo
  === */

  const pickImage = useCallback(async (onPicked) => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",

        selectionLimit: 1,

        includeBase64: false,

        quality: 0.8,

        presentationStyle: "pageSheet",
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        console.error(
          "IMAGE PICKER ERROR:",
          result.errorCode,
          result.errorMessage,
        );

        Alert.alert(
          "Image Picker Error",
          result.errorMessage || "Unable to select image.",
        );

        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        const uri = asset.uri;

        if (!uri) {
          Alert.alert("Error", "Unable to get selected image.");

          return;
        }

        /* -----------------------------------------------
           FILE SIZE CHECK
           
           Maximum 5MB
        ----------------------------------------------- */

        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select an image smaller than 5MB.",
          );

          return;
        }

        onPicked({
          uri,
          fileName: asset.fileName || "photo.jpg",
          type: asset.type || "image/jpeg",
          fileSize: asset.fileSize || 0,
        });
      }
    } catch (error) {
      console.error("IMAGE PICKER ERROR:", error);

      Alert.alert("Error", error?.message || "Unable to select image.");
    }
  }, []);

  /* ===
     PROFILE PHOTO
  === */

  const handlePickProfilePhoto = () => {
    pickImage((image) => {
      setProfilePhoto(image);
    });
  };

  const handleRemoveProfilePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove your profile photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setProfilePhoto(null);
          },
        },
      ],
    );
  };

  /* ===
     ADDITIONAL PHOTO
  === */

  const handlePickAdditionalPhoto = (index) => {
    pickImage((image) => {
      setAdditionalPhotos((previous) => {
        const next = [...previous];

        next[index] = image;

        return next;
      });
    });
  };

  const handleRemoveAdditionalPhoto = (index) => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setAdditionalPhotos((previous) => {
            const next = [...previous];

            next[index] = null;

            return next;
          });
        },
      },
    ]);
  };

  /* ===
     SAVE
  === */

  const handleSaveAndContinue = async () => {
    if (saving) {
      return;
    }

    /* -------------------------------------------------------
       PROFILE PHOTO REQUIRED
    ------------------------------------------------------- */

    if (!profilePhoto) {
      Alert.alert(
        "Profile Photo Required",
        "Please add a profile photo before continuing.",
      );

      return;
    }

    try {
      setSaving(true);

      setErrorMessage("");

      /* -----------------------------------------------------
         TOKEN
      ----------------------------------------------------- */

      const accessToken = await AsyncStorage.getItem("authToken");

      if (!accessToken) {
        Alert.alert("Login Required", "Please login again.");

        return;
      }

      /* -----------------------------------------------------
         PHOTO DATA
         
         This is ready for your API.
      ----------------------------------------------------- */

      const selectedAdditionalPhotos = additionalPhotos.filter(
        (photo) => photo !== null,
      );

      const photoData = {
        profilePhoto,
        additionalPhotos: selectedAdditionalPhotos,
      };



      /*
      const response = await updateMemberPhotos(
        accessToken,
        photoData,
      );

      console.log(
        "PHOTO API RESPONSE:",
        JSON.stringify(
          response,
          null,
          2,
        ),
      );

      const success =
        response?.success === 1 ||
        response?.success === true ||
        response?.result === true;

      if (!success) {
        throw new Error(
          response?.message ||
            "Unable to save photos.",
        );
      }
      */

      /* -----------------------------------------------------
         TEMPORARY SUCCESS
         
         Remove this when API is connected.
      ----------------------------------------------------- */

      Alert.alert("Success", "Photos selected successfully.", [
        {
          text: "Continue",
          onPress: () => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error) {
      console.error("SAVE PHOTOS ERROR:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while saving your photos.";

      setErrorMessage(message);

      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  /* ===
     REFRESH / SCREEN FOCUS
  === */

  useFocusEffect(
    useCallback(() => {
      /*
       * If you have a GET photos API,
       * call it here.
       *
       * Example:
       *
       * loadPhotos();
       */
    }, []),
  );

  /* ===
     UI
  === */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===
            HEADER
        === */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={24} color="#222222" />
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={styles.progressActive} />
            </View>

            <Text style={styles.progressText}>Step 6 of 7</Text>
          </View>
        </View>

        {/* ===
            TITLE
        === */}

        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Add your photos</Text>

          <Text style={styles.pageSubtitle}>
            Let your personality shine through your photos.
          </Text>
        </View>

        {/* ===
            PROFILE PHOTO CARD
        === */}

        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Profile photo</Text>

              <Text style={styles.cardSubtitle}>
                Your primary profile picture
              </Text>
            </View>

            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          </View>

          <View style={styles.profileContent}>
            <PhotoUploadBox
              image={profilePhoto}
              size="large"
              label="Add photo"
              helperText="JPG, PNG • Max 5MB"
              onPress={handlePickProfilePhoto}
              onRemove={handleRemoveProfilePhoto}
            />

            <View style={styles.guidelinesBlock}>
              <Text style={styles.guidelinesTitle}>Photo guidelines</Text>

              {PHOTO_GUIDELINES.map((item) => (
                <View key={item} style={styles.guidelineRow}>
                  <Feather name="check-circle" size={16} color="#2E9B65" />

                  <Text style={styles.guidelineText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ===
            MORE PHOTOS
        === */}

        <View style={styles.additionalSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>More photos</Text>

              <Text style={styles.sectionSubtitle}>
                Add up to 4 additional photos
              </Text>
            </View>

            <Text style={styles.optionalText}>Optional</Text>
          </View>

          <View style={styles.additionalGrid}>
            {additionalPhotos.map((image, index) => (
              <PhotoUploadBox
                key={index}
                image={image}
                size="small"
                label="Add photo"
                helperText="Max 5MB"
                onPress={() => handlePickAdditionalPhoto(index)}
                onRemove={() => handleRemoveAdditionalPhoto(index)}
              />
            ))}
          </View>
        </View>

        {/* ===
            PRIVACY
        === */}

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Feather name="shield" size={19} color="#4F46E5" />
          </View>

          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>Your privacy matters</Text>

            <Text style={styles.privacyText}>
              Your photos are securely stored and only shown according to your
              profile visibility settings.
            </Text>
          </View>
        </View>

        {/* ===
            ERROR
        === */}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={18} color="#D32F2F" />

            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* ===
            SAVE BUTTON
        === */}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          activeOpacity={0.85}
          disabled={saving}
          onPress={handleSaveAndContinue}
        >
          {saving ? (
            <Text style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save & Continue</Text>

              <Feather name="arrow-right" size={19} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {/* ===
            BOTTOM HINT
        === */}

        <Text style={styles.bottomHint}>
          You can update your photos anytime from your profile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====
   PHOTO UPLOAD BOX
===== */

function PhotoUploadBox({ image, size, label, helperText, onPress, onRemove }) {
  const isLarge = size === "large";

  return (
    <TouchableOpacity
      style={[
        styles.photoBox,
        isLarge ? styles.photoBoxLarge : styles.photoBoxSmall,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {image?.uri ? (
        <>
          <Image
            source={{
              uri: image.uri,
            }}
            style={styles.photoPreview}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.removeButton}
            hitSlop={{
              top: 8,
              bottom: 8,
              left: 8,
              right: 8,
            }}
            onPress={onRemove}
            activeOpacity={0.8}
          >
            <Feather name="x" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View
            style={[
              styles.photoIconCircle,
              isLarge
                ? styles.photoIconCircleLarge
                : styles.photoIconCircleSmall,
            ]}
          >
            <Feather
              name="camera"
              size={isLarge ? 28 : 20}
              color={Colors.primaryRed || "#D7192E"}
            />

            <View style={styles.photoIconPlusBadge}>
              <Feather name="plus" size={isLarge ? 12 : 9} color="#FFFFFF" />
            </View>
          </View>

          <Text
            style={isLarge ? styles.photoLabelLarge : styles.photoLabelSmall}
          >
            {label}
          </Text>

          {helperText ? (
            <Text
              style={
                isLarge ? styles.photoHelperLarge : styles.photoHelperSmall
              }
            >
              {helperText}
            </Text>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

/* =====
   STYLES
===== */

const styles = StyleSheet.create({
  /* =======
     SAFE AREA
  ======= */

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* =======
     SCROLL
  ======= */

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 35,
  },

  /* =======
     HEADER
  ======= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
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

  progressContainer: {
    flex: 1,
    marginLeft: 14,
  },

  progressTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: "#E9E9E9",
    overflow: "hidden",
  },

  progressActive: {
    width: "85%",
    height: "100%",
    backgroundColor: Colors.primaryRed || "#D7192E",
    borderRadius: 5,
  },

  progressText: {
    marginTop: 5,
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
    textAlign: "right",
  },

  /* =======
     TITLE
  ======= */

  titleSection: {
    marginBottom: 22,
  },

  pageTitle: {
    fontSize: Fonts.size.title,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary || "#222222",
    letterSpacing: -0.4,
  },

  pageSubtitle: {
    marginTop: 7,
    fontSize: Fonts.size.md,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
    lineHeight: 20,
  },

  /* =======
     PROFILE CARD
  ======= */

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 24,

    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  cardTitle: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary || "#222222",
  },

  cardSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
    marginTop: 3,
  },

  requiredBadge: {
    backgroundColor: "#FCE9E7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  requiredText: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
    color: Colors.primaryRed || "#D7192E",
  },

  /* =======
     PROFILE CONTENT
  ======= */

  profileContent: {
    flexDirection: "row",
  },

  /* =======
     GUIDELINES
  ======= */

  guidelinesBlock: {
    flex: 1,
    paddingTop: 2,
    paddingLeft: 15,
  },

  guidelinesTitle: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary || "#222222",
    marginBottom: 10,
  },

  guidelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 7,
  },

  guidelineText: {
    flex: 1,
    marginLeft: 6,
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
    lineHeight: 15,
  },

  /* =======
     ADDITIONAL SECTION
  ======= */

  additionalSection: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary || "#222222",
  },

  sectionSubtitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
    marginTop: 3,
  },

  optionalText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.textMuted || "#777777",
    backgroundColor: "#F3F3F3",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  /* =======
     GRID
  ======= */

  additionalGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  /* =======
     PHOTO BOX
  ======= */

  photoBox: {
    borderWidth: 1.4,
    borderColor: "#E3B3AE",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#FFF9F8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  photoBoxLarge: {
    width: 142,
    height: 142,
  },

  photoBoxSmall: {
    width: "23.5%",
    height: 92,
    paddingHorizontal: 3,
  },

  photoPreview: {
    width: "100%",
    height: "100%",
  },

  removeButton: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* =======
     PHOTO ICON
  ======= */

  photoIconCircle: {
    borderRadius: 999,
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
  },

  photoIconCircleLarge: {
    width: 57,
    height: 57,
    marginBottom: 9,
  },

  photoIconCircleSmall: {
    width: 37,
    height: 37,
    marginBottom: 5,
  },

  photoIconPlusBadge: {
    position: "absolute",
    right: -2,
    bottom: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryRed || "#D7192E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFF9F8",
  },

  photoLabelLarge: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary || "#222222",
  },

  photoLabelSmall: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary || "#222222",
  },

  photoHelperLarge: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
    textAlign: "center",
    marginTop: 3,
  },

  photoHelperSmall: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
    textAlign: "center",
    marginTop: 1,
  },

  /* =======
     PRIVACY
  ======= */

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

  privacyContent: {
    flex: 1,
  },

  privacyTitle: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary || "#222222",
    marginBottom: 2,
  },

  privacyText: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
    lineHeight: 15,
  },

  /* =======
     ERROR
  ======= */

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3F3",
    borderWidth: 1,
    borderColor: "#FFD2D2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#D32F2F",
    fontSize: Fonts.size.md,
  },

  /* =======
     SAVE BUTTON
  ======= */

  saveButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.primaryRedDark || "#B51225",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.12,
    shadowRadius: 8,

    elevation: 4,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: Fonts.size.md,
    fontFamily: Fonts.bold,
    color: Colors.white || "#FFFFFF",
    marginRight: 9,
  },

  /* =======
     BOTTOM HINT
  ======= */

  bottomHint: {
    textAlign: "center",
    marginTop: 10,
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.regular,
    color: Colors.textMuted || "#777777",
  },
});
