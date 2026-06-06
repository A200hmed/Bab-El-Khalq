import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { initialProducts } from './data/initialProducts';

// Initialize Supabase Client
const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabase = createClient(supabaseUrl, publicAnonKey);

// ============== AUTH API ==============
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// ============== PRODUCTS API (Supabase) ==============
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // If table doesn't exist yet, use initial products
    console.warn('Using initial products, error fetching from Supabase:', error);
    return initialProducts;
  }

  if (!data || data.length === 0) {
    // Insert initial products if table exists but is empty
    for (const product of initialProducts) {
      await createProduct(product);
    }
    return initialProducts;
  }

  return data;
};

export const createProduct = async (product: any) => {
  const newProduct = {
    ...product,
    id: product.id || Date.now().toString(),
  };

  const { data, error } = await supabase
    .from('products')
    .insert([newProduct])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateProduct = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// ============== IMAGE UPLOAD ==============
export const uploadImage = async (file: File) => {
  // For demo, use placeholder
  return {
    url: `https://picsum.photos/seed/${file.name}/400/300`,
  };
};

// ============== CATEGORIES API ==================
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
