// Backend URL - set this to your Railway URL in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/menu';
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'admin123';

// Helper for authenticated requests
const authFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_SECRET}`,
      ...options.headers,
    },
  });
};

// Auth (kept for compatibility)
export const signUp = async () => {
  return { user: { id: '1', email: 'admin@example.com' } };
};

export const signIn = async () => {
  return { user: { id: '1', email: 'admin@example.com' } };
};

export const signOut = async () => {
  return true;
};

export const getSession = async () => {
  return { user: { id: '1', email: 'admin@example.com' } };
};

// Menu API
export const getProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch menu');
  }
  return response.json();
};

export const createProduct = async (product: any) => {
  const response = await authFetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(product),
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  return response.json();
};

export const updateProduct = async (id: string, updates: any) => {
  const response = await authFetch(`${API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update product');
  }
  return response.json();
};

export const deleteProduct = async (id: string) => {
  const response = await authFetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete product');
  }
  return true;
};

// Image upload (kept for compatibility)
export const uploadImage = async (file: File) => {
  return {
    url: `https://picsum.photos/seed/${file.name}/400/300`,
  };
};

// Categories API
export const getCategories = async () => {
  return [
    { name: "قهوة ساخنة" },
    { name: "شاي ومشروبات عشبية" },
    { name: "مشروبات باردة" },
    { name: "عصائر فريش" },
    { name: "مشروبات غازية ومياه" },
  ];
};

export const createCategory = async (name: string) => {
  return { name };
};
