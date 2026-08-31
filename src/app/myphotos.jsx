import { Ionicons } from "@expo/vector-icons";
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

const LOGO = require("../../assets/images/logo.png");
// Swap each of these for the user's actual uploaded photos, e.g. { uri: photo.url }
const PHOTO_PLACEHOLDER = require("../../assets/images/Match7.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_PHOTOS = 12;

const INITIAL_PHOTOS = [
  { id: "1", isPrimary: true },
  { id: "2", isPrimary: false },
  { id: "3", isPrimary: false },
  { id: "4", isPrimary: false },
  { id: "5", isPrimary: false },
  { id: "6", isPrimary: false },
];

const GUIDELINES = [
  {
    icon: "person-outline",
    iconBg: "#FDE3E3",
    label: "Use clear and\nrecent photos",
  },
  {
    icon: "sunny-outline",
    iconBg: "#FDF0D0",
    label: "Good lighting\nworks best",
  },
  {
    icon: "person-outline",
    iconBg: "#DCF3E3",
    label: "Show your\nface clearly",
  },
  { icon: "people-outline", iconBg: "#DCEAFB", label: "No group\nphotos" },
];

export default function MyPhotosScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);

  const emptySlots = Math.max(0, MAX_PHOTOS - photos.length);

  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const makePrimary = (id) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === id })));
  };

  const addPhoto = () => {
    // TODO: hook up image picker
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
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={Colors.primaryRed}
              />
            </View>
          </TouchableOpacity>

          <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />

          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>MUDHIRAJ WORLD</Text>
            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>M A T R I M O N Y</Text>
            </View>
            <Text style={styles.headerTagline}>Our Community, Our Pride</Text>
          </View>

          <TouchableOpacity
            style={styles.helpButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.75}
          >
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={Colors.white}
            />
          </TouchableOpacity>
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
      >
        {/* ================= PAGE TITLE ================= */}
        <View style={styles.titleRow}>
          <View style={styles.titleTextBlock}>
            <Text style={styles.titleText}>My Photos</Text>
            <Text style={styles.subtitleText}>
              Add clear and recent photos to get better{"\n"}responses and more
              matches.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addPhotosButton}
            activeOpacity={0.85}
            onPress={addPhoto}
          >
            <Ionicons
              name="camera"
              size={16}
              color={Colors.white}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.addPhotosButtonText}>Add Photos</Text>
          </TouchableOpacity>
        </View>

        {/* ================= TIP BANNER ================= */}
        <View style={styles.tipBanner}>
          <Ionicons name="bulb-outline" size={18} color="#E08A1E" />
          <Text style={styles.tipText}>
            Add at least <Text style={styles.tipTextHighlight}>4</Text> photos.
            Profiles with more photos get{" "}
            <Text style={styles.tipTextBold}>5x more responses.</Text>
          </Text>
        </View>

        {/* ================= PROFILE PHOTOS ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Profile Photos ({photos.length}/{MAX_PHOTOS})
          </Text>
          <View style={styles.reorderRow}>
            <Text style={styles.reorderText}>Drag to reorder</Text>
            <Ionicons
              name="reorder-three-outline"
              size={18}
              color={Colors.textMuted}
              style={{ marginLeft: 6 }}
            />
          </View>
        </View>

        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={photo.id} style={styles.photoTile}>
              <Image
                source={PHOTO_PLACEHOLDER}
                style={styles.photoImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.35)"]}
                style={styles.photoShade}
                pointerEvents="none"
              />

              <View style={styles.photoNumberBadge}>
                <Text style={styles.photoNumberText}>{index + 1}</Text>
              </View>

              {photo.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>Primary</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.editPhotoButton}
                onPress={() => makePrimary(photo.id)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="pencil" size={13} color={Colors.primaryRed} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ================= ADD MORE PHOTOS ================= */}
        {emptySlots > 0 && (
          <>
            <Text style={styles.addMoreTitle}>Add More Photos</Text>
            <View style={styles.addMoreGrid}>
              {Array.from({ length: emptySlots }).map((_, i) => (
                <TouchableOpacity
                  key={`empty-${i}`}
                  style={styles.addMoreTile}
                  activeOpacity={0.7}
                  onPress={addPhoto}
                >
                  <Ionicons name="add" size={24} color={Colors.primaryRed} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* ================= PHOTO GUIDELINES ================= */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeaderRow}>
            <View style={styles.guidelinesIconCircle}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#E08A1E"
              />
            </View>
            <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>
          </View>

          <View style={styles.guidelinesRow}>
            {GUIDELINES.map((g) => (
              <View key={g.label} style={styles.guidelineItem}>
                <View
                  style={[
                    styles.guidelineIconCircle,
                    { backgroundColor: g.iconBg },
                  ]}
                >
                  <Ionicons
                    name={g.icon}
                    size={16}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text style={styles.guidelineText}>{g.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ================= PREMIUM BANNER ================= */}
        <View style={styles.premiumBanner}>
          <View style={styles.premiumIconCircle}>
            <Ionicons name="ribbon" size={20} color={Colors.white} />
          </View>
          <View style={styles.premiumTextBlock}>
            <Text style={styles.premiumTitle}>
              Go Premium for Better Matches!
            </Text>
            <Text style={styles.premiumSubtitle}>
              Premium members get 5x more profile views.
            </Text>
          </View>
          <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.85}>
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={Colors.white}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 30,
  },

  /* ===== HEADER ===== */
  headerWrapper: {
    width: "100%",
  },
  header: {
    minHeight: 130,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginRight: 12,
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: Fonts.display.bold,
    color: Colors.goldLight,
  },
  headerSubtitleRow: {
    marginTop: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.body.medium,
    color: Colors.white,
    letterSpacing: 1,
  },
  headerTagline: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  helpButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  headerWave: {
    marginTop: -6,
  },

  /* ===== PAGE TITLE ===== */
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  titleTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  titleText: {
    fontSize: FontSizes.welcome + 4,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  subtitleText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  addPhotosButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addPhotosButtonText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },

  /* ===== TIP BANNER ===== */
  tipBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FDF3D8",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 22,
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.body.regular,
    color: "#5A3E12",
    lineHeight: 19,
  },
  tipTextHighlight: {
    fontFamily: Fonts.body.bold,
    backgroundColor: "#F5D879",
  },
  tipTextBold: {
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== SECTION HEADER ===== */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: FontSizes.welcome - 4,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  reorderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reorderText: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  /* ===== PHOTO GRID ===== */
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  photoTile: {
    width: "31.5%",
    aspectRatio: 0.82,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.border,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoShade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
  },
  photoNumberBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F5C94D",
    alignItems: "center",
    justifyContent: "center",
  },
  photoNumberText: {
    fontSize: 11,
    fontFamily: Fonts.body.bold,
    color: "#5A3E12",
  },
  primaryBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: Colors.primaryRed,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 9.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  /* ===== ADD MORE PHOTOS ===== */
  addMoreTitle: {
    fontSize: FontSizes.welcome - 4,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginBottom: 14,
  },
  addMoreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  addMoreTile: {
    width: "15%",
    aspectRatio: 0.82,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF1EF",
    marginBottom: 10,
  },

  /* ===== GUIDELINES ===== */
  guidelinesCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 18,
  },
  guidelinesHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  guidelinesIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FDF0D0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  guidelinesTitle: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  guidelinesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  guidelineItem: {
    flex: 1,
    alignItems: "center",
  },
  guidelineIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  guidelineText: {
    fontSize: 10.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },

  /* ===== PREMIUM BANNER ===== */
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3D8",
    borderRadius: 16,
    padding: 14,
  },
  premiumIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  premiumTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  premiumTitle: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  premiumSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
