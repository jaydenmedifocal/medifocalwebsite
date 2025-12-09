import React from 'react';
import { View } from '../App';

interface TermsOfServicePageProps {
    setCurrentView: (view: View) => void;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const sections = [
    { id: 'overview', title: '1. Overview and Acceptance' },
    { id: 'store-terms', title: '2. Online Store Terms' },
    { id: 'general-conditions', title: '3. General Conditions' },
    { id: 'accuracy', title: '4. Accuracy of Information' },
    { id: 'modifications', title: '5. Modifications and Prices' },
    { id: 'products-services', title: '6. Products or Services' },
    { id: 'billing', title: '7. Billing Accuracy' },
    { id: 'optional-tools', title: '8. Optional Tools' },
    { id: 'third-party', title: '9. Third-Party Links' },
    { id: 'user-comments', title: '10. User Comments & Feedback' },
    { id: 'privacy', title: '11. Personal Information' },
    { id: 'errors', title: '12. Errors & Omissions' },
    { id: 'prohibited-uses', title: '13. Prohibited Uses' },
    { id: 'disclaimer', title: '14. Disclaimer & Liability' },
    { id: 'indemnification', title: '15. Indemnification' },
    { id: 'severability', title: '16. Severability' },
    { id: 'termination', title: '17. Termination' },
    { id: 'entire-agreement', title: '18. Entire Agreement' },
    { id: 'governing-law', title: '19. Governing Law' },
    { id: 'changes', title: '20. Changes to Terms' },
];

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ setCurrentView }) => {
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
                    <span className="font-medium text-gray-700">Terms of Service</span>
                </nav>

                <div className="text-center mb-12">
                     <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Terms of Service</h1>
                     <p className="text-lg text-gray-600">Medifocal Pty Ltd (ABN: 13 674 191 649)</p>
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
                            <p className="lead">These Terms of Service govern your use of the Medifocal Pty Ltd website and services, ensuring clarity and compliance under New South Wales, Australia law.</p>
                        
                            <div id="overview" className="pt-4">
                                <h3>1. Overview and Acceptance of Terms</h3>
                                <p>This website ("the Site") is owned and operated by <strong>Medifocal Pty Ltd</strong> (ABN: 13 674 191 649) (“we”, “us”, “our”). Medifocal Pty Ltd offers this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.</p>
                                <div className="bg-blue-50 border-l-4 border-brand-blue p-4 my-6 rounded-r-lg">
                                    <p><strong>By visiting our Site and/or purchasing something from us, you engage in our “Service” and expressly agree to be bound by these following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink (e.g., Privacy Policy, Shipping Policy).</strong></p>
                                </div>
                                <p>Please read these Terms of Service carefully before using our website. If you do not agree to all the terms and conditions of this agreement, then you are expressly prohibited from accessing the website or using any services.</p>
                            </div>
                            
                            <div id="store-terms" className="pt-4">
                                <h3>2. Online Store Terms</h3>
                                <p>By agreeing to these Terms of Service, you represent and warrant that you are at least the age of majority in your state or territory of residence within Australia (currently 18 years in all states/territories, including NSW).</p>
                                <p>You may not use our products for any illegal or unauthorized purposes, nor may you, in the use of the Service, violate any laws in your jurisdiction.</p>
                            </div>

                            <div id="general-conditions" className="pt-4">
                                <h3>3. General Conditions</h3>
                                <p>We reserve the absolute and unconditional right to refuse service to anyone for any reason whatsoever, at any time, without prior notice or explanation.</p>
                                <p>You explicitly agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Service without our express, written, and prior permission.</p>
                            </div>

                             <div id="accuracy" className="pt-4">
                                <h3>4. Accuracy, Completeness, and Timeliness of Information</h3>
                                <p>We are not responsible or liable if information made available on this Site is not accurate, complete, or current. The material on this Site is provided for general information purposes only. Any reliance on the material on this Site is strictly at your own risk.</p>
                            </div>

                            <div id="modifications" className="pt-4">
                                <h3>5. Modifications to the Service and Prices</h3>
                                <p>Prices for our products are subject to change without notice. We reserve the absolute right to modify or discontinue the Service at any time without prior notice.</p>
                            </div>

                            <div id="products-services" className="pt-4">
                                <h3>6. Products or Services</h3>
                                <p>Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to our Return Policy.</p>
                                <p><strong>Please note:</strong> Nothing in these Terms of Service is intended to exclude, restrict, or modify any non-excludable consumer guarantees under the Australian Consumer Law (ACL).</p>
                            </div>

                             <div id="billing" className="pt-4">
                                <h3>7. Accuracy of Billing and Account Information</h3>
                                <p>We reserve the absolute right to refuse any order you place with us. You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store.</p>
                            </div>
                            
                            <div id="optional-tools" className="pt-4">
                                <h3>8. Optional Tools</h3>
                                <p>We may furnish you with access to third-party tools over which we neither monitor nor possess any control or input. Any use by you of optional tools offered through the Site is entirely at your own risk and discretion.</p>
                            </div>
                            
                            <div id="third-party" className="pt-4">
                                <h3>9. Third-Party Links</h3>
                                <p>We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites.</p>
                            </div>
                            
                            <div id="user-comments" className="pt-4">
                                <h3>10. User Comments, Feedback, and Other Submissions</h3>
                                <p>You agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate, and otherwise use in any medium any comments that you forward to us. We are and shall be under no obligation to maintain any comments in confidence, pay compensation, or respond to any comments.</p>
                            </div>

                             <div id="privacy" className="pt-4">
                                <h3>11. Personal Information &amp; Privacy</h3>
                                <p>Your submission of personal information through the store is governed strictly by our Privacy Policy. Please review our full <button onClick={() => setCurrentView({page: 'privacyPolicy'})} className="text-brand-blue hover:underline">Privacy Policy</button>.</p>
                            </div>

                            <div id="errors" className="pt-4">
                                <h3>12. Errors, Inaccuracies, and Omissions</h3>
                                <p>Occasionally there may be information on our Site or in the Service that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors, inaccuracies, or omissions, and to change or update information or cancel orders if any information is inaccurate at any time without prior notice.</p>
                            </div>

                             <div id="prohibited-uses" className="pt-4">
                                <h3>13. Prohibited Uses</h3>
                                <p>You are strictly prohibited from using the Site or its content for any unlawful purpose, to infringe upon intellectual property rights, to harass, abuse, or discriminate, to submit false information, to upload malicious code, to collect personal information of others, or to interfere with security features.</p>
                            </div>

                            <div id="disclaimer" className="pt-4">
                                <h3>14. Disclaimer of Warranties; Limitation of Liability</h3>
                                <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DO NOT GUARANTEE, REPRESENT, OR WARRANT THAT YOUR USE OF OUR SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.</strong></p>
                                <p><strong>YOU EXPRESSLY AGREE THAT YOUR USE OF, OR INABILITY TO USE, THE SERVICE IS AT YOUR SOLE RISK.</strong></p>
                            </div>

                            <div id="indemnification" className="pt-4">
                                <h3>15. Indemnification</h3>
                                <p>You agree to indemnify, defend, and hold harmless Medifocal Pty Ltd from any claim or demand, including reasonable legal fees, made by any third-party due to or arising out of your breach of these Terms of Service.</p>
                            </div>

                            <div id="severability" className="pt-4">
                                <h3>16. Severability</h3>
                                <p>In the event that any provision of these Terms of Service is determined to be unlawful, void, or unenforceable, such provision shall be severed, and the remaining provisions shall remain in full force and effect.</p>
                            </div>

                            <div id="termination" className="pt-4">
                                <h3>17. Termination</h3>
                                <p>These Terms of Service are effective unless and until terminated by either you or us. We may terminate this agreement at any time without notice if we suspect you have failed to comply with any term.</p>
                            </div>
                            
                            <div id="entire-agreement" className="pt-4">
                                <h3>18. Entire Agreement</h3>
                                <p>These Terms of Service and any policies posted by us constitute the entire agreement between you and us, superseding any prior agreements.</p>
                            </div>

                            <div id="governing-law" className="pt-4">
                                <h3>19. Governing Law and Jurisdiction</h3>
                                <p>These Terms of Service shall be governed by and construed in accordance with the laws of <strong>New South Wales, Australia</strong>.</p>
                            </div>
                            
                            <div id="changes" className="pt-4">
                                <h3>20. Changes to Terms of Service</h3>
                                <p>We reserve the right to update, change, or replace any part of these Terms of Service. It is your responsibility to check our website periodically for changes.</p>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;