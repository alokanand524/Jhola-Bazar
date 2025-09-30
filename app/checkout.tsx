import { SkeletonLoader } from '@/components/SkeletonLoader';
import EnterMoreDetailsModal from '@/components/EnterMoreDetailsModal';
import PaymentStatusModal from '@/components/PaymentStatusModal';
import { useTheme } from '@/hooks/useTheme';
import { clearCart } from '@/store/slices/cartSlice';
import { RootState } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { tokenManager } from '@/utils/tokenManager';
import { WebView } from 'react-native-webview';
import { RAZORPAY_CONFIG } from '@/utils/razorpayConfig';

const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', icon: 'cash' },
  { id: 'upi', name: 'UPI Payment', icon: 'phone-portrait' },
];

export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const { items, total } = useSelector((state: RootState) => state.cart);
  const { selectedAddress } = useSelector((state: RootState) => state.address);
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadDeliveryAddress();
    loadSavedAddresses();
    loadRecentLocations();
    setIsLoading(false);
  }, []);
  
  const loadDeliveryAddress = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const address = await AsyncStorage.getItem('selectedDeliveryAddress');
      if (address) {
        setSelectedDeliveryAddress(JSON.parse(address));
      }
    } catch (error) {
      console.log('Error loading delivery address:', error);
    }
  };
  
  const loadSavedAddresses = async () => {
    try {
      const { addressAPI } = require('@/services/api');
      const response = await addressAPI.getAddresses();
      if (response.success && response.data) {
        const transformedAddresses = response.data.map((addr: any) => ({
          id: addr.id,
          type: addr.type,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          landmark: addr.landmark,
          isDefault: addr.isDefault,
          fullAddress: addr.fullAddress,
          pincode: addr.pincode
        }));
        setSavedAddresses(transformedAddresses);
      }
    } catch (error) {
      console.log('Error loading saved addresses:', error);
      setSavedAddresses([]);
    }
  };
  
  const loadRecentLocations = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const locations = await AsyncStorage.getItem('savedLocations');
      if (locations) {
        setRecentLocations(JSON.parse(locations));
      }
    } catch (error) {
      console.log('Error loading recent locations:', error);
    }
  };
  
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [isReferralApplied, setIsReferralApplied] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [recentLocations, setRecentLocations] = useState<any[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<{
    visible: boolean;
    status: 'processing' | 'success' | 'failed';
    message: string;
  }>({ visible: false, status: 'processing', message: '' });
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState('');

  // const deliveryFee = 25;
  const deliveryFee = 0; // Delivery fee disabled
  const finalTotal = total + deliveryFee - referralDiscount;

  const handleApplyReferral = () => {
    if (referralCode.trim().length >= 6) {
      const discount = Math.min(50, total * 0.1); // ₹50 or 10% of total, whichever is less
      setReferralDiscount(discount);
      setIsReferralApplied(true);
      Alert.alert('Success!', `Referral code applied! You saved ₹${discount}`);
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid referral code');
    }
  };

  const handleRemoveReferral = () => {
    setReferralCode('');
    setReferralDiscount(0);
    setIsReferralApplied(false);
  };

  const createRazorpayOrder = async (amount: number) => {
    // For testing without backend, we'll skip order creation
    return {
      id: null, // No order ID for direct payment
      amount: amount * 100,
      currency: 'INR',
      status: 'created'
    };
  };

  const handleRazorpayPayment = async (orderData: any) => {
    try {
      setPaymentStatus({ visible: true, status: 'processing', message: 'Initializing payment...' });
      
      const razorpayOrder = await createRazorpayOrder(finalTotal);
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              background: #f5f5f5;
            }
            .container {
              background: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            .loading {
              margin: 20px 0;
            }
            .error {
              color: #ff0000;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Jhola Bazar Payment</h3>
            <p>Amount: ₹${finalTotal}</p>
            <div id="loading" class="loading">Loading payment gateway...</div>
            <div id="error" class="error" style="display:none;"></div>
          </div>
          
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <script>
            function showError(message) {
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error').style.display = 'block';
              document.getElementById('error').innerText = message;
            }
            
            try {
              var options = {
                key: '${RAZORPAY_CONFIG.key}',
                amount: ${finalTotal * 100},
                currency: 'INR',
                name: 'Jhola Bazar',
                description: 'Grocery Order Payment',
                theme: { color: '#00B761' },
                prefill: {
                  name: 'Customer',
                  email: 'customer@jholabazar.com',
                  contact: '9999999999'
                },
                handler: function(response) {
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'success',
                    data: response
                  }));
                },
                modal: {
                  ondismiss: function() {
                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'dismiss'
                    }));
                  }
                }
              };
              
              // Only add order_id if it exists
              ${razorpayOrder.id ? `options.order_id = '${razorpayOrder.id}';` : ''}
              
              if (typeof Razorpay !== 'undefined') {
                var rzp = new Razorpay(options);
                rzp.on('payment.failed', function(response) {
                  window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'failed',
                    error: response.error
                  }));
                });
                
                setTimeout(function() {
                  rzp.open();
                }, 1000);
              } else {
                showError('Payment gateway failed to load');
              }
            } catch (e) {
              showError('Error: ' + e.message);
            }
          </script>
        </body>
        </html>
      `;
      
      setPaymentHtml(html);
      setPaymentStatus({ visible: false, status: 'processing', message: '' });
      setShowPaymentWebView(true);
    } catch (error) {
      console.error('Razorpay setup error:', error);
      setPaymentStatus({ visible: true, status: 'failed', message: 'Failed to initialize payment' });
      setTimeout(() => {
        setPaymentStatus({ visible: false, status: 'processing', message: '' });
        setIsPlacingOrder(false);
      }, 2000);
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', message);
      
      setShowPaymentWebView(false);
      
      if (message.type === 'success') {
        console.log('Payment Success:', message.data);
        setPaymentStatus({ visible: true, status: 'processing', message: 'Processing payment...' });
        completeOrder(getCurrentOrderData(), 'UPI', message.data.razorpay_payment_id);
      } else if (message.type === 'failed') {
        console.log('Payment Failed:', message.error);
        setPaymentStatus({ visible: true, status: 'failed', message: 'Payment failed' });
        setTimeout(() => {
          setPaymentStatus({ visible: false, status: 'processing', message: '' });
          setIsPlacingOrder(false);
        }, 2000);
      } else {
        console.log('Payment dismissed or cancelled');
        setPaymentStatus({ visible: true, status: 'failed', message: 'Payment cancelled' });
        setTimeout(() => {
          setPaymentStatus({ visible: false, status: 'processing', message: '' });
          setIsPlacingOrder(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      setShowPaymentWebView(false);
      setPaymentStatus({ visible: true, status: 'failed', message: 'Payment error occurred' });
      setTimeout(() => {
        setPaymentStatus({ visible: false, status: 'processing', message: '' });
        setIsPlacingOrder(false);
      }, 2000);
    }
  };

  const [currentOrderData, setCurrentOrderData] = useState<any>(null);

  const getCurrentOrderData = () => {
    return currentOrderData;
  };

  const completeOrder = async (orderData: any, paymentMethod: string, paymentId?: string) => {
    try {
      const payload = {
        storeId: orderData.storeId,
        deliveryAddressId: orderData.deliveryAddressId,
        items: orderData.items,
        ...(paymentMethod === 'UPI' ? {
          paymentMethod: 'RAZORPAY',
          paymentGateway: 'razorpay',
          paymentId: paymentId
        } : {
          paymentMethod: 'CASH_ON_DELIVERY'
        })
      };

      console.log('Order payload:', JSON.stringify(payload, null, 2));

      const response = await tokenManager.makeAuthenticatedRequest('https://jholabazar.onrender.com/api/v1/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (response.ok) {
        dispatch(clearCart());
        setPaymentStatus({ visible: true, status: 'success', message: 'Order placed successfully!' });
        setTimeout(() => {
          setPaymentStatus({ visible: false, status: 'processing', message: '' });
          router.push('/(tabs)/' as any);
        }, 2000);
      } else {
        console.log('Order creation failed:', result);
        setPaymentStatus({ visible: true, status: 'failed', message: result.message || 'Failed to place order' });
        setTimeout(() => {
          setPaymentStatus({ visible: false, status: 'processing', message: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedAddress.id) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        Alert.alert('Error', 'Please login to place order');
        setIsPlacingOrder(false);
        return;
      }

      // Get cart items for the order
      const cartResponse = await tokenManager.makeAuthenticatedRequest('https://jholabazar.onrender.com/api/v1/cart/');
      const cartData = await cartResponse.json();
      const cartItems = cartData.data?.carts?.[0]?.items || [];
      
      const orderItems = cartItems.map(item => {
        const variantId = (item.variant?.id || item.variantId)?.toString().trim();
        return {
          variantId: variantId,
          quantity: parseInt(item.quantity)
        };
      });
      
      const orderData = {
        storeId: '0d29835f-3840-4d72-a26d-ed96ca744a34',
        deliveryAddressId: selectedAddress.id,
        items: orderItems
      };
      
      // Store order data for WebView callback
      setCurrentOrderData(orderData);
      
      if (selectedPayment === 'upi') {
        await handleRazorpayPayment(orderData);
      } else {
        await completeOrder(orderData, 'COD');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <SkeletonLoader width={24} height={24} />
          <SkeletonLoader width={80} height={18} />
          <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.content}>
          <View style={[styles.section, { borderBottomColor: colors.lightGray }]}>
            <SkeletonLoader width={120} height={16} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="100%" height={60} borderRadius={8} />
          </View>
          {[1, 2, 3].map((item) => (
            <View key={item} style={[styles.section, { borderBottomColor: colors.lightGray }]}>
              <SkeletonLoader width="60%" height={16} style={{ marginBottom: 12 }} />
              <SkeletonLoader width="100%" height={40} />
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Customer Details - Commented out as requested */}
        {/* <View style={[styles.section, { borderBottomColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Details</Text>
          <TouchableOpacity 
            style={[styles.addressCard, { backgroundColor: colors.lightGray }]}
            onPress={() => setShowDetailsModal(true)}
          >
            <Ionicons name="person" size={20} color={colors.primary} />
            <View style={styles.addressInfo}>
              <Text style={[styles.addressType, { color: colors.text }]}>Customer Info</Text>
              <Text style={[styles.addressText, { color: colors.gray }]}>
                {customerDetails ? 
                  `${customerDetails.name}${customerDetails.mobile ? ' • ' + customerDetails.mobile : ''}` : 
                  'Enter customer details'
                }
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowDetailsModal(true)}>
              <Text style={[styles.changeText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View> */}

        {/* Delivery Address */}
        <View style={[styles.section, { borderBottomColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Delivery Address</Text>
          <View style={[styles.addressCard, { backgroundColor: colors.lightGray }]}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.addressInfo}>
              <Text style={[styles.addressType, { color: colors.text }]}>Delivery to</Text>
              <Text style={[styles.addressText, { color: colors.gray }]}>
                {selectedAddress ? 
                  (selectedAddress.address.length > 40 ? 
                    selectedAddress.address.substring(0, 40) + '...' : 
                    selectedAddress.address) : 
                  'Select delivery address'
                }
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/saved-locations')}>
              <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { borderBottomColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.id} style={[styles.orderItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.itemQuantity, { color: colors.gray }]}>x{item.quantity}</Text>
              <Text style={[styles.itemPrice, { color: colors.text }]}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
       {/*  <View style={[styles.section, { borderBottomColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                { borderBottomColor: colors.border },
                selectedPayment === method.id && { backgroundColor: colors.lightGray }
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Ionicons name={method.icon as any} size={24} color={colors.gray} />
              <Text style={[styles.paymentText, { color: colors.text }]}>{method.name}</Text>
              <View style={[styles.radioButton, { borderColor: colors.primary }]}>
                {selectedPayment === method.id && (
                  <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View> */}

        {/* Referral Code */}
        <View style={[styles.section, { borderBottomColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Have a Coupon Code?</Text>
          {!isReferralApplied ? (
            <View style={styles.referralContainer}>
              <TextInput
                style={[
                  styles.referralInput,
                  { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                placeholder="Enter coupon code"
                placeholderTextColor={colors.gray}
                value={referralCode}
                onChangeText={setReferralCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={handleApplyReferral}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.appliedReferral, { backgroundColor: colors.lightGray }]}>
              <View style={styles.appliedInfo}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.appliedText, { color: colors.text }]}>Code Applied: {referralCode}</Text>
              </View>
              <TouchableOpacity onPress={handleRemoveReferral}>
                <Ionicons name="close" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bill Details */}
        <View style={[styles.section, { borderBottomColor: colors.lightGray }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.gray }]}>Items Total</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{total}</Text>
          </View>
          {/* <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.gray }]}>Delivery Fee</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{deliveryFee}</Text>
          </View> */}
          {referralDiscount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.primary }]}>Referral Discount</Text>
              <Text style={[styles.billValue, { color: colors.primary }]}>-₹{referralDiscount}</Text>
            </View>
          )}
          <View style={[styles.billRow, styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Grand Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>₹{finalTotal}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.paymentSelector, { backgroundColor: colors.lightGray }]}
          onPress={() => setShowPaymentModal(true)}
        >
          <View style={styles.paymentInfo}>
            <Ionicons 
              name={paymentMethods.find(p => p.id === selectedPayment)?.icon as any} 
              size={20} 
              color={colors.text} 
            />
            <Text style={[styles.paymentLabel, { color: colors.text }]}>
              {paymentMethods.find(p => p.id === selectedPayment)?.name}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.gray} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.placeOrderButton, 
            { backgroundColor: colors.primary },
            isPlacingOrder && styles.disabledButton
          ]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          <Text style={styles.placeOrderText}>₹{finalTotal}</Text>
          <Text style={styles.placeOrderSubtext}>
            {isPlacingOrder ? 'Placing...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Address Modal */}
      <Modal visible={showAddressModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Delivery Address</Text>
            
            {savedAddresses.length > 0 && (
              <View>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Saved Addresses</Text>
                {savedAddresses.map((address) => (
                  <TouchableOpacity
                    key={address.id}
                    style={styles.modalOption}
                    onPress={() => {
                      const selectedAddr = {
                        id: address.id,
                        name: address.type.charAt(0).toUpperCase() + address.type.slice(1),
                        address: `${address.landmark ? address.landmark + ', ' : ''}${address.pincode ? address.pincode.city + ', ' + address.pincode.code : ''}`,
                        timestamp: new Date().toISOString()
                      };
                      setSelectedDeliveryAddress(selectedAddr);
                      setShowAddressModal(false);
                    }}
                  >
                    <View style={styles.modalOptionLeft}>
                      <Ionicons name={address.type === 'home' ? 'home' : address.type === 'office' ? 'business' : 'location'} size={24} color={colors.primary} />
                      <View>
                        <Text style={[styles.modalOptionText, { color: colors.text }]}>{address.type.charAt(0).toUpperCase() + address.type.slice(1)}</Text>
                        <Text style={[styles.modalOptionSubtext, { color: colors.gray }]}>
                          {address.landmark ? address.landmark + ', ' : ''}{address.pincode ? address.pincode.city + ', ' + address.pincode.code : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {recentLocations.length > 0 && (
              <View>
                <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Recent Locations</Text>
                {recentLocations.slice(0, 3).map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={styles.modalOption}
                    onPress={() => {
                      const selectedAddr = {
                        id: location.id,
                        name: location.locality,
                        address: location.fullAddress,
                        timestamp: new Date().toISOString()
                      };
                      setSelectedDeliveryAddress(selectedAddr);
                      setShowAddressModal(false);
                    }}
                  >
                    <View style={styles.modalOptionLeft}>
                      <Ionicons name="location" size={24} color={colors.primary} />
                      <View>
                        <Text style={[styles.modalOptionText, { color: colors.text }]}>{location.locality}</Text>
                        <Text style={[styles.modalOptionSubtext, { color: colors.gray }]}>{location.fullAddress}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.addNewAddress, { backgroundColor: colors.lightGray }]}
              onPress={() => {
                setShowAddressModal(false);
                router.push('/select-address');
              }}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={[styles.addNewAddressText, { color: colors.primary }]}>Add New Address</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalClose, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddressModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Payment Method</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedPayment(method.id);
                  setShowPaymentModal(false);
                }}
              >
                <View style={styles.modalOptionLeft}>
                  <Ionicons name={method.icon as any} size={24} color={colors.text} />
                  <Text style={[styles.modalOptionText, { color: colors.text }]}>{method.name}</Text>
                </View>
                {selectedPayment === method.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={[styles.modalClose, { backgroundColor: colors.primary }]}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Enter More Details Modal */}
      <EnterMoreDetailsModal
        visible={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSubmit={(details) => setCustomerDetails(details)}
      />

      {/* Payment Status Modal */}
      <PaymentStatusModal
        visible={paymentStatus.visible}
        status={paymentStatus.status}
        message={paymentStatus.message}
      />

      {/* Razorpay WebView */}
      <Modal visible={showPaymentWebView} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <TouchableOpacity onPress={() => {
              setShowPaymentWebView(false);
              setIsPlacingOrder(false);
            }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 16, color: colors.text }}>Payment</Text>
          </View>
          <WebView
            source={{ html: paymentHtml }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            mixedContentMode="compatibility"
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('WebView error: ', nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('WebView HTTP error: ', nativeEvent);
            }}
          />
        </SafeAreaView>
      </Modal>
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
  section: {
    padding: 16,
    borderBottomWidth: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemQuantity: {
    fontSize: 14,
    marginRight: 16,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  referralContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  appliedReferral: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  appliedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appliedText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  billLabel: {
    fontSize: 14,
  },
  billValue: {
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 12,
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
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },

  paymentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  placeOrderButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeOrderSubtext: {
    color: '#fff',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalOptionSubtext: {
    fontSize: 14,
    marginLeft: 12,
    marginTop: 2,
  },
  modalClose: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  addNewAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  addNewAddressText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});