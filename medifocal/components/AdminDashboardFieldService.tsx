import React, { useState, useRef } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icons - Using Lucide-style icons
const MenuIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HomeIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const OrdersIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const UsersIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CalendarIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SettingsIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const WrenchIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PackageIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const MapPinIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FileTextIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BarChartIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ChevronRightIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const LogoutIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

interface AdminDashboardProps {
  setCurrentView?: (view: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentView }) => {
  const { user, signOut, isFieldServiceUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check if user is admin (for admin-only features)
  const isAdmin = user?.email === 'admin@medifocal.com' || user?.role === 'admin';
  // Check user role for menu filtering
  const userRole = user?.role || '';

  React.useEffect(() => {
    if (!user) {
      return;
    }
    if (!isFieldServiceUser) {
      return;
    }
  }, [user, isFieldServiceUser]);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  if (!isFieldServiceUser) {
    return null;
  }

  // Filter menu items based on user role
  const canAccess = (requiredRoles: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole) || requiredRoles.includes('all');
  };

  // Hierarchical menu structure with categories
  // Each item can specify requiredRoles array - empty means all field service users can access
  const menuCategories = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      items: [
        { id: 'overview', label: 'Overview', path: '/admin', icon: HomeIcon, requiredRoles: [] },
      ]
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: OrdersIcon,
      items: [
        { id: 'orders', label: 'Service Orders', path: '/admin/orders', icon: OrdersIcon, requiredRoles: [] },
        { id: 'calendar', label: 'Schedule', path: '/admin/calendar', icon: CalendarIcon, requiredRoles: [] },
        { id: 'activities', label: 'Activities', path: '/admin/activities', requiredRoles: [] },
        { id: 'recurring', label: 'Recurring Orders', path: '/admin/recurring', requiredRoles: ['admin', 'manager'] },
        { id: 'routes', label: 'Routes', path: '/admin/routes', requiredRoles: ['admin', 'manager', 'supervisor'] },
        { id: 'dayroutes', label: 'Day Routes', path: '/admin/dayroutes', requiredRoles: ['admin', 'manager', 'supervisor'] },
      ]
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: UsersIcon,
      items: [
        { id: 'technicians', label: 'Technicians', path: '/admin/technicians', icon: WrenchIcon, requiredRoles: ['admin', 'manager'] },
        { id: 'teams', label: 'Teams', path: '/admin/teams', icon: UsersIcon, requiredRoles: ['admin', 'manager'] },
        { id: 'users', label: 'Users', path: '/admin/users', icon: UsersIcon, requiredRoles: ['admin'] },
        { id: 'clients', label: 'Clients', path: '/admin/clients', icon: UsersIcon, requiredRoles: [] },
        { id: 'skills', label: 'Skills', path: '/admin/skills', requiredRoles: ['admin', 'manager'] },
        { id: 'availability', label: 'Availability', path: '/admin/availability', requiredRoles: [] },
        { id: 'timesheets', label: 'Timesheets', path: '/admin/timesheets', requiredRoles: [] },
      ]
    },
    {
      id: 'locations',
      label: 'Locations & Equipment',
      icon: MapPinIcon,
      items: [
        { id: 'locations', label: 'Locations', path: '/admin/locations', icon: MapPinIcon, requiredRoles: [] },
        { id: 'equipment', label: 'Equipment', path: '/admin/equipment', icon: PackageIcon, requiredRoles: [] },
        { id: 'warranty', label: 'Equipment Warranty', path: '/admin/warranty', requiredRoles: [] },
        { id: 'repairs', label: 'Repair Orders', path: '/admin/repairs', requiredRoles: [] },
        { id: 'location-persons', label: 'Location Assignments', path: '/admin/location-persons', requiredRoles: ['admin', 'manager'] },
        { id: 'territories', label: 'Territories', path: '/admin/territories', requiredRoles: ['admin', 'manager'] },
      ]
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: FileTextIcon,
      items: [
        { id: 'invoices', label: 'Invoices', path: '/admin/invoices', icon: FileTextIcon, requiredRoles: ['admin', 'manager'] },
        { id: 'sales', label: 'Sales', path: '/admin/sales', requiredRoles: ['admin', 'manager'] },
        { id: 'agreements', label: 'Agreements', path: '/admin/agreements', requiredRoles: ['admin', 'manager'] },
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: PackageIcon,
      items: [
        { id: 'stock', label: 'Stock', path: '/admin/stock', icon: PackageIcon, requiredRoles: ['admin', 'manager'] },
        { id: 'categories', label: 'Categories', path: '/admin/categories', requiredRoles: ['admin'] },
        { id: 'sizes', label: 'Sizes', path: '/admin/sizes', requiredRoles: ['admin'] },
      ]
    },
    {
      id: 'master-data',
      label: 'Master Data',
      icon: SettingsIcon,
      items: [
        { id: 'order-types', label: 'Order Types', path: '/admin/order-types', requiredRoles: ['admin'] },
        { id: 'templates', label: 'Templates', path: '/admin/templates', requiredRoles: ['admin', 'manager'] },
        { id: 'recurring-templates', label: 'Recurring Templates', path: '/admin/recurring-templates', requiredRoles: ['admin', 'manager'] },
        { id: 'tags', label: 'Tags', path: '/admin/tags', requiredRoles: ['admin'] },
        { id: 'stage-actions', label: 'Stage Actions', path: '/admin/stage-actions', requiredRoles: ['admin'] },
        { id: 'frequency-sets', label: 'Frequency Sets', path: '/admin/frequency-sets', requiredRoles: ['admin'] },
        { id: 'vehicles', label: 'Vehicles', path: '/admin/vehicles', requiredRoles: ['admin', 'manager'] },
      ]
    },
    {
      id: 'integration',
      label: 'Integration',
      icon: BarChartIcon,
      items: [
        { id: 'crm', label: 'CRM Integration', path: '/admin/crm', requiredRoles: ['admin', 'manager'] },
        { id: 'projects', label: 'Projects', path: '/admin/projects', requiredRoles: ['admin', 'manager'] },
        { id: 'reports', label: 'Reports', path: '/admin/reports', icon: BarChartIcon, requiredRoles: ['admin', 'manager'] },
        { id: 'aliexpress', label: 'AliExpress Products', path: '/admin/aliexpress', icon: PackageIcon, requiredRoles: ['admin'] },
        { id: 'aliexpress-orders', label: 'AliExpress Orders', path: '/admin/aliexpress/orders', icon: OrdersIcon, requiredRoles: ['admin'] },
      ]
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: SettingsIcon,
      items: [
        { id: 'config-settings', label: 'Settings', path: '/admin/config-settings', icon: SettingsIcon, requiredRoles: ['admin'] },
        { id: 'calendar-filters', label: 'Calendar Filters', path: '/admin/calendar-filters', requiredRoles: ['admin'] },
        { id: 'conversion-wizard', label: 'Conversion Wizard', path: '/admin/conversion-wizard', requiredRoles: ['admin'] },
        { id: 'raspberry-pi', label: 'Raspberry Pi Management', path: '/admin/raspberry-pi', icon: SettingsIcon, requiredRoles: ['admin'] },
      ]
    },
  ].map(category => ({
    ...category,
    items: category.items.filter(item => canAccess(item.requiredRoles || []))
  })).filter(category => category.items.length > 0); // Remove empty categories


  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to home page after logout
      if (setCurrentView) {
        setCurrentView({ page: 'home' });
      } else {
        window.location.href = 'https://medifocal.com';
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBackToHome = () => {
    // Navigate to medifocal.com or home page
    // Use full page reload to ensure proper state reset and layout restoration
    if (setCurrentView) {
      // Update URL and state first
      window.history.pushState({}, '', '/');
      setCurrentView({ page: 'home' });
      // Force a full page reload to ensure clean state
      window.location.href = '/';
    } else {
      window.location.href = 'https://medifocal.com';
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans overflow-hidden relative">

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative z-10">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-20 relative">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center bg-transparent border-none text-gray-500 cursor-pointer p-2 rounded-lg transition-all mr-2 min-w-[40px] min-h-[40px] hover:bg-gray-100 hover:text-gray-700"
              aria-label="Toggle menu"
            >
              {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-1.5 bg-transparent border-none text-gray-500 cursor-pointer px-3 py-2 rounded-lg transition-all mr-2 text-sm font-medium hover:bg-gray-100 hover:text-blue-600"
              title="Back to Medifocal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
              <span>M</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 m-0 leading-tight sm:text-sm">Medifocal Field Service</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-[11px] text-gray-500 font-medium">System Operational</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:flex items-center">
              <SearchIcon size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-3 py-2 bg-gray-100 border-2 border-transparent rounded-lg text-sm w-64 transition-all focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="relative p-2 bg-transparent border-none text-gray-500 cursor-pointer rounded-lg transition-all hover:bg-gray-100 hover:text-gray-700">
              <BellIcon size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center font-semibold text-[13px] border-2 border-white shadow-md cursor-pointer transition-all hover:bg-gray-700 hover:shadow-lg"
                title={user?.email || 'User'}
              >
                {getUserInitials()}
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-[1000] overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="font-semibold text-gray-900 text-sm">
                      {user?.displayName || 'User'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left bg-transparent border-none cursor-pointer flex items-center gap-2 text-red-600 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    <LogoutIcon size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Unified Menu - Works for both desktop and mobile */}
        <div className={`fixed top-16 left-0 w-80 max-w-[85vw] h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg z-[150] transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden md:top-16 md:h-[calc(100vh-4rem)] ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <h2 className="text-base font-bold text-gray-900 m-0">Navigation</h2>
            <button onClick={() => setMenuOpen(false)} className="bg-transparent border-none text-gray-500 cursor-pointer p-1 rounded transition-all hover:bg-gray-200 hover:text-gray-700">
              <CloseIcon size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 flex flex-col min-h-0">
            {menuCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isExpanded = expandedCategories.includes(category.id);
              const hasActiveItem = category.items.some(item => isActive(item.path));
              
              return (
                <div key={category.id} className="border-b border-gray-100">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full px-5 py-3 flex justify-between items-center bg-transparent border-none cursor-pointer transition-all text-left ${hasActiveItem ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-2.5 font-semibold text-sm text-gray-700">
                      <CategoryIcon size={18} />
                      <span className={hasActiveItem ? 'text-blue-600' : ''}>{category.label}</span>
                    </div>
                    <ChevronRightIcon size={16} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="bg-gray-50 py-1">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        const itemIsActive = isActive(item.path);
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              navigate(item.path);
                              setMenuOpen(false);
                            }}
                            className={`w-full px-5 py-2.5 pl-[50px] flex items-center gap-2.5 bg-transparent border-none cursor-pointer text-left text-sm transition-all ${itemIsActive ? 'bg-blue-100 text-blue-600 font-semibold border-l-3 border-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                          >
                            {ItemIcon && <ItemIcon size={16} />}
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Logout button at bottom of menu */}
          <div className="border-t border-gray-200 px-5 py-3 flex-shrink-0 bg-white">
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full px-5 py-2.5 flex items-center gap-2.5 bg-transparent border-none cursor-pointer text-left text-sm text-red-600 font-medium transition-all rounded-md hover:bg-red-50 hover:text-red-700"
            >
              <LogoutIcon size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6 w-full box-border md:p-4">
          <Outlet />
        </div>
      </div>

      {/* Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[100] transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} md:hidden`}
        onClick={() => setMenuOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;

