import { BannerCarousel } from '@/components/BannerCarousel';
import { CategoryList } from '@/components/CategoryList';
import { ProductCard } from '@/components/ProductCard';
import { SectionCard } from '@/components/SectionCard';
import { SectionHeader } from '@/components/SectionHeader';
import { mockProducts } from '@/data/products';
import { beautyPersonalCare, featuredThisWeek, frequentlyBought, groceryKitchen, snacksDrinks } from '@/data/sections';
import { setProducts } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { products, selectedCategory } = useSelector((state: RootState) => state.products);
  const { items } = useSelector((state: RootState) => state.cart);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const tabBarOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    dispatch(setProducts([...mockProducts, ...featuredThisWeek]));
  }, []);

  const filteredProducts = selectedCategory === 'All' 
    ? products.slice(0, 6)
    : products.filter(product => product.category === selectedCategory).slice(0, 6);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleScroll = () => {
    if (!isScrolling) {
      setIsScrolling(true);
      Animated.timing(tabBarOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
      Animated.timing(tabBarOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#ffffffff" />
          <Text style={styles.locationText}>Deliver in 10 mins</Text>
          <Text style={styles.addressText}>Home - New Delhi</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="bag" size={24} color="#aabd4d3e" />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={() => router.push('/(tabs)/search')}
      >
        <Ionicons name="search" size={20} color="#666" />
        <Text style={styles.searchPlaceholder}>Search for products</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        <BannerCarousel />
        <CategoryList />
        
        <SectionHeader title="Frequently bought" categoryName="Favourites" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
          {frequentlyBought.map((item, index) => (
            <SectionCard key={index} title={item.title} image={item.image} category={item.category} />
          ))}
        </ScrollView>

        <SectionHeader title="Featured this week" categoryName="Vegetables" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productScroll}>
          {featuredThisWeek.map((item) => (
            <View key={item.id} style={styles.featuredCard}>
              <ProductCard product={item} />
            </View>
          ))}
        </ScrollView>

        <SectionHeader title="Grocery & Kitchen" categoryName="Vegetables" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
          {groceryKitchen.map((item, index) => (
            <SectionCard key={index} title={item.title} image={item.image} category={item.category} />
          ))}
        </ScrollView>

        <SectionHeader title="Snacks & Drinks" categoryName="Snacks" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
          {snacksDrinks.map((item, index) => (
            <SectionCard key={index} title={item.title} image={item.image} category={item.category} />
          ))}
        </ScrollView>

        <SectionHeader title="Beauty & Personal Care" categoryName="Personal Care" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll}>
          {beautyPersonalCare.map((item, index) => (
            <SectionCard key={index} title={item.title} image={item.image} category={item.category} />
          ))}
        </ScrollView>
        
        <View style={styles.productsContainer}>
          <SectionHeader title="Popular Products" categoryName="Vegetables" />
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard product={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
          />
        </View>
      </ScrollView>

      <Animated.View style={[styles.tabBarOverlay, { opacity: tabBarOpacity }]} pointerEvents={isScrolling ? 'none' : 'auto'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#a5a5a52c',
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
    color: '#666',
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#95ff00ff',
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
    backgroundColor: '#f8f8f8',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  sectionScroll: {
    paddingLeft: 16,
    marginBottom: 20,
  },
  productScroll: {
    paddingLeft: 16,
    marginBottom: 20,
  },
  featuredCard: {
    width: 160,
    marginRight: 12,
  },
  tabBarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
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
});