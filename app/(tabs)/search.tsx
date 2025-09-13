import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { behaviorTracker } from '@/services/behaviorTracker';
import { RootState } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { hideTabBar } from './_layout';
import { useTheme } from '@/hooks/useTheme';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { products } = useSelector((state: RootState) => state.products);
  const { colors } = useTheme();

  const [apiResults, setApiResults] = React.useState([]);
  const [isApiSearching, setIsApiSearching] = React.useState(false);

  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setApiResults([]);
      return;
    }

    setIsApiSearching(true);
    try {
      const response = await fetch(`https://jholabazar.onrender.com/api/v1/products/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success && data.data?.products) {
        const transformedProducts = data.data.products.map(product => ({
          id: product.id,
          name: product.name,
          image: product.images?.[0] || '',
          price: product.variants?.[0]?.price?.sellingPrice || '0',
          originalPrice: product.variants?.[0]?.price?.basePrice || '0',
          category: product.category?.name || 'General',
          description: product.description || '',
          unit: `${product.variants?.[0]?.weight || '1'} ${product.variants?.[0]?.baseUnit || 'unit'}`,
          inStock: product.variants?.[0]?.stock?.status === 'AVAILABLE',
          rating: 4.5,
          deliveryTime: '10 mins'
        }));
        setApiResults(transformedProducts);
      } else {
        setApiResults([]);
      }
    } catch (error) {
      console.error('Search API error:', error);
      setApiResults([]);
    } finally {
      setIsApiSearching(false);
    }
  };

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        behaviorTracker.trackSearch(searchQuery.trim());
        searchProducts(searchQuery.trim());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredProducts = apiResults.length > 0 ? apiResults : 
    products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const [searchSuggestions, setSearchSuggestions] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSearchSuggestions(behaviorTracker.getSearchSuggestions());
  }, []);

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
      </View>

      {searchQuery.trim() === '' && searchSuggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Recent Searches</Text>
          {searchSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => setSearchQuery(suggestion)}
            >
              <Ionicons name="time-outline" size={16} color={colors.gray} />
              <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.content}>
        {searchQuery.length > 0 && (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.gray} 
            onPress={() => setSearchQuery('')}
          />
        )}

        {searchQuery.trim() === '' ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={colors.gray} />
            <Text style={[styles.emptyStateText, { color: colors.gray }]}>Start typing to search products</Text>
          </View>
        ) : (isSearching || isApiSearching) ? (
          <View style={styles.row}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
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
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 14,
    marginLeft: 8,
  },
});