/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { ROUTES } from '../navigation/routes';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const WaveHeader = ({ navigation }) => (
  <View>
    <Svg width={width} height={120} viewBox={`0 0 ${width} 120`} fill="none">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8B0000" />
          <Stop offset="1" stopColor="#CC0000" />
        </LinearGradient>
      </Defs>

      {/* Main block up to wave start */}
      <Path
        d={`
          M0 0
          H${width}
          V80
          C${width * 0.75} 80 ${width * 0.75} 120 ${width * 0.5} 120
          C${width * 0.25} 120 ${width * 0.25} 80 0 80
          Z
        `}
        fill="url(#grad)"
      />
    </Svg>

    {/* Back button overlaid on top-left of header */}
    <TouchableOpacity
      onPress={() => navigation?.goBack()}
      style={styles.backBtn}
      activeOpacity={0.7}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M19 12H5M5 12L12 19M5 12L12 5"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  </View>
);

const EyeIcon = ({ visible, onToggle }) => (
  <TouchableOpacity onPress={onToggle}>
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
            stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          />
          <Path
            d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
            stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <Path
            d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12A18.45 18.45 0 015.06 5.06M9.9 4.24A9.12 9.12 0 0112 4C19 4 23 12 23 12A18.5 18.5 0 0121.54 14.35M14.12 14.12A3 3 0 119.88 9.88"
            stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          />
          <Path d="M1 1L23 23" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" />
        </>
      )}
    </Svg>
  </TouchableOpacity>
);

const LoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#8B0000" barStyle="light-content" translucent />

      <WaveHeader navigation={navigation} />

      {/* Text below header */}
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Welcome Back</Text>
        <Text style={styles.headerSubtitle}>Login to continue your journey</Text>
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Mobile Number */}
        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.mobileRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryText}>+91 ▾</Text>
          </View>
          <TextInput
            style={styles.mobileInput}
            placeholder="Enter mobile number"
            placeholderTextColor="#AAAAAA"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
            maxLength={10}
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor="#AAAAAA"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <EyeIcon visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => navigation.navigate(ROUTES.FORGOT)}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginBtn}
         onPress={() => navigation.replace('MainStack')}
          activeOpacity={0.85}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        {/* Social Login */}
        <Text style={styles.orText}>or continue with</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>🍎</Text>
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.registerRow}>
          <Text style={styles.newText}>New to Mudiraj World Matrimony? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  backBtn: { position: 'absolute', top: 44, left: 16, padding: 8, zIndex: 10 },
  headerText: { alignItems: 'center', paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#8B0000' },
  headerSubtitle: { fontSize: 17, color: '#000000', marginTop: 4 },
  body: { flex: 1, paddingHorizontal: 24 },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    marginTop: 16,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingBottom: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#CC0000' },
  tabText: { fontSize: 16, color: '#999999', fontWeight: '500' },
  activeTabText: { color: '#CC0000', fontWeight: '700' },
  form: { paddingBottom: 20 },
  label: { fontSize: 14, color: '#333333', fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
    color: '#333333', backgroundColor: '#FAFAFA',
  },
  mobileRow: { flexDirection: 'row', gap: 10 },
  countryCode: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: '#FAFAFA', justifyContent: 'center',
  },
  countryText: { fontSize: 15, color: '#333333', fontWeight: '500' },
  mobileInput: {
    flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
    color: '#333333', backgroundColor: '#FAFAFA',
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10,
    paddingHorizontal: 16, backgroundColor: '#FAFAFA',
  },
  passwordInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#333333' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 10 },
  forgotText: { color: '#CC0000', fontSize: 13, fontWeight: '600' },
  loginBtn: {
    backgroundColor: '#CC0000', borderRadius: 30, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, elevation: 4,
    shadowColor: '#CC0000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  orText: { textAlign: 'center', color: '#999999', fontSize: 13, marginVertical: 20 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  socialBtn: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 1.5,
    borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', elevation: 2,
  },
  socialIcon: { fontSize: 20, fontWeight: '700', color: '#333333' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  newText: { color: '#999999', fontSize: 14 },
  registerLink: { color: '#CC0000', fontSize: 14, fontWeight: '700' },
});
export default LoginScreen;
