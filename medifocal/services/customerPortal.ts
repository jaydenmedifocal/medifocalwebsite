import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  canceledAt: number | null;
  items: Array<{
    id: string;
    priceId: string;
    productId: string;
    quantity: number;
    price: {
      amount: number;
      currency: string;
      interval?: string;
      intervalCount?: number;
    };
  }>;
}

export interface Invoice {
  id: string;
  number: string | null;
  status: string;
  amountDue: number;
  amountPaid: number;
  total: number;
  currency: string;
  created: number;
  dueDate: number | null;
  paidAt: number | null;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  lineItems: Array<{
    description: string | null;
    amount: number;
    quantity: number | null;
  }>;
}

export interface CustomerBilling {
  email: string | null;
  name: string | null;
  phone: string | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  } | null;
  defaultPaymentMethod: string | null;
  taxIds: any[];
  balance: number;
  currency: string | null;
}

/**
 * Get customer subscriptions
 */
export const getSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const getSubscriptionsFn = httpsCallable(functions, 'getStripeSubscriptions');
    const result = await getSubscriptionsFn({});
    return (result.data as any)?.subscriptions || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

/**
 * Get customer invoices
 */
export const getInvoices = async (limit?: number): Promise<Invoice[]> => {
  try {
    const getInvoicesFn = httpsCallable(functions, 'getStripeInvoices');
    const result = await getInvoicesFn({ limit });
    return (result.data as any)?.invoices || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
};

/**
 * Get customer billing information
 */
export const getCustomerBilling = async (): Promise<CustomerBilling | null> => {
  try {
    const getBillingFn = httpsCallable(functions, 'getStripeCustomerBilling');
    const result = await getBillingFn({});
    return result.data as CustomerBilling | null;
  } catch (error) {
    console.error('Error fetching customer billing:', error);
    return null;
  }
};

/**
 * Update customer billing information
 */
export const updateCustomerBilling = async (data: {
  email?: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}): Promise<{ success: boolean; customer?: any }> => {
  try {
    const updateBillingFn = httpsCallable(functions, 'updateStripeCustomerBilling');
    const result = await updateBillingFn(data);
    return result.data as any;
  } catch (error: any) {
    console.error('Error updating customer billing:', error);
    throw new Error(error.message || 'Failed to update billing information');
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<{ success: boolean; subscription?: any }> => {
  try {
    const cancelSubFn = httpsCallable(functions, 'cancelStripeSubscription');
    const result = await cancelSubFn({ subscriptionId, cancelAtPeriodEnd });
    return result.data as any;
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    throw new Error(error.message || 'Failed to cancel subscription');
  }
};

/**
 * Reactivate a canceled subscription
 */
export const reactivateSubscription = async (
  subscriptionId: string
): Promise<{ success: boolean; subscription?: any }> => {
  try {
    const reactivateSubFn = httpsCallable(functions, 'reactivateStripeSubscription');
    const result = await reactivateSubFn({ subscriptionId });
    return result.data as any;
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    throw new Error(error.message || 'Failed to reactivate subscription');
  }
};

