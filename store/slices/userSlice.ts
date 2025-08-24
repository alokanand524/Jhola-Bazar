import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  address: string;
  landmark?: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
}

interface UserState {
  name: string;
  phone: string;
  // email?: string; // Email functionality disabled - will be enabled later
  addresses: Address[];
  selectedAddress: Address | null;
  paymentMethods: PaymentMethod[];
  isLoggedIn: boolean;
}

const initialState: UserState = {
  name: '',
  phone: '',
  // email: '', // Email functionality disabled - will be enabled later
  addresses: [],
  selectedAddress: null,
  paymentMethods: [],
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string; phone: string; email?: string }>) => {
      state.name = action.payload.name;
      state.phone = action.payload.phone;
      // state.email = action.payload.email; // Email functionality disabled - will be enabled later
      state.isLoggedIn = true;
    },
    addAddress: (state, action: PayloadAction<Address>) => {
      state.addresses.push(action.payload);
      if (action.payload.isDefault) {
        state.selectedAddress = action.payload;
      }
    },
    setSelectedAddress: (state, action: PayloadAction<Address>) => {
      state.selectedAddress = action.payload;
    },
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethods.push(action.payload);
    },
    removePaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethods = state.paymentMethods.filter(pm => pm.id !== action.payload);
    },
    logout: (state) => {
      state.name = '';
      state.phone = '';
      // state.email = ''; // Email functionality disabled - will be enabled later
      state.addresses = [];
      state.selectedAddress = null;
      state.paymentMethods = [];
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, addAddress, setSelectedAddress, addPaymentMethod, removePaymentMethod, logout } = userSlice.actions;
export default userSlice.reducer;