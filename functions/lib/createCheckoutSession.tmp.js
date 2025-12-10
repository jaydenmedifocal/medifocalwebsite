"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = void 0;
/**
 * Create Stripe Checkout Session
 * This function creates a Stripe checkout session for cart items
 */
exports.createCheckoutSession = functions.region('australia-southeast1').https.onCall(async (data, context) => {
    if (!stripe) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured');
    }
    try {
        const { cartItems, successUrl, cancelUrl, customerEmail, stripeCustomerId, paymentMethod = 'stripe', customerDetails, shippingAddress, } = data;
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'Cart items are required');
        }
        if (!successUrl || !cancelUrl) {
            throw new functions.https.HttpsError('invalid-argument', 'Success and cancel URLs are required');
        }
        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        const shipping = 0.00; // Free shipping
        const tax = subtotal * 0.10; // 10% GST
        const total = subtotal + shipping + tax;
        // Handle invoice payment method
        if (paymentMethod === 'invoice') {
            // Create or get Stripe customer
            let customerId = stripeCustomerId;
            if (!customerId && customerEmail) {
                const existingCustomers = await stripe.customers.list({
                    email: customerEmail,
                    limit: 1,
                });
                if (existingCustomers.data.length > 0) {
                    customerId = existingCustomers.data[0].id;
                }
                else {
                    // Create new customer
                    const customer = await stripe.customers.create({
                        email: customerEmail,
                        name: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.name,
                        phone: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.phone,
                        address: shippingAddress,
                        metadata: {
                            paymentMethod: 'invoice',
                        },
                    });
                    customerId = customer.id;
                }
            }
            if (!customerId) {
                throw new functions.https.HttpsError('invalid-argument', 'Customer ID or email is required for invoice payments');
            }
            // Create invoice
            const invoice = await stripe.invoices.create({
                customer: customerId,
                collection_method: 'send_invoice',
                days_until_due: 30,
                metadata: {
                    cartItemCount: cartItems.length.toString(),
                    subtotal: subtotal.toFixed(2),
                    shipping: shipping.toFixed(2),
                    tax: tax.toFixed(2),
                    total: total.toFixed(2),
                },
            });
            // Add line items to invoice
            for (const item of cartItems) {
                await stripe.invoiceItems.create({
                    customer: customerId,
                    invoice: invoice.id,
                    description: `${item.name}${item.manufacturer ? ` - ${item.manufacturer}` : ''}${item.description ? ` - ${item.description}` : ''}`,
                    amount: Math.round((item.price || 0) * 100 * (item.quantity || 1)), // Amount in cents
                    currency: 'aud',
                });
            }
            // Finalize invoice
            const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
            return {
                success: true,
                invoiceId: finalizedInvoice.id,
                invoiceUrl: finalizedInvoice.hosted_invoice_url,
                message: 'Invoice created successfully. You will receive an email with payment instructions.',
            };
        }
        // Handle regular Stripe checkout
        // Create or get Stripe customer
        let customerId = stripeCustomerId;
        if (!customerId && customerEmail) {
            const existingCustomers = await stripe.customers.list({
                email: customerEmail,
                limit: 1,
            });
            if (existingCustomers.data.length > 0) {
                customerId = existingCustomers.data[0].id;
            }
            else if (customerEmail) {
                // Create new customer
                const customer = await stripe.customers.create({
                    email: customerEmail,
                    name: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.name,
                    phone: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.phone,
                    metadata: {
                        paymentMethod: 'stripe',
                    },
                });
                customerId = customer.id;
            }
        }
        // Create checkout session
        const sessionParams = {
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: cartItems.map((item) => ({
                price_data: {
                    currency: 'aud',
                    product_data: {
                        name: item.name,
                        description: item.description || item.manufacturer || '',
                        images: item.imageUrl ? [item.imageUrl] : [],
                    },
                    unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
                },
                quantity: item.quantity || 1,
            })),
            success_url: successUrl,
            cancel_url: cancelUrl,
            shipping_address_collection: {
                allowed_countries: ['AU'],
            },
            metadata: {
                cartItemCount: cartItems.length.toString(),
                subtotal: subtotal.toFixed(2),
                shipping: shipping.toFixed(2),
                tax: tax.toFixed(2),
                total: total.toFixed(2),
            },
        };
        // Add customer to session if available
        if (customerId) {
            sessionParams.customer = customerId;
        }
        else if (customerEmail) {
            sessionParams.customer_email = customerEmail;
        }
        // Add shipping address if provided
        if (shippingAddress) {
            sessionParams.shipping_address_collection = undefined; // Don't collect if already provided
            // Note: Stripe Checkout will collect shipping address, but we can pre-fill customer details
        }
        const session = await stripe.checkout.sessions.create(sessionParams);
        return {
            url: session.url,
            sessionId: session.id,
        };
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to create checkout session');
    }
});
//# sourceMappingURL=createCheckoutSession.tmp.js.map