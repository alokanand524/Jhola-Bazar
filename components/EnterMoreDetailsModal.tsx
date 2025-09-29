import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface EnterMoreDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (details: any) => void;
}

export default function EnterMoreDetailsModal({ visible, onClose, onSubmit }: EnterMoreDetailsModalProps) {
  console.log('🔥 Modal component rendered, visible:', visible);
  const { colors } = useTheme();
  const { name, phone } = useSelector((state: RootState) => state.user);
  console.log('🔥 Redux state - name:', name, 'phone:', phone);
  
  const [orderForFriend, setOrderForFriend] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  const loadUserData = async () => {
    console.log('🔥 loadUserData called');
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('authToken');
      
      console.log('🔥 Token exists:', !!token);
      if (!token) {
        console.log('🔥 No token found, returning');
        return;
      }
      
      console.log('🔥 Making API call...');
      const response = await fetch('https://jholabazar.onrender.com/api/v1/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔥 Response status:', response.status);
      const data = await response.json();
      console.log('🔥 API Response:', data);
      
      if (response.ok && data.success && data.data) {
        const profile = data.data;
        console.log('🔥 Profile data:', profile);
        console.log('🔥 Setting name:', `${profile.firstName} ${profile.lastName}`);
        console.log('🔥 Setting email:', profile.email);
        console.log('🔥 Setting phone:', profile.phone);
        
        setCustomerName(`${profile.firstName} ${profile.lastName}`);
        setCustomerEmail(profile.email);
        setCustomerMobile(profile.phone);
        
        console.log('🔥 Data set successfully!');
      } else {
        console.log('🔥 API response failed or no data');
      }
    } catch (error) {
      console.error('🔥 Error:', error);
    }
  };

  useEffect(() => {
    console.log('🔥 useEffect triggered - visible:', visible, 'orderForFriend:', orderForFriend);
    if (visible && !orderForFriend) {
      console.log('🔥 Calling loadUserData');
      loadUserData();
    }
  }, [visible]);

  const handleOrderForFriendToggle = () => {
    const newValue = !orderForFriend;
    setOrderForFriend(newValue);
    
    if (newValue) {
      // Clear fields for friend
      setCustomerName('');
      setCustomerEmail('');
      setCustomerMobile('');
    } else {
      // Load user data
      loadUserData();
    }
  };

  const handleSubmit = () => {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }
    if (!customerMobile.trim()) {
      Alert.alert('Error', 'Please enter mobile number');
      return;
    }

    onSubmit({
      name: customerName.trim(),
      email: customerEmail.trim(),
      mobile: customerMobile.trim(),
      orderForFriend
    });
    onClose();
  };

  console.log('🔥 Rendering modal with visible:', visible);
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Enter More Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={handleOrderForFriendToggle}
            >
              <View style={[
                styles.checkbox, 
                { borderColor: colors.primary },
                orderForFriend && { backgroundColor: colors.primary }
              ]}>
                {orderForFriend && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                Order for Friend
              </Text>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Enter customer name"
                placeholderTextColor={colors.gray}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={customerEmail}
                onChangeText={setCustomerEmail}
                placeholder="Enter email address"
                placeholderTextColor={colors.gray}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Mobile *</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={customerMobile}
                onChangeText={setCustomerMobile}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.gray}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  footer: {
    marginTop: 10,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});