import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CategoryCardProps {
  category: string;
  isSelected: boolean;
  onPress: (category: string) => void;
  itemCount: number;
}

const categoryIcons: { [key: string]: string } = {
  'Vegetables': 'leaf',
  'Fruits': 'nutrition',
  'Dairy': 'water',
  'Snacks': 'fast-food',
  'Beverages': 'wine',
  'Personal Care': 'heart',
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected,
  onPress,
  itemCount,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { backgroundColor: colors.background, borderColor: colors.border },
        isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
      onPress={() => onPress(category)}
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: colors.lightGray },
        isSelected && styles.selectedIconContainer
      ]}>
        <Ionicons
          name={categoryIcons[category] as any || 'grid'}
          size={24}
          color={isSelected ? '#fff' : colors.primary}
        />
      </View>
      <Text style={[
        styles.categoryName, 
        { color: colors.text },
        isSelected && { color: '#fff' }
      ]}>
        {category}
      </Text>
      <Text style={[
        styles.itemCount, 
        { color: colors.gray },
        isSelected && { color: '#fff' }
      ]}>
        {itemCount} items
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 10,
    textAlign: 'center',
  },
});