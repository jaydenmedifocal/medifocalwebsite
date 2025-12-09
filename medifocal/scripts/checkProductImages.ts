import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
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
const bucket = admin.storage().bucket();

interface ProductImageStatus {
  productId: string;
  itemNumber: string;
  name: string;
  imageUrl: string;
  images: string[];
  status: 'firebase' | 'external' | 'missing';
  externalUrls: string[];
  shopifyUrls?: string[];
  needsMigration: boolean;
}

// Download image from URL with retry logic
async function downloadImage(url: string, retries: number = 3): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await new Promise<Buffer | null>((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        
        // Add user agent for Shopify/CDN requests
        const options: any = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        };
        
        const request = protocol.get(url, options, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              request.destroy();
              return resolve(downloadImage(redirectUrl, retries));
            }
          }
          
          if (response.statusCode !== 200) {
            if (attempt < retries) {
              console.log(`  ⚠️  Attempt ${attempt} failed (Status: ${response.statusCode}), retrying...`);
              resolve(null);
              return;
            }
            console.error(`  ❌ Failed to download image: ${url} (Status: ${response.statusCode})`);
            resolve(null);
            return;
          }

          const chunks: Buffer[] = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => {
            const buffer = Buffer.concat(chunks);
            if (buffer.length === 0) {
              if (attempt < retries) {
                console.log(`  ⚠️  Attempt ${attempt} returned empty buffer, retrying...`);
                resolve(null);
              } else {
                console.error(`  ❌ Empty image buffer for: ${url}`);
                resolve(null);
              }
            } else {
              resolve(buffer);
            }
          });
          response.on('error', (error) => {
            if (attempt < retries) {
              console.log(`  ⚠️  Attempt ${attempt} error, retrying...`);
              resolve(null);
            } else {
              console.error(`  ❌ Error downloading image: ${url}`, error);
              resolve(null);
            }
          });
        });
        
        request.on('error', (error) => {
          if (attempt < retries) {
            console.log(`  ⚠️  Attempt ${attempt} network error, retrying...`);
            resolve(null);
          } else {
            console.error(`  ❌ Network error downloading image: ${url}`, error);
            resolve(null);
          }
        });
        
        request.setTimeout(30000, () => {
          request.destroy();
          if (attempt < retries) {
            console.log(`  ⚠️  Attempt ${attempt} timeout, retrying...`);
            resolve(null);
          } else {
            console.error(`  ❌ Timeout downloading image: ${url}`);
            resolve(null);
          }
        });
      });
      
      if (result) {
        return result;
      }
      
      // Wait before retry
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    } catch (error) {
      if (attempt < retries) {
        console.log(`  ⚠️  Attempt ${attempt} exception, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        console.error(`  ❌ Exception downloading image: ${url}`, error);
        return null;
      }
    }
  }
  
  return null;
}

// Upload image to Firebase Storage
async function uploadImageToFirebase(imageBuffer: Buffer, itemNumber: string, index: number, originalUrl: string): Promise<string | null> {
  try {
    const ext = path.extname(new URL(originalUrl).pathname) || '.jpg';
    const fileName = `${itemNumber}_${index}${ext}`;
    const storagePath = `products/${itemNumber}/${fileName}`;
    const file = bucket.file(storagePath);
    
    await file.save(imageBuffer, {
      metadata: {
        contentType: `image/${ext.slice(1)}`,
        cacheControl: 'public, max-age=31536000'
      }
    });
    
    // With uniform bucket-level access, we don't call makePublic()
    // Access is controlled by bucket IAM and storage rules
    // Get the public URL
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media`;
    
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading image to Firebase:`, error);
    return null;
  }
}

// Check if URL is from Firebase Storage
function isFirebaseStorageUrl(url: string): boolean {
  return url.includes('firebasestorage.googleapis.com') || 
         url.includes('firebase.storage') ||
         url.startsWith('gs://') ||
         url.includes('storage.googleapis.com');
}

// Check if URL is from Shopify
function isShopifyUrl(url: string): boolean {
  return url.includes('shopifycdn.com') || 
         url.includes('cdn.shopify.com') ||
         url.includes('shopify');
}

// Main function to check all product images
async function checkProductImages(dryRun: boolean = true) {
  console.log('🔍 Checking all product images...\n');
  
  try {
    const productsRef = db.collection('products');
    const querySnapshot = await productsRef.get();
    
    const results: ProductImageStatus[] = [];
    let totalProducts = 0;
    let productsWithFirebaseImages = 0;
    let productsWithExternalImages = 0;
    let productsWithMissingImages = 0;
    let totalExternalImages = 0;
    
    console.log(`Found ${querySnapshot.docs.length} products to check\n`);
    
    for (const docSnap of querySnapshot.docs) {
      totalProducts++;
      const data = docSnap.data();
      const productId = docSnap.id;
      const itemNumber = data.itemNumber || productId;
      const name = data.name || 'Unnamed Product';
      const imageUrl = data.imageUrl || '';
      const images = Array.isArray(data.images) ? data.images : [];
      
      // Check variant images as well
      const variants = Array.isArray(data.variants) ? data.variants : [];
      const variantImages: string[] = [];
      variants.forEach((variant: any) => {
        if (variant && typeof variant === 'object') {
          if (variant.imageUrl && typeof variant.imageUrl === 'string') {
            variantImages.push(variant.imageUrl);
          }
          if (Array.isArray(variant.images)) {
            variantImages.push(...variant.images.filter((img: any) => img && typeof img === 'string'));
          }
        }
      });
      
      const allImages = imageUrl ? [imageUrl, ...images, ...variantImages] : [...images, ...variantImages];
      const uniqueImages = [...new Set(allImages.filter((url: string) => url && url.trim() !== ''))];
      
      const externalUrls: string[] = [];
      const shopifyUrls: string[] = [];
      let hasFirebaseImages = false;
      let hasExternalImages = false;
      
      for (const url of uniqueImages) {
        if (isFirebaseStorageUrl(url)) {
          hasFirebaseImages = true;
        } else if (url && url.trim() !== '') {
          externalUrls.push(url);
          if (isShopifyUrl(url)) {
            shopifyUrls.push(url);
          }
          hasExternalImages = true;
          totalExternalImages++;
        }
      }
      
      let status: 'firebase' | 'external' | 'missing';
      if (uniqueImages.length === 0) {
        status = 'missing';
        productsWithMissingImages++;
      } else if (hasExternalImages) {
        status = 'external';
        productsWithExternalImages++;
      } else {
        status = 'firebase';
        productsWithFirebaseImages++;
      }
      
      results.push({
        productId,
        itemNumber,
        name,
        imageUrl,
        images: [...images, ...variantImages], // Include variant images in report
        status,
        externalUrls,
        needsMigration: hasExternalImages,
        shopifyUrls: shopifyUrls,
        variantCount: variants.length,
        variantsWithExternalImages: variants.filter((v: any) => {
          const vImages = [v.imageUrl, ...(Array.isArray(v.images) ? v.images : [])].filter(Boolean);
          return vImages.some((url: string) => !isFirebaseStorageUrl(url));
        }).length
      } as any);
      
      // Log progress every 50 products
      if (totalProducts % 50 === 0) {
        console.log(`Checked ${totalProducts} products...`);
      }
    }
    
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Products: ${totalProducts}`);
    console.log(`✅ Products with Firebase Storage images: ${productsWithFirebaseImages} (${((productsWithFirebaseImages / totalProducts) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Products with external images: ${productsWithExternalImages} (${((productsWithExternalImages / totalProducts) * 100).toFixed(1)}%)`);
    console.log(`❌ Products with missing images: ${productsWithMissingImages} (${((productsWithMissingImages / totalProducts) * 100).toFixed(1)}%)`);
    console.log(`📸 Total external image URLs found: ${totalExternalImages}`);
    
    // Count Shopify URLs
    const shopifyCount = results.reduce((sum, r) => sum + ((r as any).shopifyUrls?.length || 0), 0);
    if (shopifyCount > 0) {
      console.log(`🛍️  Shopify image URLs found: ${shopifyCount}`);
    }
    console.log('='.repeat(80) + '\n');
    
    // Show products that need migration
    const productsNeedingMigration = results.filter(r => r.needsMigration);
    if (productsNeedingMigration.length > 0) {
      console.log(`\n⚠️  Products with external images (${productsNeedingMigration.length}):\n`);
      productsNeedingMigration.slice(0, 20).forEach((product, index) => {
        console.log(`${index + 1}. ${product.itemNumber} - ${product.name}`);
        console.log(`   External URLs: ${product.externalUrls.length}`);
        product.externalUrls.slice(0, 3).forEach(url => {
          console.log(`      - ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
        });
        if (product.externalUrls.length > 3) {
          console.log(`      ... and ${product.externalUrls.length - 3} more`);
        }
        console.log('');
      });
      
      if (productsNeedingMigration.length > 20) {
        console.log(`... and ${productsNeedingMigration.length - 20} more products with external images\n`);
      }
    }
    
    // Show products with missing images
    const productsWithMissing = results.filter(r => r.status === 'missing');
    if (productsWithMissing.length > 0) {
      console.log(`\n❌ Products with missing images (${productsWithMissing.length}):\n`);
      productsWithMissing.slice(0, 20).forEach((product, index) => {
        console.log(`${index + 1}. ${product.itemNumber} - ${product.name}`);
      });
      
      if (productsWithMissing.length > 20) {
        console.log(`... and ${productsWithMissing.length - 20} more products with missing images\n`);
      }
    }
    
    // Save detailed report to file
    const reportPath = path.join(__dirname, '../../product_images_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        totalProducts,
        productsWithFirebaseImages,
        productsWithExternalImages,
        productsWithMissingImages,
        totalExternalImages
      },
      products: results,
      generatedAt: new Date().toISOString()
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
    
    if (dryRun) {
      console.log('🔍 This was a dry run. To migrate external images to Firebase Storage, run with --migrate flag.\n');
    } else {
      console.log('🚀 Starting migration of external images to Firebase Storage...\n');
      await migrateExternalImages(productsNeedingMigration);
    }
    
  } catch (error) {
    console.error('❌ Error checking product images:', error);
    process.exit(1);
  }
}

// Migrate external images to Firebase Storage
async function migrateExternalImages(products: ProductImageStatus[]) {
  let migrated = 0;
  let failed = 0;
  
  for (const product of products) {
    console.log(`\n📦 Processing: ${product.itemNumber} - ${product.name}`);
    
    const newImageUrls: string[] = [];
    let imageIndex = 0;
    
    // Process main imageUrl
    if (product.imageUrl && !isFirebaseStorageUrl(product.imageUrl)) {
      const source = isShopifyUrl(product.imageUrl) ? 'Shopify' : 'external';
      console.log(`  Downloading main image from ${source}: ${product.imageUrl.substring(0, 60)}...`);
      const imageBuffer = await downloadImage(product.imageUrl);
      if (imageBuffer) {
        const firebaseUrl = await uploadImageToFirebase(imageBuffer, product.itemNumber, imageIndex, product.imageUrl);
        if (firebaseUrl) {
          newImageUrls.push(firebaseUrl);
          console.log(`  ✅ Uploaded to: ${firebaseUrl.substring(0, 60)}...`);
          imageIndex++;
        } else {
          console.log(`  ❌ Failed to upload main image`);
          failed++;
        }
      } else {
        console.log(`  ❌ Failed to download main image`);
        failed++;
      }
    } else if (product.imageUrl && isFirebaseStorageUrl(product.imageUrl)) {
      newImageUrls.push(product.imageUrl);
    }
    
    // Process images array
    for (const imageUrl of product.images) {
      if (isFirebaseStorageUrl(imageUrl)) {
        if (!newImageUrls.includes(imageUrl)) {
          newImageUrls.push(imageUrl);
        }
      } else {
        const source = isShopifyUrl(imageUrl) ? 'Shopify' : 'external';
        console.log(`  Downloading image from ${source}: ${imageUrl.substring(0, 60)}...`);
        const imageBuffer = await downloadImage(imageUrl);
        if (imageBuffer) {
          const firebaseUrl = await uploadImageToFirebase(imageBuffer, product.itemNumber, imageIndex, imageUrl);
          if (firebaseUrl) {
            newImageUrls.push(firebaseUrl);
            console.log(`  ✅ Uploaded to: ${firebaseUrl.substring(0, 60)}...`);
            imageIndex++;
          } else {
            console.log(`  ❌ Failed to upload image`);
            failed++;
          }
        } else {
          console.log(`  ❌ Failed to download image`);
          failed++;
        }
      }
    }
    
    // Get product document to update variants
    const productRef = db.collection('products').doc(product.productId);
    const productDoc = await productRef.get();
    const productData = productDoc.data();
    const variants = Array.isArray(productData?.variants) ? productData.variants : [];
    
    // Process variant images
    const updatedVariants = await Promise.all(variants.map(async (variant: any, variantIndex: number) => {
      if (!variant || typeof variant !== 'object') return variant;
      
      const variantImageUrls: string[] = [];
      const variantImages = [variant.imageUrl, ...(Array.isArray(variant.images) ? variant.images : [])].filter(Boolean);
      
      for (const vImageUrl of variantImages) {
        if (isFirebaseStorageUrl(vImageUrl)) {
          if (!variantImageUrls.includes(vImageUrl)) {
            variantImageUrls.push(vImageUrl);
          }
        } else {
          const source = isShopifyUrl(vImageUrl) ? 'Shopify' : 'external';
          console.log(`  Downloading variant ${variantIndex + 1} image from ${source}: ${vImageUrl.substring(0, 60)}...`);
          const imageBuffer = await downloadImage(vImageUrl);
          if (imageBuffer) {
            const firebaseUrl = await uploadImageToFirebase(imageBuffer, product.itemNumber, imageIndex, vImageUrl);
            if (firebaseUrl) {
              variantImageUrls.push(firebaseUrl);
              console.log(`  ✅ Uploaded variant image to: ${firebaseUrl.substring(0, 60)}...`);
              imageIndex++;
            } else {
              console.log(`  ❌ Failed to upload variant image`);
              failed++;
            }
          } else {
            console.log(`  ❌ Failed to download variant image`);
            failed++;
          }
        }
      }
      
      return {
        ...variant,
        imageUrl: variantImageUrls[0] || variant.imageUrl || '',
        images: variantImageUrls.slice(1),
      };
    }));
    
    // Update product in Firestore with main images and variants
    if (newImageUrls.length > 0 || updatedVariants.length > 0) {
      try {
        const updateData: any = {
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (newImageUrls.length > 0) {
          updateData.imageUrl = newImageUrls[0] || '';
          updateData.images = newImageUrls.slice(1);
        }
        
        if (updatedVariants.length > 0) {
          updateData.variants = updatedVariants;
        }
        
        await productRef.update(updateData);
        console.log(`  ✅ Updated product and variants in Firestore`);
        migrated++;
      } catch (error) {
        console.error(`  ❌ Failed to update product in Firestore:`, error);
        failed++;
      }
    }
    
    // Add delay to avoid rate limiting (longer for Shopify)
    const delay = product.externalUrls.some(url => isShopifyUrl(url)) ? 1000 : 500;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successfully migrated: ${migrated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(80) + '\n');
}

// Run the script
const args = process.argv.slice(2);
const shouldMigrate = args.includes('--migrate') || args.includes('-m');

checkProductImages(!shouldMigrate)
  .then(() => {
    console.log('✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

