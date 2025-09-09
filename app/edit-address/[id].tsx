import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { addressService, Address, Pincode } from '@/services/addressService';

export default function EditAddressScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<Address | null>(null);
  const [pincodes, setPincodes] = useState<Pincode[]>([]);
  
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [selectedType, setSelectedType] = useState<'home' | 'office' | 'other'>('home');

  useEffect(() => {
    fetchAddress();
    fetchPincodes();
  }, []);

  const fetchAddress = async () => {
    try {
      const addresses = await addressService.getAddresses();
      const foundAddress = addresses.find(addr => addr.id === id);
      if (foundAddress) {
        setAddress(foundAddress);
        setAddressLine1(foundAddress.addressLine1);
        setAddressLine2(foundAddress.addressLine2 || '');
        setLandmark(foundAddress.landmark || '');
        setSelectedPincode(foundAddress.pincodeId);
        setSelectedType(foundAddress.type);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load address');
    }
  };

  const fetchPincodes = async () => {
    try {
      const pincodeList = await addressService.getPincodes();
      setPincodes(pincodeList);
    } catch (error) {
      console.log('Error fetching pincodes:', error);
    }
  };

  const handleUpdate = async () => {
    if (!addressLine1.trim()) {
      Alert.alert('Error', 'Please fill in address line 1');
      return;
    }

    if (!selectedPincode) {
      Alert.alert('Error', 'Please select a pincode');
      return;
    }

    setIsLoading(true);
    try {
      await addressService.updateAddress(id as string, {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        landmark: landmark.trim() || undefined,
        pincodeId: selectedPincode,
        type: selectedType,
      });
      
      Alert.alert('Success', 'Address updated successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to update address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Address</Text>
        <TouchableOpacity onPress={handleUpdate} disabled={isLoading}>
          <Text style={[styles.saveText, { color: colors.primary }]}>
            {isLoading ? 'Updating...' : 'Update'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Address Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Address Line 1 *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={addressLine1}
              onChangeText={setAddressLine1}
              placeholder="House/Flat/Office No, Building Name"
              placeholderTextColor={colors.gray}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Address Line 2</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={addressLine2}
              onChangeText={setAddressLine2}
              placeholder="Street, Area, Colony (Optional)"
              placeholderTextColor={colors.gray}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Landmark</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Nearby landmark (Optional)"
              placeholderTextColor={colors.gray}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Pincode *</Text>
            <View style={styles.pincodeContainer}>
              {pincodes.slice(0, 5).map((pincode) => (
                <TouchableOpacity
                  key={pincode.id}
                  style={[
                    styles.pincodeOption,
                    { borderColor: colors.border },
                    selectedPincode === pincode.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setSelectedPincode(pincode.id)}
                >
                  <Text style={[
                    styles.pincodeText,
                    { color: colors.text },
                    selectedPincode === pincode.id && { color: '#fff' }
                  ]}>
                    {pincode.pincode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Address Type *</Text>
            <View style={styles.typeContainer}>
              {[
                { key: 'home', label: 'Home', icon: 'home' },
                { key: 'office', label: 'Office', icon: 'business' },
                { key: 'other', label: 'Other', icon: 'location' }
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeOption,
                    { borderColor: colors.border },
                    selectedType === type.key && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}
                  onPress={() => setSelectedType(type.key as any)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={20} 
                    color={selectedType === type.key ? '#fff' : colors.gray} 
                  />
                  <Text style={[
                    styles.typeText,
                    { color: colors.text },
                    selectedType === type.key && { color: '#fff' }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
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
    minHeight: 44,
  },
  pincodeContainer: {
    gap: 8,
  },
  pincodeOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pincodeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});