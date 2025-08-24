import { setUser } from '@/store/slices/userSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export default function LoginScreen() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  // const [email, setEmail] = useState(''); // Email login disabled - will be enabled later
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const dispatch = useDispatch();

  const handleSendOtp = () => {
    if (loginMethod === 'phone' && phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    // Email login validation disabled - will be enabled later
    // if (loginMethod === 'email' && !email.includes('@')) {
    //   Alert.alert('Error', 'Please enter a valid email address');
    //   return;
    // }
    
    setShowOtp(true);
    Alert.alert('OTP Sent', `OTP sent to your ${loginMethod}. Use 123456 for demo.`);
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      dispatch(setUser({
        name: 'Test User',
        phone: loginMethod === 'phone' ? phoneNumber : '+91 6207338266'
      }));
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Invalid OTP. Use 123456 for demo.');
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google login
    dispatch(setUser({
      name: 'Google Test User',
      phone: '+91 6207338266'
    }));
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Jhola-Bazar</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        {!showOtp ? (
          <>
            {/* Email login method selector disabled - will be enabled later */}
            {/* <View style={styles.methodSelector}>
              <TouchableOpacity
                style={[styles.methodButton, loginMethod === 'phone' && styles.activeMethod]}
                onPress={() => setLoginMethod('phone')}
              >
                <Text style={[styles.methodText, loginMethod === 'phone' && styles.activeMethodText]}>
                  Phone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodButton, loginMethod === 'email' && styles.activeMethod]}
                onPress={() => setLoginMethod('email')}
              >
                <Text style={[styles.methodText, loginMethod === 'email' && styles.activeMethodText]}>
                  Email
                </Text>
              </TouchableOpacity>
            </View> */}

            {/* Only phone login available - email login disabled */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.phoneInput}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>
            {/* Email input disabled - will be enabled later
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.fullInput}
                placeholder="Enter email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            */}

            <TouchableOpacity style={styles.sendOtpButton} onPress={handleSendOtp}>
              <Text style={styles.sendOtpText}>Send OTP</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Enter OTP</Text>
              <Text style={styles.otpSubtext}>
                OTP sent to {phoneNumber}
              </Text>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp}>
              <Text style={styles.verifyText}>Verify OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowOtp(false)}>
              <Text style={styles.backText}>Back to login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  methodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeMethod: {
    backgroundColor: '#00B761',
  },
  methodText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeMethodText: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  fullInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 16,
  },
  sendOtpButton: {
    backgroundColor: '#00B761',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  sendOtpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 16,
    borderRadius: 8,
  },
  googleText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  otpSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
  verifyButton: {
    backgroundColor: '#00B761',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backText: {
    textAlign: 'center',
    color: '#00B761',
    fontSize: 16,
    fontWeight: '500',
  },
});