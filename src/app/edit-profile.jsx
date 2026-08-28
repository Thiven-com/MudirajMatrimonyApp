import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
const HEADER_HEIGHT = 140;

const INITIAL_PHOTOS = [
  { id: "1", isPrimary: true },
  { id: "2", isPrimary: false },
  { id: "3", isPrimary: false },
];

const INITIAL_BASIC_INFO = [
  {
    icon: "person-outline",
    iconBg: "#FDEAE0",
    label: "Full Name",
    value: "Priya Sharma",
  },
  {
    icon: "person-circle-outline",
    iconBg: "#EDE7F6",
    label: "Profile Created By",
    value: "Self",
  },
  {
    icon: "calendar-outline",
    iconBg: "#FDEAE0",
    label: "Date of Birth",
    value: "15 Mar 1999",
  },
  {
    icon: "time-outline",
    iconBg: "#FFF6DC",
    label: "Time of Birth",
    value: "10:30 AM",
  },
  {
    icon: "female-outline",
    iconBg: "#FCE4EC",
    label: "Gender",
    value: "Female",
  },
  {
    icon: "resize-outline",
    iconBg: "#E3F2FD",
    label: "Height",
    value: "5'4\" (162 cm)",
  },
  {
    icon: "heart-outline",
    iconBg: "#FCE4EC",
    label: "Marital Status",
    value: "Never Married",
  },
  {
    icon: "globe-outline",
    iconBg: "#E3F2FD",
    label: "Mother Tongue",
    value: "Telugu",
  },
];

const INITIAL_LOCATION_INFO = [
  {
    icon: "location-outline",
    iconBg: "#E8F5E9",
    label: "Living in",
    value: "Hyderabad, Telangana, India",
  },
  {
    icon: "people-outline",
    iconBg: "#FFF6DC",
    label: "Community",
    value: "Mudhiraj",
  },
];

const INITIAL_EDUCATION_INFO = [
  {
    icon: "school-outline",
    iconBg: "#E3F2FD",
    label: "Education",
    value: "B.E / B.Tech",
  },
  {
    icon: "briefcase-outline",
    iconBg: "#E3F2FD",
    label: "Profession",
    value: "Software Engineer",
  },
];

const INITIAL_LIFESTYLE_INFO = [
  {
    icon: "leaf-outline",
    iconBg: "#E8F5E9",
    label: "Diet",
    value: "Vegetarian",
  },
  { icon: "ban-outline", iconBg: "#FDEAE0", label: "Smoke", value: "No" },
  { icon: "ban-outline", iconBg: "#FDEAE0", label: "Drink", value: "No" },
  {
    icon: "body-outline",
    iconBg: "#E3F2FD",
    label: "Body Type",
    value: "Slim",
  },
];

const INITIAL_FAMILY_INFO = {
  father: { name: "Rajesh Sharma", note: "Business" },
  mother: { name: "Suman Sharma", note: "Homemaker" },
  siblings: { name: "1 Brother", note: "Younger" },
};

const INITIAL_ABOUT_ME =
  "I am a simple, positive and family-oriented person. I believe in our traditions and values. Looking for a life partner who understands and respects family values.";

export default function EditProfileScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);

  const [basicInfo, setBasicInfo] = useState(INITIAL_BASIC_INFO);
  const [locationInfo, setLocationInfo] = useState(INITIAL_LOCATION_INFO);
  const [educationInfo, setEducationInfo] = useState(INITIAL_EDUCATION_INFO);
  const [lifestyleInfo, setLifestyleInfo] = useState(INITIAL_LIFESTYLE_INFO);
  const [familyInfo, setFamilyInfo] = useState(INITIAL_FAMILY_INFO);
  const [aboutMe, setAboutMe] = useState(INITIAL_ABOUT_ME);

  // Which section's edit sheet is open, plus its draft (edited-but-not-saved) values
  const [editingSection, setEditingSection] = useState(null);
  const [draftFields, setDraftFields] = useState([]);
  const [draftText, setDraftText] = useState("");

  const removePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    console.log("Saving profile changes...", {
      basicInfo,
      locationInfo,
      educationInfo,
      lifestyleInfo,
      familyInfo,
      aboutMe,
    });
    // TODO: submit the updated profile to your backend, then:
    // router.back();
  };

  // ---- Opening an edit sheet for a section ----
  const openFieldEditor = (section, items) => {
    setEditingSection(section);
    setDraftFields(
      items.map((item) => ({ label: item.label, value: item.value })),
    );
  };

  const openFamilyEditor = () => {
    setEditingSection("family");
    setDraftFields([
      {
        key: "father.name",
        label: "Father - Name",
        value: familyInfo.father.name,
      },
      {
        key: "father.note",
        label: "Father - Occupation",
        value: familyInfo.father.note,
      },
      {
        key: "mother.name",
        label: "Mother - Name",
        value: familyInfo.mother.name,
      },
      {
        key: "mother.note",
        label: "Mother - Occupation",
        value: familyInfo.mother.note,
      },
      {
        key: "siblings.name",
        label: "Siblings",
        value: familyInfo.siblings.name,
      },
      {
        key: "siblings.note",
        label: "Siblings - Note",
        value: familyInfo.siblings.note,
      },
    ]);
  };

  const openAboutEditor = () => {
    setEditingSection("about");
    setDraftText(aboutMe);
  };

  const closeEditor = () => {
    setEditingSection(null);
    setDraftFields([]);
    setDraftText("");
  };

  const updateDraftField = (index, value) => {
    setDraftFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, value } : f)),
    );
  };

  const saveEditor = () => {
    switch (editingSection) {
      case "basic":
        setBasicInfo((prev) =>
          prev.map((item, i) => ({
            ...item,
            value: draftFields[i]?.value ?? item.value,
          })),
        );
        break;
      case "location":
        setLocationInfo((prev) =>
          prev.map((item, i) => ({
            ...item,
            value: draftFields[i]?.value ?? item.value,
          })),
        );
        break;
      case "education":
        setEducationInfo((prev) =>
          prev.map((item, i) => ({
            ...item,
            value: draftFields[i]?.value ?? item.value,
          })),
        );
        break;
      case "lifestyle":
        setLifestyleInfo((prev) =>
          prev.map((item, i) => ({
            ...item,
            value: draftFields[i]?.value ?? item.value,
          })),
        );
        break;
      case "family": {
        const get = (key) =>
          draftFields.find((f) => f.key === key)?.value ?? "";
        setFamilyInfo({
          father: { name: get("father.name"), note: get("father.note") },
          mother: { name: get("mother.name"), note: get("mother.note") },
          siblings: { name: get("siblings.name"), note: get("siblings.note") },
        });
        break;
      }
      case "about":
        setAboutMe(draftText);
        break;
      default:
        break;
    }
    closeEditor();
  };

  const editorTitles = {
    basic: "Edit Basic Information",
    location: "Edit Location & Community",
    education: "Edit Education & Career",
    lifestyle: "Edit Lifestyle",
    family: "Edit Family Details",
    about: "Edit About Me",
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" />

      {/* ================= HEADER — logo only ================= */}
      <View style={styles.headerWrapper}>
        <LinearGradient colors={Colors.gradientLogo} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <Image source={LOGO} style={styles.headerLogo} resizeMode="contain" />
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
          <View style={styles.titleIconWrapper}>
            <Ionicons
              name="person-outline"
              size={26}
              color={Colors.primaryRed}
            />
            <Ionicons
              name="pencil"
              size={13}
              color={Colors.primaryRed}
              style={styles.titleIconPencil}
            />
          </View>
          <View style={styles.titleTextBlock}>
            <Text style={styles.titleText}>Edit Profile</Text>
            <Text style={styles.subtitleText}>
              Update your details and tell others about yourself
            </Text>
          </View>
        </View>

        {/* ================= PROFILE PHOTOS ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Profile Photos</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Add / Remove</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.photosRow}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoTile}>
                <Image
                  source={PHOTO_PLACEHOLDER}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                {photo.isPrimary ? (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryBadgeText}>Primary</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(photo.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={13} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addPhotoTile} activeOpacity={0.7}>
              <Ionicons name="add" size={26} color={Colors.primaryRed} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipBanner}>
            <Ionicons
              name="bulb-outline"
              size={15}
              color={Colors.primaryRedDark}
            />
            <Text style={styles.tipText}>
              Add at least 4 photos for better visibility
            </Text>
          </View>
        </View>

        {/* ================= BASIC INFORMATION ================= */}
        <InfoSection
          title="Basic Information"
          onEdit={() => openFieldEditor("basic", basicInfo)}
        >
          <InfoGrid items={basicInfo} />
        </InfoSection>

        {/* ================= LOCATION & COMMUNITY ================= */}
        <InfoSection
          title="Location & Community"
          onEdit={() => openFieldEditor("location", locationInfo)}
        >
          <InfoGrid items={locationInfo} />
        </InfoSection>

        {/* ================= EDUCATION & CAREER ================= */}
        <InfoSection
          title="Education & Career"
          onEdit={() => openFieldEditor("education", educationInfo)}
        >
          <InfoGrid items={educationInfo} />
        </InfoSection>

        {/* ================= ABOUT ME ================= */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="pencil-outline"
                size={17}
                color={Colors.primaryRed}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitle}>About Me</Text>
            </View>
            <TouchableOpacity style={styles.editRow} onPress={openAboutEditor}>
              <Ionicons name="pencil" size={13} color={Colors.primaryRed} />
              <Text style={styles.sectionLink}> Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aboutMeText}>{aboutMe}</Text>
        </View>

        {/* ================= LIFESTYLE ================= */}
        <InfoSection
          title="Lifestyle"
          onEdit={() => openFieldEditor("lifestyle", lifestyleInfo)}
        >
          <View style={styles.lifestyleRow}>
            {lifestyleInfo.map((item) => (
              <View key={item.label} style={styles.lifestyleItem}>
                <View
                  style={[
                    styles.infoIconCircle,
                    { backgroundColor: item.iconBg },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={15}
                    color={Colors.textSecondary}
                  />
                </View>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </InfoSection>

        {/* ================= FAMILY DETAILS ================= */}
        <InfoSection title="Family Details" onEdit={openFamilyEditor}>
          <View style={styles.familyRow}>
            <FamilyColumn
              label="Father"
              name={familyInfo.father.name}
              note={familyInfo.father.note}
            />
            <FamilyColumn
              label="Mother"
              name={familyInfo.mother.name}
              note={familyInfo.mother.note}
            />
            <FamilyColumn
              label="Siblings"
              name={familyInfo.siblings.name}
              note={familyInfo.siblings.note}
            />
          </View>
        </InfoSection>

        {/* ================= SAVE BUTTON ================= */}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSave}
        >
          <Ionicons
            name="save-outline"
            size={19}
            color={Colors.white}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ================= EDIT SHEET ================= */}
      <Modal
        visible={editingSection !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEditor}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeEditor}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                {editorTitles[editingSection]}
              </Text>
              <TouchableOpacity
                onPress={closeEditor}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 420 }}
            >
              {editingSection === "about" ? (
                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>About Me</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputMultiline]}
                    value={draftText}
                    onChangeText={setDraftText}
                    multiline
                    placeholder="Tell others about yourself"
                    placeholderTextColor={Colors.placeholder}
                  />
                </View>
              ) : (
                draftFields.map((field, index) => (
                  <View
                    key={field.key ?? field.label}
                    style={styles.fieldBlock}
                  >
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={field.value}
                      onChangeText={(text) => updateDraftField(index, text)}
                      placeholderTextColor={Colors.placeholder}
                    />
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={closeEditor}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={saveEditor}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function InfoSection({ title, onEdit, children }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.editRow}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={13} color={Colors.primaryRed} />
          <Text style={styles.sectionLink}> Edit</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function InfoGrid({ items }) {
  return (
    <View style={styles.infoGrid}>
      {items.map((item) => (
        <View key={item.label} style={styles.infoGridItem}>
          <View
            style={[styles.infoIconCircle, { backgroundColor: item.iconBg }]}
          >
            <Ionicons name={item.icon} size={16} color={Colors.textSecondary} />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function FamilyColumn({ label, name, note }) {
  return (
    <View style={styles.familyColumn}>
      <Text style={styles.familyLabel}>{label}</Text>
      <Text style={styles.familyName}>{name}</Text>
      <Text style={styles.familyNote}>({note})</Text>
    </View>
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

  /* ===== HEADER — logo only ===== */
  headerWrapper: {
    width: "100%",
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: "50%",
    marginTop: -12,
    zIndex: 2,
  },
  headerLogo: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },
  headerWave: {
    marginTop: -6,
  },

  /* ===== PAGE TITLE ===== */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  titleIconWrapper: {
    marginRight: 14,
  },
  titleIconPencil: {
    position: "absolute",
    bottom: -3,
    right: -6,
  },
  titleTextBlock: {
    flex: 1,
  },
  titleText: {
    fontSize: FontSizes.welcome + 2,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  subtitleText: {
    fontSize: FontSizes.subtitle,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 3,
  },

  /* ===== SECTION CARD (shared) ===== */
  sectionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: FontSizes.welcome - 4,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionLink: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },

  /* ===== PROFILE PHOTOS ===== */
  photosRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoTile: {
    flex: 1,
    aspectRatio: 0.82,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.border,
    position: "relative",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  primaryBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primaryRed,
    paddingVertical: 4,
    alignItems: "center",
  },
  primaryBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
  removePhotoButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryRed,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoTile: {
    flex: 1,
    aspectRatio: 0.82,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    fontSize: 10,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
    marginTop: 4,
    textAlign: "center",
  },
  tipBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF3D8",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 8,
  },
  tipText: {
    fontSize: 11.5,
    fontFamily: Fonts.body.medium,
    color: Colors.primaryRedDark,
    flexShrink: 1,
  },

  /* ===== INFO GRID ===== */
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoGridItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 8,
    marginBottom: 16,
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoTextBlock: {
    flexShrink: 1,
  },
  infoLabel: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },

  /* ===== ABOUT ME ===== */
  aboutMeText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textSecondary,
    lineHeight: 21,
  },

  /* ===== LIFESTYLE ===== */
  lifestyleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  lifestyleItem: {
    width: "22%",
    alignItems: "center",
  },

  /* ===== FAMILY ===== */
  familyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  familyColumn: {
    flex: 1,
  },
  familyLabel: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  familyName: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  familyNote: {
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 1,
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

  /* ===== EDIT MODAL ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: FontSizes.welcome - 2,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontFamily: Fonts.body.semiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  fieldInputMultiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  modalActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  modalCancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.primaryRed,
    borderRadius: 12,
    paddingVertical: 14,
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  modalSaveButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRed,
    borderRadius: 12,
    paddingVertical: 14,
  },
  modalSaveText: {
    fontSize: 14,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
