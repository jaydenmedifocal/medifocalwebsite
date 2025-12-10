import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock review data templates
const reviewTemplates = {
  equipment: [
    { rating: 5, title: "Excellent Quality", comment: "Outstanding equipment, exactly as described. Very satisfied with the purchase and the service was excellent.", criteria: { quality: 5, durability: 5, easeOfUse: 4, performance: 5, reliability: 5, value: 4 } },
    { rating: 5, title: "Highly Recommend", comment: "Great product for the price. Fast shipping and excellent customer support. Would definitely buy again.", criteria: { quality: 5, durability: 4, easeOfUse: 5, performance: 5, reliability: 4, value: 5 } },
    { rating: 4, title: "Good Value", comment: "Good quality product, works as expected. Minor issues but overall very satisfied with the purchase.", criteria: { quality: 4, durability: 4, easeOfUse: 4, performance: 4, reliability: 4, value: 5 } },
    { rating: 5, title: "Perfect for Our Practice", comment: "This equipment has been a great addition to our practice. Reliable and easy to use. Highly recommended!", criteria: { quality: 5, durability: 5, easeOfUse: 5, performance: 5, reliability: 5, value: 4 } },
    { rating: 4, title: "Solid Purchase", comment: "Good product overall. Some learning curve but once you get used to it, it works well. Good value for money.", criteria: { quality: 4, durability: 4, easeOfUse: 3, performance: 4, reliability: 4, value: 4 } },
  ],
  dentalChair: [
    { rating: 5, title: "Very Comfortable", comment: "Extremely comfortable chair for both patients and practitioners. Easy to adjust and very durable. Excellent investment.", criteria: { comfort: 5, durability: 5, easeOfUse: 5, functionality: 5, value: 4, reliability: 5 } },
    { rating: 5, title: "Professional Grade", comment: "High-quality dental chair that meets all our needs. Smooth operation and excellent build quality. Very pleased!", criteria: { comfort: 5, durability: 5, easeOfUse: 4, functionality: 5, value: 4, reliability: 5 } },
    { rating: 4, title: "Good Chair", comment: "Solid dental chair with good features. Comfortable for patients and easy to maintain. Good value.", criteria: { comfort: 4, durability: 4, easeOfUse: 4, functionality: 4, value: 5, reliability: 4 } },
  ],
  autoclave: [
    { rating: 5, title: "Reliable Sterilization", comment: "Excellent autoclave, very reliable and easy to use. Consistent results every time. Highly recommend for any practice.", criteria: { performance: 5, reliability: 5, easeOfUse: 4, durability: 5, value: 4, safety: 5 } },
    { rating: 5, title: "Great Performance", comment: "Outstanding autoclave that performs consistently. Easy to operate and maintain. Great addition to our sterilization setup.", criteria: { performance: 5, reliability: 5, easeOfUse: 5, durability: 4, value: 4, safety: 5 } },
    { rating: 4, title: "Good Autoclave", comment: "Reliable autoclave that does the job well. Some minor issues but overall very satisfied with the performance.", criteria: { performance: 4, reliability: 4, easeOfUse: 4, durability: 4, value: 5, safety: 4 } },
  ],
  consumable: [
    { rating: 5, title: "High Quality", comment: "Excellent quality consumables. Consistent performance and good value. Will definitely order again.", criteria: { quality: 5, durability: 4, value: 5, effectiveness: 5, easeOfUse: 5 } },
    { rating: 4, title: "Good Product", comment: "Good quality product that works well. Fast delivery and good pricing. Satisfied with the purchase.", criteria: { quality: 4, durability: 4, value: 5, effectiveness: 4, easeOfUse: 4 } },
    { rating: 5, title: "Excellent Value", comment: "Great value for money. High quality and reliable. Highly recommend for any dental practice.", criteria: { quality: 5, durability: 4, value: 5, effectiveness: 5, easeOfUse: 5 } },
  ],
  default: [
    { rating: 5, title: "Great Product", comment: "Excellent product, very satisfied with the purchase. Good quality and fast shipping. Highly recommend!", criteria: { quality: 5, value: 4, easeOfUse: 4, durability: 4 } },
    { rating: 4, title: "Good Purchase", comment: "Good product overall. Works as expected and good value for money. Would buy again.", criteria: { quality: 4, value: 5, easeOfUse: 4, durability: 4 } },
    { rating: 5, title: "Highly Recommend", comment: "Outstanding product quality and service. Very pleased with this purchase. Will definitely order more in the future.", criteria: { quality: 5, value: 4, easeOfUse: 5, durability: 5 } },
  ]
};

const names = [
  "Dr. Sarah Mitchell", "Dr. James Wilson", "Dr. Emily Chen", "Dr. Michael Brown",
  "Dr. Lisa Anderson", "Dr. David Thompson", "Dr. Jennifer Martinez", "Dr. Robert Taylor",
  "Dr. Amanda White", "Dr. Christopher Lee", "Dr. Jessica Davis", "Dr. Matthew Johnson",
  "Dr. Nicole Garcia", "Dr. Daniel Rodriguez", "Dr. Ashley Moore", "Dr. Kevin Jackson"
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function generateReviewsForProduct(
  itemNumber: string,
  productName: string,
  category: string,
  numReviews: number = getRandomInt(3, 8)
) {
  // Determine review template based on category
  let templateKey: keyof typeof reviewTemplates = 'default';
  const categoryLower = (category || '').toLowerCase();
  
  if (categoryLower.includes('dental chair')) {
    templateKey = 'dentalChair';
  } else if (categoryLower.includes('autoclave')) {
    templateKey = 'autoclave';
  } else if (categoryLower.includes('equipment')) {
    templateKey = 'equipment';
  } else if (categoryLower.includes('consumable') || categoryLower.includes('supply')) {
    templateKey = 'consumable';
  }
  
  const templates = reviewTemplates[templateKey];
  
  for (let i = 0; i < numReviews; i++) {
    const template = getRandomElement(templates);
    const name = getRandomElement(names);
    const daysAgo = getRandomInt(1, 180); // Reviews from 1 day to 6 months ago
    const createdAt = Timestamp.fromDate(getDaysAgo(daysAgo));
    
    // Add some variation to ratings
    const ratingVariation = getRandomInt(-1, 1);
    const finalRating = Math.max(1, Math.min(5, template.rating + ratingVariation));
    
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: itemNumber,
        itemNumber,
        userId: `generated_${itemNumber}_${i}_${Date.now()}`,
        userName: name,
        rating: finalRating,
        title: template.title,
        comment: template.comment,
        verifiedPurchase: Math.random() > 0.3, // 70% verified
        helpfulCount: getRandomInt(0, 15),
        criteriaRatings: template.criteria,
        productCategory: category,
        productName,
        createdAt,
        updatedAt: createdAt
      });
      
      console.log(`✓ Generated review ${i + 1}/${numReviews} for ${itemNumber}`);
    } catch (error) {
      console.error(`✗ Error generating review for ${itemNumber}:`, error);
    }
  }
}

async function generateReviewsForAllProducts() {
  try {
    // Import firestore service to get products
    const { getAllProducts } = await import('../services/firestore');
    
    console.log('Fetching all products...');
    let allProducts: any[] = [];
    let lastDoc = null;
    let hasMore = true;
    
    while (hasMore) {
      const result = await getAllProducts(100, lastDoc);
      allProducts = [...allProducts, ...result.products];
      lastDoc = result.lastDoc;
      hasMore = result.hasMore;
      
      if (!hasMore || allProducts.length >= 500) break; // Limit to 500 products
    }
    
    console.log(`Found ${allProducts.length} products. Generating reviews...`);
    
    for (const product of allProducts) {
      if (product.itemNumber && product.active !== false) {
        await generateReviewsForProduct(
          product.itemNumber,
          product.name,
          product.category || product.parentCategory || 'Equipment'
        );
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('✓ Finished generating reviews for all products');
  } catch (error) {
    console.error('Error generating reviews:', error);
  }
}

// Run if called directly
if (require.main === module) {
  generateReviewsForAllProducts()
    .then(() => {
      console.log('Review generation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateReviewsForProduct, generateReviewsForAllProducts };

