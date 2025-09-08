const API_BASE_URL = 'https://jholabazar.onrender.com/api/v1';

export interface Category {
  id: string;
  name: string;
  image: string;
  description?: string;
}

export interface CategoryWithChildren {
  id: string;
  name: string;
  image: string;
  children: Category[];
  products: any[];
}

export const categoryAPI = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.data.categories || [];
  },

  getCategoryById: async (id: string): Promise<CategoryWithChildren> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    const data = await response.json();
    return {
      id: data.data.id,
      name: data.data.name,
      image: data.data.image,
      children: data.data.children || [],
      products: data.data.products || []
    };
  }
};

export const authAPI = {
  refreshToken: async (refreshToken: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to refresh token');
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
};

export const profileAPI = {
  getProfile: async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      let token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No auth token found');
      }
      
      const makeRequest = async (authToken: string) => {
        return fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          signal: controller.signal
        });
      };
      
      let response = await makeRequest(token);
      
      // If token expired, try to refresh
      if (response.status === 401) {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await authAPI.refreshToken(refreshToken);
          await AsyncStorage.setItem('authToken', refreshResponse.accessToken);
          await AsyncStorage.setItem('refreshToken', refreshResponse.refreshToken);
          
          token = refreshResponse.accessToken;
          response = await makeRequest(token);
        }
      }
      
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  },
  
  updateProfile: async (data: { firstName?: string; lastName?: string; gender?: string; dateOfBirth?: string; email?: string }) => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },
};

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  unit?: string;
  inStock?: boolean;
  rating?: number;
  deliveryTime?: string;
  variants?: any[];
}

const transformProduct = (apiProduct: any): Product => {
  const variant = apiProduct.variants?.[0];
  const price = variant?.price;
  
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: price ? parseFloat(price.sellingPrice) : 0,
    originalPrice: price ? parseFloat(price.basePrice) : undefined,
    image: apiProduct.images?.[0] || '',
    images: apiProduct.images || [],
    category: apiProduct.category?.name || '',
    description: apiProduct.description || '',
    unit: variant ? `${variant.weight} ${variant.baseUnit}` : '',
    inStock: variant?.stock?.status === 'AVAILABLE',
    rating: 4.5,
    deliveryTime: '10 mins',
    variants: apiProduct.variants
  };
};

export const productAPI = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return (data.data.products || []).map(transformProduct);
  },

  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    const url = categoryId ? `${API_BASE_URL}/products?categoryId=${categoryId}` : `${API_BASE_URL}/products`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return (data.data.products || []).map(transformProduct);
  },

  getProductById: async (productId: string): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    const data = await response.json();
    return transformProduct(data.data.product);
  },
};

export const addressAPI = {
  getAddresses: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/addresses`);
    if (!response.ok) throw new Error('Failed to fetch addresses');
    return response.json();
  },
  
  createAddress: async (data: { addressLine1: string; addressLine2?: string; landmark?: string; pincodeId: string; type: 'home' | 'office' | 'other' }) => {
    const response = await fetch(`${API_BASE_URL}/profile/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create address');
    return response.json();
  },
  
  updateAddress: async (id: string, data: { addressLine1?: string; addressLine2?: string; landmark?: string; pincodeId?: string; type?: 'home' | 'office' | 'other' }) => {
    const response = await fetch(`${API_BASE_URL}/profile/addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update address');
    return response.json();
  },
  
  deleteAddress: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/profile/addresses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete address');
    return response.json();
  },
  
  getPincodes: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/pincodes`);
    if (!response.ok) throw new Error('Failed to fetch pincodes');
    return response.json();
  },
};