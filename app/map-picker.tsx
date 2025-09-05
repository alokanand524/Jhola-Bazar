import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

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
      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
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
          locality: address.subregion || address.city || '',
          district: address.region || '',
          pincode: address.postalCode || '',
        };
      }
    } catch (error) {
      console.log('Reverse geocoding error:', error);
    }
    return null;
  };

  const handleLocationSelect = async () => {
    if (selectedLocation) {
      // Save location and navigate back
      router.back();
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
      </style>
    </head>
    <body>
      <div id="map"></div>
      <div class="center-marker">📍</div>
      
      <script>
        var map = L.map('map').setView([${currentLocation.lat}, ${currentLocation.lng}], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        map.on('moveend', function() {
          var center = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationChanged',
            latitude: center.lat,
            longitude: center.lng
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

      {selectedLocation && (
        <View style={[styles.locationInfo, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={styles.locationDetails}>
            <Text style={[styles.locationTitle, { color: colors.text }]}>Selected Location</Text>
            <Text style={[styles.locationText, { color: colors.gray }]}>
              {selectedLocation.locality}, {selectedLocation.district}
            </Text>
            {selectedLocation.pincode && (
              <Text style={[styles.locationText, { color: colors.gray }]}>
                Pincode: {selectedLocation.pincode}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
            onPress={handleLocationSelect}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      )}
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