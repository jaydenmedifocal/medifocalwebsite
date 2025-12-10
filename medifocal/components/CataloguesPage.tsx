import React from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';

const CataloguesPage: React.FC<{ setCurrentView: (view: View) => void }> = ({ setCurrentView }) => {
    const cataloguesUrl = viewToUrl({ page: 'catalogues' });

    const catalogues = [
        {
            title: 'Medifocal Product Catalogue 2024',
            description: 'Complete range of dental equipment, autoclaves, chairs, and imaging systems. Comprehensive product guide for Australian dental practices.',
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0e3c4b?w=400',
            downloadUrl: '/Medifocal Product Catalogue 2024.html',
            year: '2024',
            format: 'HTML/PDF'
        },
        {
            title: 'Infection Control Catalogue',
            description: 'Sterilization equipment, autoclaves, and infection control supplies.',
            image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400',
            downloadUrl: '#',
            year: '2024'
        },
        {
            title: 'Dental Imaging Catalogue',
            description: 'X-ray systems, intraoral scanners, and digital imaging solutions.',
            image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
            downloadUrl: '#',
            year: '2024'
        },
        {
            title: 'Dental Chairs & Units Catalogue',
            description: 'Complete range of dental chairs, units, and patient positioning systems.',
            image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400',
            downloadUrl: '#',
            year: '2024'
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title="Product Catalogues | Download PDF Catalogues | Medifocal"
                description="Download our latest product catalogues in PDF format. Browse dental equipment, supplies, and services from Medifocal."
                url={`https://medifocal.com${cataloguesUrl}`}
            />
            
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl p-8 mb-8 shadow-lg">
                    <h1 className="text-4xl font-extrabold mb-4">Product Catalogues</h1>
                    <p className="text-lg opacity-90">Download our latest product catalogues in PDF format. Browse our complete range of dental equipment and supplies.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catalogues.map((catalogue, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="relative h-48 bg-gray-200">
                                <img 
                                    src={catalogue.image} 
                                    alt={catalogue.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    {catalogue.year}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{catalogue.title}</h3>
                                <p className="text-gray-600 mb-4">{catalogue.description}</p>
                                <button
                                    onClick={() => window.open(catalogue.downloadUrl, '_blank')}
                                    className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Request a Printed Catalogue</h2>
                    <p className="text-gray-600 mb-6">Prefer a physical copy? Contact us to request a printed catalogue delivered to your practice.</p>
                    <button
                        onClick={() => setCurrentView({ page: 'contact' })}
                        className="bg-brand-blue text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-blue-700 transition-colors"
                    >
                        Contact Us
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CataloguesPage;

