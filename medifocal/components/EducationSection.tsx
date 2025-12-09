
import React from 'react';
import { View } from '../App';

interface EducationSectionProps {
    setCurrentView?: (view: View) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ setCurrentView }) => {
  return (
    <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Education & Events</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Stay ahead with our expert-led webinars and hands-on courses.</p>
            </div>
            <div className="flex flex-col lg:flex-row items-center bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <div className="w-full lg:w-1/2 h-64 lg:h-auto overflow-hidden">
                   <img 
                        src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=1200&auto=format&fit=crop" 
                        alt="Dental education webinar on surgical guide printing" 
                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
                        loading="lazy" 
                        width="600" 
                        height="400" 
                        decoding="async"
                    />
                </div>
                <div className="w-full lg:w-1/2 p-8 md:p-12">
                  <p className="text-brand-blue font-bold text-sm uppercase tracking-wide mb-2">Featured Webinar</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Print Surgical Guides In-house with DTX</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    An introductory webinar on leveraging CBCT imaging, AI-assisted design, and 3D printing to produce precise surgical guides for implant dentistry. Perfect for those new to digital workflows.
                  </p>
                  <button 
                    onClick={() => setCurrentView && setCurrentView({ page: 'dentalEducationHub' })}
                    className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Learn More
                  </button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default EducationSection;
