export const RAZORPAY_CONFIG = {
  key: 'rzp_test_1DP5mmOlF5G5ag', // Standard test key
  currency: 'INR',
  name: 'Jhola Bazar',
  description: 'Grocery Order Payment',
  image: '', // Empty for now
  theme: {
    color: '#00B761'
  }
};

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id: string;
  };
}