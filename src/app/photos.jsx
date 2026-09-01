import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  const pickImage = async (onPicked) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
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

  const handleRemoveProfilePhoto = () => setProfilePhoto(null);

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

  const handleSaveAndContinue = () => {
    console.log("Saving photos...", { profilePhoto, additionalPhotos });
    // TODO: upload photos to backend, then navigate to next onboarding step
    // router.push("/onboarding/next-step");
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.headerWrapper}>
        <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Photos</Text>

          <View style={styles.headerSpacer} />
        </LinearGradient>

        <Svg
          width={SCREEN_WIDTH}
          height={24}
          viewBox={`0 0 ${SCREEN_WIDTH} 24`}
          style={styles.headerWave}
        >
          <Path
            d={`M0,4 Q${SCREEN_WIDTH * 0.25},22 ${SCREEN_WIDTH * 0.5},10 Q${SCREEN_WIDTH * 0.75},-2 ${SCREEN_WIDTH},14`}
            stroke={Colors.goldLight}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================= INTRO BANNER ================= */}
        <View style={styles.introBanner}>
          <View style={styles.introIconCircle}>
            <Ionicons
              name="image-outline"
              size={20}
              color={Colors.primaryRed}
            />
          </View>
          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>Add your photos</Text>
            <Text style={styles.introSubtitle}>
              A clear photo helps others know you better.
            </Text>
          </View>
        </View>

        {/* ================= PROFILE PHOTO ================= */}
        <Text style={styles.sectionHeading}>Profile Photo</Text>
        <Text style={styles.sectionSubtext}>
          This will be your primary photo and will appear on your profile.
        </Text>

        <View style={styles.profileRow}>
          <PhotoUploadBox
            uri={profilePhoto}
            size="large"
            label="Add Photo"
            helperText={"JPG, JPEG or PNG\nMax size 5MB"}
            onPress={handlePickProfilePhoto}
            onRemove={handleRemoveProfilePhoto}
          />

          <View style={styles.guidelinesBlock}>
            <Text style={styles.guidelinesTitle}>Photo guidelines</Text>
            {PHOTO_GUIDELINES.map((item) => (
              <View key={item} style={styles.guidelineRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.success ?? "#22C55E"}
                  style={styles.guidelineIcon}
                />
                <Text style={styles.guidelineText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* ================= ADDITIONAL PHOTOS ================= */}
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionHeading}>Additional Photos</Text>
          <Text style={styles.sectionHeadingOptional}> (Optional)</Text>
        </View>
        <Text style={styles.sectionSubtext}>
          Add more photos to help others know you better.
        </Text>

        <View style={styles.additionalGrid}>
          {additionalPhotos.map((uri, index) => (
            <PhotoUploadBox
              key={index}
              uri={uri}
              size="small"
              label="Add Photo"
              helperText="Max size 5MB"
              onPress={() => handlePickAdditionalPhoto(index)}
              onRemove={() => handleRemoveAdditionalPhoto(index)}
            />
          ))}
        </View>

        {/* ================= SAFETY NOTE ================= */}
        <View style={styles.safetyNote}>
          <View style={styles.safetyIconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={Colors.infoBlue ?? "#4F46E5"}
            />
          </View>
          <Text style={styles.safetyText}>
            Your photos are safe with us and will not be shared outside.
          </Text>
        </View>

        {/* ================= SAVE BUTTON ================= */}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSaveAndContinue}
        >
          <Text style={styles.saveButtonText}>Save & Continue</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.white}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
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
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onRemove}
          >
            <Ionicons name="close" size={14} color={Colors.white} />
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
              name="camera"
              size={isLarge ? 30 : 22}
              color={Colors.primaryRed}
            />
            <View style={styles.photoIconPlusBadge}>
              <Ionicons
                name="add"
                size={isLarge ? 14 : 11}
                color={Colors.white}
              />
            </View>
          </View>
          <Text
            style={isLarge ? styles.photoLabelLarge : styles.photoLabelSmall}
          >
            {label}
          </Text>
          {!!helperText && (
            <Text
              style={
                isLarge ? styles.photoHelperLarge : styles.photoHelperSmall
              }
            >
              {helperText}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* ===== HEADER ===== */
  headerWrapper: {
    width: "100%",
  },
  header: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 34,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSizes.welcome + 2,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
  },
  headerSpacer: {
    width: 34,
  },
  headerWave: {
    marginTop: -6,
  },

  /* ===== INTRO BANNER ===== */
  introBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FDF3D8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 22,
  },
  introIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FCE4D6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  introTextBlock: {
    flex: 1,
  },
  introTitle: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  introSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },

  /* ===== SECTION HEADING ===== */
  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 17,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionHeadingOptional: {
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 16,
  },

  /* ===== PROFILE PHOTO ROW ===== */
  profileRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  guidelinesBlock: {
    flex: 1,
    paddingTop: 2,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  guidelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 9,
  },
  guidelineIcon: {
    marginRight: 7,
    marginTop: 1,
  },
  guidelineText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 16,
  },

  /* ===== DIVIDER ===== */
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },

  /* ===== ADDITIONAL PHOTOS GRID ===== */
  additionalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },

  /* ===== PHOTO UPLOAD BOX ===== */
  photoBox: {
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderStyle: "dashed",
    borderRadius: 14,
    backgroundColor: "#FDF1F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoBoxLarge: {
    width: "44%",
    aspectRatio: 1,
    minWidth: 150,
  },
  photoBoxSmall: {
    width: "22.5%",
    aspectRatio: 0.82,
    minWidth: 74,
    paddingHorizontal: 4,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoIconCircle: {
    borderRadius: 999,
    backgroundColor: "#FCE0DE",
    alignItems: "center",
    justifyContent: "center",
  },
  photoIconCircleLarge: {
    width: 72,
    height: 72,
    marginBottom: 14,
  },
  photoIconCircleSmall: {
    width: 46,
    height: 46,
    marginBottom: 8,
  },
  photoIconPlusBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FDF1F0",
  },
  photoLabelLarge: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  photoLabelSmall: {
    fontSize: 11.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  photoHelperLarge: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 15,
  },
  photoHelperSmall: {
    fontSize: 10,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 2,
  },

  /* ===== SAFETY NOTE ===== */
  safetyNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF0FC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  safetyIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E4FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  safetyText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
  },

  /* ===== SAVE BUTTON ===== */
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRedDark,
    borderRadius: 16,
    paddingVertical: 17,
    marginTop: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
