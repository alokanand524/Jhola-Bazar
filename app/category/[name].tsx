import { ProductCard } from '@/components/ProductCard';
import { categoryImages } from '@/data/categoryImages';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

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
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [sortBy, setSortBy] = useState('Popular');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const { products } = useSelector((state: RootState) => state.products);
  const { colors } = useTheme();

  const subCategories = categoryData[categoryName] || ['All'];

  const filteredProducts = products.filter(product => {
    if (categoryName === 'Favourites') return true;
    return product.category === categoryName;
  });

  const { items } = useSelector((state: RootState) => state.cart);
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{categoryName}</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <Ionicons name="bag-outline" size={24} color={colors.text} />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.filterSection, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.lightGray }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={16} color={colors.text} />
          <Text style={[styles.filterText, { color: colors.text }]}>Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.lightGray }]}
          onPress={() => setShowSort(true)}
        >
          <Ionicons name="swap-vertical-outline" size={16} color={colors.text} />
          <Text style={[styles.filterText, { color: colors.text }]}>{sortBy}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.lightGray }]}
          onPress={() => setShowBrand(true)}
        >
          <Ionicons name="business-outline" size={16} color={colors.text} />
          <Text style={[styles.filterText, { color: colors.text }]}>{selectedBrand}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Modal */}
      <Modal visible={showSort} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sort by</Text>
            {['Popular', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Rating'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => { setSortBy(option); setShowSort(false); }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{option}</Text>
                {sortBy === option && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: colors.primary }]}
              onPress={() => setShowSort(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Brand Modal */}
      <Modal visible={showBrand} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Brand</Text>
            {['All', 'Fresh & Pure', 'Organic Valley', 'Farm Fresh', 'Premium Choice'].map((brand) => (
              <TouchableOpacity
                key={brand}
                style={styles.modalOption}
                onPress={() => { setSelectedBrand(brand); setShowBrand(false); }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{brand}</Text>
                {selectedBrand === brand && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: colors.primary }]}
              onPress={() => setShowBrand(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filters Modal */}
      <Modal visible={showFilters} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
            <Text style={[styles.filterCategory, { color: colors.text }]}>Price Range</Text>
            {['Under ₹50', '₹50 - ₹100', '₹100 - ₹200', 'Above ₹200'].map((price) => (
              <TouchableOpacity key={price} style={styles.modalOption}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{price}</Text>
              </TouchableOpacity>
            ))}
            <Text style={[styles.filterCategory, { color: colors.text }]}>Discount</Text>
            {['10% and above', '20% and above', '30% and above', '50% and above'].map((discount) => (
              <TouchableOpacity key={discount} style={styles.modalOption}>
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{discount}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalClose, { backgroundColor: colors.primary }]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.modalCloseText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.content}>
        <View style={[styles.sidebar, { backgroundColor: colors.lightGray, borderRightColor: colors.border }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {subCategories.map((subCat) => (
              <TouchableOpacity
                key={subCat}
                style={[
                  styles.sidebarItem,
                  { borderBottomColor: colors.border },
                  selectedSubCategory === subCat && { backgroundColor: colors.background, borderRightColor: colors.primary }
                ]}
                onPress={() => setSelectedSubCategory(subCat)}
              >
                <Image
                  source={{ uri: categoryImages[categoryName]?.[subCat] || categoryImages[categoryName]?.['All'] }}
                  style={styles.sidebarImage}
                />
                <Text style={[
                  styles.sidebarText,
                  { color: colors.gray },
                  selectedSubCategory === subCat && { color: colors.primary, fontWeight: '600' }
                ]}>
                  {subCat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.productsArea}>
          <Text style={[styles.productsTitle, { color: colors.text }]}>{selectedSubCategory}</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    justifyContent: 'space-around',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalClose: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 80,
    borderRightWidth: 1,
  },
  sidebarItem: {
    paddingHorizontal: 1,
    paddingVertical: 5,
    borderBottomWidth: 1,
    alignItems: 'center',
    borderRightWidth: 3,
    borderRightColor: 'transparent',
  },
  sidebarImage: {
    width: 30,
    height: 30,
    borderRadius: 20,
    marginBottom: 3,
  },
  sidebarText: {
    fontSize: 10,
    textAlign: 'center',
  },
  productsArea: {
    flex: 1,
    padding: 20,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
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
});