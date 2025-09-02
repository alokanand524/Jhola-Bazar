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

export const profileAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/profile`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
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