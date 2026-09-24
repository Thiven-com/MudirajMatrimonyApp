import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    try {
      setLoading(true);

      // API Call Here

      setTimeout(() => {
        setLoading(false);

        navigation.navigate('VerifyOTP', {
          mobile,
        });
      }, 1500);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#E30613"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <Text style={styles.title}>
          Forgot Password
        </Text>

        <Text style={styles.subtitle}>
          Enter your registered mobile number to
          receive OTP verification.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>
          Mobile Number
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Mobile Number"
          keyboardType="phone-pad"
          maxLength={10}
          value={mobile}
          onChangeText={setMobile}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSendOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
              Send OTP
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  header: {
    paddingHorizontal: 25,
    marginTop: 60,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#E30613',
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 10,
    lineHeight: 22,
  },

  form: {
    marginTop: 50,
    paddingHorizontal: 25,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FAFAFA',
  },

  button: {
    height: 55,
    backgroundColor: '#E30613',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },

  backText: {
    textAlign: 'center',
    marginTop: 25,
    color: '#E30613',
    fontWeight: '600',
  },
});