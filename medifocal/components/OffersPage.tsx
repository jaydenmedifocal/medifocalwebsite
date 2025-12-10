import React, { useState, useRef, useEffect } from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

interface OffersPageProps {
    setCurrentView: (view: View) => void;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

const useOnClickOutside = (ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

const OffersPage: React.FC<OffersPageProps> = ({ setCurrentView }) => {
    const [isPromoDropdownOpen, setPromoDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(dropdownRef, () => setPromoDropdownOpen(false));

    const offersUrl = viewToUrl({ page: 'offers' });
    
    return (
        <div className="bg-white">
            <SEOHead
                title="Special Offers & Sales | Medifocal Dental Equipment"
                description="Save on premium dental equipment with Medifocal's latest offers and sales. Exclusive discounts on autoclaves, dental chairs, imaging equipment, and more. Limited time offers."
                url={`https://medifocal.com${offersUrl}`}
            />
            <div className="container mx-auto px-4 py-8">

                <div className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue mb-2">Offers</h1>
                    <p className="text-brand-blue text-lg font-medium">Save with the latest sales and offers from Medifocal and our suppliers.</p>
                </div>

                {/* Featured Offer Section */}
                <div className="mb-12">
                    <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg border-2 border-brand-blue overflow-hidden relative border-4">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Image Section */}
                            <div className="md:w-1/3 flex-shrink-0">
                                <img 
                                    src="https://images.unsplash.com/photo-1599045118108-bf9954418b76?q=80&w=600&auto=format&fit=crop" 
                                    alt="Extra Value DE Gloves - 200 pack special offer" 
                                    className="w-full h-64 md:h-80 object-contain rounded-lg bg-white p-4 shadow-md border-2 border-gray-200"
                                    loading="eager"
                                    width="400"
                                    height="320"
                                />
                            </div>
                            
                            {/* Content Section */}
                            <div className="md:w-2/3 flex-1">
                                <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider shadow-md">
                                    Featured Offer
                                </span>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-brand-blue mb-4">
                                    Extra Value DE Gloves
                                </h2>
                                <p className="text-lg md:text-xl text-brand-blue font-medium mb-6 leading-relaxed">
                                    Stock up now with our 200-pack extra value special. High-quality protection for your practice.
                                </p>
                                <button 
                                    onClick={() => setCurrentView({ page: 'productList', categoryName: 'Gloves', parentCategory: 'Infection Control' })}
                                    className="bg-brand-blue text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Shop Offer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop By Section */}
                <section className="bg-brand-blue text-white">
                    <div className="container mx-auto px-4 py-12 md:py-20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="md:w-1/2 text-center md:text-left">
                            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-lg">Shop By</h2>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button className="bg-white text-brand-blue font-bold py-3 px-8 rounded-md hover:bg-brand-gray transition-colors shadow-md">
                                    Catalogues
                                </button>
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        onClick={() => setPromoDropdownOpen(!isPromoDropdownOpen)}
                                        className="bg-white text-brand-blue font-bold py-3 px-8 rounded-md hover:bg-brand-gray transition-colors flex items-center justify-center w-full shadow-md"
                                    >
                                        Promotions <ChevronDownIcon />
                                    </button>
                                    {isPromoDropdownOpen && (
                                        <div className="absolute top-full mt-2 w-full sm:w-56 bg-white rounded-md shadow-lg z-10 text-left border-2 border-brand-blue">
                                            <a href="#" title="View all dental equipment promotions" className="block px-4 py-2 text-brand-blue hover:bg-brand-gray font-medium">All Promotions</a>
                                            <a href="#" title="View promotion products" className="block px-4 py-2 text-brand-blue hover:bg-brand-gray font-medium">Promotion Products</a>
                                            <a href="#" title="View prior purchases on promotion" className="block px-4 py-2 text-brand-blue hover:bg-brand-gray font-medium">Prior Purchases on Promotion</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="mt-8 text-white font-bold drop-shadow-md">Exclusive online-only offers from Medifocal.</p>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <img src="https://i.imgur.com/GAYs5mN.png" alt="Man holding a tablet showing 2025 dental equipment offers" className="max-w-xs md:max-w-sm w-full" loading="lazy" width="400" height="400" />
                        </div>
                    </div>
                </div>
            </section>

                {/* More Ways to Save Section */}
                <section className="bg-white">
                    <div className="container mx-auto px-4 py-16">
                        <h2 className="text-3xl font-bold text-center text-brand-blue mb-10">More Ways to Save</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-brand-blue text-center flex flex-col items-center">
                                <img src="https://i.imgur.com/Qk7lW2V.png" alt="Shopping bag icon for bundle offers" className="h-24 mb-4" loading="lazy" width="96" height="96" />
                                <h3 className="text-2xl font-extrabold text-brand-blue mb-2">Bundle & Save</h3>
                                <p className="text-brand-blue mb-4 flex-grow font-medium">Save with our bundle offers.</p>
                                <button className="text-brand-blue font-bold hover:underline">View Bundles</button>
                            </div>
                            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-brand-blue text-center flex flex-col items-center">
                                <img src="https://i.imgur.com/pB33a2s.png" alt="Shopping basket icon for supplier specials" className="h-24 mb-4" loading="lazy" width="96" height="96" />
                                <h3 className="text-2xl font-extrabold text-brand-blue mb-2">Supplier Specials</h3>
                                <p className="text-brand-blue mb-4 flex-grow font-medium">Offers from our suppliers.</p>
                                <button className="text-brand-blue font-bold hover:underline">View Specials</button>
                            </div>
                            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-brand-blue text-center flex flex-col items-center">
                                <img src="https://i.imgur.com/zMSz65S.png" alt="Percentage tag icon" className="h-24 mb-4"/>
                                <h3 className="text-2xl font-extrabold text-brand-blue mb-2">Clearance</h3>
                                <p className="text-brand-blue mb-4 flex-grow font-medium">Last chance to save big on consumables. While stocks last.</p>
                                <button onClick={() => setCurrentView({ page: 'clearance' })} className="text-brand-blue font-bold hover:underline">Shop Clearance</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OffersPage;
