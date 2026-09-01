import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { Colors } from "../constants/colors";
import { Fonts, FontSizes } from "../constants/Fonts";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PROFILE_COMPLETION_PERCENT = 78;

const COMPLETED_SECTIONS = [
  {
    key: "basic-details",
    icon: "person-outline",
    title: "Basic Details",
    subtitle: "All set!",
  },
  {
    key: "family-details",
    icon: "people-outline",
    title: "Family Details",
    subtitle: "All set!",
  },
  {
    key: "education",
    icon: "school-outline",
    title: "Education",
    subtitle: "All set!",
  },
];

const PENDING_SECTIONS = [
  {
    key: "career",
    icon: "briefcase-outline",
    title: "Career",
    subtitle: "Tell us about your professional life",
    route: "/onboarding/career",
  },
  {
    key: "lifestyle",
    icon: "heart-outline",
    title: "Lifestyle",
    subtitle: "Help others know you better",
    route: "/onboarding/lifestyle",
  },
  {
    key: "partner-preference",
    icon: "people-circle-outline",
    title: "Partner Preference",
    subtitle: "Share your partner preferences",
    route: "/onboarding/partner-preference",
  },
  {
    key: "photos",
    icon: "image-outline",
    title: "Photos",
    subtitle: "Add your photos to your profile",
    route: "/onboarding/photos",
  },
];

export default function ProfileCompletionScreen() {
  const router = useRouter();

  const handleContinue = () => {
    const nextSection = PENDING_SECTIONS[0];
    if (nextSection) {
      router.push(nextSection.route);
    }
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

          <Text style={styles.headerTitle}>Profile Completion</Text>

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
      >
        {/* ================= PROGRESS CARD ================= */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardTopRow}>
            <CircularProgress percent={PROFILE_COMPLETION_PERCENT} />

            <View style={styles.progressTextBlock}>
              <Text style={styles.progressTitle}>
                Your profile is {PROFILE_COMPLETION_PERCENT}% complete!
              </Text>
              <Text style={styles.progressSubtitle}>
                Complete your profile to get better matches and increase your
                chances.
              </Text>
            </View>
          </View>

          <View style={styles.progressBarRow}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${PROFILE_COMPLETION_PERCENT}%` },
                ]}
              />
            </View>
            <Text style={styles.progressBarLabel}>
              {PROFILE_COMPLETION_PERCENT}%
            </Text>
          </View>
        </View>

        {/* ================= COMPLETED SECTIONS ================= */}
        <Text style={styles.sectionHeadingCompleted}>Completed Sections</Text>
        <View style={styles.card}>
          {COMPLETED_SECTIONS.map((section, index) => (
            <SectionRow
              key={section.key}
              icon={section.icon}
              title={section.title}
              subtitle={section.subtitle}
              variant="completed"
              isLast={index === COMPLETED_SECTIONS.length - 1}
            />
          ))}
        </View>

        {/* ================= PENDING SECTIONS ================= */}
        <Text style={styles.sectionHeadingPending}>Pending Sections</Text>
        <View style={styles.card}>
          {PENDING_SECTIONS.map((section, index) => (
            <SectionRow
              key={section.key}
              icon={section.icon}
              title={section.title}
              subtitle={section.subtitle}
              variant="pending"
              isLast={index === PENDING_SECTIONS.length - 1}
              onPress={() => router.push(section.route)}
            />
          ))}
        </View>

        {/* ================= WHY COMPLETE NOTE ================= */}
        <View style={styles.infoNote}>
          <View style={styles.infoIconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={16}
              color={Colors.infoBlue ?? "#4F46E5"}
            />
          </View>
          <View style={styles.infoTextBlock}>
            <Text style={styles.infoTitle}>Why complete your profile?</Text>
            <Text style={styles.infoSubtitle}>
              Profiles with more details get up to 3x more views and better
              matches.
            </Text>
          </View>
        </View>

        {/* ================= CONTINUE BUTTON ================= */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            Continue Completing Profile
          </Text>
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
function CircularProgress({ percent, size = 96, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filledLength = (circumference * percent) / 100;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.success ?? "#22C55E"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filledLength}, ${circumference}`}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.circularProgressLabelWrap}>
        <Text style={styles.circularProgressLabel}>{percent}%</Text>
      </View>
    </View>
  );
}

function SectionRow({ icon, title, subtitle, variant, isLast, onPress }) {
  const isCompleted = variant === "completed";
  const RowWrapper = isCompleted ? View : TouchableOpacity;

  return (
    <RowWrapper
      style={[styles.sectionRow, !isLast && styles.sectionRowDivider]}
      activeOpacity={isCompleted ? 1 : 0.7}
      onPress={isCompleted ? undefined : onPress}
    >
      <View
        style={[
          styles.sectionIconCircle,
          isCompleted
            ? styles.sectionIconCircleCompleted
            : styles.sectionIconCirclePending,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            isCompleted ? (Colors.success ?? "#22C55E") : Colors.primaryRed
          }
        />
      </View>

      <View style={styles.sectionTextBlock}>
        <Text style={styles.sectionRowTitle}>{title}</Text>
        <Text style={styles.sectionRowSubtitle}>{subtitle}</Text>
      </View>

      {isCompleted ? (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={14} color={Colors.white} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={Colors.primaryRed} />
      )}
    </RowWrapper>
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
    fontSize: FontSizes.welcome,
    fontFamily: Fonts.display.bold,
    color: Colors.white,
  },
  headerSpacer: {
    width: 34,
  },
  headerWave: {
    marginTop: -6,
  },

  /* ===== PROGRESS CARD ===== */
  progressCard: {
    backgroundColor: "#FDF6EA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  progressCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  circularProgressLabelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  circularProgressLabel: {
    fontSize: 18,
    fontFamily: Fonts.display.bold,
    color: Colors.success ?? "#22C55E",
  },
  progressTextBlock: {
    flex: 1,
    marginLeft: 16,
  },
  progressTitle: {
    fontSize: 15,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: Colors.success ?? "#22C55E",
  },
  progressBarLabel: {
    fontSize: 13,
    fontFamily: Fonts.body.bold,
    color: Colors.success ?? "#22C55E",
    marginLeft: 10,
  },

  /* ===== SECTION HEADINGS ===== */
  sectionHeadingCompleted: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.success ?? "#22C55E",
    marginBottom: 12,
  },
  sectionHeadingPending: {
    fontSize: 15,
    fontFamily: Fonts.display.bold,
    color: Colors.primaryRed,
    marginBottom: 12,
  },

  /* ===== CARD LIST ===== */
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    overflow: "hidden",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  sectionIconCircleCompleted: {
    backgroundColor: "#E3F6E9",
  },
  sectionIconCirclePending: {
    backgroundColor: "#FCE4D6",
  },
  sectionTextBlock: {
    flex: 1,
  },
  sectionRowTitle: {
    fontSize: 14.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sectionRowSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success ?? "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ===== INFO NOTE ===== */
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EEF0FC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  infoIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E4FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  infoTextBlock: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13.5,
    fontFamily: Fonts.body.bold,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  infoSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.body.regular,
    color: Colors.textMuted,
    lineHeight: 16,
  },

  /* ===== CONTINUE BUTTON ===== */
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primaryRedDark,
    borderRadius: 16,
    paddingVertical: 17,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: Fonts.body.bold,
    color: Colors.white,
  },
});
