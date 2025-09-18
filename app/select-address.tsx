import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

interface SavedLocation {
  id: string;
  locality: string;
  district: string;
  pincode: string;
  fullAddress: string;
  timestamp: string;
}

export default function SelectAddressScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  React.useEffect(() => {
    loadSavedLocations();
    loadSavedAddresses();
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      loadSavedLocations();
      loadSavedAddresses();
    }, [])
  );
  
  const loadSavedAddresses = async () => {
    try {
      const { addressAPI } = require('@/services/api');
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
        setSavedAddresses(transformedAddresses);
      }
    } catch (error) {
      console.log('Error loading saved addresses:', error);
      setSavedAddresses([]);
    }
  };
  
  const loadSavedLocations = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const locations = await AsyncStorage.getItem('savedLocations');
      if (locations) {
        setSavedLocations(JSON.parse(locations));
      }
    } catch (error) {
      console.log('Error loading locations:', error);
    }
  };
  
  const deleteSavedLocation = async (id: string) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const updatedLocations = savedLocations.filter(loc => loc.id !== id);
      setSavedLocations(updatedLocations);
      await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
    } catch (error) {
      console.log('Error deleting location:', error);
    }
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      
      const searchResults = data.map((item: any, index: number) => ({
        id: `search-${index}`,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
      
      setSuggestions(searchResults);
    } catch (error) {
      console.log('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  };

  const handleLocationSelect = async (location: LocationSuggestion) => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const selectedAddress = {
        name: location.name,
        address: location.address,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem('selectedDeliveryAddress', JSON.stringify(selectedAddress));
    } catch (error) {
      console.log('Error saving selected address:', error);
    }
    router.back();
  };

  const handleCurrentLocation = () => {
    router.push('/map-picker');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>SELECT DELIVERY ADDRESS</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: colors.lightGray }]}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for area, street name..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <TouchableOpacity 
          style={[styles.currentLocationButton, { backgroundColor: colors.lightGray }]}
          onPress={handleCurrentLocation}
        >
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={[styles.currentLocationText, { color: colors.text }]}>Your Current Location</Text>
        </TouchableOpacity>

        {savedAddresses.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Saved Addresses</Text>
              <TouchableOpacity onPress={() => router.push('/add-address')}>
                <Text style={[styles.addAddressText, { color: colors.primary }]}>+ Add Address</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={savedAddresses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.suggestionItem, { borderBottomColor: colors.border, backgroundColor: colors.lightGray, borderRadius: 10, marginBottom: 8 }]}
                  onPress={() => handleLocationSelect({ 
                    id: item.id, 
                    name: item.type.charAt(0).toUpperCase() + item.type.slice(1), 
                    address: `${item.landmark ? item.landmark + ', ' : ''}${item.pincode ? item.pincode.city + ', ' + item.pincode.code : ''}` 
                  })}
                >
                  <Ionicons name={item.type === 'home' ? 'home' : item.type === 'office' ? 'business' : 'location'} size={16} color={colors.primary} />
                  <View style={styles.suggestionContent}>
                    <Text style={[styles.suggestionName, { color: colors.text }]}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
                    <Text style={[styles.suggestionAddress, { color: colors.gray }]}>
                      {item.landmark ? item.landmark + ', ' : ''}{item.pincode ? item.pincode.city + ', ' + item.pincode.code : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {savedLocations.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Locations</Text>
            <FlatList
              data={savedLocations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.savedLocationItem, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity
                    style={styles.locationContent}
                    onPress={() => handleLocationSelect({ id: item.id, name: item.locality, address: item.fullAddress })}
                  >
                    <Ionicons name="location" size={16} color={colors.primary} />
                    <View style={styles.suggestionContent}>
                      <Text style={[styles.suggestionName, { color: colors.text }]}>{item.locality}</Text>
                      <Text style={[styles.suggestionAddress, { color: colors.gray }]}>{item.fullAddress}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteSavedLocation(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.gray} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {isSearching && searchQuery.length > 2 && (
          <View style={styles.searchingContainer}>
            <Text style={[styles.searchingText, { color: colors.gray }]}>Searching...</Text>
          </View>
        )}

        {suggestions.length > 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Search Results</Text>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleLocationSelect(item)}
                >
                  <Ionicons name="search" size={16} color={colors.primary} />
                  <View style={styles.suggestionContent}>
                    <Text style={[styles.suggestionName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.suggestionAddress, { color: colors.gray }]}>{item.address}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  savedLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  searchingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  searchingText: {
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '600',
  },
});