import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy, limit, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Review {
  id?: string;
  productId: string;
  itemNumber: string;
  userId: string;
  userName: string;
  userEmail?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt: any;
  updatedAt?: any;
  // Product-specific criteria ratings
  criteriaRatings?: {
    quality?: number;
    durability?: number;
    easeOfUse?: number;
    value?: number;
    performance?: number;
    reliability?: number;
    [key: string]: number | undefined;
  };
  // Product category for context
  productCategory?: string;
  productName?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Get product-specific review criteria based on category
 */
export const getReviewCriteria = (category?: string, productName?: string): string[] => {
  const categoryLower = (category || '').toLowerCase();
  const nameLower = (productName || '').toLowerCase();
  
  // Equipment-specific criteria
  if (categoryLower.includes('equipment') || categoryLower.includes('autoclave') || categoryLower.includes('chair')) {
    return ['quality', 'durability', 'easeOfUse', 'performance', 'reliability', 'value'];
  }
  
  // Dental chairs specific
  if (categoryLower.includes('dental chair') || nameLower.includes('dental chair')) {
    return ['comfort', 'durability', 'easeOfUse', 'functionality', 'value', 'reliability'];
  }
  
  // Autoclaves specific
  if (categoryLower.includes('autoclave') || nameLower.includes('autoclave')) {
    return ['performance', 'reliability', 'easeOfUse', 'durability', 'value', 'safety'];
  }
  
  // Consumables/Supplies
  if (categoryLower.includes('consumable') || categoryLower.includes('supply') || categoryLower.includes('instrument')) {
    return ['quality', 'durability', 'value', 'effectiveness', 'easeOfUse'];
  }
  
  // Imaging equipment
  if (categoryLower.includes('imaging') || categoryLower.includes('x-ray') || categoryLower.includes('scanner')) {
    return ['imageQuality', 'easeOfUse', 'reliability', 'value', 'performance'];
  }
  
  // Default criteria
  return ['quality', 'value', 'easeOfUse', 'durability'];
};

/**
 * Get reviews for a product
 */
export const getProductReviews = async (itemNumber: string, maxResults = 50): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('itemNumber', '==', itemNumber),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Review));
  } catch (error: any) {
    // If index error, try without orderBy
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(
          reviewsRef,
          where('itemNumber', '==', itemNumber),
          limit(maxResults)
        );
        
        const querySnapshot = await getDocs(q);
        const reviews = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));
        
        // Sort manually by createdAt
        return reviews.sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
      } catch (fallbackError) {
        console.error('Error fetching reviews (fallback):', fallbackError);
        return [];
      }
    }
    console.error('Error fetching reviews:', error);
    return [];
  }
};

/**
 * Get review summary (average rating, count, distribution)
 */
export const getReviewSummary = async (itemNumber: string): Promise<ReviewSummary> => {
  try {
    const reviews = await getProductReviews(itemNumber, 1000); // Get all reviews for summary
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const distribution = reviews.reduce((acc, review) => {
      const rating = review.rating as 1 | 2 | 3 | 4 | 5;
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as ReviewSummary['ratingDistribution']);
    
    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
      ratingDistribution: distribution
    };
  } catch (error) {
    console.error('Error calculating review summary:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
};

/**
 * Submit a review
 */
export const submitReview = async (
  review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const reviewData = {
      ...review,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(reviewsRef, reviewData);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

/**
 * Update a review
 */
export const updateReview = async (reviewId: string, updates: Partial<Review>): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await updateDoc(reviewRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

/**
 * Check if user has already reviewed a product
 */
export const hasUserReviewed = async (itemNumber: string, userId: string): Promise<boolean> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef,
      where('itemNumber', '==', itemNumber),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user review:', error);
    return false;
  }
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId: string): Promise<void> => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    const reviewDoc = await getDoc(reviewRef);
    
    if (reviewDoc.exists()) {
      const currentCount = reviewDoc.data().helpfulCount || 0;
      await updateDoc(reviewRef, {
        helpfulCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error marking review helpful:', error);
    throw error;
  }
};

