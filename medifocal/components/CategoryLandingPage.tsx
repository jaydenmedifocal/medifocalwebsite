
import React, { useState, useEffect } from 'react';
import { View } from '../App';
import { getProductsByParentCategory, getCategoryByName } from '../services/firestore';
import ProductCard from './ProductCard';
import SEOHead from './SEOHead';
import Breadcrumbs from './Breadcrumbs';
import { viewToUrl } from '../utils/routing';
import { getCategorySEO } from '../utils/categorySEO';

// Placeholder images for subcategories
const subCategoryImages: Record<string, string> = {
    '3D Printers': 'https://images.unsplash.com/photo-1581093450065-a79b077c887e?q=80&w=400&auto=format&fit=crop',
    'Dental Needles': 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?q=80&w=400&auto=format&fit=crop',
    'Local Anaesthetic': 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=400&auto=format&fit=crop',
    'Dental Burs': 'https://images.unsplash.com/photo-1600454021970-351f5322c914?q=80&w=400&auto=format&fit=crop',
    'Blocks': 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=400&auto=format&fit=crop',
    'Discs': 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?q=80&w=400&auto=format&fit=crop',
    'Cements': 'https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?q=80&w=400&auto=format&fit=crop',
    'Gloves': 'https://images.unsplash.com/photo-1599045118108-bf9954418b76?q=80&w=400&auto=format&fit=crop',
    'Masks': 'https://images.unsplash.com/photo-1586942593568-29361efcd571?q=80&w=400&auto=format&fit=crop',
    'Hand Files': 'https://images.unsplash.com/photo-1588776813158-cef7047ca7d1?q=80&w=400&auto=format&fit=crop',
    'Dental Chairs': 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=400&auto=format&fit=crop',
    'Imaging': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=400&auto=format&fit=crop',
    'High Speed': 'https://images.unsplash.com/photo-1570969691209-62c8c0831b77?q=80&w=400&auto=format&fit=crop',
    'Low Speed': 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=400&auto=format&fit=crop',
    'Impression Materials': 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?q=80&w=400&auto=format&fit=crop',
    'Sterilisation': 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?q=80&w=400&auto=format&fit=crop',
    'Diagnostic': 'https://images.unsplash.com/photo-1609840112855-9c532020540e?q=80&w=400&auto=format&fit=crop',
    'Surgical': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=400&auto=format&fit=crop',
    'Composite': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=400&auto=format&fit=crop',
    'Brackets': 'https://images.unsplash.com/photo-1599639668313-9829a02f9d28?q=80&w=400&auto=format&fit=crop',
    'Toothbrushes': 'https://images.unsplash.com/photo-1559656914-a30970c1affd?q=80&w=400&auto=format&fit=crop',
    'Toothpaste': 'https://images.unsplash.com/photo-1559591937-e10977e69197?q=80&w=400&auto=format&fit=crop',
};

// --- Skeleton Components ---
const SubCategoryCardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md animate-pulse">
        <div className="w-full h-32 bg-gray-200 rounded-t-lg"></div>
        <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
    </div>
);

const ProductCardSkeleton = () => (
    <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
);

// --- UI Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;

interface CategoryLandingPageProps {
    categoryName: string;
    setCurrentView: (view: View) => void;
}

const CategoryLandingPage: React.FC<CategoryLandingPageProps> = ({ categoryName, setCurrentView }) => {
    const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<string[]>([]);
    const [subCategoryImageMap, setSubCategoryImageMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!categoryName) {
                console.warn('CategoryLandingPage: categoryName is undefined');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                console.log('CategoryLandingPage: Loading data for category:', categoryName);
                const products = await getProductsByParentCategory(categoryName, 200);
                console.log('CategoryLandingPage: Loaded products:', products.length);
                setRecommendedProducts(products.slice(0, 5));

                const category = await getCategoryByName(categoryName);
                let foundSubCategories: string[] = [];
                
                if (category) {
                    if (category.subCategoryGroups && Array.isArray(category.subCategoryGroups)) {
                        foundSubCategories = category.subCategoryGroups.map((group: any) => group.title || group.name).filter(Boolean);
                    } else if (category.subcategories && Array.isArray(category.subcategories)) {
                        foundSubCategories = category.subcategories.filter(Boolean);
                    }
                }
                
                if (foundSubCategories.length === 0 && products.length > 0) {
                    const uniqueCategories = new Set<string>(products.map(p => p.category).filter(c => c && c !== categoryName));
                    foundSubCategories = Array.from(uniqueCategories).sort();
                }
                
                setSubCategories(foundSubCategories);
                
                // Build image map for subcategories - use EXCLUSIVELY first product's first image from each subcategory
                const imageMap: Record<string, string> = {};
                foundSubCategories.forEach(subCat => {
                    // Find the FIRST product in this subcategory (first match in products array)
                    const firstProduct = products.find(p => p.category === subCat);
                    
                    if (firstProduct) {
                        // Use the first image from the first product
                        // Priority: imageUrl first, then first item in images array
                        const firstImage = firstProduct.imageUrl || 
                                         (firstProduct.images && firstProduct.images.length > 0 ? firstProduct.images[0] : null);
                        
                        if (firstImage) {
                            imageMap[subCat] = firstImage;
                        } else {
                            // Fallback to predefined image only if no product image exists
                            imageMap[subCat] = subCategoryImages[subCat] || '';
                        }
                    } else {
                        // No products found for this subcategory, use predefined image
                        imageMap[subCat] = subCategoryImages[subCat] || '';
                    }
                });
                
                setSubCategoryImageMap(imageMap);
            } catch (error) {
                console.error('Error loading category data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [categoryName]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const categoryUrl = viewToUrl({ page: 'categoryLanding', categoryName });
    const seoContent = getCategorySEO(categoryName);

    return (
        <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
            <SEOHead
                title={seoContent.title}
                description={seoContent.description}
                keywords={seoContent.keywords}
                url={`https://medifocal.com${categoryUrl}`}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                
                <Breadcrumbs 
                    items={[
                        { label: 'Home', view: { page: 'home' } },
                        { label: categoryName }
                    ]} 
                    setCurrentView={setCurrentView} 
                />

                {/* Hero Section - Enhanced Design */}
                <header className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-900 rounded-2xl p-8 md:p-12 mb-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
                    <div className="relative">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
                            {seoContent.h1}
                        </h1>
                        <p className="text-lg md:text-xl opacity-95 max-w-3xl mx-auto leading-relaxed">
                            {seoContent.introText}
                        </p>
                    </div>
                </header>

                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Shop by Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {loading 
                            ? Array.from({ length: 6 }).map((_, i) => <SubCategoryCardSkeleton key={i} />)
                            : subCategories.map(sub => (
                                <button 
                                    key={sub}
                                    onClick={() => setCurrentView({ page: 'productList', categoryName: sub, parentCategory: categoryName })}
                                    className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl hover:border-brand-blue transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center p-4 text-center"
                                    aria-label={`Browse ${sub} products in ${categoryName}`}
                                >
                                    <div className="w-full h-24 md:h-32 mb-4 overflow-hidden rounded-lg bg-gray-100">
                                         <img 
                                            src={subCategoryImageMap[sub] || subCategoryImages[sub] || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2218%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'} 
                                            alt={`${sub} dental equipment subcategory in ${categoryName}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" 
                                            loading="lazy" 
                                            width="150" 
                                            height="128" 
                                            decoding="async"
                                            onError={(e) => {
                                                // Fallback to placeholder if image fails to load
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2218%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    </div>
                                    <p className="font-semibold text-gray-800 group-hover:text-brand-blue text-sm flex-grow flex items-center">{sub}</p>
                                </button>
                            ))}
                    </div>
                    {!loading && subCategories.length === 0 && (
                        <div className="text-center py-12 px-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">No Subcategories Available</h3>
                            <p className="text-gray-600 mt-2">There are no specific subcategories to display for {categoryName} at the moment.</p>
                        </div>
                    )}
                </section>

                {recommendedProducts.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Featured {categoryName} Products</h2>
                        <p className="text-gray-600 mb-6">Browse our top recommended products in {categoryName}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {loading
                                ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
                                : recommendedProducts.map(product => (
                                    <ProductCard key={product.itemNumber} {...product} setCurrentView={setCurrentView} />
                                ))}
                        </div>
                        {!loading && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => {
                                        // Navigate to first subcategory or show all products
                                        if (subCategories.length > 0) {
                                            setCurrentView({ page: 'productList', categoryName: subCategories[0], parentCategory: categoryName });
                                        }
                                    }}
                                    className="text-brand-blue hover:text-brand-blue-dark font-semibold underline"
                                >
                                    View all {categoryName} products →
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* Features & Applications Section - Enhanced Design */}
                {(seoContent.features.length > 0 || seoContent.applications.length > 0) && (
                    <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                            {seoContent.features.length > 0 && (
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                                        <span className="w-2 h-8 bg-brand-blue rounded-full mr-3"></span>
                                        Key Features
                                    </h2>
                                    <ul className="space-y-3">
                                        {seoContent.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {seoContent.applications.length > 0 && (
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                                        <span className="w-2 h-8 bg-brand-blue rounded-full mr-3"></span>
                                        Applications
                                    </h2>
                                    <ul className="space-y-3">
                                        {seoContent.applications.map((application, index) => (
                                            <li key={index} className="flex items-center">
                                                <span className="w-2 h-2 bg-brand-blue rounded-full mr-3"></span>
                                                <span className="text-gray-700">{application}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Why Choose Medifocal Section */}
                {seoContent.whyChoose.length > 0 && (
                    <section className="mb-12 bg-gradient-to-r from-brand-blue-50 to-blue-50 rounded-2xl p-8 md:p-12 border-l-4 border-brand-blue">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                            Why Choose Medifocal for {categoryName}?
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {seoContent.whyChoose.map((reason, index) => (
                                <div key={index} className="flex items-start bg-white rounded-lg p-4 shadow-sm">
                                    <svg className="w-5 h-5 text-brand-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700 text-sm">{reason}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Call to Action */}
                <section className="mb-12 bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center border border-gray-100">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Need Help Choosing the Right {categoryName}?
                    </h2>
                    <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                        Our expert team can help you select the perfect products for your practice. Contact us today for personalized advice and competitive pricing.
                    </p>
                    <button
                        onClick={() => setCurrentView({ page: 'contact' })}
                        className="bg-brand-blue text-white px-8 py-3 rounded-lg hover:bg-brand-blue-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        Contact Our Experts
                    </button>
                </section>

                 <div className="flex justify-end mt-12">
                    <button 
                        onClick={scrollToTop}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold py-2 px-4 rounded-lg flex items-center transition-colors shadow-sm border border-gray-300"
                    >
                       <ArrowUpIcon /> Return to Top
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryLandingPage;
