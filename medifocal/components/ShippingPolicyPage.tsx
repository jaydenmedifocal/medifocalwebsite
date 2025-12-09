import React from 'react';
import { View } from '../App';

interface ShippingPolicyPageProps {
    setCurrentView: (view: View) => void;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const sections = [
    { id: 'processing-times', title: '1. Processing Times' },
    { id: 'domestic-shipping', title: '2. Domestic Shipping (Australia)' },
    { id: 'shipping-restrictions', title: '3. Shipping Restrictions' },
    { id: 'tracking-order', title: '4. Tracking Your Order' },
    { id: 'shipping-delays', title: '5. Shipping Delays and Issues' },
    { id: 'lost-damaged', title: '6. Lost or Damaged Packages' },
    { id: 'incorrect-address', title: '7. Incorrect Shipping Addresses' },
    { id: 'shipping-costs', title: '8. Shipping Costs' },
];

const ShippingPolicyPage: React.FC<ShippingPolicyPageProps> = ({ setCurrentView }) => {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
                    <button onClick={() => setCurrentView({ page: 'home' })} className="flex items-center text-gray-400 hover:text-brand-blue">
                        <HomeIcon />
                        <span className="ml-2">Home</span>
                    </button>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="font-medium text-gray-700">Shipping Policy</span>
                </nav>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Shipping Policy</h1>
                    <p className="text-lg text-gray-600">Safe and Timely Delivery for Your Medifocal Orders</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    <aside className="lg:col-span-1">
                        <div className="sticky top-40 bg-gray-50 p-6 rounded-lg border">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">On this page</h3>
                            <ul className="space-y-2">
                                {sections.map(section => (
                                    <li key={section.id}>
                                        <a href={`#${section.id}`} title={`Jump to ${section.title} section`} className="text-sm text-gray-600 hover:text-brand-blue hover:underline transition-colors">{section.title}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    <main className="lg:col-span-3">
                        <div className="prose lg:prose-lg max-w-none text-gray-700">
                            <p className="lead">At Medifocal Pty Ltd, we are dedicated to ensuring your orders reach you safely and efficiently.</p>
                            
                            <div id="processing-times" className="pt-4">
                                <h3>1. Processing Times</h3>
                                <ul>
                                    <li>Orders are typically processed within <strong>1-5 business days</strong> (Monday to Friday, excluding Australian public holidays).</li>
                                    <li>Orders placed after 12:00 PM (AEST) or on weekends will commence processing on the next business day.</li>
                                    <li>A confirmation email, including tracking details (if available), will be sent to you as soon as your order has been dispatched.</li>
                                </ul>
                                <div className="bg-blue-50 border-l-4 border-brand-blue p-4 my-6 rounded-r-lg">
                                    <p className="font-semibold text-gray-800">Please note:</p>
                                    <p className="text-sm">During peak periods (e.g., promotions, holidays), processing times may be extended. We will endeavour to notify you via email of any unexpected delays.</p>
                                </div>
                            </div>
                            
                            <div id="domestic-shipping" className="pt-4">
                                <h3>2. Domestic Shipping (Australia)</h3>
                                <p><strong>Free Delivery Store Wide</strong> - All orders ship free Australia-wide with no minimum purchase required.</p>
                                <p>We offer reliable shipping for all orders within Australia:</p>
                                <ul>
                                    <li><strong>Standard Shipping:</strong> Estimated delivery within <strong>3-7 business days</strong>.</li>
                                    <li><strong>Express Shipping:</strong> Available for urgent orders with estimated delivery within <strong>1-3 business days</strong>.</li>
                                </ul>
                                <p>All shipping is free regardless of order value or location within Australia.</p>
                            </div>

                            <div id="shipping-restrictions" className="pt-4">
                                <h3>3. Shipping Restrictions</h3>
                                <p>Please note that we currently <strong>do not ship to P.O. boxes or APO/FPO addresses</strong>. Kindly ensure a valid residential or business street address is provided for all shipping requirements to avoid delays.</p>
                            </div>

                            <div id="tracking-order" className="pt-4">
                                <h3>4. Tracking Your Order</h3>
                                <p>Once your order has been successfully dispatched, we will promptly send you a tracking number via email. You can conveniently track your shipment's progress through the provided link or directly on the designated carrier’s website.</p>
                                <p>Please allow up to <strong>72 hours</strong> for the tracking information to be fully updated and become active after your order has shipped.</p>
                            </div>

                             <div id="shipping-delays" className="pt-4">
                                <h3>5. Shipping Delays and Issues</h3>
                                <p>While we rigorously strive to meet all delivery estimates, please understand that occasional delays may occur due to factors entirely beyond our control. These can include unforeseen carrier issues, adverse weather conditions, or customs processing delays.</p>
                                <p>If your shipment experiences a significant delay, please do not hesitate to contact us immediately at <a href="mailto:admin@medifocal.com" title="Email Medifocal customer service" className="text-brand-blue hover:underline">admin@medifocal.com</a>. We will diligently assist you in investigating the matter and working towards a swift resolution.</p>
                            </div>

                            <div id="lost-damaged" className="pt-4">
                                <h3>6. Lost or Damaged Packages</h3>
                                <p>In the unfortunate event that your package is lost in transit or arrives damaged, please contact us <strong>within 48 hours of expected delivery or receipt</strong> at <a href="mailto:admin@medifocal.com" title="Email Medifocal for lost or damaged packages" className="text-brand-blue hover:underline">admin@medifocal.com</a>. We will initiate an investigation with the carrier and, if necessary, arrange for a replacement shipment or a full refund, depending on the circumstances.</p>
                            </div>

                            <div id="incorrect-address" className="pt-4">
                                <h3>7. Incorrect Shipping Addresses</h3>
                                <p>It is solely the customer’s responsibility to ensure that the shipping address provided at the time of order placement is accurate and complete.</p>
                                <p>If you realize an error in your shipping address after placing your order, please contact us immediately at <a href="mailto:admin@medifocal.com" title="Email Medifocal to update shipping address" className="text-brand-blue hover:underline">admin@medifocal.com</a>. While we will do our best to amend the address before dispatch, we cannot be held responsible for delays or non-delivery resulting from an incorrect or incomplete address provided by the customer.</p>
                            </div>

                            <div id="shipping-costs" className="pt-4">
                                <h3>8. Shipping Costs</h3>
                                <p><strong>Free Delivery Store Wide</strong> - All orders ship free Australia-wide. No minimum order value required. We provide free delivery on all products to all locations across Australia.</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;