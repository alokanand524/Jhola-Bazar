import EnterMoreDetailsModal from '@/components/EnterMoreDetailsModal';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

interface LocationData {
  latitude: number;
  longitude: number;
  locality: string;
  district: string;
  pincode: string;
}

export default function MapPickerScreen() {
  const { colors } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);

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
      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setCurrentLocation(newLocation);
      
      // Update selected location immediately with current location
      const locationData = await reverseGeocode(newLocation.lat, newLocation.lng);
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
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`,
        { headers: { 'User-Agent': 'JholaBazar/1.0' } }
      );
      const data = await response.json();
      setSearchResults(data.map((item: any, index: number) => ({
        id: index,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      })));
    } catch (error) {
      console.log('Search error:', error);
      setSearchResults([]);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchLocations(query);
  };

  const handleSearchResultSelect = async (location: any) => {
    const locationData = await reverseGeocode(location.latitude, location.longitude);
    if (locationData) {
      setSelectedLocation(locationData);
    }
    setSearchQuery(location.name);
    setSearchResults([]);
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

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100%; }
        .center-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -100%);
          z-index: 1000;
          font-size: 30px;
          color: #00B761;
        }
        .current-location-btn {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 50px;
          background: white;
          border-radius: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
        }
        .user-location {
          width: 16px;
          height: 16px;
          background: #4285F4;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(66, 133, 244, 0.9), 0 0 40px rgba(66, 133, 244, 0.6), 0 0 60px rgba(173, 216, 255, 0.4);
          position: relative;
        }
        .user-location::before {
          content: '';
          position: absolute;
          top: -12px;
          left: -12px;
          width: 36px;
          height: 36px;
          border: 2px solid rgba(173, 216, 255, 0.4);
          border-radius: 50%;
          animation: ripple 2s infinite;
        }

        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .leaflet-control-attribution {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="center-marker">📍</div>
      <div class="current-location-btn" onclick="goToCurrentLocation()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="#666"/>
        </svg>
        &nbsp; Current Location
      </div>
      
      <script>
        var map = L.map('map', {
          zoomControl: false
        }).setView([${currentLocation.lat}, ${currentLocation.lng}], 16);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ''
        }).addTo(map);

        var currentLocationMarker = L.divIcon({
          html: '<div class="user-location"></div>',
          className: 'custom-div-icon',
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        
        var userMarker = L.marker([${currentLocation.lat}, ${currentLocation.lng}], {
          icon: currentLocationMarker
        }).addTo(map);

        function goToCurrentLocation() {
          map.flyTo([${currentLocation.lat}, ${currentLocation.lng}], 16, {
            animate: true,
            duration: 1.5
          });
          userMarker.setLatLng([${currentLocation.lat}, ${currentLocation.lng}]);
        }

        var debounceTimer;
        map.on('move', function() {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(function() {
            var center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'locationChanged',
              latitude: center.lat,
              longitude: center.lng
            }));
          }, 300);
        });

        navigator.geolocation.getCurrentPosition(function(position) {
          var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          userMarker.setLatLng([lat, lng]);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'currentLocationUpdated',
            latitude: lat,
            longitude: lng
          }));
        });
      </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationChanged') {
        const locationData = await reverseGeocode(data.latitude, data.longitude);
        if (locationData) {
          setSelectedLocation(locationData);
        }
      } else if (data.type === 'currentLocationUpdated') {
        setCurrentLocation({
          lat: data.latitude,
          lng: data.longitude
        });
      }
    } catch (error) {
      console.log('Error parsing message:', error);
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
        <WebView
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      {/* Search Box */}
      <View style={[styles.searchBoxContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.lightGray }]}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for area, street name..."
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

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={[styles.searchResultsContainer, { backgroundColor: colors.background }]}>
          <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
            {searchResults.map((item) => (
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
            ))}
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
  },
  map: {
    flex: 1,
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