import EnterMoreDetailsModal from '@/components/EnterMoreDetailsModal';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LocationData {
  latitude: number;
  longitude: number;
  locality: string;
  district: string;
  pincode: string;
}

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function MapPickerScreen() {
  const { colors } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const mapRef = useRef<MapView>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      
      const locationData = await reverseGeocode(location.coords.latitude, location.coords.longitude);
      if (locationData) {
        setSelectedLocation(locationData);
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (result.length > 0) {
        const address = result[0];
        return {
          latitude: lat,
          longitude: lng,
          locality: address.district || address.city || address.subregion || '',
          district: address.city || address.region || '',
          pincode: address.postalCode || '',
        };
      }
    } catch (error) {
      console.log('Reverse geocoding error:', error);
    }
    return null;
  };

  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      console.log('Google Maps API key not found');
      setSearchResults([]);
      return;
    }

    try {
      // Use Google Places Autocomplete API for better results
      const autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}&components=country:in&location=${region.latitude},${region.longitude}&radius=50000&types=establishment|geocode`;
      
      const response = await fetch(autocompleteUrl);
      const data = await response.json();
      
      if (data.status === 'OK' && data.predictions && data.predictions.length > 0) {
        // Get place details for each prediction to get coordinates
        const results = await Promise.all(
          data.predictions.slice(0, 5).map(async (prediction: any, index: number) => {
            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,name,formatted_address`;
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();
              
              if (detailsData.status === 'OK' && detailsData.result?.geometry?.location) {
                return {
                  id: index,
                  name: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
                  address: prediction.description,
                  latitude: detailsData.result.geometry.location.lat,
                  longitude: detailsData.result.geometry.location.lng,
                };
              }
            } catch (error) {
              console.log('Place details error:', error);
            }
            return null;
          })
        );
        
        const validResults = results.filter(Boolean);
        setSearchResults(validResults);
      } else {
        console.log('Google Places API error:', data.status, data.error_message);
        setSearchResults([]);
      }
    } catch (error) {
      console.log('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleSearch = (query: string) => {
    console.log('🔎 handleSearch called with:', query);
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Timeout triggered, calling searchLocations');
      searchLocations(query);
    }, 300);
  };

  const handleSearchResultSelect = async (location: any) => {
    const newRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
    
    const locationData = await reverseGeocode(location.latitude, location.longitude);
    if (locationData) {
      setSelectedLocation(locationData);
    }
    
    setSearchQuery(location.name);
    setSearchResults([]);
  };

  const handleRegionChange = async (newRegion: Region) => {
    setRegion(newRegion);
    const locationData = await reverseGeocode(newRegion.latitude, newRegion.longitude);
    if (locationData) {
      setSelectedLocation(locationData);
    }
  };

  const handleLocationSelect = () => {
    if (selectedLocation) {
      setShowAddressModal(true);
    }
  };

  const handleAddressSubmit = async (details: any) => {
    if (selectedLocation) {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const existingLocations = await AsyncStorage.getItem('savedLocations');
        const locations = existingLocations ? JSON.parse(existingLocations) : [];
        
        const newLocation = {
          id: Date.now().toString(),
          locality: selectedLocation.locality,
          district: selectedLocation.district,
          pincode: selectedLocation.pincode,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          fullAddress: `${selectedLocation.locality}, ${selectedLocation.district}, ${selectedLocation.pincode}`,
          timestamp: new Date().toISOString(),
          customerDetails: details
        };
        
        locations.unshift(newLocation);
        await AsyncStorage.setItem('savedLocations', JSON.stringify(locations));
        router.back();
      } catch (error) {
        console.log('Error saving location:', error);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Select Location</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={handleRegionChange}
          showsUserLocation={true}
          showsMyLocationButton={false}
        />
        
        <View style={styles.centerMarker}>
          <Ionicons name="location" size={30} color={colors.primary} />
        </View>
        
        <TouchableOpacity 
          style={[styles.currentLocationBtn, { backgroundColor: colors.background }]}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={20} color={colors.primary} />
          <Text style={[styles.currentLocationText, { color: colors.text }]}>Current Location</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchBoxContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.lightGray }]}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search or enter shop/building name..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}>
              <Ionicons name="close-circle" size={20} color={colors.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Debug: Always show this to test */}
      {searchQuery.length > 0 && (
        <View style={[styles.searchResultsContainer, { backgroundColor: colors.background }]}>
          <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.resultItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSearchResultSelect(item)}
                >
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <View style={styles.resultContent}>
                    <Text style={[styles.resultName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.resultAddress, { color: colors.gray }]}>{item.address}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity 
                style={[styles.resultItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  // Use current map center as location for manual entry
                  const manualLocation = {
                    id: 0,
                    name: searchQuery,
                    address: `${searchQuery}, Near ${selectedLocation?.locality || 'Current Location'}`,
                    latitude: region.latitude,
                    longitude: region.longitude,
                  };
                  handleSearchResultSelect(manualLocation);
                }}
              >
                <Ionicons name="add-circle" size={16} color={colors.primary} />
                <View style={styles.resultContent}>
                  <Text style={[styles.resultName, { color: colors.primary }]}>Use "{searchQuery}" at current location</Text>
                  <Text style={[styles.resultAddress, { color: colors.gray }]}>Tap to set this location manually</Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      <View style={[styles.locationInfo, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.locationDetails}>
          <Text style={[styles.locationTitle, { color: colors.text }]}>Deliver to</Text>
          {selectedLocation ? (
            <Text style={[styles.locationText, { color: colors.text }]}>
              {selectedLocation.locality && `${selectedLocation.locality}, `}
              {selectedLocation.district && `${selectedLocation.district}, `}
              {selectedLocation.pincode && selectedLocation.pincode}
            </Text>
          ) : (
            <Text style={[styles.locationText, { color: colors.gray }]}>Loading location...</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: selectedLocation ? colors.primary : colors.gray }]}
          onPress={handleLocationSelect}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Add Address</Text>
        </TouchableOpacity>
      </View>

      <EnterMoreDetailsModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddressSubmit}
        selectedLocation={selectedLocation}
      />
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -30,
    zIndex: 1000,
  },
  currentLocationBtn: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  searchBoxContainer: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 190,
    left: 16,
    right: 16,
    zIndex: 999,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 350,
  },
  searchResults: {
    borderRadius: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  resultContent: {
    marginLeft: 12,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultAddress: {
    fontSize: 14,
  },
  locationInfo: {
    padding: 16,
    borderTopWidth: 1,
  },
  locationDetails: {
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 2,
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});