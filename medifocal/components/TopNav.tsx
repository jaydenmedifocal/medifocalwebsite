
import React, { useState, useEffect, useRef } from 'react';
import { View } from '../App';
import { getCategories, getAllProducts, searchProducts } from '../services/firestore';
import { useCart } from '../contexts/CartContext';
import { useScrollContext } from '../contexts/ScrollContext';
import AdminLoginModal from './AdminLoginModal';

// Categories will be loaded from Firebase

interface NavDropdownItem { name: string; view: View; }
interface PrimaryNavItem {
  name: string;
  isMegaMenu?: boolean;
  megaMenuType?: 'categories' | 'promotions';
  dropdown?: NavDropdownItem[];
  isHighlight?: boolean;
  isAdmin?: boolean;
  view?: View;
}

const promotionsLinks: NavDropdownItem[] = [
    { name: 'All Promotion Products', view: { page: 'allPromotionProducts' } },
    { name: 'Supplier Specials and Offers', view: { page: 'supplierSpecials' } },
    { name: 'Bundles', view: { page: 'bundles' } },
    { name: 'Catalogues', view: { page: 'catalogues' } }
];

const primaryNavData: PrimaryNavItem[] = [
    { name: 'Categories', isMegaMenu: true, megaMenuType: 'categories' },
    { name: 'Promotions', isMegaMenu: true, megaMenuType: 'promotions' },
    { name: 'Clearance', view: { page: 'clearance' }, isHighlight: true },
    { name: 'Buying Guides', view: { page: 'buyingGuides' } },
    { name: 'About', view: { page: 'about' } },
    { name: 'Contact', view: { page: 'contact' } },
    { name: 'Blog', view: { page: 'blog' } },
    { name: 'Admin', view: { page: 'admin' }, isAdmin: true },
];

// Icons
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ChevronDownIcon = ({ open, className }: { open?: boolean, className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''} ${className || ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const AccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const useOnClickOutside = (ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) { return; }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

interface TopNavProps { 
  setCurrentView: (view: View) => void; 
  handleSearch: (query: string) => void;
}

const TopNav: React.FC<TopNavProps> = ({ setCurrentView, handleSearch }) => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
    const [mobileSubAccordion, setMobileSubAccordion] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<{ type: string; name: string }[]>([]);
    const { getItemCount } = useCart();
    
    const [activeMegaMenu, setActiveMegaMenu] = useState<PrimaryNavItem['megaMenuType'] | null>(null);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [activeMegaMenuCategory, setActiveMegaMenuCategory] = useState<string>('');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [medifocalCategories, setMedifocalCategories] = useState<Record<string, any[]>>({});
    const [categoryNames, setCategoryNames] = useState<string[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { isHeaderVisible } = useScrollContext();

    const searchRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuTimerRef = useRef<number | null>(null);
    const focusStyles = "focus:outline-none active:scale-95 transition-transform duration-150";

    // Focus search input when search opens
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    useOnClickOutside(searchRef, () => setSuggestions([]));
    useOnClickOutside(navRef, () => {
      setActiveMegaMenu(null);
      setActiveDropdown(null);
    });
    
    // Load categories from Firebase with retry logic and caching
    useEffect(() => {
        const loadCategories = async (retryCount = 0) => {
            try {
                setCategoriesLoading(true);
                setCategoriesError(null);
                
                // Use cache by default for faster loading
                const categories = await getCategories(true);
                
                // Check if categories were actually loaded
                if (Object.keys(categories).length === 0) {
                    if (retryCount < 2) {
                        // Retry without cache if first attempt fails
                        setTimeout(() => loadCategories(retryCount + 1), 500 * (retryCount + 1));
                        return;
                    } else {
                        setCategoriesError('No categories found. Please check Firestore data.');
                        setCategoriesLoading(false);
                        return;
                    }
                }
                
                setMedifocalCategories(categories);
                const names = Object.keys(categories);
                setCategoryNames(names);
                
                if (names.length > 0 && !activeMegaMenuCategory) {
                    setActiveMegaMenuCategory(names[0]);
                }
                setCategoriesLoading(false);
            } catch (error: any) {
                console.error('Error loading categories:', error);
                setCategoriesError(error.message || 'Failed to load categories');
                
                // Retry up to 2 times with shorter backoff
                if (retryCount < 2) {
                    setTimeout(() => loadCategories(retryCount + 1), 500 * (retryCount + 1));
                } else {
                    setCategoriesLoading(false);
                }
            }
        };
        loadCategories();
    }, []);
    
    // Update active category when mega menu opens
    useEffect(() => {
        if (activeMegaMenu === 'categories' && categoryNames.length > 0 && !activeMegaMenuCategory) {
            setActiveMegaMenuCategory(categoryNames[0]);
        }
    }, [activeMegaMenu, categoryNames, activeMegaMenuCategory]);
    
    // Load search suggestions
    useEffect(() => {
        if (searchQuery.length > 1) {
            const loadSuggestions = async () => {
                try {
                    const products = await searchProducts(searchQuery, 8);
                    const productSuggestions = products.map(p => ({ type: 'Product', name: p.name }));
                    setSuggestions(productSuggestions);
                } catch (error) {
                    console.error('Error loading suggestions:', error);
                }
            };
            loadSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);
    
    const handleMenuEnter = (item: PrimaryNavItem) => {
        if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
        // Only open menus for items that have menus - don't interfere with simple links
        if (item.isMegaMenu) {
            setActiveDropdown(null);
            setActiveMegaMenu(item.megaMenuType || null);
            if (item.megaMenuType === 'categories' && categoryNames.length > 0 && !activeMegaMenuCategory) {
                setActiveMegaMenuCategory(categoryNames[0]);
            }
        } else if (item.dropdown) {
            setActiveMegaMenu(null);
            setActiveDropdown(item.name);
        } else if (item.view) {
            // For simple links like Blog, About, Contact - don't open any menu, just allow click
            setActiveMegaMenu(null);
            setActiveDropdown(null);
        }
    };

    const handleMenuLeave = () => {
        menuTimerRef.current = window.setTimeout(() => {
            setActiveMegaMenu(null);
            setActiveDropdown(null);
        }, 300);
    };

    const handleMenuEnterDropdown = () => {
        if (menuTimerRef.current) {
            clearTimeout(menuTimerRef.current);
            menuTimerRef.current = null;
        }
    };

    const handleNav = (view: View) => {
        setCurrentView(view);
        setMobileMenuOpen(false);
        setActiveMegaMenu(null);
        setActiveDropdown(null);
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        // Suggestions are handled by useEffect above
    };

    const executeSearch = (query: string) => {
        if (query.trim()) {
            handleSearch(query.trim());
            setSearchQuery('');
            setSuggestions([]);
            setMobileMenuOpen(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeSearch(searchQuery);
    };


    return (
        <>
        <header 
            className={`bg-white shadow-sm fixed top-0 left-0 right-0 z-50 font-display transition-transform duration-300 relative ${
                isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
            }`}
        >
            {/* Promotional Banner - AWAY Style */}
            <div className="bg-slate-900 text-white text-sm">
                <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button className="hover:opacity-70 transition-opacity" aria-label="Previous">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="flex-1 text-center">Free Delivery Store Wide. Shop now →</span>
                        <button className="hover:opacity-70 transition-opacity" aria-label="Next">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <div className="hidden lg:flex items-center gap-6 ml-8">
                        <button onClick={() => handleNav({ page: 'equipmentServices' })} className="hover:opacity-70 transition-opacity text-sm">Help</button>
                        <button onClick={() => handleNav({ page: 'contact' })} className="hover:opacity-70 transition-opacity text-sm">Stores</button>
                    </div>
                </div>
            </div>

            {/* Main Navigation Bar - Desktop AWAY Style, Mobile Original */}
            <div className="bg-white border-b border-gray-200">
                {!isSearchOpen ? (
                <div className="container mx-auto px-4 h-14 lg:h-16 flex items-center justify-between gap-4 relative">
                    {/* Mobile: Left - Menu Button, Desktop: Left - Logo */}
                    <div className="flex items-center gap-4 flex-shrink-0 z-10">
                        <button className={`lg:hidden rounded-sm ${focusStyles}`} onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
                            <MenuIcon />
                        </button>
                        <button 
                            onClick={() => handleNav({ page: 'home' })}
                            className={`flex-shrink-0 rounded-sm ${focusStyles} lg:block hidden`}
                        >
                            <img 
                                src="https://firebasestorage.googleapis.com/v0/b/medifocal.firebasestorage.app/o/MediFocal_Logo?alt=media&token=bac54fce-346e-47ec-9699-1a7533e9aeef" 
                                alt="Medifocal Logo" 
                                className="h-8 lg:h-10 w-auto" 
                                style={{ aspectRatio: '4 / 1' }}
                                width="144"
                                height="36"
                                loading="eager"
                            />
                        </button>
                    </div>
                    
                    {/* Mobile: Centered Logo */}
                    <button 
                        onClick={() => handleNav({ page: 'home' })}
                        className={`flex-shrink-0 rounded-sm ${focusStyles} lg:hidden absolute left-1/2 -translate-x-1/2 z-20 flex items-center h-full`}
                    >
                        <img 
                            src="https://firebasestorage.googleapis.com/v0/b/medifocal.firebasestorage.app/o/MediFocal_Logo?alt=media&token=bac54fce-346e-47ec-9699-1a7533e9aeef" 
                            alt="Medifocal Logo" 
                            className="h-8 w-auto" 
                            style={{ aspectRatio: '4 / 1' }}
                            width="128"
                            height="32"
                            loading="eager"
                        />
                    </button>

                    {/* Center: Navigation Links */}
                    <nav className="hidden lg:flex items-center justify-center gap-8 flex-1">
                        {primaryNavData.map(item => (
                            <div 
                                key={item.name}
                                className="relative"
                                onMouseEnter={() => item.isMegaMenu && handleMenuEnter(item)}
                                onMouseLeave={() => item.isMegaMenu && handleMenuLeave()}
                            >
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        
                                        if (item.isAdmin) {
                                            setShowAdminLogin(true);
                                            return;
                                        }
                                        
                                        if (item.view && !item.isMegaMenu && !item.dropdown) {
                                            handleNav(item.view);
                                        } else if (item.view) {
                                            handleNav(item.view);
                                        }
                                        
                                        if (item.isMegaMenu) {
                                            handleMenuEnter(item);
                                        }
                                    }}
                                    className={`text-sm lg:text-base font-semibold text-gray-900 hover:text-brand-blue transition-colors flex items-center gap-1 ${focusStyles} ${
                                        item.isHighlight ? 'text-green-700 hover:text-green-800' : ''
                                    } ${activeMegaMenu === item.megaMenuType || activeDropdown === item.name ? 'text-brand-blue' : ''}`}
                                >
                                    {item.name}
                                    {(item.isMegaMenu || item.dropdown) && (
                                        <ChevronDownIcon 
                                            open={activeMegaMenu === item.megaMenuType || activeDropdown === item.name}
                                            className="h-4 w-4"
                                        />
                                    )}
                                </button>
                            </div>
                        ))}
                    </nav>

                    {/* Right: User Actions */}
                    <div className="flex items-center gap-2 lg:gap-4 z-10 flex-shrink-0">
                        {/* Desktop: Search Icon (Opens Search Mode) */}
                        <button 
                            onClick={() => setIsSearchOpen(true)}
                            className={`hidden lg:block text-gray-900 hover:text-brand-blue ${focusStyles}`}
                            aria-label="Search"
                        >
                            <SearchIcon />
                        </button>
                        
                        {/* Desktop Account - Links directly to Stripe Customer Portal Login */}
                        <button 
                            onClick={() => {
                                window.location.href = 'https://billing.stripe.com/p/login/6oU3cx8jRezt6d05r708g00';
                            }} 
                            className={`hidden lg:block text-gray-600 hover:text-brand-blue rounded-full p-2 ${focusStyles}`} 
                            aria-label="My Account"
                            title="My Account"
                        >
                            <AccountIcon />
                        </button>

                        {/* Cart (Both Desktop & Mobile) */}
                        <button 
                            onClick={() => handleNav({ page: 'cart' })} 
                            className={`relative text-gray-600 hover:text-brand-blue rounded-full p-2 ${focusStyles}`} 
                            aria-label="Shopping Cart"
                        >
                            <CartIcon />
                            {getItemCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {getItemCount() > 9 ? '9+' : getItemCount()}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
                ) : (
                    /* Search Mode - Full Width Search Bar */
                    <div className="container mx-auto px-4 h-16 flex items-center" ref={searchRef}>
                        <form onSubmit={handleFormSubmit} className="relative w-full flex items-center gap-4">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                                <SearchIcon />
                            </div>
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                placeholder="Search by keyword, item #, or category" 
                                className="flex-1 h-12 pl-12 pr-12 text-gray-900 bg-gray-100 border-2 border-transparent rounded-full focus:bg-white focus:border-brand-blue focus:outline-none focus:ring-0 transition-colors shadow-sm" 
                                value={searchQuery} 
                                onChange={onSearchChange} 
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                    setSuggestions([]);
                                }}
                                className="flex-shrink-0 text-gray-500 hover:text-gray-900 rounded-full p-2 hover:bg-gray-100 transition-colors"
                                aria-label="Close search"
                            >
                                <CloseIcon />
                            </button>
                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                    <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                        {suggestions.map((s, i) => (
                                            <li key={i}>
                                                <button 
                                                    onClick={() => {
                                                        executeSearch(s.name);
                                                        setIsSearchOpen(false);
                                                    }} 
                                                    className={`w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-brand-blue-50 flex justify-between items-center ${focusStyles}`}
                                                >
                                                    <span className="font-medium">{s.name}</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.type === 'Product' ? 'bg-green-100 text-green-800' : 'bg-brand-blue-100 text-brand-blue-800'}`}>
                                                        {s.type}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>

            {/* Mega Menu Dropdowns */}
            {activeMegaMenu && (
                <div 
                    ref={navRef as React.RefObject<HTMLDivElement>}
                    onMouseEnter={handleMenuEnterDropdown}
                    onMouseLeave={handleMenuLeave} 
                    className="hidden lg:block absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-200 z-50"
                    style={{ maxHeight: '600px' }}
                >
                    
                        {/* Categories Mega Menu */}
                        {activeMegaMenu === 'categories' && (
                            <div className="w-full" style={{ maxHeight: '600px', minHeight: '400px' }}>
                                {categoryNames.length > 0 && activeMegaMenuCategory ? (
                                    <div className="flex bg-white container mx-auto" style={{ height: '600px' }}>
                                        {/* Level 1: Categories Sidebar */}
                                        <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto py-2 flex-shrink-0">
                                            {categoryNames.sort().map(cat => (
                                                <button
                                                    key={cat}
                                                    onMouseEnter={() => setActiveMegaMenuCategory(cat)}
                                                    onClick={() => handleNav({ page: 'categoryLanding', categoryName: cat })}
                                                    className={`w-full text-left px-6 py-3 text-sm font-bold flex justify-between items-center transition-all ${
                                                        activeMegaMenuCategory === cat 
                                                            ? 'bg-white text-brand-blue border-l-4 border-brand-blue shadow-sm' 
                                                            : 'text-gray-700 hover:bg-gray-100 hover:text-brand-blue border-l-4 border-transparent'
                                                    }`}
                                                >
                                                    {cat}
                                                    {activeMegaMenuCategory === cat && <ChevronRightIcon />}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Level 2 & 3: Content Area */}
                                        <div className="flex-1 p-8 overflow-y-auto bg-white">
                                            <div className="flex items-baseline justify-between mb-6 border-b border-gray-100 pb-4">
                                                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{activeMegaMenuCategory}</h3>
                                                <button onClick={() => handleNav({ page: 'categoryLanding', categoryName: activeMegaMenuCategory })} className="text-sm font-bold text-brand-blue hover:text-brand-blue-700 flex items-center gap-1">
                                                    View All {activeMegaMenuCategory} <span aria-hidden="true">&rarr;</span>
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-4 gap-x-6 gap-y-8">
                                                {(() => {
                                                    const categoryData = medifocalCategories[activeMegaMenuCategory];
                                                    console.log(`Rendering category "${activeMegaMenuCategory}":`, categoryData);
                                                    console.log('All available categories:', Object.keys(medifocalCategories));
                                                    
                                                    if (categoryData && Array.isArray(categoryData) && categoryData.length > 0) {
                                                        return categoryData.map((subGroup: any, idx: number) => {
                                                            // Handle both object format {title, items} and string format
                                                            const title = subGroup.title || subGroup.name || subGroup;
                                                            const items = subGroup.items || (Array.isArray(subGroup) ? subGroup : []);
                                                            
                                                            return (
                                                                <div key={idx} className="break-inside-avoid">
                                                                    <h4 
                                                                        className="font-bold text-gray-900 mb-3 text-base cursor-pointer hover:text-brand-blue"
                                                                        onClick={() => handleNav({ page: 'productList', categoryName: title, parentCategory: activeMegaMenuCategory })}
                                                                    >
                                                                        {title}
                                                                    </h4>
                                                                    <ul className="space-y-1.5">
                                                                        {items && Array.isArray(items) && items.length > 0 ? (
                                                                            items.map((item: string, itemIdx: number) => (
                                                                                <li key={itemIdx}>
                                                                                    <button 
                                                                                        onClick={() => handleNav({ page: 'productList', categoryName: item, parentCategory: activeMegaMenuCategory })}
                                                                                        className="text-sm text-gray-600 hover:text-brand-blue hover:underline text-left block w-full py-0.5"
                                                                                    >
                                                                                        {item}
                                                                                    </button>
                                                                                </li>
                                                                            ))
                                                                        ) : (
                                                                            <li>
                                                                                <button 
                                                                                    onClick={() => handleNav({ page: 'productList', categoryName: title, parentCategory: activeMegaMenuCategory })}
                                                                                    className="text-sm text-gray-500 italic hover:text-brand-blue"
                                                                                >
                                                                                    View Products
                                                                                </button>
                                                                            </li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            );
                                                        });
                                                    } else {
                                                        return (
                                                            <div className="col-span-4 text-center py-10 text-gray-500">
                                                                <p>No subcategories available for "{activeMegaMenuCategory}"</p>
                                                                <p className="text-xs mt-2">Debug: Category data is {categoryData ? (Array.isArray(categoryData) ? `array with ${categoryData.length} items` : typeof categoryData) : 'null/undefined'}</p>
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-96 bg-white">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue-600 mx-auto mb-4"></div>
                                            <p className="text-gray-600">Loading categories...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Promotions Mega Menu */}
                        {activeMegaMenu === 'promotions' && (
                            <div className="w-full container mx-auto px-4 py-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-1 border-r border-gray-100 pr-8">
                                        <h3 className="font-bold text-gray-900 text-lg mb-4 pb-2 border-b">Promotions</h3>
                                        <ul className="space-y-3">
                                            {promotionsLinks.map(subItem => (
                                                <li key={subItem.name}>
                                                    <button onClick={() => handleNav(subItem.view)} className={`w-full text-left text-gray-600 hover:text-brand-blue font-medium transition-colors rounded-sm ${focusStyles}`}>
                                                        {subItem.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="md:col-span-2 bg-brand-blue-50 rounded-lg p-6 flex items-center gap-8">
                                        <img 
                                            src="https://firebasestorage.googleapis.com/v0/b/medifocal.firebasestorage.app/o/55035.jpg?alt=media&token=7742ffec-bb7d-469a-a474-bd5b0f9684f0" 
                                            alt="Medifocal - We Focus on You" 
                                            className="w-48 h-48 object-cover rounded-md bg-white border p-2 shadow-sm flex-shrink-0"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23006eb3;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23003366;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23grad)'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14'%3EMedifocal%3C/text%3E%3C/svg%3E";
                                            }}
                                        />
                                        <div className="text-left">
                                            <h4 className="text-2xl font-bold text-gray-900">We focus on you and we focus on your prices</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            )}
            
            {/* Admin Login Modal */}
            <AdminLoginModal
                isOpen={showAdminLogin}
                onClose={() => setShowAdminLogin(false)}
                onSuccess={() => {
                    setShowAdminLogin(false);
                    setCurrentView({ page: 'admin' });
                }}
            />
        </header>
        
        {/* Mobile Menu - Full Screen (Outside header for proper z-index) */}
        <div className={`fixed inset-0 bg-gray-900 bg-opacity-50 z-[99999] transition-opacity lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)} style={{ zIndex: 99999 }}>
            <div ref={mobileMenuRef} className={`fixed inset-0 w-full h-full bg-white shadow-xl transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 flex flex-col`} onClick={e => e.stopPropagation()} style={{ zIndex: 100000 }}>
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <h2 className="font-bold text-xl text-gray-900">Menu</h2>
                    <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className={`rounded-full p-2 hover:bg-gray-100 transition-colors ${focusStyles}`}><CloseIcon /></button>
                </div>
                <nav className="flex-grow overflow-y-auto">
                    <div className="p-5 space-y-4">
                    {/* Account Link at Top - Links directly to Stripe Customer Portal Login */}
                    <button 
                        onClick={() => {
                            // Redirect directly to Stripe Customer Portal login
                            window.location.href = 'https://billing.stripe.com/p/login/6oU3cx8jRezt6d05r708g00';
                            setMobileMenuOpen(false);
                        }} 
                        className={`w-full flex items-center gap-3 font-semibold text-base py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg transition-colors ${focusStyles}`}
                        aria-label="My Account"
                    >
                        <AccountIcon />
                        <span>My Account</span>
                    </button>
                    
                    {/* Search in Menu */}
                    <div className="pb-2" ref={searchRef}>
                        <form onSubmit={handleFormSubmit} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                className="block w-full h-12 pl-12 pr-4 text-gray-900 bg-gray-100 border-2 border-transparent rounded-full focus:bg-white focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all shadow-sm" 
                                value={searchQuery} 
                                onChange={onSearchChange} 
                            />
                            {suggestions.length > 0 && (
                                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                    <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                                        {suggestions.map((s, i) => (
                                            <li key={i}>
                                                <button 
                                                    onClick={() => executeSearch(s.name)} 
                                                    className={`w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-brand-blue-50 flex justify-between items-center ${focusStyles}`}
                                                >
                                                    <span className="font-medium truncate">{s.name}</span>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${s.type === 'Product' ? 'bg-green-100 text-green-800' : 'bg-brand-blue-100 text-brand-blue-800'}`}>
                                                        {s.type}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </form>
                    </div>
                    {/* Categories Accordion */}
                    <div className="border-t border-gray-200 pt-2">
                        <button 
                            onClick={() => setMobileAccordion(mobileAccordion === 'categories' ? null : 'categories')} 
                            className={`w-full flex justify-between items-center font-bold text-lg py-4 px-4 rounded-lg transition-colors ${mobileAccordion === 'categories' ? 'bg-brand-blue text-white' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'} ${focusStyles}`}
                        >
                            <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Categories
                            </span>
                            <ChevronDownIcon open={mobileAccordion === 'categories'} className={mobileAccordion === 'categories' ? 'text-white' : 'text-gray-600'} />
                        </button>
                        {mobileAccordion === 'categories' && (
                            <div className="mt-2 px-2 pb-4">
                                {categoriesLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue mb-4"></div>
                                        <p className="text-gray-600 text-sm">Loading categories...</p>
                                    </div>
                                ) : categoriesError ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                        <p className="text-red-700 text-sm font-medium mb-2">Failed to load categories</p>
                                        <button 
                                            onClick={() => {
                                                setCategoriesError(null);
                                                setCategoriesLoading(true);
                                                getCategories().then(categories => {
                                                    setMedifocalCategories(categories);
                                                    setCategoryNames(Object.keys(categories));
                                                    setCategoriesLoading(false);
                                                }).catch(err => {
                                                    setCategoriesError(err.message);
                                                    setCategoriesLoading(false);
                                                });
                                            }}
                                            className="text-sm text-red-600 hover:text-red-800 underline"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : categoryNames.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        No categories available
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {categoryNames.sort().map(cat => (
                                            <div key={cat} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                <button 
                                                    onClick={() => setMobileSubAccordion(mobileSubAccordion === cat ? null : cat)}
                                                    className={`w-full flex justify-between items-center font-semibold text-base py-3 px-4 transition-colors ${mobileSubAccordion === cat ? 'bg-gray-50 text-brand-blue' : 'text-gray-800 hover:bg-gray-50'} ${focusStyles}`}
                                                >
                                                    <span>{cat}</span>
                                                    {medifocalCategories[cat] && medifocalCategories[cat].length > 0 && (
                                                        <ChevronDownIcon className="h-5 w-5 flex-shrink-0" open={mobileSubAccordion === cat} />
                                                    )}
                                                </button>
                                                
                                                {mobileSubAccordion === cat && (
                                                    <div className="px-4 pb-3 space-y-2 bg-gray-50 border-t border-gray-200">
                                                        <button 
                                                            onClick={() => {
                                                                handleNav({ page: 'categoryLanding', categoryName: cat });
                                                                setMobileMenuOpen(false);
                                                            }} 
                                                            className="w-full text-left text-sm font-bold text-brand-blue py-2 px-3 bg-white rounded-lg hover:bg-brand-blue-50 transition-colors border border-brand-blue/20"
                                                        >
                                                            View All {cat} →
                                                        </button>
                                                        {medifocalCategories[cat] && medifocalCategories[cat].length > 0 ? (
                                                            medifocalCategories[cat].map((sub: any, subIdx: number) => {
                                                                const subTitle = sub.title || sub.name || 'Subcategory';
                                                                const subItems = sub.items || sub.items || [];
                                                                const hasItems = Array.isArray(subItems) && subItems.length > 0;
                                                                
                                                                return (
                                                                    <div key={subIdx} className="bg-white rounded-lg p-3 border border-gray-200">
                                                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">{subTitle}</p>
                                                                        {hasItems ? (
                                                                            <div className="space-y-1">
                                                                                {subItems.map((item: string, itemIdx: number) => (
                                                                                    <button 
                                                                                        key={itemIdx}
                                                                                        onClick={() => {
                                                                                            handleNav({ page: 'productList', categoryName: item, parentCategory: cat });
                                                                                            setMobileMenuOpen(false);
                                                                                        }} 
                                                                                        className="w-full text-left text-sm text-gray-700 py-2 px-2 rounded hover:bg-gray-100 hover:text-brand-blue transition-colors"
                                                                                    >
                                                                                        {item}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <button 
                                                                                onClick={() => {
                                                                                    handleNav({ page: 'productList', categoryName: subTitle, parentCategory: cat });
                                                                                    setMobileMenuOpen(false);
                                                                                }} 
                                                                                className="w-full text-left text-sm text-gray-600 py-2 px-2 rounded hover:bg-gray-100 hover:text-brand-blue transition-colors italic"
                                                                            >
                                                                                View Products
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                                                                <p className="text-sm text-gray-500">No subcategories available</p>
                                                                <button 
                                                                    onClick={() => {
                                                                        handleNav({ page: 'categoryLanding', categoryName: cat });
                                                                        setMobileMenuOpen(false);
                                                                    }} 
                                                                    className="mt-2 text-sm text-brand-blue hover:underline"
                                                                >
                                                                    View all products in {cat}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pt-2">
                        <button 
                            onClick={() => setMobileAccordion(mobileAccordion === 'promotions' ? null : 'promotions')} 
                            className={`w-full flex justify-between items-center font-bold text-lg py-4 px-4 rounded-lg transition-colors ${mobileAccordion === 'promotions' ? 'bg-brand-blue text-white' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'} ${focusStyles}`}
                        >
                            <span>Promotions</span>
                            <ChevronDownIcon open={mobileAccordion === 'promotions'} className={mobileAccordion === 'promotions' ? 'text-white' : 'text-gray-600'} />
                        </button>
                        {mobileAccordion === 'promotions' && (
                            <div className="mt-2 px-2 pb-4 space-y-2">
                                {promotionsLinks.map(item => (
                                    <button 
                                        key={item.name} 
                                        onClick={() => {
                                            handleNav(item.view);
                                            setMobileMenuOpen(false);
                                        }} 
                                        className={`w-full text-left font-medium text-gray-700 py-3 px-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-brand-blue/30 transition-colors ${focusStyles}`}
                                    >
                                        {item.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2 space-y-2 px-2 pb-4">
                        {primaryNavData.filter(i => !i.isMegaMenu).map(item => (
                            <button 
                                key={item.name} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    // For admin button, show login modal
                                    if (item.isAdmin) {
                                        setShowAdminLogin(true);
                                        setMobileMenuOpen(false);
                                        return;
                                    }
                                    
                                    if (item.view) {
                                        handleNav(item.view);
                                    }
                                    setMobileMenuOpen(false);
                                }} 
                                className={`w-full text-left block font-bold text-lg py-4 px-4 rounded-lg transition-colors ${item.isHighlight ? 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100' : item.isAdmin ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100' : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'} ${focusStyles}`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                    </div>
                </nav>
            </div>
        </div>
        </>
    );
};

export default TopNav;
