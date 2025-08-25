import { BannerCarousel } from '@/components/BannerCarousel';
import { CategoryList } from '@/components/CategoryList';
import { ProductCard } from '@/components/ProductCard';
import { SectionCard } from '@/components/SectionCard';
import { SectionHeader } from '@/components/SectionHeader';
import { mockProducts } from '@/data/products';
import { beautyPersonalCare, featuredThisWeek, frequentlyBought, groceryKitchen, snacksDrinks } from '@/data/sections';
import { useTheme } from '@/hooks/useTheme';
import { setProducts } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { hideTabBar } from './_layout';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { products, selectedCategory } = useSelector((state: RootState) => state.products);
  const { items } = useSelector((state: RootState) => state.cart);
  const { colors } = useTheme();


  useEffect(() => {
    dispatch(setProducts([...mockProducts, ...featuredThisWeek]));
  }, []);

  const filteredProducts = selectedCategory === 'All' 
    ? products.slice(0, 6)
    : products.filter(product => product.category === selectedCategory).slice(0, 6);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleScroll = () => {
    hideTabBar();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#ffffffff" />
          <Text style={styles.locationText}>Deliver in 10 mins</Text>
          <Text style={[styles.addressText, { color: colors.gray }]}>Home - New Delhi</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="bag" size={24} color="#909b5bff" />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.searchContainer, { backgroundColor: colors.lightGray }]}
        onPress={() => router.push('/(tabs)/search')}
      >
        <Ionicons name="search" size={20} color={colors.gray} />
        <Text style={[styles.searchPlaceholder, { color: colors.gray }]}>Search for products</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16}>
        <CategoryList />
        <BannerCarousel />
        
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
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
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