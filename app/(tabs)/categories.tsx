import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams } from 'expo-router';
import { RootState } from '@/store/store';
import { setSelectedCategory } from '@/store/slices/productsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { hideTabBar } from './_layout';
import { useTheme } from '@/hooks/useTheme';



export default function CategoriesScreen() {
  const dispatch = useDispatch();
  const { filter } = useLocalSearchParams();
  const { products, selectedCategory } = useSelector((state: RootState) => state.products);
  const { categories, loading } = useSelector((state: RootState) => state.categories);
  const { colors } = useTheme();

  useEffect(() => {
    dispatch(fetchCategories());
    if (filter && typeof filter === 'string') {
      dispatch(setSelectedCategory(filter));
    }
  }, [dispatch, filter]);



  const handleCategoryPress = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  const getCategoryCount = (categoryName: string) => {
    return products.filter(product => product.category === categoryName).length;
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Categories</Text>
      </View>

      <ScrollView 
        style={styles.content}
        onScroll={hideTabBar}
        scrollEventThrottle={16}
      >
        <FlatList
          data={Array.isArray(categories) ? categories : []}
          renderItem={({ item }) => (
            <CategoryCard
              category={item.name}
              image={item.image}
              isSelected={selectedCategory === item.name}
              onPress={handleCategoryPress}
              itemCount={getCategoryCount(item.name)}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={styles.categoriesGrid}
        />
        
        {selectedCategory !== 'All' && filteredProducts.length > 0 && (
          <View style={styles.productsSection}>
            <Text style={[styles.productsTitle, { color: colors.text }]}>{selectedCategory} Products</Text>
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
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});