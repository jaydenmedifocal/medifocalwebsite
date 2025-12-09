
import React, { useState, useEffect } from 'react';
import { getFeaturedProducts } from '../services/firestore';
import ProductCard from './ProductCard';
import { View } from '../App';

interface FeaturedProductsProps {
    setCurrentView: (view: View) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ setCurrentView }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const featured = await getFeaturedProducts(4);
                setProducts(featured);
            } catch (error) {
                console.error('Error loading featured products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Supplier Specials & Offers</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Discover exclusive deals from top dental brands.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                                <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
                                <div className="mt-4 h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="mt-4 h-10 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            {products.map((product) => (
                                <ProductCard key={product.id || product.itemNumber} {...product} setCurrentView={setCurrentView} />
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <button 
                                onClick={() => setCurrentView({ page: 'offers' })}
                                className="bg-brand-blue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                View All Offers
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800">No Offers Available</h3>
                        <p className="text-gray-500 mt-2">Please check back later for special deals and promotions.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;
