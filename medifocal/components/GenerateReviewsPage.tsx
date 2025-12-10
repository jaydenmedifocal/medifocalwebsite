import React, { useState } from 'react';
import { generateReviewsForAllProducts } from '../services/generateReviews';

const GenerateReviewsPage: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; productsProcessed?: number; reviewsGenerated?: number; error?: any } | null>(null);

  const handleGenerate = async () => {
    if (!confirm('This will generate mock reviews for all products. This may take a few minutes. Continue?')) {
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const result = await generateReviewsForAllProducts();
      setResult(result);
    } catch (error) {
      setResult({ success: false, error });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Generate Mock Reviews</h1>
        <p className="text-gray-600 mb-6">
          This tool will generate realistic mock reviews for all active products in your store.
          Each product will receive 3-8 reviews with varied ratings and comments.
        </p>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-brand-blue text-white font-semibold py-3 px-6 rounded-md hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? 'Generating Reviews...' : 'Generate Reviews for All Products'}
        </button>

        {generating && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
            <p className="text-gray-600 mt-2">Please wait, this may take a few minutes...</p>
          </div>
        )}

        {result && (
          <div className={`mt-6 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.success ? (
              <div>
                <h3 className="font-semibold text-green-900 mb-2">✓ Reviews Generated Successfully!</h3>
                <p className="text-green-700">
                  Generated {result.reviewsGenerated} reviews for {result.productsProcessed} products.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-red-900 mb-2">✗ Error Generating Reviews</h3>
                <p className="text-red-700">{result.error?.message || 'An unknown error occurred'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateReviewsPage;

