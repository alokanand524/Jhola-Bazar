import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setSelectedCategory } from '@/store/slices/productsSlice';
import { useTheme } from '@/hooks/useTheme';

export const CategoryList: React.FC = () => {
  const dispatch = useDispatch();
  const { categories, selectedCategory } = useSelector((state: RootState) => state.products);
  const { colors } = useTheme();

  const handleCategoryPress = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              { backgroundColor: colors.lightGray },
              selectedCategory === category && { backgroundColor: colors.primary }
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <Text style={[
              styles.categoryText,
              { color: colors.gray },
              selectedCategory === category && { color: '#fff' }
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
});