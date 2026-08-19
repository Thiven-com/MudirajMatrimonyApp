/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
Image,
} from 'react-native';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Logo Section */}
      <View style={styles.logoSection}>
       <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: 100, height: 100 }}
      />
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
        <Text style={styles.tagline}>Connecting Hearts,</Text>
        <Text style={styles.tagline}>Building Lifelong Bonds</Text>
      </View>

      {/* Bottom Red Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.getStartedBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.alreadyText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  logoEmoji: {
    fontSize: 60,
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#CC0000',
  },
  subTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    marginTop: 2,
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
    fontSize: 24,
    color: '#972424',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 50,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  getStartedBtn: {
    backgroundColor: '#ce2e2e',
    width: width - 80,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#c92b2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 20,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alreadyText: {
    color: '#0e0d0d',
    fontSize: 14,
  },
  loginLink: {
    color: '#b93939',
    fontSize: 14,
    fontWeight: '700',
  },
});
export default OnboardingScreen;

