import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { getProductsByCategory, searchProducts } from '../services/firestore';
import ProductCard from './ProductCard';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import { viewToUrl } from '../utils/routing';

interface DentalChairsPageProps {
  setCurrentView: (view: View) => void;
}

const DentalChairsPage: React.FC<DentalChairsPageProps> = ({ setCurrentView }) => {
  const [dentalChairs, setDentalChairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredChairs, setFilteredChairs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadDentalChairs = async () => {
      try {
        setLoading(true);
        // Only load these 4 specific dental chairs
        const allowedItemNumbers = [
          'mediseriesx6',
          'high-performance-dental-chair',
          'high-end-x5-disinfection-cart-type-dental-chair',
          'medifocal-high-end-dental-chair'
        ];
        
        // Search for dental chairs
        const chairs = await searchProducts('dental chair', 100);
        // Also try category-based search
        const categoryChairs = await getProductsByCategory('Dental Chairs', 100);
        // Combine and deduplicate
        const allChairs = [...chairs, ...categoryChairs];
        const uniqueChairs = Array.from(
          new Map(allChairs.map(chair => [chair.id || chair.itemNumber, chair])).values()
        );
        
        // Filter to only show the 4 allowed dental chairs
        const filteredChairs = uniqueChairs.filter(chair => {
          const itemNumber = (chair.itemNumber || '').toLowerCase();
          return allowedItemNumbers.some(allowed => itemNumber.includes(allowed.toLowerCase()));
        });
        
        // For dental chairs, use the second image as the display image
        const chairsWithSecondImage = filteredChairs.map(chair => {
          const images = chair.images || [];
          // If there are at least 2 images, use the second one (index 1)
          if (images.length >= 2) {
            return {
              ...chair,
              imageUrl: images[1] // Use second image
            };
          }
          // If only one image in array but also has imageUrl, keep imageUrl
          // Otherwise use first image from array if available
          if (images.length === 1 && !chair.imageUrl) {
            return {
              ...chair,
              imageUrl: images[0]
            };
          }
          return chair;
        });
        
        setDentalChairs(chairsWithSecondImage);
        setFilteredChairs(chairsWithSecondImage);
      } catch (error) {
        console.error('Error loading dental chairs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDentalChairs();
  }, []);

  useEffect(() => {
    let filtered = [...dentalChairs];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chair => 
        chair.name?.toLowerCase().includes(query) ||
        chair.description?.toLowerCase().includes(query) ||
        chair.manufacturer?.toLowerCase().includes(query)
      );
    }

    setFilteredChairs(filtered);
  }, [searchQuery, dentalChairs]);

  const pageUrl = viewToUrl({ page: 'dentalChairs' });
  const pageDescription = "Shop premium dental chairs Australia. Browse our extensive range of high-quality dental treatment units, remote control chairs, and dental surgery equipment. Fast shipping, expert support, 60+ years serving Australian dental practices.";

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <SEOHead
        title="Dental Chairs Australia | Premium Treatment Units | Medifocal"
        description={pageDescription}
        url={`https://medifocal.com${pageUrl}`}
        keywords="dental chairs, dental chairs Australia, dental treatment units, dental surgery equipment, remote control dental chairs, electric dental chairs, dental chair suppliers Australia, affordable dental chairs, dental equipment Australia"
      />
      <Breadcrumbs 
        items={[
          { label: 'Home', view: { page: 'home' } },
          { label: 'Dental Chairs' }
        ]} 
        setCurrentView={setCurrentView} 
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section - Enhanced Design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-gray-50 rounded-2xl shadow-2xl mb-12 border-2 border-gray-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue opacity-5 rounded-full -ml-48 -mb-48"></div>
          <div className="relative px-8 md:px-16 py-12 md:py-20 text-gray-900">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
                Premium Dental Chairs
                <span className="block text-3xl md:text-5xl mt-2 text-brand-blue">for Australian Practices</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed">
                State-of-the-art treatment units designed for modern dental practices. 
                Experience superior comfort, precision, and reliability.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white border-2 border-brand-blue rounded-lg px-6 py-3 shadow-md">
                  <div className="text-2xl font-bold text-brand-blue">60+</div>
                  <div className="text-sm text-gray-700">Years Experience</div>
                </div>
                <div className="bg-white border-2 border-brand-blue rounded-lg px-6 py-3 shadow-md">
                  <div className="text-2xl font-bold text-brand-blue">100%</div>
                  <div className="text-sm text-gray-700">Australian Standards</div>
                </div>
                <div className="bg-white border-2 border-brand-blue rounded-lg px-6 py-3 shadow-md">
                  <div className="text-2xl font-bold text-brand-blue">24/7</div>
                  <div className="text-sm text-gray-700">Expert Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Section - Enhanced Design */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-center text-gray-900">Premium Quality</h3>
              <p className="text-gray-600 text-sm text-center">High-grade materials and precision engineering</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-center text-gray-900">Fast Delivery</h3>
              <p className="text-gray-600 text-sm text-center">Quick shipping across Australia</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-center text-gray-900">Expert Installation</h3>
              <p className="text-gray-600 text-sm text-center">Professional setup and training</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-center text-gray-900">Competitive Pricing</h3>
              <p className="text-gray-600 text-sm text-center">Best value for your investment</p>
            </div>
          </div>
        </section>

        {/* Search Bar - Enhanced Design */}
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
                placeholder="Search dental chairs by name, model, or features..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all outline-none"
              />
            </div>
          </div>
          {filteredChairs.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing <span className="font-bold text-brand-blue">{filteredChairs.length}</span> premium dental chair{filteredChairs.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Products Grid - Enhanced Design */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-blue border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading premium dental chairs...</p>
            </div>
          </div>
        ) : filteredChairs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {filteredChairs.map((chair) => (
              <div key={chair.id || chair.itemNumber} className="transform hover:scale-[1.02] transition-transform duration-300">
                <ProductCard {...chair} setCurrentView={setCurrentView} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Dental Chairs Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms or browse all our dental chairs below.'
                : 'Dental chairs will be available soon. Please check back later or contact us for assistance.'}
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

        {/* Content Section - Enhanced Design */}
        <section className="mt-16 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              Premium Dental Chairs for Australian Practices
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-6 leading-relaxed text-center">
                Medifocal is Australia's leading supplier of <strong className="text-brand-blue">dental chairs</strong> and <strong className="text-brand-blue">treatment units</strong>. 
                We offer a comprehensive range of <strong>dental surgery equipment</strong> designed to meet the needs of modern 
                Australian dental practices.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-8 bg-brand-blue rounded-full mr-3"></span>
                    Types of Dental Chairs
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brand-blue mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Remote Control</strong> - Wireless foot controls for seamless operation</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brand-blue mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Electric</strong> - Smooth, quiet operation with memory positions</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-brand-blue mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Treatment Units</strong> - Complete systems with integrated instruments</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-8 bg-brand-blue rounded-full mr-3"></span>
                    Applications
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-brand-blue rounded-full mr-3"></span>
                      General Dentistry
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-brand-blue rounded-full mr-3"></span>
                      Orthodontics
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-brand-blue rounded-full mr-3"></span>
                      Oral Surgery
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-brand-blue rounded-full mr-3"></span>
                      Endodontics & Periodontics
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-brand-blue-50 to-blue-50 rounded-xl p-8 mt-10 border-l-4 border-brand-blue">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Need Expert Advice?
                </h3>
                <p className="text-gray-700 mb-6">
                  Our experienced team can help you select the perfect dental chair for your practice. 
                  Get personalized recommendations and competitive pricing.
                </p>
                <button
                  onClick={() => setCurrentView({ page: 'contact' })}
                  className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-brand-blue-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Contact Our Experts
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DentalChairsPage;
