import { createProduct, getProducts } from "../api";
import { initialProducts } from "../data/initialProducts";

export async function initializeDatabase() {
  try {
    // Check if products already exist
    const existingProducts = await getProducts();
    
    if (existingProducts.length > 0) {
      console.log("Database already initialized with products");
      return;
    }

    console.log("Initializing database with initial products...");
    
    // Add initial products
    for (const product of initialProducts) {
      try {
        await createProduct(product);
        console.log(`Added product: ${product.name}`);
      } catch (error) {
        console.error(`Failed to add product ${product.name}:`, error);
      }
    }
    
    console.log("Database initialization complete");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
