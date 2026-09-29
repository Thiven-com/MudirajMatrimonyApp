import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Fonts from '../constants/Fonts';

const ResetPasswordScreen = ({ route, navigation }) => {
  const { mobile } = route.params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter new password');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Error',
        'Password must be at least 6 characters'
      );
      return;
    }

    if (!confirmPassword) {
      Alert.alert(
        'Error',
        'Please enter confirm password'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Error',
        'Passwords do not match'
      );
      return;
    }

    try {
      setLoading(true);

      // API CALL

      const response = await fetch(
        'https://yourdomain.com/api/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile,
            password,
            password_confirmation: confirmPassword,
          }),
        }
      );

      const result = await response.json();

      if (result.status) {
        Alert.alert(
          'Success',
          'Password updated successfully',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                }),
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          result.message || 'Failed to reset password'
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#E30613"
        barStyle="light-content"
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          Reset Password
        </Text>

        <Text style={styles.subtitle}>
          Create a new password for your account
        </Text>

        <TextInput
          placeholder="New Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
              Reset Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  title: {
    fontSize: 30,
    fontFamily: Fonts.bold,
    color: '#E30613',
    textAlign: 'center',
  },

  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontFamily: Fonts.regular,
    marginTop: 10,
    marginBottom: 40,
    fontSize: 15,
  },

  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
    fontFamily: Fonts.regular,
  },

  button: {
    height: 55,
    backgroundColor: '#E30613',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
});