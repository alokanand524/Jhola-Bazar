import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private pushToken: string | null = null;
  private cartTimerId: NodeJS.Timeout | null = null;
  private orderPollingInterval: NodeJS.Timeout | null = null;
  private lastOrderStatuses: { [orderId: string]: string } = {};

  async initialize() {
    await this.registerForPushNotifications();
    this.startOrderStatusPolling();
  }

  async registerForPushNotifications() {
    if (!Device.isDevice) {
      logger.warn('Must use physical device for Push Notifications');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      logger.warn('Failed to get push token for push notification');
      return;
    }

    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      this.pushToken = token;
      logger.info('Push token obtained successfully');
    } catch (error) {
      logger.error('Error getting push token', { error: error.message });
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  // Check cart from API and schedule reminder if items exist
  async checkCartAndScheduleReminder() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/cart/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      const cartItems = result.data?.carts?.[0]?.items || [];
      
      if (cartItems.length > 0) {
        this.scheduleCartReminder();
      }
    } catch (error) {
      logger.error('Error checking cart', { error: error.message });
    }
  }

  // Cart reminder notification (5 minutes)
  scheduleCartReminder() {
    this.clearCartReminder();
    
    this.cartTimerId = setTimeout(async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Your items are waiting! 🛒",
          body: "Your items are in the Jhola, Order now and get fresh delivery!",
          data: { type: 'cart_reminder' },
        },
        trigger: null,
      });
    }, 5 * 60 * 1000); // 5 minutes
  }

  clearCartReminder() {
    if (this.cartTimerId) {
      clearTimeout(this.cartTimerId);
      this.cartTimerId = null;
    }
  }

  // Check for new orders and send confirmation
  async checkNewOrders() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      const orders = result.data?.orders || [];
      
      // Check for new orders (created in last 2 minutes)
      const recentOrders = orders.filter(order => {
        const orderTime = new Date(order.createdAt).getTime();
        const now = Date.now();
        return (now - orderTime) < 2 * 60 * 1000; // 2 minutes
      });
      
      recentOrders.forEach(order => {
        if (!this.lastOrderStatuses[order.id]) {
          this.sendOrderConfirmation(order.id);
          this.lastOrderStatuses[order.id] = order.status;
        }
      });
    } catch (error) {
      logger.error('Error checking orders', { error: error.message });
    }
  }

  // Check order status changes
  async checkOrderStatusChanges() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) return;

      const response = await fetch(`${config.API_BASE_URL}/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      const orders = result.data?.orders || [];
      
      orders.forEach(order => {
        const lastStatus = this.lastOrderStatuses[order.id];
        const currentStatus = order.status;
        
        if (lastStatus && lastStatus !== currentStatus) {
          this.sendOrderStatusUpdate(order.id, currentStatus);
          this.lastOrderStatuses[order.id] = currentStatus;
        } else if (!lastStatus) {
          this.lastOrderStatuses[order.id] = currentStatus;
        }
      });
    } catch (error) {
      logger.error('Error checking order status', { error: error.message });
    }
  }

  // Order confirmation notification
  async sendOrderConfirmation(orderId: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Order Placed Successfully! ✅",
        body: "Your order is placed and will be delivered soon. Track your order for updates.",
        data: { type: 'order_confirmation', orderId },
      },
      trigger: null,
    });
  }

  // Order status update notification
  async sendOrderStatusUpdate(orderId: string, status: string) {
    const statusMessages = {
      'PLACED': '📋 Order Confirmed! Your order is being prepared.',
      'PACKED': '📦 Order Packed! Your order is ready for delivery.',
      'ON_THE_WAY': '🚚 Out for Delivery! Your order is on the way.',
      'DELIVERED': '✅ Order Delivered! Thank you for choosing Jhola Bazar!'
    };
    
    const message = statusMessages[status] || `Order status updated to ${status}`;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Order Update",
        body: message,
        data: { type: 'order_status', orderId, status },
      },
      trigger: null,
    });
  }

  // Start polling for order updates
  startOrderStatusPolling() {
    // Check every 30 seconds
    this.orderPollingInterval = setInterval(() => {
      this.checkNewOrders();
      this.checkOrderStatusChanges();
    }, 30 * 1000);
  }

  stopOrderStatusPolling() {
    if (this.orderPollingInterval) {
      clearInterval(this.orderPollingInterval);
      this.orderPollingInterval = null;
    }
  }

  // Handle notification responses
  setupNotificationListeners() {
    Notifications.addNotificationReceivedListener(notification => {
      logger.info('Notification received', { type: notification.request.content.data?.type });
    });

    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      logger.info('Notification tapped', { type: data?.type });
      
      // Handle different notification types
      switch (data.type) {
        case 'cart_reminder':
          // Navigate to cart
          break;
        case 'order_confirmation':
        case 'order_status':
          // Navigate to order details
          break;
      }
    });
  }
}

export default new NotificationService();