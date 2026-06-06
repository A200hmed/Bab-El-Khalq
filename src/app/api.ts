import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { initialProducts } from './data/initialProducts';
import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
const SQLITE_LS_KEY = 'cafe-menu-sqlite';

// Initialize SQLite database
async function initDatabase() {
  if (db) return db;

  // Load sql.js
  const SQL = await initSqlJs({
    locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
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
}

// Save database to localStorage
function saveDatabase() {
  if (!db) return;
  const data = db.export();
  localStorage.setItem(SQLITE_LS_KEY, JSON.stringify(Array.from(data)));
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

// ============== PRODUCTS API (SQLite) ==============

export const getProducts = async () => {
  const database = await initDatabase();
  const result = database.exec('SELECT * FROM products ORDER BY created_at DESC');
  
  if (!result[0]) return [];

  const { columns, values } = result[0];
  const products = values.map(row => {
    const product: any = {};
    columns.forEach((col, i) => {
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
