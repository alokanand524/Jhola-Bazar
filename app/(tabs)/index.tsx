import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductCard } from '@/components/ProductCard';
import { SectionCard } from '@/components/SectionCard';
import { SectionCardSkeleton } from '@/components/SectionCardSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { BannerSkeleton, ProductCardSkeleton, SectionHeaderSkeleton, SkeletonLoader } from '@/components/SkeletonLoader';
import { mockProducts } from '@/data/products';
import { featuredThisWeek } from '@/data/sections';
import { useLocation } from '@/hooks/useLocation';
import { useTheme } from '@/hooks/useTheme';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchDeliveryTime } from '@/store/slices/deliverySlice';
import { setProducts } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { handleTabBarScroll } from './_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { products, selectedCategory, loading: productsLoading } = useSelector((state: RootState) => state.products);
  const { categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const { items } = useSelector((state: RootState) => state.cart);
  const { deliveryTime } = useSelector((state: RootState) => state.delivery);
  const { colors } = useTheme();
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [userLocation, setUserLocation] = React.useState<string | null>(null);
  const [apiProducts, setApiProducts] = React.useState([]);
  const [apiLoading, setApiLoading] = React.useState(true);


  const fetchApiProducts = async () => {
    try {
      setApiLoading(true);
      
      // Check cache first
      const cached = await AsyncStorage.getItem('products_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) { // 30 minutes
          setApiProducts(data.slice(0, 6));
          setApiLoading(false);
          return;
        }
      }
      
      const response = await fetch('https://jholabazar.onrender.com/api/v1/products');
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
        inStock: product.variants?.[0]?.stock?.status === 'AVAILABLE',
        rating: 4.5,
        deliveryTime: '10 mins',
        variants: product.variants
      }));
      
      // Cache the result
      await AsyncStorage.setItem('products_cache', JSON.stringify({
        data: transformedProducts,
        timestamp: Date.now()
      }));
      
      setApiProducts(transformedProducts.slice(0, 6));
    } catch (error) {
      console.error('Error fetching products:', error);
      // Try cached data on error
      const cached = await AsyncStorage.getItem('products_cache');
      if (cached) {
        const { data } = JSON.parse(cached);
        setApiProducts(data.slice(0, 6));
      } else {
        setApiProducts([]);
      }
    } finally {
      setApiLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setProducts([...mockProducts, ...featuredThisWeek]));
    dispatch(fetchCategories());
    fetchApiProducts();
    setTimeout(() => setIsInitialLoading(false), 500);
    getCurrentLocation();
  }, [dispatch]);

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      dispatch(fetchDeliveryTime({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString()
      }));
    }
  }, [location, dispatch]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const pincode = address.postalCode && address.postalCode.length === 6 ? address.postalCode : null;
        const city = address.city || address.subregion || '';
        const state = address.region || '';
        
        let locationString = '';
        if (pincode) {
          locationString = `${address.street || ''} ${city} ${state} - ${pincode}`.trim();
        } else {
          locationString = `${address.street || ''} ${city} ${state}`.trim();
        }
        
        setUserLocation(locationString || 'Current Location');
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const filteredProducts = selectedCategory === 'All'
    ? products.slice(0, 6)
    : products.filter(product => product.category === selectedCategory).slice(0, 6);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleScroll = (event: any) => {
    handleTabBarScroll(event);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color={colors.primary} />
          <Text style={styles.locationText}>Delivered to</Text>
          {locationLoading ? (
            <View style={{ marginTop: 2 }}>
              <SkeletonLoader width="70%" height={12} />
            </View>
          ) : locationError ? (
            <Text style={[styles.addressText, { color: colors.gray }]}>Location unavailable</Text>
          ) : (
            <TouchableOpacity onPress={() => router.push('/select-address')}>
              <Text style={[styles.addressText, { color: colors.text, fontWeight: 'bold' }]}>
                {location?.address || userLocation || 'Select Location'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="bag" size={24} color={colors.primary} />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.lightGray }]}>
        <Ionicons name="search" size={20} color={colors.gray} />
        <TouchableOpacity
          style={styles.searchTouchable}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Text style={[styles.searchPlaceholder, { color: colors.gray }]}>Search for products</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        {isInitialLoading ? <BannerSkeleton /> : <BannerCarousel />}

        {isInitialLoading ? <SectionHeaderSkeleton /> : <SectionHeader title="Featured this week" categoryName="Vegetables" />}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
          {isInitialLoading ? (
            [1, 2, 3].map((item) => (
              <View key={item} style={styles.featuredCard}>
                <ProductCardSkeleton />
              </View>
            ))
          ) : (
            featuredThisWeek.map((item) => (
              <View key={item.id} style={styles.featuredCard}>
                <ProductCard product={item} />
              </View>
            ))
          )}
        </ScrollView>

        {isInitialLoading ? <SectionHeaderSkeleton /> : (
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>Shop by category</Text>
          </View>
        )}
        <View style={styles.categoriesContainer}>
          {isInitialLoading || categoriesLoading ? (
            <View style={styles.categoriesGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                <SectionCardSkeleton key={item} />
              ))}
            </View>
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <SectionCard title={category.name} image={category.image} category={category.name} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.productsContainer}>
          {isInitialLoading ? <SectionHeaderSkeleton /> : <SectionHeader title="Popular Products" categoryName="Vegetables" />}
          {isInitialLoading || apiLoading ? (
            <View style={styles.row}>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </View>
          ) : apiProducts.length > 0 ? (
            <FlatList
              data={apiProducts}
              renderItem={({ item }) => <ProductCard product={item} />}
              keyExtractor={(item, index) => item.id || item._id || `product-${index}`}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.row}
            />
          ) : (
            <View style={styles.noProductsContainer}>
              <Text style={[styles.noProductsText, { color: colors.gray }]}>No products available</Text>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  locationContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B761',
  },
  addressText: {
    fontSize: 12,
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
    // backgroundColor: 'white',
    borderRadius: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
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
  searchTouchable: {
    flex: 1,
    marginLeft: 8,
  },
  searchPlaceholder: {
    fontSize: 16,
  },
  sectionScroll: {
    paddingLeft: 16,
    marginBottom: 20,
  },
  productScroll: {
    paddingLeft: 8,
    marginBottom: 20,
  },
  featuredCard: {
    width: 300,
    marginRight: -140,
  },

  productsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  categoryHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '23%',
    marginBottom: 12,
  },
  noProductsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noProductsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});