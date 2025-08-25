import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { hideTabBar } from './_layout';
import { useTheme } from '@/hooks/useTheme';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { products } = useSelector((state: RootState) => state.products);
  const { colors } = useTheme();

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search Products</Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.lightGray }]}>
        <Ionicons name="search" size={20} color={colors.gray} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for products..."
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.gray} 
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>

      <View style={styles.content}>
        {searchQuery.trim() === '' ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={colors.gray} />
            <Text style={[styles.emptyStateText, { color: colors.gray }]}>Start typing to search products</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sad" size={64} color={colors.gray} />
            <Text style={[styles.emptyStateText, { color: colors.gray }]}>No products found</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.gray }]}>Try searching with different keywords</Text>
          </View>
        ) : (
          <>
            <Text style={[styles.resultsText, { color: colors.text }]}>
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
            </Text>
            <FlatList
              data={filteredProducts}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              onScroll={hideTabBar}
              scrollEventThrottle={16}
            />
          </>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});