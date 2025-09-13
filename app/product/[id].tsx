import { useTheme } from '@/hooks/useTheme';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { addToCart, updateQuantity } from '@/store/slices/cartSlice';
import { fetchProductById } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageWithLoading } from '@/components/ImageWithLoading';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { behaviorTracker } from '@/services/behaviorTracker';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [selectedVariant, setSelectedVariant] = React.useState(0);
  
  const { selectedProduct, productLoading } = useSelector((state: RootState) => state.products);
  const cartItem = useSelector((state: RootState) => 
    state.cart.items.find(item => item.id === id)
  );

  React.useEffect(() => {
    if (id && typeof id === 'string') {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  React.useEffect(() => {
    if (selectedProduct) {
      behaviorTracker.trackProductView(selectedProduct.id, selectedProduct.category);
    }
  }, [selectedProduct]);

  if (productLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <SkeletonLoader width={24} height={24} />
          <SkeletonLoader width={120} height={18} />
          <SkeletonLoader width={24} height={24} />
        </View>
        <ScrollView style={styles.content}>
          <SkeletonLoader width="100%" height={300} />
          <View style={{ padding: 16 }}>
            <SkeletonLoader width={80} height={20} borderRadius={12} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="90%" height={24} style={{ marginBottom: 4 }} />
            <SkeletonLoader width="60%" height={16} style={{ marginBottom: 12 }} />
            <SkeletonLoader width={100} height={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader width="100%" height={28} style={{ marginBottom: 20 }} />
            <SkeletonLoader width="70%" height={18} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="100%" height={60} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!selectedProduct) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Product Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    const currentVariant = selectedProduct.variants?.[selectedVariant];
    const price = currentVariant?.price?.sellingPrice || selectedProduct.price;
    
    dispatch(addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: parseFloat(price),
      image: selectedProduct.image,
      category: selectedProduct.category,
    }));
  };

  const handleUpdateQuantity = (quantity: number) => {
    dispatch(updateQuantity({ id: selectedProduct.id, quantity }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Product Details</Text>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/cart')}
        >
          <Ionicons name="bag-outline" size={24} color={colors.text} />
          {cartItem && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItem.quantity}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <ImageWithLoading source={{ uri: selectedProduct.image }} height={300} style={styles.productImage} />
        
        <View style={styles.productInfo}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.categoryText}>{selectedProduct.category}</Text>
          </View>
          
          <Text style={[styles.productName, { color: colors.text }]}>{selectedProduct.name}</Text>
          <Text style={[styles.productUnit, { color: colors.gray }]}>{selectedProduct.unit}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={[styles.rating, { color: colors.text }]}>{selectedProduct.rating || 4.5}</Text>
            <Text style={[styles.deliveryTime, { color: colors.gray }]}>• {selectedProduct.deliveryTime || '10 mins'}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            {selectedProduct.variants && selectedProduct.variants[selectedVariant] ? (
              <>
                <Text style={[styles.price, { color: colors.text }]}>₹{selectedProduct.variants[selectedVariant].price?.sellingPrice}</Text>
                {selectedProduct.variants[selectedVariant].price?.basePrice && (
                  <Text style={styles.originalPrice}>₹{selectedProduct.variants[selectedVariant].price?.basePrice}</Text>
                )}
                {selectedProduct.variants[selectedVariant].price?.basePrice && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {Math.round(((selectedProduct.variants[selectedVariant].price?.basePrice - selectedProduct.variants[selectedVariant].price?.sellingPrice) / selectedProduct.variants[selectedVariant].price?.basePrice) * 100)}% OFF
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={[styles.price, { color: colors.text }]}>₹{selectedProduct.price}</Text>
                {selectedProduct.originalPrice && (
                  <Text style={styles.originalPrice}>₹{selectedProduct.originalPrice}</Text>
                )}
              </>
            )}
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.gray }]}>{selectedProduct.description}</Text>
          </View>
          
          {/* Variant Selection */}
          {selectedProduct.variants && selectedProduct.variants.length > 1 && (
            <View style={styles.weightContainer}>
              <Text style={[styles.weightTitle, { color: colors.text }]}>Select Variant</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weightScroll}>
                {selectedProduct.variants.map((variant, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.weightCard, 
                      { borderColor: selectedVariant === index ? colors.primary : colors.border },
                      selectedVariant === index && { backgroundColor: colors.lightGray }
                    ]}
                    onPress={() => setSelectedVariant(index)}
                  >
                    <Text style={[styles.weightText, { color: colors.text }]}>
                      {variant.weight} {variant.baseUnit}
                    </Text>
                    <Text style={[styles.weightPrice, { color: colors.primary }]}>
                      ₹{variant.price?.sellingPrice}
                    </Text>
                    {variant.stock?.status !== 'AVAILABLE' && (
                      <Text style={[styles.outOfStock, { color: 'red' }]}>Out of Stock</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.featuresContainer}>
            <Text style={[styles.featuresTitle, { color: colors.text }]}>Features</Text>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.gray }]}>Fresh and high quality</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.gray }]}>Fast delivery in {selectedProduct.deliveryTime || '10 minutes'}</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={[styles.featureText, { color: colors.gray }]}>Best price guaranteed</Text>
            </View>
            {selectedProduct.variants?.[selectedVariant]?.stock?.status === 'AVAILABLE' && (
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.featureText, { color: colors.gray }]}>In Stock</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.priceInfo}>
          <Text style={[styles.footerPrice, { color: colors.text }]}>
            ₹{selectedProduct.variants?.[selectedVariant]?.price?.sellingPrice || selectedProduct.price}
          </Text>
          <Text style={[styles.footerUnit, { color: colors.gray }]}>
            {selectedProduct.variants?.[selectedVariant] ? 
              `${selectedProduct.variants[selectedVariant].weight} ${selectedProduct.variants[selectedVariant].baseUnit}` : 
              selectedProduct.unit
            }
          </Text>
        </View>
        
        {cartItem ? (
          <View style={[styles.quantityContainer, { backgroundColor: colors.primary }]}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(cartItem.quantity - 1)}
            >
              <Ionicons name="remove" size={20} color="#ffffffff" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{cartItem.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(cartItem.quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#ffffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.addToCartButton, 
              { backgroundColor: selectedProduct.variants?.[selectedVariant]?.stock?.status === 'AVAILABLE' ? colors.primary : colors.gray }
            ]} 
            onPress={handleAddToCart}
            disabled={selectedProduct.variants?.[selectedVariant]?.stock?.status !== 'AVAILABLE'}
          >
            <Text style={styles.addToCartText}>
              {selectedProduct.variants?.[selectedVariant]?.stock?.status === 'AVAILABLE' ? 'Add to Jhola' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productUnit: {
    fontSize: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
  deliveryTime: {
    fontSize: 14,
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  weightContainer: {
    marginBottom: 20,
  },
  weightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  weightScroll: {
    paddingVertical: 4,
  },
  weightCard: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  weightText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  weightPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  priceInfo: {
    flex: 1,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footerUnit: {
    fontSize: 14,
  },
  addToCartButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
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
  outOfStock: {
    fontSize: 10,
    marginTop: 2,
  },
});