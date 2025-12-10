
import React, { useState, useEffect, useMemo } from 'react';
import { getProductsByCategory } from '../services/firestore';
import ProductCard from './ProductCard';
import SEOHead from './SEOHead';
import { View } from '../App';
import { viewToUrl } from '../utils/routing';
import { getCategorySEO } from '../utils/categorySEO';

interface Product {
    id?: string;
    itemNumber: string;
    name: string;
    price: number;
    displayPrice?: string;
    imageUrl?: string;
    category?: string;
    parentCategory?: string;
    manufacturer?: string;
    [key: string]: any;
}

interface ProductListPageProps {
    categoryName: string;
    parentCategory: string;
    setCurrentView: (view: View) => void;
}

// --- Skeleton Components ---
const ProductCardSkeleton = () => (
    <div className="border border-gray-200 rounded-lg p-4 w-full animate-pulse">
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
);

const FilterSkeleton = () => (
    <div className="border-b py-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
    </div>
);

// --- UI Icons ---
const ChevronDownIcon = ({ open }: { open: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const XIcon = () => <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const NoResultsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l4 4m0-4l-4 4" /></svg>;

interface FilterGroupProps {
    title: string;
    options: { name: string; count: number }[];
    selected: string[];
    onFilterChange: (value: string) => void;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ title, options, selected, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const filteredOptions = useMemo(() => options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase())), [options, searchTerm]);

    if (options.length === 0) return null;

    return (
        <div className="border-b border-gray-200 py-6">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <span className="font-semibold text-gray-800 text-sm uppercase tracking-wider">{title}</span>
                <ChevronDownIcon open={isOpen} />
            </button>
            {isOpen && (
                <div className="mt-4 space-y-2 pr-2">
                    {options.length > 7 && (
                        <div className="relative mb-2">
                            <input type="text" placeholder={`Find ${title}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-blue focus:border-brand-blue transition" />
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><SearchIcon /></div>
                        </div>
                    )}
                    <div className="max-h-60 overflow-y-auto space-y-1">
                        {filteredOptions.map(option => (
                            <label key={option.name} className="flex items-center space-x-3 p-1 rounded-md hover:bg-gray-50 cursor-pointer group">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue focus:ring-offset-0 focus:ring-2" checked={selected.includes(option.name)} onChange={() => onFilterChange(option.name)} />
                                <span className="text-sm text-gray-700 group-hover:text-brand-blue flex-grow">{option.name}</span>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">{option.count}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductListPage: React.FC<ProductListPageProps> = ({ categoryName, parentCategory, setCurrentView }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({ manufacturer: [] });
    const [sortOption, setSortOption] = useState('relevance');

    useEffect(() => {
        const loadProducts = async () => {
            if (!categoryName) {
                console.warn('ProductListPage: categoryName is undefined');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                console.log('ProductListPage: Loading products for category:', categoryName, 'parentCategory:', parentCategory);
                const fetchedProducts = await getProductsByCategory(categoryName, 200);
                console.log('ProductListPage: Loaded products:', fetchedProducts.length);
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [categoryName, parentCategory]);

    const filterOptions = useMemo(() => {
        // Normalize manufacturer names to prevent duplicates (case-insensitive grouping)
        const manufacturerMap = new Map<string, { name: string; count: number }>();
        
        products.forEach(p => {
            if (p.manufacturer) {
                const normalized = p.manufacturer.toLowerCase();
                const existing = manufacturerMap.get(normalized);
                
                if (existing) {
                    existing.count += 1;
                    // Use the most common capitalization (keep the one with higher count)
                } else {
                    // Store with original capitalization, but key by lowercase
                    manufacturerMap.set(normalized, { name: p.manufacturer, count: 1 });
                }
            }
        });
        
        // Convert to array and sort by count
        return Array.from(manufacturerMap.values())
            .sort((a, b) => b.count - a.count);
    }, [products]);

    useEffect(() => {
        let tempProducts = [...products];
        if (activeFilters.manufacturer.length > 0) {
            // Normalize filter comparison (case-insensitive)
            const normalizedFilters = activeFilters.manufacturer.map(f => f.toLowerCase());
            tempProducts = tempProducts.filter(p => {
                if (!p.manufacturer) return false;
                return normalizedFilters.includes(p.manufacturer.toLowerCase());
            });
        }
        tempProducts.sort((a, b) => {
            switch (sortOption) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'name-asc': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });
        setFilteredProducts(tempProducts);
    }, [activeFilters, sortOption, products]);
    
    const handleFilterChange = (filterType: string, value: string) => {
        setActiveFilters(prev => {
            const current = prev[filterType] || [];
            const newFilters = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
            return { ...prev, [filterType]: newFilters };
        });
    };

    const clearAllFilters = () => setActiveFilters({ manufacturer: [] });

    const categoryUrl = viewToUrl({ page: 'productList', categoryName, parentCategory });
    const seoContent = getCategorySEO(categoryName);
    // Enhanced unique description with product count and category-specific details
    const categoryDescription = `Shop ${products.length} ${categoryName.toLowerCase()} products from ${parentCategory} at Medifocal. ${seoContent.description} Browse our complete ${categoryName.toLowerCase()} collection with fast shipping Australia-wide.`;
    
    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <SEOHead
                title={`${categoryName} | ${parentCategory} | Medifocal`}
                description={categoryDescription}
                keywords={seoContent.keywords}
                url={`https://medifocal.com${categoryUrl}`}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                {/* Enhanced Header */}
                <header className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-6 md:p-10 mb-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-24 -mt-24"></div>
                    <div className="relative">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">{categoryName}</h1>
                        <p className="text-lg md:text-xl opacity-95 mb-2">{products.length} premium products available</p>
                        {seoContent.introText && (
                            <p className="text-sm md:text-base opacity-90 max-w-3xl leading-relaxed break-words">{seoContent.introText}</p>
                        )}
                    </div>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start">
                    {/* Mobile-Optimized Sidebar */}
                    <aside className="lg:col-span-1 lg:sticky lg:top-28 order-2 lg:order-1">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                           <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                             <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                             <button onClick={clearAllFilters} className="text-sm font-medium text-brand-blue hover:underline">Clear All</button>
                           </div>
                            {loading ? <><FilterSkeleton /><FilterSkeleton /></> : <FilterGroup title="Manufacturer" options={filterOptions} selected={activeFilters.manufacturer} onFilterChange={(val) => handleFilterChange('manufacturer', val)} />}
                        </div>
                    </aside>
                    
                    {/* Mobile-Optimized Main Content */}
                    <main className="lg:col-span-3 order-1 lg:order-2">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => <ProductCard key={product.itemNumber} {...product} setCurrentView={setCurrentView} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6 bg-gray-50 rounded-xl border border-gray-200">
                                <NoResultsIcon />
                                <h2 className="mt-4 text-xl font-semibold text-gray-800">No Products Found</h2>
                                <p className="mt-2 text-gray-600">Try adjusting your filters or clearing them to see all products in this category.</p>
                                <button onClick={clearAllFilters} className="mt-6 bg-brand-blue text-white font-bold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition shadow-sm">Clear Filters</button>
                            </div>
                        )}

                        {/* SEO Content Section - Hidden visually but accessible to crawlers */}
                        <section className="mt-12 bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                About {categoryName}
                            </h2>
                            <div className="prose prose-lg max-w-none text-gray-700 space-y-3">
                                <p className="leading-relaxed">
                                    Explore our comprehensive selection of {categoryName.toLowerCase()} products from {parentCategory.toLowerCase()}. At Medifocal, we offer premium quality dental and medical equipment sourced from trusted manufacturers worldwide. With over 60 years of experience serving Australian healthcare professionals, we understand the critical importance of reliable, high-quality equipment in clinical settings.
                                </p>
                            <p>
                                Our {categoryName.toLowerCase()} collection includes products designed to meet the highest standards of quality, safety, and performance. Each item in our catalog has been carefully selected by our expert team to ensure it meets the specific needs of Australian healthcare professionals. We work directly with manufacturers to ensure competitive pricing and reliable supply chains, so you can focus on providing excellent patient care.
                            </p>
                            <p>
                                Whether you're looking for essential supplies or advanced equipment, our {categoryName.toLowerCase()} range provides reliable solutions for your practice. We understand the importance of having access to quality products that support excellent patient care. Our extensive inventory ensures you can find everything you need in one place, from basic consumables to sophisticated equipment.
                            </p>
                            <p>
                                All products in our {categoryName.toLowerCase()} category come with detailed specifications, customer reviews, and expert support. Our team is available to help you find the perfect products for your specific requirements, ensuring you make informed purchasing decisions. We offer comprehensive product information, including technical specifications, compatibility details, and usage guidelines to help you choose the right equipment for your practice.
                            </p>
                            <p>
                                When you purchase {categoryName.toLowerCase()} from Medifocal, you're investing in products backed by our commitment to quality and customer satisfaction. We provide comprehensive warranties, flexible financing options, and dedicated technical support to ensure your complete satisfaction. Our experienced team is always available to answer questions, provide product recommendations, and assist with any technical issues you may encounter.
                            </p>
                            <p>
                                We maintain strict quality control processes and work only with manufacturers who meet international standards for medical and dental equipment. This ensures that every product in our {categoryName.toLowerCase()} collection is safe, effective, and built to withstand the demands of daily clinical use. Our commitment to quality extends beyond the initial purchase, with ongoing support and maintenance services to keep your equipment operating at peak performance.
                            </p>
                            </div>
                        </section>

                        {/* Internal links for SEO - at bottom, visible but subtle */}
                        <nav className="mt-12 pt-6 border-t border-gray-200" aria-label="Related Categories">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Browse Related Categories</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                                <a href="/category/cameras" className="text-gray-600 hover:text-brand-blue hover:underline">Cameras</a>
                                <span className="text-gray-300">•</span>
                                <a href="/category/dental-education-models" className="text-gray-600 hover:text-brand-blue hover:underline">Dental Education Models</a>
                                <span className="text-gray-300">•</span>
                                <a href="/category/diamond-burs" className="text-gray-600 hover:text-brand-blue hover:underline">Diamond Burs</a>
                                <span className="text-gray-300">•</span>
                                <a href="/category/molar-bands" className="text-gray-600 hover:text-brand-blue hover:underline">Molar Bands</a>
                                <span className="text-gray-300">•</span>
                                <a href="/category/pouches" className="text-gray-600 hover:text-brand-blue hover:underline">Pouches</a>
                                <span className="text-gray-300">•</span>
                                <a href="/category/restoratives" className="text-gray-600 hover:text-brand-blue hover:underline">Restoratives</a>
                                <span className="text-gray-300">•</span>
                                <a href="/category/scaler-tips" className="text-gray-600 hover:text-brand-blue hover:underline">Scaler Tips</a>
                                <span className="text-gray-300">•</span>
                                <a href="/category/surgical" className="text-gray-600 hover:text-brand-blue hover:underline">Surgical</a>
                                <span className="text-gray-300">•</span>
                                <a href="/" className="text-gray-600 hover:text-brand-blue hover:underline">Home</a>
                                <span className="text-gray-300">•</span>
                                <a href="/about" className="text-gray-600 hover:text-brand-blue hover:underline">About</a>
                                <span className="text-gray-300">•</span>
                                <a href="/contact" className="text-gray-600 hover:text-brand-blue hover:underline">Contact</a>
                            </div>
                        </nav>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
