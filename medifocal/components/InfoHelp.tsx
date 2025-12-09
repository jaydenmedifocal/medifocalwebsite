
import React from 'react';
import { View } from '../App';

interface InfoHelpProps {
    setCurrentView: (view: View) => void;
}

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM5 11h6" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4a15.55 15.55 0 011.64-7.36 2 2 0 013.27 1.15A11.5 11.5 0 0012 20a11.5 11.5 0 009.64-5.79 2 2 0 013.27-1.15A15.55 15.55 0 0120 20H4z" /></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

interface InfoCardData {
    icon: React.ReactNode;
    title: string;
    description: string;
    view?: View;
}

const infoCardsData: InfoCardData[] = [
    { icon: <UserIcon />, title: "Accounts", description: "Get help with your account", view: { page: 'account' } },
    { icon: <TruckIcon />, title: "Delivery & Shipping", description: "View shipping policy", view: { page: 'shippingPolicy' } },
    { icon: <ClipboardIcon />, title: "Orders", description: "Help ordering online" },
    { icon: <CreditCardIcon />, title: "Payment Info", description: "Our credit account policy" },
    { icon: <RefreshIcon />, title: "Returns & Refunds", description: "View our policies", view: { page: 'returnPolicy' } },
];

const InfoCard: React.FC<InfoCardData & { onClick?: () => void }> = ({ icon, title, description, onClick }) => {
    const content = (
        <div className="flex items-center h-full w-full">
            <div className="bg-brand-blue text-white p-3 rounded-md mr-4 flex-shrink-0">
                {icon}
            </div>
            <div className="flex-grow min-w-0">
                <h3 className="font-bold text-gray-800 text-sm truncate">{title}</h3>
                <p className="text-gray-500 text-xs truncate">{description}</p>
            </div>
        </div>
    );

    const classes = "bg-white p-3 rounded-lg border border-gray-200 hover:border-brand-blue hover:shadow-md transition-all text-left group h-full";

    if (onClick) {
        return <button onClick={onClick} className={classes}>{content}</button>;
    }
    return <a href="#" title={`${title} - ${description}`} className={classes}>{content}</a>;
};

const InfoHelp: React.FC<InfoHelpProps> = ({ setCurrentView }) => {
    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">More Information & Help</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {infoCardsData.map(card => (
                       <InfoCard 
                           key={card.title} 
                           {...card} 
                           onClick={card.view ? () => setCurrentView(card.view) : undefined} 
                       />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InfoHelp;
