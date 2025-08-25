import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface SectionHeaderProps {
  title: string;
  categoryName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, categoryName }) => {
  const { colors } = useTheme();
  
  const handleSeeAll = () => {
    if (categoryName) {
      router.push(`/category/${encodeURIComponent(categoryName)}`);
    }
  };

  // side arrow icon 
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
        <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
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
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});