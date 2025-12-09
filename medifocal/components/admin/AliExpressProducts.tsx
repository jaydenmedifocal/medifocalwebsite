import React, { useState, useEffect } from 'react';
import { getAuthorizationUrl, getStoredTokens, getValidAccessToken } from '../../services/aliexpressOAuth';
import { searchAliExpressProducts, getAliExpressProductDetails, AliExpressProduct, AliExpressSearchResult } from '../../services/aliexpressProducts';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AliExpressProducts: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AliExpressSearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [importingProductId, setImportingProductId] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const tokens = getStoredTokens();
      const validToken = await getValidAccessToken();
      setIsAuthenticated(!!tokens && !!validToken);
    };
    checkAuth();
  }, []);

  const handleAuthorize = () => {
    const authUrl = getAuthorizationUrl();
    window.location.href = authUrl;
  };

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      setError('Please enter a search keyword');
      return;
    }

    setIsSearching(true);
    setError(null);
    setCurrentPage(page);

    try {
      const results = await searchAliExpressProducts(searchQuery.trim(), page, 20);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message || 'Failed to search products. Please try again.');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportProduct = async (product: AliExpressProduct) => {
    if (!confirm(`Import "${product.productTitle}" to your product catalog?`)) {
      return;
    }

    setImportingProductId(product.productId);
    setError(null);

    try {
      // Get full product details
      const fullProduct = await getAliExpressProductDetails(product.productId);
      const productToImport = fullProduct || product;

      // Convert AliExpress product to Firestore format
      const firestoreProduct = {
        name: productToImport.productTitle,
        itemNumber: `AE-${productToImport.productId}`,
        price: parseFloat(productToImport.salePrice.replace(/[^0-9.]/g, '')) || 0,
        displayPrice: `$${parseFloat(productToImport.salePrice.replace(/[^0-9.]/g, '')).toFixed(2)}`,
        originalPrice: productToImport.originalPrice ? `$${parseFloat(productToImport.originalPrice.replace(/[^0-9.]/g, '')).toFixed(2)}` : undefined,
        imageUrl: productToImport.productImageUrl,
        images: [productToImport.productImageUrl],
        category: 'Imported',
        parentCategory: 'AliExpress',
        manufacturer: productToImport.storeName || 'AliExpress',
        description: `Imported from AliExpress. ${productToImport.productTitle}`,
        details: `Original AliExpress product. Store: ${productToImport.storeName || 'N/A'}. Rating: ${productToImport.rating.averageStar || 'N/A'} stars (${productToImport.rating.totalValidNum || '0'} reviews).`,
        active: true,
        isOnClearance: false,
        tag: '',
        tagColor: '',
        variants: [],
        variantId: null,
        productId: productToImport.productId,
        quantity: 0,
        specialPrice: null,
        aliexpressUrl: productToImport.productUrl,
        aliexpressStore: productToImport.storeName,
        aliexpressRating: productToImport.rating.averageStar,
        aliexpressReviews: productToImport.rating.totalValidNum,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to Firestore
      await addDoc(collection(db, 'products'), firestoreProduct);

      alert(`Product "${product.productTitle}" imported successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to import product. Please try again.');
    } finally {
      setImportingProductId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AliExpress Products</h1>
        <p className="text-gray-600">Search and import products from AliExpress to your catalog</p>
      </div>

      {/* Authentication Status */}
      {!isAuthenticated ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
              <p className="text-yellow-700 mb-4">
                You need to authorize with AliExpress to search and import products. Click the button below to connect your AliExpress account.
              </p>
              <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Due to AliExpress system upgrades (until Dec 5, 2025), please log in to{' '}
                  <a href="https://login.aliexpress.com/user/seller/login?bizSegment=GSP" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                    Seller Center
                  </a>{' '}
                  first, then authorize this application.
                </p>
              </div>
              <button
                onClick={handleAuthorize}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Authorize with AliExpress
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)}
                placeholder="Search for products (e.g., dental equipment, handpieces, autoclaves)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
              <button
                onClick={() => handleSearch(1)}
                disabled={isSearching}
                className="bg-brand-blue hover:bg-brand-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Search Results ({searchResults.totalResults.toLocaleString()} products found)
                </h2>
                {searchResults.hasMore && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSearch(currentPage - 1)}
                      disabled={currentPage === 1 || isSearching}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700">Page {currentPage}</span>
                    <button
                      onClick={() => handleSearch(currentPage + 1)}
                      disabled={!searchResults.hasMore || isSearching}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {searchResults.products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products found. Try a different search term.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.products.map((product) => (
                    <div key={product.productId} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                        <img
                          src={product.productImageUrl}
                          alt={product.productTitle}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" title={product.productTitle}>
                          {product.productTitle}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-2xl font-bold text-brand-blue">{product.salePrice}</p>
                            {product.originalPrice && product.originalPrice !== product.salePrice && (
                              <p className="text-sm text-gray-500 line-through">{product.originalPrice}</p>
                            )}
                          </div>
                          {product.rating.averageStar && (
                            <div className="text-right">
                              <p className="text-sm font-semibold text-yellow-600">★ {product.rating.averageStar}</p>
                              <p className="text-xs text-gray-500">{product.rating.totalValidNum} reviews</p>
                            </div>
                          )}
                        </div>
                        {product.storeName && (
                          <p className="text-sm text-gray-600 mb-3">Store: {product.storeName}</p>
                        )}
                        <div className="flex gap-2">
                          <a
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                          >
                            View on AliExpress
                          </a>
                          <button
                            onClick={() => handleImportProduct(product)}
                            disabled={importingProductId === product.productId}
                            className="flex-1 bg-brand-blue hover:bg-brand-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {importingProductId === product.productId ? 'Importing...' : 'Import'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AliExpressProducts;
