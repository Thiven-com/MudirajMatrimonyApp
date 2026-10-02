import { useCallback, useState } from "react";

import {
  ActivityIndicator,
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

import { useFocusEffect } from "@react-navigation/native";

import Feather from "react-native-vector-icons/Feather";

import LinearGradient from "react-native-linear-gradient";

import {
  launchCamera,
  launchImageLibrary,
} from "react-native-image-picker";

import Colors from "../constants/colors";
import Fonts from "../constants/Fonts";

import {
  getToken,
  uploadGalleryImage,
} from "../utils/Functions";

/* ============================================================
   CONFIG
============================================================ */

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

/* ============================================================
   HELPERS
============================================================ */

const toPhoto = (asset) => ({
  uri: asset.uri,

  name:
    asset.fileName ||
    asset.uri?.split("/").pop() ||
    `photo-${Date.now()}.jpg`,

  type: asset.type || "image/jpeg",
});

/* ============================================================
   VALIDATE IMAGE
============================================================ */

const validateAsset = (asset) => {
  if (!asset) {
    return "Please select a photo.";
  }

  if (
    asset.type &&
    !ALLOWED_TYPES.includes(
      asset.type.toLowerCase()
    )
  ) {
    return "Only JPG and PNG photos are supported.";
  }

  if (
    asset.fileSize &&
    asset.fileSize > MAX_SIZE_BYTES
  ) {
    return "This photo is larger than 5 MB. Please choose a smaller one.";
  }

  return "";
};


export default function AddPhoto({
  navigation,
  route,
}) {
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);


  const onBackPress = useCallback(() => {
    if (uploading) {
      return true;
    }
    handleBack();
    return true;
  }, [navigation, uploading, route]);

  const handleBack = () => {

    navigation.navigate(route?.params?.page, route?.params?.prevs || {});

  }

  useFocusEffect(
    useCallback(() => {
      const subscription =
        BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );

      return () => {
        subscription.remove();
      };
    }, [onBackPress])
  );

  const handleResult = (response) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      console.log(
        "Image Picker Error:",
        response.errorCode,
        response.errorMessage
      );

      Alert.alert(
        "Unable to select photo",
        response.errorMessage ||
        "Something went wrong."
      );

      return;
    }

    if (
      !response.assets ||
      response.assets.length === 0
    ) {
      return;
    }

    const asset = response.assets[0];

    const error = validateAsset(asset);

    if (error) {
      Alert.alert(
        "Can't use this photo",
        error
      );

      return;
    }

    setPhoto(toPhoto(asset));
  };

  const chooseFromGallery = async () => {
    try {
      const response =
        await launchImageLibrary({
          mediaType: "photo",
          selectionLimit: 1,
          includeBase64: false,
        });

      handleResult(response);
    } catch (error) {
      console.log(
        "Gallery Error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to open gallery."
      );
    }
  };

  const takePhoto = async () => {
    try {
      const response =
        await launchCamera({
          mediaType: "photo",
          cameraType: "back",
          saveToPhotos: false,
          includeBase64: false,
        });

      handleResult(response);
    } catch (error) {
      console.log(
        "Camera Error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to open camera."
      );
    }
  };

  const handleUpload = async () => {
    if (!photo || uploading) {
      return;
    }

    try {
      setUploading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert(
          "Login required",
          "Please log in again."
        );

        return;
      }

      let response = await uploadGalleryImage(
        token,
        photo
      );
      if (response?.result) {
        Alert.alert(
          "Success",
          response?.message,
          [
            {
              text: "OK",
              onPress: () => {
                handleBack();
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Alert!",
          response?.message,
          [
            {
              text: "OK",
              onPress: () => {
                handleBack();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.log(
        "UPLOAD PHOTO ERROR:",
        error
      );

      Alert.alert(
        "Upload failed",
        error?.message ||
        "Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#D92332"
      />

      <LinearGradient
        colors={
          Colors.gradientLogo || [
            "#D92332",
            "#B7192B",
          ]
        }
        style={styles.header}
      >

        {/* BACK BUTTON */}

        <TouchableOpacity
          style={styles.headerBack}
          activeOpacity={0.7}
          onPress={handleBack}
          disabled={uploading}
        >
          <Feather
            name="chevron-left"
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* TITLE */}

        <Text style={styles.headerTitle}>
          Add Photo
        </Text>

        {/* RIGHT SPACE */}

        <View style={styles.headerRight} />

      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.uploadCard}>

          {/* ICON */}

          <View style={styles.uploadIconCircle}>
            <Feather
              name="upload-cloud"
              size={45}
              color="#E31E3B"
            />
          </View>

          {/* TITLE */}

          <Text style={styles.uploadTitle}>
            Upload Photo
          </Text>

          {/* DESCRIPTION */}

          <Text style={styles.uploadText}>
            Choose a photo from your gallery{"\n"}
            or take a new photo.
          </Text>

          <TouchableOpacity
            style={styles.galleryButton}
            activeOpacity={0.85}
            onPress={chooseFromGallery}
            disabled={uploading}
          >

            <Feather
              name="image"
              size={22}
              color="#FFFFFF"
            />

            <Text style={styles.galleryButtonText}>
              Choose from Gallery
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cameraButton}
            activeOpacity={0.85}
            onPress={takePhoto}
            disabled={uploading}
          >

            <Feather
              name="camera"
              size={22}
              color={
                Colors.primaryRed ||
                "#D92332"
              }
            />

            <Text style={styles.cameraButtonText}>
              Take Photo
            </Text>

          </TouchableOpacity>

        </View>

        <View style={styles.infoCard}>

          <View style={styles.infoIcon}>
            <Feather
              name="info"
              size={20}
              color="#E78A95"
            />
          </View>

          <View style={styles.infoContent}>

            <Text style={styles.infoText}>
              Supported formats: JPG, PNG
            </Text>

            <Text style={styles.infoText}>
              Maximum size: 5 MB
            </Text>

          </View>

        </View>

        {photo && (
          <View>

            <Text style={styles.previewLabel}>
              Preview
            </Text>

            <View style={styles.previewBox}>

              <Image
                source={{
                  uri: photo.uri,
                }}
                style={styles.previewImage}
                resizeMode="cover"
              />

              {/* REMOVE PHOTO */}

              <TouchableOpacity
                style={styles.previewClose}
                hitSlop={{
                  top: 8,
                  bottom: 8,
                  left: 8,
                  right: 8,
                }}
                onPress={() => setPhoto(null)}
                disabled={uploading}
              >

                <Feather
                  name="x"
                  size={20}
                  color="#111111"
                />

              </TouchableOpacity>

            </View>

          </View>
        )}

        <TouchableOpacity
          style={[
            styles.uploadButton,

            (!photo || uploading) &&
            styles.uploadButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={!photo || uploading}
          onPress={handleUpload}
        >

          {uploading ? (

            <View style={styles.uploadLoading}>

              <ActivityIndicator
                color="#FFFFFF"
                size="small"
              />

              <Text style={styles.uploadButtonText}>
                Uploading...
              </Text>

            </View>

          ) : (

            <Text style={styles.uploadButtonText}>
              Upload Photo
            </Text>

          )}

        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  headerBack: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: Fonts.size?.xl || 22,
    fontFamily: Fonts.bold || "Poppins-Bold",
    color: "#FFFFFF",
  },

  headerRight: {
    width: 42,
    height: 42,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 30,
  },

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

  uploadIconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFE5E8",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadTitle: {
    marginTop: 10,
    fontSize: Fonts.size?.lg || 19,
    fontFamily: Fonts.bold || "Poppins-Bold",
    color: Colors.textPrimary || "#111111",
  },

  uploadText: {
    marginTop: 8,
    marginBottom: 22,
    textAlign: "center",
    fontSize: Fonts.size?.md || 14,
    lineHeight: 21,
    fontFamily: Fonts.regular || "Poppins-Regular",
    color: Colors.textSecondary || "#555555",
  },

  galleryButton: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor:
      Colors.primaryRedDark ||
      Colors.primaryRed ||
      "#D92332",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  galleryButtonText: {
    marginLeft: 10,
    fontSize: Fonts.size?.base || 16,
    fontFamily: Fonts.bold || "Poppins-Bold",
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
  },

  cameraButtonText: {
    marginLeft: 10,
    fontSize: Fonts.size?.base || 16,
    fontFamily: Fonts.bold || "Poppins-Bold",
    color:
      Colors.primaryRed ||
      "#D92332",
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEE",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFE1E5",
    alignItems: "center",
    justifyContent: "center",
  },

  infoContent: {
    marginLeft: 12,
  },

  infoText: {
    fontSize: Fonts.size?.sm || 13,
    lineHeight: 20,
    fontFamily: Fonts.regular || "Poppins-Regular",
    color:
      Colors.textSecondary ||
      "#555555",
  },

  previewLabel: {
    fontSize: Fonts.size?.md || 17,
    fontFamily: Fonts.bold || "Poppins-Bold",
    color:
      Colors.textPrimary ||
      "#111111",
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

  previewImage: {
    width: "100%",
    height: "100%",
  },

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
    elevation: 3,
  },

  uploadButton: {
    height: 58,
    borderRadius: 14,
    backgroundColor:
      Colors.primaryRedDark ||
      Colors.primaryRed ||
      "#D92332",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  uploadButtonDisabled: {
    opacity: 0.5,
  },

  uploadLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadButtonText: {
    marginLeft: 8,
    fontSize: Fonts.size?.base || 17,
    fontFamily: Fonts.bold || "Poppins-Bold",
    color: "#FFFFFF",
  },

});