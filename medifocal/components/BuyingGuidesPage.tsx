import React from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import { viewToUrl } from '../utils/routing';

interface BuyingGuidesPageProps {
  setCurrentView: (view: View) => void;
}

const buyingGuides = [
  {
    slug: 'dental-chairs',
    title: 'How to Choose the Right Dental Chair',
    description: 'Complete guide to choosing the perfect dental chair for your practice. Learn about features, specifications, and what to consider.',
    category: 'Dental Chairs',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop'
  },
  {
    slug: 'sterilization-equipment',
    title: 'Dental Sterilization Equipment Guide',
    description: 'Learn about autoclaves, infection control, and compliance requirements for Australian dental practices.',
    category: 'Equipment',
    image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&h=400&fit=crop'
  },
  {
    slug: 'handpieces',
    title: 'Dental Handpieces Buying Guide',
    description: 'Complete guide to choosing dental handpieces. Learn about high-speed vs low-speed handpieces and features.',
    category: 'Handpieces',
    image: 'https://images.unsplash.com/photo-1570969691209-62c8c0831b77?w=600&h=400&fit=crop'
  }
];

const BuyingGuidesPage: React.FC<BuyingGuidesPageProps> = ({ setCurrentView }) => {
  const pageUrl = viewToUrl({ page: 'buyingGuides' });

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <SEOHead
        title="Dental Equipment Buying Guides | Expert Advice | Medifocal"
        description="Expert buying guides for dental equipment. Learn how to choose dental chairs, handpieces, sterilization equipment, and more. Expert advice from Medifocal's 60+ years of experience."
        keywords="dental equipment buying guide, how to choose dental chair, dental handpiece guide, autoclave buying guide, dental practice setup, dental equipment Australia"
        url={`https://medifocal.com${pageUrl}`}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', view: { page: 'home' } },
          { label: 'Buying Guides' }
        ]}
        setCurrentView={setCurrentView}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
              Dental Equipment Buying Guides
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-95">
              Expert advice to help you make informed decisions
            </p>
            <p className="text-lg opacity-90 max-w-3xl">
              With 60+ years of experience serving Australian dental practices, our expert team has created comprehensive buying guides to help you choose the perfect equipment for your practice.
            </p>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {buyingGuides.map((guide) => (
            <div
              key={guide.slug}
              onClick={() => setCurrentView({ page: 'buyingGuide', guideSlug: guide.slug })}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100"
            >
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 bg-brand-blue text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {guide.category}
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{guide.title}</h2>
                <p className="text-gray-600 mb-4">{guide.description}</p>
                <button className="text-brand-blue font-semibold hover:underline flex items-center">
                  Read Guide
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Personalized Advice?</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Our expert team can provide personalized recommendations based on your specific practice needs, budget, and requirements.
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
  );
};

export default BuyingGuidesPage;

