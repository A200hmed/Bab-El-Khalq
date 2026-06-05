import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client for auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-69dd17e9/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize storage bucket on startup
const BUCKET_NAME = 'make-69dd17e9-products';
const { data: buckets } = await supabase.storage.listBuckets();
const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
if (!bucketExists) {
  await supabase.storage.createBucket(BUCKET_NAME, { public: false });
}

// ============== AUTH ROUTES ==============

// Sign up (admin registration)
app.post("/make-server-69dd17e9/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error(`Error during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.error(`Unexpected error during signup: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ============== PRODUCT ROUTES ==============

// Get all products
app.get("/make-server-69dd17e9/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.error(`Error fetching products: ${error}`);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Get product by ID
app.get("/make-server-69dd17e9/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.error(`Error fetching product: ${error}`);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// Create product (protected)
app.post("/make-server-69dd17e9/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const product = await c.req.json();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newProduct = {
      id,
      ...product,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`product:${id}`, newProduct);
    return c.json({ product: newProduct });
  } catch (error) {
    console.error(`Error creating product: ${error}`);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Update product (protected)
app.put("/make-server-69dd17e9/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const existing = await kv.get(`product:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }

    const updated = { ...existing, ...updates };
    await kv.set(`product:${id}`, updated);
    return c.json({ product: updated });
  } catch (error) {
    console.error(`Error updating product: ${error}`);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Delete product (protected)
app.delete("/make-server-69dd17e9/products/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error(`Error deleting product: ${error}`);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// ============== IMAGE UPLOAD ROUTES ==============

// Upload image (protected)
app.post("/make-server-69dd17e9/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileName = `${Date.now()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
      });

    if (error) {
      console.error(`Error uploading file: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Get signed URL
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365 * 10); // 10 years

    return c.json({ url: urlData?.signedUrl, path: fileName });
  } catch (error) {
    console.error(`Unexpected error during file upload: ${error}`);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// ============== CATEGORIES ROUTES ==============

// Get all categories
app.get("/make-server-69dd17e9/categories", async (c) => {
  try {
    const categories = await kv.getByPrefix('category:');
    return c.json({ categories });
  } catch (error) {
    console.error(`Error fetching categories: ${error}`);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// Create category (protected)
app.post("/make-server-69dd17e9/categories", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name } = await c.req.json();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const category = { id, name };

    await kv.set(`category:${id}`, category);
    return c.json({ category });
  } catch (error) {
    console.error(`Error creating category: ${error}`);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

Deno.serve(app.fetch);