import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

/**
 * Get product images from Firebase Storage
 * Images are stored in products/{itemNumber}/ folder
 */
async function getProductImagesFromStorage(itemNumber: string): Promise<string[]> {
  try {
    const storageRef = ref(storage, `products/${itemNumber}`);
    const result = await listAll(storageRef);
    
    // Get download URLs for all files, sorted by name
    const imagePromises = result.items
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(item => getDownloadURL(item));
    
    const imageUrls = await Promise.all(imagePromises);
    return imageUrls;
  } catch (error: any) {
    // If folder doesn't exist or access denied, return empty array
    if (error.code === 'storage/object-not-found' || error.code === 'storage/unauthorized') {
      return [];
    }
    console.warn(`Error loading images from Storage for ${itemNumber}:`, error);
    return [];
  }
}

/**
 * Normalize product data from Firestore
 * Ensures all fields match your Firebase structure
 * Also loads images from Firebase Storage if not in Firestore
 */
const normalizeProduct = async (doc: any, loadImagesFromStorage: boolean = true) => {
  const data = doc.data();
  const itemNumber = data.itemNumber || doc.id;
  
  // Normalize main product images from Firestore
  let images = Array.isArray(data.images) ? data.images.filter((img: any) => img && typeof img === 'string') : [];
  let imageUrl = data.imageUrl || '';
  
  // If no images in Firestore, try to load from Firebase Storage
  // Only check Storage if images are completely missing to avoid blocking page load
  if (loadImagesFromStorage && (!imageUrl || images.length === 0)) {
    try {
      const storageImages = await getProductImagesFromStorage(itemNumber);
      if (storageImages.length > 0) {
        imageUrl = storageImages[0];
        images = storageImages.slice(1);
      }
    } catch (error) {
      // Silently fail - will use Firestore images or empty
    }
  }
  
  // Normalize variant images - ensure each variant has properly formatted imageUrl and images
  const variants = Array.isArray(data.variants) ? await Promise.all(data.variants.map(async (variant: any) => {
    if (!variant || typeof variant !== 'object') return variant;
    
    // Normalize variant imageUrl
    let variantImageUrl = variant.imageUrl && typeof variant.imageUrl === 'string' ? variant.imageUrl : '';
    let variantImages = Array.isArray(variant.images) 
      ? variant.images.filter((img: any) => img && typeof img === 'string')
      : [];
    
    // If variant has itemNumber and no images, try loading from Storage
    const variantItemNumber = variant.itemNumber || itemNumber;
    if (loadImagesFromStorage && (!variantImageUrl || variantImages.length === 0)) {
      try {
        const variantStorageImages = await getProductImagesFromStorage(variantItemNumber);
        if (variantStorageImages.length > 0) {
          variantImageUrl = variantStorageImages[0];
          variantImages = variantStorageImages.slice(1);
        }
      } catch (error) {
        // Silently fail
      }
    }
    
    return {
      ...variant,
      imageUrl: variantImageUrl,
      images: variantImages,
    };
  })) : [];
  
  // Filter out Bluetti products
  const manufacturer = (data.manufacturer || '').toLowerCase();
  if (manufacturer.includes('bluetti')) {
    return null; // Return null to filter out Bluetti products
  }
  
  // For dental chairs, ensure the first image is the actual chair image
  const category = data.category || 'Uncategorized';
  const isDentalChair = category.toLowerCase().includes('dental chair') || 
                        category.toLowerCase() === 'dental chairs' ||
                        (data.name || '').toLowerCase().includes('dental chair');
  
  let finalImageUrl = imageUrl;
  let finalImages = images;
  
  if (isDentalChair && images.length > 0) {
    // Reorder images to ensure the first one is the actual chair
    // If imageUrl exists and is not in images, add it to the front
    // Otherwise, use the first image from the images array
    if (imageUrl && !images.includes(imageUrl)) {
      finalImageUrl = imageUrl;
      finalImages = images; // Keep all images
    } else if (images.length > 0) {
      // Use the first image from the array as the main image
      finalImageUrl = images[0];
      // Keep all images, but ensure the first one is the main one
      finalImages = images;
    }
  }
  
  return {
    id: doc.id,
    itemNumber: itemNumber,
    name: data.name || '',
    price: data.price || 0,
    displayPrice: data.displayPrice || `$${data.price || 0}`,
    imageUrl: finalImageUrl,
    images: finalImages,
    category: category,
    parentCategory: data.parentCategory || null,
    manufacturer: data.manufacturer || '',
    description: data.description || '',
    details: data.details || data.description || '',
    isOnClearance: data.isOnClearance || false,
    tag: data.tag || '',
    tagColor: data.tagColor || '',
    variants: variants, // Normalized variants with proper image fields
    variantId: data.variantId || null,
    productId: data.productId || doc.id,
    quantity: data.quantity || 0,
    specialPrice: data.specialPrice || null,
    originalPrice: data.originalPrice || null,
    procedure: data.procedure || null,
    speed: data.speed || null,
    grit: data.grit || null,
    viscosity: data.viscosity || null,
    material: data.material || null,
    shape: data.shape || null,
    active: data.active !== false, // Default to true if not specified
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    // Include any other fields from Firestore
    ...data
  };
};

/**
 * Get all active products from Firestore
 */
export const getAllProducts = async (maxResults = 20, lastDoc = null) => {
  try {
    const productsRef = collection(db, 'products');
    let q = query(
      productsRef,
      where('active', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false))); // Don't load from Storage for list views (performance)
    const products = normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products

    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    const hasMore = querySnapshot.docs.length === maxResults;

    return {
      products,
      lastDoc: lastDocument,
      hasMore
    };
  } catch (error: any) {
    console.error('Error fetching products:', error);
    // If index error, try without orderBy
    if (error.code === 'failed-precondition') {
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('active', '==', true),
          limit(maxResults)
        );
        const querySnapshot = await getDocs(q);
        const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
        const products = normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
        return {
          products,
          lastDoc: null,
          hasMore: false
        };
      } catch (fallbackError) {
        console.error('Error fetching products (fallback):', fallbackError);
        return {
          products: [],
          lastDoc: null,
          hasMore: false
        };
      }
    }
    return {
      products: [],
      lastDoc: null,
      hasMore: false
    };
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limitCount = 4) => {
  try {
    const productsRef = collection(db, 'products');
    // Try query without orderBy first to avoid index requirement
    // This is more reliable and works immediately
    const q = query(
      productsRef,
      where('active', '==', true),
      where('featured', '==', true),
      limit(limitCount * 2) // Get more to ensure we have enough after filtering
    );

    const querySnapshot = await getDocs(q);
    const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
    let products = normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
    
    // Sort client-side by updatedAt (most recent first)
    products = products.sort((a, b) => {
      const aDate = a.updatedAt?.toDate ? a.updatedAt.toDate() : 
                   (a.updatedAt ? new Date(a.updatedAt) : new Date(0));
      const bDate = b.updatedAt?.toDate ? b.updatedAt.toDate() : 
                   (b.updatedAt ? new Date(b.updatedAt) : new Date(0));
      return bDate.getTime() - aDate.getTime();
    });
    
    // Return only the requested limit
    return products.slice(0, limitCount);
  } catch (error: any) {
    // If query fails, try simpler query
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('active', '==', true),
          limit(limitCount * 3) // Get more products
        );
        const querySnapshot = await getDocs(q);
        const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
        let products = normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
        
        // Filter for featured products
        products = products.filter(p => p.featured === true);
        
        // Sort by updatedAt
        products = products.sort((a, b) => {
          const aDate = a.updatedAt?.toDate ? a.updatedAt.toDate() : 
                       (a.updatedAt ? new Date(a.updatedAt) : new Date(0));
          const bDate = b.updatedAt?.toDate ? b.updatedAt.toDate() : 
                       (b.updatedAt ? new Date(b.updatedAt) : new Date(0));
          return bDate.getTime() - aDate.getTime();
        });
        
        return products.slice(0, limitCount);
      } catch (fallbackError: any) {
        console.error('Error fetching featured products (fallback):', fallbackError);
        // Final fallback: get all products and filter client-side
        if (fallbackError.code === 'failed-precondition' || fallbackError.message?.includes('index')) {
          try {
            const allProducts = await getAllProducts(100).then(result => result.products);
            const featured = allProducts.filter(p => p.featured === true && p.active !== false);
            return featured
              .sort((a, b) => {
                const aDate = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt || 0);
                const bDate = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt || 0);
                return bDate.getTime() - aDate.getTime();
              })
              .slice(0, limitCount);
          } catch (finalError) {
            console.error('Error fetching featured products (final fallback):', finalError);
            return [];
          }
        }
        return [];
      }
    }
    // Fallback: try without featured filter
    try {
      return await getAllProducts(limitCount).then(result => result.products);
    } catch (fallbackError) {
      console.error('Error fetching featured products (fallback):', fallbackError);
      return [];
    }
  }
};

/**
 * Helper function to find the actual category name from Firestore
 * Tries exact match first, then case-insensitive match
 */
const findActualCategoryName = async (searchName: string, field: 'category' | 'parentCategory'): Promise<string | null> => {
  if (!searchName) return null;
  
  try {
    // First, try exact match
    const productsRef = collection(db, 'products');
    const exactQuery = query(
      productsRef,
      where('active', '==', true),
      where(field, '==', searchName),
      limit(1)
    );
    const exactSnapshot = await getDocs(exactQuery);
    if (!exactSnapshot.empty) {
      return searchName; // Exact match found
    }
    
    // If no exact match, fetch a sample of products and find case-insensitive match
    const sampleQuery = query(
      productsRef,
      where('active', '==', true),
      limit(1000) // Get a sample to find category names
    );
    const sampleSnapshot = await getDocs(sampleQuery);
    
    // Normalize search name for comparison
    const normalizedSearch = searchName.toLowerCase().trim();
    
    // Find matching category name (case-insensitive)
    for (const doc of sampleSnapshot.docs) {
      const data = doc.data();
      const categoryValue = data[field];
      if (categoryValue && typeof categoryValue === 'string') {
        if (categoryValue.toLowerCase().trim() === normalizedSearch) {
          return categoryValue; // Return the actual case from database
        }
      }
    }
    
    return null; // No match found
  } catch (error) {
    console.error(`Error finding actual ${field} name:`, error);
    return null;
  }
};

/**
 * Get products by category
 * Handles case-sensitivity mismatches by finding the actual category name in Firestore
 */
export const getProductsByCategory = async (categoryName: string, maxResults = 50) => {
  if (!categoryName) {
    console.warn('getProductsByCategory: categoryName is empty');
    return [];
  }
  
  // Find the actual category name (handles case mismatches)
  const actualCategoryName = await findActualCategoryName(categoryName, 'category');
  const searchCategoryName = actualCategoryName || categoryName;
  
  if (actualCategoryName && actualCategoryName !== categoryName) {
    console.log(`getProductsByCategory: Matched "${categoryName}" to actual category "${actualCategoryName}"`);
  }
  
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('active', '==', true),
      where('category', '==', searchCategoryName),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
    const products = normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
    console.log(`getProductsByCategory: Found ${products.length} products for category "${searchCategoryName}"`);
    return products;
  } catch (error: any) {
    // Suppress index error messages since we have a fallback
    if (error.code === 'failed-precondition' && error.message?.includes('index')) {
      // Silently fall through to fallback
    } else {
    console.error('Error fetching products by category:', error);
    }
    // Fallback: try without orderBy
    if (error.code === 'failed-precondition') {
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('active', '==', true),
          where('category', '==', searchCategoryName),
          limit(maxResults)
        );
        const querySnapshot = await getDocs(q);
        const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
        return normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
      } catch (fallbackError) {
        console.error('Error fetching products by category (fallback):', fallbackError);
        return [];
      }
    }
    return [];
  }
};

/**
 * Get products by parent category
 * Handles case-sensitivity mismatches by finding the actual parent category name in Firestore
 */
export const getProductsByParentCategory = async (parentCategory: string, maxResults = 50) => {
  if (!parentCategory) {
    console.warn('getProductsByParentCategory: parentCategory is empty');
    return [];
  }
  
  // Find the actual parent category name (handles case mismatches)
  const actualParentCategory = await findActualCategoryName(parentCategory, 'parentCategory');
  const searchParentCategory = actualParentCategory || parentCategory;
  
  if (actualParentCategory && actualParentCategory !== parentCategory) {
    console.log(`getProductsByParentCategory: Matched "${parentCategory}" to actual parentCategory "${actualParentCategory}"`);
  }
  
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('active', '==', true),
      where('parentCategory', '==', searchParentCategory),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
    const products = normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
    console.log(`getProductsByParentCategory: Found ${products.length} products for parentCategory "${searchParentCategory}"`);
    return products;
  } catch (error: any) {
    // Suppress index error messages since we have a fallback
    if (error.code === 'failed-precondition' && error.message?.includes('index')) {
      // Silently fall through to fallback
    } else {
    console.error('Error fetching products by parent category:', error);
    }
    // Fallback: try without orderBy
    if (error.code === 'failed-precondition') {
      try {
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('active', '==', true),
          where('parentCategory', '==', searchParentCategory),
          limit(maxResults)
        );
        const querySnapshot = await getDocs(q);
        const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
        return normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
      } catch (fallbackError) {
        console.error('Error fetching products by parent category (fallback):', fallbackError);
        return [];
      }
    }
    return [];
  }
};

/**
 * Get product by ID or item number
 */
export const getProductById = async (productId: string) => {
  try {
    // Try by document ID first
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      // Only load from Storage if images are missing - this speeds up initial load
      const data = productSnap.data();
      const hasImages = data.imageUrl || (Array.isArray(data.images) && data.images.length > 0);
      return await normalizeProduct(productSnap, !hasImages); // Only load from Storage if no images in Firestore
    }

    // If not found, try by itemNumber
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('itemNumber', '==', productId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      const hasImages = data.imageUrl || (Array.isArray(data.images) && data.images.length > 0);
      return await normalizeProduct(querySnapshot.docs[0], !hasImages); // Only load from Storage if no images in Firestore
    }

    return null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

/**
 * Get clearance products
 */
export const getClearanceProducts = async (maxResults = 20) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('active', '==', true),
      where('isOnClearance', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
    return normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
  } catch (error: any) {
    // If index error, try without orderBy
    if (error.code === 'failed-precondition') {
      try {
        console.warn('Index not found for clearance products query, using fallback without orderBy');
        const productsRef = collection(db, 'products');
        const q = query(
          productsRef,
          where('active', '==', true),
          where('isOnClearance', '==', true),
          limit(maxResults)
        );
        const querySnapshot = await getDocs(q);
        const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
        // Sort manually by updatedAt if available
        const sorted = normalizedProducts.filter(p => p !== null).sort((a, b) => {
          if (a.updatedAt && b.updatedAt) {
            return b.updatedAt.toMillis() - a.updatedAt.toMillis();
          }
          return 0;
        });
        return sorted;
      } catch (fallbackError) {
        console.error('Error fetching clearance products (fallback):', fallbackError);
        return [];
      }
    }
    console.error('Error fetching clearance products:', error);
    return [];
  }
};

/**
 * Get handpieces products
 */
export const getHandpiecesProducts = async (maxResults = 100) => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('active', '==', true),
      where('parentCategory', '==', 'Handpieces'),
      limit(maxResults)
    );

    const querySnapshot = await getDocs(q);
    const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
    return normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
  } catch (error: any) {
    console.error('Error fetching handpieces products:', error);
    return [];
  }
};

/**
 * Get all top-level parent categories from Firestore
 * Only returns categories that don't have a parentCategory (top-level categories)
 * Structure matches Henry Schein: Level 1 (parent) -> Level 2 (subCategoryGroups) -> Level 3 (items)
 * 
 * If subcategories are stored as separate documents, we fetch them by parentCategory
 */
// Cache for categories to avoid re-fetching
let categoriesCache: { data: Record<string, any[]>; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCategories = async (useCache = true) => {
  try {
    // Return cached data if available and fresh
    if (useCache && categoriesCache && (Date.now() - categoriesCache.timestamp) < CACHE_DURATION) {
      return categoriesCache.data;
    }

    const categoriesRef = collection(db, 'collections');
    const querySnapshot = await getDocs(categoriesRef);
    
    if (querySnapshot.docs.length === 0) {
      return {};
    }
    
    const categories: Record<string, any[]> = {};
    const allDocs: any[] = [];
    
    // First pass: collect all documents
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      allDocs.push({ id: doc.id, ...data });
    });
    
    // Second pass: process top-level categories and their subcategories (optimized)
    for (const doc of allDocs) {
      const data = doc;
      
      // Only include top-level categories (no parentCategory or parentCategory is null/empty)
      const hasParent = data.parentCategory && String(data.parentCategory).trim() !== '';
      if (hasParent) {
        continue; // Skip subcategories, only show top-level
      }
      
      // Use 'name' field first, then 'title', then doc.id
      const categoryName = data.name || data.title || doc.id;
      
      // Try to get subcategories from the document itself first (optimized)
      let subCategoryGroups: any[] = [];
      
      if (data.subCategoryGroups && Array.isArray(data.subCategoryGroups) && data.subCategoryGroups.length > 0) {
        subCategoryGroups = data.subCategoryGroups.map((group: any) => ({
          title: group.title || group.name || '',
          items: Array.isArray(group.items) ? group.items : []
        }));
      } else if (data.subcategories && Array.isArray(data.subcategories) && data.subcategories.length > 0) {
        // Handle legacy format where subcategories might be strings or objects
        subCategoryGroups = data.subcategories.map((sub: any) => {
          if (typeof sub === 'string') {
            return { title: sub, items: [] };
          }
          return {
            title: sub.title || sub.name || '',
            items: Array.isArray(sub.items) ? sub.items : []
          };
        });
      } else {
        // If not in document, try to find child documents with this as parentCategory
        const categoryNameLower = categoryName.toLowerCase();
        const childDocs = allDocs.filter((childDoc: any) => {
          const childParent = childDoc.parentCategory || childDoc.parent;
          return childParent && String(childParent).trim().toLowerCase() === categoryNameLower;
        });
        
        if (childDocs.length > 0) {
          // Group child documents by their category/name to create subCategoryGroups
          const grouped: Record<string, any[]> = {};
          for (const child of childDocs) {
            const childName = child.name || child.title || child.id;
            if (!grouped[childName]) {
              grouped[childName] = [];
            }
            // If child has items, add them
            if (child.items && Array.isArray(child.items)) {
              grouped[childName].push(...child.items);
            }
            // Also check if child has subcategories that should be items
            if (child.subcategories && Array.isArray(child.subcategories)) {
              for (const sub of child.subcategories) {
                if (typeof sub === 'string' && !grouped[childName].includes(sub)) {
                  grouped[childName].push(sub);
                } else if (sub && sub.name && !grouped[childName].includes(sub.name)) {
                  grouped[childName].push(sub.name);
                }
              }
            }
          }
          
          subCategoryGroups = Object.keys(grouped).map((key) => ({
            title: key,
            items: grouped[key]
          }));
        }
      }
      
      categories[categoryName] = subCategoryGroups;
    }
    
    // Cache the result
    categoriesCache = { data: categories, timestamp: Date.now() };
    return categories;
  } catch (error: any) {
    console.error('❌ Error fetching categories:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    
    // Provide more helpful error information
    if (error?.code === 'permission-denied') {
      console.error('⚠️ Permission denied. Check Firestore security rules for "collections" collection.');
    } else if (error?.code === 'unavailable') {
      console.error('⚠️ Firestore is unavailable. Check network connection.');
    } else if (error?.code === 'unauthenticated') {
      console.error('⚠️ User is not authenticated. Categories may require authentication.');
    }
    
    return {};
  }
};

/**
 * Get category by name (with case-insensitive fallback)
 */
export const getCategoryByName = async (categoryName: string) => {
  if (!categoryName) return null;
  
  try {
    const categoriesRef = collection(db, 'collections');
    
    // First try exact match
    const q = query(
      categoriesRef,
      where('name', '==', categoryName),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        name: data.name || categoryName,
        subcategories: data.subcategories || [],
        subCategoryGroups: data.subCategoryGroups || [],
        ...data
      };
    }
    
    // If no exact match, try case-insensitive search by fetching all and filtering
    const allCategoriesSnapshot = await getDocs(categoriesRef);
    const normalizedSearch = categoryName.toLowerCase().trim();
    
    for (const doc of allCategoriesSnapshot.docs) {
      const data = doc.data();
      const docName = data.name || data.title || doc.id;
      if (docName && typeof docName === 'string' && docName.toLowerCase().trim() === normalizedSearch) {
        return {
          id: doc.id,
          name: docName,
          subcategories: data.subcategories || [],
          subCategoryGroups: data.subCategoryGroups || [],
          ...data
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching category by name:', error);
    return null;
  }
};

/**
 * Search products with relevance scoring
 * Prioritizes name matches, with closest matches at the top
 */
export const searchProducts = async (searchQuery: string, maxResults = 50) => {
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    const searchLower = searchQuery.toLowerCase().trim();
    const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
    
    // Score products based on relevance
    const normalizedProducts = await Promise.all(querySnapshot.docs.map(doc => normalizeProduct(doc, false)));
    const validProducts = normalizedProducts.filter(p => p !== null); // Filter out null (Bluetti) products
    const scoredProducts = validProducts
      .map(product => {
        let score = 0;
        const productName = (product.name || '').toLowerCase();
        const itemNumber = (product.itemNumber || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const manufacturer = (product.manufacturer || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        
        // Exact name match (highest priority)
        if (productName === searchLower) {
          score += 1000;
        }
        // Name starts with search query
        else if (productName.startsWith(searchLower)) {
          score += 500;
        }
        // All search words found in name (in order)
        else if (searchWords.every(word => productName.includes(word))) {
          score += 300;
          // Bonus if words are close together
          const firstWordIndex = productName.indexOf(searchWords[0]);
          const lastWordIndex = productName.lastIndexOf(searchWords[searchWords.length - 1]);
          if (lastWordIndex - firstWordIndex < searchQuery.length * 2) {
            score += 100;
          }
        }
        // Name contains search query
        else if (productName.includes(searchLower)) {
          score += 200;
        }
        // Individual words in name
        else {
          const nameWords = productName.split(/\s+/);
          searchWords.forEach(word => {
            if (nameWords.some(nw => nw.startsWith(word))) {
              score += 50;
            } else if (nameWords.some(nw => nw.includes(word))) {
              score += 25;
            }
          });
        }
        
        // Item number exact match
        if (itemNumber === searchLower) {
          score += 400;
        } else if (itemNumber.includes(searchLower)) {
          score += 100;
        }
        
        // Category match (lower priority)
        if (category.includes(searchLower)) {
          score += 30;
        }
        
        // Manufacturer match (lower priority)
        if (manufacturer.includes(searchLower)) {
          score += 20;
        }
        
        // Description match (lowest priority)
        if (description.includes(searchLower)) {
          score += 10;
        }
        
        return { product, score };
      })
      .filter(item => item.score > 0) // Only include products with matches
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, maxResults)
      .map(item => item.product);
    
    return scoredProducts;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

