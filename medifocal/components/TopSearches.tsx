
import React from 'react';
import { View } from '../App';

interface TopSearchesProps {
    setCurrentView: (view: View) => void;
    handleSearch: (query: string) => void;
}

const searches = [
    'clarity attachment', 'premier traxodent', 'tooth mousse', 'duraphat', 'Ethicon Vicryl Sutures', 'surgical burs', 'fluoride gel', 'gc composite', 'gc capsules', 'gloves', 'de nitrile gloves', 'articaine', 'neutrafluor 5000', 'kavo', 'bibs', 'colgate', 'transcend', 'cream prep burs', 'vita shade guide', 'long shank round burs', 'duraphat varnish', 'scotchbond universal plus', 'septodont', 'bite block', 'septanest', 'fuji', 'savacol', 'crown prep burs'
];

const SearchTag: React.FC<{ term: string; onClick: () => void }> = ({ term, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-gray-100 text-gray-800 rounded-full px-4 py-2 text-sm font-medium hover:bg-brand-blue hover:text-white transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
    >
        {term}
    </button>
);

const TopSearches: React.FC<TopSearchesProps> = ({ setCurrentView, handleSearch }) => {
    const handleSearchClick = (term: string) => {
        handleSearch(term);
        setCurrentView({ page: 'search', query: term });
    };

    return (
        <div className="py-12 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Top Searches</h2>
                <div className="flex flex-wrap justify-center gap-3">
                    {searches.map(term => (
                        <SearchTag key={term} term={term} onClick={() => handleSearchClick(term)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopSearches;
