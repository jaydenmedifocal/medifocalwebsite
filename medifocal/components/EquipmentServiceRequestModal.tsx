import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createServiceOrder } from '../services/fieldService';
import { getBusinessClient, createBusinessClient, findDuplicateClients, BusinessClient, getBusinessClients } from '../services/clients';
import { getLocations, createLocation } from '../services/fieldService';
import { Timestamp } from 'firebase/firestore';
import { trackServiceRequest } from '../services/analytics';
import { functions } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { 
  Wrench, 
  Calendar, 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Send,
  Search,
  Loader2,
  X
} from 'lucide-react';

interface EquipmentServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentType?: string;
  onSuccess?: () => void;
}

type PriorityLevel = 'Low' | 'Normal' | 'High' | 'Urgent';

const EquipmentServiceRequestModal: React.FC<EquipmentServiceRequestModalProps> = ({
  isOpen,
  onClose,
  equipmentType,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    equipmentType: equipmentType || '',
    model: '',
    serialNumber: '',
    issueDescription: '',
    priorityLevel: 'Normal' as PriorityLevel,
    preferredDate: '',
    preferredTime: '',
    contactName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    businessName: '',
    useNewLocation: true,
    streetAddress: '',
    city: '',
    state: '',
    postcode: ''
  });

  const [existingLocations, setExistingLocations] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadUserLocations();
      // Reset form when modal opens
      setFormData(prev => ({
        ...prev,
        equipmentType: equipmentType || prev.equipmentType,
        contactName: user?.displayName || prev.contactName,
        email: user?.email || prev.email,
        phone: user?.phoneNumber || prev.phone
      }));
    }
  }, [isOpen, user, equipmentType]);

  // Handle scroll to show/hide header
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isOpen]);

  const loadUserLocations = async () => {
    try {
      const locations = await getLocations();
      const userLocations = locations.filter(loc => 
        loc.ownerId === user?.uid || loc.contactId === user?.uid
      );
      setExistingLocations(userLocations);
      if (userLocations.length > 0) {
        setSelectedLocationId(userLocations[0].id);
        setFormData(prev => ({ ...prev, useNewLocation: false }));
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const setPriority = (level: PriorityLevel) => {
    setFormData(prev => ({ ...prev, priorityLevel: level }));
  };

  const handleCustomerSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchMessage(null);

    try {
      const query = searchQuery.trim();
      const isEmail = query.includes('@');
      const isPhone = /^[\d\s\-\+\(\)]+$/.test(query.replace(/\s/g, ''));

      // First, search Stripe
      let stripeCustomer = null;
      try {
        const searchStripeCustomer = httpsCallable(functions, 'searchStripeCustomer');
        const searchData: any = {};
        
        if (isEmail) {
          searchData.email = query;
        } else if (isPhone) {
          searchData.phone = query;
        } else {
          // Try as email first, then phone
          searchData.email = query;
        }

        const result = await searchStripeCustomer(searchData);
        const data = result.data as any;
        
        if (data?.found && data?.customer) {
          stripeCustomer = data.customer;
        }
      } catch (stripeError: any) {
        console.log('Stripe search error (will try business clients):', stripeError);
        // Continue to business clients search
      }

      if (stripeCustomer) {
        // Use Stripe customer data
        setFormData(prev => ({
          ...prev,
          contactName: stripeCustomer.name || prev.contactName,
          email: stripeCustomer.email || prev.email,
          phone: stripeCustomer.phone || prev.phone,
          streetAddress: stripeCustomer.address?.line1 || prev.streetAddress,
          city: stripeCustomer.address?.city || prev.city,
          state: stripeCustomer.address?.state || prev.state,
          postcode: stripeCustomer.address?.postal_code || prev.postcode,
          useNewLocation: !stripeCustomer.address
        }));
        setSearchMessage({ type: 'success', text: 'Customer found in Stripe! Details loaded.' });
        setIsSearching(false);
        return;
      }

      // Fallback to business clients search
      const clients = await getBusinessClients();
      const queryLower = query.toLowerCase();
      
      const foundClient = clients.find(client => 
        client.email?.toLowerCase() === queryLower ||
        client.phone?.replace(/\D/g, '') === query.replace(/\D/g, '') ||
        client.businessName?.toLowerCase().includes(queryLower) ||
        client.contactName?.toLowerCase().includes(queryLower)
      );

      if (foundClient) {
        setFormData(prev => ({
          ...prev,
          contactName: foundClient.contactName || prev.contactName,
          email: foundClient.email || prev.email,
          phone: foundClient.phone || prev.phone,
          businessName: foundClient.businessName || prev.businessName,
          streetAddress: foundClient.address?.street || prev.streetAddress,
          city: foundClient.address?.city || prev.city,
          state: foundClient.address?.state || prev.state,
          postcode: foundClient.address?.zip || prev.postcode,
          useNewLocation: false
        }));
        setSearchMessage({ type: 'success', text: 'Customer found! Details loaded.' });
      } else {
        setSearchMessage({ type: 'error', text: 'Customer not found. Please enter details manually.' });
      }
    } catch (error) {
      console.error('Error searching for customer:', error);
      setSearchMessage({ type: 'error', text: 'Error searching. Please try again.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Please sign in to request service');
      }

      // Convert priority to numeric
      const priorityMap: Record<PriorityLevel, string> = {
        'Low': '1',
        'Normal': '0',
        'High': '2',
        'Urgent': '3'
      };

      let clientId: string | null = null;
      let locationId: string;

      const duplicates = await findDuplicateClients({
        email: formData.email,
        businessName: formData.businessName || formData.contactName
      });

      if (duplicates.length > 0) {
        clientId = duplicates[0].id!;
      } else {
        const newClient: Omit<BusinessClient, 'id' | 'createdAt' | 'updatedAt'> = {
          businessName: formData.businessName || formData.contactName || 'Individual Customer',
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            zip: formData.postcode,
            country: 'Australia'
          },
          isActive: true
        };
        clientId = await createBusinessClient(newClient);
      }

      if (formData.useNewLocation || !selectedLocationId) {
        const locationData = {
          name: formData.businessName || formData.contactName || 'Service Location',
          completeName: `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.postcode}`,
          street: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zip: formData.postcode,
          country: 'Australia',
          ownerId: user.uid,
          contactId: user.uid,
          description: `Service location for ${formData.equipmentType || 'equipment service'}`
        };
        locationId = await createLocation(locationData);
      } else {
        locationId = selectedLocationId;
      }

      const preferredDateTime = formData.preferredDate && formData.preferredTime
        ? new Date(`${formData.preferredDate}T${formData.preferredTime}`)
        : null;

      const orderData = {
        name: `Service Request - ${formData.equipmentType || 'Equipment'}`,
        locationId,
        customerId: clientId,
        priority: priorityMap[formData.priorityLevel],
        status: 'pending',
        stage: 'pending',
        scheduledDateStart: preferredDateTime ? Timestamp.fromDate(preferredDateTime) : null,
        scheduledDuration: 60,
        description: `Equipment Type: ${formData.equipmentType}\nModel: ${formData.model}\nSerial: ${formData.serialNumber}\n\nIssue Description:\n${formData.issueDescription}\n\nContact: ${formData.contactName}\nPhone: ${formData.phone}\nEmail: ${formData.email}`,
        type: 'service',
        equipmentType: formData.equipmentType,
        equipmentModel: formData.model,
        equipmentSerial: formData.serialNumber
      };

      await createServiceOrder(orderData);
      trackServiceRequest(formData.equipmentType || 'Unknown', priorityMap[formData.priorityLevel]);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        setSuccess(false);
        setFormData({
          equipmentType: '',
          model: '',
          serialNumber: '',
          issueDescription: '',
          priorityLevel: 'Normal',
          preferredDate: '',
          preferredTime: '',
          contactName: user?.displayName || '',
          email: user?.email || '',
          phone: user?.phoneNumber || '',
          businessName: '',
          useNewLocation: true,
          streetAddress: '',
          city: '',
          state: '',
          postcode: ''
        });
        setSearchQuery('');
        setSearchMessage(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting service request:', error);
      setError(error.message || 'Failed to submit service request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 bg-green-50 rounded-xl border border-green-200 text-center shadow-lg">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-800 mb-2">Request Received</h2>
          <p className="text-green-700 text-lg mb-6">Your service request for the {formData.equipmentType} has been successfully submitted.</p>
          <button 
            onClick={() => {
              setSuccess(false);
              onClose();
              if (onSuccess) onSuccess();
            }}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header - Desktop & Mobile */}
      <div className={`fixed top-0 left-0 right-0 bg-slate-900 px-4 md:px-8 py-4 md:py-6 z-20 shadow-lg transition-transform duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              Service Request Form
            </h1>
            <p className="text-slate-300 mt-1 text-xs md:text-sm hidden md:block">
              Please fill out the details regarding the faulty equipment and preferred service time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto bg-white min-h-full">
          <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-8">
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 md:px-6 py-3 md:py-4 rounded-r-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 md:w-6 md:h-6 mr-3" />
                  <span className="font-semibold">{error}</span>
                </div>
              </div>
            )}

            {/* Section 1: Equipment Information */}
            <section className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-4 md:mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Equipment Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Equipment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="equipmentType"
                    required
                    value={formData.equipmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                  >
                    <option value="">Select Equipment...</option>
                    <option value="Dental Chair">Dental Chair</option>
                    <option value="Dental Autoclave">Dental Autoclave</option>
                    <option value="Dental Imaging">Dental Imaging</option>
                    <option value="Dental Scanner">Dental Scanner</option>
                    <option value="Dental OPG">Dental OPG</option>
                    <option value="Dental Compressor">Dental Compressor</option>
                    <option value="Dental Sensor">Dental Sensor</option>
                    <option value="Dental Suction">Dental Suction</option>
                    <option value="Dental Handpiece">Dental Handpiece</option>
                    <option value="Dental Stool">Dental Stool</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. MX-4000"
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="e.g. SN-987654321"
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Issue Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="issueDescription"
                    required
                    rows={4}
                    value={formData.issueDescription}
                    onChange={handleChange}
                    placeholder="Please describe the noise, error code, or malfunction..."
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition resize-none text-base"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Priority Level</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['Normal', 'Low', 'High', 'Urgent'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setPriority(level)}
                        className={`
                          py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all
                          ${formData.priorityLevel === level 
                            ? level === 'Urgent' ? 'bg-red-100 border-red-500 text-red-700 ring-2 ring-red-500' :
                              level === 'High' ? 'bg-orange-100 border-orange-500 text-orange-700 ring-2 ring-orange-500' :
                              level === 'Low' ? 'bg-gray-200 border-gray-400 text-gray-700 ring-2 ring-gray-400' :
                              'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-500'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                          }
                        `}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Preferred Schedule */}
            <section className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-4 md:mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Preferred Schedule
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Preferred Date</label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Preferred Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Contact Information */}
            <section className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-4 md:mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>

              {/* Customer Search Bar */}
              <div className="mb-4 md:mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Existing Customer? Search by Email or Phone
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomerSearch())}
                      placeholder="Enter email or phone number to auto-fill..."
                      className="w-full pl-10 pr-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomerSearch}
                    disabled={isSearching || !searchQuery}
                    className="px-4 md:px-6 py-2 md:py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-semibold"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </button>
                </div>
                
                {searchMessage && (
                  <div className={`mt-2 text-sm flex items-center gap-1.5 ${searchMessage.type === 'success' ? 'text-green-600' : 'text-amber-600'}`}>
                    {searchMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {searchMessage.text}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Business Name (Optional)</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Service Location */}
            <section className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b pb-2 mb-4 md:mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Service Location
              </h2>
              
              <div className="mb-4 md:mb-6">
                {existingLocations.length > 0 && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <label className="inline-flex items-center cursor-pointer mb-2">
                      <input 
                        type="radio" 
                        name="useNewLocation"
                        checked={!formData.useNewLocation}
                        onChange={() => setFormData(prev => ({ ...prev, useNewLocation: false }))}
                        className="w-5 h-5 text-brand-blue focus:ring-brand-blue"
                      />
                      <span className="ms-3 text-sm font-medium text-gray-700">Use existing location</span>
                    </label>
                    {!formData.useNewLocation && (
                      <select
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        className="w-full mt-3 px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all bg-white text-base"
                      >
                        {existingLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {loc.completeName || loc.name || `${loc.street}, ${loc.city}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="useNewLocation"
                    checked={formData.useNewLocation}
                    onChange={handleCheckboxChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">Use new location</span>
                </label>
                {!formData.useNewLocation && (
                  <p className="mt-2 text-sm text-gray-500 italic">
                    Address on file will be used for this service request.
                  </p>
                )}
              </div>

              {formData.useNewLocation && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 animate-fadeIn">
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="streetAddress"
                      required={formData.useNewLocation}
                      value={formData.streetAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required={formData.useNewLocation}
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      required={formData.useNewLocation}
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                      Postcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      required={formData.useNewLocation}
                      value={formData.postcode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 md:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition text-base"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Submit Action */}
            <div className="pt-6 pb-4 md:pb-6 border-t-2 border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 md:py-4 px-6 rounded-lg hover:bg-slate-800 transition-all text-base md:text-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Service Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentServiceRequestModal;
