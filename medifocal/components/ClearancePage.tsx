import React, { useState, useEffect, useMemo } from 'react';
import { getHandpiecesProducts, getClearanceProducts } from '../services/firestore';
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
    speed?: string;
    grit?: string;
    quantity?: string;
    viscosity?: string;
    material?: string;
    shape?: string;
    [key: string]: any;
}

interface ClearancePageProps {
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

const ClearancePage: React.FC<ClearancePageProps> = ({ setCurrentView }) => {
    const [clearanceProducts, setClearanceProducts] = useState<Product[]>([]);
    const [handpiecesProducts, setHandpiecesProducts] = useState<Product[]>([]);
    const [showHandpieces, setShowHandpieces] = useState(true); // Default to showing handpieces
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
                // Load both handpieces and clearance products
                const [handpieces, clearance] = await Promise.all([
                    getHandpiecesProducts(100),
                    getClearanceProducts(100)
                ]);
                setHandpiecesProducts(handpieces);
                setClearanceProducts(clearance);
                // Default to showing handpieces
                setFilteredProducts(handpieces);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const currentProducts = showHandpieces ? handpiecesProducts : clearanceProducts;

    const filterOptions = useMemo(() => {
        const createOptions = (key: keyof Product, normalizeCase: boolean = false) => {
            const values = currentProducts.map(p => p[key]).filter(Boolean) as string[];
            
            if (normalizeCase && key === 'manufacturer') {
                // Normalize manufacturer names (case-insensitive grouping)
                const manufacturerMap = new Map<string, { name: string; count: number }>();
                values.forEach(val => {
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
                const counts = values.reduce((acc, val) => {
                    acc[val] = (acc[val] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
                return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
            }
        };

        return {
            manufacturers: createOptions('manufacturer', true),
            categories: createOptions('category'),
            parentCategories: createOptions('parentCategory'),
            procedures: createOptions('procedure'),
        };
    }, [currentProducts]);

    useEffect(() => {
        let products = [...currentProducts];

        if (activeFilters.manufacturer.length > 0) {
            const normalizedFilters = activeFilters.manufacturer.map(f => f.toLowerCase());
            products = products.filter(p => p.manufacturer && normalizedFilters.includes(p.manufacturer.toLowerCase()));
        }
        if (activeFilters.category.length > 0) {
            products = products.filter(p => activeFilters.category.includes(p.category));
        }
        
        switch (sortOption) {
            case 'price-asc': products.sort((a, b) => a.price - b.price); break;
            case 'price-desc': products.sort((a, b) => b.price - a.price); break;
            case 'name-asc': products.sort((a, b) => a.name.localeCompare(b.name)); break;
        }

        setFilteredProducts(products);
    }, [activeFilters, sortOption, currentProducts]);
    
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

    const clearanceUrl = viewToUrl({ page: 'clearance' });
    const clearanceDescription = `Shop clearance dental equipment at Medifocal. Save up to 70% on premium dental supplies, autoclaves, chairs, and more. Limited stock available.`;
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <SEOHead
                title="Clearance Sale | Up to 70% Off Dental Equipment | Medifocal"
                description={clearanceDescription}
                url={`https://medifocal.com${clearanceUrl}`}
            />
            <div className="container mx-auto px-4 py-6">

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
                        </div>
                    </aside>
                    
                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        {/* Banner */}
                        <div 
                            className="bg-cover bg-center rounded-lg mb-8 p-12 text-center relative"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='400'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23006eb3;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23003366;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='400' fill='url(%23grad)'/%3E%3C/svg%3E")`,
                                backgroundColor: '#006eb3'
                            }}
                        >
                            <div className="absolute inset-0 bg-white opacity-50 rounded-lg"></div>
                            <div className="relative">
                                {showHandpieces ? (
                                    <>
                                        <h1 className="text-4xl font-extrabold drop-shadow-md text-gray-900">ALL HANDPIECES</h1>
                                        <p className="text-lg mt-2 drop-shadow-sm text-gray-800">20% OFF - Limited Time Offer!</p>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-4xl font-extrabold drop-shadow-md text-gray-900">HUGE CLEARANCE</h1>
                                        <p className="text-lg mt-2 drop-shadow-sm text-gray-800">Up to 70% off on selected items!</p>
                                    </>
                                )}
                                <div className="mt-6 flex gap-3 justify-center">
                                    <button 
                                        onClick={() => {
                                            setShowHandpieces(true);
                                            setActiveFilters({
                                                manufacturer: [],
                                                category: [],
                                                parentCategory: [],
                                                procedure: [],
                                            });
                                        }}
                                        className={`font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 ${
                                            showHandpieces 
                                                ? 'bg-brand-blue text-white hover:bg-brand-blue-700' 
                                                : 'bg-white text-brand-blue border-2 border-brand-blue hover:bg-gray-50'
                                        }`}
                                    >
                                        Handpieces (20% Off)
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowHandpieces(false);
                                            setActiveFilters({
                                                manufacturer: [],
                                                category: [],
                                                parentCategory: [],
                                                procedure: [],
                                            });
                                        }}
                                        className={`font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 ${
                                            !showHandpieces 
                                                ? 'bg-brand-blue text-white hover:bg-brand-blue-700' 
                                                : 'bg-white text-brand-blue border-2 border-brand-blue hover:bg-gray-50'
                                        }`}
                                    >
                                        Clearance Items
                                    </button>
                                </div>
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
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Matching Products</h2>
                                <p className="text-gray-500">Your filter combination returned no results. Try clearing some filters.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ClearancePage;
