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
      });
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

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      const [addressResult] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = `${addressResult.name || ''}, ${addressResult.city || ''}, ${addressResult.region || ''}`.trim();

      const deliveryTime = await getDeliveryTime(latitude, longitude);
      
      const locationData: LocationData = {
        latitude,
        longitude,
        address,
        deliveryTime,
      };

      setLocation(locationData);
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
      await sendLocationToBackend(locationData);
      
    } catch (error) {
      setError('Failed to get location');
      console.error('Location error:', error);
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