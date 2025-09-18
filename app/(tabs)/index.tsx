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
import { behaviorTracker } from '@/services/behaviorTracker';
import { fetchCart } from '@/store/slices/cartSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { fetchDeliveryTime } from '@/store/slices/deliverySlice';
import { setProducts } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { handleTabBarScroll } from './_layout';

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
  const [selectedAddress, setSelectedAddress] = React.useState<any>(null);
  const [apiProducts, setApiProducts] = React.useState([]);
  const [apiLoading, setApiLoading] = React.useState(true);
  const [featuredProducts, setFeaturedProducts] = React.useState([]);
  const [featuredLoading, setFeaturedLoading] = React.useState(true);


  const fetchApiProducts = async () => {
    try {
      setApiLoading(true);
      
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
      
      setApiProducts(transformedProducts.slice(0, 6));
    } catch (error) {
      console.error('Error fetching products:', error);
      setApiProducts([]);
    } finally {
      setApiLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      setFeaturedLoading(true);
      
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
        inStock: product.variants?.[0]?.stock?.status === 'AVAILABLE',
        rating: 4.5,
        deliveryTime: '10 mins',
        variants: product.variants
      }));
      
      setFeaturedProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  const loadSelectedAddress = async () => {
    try {
      const address = await AsyncStorage.getItem('selectedDeliveryAddress');
      if (address) {
        setSelectedAddress(JSON.parse(address));
      }
    } catch (error) {
      console.log('Error loading selected address:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      await behaviorTracker.init();
      dispatch(setProducts([...mockProducts, ...featuredThisWeek]));
      await Promise.all([
        dispatch(fetchCategories()),
        fetchApiProducts(),
        fetchFeaturedProducts()
      ]);
      
      // Fetch cart for authenticated users
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        dispatch(fetchCart());
        
        // Check if user has delivery address
        try {
          const addressResponse = await fetch('https://jholabazar.onrender.com/api/v1/profile/addresses', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (addressResponse.ok) {
            const addressData = await addressResponse.json();
            if (!addressData.data || addressData.data.length === 0) {
              router.push('/select-address');
            }
          }
        } catch (error) {
          console.error('Error checking addresses:', error);
        }
      }
      
      setIsInitialLoading(false);
      getCurrentLocation();
      loadSelectedAddress();
    };
    
    initializeApp();
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      loadSelectedAddress();
    }, [])
  );

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
        const place = address.district || address.subregion || '';
        const city = address.city || '';
        const pincode = address.postalCode || '';
        
        let locationParts = [];
        if (place) locationParts.push(place);
        if (city && city !== place) locationParts.push(city);
        if (pincode) locationParts.push(pincode);
        
        const locationString = locationParts.join(', ');
        setUserLocation(locationString || 'Current Location');
        
        // Fetch delivery time with current coordinates
        dispatch(fetchDeliveryTime({
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
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
          {deliveryTime && (
            <Text style={[styles.deliveryTimeText, { color: colors.primary }]}>
              Delivery in {deliveryTime}
            </Text>
          )}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.gray }]}>Delivery to</Text>
            {locationLoading ? (
              <SkeletonLoader width="70%" height={12} />
            ) : locationError ? (
              <Text style={[styles.addressText, { color: colors.gray }]}>Location unavailable</Text>
            ) : (
              <TouchableOpacity onPress={() => router.push('/select-address')}>
                {selectedAddress ? (
                  <View>
                    <Text style={[styles.addressText, { color: colors.text, fontWeight: 'bold' }]}>
                      {selectedAddress.address.split(',')[0]}
                    </Text>
                    {selectedAddress.address.split(',').length > 1 && (
                      <Text style={[styles.addressSubText, { color: colors.gray }]}>
                        {selectedAddress.address.split(',').slice(1).join(',').trim()}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={[styles.addressText, { color: colors.text, fontWeight: 'bold' }]}>
                    {userLocation || 'Select Location'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
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
          {isInitialLoading || featuredLoading ? (
            [1, 2, 3].map((item) => (
              <View key={item} style={styles.featuredCard}>
                <ProductCardSkeleton />
              </View>
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((item) => (
              <View key={item.id} style={styles.featuredCard}>
                <ProductCard product={item} />
              </View>
            ))
          ) : (
            <View style={styles.noProductsContainer}>
              <Text style={[styles.noProductsText, { color: colors.gray }]}>No featured products available</Text>
            </View>
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

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Image 
            source={require('../../assets/images/jhola-bajar-footer.png')} 
            style={styles.footerImage}
            resizeMode="contain"
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
  deliveryTimeText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '400',
  },
  addressText: {
    fontSize: 14,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    flex: 1,
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
    height: 230,
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
  footerSection: {
    marginTop: 20,
    paddingBottom: 20,
  },
  footerImage: {
    width: '100%',
    height: 300,
    backgroundColor: 'darken',
  },
  addressSubText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});