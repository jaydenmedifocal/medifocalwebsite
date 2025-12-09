import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { trackAddToCart, trackRemoveFromCart } from '../services/analytics';

export interface CartItem {
  id: string;
  itemNumber: string;
  name: string;
  imageUrl: string;
  price: number;
  displayPrice: string;
  quantity: number;
  manufacturer?: string;
  category?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'medifocal_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items, isLoading]);

  const addItem = useCallback((product: any, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id || item.itemNumber === product.itemNumber);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = prevItems.map(item =>
          item.id === existingItem.id || item.itemNumber === existingItem.itemNumber
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        // Track add to cart
        trackAddToCart(
          product.id || product.itemNumber,
          product.name,
          product.price || 0,
          quantity,
          product.category
        );
        return updatedItems;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: product.id || product.itemNumber,
          itemNumber: product.itemNumber || product.id,
          name: product.name,
          imageUrl: product.imageUrl || product.images?.[0] || '',
          price: product.price || 0,
          displayPrice: product.displayPrice || `$${product.price || 0}`,
          quantity: quantity,
          manufacturer: product.manufacturer,
          category: product.category
        };
        // Track add to cart
        trackAddToCart(
          newItem.id,
          newItem.name,
          newItem.price,
          quantity,
          newItem.category
        );
        return [...prevItems, newItem];
      }
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.id === itemId || item.itemNumber === itemId);
      if (itemToRemove) {
        // Track remove from cart
        trackRemoveFromCart(
          itemToRemove.id,
          itemToRemove.name,
          itemToRemove.price,
          itemToRemove.quantity
        );
      }
      return prevItems.filter(item => item.id !== itemId && item.itemNumber !== itemId);
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        (item.id === itemId || item.itemNumber === itemId)
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const getTotal = useCallback(() => {
    const subtotal = getSubtotal();
    const shipping = subtotal > 0 ? 15.00 : 0; // Free shipping over threshold could be added
    const tax = subtotal * 0.10; // 10% tax
    return subtotal + shipping + tax;
  }, [getSubtotal]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getSubtotal,
    getItemCount,
    isLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

