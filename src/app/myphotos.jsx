import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
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

const PHOTO_GUIDELINES = [
  "Use a clear, recent photo",
  "Your face should be clearly visible",
  "Good lighting and background",
  "JPG, JPEG or PNG format",
  "Maximum file size 5MB",
  "No filters or heavily edited photos",
];

const ADDITIONAL_PHOTO_SLOTS = 4;

export default function PhotosScreen() {
  const router = useRouter();

  const [profilePhoto, setProfilePhoto] = useState(null);

  const [additionalPhotos, setAdditionalPhotos] = useState(
    Array(ADDITIONAL_PHOTO_SLOTS).fill(null),
  );

  const [saving, setSaving] = useState(false);

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
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      onPicked(result.assets[0].uri);
    }
  };

  const handlePickProfilePhoto = () => {
    pickImage((uri) => setProfilePhoto(uri));
  };

  const handleRemoveProfilePhoto = () => {
    setProfilePhoto(null);
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

      console.log("Saving photos...", {
        profilePhoto,
        additionalPhotos,
      });

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        {/* PAGE TITLE */}

        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Add your photos</Text>

          <Text style={styles.pageSubtitle}>
            Let your personality shine through your photos.
          </Text>
        </View>

        {/* PROFILE PHOTO CARD */}

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
              uri={profilePhoto}
              size="large"
              label="Add photo"
              helperText={"JPG, PNG • Max 5MB"}
              onPress={handlePickProfilePhoto}
              onRemove={handleRemoveProfilePhoto}
            />

            <View style={styles.guidelinesBlock}>
              <Text style={styles.guidelinesTitle}>Photo guidelines</Text>

              {PHOTO_GUIDELINES.map((item) => (
                <View key={item} style={styles.guidelineRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#2E9B65" />

                  <Text style={styles.guidelineText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ADDITIONAL PHOTOS */}

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
            {additionalPhotos.map((uri, index) => (
              <PhotoUploadBox
                key={index}
                uri={uri}
                size="small"
                label="Add photo"
                helperText="Max 5MB"
                onPress={() => handlePickAdditionalPhoto(index)}
                onRemove={() => handleRemoveAdditionalPhoto(index)}
              />
            ))}
          </View>
        </View>

        {/* PRIVACY CARD */}

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#4F46E5"
            />
          </View>

          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>Your privacy matters</Text>

            <Text style={styles.privacyText}>
              Your photos are securely stored and only shown according to your
              profile visibility settings.
            </Text>
          </View>
        </View>

        {/* CONTINUE BUTTON */}

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

        <Text style={styles.bottomHint}>
          You can update your photos anytime from your profile.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   PHOTO UPLOAD BOX
============================================================ */

function PhotoUploadBox({ uri, size, label, helperText, onPress, onRemove }) {
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
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.photoPreview} />

          <TouchableOpacity
            style={styles.removeButton}
            hitSlop={{
              top: 8,
              bottom: 8,
              left: 8,
              right: 8,
            }}
            onPress={onRemove}
          >
            <Ionicons name="close" size={14} color="#FFFFFF" />
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
            <Ionicons
              name="camera-outline"
              size={isLarge ? 29 : 21}
              color={Colors.primaryRed}
            />

            <View style={styles.photoIconPlusBadge}>
              <Ionicons name="add" size={isLarge ? 13 : 10} color="#FFFFFF" />
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

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 35,
  },

  /* ================= TOP BAR ================= */

  topBar: {
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

  /* ================= TITLE ================= */

  titleSection: {
    marginBottom: 22,
  },

  pageTitle: {
    fontSize: 27,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },

  pageSubtitle: {
    marginTop: 7,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 20,
  },

  /* ================= PROFILE CARD ================= */

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 24,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  cardTitle: {
    fontSize: 17,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  cardSubtitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 3,
  },

  requiredBadge: {
    backgroundColor: "#FCE9E7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  requiredText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  profileContent: {
    flexDirection: "row",
    gap: 15,
  },

  /* ================= GUIDELINES ================= */

  guidelinesBlock: {
    flex: 1,
    paddingTop: 2,
  },

  guidelinesTitle: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
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
    fontSize: 10.8,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 15,
  },

  /* ================= ADDITIONAL PHOTOS ================= */

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
    fontSize: 17,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  sectionSubtitle: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 3,
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

  additionalGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 9,
  },

  /* ================= PHOTO BOX ================= */

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
    flex: 1,
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
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFF9F8",
  },

  photoLabelLarge: {
    fontSize: 12.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  photoLabelSmall: {
    fontSize: 9.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },

  photoHelperLarge: {
    fontSize: 9.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 3,
  },

  photoHelperSmall: {
    fontSize: 8,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 1,
  },

  /* ================= PRIVACY ================= */

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

  /* ================= BUTTON ================= */

  saveButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.primaryRedDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: "#000",
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
    fontSize: 15,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  bottomHint: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
});
