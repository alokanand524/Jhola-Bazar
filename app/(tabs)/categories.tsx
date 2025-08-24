import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams } from 'expo-router';
import { RootState } from '@/store/store';
import { setSelectedCategory } from '@/store/slices/productsSlice';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { hideTabBar } from './_layout';



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

      <ScrollView 
        style={styles.content}
        onScroll={hideTabBar}
        scrollEventThrottle={16}
      >
        <FlatList
          data={filteredCategories}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              isSelected={selectedCategory === item}
              onPress={handleCategoryPress}
              itemCount={getCategoryCount(item)}
            />
          )}
          keyExtractor={(item) => item}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={styles.categoriesGrid}
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
  categoriesGrid: {
    paddingBottom: 16,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
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