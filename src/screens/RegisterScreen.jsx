/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';

const RegisterScreen = ({ navigation }) => {
  const [onBehalf, setOnBehalf] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [religion, setReligion] = useState('');
  const [caste, setCaste] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showOnBehalf, setShowOnBehalf] = useState(false);
  const [showGender, setShowGender] = useState(false);
  const [showReligion, setShowReligion] = useState(false);
  const [showCaste, setShowCaste] = useState(false);

  const ON_BEHALF = [
    /*{ label: 'Myself', value: 1 },
    { label: 'Son', value: 2 },
    { label: 'Daughter', value: 3 },
    { label: 'Brother', value: 4 },
    { label: 'Sister', value: 5 },
    { label: 'Friend', value: 6 },*/
  ];

  const GENDER = ['Male', 'Female'];
  const RELIGION = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain'];
  const CASTE = ['Mudiraj', 'Brahmin', 'Kshatriya', 'Vaishya', 'Other'];

const handleRegister = async () => {
  if (!firstName || !lastName || !phone || !gender || !dob || !onBehalf) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  setLoading(true);

  try {
    const requestBody = {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      gender: gender,
      on_behalf: onBehalf,
      date_of_birth: dob,
      religion: religion,
      caste: caste,
      email: email,
      password: password,
    };

    console.log('Sending:', JSON.stringify(requestBody));

    const response = await fetch('https://matrimony.runserver.in/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Register Response:', JSON.stringify(data));

    if (data.result === true) {
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } else {
      let errorMsg = 'Registration failed';
      if (data.message && typeof data.message === 'object') {
        errorMsg = Object.values(data.message).flat().join('\n');
      } else if (typeof data.message === 'string') {
        errorMsg = data.message;
      }
      Alert.alert('Error', errorMsg);
    }
  } catch (error) {
    console.log('Register Error:', error);
    Alert.alert('Error', 'Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};
  const Dropdown = ({ label, value, options, show, onToggle, onSelect }) => (
    <View>
      <TouchableOpacity style={styles.dropdown} onPress={onToggle}>
        <Text style={value ? styles.dropValue : styles.dropPlaceholder}>
          {value || label}
        </Text>
        <Text style={styles.dropArrow}>{show ? '▲' : '▾'}</Text>
      </TouchableOpacity>
      {show && (
        <View style={styles.dropdownMenu}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={styles.dropdownItem}
              onPress={() => onSelect(opt)}>
              <Text style={styles.dropdownItemText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#CC0000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Fill out the form to get started.</Text>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>

        {/* On Behalf */}
        <Text style={styles.label}>On Behalf</Text>
        <Dropdown
          label="Nothing selected"
          value={ON_BEHALF.find(o => o.value === onBehalf)?.label || ''}
          options={ON_BEHALF.map(o => o.label)}
          show={showOnBehalf}
          onToggle={() => setShowOnBehalf(!showOnBehalf)}
          onSelect={(val) => {
            const found = ON_BEHALF.find(o => o.label === val);
            setOnBehalf(found?.value);
            setShowOnBehalf(false);
          }}
        />

        {/* First Name & Last Name */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#AAAAAA"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#AAAAAA"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        {/* Gender & Phone */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Gender *</Text>
            <Dropdown
              label="Select"
              value={gender}
              options={GENDER}
              show={showGender}
              onToggle={() => setShowGender(!showGender)}
              onSelect={(val) => { setGender(val); setShowGender(false); }}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#AAAAAA"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={10}
            />
          </View>
        </View>

        {/* Date of Birth & Profile */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Date Of Birth *</Text>
           <TextInput
  style={styles.input}
  placeholder="YYYY-MM-DD (e.g. 2000-01-15)"
  placeholderTextColor="#AAAAAA"
  value={dob}
  onChangeText={setDob}
/>
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Profile</Text>
            <TouchableOpacity style={styles.fileBtn}>
              <Text style={styles.fileBtnText}>Choose File</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Religion & Caste */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Religion</Text>
            <Dropdown
              label="Select One"
              value={religion}
              options={RELIGION}
              show={showReligion}
              onToggle={() => setShowReligion(!showReligion)}
              onSelect={(val) => { setReligion(val); setShowReligion(false); }}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Caste</Text>
            <Dropdown
              label="Nothing selected"
              value={caste}
              options={CASTE}
              show={showCaste}
              onToggle={() => setShowCaste(!showCaste)}
              onSelect={(val) => { setCaste(val); setShowCaste(false); }}
            />
          </View>
        </View>

        {/* Email */}
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={[styles.input, styles.emailInput]}
          placeholder="Email Address"
          placeholderTextColor="#AAAAAA"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Create a password"
            placeholderTextColor="#AAAAAA"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By registering, you agree to our{' '}
          <Text style={styles.termsLink}>Terms & Conditions</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#CC0000',
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: '#FFFFFF', fontSize: 20, fontWeight: '600' },
  titleSection: { alignItems: 'center', paddingVertical: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#CC0000', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888888' },
  body: { paddingHorizontal: 20 },
  label: { fontSize: 13, color: '#333333', fontWeight: '600', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: '#333333', backgroundColor: '#FAFAFA',
  },
  emailInput: { borderColor: '#CC0000', borderWidth: 1.5 },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FAFAFA',
  },
  dropPlaceholder: { fontSize: 14, color: '#AAAAAA' },
  dropValue: { fontSize: 14, color: '#333333' },
  dropArrow: { fontSize: 12, color: '#999999' },
  dropdownMenu: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    backgroundColor: '#FFFFFF', marginTop: 2, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, zIndex: 999,
  },
  dropdownItem: {
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  dropdownItemText: { fontSize: 14, color: '#333333' },
  fileBtn: {
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: '#F0F0F0', alignItems: 'center',
  },
  fileBtnText: { fontSize: 14, color: '#555555', fontWeight: '500' },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8,
    paddingHorizontal: 14, backgroundColor: '#FAFAFA',
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#333333' },
  eyeIcon: { fontSize: 18 },
  termsText: { fontSize: 12, color: '#888888', textAlign: 'center', marginTop: 20, lineHeight: 20 },
  termsLink: { color: '#CC0000', fontWeight: '600' },
  registerBtn: {
    backgroundColor: '#CC0000', borderRadius: 30, paddingVertical: 16,
    alignItems: 'center', marginTop: 24, elevation: 4,
    shadowColor: '#CC0000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6,
  },
  registerBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: '#999999', fontSize: 14 },
  loginLink: { color: '#CC0000', fontSize: 14, fontWeight: '700' },
});

export default RegisterScreen;