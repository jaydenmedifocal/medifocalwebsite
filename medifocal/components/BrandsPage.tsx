import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { getAllProducts } from '../services/firestore';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import { viewToUrl } from '../utils/routing';

interface BrandsPageProps {
  setCurrentView: (view: View) => void;
}

const BrandsPage: React.FC<BrandsPageProps> = ({ setCurrentView }) => {
  const [brands, setBrands] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const products = await getAllProducts(1000);
        
        // Count products per brand
        const brandCounts: Record<string, number> = {};
        products.forEach(product => {
          if (product.manufacturer) {
            brandCounts[product.manufacturer] = (brandCounts[product.manufacturer] || 0) + 1;
          }
        });
        
        // Convert to array and sort by count
        const brandsList = Object.entries(brandCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        setBrands(brandsList);
      } catch (error) {
        console.error('Error loading brands:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBrands();
  }, []);

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageUrl = viewToUrl({ page: 'brands' });
  const pageDescription = "Browse dental product brands at Medifocal. We partner with leading manufacturers including 3M, Kerr, GC, VOCO, Ultradent, and more. Quality dental supplies for Australian practices.";
  const pageTitle = "Dental Product Brands | Premium Manufacturers | Medifocal";

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        keywords="dental brands, dental manufacturers, 3M dental, Kerr dental, GC dental, VOCO dental, Ultradent, dental product brands Australia"
        url={`https://medifocal.com${pageUrl}`}
      />
      <Breadcrumbs 
        items={[
          { label: 'Home', view: { page: 'home' } },
          { label: 'Brands' }
        ]} 
        setCurrentView={setCurrentView} 
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Dental Product Brands
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-95">
              Premium manufacturers trusted by Australian dental practices
            </p>
            <p className="text-lg opacity-90 max-w-3xl">
              Medifocal partners with leading dental product manufacturers to bring you the highest quality 
              dental supplies, equipment, and instruments. Browse our brand partners below.
            </p>
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
                placeholder="Search brands..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all outline-none"
              />
            </div>
          </div>
          {filteredBrands.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-bold text-brand-blue">{filteredBrands.length}</span> of <span className="font-bold">{brands.length}</span> brands
            </div>
          )}
        </div>

        {/* Brands Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-blue border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading brands...</p>
            </div>
          </div>
        ) : filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-12">
            {filteredBrands.map((brand) => (
              <button
                key={brand.name}
                onClick={() => setCurrentView({ page: 'brand', brandName: brand.name })}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-brand-blue hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group"
              >
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
                  {brand.name}
                </div>
                <div className="text-sm text-gray-600">
                  {brand.count} product{brand.count !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Brands Found</h2>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? `No brands match "${searchQuery}". Try a different search term.`
                : 'No brands available at this time.'}
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
              Trusted Brand Partners
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed text-center">
                Medifocal partners with leading dental product manufacturers to ensure you have access to 
                the latest innovations and proven products. Our brand partners include industry leaders 
                such as 3M Solventum, Kerr, GC, VOCO, Ultradent, ADM, Dentalife, MES, and many more.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-8 bg-brand-blue rounded-full mr-3"></span>
                    Why Choose Brand Products?
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Proven quality and reliability</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Latest innovations and technology</span>
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
                      <span>Expert support and training</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-8 bg-brand-blue rounded-full mr-3"></span>
                    Our Commitment
                  </h3>
                  <p className="text-gray-700 mb-4">
                    At Medifocal, we carefully select our brand partners to ensure you receive only the 
                    highest quality dental products. All brands in our catalog meet strict quality 
                    standards and are suitable for use in Australian dental practices.
                  </p>
                  <p className="text-gray-700">
                    With 60+ years of experience serving Australian dental practices, we understand the 
                    importance of reliable, high-quality products. That's why we partner with trusted 
                    manufacturers you can depend on.
                  </p>
                </div>
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={() => setCurrentView({ page: 'contact' })}
                  className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-brand-blue-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Contact Us About Brand Products
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BrandsPage;

