import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { searchProducts, getAllProducts } from '../services/firestore';
import ProductCard from './ProductCard';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

interface BrandPageProps {
  brandName: string;
  setCurrentView: (view: View) => void;
}

const BrandPage: React.FC<BrandPageProps> = ({ brandName, setCurrentView }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadBrandProducts = async () => {
      try {
        setLoading(true);
        // Search for products by brand name
        const allProducts = await getAllProducts(500);
        const brandProducts = allProducts.filter(p => 
          p.manufacturer?.toLowerCase() === brandName.toLowerCase() ||
          p.manufacturer?.toLowerCase().includes(brandName.toLowerCase())
        );
        setProducts(brandProducts);
        setFilteredProducts(brandProducts);
      } catch (error) {
        console.error('Error loading brand products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBrandProducts();
  }, [brandName]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const pageUrl = viewToUrl({ page: 'brand', brandName });
  const pageDescription = `Shop ${brandName} dental products at Medifocal. Browse our comprehensive range of ${brandName} dental supplies, equipment, and instruments. Fast shipping Australia-wide, expert support, 60+ years experience.`;
  const pageTitle = `${brandName} Dental Products | Dental Supplies Australia | Medifocal`;

  // Get unique categories for this brand
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords={`${brandName}, ${brandName} dental products, ${brandName} dental supplies, dental equipment ${brandName}, ${brandName} Australia, dental supplies Australia`}
        url={`https://medifocal.com${pageUrl}`}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              {brandName} Dental Products
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-95">
              Premium {brandName} dental supplies and equipment for Australian practices
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white border-opacity-30">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm opacity-90">Products Available</div>
              </div>
              {categories.length > 0 && (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3 border border-white border-opacity-30">
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <div className="text-sm opacity-90">Categories</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${brandName} products...`}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all outline-none"
              />
            </div>
          </div>
          {filteredProducts.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-bold text-brand-blue">{filteredProducts.length}</span> of <span className="font-bold">{products.length}</span> {brandName} products
            </div>
          )}
        </div>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Shop by Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setCurrentView({ page: 'productList', categoryName: category })}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-brand-blue hover:text-white transition-colors text-sm font-medium"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-blue border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading {brandName} products...</p>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredProducts.map((product) => (
              <div key={product.id || product.itemNumber} className="transform hover:scale-[1.02] transition-transform duration-300">
                <ProductCard {...product} setCurrentView={setCurrentView} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No {brandName} Products Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No products match "${searchQuery}". Try adjusting your search.`
                : `We don't currently have ${brandName} products in our catalog. Please check back later or contact us for assistance.`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-brand-blue-dark transition-colors font-semibold shadow-md hover:shadow-lg"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Content Section */}
        <section className="mt-16 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              {brandName} Products at Medifocal
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed text-center">
                Medifocal is proud to partner with <strong className="text-brand-blue">{brandName}</strong> to offer 
                premium dental products to Australian practices. All {brandName} products are quality assured and 
                meet Australian standards.
              </p>
              
              <div className="bg-gradient-to-r from-brand-blue-50 to-blue-50 rounded-xl p-8 mt-10 border-l-4 border-brand-blue">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Why Choose {brandName} Products?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Premium quality from trusted manufacturer</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Australian standards compliant</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Fast shipping Australia-wide</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Expert support and advice</span>
                  </li>
                </ul>
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={() => setCurrentView({ page: 'contact' })}
                  className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-brand-blue-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Contact Us About {brandName} Products
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BrandPage;



