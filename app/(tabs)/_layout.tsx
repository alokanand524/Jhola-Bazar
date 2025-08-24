import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Animated } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';

let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
const tabBarTranslateY = new Animated.Value(0);

export const hideTabBar = () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  Animated.timing(tabBarTranslateY, {
    toValue: 80,
    duration: 200,
    useNativeDriver: true,
  }).start();
  
  scrollTimeout = setTimeout(() => {
    Animated.timing(tabBarTranslateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, 700);
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00B761',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#f4f4f4ff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0ff',
          height: 60,
          paddingBottom: 8,
          position: 'absolute',
          transform: [{ translateY: tabBarTranslateY }],
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
