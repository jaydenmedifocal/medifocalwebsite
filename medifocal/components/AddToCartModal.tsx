import React, { useEffect, useState } from 'react';
import { CartItem } from '../contexts/CartContext';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CartItem | null;
  onViewCart: () => void;
  onAddAgain: () => void;
  currentQuantity: number;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  isOpen,
  onClose,
  product,
  onViewCart,
  onAddAgain,
  currentQuantity,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setShouldRender(true);
      // Trigger animation after a tiny delay to ensure DOM is ready
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, product]);

  if (!shouldRender || !product) return null;

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon with bounce animation */}
        <div className="flex justify-center mb-4">
          <div 
            className={`rounded-full bg-green-100 p-3 transform transition-all duration-500 ease-out ${
              isAnimating 
                ? 'scale-100 rotate-0' 
                : 'scale-0 rotate-180'
            }`}
            style={{
              animation: isAnimating ? 'bounceIn 0.6s ease-out 0.2s both' : 'none'
            }}
          >
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: isAnimating ? 0 : 24,
                transition: 'stroke-dashoffset 0.5s ease-out 0.4s'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message with fade-in */}
        <h3 
          className={`text-xl font-bold text-gray-900 text-center mb-2 transition-all duration-500 ${
            isAnimating 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: isAnimating ? '0.3s' : '0s' }}
        >
          Added to Cart!
        </h3>
        <p 
          className={`text-sm text-gray-600 text-center mb-4 transition-all duration-500 ${
            isAnimating 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-2'
          }`}
          style={{ transitionDelay: isAnimating ? '0.4s' : '0s' }}
        >
          {product.name} has been added to your cart
        </p>

        {/* Product Preview with slide-in */}
        <div 
          className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6 transition-all duration-500 ${
            isAnimating 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-4'
          }`}
          style={{ transitionDelay: isAnimating ? '0.5s' : '0s' }}
        >
          {product.imageUrl && (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className={`w-16 h-16 object-contain rounded transition-all duration-500 ${
                isAnimating 
                  ? 'scale-100 rotate-0' 
                  : 'scale-0 rotate-12'
              }`}
              style={{ transitionDelay: isAnimating ? '0.6s' : '0s' }}
            />
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900 line-clamp-2">{product.name}</p>
            <p className="text-sm text-gray-600 mt-1">
              Quantity: {currentQuantity} × {product.displayPrice}
            </p>
            <p className="text-sm font-bold text-brand-blue mt-1">
              Total: ${(product.price * currentQuantity).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons with stagger animation */}
        <div className="space-y-3">
          <button
            onClick={onViewCart}
            className={`w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 ${
              isAnimating 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: isAnimating ? '0.7s' : '0s' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            View Cart & Checkout
          </button>
          
          <button
            onClick={onAddAgain}
            className={`w-full bg-white border-2 border-brand-blue text-brand-blue font-bold py-3 px-4 rounded-lg hover:bg-brand-blue-50 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 ${
              isAnimating 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: isAnimating ? '0.8s' : '0s' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add to Cart Again
          </button>
          
          <button
            onClick={onClose}
            className={`w-full text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isAnimating 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: isAnimating ? '0.9s' : '0s' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
      
      {/* Add CSS animations via style tag */}
      <style>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInScale {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AddToCartModal;


