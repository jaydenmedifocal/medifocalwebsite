import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../firebase/config';

/**
 * Firebase Analytics Service
 * Provides easy-to-use functions for tracking user events and behavior
 */

/**
 * Log a custom event
 */
export const trackEvent = (
  eventName: string,
  eventParams?: {
    [key: string]: any;
  }
): void => {
  if (!analytics) {
    console.warn('Analytics not initialized');
    return;
  }

  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

/**
 * Track page views
 */
export const trackPageView = (pageName: string, pageTitle?: string): void => {
  trackEvent('page_view', {
    page_title: pageTitle || pageName,
    page_location: window.location.href,
    page_path: window.location.pathname,
  });
};

/**
 * Track user sign up
 */
export const trackSignUp = (method: string): void => {
  trackEvent('sign_up', {
    method: method, // 'email', 'google', 'phone', etc.
  });
};

/**
 * Track user login
 */
export const trackLogin = (method: string): void => {
  trackEvent('login', {
    method: method,
  });
};

/**
 * Track product views
 */
export const trackViewItem = (productId: string, productName: string, category?: string, price?: number): void => {
  trackEvent('view_item', {
    currency: 'AUD',
    value: price,
    items: [{
      item_id: productId,
      item_name: productName,
      item_category: category,
      price: price,
      quantity: 1,
    }],
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number = 1, category?: string): void => {
  trackEvent('add_to_cart', {
    currency: 'AUD',
    value: price * quantity,
    items: [{
      item_id: productId,
      item_name: productName,
      item_category: category,
      price: price,
      quantity: quantity,
    }],
  });
};

/**
 * Track remove from cart
 */
export const trackRemoveFromCart = (productId: string, productName: string, price: number, quantity: number = 1): void => {
  trackEvent('remove_from_cart', {
    currency: 'AUD',
    value: price * quantity,
    items: [{
      item_id: productId,
      item_name: productName,
      price: price,
      quantity: quantity,
    }],
  });
};

/**
 * Track begin checkout
 */
export const trackBeginCheckout = (value: number, items: Array<{ id: string; name: string; price: number; quantity: number }>): void => {
  trackEvent('begin_checkout', {
    currency: 'AUD',
    value: value,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Track purchase
 */
export const trackPurchase = (
  transactionId: string,
  value: number,
  items: Array<{ id: string; name: string; price: number; quantity: number; category?: string }>,
  shipping?: number,
  tax?: number
): void => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'AUD',
    shipping: shipping,
    tax: tax,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string, resultsCount?: number): void => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

/**
 * Track service request
 */
export const trackServiceRequest = (equipmentType: string, priority: string): void => {
  trackEvent('service_request', {
    equipment_type: equipmentType,
    priority: priority,
  });
};

/**
 * Track subscription events
 */
export const trackSubscription = (action: 'subscribe' | 'cancel' | 'reactivate', subscriptionId: string, value?: number): void => {
  trackEvent(`subscription_${action}`, {
    subscription_id: subscriptionId,
    value: value,
    currency: 'AUD',
  });
};

/**
 * Track payment method events
 */
export const trackPaymentMethod = (action: 'add' | 'remove' | 'update', methodType: string): void => {
  trackEvent(`payment_method_${action}`, {
    method_type: methodType,
  });
};

/**
 * Track customer portal events
 */
export const trackPortalAction = (action: string, tab?: string): void => {
  trackEvent('customer_portal_action', {
    action: action,
    tab: tab,
  });
};

/**
 * Set user ID for analytics
 */
export const setAnalyticsUserId = (userId: string | null): void => {
  if (!analytics) return;

  try {
    if (userId) {
      setUserId(analytics, userId);
    } else {
      setUserId(analytics, null);
    }
  } catch (error) {
    console.error('Error setting analytics user ID:', error);
  }
};

/**
 * Set user properties
 */
export const setAnalyticsUserProperties = (properties: {
  [key: string]: string | number | boolean | null;
}): void => {
  if (!analytics) return;

  try {
    setUserProperties(analytics, properties);
  } catch (error) {
    console.error('Error setting analytics user properties:', error);
  }
};

/**
 * Track exceptions/errors
 */
export const trackException = (description: string, fatal: boolean = false): void => {
  trackEvent('exception', {
    description: description,
    fatal: fatal,
  });
};

