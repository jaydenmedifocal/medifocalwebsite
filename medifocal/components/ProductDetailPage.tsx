
import React, { useState, useEffect, useMemo } from 'react';
import { getProductById, getAllProducts } from '../services/firestore';
import { View } from '../App';
import ProductCard from './ProductCard';
import { useCart } from '../contexts/CartContext';
import ProductSchema from './ProductSchema';
import SEOHead from './SEOHead';
import { viewToUrl } from '../utils/routing';
import { getProductSEOTitle, getProductSEODescription } from '../utils/categorySEO';
import ProductReviews from './ProductReviews';
import { getReviewSummary } from '../services/reviews';

// --- Skeleton Components ---
const ProductDetailSkeleton = () => (
    <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-3">
                <div className="bg-gray-200 rounded-lg w-full h-96 mb-4"></div>
                <div className="flex space-x-2">
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-12 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
        </div>
    </div>
);

// --- UI Icons ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>;
const AddedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

interface ProductDetailPageProps {
    itemNumber: string;
    setCurrentView: (view: View) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ itemNumber, setCurrentView }) => {
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [activeImage, setActiveImage] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
    const [showAllVariants, setShowAllVariants] = useState(false);
    const [variantSearchTerm, setVariantSearchTerm] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [btnState, setBtnState] = useState<'idle' | 'loading' | 'success'>('idle');
    const [selectedBundleItems, setSelectedBundleItems] = useState<Set<string>>(new Set());
    const [showSticky, setShowSticky] = useState(false);
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);
    const [showAllImages, setShowAllImages] = useState(false);
    const [reviewSummary, setReviewSummary] = useState<{ averageRating: number; totalReviews: number } | null>(null);
    const { addItem } = useCart();
    
    const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCBmaWxsPSIjZjNmNGY2IiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIvPjx0ZXh0IGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBkeT0iMTAuNSIgZm9udC13ZWlnaHQ9ImJvbGQiIHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    const getImageUrl = (url: string) => (!url || imageErrors.has(url)) ? placeholderSvg : url;
    
    // Swipe gesture handlers for mobile
    const minSwipeDistance = 50;
    
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(0);
        setTouchStart(e.targetTouches[0].clientX);
    };
    
    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                const productData = await getProductById(itemNumber);
                if (productData) {
                    setProduct(productData);
                    
                    // Collect all images from product and variants
                    // For dental chairs, prioritize imageUrl as the first image
                    const isDentalChair = (productData.category || '').toLowerCase().includes('dental chair') || 
                                          (productData.category || '').toLowerCase() === 'dental chairs' ||
                                          (productData.name || '').toLowerCase().includes('dental chair');
                    
                    if (isDentalChair) {
                        // For dental chairs, use the second image if available, otherwise first
                        const baseImages = [productData.imageUrl, ...(productData.images || [])].filter(Boolean);
                        if (baseImages.length >= 2) {
                            setActiveImage(baseImages[1]);
                        } else if (baseImages.length >= 1) {
                            setActiveImage(baseImages[0]);
                        }
                    } else {
                        const baseImages = [productData.imageUrl, ...(productData.images || [])].filter(Boolean);
                        setActiveImage(baseImages[0] || '');
                    }
                    
                    if (productData.variants && productData.variants.length > 0) {
                        const defaultVariant = productData.variantId 
                            ? productData.variants.find((v: any) => v.id === productData.variantId)
                            : productData.variants[0];
                        setSelectedVariant(defaultVariant || productData.variants[0]);
                    }

                    // Load related products asynchronously after page renders
                    setLoading(false); // Show page immediately
                    
                    // Load related products in background
                    getAllProducts(20).then(allProductsData => {
                        const related = (allProductsData.products || [])
                            .filter((p: any) => p.category === productData.category && p.itemNumber !== productData.itemNumber)
                            .sort(() => 0.5 - Math.random()).slice(0, 5);
                        setRelatedProducts(related);
                        
                        // Auto-select items under $200 (handpieces or small items)
                        const autoSelectItems = related
                            .filter((p: any) => {
                                const price = p.price || 0;
                                const name = (p.name || '').toLowerCase();
                                const category = (p.category || '').toLowerCase();
                                return price < 200 && (
                                    name.includes('handpiece') || 
                                    name.includes('motor') ||
                                    category.includes('handpiece') ||
                                    price < 100 // Small items under $100
                                );
                            })
                            .slice(0, 2); // Auto-select up to 2 items
                        
                        if (autoSelectItems.length > 0) {
                            const autoSelectIds = new Set(
                                autoSelectItems.map((p: any) => p.itemNumber || p.id)
                            );
                            setSelectedBundleItems(autoSelectIds);
                        }
                    }).catch(err => {
                        console.error('Error loading related products:', err);
                    });
                } else {
                  console.warn(`Product with itemNumber ${itemNumber} not found.`);
                }
            } catch (error) {
                console.error('Error loading product:', error);
                setLoading(false);
            }
        };
        loadProduct();
    }, [itemNumber]);
    
    useEffect(() => {
        if (selectedVariant && product) {
            const updatedProduct = { ...product };
            if (selectedVariant.price) {
                updatedProduct.price = selectedVariant.price;
                updatedProduct.displayPrice = selectedVariant.displayPrice || `$${selectedVariant.price}`;
            }
            if (selectedVariant.originalPrice) {
                updatedProduct.originalPrice = selectedVariant.originalPrice;
            } else {
                delete updatedProduct.originalPrice;
            }
            if (selectedVariant.description) {
                updatedProduct.description = selectedVariant.description;
            }
            if (selectedVariant.specifications) {
                updatedProduct.specifications = { ...product.specifications, ...selectedVariant.specifications };
            }
            // Update active image if variant has images (but not for dental chairs - keep main image first)
            const isDentalChair = (product.category || '').toLowerCase().includes('dental chair') || 
                                  (product.category || '').toLowerCase() === 'dental chairs' ||
                                  (product.name || '').toLowerCase().includes('dental chair');
            
            if (selectedVariant.imageUrl && !isDentalChair) {
                setActiveImage(selectedVariant.imageUrl);
            } else if (isDentalChair) {
                // For dental chairs, use the second image if available
                const baseImages = [product.imageUrl, ...(product.images || [])].filter(Boolean);
                if (baseImages.length >= 2) {
                    setActiveImage(baseImages[1]);
                } else if (baseImages.length >= 1) {
                    setActiveImage(baseImages[0]);
                }
            }
            setProduct(updatedProduct);
        }
    }, [selectedVariant]);

    const handleAddToCart = () => {
        if (!product) return;
        setBtnState('loading');
        
        const itemToAdd = selectedVariant 
            ? { 
                ...product, 
                ...selectedVariant, 
                name: selectedVariant.name ? `${product.name} - ${selectedVariant.name}` : product.name,
                itemNumber: selectedVariant.itemNumber || product.itemNumber,
                price: selectedVariant.price || product.price,
                displayPrice: selectedVariant.displayPrice || product.displayPrice,
                imageUrl: selectedVariant.imageUrl || product.imageUrl,
                description: selectedVariant.description || product.description || product.details
            } 
            : product;
        
        // Add main product
        addItem(itemToAdd, quantity);
        
        // Add bundle items if selected (mark as add-on)
        relatedProducts.slice(0, 3).forEach((relatedProduct: any) => {
            if (selectedBundleItems.has(relatedProduct.itemNumber || relatedProduct.id)) {
                const price = relatedProduct.price || 0;
                const isAddOn = price < 200 && (
                    (relatedProduct.name || '').toLowerCase().includes('handpiece') || 
                    (relatedProduct.name || '').toLowerCase().includes('motor') ||
                    price < 100
                );
                // Add item with add-on metadata
                addItem({
                    ...relatedProduct,
                    isAddOn: isAddOn,
                    addOnLabel: isAddOn ? 'Bundle Add-on' : undefined
                }, 1);
            }
        });
        
        setTimeout(() => {
            setBtnState('success');
            setTimeout(() => setBtnState('idle'), 2000);
        }, 600);
    };

    // Scroll listener for sticky bar
    useEffect(() => {
        const handleScroll = () => {
            const mainBtn = document.getElementById('main-cta');
            if (mainBtn) {
                const rect = mainBtn.getBoundingClientRect();
                setShowSticky(rect.bottom < 0);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleBundleItem = (itemId: string) => {
        setSelectedBundleItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    // Calculate bundle savings
    const bundleItems = relatedProducts.slice(0, 3).filter((p: any) => selectedBundleItems.has(p.itemNumber || p.id));
    const bundleTotal = useMemo(() => {
        const mainPrice = (selectedVariant?.price || product?.price || 0) * quantity;
        const bundlePrice = bundleItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
        return mainPrice + bundlePrice;
    }, [product, selectedVariant, quantity, bundleItems]);
    
    const bundleSavings = useMemo(() => {
        if (bundleItems.length >= 2) {
            return bundleTotal * 0.1; // 10% discount on bundles
        }
        return 0;
    }, [bundleTotal, bundleItems.length]);

    // Collect all images from product and selected variant
    // For dental chairs, ensure the first image is the actual chair image
    const allImages = useMemo(() => {
        if (!product) return [];
        const isDentalChair = (product.category || '').toLowerCase().includes('dental chair') || 
                              (product.category || '').toLowerCase() === 'dental chairs' ||
                              (product.name || '').toLowerCase().includes('dental chair');
        
        // For dental chairs, prioritize the main imageUrl as the first image
        const mainImage = product.imageUrl || (product.images && product.images[0]) || '';
        const otherImages = (product.images || []).filter(img => img !== mainImage && img !== product.imageUrl);
        
        const variantImages = selectedVariant 
            ? [selectedVariant.imageUrl, ...(selectedVariant.images || [])].filter(Boolean)
            : [];
        
        if (isDentalChair) {
            // For dental chairs: collect all images
            const allImagesList = [mainImage, ...otherImages, ...variantImages].filter(Boolean);
            // Remove duplicates while preserving order
            const uniqueImages = Array.from(new Set(allImagesList));
            
            // For dental chairs, we want to display the second image first
            // If we have at least 2 images, reorder to show second image as primary
            if (uniqueImages.length >= 2) {
                // Get the second image (index 1) and put it first
                const secondImage = uniqueImages[1];
                const firstImage = uniqueImages[0];
                const restImages = uniqueImages.slice(2);
                // Return with second image first, then first image, then rest
                return [secondImage, firstImage, ...restImages];
            }
            return uniqueImages;
        }
        
        // For other products: combine variant images first, then base images
        const baseImages = [product.imageUrl, ...(product.images || [])].filter(Boolean);
        const combined = [...variantImages, ...baseImages];
        const uniqueImages = combined.filter((v, i, a) => a.indexOf(v) === i);
        
        return uniqueImages.length > 0 ? uniqueImages : baseImages;
    }, [product, selectedVariant]);
    
    // Image navigation functions (defined after allImages)
    const nextImage = () => {
        if (allImages.length > 0) {
            const nextIndex = (currentImageIndex + 1) % allImages.length;
            setCurrentImageIndex(nextIndex);
            setActiveImage(allImages[nextIndex]);
        }
    };
    
    const prevImage = () => {
        if (allImages.length > 0) {
            const prevIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
            setCurrentImageIndex(prevIndex);
            setActiveImage(allImages[prevIndex]);
        }
    };
    
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) {
            nextImage();
        }
        if (isRightSwipe) {
            prevImage();
        }
    };

    // Ensure activeImage is in the images array and update currentImageIndex
    // For dental chairs, always use the first image (main imageUrl)
    useEffect(() => {
        if (allImages.length > 0) {
            const isDentalChair = product && (
                (product.category || '').toLowerCase().includes('dental chair') || 
                (product.category || '').toLowerCase() === 'dental chairs' ||
                (product.name || '').toLowerCase().includes('dental chair')
            );
            
            if (isDentalChair) {
                // For dental chairs, always use the first image (which is the second image, swapped to first position)
                if (allImages.length > 0 && activeImage !== allImages[0]) {
                    setActiveImage(allImages[0]);
                    setCurrentImageIndex(0);
                }
            } else if (!allImages.includes(activeImage)) {
                // For other products, use first image if current is not in array
                setActiveImage(allImages[0]);
                setCurrentImageIndex(0);
            } else {
                const index = allImages.indexOf(activeImage);
                setCurrentImageIndex(index);
            }
        }
    }, [allImages, activeImage, product]);

    // Load review summary for product schema - MUST be before early returns
    useEffect(() => {
        const loadReviewSummary = async () => {
            try {
                const summary = await getReviewSummary(itemNumber);
                setReviewSummary(summary);
            } catch (error) {
                console.error('Error loading review summary:', error);
            }
        };
        loadReviewSummary();
    }, [itemNumber]);

    // Filter variants based on search term - MUST be before early returns
    const filteredVariants = useMemo(() => {
        if (!product || !product.variants) return [];
        const variants = product.variants;
        if (!variantSearchTerm.trim()) return variants;
        const searchLower = variantSearchTerm.toLowerCase();
        return variants.filter((v: any) => {
            // Search in title (most important)
            if (v.title?.toLowerCase().includes(searchLower)) return true;
            // Search in name
            if (v.name?.toLowerCase().includes(searchLower)) return true;
            // Search in SKU
            if (v.sku?.toLowerCase().includes(searchLower)) return true;
            // Search in item number
            if (v.itemNumber?.toLowerCase().includes(searchLower)) return true;
            // Search in price
            if (v.displayPrice?.toLowerCase().includes(searchLower)) return true;
            // Search in specifications
            if (v.specifications) {
                const specsString = JSON.stringify(v.specifications).toLowerCase();
                if (specsString.includes(searchLower)) return true;
            }
            return false;
        });
    }, [product, variantSearchTerm]);
    
    const displayedVariants = showAllVariants ? filteredVariants : filteredVariants.slice(0, 6);

    // Helper function to get clean variant data for display (excluding technical fields)
    const getVariantDisplayData = (variant: any) => {
        const displayData: Record<string, any> = {};
        const specs = variant.specifications || {};
        
        // Fields to exclude from display
        const excludeFields = [
            'id', 'name', 'price', 'displayPrice', 'originalPrice', 'itemNumber', 
            'imageUrl', 'images', 'description', 'specifications', 'variantId', 
            'productId', 'selectedOptions', 'availableForSale', 'sku'
        ];
        
        // Combine variant properties and specifications
        const allData = { ...variant, ...specs };
        
        // Filter out excluded fields and only include meaningful data
        Object.entries(allData).forEach(([key, value]) => {
            if (!excludeFields.includes(key) && 
                value !== null && 
                value !== undefined && 
                value !== '' && 
                String(value).trim() &&
                !String(value).startsWith('[object')) {
                displayData[key] = value;
            }
        });
        
        return displayData;
    };

    // Helper function to generate variant display name
    const getVariantDisplayName = (variant: any, index: number) => {
        // Priority 1: Use title field (most descriptive)
        if (variant.title && variant.title.trim()) {
            return variant.title;
        }
        
        // Priority 2: Use name field if it's meaningful
        if (variant.name && variant.name.trim() && variant.name !== 'Unnamed Variant' && variant.name !== 'Variant') {
            return variant.name;
        }
        
        // Priority 3: Build from specifications
        const specs = variant.specifications || {};
        const parts: string[] = [];
        
        const priorityFields = ['size', 'color', 'material', 'shape', 'grit', 'speed', 'viscosity', 'quantity', 'pack', 'model', 'type', 'style'];
        
        for (const field of priorityFields) {
            if (specs[field] && String(specs[field]).trim()) {
                const value = String(specs[field]);
                if (field === 'quantity' || field === 'pack') {
                    parts.push(`Pack of ${value}`);
                } else {
                    parts.push(value);
                }
                if (parts.length >= 3) break;
            }
        }
        
        if (parts.length > 0) {
            return parts.join(' - ');
        }
        
        // Priority 4: Use SKU if available
        if (variant.sku && variant.sku !== product?.itemNumber) {
            return `SKU: ${variant.sku}`;
        }
        
        // Priority 5: Use item number
        if (variant.itemNumber && variant.itemNumber !== product?.itemNumber) {
            return variant.itemNumber;
        }
        
        return `Option ${index + 1}`;
    };

    // Helper function to parse description and extract structured data
    const parseDescription = (htmlContent: string) => {
        if (!htmlContent || typeof window === 'undefined') return { sections: [], extractedSpecs: {} };
        
        const extractedSpecs: Record<string, string> = {};
        const sections: Array<{ title: string; content: string; type: 'text' | 'list' | 'table' | 'mixed' }> = [];
        
        // Create a temporary DOM element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Extract specifications from tables
        const tables = tempDiv.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 2) {
                    const key = cells[0].textContent?.trim() || '';
                    const value = cells[1].textContent?.trim() || '';
                    if (key && value && !key.toLowerCase().includes('specification')) {
                        const cleanKey = key.replace(/[:\s]+$/, '').toLowerCase().replace(/\s+/g, '_');
                        extractedSpecs[cleanKey] = value;
                    }
                }
            });
        });
        
        // Get plain text for smart parsing
        const plainText = tempDiv.textContent || tempDiv.innerText || htmlContent;
        
        // Check if content has HTML structure or is plain text
        const hasHTMLStructure = tempDiv.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol, table');
        
        // Always try plain text parsing if text is substantial (even if HTML structure exists)
        // This handles cases where HTML is minimal or just escaped text
        if (plainText.length > 50 && (!hasHTMLStructure || plainText.length > htmlContent.length * 0.8)) {
            // Plain text - smart parsing to create structure
            const text = plainText.trim();
            
            // Split text by common section headers (case-insensitive, can be anywhere in text)
            const sectionHeaders = [
                { regex: /\b(Overview|Description|Product Description|Introduction)\b/gi, name: 'Overview' },
                { regex: /\b(Comprehensive Features Included|Features Included|Features|Key Features|Product Features)\b/gi, name: 'Features' },
                { regex: /\b(Peace of Mind Warranty|Warranty|Warranty Information)\b/gi, name: 'Warranty' },
                { regex: /\b(Optimized Illumination|Illumination|Lighting)\b/gi, name: 'Illumination' },
                { regex: /\b(Advanced Infection Control|Infection Control|Hygiene)\b/gi, name: 'Infection Control' },
                { regex: /\b(Intuitive Foot Control|Foot Control|Controls)\b/gi, name: 'Controls' },
                { regex: /\b(General Specifications|Specifications|Specs|Technical Specifications|Product Specifications)\b/gi, name: 'Specifications' },
                { regex: /\b(Operating Instructions|Instructions|How to Use|Usage)\b/gi, name: 'Operating Instructions' },
                { regex: /\b(Safety|Safety Information|Warnings|Precautions)\b/gi, name: 'Safety' },
                { regex: /\b(Note|Notes|Important)\b/gi, name: 'Notes' },
            ];
            
            // Find all section header positions
            const sectionPositions: Array<{ title: string; position: number }> = [];
            sectionHeaders.forEach(({ regex, name }) => {
                let match;
                const regexCopy = new RegExp(regex.source, regex.flags);
                while ((match = regexCopy.exec(text)) !== null) {
                    // Check if this is likely a section header (not part of a sentence)
                    const before = text.substring(Math.max(0, match.index - 30), match.index);
                    const after = text.substring(match.index + match[0].length, Math.min(text.length, match.index + match[0].length + 30));
                    
                    // Section headers are usually:
                    // - At start of text
                    // - After a period/newline/empty line
                    // - Followed by content (checkmark, text, or newline)
                    // - Not part of a sentence (capitalized, possibly bold)
                    const isLikelyHeader = (
                        match.index === 0 ||
                        before.match(/[.\n]\s*$/) ||
                        before.trim().length === 0 ||
                        (before.match(/[.!?]\s*$/) && after.trim().length > 0) ||
                        // Headers often start with capital letters and are followed by checkmarks or content
                        (match[0].match(/^[A-Z]/) && (after.trim().startsWith('✓') || after.trim().match(/^[A-Z]/)))
                    );
                    
                    if (isLikelyHeader) {
                        sectionPositions.push({
                            title: name,
                            position: match.index + match[0].length
                        });
                    }
                }
            });
            
            // Sort by position and remove duplicates
            sectionPositions.sort((a, b) => a.position - b.position);
            const uniquePositions = sectionPositions.filter((pos, idx, arr) => 
                idx === 0 || Math.abs(pos.position - arr[idx - 1].position) > 10
            );
            
            if (uniquePositions.length > 0) {
                // Add content before first section
                if (uniquePositions[0].position > 50) {
                    const introText = text.substring(0, uniquePositions[0].position).trim();
                    if (introText.length > 20) {
                        sections.push({
                            title: 'Overview',
                            content: formatParagraphs(splitIntoLines(introText)),
                            type: 'mixed'
                        });
                    }
                }
                
                // Process each section
                uniquePositions.forEach((pos, idx) => {
                    const start = pos.position;
                    const end = idx < uniquePositions.length - 1 
                        ? uniquePositions[idx + 1].position 
                        : text.length;
                    
                    const sectionText = text.substring(start, end).trim();
                    if (sectionText.length > 20) {
                        const lines = splitIntoLines(sectionText);
                        
                        // Extract specs from Specifications section
                        if (pos.title.toLowerCase().includes('specification')) {
                            lines.forEach(line => {
                                // Handle both "Key: Value" and "Key Value" formats
                                const specMatch = line.match(/^([^:]+):\s*(.+)$/);
                                if (specMatch) {
                                    const [, key, value] = specMatch;
                                    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
                                    extractedSpecs[cleanKey] = value.trim();
                                } else {
                                    // Try to split by common separators
                                    const parts = line.split(/\s*:\s*|\s+(\d+[A-Za-z]?|\d+\.\d+)/);
                                    if (parts.length >= 2) {
                                        const key = parts[0].trim();
                                        const value = parts.slice(1).join(' ').trim();
                                        if (key && value && key.length < 50) {
                                            const cleanKey = key.toLowerCase().replace(/\s+/g, '_');
                                            extractedSpecs[cleanKey] = value;
                                        }
                                    }
                                }
                            });
                        }
                        
                        sections.push({
                            title: pos.title,
                            content: formatParagraphs(lines),
                            type: 'mixed'
                        });
                    }
                });
            } else {
                // No sections found - format as single overview
                const lines = splitIntoLines(text);
                sections.push({
                    title: 'Product Details',
                    content: formatParagraphs(lines),
                    type: 'mixed'
                });
            }
        } else {
            // Has HTML structure - parse normally
            let currentSection: { title: string; content: string; type: 'text' | 'list' | 'table' | 'mixed' } | null = null;
            const allElements = Array.from(tempDiv.children);
            
            const hasHeadings = allElements.some(el => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(el.tagName.toLowerCase()));
            
            if (!hasHeadings && allElements.length > 0) {
                // No headings - create sections from content structure
                let overviewContent = '';
                allElements.forEach((el) => {
                    const tagName = el.tagName.toLowerCase();
                    const text = el.textContent?.trim() || '';
                    
                    if (text) {
                        if (tagName === 'p') {
                            overviewContent += el.outerHTML;
                        } else if (tagName === 'ul' || tagName === 'ol') {
                            overviewContent += el.outerHTML;
                        } else if (tagName === 'table') {
                            overviewContent += el.outerHTML;
                        } else {
                            overviewContent += el.outerHTML;
                        }
                    }
                });
                
                if (overviewContent) {
                    sections.push({ title: 'Product Details', content: overviewContent, type: 'mixed' });
                }
            } else {
                // Process with headings
                allElements.forEach((el) => {
                    const tagName = el.tagName.toLowerCase();
                    const text = el.textContent?.trim() || '';
                    
                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                        // Save previous section
                        if (currentSection && currentSection.content) {
                            sections.push(currentSection);
                        }
                        // Start new section
                        currentSection = {
                            title: text,
                            content: '',
                            type: 'mixed'
                        };
                    } else if (currentSection && text) {
                        // Add all content types to current section
                        currentSection.content += el.outerHTML;
                        if (tagName === 'ul' || tagName === 'ol') {
                            currentSection.type = 'list';
                        } else if (tagName === 'table') {
                            currentSection.type = 'table';
                        }
                    } else if (!currentSection && text) {
                        // Content before first heading
                        if (!sections.length) {
                            sections.push({ title: 'Overview', content: '', type: 'mixed' });
                        }
                        sections[sections.length - 1].content += el.outerHTML;
                    }
                });
                
                // Add last section
                if (currentSection && currentSection.content) {
                    sections.push(currentSection);
                }
            }
        }
        
        // If no sections found, use the whole content
        if (sections.length === 0) {
            sections.push({ title: 'Product Details', content: htmlContent, type: 'mixed' });
        }
        
        return { sections, extractedSpecs };
    };
    
    // Helper function to split text into logical lines
    const splitIntoLines = (text: string): string[] => {
        // First try splitting by newlines
        if (text.includes('\n')) {
            const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
            // If lines contain multiple checkmarks, split them
            const expanded: string[] = [];
            lines.forEach(line => {
                // Split by checkmark if there are multiple on one line
                if ((line.match(/✓/g) || []).length > 1) {
                    const parts = line.split(/(?=✓)/);
                    parts.forEach(part => {
                        const trimmed = part.trim();
                        if (trimmed) expanded.push(trimmed);
                    });
                } else {
                    expanded.push(line);
                }
            });
            return expanded;
        }
        
        // If no newlines, split by checkmarks first (common in feature lists)
        if (text.includes('✓')) {
            const checkmarkParts = text.split(/(?=✓)/).map(p => p.trim()).filter(p => p.length > 0);
            if (checkmarkParts.length > 1) {
                return checkmarkParts;
            }
        }
        
        // Split by periods followed by spaces (sentences)
        const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0);
        
        if (sentences.length > 1) {
            // Group short sentences together
            const grouped: string[] = [];
            let current = '';
            
            sentences.forEach(sentence => {
                if (current.length + sentence.length < 200) {
                    current += (current ? ' ' : '') + sentence;
                } else {
                    if (current) grouped.push(current);
                    current = sentence;
                }
            });
            if (current) grouped.push(current);
            
            return grouped.length > 0 ? grouped : sentences;
        }
        
        // Last resort: return as single line
        return [text];
    };
    
    // Helper function to format plain text into HTML paragraphs
    const formatParagraphs = (lines: string[]): string => {
        if (!lines || lines.length === 0) return '';
        
        let html = '';
        let currentParagraph: string[] = [];
        let inList = false;
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) {
                // Empty line - end current paragraph/list
                if (currentParagraph.length > 0) {
                    html += `<p>${currentParagraph.join(' ')}</p>`;
                    currentParagraph = [];
                }
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
            } else if (trimmed.match(/^[\d]+\.\s/) || trimmed.match(/^[•\-\*]\s/) || trimmed.includes('✓')) {
                // List item (numbered, bulleted, or checkmark)
                if (currentParagraph.length > 0) {
                    html += `<p class="mb-4 leading-relaxed text-gray-700">${currentParagraph.join(' ')}</p>`;
                    currentParagraph = [];
                }
                if (!inList) {
                    html += '<ul class="list-none space-y-3 my-4">';
                    inList = true;
                }
                // Handle checkmark (✓), numbered, or bulleted lists
                let listItem = trimmed;
                if (trimmed.includes('✓')) {
                    // Extract text after checkmark
                    listItem = trimmed.replace(/^.*?✓\s*/, '').trim();
                    if (!listItem) {
                        // If checkmark is at start, get everything after it
                        listItem = trimmed.replace(/^✓\s*/, '').trim();
                    }
                    html += `<li class="text-gray-700 leading-relaxed flex items-start gap-2"><span class="text-green-600 font-bold text-lg flex-shrink-0 mt-0.5">✓</span><span class="flex-1">${listItem}</span></li>`;
                } else {
                    listItem = trimmed.replace(/^[\d]+\.\s/, '').replace(/^[•\-\*]\s/, '').trim();
                    html += `<li class="text-gray-700 leading-relaxed list-disc list-inside ml-4">${listItem}</li>`;
                }
            } else if (trimmed.match(/^[A-Z][^:]+:\s*.+$/)) {
                // Key-value pair (specification format)
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (currentParagraph.length > 0) {
                    html += `<p>${currentParagraph.join(' ')}</p>`;
                    currentParagraph = [];
                }
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                html += `<p class="mb-2"><strong class="text-gray-900">${key.trim()}:</strong> <span class="text-gray-700">${value}</span></p>`;
            } else {
                // Regular text line
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                currentParagraph.push(trimmed);
                // If line is long or ends with punctuation, end paragraph
                const paragraphText = currentParagraph.join(' ');
                if (paragraphText.length > 150 || (trimmed.match(/[.!?]$/) && paragraphText.length > 50)) {
                    html += `<p class="mb-4 leading-relaxed text-gray-700">${paragraphText}</p>`;
                    currentParagraph = [];
                }
            }
        });
        
        // Close any open paragraph
        if (currentParagraph.length > 0) {
            html += `<p class="mb-4 leading-relaxed text-gray-700">${currentParagraph.join(' ')}</p>`;
        }
        
        // Close any open list
        if (inList) {
            html += '</ul>';
        }
        
        return html || lines.map(l => `<p class="mb-4 leading-relaxed text-gray-700">${l.trim()}</p>`).join('');
    };

    // Get description content - MUST be before early returns
    const descriptionContent = selectedVariant?.description || product?.description || product?.details || '';
    const htmlContent = typeof descriptionContent === 'string' ? descriptionContent : String(descriptionContent);
    
    // Parse description - MUST be before early returns
    const { sections, extractedSpecs } = useMemo(() => {
        if (typeof window === 'undefined' || !htmlContent || !product) {
            return { sections: [], extractedSpecs: {} };
        }
        return parseDescription(htmlContent);
    }, [htmlContent, product]);
    
    // Merge extracted specs with existing specifications - MUST be before early returns
    const allSpecifications = useMemo(() => {
        if (!product) return {};
        return { ...product.specifications, ...extractedSpecs };
    }, [product, extractedSpecs]);
    
    const specifications = Object.entries(allSpecifications || {}).filter(([_, value]) => value);

    if (loading) return <ProductDetailSkeleton />;
    if (!product) return <div className="container mx-auto p-8 text-center"><h2 className="text-2xl font-bold">Product Not Found</h2></div>;

    const productUrl = viewToUrl({ page: 'productDetail', itemNumber: product.itemNumber });
    const productImage = product.imageUrl || (product.images && product.images[0]) || 'https://medifocal.com/og-image.jpg';
    
    // Check if product is a dental chair for SEO optimization
    const isDentalChair = product.category?.toLowerCase().includes('dental chair') || 
                          product.parentCategory?.toLowerCase().includes('dental chair') ||
                          product.name?.toLowerCase().includes('dental chair') ||
                          product.name?.toLowerCase().includes('treatment unit');
    
    // Enhanced SEO using utility functions
    const seoTitle = getProductSEOTitle(
        product.name,
        product.category || product.parentCategory,
        product.manufacturer
    );
    
    // Enhanced SEO description - Ensure uniqueness with item number
    let seoDescription = '';
    if (product.description) {
        // Use product description but enhance with unique identifiers
        const baseDesc = product.description.substring(0, 120);
        seoDescription = `${baseDesc}${product.itemNumber ? ` Item #${product.itemNumber}.` : ''} ${product.manufacturer ? `By ${product.manufacturer}.` : ''} Fast shipping Australia-wide.`;
        if (seoDescription.length > 160) {
            seoDescription = seoDescription.substring(0, 157) + '...';
        }
    } else {
        seoDescription = getProductSEODescription(
            product.name,
            product.category || product.parentCategory,
            product.manufacturer,
            product.displayPrice,
            undefined, // features
            product.itemNumber // Add item number for uniqueness
        );
    }
    
    // For dental chairs, enhance description further with unique details
    if (isDentalChair) {
        const chairDesc = `${product.name}${product.manufacturer ? ` by ${product.manufacturer}` : ''} - Premium dental chair for Australian practices. ${product.itemNumber ? `Item #${product.itemNumber}.` : ''} ${product.displayPrice ? `Price: ${product.displayPrice}.` : ''} Remote control treatment unit. Fast shipping, expert installation, 60+ years experience.`;
        seoDescription = chairDesc.length > 160 ? chairDesc.substring(0, 157) + '...' : chairDesc;
    }

    const faqs = [
        { q: "What is the warranty on this product?", a: "We offer a comprehensive 2-year warranty on all manufacturing defects. Contact us for warranty claims." },
        { q: "How fast is the shipping?", a: "Free express shipping (2-3 business days) is included with all orders over $500. Standard shipping is available for smaller orders." },
        { q: "Do you offer installation services?", a: "Yes! We provide professional installation services for dental equipment. Contact us to schedule an installation appointment." },
        { q: "Can I return this product if I'm not satisfied?", a: "Yes, we offer a 30-day return policy. Products must be in original condition. Contact us to initiate a return." }
    ];

    return (
        <div className="bg-white">
            {/* Announcement Bar */}
            <div className="bg-brand-blue text-white text-xs md:text-sm font-medium py-2 px-4 text-center">
                <span className="inline-block animate-pulse mr-2">🔥</span>
                Bundle Deal: Save 10% when you add 2+ related products to your cart!
            </div>

            <SEOHead
                title={seoTitle}
                description={seoDescription}
                url={`https://medifocal.com${productUrl}`}
                image={productImage}
                type="product"
                product={{
                    name: product.name,
                    price: product.price || 0,
                    currency: 'AUD',
                    availability: 'in stock',
                    brand: product.manufacturer || 'Medifocal',
                    category: product.category || product.parentCategory || 'Dental Equipment'
                }}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
                <ProductSchema product={{
                    ...product,
                    rating: reviewSummary?.averageRating || product.rating,
                    reviewCount: reviewSummary?.totalReviews || product.reviewCount
                }} />

                {/* MOBILE LAYOUT - Complete Single Column Stack */}
                <div className="block lg:hidden space-y-6">
                    {/* 1. Mobile: Main Image with Arrows */}
                    <div className="w-full">
                        <div className="relative border-2 border-gray-200 rounded-xl p-2 shadow-lg bg-white mb-3">
                            {allImages.length > 0 ? (
                                <div 
                                    className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50"
                                    onTouchStart={onTouchStart}
                                    onTouchMove={onTouchMove}
                                    onTouchEnd={onTouchEnd}
                                >
                                    <img 
                                        src={getImageUrl(activeImage || allImages[0])} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain rounded-lg transition-opacity duration-300" 
                                        onError={() => {
                                            setImageErrors(prev => new Set(prev).add(activeImage || allImages[0]));
                                            setActiveImage('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2218%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E');
                                        }} 
                                        fetchPriority="high" 
                                        decoding="async"
                                    />
                                    
                                    {allImages.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg border border-gray-200 z-10"
                                                aria-label="Previous image"
                                            >
                                                <ChevronLeftIcon />
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-lg border border-gray-200 z-10"
                                                aria-label="Next image"
                                            >
                                                <ChevronRightIcon />
                                            </button>
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                                                {currentImageIndex + 1} / {allImages.length}
                                            </div>
                                        </>
                                    )}
                                    {/* Scarcity Badge */}
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-red-600 text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Low Stock
                                    </span>
                                </div>
                            ) : (
                                <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
                                    <img src={placeholderSvg} alt="No image" className="w-full h-full object-contain opacity-50" />
                                </div>
                            )}
                        </div>

                        {/* Mobile: Thumbnails (3 + View More) */}
                        {allImages.length > 1 && (
                            <div className="mt-6 pt-4">
                                <div className="flex gap-3 overflow-x-auto pb-3 pt-2 -mx-2 px-2 pl-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {(showAllImages ? allImages : allImages.slice(0, 3)).map((img, i) => {
                                        const actualIndex = showAllImages ? i : i;
                                        return (
                                            <button 
                                                key={`${img}-${actualIndex}`}
                                                onClick={() => {
                                                    setActiveImage(img);
                                                    setCurrentImageIndex(actualIndex);
                                                }} 
                                                className={`relative flex-shrink-0 w-24 h-24 border-2 rounded-lg p-1.5 bg-white transition-all snap-center ${
                                                    activeImage === img 
                                                        ? 'border-brand-blue ring-2 ring-brand-blue ring-offset-2 shadow-md scale-105 z-10' 
                                                        : 'border-gray-200 z-0'
                                                }`}
                                            >
                                                <img 
                                                    src={getImageUrl(img)} 
                                                    alt={`${product.name}${product.manufacturer ? ` by ${product.manufacturer}` : ''} - Image ${actualIndex + 1}`}
                                                    className="w-full h-full object-contain rounded" 
                                                    onError={() => setImageErrors(prev => new Set(prev).add(img))} 
                                                    loading="lazy"
                                                    width="96"
                                                    height="96"
                                                />
                                            </button>
                                        );
                                    })}
                                    {!showAllImages && allImages.length > 3 && (
                                        <button
                                            onClick={() => setShowAllImages(true)}
                                            className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-brand-blue transition-all flex flex-col items-center justify-center snap-center"
                                        >
                                            <svg className="w-6 h-6 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-xs font-semibold text-gray-600">View More</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5">+{allImages.length - 3}</span>
                                        </button>
                                    )}
                                </div>
                                {showAllImages && (
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Showing all {allImages.length} images • 
                                        <button onClick={() => setShowAllImages(false)} className="text-brand-blue hover:underline ml-1">Show less</button>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 2. Mobile: Product Info */}
                    <div className="space-y-4">
                        <div>
                            <p className="font-bold text-gray-600 uppercase tracking-wide text-xs mb-1">{product.manufacturer}</p>
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">{product.name}</h1>
                            <p className="text-xs text-gray-500 mb-3 font-semibold">Item #: {selectedVariant?.itemNumber || product.itemNumber}</p>
                            <div className="flex items-baseline gap-2 mb-3">
                                <p className="text-3xl font-extrabold text-brand-blue">{product.displayPrice || `$${product.price}`}</p>
                                {product.originalPrice && <span className="text-lg text-gray-400 line-through">{product.originalPrice}</span>}
                            </div>
                            <div className="flex items-center text-xs font-semibold mb-4 text-green-700 bg-green-50 p-2 rounded-md w-fit">
                                <CheckCircleIcon /> <span className="ml-1.5">In Stock & Ready to Ship</span>
                            </div>
                        </div>

                        {/* 3. Mobile: Horizontal Swipeable Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="border-t border-b border-gray-200 py-4">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Select Option</h3>
                                <div className="flex gap-3 overflow-x-auto pb-3 pt-2 -mx-2 px-2 pl-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {filteredVariants.map((v: any, index: number) => {
                                        const variantName = getVariantDisplayName(v, index);
                                        const isSelected = selectedVariant && (
                                            (selectedVariant.id && v.id && selectedVariant.id === v.id) ||
                                            (selectedVariant.sku && v.sku && selectedVariant.sku === v.sku) ||
                                            (selectedVariant.itemNumber && v.itemNumber && selectedVariant.itemNumber === v.itemNumber && v.itemNumber !== product.itemNumber)
                                        );
                                        return (
                                            <button
                                                key={v.id || v.sku || v.itemNumber || index}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`relative flex-shrink-0 w-48 p-4 border-2 rounded-xl transition-all snap-center ${
                                                    isSelected ? 'border-brand-blue bg-brand-blue text-white ring-2 ring-brand-blue ring-offset-2 shadow-lg scale-105 z-10' : 'border-gray-200 bg-white z-0'
                                                }`}
                                            >
                                                <h4 className={`font-bold text-sm mb-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{variantName}</h4>
                                                {v.displayPrice && <p className={`text-lg font-extrabold ${isSelected ? 'text-white' : 'text-brand-blue'}`}>{v.displayPrice}</p>}
                                                {isSelected && (
                                                    <div className="mt-2 flex items-center gap-1 text-xs text-white/90">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>Selected</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-2">Swipe to see more • {filteredVariants.length} options</p>
                            </div>
                        )}

                        {/* 4. Mobile: Add to Cart */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"><MinusIcon /></button>
                                    <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-14 text-center border-l border-r border-gray-300 font-bold text-base focus:outline-none focus:ring-2 focus:ring-brand-blue" min="1" />
                                    <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"><PlusIcon /></button>
                                </div>
                            </div>
                            <button 
                                id="main-cta"
                                onClick={handleAddToCart} 
                                disabled={btnState === 'loading' || btnState === 'success'}
                                className={`w-full font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg text-base relative overflow-hidden ${
                                    btnState === 'success' 
                                        ? 'bg-green-600 text-white' 
                                        : btnState === 'loading'
                                        ? 'bg-brand-blue-600 text-white cursor-wait'
                                        : 'bg-brand-blue text-white hover:bg-brand-blue-700 active:scale-95'
                                }`}
                            >
                                {btnState === 'idle' && (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span>Add to Cart</span>
                                        {bundleSavings > 0 && (
                                            <span className="ml-2 text-xs opacity-80 border-l border-white/20 pl-2">
                                                Save ${bundleSavings.toFixed(0)}
                                            </span>
                                        )}
                                    </>
                                )}
                                {btnState === 'loading' && (
                                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {btnState === 'success' && (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Added to Cart!</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* DESKTOP LAYOUT - Grid */}
                <div className="hidden lg:grid lg:grid-cols-5 gap-8 my-8">
                    {/* Desktop: Image Gallery (Left) */}
                    <div className="lg:col-span-3">
                        <div className="sticky top-24">
                            <div className="relative border-2 border-gray-200 rounded-xl p-4 shadow-lg bg-white mb-4">
                                {allImages.length > 0 ? (
                                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-gray-50">
                                        <img 
                                            src={getImageUrl(activeImage || allImages[0])} 
                                            alt={`${product.name}${product.manufacturer ? ` by ${product.manufacturer}` : ''}${product.category ? ` - ${product.category}` : ''}`}
                                            className="w-full h-full object-contain rounded-lg" 
                                            onError={() => {
                                                setImageErrors(prev => new Set(prev).add(activeImage || allImages[0]));
                                                setActiveImage('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2218%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E');
                                            }} 
                                            fetchPriority="high" 
                                            decoding="async"
                                            width="800"
                                            height="800"
                                        />
                                        {allImages.length > 1 && (
                                            <>
                                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg border border-gray-200 z-10"><ChevronLeftIcon /></button>
                                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-3 shadow-lg border border-gray-200 z-10"><ChevronRightIcon /></button>
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                                                    {currentImageIndex + 1} / {allImages.length}
                                                </div>
                                            </>
                                        )}
                                        {/* Scarcity Badge */}
                                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-red-600 text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Low Stock
                                        </span>
                                    </div>
                                ) : (
                                    <div className="w-full aspect-[4/3] flex items-center justify-center bg-gray-100 rounded-lg">
                                        <img src={placeholderSvg} alt="No image" className="w-full h-full object-contain opacity-50" />
                                    </div>
                                )}
                            </div>
                            {allImages.length > 1 && (
                                <div className="flex flex-wrap gap-3 mt-6 pt-4 pb-2">
                                    {(showAllImages ? allImages : allImages.slice(0, 3)).map((img, i) => {
                                        const actualIndex = showAllImages ? i : i;
                                        return (
                                            <button 
                                                key={`${img}-${actualIndex}`}
                                                onClick={() => { setActiveImage(img); setCurrentImageIndex(actualIndex); }} 
                                                className={`relative flex-shrink-0 w-24 h-24 border-2 rounded-lg p-1.5 bg-white transition-all ${
                                                    activeImage === img ? 'border-brand-blue ring-2 ring-brand-blue ring-offset-2 shadow-md scale-105 z-10' : 'border-gray-200 hover:border-gray-400 z-0'
                                                }`}
                                            >
                                                <img 
                                                    src={getImageUrl(img)} 
                                                    alt={`${product.name}${product.manufacturer ? ` by ${product.manufacturer}` : ''} - Image ${actualIndex + 1}`}
                                                    className="w-full h-full object-contain rounded" 
                                                    onError={() => setImageErrors(prev => new Set(prev).add(img))} 
                                                    loading="lazy"
                                                    width="96"
                                                    height="96"
                                                />
                                            </button>
                                        );
                                    })}
                                    {!showAllImages && allImages.length > 3 && (
                                        <button
                                            onClick={() => setShowAllImages(true)}
                                            className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-brand-blue transition-all flex flex-col items-center justify-center group"
                                        >
                                            <svg className="w-6 h-6 text-gray-600 mb-1 group-hover:text-brand-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-blue transition-colors">View More</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5 group-hover:text-brand-blue transition-colors">+{allImages.length - 3}</span>
                                        </button>
                                    )}
                                    {showAllImages && (
                                        <button
                                            onClick={() => setShowAllImages(false)}
                                            className="flex-shrink-0 w-24 h-24 border-2 border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-brand-blue transition-all flex flex-col items-center justify-center group"
                                        >
                                            <svg className="w-6 h-6 text-gray-600 mb-1 group-hover:text-brand-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                            <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-blue transition-colors">Show Less</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop: Product Info (Right) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 space-y-6">
                            <div>
                                <p className="font-bold text-gray-600 uppercase tracking-wide text-sm mb-1">{product.manufacturer}</p>
                                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h2>
                                <p className="text-sm text-gray-500 mb-4 font-semibold">Item #: {selectedVariant?.itemNumber || product.itemNumber}</p>
                                <div className="flex items-baseline gap-3 mb-4">
                                    <p className="text-3xl font-extrabold text-brand-blue">{product.displayPrice || `$${product.price}`}</p>
                                    {product.originalPrice && <span className="text-xl text-gray-400 line-through">{product.originalPrice}</span>}
                                </div>
                                <div className="flex items-center text-sm font-semibold mb-6 text-green-700 bg-green-50 p-2 rounded-md w-fit">
                                    <CheckCircleIcon /> <span className="ml-1.5">In Stock & Ready to Ship</span>
                                </div>
                            </div>
                            
                            {product.variants && product.variants.length > 0 && (
                                <div className="border-t border-b border-gray-200 py-4">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Select Option</h3>
                                    <div className="mb-3">
                                        <input type="text" placeholder="Search variants..." value={variantSearchTerm} onChange={(e) => setVariantSearchTerm(e.target.value)} className="w-full pl-3 pr-10 py-2 border-2 border-gray-300 rounded-lg text-sm bg-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none" />
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar pt-2 pb-2">
                                        <div className="space-y-2 pl-4">
                                            {displayedVariants.map((v: any, index: number) => {
                                                const variantName = getVariantDisplayName(v, index);
                                                const isSelected = selectedVariant && (
                                                    (selectedVariant.id && v.id && selectedVariant.id === v.id) ||
                                                    (selectedVariant.sku && v.sku && selectedVariant.sku === v.sku) ||
                                                    (selectedVariant.itemNumber && v.itemNumber && selectedVariant.itemNumber === v.itemNumber && v.itemNumber !== product.itemNumber)
                                                );
                                                return (
                                                    <button 
                                                        key={v.id || v.sku || v.itemNumber || index} 
                                                        onClick={() => setSelectedVariant(v)} 
                                                        className={`relative w-full text-left p-3 border-2 rounded-lg transition-all ${
                                                            isSelected ? 'border-brand-blue bg-brand-blue text-white ring-2 ring-brand-blue ring-offset-2 shadow-md z-10' : 'border-gray-200 bg-white hover:border-brand-blue/50 z-0'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>{variantName}</h4>
                                                            {v.displayPrice && <span className={`font-bold text-base ${isSelected ? 'text-white' : 'text-brand-blue'}`}>{v.displayPrice}</span>}
                                                            {isSelected && (
                                                                <div className="flex items-center gap-1 text-xs text-white/90">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    <span>Selected</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            {filteredVariants.length > 6 && (
                                                <div className="pt-3 border-t border-gray-200">
                                                    <button onClick={() => setShowAllVariants(!showAllVariants)} className="w-full py-2 px-4 text-sm font-semibold text-brand-blue bg-brand-blue-50 hover:bg-brand-blue-100 border-2 border-brand-blue/30 rounded-lg">
                                                        {showAllVariants ? `Show Less (${displayedVariants.length} of ${filteredVariants.length})` : `Show All ${filteredVariants.length} Variants`}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-l-lg"><MinusIcon /></button>
                                        <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center border-l border-r border-gray-300 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-brand-blue" min="1" />
                                        <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-r-lg"><PlusIcon /></button>
                                    </div>
                                </div>
                                <button 
                                    id="main-cta"
                                    onClick={handleAddToCart} 
                                    disabled={btnState === 'loading' || btnState === 'success'}
                                    className={`w-full font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-base relative overflow-hidden ${
                                        btnState === 'success' 
                                            ? 'bg-green-600 text-white' 
                                            : btnState === 'loading'
                                            ? 'bg-brand-blue-600 text-white cursor-wait'
                                            : 'bg-brand-blue text-white hover:bg-brand-blue-700 active:scale-95'
                                    }`}
                                >
                                    {btnState === 'idle' && (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Add to Cart</span>
                                            {bundleSavings > 0 && (
                                                <span className="ml-2 text-xs opacity-80 border-l border-white/20 pl-2">
                                                    Save ${bundleSavings.toFixed(0)}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {btnState === 'loading' && (
                                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {btnState === 'success' && (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Added to Cart!</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs - Below main content */}
                <section className="border-t border-gray-200 pt-8 mt-8">
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {['details', 'specifications', 'reviews', 'documents'].map(tab => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)} 
                                    className={`${
                                        activeTab === tab 
                                            ? 'border-brand-blue text-brand-blue' 
                                            : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                                    } capitalize whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="mt-6">
                        {activeTab === 'details' && (() => {
                            if (!htmlContent || htmlContent === 'No details available.') {
                                return <p className="text-gray-500">No details available for this product.</p>;
                            }
                            
                            // If we have parsed sections, display them in a structured template
                            if (sections.length > 0) {
                                return (
                                    <div className="space-y-6">
                                        {sections.map((section, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
                                                {section.title && section.title !== 'Overview' && (
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-5 pb-3 border-b-2 border-gray-200">
                                                        {section.title}
                                                    </h3>
                                                )}
                                                <div 
                                                    className={`prose prose-lg max-w-none text-gray-700 
                                                        prose-headings:font-bold prose-headings:text-gray-900
                                                        prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
                                                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
                                                        prose-a:text-brand-blue prose-a:underline hover:prose-a:text-brand-blue-700 prose-a:font-medium
                                                        prose-strong:text-gray-900 prose-strong:font-bold
                                                        prose-ul:list-disc prose-ol:list-decimal 
                                                        prose-ul:ml-6 prose-ol:ml-6 prose-li:my-2 prose-li:text-gray-700 prose-li:leading-relaxed
                                                        prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:max-w-full prose-img:mx-auto
                                                        prose-table:w-full prose-table:border-collapse prose-table:my-6 prose-table:shadow-sm
                                                        prose-th:bg-gray-100 prose-th:font-bold prose-th:p-3 prose-th:border prose-th:border-gray-300 prose-th:text-gray-900
                                                        prose-td:p-3 prose-td:border prose-td:border-gray-300 prose-td:text-gray-700
                                                        prose-blockquote:border-l-4 prose-blockquote:border-brand-blue prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:py-3 prose-blockquote:my-4
                                                        prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                                        prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
                                                        prose-hr:border-gray-300 prose-hr:my-6`}
                                                    dangerouslySetInnerHTML={{ __html: section.content || '' }} 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            
                            // Fallback: display raw HTML if parsing didn't work
                            return (
                                <div 
                                    className="prose prose-lg max-w-none text-gray-700 
                                        prose-headings:font-bold prose-headings:text-gray-900 
                                        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
                                        prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                                        prose-a:text-brand-blue prose-a:underline hover:prose-a:text-blue-700
                                        prose-strong:text-gray-800 prose-strong:font-bold
                                        prose-ul:list-disc prose-ol:list-decimal 
                                        prose-ul:ml-6 prose-ol:ml-6 prose-li:my-2 prose-li:text-gray-700
                                        prose-img:rounded-lg prose-img:shadow-md prose-img:my-4 prose-img:max-w-full
                                        prose-table:w-full prose-table:border-collapse prose-table:my-4
                                        prose-th:bg-gray-100 prose-th:font-bold prose-th:p-3 prose-th:border prose-th:border-gray-300 prose-th:text-gray-900
                                        prose-td:p-3 prose-td:border prose-td:border-gray-300 prose-td:text-gray-700
                                        prose-blockquote:border-l-4 prose-blockquote:border-brand-blue prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:py-2
                                        prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-code:text-sm
                                        prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                                        prose-hr:border-gray-300 prose-hr:my-6"
                                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                                />
                            );
                        })()}
                        {activeTab === 'specifications' && (specifications.length > 0 ? 
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm border-collapse">
                                    <tbody>
                                        {specifications.map(([key, value]) => (
                                            <tr key={key} className="border-b border-gray-200">
                                                <td className="font-bold p-3 border-r border-gray-200 bg-gray-50 capitalize w-1/3">{key.replace(/_/g, ' ')}</td>
                                                <td className="p-3">{String(value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div> : <p className="text-gray-500">No specifications available.</p>)} 
                        {activeTab === 'reviews' && (
                            <ProductReviews 
                                itemNumber={itemNumber}
                                productName={product.name}
                                productCategory={product.category}
                            />
                        )}
                        {activeTab === 'documents' && <p className="text-gray-500">No documents available for this product.</p>}
                    </div>
                </section>
            </div>

            {/* Bundle Section */}
            {relatedProducts.length > 0 && (
                <section className="mt-12 border-t border-gray-200 pt-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-blue-100 shadow-sm space-y-4 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl"></div>
                            <div className="flex justify-between items-center mb-2 relative z-10">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg md:text-xl">
                                    <span className="bg-brand-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                    Complete Your Setup
                                </h3>
                                {bundleSavings > 0 && (
                                    <span className="text-red-600 text-xs font-bold flex items-center gap-1 animate-pulse">
                                        Bundle Unlocked! Save ${bundleSavings.toFixed(0)}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3 relative z-10">
                                {/* Main Product (Locked) */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 shadow-sm opacity-80">
                                    <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                                        <img src={product.imageUrl || (product.images && product.images[0]) || ''} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                                    </div>
                                    <span className="text-sm font-bold">{product.displayPrice || `$${product.price}`}</span>
                                </div>
                                {/* Related Products as Addons */}
                                {relatedProducts.slice(0, 3).map((relatedProduct: any) => {
                                    const isSelected = selectedBundleItems.has(relatedProduct.itemNumber || relatedProduct.id);
                                    const price = relatedProduct.price || 0;
                                    const isAutoSelected = price < 200 && (
                                        (relatedProduct.name || '').toLowerCase().includes('handpiece') || 
                                        (relatedProduct.name || '').toLowerCase().includes('motor') ||
                                        price < 100
                                    );
                                    return (
                                        <div 
                                            key={relatedProduct.itemNumber || relatedProduct.id}
                                            onClick={() => toggleBundleItem(relatedProduct.itemNumber || relatedProduct.id)}
                                            className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border shadow-sm ${
                                                isSelected ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'
                                            }`}
                                        >
                                            {isAutoSelected && isSelected && (
                                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    Auto-Added
                                                </span>
                                            )}
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                                isSelected ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 bg-white'
                                            }`}>
                                                {isSelected && (
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                <img src={relatedProduct.imageUrl || (relatedProduct.images && relatedProduct.images[0]) || ''} alt={relatedProduct.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                                    {relatedProduct.name}
                                                </p>
                                                <div className="text-xs flex gap-2 mt-0.5 items-center">
                                                    <span className={`font-bold ${isSelected ? 'text-brand-blue' : 'text-gray-600'}`}>
                                                        {relatedProduct.displayPrice || `$${relatedProduct.price}`}
                                                    </span>
                                                    {isAutoSelected && (
                                                        <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-semibold">
                                                            Add-on
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {isSelected ? (
                                                    <svg className="w-4 h-4 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Trust Badges */}
            <section className="mt-12 border-t border-gray-200 pt-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 gap-4 text-center py-6">
                        <div className="flex flex-col items-center gap-2">
                            <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">2 Year Warranty</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">Free Shipping</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-xs font-medium text-gray-700">Secure Payment</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="mt-12 py-12 bg-blue-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-blue-100">
                                <button 
                                    onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                                    className="flex w-full items-center justify-between py-4 px-6 text-left font-medium text-gray-900 hover:text-brand-blue transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    {expandedFAQ === i ? (
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>
                                {expandedFAQ === i && (
                                    <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {relatedProducts.length > 0 && (
                <aside className="bg-gray-50/80 py-16 mt-12">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Related Products</h2>
                        <p className="text-gray-600 mb-6">Browse similar {product.category || product.parentCategory || 'dental equipment'} products</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {relatedProducts.map(p => <ProductCard key={p.itemNumber} {...p} setCurrentView={setCurrentView} />)}
                        </div>
                        {/* Internal linking to category page for SEO */}
                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setCurrentView({ 
                                    page: 'productList', 
                                    categoryName: product.category, 
                                    parentCategory: product.parentCategory 
                                })}
                                className="text-brand-blue hover:text-brand-blue-dark font-semibold underline"
                            >
                                View all {product.category} products →
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Mobile Sticky Bottom Bar */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50 md:hidden transition-transform duration-300 ${
                showSticky ? 'translate-y-0' : 'translate-y-full'
            }`}>
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Total</p>
                        <div className="flex items-baseline gap-2">
                            <span className="font-extrabold text-lg text-gray-900">
                                ${((selectedVariant?.price || product?.price || 0) * quantity + bundleItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0) - bundleSavings).toFixed(2)}
                            </span>
                            {bundleSavings > 0 && (
                                <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-bold">
                                    -${bundleSavings.toFixed(0)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="w-[55%]">
                        <button 
                            onClick={handleAddToCart}
                            disabled={btnState === 'loading' || btnState === 'success'}
                            className={`w-full font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-lg ${
                                btnState === 'success' 
                                    ? 'bg-green-600 text-white' 
                                    : btnState === 'loading'
                                    ? 'bg-brand-blue-600 text-white cursor-wait'
                                    : 'bg-brand-blue text-white hover:bg-brand-blue-700 active:scale-95'
                            }`}
                        >
                            {btnState === 'idle' && (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                            {btnState === 'loading' && (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {btnState === 'success' && (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Added!
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;

