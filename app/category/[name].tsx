import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { ProductCard } from '@/components/ProductCard';
import { categoryImages } from '@/data/categoryImages';

const categoryData: { [key: string]: string[] } = {
  'Favourites': ['All', 'Most Ordered', 'Recently Bought', 'Saved Items'],
  'Vegetables': ['All', 'Leafy Vegetables', 'Root Vegetables', 'Exotic Vegetables', 'Fresh Vegetables'],
  'Fruits': ['All', 'Seasonal Fruits', 'Exotic Fruits', 'Citrus Fruits', 'Dry Fruits'],
  'Snacks': ['All', 'Chips & Namkeen', 'Biscuits', 'Chocolates', 'Sweets'],
  'Dairy': ['All', 'Milk & Cream', 'Bread & Eggs', 'Cheese & Butter', 'Yogurt'],
  'Beverages': ['All', 'Tea & Coffee', 'Juices', 'Cold Drinks', 'Energy Drinks'],
  'Personal Care': ['All', 'Bath & Body', 'Hair Care', 'Skin Care', 'Baby Care'],
};

export default function CategoryScreen() {
  const { name } = useLocalSearchParams();
  const categoryName = Array.isArray(name) ? name[0] : name || '';
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const { products } = useSelector((state: RootState) => state.products);

  const subCategories = categoryData[categoryName] || ['All'];
  
  const filteredProducts = products.filter(product => {
    if (categoryName === 'Favourites') return true;
    return product.category === categoryName;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <Ionicons name="bag-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.topCategories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {subCategories.map((subCat) => (
            <TouchableOpacity
              key={subCat}
              style={[
                styles.topCategoryButton,
                selectedSubCategory === subCat && styles.selectedTopCategory
              ]}
              onPress={() => setSelectedSubCategory(subCat)}
            >
              <Text style={[
                styles.topCategoryText,
                selectedSubCategory === subCat && styles.selectedTopCategoryText
              ]}>
                {subCat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {subCategories.map((subCat) => (
              <TouchableOpacity
                key={subCat}
                style={[
                  styles.sidebarItem,
                  selectedSubCategory === subCat && styles.selectedSidebarItem
                ]}
                onPress={() => setSelectedSubCategory(subCat)}
              >
                <Image 
                  source={{ uri: categoryImages[categoryName]?.[subCat] || categoryImages[categoryName]?.['All'] }}
                  style={styles.sidebarImage}
                />
                <Text style={[
                  styles.sidebarText,
                  selectedSubCategory === subCat && styles.selectedSidebarText
                ]}>
                  {subCat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.productsArea}>
          <Text style={styles.productsTitle}>{selectedSubCategory}</Text>
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard product={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  topCategories: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
  },
  selectedTopCategory: {
    backgroundColor: '#00B761',
  },
  topCategoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTopCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 80,
    backgroundColor: '#f8f8f8',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  sidebarItem: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedSidebarItem: {
    backgroundColor: '#fff',
    borderRightWidth: 3,
    borderRightColor: '#00B761',
  },
  sidebarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  sidebarText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  selectedSidebarText: {
    color: '#00B761',
    fontWeight: '600',
  },
  productsArea: {
    flex: 1,
    padding: 16,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
});