/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
Image,
  StatusBar,
} from 'react-native';
const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  },);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#CC0000" barStyle="light-content" />

      <View style={styles.topSection}>
          <View>
   <Image
  source={require('../../assets/images/logo.png')}
  style={{ width: 100, height: 100 }}
/>
    </View>
        <Text style={styles.appName}>Mudiraj World</Text>
        <Text style={styles.subTitle}>Matrimony</Text>
        {/* Decorative Divider */}
<View style={styles.dividerRow}>
  <View style={styles.dividerLine} />
  <Text style={styles.dividerIcon}>❧</Text>
  <Text style={styles.dividerDot}>✦</Text>
  <Text style={styles.dividerIcon}>❧</Text>
  <View style={styles.dividerLine} />
</View>
        <Text style={styles.tagline}>A Trusted Matrimony</Text>
        <Text style={styles.tagline}>for Mudiraj Community</Text>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.trustRow}>
          <Text style={styles.trustItem}>🛡️ Trusted</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.trustItem}>🔒 Secure</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.trustItem}>🤝 Together</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#CC0000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#FFD700',
    elevation: 10,
    shadowColor: '#CC0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  logoEmoji: { fontSize: 62 },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#CC0000',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  dividerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 16,
  gap: 6,
},
dividerLine: {
  width: 40,
  height: 1,
  backgroundColor: '#C8A96E',
},
dividerIcon: {
  fontSize: 14,
  color: '#C8A96E',
},
dividerDot: {
  fontSize: 10,
  color: '#C8A96E',
},
  tagline: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSection: {
    backgroundColor: '#CC0000',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustItem: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dot: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default SplashScreen;
