import { ProductCard } from '@/components/ProductCard';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchResultsScreen() {
  const { colors } = useTheme();
  const { query } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState(query as string || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://jholabazar.onrender.com/api/v1/products/search?q=${encodeURIComponent(searchTerm)}`);
      const result = await response.json();
      
      if (result.success && result.data?.results) {
        const transformedProducts = result.data.results.map((product: any) => ({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.variants?.[0]?.price?.sellingPrice || '0',
          originalPrice: product.variants?.[0]?.price?.basePrice || '0',
          category: 'Search Result',
          description: product.variants?.[0]?.description || '',
          unit: `${product.variants?.[0]?.weight || '1'} ${product.variants?.[0]?.baseUnit || 'unit'}`,
          inStock: product.variants?.[0]?.inventory?.inStock || false,
          rating: 4.5,
          deliveryTime: '10 mins',
          variants: product.variants
        }));
        setSearchResults(transformedProducts);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchProducts(searchQuery);
    }
  }, []);

  const handleSearch = () => {
    searchProducts(searchQuery);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.lightGray }]}>
        <Ionicons name="search" size={20} color={colors.gray} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for products (e.g., Atta)"
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.loadingText, { color: colors.gray }]}>Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <>
            <Text style={[styles.resultsCount, { color: colors.text }]}>
              {searchResults.length} results found for "{searchQuery}"
            </Text>
            <FlatList
              data={searchResults}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : searchQuery ? (
          <View style={styles.centerContainer}>
            <Ionicons name="search" size={48} color={colors.gray} />
            <Text style={[styles.noResultsText, { color: colors.gray }]}>No products found for "{searchQuery}"</Text>
            <Text style={[styles.noResultsSubtext, { color: colors.gray }]}>Try searching with different keywords</Text>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Ionicons name="search" size={48} color={colors.gray} />
            <Text style={[styles.emptyText, { color: colors.gray }]}>Search for your favorite products</Text>
            <Text style={[styles.emptySubtext, { color: colors.gray }]}>Try searching for "Atta", "Rice", "Oil", etc.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});