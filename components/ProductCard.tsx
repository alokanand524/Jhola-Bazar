import { addToCart, updateQuantity } from '@/store/slices/cartSlice';
import { Product } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '@/hooks/useTheme';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const cartItem = useSelector((state: RootState) => 
    state.cart.items.find(item => item.id === product.id)
  );

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    }));
  };

  const handleUpdateQuantity = (quantity: number) => {
    dispatch(updateQuantity({ id: product.id, quantity }));
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.lightGray, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
        <Text style={[styles.unit, { color: colors.gray }]}>{product.unit}</Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.text }]}>₹{product.price}</Text>
          {product.originalPrice && (
            <Text style={[styles.originalPrice, { color: colors.gray }]}>₹{product.originalPrice}</Text>
          )}
        </View>
        <View style={styles.footer}>
          {/* <Text style={styles.deliveryTime}>10 mins</Text> */}
          {cartItem ? (
            <View style={[styles.quantityContainer, { backgroundColor: colors.primary }]}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(cartItem.quantity - 1)}
              >
                <Ionicons name="remove" size={16} color="#ffffffff" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{cartItem.quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleUpdateQuantity(cartItem.quantity + 1)}
              >
                <Ionicons name="add" size={16} color="#ffffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={handleAddToCart}>
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '35%',
    borderWidth: 1,
    minWidth: 120,
  },
  image: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  unit: {
    fontSize: 12,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 10,
    color: '#666',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 4,
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
});