import React from 'react';

const TrustSignals: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-brand-blue-50 via-blue-50 to-brand-blue-50 border-t border-b border-brand-blue-200 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* 60+ Years Experience */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">60+</div>
            <div className="text-sm md:text-base font-semibold text-gray-700">Years Experience</div>
          </div>

          {/* Free Delivery */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Free</div>
            <div className="text-sm md:text-base font-semibold text-gray-700">Delivery Store Wide</div>
          </div>

          {/* Australian Standards */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">TGA</div>
            <div className="text-sm md:text-base font-semibold text-gray-700">Compliant</div>
          </div>

          {/* Expert Support */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Expert</div>
            <div className="text-sm md:text-base font-semibold text-gray-700">Support Team</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;

