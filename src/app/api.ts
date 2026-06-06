import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { initialProducts } from './data/initialProducts';

// ================== FALLBACK: LOCAL STORAGE API ==================
const LS_KEY = 'cafe-menu-products';
let useLocalStorage = false;

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

// ================== SQLITE API ==================
let db: any = null;
const SQLITE_LS_KEY = 'cafe-menu-sqlite';

async function initDatabase() {
  if (useLocalStorage) return null;
  if (db) return db;

  try {
    // Load sql.js
    const initSqlJs = await import('sql.js');
    const SQL = await initSqlJs.default({
      locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });

    // Try to load from localStorage
    let buf: Uint8Array | undefined;
    const savedDb = localStorage.getItem(SQLITE_LS_KEY);
    if (savedDb) {
      try {
        buf = new Uint8Array(JSON.parse(savedDb));
      } catch (e) {
        console.error('Failed to load saved DB', e);
      }
    }

    // Create or load database
    db = new SQL.Database(buf);

    // Create products table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image TEXT,
        available INTEGER DEFAULT 1,
        ingredients TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    // Check if products exist
    const countResult = db.exec('SELECT COUNT(*) as count FROM products');
    const count = countResult[0]?.values[0]?.[0] as number;

    if (count === 0) {
      // Insert initial products
      const insertStmt = db.prepare(`
        INSERT INTO products (id, name, description, price, category, image, available, ingredients)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const product of initialProducts) {
        insertStmt.run([
          product.id,
          product.name,
          product.description || null,
          product.price,
          product.category,
          product.image || null,
          product.available ? 1 : 0,
          product.ingredients ? JSON.stringify(product.ingredients) : null
        ]);
      }

      insertStmt.free();
      saveDatabase();
    }

    return db;
  } catch (error) {
    console.warn('Failed to initialize SQLite, falling back to localStorage', error);
    useLocalStorage = true;
    return null;
  }
}

// Save database to localStorage
function saveDatabase() {
  if (!db || useLocalStorage) return;
  try {
    const data = db.export();
    localStorage.setItem(SQLITE_LS_KEY, JSON.stringify(Array.from(data)));
  } catch (e) {
    console.error('Failed to save DB', e);
  }
}

// ================== SUPABASE API (Fallback, disabled for now) ==================
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-69dd17e9`;

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// ============== AUTH API (Disabled, use simple auth) ==============
export const signUp = async (email: string, password: string, name: string) => {
  localStorage.setItem('cafe-menu-auth', JSON.stringify({ email, name }));
  return { user: { email, name } };
};

export const signIn = async (email: string, password: string) => {
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

// ============== PRODUCTS API ==================

export const getProducts = async () => {
  const database = await initDatabase();
  
  if (useLocalStorage || !database) {
    return getLocalProducts();
  }

  const result = database.exec('SELECT * FROM products ORDER BY created_at DESC');
  
  if (!result[0]) return [];

  const { columns, values } = result[0];
  const products = values.map((row: any[]) => {
    const product: any = {};
    columns.forEach((col: string, i: number) => {
      if (col === 'ingredients' && row[i]) {
        product[col] = JSON.parse(row[i] as string);
      } else if (col === 'available') {
        product[col] = !!row[i];
      } else {
        product[col] = row[i];
      }
    });
    return product;
  });

  return products;
};

export const createProduct = async (product: any) => {
  const database = await initDatabase();
  
  if (useLocalStorage || !database) {
    const products = getLocalProducts();
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    const updated = [...products, newProduct];
    saveLocalProducts(updated);
    return newProduct;
  }

  const id = Date.now().toString();
  const newProduct = { ...product, id };

  const stmt = database.prepare(`
    INSERT INTO products (id, name, description, price, category, image, available, ingredients)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    id,
    product.name,
    product.description || null,
    product.price,
    product.category,
    product.image || null,
    product.available ? 1 : 0,
    product.ingredients ? JSON.stringify(product.ingredients) : null
  ]);
  stmt.free();

  saveDatabase();
  return newProduct;
};

export const updateProduct = async (id: string, updates: any) => {
  const database = await initDatabase();
  
  if (useLocalStorage || !database) {
    const products = getLocalProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      saveLocalProducts(products);
      return products[index];
    }
    throw new Error('Product not found');
  }

  // Build dynamic update query
  const setClauses: string[] = [];
  const values: any[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'ingredients') {
      setClauses.push(`${key} = ?`);
      values.push(value ? JSON.stringify(value) : null);
    } else if (key === 'available') {
      setClauses.push(`${key} = ?`);
      values.push(value ? 1 : 0);
    } else {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (setClauses.length === 0) throw new Error('No updates provided');

  values.push(id);

  const stmt = database.prepare(`
    UPDATE products
    SET ${setClauses.join(', ')}
    WHERE id = ?
  `);

  stmt.run(values);
  stmt.free();
  saveDatabase();

  // Get updated product
  const products = await getProducts();
  const updatedProduct = products.find(p => p.id === id);
  if (!updatedProduct) throw new Error('Product not found');
  return updatedProduct;
};

export const deleteProduct = async (id: string) => {
  const database = await initDatabase();
  
  if (useLocalStorage || !database) {
    const products = getLocalProducts();
    const updated = products.filter(p => p.id !== id);
    saveLocalProducts(updated);
    return true;
  }

  const stmt = database.prepare('DELETE FROM products WHERE id = ?');
  stmt.run([id]);
  stmt.free();
  saveDatabase();
  return true;
};

// ============== IMAGE UPLOAD (Use placeholder for demo) ==============
export const uploadImage = async (file: File) => {
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
