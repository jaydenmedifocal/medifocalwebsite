/**
 * Routing utilities for URL-based navigation
 * Converts between View objects and URLs
 */

import { View } from '../App';

/**
 * Convert a View object to a URL path
 */
export const viewToUrl = (view: View): string => {
  const { page, ...params } = view;
  
  switch (page) {
    case 'home':
      return '/';
    case 'cart':
      return '/cart';
    case 'account':
      return '/account';
    case 'search':
      return `/search?q=${encodeURIComponent(params.query || '')}`;
    case 'clearance':
      return '/clearance';
    case 'dentalChairs':
      return '/dental-chairs';
    case 'categoryLanding':
      const categoryName = params.categoryName || '';
      return `/category/${encodeURIComponent(categoryName.toLowerCase().replace(/\s+/g, '-'))}`;
    case 'productList':
      const catName = params.categoryName || '';
      const parentCat = params.parentCategory || '';
      if (parentCat) {
        return `/category/${encodeURIComponent(parentCat.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(catName.toLowerCase().replace(/\s+/g, '-'))}`;
      }
      return `/category/${encodeURIComponent(catName.toLowerCase().replace(/\s+/g, '-'))}`;
    case 'productDetail':
      return `/product/${encodeURIComponent(params.itemNumber || '')}`;
    case 'offers':
      return '/offers';
    case 'everydayEssentials':
      return '/everyday-essentials';
    case 'newProducts':
      return '/new-products';
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    case 'catalogues':
      return '/catalogues';
    case 'promotions':
      return '/promotions';
    case 'allPromotionProducts':
      return '/promotions/all';
    case 'supplierSpecials':
      return '/supplier-specials';
    case 'bundles':
      return '/bundles';
    case 'shippingPolicy':
      return '/shipping-policy';
    case 'privacyPolicy':
      return '/privacy-policy';
    case 'termsOfService':
      return '/terms-of-service';
    case 'returnPolicy':
      return '/return-policy';
    case 'equipmentServices':
      return '/equipment-services';
    case 'dentalChairService':
      return '/equipment-services/dental-chair-service';
    case 'autoclaveService':
      return '/equipment-services/autoclave-service';
    case 'dentalEducationHub':
      return '/dental-education-hub';
    case 'blog':
      return '/blog';
    case 'blogPost':
      const postId = params.postId || params.id || '';
      return `/blog/${encodeURIComponent(postId)}`;
    case 'admin':
      return `/admin${params.section ? `/${params.section}` : ''}`;
    case 'sustainability':
      return '/sustainability';
    case 'ourTeam':
      return '/our-team';
    case 'partners':
      return '/partners';
    case 'aliexpressOAuthCallback':
      return '/aliexpress/oauth/callback';
    case 'brand':
      const brandName = params.brandName || '';
      return `/brands/${encodeURIComponent(brandName.toLowerCase().replace(/\s+/g, '-'))}`;
    case 'brands':
      return '/brands';
    case 'buyingGuides':
      return '/buying-guides';
    case 'buyingGuide':
      const guideSlug = params.guideSlug || '';
      return `/buying-guides/${encodeURIComponent(guideSlug)}`;
    case 'faq':
      const faqCategory = params.category || 'general';
      return `/faq${faqCategory !== 'general' ? `/${encodeURIComponent(faqCategory)}` : ''}`;
    default:
      return '/';
  }
};

/**
 * Convert a URL path to a View object
 */
export const urlToView = (pathname: string, searchParams?: URLSearchParams): View => {
  const path = pathname.toLowerCase();
  const params = searchParams || new URLSearchParams(window.location.search);
  
  // Home
  if (path === '/' || path === '') {
    return { page: 'home' };
  }
  
  // Cart
  if (path === '/cart') {
    return { page: 'cart' };
  }
  
  // Account
  if (path === '/account') {
    return { page: 'account' };
  }
  
  // Search
  if (path === '/search') {
    const query = params.get('q') || '';
    return { page: 'search', query };
  }
  
  // Clearance
  if (path === '/clearance') {
    return { page: 'clearance' };
  }
  
  // Dental Chairs
  if (path === '/dental-chairs') {
    return { page: 'dentalChairs' };
  }
  
  // Product detail: /product/:itemNumber
  const productMatch = path.match(/^\/product\/(.+)$/);
  if (productMatch) {
    return { page: 'productDetail', itemNumber: decodeURIComponent(productMatch[1]) };
  }
  
  // Category landing: /category/:categoryName
  // Product list: /category/:parentCategory/:categoryName
  const categoryMatch = path.match(/^\/category\/([^/]+)(?:\/(.+))?$/);
  if (categoryMatch) {
    // Decode and convert hyphens to spaces, then capitalize properly
    const decodeCategoryName = (str: string): string => {
      const decoded = decodeURIComponent(str);
      // Replace hyphens with spaces
      const withSpaces = decoded.replace(/-/g, ' ');
      // Capitalize first letter of each word
      return withSpaces.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };
    
    const parentCategory = decodeCategoryName(categoryMatch[1]);
    const categoryName = categoryMatch[2] ? decodeCategoryName(categoryMatch[2]) : null;
    
    if (categoryName) {
      return { page: 'productList', categoryName, parentCategory };
    } else {
      return { page: 'categoryLanding', categoryName: parentCategory };
    }
  }
  
  // Static pages
  if (path === '/offers') return { page: 'offers' };
  if (path === '/everyday-essentials') return { page: 'everydayEssentials' };
  if (path === '/new-products') return { page: 'newProducts' };
  if (path === '/about') return { page: 'about' };
  if (path === '/contact') return { page: 'contact' };
  if (path === '/catalogues') return { page: 'catalogues' };
  if (path === '/promotions') return { page: 'promotions' };
  if (path === '/promotions/all') return { page: 'allPromotionProducts' };
  if (path === '/supplier-specials') return { page: 'supplierSpecials' };
  if (path === '/bundles') return { page: 'bundles' };
  if (path === '/shipping-policy') return { page: 'shippingPolicy' };
  if (path === '/privacy-policy') return { page: 'privacyPolicy' };
  if (path === '/terms-of-service') return { page: 'termsOfService' };
  if (path === '/return-policy') return { page: 'returnPolicy' };
  if (path === '/equipment-services') return { page: 'equipmentServices' };
  if (path === '/equipment-services/dental-chair-service') return { page: 'dentalChairService' };
  if (path === '/equipment-services/autoclave-service') return { page: 'autoclaveService' };
  if (path === '/dental-education-hub') return { page: 'dentalEducationHub' };
  if (path === '/blog') return { page: 'blog' };
  // Blog post: /blog/:postId
  const blogPostMatch = path.match(/^\/blog\/(.+)$/);
  if (blogPostMatch) {
    const postId = decodeURIComponent(blogPostMatch[1]);
    return { page: 'blogPost', postId: parseInt(postId) || postId };
  }
  if (path === '/sustainability') return { page: 'sustainability' };
  if (path === '/our-team') return { page: 'ourTeam' };
  if (path === '/partners') return { page: 'partners' };
  
  // Brands
  if (path === '/brands') return { page: 'brands' };
  const brandMatch = path.match(/^\/brands\/(.+)$/);
  if (brandMatch) {
    const brandName = decodeURIComponent(brandMatch[1]).replace(/-/g, ' ');
    // Capitalize first letter of each word
    const formattedBrandName = brandName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    return { page: 'brand', brandName: formattedBrandName };
  }
  
  // Buying Guides
  if (path === '/buying-guides') return { page: 'buyingGuides' };
  const buyingGuideMatch = path.match(/^\/buying-guides\/(.+)$/);
  if (buyingGuideMatch) {
    return { page: 'buyingGuide', guideSlug: decodeURIComponent(buyingGuideMatch[1]) };
  }
  
  // FAQ
  if (path === '/faq') return { page: 'faq', category: 'general' };
  const faqMatch = path.match(/^\/faq\/(.+)$/);
  if (faqMatch) {
    return { page: 'faq', category: decodeURIComponent(faqMatch[1]) };
  }
  
  // Admin
  if (path.startsWith('/admin')) {
    const section = path.replace('/admin', '').replace(/^\//, '') || undefined;
    return { page: 'admin', section };
  }
  
  // AliExpress OAuth Callback - preserve query parameters
  if (path === '/aliexpress/oauth/callback' || path.startsWith('/aliexpress/oauth/callback')) {
    return { page: 'aliexpressOAuthCallback' };
  }
  
  // Default to home
  return { page: 'home' };
};

/**
 * Navigate to a view using URL
 */
export const navigateToView = (view: View, replace: boolean = false) => {
  const url = viewToUrl(view);
  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
  // Dispatch popstate event to trigger re-render
  window.dispatchEvent(new PopStateEvent('popstate'));
};

