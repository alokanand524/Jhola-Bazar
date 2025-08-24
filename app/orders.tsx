import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'pending' | 'cancelled';
  total: number;
  items: OrderItem[];
  deliveryAddress: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    date: '2024-01-15',
    status: 'delivered',
    total: 245,
    deliveryAddress: 'Home - New Delhi',
    items: [
      { id: '1', name: 'Fresh Tomatoes', quantity: 2, price: 40, image: 'https://images5.alphacoders.com/368/368817.jpg?w=300' },
      { id: '2', name: 'Bananas', quantity: 1, price: 60, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300' },
      { id: '3', name: 'Milk', quantity: 3, price: 28, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300' },
    ]
  },
  {
    id: '2',
    date: '2024-01-12',
    status: 'delivered',
    total: 180,
    deliveryAddress: 'Work - Gurgaon',
    items: [
      { id: '4', name: 'Bread', quantity: 2, price: 25, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300' },
      { id: '5', name: 'Coca Cola', quantity: 2, price: 40, image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300' },
    ]
  },
  {
    id: '3',
    date: '2024-01-10',
    status: 'cancelled',
    total: 95,
    deliveryAddress: 'Home - New Delhi',
    items: [
      { id: '6', name: 'Shampoo', quantity: 1, price: 180, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300' },
    ]
  }
];

export default function OrdersScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#00B761';
      case 'pending': return '#FF9500';
      case 'cancelled': return '#FF3B30';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => router.push(`/order-details/${item.id}` as any)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.itemsPreview}>
        {item.items.slice(0, 3).map((orderItem, index) => (
          <Image key={orderItem.id} source={{ uri: orderItem.image }} style={styles.itemImage} />
        ))}
        {item.items.length > 3 && (
          <View style={styles.moreItems}>
            <Text style={styles.moreItemsText}>+{item.items.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>{item.items.length} items</Text>
        <Text style={styles.orderTotal}>₹{item.total}</Text>
      </View>

      <View style={styles.addressContainer}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={styles.addressText}>{item.deliveryAddress}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        data={mockOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  itemsPreview: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  moreItems: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});