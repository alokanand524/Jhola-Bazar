import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Animated } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';

let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
const tabBarTranslateY = new Animated.Value(0);
let lastScrollY = 0;

export const handleTabBarScroll = (event: any) => {
  const currentScrollY = event.nativeEvent.contentOffset.y;
  const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
  
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  if (scrollDirection === 'down' && currentScrollY > 50) {
    // Hide when scrolling down
    Animated.timing(tabBarTranslateY, {
      toValue: 80,
      duration: 150,
      useNativeDriver: true,
    }).start();
  } else if (scrollDirection === 'up') {
    // Show when scrolling up
    Animated.timing(tabBarTranslateY, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }
  
  // Show when scroll stops
  scrollTimeout = setTimeout(() => {
    Animated.timing(tabBarTranslateY, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, 400);
  
  lastScrollY = currentScrollY;
};

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 16,
        },
      }}>

        {/* Home Tab - Bottom Navigation Bar List */}
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
      {/* <Tabs.Screen
        name="Chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
