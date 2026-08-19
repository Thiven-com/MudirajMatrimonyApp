/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timer, setTimer] = useState(45);
  const [timerActive, setTimerActive] = useState(false);

  const otpRefs = useRef([]);
  const timerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const NAVY = '#1a2340';

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (step - 1) / 2,
      duration: 300,
      useNativeDriver: false,
    }).start();
  },);

  useEffect(() => {
    if (step === 2) {startTimer();}
    return () => clearInterval(timerRef.current);
  }, [step]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    setTimer(90);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTimer = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleOtpChange = (val, index) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) {otpRefs.current[index + 1]?.focus();}
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const getStrengthScore = () => {
    let score = 0;
    if (password.length >= 8) {score++;}
    if (/[A-Z]/.test(password)) {score++;}
    if (/[0-9]/.test(password)) {score++;}
    if (/[^A-Za-z0-9]/.test(password)) {score++;}
    return score;
  };

  const strengthColors = ['#ef4444', '#f59e0b', '#3b82f6', '#15803d'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const score = getStrengthScore();

  const rules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password)},
  ];
  const goNext = () => setStep(s => s + 1);
  const goBack = () => {
    if (step > 1 && step < 4) {setStep(s => s - 1);}
    else {navigation?.goBack();}
  };

  const maskedMobile = mobile
    ? `+91 ${mobile.slice(0, 2)}****${mobile.slice(-2)}`
    : 'your mobile';

  // ─── STEP INDICATOR ───────────────────────────────────────────
  const StepIndicator = () => (
    <View style={styles.stepRow}>
      {[1, 2, 3].map(i => (
        <View
          key={i}
          style={[
            styles.stepDot,
            step > i && styles.stepDone,
            step === i && styles.stepActive,
          ]}
        />
      ))}
    </View>
  );

  // ─── STEP 1: MOBILE ───────────────────────────────────────────
  const Step1 = () => (
    <View>
      <View style={[styles.heroIcon, { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' }]}>
        <Text style={styles.heroEmoji}>🔒</Text>
      </View>
      <Text style={styles.heading}>Reset your password</Text>
      <Text style={styles.subtext}>
        Enter your registered mobile number. We'll send a 6-digit OTP to reset your password.
      </Text>

      <Text style={styles.fieldLabel}>Mobile number</Text>
      <View style={styles.inputWrap}>
        <View style={styles.countryCode}>
          <Text style={styles.countryText}>+91</Text>
        </View>
        <View style={styles.divider} />
        <TextInput
          style={styles.input}
          placeholder="Enter 10-digit number"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          maxLength={10}
          value={mobile}
          onChangeText={setMobile}
        />
        <Text style={styles.inputIconRight}>📱</Text>
      </View>
      <Text style={styles.fieldHint}>Use the mobile number linked to your account.</Text>

      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: NAVY }]}
        onPress={goNext}>
        <Text style={styles.btnPrimaryText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── STEP 2: OTP ──────────────────────────────────────────────
  const Step2 = () => (
    <View>
      <View style={[styles.heroIcon, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
        <Text style={styles.heroEmoji}>📱</Text>
      </View>
      <Text style={styles.heading}>Enter verification code</Text>
      <Text style={styles.subtext}>
        A 6-digit OTP was sent to{' '}
        <Text style={{ color: '#1a2340', fontWeight: '600' }}>{maskedMobile}</Text>
        . It expires in 10 minutes.
      </Text>

      <Text style={styles.fieldLabel}>6-digit OTP</Text>
      <View style={styles.otpRow}>
        {otp.map((val, i) => (
          <TextInput
            key={i}
            ref={ref => (otpRefs.current[i] = ref)}
            style={[styles.otpBox, val ? styles.otpBoxFilled : null]}
            maxLength={1}
            keyboardType="number-pad"
            value={val}
            onChangeText={v => handleOtpChange(v, i)}
            onKeyPress={e => handleOtpKeyPress(e, i)}
          />
        ))}
      </View>

      <View style={styles.resendRow}>
        <Text style={styles.resendHint}>
          {timer > 0 ? `Resend in ${formatTimer()}` : 'OTP expired'}
        </Text>
        <TouchableOpacity onPress={startTimer}>
          <Text style={[styles.resendLink, { color: NAVY }]}>Resend OTP</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: NAVY }]}
        onPress={goNext}>
        <Text style={styles.btnPrimaryText}>Verify OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnGhost} onPress={() => setStep(1)}>
        <Text style={styles.btnGhostText}>Change mobile number</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── STEP 3: NEW PASSWORD ─────────────────────────────────────
  const Step3 = () => (
    <View>
      <View style={[styles.heroIcon, { backgroundColor: '#f0fdf4', borderColor: '#86efac' }]}>
        <Text style={styles.heroEmoji}>🛡️</Text>
      </View>
      <Text style={styles.heading}>Set new password</Text>
      <Text style={styles.subtext}>
        Choose a strong password you haven't used before.
      </Text>

      <Text style={styles.fieldLabel}>New password</Text>
      <View style={styles.inputWrap}>
        <Text style={styles.inputIconLeft}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder="At least 8 characters"
          placeholderTextColor="#9ca3af"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.inputIconRight}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {password.length > 0 && (
        <View style={styles.strengthBlock}>
          <View style={styles.strengthBar}>
            {[1, 2, 3, 4].map(i => (
              <View
                key={i}
                style={[
                  styles.strengthSeg,
                  { backgroundColor: i <= score ? strengthColors[score - 1] : '#e5e7eb' },
                ]}
              />
            ))}
          </View>
          {score > 0 && (
            <Text style={[styles.strengthLabel, { color: strengthColors[score - 1] }]}>
              {strengthLabels[score - 1]}
            </Text>
          )}
        </View>
      )}

      <View style={styles.ruleList}>
        {rules.map((rule, i) => (
          <View key={i} style={styles.ruleRow}>
            <Text style={[styles.ruleDot, rule.met && { color: '#15803d' }]}>
              {rule.met ? '✓' : '○'}
            </Text>
            <Text style={[styles.ruleText, rule.met && { color: '#15803d' }]}>
              {rule.label}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Confirm password</Text>
      <View style={[styles.inputWrap, { marginBottom: 24 }]}>
        <Text style={styles.inputIconLeft}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-enter password"
          placeholderTextColor="#9ca3af"
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <Text style={styles.inputIconRight}>{showConfirm ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: NAVY }]}
        onPress={goNext}>
        <Text style={styles.btnPrimaryText}>Update password</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── STEP 4: SUCCESS ──────────────────────────────────────────
  const Step4 = () => (
    <View style={styles.successCenter}>
      <View style={styles.successRing}>
        <Text style={{ fontSize: 36 }}>✅</Text>
      </View>
      <Text style={styles.heading}>Password updated</Text>
      <Text style={[styles.subtext, { textAlign: 'center', marginBottom: 36 }]}>
        Your password was reset. Use your new password to sign in.
      </Text>
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: NAVY, width: '100%' }]}
        onPress={() => navigation?.navigate('Login')}>
        <Text style={styles.btnPrimaryText}>Back to sign in</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />

      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topbarTitle}>
          {['Forgot password', 'Verify OTP', 'New password', 'Done'][step - 1]}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <StepIndicator />

        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const NAVY = '#1a2340';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e00013',
    backgroundColor: '#867575',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#E5E7EB',
  },
  backArrow: { fontSize: 18, color: '#111827', fontWeight: '500' },
  topbarTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },

  stepRow: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  stepDot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: '#ffffff' },
  stepActive: { backgroundColor: NAVY },
  stepDone: { backgroundColor: NAVY },

  body: { flex: 1 },
  bodyContent: { padding: 24 },

  heroIcon: {
    width: 56, height: 56, borderRadius: 16,
    borderWidth: 0.5, alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  heroEmoji: { fontSize: 26 },

  heading: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  subtext: { fontSize: 13.5, color: '#6B7280', lineHeight: 22, marginBottom: 24 },

  fieldLabel: {
    fontSize: 11, fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 7,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#D1D5DB',
    borderRadius: 10, backgroundColor: '#F9FAFB',
    paddingHorizontal: 14, height: 52,
    gap: 10, marginBottom: 6,
  },
  countryCode: {
    paddingRight: 6,
  },
  countryText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  divider: { width: 1, height: 22, backgroundColor: '#D1D5DB' },
  inputIconLeft: { fontSize: 16 },
  inputIconRight: { fontSize: 16 },
  input: { flex: 1, fontSize: 14, color: '#111827' },
  fieldHint: { fontSize: 12, color: '#9CA3AF', marginBottom: 24 },

  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  otpBox: {
    flex: 1, height: 52, borderRadius: 10,
    borderWidth: 0.5, borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB', fontSize: 22,
    fontWeight: '600', textAlign: 'center', color: '#111827',
  },
  otpBoxFilled: { borderColor: NAVY, backgroundColor: '#FFFFFF' },

  resendRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  resendHint: { fontSize: 12, color: '#9CA3AF' },
  resendLink: { fontSize: 12, fontWeight: '600' },

  strengthBlock: { marginBottom: 16 },
  strengthBar: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  strengthSeg: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: '600' },

  ruleList: { marginBottom: 20, gap: 6 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleDot: { fontSize: 13, color: '#9CA3AF', width: 16, textAlign: 'center' },
  ruleText: { fontSize: 12, color: '#9CA3AF' },

  btnPrimary: {
    height: 48, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  btnGhost: {
    height: 44, borderRadius: 10,
    borderWidth: 0.5, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 10, backgroundColor: 'transparent',
  },
  btnGhostText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

  successCenter: { alignItems: 'center', paddingTop: 32 },
  successRing: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#F0FDF4', borderWidth: 0.5,
    borderColor: '#86EFAC', alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
});
export default ForgotPasswordScreen;
