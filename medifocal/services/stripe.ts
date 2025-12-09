import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
import { CartItem } from '../contexts/CartContext';

/**
 * Create Stripe checkout session using Firebase Extension
 * Uses: ext-firestore-stripe-payments-createCheckoutSession
 */
export const createCheckoutSession = async (
  cartItems: CartItem[],
  successUrl: string,
  cancelUrl: string,
  customerId?: string
): Promise<{ url: string; sessionId: string }> => {
  try {
    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 0.00; // Free shipping
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    // Use Firebase Extension callable function
    const createCheckoutSessionFunction = httpsCallable(
      functions, 
      'ext-firestore-stripe-payments-createCheckoutSession'
    );
    
    const result = await createCheckoutSessionFunction({
      amount: Math.round(total * 100), // Total in cents
      currency: 'aud',
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        cartItemCount: cartItems.length.toString(),
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
      },
      line_items: cartItems.map(item => ({
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.name,
            description: item.manufacturer || '',
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
    });

    const data = result.data as any;
    return {
      url: data.url || data.checkoutUrl || data.sessionUrl,
      sessionId: data.sessionId || data.id || '',
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
};

/**
 * Create Stripe Checkout Session via Cloud Function
 * This directly creates a checkout session and returns the URL immediately
 */
export const createCheckoutSessionViaExtension = async (
  cartItems: CartItem[],
  customerId: string | null,
  successUrl: string,
  cancelUrl: string,
  stripeCustomerId?: string,
  shippingAddress?: any,
  paymentMethod: 'stripe' | 'invoice' | 'bank_transfer' = 'stripe',
  customerEmail?: string,
  customerDetails?: { name?: string; phone?: string },
  invoiceShippingAddress?: any
): Promise<string | { success: boolean; invoiceId?: string; invoiceUrl?: string; message?: string }> => {
  try {
    // Use Cloud Function to create checkout session directly
    const createCheckoutFn = httpsCallable(functions, 'createCheckoutSession');
    
    // Get customer email if available (for non-guest checkout)
    // For invoice payments, use the passed customerEmail directly
    let finalCustomerEmail: string | undefined = customerEmail;
    if (!finalCustomerEmail && customerId && customerId !== 'guest') {
      try {
        const { getUserData } = await import('./auth');
        const userData = await getUserData(customerId);
        finalCustomerEmail = userData.email || undefined;
      } catch (error) {
        console.log('Could not get user data, proceeding without email');
      }
    }

    const result = await createCheckoutFn({
      cartItems: cartItems.map(item => ({
        name: item.name,
        manufacturer: item.manufacturer,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
      successUrl,
      cancelUrl,
      customerEmail: finalCustomerEmail,
      stripeCustomerId,
      paymentMethod: paymentMethod || 'stripe',
      customerDetails: customerDetails || undefined,
      shippingAddress: paymentMethod === 'invoice' ? invoiceShippingAddress : shippingAddress,
    });

    const data = result.data as any;
    
    // Handle invoice payment response
    if (paymentMethod === 'invoice' && data.success) {
      return {
        success: true,
        invoiceId: data.invoiceId,
        invoiceUrl: data.invoiceUrl,
        message: data.message,
      };
    }
    
    // Handle regular checkout response
    if (!data?.url) {
      throw new Error('No checkout URL returned from server');
    }

    console.log('Checkout URL received:', data.url);
    return data.url;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
};

/**
 * Create customer portal session for managing subscriptions/payments
 */
export const createCustomerPortalSession = async (
  customerId: string,
  returnUrl: string
): Promise<string> => {
  try {
    const createPortalLinkFunction = httpsCallable(functions, 'createPortalLink');
    
    const result = await createPortalLinkFunction({
      customer: customerId,
      return_url: returnUrl,
    });

    const data = result.data as any;
    return data.url || data.portalUrl;
  } catch (error: any) {
    console.error('Error creating customer portal session:', error);
    throw new Error(error.message || 'Failed to create portal session');
  }
};
