import React, { useEffect } from 'react';
import { View } from '../App';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';
import { createPortalSession } from '../services/paymentMethods';

interface AccountPageProps {
  setCurrentView?: (view: View) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ setCurrentView }) => {
    const { user, isFieldServiceUser, loading } = useAuth();

    // Redirect field service users to admin dashboard
    useEffect(() => {
        if (loading || !user) return;
        
        if (isFieldServiceUser && setCurrentView) {
            setCurrentView({ page: 'admin', section: 'dashboard' });
            window.history.replaceState({}, '', '/admin');
        }
    }, [loading, user, isFieldServiceUser, setCurrentView]);

    // Auto-redirect regular customers to Stripe portal
    // BUT only if they are NOT admin, technician, manager, supervisor, or super_admin
    useEffect(() => {
        if (loading || !user || isFieldServiceUser) return;
        
        // Double check role - if user has any admin/technician role, don't redirect to Stripe
        const userRole = user?.role || '';
        const hasAdminRole = ['admin', 'technician', 'manager', 'supervisor', 'super_admin'].includes(userRole);
        
        if (hasAdminRole && setCurrentView) {
            // User has admin role but wasn't caught by isFieldServiceUser - redirect to admin
            setCurrentView({ page: 'admin', section: 'dashboard' });
            window.history.replaceState({}, '', '/admin');
            return;
        }
        
        const redirectToPortal = async () => {
            try {
                const portalUrl = await createPortalSession();
                if (portalUrl) {
                    window.location.href = portalUrl;
                }
            } catch (error) {
                console.error('Error redirecting to Stripe portal:', error);
            }
        };
        
        redirectToPortal();
    }, [loading, user, isFieldServiceUser, setCurrentView]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Not logged in - redirect to login page (FirebaseUIAuth)
    if (!user) {
        useEffect(() => {
            if (setCurrentView) {
                setCurrentView({ page: 'login' });
            }
        }, [setCurrentView]);
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

    // Field service users - show redirecting message (redirect happens in useEffect)
    if (isFieldServiceUser) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Redirecting to Field Service Dashboard...</p>
                </div>
            </div>
        );
    }

    // Regular customers - redirecting to Stripe portal
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to your account...</p>
            </div>
        </div>
    );
};

export default AccountPage;
