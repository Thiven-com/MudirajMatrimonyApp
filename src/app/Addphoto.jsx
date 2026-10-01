import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { Fonts } from "../constants/Fonts";
import { getToken, uploadGalleryImage } from "../utils/Functions";

/* ============================================================
   CONFIG
============================================================ */

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

/* ============================================================
   HELPERS
============================================================ */

const toPhoto = (asset) => ({
  uri: asset.uri,
  name:
    asset.fileName || asset.uri.split("/").pop() || `photo-${Date.now()}.jpg`,
  type: asset.mimeType || "image/jpeg",
});

// Returns an error message, or "" if the asset is fine.
// fileSize / mimeType are not always provided, so only reject when known.
const validateAsset = (asset) => {
  if (asset.mimeType && !ALLOWED_TYPES.includes(asset.mimeType.toLowerCase())) {
    return "Only JPG and PNG photos are supported.";
  }
  if (asset.fileSize && asset.fileSize > MAX_SIZE_BYTES) {
    return "This photo is larger than 5 MB. Please choose a smaller one.";
  }
  return "";
};

/* ============================================================
   SCREEN
============================================================ */

export default function AddPhotoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleResult = (result) => {
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const error = validateAsset(asset);

    if (error) {
      Alert.alert("Can't use this photo", error);
      return;
    }
    setPhoto(toPhoto(asset));
  };

  const chooseFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo library access to add photos.",
      );
      return;
    }

    handleResult(
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      }),
    );
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow camera access to take a photo.");
      return;
    }

    handleResult(
      await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      }),
    );
  };

  const handleUpload = async () => {
    if (!photo || uploading) return;

    try {
      setUploading(true);

      const token = await getToken();
      if (!token) {
        Alert.alert("Login required", "Please log in again.");
        return;
      }

      await uploadGalleryImage(token, photo);

      // The gallery screen reloads itself on focus
      router.back();
    } catch (error) {
      Alert.alert("Upload failed", error?.message || "Please try again.");
    } finally {
      setUploading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Add Photo</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* UPLOAD CARD */}
        <View style={styles.uploadCard}>
          <Ionicons name="cloud-upload" size={62} color="#E31E3B" />
          <Text style={styles.uploadTitle}>Upload Photo</Text>
          <Text style={styles.uploadText}>
            Choose a photo from your gallery{"\n"}or take a new photo.
          </Text>

          <TouchableOpacity
            style={styles.galleryButton}
            activeOpacity={0.85}
            onPress={chooseFromGallery}
            disabled={uploading}
          >
            <Ionicons name="images" size={22} color="#FFFFFF" />
            <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cameraButton}
            activeOpacity={0.85}
            onPress={takePhoto}
            disabled={uploading}
          >
            <Ionicons name="camera" size={22} color={Colors.primaryRed} />
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={30}
            color="#EE8B95"
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>Supported formats: JPG, PNG</Text>
            <Text style={styles.infoText}>Maximum size: 5 MB</Text>
          </View>
        </View>

        {/* PREVIEW */}
        {photo && (
          <>
            <Text style={styles.previewLabel}>Preview</Text>

            <View style={styles.previewBox}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.previewClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => setPhoto(null)}
                disabled={uploading}
              >
                <Ionicons name="close" size={20} color="#111" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* UPLOAD BUTTON */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!photo || uploading) && styles.uploadButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!photo || uploading}
          onPress={handleUpload}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },

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
    marginLeft: 10,
    fontSize: 22,
    fontFamily: Fonts.display?.bold || Fonts.bold,
    color: "#FFFFFF",
  },

  content: { paddingHorizontal: 16, paddingTop: 18 },

  /* UPLOAD CARD */
  uploadCard: {
    alignItems: "center",
    backgroundColor: "#FEF3F3",
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#F0B6BC",
    borderStyle: "dashed",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 22,
    marginBottom: 14,
  },
  uploadTitle: {
    marginTop: 8,
    fontSize: 19,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: Colors.textPrimary || "#111",
  },
  uploadText: {
    marginTop: 8,
    marginBottom: 22,
    textAlign: "center",
    fontSize: 14.5,
    lineHeight: 21,
    fontFamily: Fonts.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#555",
  },
  galleryButton: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor: Colors.primaryRedDark || Colors.primaryRed,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  galleryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: "#FFFFFF",
  },
  cameraButton: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0CDD1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  cameraButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: Colors.primaryRed,
  },

  /* INFO */
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEE",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  infoContent: { marginLeft: 12 },
  infoText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontFamily: Fonts.body?.regular || Fonts.regular,
    color: Colors.textSecondary || "#555",
  },

  /* PREVIEW */
  previewLabel: {
    fontSize: 17,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: Colors.textPrimary || "#111",
    marginBottom: 10,
  },
  previewBox: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F1F1F1",
    marginBottom: 18,
  },
  previewImage: { width: "100%", height: "100%" },
  previewClose: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* UPLOAD BUTTON */
  uploadButton: {
    height: 58,
    borderRadius: 14,
    backgroundColor: Colors.primaryRedDark || Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  uploadButtonDisabled: { opacity: 0.5 },
  uploadButtonText: {
    fontSize: 17,
    fontFamily: Fonts.body?.bold || Fonts.bold,
    color: "#FFFFFF",
  },
});
