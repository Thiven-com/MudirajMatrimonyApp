import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Modal,
    Platform,
    Pressable,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ABOUT_LIFESTYLE_MAX_LENGTH = 300;

// ================= OPTION LISTS =================
const DIET_OPTIONS = [
  "Vegetarian",
  "Non-Vegetarian",
  "Eggetarian",
  "Vegan",
  "Jain",
  "Occasionally Non-Veg",
];

const DRINK_OPTIONS = ["No", "Occasionally", "Yes", "Never"];

const SMOKE_OPTIONS = ["No", "Occasionally", "Yes", "Never"];

const EXERCISE_OPTIONS = ["Never", "Occasionally", "Regularly", "Daily"];

const SLEEP_TIME_OPTIONS = [
  "Before 9 PM",
  "9 PM - 10 PM",
  "10 PM - 11 PM",
  "11 PM - 12 AM",
  "After 12 AM",
];

const WAKE_UP_TIME_OPTIONS = [
  "Before 5 AM",
  "5 AM - 6 AM",
  "6 AM - 7 AM",
  "7 AM - 8 AM",
  "After 8 AM",
];

const BODY_TYPE_OPTIONS = ["Slim", "Athletic", "Average", "Heavy"];

const RELIGION_OPTIONS = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Parsi",
  "Jewish",
  "Other",
];

const CASTE_COMMUNITY_OPTIONS = [
  "Kamma",
  "Kapu",
  "Reddy",
  "Mudhiraj",
  "Yadav",
  "Brahmin",
  "Vysya",
  "Velama",
  "Munnuru Kapu",
  "Raju",
  "Naidu",
  "Other",
];

const GOTHRAM_OPTIONS = [
  "Kashyapa",
  "Bharadwaja",
  "Vishwamitra",
  "Vasishta",
  "Atri",
  "Gautama",
  "Kaundinya",
  "Shandilya",
  "Agastya",
  "Other",
];

const SUB_CASTE_OPTIONS = [
  "Munnuru Kapu",
  "Turpu Kapu",
  "Telaga",
  "Ontari",
  "Other",
];

// Reused for both Native Place and Residing In.
const PLACE_OPTIONS = [
  "Hyderabad, Telangana",
  "Vijayawada, Andhra Pradesh",
  "Visakhapatnam, Andhra Pradesh",
  "Guntur, Andhra Pradesh",
  "Warangal, Telangana",
  "Nellore, Andhra Pradesh",
  "Kurnool, Andhra Pradesh",
  "Tirupati, Andhra Pradesh",
  "Rajahmundry, Andhra Pradesh",
  "Karimnagar, Telangana",
  "Bengaluru, Karnataka",
  "Chennai, Tamil Nadu",
  "Mumbai, Maharashtra",
  "Delhi NCR",
  "Other",
];

const HOBBIES_OPTIONS = [
  "Reading",
  "Traveling",
  "Music",
  "Cooking",
  "Dancing",
  "Sports",
  "Gardening",
  "Painting",
  "Photography",
  "Movies",
  "Gaming",
  "Fitness",
  "Yoga",
  "Writing",
  "Other",
];

const INTERESTS_OPTIONS = [
  "Culture",
  "Cooking",
  "Sports",
  "Technology",
  "Movies",
  "Music",
  "Fashion",
  "Politics",
  "Spirituality",
  "Fitness",
  "Travel",
  "Art",
  "Literature",
  "Other",
];

export default function LifestyleScreen() {
  const router = useRouter();

  // Personal Lifestyle
  const [diet, setDiet] = useState("Vegetarian");
  const [drink, setDrink] = useState("No");
  const [smoke, setSmoke] = useState("No");
  const [exercise, setExercise] = useState("Regularly");
  const [sleepTime, setSleepTime] = useState("10 PM - 11 PM");
  const [wakeUpTime, setWakeUpTime] = useState("5 AM - 6 AM");
  const [bodyType, setBodyType] = useState("Average");

  // Religious & Cultural
  const [religion, setReligion] = useState("Hindu");
  const [casteCommunity, setCasteCommunity] = useState("Mudhiraj");
  const [gothram, setGothram] = useState("Kashyapa");
  const [subCaste, setSubCaste] = useState("Munnuru Kapu");
  const [nativePlace, setNativePlace] = useState("Vijayawada, Andhra Pradesh");
  const [residingIn, setResidingIn] = useState("Hyderabad, Telangana, India");

  // Other Details
  const [hobbies, setHobbies] = useState(["Reading", "Traveling", "Music"]);
  const [interests, setInterests] = useState(["Culture", "Cooking", "Sports"]);
  const [aboutLifestyle, setAboutLifestyle] = useState(
    "I believe in a balanced lifestyle with family values and positive thinking.",
  );

  // ===== Picker modal state =====
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerConfig, setPickerConfig] = useState(null);
  // pickerConfig: { title, options, value, onSelect, multiSelect }

  const openPicker = (config) => {
    setPickerConfig(config);
    setPickerVisible(true);
  };

  const closePicker = () => {
    setPickerVisible(false);
    setPickerConfig(null);
  };

  const handleSaveAndContinue = () => {
    console.log("Saving lifestyle details...", {
      diet,
      drink,
      smoke,
      exercise,
      sleepTime,
      wakeUpTime,
      bodyType,
      religion,
      casteCommunity,
      gothram,
      subCaste,
      nativePlace,
      residingIn,
      hobbies,
      interests,
      aboutLifestyle,
    });
    // TODO: submit to backend, then navigate to next onboarding step
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

          <Text style={styles.headerTitle}>Lifestyle</Text>

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
            <Ionicons name="body-outline" size={20} color={Colors.primaryRed} />
          </View>
          <View style={styles.introTextBlock}>
            <Text style={styles.introTitle}>
              Your lifestyle helps others know you better.
            </Text>
            <Text style={styles.introSubtitle}>
              Please provide accurate information.
            </Text>
          </View>
        </View>

        {/* ================= PERSONAL LIFESTYLE ================= */}
        <SectionHeading text="Personal Lifestyle" />

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Diet" required />
            <SelectField
              icon="restaurant-outline"
              placeholder="Select diet"
              value={diet}
              compact
              onPress={() =>
                openPicker({
                  title: "Diet",
                  options: DIET_OPTIONS,
                  value: diet,
                  onSelect: setDiet,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Drink" required />
            <SelectField
              icon="wine-outline"
              placeholder="Select drinking habit"
              value={drink}
              compact
              onPress={() =>
                openPicker({
                  title: "Drink",
                  options: DRINK_OPTIONS,
                  value: drink,
                  onSelect: setDrink,
                })
              }
            />
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Smoke" required />
            <SelectField
              icon="ban-outline"
              placeholder="Select smoking habit"
              value={smoke}
              compact
              onPress={() =>
                openPicker({
                  title: "Smoke",
                  options: SMOKE_OPTIONS,
                  value: smoke,
                  onSelect: setSmoke,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Exercise" required />
            <SelectField
              icon="barbell-outline"
              placeholder="Select exercise habit"
              value={exercise}
              compact
              onPress={() =>
                openPicker({
                  title: "Exercise",
                  options: EXERCISE_OPTIONS,
                  value: exercise,
                  onSelect: setExercise,
                })
              }
            />
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Sleep Time" required />
            <SelectField
              icon="moon-outline"
              placeholder="Select sleep time"
              value={sleepTime}
              compact
              onPress={() =>
                openPicker({
                  title: "Sleep Time",
                  options: SLEEP_TIME_OPTIONS,
                  value: sleepTime,
                  onSelect: setSleepTime,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Wake Up Time" required />
            <SelectField
              icon="sunny-outline"
              placeholder="Select wake up time"
              value={wakeUpTime}
              compact
              onPress={() =>
                openPicker({
                  title: "Wake Up Time",
                  options: WAKE_UP_TIME_OPTIONS,
                  value: wakeUpTime,
                  onSelect: setWakeUpTime,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Body Type" required />
        <SelectField
          icon="body-outline"
          placeholder="Select body type"
          value={bodyType}
          onPress={() =>
            openPicker({
              title: "Body Type",
              options: BODY_TYPE_OPTIONS,
              value: bodyType,
              onSelect: setBodyType,
            })
          }
        />

        {/* ================= RELIGIOUS & CULTURAL ================= */}
        <SectionHeading text="Religious & Cultural" />

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Religion" required />
            <SelectField
              icon="sparkles-outline"
              placeholder="Select religion"
              value={religion}
              compact
              onPress={() =>
                openPicker({
                  title: "Religion",
                  options: RELIGION_OPTIONS,
                  value: religion,
                  onSelect: setReligion,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Caste / Community" required />
            <SelectField
              icon="people-outline"
              placeholder="Select caste / community"
              value={casteCommunity}
              compact
              onPress={() =>
                openPicker({
                  title: "Caste / Community",
                  options: CASTE_COMMUNITY_OPTIONS,
                  value: casteCommunity,
                  onSelect: setCasteCommunity,
                })
              }
            />
          </View>
        </View>

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Gothram" />
            <SelectField
              icon="flower-outline"
              placeholder="Select gothram"
              value={gothram}
              compact
              onPress={() =>
                openPicker({
                  title: "Gothram",
                  options: GOTHRAM_OPTIONS,
                  value: gothram,
                  onSelect: setGothram,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Sub Caste" />
            <SelectField
              icon="shield-outline"
              placeholder="Select sub caste"
              value={subCaste}
              compact
              onPress={() =>
                openPicker({
                  title: "Sub Caste",
                  options: SUB_CASTE_OPTIONS,
                  value: subCaste,
                  onSelect: setSubCaste,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="Native Place" required />
        <SelectField
          icon="location-outline"
          placeholder="Select native place"
          value={nativePlace}
          onPress={() =>
            openPicker({
              title: "Native Place",
              options: PLACE_OPTIONS,
              value: nativePlace,
              onSelect: setNativePlace,
            })
          }
        />

        <FieldLabel text="Residing In" required />
        <SelectField
          icon="home-outline"
          placeholder="Select current residence"
          value={residingIn}
          onPress={() =>
            openPicker({
              title: "Residing In",
              options: PLACE_OPTIONS,
              value: residingIn,
              onSelect: setResidingIn,
            })
          }
        />

        {/* ================= OTHER DETAILS ================= */}
        <SectionHeading text="Other Details" />

        <View style={styles.rowTwoCol}>
          <View style={styles.colHalf}>
            <FieldLabel text="Hobbies" optional />
            <SelectField
              icon="star-outline"
              placeholder="Select hobbies"
              value={hobbies.join(", ")}
              compact
              onPress={() =>
                openPicker({
                  title: "Hobbies",
                  options: HOBBIES_OPTIONS,
                  value: hobbies,
                  onSelect: setHobbies,
                  multiSelect: true,
                })
              }
            />
          </View>
          <View style={styles.colHalf}>
            <FieldLabel text="Interests" optional />
            <SelectField
              icon="heart-outline"
              placeholder="Select interests"
              value={interests.join(", ")}
              compact
              onPress={() =>
                openPicker({
                  title: "Interests",
                  options: INTERESTS_OPTIONS,
                  value: interests,
                  onSelect: setInterests,
                  multiSelect: true,
                })
              }
            />
          </View>
        </View>

        <FieldLabel text="About My Lifestyle" optional />
        <View style={styles.textAreaRow}>
          <Ionicons
            name="pencil-outline"
            size={17}
            color={Colors.primaryRed}
            style={styles.textAreaIcon}
          />
          <TextInput
            style={styles.textArea}
            value={aboutLifestyle}
            onChangeText={(text) => {
              if (text.length <= ABOUT_LIFESTYLE_MAX_LENGTH) {
                setAboutLifestyle(text);
              }
            }}
            placeholder="Tell others about your lifestyle"
            placeholderTextColor={Colors.placeholder}
            multiline
            textAlignVertical="top"
            maxLength={ABOUT_LIFESTYLE_MAX_LENGTH}
          />
        </View>
        <Text style={styles.charCount}>
          {aboutLifestyle.length}/{ABOUT_LIFESTYLE_MAX_LENGTH}
        </Text>

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

      <PickerModal
        visible={pickerVisible}
        config={pickerConfig}
        onClose={closePicker}
      />
    </SafeAreaView>
  );
}

// ================= SUBCOMPONENTS =================
function SectionHeading({ text }) {
  return (
    <View style={styles.sectionHeadingBlock}>
      <Text style={styles.sectionHeading}>{text}</Text>
      <View style={styles.sectionHeadingUnderlineRow}>
        <View style={styles.sectionHeadingUnderline} />
        <View style={styles.sectionHeadingUnderlineDot} />
      </View>
    </View>
  );
}

function FieldLabel({ text, required, optional, infoIcon }) {
  return (
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabelText}>{text}</Text>
      {required && <Text style={styles.requiredAsterisk}> *</Text>}
      {optional && <Text style={styles.optionalText}> (Optional)</Text>}
      {infoIcon && (
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={Colors.textMuted}
          style={{ marginLeft: 5 }}
        />
      )}
    </View>
  );
}

function SelectField({ icon, placeholder, value, compact, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.selectRow, compact && styles.selectRowCompact]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={17}
        color={Colors.primaryRed}
        style={styles.inputIcon}
      />
      <Text
        style={[styles.selectText, value ? styles.selectTextFilled : null]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-down" size={15} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// Bottom-sheet style picker modal. Supports single-select (tap an option,
// modal closes immediately) and multi-select (tap toggles a checkbox,
// user taps "Done" to confirm) — used here for Hobbies and Interests.
function PickerModal({ visible, config, onClose }) {
  const { title, options, value, onSelect, multiSelect } = config || {};

  const [draftSelection, setDraftSelection] = useState([]);

  useMemo(() => {
    if (multiSelect) {
      setDraftSelection(Array.isArray(value) ? value : []);
    }
  }, [visible, multiSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!config) return null;

  const isOptionSelected = (option) =>
    multiSelect ? draftSelection.includes(option) : option === value;

  const handleOptionPress = (option) => {
    if (multiSelect) {
      setDraftSelection((prev) =>
        prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option],
      );
    } else {
      onSelect(option);
      onClose();
    }
  };

  const handleDone = () => {
    onSelect(draftSelection);
    onClose();
  };

  const handleClear = () => {
    if (multiSelect) {
      setDraftSelection([]);
    } else {
      onSelect("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose} />

      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />

        <View style={styles.modalHeaderRow}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={options}
          keyExtractor={(item) => item}
          style={styles.modalList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const selected = isOptionSelected(item);
            return (
              <TouchableOpacity
                style={styles.modalOptionRow}
                activeOpacity={0.7}
                onPress={() => handleOptionPress(item)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selected && styles.modalOptionTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {multiSelect ? (
                  <View
                    style={[
                      styles.modalCheckbox,
                      selected && styles.modalCheckboxSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={Colors.white}
                      />
                    )}
                  </View>
                ) : (
                  selected && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={Colors.primaryRed}
                    />
                  )
                )}
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.modalFooterRow}>
          <TouchableOpacity
            style={styles.modalClearButton}
            activeOpacity={0.7}
            onPress={handleClear}
          >
            <Text style={styles.modalClearButtonText}>Clear</Text>
          </TouchableOpacity>

          {multiSelect && (
            <TouchableOpacity
              style={styles.modalDoneButton}
              activeOpacity={0.85}
              onPress={handleDone}
            >
              <Text style={styles.modalDoneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
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
  sectionHeadingBlock: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
  },
  sectionHeadingUnderlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sectionHeadingUnderline: {
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.goldLight,
  },
  sectionHeadingUnderlineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.goldLight,
    marginLeft: 3,
  },
  sectionHeadingOptional: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  /* ===== FIELD LABEL ===== */
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabelText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
  },
  requiredAsterisk: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  optionalText: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },

  /* ===== TEXT INPUT ===== */
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },

  /* ===== SELECT FIELD ===== */
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 20,
    backgroundColor: Colors.cardBackground,
  },
  selectRowCompact: {
    height: 50,
    marginBottom: 16,
  },
  selectText: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.placeholder,
  },
  selectTextFilled: {
    color: Colors.textPrimary,
    fontFamily: Fonts.body.medium,
  },

  /* ===== TWO-COLUMN ROWS ===== */
  rowTwoCol: {
    flexDirection: "row",
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },

  /* ===== TEXT AREA (About My Lifestyle) ===== */
  textAreaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 110,
    backgroundColor: Colors.cardBackground,
  },
  textAreaIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
    minHeight: 86,
    ...Platform.select({ web: { outlineStyle: "none" } }),
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 11.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    marginTop: 6,
    marginBottom: 20,
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

  /* ===== PICKER MODAL ===== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: Fonts.display.bold,
    color: Colors.textPrimary,
  },
  modalList: {
    marginTop: 6,
  },
  modalOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: Fonts.body.regular,
    color: Colors.textPrimary,
  },
  modalOptionTextSelected: {
    fontFamily: Fonts.body.bold,
    color: Colors.primaryRed,
  },
  modalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCheckboxSelected: {
    backgroundColor: Colors.primaryRed,
    borderColor: Colors.primaryRed,
  },
  modalFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 12,
  },
  modalClearButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  modalClearButtonText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textMuted,
  },
  modalDoneButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primaryRedDark,
  },
  modalDoneButtonText: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
