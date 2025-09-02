import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import categoriesReducer from './slices/categoriesSlice';
import deliveryReducer from './slices/deliverySlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
    user: userReducer,
    ui: uiReducer,
    categories: categoriesReducer,
    delivery: deliveryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;