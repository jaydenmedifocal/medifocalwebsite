import React, { useState } from 'react';
import { View } from '../App';
import { useCart } from '../contexts/CartContext';

interface CartPageProps {
    setCurrentView: (view: View) => void;
}

const CartPage: React.FC<CartPageProps> = ({ setCurrentView }) => {
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { items, removeItem, updateQuantity, getSubtotal, getTotal, clearCart } = useCart();

    const subtotal = getSubtotal();
    const shipping = 0.00; // Free Delivery Store Wide
    // Tax is calculated by Stripe automatically at checkout based on shipping address
    // We don't display tax in cart - Stripe will calculate it
    const total = subtotal + shipping;

    const handleCheckout = async () => {
        // No auth check - Stripe Checkout will collect all details
        if (items.length === 0) {
            alert('Your cart is empty. Please add products to your cart.');
            return;
        }
        
        if (!agreedToTerms) {
            alert('Please agree to the Terms of Service to proceed');
            return;
        }
        
        setIsProcessing(true);
        try {
            const { createCheckoutSessionViaExtension } = await import('../services/stripe');
            
            const successUrl = `${window.location.origin}?success=true`;
            const cancelUrl = `${window.location.origin}?canceled=true`;
            
            // Use Stripe Checkout to collect details and process payment
            // Stripe will handle address verification and collection
            const checkoutUrl = await createCheckoutSessionViaExtension(
                items,
                'guest',
                successUrl,
                cancelUrl,
                undefined, // stripeCustomerId
                undefined, // shippingAddress
                'card', // paymentMethod
                undefined // customerEmail
            );
            
            window.location.href = checkoutUrl;
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(error.message || 'Failed to start checkout. Please try again.');
            setIsProcessing(false);
        }
    };

    const TrashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );

    const PlusIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    );

    const MinusIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
    );

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="mb-8">
                        <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">Add some products to get started!</p>
                    <button
                        onClick={() => setCurrentView({ page: 'home' })}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
                
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => {
                                    const isAddOn = (item as any).isAddOn || false;
                                    return (
                                    <div key={item.id} className={`p-6 flex flex-col sm:flex-row gap-4 ${isAddOn ? 'bg-blue-50/30 border-l-4 border-blue-500' : ''}`}>
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={item.imageUrl || '/placeholder-product.png'}
                                                alt={item.name}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                        </div>
                                        
                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {item.name}
                                                </h3>
                                                {isAddOn && (
                                                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                                        Add-on
                                                    </span>
                                                )}
                                            </div>
                                            {item.manufacturer && (
                                                <p className="text-sm text-gray-500 mb-2">{item.manufacturer}</p>
                                            )}
                                            {item.itemNumber && (
                                                <p className="text-xs text-gray-400 mb-3">Item #: {item.itemNumber}</p>
                                            )}
                                            
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-2 hover:bg-gray-100 transition-colors"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <MinusIcon />
                                                    </button>
                                                    <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-2 hover:bg-gray-100 transition-colors"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <PlusIcon />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Price */}
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-bold text-gray-900">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                    aria-label="Remove item"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Summary - Sticky on Desktop */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-gray-900 font-medium">Free Delivery Store Wide</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 italic">
                                    * Tax will be calculated at checkout based on your shipping address
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between">
                                    <span className="text-lg font-bold text-gray-900">Subtotal</span>
                                    <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            {/* Terms Agreement */}
                            <div className="mb-6">
                                <label className="flex items-start">
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-1 h-4 w-4 text-brand-blue focus:ring-brand-blue border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">
                                        I agree to the{' '}
                                        <button
                                            onClick={() => setCurrentView({ page: 'termsOfService' })}
                                            className="text-brand-blue hover:text-brand-blue-dark underline"
                                        >
                                            Terms of Service
                                        </button>
                                        {' '}and{' '}
                                        <button
                                            onClick={() => setCurrentView({ page: 'privacyPolicy' })}
                                            className="text-brand-blue hover:text-brand-blue-dark underline"
                                        >
                                            Privacy Policy
                                        </button>
                                    </span>
                                </label>
                            </div>
                            
                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing || !agreedToTerms}
                                className="w-full py-4 px-6 bg-gradient-to-r from-brand-blue to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15l1-4m4 4l1-4m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Proceed to Checkout
                                    </>
                                )}
                            </button>
                            
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                Secure payment via Stripe Checkout (Card, PayTo, Afterpay, Klarna)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
