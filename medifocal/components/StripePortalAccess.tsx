import React, { useEffect } from 'react';
import { View } from '../App';

interface StripePortalAccessProps {
    setCurrentView: (view: View) => void;
}

const StripePortalAccess: React.FC<StripePortalAccessProps> = ({ setCurrentView }) => {
    // Stripe Customer Portal login URL - Stripe handles authentication
    const STRIPE_PORTAL_LOGIN_URL = 'https://billing.stripe.com/p/login/6oU3cx8jRezt6d05r708g00';

    useEffect(() => {
        // Redirect immediately to Stripe Customer Portal login
        window.location.href = STRIPE_PORTAL_LOGIN_URL;
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full text-center">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-blue/10 rounded-full mb-4">
                        <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to Your Account</h2>
                    <p className="text-gray-600 mb-6">You'll be taken to Stripe Customer Portal to sign in</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
                </div>
            </div>
        </div>
    );
};

export default StripePortalAccess;

