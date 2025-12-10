import React from 'react';
import { View } from '../App';

const linkMap: Record<string, View> = {
    'Everyday Essentials': { page: 'everydayEssentials' },
    'Equipment': { page: 'categoryLanding', categoryName: 'Equipment' },
    'Clearance Sale': { page: 'clearance' },
    'Promotions': { page: 'promotions' },
    'Buying Guides': { page: 'buyingGuides' },
    'Our Story': { page: 'about' },
    'Contact Us': { page: 'contact' },
    'My Account': { page: 'account' },
    'FAQs': { page: 'faq' },
    'Shipping Policy': { page: 'shippingPolicy' },
    'Privacy Policy': { page: 'privacyPolicy' },
    'Terms of Service': { page: 'termsOfService' },
    'Returns & Refunds': { page: 'returnPolicy' },
    'Blog': { page: 'blog' },
    'Education Hub': { page: 'dentalEducationHub' },
    'Equipment Repairs': { page: 'equipmentServices' },
    'Bundles': { page: 'bundles' },
    'Supplier Specials': { page: 'supplierSpecials' },
    'Catalogues': { page: 'catalogues' },
    'Partners': { page: 'partners' },
    'Our Team': { page: 'ourTeam' },
    'Sustainability': { page: 'sustainability' },
    'New Products': { page: 'newProducts' },
    'Offers': { page: 'offers' },
};

interface FooterLinkColumnProps {
    title: string;
    links: string[];
    setCurrentView: (view: View) => void;
}

const FooterLinkColumn: React.FC<FooterLinkColumnProps> = ({ title, links, setCurrentView }) => (
    <div>
        <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">{title}</h4>
        <ul className="space-y-3 text-sm">
            {links.map(link => {
                const view = linkMap[link];
                return (
                    <li key={link}>
                        {view ? (
                            <button 
                                onClick={() => setCurrentView(view)} 
                                className="text-gray-300 hover:text-white hover:underline transition-colors text-left font-medium"
                            >
                                {link}
                            </button>
                        ) : (
                            <a href="#" title={link} className="text-gray-300 hover:text-white hover:underline transition-colors font-medium">{link}</a>
                        )}
                    </li>
                );
            })}
        </ul>
    </div>
);

const SocialIcon: React.FC<{ children: React.ReactNode, label: string }> = ({ children, label }) => (
    <a href="#" title={label} aria-label={label} className="text-gray-400 hover:text-white bg-gray-700 hover:bg-brand-blue p-2 rounded-full transition-colors">
        {children}
    </a>
);

const PaymentIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center">
      {children}
    </div>
);

interface FooterInfoProps {
    setCurrentView: (view: View) => void;
}

const FooterInfo: React.FC<FooterInfoProps> = ({ setCurrentView }) => {
    return (
        <footer className="bg-gray-800 text-gray-300">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-center lg:text-left">
                    
                    {/* Company Info & Socials */}
                    <div className="lg:col-span-3">
                        <img 
                            src="https://firebasestorage.googleapis.com/v0/b/medifocal.firebasestorage.app/o/MediFocal_Logo?alt=media&token=bac54fce-346e-47ec-9699-1a7533e9aeef" 
                            alt="Medifocal Logo" 
                            className="h-10 w-auto filter brightness-0 invert mb-4 mx-auto lg:mx-0" 
                            style={{ aspectRatio: '4 / 1' }}
                            width="160"
                            height="40"
                            loading="lazy"
                        />
                        <p className="text-sm text-gray-300 mb-6 pr-4 font-medium">
                           Your trusted Australian supplier for high-quality dental products, equipment, and consumables.
                        </p>
                        <div className="flex items-center space-x-3 justify-center lg:justify-start">
                            <SocialIcon label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/></svg></SocialIcon>
                            <SocialIcon label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.585-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.07-1.645-.07-4.85s.012-3.585.07-4.85c.148-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/></svg></SocialIcon>
                            <SocialIcon label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0-1.381-1.11-2.5-2.48-2.5s-2.48 1.119-2.48 2.5c0 1.38 1.11 2.5 2.48 2.5s2.48-1.12 2.48-2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg></SocialIcon>
                        </div>
                    </div>
                    
                    {/* Link Columns */}
                    <div className="lg:col-span-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
                             <FooterLinkColumn setCurrentView={setCurrentView} title="Shop" links={['Everyday Essentials', 'Equipment', 'Clearance Sale', 'Promotions', 'Browse All Brands', 'Bundles', 'Supplier Specials', 'Catalogues', 'New Products', 'Offers']} />
                             <FooterLinkColumn setCurrentView={setCurrentView} title="For Your Practice" links={['Dental Solutions', 'Education Hub', 'Blog', 'Buying Guides', 'Equipment Repairs', 'Patient Resources']} />
                             <FooterLinkColumn setCurrentView={setCurrentView} title="About Medifocal" links={['Our Story', 'Our Team', 'Partners', 'Sustainability', 'Contact Us', 'Medifocal Cares']} />
                             <FooterLinkColumn setCurrentView={setCurrentView} title="Customer Service" links={['My Account', 'FAQs', 'Returns & Refunds']} />
                             <FooterLinkColumn setCurrentView={setCurrentView} title="Policies" links={['Shipping Policy', 'Privacy Policy', 'Terms of Service', 'Returns & Refunds']} />
                        </div>
                    </div>
                    
                    {/* Newsletter CTA */}
                    <div className="lg:col-span-3">
                         <div className="bg-gray-700/50 p-6 rounded-lg">
                            <h4 className="font-bold text-white text-lg mb-3">Get Exclusive Offers & Dental News</h4>
                            <p className="text-sm text-gray-300 mb-5 font-medium">Subscribe to our newsletter for the latest deals and industry insights.</p>
                            <form>
                                <label htmlFor="footer-email" className="sr-only">Email address</label>
                                <input id="footer-email" type="email" placeholder="Enter your email" className="w-full rounded-md px-4 py-3 text-gray-800 focus:outline-none focus:border-brand-blue focus:border-2 transition-colors" />
                                <button type="submit" className="w-full mt-3 bg-brand-blue text-white font-bold px-6 py-3 rounded-md hover:bg-opacity-80 transition-colors">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Trust & Contact Info Bar */}
            <div className="bg-gray-700 border-t border-gray-600">
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                        <div>
                            <div className="text-white font-bold text-lg mb-1">60+ Years Experience</div>
                            <div className="text-gray-300 text-sm">Serving Australian dental practices since 1960s</div>
                        </div>
                        <div>
                            <div className="text-white font-bold text-lg mb-1">Free Delivery Store Wide</div>
                            <div className="text-gray-300 text-sm">Australia-wide on all orders</div>
                        </div>
                        <div>
                            <div className="text-white font-bold text-lg mb-1">Expert Support</div>
                            <div className="text-gray-300 text-sm">Call (02) 4056 1419 or email admin@medifocal.com</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Sub-Footer */}
            <div className="bg-gray-900">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-x-6 gap-y-2 text-gray-400 text-center">
                            <p>&copy; {new Date().getFullYear()} Medifocal. All rights reserved.</p>
                            <p className="text-gray-500">Site 2, 7 Friesian Close, Sandgate NSW 2304</p>
                            <div className="flex space-x-4">
                                <button onClick={() => setCurrentView({ page: 'termsOfService' })} className="text-gray-400 hover:text-white hover:underline">Terms of Service</button>
                                <button onClick={() => setCurrentView({ page: 'privacyPolicy' })} className="text-gray-400 hover:text-white hover:underline">Privacy Policy</button>
                            </div>
                        </div>
                         <div className="flex items-center space-x-2">
                             <PaymentIcon><img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Old_Visa_Logo.svg" alt="Visa" className="h-4" width="40" height="16" loading="lazy" /></PaymentIcon>
                             <PaymentIcon><img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="h-5" width="40" height="20" loading="lazy" /></PaymentIcon>
                             <PaymentIcon><img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-5" width="40" height="20" loading="lazy" /></PaymentIcon>
                             <PaymentIcon><img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" width="40" height="16" loading="lazy" /></PaymentIcon>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterInfo;