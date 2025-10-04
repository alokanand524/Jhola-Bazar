import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { tokenManager } from '@/utils/tokenManager';
import { API_ENDPOINTS } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await tokenManager.makeAuthenticatedRequest(API_ENDPOINTS.ORDERS.BY_ID(id as string));
      
      if (response.ok) {
        const result = await response.json();
        const orderData = result.data;
        
        // Simulate different statuses based on order ID
        if (orderData && orderData.id) {
          const orderId = orderData.id;
          if (orderId.endsWith('1') || orderId.includes('a')) orderData.status = 'delivered';
          else if (orderId.endsWith('2') || orderId.includes('b')) orderData.status = 'placed';
          else orderData.status = 'on_the_way';
        }
        
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <SkeletonLoader width={24} height={24} />
          <SkeletonLoader width={120} height={18} style={{ marginLeft: 16 }} />
        </View>
        <ScrollView style={styles.content}>
          <SkeletonLoader width="100%" height={120} borderRadius={12} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={200} borderRadius={12} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={80} borderRadius={12} style={{ marginBottom: 16 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#00B761';
      case 'payment confirmed': return '#00B761';
      case 'pending': return '#FF9500';
      case 'cancelled': return '#FF3B30';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.lightGray }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: colors.background }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.orderId, { color: colors.text }]}>Order #{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status?.toLowerCase().replace('_', ' ') || 'pending') }]}>
              <Text style={styles.statusText}>{order.status?.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={[styles.orderDate, { color: colors.gray }]}>Ordered on {new Date(order.createdAt).toLocaleDateString()}</Text>
          {order.slotStartTime && (
            <Text style={[styles.deliveryTime, { color: colors.primary }]}>Delivery at {new Date(order.slotStartTime).toLocaleTimeString()}</Text>
          )}
        </View>

        <View style={[styles.itemsCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Items ({order.items?.length || 0})</Text>
          {order.items?.map((item) => (
            <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
              <Image source={{ uri: item.variant?.product?.images?.[0] }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.variant?.product?.name || item.variant?.name}</Text>
                <Text style={[styles.itemQuantity, { color: colors.gray }]}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>₹{parseFloat(item.totalPrice || '0')}</Text>
            </View>
          ))}
        </View>

        {order.status?.toLowerCase() !== 'delivered' && (
          <View style={[styles.orderStatusCard, { backgroundColor: colors.background }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Status</Text>
            
            <View style={styles.statusFlow}>
              {['placed', 'packed', 'on the way', 'delivered'].map((status, index) => {
                const currentStatus = order.status?.toLowerCase().replace('_', ' ') || 'placed';
                let statusIndex = ['placed', 'packed', 'on the way', 'delivered'].indexOf(currentStatus);
                if (statusIndex === -1) statusIndex = 0;
                
                const isCompleted = index <= statusIndex;
                
                return (
                  <View key={status} style={styles.statusStep}>
                    <View style={styles.statusStepContent}>
                      <View style={[
                        styles.statusDot, 
                        { 
                          backgroundColor: isCompleted ? '#00B761' : colors.border,
                          borderColor: isCompleted ? '#00B761' : colors.border
                        }
                      ]}>
                        {isCompleted && (
                          <Ionicons name="checkmark" size={12} color="white" />
                        )}
                      </View>
                      <Text style={[
                        styles.statusLabel, 
                        { color: isCompleted ? colors.text : colors.gray }
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </View>
                    {index < 3 && (
                      <View style={[
                        styles.statusLine, 
                        { backgroundColor: index < statusIndex ? '#00B761' : colors.border }
                      ]} />
                    )}
                  </View>
                );
              })}
            </View>
            
            <View style={styles.arrivingInfo}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={[styles.arrivingText, { color: colors.primary }]}>Arriving in {order.estimatedDeliveryTime || '30-45 mins'}</Text>
            </View>
          </View>
        )}

        <View style={[styles.addressCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.addressDetails}>
              <Text style={[styles.addressText, { color: colors.text }]}>{order.deliveryAddress?.addressLine1}</Text>
              {order.deliveryAddress?.metadata?.contactPerson && (
                <Text style={[styles.contactText, { color: colors.gray }]}>
                  {order.deliveryAddress.metadata.contactPerson.name} • {order.deliveryAddress.metadata.contactPerson.mobile}
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={[styles.paymentCard, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bill Details</Text>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.gray }]}>Subtotal</Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>₹{parseFloat(order.subtotal || '0')}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.gray }]}>Delivery Charge</Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>₹{parseFloat(order.deliveryCharge || '0')}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.gray }]}>Tax</Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>₹{parseFloat(order.tax || '0')}</Text>
          </View>
          <View style={[styles.paymentRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.paymentLabel, { color: colors.text, fontWeight: 'bold' }]}>Total Amount</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>₹{parseFloat(order.totalAmount || '0')}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.gray }]}>Payment Method</Text>
            <Text style={[styles.paymentValue, { color: colors.text }]}>{order.paymentMethod?.replace('_', ' ')}</Text>
          </View>
        </View>
      </ScrollView>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#00B761',
    fontWeight: '500',
  },
  itemsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressDetails: {
    marginLeft: 8,
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
  },
  orderStatusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statusStepContent: {
    alignItems: 'center',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusLine: {
    position: 'absolute',
    top: 10,
    left: '60%',
    right: '-60%',
    height: 2,
  },
  arrivingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 6,
  },
  arrivingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});