import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deliveryAPI } from '@/services/api';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  deliveryTime?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LOCATION_STORAGE_KEY = 'user_location';

  const sendLocationToBackend = async (locationData: LocationData) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://jholabazar.onrender.com/api/v1/user/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Failed to send location to backend:', error);
    }
  };

  const getDeliveryTime = async (latitude: number, longitude: number) => {
    try {
      const response = await deliveryAPI.getStoreDeliveryTime(
        latitude.toString(),
        longitude.toString()
      );
      return response.deliveryTime || '10 mins';
    } catch (error) {
      console.error('Failed to get delivery time:', error);
      return '10 mins';
    }
  };

  const getCurrentLocation = async (retryCount = 0) => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      // Get location with timeout
      const currentLocation = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          maximumAge: 300000, // 5 minutes
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Location timeout')), 10000)
        )
      ]);
      
      const { latitude, longitude } = currentLocation.coords;

      // Reverse geocode with timeout and fallback
      let address = 'Current Location';
      try {
        const reverseGeocodePromise = Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Geocoding timeout')), 5000)
        );
        
        const addressResult = await Promise.race([reverseGeocodePromise, timeoutPromise]);
        
        if (addressResult && addressResult.length > 0) {
          const addr = addressResult[0];
          address = `${addr.name || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
        }
      } catch (geocodeError) {
        console.log('Geocoding failed, using coordinates:', geocodeError);
        address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }

      // Get delivery time with fallback
      let deliveryTime = '10 mins';
      try {
        deliveryTime = await getDeliveryTime(latitude, longitude);
      } catch (deliveryError) {
        console.log('Delivery time fetch failed, using default');
      }
      
      const locationData: LocationData = {
        latitude,
        longitude,
        address,
        deliveryTime,
      };

      setLocation(locationData);
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
      
      // Send to backend without blocking UI
      sendLocationToBackend(locationData).catch(err => 
        console.log('Backend location update failed:', err)
      );
      
    } catch (error) {
      console.error('Location error:', error);
      
      // Retry logic
      if (retryCount < 2) {
        console.log(`Retrying location fetch (${retryCount + 1}/2)`);
        setTimeout(() => getCurrentLocation(retryCount + 1), 2000);
        return;
      }
      
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initLocation = async () => {
      try {
        const storedLocation = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
        if (storedLocation) {
          setLocation(JSON.parse(storedLocation));
          setLoading(false);
        } else {
          await getCurrentLocation();
        }
      } catch (error) {
        console.error('Error loading stored location:', error);
        await getCurrentLocation();
      }
    };

    initLocation();
  }, []);

  return {
    location,
    loading,
    error,
    refreshLocation: getCurrentLocation,
  };
};