/**
 * Script to add products to clearance category
 * 
 * This script:
 * 1. Fetches a sample of products from Firestore
 * 2. Updates them to set isOnClearance: true
 * 3. Optionally sets originalPrice to show discount
 * 
 * Usage: npx tsx scripts/addProductsToClearance.ts
 */

import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Timestamp } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin with service account
const serviceAccountPath = path.join(__dirname, '../../medifocal-firebase-adminsdk-fbsvc-6caa04d80b.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account file not found: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'medifocal.firebasestorage.app'
  });
}

const db = admin.firestore();

/**
 * Add products to clearance
 * @param options - Configuration options
 */
async function addProductsToClearance(options: {
  maxProducts?: number;
  category?: string;
  manufacturer?: string;
  discountPercent?: number; // Percentage discount (e.g., 20 for 20% off)
  excludeAlreadyOnClearance?: boolean;
}) {
  const {
    maxProducts = 10,
    category,
    manufacturer,
    discountPercent = 20, // Default 20% discount
    excludeAlreadyOnClearance = true,
  } = options;

  try {
    console.log('🔄 Fetching products from Firestore...');
    
    // Build query
    let productsQuery: admin.firestore.Query = db.collection('products').where('active', '==', true);
    
    if (category) {
      productsQuery = productsQuery.where('category', '==', category);
    }
    
    if (manufacturer) {
      productsQuery = productsQuery.where('manufacturer', '==', manufacturer);
    }
    
    if (excludeAlreadyOnClearance) {
      productsQuery = productsQuery.where('isOnClearance', '==', false);
    }
    
    productsQuery = productsQuery.limit(maxProducts * 2); // Get more to ensure we have enough after filtering
    
    const querySnapshot = await productsQuery.get();
    const products = querySnapshot.docs.slice(0, maxProducts);
    
    if (products.length === 0) {
      console.log('❌ No products found matching criteria');
      return;
    }
    
    console.log(`📦 Found ${products.length} products to add to clearance\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const productDoc of products) {
      try {
        const productData = productDoc.data();
        const productId = productDoc.id;
        const currentPrice = productData.price || 0;
        
        // Calculate original price and new price
        const originalPrice = currentPrice;
        const discountMultiplier = 1 - (discountPercent / 100);
        const newPrice = Math.round(currentPrice * discountMultiplier * 100) / 100;
        
        // Update product
        const productRef = db.collection('products').doc(productId);
        await productRef.update({
          isOnClearance: true,
          originalPrice: `$${originalPrice.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          price: newPrice,
          displayPrice: `$${newPrice.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          tag: 'CLEARANCE',
          tagColor: 'bg-red-600',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        console.log(`✅ Added to clearance: ${productData.name || productId}`);
        console.log(`   Price: ${productData.displayPrice || `$${currentPrice}`} → $${newPrice.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${discountPercent}% off)`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error updating product ${productDoc.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✨ Complete!`);
    console.log(`   ✅ Successfully added: ${successCount} products`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount} products`);
    }
  } catch (error: any) {
    console.error('❌ Error fetching products:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting clearance product update...\n');
    
    // Example: Add 10 random products to clearance with 20% discount
    await addProductsToClearance({
      maxProducts: 10,
      discountPercent: 20,
      excludeAlreadyOnClearance: true,
    });
    
    // Uncomment and modify these examples to add specific categories/manufacturers:
    
    // Example: Add products from a specific category
    // await addProductsToClearance({
    //   maxProducts: 5,
    //   category: 'Autoclaves',
    //   discountPercent: 25,
    // });
    
    // Example: Add products from a specific manufacturer
    // await addProductsToClearance({
    //   maxProducts: 5,
    //   manufacturer: 'ProMedCo',
    //   discountPercent: 15,
    // });
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { addProductsToClearance };

