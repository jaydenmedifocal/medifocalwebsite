import React, { useState, useEffect, useMemo } from 'react';
import { View } from '../App';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
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

const AllPromotionProductsPage: React.FC<{ setCurrentView: (view: View) => void }> = ({ setCurrentView }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState<string>('featured');
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                // Get all products and filter for promotions (tagged or featured)
                const result = await getAllProducts(200);
                const allProducts = result.products || [];
                
                // Filter for promotion products (has tag, is featured, or has specialPrice)
                const promotionProducts = allProducts.filter((p: any) => 
                    p.tag || p.featured || p.specialPrice || p.isOnClearance === false && (p.originalPrice || p.specialPrice)
                );
                
                setProducts(promotionProducts);
            } catch (error) {
                console.error('Error loading promotion products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];
        
        // Apply filters
        if (activeFilters.category && activeFilters.category.length > 0) {
            filtered = filtered.filter(p => activeFilters.category.includes(p.category || ''));
        }
        if (activeFilters.manufacturer && activeFilters.manufacturer.length > 0) {
            filtered = filtered.filter(p => activeFilters.manufacturer.includes(p.manufacturer || ''));
        }
        
        // Apply sorting
        if (sortOption === 'price-low') {
            filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortOption === 'price-high') {
            filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortOption === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        return filtered;
    }, [products, activeFilters, sortOption]);

    const promotionUrl = viewToUrl({ page: 'allPromotionProducts' });

    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title="All Promotion Products | Special Offers & Discounts | Medifocal"
                description="Browse all promotion products at Medifocal. Special offers, discounts, and featured products on dental equipment, supplies, and more. Limited time deals."
                url={`https://medifocal.com${promotionUrl}`}
            />
            <Breadcrumbs items={[
                { label: 'Home', view: { page: 'home' } },
                { label: 'Promotions', view: { page: 'promotions' } },
                { label: 'All Promotion Products' }
            ]} setCurrentView={setCurrentView} />
            
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-brand-blue to-blue-700 text-white rounded-xl p-8 mb-8 shadow-lg">
                    <h1 className="text-4xl font-extrabold mb-4">All Promotion Products</h1>
                    <p className="text-lg opacity-90">Discover our latest special offers, featured products, and exclusive discounts on premium dental equipment.</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading promotion products...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <p className="text-gray-700">
                                Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> promotion products
                            </p>
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            >
                                <option value="featured">Featured First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A to Z</option>
                            </select>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <p className="text-gray-600 text-lg">No promotion products found.</p>
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

export default AllPromotionProductsPage;

