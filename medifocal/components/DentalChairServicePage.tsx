import React, { useState } from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import EquipmentServiceRequestModal from './EquipmentServiceRequestModal';
import { viewToUrl } from '../utils/routing';

interface DentalChairServicePageProps {
    setCurrentView: (view: View) => void;
}

const DentalChairServicePage: React.FC<DentalChairServicePageProps> = ({ setCurrentView }) => {
    const [showRequestModal, setShowRequestModal] = useState(false);

    const pageUrl = viewToUrl({ page: 'dentalChairService' });

    const services = [
        {
            title: 'Routine Maintenance',
            description: 'Regular servicing to keep your dental chairs operating at peak performance',
            features: [
                'Lubrication of moving parts',
                'Cleaning and inspection',
                'Functionality testing',
                'Preventive maintenance checks'
            ]
        },
        {
            title: 'Repairs & Troubleshooting',
            description: 'Expert diagnosis and repair of all dental chair issues',
            features: [
                'Electrical system repairs',
                'Hydraulic system servicing',
                'Control panel diagnostics',
                'Mechanical component replacement'
            ]
        },
        {
            title: 'Parts Replacement',
            description: 'Genuine parts replacement for all major dental chair brands',
            features: [
                'Original manufacturer parts',
                'Fast parts availability',
                'Quality guaranteed replacements',
                'All major brands supported'
            ]
        },
        {
            title: 'Installation & Setup',
            description: 'Professional installation and configuration of new dental chairs',
            features: [
                'Site assessment',
                'Professional installation',
                'System configuration',
                'Staff training included'
            ]
        }
    ];

    const brands = [
        'A-dec', 'Pelton & Crane', 'Sirona', 'KaVo', 'Planmeca', 'Dentsply Sirona',
        'Midmark', 'Belmont', 'Takara Belmont', 'Shinhung', 'Fimet', 'Anthos'
    ];

    return (
        <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
            <SEOHead
                title="Dental Chair Service & Repair | Expert Technicians | Medifocal"
                description="Professional dental chair servicing, repair, and maintenance for all major brands. Certified technicians, fast response times, and comprehensive warranties. Serving Australian dental practices for 60+ years."
                keywords="dental chair service, dental chair repair, dental chair maintenance, dental chair servicing, dental chair technician, dental chair parts, dental chair installation"
                url={`https://medifocal.com${pageUrl}`}
            />
            <Breadcrumbs
                items={[
                    { label: 'Home', view: { page: 'home' } },
                    { label: 'Equipment Services', view: { page: 'equipmentServices' } },
                    { label: 'Dental Chair Service' }
                ]}
                setCurrentView={setCurrentView}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
                    <div className="relative">
                        <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            Dental Chair Services
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
                            Professional Dental Chair Service & Repair
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-3xl">
                            Expert servicing, repair, and maintenance for all major dental chair brands. Our certified technicians ensure your dental chairs operate at peak performance, minimizing downtime and maximizing patient comfort.
                        </p>
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Request Service Now
                        </button>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Our Dental Chair Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-2xl transition-all"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4">
                                        {index + 1}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                                </div>
                                <p className="text-gray-600 mb-6">{service.description}</p>
                                <ul className="space-y-3">
                                    {service.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start">
                                            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Brands Supported */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-gray-200">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Brands We Service</h2>
                    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                        We service and repair dental chairs from all major manufacturers. Our technicians are trained on the latest models and have access to genuine parts for all brands.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {brands.map((brand, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                            >
                                <span className="text-gray-700 font-semibold">{brand}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-gray-600 mt-6 text-sm">
                        Don't see your brand? Contact us - we service most dental chair manufacturers.
                    </p>
                </div>

                {/* Why Choose Us */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-blue-100">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Why Choose Medifocal for Dental Chair Service?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
                                title: 'Certified Technicians',
                                description: 'All technicians are factory-trained and certified on major dental chair brands'
                            },
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
                                title: 'Fast Response',
                                description: 'Same-day or next-day service available for urgent repairs'
                            },
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
                                title: 'Genuine Parts',
                                description: 'We use only genuine manufacturer parts for all repairs'
                            },
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>,
                                title: 'Service Contracts',
                                description: 'Preventive maintenance contracts available to keep your chairs running smoothly'
                            },
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
                                title: 'Comprehensive Warranty',
                                description: 'All repairs backed by comprehensive warranty coverage'
                            },
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>,
                                title: '24/7 Emergency Support',
                                description: 'Round-the-clock support for urgent dental chair issues'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all">
                                <div className="text-blue-600 mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
                    <div className="relative text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Schedule Your Dental Chair Service?</h2>
                        <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
                            Contact our expert team today for fast, professional dental chair servicing. We're here to keep your practice running smoothly.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => setShowRequestModal(true)}
                                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Request Service Now
                            </button>
                            <button
                                onClick={() => setCurrentView({ page: 'contact' })}
                                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white/20 transition-all font-semibold text-lg"
                            >
                                Contact Our Team
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EquipmentServiceRequestModal
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                equipmentType="Dental Chairs"
                onSuccess={() => setShowRequestModal(false)}
            />
        </div>
    );
};

export default DentalChairServicePage;

