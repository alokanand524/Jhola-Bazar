import { authAPI } from '@/services/api';
import { logout } from '@/store/slices/userSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

const images = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
  'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
];

export default function LoadingScreen() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const handleAppStart = async () => {
      if (isLoggedIn) {
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const accessToken = await AsyncStorage.getItem('authToken');
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          
          // Only refresh if access token is missing or expired
          if (!accessToken && refreshToken) {
            await authAPI.refreshToken(refreshToken);
          }
          router.replace('/(tabs)');
        } catch (error) {
          console.error('Token refresh failed:', error);
          dispatch(logout());
          return;
        }
      }
    };
    
    handleAppStart();

    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Image sliding animation
    const animateImages = () => {
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        slideAnim.setValue(width);
        animateImages();
      });
    };

    if (!isLoggedIn) {
      animateImages();
    }
  }, [isLoggedIn, dispatch]);

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <Image source={{ uri: images[currentImageIndex] }} style={styles.image} />
        </Animated.View>
      </View>

      <View style={styles.loginSection}>
        <View style={styles.loginContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="storefront" size={40} color="#00B761" />
            <Text style={styles.appName}>Jhola Bazar</Text>
          </View>
          
          <Text style={styles.welcomeText}>Welcome to Jhola Bazar</Text>
          <Text style={styles.subtitle}>Khushiyon Ka Jhola Aab Aapke Ghar</Text>
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Ionicons name="phone-portrait" size={20} color="#fff" />
            <Text style={styles.loginButtonText}>Login with Phone</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exploreButton} onPress={handleSkip}>
            <Text style={styles.exploreButtonText}>Explore without login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
  skipText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    flex: 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loginSection: {
    flex: 0.35,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  loginContent: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00B761',
    marginLeft: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B761',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  exploreButton: {
    paddingVertical: 12,
  },
  exploreButtonText: {
    color: '#00B761',
    fontSize: 16,
    fontWeight: '500',
  },
});