import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
  isDefault?: boolean;
}

/**
 * Get customer's payment methods from Stripe
 * Note: customerId is the Firebase user UID, not Stripe customer ID
 */
export const getPaymentMethods = async (customerId: string): Promise<PaymentMethod[]> => {
  try {
    const getPaymentMethodsFn = httpsCallable(functions, 'getStripePaymentMethods');
    const result = await getPaymentMethodsFn({});
    
    return (result.data as any)?.paymentMethods || [];
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    // If function doesn't exist, return empty array
    return [];
  }
};

/**
 * Create Stripe Customer Portal session URL
 * Uses the configured portal configuration ID
 */
export const createPortalSession = async (returnUrl?: string): Promise<string | null> => {
  try {
    const createPortalFn = httpsCallable(functions, 'createStripePortalSession');
    const baseUrl = window.location.origin;
    const result = await createPortalFn({ 
      returnUrl: returnUrl || `${baseUrl}/`,
      baseUrl,
      portalConfigurationId: 'bpc_1SXCLYS5loAzWKwGVmVVTjU9' // Pre-configured portal
    });
    
    const url = (result.data as any)?.url;
    if (!url) {
      console.error('No portal URL returned from function');
      return null;
    }
    return url;
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    // Log more details
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    return null;
  }
};

/**
 * Sync all customers to Stripe (admin only)
 */
export const syncAllCustomersToStripe = async (): Promise<{ success: boolean; synced: number; skipped: number; errors: number }> => {
  try {
    const syncFn = httpsCallable(functions, 'syncAllCustomersToStripe');
    const result = await syncFn({});
    return result.data as any;
  } catch (error: any) {
    console.error('Error syncing customers:', error);
    throw new Error(error.message || 'Failed to sync customers');
  }
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (paymentMethodId: string): Promise<void> => {
  try {
    const deletePaymentMethodFn = httpsCallable(functions, 'deleteStripePaymentMethod');
    await deletePaymentMethodFn({ paymentMethodId });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

/**
 * Set a payment method as default
 * Note: customerId is the Firebase user UID, not Stripe customer ID
 */
export const setDefaultPaymentMethod = async (customerId: string, paymentMethodId: string): Promise<void> => {
  try {
    const setDefaultFn = httpsCallable(functions, 'setDefaultStripePaymentMethod');
    await setDefaultFn({ paymentMethodId });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

