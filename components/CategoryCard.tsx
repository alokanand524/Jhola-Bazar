import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selectedCard]}
      onPress={() => onPress(category)}
    >
      <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
        <Ionicons
          name={categoryIcons[category] as any || 'grid'}
          size={24}
          color={isSelected ? '#fff' : '#00B761'}
        />
      </View>
      <Text style={[styles.categoryName, isSelected && styles.selectedText]}>
        {category}
      </Text>
      <Text style={[styles.itemCount, isSelected && styles.selectedText]}>
        {itemCount} items
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 100,
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: '#00B761',
    borderColor: '#00B761',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
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
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  selectedText: {
    color: '#fff',
  },
});