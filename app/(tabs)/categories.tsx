import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams } from 'expo-router';
import { RootState } from '@/store/store';
import { setSelectedCategory } from '@/store/slices/productsSlice';
import { router } from 'expo-router';
import { ProductCard } from '@/components/ProductCard';

const categoryIcons: { [key: string]: string } = {
  'Vegetables': 'leaf',
  'Fruits': 'nutrition',
  'Dairy': 'water',
  'Snacks': 'fast-food',
  'Beverages': 'wine',
  'Personal Care': 'heart',
};

export default function CategoriesScreen() {
  const dispatch = useDispatch();
  const { filter } = useLocalSearchParams();
  const { categories, products, selectedCategory } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (filter && typeof filter === 'string') {
      dispatch(setSelectedCategory(filter));
    }
  }, [filter]);

  const handleCategoryPress = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  const getCategoryCount = (category: string) => {
    if (category === 'All') return products.length;
    return products.filter(product => product.category === category).length;
  };

  const filteredCategories = categories.filter(cat => cat !== 'All');
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      <ScrollView style={styles.content}>
        <FlatList
          data={filteredCategories}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryCard, selectedCategory === item && styles.selectedCard]}
              onPress={() => handleCategoryPress(item)}
            >
              <View style={styles.categoryIcon}>
                <Ionicons 
                  name={categoryIcons[item] as any || 'grid'} 
                  size={32} 
                  color={selectedCategory === item ? '#fff' : '#00B761'} 
                />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, selectedCategory === item && styles.selectedText]}>{item}</Text>
                <Text style={[styles.categoryCount, selectedCategory === item && styles.selectedText]}>
                  {getCategoryCount(item)} items
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={selectedCategory === item ? '#fff' : '#ccc'} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          scrollEnabled={false}
        />
        
        {selectedCategory !== 'All' && filteredProducts.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={styles.productsTitle}>{selectedCategory} Products</Text>
            <FlatList
              data={filteredProducts}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.row}
            />
          </View>
        )}
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
    padding: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
  },
  selectedCard: {
    backgroundColor: '#00B761',
  },
  selectedText: {
    color: '#fff',
  },
  productsSection: {
    padding: 16,
    marginTop: 20,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});