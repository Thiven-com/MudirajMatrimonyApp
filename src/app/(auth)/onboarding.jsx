import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const LOGO = require("../../../assets/images/logo.png");

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>MUDHIRAJ WORLD</Text>
        <Text style={styles.subtitle}>Find your life partner with confidence.</Text>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={26} color="#C91412" />
          <Text style={styles.infoText}>Verified profiles and trusted community matching.</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.9}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFDFC",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFDFC",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#211B19",
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6F6662",
    textAlign: "center",
    marginBottom: 28,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#FFF7F5",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0E5DC",
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    color: "#211B19",
    fontSize: 15,
    marginLeft: 12,
    lineHeight: 22,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#C91412",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
