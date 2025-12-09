import React from 'react';
import { View } from '../App';

interface ReturnPolicyPageProps {
    setCurrentView: (view: View) => void;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const sections = [
    { id: 'return-policy', title: '1. 30-Day Return Policy' },
    { id: 'shipping-restocking', title: '2. Return Shipping & Restocking Fee' },
    { id: 'non-returnable', title: '3. Non-Returnable Items' },
    { id: 'damaged-incorrect', title: '4. Damaged or Incorrect Items' },
    { id: 'exchanges', title: '5. Exchanges' },
    { id: 'refunds', title: '6. Refunds' },
];

const ReturnPolicyPage: React.FC<ReturnPolicyPageProps> = ({ setCurrentView }) => {
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
                    <span className="font-medium text-gray-700">Return and Refund Policy</span>
                </nav>

                 <div className="text-center mb-12">
                     <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Return and Refund Policy</h1>
                     <p className="text-lg text-gray-600">Your Satisfaction Guaranteed</p>
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
                            <p className="lead">At Medifocal Pty Ltd, we are committed to your complete satisfaction with every purchase.</p>
                            
                            <div id="return-policy" className="pt-4">
                                <h3>1. 30-Day Return Policy</h3>
                                <p>If you are not fully satisfied with your product, we offer a 30-day return policy from the date you receive your item. To be eligible for a return:</p>
                                <ul>
                                    <li>The item must be in its <strong>original condition</strong>, unused, with all tags attached, and in its original packaging.</li>
                                    <li>A <strong>receipt or proof of purchase</strong> is required to process your return.</li>
                                </ul>
                                 <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 rounded-r-lg">
                                    <p className="font-semibold text-yellow-800">Important:</p>
                                    <p className="text-sm text-yellow-700">Returns sent without prior approval will not be accepted.</p>
                                </div>
                            </div>
                            
                            <div id="shipping-restocking" className="pt-4">
                                <h3>2. Return Shipping &amp; Restocking Fee</h3>
                                <p><strong>Return Shipping:</strong> Customers are responsible for the cost of return shipping. We will provide you with the return shipping address once your return has been approved.</p>
                                <p><strong>Restocking Fee:</strong> A 10% restocking fee will be applied to all returned items. This fee is waived only in cases where the product was confirmed to be damaged, defective, or incorrect upon receipt.</p>
                            </div>
                            
                            <div id="non-returnable" className="pt-4">
                                <h3>3. Non-Returnable Items</h3>
                                <p>Please note that <strong>final sale items are not eligible</strong> for returns or exchanges.</p>
                            </div>

                            <div id="damaged-incorrect" className="pt-4">
                                <h3>4. Damaged or Incorrect Items</h3>
                                <p>If your item arrives damaged or you receive an incorrect item, please contact us <strong>within 48 hours of receipt</strong> at <a href="mailto:admin@medifocal.com" title="Email Medifocal for damaged or incorrect items" className="text-brand-blue hover:underline">admin@medifocal.com</a>. We will provide prompt instructions on how to return the product and will facilitate a replacement or issue a full refund where applicable.</p>
                            </div>
                            
                            <div id="exchanges" className="pt-4">
                                <h3>5. Exchanges</h3>
                                <p>If you wish to exchange an item, the quickest and most efficient way to do so is to return the original product (following the 30-day return policy guidelines) and then place a new order for the desired item.</p>
                            </div>

                            <div id="refunds" className="pt-4">
                                <h3>6. Refunds</h3>
                                <p>Once we receive and thoroughly inspect your returned item, we will notify you via email regarding the approval or rejection of your refund. If approved, your refund will be processed back to your original payment method within <strong>10 business days</strong>.</p>
                                <p>Please be aware that it may take additional time for your bank or credit card provider to process and post the refund to your account.</p>
                                <p>If you do not receive your approved refund within 15 business days, please contact us at <a href="mailto:admin@medifocal.com" title="Email Medifocal for refund inquiries" className="text-brand-blue hover:underline">admin@medifocal.com</a> for assistance.</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicyPage;