import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  address: string;
  landmark?: string;
  isDefault: boolean;
}

interface UserState {
  name: string;
  phone: string;
  addresses: Address[];
  selectedAddress: Address | null;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  name: '',
  phone: '',
  addresses: [],
  selectedAddress: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ name: string; phone: string }>) => {
      state.name = action.payload.name;
      state.phone = action.payload.phone;
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
    logout: (state) => {
      state.name = '';
      state.phone = '';
      state.addresses = [];
      state.selectedAddress = null;
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, addAddress, setSelectedAddress, logout } = userSlice.actions;
export default userSlice.reducer;