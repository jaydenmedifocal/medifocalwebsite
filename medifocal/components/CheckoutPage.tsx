import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSessionViaExtension } from '../services/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface CheckoutPageProps {
    setCurrentView: (view: View) => void;
}

type CheckoutStep = 'information' | 'shipping' | 'payment';

const CheckoutPage: React.FC<CheckoutPageProps> = ({ setCurrentView }) => {
    const { items, clearCart, getTotal } = useCart();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('information');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Contact Information
    const [email, setEmail] = useState('');
    const [emailMarketing, setEmailMarketing] = useState(false);

    // Shipping Address
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [suburb, setSuburb] = useState('');
    const [country, setCountry] = useState('AU');
    const [state, setState] = useState('');
    const [postcode, setPostcode] = useState('');
    const [phone, setPhone] = useState('');

    // Load user data if logged in
    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    const loadUserData = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'customers', user!.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setEmail(userData.email || '');
                setFirstName(userData.firstName || userData.displayName?.split(' ')[0] || '');
                setLastName(userData.displayName?.split(' ').slice(1).join(' ') || '');
                setPhone(userData.phoneNumber || userData.phone || '');
                
                if (userData.shippingAddress) {
                    setAddress(userData.shippingAddress.line1 || '');
                    setSuburb(userData.shippingAddress.city || '');
                    setState(userData.shippingAddress.state || '');
                    setPostcode(userData.shippingAddress.postal_code || '');
                    setCountry(userData.shippingAddress.country || 'AU');
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 15.00;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    const validateInformation = () => {
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const validateShipping = () => {
        if (!firstName || !lastName || !address || !suburb || !state || !postcode || !phone) {
            setError('Please fill in all required shipping fields');
            return false;
        }
        return true;
    };

    const handleContinueToShipping = () => {
        setError('');
        if (validateInformation()) {
            setCurrentStep('shipping');
        }
    };

    const handleContinueToPayment = () => {
        setError('');
        if (validateShipping()) {
            setCurrentStep('payment');
        }
    };

    const handleCompleteOrder = async () => {
        // Checkout Gate: If not logged in, redirect to login/register
        if (!user) {
            const proceed = confirm('Please sign in or create an account to complete your order. Would you like to sign in now?');
            if (proceed) {
                setCurrentView({ page: 'login' });
            }
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Get stripe_customer_id from Firestore (Rails pattern: current_user.stripe_id)
            const userDoc = await getDoc(doc(db, 'customers', user.uid));
            const userData = userDoc.data();
            let stripeCustomerId = userData?.stripeId || userData?.stripeCustomerId;

            // If no Stripe customer ID, create one immediately (Critical Step from architecture)
            if (!stripeCustomerId) {
                // Create Stripe customer with shipping address immediately
                const { httpsCallable } = await import('firebase/functions');
                const { functions } = await import('../firebase/config');
                
                const shippingAddress = {
                    line1: address,
                    line2: company || undefined,
                    city: suburb,
                    state: state,
                    postal_code: postcode,
                    country: country,
                };

                const getOrCreateStripe = httpsCallable(functions, 'getOrCreateStripeCustomer');
                const stripeResult = await getOrCreateStripe({
                    email: email.toLowerCase().trim(),
                    name: `${firstName} ${lastName}`.trim() || email,
                    phone: phone || undefined,
                    address: shippingAddress,
                });
                
                const stripeData = stripeResult.data as any;
                stripeCustomerId = stripeData.customerId || stripeData.customer?.id;
                
                // Save stripe_customer_id to Firestore immediately (prevents duplicates)
                await import('firebase/firestore').then(({ doc, setDoc, serverTimestamp }) => {
                    return setDoc(doc(db, 'customers', user.uid), {
                        stripeId: stripeCustomerId,
                        stripeCustomerId: stripeCustomerId,
                        shippingAddress: shippingAddress,
                        updatedAt: serverTimestamp(),
                    }, { merge: true });
                });
            }

            // Prepare shipping address
            const shippingAddress = {
                line1: address,
                line2: company || undefined,
                city: suburb,
                state: state,
                postal_code: postcode,
                country: country,
            };

            // Create Stripe Checkout Session (Rails pattern: Stripe::Checkout::Session.create)
            const successUrl = `${window.location.origin}?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${window.location.origin}?checkout=cancelled`;
            
            const checkoutUrl = await createCheckoutSessionViaExtension(
                items,
                user.uid, // client_reference_id (Rails pattern)
                successUrl,
                cancelUrl,
                stripeCustomerId, // customer (Rails pattern: current_user.stripe_id)
                shippingAddress
            );

            // Redirect to Stripe Checkout (Rails pattern: redirect_to session.url)
            window.location.href = checkoutUrl;
        } catch (error: any) {
            console.error('Checkout error:', error);
            setError(error.message || 'Failed to process checkout. Please try again.');
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <button
                    onClick={() => setCurrentView({ page: 'home' })}
                    className="text-brand-blue hover:text-brand-blue-dark font-medium"
                >
                    Continue shopping
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Medifocal</h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Cart</span>
                        <span>›</span>
                        <span className={currentStep === 'information' ? 'font-semibold text-gray-900' : ''}>Information</span>
                        <span>›</span>
                        <span className={currentStep === 'shipping' ? 'font-semibold text-gray-900' : ''}>Shipping</span>
                        <span>›</span>
                        <span className={currentStep === 'payment' ? 'font-semibold text-gray-900' : ''}>Payment</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Checkout Form */}
                    <div className="lg:col-span-2">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}

                        {/* Step 1: Information */}
                        {currentStep === 'information' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-4">Express checkout</h2>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <button className="border border-gray-300 rounded p-3 hover:border-gray-400 transition">
                                        <div className="text-purple-600 font-semibold">shop</div>
                                        <div className="text-purple-600 font-semibold">Pay</div>
                                    </button>
                                    <button className="border border-gray-300 rounded p-3 hover:border-gray-400 transition">
                                        <div className="text-yellow-500 font-semibold">PayPal</div>
                                    </button>
                                    <button className="border border-gray-300 rounded p-3 hover:border-gray-400 transition">
                                        <div className="text-gray-900 font-semibold">G Pay</div>
                                    </button>
                                </div>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">OR</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-4">Contact information</h3>
                                    {!user && (
                                        <p className="text-sm text-gray-600 mb-4">
                                            Already have an account?{' '}
                                            <button
                                                onClick={() => setCurrentView({ page: 'login' })}
                                                className="text-brand-blue hover:text-brand-blue-dark font-medium"
                                            >
                                                Log in
                                            </button>
                                        </p>
                                    )}
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                                            required
                                        />
                                        <svg className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <label className="flex items-center mt-4">
                                        <input
                                            type="checkbox"
                                            checked={emailMarketing}
                                            onChange={(e) => setEmailMarketing(e.target.checked)}
                                            className="mr-2 h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Email me with news and offers</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setCurrentView({ page: 'cart' })}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        ← Return to cart
                                    </button>
                                    <button
                                        onClick={handleContinueToShipping}
                                        className="px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition"
                                    >
                                        Continue to shipping
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Shipping */}
                        {currentStep === 'shipping' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-4">Shipping address</h2>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Company (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                                    <input
                                        type="text"
                                        value={suburb}
                                        onChange={(e) => setSuburb(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country/region</label>
                                        <select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        >
                                            <option value="AU">Australia</option>
                                            <option value="NZ">New Zealand</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State/territory</label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            placeholder="State/territory"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
                                        <input
                                            type="text"
                                            value={postcode}
                                            onChange={(e) => setPostcode(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                            required
                                        />
                                        <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setCurrentStep('information')}
                                        className="text-gray-600 hover:text-gray-900"
                                    >
                                        ← Return to information
                                    </button>
                                    <button
                                        onClick={handleContinueToPayment}
                                        className="px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition"
                                    >
                                        Continue to payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment - Review & Complete */}
                        {currentStep === 'payment' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-6">Review your order</h2>
                                
                                {/* Order Summary */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Order details</h3>
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <img
                                                        src={item.imageUrl || 'https://via.placeholder.com/50'}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                                                        }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        {item.variant && (
                                                            <p className="text-xs text-gray-600">{item.variant}</p>
                                                        )}
                                                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium text-gray-900 ml-4">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Address Summary */}
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipping address</h3>
                                    <div className="text-sm text-gray-700 space-y-1">
                                        <p className="font-medium">{firstName} {lastName}</p>
                                        {company && <p>{company}</p>}
                                        <p>{address}</p>
                                        <p>{suburb}, {state} {postcode}</p>
                                        <p>{country === 'AU' ? 'Australia' : 'New Zealand'}</p>
                                        {phone && <p className="mt-2">Phone: {phone}</p>}
                                    </div>
                                    <button
                                        onClick={() => setCurrentStep('shipping')}
                                        className="mt-3 text-sm text-brand-blue hover:text-brand-blue-dark font-medium"
                                    >
                                        Edit address
                                    </button>
                                </div>

                                {/* Contact Information Summary */}
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact information</h3>
                                    <div className="text-sm text-gray-700">
                                        <p>{email}</p>
                                        {emailMarketing && (
                                            <p className="text-xs text-gray-600 mt-1">✓ Subscribed to marketing emails</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setCurrentStep('information')}
                                        className="mt-3 text-sm text-brand-blue hover:text-brand-blue-dark font-medium"
                                    >
                                        Edit contact
                                    </button>
                                </div>

                                {/* Price Breakdown */}
                                <div className="mb-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="text-gray-900">${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="text-gray-900">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-lg">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-gray-900">AUD ${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 mb-1">Secure payment</p>
                                            <p className="text-xs text-gray-600">
                                                You'll be redirected to Stripe Checkout to securely enter your payment details. 
                                                We accept all major credit and debit cards.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setCurrentStep('shipping')}
                                        className="text-gray-600 hover:text-gray-900 font-medium"
                                    >
                                        ← Return to shipping
                                    </button>
                                    <button
                                        onClick={handleCompleteOrder}
                                        disabled={loading}
                                        className="px-8 py-3 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Complete order</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 text-center text-sm text-gray-600">
                            <div className="flex justify-center space-x-4">
                                <a href="#" className="hover:text-gray-900">Refund policy</a>
                                <span>•</span>
                                <a href="#" className="hover:text-gray-900">Privacy policy</a>
                                <span>•</span>
                                <a href="#" className="hover:text-gray-900">Terms of service</a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Order summary</h2>
                            
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-start space-x-3">
                                        <img
                                            src={item.imageUrl || 'https://via.placeholder.com/60'}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                            {item.variant && (
                                                <p className="text-xs text-gray-600 mt-0.5">{item.variant}</p>
                                            )}
                                            <p className="text-xs text-gray-600 mt-1">Quantity: {item.quantity}</p>
                                            <p className="text-sm font-medium text-gray-900 mt-1">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        placeholder="Gift card or discount code"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <button className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm">
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="text-gray-900">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="font-semibold text-gray-900">Total</span>
                                    <span className="font-semibold text-gray-900">AUD ${total.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Including ${tax.toFixed(2)} in taxes
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

