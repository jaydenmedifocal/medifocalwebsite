import React, { useState, useEffect, useMemo } from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import ProductCard from './ProductCard';
import { viewToUrl } from '../utils/routing';
import { getAllProducts } from '../services/firestore';

interface Product {
  id?: string;
  itemNumber: string;
  name: string;
  imageUrl: string;
  displayPrice: string;
  originalPrice?: string;
  tag?: string;
  tagColor?: string;
  manufacturer?: string;
  category?: string;
  [key: string]: any;
}

const BundlesPage: React.FC<{ setCurrentView: (view: View) => void }> = ({ setCurrentView }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState<string>('featured');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const result = await getAllProducts(200);
                const allProducts = result.products || [];
                
                // Filter for bundles (products with "Bundle" in name or tag)
                const bundles = allProducts.filter((p: any) => 
                    (p.name && p.name.toLowerCase().includes('bundle')) ||
                    p.tag === 'BUNDLE' ||
                    p.category === 'Bundles'
                );
                
                setProducts(bundles);
            } catch (error) {
                console.error('Error loading bundles:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];
        
        if (sortOption === 'price-low') {
            filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOption === 'price-high') {
            filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortOption === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        return filtered;
    }, [products, sortOption]);

    const bundlesUrl = viewToUrl({ page: 'bundles' });

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title="Product Bundles | Complete Dental Equipment Packages | Medifocal"
                description="Shop complete dental equipment bundles and packages. Save money with bundled deals on autoclaves, dental chairs, imaging equipment, and more."
                url={`https://medifocal.com${bundlesUrl}`}
            />
            
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl p-8 mb-8 shadow-lg">
                    <h1 className="text-4xl font-extrabold mb-4">Product Bundles</h1>
                    <p className="text-lg opacity-90">Complete equipment packages and bundles at special prices. Everything you need in one convenient package.</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading bundles...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <p className="text-gray-700">
                                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> bundles
                            </p>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                            >
                                <option value="featured">Featured First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A to Z</option>
                            </select>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <p className="text-gray-600 text-lg">No bundles available at this time.</p>
                                <p className="text-gray-500 mt-2">Check back soon for new bundle deals!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id || product.itemNumber}
                                        {...product}
                                        setCurrentView={setCurrentView}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BundlesPage;



