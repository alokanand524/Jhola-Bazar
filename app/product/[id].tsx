import { useTheme } from '@/hooks/useTheme';
import { addToCart, updateQuantity } from '@/store/slices/cartSlice';
import { fetchProductById } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImageWithLoading } from '@/components/ImageWithLoading';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { behaviorTracker } from '@/services/behaviorTracker';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [selectedVariant, setSelectedVariant] = React.useState(0);
  const [showElements, setShowElements] = React.useState({
    image: false,
    name: false,
    price: false,
    description: false,
    variants: false,
    features: false
  });

  
  const { selectedProduct, productLoading } = useSelector((state: RootState) => state.products);
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
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
      
      // Reset selected variant when product changes
      setSelectedVariant(0);
      
      // Progressive loading animation
      const delays = [0, 150, 300, 450, 600, 750];
      const elements = ['image', 'name', 'price', 'description', 'variants', 'features'];
      
      elements.forEach((element, index) => {
        setTimeout(() => {
          setShowElements(prev => ({ ...prev, [element]: true }));
        }, delays[index]);
      });
    }
  }, [selectedProduct]);



  if (productLoading || !selectedProduct) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Product Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.content}>
          <SkeletonLoader width="100%" height={300} />
          <View style={styles.productInfo}>
            <SkeletonLoader width={80} height={24} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="70%" height={28} style={{ marginBottom: 4 }} />
            <SkeletonLoader width="40%" height={16} style={{ marginBottom: 12 }} />
            <SkeletonLoader width={120} height={16} style={{ marginBottom: 16 }} />
            <SkeletonLoader width={150} height={32} style={{ marginBottom: 20 }} />
            <SkeletonLoader width="100%" height={80} style={{ marginBottom: 20 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const addToCartAPI = async (variantId: string, quantity: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;

      const response = await fetch('https://jholabazar.onrender.com/api/v1/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          variantId,
          quantity: quantity.toString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    const currentVariant = selectedProduct.variants?.[selectedVariant];
    const price = currentVariant?.price?.sellingPrice || selectedProduct.price;
    const minQty = currentVariant?.minOrderQty || 1;
    
    if (currentVariant?.stock?.availableQty === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Out of Stock', 'This variant is currently out of stock');
      return;
    }
    
    const variantId = currentVariant?.id || selectedProduct.id;
    const token = await AsyncStorage.getItem('authToken');
    
    if (token) {
      await addToCartAPI(variantId, minQty);
    }
    
    // Always update local state for better UX
    dispatch(addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: parseFloat(price),
      image: selectedProduct.image,
      category: selectedProduct.category,
      quantity: minQty
    }));
  };

  const handleUpdateQuantity = async (quantity: number) => {
    const currentVariant = selectedProduct.variants?.[selectedVariant];
    const minQty = currentVariant?.minOrderQty || 1;
    const maxQty = currentVariant?.maxOrderQty || 10;
    
    if (quantity < minQty) {
      dispatch(updateQuantity({ id: selectedProduct.id, quantity: 0 }));
      return;
    }
    
    if (quantity > maxQty) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Max Order Limit', `You can order maximum ${maxQty} units of this product`);
      return;
    }
    
    const variantId = currentVariant?.id || selectedProduct.id;
    const token = await AsyncStorage.getItem('authToken');
    
    if (token) {
      try {
        const response = await fetch(`https://jholabazar.onrender.com/api/v1/cart/items/${variantId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            quantity: quantity.toString()
          })
        });
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
    
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

      {/* Fixed Image Section */}
      <View style={styles.imageContainer}>
        {showElements.image ? (
          selectedProduct.images && selectedProduct.images.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {selectedProduct.images.map((image, index) => (
                <ImageWithLoading 
                  key={index}
                  source={{ uri: image }} 
                  height={300} 
                  style={styles.productImage} 
                />
              ))}
            </ScrollView>
          ) : (
            <ImageWithLoading 
              source={{ uri: selectedProduct.image || selectedProduct.images?.[0] }} 
              height={300} 
              style={styles.productImage} 
            />
          )
        ) : (
          <SkeletonLoader width="100%" height={300} />
        )}
      </View>

      {/* Scrollable Content Section */}
      <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.productInfo}>
          {showElements.name ? (
            <>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.categoryText}>{selectedProduct.category?.name || selectedProduct.category}</Text>
              </View>
              
              {selectedProduct.brand && (
                <Text style={[styles.brandText, { color: colors.gray }]}>{selectedProduct.brand.name}</Text>
              )}
              
              <Text style={[styles.productName, { color: colors.text }]}>{selectedProduct.name}</Text>
              <Text style={[styles.productUnit, { color: colors.gray }]}>{selectedProduct.shortDescription}</Text>
              
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={[styles.rating, { color: colors.text }]}>{selectedProduct.rating || 4.5}</Text>
                <Text style={[styles.deliveryTime, { color: colors.gray }]}>• {selectedProduct.deliveryTime || '10 mins'}</Text>
              </View>
            </>
          ) : (
            <>
              <SkeletonLoader width={80} height={24} style={{ marginBottom: 12 }} />
              <SkeletonLoader width="70%" height={28} style={{ marginBottom: 4 }} />
              <SkeletonLoader width="40%" height={16} style={{ marginBottom: 12 }} />
              <SkeletonLoader width={120} height={16} style={{ marginBottom: 16 }} />
            </>
          )}
          
          {showElements.price ? (
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
          ) : (
            <SkeletonLoader width={150} height={32} style={{ marginBottom: 20 }} />
          )}
          
          {/* Variant Selection */}
          {showElements.variants && selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <View style={styles.weightContainer}>
              <Text style={[styles.weightTitle, { color: colors.text }]}>Available Variants</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weightScroll}>
                {selectedProduct.variants.map((variant, index) => (
                  <TouchableOpacity 
                    key={variant.id} 
                    style={[
                      styles.variantCard, 
                      { 
                        borderColor: selectedVariant === index ? colors.primary : colors.border,
                        opacity: variant.stock?.availableQty === 0 ? 0.5 : 1
                      },
                      selectedVariant === index && { backgroundColor: colors.lightGray }
                    ]}
                    onPress={() => setSelectedVariant(index)}
                  >
                    {variant.images && variant.images[0] && (
                      <ImageWithLoading 
                        source={{ uri: variant.images[0] }} 
                        height={60} 
                        style={styles.variantImage}
                      />
                    )}
                    <Text style={[styles.weightText, { color: colors.text }]}>
                      {variant.weight} {variant.baseUnit}
                    </Text>
                    <Text style={[styles.weightPrice, { color: colors.primary }]}>
                      ₹{variant.price?.sellingPrice}
                    </Text>
                    {variant.price?.basePrice && variant.price.basePrice !== variant.price.sellingPrice && (
                      <Text style={[styles.variantOriginalPrice, { color: colors.gray }]}>
                        ₹{variant.price.basePrice}
                      </Text>
                    )}
                    <Text style={[styles.stockText, { color: variant.stock?.availableQty === 0 ? 'red' : 'green' }]}>
                      {variant.stock?.availableQty === 0 ? 'Out of Stock' : 'In Stock'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {showElements.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionTitle, { color: colors.text }]}>Description</Text>
              <Text style={[styles.description, { color: colors.gray }]}>{selectedProduct.description}</Text>
            </View>
          ) : (
            <SkeletonLoader width="100%" height={80} style={{ marginBottom: 20 }} />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.priceInfo}>
          <View style={styles.footerPriceContainer}>
            <Text style={[styles.footerPrice, { color: colors.text }]}>
              ₹{selectedProduct.variants?.[selectedVariant]?.price?.sellingPrice || selectedProduct.price}
            </Text>
            {(selectedProduct.variants?.[selectedVariant]?.price?.basePrice || selectedProduct.originalPrice) && (
              <Text style={[styles.footerOriginalPrice, { color: colors.gray }]}>
                ₹{selectedProduct.variants?.[selectedVariant]?.price?.basePrice || selectedProduct.originalPrice}
              </Text>
            )}
          </View>
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
              onPress={() => {
                const currentVariant = selectedProduct.variants?.[selectedVariant];
                const incrementQty = currentVariant?.incrementQty || 1;
                handleUpdateQuantity(cartItem.quantity - incrementQty);
              }}
            >
              <Ionicons name="remove" size={20} color="#ffffffff" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{cartItem.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => {
                const currentVariant = selectedProduct.variants?.[selectedVariant];
                const incrementQty = currentVariant?.incrementQty || 1;
                handleUpdateQuantity(cartItem.quantity + incrementQty);
              }}
            >
              <Ionicons name="add" size={20} color="#ffffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.addToCartButton, 
              { backgroundColor: selectedProduct.variants?.[selectedVariant]?.stock?.availableQty === 0 ? colors.gray : colors.primary }
            ]} 
            onPress={handleAddToCart}
            disabled={selectedProduct.variants?.[selectedVariant]?.stock?.availableQty === 0}
          >
            <Text style={styles.addToCartText}>
              {selectedProduct.variants?.[selectedVariant]?.stock?.availableQty === 0 ? 'Out of Stock' : 'Add to Jhola'}
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
  scrollableContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  productImage: {
    width: 300,
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
  footerPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footerOriginalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
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
  imageContainer: {
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  imageScroll: {
    height: 300,
  },


  brandText: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  variantCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  variantImage: {
    width: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  variantOriginalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  stockText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});