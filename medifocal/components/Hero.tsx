
import React from 'react';
import { View } from '../App';

// Icons
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const QuestionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const RssIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.732 0 14 6.268 14 14M6 13a7 7 0 017 7m-7-7a2 2 0 012-2" /></svg>;

interface HeroProps {
    setCurrentView?: (view: View) => void;
}

const Hero: React.FC<HeroProps> = ({ setCurrentView }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 relative rounded-xl overflow-hidden h-96 lg:h-auto group cursor-pointer shadow-lg">
        <img 
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop" 
            alt="November Clearance" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" 
            width="1200"
            height="600"
            fetchPriority="high"
            decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-3 uppercase tracking-wider shadow-md">Limited Time Offer</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-2 leading-tight drop-shadow-xl">November Clearance</h2>
            <p className="text-lg md:text-xl font-medium mb-5 drop-shadow-lg">Up to <span className="font-bold text-yellow-300">80% OFF</span> selected items</p>
            <button 
                onClick={() => setCurrentView && setCurrentView({ page: 'clearance' })}
                className="bg-white text-gray-900 hover:bg-brand-blue hover:text-white font-bold py-3 px-6 rounded-lg w-fit transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
                Shop Clearance
            </button>
        </div>
      </div>
      
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Medifocal</h2>
            <p className="text-gray-600 text-sm mb-3">Australia's trusted dental supplier for 60+ years</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-green-800">Free Delivery Store Wide</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">Sign in for exclusive pricing and order tracking.</p>
            <div className="flex space-x-3">
                <button 
                    onClick={() => window.location.href = 'https://billing.stripe.com/p/login/6oU3cx8jRezt6d05r708g00'}
                    className="flex-1 bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue-dark transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <UserIcon /> Sign In
                </button>
                <button 
                    onClick={() => setCurrentView && setCurrentView({ page: 'cart' })}
                    className="flex-1 bg-gray-100 text-gray-800 border border-gray-300 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                    Checkout
                </button>
            </div>
        </div>
        <div className="flex-grow p-4">
            <nav className="space-y-1">
                <QuickLinkButton icon={<InfoIcon />} label="About Us" onClick={() => setCurrentView && setCurrentView({ page: 'about' })} />
                <QuickLinkButton icon={<MailIcon />} label="Contact Us" onClick={() => setCurrentView && setCurrentView({ page: 'contact' })} />
                <QuickLinkButton icon={<QuestionIcon />} label="FAQs" onClick={() => setCurrentView && setCurrentView({ page: 'contact' })} />
                <QuickLinkButton icon={<RssIcon />} label="Latest News" onClick={() => setCurrentView && setCurrentView({ page: 'blog' })} />
            </nav>
        </div>
      </div>
    </div>
  );
};

interface QuickLinkButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

const QuickLinkButton: React.FC<QuickLinkButtonProps> = ({ icon, label, onClick }) => (
    <button 
        onClick={onClick} 
        className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-all group"
    >
        <div className="flex-shrink-0 text-gray-500 group-hover:text-brand-blue transition-colors">
            {icon}
        </div>
        <span className="font-semibold text-sm flex-grow text-left">{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-brand-blue transition-transform duration-300 transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
    </button>
);

export default Hero;
