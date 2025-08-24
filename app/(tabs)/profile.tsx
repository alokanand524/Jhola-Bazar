import { logout } from '@/store/slices/userSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { hideTabBar } from './_layout';

const menuItems = [
  { id: '1', title: 'My Orders', icon: 'bag-outline', screen: 'orders' },
  { id: '2', title: 'Addresses', icon: 'location-outline', screen: 'addresses' },
  { id: '3', title: 'Payment Methods', icon: 'card-outline', screen: 'payments' },
  { id: '4', title: 'Help & Support', icon: 'help-circle-outline', screen: 'support' },
  { id: '5', title: 'About', icon: 'information-circle-outline', screen: 'about' },
];

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { name, phone, isLoggedIn } = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        style={styles.content}
        onScroll={hideTabBar}
        scrollEventThrottle={16}
      >
        {isLoggedIn ? (
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#00B761" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{name || 'User'}</Text>
              <Text style={styles.userPhone}>{phone || '+91 XXXXXXXXXX'}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="pencil" size={20} color="#00B761" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.loginPrompt} onPress={handleLogin}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
            <View style={styles.loginText}>
              <Text style={styles.loginTitle}>Login to your account</Text>
              <Text style={styles.loginSubtitle}>Access your orders and preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        )}

        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem}
              onPress={() => router.push(`/${item.screen}` as any)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color="#666" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {isLoggedIn && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Jhola-Bazar  v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    margin: 16,
    borderRadius: 12,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    margin: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    padding: 8,
  },
  loginText: {
    flex: 1,
  },
  loginTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 12,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    padding: 16,
  },
  appVersion: {
    fontSize: 12,
    color: '#999',
  },
});