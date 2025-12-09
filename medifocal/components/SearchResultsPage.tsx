
import React, { useState, useEffect } from 'react';
import { searchProducts } from '../services/firestore';
import ProductCard from './ProductCard';
import { View } from '../App';

interface SearchResultsPageProps {
    query: string;
    setCurrentView: (view: View) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, setCurrentView }) => {
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const performSearch = async () => {
            try {
                setLoading(true);
                const results = await searchProducts(query, 50);
                setSearchResults(results);
            } catch (error) {
                console.error('Error searching products:', error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        };
        if (query) {
            performSearch();
        }
    }, [query]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results</h1>
                <p className="text-gray-600 mb-8">Searching for <span className="font-semibold text-gray-900">"{query}"</span>...</p>
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results</h1>
            <p className="text-gray-600 mb-8">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found for <span className="font-semibold text-gray-900">"{query}"</span>
            </p>

            {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {searchResults.map((product) => (
                        <ProductCard key={product.id || product.itemNumber} {...product} setCurrentView={setCurrentView} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Products Found</h2>
                    <p className="text-gray-500 mb-6">Sorry, we couldn't find any products matching your search.</p>
                    <button 
                        onClick={() => setCurrentView({ page: 'home' })}
                        className="bg-brand-blue hover:bg-brand-lightblue text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
                    >
                        &larr; Continue Shopping
                    </button>
                </div>
            )}
        </div>
    );
};

export default SearchResultsPage;
