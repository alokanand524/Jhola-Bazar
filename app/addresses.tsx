import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { addressAPI } from '@/services/api';

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  isDefault: boolean;
  fullAddress?: string;
  pincode?: {
    code: string;
    city: string;
    state: string;
    deliveryCharge: string;
  };
}



const AddressCardSkeleton = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.addressCard, { backgroundColor: colors.background }]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <SkeletonLoader width={20} height={20} style={{ marginRight: 8 }} />
          <SkeletonLoader width={60} height={16} style={{ marginRight: 8 }} />
          <SkeletonLoader width={50} height={20} borderRadius={10} />
        </View>
        <View style={styles.actionButtons}>
          <SkeletonLoader width={16} height={16} style={{ marginLeft: 8 }} />
          <SkeletonLoader width={16} height={16} style={{ marginLeft: 8 }} />
        </View>
      </View>
      <SkeletonLoader width="90%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="70%" height={12} style={{ marginBottom: 12 }} />
      <SkeletonLoader width={100} height={24} borderRadius={16} />
    </View>
  );
};

export default function AddressesScreen() {
  const { colors } = useTheme();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAddresses();
      if (response.success && response.data) {
        const transformedAddresses = response.data.map((addr: any) => ({
          id: addr.id,
          type: addr.type,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          landmark: addr.landmark,
          isDefault: addr.isDefault,
          fullAddress: addr.fullAddress,
          pincode: addr.pincode
        }));
        setAddresses(transformedAddresses);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('auth')) {
        router.push('/login');
      } else {
        setAddresses([]);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      fetchAddresses();
    };
    
    checkAuthAndFetch();
  }, []);

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await addressAPI.deleteAddress(id);
              if (response.success) {
                setAddresses(addresses.filter(addr => addr.id !== id));
                Alert.alert('Success', response.message || 'Address deleted successfully');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete address');
              }
            } catch (error) {
              const message = error instanceof ApiError ? error.message : 'Failed to delete address';
              Alert.alert('Error', message);
            }
          }
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return 'home';
      case 'office': return 'business';
      default: return 'location';
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={[styles.addressCard, { backgroundColor: colors.background }]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          <Ionicons name={getAddressIcon(item.type) as any} size={20} color={colors.primary} />
          <Text style={[styles.addressType, { color: colors.text }]}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
          {item.isDefault && (
            <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`/edit-address/${item.id}` as any)}
          >
            <Ionicons name="pencil" size={16} color={colors.gray} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(item.id)}
          >
            <Ionicons name="trash" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.addressText, { color: colors.text }]}>
        {item.fullAddress || `${item.addressLine1}${item.addressLine2 ? ', ' + item.addressLine2 : ''}`}
      </Text>
      {item.landmark && (
        <Text style={[styles.landmarkText, { color: colors.gray }]}>Landmark: {item.landmark}</Text>
      )}
      {item.pincode && (
        <Text style={[styles.landmarkText, { color: colors.gray }]}>
          {item.pincode.city}, {item.pincode.state} - {item.pincode.code}
        </Text>
      )}

      {!item.isDefault && (
        <TouchableOpacity 
          style={[styles.setDefaultButton, { borderColor: colors.primary }]}
          onPress={() => handleSetDefault(item.id)}
        >
          <Text style={[styles.setDefaultText, { color: colors.primary }]}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <SkeletonLoader width={24} height={24} />
          <SkeletonLoader width={120} height={18} style={{ marginLeft: 16 }} />
        </View>
        <View style={styles.addressesList}>
          {[1, 2, 3].map((item) => (
            <AddressCardSkeleton key={item} />
          ))}
        </View>
        <View style={{ margin: 16 }}>
          <SkeletonLoader width="100%" height={48} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Addresses</Text>
      </View>

      {addresses.length > 0 ? (
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.addressesList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={80} color={colors.gray} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Addresses</Text>
          <Text style={[styles.emptySubtitle, { color: colors.gray }]}>Add your delivery addresses</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/add-address' as any)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Address</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  addressesList: {
    padding: 16,
  },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  landmarkText: {
    fontSize: 12,
    marginBottom: 12,
  },
  setDefaultButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  setDefaultText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});