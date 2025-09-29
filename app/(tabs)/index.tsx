import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductCard } from '@/components/ProductCard';
import { SectionCard } from '@/components/SectionCard';
import { SectionCardSkeleton } from '@/components/SectionCardSkeleton';
import { SectionHeader } from '@/components/SectionHeader';
import { ProductCardSkeleton, SectionHeaderSkeleton, SkeletonLoader } from '@/components/SkeletonLoader';
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
  const [apiCartCount, setApiCartCount] = React.useState(0);
  const [loadingStep, setLoadingStep] = React.useState('loading');


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
        inStock: product.variants?.[0]?.stock?.availableQty > 0,
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
        inStock: product.variants?.[0]?.stock?.availableQty > 0,
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
      // Step 1: Show carousel immediately
      await behaviorTracker.init();
      dispatch(setProducts([...mockProducts, ...featuredThisWeek]));
      setLoadingStep('carousel');
      
      // Step 2: Load featured products
      await fetchFeaturedProducts();
      setLoadingStep('featured');
      
      // Step 3: Load categories (in background start location)
      getCurrentLocation();
      loadSelectedAddress();
      await dispatch(fetchCategories());
      setLoadingStep('categories');
      
      // Step 4: Load popular products
      await fetchApiProducts();
      
      // Step 5: Handle user data
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        dispatch(fetchCart());
        fetchCartCount();
        
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
      
      setLoadingStep('complete');
      setIsInitialLoading(false);
    };
    
    initializeApp();
  }, [dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      loadSelectedAddress();
      fetchCartCount();
      dispatch(fetchCart());
    }, [dispatch])
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

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setApiCartCount(0);
        return;
      }

      const response = await fetch('https://jholabazar.onrender.com/api/v1/cart/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const cart = result.data?.carts?.[0];
        const totalQuantity = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
        setApiCartCount(totalQuantity);
      } else {
        setApiCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setApiCartCount(0);
    }
  };

  const cartItemsCount = apiCartCount || items.reduce((sum, item) => sum + item.quantity, 0);

  const handleScroll = (event: any) => {
    handleTabBarScroll(event);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              <TouchableOpacity onPress={() => router.push('/SelectDeliveryAddress')}>
                <Text style={[styles.addressText, { color: colors.text, fontWeight: 'bold' }]}>
                  {selectedAddress ? 
                    (selectedAddress.address.length > 28 ? selectedAddress.address.substring(0, 28) + '...' : selectedAddress.address) : 
                    ((userLocation || 'Select Location').length > 28 ? (userLocation || 'Select Location').substring(0, 28) + '...' : (userLocation || 'Select Location'))
                  }
                </Text>
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
          onPress={() => {
            router.push({
              pathname: '/search-results',
              params: { query: '' }
            });
          }}
        >
          <Text style={[styles.searchPlaceholder, { color: colors.gray }]}>Search for products</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        onScroll={handleScroll} 
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        {/* 1. Carousel - Shows immediately */}
        <BannerCarousel />

        {/* 2. Featured Products - Shows after carousel */}
        {loadingStep === 'loading' ? <SectionHeaderSkeleton /> : <SectionHeader title="Featured this week" sectionType="featured" />}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
          {loadingStep === 'loading' || loadingStep === 'carousel' || featuredLoading ? (
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

        {/* 3. Categories - Shows after featured */}
        {loadingStep === 'loading' || loadingStep === 'carousel' || loadingStep === 'featured' ? <SectionHeaderSkeleton /> : (
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryTitle, { color: colors.text }]}>Shop by category</Text>
          </View>
        )}
        <View style={styles.categoriesContainer}>
          {loadingStep === 'loading' || loadingStep === 'carousel' || loadingStep === 'featured' || categoriesLoading ? (
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

        {/* 4. Popular Products - Shows last */}
        <View style={styles.productsContainer}>
          {loadingStep === 'loading' || loadingStep === 'carousel' || loadingStep === 'featured' || loadingStep === 'categories' ? <SectionHeaderSkeleton /> : <SectionHeader title="Popular Products" sectionType="popular" />}
          {loadingStep === 'loading' || loadingStep === 'carousel' || loadingStep === 'featured' || loadingStep === 'categories' || apiLoading ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
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
    marginTop: 0,
    marginBottom: 0,
  },
  footerImage: {
    width: '100%',
    height: 300,
    backgroundColor: 'darken',
  },
});