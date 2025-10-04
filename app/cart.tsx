import { CartItemSkeleton, SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import NotificationService from '@/services/notificationService';
import { removeFromCart, updateQuantity } from '@/store/slices/cartSlice';
import { tokenManager } from '@/utils/tokenManager';
import { API_ENDPOINTS } from '@/constants/api';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export default function CartScreen() {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = React.useState(true);
  const [cartData, setCartData] = React.useState(null);
  const [apiItems, setApiItems] = React.useState([]);
  const [cartSummary, setCartSummary] = React.useState(null);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
  }, [isLoggedIn]);

  const fetchCartData = async () => {
    try {
      setIsLoading(true);
      
      const response = await tokenManager.makeAuthenticatedRequest(API_ENDPOINTS.CART.BASE);

      if (response.ok) {
        const result = await response.json();
        const cart = result.data?.carts?.[0];
        
        if (cart) {
          setCartData(cart);
          setApiItems(cart.items || []);
          setCartSummary(cart.summary);
          
          // Trigger cart reminder if items exist
          if (cart.items && cart.items.length > 0) {
            NotificationService.checkCartAndScheduleReminder();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCartData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchCartData();
    }, [])
  );

  const checkServiceability = async () => {
    try {
      const selectedAddressData = await AsyncStorage.getItem('selectedDeliveryAddress');
      
      if (selectedAddressData) {
        const selectedAddress = JSON.parse(selectedAddressData);
        if (selectedAddress.latitude && selectedAddress.longitude) {
          const response = await fetch(API_ENDPOINTS.SERVICE_AREA.CHECK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude
            })
          });
          
          const result = await response.json();
          return result.success && result.data?.available;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number, item: any, isIncrement: boolean) => {
    // Check serviceability first
    const isServiceable = await checkServiceability();
    if (!isServiceable) {
      Alert.alert('Not Serviceable', 'Sorry, we don\'t deliver to your area');
      return;
    }
    
    if (quantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    
    try {
      const endpoint = isIncrement ? 
        API_ENDPOINTS.CART.INCREMENT(itemId) :
        API_ENDPOINTS.CART.DECREMENT(itemId);
      
      const response = await tokenManager.makeAuthenticatedRequest(endpoint, {
        method: 'PATCH'
      });

      if (response.ok) {
        fetchCartData();
        if (item.product?.id) {
          dispatch(updateQuantity({ id: item.product.id, quantity }));
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await tokenManager.makeAuthenticatedRequest(API_ENDPOINTS.CART.ITEM_BY_ID(itemId), {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCartData();
        // Also update Redux state
        const item = apiItems.find(item => item.id === itemId);
        if (item?.product?.id) {
          dispatch(removeFromCart(item.product.id));
        }
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // const deliveryFee = cartSummary?.deliveryCharge ? parseInt(cartSummary.deliveryCharge) : 0;
  const deliveryFee = 0; // Delivery fee disabled
  const finalTotal = (cartSummary?.subtotal || 0) + deliveryFee;

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <SkeletonLoader width={24} height={24} />
          <SkeletonLoader width={120} height={18} />
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.content}>
          {[1, 2, 3].map((item) => (
            <CartItemSkeleton key={item} />
          ))}
          <View style={[styles.billDetails, { backgroundColor: colors.lightGray }]}>
            <SkeletonLoader width="30%" height={18} style={{ marginBottom: 12 }} />
            <View style={styles.billRow}>
              <SkeletonLoader width="40%" height={14} />
              <SkeletonLoader width="20%" height={14} />
            </View>
            <View style={styles.billRow}>
              <SkeletonLoader width="35%" height={14} />
              <SkeletonLoader width="15%" height={14} />
            </View>
            <View style={[styles.billRow, styles.totalRow]}>
              <SkeletonLoader width="30%" height={16} />
              <SkeletonLoader width="25%" height={16} />
            </View>
          </View>
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <View style={styles.totalContainer}>
            <SkeletonLoader width={80} height={18} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={40} height={12} />
          </View>
          <SkeletonLoader width={150} height={40} borderRadius={8} />
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoading && apiItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Jhola</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyCart}>
          <Ionicons name="bag-outline" size={80} color={colors.gray} />
          <Text style={[styles.emptyCartText, { color: colors.text }]}>Your jhola is empty</Text>
          <Text style={[styles.emptyCartSubtext, { color: colors.gray }]}>Add some products to get started</Text>
          <TouchableOpacity 
            style={[styles.shopNowButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/' as any)}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Jhola ({apiItems.length} items)</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <FlatList
          data={apiItems}
          renderItem={({ item }) => (
            <View style={[styles.cartItem, { borderBottomColor: colors.border }]}>
              <Image source={{ uri: item.product?.images?.[0] }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.product?.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.gray }]}>₹{item.unitPrice}</Text>
                <Text style={[styles.stockInfo, { color: item.isAvailable ? 'green' : 'red' }]}>
                  {item.isAvailable ? 'In stock' : 'Out of stock'}
                </Text>
                <View style={[styles.quantityContainer, { backgroundColor: colors.primary }]}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1, item, false)}
                  >
                    <Ionicons name="remove" size={16} color="#ffffffff" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1, item, true)}
                  >
                    <Ionicons name="add" size={16} color="#ffffffff" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      <View style={[styles.billDetails, { backgroundColor: colors.lightGray }]}>
        <Text style={[styles.billTitle, { color: colors.text }]}>Bill Details</Text>
        <View style={styles.billRow}>
          <Text style={[styles.billLabel, { color: colors.gray }]}>Items Total</Text>
          <Text style={[styles.billValue, { color: colors.text }]}>₹{cartSummary?.subtotal || 0}</Text>
        </View>
        <View style={[styles.billRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Grand Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>₹{finalTotal}</Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.totalContainer}>
          <Text style={[styles.totalText, { color: colors.text }]}>₹{finalTotal}</Text>
          <Text style={[styles.totalSubtext, { color: colors.gray }]}>Total</Text>
        </View>
        <TouchableOpacity 
          style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
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
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  shopNowButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    marginBottom: 4,
  },
  stockInfo: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    padding: 6,
  },
  quantity: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  removeButton: {
    padding: 8,
  },
  billDetails: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
  },
  billValue: {
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  totalContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalSubtext: {
    fontSize: 12,
  },
  checkoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});