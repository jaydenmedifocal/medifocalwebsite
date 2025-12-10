import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ScrollContextType {
  isHeaderVisible: boolean;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
};

export const ScrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide header when scrolling down past 100px
        setIsHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const value = {
    isHeaderVisible,
  };

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
};

