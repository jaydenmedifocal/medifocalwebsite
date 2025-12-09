import React from 'react';
import { View } from '../App';

interface PrivacyPolicyPageProps {
    setCurrentView: (view: View) => void;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const sections = [
    { id: 'commitment', title: '1. Our Commitment to Privacy' },
    { id: 'collection', title: '2. How We Collect and Hold Your Personal Information' },
    { id: 'types-of-info', title: '3. Types of Personal Information We Collect' },
    { id: 'how-we-use', title: '4. How We Use Your Personal Information' },
    { id: 'disclosure', title: '5. Disclosure of Personal Information' },
    { id: 'who-we-disclose', title: '6. Who We Disclose Your Personal Information To' },
    { id: 'direct-marketing', title: '7. Direct Marketing' },
    { id: 'overseas-disclosure', title: '8. Overseas Disclosure' },
    { id: 'data-security', title: '9. Data Quality and Security' },
    { id: 'cookies', title: '10. Use of Cookies' },
    { id: 'third-party-links', title: '11. Links to Third-Party Sites' },
    { id: 'accessing-correcting', title: '12. Accessing or Correcting Your Information' },
    { id: 'complaints', title: '13. Privacy Concerns or Complaints' },
];

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ setCurrentView }) => {
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
                    <span className="font-medium text-gray-700">Privacy Policy</span>
                </nav>

                <div className="text-center mb-12">
                     <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
                     <p className="text-lg text-gray-600">Protecting Your Personal Information</p>
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
                             <p className="lead">At Medifocal Pty Ltd, your privacy is paramount. This policy outlines how we handle your personal data in accordance with Australian law.</p>

                            <div id="commitment" className="pt-4">
                                <h3>1. Our Commitment to Privacy</h3>
                                <p>Medifocal Pty Ltd ('Medifocal') (ABN: 13 674 191 649) is deeply committed to protecting the privacy of your personal information. In this Policy, 'we', 'us', and 'our' refer to Medifocal Pty Ltd.</p>
                                <p>We will only use your personal information when it is necessary for us to deliver goods or services to you, or to perform other essential business functions. Medifocal will not use or disclose your personal information for purposes unrelated to the products and services we provide, unless we first obtain your explicit consent.</p>
                                <p>Medifocal is bound by the requirements of the <strong>Privacy Act 1988 (Cth)</strong>, which regulates how we may collect, use, disclose, and store personal information. These laws also specify how individuals may access and correct personal information held about them.</p>
                                <p>By visiting our website or providing your personal information or data to us, you consent to the terms and conditions outlined in this Privacy Policy.</p>
                                <div className="bg-blue-50 border-l-4 border-brand-blue p-4 my-6 rounded-r-lg">
                                    <p className="text-sm">If you have any questions about our Privacy Policy or wish to withdraw consent to the collection, use, or disclosure of your personal information, please email us at: <a href="mailto:admin@medifocal.com" title="Email Medifocal privacy inquiries" className="text-brand-blue hover:underline">admin@medifocal.com</a>.</p>
                                </div>
                                <p>From time to time, our policies and procedures will be reviewed and, if appropriate, updated. Any changes made to this policy will be promptly posted on our website.</p>
                            </div>
                            
                            <div id="collection" className="pt-4">
                                <h3>2. How We Collect and Hold Your Personal Information</h3>
                                <p>Medifocal is committed to collecting personal information about you only by lawful and fair means. It is our usual practice to collect personal information directly from you when you:</p>
                                <ul>
                                    <li>visit or use our website;</li>
                                    <li>complete an online form on our website;</li>
                                    <li>subscribe to our marketing and sales material;</li>
                                    <li>order or request delivery of our products;</li>
                                    <li>book a service or repair at your specified location;</li>
                                    <li>speak with us, or one of our representatives directly during a product, service, or sales inquiry; or</li>
                                    <li>contact us directly by telephone, via mail, e-mail, or online via our website or social media channels.</li>
                                </ul>
                                <p>We may also collect personal information about you from a third party or a publicly available source, but only if you have consented to such collection, or would reasonably expect us to collect your personal information in this way (e.g., from publicly available registers or your authorised representatives).</p>
                            </div>

                             <div id="types-of-info" className="pt-4">
                                <h3>3. Types of Personal Information We Collect</h3>
                                <p>The types of personal information Medifocal may collect includes your:</p>
                                <ul>
                                    <li>Name;</li>
                                    <li>Date of birth;</li>
                                    <li>Residential, business, and postal address;</li>
                                    <li>Email address;</li>
                                    <li>Contact telephone numbers;</li>
                                    <li>Identification details (e.g., driver's license number, for verification purposes);</li>
                                    <li>Photo identification (where necessary for specific services or deliveries);</li>
                                    <li>Financial information, such as credit card details (processed securely and not stored directly by us); and</li>
                                    <li>Written or verbal contact with Medifocal, including voice recordings of telephone conversations you have had with our employees (for quality and training purposes).</li>
                                </ul>
                            </div>
                            
                             <div id="how-we-use" className="pt-4">
                                <h3>4. How We Use Your Personal Information</h3>
                                <p>We use your personal information for a variety of purposes directly related to our functions and activities, including, but not limited to the following:</p>
                                <ul>
                                    <li>To provide services and products to you, including processing orders and facilitating deliveries.</li>
                                    <li>To answer your inquiries and deliver comprehensive customer service.</li>
                                    <li>To inform you about other products, services, or special offers that we think may be of interest to you.</li>
                                    <li>To enable us to undertake necessary credit assessments.</li>
                                    <li>To maintain and continuously improve our customer services and overall user experience.</li>
                                    <li>To meet our legal and regulatory obligations, including under Australian law.</li>
                                </ul>
                            </div>

                            <div id="disclosure" className="pt-4">
                                <h3>5. Disclosure of Personal Information</h3>
                                <p>In the course of conducting our business and providing our products and services to you, we may disclose your personal information. We only disclose personal information for the primary purposes for which it was collected, or for purposes which are directly related to one of our functions or activities. We do not generally disclose it to other entities unless one of the following conditions applies:</p>
                                <ul>
                                    <li>You have provided your explicit consent to the disclosure.</li>
                                    <li>You would reasonably expect, or have been informed, that your information is shared with those specific individuals, businesses, or agencies.</li>
                                    <li>It is otherwise required or authorised by Australian law (e.g., for law enforcement purposes).</li>
                                </ul>
                            </div>
                            
                            <div id="who-we-disclose" className="pt-4">
                                <h3>6. Who We Disclose Your Personal Information To</h3>
                                <p>We may disclose your personal information to the following categories of recipients:</p>
                                <ul>
                                    <li>Another Medifocal business entity.</li>
                                    <li>Companies that perform services on our behalf, such as delivery companies, IT service providers, and account management providers.</li>
                                    <li>Professional advisers (such as lawyers, accountants, or auditors) for necessary professional services.</li>
                                </ul>
                            </div>
                            
                             <div id="direct-marketing" className="pt-4">
                                <h3>7. Direct Marketing</h3>
                                <p>We will only use or disclose your personal information for direct marketing purposes if you have provided your information for that specific purpose (and you would reasonably expect us to use the information for that purpose), or if you have provided clear consent for your information to be used in this way.</p>
                                <p>You can ask to be removed from our marketing lists at any time by contacting us directly.</p>
                            </div>

                             <div id="overseas-disclosure" className="pt-4">
                                <h3>8. Overseas Disclosure of Personal Information</h3>
                                <p>Your personal information may be disclosed to other Medifocal entities, business partners, and service providers located in Australia and overseas for the purposes explained in this policy.</p>
                            </div>

                            <div id="data-security" className="pt-4">
                                <h3>9. Data Quality and Security</h3>
                                <p>We take all reasonable steps to ensure that your personal information is stored securely and is protected from misuse and loss, and from unauthorised access, modification, or disclosure.</p>
                            </div>
                            
                            <div id="cookies" className="pt-4">
                                <h3>10. Use of Cookies</h3>
                                <h4>What are cookies?</h4>
                                <p>A cookie is a small amount of information that a website transfers to your computer for record-keeping purposes.</p>
                                <h4>Why do we use cookies?</h4>
                                <p>Cookies help provide additional functionality to our website(s) and allow us to analyse site usage more accurately. We use information collected from cookies to better understand, customise, and improve user experience.</p>
                            </div>
                            
                            <div id="third-party-links" className="pt-4">
                                <h3>11. Links to Third-Party Sites</h3>
                                <p>Links to third-party websites may be provided on our website for your convenience. Please be aware that we are not responsible for the content or privacy practices of these third-party websites.</p>
                            </div>
                            
                            <div id="accessing-correcting" className="pt-4">
                                <h3>12. Accessing or Correcting Your Personal Information</h3>
                                <p>You have the right to request access to the personal information we hold about you at any time. We will provide you with that information unless we are legally prevented from doing so.</p>
                                <p>If you believe that any personal information we hold about you is inaccurate, out-of-date, incomplete, irrelevant, or misleading, you can request that we correct it.</p>
                            </div>
                            
                            <div id="complaints" className="pt-4">
                                <h3>13. Privacy Concerns or Complaints</h3>
                                <p>If you have queries, concerns, or complaints about how your personal information has been handled, please contact us at: <a href="mailto:admin@medifocal.com" title="Email Medifocal for privacy concerns" className="text-brand-blue hover:underline">admin@medifocal.com</a>.</p>
                                <p>If you consider your privacy concerns have not been resolved satisfactorily, you can contact the <strong>Office of the Australian Information Commissioner (OAIC)</strong> on <strong>1300 363 992</strong> or visit their website at: <a href="http://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" title="Visit OAIC website for privacy complaints" className="text-brand-blue hover:underline">www.oaic.gov.au</a>.</p>
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;