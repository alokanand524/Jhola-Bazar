import { setUser } from '@/store/slices/userSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Clipboard, Linking, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';

export default function EditProfileScreen() {
  const dispatch = useDispatch();
  const { name, phone } = useSelector((state: RootState) => state.user);
  const { colors } = useTheme();
  
  const [editedName, setEditedName] = useState(name || '');
  const [referralCode] = useState(`JB${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const referralLink = `https://jhola-bazar.app/ref/${referralCode}`;

  const handleSave = () => {
    if (editedName.trim()) {
      dispatch(setUser({ name: editedName.trim(), phone }));
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } else {
      Alert.alert('Error', 'Please enter a valid name');
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

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
              placeholderTextColor={colors.gray}
            />
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
      </View>
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
});