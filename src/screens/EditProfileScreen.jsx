/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';

const RED = '#CC0000';

const Field = ({ label, value, onChangeText, placeholder, keyboardType, maxLength, multiline }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMulti]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      placeholderTextColor="#BBBBBB"
      keyboardType={keyboardType || 'default'}
      maxLength={maxLength}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
    />
  </View>
);

const SelectField = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectBtn} onPress={() => setOpen(!open)}>
        <Text style={[styles.selectText, !value && { color: '#BBBBBB' }]}>
          {value || 'Select ' + label.toLowerCase()}
        </Text>
        <Text style={styles.selectArrow}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dropdownItem, i < options.length - 1 && styles.dropdownBorder]}
              onPress={() => { onSelect(opt); setOpen(false); }}>
              <Text style={[styles.dropdownText, value === opt && { color: RED, fontWeight: '700' }]}>
                {opt}
              </Text>
              {value === opt && <Text style={{ color: RED }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [complexion, setComplexion] = useState('');
  const [motherTongue, setMotherTongue] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [income, setIncome] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [fatherOcc, setFatherOcc] = useState('');
  const [motherOcc, setMotherOcc] = useState('');
  const [siblings, setSiblings] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={RED} barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <TouchableOpacity style={styles.cameraBtn}>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Basic information</Text>
          <Field label="Full name" value={name} onChangeText={setName} placeholder="Enter your full name" />
          <Field label="Date of birth" value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" keyboardType="number-pad" />
          <Field label="Mobile number" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} placeholder="Enter mobile number" />
          <Field label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="Enter email address" />
          <Field label="About me" value={bio} onChangeText={setBio} placeholder="Write a short bio..." multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Physical details</Text>
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Field label="Height" value={height} onChangeText={setHeight} placeholder="e.g. 5 ft 4 in" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="number-pad" placeholder="e.g. 55" />
            </View>
          </View>
          <SelectField label="Complexion" value={complexion} onSelect={setComplexion}
            options={['Very Fair', 'Fair', 'Wheatish', 'Wheatish Brown', 'Dark']} />
          <SelectField label="Marital status" value={maritalStatus} onSelect={setMaritalStatus}
            options={['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce']} />
          <SelectField label="Mother tongue" value={motherTongue} onSelect={setMotherTongue}
            options={['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Other']} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Education and career</Text>
          <SelectField label="Highest education" value={education} onSelect={setEducation}
            options={['10th', '12th', 'Diploma', 'B.Tech', 'B.Sc', 'B.Com', 'MBA', 'M.Tech', 'MBBS', 'PhD', 'Other']} />
          <Field label="Profession" value={profession} onChangeText={setProfession} placeholder="e.g. Software Engineer" />
          <SelectField label="Annual income" value={income} onSelect={setIncome}
            options={['Below 2 LPA', '2 to 4 LPA', '4 to 6 LPA', '6 to 8 LPA', '8 to 12 LPA', '12 to 20 LPA', 'Above 20 LPA']} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Location</Text>
          <Field label="City" value={city} onChangeText={setCity} placeholder="e.g. Vijayawada" />
          <SelectField label="State" value={state} onSelect={setState}
            options={['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Other']} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Family details</Text>
          <SelectField label="Father occupation" value={fatherOcc} onSelect={setFatherOcc}
            options={['Business', 'Government Job', 'Private Job', 'Retired', 'Farmer', 'Not Alive']} />
          <SelectField label="Mother occupation" value={motherOcc} onSelect={setMotherOcc}
            options={['Homemaker', 'Business', 'Government Job', 'Private Job', 'Retired', 'Not Alive']} />
          <Field label="Siblings" value={siblings} onChangeText={setSiblings} placeholder="e.g. 1 Brother, 1 Sister" />
        </View>

        <TouchableOpacity style={styles.saveBtnBottom} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.saveBtnBottomText}>Save changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: RED,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  saveBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  avatarSection: { alignItems: 'center', paddingVertical: 24, position: 'relative' },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#FFE4E4',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: RED,
  },
  avatarEmoji: { fontSize: 52 },
  cameraBtn: {
    position: 'absolute',
    bottom: 42, right: '34%',
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: RED,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  cameraIcon: { fontSize: 14 },
  changePhotoBtn: { marginTop: 8 },
  changePhotoText: { color: RED, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16, marginBottom: 14,
    borderRadius: 14, padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  sectionHeader: {
    fontSize: 13, fontWeight: '700',
    color: RED,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12, fontWeight: '600',
    color: '#666666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 11, fontSize: 14,
    color: '#222222', backgroundColor: '#FAFAFA',
  },
  inputMulti: { height: 90, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row' },
  selectBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 11, backgroundColor: '#FAFAFA',
  },
  selectText: { fontSize: 14, color: '#222222', flex: 1 },
  selectArrow: { fontSize: 11, color: '#999999' },
  dropdown: {
    borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 10, marginTop: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  dropdownBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  dropdownText: { fontSize: 14, color: '#333333' },
  saveBtnBottom: {
    backgroundColor: RED,
    marginHorizontal: 16, marginTop: 6,
    borderRadius: 30, paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
  },
  saveBtnBottomText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
export default EditProfileScreen;
