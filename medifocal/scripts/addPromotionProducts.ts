/**
 * Script to add promotion products to Firestore
 * 
 * This script:
 * 1. Fetches products from Firestore
 * 2. Updates them to be promotion products (adds tags, featured flag, etc.)
 * 
 * Usage: npx tsx scripts/addPromotionProducts.ts
 */

import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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
 * Add promotion tags to products
 */
async function addPromotionProducts(options: {
  maxProducts?: number;
  category?: string;
  manufacturer?: string;
  promotionType?: 'featured' | 'supplier-special' | 'bundle';
}) {
  const {
    maxProducts = 15,
    category,
    manufacturer,
    promotionType = 'featured',
  } = options;

  try {
    console.log('🔄 Fetching products from Firestore...');
    
    // Build query
    let productsQuery: admin.firestore.Query = db.collection('products')
      .where('active', '==', true)
      .where('isOnClearance', '==', false); // Don't include clearance items
    
    if (category) {
      productsQuery = productsQuery.where('category', '==', category);
    }
    
    if (manufacturer) {
      productsQuery = productsQuery.where('manufacturer', '==', manufacturer);
    }
    
    productsQuery = productsQuery.limit(maxProducts * 2);
    
    const querySnapshot = await productsQuery.get();
    const products = querySnapshot.docs.slice(0, maxProducts);
    
    if (products.length === 0) {
      console.log('❌ No products found matching criteria');
      return;
    }
    
    console.log(`📦 Found ${products.length} products to add as promotions\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const productDoc of products) {
      try {
        const productData = productDoc.data();
        const productId = productDoc.id;
        
        // Determine promotion tag based on type
        let tag = '';
        let tagColor = '';
        let updateData: any = {
          featured: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        if (promotionType === 'featured') {
          tag = 'FEATURED';
          tagColor = 'bg-blue-600';
        } else if (promotionType === 'supplier-special') {
          tag = 'SUPPLIER SPECIAL';
          tagColor = 'bg-purple-600';
        } else if (promotionType === 'bundle') {
          tag = 'BUNDLE';
          tagColor = 'bg-green-600';
          // Add "Bundle" to name if not already there
          if (!productData.name.toLowerCase().includes('bundle')) {
            updateData.name = `${productData.name} Bundle`;
          }
        }
        
        updateData.tag = tag;
        updateData.tagColor = tagColor;
        
        // Update product
        const productRef = db.collection('products').doc(productId);
        await productRef.update(updateData);
        
        console.log(`✅ Added promotion tag: ${productData.name || productId}`);
        console.log(`   Tag: ${tag}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error updating product ${productDoc.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n✨ Complete!`);
    console.log(`   ✅ Successfully updated: ${successCount} products`);
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
    console.log('🚀 Starting promotion product update...\n');
    
    // Add featured products
    console.log('📌 Adding Featured Products...\n');
    await addPromotionProducts({
      maxProducts: 10,
      promotionType: 'featured',
    });
    
    console.log('\n');
    
    // Add supplier specials
    console.log('⭐ Adding Supplier Specials...\n');
    await addPromotionProducts({
      maxProducts: 8,
      promotionType: 'supplier-special',
    });
    
    console.log('\n');
    
    // Add bundles (fewer, as these should be special)
    console.log('📦 Adding Bundle Products...\n');
    await addPromotionProducts({
      maxProducts: 5,
      promotionType: 'bundle',
    });
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { addPromotionProducts };

