import { setUser } from '@/store/slices/userSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Clipboard, Linking, Share, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';
import { profileAPI } from '@/services/api';

export default function EditProfileScreen() {
  const dispatch = useDispatch();
  const { name, phone } = useSelector((state: RootState) => state.user);
  const { colors } = useTheme();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [referralCode] = useState(`JB${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const referralLink = `https://jhola-bazar.app/ref/${referralCode}`;

  const handleSave = async () => {
    try {
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        gender,
        dateOfBirth,
      };
      
      await profileAPI.updateProfile(profileData);
      dispatch(setUser({ name: `${firstName} ${lastName}`.trim(), phone }));
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const handleShare = async (platform: string) => {
    const message = `Hey! Join Jhola-Bazar and get ₹50 off on your first order. Use my referral code: ${referralCode}\n\nDownload now: ${referralLink}`;
    
    try {
      switch (platform) {
        case 'whatsapp':
          await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
          break;
        case 'telegram':
          await Linking.openURL(`tg://msg?text=${encodeURIComponent(message)}`);
          break;
        case 'sms':
          await Linking.openURL(`sms:?body=${encodeURIComponent(message)}`);
          break;
        case 'email':
          await Linking.openURL(`mailto:?subject=Join Jhola-Bazar&body=${encodeURIComponent(message)}`);
          break;
        default:
          await Share.share({ message });
      }
    } catch (error) {
      await Share.share({ message });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>First Name</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Last Name</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
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
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              placeholderTextColor={colors.gray}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    { borderColor: colors.border },
                    gender === option && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[
                    styles.genderText,
                    { color: colors.text },
                    gender === option && { color: '#fff' }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Date of Birth</Text>
            <TouchableOpacity
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  justifyContent: 'center'
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[{ color: dateOfBirth ? colors.text : colors.gray }]}>
                {dateOfBirth || 'Select Date of Birth (YYYY-MM-DD)'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.lightGray,
                  borderColor: colors.border,
                  color: colors.gray
                }
              ]}
              value={phone}
              editable={false}
              placeholder="Phone number"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Referral Code</Text>
          
          <View style={[styles.referralCard, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <View style={styles.referralHeader}>
              <Ionicons name="gift" size={24} color={colors.primary} />
              <Text style={[styles.referralTitle, { color: colors.text }]}>Invite Friends & Earn</Text>
            </View>
            
            <Text style={[styles.referralCode, { color: colors.primary }]}>{referralCode}</Text>
            
            <TouchableOpacity 
              style={[styles.copyButton, { backgroundColor: colors.primary }]}
              onPress={handleCopyLink}
            >
              <Ionicons name="copy" size={16} color="#fff" />
              <Text style={styles.copyText}>Copy Link</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.shareTitle, { color: colors.text }]}>Share via</Text>
          
          <View style={styles.shareButtons}>
            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: '#25D366' }]}
              onPress={() => handleShare('whatsapp')}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#fff" />
              <Text style={styles.shareButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: '#0088cc' }]}
              onPress={() => handleShare('telegram')}
            >
              <Ionicons name="paper-plane" size={24} color="#fff" />
              <Text style={styles.shareButtonText}>Telegram</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: '#007AFF' }]}
              onPress={() => handleShare('sms')}
            >
              <Ionicons name="chatbubble" size={24} color="#fff" />
              <Text style={styles.shareButtonText}>SMS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.shareButton, { backgroundColor: '#EA4335' }]}
              onPress={() => handleShare('email')}
            >
              <Ionicons name="mail" size={24} color="#fff" />
              <Text style={styles.shareButtonText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.datePickerModal, { backgroundColor: colors.background }]}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.datePickerButton, { color: colors.gray }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.datePickerTitle, { color: colors.text }]}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => {
                if (day && month && year) {
                  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  setDateOfBirth(formattedDate);
                  setShowDatePicker(false);
                } else {
                  Alert.alert('Error', 'Please select day, month and year');
                }
              }}>
                <Text style={[styles.datePickerButton, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateInputContainer}>
              <View style={styles.dateInputGroup}>
                <Text style={[styles.dateLabel, { color: colors.text }]}>Day</Text>
                <TextInput
                  style={[styles.dateInput, { backgroundColor: colors.lightGray, color: colors.text }]}
                  value={day}
                  onChangeText={(text) => {
                    if (text.length <= 2 && /^\d*$/.test(text)) {
                      const num = parseInt(text);
                      if (text === '' || (num >= 1 && num <= 31)) {
                        setDay(text);
                      }
                    }
                  }}
                  placeholder="DD"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.dateInputGroup}>
                <Text style={[styles.dateLabel, { color: colors.text }]}>Month</Text>
                <TextInput
                  style={[styles.dateInput, { backgroundColor: colors.lightGray, color: colors.text }]}
                  value={month}
                  onChangeText={(text) => {
                    if (text.length <= 2 && /^\d*$/.test(text)) {
                      const num = parseInt(text);
                      if (text === '' || (num >= 1 && num <= 12)) {
                        setMonth(text);
                      }
                    }
                  }}
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.dateInputGroup}>
                <Text style={[styles.dateLabel, { color: colors.text }]}>Year</Text>
                <TextInput
                  style={[styles.dateInput, { backgroundColor: colors.lightGray, color: colors.text }]}
                  value={year}
                  onChangeText={(text) => {
                    if (text.length <= 4 && /^\d*$/.test(text)) {
                      const num = parseInt(text);
                      const currentYear = new Date().getFullYear();
                      if (text === '' || (num >= 1900 && num <= currentYear)) {
                        setYear(text);
                      }
                    }
                  }}
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
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
  referralCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  shareButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    width: '48%',
    marginBottom: 8,
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  dateInputGroup: {
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateInput: {
    width: 60,
    height: 40,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});