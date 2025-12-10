import React, { useState, useEffect, useMemo } from 'react';
import { getAllProducts } from '../services/firestore';
import ProductCard from './ProductCard';
import SEOHead from './SEOHead';
import { View } from '../App';
import { viewToUrl } from '../utils/routing';

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
    procedure?: string[];
    tag?: string;
    [key: string]: any;
}

interface NewProductsPageProps {
    setCurrentView: (view: View) => void;
}

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ChevronDownIcon = ({ open }: { open: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

interface FilterOption {
    name: string;
    count: number;
}
interface FilterGroupProps {
    title: string;
    options: FilterOption[];
    selected: string[];
    onFilterChange: (value: string) => void;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ title, options, selected, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => 
        options.filter(opt => opt.name.toLowerCase().includes(searchTerm.toLowerCase()))
    , [options, searchTerm]);

    const displayedOptions = showAll ? filteredOptions : filteredOptions.slice(0, 5);
    const canShowMore = filteredOptions.length > 5;

    if (options.length === 0) return null;

    return (
        <div className="border-b border-gray-200 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center py-3 px-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <span className="font-bold text-gray-800 text-sm">{title}</span>
                <ChevronDownIcon open={isOpen} />
            </button>
            
            {isOpen && (
                <div className="p-4 bg-white">
                    {options.length > 5 && (
                        <div className="relative mb-3">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:border-brand-blue focus:outline-none"
                            />
                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {displayedOptions.map(option => (
                            <label key={option.name} className={`flex items-center text-sm cursor-pointer hover:text-brand-blue ${selected.includes(option.name) ? 'font-semibold' : ''}`}>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                    checked={selected.includes(option.name)}
                                    onChange={() => onFilterChange(option.name)}
                                />
                                <span className="ml-2 text-gray-700">{option.name}</span>
                                <span className="ml-auto text-gray-500 text-xs">({option.count})</span>
                            </label>
                        ))}
                    </div>
                    
                    {canShowMore && (
                        <button 
                            onClick={() => setShowAll(!showAll)} 
                            className="text-xs text-brand-blue font-semibold hover:underline mt-3"
                        >
                            {showAll ? 'Show less' : `Show more (${filteredOptions.length - 5})`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const NewProductsPage: React.FC<NewProductsPageProps> = ({ setCurrentView }) => {
    const [newProducts, setNewProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
        manufacturer: [],
        category: [],
        parentCategory: [],
        procedure: [],
    });
    const [sortOption, setSortOption] = useState('relevance');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const result = await getAllProducts(100);
                const allProducts = result.products || [];
                let newProductsList = allProducts.filter((p: Product) => p.tag === 'NEW' || p.tag === 'New');
                if (newProductsList.length === 0) {
                    newProductsList = allProducts.slice(0, 50);
                }
                setNewProducts(newProductsList);
                setFilteredProducts(newProductsList);
            } catch (error) {
                console.error('Error loading new products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const filterOptions = useMemo(() => {
      const createOptions = (key: keyof Product, isArray = false, normalizeCase: boolean = false) => {
        const allValues = isArray
            ? newProducts.flatMap(p => (p[key] as string[] | undefined) || [])
            : newProducts.map(p => p[key]).filter(Boolean) as string[];
        
        if (normalizeCase && key === 'manufacturer') {
            // Normalize manufacturer names (case-insensitive grouping)
            const manufacturerMap = new Map<string, { name: string; count: number }>();
            allValues.forEach(val => {
                const normalized = val.toLowerCase();
                const existing = manufacturerMap.get(normalized);
                if (existing) {
                    existing.count += 1;
                } else {
                    manufacturerMap.set(normalized, { name: val, count: 1 });
                }
            });
            return Array.from(manufacturerMap.values()).sort((a, b) => b.count - a.count);
        } else {
            const counts = allValues.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            return Object.entries(counts)
                .map(([name, count]) => ({ name, count }))
                .sort((a,b) => b.count - a.count);
        }
    };

        return {
            manufacturers: createOptions('manufacturer', false, true),
            categories: createOptions('category'),
            parentCategories: createOptions('parentCategory'),
            procedures: createOptions('procedure', true),
        };
    }, [newProducts]);

    useEffect(() => {
        let products = [...newProducts];

        if (activeFilters.manufacturer.length > 0) {
            const normalizedFilters = activeFilters.manufacturer.map(f => f.toLowerCase());
            products = products.filter(p => p.manufacturer && normalizedFilters.includes(p.manufacturer.toLowerCase()));
        }
        if (activeFilters.category.length > 0) {
            products = products.filter(p => p.category && activeFilters.category.includes(p.category));
        }
        if (activeFilters.parentCategory.length > 0) {
            products = products.filter(p => p.parentCategory && activeFilters.parentCategory.includes(p.parentCategory));
        }
        if (activeFilters.procedure.length > 0) {
            products = products.filter(p => p.procedure && p.procedure.some(proc => activeFilters.procedure.includes(proc)));
        }
        
        switch (sortOption) {
            case 'price-asc': products.sort((a, b) => a.price - b.price); break;
            case 'price-desc': products.sort((a, b) => b.price - a.price); break;
            case 'name-asc': products.sort((a, b) => a.name.localeCompare(b.name)); break;
        }

        setFilteredProducts(products);
    }, [activeFilters, sortOption, newProducts]);
    
    const handleFilterChange = (filterType: string, value: string) => {
        setActiveFilters(prev => {
            const currentFilters = prev[filterType] || [];
            const newFilters = currentFilters.includes(value)
                ? currentFilters.filter(item => item !== value)
                : [...currentFilters, value];
            return { ...prev, [filterType]: newFilters };
        });
    };

    const clearAllFilters = () => {
        setActiveFilters({
            manufacturer: [],
            category: [],
            parentCategory: [],
            procedure: [],
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-gray-500 mb-6">
                    <button onClick={() => setCurrentView({ page: 'home' })} className="hover:text-brand-blue">
                        <HomeIcon />
                    </button>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-gray-900">New Products</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
                                <h3 className="font-bold text-gray-800 text-lg">Filters</h3>
                                {Object.values(activeFilters).some(f => f.length > 0) &&
                                    <button 
                                        onClick={clearAllFilters}
                                        className="text-xs font-semibold text-brand-blue hover:underline"
                                    >
                                        Clear All
                                    </button>
                                }
                            </div>
                            <FilterGroup title="Manufacturer" options={filterOptions.manufacturers} selected={activeFilters.manufacturer} onFilterChange={(val) => handleFilterChange('manufacturer', val)} />
                            <FilterGroup title="Category" options={filterOptions.categories} selected={activeFilters.category} onFilterChange={(val) => handleFilterChange('category', val)} />
                            <FilterGroup title="Parent Category" options={filterOptions.parentCategories} selected={activeFilters.parentCategory} onFilterChange={(val) => handleFilterChange('parentCategory', val)} />
                            <FilterGroup title="Procedure" options={filterOptions.procedures} selected={activeFilters.procedure} onFilterChange={(val) => handleFilterChange('procedure', val)} />
                        </div>
                    </aside>
                    
                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        {/* Banner */}
                        <div 
                            className="bg-cover bg-center rounded-lg mb-8 p-12 text-center relative"
                            style={{backgroundImage: "url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070&auto=format&fit=crop')"}}
                        >
                            <div className="absolute inset-0 bg-white opacity-50 rounded-lg"></div>
                            <div className="relative">
                                <h1 className="text-4xl font-extrabold drop-shadow-md text-gray-900">FRESH ARRIVALS</h1>
                                <p className="text-lg mt-2 drop-shadow-sm text-gray-800">Check out the latest innovations in dental supplies.</p>
                                <button className="mt-6 bg-brand-blue text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105">
                                    Explore Now
                                </button>
                            </div>
                        </div>

                        {/* Controls */}

                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-blue border-t-transparent"></div>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                     <div className="transform hover:-translate-y-1 transition-transform duration-300">
                                        <ProductCard key={product.id || product.itemNumber} {...product} setCurrentView={setCurrentView} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">No New Products Found</h2>
                                <p className="text-gray-500">Please check back later for new items.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default NewProductsPage;
