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

interface ProductCardProps {
  product: Product;
}

const sizeOptions = ['100g', '200g', '500g', '1kg', '2kg'];

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const cartItem = useSelector((state: RootState) => 
    state.cart.items.find(item => item.id === product.id)
  );

  // Check if product has multiple size options
  const hasMultipleSizes = product.category === 'Vegetables' || product.category === 'Fruits';

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) return false;
      
      const response = await fetch('https://jholabazar.onrender.com/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('authToken', data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const addToCartAPI = async (variantId: string, quantity: number) => {
    try {
      console.log('Adding to cart:', { variantId, quantity });
      
      let token = await AsyncStorage.getItem('authToken');
      console.log('Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('No auth token found, skipping API call');
        return false;
      }
      
      const makeRequest = async (authToken: string) => {
        return fetch('https://jholabazar.onrender.com/api/v1/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            variantId,
            quantity: quantity.toString()
          })
        });
      };
      
      let response = await makeRequest(token);
      
      // If token expired, try to refresh and retry
      if (response.status === 401) {
        console.log('Token expired, attempting refresh...');
        const refreshed = await refreshToken();
        
        if (refreshed) {
          token = await AsyncStorage.getItem('authToken');
          if (token) {
            response = await makeRequest(token);
          }
        }
      }
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      if (response.ok) {
        console.log('Item added to cart successfully');
        return true;
      } else {
        console.error('Failed to add item to cart. Status:', response.status, 'Body:', responseText);
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const handleAddToCart = async (selectedSize?: string) => {
    if (hasMultipleSizes && !cartItem && !selectedSize) {
      setShowSizeModal(true);
      return;
    }
    
    // Get variantId from product (assuming it's in variants array)
    const variantId = product.variants?.[0]?.id || product.id;
    const quantity = cartItem ? cartItem.quantity + 1 : 1;
    
    // Try API first, fallback to local cart
    const success = await addToCartAPI(variantId, quantity);
    
    // Update local state (for now, always update for better UX)
    // TODO: Only update when API succeeds once API is working
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    }));
    
    if (selectedSize) {
      setShowSizeModal(false);
    }
  };

  const handleUpdateQuantity = async (quantity: number) => {
    if (quantity > 0) {
      const variantId = product.variants?.[0]?.id || product.id;
      await addToCartAPI(variantId, quantity);
    }
    // Always update local state for better UX
    dispatch(updateQuantity({ id: product.id, quantity }));
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
          
          {/* Overlay Add Button */}
          <View style={styles.addButtonOverlay}>
            {cartItem ? (
              <View style={[styles.quantityContainer, { backgroundColor: colors.primary }]}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleUpdateQuantity(cartItem.quantity - 1);
                  }}
                >
                  <Ionicons name="remove" size={14} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{cartItem.quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleUpdateQuantity(cartItem.quantity + 1);
                  }}
                >
                  <Ionicons name="add" size={14} color="#ffffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: 'white', borderColor: colors.primary, borderWidth: 2 }]} 
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart();
                }}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Weight Range */}
          <Text style={[styles.weightRange, { color: colors.gray }]}>{getWeightRange()}</Text>
          
          {/* Product Name */}
          {product.name && (
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
          )}
          

          
          {/* Discount Badge */}
          {getDiscountPercentage() > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{getDiscountPercentage()}% OFF</Text>
            </View>
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
    fontSize: 11,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  discountBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
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
});