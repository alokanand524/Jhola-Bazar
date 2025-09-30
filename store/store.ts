import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import categoriesReducer from './slices/categoriesSlice';
import deliveryReducer from './slices/deliverySlice';
import addressReducer from './slices/addressSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'cart', 'address'],
};

const rootReducer = combineReducers({
  cart: cartReducer,
  products: productsReducer,
  user: userReducer,
  ui: uiReducer,
  categories: categoriesReducer,
  delivery: deliveryReducer,
  address: addressReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;