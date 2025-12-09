import React from 'react';
import { View } from '../App';

interface SustainabilityPageProps {
    setCurrentView: (view: View) => void;
}

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121a2 2 0 01-2.828 0l-5-5a2 2 0 012.828-2.828l5 5a2 2 0 010 2.828z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h.01" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v4m0 0H9m3 0h3m-3-12a3 3 0 013-3h3a3 3 0 013 3v2a3 3 0 01-3 3h-3a3 3 0 01-3-3V4z" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.8 21.32a9 9 0 01-4.745-7.382M16.2 3.68a9 9 0 014.745 7.382" /></svg>;

const SustainabilityPage: React.FC<SustainabilityPageProps> = ({ setCurrentView }) => {

    const handleTabClick = (page: 'about' | 'sustainability' | 'ourTeam' | 'partners') => {
        setCurrentView({ page });
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <nav className="flex items-center text-sm mb-8 text-gray-500" aria-label="Breadcrumb">
                    <button onClick={() => setCurrentView({ page: 'home' })} className="flex items-center hover:text-brand-blue font-medium transition-colors">
                        <HomeIcon />
                        <span className="ml-2">Home</span>
                    </button>
                    <span className="mx-2">/</span>
                    <button onClick={() => setCurrentView({ page: 'about' })} className="hover:text-brand-blue font-medium transition-colors">
                        About Us
                    </button>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-gray-800">Sustainability</span>
                </nav>

                <div className="border-b border-gray-200 mb-12">
                    <nav className="-mb-px flex justify-center space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => handleTabClick('about')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            About Us
                        </button>
                        <button onClick={() => handleTabClick('sustainability')} className="border-brand-blue text-brand-blue whitespace-nowrap pb-4 px-2 border-b-2 font-bold text-base sm:text-lg transition-colors">
                            Sustainability
                        </button>
                        <button onClick={() => handleTabClick('ourTeam')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Our Team
                        </button>
                        <button onClick={() => handleTabClick('partners')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Partners
                        </button>
                    </nav>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 lg:p-10">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Our Commitment to a Greener Future</h1>
                        <p className="text-md sm:text-lg text-gray-600 max-w-3xl mx-auto">
                            At Medifocal, we are dedicated to reducing our environmental impact and promoting responsible business practices throughout our operations and supply chain.
                        </p>
                    </div>

                    <div className="mt-12 grid md:grid-cols-2 gap-x-12 gap-y-10">
                        <div className="prose prose-lg max-w-none">
                            <p>
                                We believe that a commitment to sustainability is not just good for the planet, but it is also good for business. By making conscious decisions about our products, packaging, and processes, we can create a more sustainable future for the dental industry.
                            </p>
                            <p>
                                We are continuously looking for new ways to improve our sustainability practices. We are excited about the journey ahead and are committed to making a positive impact on the environment.
                            </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-green-800 mb-4">Our Goals for 2028</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <span className="inline-block bg-green-200 text-green-800 rounded-full p-2 mr-4"><LeafIcon /></span>
                                    <span><span className="font-bold">Reduce our carbon footprint</span> by 25%.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block bg-green-200 text-green-800 rounded-full p-2 mr-4"><TruckIcon /></span>
                                    <span>Ensure that <span className="font-bold">50% of our products</span> are made from sustainable materials.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block bg-green-200 text-green-800 rounded-full p-2 mr-4"><GlobeIcon /></span>
                                    <span>Achieve <span className="font-bold">100% recyclable or compostable</span> packaging.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">Our Key Initiatives</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-green-500 transition-all">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Eco-Friendly Products</h3>
                                <p className="text-gray-600 text-sm">Expanding our range of biodegradable and recyclable products.</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-green-500 transition-all">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Reduced Packaging Waste</h3>
                                <p className="text-gray-600 text-sm">Minimizing packaging and using recycled materials.</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-green-500 transition-all">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Green Supply Chain</h3>
                                <p className="text-gray-600 text-sm">Partnering with carbon-neutral shipping providers.</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg hover:border-green-500 transition-all">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Community Engagement</h3>
                                <p className="text-gray-600 text-sm">Promoting environmental stewardship in the dental community.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SustainabilityPage;
