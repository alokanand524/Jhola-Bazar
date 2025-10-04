import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { tokenManager } from '@/utils/tokenManager';
import { API_ENDPOINTS } from '@/constants/api';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  deliveryAddress: string;
  arrivingTime?: string;
}



const OrderCardSkeleton = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.orderCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.orderHeader}>
        <SkeletonLoader width={120} height={16} style={{ marginBottom: 12 }} />
      </View>
      
      <View style={styles.productImagesContainer}>
        {[1, 2, 3, 4].map((item) => (
          <SkeletonLoader key={item} width={50} height={50} borderRadius={8} style={{ marginRight: 8 }} />
        ))}
      </View>
      
      <View style={styles.orderInfo}>
        <SkeletonLoader width={100} height={13} style={{ marginBottom: 6 }} />
        <SkeletonLoader width={140} height={13} />
      </View>
    </View>
  );
};

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
  }, [isLoggedIn]);
  
  const fetchOrders = async () => {
    try {
      const response = await tokenManager.makeAuthenticatedRequest(API_ENDPOINTS.ORDERS.BASE);

      if (response.ok) {
        const result = await response.json();
        const ordersData = result.data?.orders || [];
        
        const transformedOrders = ordersData.map((order: any, index: number) => {
          let status = 'placed';
          if (index === 0) status = 'delivered';
          else if (index === 1) status = 'placed';
          else if (index === 2) status = 'on the way';
          
          return {
            id: order.id,
            orderNumber: order.orderNumber,
            date: order.createdAt,
            status: status,
            total: parseFloat(order.totalAmount || order.total || '0'),
            items: order.items || [],
            deliveryAddress: 'Delivery address',
            arrivingTime: order.estimatedDeliveryTime || '30-45 mins'
          };
        });
        
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    const checkAuthAndFetch = async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      fetchOrders();
    };
    
    checkAuthAndFetch();
  }, []);

  const onRefresh = React.useCallback(async () => {
    if (!isLoggedIn) return;
    setRefreshing(true);
    try {
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  }, [isLoggedIn]);
  


  const renderProductImages = (items: OrderItem[]) => {
    const maxImages = 4;
    const displayItems = items.slice(0, maxImages);
    const remainingCount = items.length - maxImages;

    return (
      <View style={styles.productImagesContainer}>
        {displayItems.map((product, index) => (
          <View key={index} style={styles.productImageBox}>
            <Image 
              source={{ uri: product.image || 'https://via.placeholder.com/50' }} 
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.productImageBox, styles.moreItemsBox, { backgroundColor: colors.gray + '20' }]}>
            <Text style={[styles.moreItemsText, { color: colors.text }]}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { backgroundColor: colors.background, borderColor: colors.border }]}
      onPress={() => router.push(`/order-details/${item.id}` as any)}
    >
      <View style={styles.orderHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.orderNumber}</Text>
      </View>

      {renderProductImages(item.items)}

      <View style={styles.orderInfo}>
        <View style={styles.dateTimeContainer}>
          <Text style={[styles.orderDate, { color: colors.gray }]}>
            {new Date(item.date).toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </Text>
          <View style={styles.arrivingContainer}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={[styles.arrivingTime, { color: colors.primary }]}>Arriving in {item.arrivingTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isLoggedIn) {
    return null;
  }

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

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={80} color={colors.gray} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Orders Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.gray }]}>Your order history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
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
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 13,
    fontWeight: '500',
  },

  productImagesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  productImageBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  moreItemsBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginTop: 8,
  },
  dateTimeContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  arrivingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrivingTime: {
    fontSize: 13,
    fontWeight: '500',
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