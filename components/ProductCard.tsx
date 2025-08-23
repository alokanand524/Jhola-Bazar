import { addToCart, updateQuantity } from '@/store/slices/cartSlice';
import { Product } from '@/store/slices/productsSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();
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
      style={styles.container}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.unit}>{product.unit}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
          )}
        </View>
        <View style={styles.footer}>
          <Text style={styles.deliveryTime}>{product.deliveryTime}</Text>
          {cartItem ? (
            <View style={styles.quantityContainer}>
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
            <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
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
    backgroundColor: '#dfdfdf13',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: '35%',
    borderWidth: 1,
    borderColor: '#44ff00ff',
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
    color: '#333',
    marginBottom: 4,
  },
  unit: {
    fontSize: 12,
    color: '#666',
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
    color: '#333',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#00B761',
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
    backgroundColor: '#00B761',
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