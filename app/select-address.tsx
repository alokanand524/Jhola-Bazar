import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
}

export default function SelectAddressScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Mock suggestions - replace with actual API call
    if (query.length > 2) {
      setSuggestions([
        { id: '1', name: 'Connaught Place', address: 'Connaught Place, New Delhi, Delhi 110001' },
        { id: '2', name: 'India Gate', address: 'India Gate, New Delhi, Delhi 110003' },
        { id: '3', name: 'Red Fort', address: 'Red Fort, New Delhi, Delhi 110006' },
      ]);
    } else {
      setSuggestions([]);
    }
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    router.back();
  };

  const handleCurrentLocation = () => {
    router.push('/map-picker');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>SELECT DELIVERY ADDRESS</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: colors.lightGray }]}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for area, street name..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <TouchableOpacity 
          style={[styles.currentLocationButton, { backgroundColor: colors.lightGray }]}
          onPress={handleCurrentLocation}
        >
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={[styles.currentLocationText, { color: colors.text }]}>Your Current Location</Text>
        </TouchableOpacity>

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                onPress={() => handleLocationSelect(item)}
              >
                <Ionicons name="location-outline" size={16} color={colors.gray} />
                <View style={styles.suggestionContent}>
                  <Text style={[styles.suggestionName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.suggestionAddress, { color: colors.gray }]}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
  },
});