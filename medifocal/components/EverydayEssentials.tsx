
import React from 'react';
import { View } from '../App';

interface EverydayEssentialsProps {
    setCurrentView?: (view: View) => void;
    category?: string;
}

const EverydayEssentials: React.FC<EverydayEssentialsProps> = ({ setCurrentView }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Everyday Essentials */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden group relative flex flex-col justify-between p-6 h-64">
            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-800">Everyday <span className="text-brand-blue">Essentials</span></h3>
                <p className="text-sm text-gray-600 mt-2">Quality you can trust, prices you'll love.</p>
            </div>
            <div className="relative z-10 mt-4">
                 <div className="flex flex-wrap gap-2">
                    {['Gloves', 'Masks', 'Bibs', 'Disposables', 'Steri Room'].map(item => (
                        <button 
                            key={item}
                            onClick={() => setCurrentView && setCurrentView({ page: 'everydayEssentials', category: item })}
                            className="text-xs font-semibold bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-colors duration-200"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>
            <img 
                src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=800&auto=format&fit=crop" 
                alt="Dental supplies" 
                className="absolute inset-0 w-full h-full object-cover opacity-5 group-hover:opacity-10 transition-opacity duration-300" 
                loading="lazy"
                width="800"
                height="600"
            />
        </div>

        {/* Card 2: Promotions */}
        <div className="bg-brand-blue text-white rounded-xl shadow-lg border border-blue-700 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group h-64">
             <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-2xl font-bold">Your Promotions</h3>
                <p className="text-blue-200 mt-1 mb-4">Exclusive offers on your favorite items.</p>
                <button 
                    onClick={() => setCurrentView && setCurrentView({ page: 'offers' })}
                    className="bg-white text-brand-blue font-bold py-2 px-5 rounded-full hover:bg-blue-100 transition-all shadow-md transform group-hover:scale-105"
                >
                    Login to View Specials
                </button>
             </div>
             <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-600 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        </div>

        {/* Card 3: Feature Banner */}
        <div className="md:col-span-2 lg:col-span-1 rounded-xl shadow-lg border border-gray-200 overflow-hidden relative h-64 group cursor-pointer" onClick={() => setCurrentView && setCurrentView({ page: 'dentalEducationHub' })}>
            <img 
                src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=800&auto=format&fit=crop" 
                alt="Dental solutions" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                loading="lazy"
                width="800"
                height="600"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-white text-2xl font-bold drop-shadow-lg">Dental Solutions</h3>
                <p className="text-gray-200 text-sm mb-3 drop-shadow-md">Innovative products for modern dentistry.</p>
                <span className="text-white text-sm font-bold flex items-center gap-2 transform group-hover:translate-x-1 transition-transform duration-300">
                    Explore Now <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </span>
            </div>
        </div>
    </div>
  );
};

export default EverydayEssentials;
