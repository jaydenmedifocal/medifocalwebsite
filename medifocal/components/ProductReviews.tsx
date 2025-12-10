import React, { useState, useEffect } from 'react';
import { Review, ReviewSummary, getProductReviews, getReviewSummary, submitReview, hasUserReviewed, markReviewHelpful } from '../services/reviews';
import { useAuth } from '../contexts/AuthContext';
import { getReviewCriteria } from '../services/reviews';

interface ProductReviewsProps {
  itemNumber: string;
  productName?: string;
  productCategory?: string;
}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg'; interactive?: boolean; onRatingChange?: (rating: number) => void }> = ({ 
  rating, 
  size = 'md', 
  interactive = false,
  onRatingChange 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(rating);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      setCurrentRating(value);
      onRatingChange(value);
    }
  };
  
  const displayRating = hoverRating || currentRating;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className={interactive ? 'cursor-pointer focus:outline-none' : 'cursor-default'}
          onClick={() => handleClick(value)}
          onMouseEnter={() => interactive && setHoverRating(value)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          <svg
            className={sizeClasses[size]}
            fill={value <= displayRating ? '#fbbf24' : '#e5e7eb'}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const ReviewForm: React.FC<{
  itemNumber: string;
  productName?: string;
  productCategory?: string;
  onReviewSubmitted: () => void;
  onCancel: () => void;
}> = ({ itemNumber, productName, productCategory, onReviewSubmitted, onCancel }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [criteriaRatings, setCriteriaRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const criteria = getReviewCriteria(productCategory, productName);
  const criteriaLabels: Record<string, string> = {
    quality: 'Quality',
    durability: 'Durability',
    easeOfUse: 'Ease of Use',
    value: 'Value for Money',
    performance: 'Performance',
    reliability: 'Reliability',
    comfort: 'Comfort',
    functionality: 'Functionality',
    safety: 'Safety',
    effectiveness: 'Effectiveness',
    imageQuality: 'Image Quality'
  };
  
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 10) {
      setError('Please write at least 10 characters in your review');
      return;
    }
    
    // For guest reviews, require name
    if (!user && !guestName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await submitReview({
        productId: itemNumber,
        itemNumber,
        userId: user?.uid || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userName: user?.displayName || user?.email?.split('@')[0] || guestName.trim() || 'Anonymous',
        userEmail: user?.email || guestEmail.trim() || undefined,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        verifiedPurchase: false, // Could check order history
        criteriaRatings: Object.keys(criteriaRatings).length > 0 ? criteriaRatings : undefined,
        productCategory,
        productName
      });
      
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
      
      {!user && (
        <div className="mb-4 space-y-3">
          <div>
            <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              id="guest-name"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="Enter your name"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-2">
              Your Email (Optional)
            </label>
            <input
              id="guest-email"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="your.email@example.com"
              maxLength={254}
            />
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <StarRating rating={rating} interactive onRatingChange={setRating} />
      </div>
      
      {criteria.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate Specific Features
          </label>
          <div className="space-y-3">
            {criteria.map((criterion) => (
              <div key={criterion} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{criteriaLabels[criterion] || criterion}</span>
                <StarRating 
                  rating={criteriaRatings[criterion] || 0} 
                  size="sm"
                  interactive 
                  onRatingChange={(r) => setCriteriaRatings({ ...criteriaRatings, [criterion]: r })}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
          Review Title (Optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          placeholder="Share your experience with this product..."
          required
          minLength={10}
        />
        <p className="text-xs text-gray-500 mt-1">{comment.length} characters (minimum 10)</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-brand-blue text-white font-semibold px-6 py-2 rounded-md hover:bg-brand-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const ReviewItem: React.FC<{ review: Review; onHelpful: (reviewId: string) => void }> = ({ review, onHelpful }) => {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  return (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-0 last:mb-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={review.rating} size="sm" />
            <span className="font-semibold text-gray-900">{review.userName}</span>
            {review.verifiedPurchase && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Verified Purchase
              </span>
            )}
          </div>
          {review.title && (
            <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
          )}
        </div>
        <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
      </div>
      
      {review.criteriaRatings && Object.keys(review.criteriaRatings).length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-md">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(review.criteriaRatings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <StarRating rating={value || 0} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{review.comment}</p>
      
      <button
        onClick={() => review.id && onHelpful(review.id)}
        className="text-sm text-gray-600 hover:text-brand-blue flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        Helpful ({review.helpfulCount || 0})
      </button>
    </div>
  );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ itemNumber, productName, productCategory }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [filter, setFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');
  
  useEffect(() => {
    loadReviews();
  }, [itemNumber]);
  
  useEffect(() => {
    if (user) {
      checkUserReview();
    }
  }, [user, itemNumber]);
  
  const loadReviews = async () => {
    setLoading(true);
    try {
      const [reviewsData, summaryData] = await Promise.all([
        getProductReviews(itemNumber),
        getReviewSummary(itemNumber)
      ]);
      setReviews(reviewsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkUserReview = async () => {
    if (!user) return;
    const reviewed = await hasUserReviewed(itemNumber, user.uid);
    setHasReviewed(reviewed);
  };
  
  const handleReviewSubmitted = () => {
    setShowForm(false);
    loadReviews();
    checkUserReview();
  };
  
  const handleHelpful = async (reviewId: string) => {
    try {
      await markReviewHelpful(reviewId);
      loadReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };
  
  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === filter);
  
  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
          {summary && summary.totalReviews > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating rating={summary.averageRating} size="lg" />
                <span className="text-2xl font-bold text-gray-900">{summary.averageRating}</span>
                <span className="text-gray-600">({summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'})</span>
              </div>
            </div>
          )}
        </div>
        {!showForm && !hasReviewed && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-blue text-white font-semibold px-6 py-2 rounded-md hover:bg-brand-blue-dark transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>
      
      {summary && summary.totalReviews > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution];
              const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {showForm && (
        <div className="mb-8">
          <ReviewForm
            itemNumber={itemNumber}
            productName={productName}
            productCategory={productCategory}
            onReviewSubmitted={handleReviewSubmitted}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      {summary && summary.totalReviews > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-brand-blue text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({summary.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution];
            if (count === 0) return null;
            return (
              <button
                key={rating}
                onClick={() => setFilter(rating as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === rating 
                    ? 'bg-brand-blue text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating}★ ({count})
              </button>
            );
          })}
        </div>
      )}
      
      {filteredReviews.length > 0 ? (
        <div>
          {filteredReviews.map((review) => (
            <ReviewItem key={review.id} review={review} onHelpful={handleHelpful} />
          ))}
        </div>
      ) : summary && summary.totalReviews === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
          {!hasReviewed && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-brand-blue text-white font-semibold px-6 py-2 rounded-md hover:bg-brand-blue-dark transition-colors"
            >
              Write the First Review
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No reviews match your filter.</p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;

