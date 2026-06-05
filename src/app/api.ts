import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { initialProducts } from './data/initialProducts';

// ================== LOCAL STORAGE API (Primary) ==================
const LS_KEY = 'cafe-menu-products';

// Helper to get products from localStorage
const getLocalProducts = (): any[] => {
  const stored = localStorage.getItem(LS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all products have an id
        const withIds = parsed.map((p, index) => ({
          ...p,
          id: p.id || `fallback-${index}-${Date.now()}`
        }));
        // Save back if any ids were added
        if (withIds.some((p, i) => p.id !== parsed[i].id)) {
          localStorage.setItem(LS_KEY, JSON.stringify(withIds));
        }
        return withIds;
      }
    } catch (e) {
      console.error('Failed to parse local products', e);
    }
  }
  // Initialize with initial products that already have ids
  localStorage.setItem(LS_KEY, JSON.stringify(initialProducts));
  return initialProducts;
};

// Helper to save products to localStorage
const saveLocalProducts = (products: any[]) => {
  localStorage.setItem(LS_KEY, JSON.stringify(products));
};

// ================== SUPABASE API (Fallback, disabled for now) ==================
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-69dd17e9`;

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// ============== AUTH API (Disabled, use simple auth) ==============
export const signUp = async (email: string, password: string, name: string) => {
  // For demo, just store a fake session
  localStorage.setItem('cafe-menu-auth', JSON.stringify({ email, name }));
  return { user: { email, name } };
};

export const signIn = async (email: string, password: string) => {
  // Demo sign in - accept any email/password
  localStorage.setItem('cafe-menu-auth', JSON.stringify({ email }));
  return { user: { email } };
};

export const signOut = async () => {
  localStorage.removeItem('cafe-menu-auth');
};

export const getSession = async () => {
  const auth = localStorage.getItem('cafe-menu-auth');
  if (auth) {
    return { user: JSON.parse(auth) };
  }
  return null;
};

// ============== PRODUCTS API (Use Local Storage) ==============

export const getProducts = async () => {
  return getLocalProducts();
};

export const createProduct = async (product: any) => {
  const products = getLocalProducts();
  const newProduct = {
    ...product,
    id: Date.now().toString(), // Simple unique ID
  };
  const updated = [...products, newProduct];
  saveLocalProducts(updated);
  return newProduct;
};

export const updateProduct = async (id: string, updates: any) => {
  const products = getLocalProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveLocalProducts(products);
    return products[index];
  }
  throw new Error('Product not found');
};

export const deleteProduct = async (id: string) => {
  const products = getLocalProducts();
  const updated = products.filter(p => p.id !== id);
  saveLocalProducts(updated);
  return true;
};

// ============== IMAGE UPLOAD (Use placeholder for demo) ==============
export const uploadImage = async (file: File) => {
  // For demo, use a placeholder image based on file name
  return {
    url: `https://picsum.photos/seed/${file.name}/400/300`,
  };
};

// ============== CATEGORIES API ==================
export const getCategories = async () => {
  // Static categories based on our menu
  return [
    { name: "قهوة ساخنة" },
    { name: "شاي ومشروبات عشبية" },
    { name: "مشروبات باردة" },
    { name: "عصائر فريش" },
    { name: "مشروبات غازية ومياه" },
  ];
};

export const createCategory = async (name: string) => {
  // Demo: just return the category
  return { name };
};
