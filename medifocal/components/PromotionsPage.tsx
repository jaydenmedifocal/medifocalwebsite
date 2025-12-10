import React from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

const PromotionsPage: React.FC<{ setCurrentView: (view: View) => void }> = ({ setCurrentView }) => {
    const promotionsUrl = viewToUrl({ page: 'promotions' });

    const promotionCategories = [
        {
            title: 'All Promotion Products',
            description: 'Browse all our current promotions and special offers',
            view: { page: 'allPromotionProducts' },
            color: 'from-brand-blue to-blue-700',
            icon: '🎯'
        },
        {
            title: 'Supplier Specials',
            description: 'Exclusive deals from our trusted suppliers',
            view: { page: 'supplierSpecials' },
            color: 'from-purple-600 to-purple-800',
            icon: '⭐'
        },
        {
            title: 'Product Bundles',
            description: 'Complete packages at special bundle prices',
            view: { page: 'bundles' },
            color: 'from-green-600 to-green-800',
            icon: '📦'
        },
        {
            title: 'Clearance Sale',
            description: 'Up to 70% off on selected items',
            view: { page: 'clearance' },
            color: 'from-red-600 to-red-800',
            icon: '🔥'
        },
        {
            title: 'New Arrivals',
            description: 'Latest products and newest additions',
            view: { page: 'newProducts' },
            color: 'from-yellow-500 to-orange-600',
            icon: '✨'
        },
        {
            title: 'Product Catalogues',
            description: 'Download our latest PDF catalogues',
            view: { page: 'catalogues' },
            color: 'from-indigo-600 to-indigo-800',
            icon: '📄'
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title="Promotions & Special Offers | Medifocal Dental Equipment"
                description="Browse all promotions, special offers, and discounts on dental equipment. Supplier specials, bundles, clearance items, and more."
                url={`https://medifocal.com${promotionsUrl}`}
            />
            
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-brand-blue to-blue-700 text-white rounded-xl p-8 mb-8 shadow-lg">
                    <h1 className="text-4xl font-extrabold mb-4">Promotions & Special Offers</h1>
                    <p className="text-lg opacity-90">Discover our latest promotions, special offers, and exclusive discounts on premium dental equipment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotionCategories.map((category, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentView(category.view)}
                            className={`bg-gradient-to-r ${category.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-left`}
                        >
                            <div className="text-4xl mb-4">{category.icon}</div>
                            <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                            <p className="text-white opacity-90">{category.description}</p>
                            <div className="mt-4 flex items-center text-white font-semibold">
                                <span>Explore</span>
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromotionsPage;



