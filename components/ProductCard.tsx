import { useTheme } from '@/hooks/useTheme';
import { addToCart, updateQuantity } from '@/store/slices/cartSlice';
import { Product } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImageWithLoading } from '@/components/ImageWithLoading';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenManager } from '@/utils/tokenManager';

interface ProductCardProps {
  product: Product;
  isServiceable?: boolean;
}

const sizeOptions = ['100g', '200g', '500g', '1kg', '2kg'];

export const ProductCard: React.FC<ProductCardProps> = ({ product, isServiceable = true }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const cartItem = useSelector((state: RootState) => 
    state.cart.items.find(item => item.id === product.id)
  );

  // Check if product has multiple size options
  const hasMultipleSizes = product.category === 'Vegetables' || product.category === 'Fruits';



  const checkUserAddress = async () => {
    try {
      // First check if there's a selected address in AsyncStorage
      const selectedAddress = await AsyncStorage.getItem('selectedDeliveryAddress');
      if (selectedAddress) {
        return true;
      }
      
      const response = await tokenManager.makeAuthenticatedRequest('https://jholabazar.onrender.com/api/v1/service-area/addresses');
      
      if (response.ok) {
        const data = await response.json();
        return data.success && data.data && data.data.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error checking addresses:', error);
      return false;
    }
  };

  const addToCartAPI = async (variantId: string, quantity: number) => {
    try {
      // Check if user has delivery address
      const hasAddress = await checkUserAddress();
      if (!hasAddress) {
        router.push('/add-address');
        return null;
      }
      
      // Get selected address
      const selectedAddressData = await AsyncStorage.getItem('selectedDeliveryAddress');
      let addressId = null;
      
      if (selectedAddressData) {
        const selectedAddress = JSON.parse(selectedAddressData);
        addressId = selectedAddress.id;
      }
      
      const payload = {
        variantId,
        quantity: quantity.toString(),
        ...(addressId && { addressId })
      };
      
      const response = await tokenManager.makeAuthenticatedRequest('https://jholabazar.onrender.com/api/v1/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data.id;
      }
      return null;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  };

  const handleAddToCart = async (selectedSize?: string, selectedVariantId?: string) => {
    // If product has variants and no variant selected, show variant modal first
    if (product.variants && product.variants.length > 1 && !cartItem && !selectedVariantId) {
      setShowVariantModal(true);
      return;
    }
    
    if (hasMultipleSizes && !cartItem && !selectedSize) {
      setShowSizeModal(true);
      return;
    }
    
    // Check if user is logged in first
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    // After login, check if area is serviceable
    if (!isServiceable) {
      alert('Sorry, we don\'t deliver to your area');
      return;
    }
    
    // Get variantId from product (assuming it's in variants array)
    const variantId = selectedVariantId || product.variants?.[0]?.id || product.id;
    const quantity = 1; // Always add 1 for new items
    
    // Check token directly instead of Redux state
    const token = await AsyncStorage.getItem('authToken');
    let apiSuccess = false;
    
    if (token) {
      apiSuccess = await addToCartAPI(variantId, quantity);
    }
    
    // Only update local state if API call succeeded or no token
    if (apiSuccess || !token) {
      dispatch(addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        cartItemId: apiSuccess || undefined, // Store cart item ID
      }));
    }
    
    if (selectedSize) {
      setShowSizeModal(false);
    }
    if (selectedVariantId) {
      setShowVariantModal(false);
    }
  };

  const handleIncrement = async () => {
    if (!isServiceable) {
      alert('Sorry, we don\'t deliver to your area');
      return;
    }
    
    const cartItemId = cartItem?.cartItemId;
    
    if (cartItemId) {
      try {
        await tokenManager.makeAuthenticatedRequest(`https://jholabazar.onrender.com/api/v1/cart/items/${cartItemId}/increment`, {
          method: 'PATCH'
        });
      } catch (error) {
        console.error('Error incrementing quantity:', error);
      }
    }
    
    dispatch(updateQuantity({ id: product.id, quantity: cartItem!.quantity + 1 }));
  };

  const handleDecrement = async () => {
    if (!isServiceable) {
      alert('Sorry, we don\'t deliver to your area');
      return;
    }
    
    const cartItemId = cartItem?.cartItemId;
    
    if (cartItemId) {
      try {
        await tokenManager.makeAuthenticatedRequest(`https://jholabazar.onrender.com/api/v1/cart/items/${cartItemId}/decrement`, {
          method: 'PATCH'
        });
      } catch (error) {
        console.error('Error decrementing quantity:', error);
      }
    }
    
    dispatch(updateQuantity({ id: product.id, quantity: cartItem!.quantity - 1 }));
  };

  const handleSizeSelect = (size: string) => {
    handleAddToCart(size);
  };

  const getWeightRange = () => {
    if (product.category === 'Vegetables' || product.category === 'Fruits') {
      return '(0.95 - 1.05) kg';
    }
    return product.unit;
  };

  const getDiscountPercentage = () => {
    if (product.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={() => router.push(`/product/${product.id}`)}
      >
        <View style={styles.imageContainer}>
          <ImageWithLoading 
            source={{ uri: product.image }} 
            height={120} 
            style={styles.image}
          />
          
          {/* Discount Badge on Image */}
          {getDiscountPercentage() > 0 && (
            <View style={styles.discountBadgeOnImage}>
              <Text style={styles.discountText}>{getDiscountPercentage()}% OFF</Text>
            </View>
          )}
          
          {/* Overlay Add Button */}
          <View style={styles.addButtonOverlay}>
            {cartItem ? (
              <View style={[styles.quantityContainer, { backgroundColor: colors.primary }]}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDecrement();
                  }}
                >
                  <Ionicons name="remove" size={14} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{cartItem.quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleIncrement();
                  }}
                >
                  <Ionicons name="add" size={14} color="#ffffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.addButton, { 
                  backgroundColor: 'white', 
                  borderColor: colors.primary, 
                  borderWidth: 2,
                  flexDirection: product.variants && product.variants.length > 1 ? 'row' : 'column',
                  paddingHorizontal: product.variants && product.variants.length > 1 ? 8 : 0,
                  width: product.variants && product.variants.length > 1 ? 'auto' : 32,
                  minWidth: product.variants && product.variants.length > 1 ? 60 : 32
                }]} 
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
              >
                <Ionicons name="add" size={product.variants && product.variants.length > 1 ? 14 : 18} color={colors.primary} />
                {product.variants && product.variants.length > 1 && (
                  <Text style={[styles.variantText, { color: colors.primary }]}>
                    {product.variants.length} options
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Weight Range */}
          <Text style={[styles.weightRange, { color: colors.gray }]}>{getWeightRange()}</Text>
          
          {/* Product Name */}
          {product.name && (
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
              {product.name.length > 10 ? `${product.name.substring(0, 10)}...` : product.name}
            </Text>
          )}
          

          

          
          {/* Price Section */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.text }]}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={[styles.originalPrice, { color: colors.gray }]}>₹{product.originalPrice}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Size Selection Modal */}
      <Modal visible={showSizeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Size</Text>
            <Text style={[styles.modalSubtitle, { color: colors.gray }]}>{product.name}</Text>
            
            {sizeOptions.map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeOption, { borderBottomColor: colors.border }]}
                onPress={() => handleSizeSelect(size)}
              >
                <Text style={[styles.sizeText, { color: colors.text }]}>{size}</Text>
                <Text style={[styles.sizePrice, { color: colors.text }]}>₹{product.price}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.modalClose, { backgroundColor: colors.border }]}
              onPress={() => setShowSizeModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Variant Selection Modal */}
      <Modal visible={showVariantModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Variant</Text>
              <TouchableOpacity onPress={() => setShowVariantModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: colors.gray }]}>{product.name}</Text>
            
            {product.variants?.map((variant) => {
              const variantCartItem = cartItem; // For now, using same cart item logic
              return (
                <View
                  key={variant.id}
                  style={[styles.variantOption, { borderBottomColor: colors.border }]}
                >
                  <View style={styles.variantInfo}>
                    <Text style={[styles.variantName, { color: colors.text }]}>
                      {variant.weight} {variant.baseUnit}
                    </Text>
                    <Text style={[styles.variantPrice, { color: colors.text }]}>₹{variant.price?.sellingPrice}</Text>
                    {variant.price?.basePrice && variant.price.basePrice !== variant.price.sellingPrice && (
                      <Text style={[styles.variantOrigPrice, { color: colors.gray }]}>₹{variant.price.basePrice}</Text>
                    )}
                  </View>
                  <View style={styles.variantActions}>
                    {variantCartItem ? (
                      <View style={[styles.quantityContainer, { backgroundColor: colors.primary }]}>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDecrement();
                          }}
                        >
                          <Ionicons name="remove" size={14} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{variantCartItem.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.quantityButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleIncrement();
                          }}
                        >
                          <Ionicons name="add" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.addButton, { backgroundColor: 'white', borderColor: colors.primary, borderWidth: 2 }]} 
                        onPress={(e) => {
                          e.stopPropagation();
                          handleAddToCart(undefined, variant.id);
                        }}
                      >
                        <Ionicons name="add" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  addButtonOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  quantityButton: {
    padding: 4,
  },
  quantity: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  content: {
    padding: 12,
  },
  weightRange: {
    fontSize: 10,
    marginBottom: 4,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 16,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  discountBadgeOnImage: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  sizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sizeText: {
    fontSize: 16,
  },
  sizePrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalClose: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  variantText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  variantOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  variantActions: {
    alignItems: 'center',
  },
  variantInfo: {
    flex: 1,
  },
  variantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  variantDesc: {
    fontSize: 14,
    marginTop: 2,
  },

  variantPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  variantOrigPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
});