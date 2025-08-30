import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
            <Image 
              source={require('../assets/images/jhola-bazar.png')} 
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>Jhola Bazar</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Us</Text>
          <Text style={styles.description}>
            At Jhola Bazar, we believe grocery shopping should be simple, fast, and reliable.
            We are a local grocery delivery service in Samastipur, Bihar, proudly operated under Shree Hari Enterprises.
            {"\n\n"}Our mission is to bring Daily essentials, and household products right to your doorstep, saving you time and effort. Whether it's Packaged foods, or home essentials, we make sure you get them at the best prices with hassle free delivery.
            {"\n\n"}We're more than just a delivery app, we're your neighborhood partner, making everyday shopping easier for families across Samastipur.
            {"\n\n"}✨ Jhola Bazar – Groceries made simple, just a tap away!
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
          <Text style={styles.sectionTitle}>Why Choose Jhola Bazar?</Text>
          <View style={styles.techList}>
            <Text style={styles.techItem}>🛒 Wide range of groceries & essentials</Text>
            <Text style={styles.techItem}>🚚 Fast & reliable home delivery in Samastipur</Text>
            <Text style={styles.techItem}>💰 Affordable prices with great offers</Text>
            <Text style={styles.techItem}>🤝 Trusted service backed by Shree Hari Enterprises</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://jholabazar.com/privacy-policy')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://jholabazar.com/t&c')}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

        </View>



        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ & Care</Text>
          <Text style={styles.copyright}>© 2025 Jhola Bazar</Text>
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
    overflow: 'hidden',
  },
  logoImage: {
    width: 100,
    height: 100,
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