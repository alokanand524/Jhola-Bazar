import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  unit: string;
  inStock: boolean;
  rating: number;
  // deliveryTime: string;
}

interface ProductsState {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  loading: boolean;
}

const initialState: ProductsState = {
  products: [],
  categories: ['All', 'Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Beverages', 'Personal Care'],
  selectedCategory: 'All',
  searchQuery: '',
  loading: false,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setProducts, setSelectedCategory, setSearchQuery, setLoading } = productsSlice.actions;
export default productsSlice.reducer;