import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';

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



const OrderCardSkeleton = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.orderCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.orderHeader}>
        <View>
          <SkeletonLoader width={100} height={16} style={{ marginBottom: 4 }} />
          <SkeletonLoader width={80} height={12} />
        </View>
        <SkeletonLoader width={70} height={24} borderRadius={12} />
      </View>
      
      <View style={styles.itemsPreview}>
        {[1, 2, 3].map((item) => (
          <SkeletonLoader key={item} width={40} height={40} borderRadius={8} style={{ marginRight: 8 }} />
        ))}
      </View>
      
      <View style={styles.orderFooter}>
        <SkeletonLoader width={60} height={14} />
        <SkeletonLoader width={50} height={16} />
      </View>
      
      <View style={styles.addressContainer}>
        <SkeletonLoader width={16} height={16} style={{ marginRight: 4 }} />
        <SkeletonLoader width={120} height={12} />
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    setIsLoading(false);
  }, []);
  
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
      style={[styles.orderCard, { backgroundColor: colors.background, borderColor: colors.border }]}
      onPress={() => router.push(`/order-details/${item.id}` as any)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id}</Text>
          <Text style={[styles.orderDate, { color: colors.gray }]}>{new Date(item.date).toLocaleDateString()}</Text>
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
          <View style={[styles.moreItems, { backgroundColor: colors.lightGray }]}>
            <Text style={[styles.moreItemsText, { color: colors.gray }]}>+{item.items.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={[styles.itemCount, { color: colors.gray }]}>{item.items.length} items</Text>
        <Text style={[styles.orderTotal, { color: colors.text }]}>₹{item.total}</Text>
      </View>

      <View style={styles.addressContainer}>
        <Ionicons name="location-outline" size={16} color={colors.gray} />
        <Text style={[styles.addressText, { color: colors.gray }]}>{item.deliveryAddress}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <SkeletonLoader width={24} height={24} />
          <SkeletonLoader width={100} height={18} style={{ marginLeft: 16 }} />
        </View>
        <View style={styles.ordersList}>
          {[1, 2, 3].map((item) => (
            <OrderCardSkeleton key={item} />
          ))}
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
      </View>

      {/* Empty state */}
      <View style={styles.emptyState}>
        <Ionicons name="bag-outline" size={80} color={colors.gray} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Orders Yet</Text>
        <Text style={[styles.emptySubtitle, { color: colors.gray }]}>Your order history will appear here</Text>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
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
  },
  orderDate: {
    fontSize: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 12,
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
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});