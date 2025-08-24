import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logo}>
            <Ionicons name="storefront" size={60} color="#00B761" />
          </View>
          <Text style={styles.appName}>Jhola-Bazar Clone</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the App</Text>
          <Text style={styles.description}>
            This is a clone of the popular grocery delivery app Jhola-Bazar, built with React Native and Expo. 
            It demonstrates modern mobile app development practices including state management, navigation, 
            and user interface design.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Browse products by categories</Text>
            <Text style={styles.featureItem}>• Search and filter products</Text>
            <Text style={styles.featureItem}>• Add items to cart</Text>
            <Text style={styles.featureItem}>• User authentication</Text>
            <Text style={styles.featureItem}>• Order management</Text>
            <Text style={styles.featureItem}>• Address management</Text>
            <Text style={styles.featureItem}>• Payment methods</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology Stack</Text>
          <View style={styles.techList}>
            <Text style={styles.techItem}>• React Native with Expo</Text>
            <Text style={styles.techItem}>• TypeScript</Text>
            <Text style={styles.techItem}>• Redux Toolkit</Text>
            <Text style={styles.techItem}>• Expo Router</Text>
            <Text style={styles.techItem}>• React Native Vector Icons</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://example.com/privacy')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://example.com/terms')}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://example.com/licenses')}
          >
            <Text style={styles.linkText}>Open Source Licenses</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.disclaimer}>
            This is a demo application created for educational purposes. 
            It is not affiliated with or endorsed by Jhola-Bazar or any other company.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ using React Native</Text>
          <Text style={styles.copyright}>© 2024 Jhola-Bazar Clone</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 40,
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f8f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 4,
  },
  techList: {
    marginTop: 8,
  },
  techItem: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 4,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 16,
    color: '#00B761',
  },
  disclaimer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 30,
    marginTop: 16,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 14,
    color: '#999',
  },
});