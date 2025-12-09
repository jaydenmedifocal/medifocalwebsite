import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import TopNav from './components/TopNav';
import HomePage from './components/HomePage';
import FooterInfo from './components/FooterInfo';
import { useAuth } from './contexts/AuthContext';
import { handleGoogleRedirect } from './services/auth';
import { trackPageView, setAnalyticsUserId, setAnalyticsUserProperties } from './services/analytics';
import { urlToView, viewToUrl, navigateToView } from './utils/routing';

// Lazy load non-critical components for better performance
const CartPage = lazy(() => import('./components/CartPage'));
const AccountPage = lazy(() => import('./components/AccountPage'));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage'));
const ClearancePage = lazy(() => import('./components/ClearancePage'));
const CategoryLandingPage = lazy(() => import('./components/CategoryLandingPage'));
const ProductListPage = lazy(() => import('./components/ProductListPage'));
const OffersPage = lazy(() => import('./components/OffersPage'));
const EverydayEssentialsPage = lazy(() => import('./components/EverydayEssentialsPage'));
const NewProductsPage = lazy(() => import('./components/NewProductsPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const ShippingPolicyPage = lazy(() => import('./components/ShippingPolicyPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./components/TermsOfServicePage'));
const ReturnPolicyPage = lazy(() => import('./components/ReturnPolicyPage'));
const EquipmentServicesPage = lazy(() => import('./components/EquipmentServicesPage'));
const DentalChairServicePage = lazy(() => import('./components/DentalChairServicePage'));
const AutoclaveServicePage = lazy(() => import('./components/AutoclaveServicePage'));
const DentalEducationHubPage = lazy(() => import('./components/DentalEducationHubPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
const BlogPage = lazy(() => import('./components/BlogPage'));
const BlogPostPage = lazy(() => import('./components/BlogPostPage'));
const AliExpressOAuthCallback = lazy(() => import('./components/AliExpressOAuthCallback'));
const AdminPage = lazy(() => import('./components/AdminPage'));
const StripePortalAccess = lazy(() => import('./components/StripePortalAccess'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const SustainabilityPage = lazy(() => import('./components/SustainabilityPage'));
const OurTeamPage = lazy(() => import('./components/OurTeamPage'));
const PartnersPage = lazy(() => import('./components/PartnersPage'));
const AllPromotionProductsPage = lazy(() => import('./components/AllPromotionProductsPage'));
const SupplierSpecialsPage = lazy(() => import('./components/SupplierSpecialsPage'));
const BundlesPage = lazy(() => import('./components/BundlesPage'));
const CataloguesPage = lazy(() => import('./components/CataloguesPage'));
const PromotionsPage = lazy(() => import('./components/PromotionsPage'));
const DentalChairsPage = lazy(() => import('./components/DentalChairsPage'));
const BrandPage = lazy(() => import('./components/BrandPage'));
const BrandsPage = lazy(() => import('./components/BrandsPage'));
const BuyingGuidesPage = lazy(() => import('./components/BuyingGuidesPage'));
const BuyingGuidePage = lazy(() => import('./components/BuyingGuidePage'));
const FAQPage = lazy(() => import('./components/FAQPage'));

// Loading component
const PageLoader = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="text-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error boundary for lazy-loaded components
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null; retryCount: number }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy load error:', error, errorInfo);
    
    // Check if it's a chunk loading error (including QUIC protocol errors)
    const isChunkError = error.message.includes('Failed to fetch') || 
                        error.message.includes('Loading chunk') ||
                        error.message.includes('Unexpected token') ||
                        error.message.includes('ChunkLoadError') ||
                        error.message.includes('QUIC') ||
                        error.message.includes('ERR_QUIC') ||
                        error.message.includes('dynamically imported module');
    
    if (isChunkError && this.state.retryCount < 5) {
      // Silently retry loading the chunk in the background
      const retryDelay = 1000 * (this.state.retryCount + 1);
      setTimeout(() => {
        this.setState(prev => ({ retryCount: prev.retryCount + 1 }));
        // Try to reload the chunk without full page reload
        if (this.state.retryCount < 4) {
          // Reset error state to retry
          this.setState({ hasError: false, error: null });
        } else {
          // Last attempt - silent reload
          window.location.reload();
        }
      }, retryDelay);
    } else if (!isChunkError) {
      // For non-chunk errors, reset after a delay to retry
      setTimeout(() => {
        this.setState({ hasError: false, error: null, retryCount: 0 });
      }, 2000);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show loading state instead of error to user - silent error handling
      return this.props.fallback || (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading page...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper component that wraps Suspense with error boundary
const SafeSuspense: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <LazyLoadErrorBoundary fallback={fallback}>
    <Suspense fallback={fallback || <PageLoader />}>
      {children}
    </Suspense>
  </LazyLoadErrorBoundary>
);


export interface View {
  page: 'home' | 'cart' | 'account' | 'login' | 'register' | 'checkout' | 'search' | 'clearance' | 'categoryLanding' | 'productList' | 'offers' | 'everydayEssentials' | 'newProducts' | 'about' | 'contact' | 'catalogues' | 'promotions' | 'allPromotionProducts' | 'supplierSpecials' | 'bundles' | 'shippingPolicy' | 'privacyPolicy' | 'termsOfService' | 'returnPolicy' | 'equipmentServices' | 'dentalChairService' | 'autoclaveService' | 'dentalEducationHub' | 'productDetail' | 'blog' | 'blogPost' | 'aliexpressOAuthCallback' | 'admin' | 'sustainability' | 'ourTeam' | 'partners' | 'dentalChairs' | 'brand' | 'brands' | 'buyingGuides' | 'buyingGuide' | 'faq';
  section?: string;
  returnTo?: 'account' | 'cart' | 'checkout' | 'home';
  [key: string]: any;
}

const App: React.FC = () => {
  // Initialize view from URL
  const getInitialView = useCallback(() => {
    return urlToView(window.location.pathname, new URLSearchParams(window.location.search));
  }, []);
  
  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced setCurrentView that updates URL
  const setCurrentViewWithUrl = useCallback((view: View) => {
    setCurrentView(view);
    navigateToView(view, false);
  }, []);

  // Sync URL with currentView state
  useEffect(() => {
    const url = viewToUrl(currentView);
    const currentUrl = window.location.pathname + (window.location.search || '');
    const expectedUrl = url.replace(window.location.origin, '');
    if (currentUrl !== expectedUrl && !window.location.search.includes('success') && !window.location.search.includes('canceled')) {
      window.history.replaceState({}, '', url);
    }
  }, [currentView]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // When user clicks back button, reset to URL state
      const newView = urlToView(window.location.pathname, new URLSearchParams(window.location.search));
      setCurrentView(newView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen for URL changes (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const newView = urlToView(window.location.pathname, new URLSearchParams(window.location.search));
      setCurrentView(newView);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle checkout success/cancel redirects - matching Stripe example pattern
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    
    if (query.get('success')) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show success message (matching Stripe example)
      alert('Order placed! You will receive an email confirmation.');
      setCurrentViewWithUrl({ page: 'home' });
    } else if (query.get('canceled')) {
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show cancel message (matching Stripe example)
      alert('Order canceled -- continue to shop around and checkout when you\'re ready.');
    }
  }, [setCurrentViewWithUrl]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentViewWithUrl({ page: 'search', query });
    // Scroll to top when searching
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Track search
    import('./services/analytics').then(({ trackSearch }) => {
      trackSearch(query);
    });
  };

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView.page]);

  const { user, isFieldServiceUser, loading: authLoading } = useAuth();

  // Track page views
  useEffect(() => {
    if (!authLoading) {
      const pageName = currentView.page || 'home';
      const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      trackPageView(pageName, pageTitle);
    }
  }, [currentView.page, authLoading]);

  // Set user ID and properties when user logs in
  useEffect(() => {
    if (user) {
      setAnalyticsUserId(user.uid);
      setAnalyticsUserProperties({
        email: user.email || '',
        isFieldServiceUser: isFieldServiceUser ? 'true' : 'false',
      });
    } else {
      setAnalyticsUserId(null);
    }
  }, [user, isFieldServiceUser]);

  // Intercept account page navigation and redirect immediately
  useEffect(() => {
    if (currentView.page === 'account' && !authLoading && user) {
      // Check if user has any admin/technician role - prioritize admin dashboard
      const userRole = user?.role || '';
      const hasAdminRole = isFieldServiceUser || 
        ['admin', 'technician', 'manager', 'supervisor', 'super_admin'].includes(userRole);
      
      if (hasAdminRole) {
        // Admin/technician/manager users always go to admin dashboard, never Stripe
        setCurrentViewWithUrl({ page: 'admin', section: 'dashboard' });
      } else {
        // Normal customers - AccountPage will handle Stripe portal redirect
        // This is handled in AccountPage component
      }
    }
  }, [currentView.page, user, isFieldServiceUser, authLoading, setCurrentViewWithUrl]);

  const renderPage = () => {
    // Prevent account page from rendering - redirect immediately
    if (currentView.page === 'account') {
      // If field service user, redirect to admin immediately
      if (!authLoading && user && isFieldServiceUser) {
        // Redirect synchronously - don't render AccountPage at all
        setCurrentViewWithUrl({ page: 'admin', section: 'dashboard' });
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Redirecting to Field Service Dashboard...</p>
            </div>
          </div>
        );
      }
      // For normal customers or not logged in, AccountPage will handle redirect
      return (
        <SafeSuspense>
          <AccountPage setCurrentView={setCurrentViewWithUrl} />
        </SafeSuspense>
      );
    }

    switch (currentView.page) {
      case 'cart':
        return (
          <SafeSuspense>
            <CartPage setCurrentView={setCurrentView} />
          </SafeSuspense>
        );
      case 'account':
        return (
          <SafeSuspense>
            <StripePortalAccess setCurrentView={setCurrentView} />
          </SafeSuspense>
        );
      case 'checkout':
        return (
          <SafeSuspense>
            <CheckoutPage setCurrentView={setCurrentView} />
          </SafeSuspense>
        );
      case 'search':
        return (
          <SafeSuspense>
            <SearchResultsPage query={currentView.query} setCurrentView={setCurrentView} />
          </SafeSuspense>
        );
      case 'clearance':
        return (
          <SafeSuspense>
            <ClearancePage setCurrentView={setCurrentView} />
          </SafeSuspense>
        );
      case 'dentalChairs':
        return (
          <SafeSuspense>
            <DentalChairsPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'brand':
        return (
          <SafeSuspense>
            <BrandPage brandName={currentView.brandName} setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'brands':
        return (
          <SafeSuspense>
            <BrandsPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'buyingGuides':
        return (
          <SafeSuspense>
            <BuyingGuidesPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'buyingGuide':
        return (
          <SafeSuspense>
            <BuyingGuidePage guideSlug={currentView.guideSlug} setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'faq':
        return (
          <SafeSuspense>
            <FAQPage category={currentView.category} setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'categoryLanding':
        return (
          <SafeSuspense>
            <CategoryLandingPage categoryName={currentView.categoryName} setCurrentView={setCurrentView} />
          </SafeSuspense>
        );
      case 'productList':
        return (
          <SafeSuspense>
            <ProductListPage categoryName={currentView.categoryName} parentCategory={currentView.parentCategory} setCurrentView={setCurrentView} />
          </SafeSuspense>
        );
       case 'productDetail':
        return (
          <SafeSuspense>
            <ProductDetailPage itemNumber={currentView.itemNumber} setCurrentView={setCurrentView} />
          </SafeSuspense>
        );
      case 'offers':
        return (
          <SafeSuspense>
            <OffersPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'everydayEssentials':
        return (
          <SafeSuspense>
            <EverydayEssentialsPage setCurrentView={setCurrentViewWithUrl} category={currentView.category} />
          </SafeSuspense>
        );
      case 'newProducts':
        return (
          <SafeSuspense>
            <NewProductsPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'about':
        return (
          <SafeSuspense>
            <AboutPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'contact':
        return (
          <SafeSuspense>
            <ContactPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'catalogues':
        return (
          <SafeSuspense>
            <CataloguesPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'promotions':
        return (
          <SafeSuspense>
            <PromotionsPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'allPromotionProducts':
        return (
          <SafeSuspense>
            <AllPromotionProductsPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'supplierSpecials':
        return (
          <SafeSuspense>
            <SupplierSpecialsPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'bundles':
        return (
          <SafeSuspense>
            <BundlesPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'shippingPolicy':
        return (
          <SafeSuspense>
            <ShippingPolicyPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'privacyPolicy':
        return (
          <SafeSuspense>
            <PrivacyPolicyPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'termsOfService':
        return (
          <SafeSuspense>
            <TermsOfServicePage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'returnPolicy':
        return (
          <SafeSuspense>
            <ReturnPolicyPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'equipmentServices':
        return (
          <SafeSuspense>
            <EquipmentServicesPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'dentalChairService':
        return (
          <SafeSuspense>
            <DentalChairServicePage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'autoclaveService':
        return (
          <SafeSuspense>
            <AutoclaveServicePage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'dentalEducationHub':
        return (
          <SafeSuspense>
            <DentalEducationHubPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'blog':
        return (
          <SafeSuspense>
            <BlogPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'blogPost':
        return (
          <SafeSuspense>
            <BlogPostPage setCurrentView={setCurrentViewWithUrl} postId={currentView.postId || currentView.id} />
          </SafeSuspense>
        );
      case 'aliexpressOAuthCallback':
        return (
          <SafeSuspense>
            <AliExpressOAuthCallback />
          </SafeSuspense>
        );
      case 'admin':
        return (
          <SafeSuspense>
            <AdminPage setCurrentView={setCurrentViewWithUrl} section={currentView.section} />
          </SafeSuspense>
        );
      case 'sustainability':
        return (
          <SafeSuspense>
            <SustainabilityPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'ourTeam':
        return (
          <SafeSuspense>
            <OurTeamPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'partners':
        return (
          <SafeSuspense>
            <PartnersPage setCurrentView={setCurrentViewWithUrl} />
          </SafeSuspense>
        );
      case 'home':
      default:
        return <HomePage setCurrentView={setCurrentViewWithUrl} handleSearch={handleSearch} />;
    }
  };

  const isAdminMode = currentView.page === 'admin';

  // Ensure proper layout when coming back from admin
  useEffect(() => {
    if (currentView.page !== 'admin' && window.location.pathname !== '/admin' && !window.location.pathname.startsWith('/admin/')) {
      // Reset any admin-specific styles or state
      document.body.className = document.body.className.replace(/admin-mode|field-service/g, '').trim();
      // Remove any admin-specific classes from html element
      document.documentElement.className = document.documentElement.className.replace(/admin-mode|field-service/g, '').trim();
    }
  }, [currentView.page]);

  return (
    <div className="bg-white font-sans">
      {!isAdminMode && <TopNav setCurrentView={setCurrentViewWithUrl} handleSearch={handleSearch} />}
      <main className={isAdminMode ? "min-h-screen relative z-0" : "min-h-screen relative z-0"}>
        {renderPage()}
      </main>
      {!isAdminMode && <FooterInfo setCurrentView={setCurrentViewWithUrl} />}
    </div>
  );
};

export default App;
