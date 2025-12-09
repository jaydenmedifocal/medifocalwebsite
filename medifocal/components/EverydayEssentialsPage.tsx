
import React, { useState, useEffect, useMemo } from 'react';
import { allProducts, Product } from '../data/productData';
import ProductCard from './ProductCard';
import { View } from '../App';

const ESSENTIAL_CATEGORIES = ['Gloves', 'Masks', 'Bibs', 'Disposables', 'Steri Room', 'Barrier Products', 'Wipes', 'Infection Control'];
const QUICK_LINKS = ['All', ...ESSENTIAL_CATEGORIES.slice(0, 7)];

interface EverydayEssentialsPageProps {
    setCurrentView: (view: View) => void;
    category?: string;
}

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const ChevronDownIcon = ({ open }: { open: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-1 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const XIcon = () => <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

interface FilterOption { name: string; count: number; }
interface FilterGroupProps {
    title: string;
    options: FilterOption[];
    selected: string[];
    onFilterChange: (value: string) => void;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ title, options, selected, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const displayedOptions = showAll ? options : options.slice(0, 5);

    if (options.length === 0) return null;

    return (
        <div className="border-b py-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center font-semibold text-gray-700">
                <span>{title}</span>
                <span className="text-gray-400">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
                <div className="mt-4 space-y-2 pr-2 max-h-60 overflow-y-auto">
                    {displayedOptions.map(option => (
                        <label key={option.name} className="flex items-center text-sm cursor-pointer group">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue" checked={selected.includes(option.name)} onChange={() => onFilterChange(option.name)} />
                            <span className="ml-3 text-gray-600 group-hover:text-brand-blue">{option.name}</span>
                            <span className="ml-auto text-gray-500 text-xs">({option.count})</span>
                        </label>
                    ))}
                    {options.length > 5 && (
                        <button onClick={() => setShowAll(!showAll)} className="text-sm text-brand-blue font-semibold hover:underline mt-2">
                            {showAll ? 'Show less' : `Show more (${options.length - 5})`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


const EverydayEssentialsPage: React.FC<EverydayEssentialsPageProps> = ({ setCurrentView, category }) => {
    const essentialProducts = useMemo(() => allProducts.filter(p => ESSENTIAL_CATEGORIES.includes(p.category) || ESSENTIAL_CATEGORIES.includes(p.parentCategory || '')), []);
    
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(essentialProducts);
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({ manufacturer: [], parentCategory: [], category: [] });
    const [sortOption, setSortOption] = useState('relevance');
    const [viewMode, setViewMode] = useState('grid');
    const [activeSubCategory, setActiveSubCategory] = useState(category || 'All');
    const [itemsToShow, setItemsToShow] = useState(12);

    useEffect(() => {
        setActiveSubCategory(category || 'All');
    }, [category]);

    const filterOptions = useMemo(() => {
        const baseProducts = activeSubCategory === 'All' 
            ? essentialProducts 
            : essentialProducts.filter(p => p.category === activeSubCategory || p.parentCategory === activeSubCategory);

        const createOptions = (key: keyof Product) => {
            const values = baseProducts.map(p => p[key]).filter(Boolean) as string[];
            const counts = values.reduce((acc, val) => {
                acc[val] = (acc[val] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
        };
        return {
            manufacturer: createOptions('manufacturer'),
            parentCategory: createOptions('parentCategory'),
            category: createOptions('category')
        };
    }, [essentialProducts, activeSubCategory]);

    useEffect(() => {
        let products = [...essentialProducts];

        if (activeSubCategory !== 'All') {
            products = products.filter(p => p.category === activeSubCategory || p.parentCategory === activeSubCategory);
        }

        if (activeFilters.manufacturer.length > 0) {
            products = products.filter(p => activeFilters.manufacturer.includes(p.manufacturer));
        }
        if (activeFilters.parentCategory.length > 0) {
            products = products.filter(p => p.parentCategory && activeFilters.parentCategory.includes(p.parentCategory));
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
    }, [activeFilters, sortOption, essentialProducts, activeSubCategory]);

    const handleFilterChange = (filterType: string, value: string) => {
        setActiveFilters(prev => {
            const currentFilters = prev[filterType] || [];
            const newFilters = currentFilters.includes(value) ? currentFilters.filter(item => item !== value) : [...currentFilters, value];
            return { ...prev, [filterType]: newFilters };
        });
    };
    
    const handleSubCategoryClick = (category: string) => {
        setActiveSubCategory(category);
        setActiveFilters({ manufacturer: [], parentCategory: [], category: [] }); // Reset filters
        setItemsToShow(12); // Reset pagination
    };

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
                    <button onClick={() => setCurrentView({ page: 'home' })} className="flex items-center text-gray-400 hover:text-brand-blue">
                        <HomeIcon /><span className="ml-2">Home</span>
                    </button>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="font-medium text-gray-700">Everyday Essentials</span>
                </nav>

                <div className="relative rounded-lg overflow-hidden mb-8 h-64 bg-gray-300">
                    <img src="https://images.unsplash.com/photo-1583344446950-535b6424a1a5?q=80&w=2574&auto=format=fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Dental professional" className="absolute w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent p-8 flex flex-col justify-center">
                        <img src="https://i.imgur.com/L5k6Y1U.png" alt="Seal of Excellence" className="h-20 w-20 mb-2"/>
                        <h1 className="text-4xl font-extrabold text-gray-800">Everyday <span className="text-brand-blue">Essentials</span></h1>
                    </div>
                </div>

                <div className="border-b bg-white rounded-t-lg p-4">
                    <div className="flex items-center space-x-6 overflow-x-auto">
                        {QUICK_LINKS.map(link => (
                            <button key={link} onClick={() => handleSubCategoryClick(link)} className={`py-2 px-3 rounded-md text-sm font-semibold whitespace-nowrap ${activeSubCategory === link ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {link}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
                    <aside className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-40">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-3">Filter By</h3>
                            <FilterGroup title="Manufacturer" options={filterOptions.manufacturer} selected={activeFilters.manufacturer} onFilterChange={val => handleFilterChange('manufacturer', val)} />
                            <FilterGroup title="Parent Category" options={filterOptions.parentCategory} selected={activeFilters.parentCategory} onFilterChange={val => handleFilterChange('parentCategory', val)} />
                            <FilterGroup title="Category" options={filterOptions.category} selected={activeFilters.category} onFilterChange={val => handleFilterChange('category', val)} />
                        </div>
                    </aside>
                    
                    <main className="lg:col-span-3">
                        <div className="bg-white p-3 rounded-lg shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
                             <div className="flex items-center space-x-2">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}><GridIcon /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}><ListIcon /></button>
                            </div>
                            <p className="font-semibold text-gray-700 text-sm">Showing {Math.min(itemsToShow, filteredProducts.length)} of {filteredProducts.length} products</p>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="sort-by" className="text-sm font-medium text-gray-700">Sort</label>
                                <select id="sort-by" className="border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue text-sm" value={sortOption} onChange={e => setSortOption(e.target.value)}>
                                    <option value="relevance">Relevance</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="name-asc">Name: A-Z</option>
                                </select>
                            </div>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <>
                                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                    {filteredProducts.slice(0, itemsToShow).map((product) => (
                                        <ProductCard key={product.itemNumber || product.name} {...product} setCurrentView={setCurrentView} />
                                    ))}
                                </div>
                                {itemsToShow < filteredProducts.length && (
                                     <div className="text-center mt-10">
                                        <button onClick={() => setItemsToShow(prev => prev + 12)} className="bg-brand-blue text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition">
                                            Show More Products
                                        </button>
                                    </div>
                                )}
                           </>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                                <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Products Found</h2>
                                <p className="text-gray-500 mb-6">Try adjusting your filters.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default EverydayEssentialsPage;
