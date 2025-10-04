import { setUser } from '@/store/slices/userSlice';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { config } from '@/config/env';
import { InputValidator } from '@/utils/inputValidator';
import { logger } from '@/utils/logger';
import { API_ENDPOINTS } from '@/constants/api';

export default function LoginScreen() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  // const [email, setEmail] = useState(''); // Email login disabled - will be enabled later
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const dispatch = useDispatch();

  const handleSendOtp = async () => {
    const sanitizedPhone = InputValidator.sanitizeString(phoneNumber);
    if (loginMethod === 'phone' && !InputValidator.validatePhoneNumber(sanitizedPhone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsLoading(true);
    try {
      // Try login first
      let response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: sanitizedPhone,
        }),
      });
      
      let data = await response.json();
      
      // If login fails (user doesn't exist), try signup
      if (!response.ok) {
        response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: sanitizedPhone,
          }),
        });
        
        data = await response.json();
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
      
      if (response.ok) {
        setShowOtp(true);
        Alert.alert('OTP Sent', 'OTP sent to your Whatsapp');
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string) => {
    setOtp(text);
    // Auto-verify when 6 digits are entered
    if (text.length === 6 && !isLoading) {
      handleVerifyOtp(text);
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const currentOtp = otpValue || otp;
    const sanitizedOtp = InputValidator.sanitizeString(currentOtp);
    if (!InputValidator.validateOTP(sanitizedOtp)) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: InputValidator.sanitizeString(phoneNumber),
          otp: sanitizedOtp,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save tokens to AsyncStorage from data object
        if (data.data?.accessToken) {
          await AsyncStorage.setItem('authToken', data.data.accessToken);
        }
        if (data.data?.refreshToken) {
          await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        }
        
        dispatch(setUser({
          name: InputValidator.sanitizeString(data.data?.customer?.firstName || 'User'),
          phone: InputValidator.sanitizeString(phoneNumber),
        }));
        // router.replace('/referral');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      // Use the same endpoint that was successful initially
      const endpoint = isNewUser ? '/auth/signup' : '/auth/login';
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: InputValidator.sanitizeString(phoneNumber),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('OTP Resent', 'New OTP sent to your whatsapp');
      } else {
        Alert.alert('Error', data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.title}>Welcome to Jhola Bazar</Text>
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
                <Text style={styles.countryCode}></Text>
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

            <TouchableOpacity 
              style={[styles.sendOtpButton, isLoading && styles.disabledButton]} 
              onPress={handleSendOtp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.sendOtpText}>{isLoading ? 'Sending...' : 'Send OTP'}</Text>
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
                onChangeText={handleOtpChange}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <TouchableOpacity 
              style={[styles.verifyButton, isLoading && styles.disabledButton]} 
              onPress={handleVerifyOtp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyText}>{isLoading ? 'Verifying...' : 'Verify OTP'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleResendOtp}
              disabled={isLoading}
            >
              <Text style={[styles.resendText, isLoading && styles.disabledText]}>Resend OTP</Text>
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
    backgroundColor: '#006B3C',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  sendOtpText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#006B3C',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backText: {
    textAlign: 'center',
    color: '#00B761',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#00B761',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledText: {
    color: '#ccc',
  },
});