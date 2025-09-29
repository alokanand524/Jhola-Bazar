import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeaturedProductsScreen() {
  const { colors } = useTheme();
  const [featuredProducts, setFeaturedProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredProducts, setFilteredProducts] = React.useState([]);
  const [isServiceable, setIsServiceable] = React.useState(true);

  React.useEffect(() => {
    fetchFeaturedProducts();
    checkServiceability();
  }, []);
  
  const checkServiceability = async () => {
    try {
      const response = await fetch('https://jholabazar.onrender.com/api/v1/delivery-timing/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: '0d29835f-3840-4d72-a26d-ed96ca744a34',
          latitude: '25.623428',
          longitude: '85.048640'
        })
      });
      
      const result = await response.json();
      setIsServiceable(result.success);
    } catch (error) {
      setIsServiceable(false);
    }
  };

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = featuredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(featuredProducts);
    }
  }, [searchQuery, featuredProducts]);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('https://jholabazar.onrender.com/api/v1/products/featured');
      const result = await response.json();
      
      const rawProducts = result.data?.products || [];
      const transformedProducts = rawProducts.map(product => ({
        id: product.id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.variants?.[0]?.price?.sellingPrice || '0',
        originalPrice: product.variants?.[0]?.price?.basePrice || '0',
        category: product.category?.name || 'General',
        description: product.description || product.shortDescription || '',
        unit: `${product.variants?.[0]?.weight || '1'} ${product.variants?.[0]?.baseUnit || 'unit'}`,
        inStock: product.variants?.[0]?.stock?.availableQty > 0,
        rating: 4.5,
        deliveryTime: '10 mins',
        variants: product.variants
      }));
      
      setFeaturedProducts(transformedProducts);
      setFilteredProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Featured Products</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.lightGray }]}>
        <Ionicons name="search" size={20} color={colors.gray} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search featured products..."
          placeholderTextColor={colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={({ item }) => <ProductCard product={item} isServiceable={isServiceable} />}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});