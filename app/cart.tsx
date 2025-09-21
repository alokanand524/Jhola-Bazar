import { removeFromCart, updateQuantity } from '@/store/slices/cartSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';
import { SkeletonLoader, CartItemSkeleton } from '@/components/SkeletonLoader';

export default function CartScreen() {
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleUpdateQuantity = (id: string, quantity: number, item: any) => {
    // For cart items, we need to get product data from API or use default values
    // Since cart items don't have variant data, we'll use reasonable defaults
    const minQty = 1; // Default minimum
    const maxQty = 10; // Default maximum (can be made dynamic later)
    const incrementQty = 1; // Default increment
    
    if (quantity < minQty) {
      dispatch(updateQuantity({ id, quantity: 0 }));
      return;
    }
    
    if (quantity > maxQty) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Max Order Limit', `You can order maximum ${maxQty} units of this product`);
      return;
    }
    
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const deliveryFee = 25;
  const finalTotal = total + deliveryFee;

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

  if (items.length === 0) {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Jhola  ({items.length} items)</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <View style={[styles.cartItem, { borderBottomColor: colors.border }]}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.gray }]}>₹{item.price}</Text>
                <View style={[styles.quantityContainer, { backgroundColor: colors.primary }]}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1, item)}
                  >
                    <Ionicons name="remove" size={16} color="#ffffffff" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1, item)}
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

        <View style={[styles.billDetails, { backgroundColor: colors.lightGray }]}>
          <Text style={[styles.billTitle, { color: colors.text }]}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.gray }]}>Items Total</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{total}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.gray }]}>Delivery Fee</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{deliveryFee}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Grand Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>₹{finalTotal}</Text>
          </View>
        </View>
      </ScrollView>

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
    marginBottom: 8,
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
    margin: 16,
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