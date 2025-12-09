import React from 'react';
import { View } from '../App';

interface PartnersPageProps {
    setCurrentView: (view: View) => void;
}

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const partners = [
    { name: 'GC', logoUrl: 'https://www.gceurope.com/wp-content/uploads/2021/10/GC-logo.svg' },
    { name: '3M', logoUrl: 'https://www.3m.com/3m_theme_assets/themes/3m/dist/images/3M-logo.svg' },
    { name: 'Kerr', logoUrl: 'https://www.kerrdental.com/themes/custom/kerr/logo.svg' },
    { name: 'Ivoclar Vivadent', logoUrl: 'https://www.ivoclarvivadent.com/img/logo-ivoclar-vivadent.svg' },
    { name: 'Dentsply Sirona', logoUrl: 'https://www.dentsplysirona.com/etc/designs/dentsplysirona/clientlib-all/static/media/logo.svg' },
    { name: 'Coltene', logoUrl: 'https://www.coltene.com/coltene-corporate-design/logo/COLTENE_Logo_RGB.svg' },
    { name: 'VOCO', logoUrl: 'https://www.voco.dental/assets/images/logo.svg' },
    { name: 'Septodont', logoUrl: 'https://www.septodont.com/themes/custom/septodont/logo.svg' },
];

const PartnersPage: React.FC<PartnersPageProps> = ({ setCurrentView }) => {

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
                    <span className="font-semibold text-gray-800">Our Partners</span>
                </nav>

                <div className="border-b border-gray-200 mb-12">
                    <nav className="-mb-px flex justify-center space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => handleTabClick('about')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            About Us
                        </button>
                        <button onClick={() => handleTabClick('sustainability')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Sustainability
                        </button>
                        <button onClick={() => handleTabClick('ourTeam')} className="border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300 whitespace-nowrap pb-4 px-2 border-b-2 font-medium text-base sm:text-lg transition-colors">
                            Our Team
                        </button>
                        <button onClick={() => handleTabClick('partners')} className="border-brand-blue text-brand-blue whitespace-nowrap pb-4 px-2 border-b-2 font-bold text-base sm:text-lg transition-colors">
                            Partners
                        </button>
                    </nav>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 lg:p-10">
                    <div className="text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Our Trusted Partners</h1>
                        <p className="text-md sm:text-lg text-gray-600 max-w-3xl mx-auto">
                            We are proud to partner with the leading brands in the dental industry to bring you the highest quality products and solutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mt-12">
                        {partners.map((partner) => (
                            <div key={partner.name} className="group flex items-center justify-center p-6 bg-gray-100 rounded-lg border border-gray-200 hover:shadow-lg hover:border-brand-blue transition-all duration-300 transform hover:-translate-y-1">
                                <img
                                    className="max-h-12 sm:max-h-16 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnersPage;
