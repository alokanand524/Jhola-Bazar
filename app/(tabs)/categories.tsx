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
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
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
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Categories</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Loading Categories...</Text>
            <View style={styles.categoriesGrid}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <ProductCardSkeleton key={item} />
              ))}
            </View>
          </View>
        </ScrollView>
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
        {/* Grocery & Kitchen Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Grocery & Kitchen</Text>
          <FlatList
            data={Array.isArray(categories) ? categories.slice(0, 6) : []}
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
        </View>

        {/* Beverages & Snacks Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Beverages & Snacks</Text>
          <FlatList
            data={Array.isArray(categories) ? categories.slice(6, 12) : []}
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
        </View>

        {/* Personal Care Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Care</Text>
          <FlatList
            data={Array.isArray(categories) ? categories.slice(12, 18) : []}
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
        </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesGrid: {
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  categoryRow: {
    justifyContent: 'space-around',
    marginBottom: 8,
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
});