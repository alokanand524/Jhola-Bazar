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
  isServiceable?: boolean;
}

const sizeOptions = ['100g', '200g', '500g', '1kg', '2kg'];

export const ProductCard: React.FC<ProductCardProps> = ({ product, isServiceable = true }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [showSizeModal, setShowSizeModal] = useState(false);
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
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
        if (data.data?.accessToken) {
          await AsyncStorage.setItem('authToken', data.data.accessToken);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const checkUserAddress = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;
      
      const response = await fetch('https://jholabazar.onrender.com/api/v1/service-area/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
      console.log('Adding to cart:', { variantId, quantity });
      
      let token = await AsyncStorage.getItem('authToken');
      console.log('Token found:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('No auth token found, skipping API call');
        return null;
      }
      
      // Check if user has delivery address
      const hasAddress = await checkUserAddress();
      if (!hasAddress) {
        console.log('No delivery address found, redirecting to add address');
        router.push('/add-address');
        return null;
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
      
      // If token expired, refresh and retry
      if (response.status === 401) {
        console.log('Token expired, refreshing...');
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
        const data = JSON.parse(responseText);
        console.log('Item added to cart successfully');
        return data.data.id; // Return cart item ID
      } else {
        console.error('Failed to add item to cart. Status:', response.status, 'Body:', responseText);
        return null;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return null;
    }
  };

  const handleAddToCart = async (selectedSize?: string) => {
    // Check if area is serviceable
    if (!isServiceable) {
      alert('Sorry, we don\'t deliver to your area');
      return;
    }
    
    // Check if user is logged in
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    if (hasMultipleSizes && !cartItem && !selectedSize) {
      setShowSizeModal(true);
      return;
    }
    
    // Get variantId from product (assuming it's in variants array)
    const variantId = product.variants?.[0]?.id || product.id;
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
  };

  const handleIncrement = async () => {
    if (!isServiceable) {
      alert('Sorry, we don\'t deliver to your area');
      return;
    }
    
    const token = await AsyncStorage.getItem('authToken');
    const cartItemId = cartItem?.cartItemId;
    
    if (token && cartItemId) {
      try {
        await fetch(`https://jholabazar.onrender.com/api/v1/cart/items/${cartItemId}/increment`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
    
    const token = await AsyncStorage.getItem('authToken');
    const cartItemId = cartItem?.cartItemId;
    
    if (token && cartItemId) {
      try {
        await fetch(`https://jholabazar.onrender.com/api/v1/cart/items/${cartItemId}/decrement`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
});