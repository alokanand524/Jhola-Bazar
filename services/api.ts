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