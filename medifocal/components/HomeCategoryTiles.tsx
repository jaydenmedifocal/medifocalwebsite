
import React, { useState } from 'react';
import { View } from '../App';

interface HomeCategoryTilesProps {
    setCurrentView: (view: View) => void;
}

const Tile: React.FC<{ title: string; desc: string; img: string; onClick: () => void }> = ({ title, desc, img, onClick }) => {
    const [imgError, setImgError] = useState(false);
    const fallbackImage = "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=400&auto=format&fit=crop";
    
    return (
        <button 
            onClick={onClick} 
            className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl hover:border-brand-blue transition-all duration-300 text-left overflow-hidden group w-full h-full flex flex-col items-stretch"
        >
            <div className="relative h-48 overflow-hidden bg-gray-100">
                <img 
                    src={imgError ? fallbackImage : img} 
                    alt={`${title} dental equipment category`} 
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-in-out" 
                    loading="lazy" 
                    width="400" 
                    height="300"
                    onError={() => setImgError(true)}
                />
            </div>
            <div className="p-5 flex flex-col justify-center flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-brand-blue transition-colors duration-300">{title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">{desc}</p>
                <span className="text-brand-blue text-sm font-bold flex items-center opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    Shop Now <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
            </div>
        </button>
    );
};

const HomeCategoryTiles: React.FC<HomeCategoryTilesProps> = ({ setCurrentView }) => {
    return (
        <section className="py-8">
             <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Explore Our Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Tile 
                    title="Dental Chairs Australia"
                    desc="Premium dental treatment units and chairs for Australian practices. Remote control, electric, and hydraulic options."
                    img="https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=400&auto=format&fit=crop" 
                    onClick={() => setCurrentView({ page: 'dentalChairs' })}
                />
                <Tile 
                    title="Anaesthetics"
                    desc="Wide range of local and topical anaesthetics for patient comfort."
                    img="https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop" 
                    onClick={() => setCurrentView({ page: 'categoryLanding', categoryName: 'Anaesthetic' })}
                />
                <Tile 
                    title="Dental Equipment"
                    desc="Tailored equipment solutions for all your practice needs."
                    img="https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=400&auto=format&fit=crop" 
                    onClick={() => setCurrentView({ page: 'categoryLanding', categoryName: 'Equipment' })}
                />
                <Tile 
                    title="Medifocal Brand"
                    desc="High-quality products at a competitive price, just for you."
                    img="https://images.unsplash.com/photo-1599045118108-bf9954418b76?q=80&w=400&auto=format&fit=crop" 
                    onClick={() => setCurrentView({ page: 'productList', categoryName: 'Gloves', parentCategory: 'Infection Control' })} 
                />
            </div>
        </section>
    );
};

export default HomeCategoryTiles;
