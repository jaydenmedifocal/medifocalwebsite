import React, { useState } from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import EquipmentServiceRequestModal from './EquipmentServiceRequestModal';
import { viewToUrl } from '../utils/routing';

interface EquipmentServicesPageProps {
    setCurrentView: (view: View) => void;
}

// Enhanced Icons
const ChairIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15V7a2 2 0 012-2h10a2 2 0 012 2v8M5 15H4a2 2 0 00-2 2v2h18v-2a2 2 0 00-2-2h-1M5 15v-4h14v4M9 9h6" /></svg>;
const ImagingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ScannerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const OpgIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 12H5m14 0h-2m-1-5l-1.4-1.4M18.4 18.4L17 17" /></svg>;
const AutoclaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
const CompressorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3m6 0l-3-3m-3 18v-5h2V3H9v12h2v5m-3-12h2" /></svg>;
const SensorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const SuctionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /><path d="M13 13a3 3 0 100-6 3 3 0 000 6z" transform="rotate(45 13 13)" /><path d="M5 5C2.791 7.209 2.791 10.791 5 13" /></svg>;
const HandpieceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536l12.232-12.232z" /></svg>;
const StoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l-3 8h20l-3-8H5zM5 10V7h14v3M9 4h6v3H9z" /></svg>;
const AccessoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const serviceData = [
    { 
        name: 'Dental Chairs', 
        icon: <ChairIcon />,
        description: 'Professional service, repair, and maintenance for all major dental chair brands',
        slug: 'dental-chair-service',
        hasDedicatedPage: true,
        color: 'from-blue-500 to-blue-700'
    },
    { 
        name: 'Dental Autoclaves', 
        icon: <AutoclaveIcon />,
        description: 'Autoclave service, repair, validation, and compliance maintenance',
        slug: 'autoclave-service',
        hasDedicatedPage: true,
        color: 'from-green-500 to-green-700'
    },
    { 
        name: 'Dental Imaging', 
        icon: <ImagingIcon />,
        description: 'X-ray and imaging equipment service, repair, and calibration',
        slug: 'dental-imaging-service',
        hasDedicatedPage: false,
        color: 'from-purple-500 to-purple-700'
    },
    { 
        name: 'Dental Scanners', 
        icon: <ScannerIcon />,
        description: 'Intraoral scanner service, repair, and maintenance',
        slug: 'dental-scanner-service',
        hasDedicatedPage: false,
        color: 'from-indigo-500 to-indigo-700'
    },
    { 
        name: 'Dental OPG', 
        icon: <OpgIcon />,
        description: 'OPG equipment service, repair, and calibration',
        slug: 'dental-opg-service',
        hasDedicatedPage: false,
        color: 'from-teal-500 to-teal-700'
    },
    { 
        name: 'Dental Compressors', 
        icon: <CompressorIcon />,
        description: 'Dental compressor service, repair, and maintenance',
        slug: 'dental-compressor-service',
        hasDedicatedPage: false,
        color: 'from-orange-500 to-orange-700'
    },
    { 
        name: 'Dental Sensors', 
        icon: <SensorIcon />,
        description: 'Digital sensor service, repair, and calibration',
        slug: 'dental-sensor-service',
        hasDedicatedPage: false,
        color: 'from-pink-500 to-pink-700'
    },
    { 
        name: 'Dental Suction', 
        icon: <SuctionIcon />,
        description: 'Suction unit service, repair, and maintenance',
        slug: 'dental-suction-service',
        hasDedicatedPage: false,
        color: 'from-red-500 to-red-700'
    },
    { 
        name: 'Dental Handpieces', 
        icon: <HandpieceIcon />,
        description: 'Handpiece service, repair, and maintenance',
        slug: 'dental-handpiece-service',
        hasDedicatedPage: false,
        color: 'from-yellow-500 to-yellow-700'
    },
    { 
        name: 'Dental Stools', 
        icon: <StoolIcon />,
        description: 'Dental stool service, repair, and maintenance',
        slug: 'dental-stool-service',
        hasDedicatedPage: false,
        color: 'from-cyan-500 to-cyan-700'
    },
    { 
        name: 'Dental Accessories', 
        icon: <AccessoriesIcon />,
        description: 'Comprehensive service for all dental accessories and equipment',
        slug: 'dental-accessories-service',
        hasDedicatedPage: false,
        color: 'from-gray-500 to-gray-700'
    },
];

const EquipmentServicesPage: React.FC<EquipmentServicesPageProps> = ({ setCurrentView }) => {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedEquipmentType, setSelectedEquipmentType] = useState<string>('');

    const handleServiceClick = (service: typeof serviceData[0]) => {
        if (service.hasDedicatedPage) {
            if (service.slug === 'dental-chair-service') {
                setCurrentView({ page: 'dentalChairService' });
            } else if (service.slug === 'autoclave-service') {
                setCurrentView({ page: 'autoclaveService' });
            }
        } else {
            setSelectedEquipmentType(service.name);
            setShowRequestModal(true);
        }
    };

    const pageUrl = viewToUrl({ page: 'equipmentServices' });

    return (
        <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
            <SEOHead
                title="Dental Equipment Service & Repair | Expert Technicians | Medifocal"
                description="Professional dental equipment servicing, repair, and maintenance for all major brands. Certified technicians, fast response times, and comprehensive warranties. Serving Australian dental practices for 60+ years."
                keywords="dental equipment service, dental equipment repair, dental chair service, autoclave service, dental equipment maintenance, dental technician, equipment servicing Australia"
                url={`https://medifocal.com${pageUrl}`}
            />
            <Breadcrumbs
                items={[
                    { label: 'Home', view: { page: 'home' } },
                    { label: 'Equipment Services' }
                ]}
                setCurrentView={setCurrentView}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
                    <div className="relative">
                        <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            Expert Equipment Servicing
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
                            Professional Equipment Servicing & Repairs
                        </h1>
                        <p className="text-xl md:text-2xl mb-6 opacity-95 max-w-3xl">
                            Keep your practice running smoothly with our reliable and professional servicing for a wide range of dental equipment. Our certified technicians ensure your tools are in peak condition.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold">60+ Years Experience</span>
                            </div>
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold">Certified Technicians</span>
                            </div>
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold">Fast Response Times</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Our Service Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {serviceData.map((service) => (
                            <div
                                key={service.name}
                                onClick={() => handleServiceClick(service)}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200 group"
                            >
                                <div className={`bg-gradient-to-br ${service.color} p-6 text-white`}>
                                    <div className="flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        {service.icon}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-blue transition-colors">
                                        {service.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                        {service.description}
                                    </p>
                                    <div className="flex items-center text-brand-blue font-semibold group-hover:underline">
                                        {service.hasDedicatedPage ? (
                                            <>
                                                <span>Learn More</span>
                                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        ) : (
                                            <>
                                                <span>Request Service</span>
                                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-gray-200">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Why Choose Medifocal Equipment Services?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
                                title: 'Certified Technicians',
                                description: 'All our technicians are fully certified and trained on the latest equipment'
                            },
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
                                title: 'Fast Response',
                                description: 'Quick turnaround times to minimize practice downtime'
                            },
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
                                title: 'Comprehensive Warranty',
                                description: 'All repairs come with comprehensive warranty coverage'
                            },
                            {
                                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>,
                                title: '24/7 Support',
                                description: 'Round-the-clock support for urgent equipment issues'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-brand-blue transition-colors">
                                <div className="text-brand-blue mb-4 flex justify-center">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
                    <div className="relative text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Schedule a Service?</h2>
                        <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
                            Our team is ready to assist you with all your equipment maintenance and repair needs. Contact us today for fast, professional service.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => setCurrentView({ page: 'contact' })}
                                className="bg-white text-brand-blue px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Contact Our Service Team
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedEquipmentType('');
                                    setShowRequestModal(true);
                                }}
                                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white/20 transition-all font-semibold text-lg"
                            >
                                Request Service Online
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <EquipmentServiceRequestModal
                isOpen={showRequestModal}
                onClose={() => {
                    setShowRequestModal(false);
                    setSelectedEquipmentType('');
                }}
                equipmentType={selectedEquipmentType}
                onSuccess={() => {
                    setShowRequestModal(false);
                    setSelectedEquipmentType('');
                }}
            />
        </div>
    );
};

export default EquipmentServicesPage;
