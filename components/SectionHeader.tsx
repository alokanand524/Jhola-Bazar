import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface SectionHeaderProps {
  title: string;
  categoryName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, categoryName }) => {
  const handleSeeAll = () => {
    if (categoryName) {
      router.push(`/category/${encodeURIComponent(categoryName)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
        <Text style={styles.seeAllText}>See all</Text>
        <Ionicons name="chevron-forward" size={16} color="#00B761" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#00B761',
    fontWeight: '600',
  },
});