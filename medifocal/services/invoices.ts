import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';
import { CartItem } from '../contexts/CartContext';
import { getUserData } from './auth';

/**
 * Create an invoice using Stripe Invoices Extension
 * Creates a document in the 'invoices' collection
 * The extension will process it and send the invoice to the customer
 */
export const createInvoice = async (
  cartItems: CartItem[],
  customerId: string,
  daysUntilDue: number = 30
): Promise<string> => {
  try {
    // Get user data for email
    const userData = await getUserData(customerId);
    
    if (!userData.email) {
      throw new Error('User email is required to create an invoice');
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 15.00;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    // Build invoice items
    // Note: quantity is optional, defaults to 1 if not provided
    const invoiceItems = cartItems.map(item => ({
      amount: Math.round(item.price * 100), // Unit price in cents (per item)
      currency: 'aud',
      quantity: item.quantity || 1, // Quantity of this item
      description: `${item.name}${item.manufacturer ? ` - ${item.manufacturer}` : ''}`,
    }));

    // Add shipping as an item
    if (shipping > 0) {
      invoiceItems.push({
        amount: Math.round(shipping * 100),
        currency: 'aud',
        quantity: 1,
        description: 'Standard Shipping',
      });
    }

    // Add tax as an item
    if (tax > 0) {
      invoiceItems.push({
        amount: Math.round(tax * 100),
        currency: 'aud',
        quantity: 1,
        description: 'GST (10%)',
      });
    }

    // Create invoice document in Firestore
    // The Stripe Invoices Extension will process this automatically
    // 
    // CRITICAL: Extension validation (from source code):
    // - Must have EITHER email OR uid (NOT both - extension will reject if both provided!)
    // - Must have items array with length > 0
    // - Extension will look up email from Firebase Auth if uid is provided
    //
    // Using email only (not uid) to avoid validation rejection
    const invoiceData: any = {
      email: userData.email, // Use email only - extension requirement
      items: invoiceItems,
      daysUntilDue: daysUntilDue,
    };

    // DO NOT include uid when email is provided - extension will reject the document!
    // The extension validates: if (payload.email && payload.uid) { reject and return; }

    // Validate items array is not empty (extension requirement)
    if (invoiceItems.length === 0) {
      throw new Error('Invoice must have at least one item');
    }

    console.log('Creating invoice document in Firestore:', {
      email: userData.email,
      itemCount: invoiceItems.length,
      totalAmount: invoiceItems.reduce((sum, item) => sum + (item.amount * (item.quantity || 1)), 0) / 100,
      daysUntilDue
    });

    const invoiceRef = await addDoc(collection(db, 'invoices'), invoiceData);

    console.log('Invoice document created successfully:', {
      invoiceId: invoiceRef.id,
      email: userData.email,
      path: invoiceRef.path
    });

    // IMPORTANT: The extension will:
    // 1. Validate payload (email OR uid, not both, items.length > 0)
    // 2. Create/find Stripe customer by email
    // 3. Create invoice items in Stripe
    // 4. Create and finalize invoice
    // 5. Call stripe.invoices.sendInvoice() to email the invoice
    // 6. Update document with stripeInvoiceId, stripeInvoiceUrl, stripeInvoiceRecord
    //
    // NOTE: Stripe only sends emails in LIVE mode, not test mode!
    // Check Firebase Console > Extensions > Stripe Invoices > Configuration
    // Ensure it's using LIVE mode API key (sk_live_...) not test key (sk_test_...)

    return invoiceRef.id;
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    throw new Error(error.message || 'Failed to create invoice');
  }
};

