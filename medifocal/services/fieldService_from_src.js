import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

/**
 * Field Service Management Service
 * Works with existing Firebase collections
 */

// Collection names - flexible to match your setup
// Based on field-service-18.0 structure
const COLLECTIONS = {
  ORDERS: 'fsmOrders', // Field Service Orders (from field-service-18.0)
  LOCATIONS: 'fsmLocations', // Field Service Locations (from field-service-18.0)
  EQUIPMENT: 'equipmentAssets', // Equipment (already exists)
  CUSTOMERS: 'customers', // Users/Technicians
  TEAMS: 'fsmTeams', // Field Service Teams (from field-service-18.0)
  STAGES: 'fsmStages', // Order stages (from field-service-18.0)
  CATEGORIES: 'fsmCategories', // Service categories (from field-service-18.0)
  ACTIVITIES: 'fsmActivities', // Activities/Checklists (from field-service-18.0)
  ACTIVITY_TEMPLATES: 'fsmActivityTemplates', // Activity templates
  RECURRING: 'fsmRecurring', // Recurring orders (from field-service-18.0)
  TERRITORIES: 'territories', // Territories (from base_territory)
  BRANCHES: 'branches', // Branches
  DISTRICTS: 'districts', // Districts
  REGIONS: 'regions', // Regions
  ROUTES: 'fsmRoutes', // Routes (from fieldservice_route)
  SKILLS: 'fsmSkills', // Skills (from fieldservice_skill)
  AGREEMENTS: 'fsmAgreements', // Agreements (from fieldservice_agreement)
  VEHICLES: 'fsmVehicles', // Vehicles (from fieldservice_vehicle)
  TAGS: 'fsmTags', // Tags (from fieldservice)
  ORDER_TYPES: 'fsmOrderTypes', // Order Types (from fieldservice)
  ORDER_TEMPLATES: 'fsmTemplates', // Order Templates (from fieldservice)
  CATEGORIES: 'fsmCategories', // Categories (from fieldservice)
  SIZES: 'fsmSizes', // Sizes (from fieldservice_size)
  TIMESHEETS: 'timesheets', // Timesheets (from fieldservice_timesheet)
  STOCK_PICKINGS: 'stockPickings', // Stock pickings (from fieldservice_stock)
  BLACKOUT_DAYS: 'fsmBlackoutDays', // Blackout days (from fieldservice_availability)
  STRESS_DAYS: 'fsmStressDays', // Stress days (from fieldservice_availability)
  DELIVERY_TIME_RANGES: 'fsmDeliveryTimeRanges', // Delivery time ranges
  REPAIR_ORDERS: 'repairOrders', // Repair orders (from fieldservice_repair)
  CRM_LEADS: 'crmLeads', // CRM leads (from fieldservice_crm)
  PROJECTS: 'projects', // Projects (from fieldservice_project)
  INVOICES: 'invoices', // Invoices (from fieldservice_account)
  SALES_ORDERS: 'salesOrders', // Sales orders (from fieldservice_sale)
  FREQUENCY_SETS: 'fsmFrequencySets', // Frequency sets (from fieldservice_recurring)
  FREQUENCIES: 'fsmFrequencies', // Frequency rules (from fieldservice_recurring)
  RECURRING_TEMPLATES: 'fsmRecurringTemplates', // Recurring templates (from fieldservice_recurring)
  DAYROUTES: 'fsmDayroutes', // Day routes (from fieldservice_route)
  LOCATION_PERSONS: 'fsmLocationPersons', // Location person assignments
  EQUIPMENT_STOCK: 'equipmentStock', // Equipment stock links
  CONFIG_SETTINGS: 'fsmConfigSettings', // Configuration settings
  REPAIR_TEMPLATES: 'repairTemplates', // Repair order templates
  ROUTE_BLACKOUT_GROUPS: 'fsmRouteBlackoutGroups', // Route blackout groups
  PERSON_CALENDAR_FILTERS: 'fsmPersonCalendarFilters', // Person calendar filters
  ROUTE_DAYS: 'fsmRouteDays' // Route days (reference data)
};

/**
 * Get all service orders
 * Based on fsm.order model from field-service-18.0
 */
export const getServiceOrders = async (filters = {}) => {
  try {
    // Try fsmOrders first, fallback to orders
    let ordersRef = collection(db, COLLECTIONS.ORDERS);
    let snapshot;
    
    try {
      let q = query(ordersRef, orderBy('createdAt', 'desc'));

      if (filters.status || filters.stage) {
        const statusFilter = filters.status || filters.stage;
        q = query(ordersRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
      }

      if (filters.technicianId || filters.personId) {
        const techId = filters.technicianId || filters.personId;
        q = query(ordersRef, where('personId', '==', techId), orderBy('createdAt', 'desc'));
      }

      if (filters.locationId) {
        q = query(ordersRef, where('locationId', '==', filters.locationId), orderBy('createdAt', 'desc'));
      }

      snapshot = await getDocs(q);
    } catch (error) {
      // Fallback to orders collection
      ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('type', '==', 'service'), orderBy('createdAt', 'desc'));
      snapshot = await getDocs(q);
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || `SO-${doc.id}`,
        locationId: data.locationId || data.location_id,
        locationName: data.locationName || data.location_name,
        personId: data.personId || data.person_id || data.technicianId,
        technicianName: data.technicianName || data.person_name,
        priority: data.priority || '0',
        status: data.status || data.stage || 'pending',
        stage: data.stage || data.status || 'pending',
        scheduledDateStart: data.scheduledDateStart || data.scheduled_date_start,
        scheduledDuration: data.scheduledDuration || data.scheduled_duration || 0,
        description: data.description,
        resolution: data.resolution,
        dateStart: data.dateStart || data.date_start,
        dateEnd: data.dateEnd || data.date_end,
        duration: data.duration,
        equipmentIds: data.equipmentIds || data.equipment_ids || [],
        teamId: data.teamId || data.team_id,
        ...data
      };
    });
  } catch (error) {
    console.error('Error fetching service orders:', error);
    return [];
  }
};

/**
 * Get service order by ID
 */
export const getServiceOrder = async (orderId) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching service order:', error);
    return null;
  }
};

/**
 * Create service order
 * Based on fsm.order model from field-service-18.0
 */
export const createServiceOrder = async (orderData) => {
  try {
    // Try fsmOrders first, fallback to orders
    let ordersRef = collection(db, COLLECTIONS.ORDERS);
    
    try {
      // Test if collection exists
      await getDocs(query(ordersRef, limit(1)));
    } catch (error) {
      // Fallback to orders collection
      ordersRef = collection(db, 'orders');
    }
    
    // Based on fsm.order structure
    const newOrder = {
      name: orderData.name || `SO-${Date.now()}`,
      locationId: orderData.locationId,
      location_id: orderData.locationId, // Support both naming conventions
      personId: orderData.personId,
      person_id: orderData.personId,
      priority: orderData.priority || '0', // 0=Normal, 1=Low, 2=High, 3=Urgent
      status: orderData.status || 'pending',
      stage: orderData.stage || orderData.status || 'pending',
      scheduledDateStart: orderData.scheduledDateStart,
      scheduled_date_start: orderData.scheduledDateStart,
      scheduledDuration: orderData.scheduledDuration || 0,
      scheduled_duration: orderData.scheduledDuration || 0,
      description: orderData.description || '',
      equipmentIds: orderData.equipmentId ? [orderData.equipmentId] : [],
      equipment_ids: orderData.equipmentId ? [orderData.equipmentId] : [],
      teamId: orderData.teamId,
      team_id: orderData.teamId,
      type: 'service',
      createdAt: Timestamp.now(),
      created_at: Timestamp.now(),
      updatedAt: Timestamp.now(),
      updated_at: Timestamp.now()
    };

    const docRef = await addDoc(ordersRef, newOrder);
    
    // Send email notification (email only, no SMS)
    try {
      const sendServiceBookingRequest = httpsCallable(functions, 'sendServiceBookingRequest');
      await sendServiceBookingRequest({
        orderId: docRef.id,
        customerId: orderData.customerId,
        equipmentId: orderData.equipmentId,
        preferredDate: orderData.scheduledDateStart?.toDate ? 
          orderData.scheduledDateStart.toDate().toISOString() : 
          orderData.preferredDate,
        notes: orderData.description
      });
    } catch (emailError) {
      console.error('Error sending service booking email:', emailError);
      // Continue even if email fails
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating service order:', error);
    throw error;
  }
};

/**
 * Update service order
 */
export const updateServiceOrder = async (orderId, updates) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating service order:', error);
    throw error;
  }
};

/**
 * Get all technicians (field service workers)
 * Based on fsm.person model from field-service-18.0
 */
export const getTechnicians = async () => {
  try {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const q = query(
      customersRef,
      where('role', 'in', ['technician', 'manager', 'supervisor'])
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        displayName: data.displayName || data.display_name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
        email: data.email,
        phone: data.phone || data.mobile,
        mobile: data.mobile || data.phone,
        role: data.role || 'technician',
        active: data.active !== false, // Default to true
        categoryIds: data.categoryIds || data.category_ids || [],
        territoryIds: data.territoryIds || data.territory_ids || [],
        locationIds: data.locationIds || data.location_ids || [],
        ...data
      };
    });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return [];
  }
};

/**
 * Get all locations
 * Based on fsm.location model from field-service-18.0
 */
export const getLocations = async () => {
  try {
    // Try fsmLocations first, fallback to addresses
    let locationsRef = collection(db, COLLECTIONS.LOCATIONS);
    let snapshot;
    
    try {
      snapshot = await getDocs(locationsRef);
    } catch (error) {
      // Fallback to addresses collection
      locationsRef = collection(db, 'addresses');
      snapshot = await getDocs(locationsRef);
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || data.completeName || data.complete_name,
        completeName: data.completeName || data.complete_name || data.name,
        street: data.street,
        city: data.city,
        state: data.state || data.state_name,
        zip: data.zip || data.postcode,
        country: data.country || data.country_name,
        direction: data.direction,
        description: data.description,
        notes: data.notes,
        parentId: data.parentId || data.parent_id,
        territoryId: data.territoryId || data.territory_id,
        ownerId: data.ownerId || data.owner_id,
        contactId: data.contactId || data.contact_id,
        personIds: data.personIds || data.person_ids || [],
        equipmentCount: data.equipmentCount || data.equipment_count || 0,
        ...data
      };
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

/**
 * Get all equipment
 */
export const getEquipment = async (customerId = null) => {
  try {
    const equipmentRef = collection(db, COLLECTIONS.EQUIPMENT);
    let q = query(equipmentRef, orderBy('createdAt', 'desc'));

    if (customerId) {
      q = query(equipmentRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return [];
  }
};

/**
 * Report equipment fault
 */
export const reportEquipmentFault = async (faultData) => {
  try {
    const reportFault = httpsCallable(functions, 'reportEquipmentFault');
    const result = await reportFault({
      customerId: faultData.customerId,
      equipmentId: faultData.equipmentId,
      description: faultData.description,
      images: faultData.images || []
    });
    return result.data;
  } catch (error) {
    console.error('Error reporting equipment fault:', error);
    throw error;
  }
};

/**
 * Get service alerts (equipment needing service)
 * Based on checkServiceAlerts scheduled function
 */
export const getServiceAlerts = async () => {
  try {
    const equipmentRef = collection(db, COLLECTIONS.EQUIPMENT);
    const now = Timestamp.now();
    
    // Get equipment with upcoming or overdue service dates
    const snapshot = await getDocs(equipmentRef);
    
    const alerts = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const nextService = data.nextRequiredServiceDate || data.next_required_service_date;
      
      if (nextService) {
        const serviceDate = nextService.toDate ? nextService.toDate() : new Date(nextService);
        const daysUntilService = Math.ceil((serviceDate - new Date()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilService <= 30) { // Service due within 30 days
          alerts.push({
            id: doc.id,
            ...data,
            daysUntilService,
            isOverdue: daysUntilService < 0
          });
        }
      }
    });

    return alerts.sort((a, b) => a.daysUntilService - b.daysUntilService);
  } catch (error) {
    console.error('Error fetching service alerts:', error);
    return [];
  }
};

/**
 * Get all teams
 * Based on fsm.team model from field-service-18.0
 */
export const getTeams = async () => {
  try {
    const teamsRef = collection(db, COLLECTIONS.TEAMS);
    const snapshot = await getDocs(teamsRef);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description || '',
        sequence: data.sequence || 0,
        orderCount: data.orderCount || data.order_count || 0,
        ...data
      };
    }).sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

/**
 * Get all stages
 * Based on fsm.stage model from field-service-18.0
 */
export const getStages = async (stageType = 'order') => {
  try {
    const stagesRef = collection(db, COLLECTIONS.STAGES);
    const q = query(stagesRef, where('stageType', '==', stageType), orderBy('sequence', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        sequence: data.sequence || 0,
        isClosed: data.isClosed || data.is_closed || false,
        isDefault: data.isDefault || data.is_default || false,
        customColor: data.customColor || data.custom_color || '#FFFFFF',
        stageType: data.stageType || data.stage_type || stageType,
        ...data
      };
    });
  } catch (error) {
    console.error('Error fetching stages:', error);
    // Return default stages if collection doesn't exist
    return getDefaultStages(stageType);
  }
};

/**
 * Get default stages if collection doesn't exist
 * Based on field-service-18.0 default stages
 */
const getDefaultStages = (stageType) => {
  if (stageType === 'order') {
    return [
      { id: 'pending', name: 'Pending', sequence: 1, isClosed: false, isDefault: true, customColor: '#ffc107' },
      { id: 'in-progress', name: 'In Progress', sequence: 2, isClosed: false, isDefault: false, customColor: '#0066cc' },
      { id: 'completed', name: 'Completed', sequence: 3, isClosed: true, isDefault: false, customColor: '#28a745' },
      { id: 'cancelled', name: 'Cancelled', sequence: 4, isClosed: true, isDefault: false, customColor: '#dc3545' }
    ];
  }
  return [];
};

/**
 * Assign technician to order
 * Based on fsm.order person_id field
 */
export const assignTechnicianToOrder = async (orderId, technicianId) => {
  try {
    await updateServiceOrder(orderId, {
      personId: technicianId,
      person_id: technicianId
    });
  } catch (error) {
    console.error('Error assigning technician:', error);
    throw error;
  }
};

/**
 * Schedule order
 * Based on fsm.order scheduled_date_start and scheduled_duration
 */
export const scheduleOrder = async (orderId, scheduledDateStart, scheduledDuration) => {
  try {
    const startDate = scheduledDateStart instanceof Timestamp ? 
      scheduledDateStart : 
      Timestamp.fromDate(new Date(scheduledDateStart));
    
    const duration = parseFloat(scheduledDuration) || 0;
    const endDate = Timestamp.fromMillis(startDate.toMillis() + (duration * 60 * 60 * 1000));
    
    await updateServiceOrder(orderId, {
      scheduledDateStart: startDate,
      scheduled_date_start: startDate,
      scheduledDuration: duration,
      scheduled_duration: duration,
      scheduledDateEnd: endDate,
      scheduled_date_end: endDate
    });
  } catch (error) {
    console.error('Error scheduling order:', error);
    throw error;
  }
};

/**
 * Complete order
 * Based on fsm.order action_complete
 */
export const completeOrder = async (orderId, resolution = '') => {
  try {
    const now = Timestamp.now();
    await updateServiceOrder(orderId, {
      status: 'completed',
      stage: 'completed',
      dateEnd: now,
      date_end: now,
      resolution: resolution
    });
  } catch (error) {
    console.error('Error completing order:', error);
    throw error;
  }
};

/**
 * Cancel order
 * Based on fsm.order action_cancel
 */
export const cancelOrder = async (orderId) => {
  try {
    await updateServiceOrder(orderId, {
      status: 'cancelled',
      stage: 'cancelled'
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// ==================== ACTIVITIES ====================
/**
 * Get all activities
 * Based on fsm.activity model from field-service-18.0
 */
export const getActivities = async (filters = {}) => {
  try {
    const activitiesRef = collection(db, COLLECTIONS.ACTIVITIES);
    let q = query(activitiesRef, orderBy('sequence', 'asc'));

    if (filters.orderId) {
      q = query(activitiesRef, where('orderId', '==', filters.orderId), orderBy('sequence', 'asc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
};

/**
 * Create activity
 */
export const createActivity = async (activityData) => {
  try {
    const activitiesRef = collection(db, COLLECTIONS.ACTIVITIES);
    const newActivity = {
      ...activityData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(activitiesRef, newActivity);
    return docRef.id;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

/**
 * Update activity
 */
export const updateActivity = async (activityId, updates) => {
  try {
    const activityRef = doc(db, COLLECTIONS.ACTIVITIES, activityId);
    await updateDoc(activityRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

/**
 * Get activity templates
 */
export const getActivityTemplates = async () => {
  try {
    const templatesRef = collection(db, COLLECTIONS.ACTIVITY_TEMPLATES);
    const snapshot = await getDocs(templatesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching activity templates:', error);
    return [];
  }
};

/**
 * Create activity template
 */
export const createActivityTemplate = async (templateData) => {
  try {
    const templatesRef = collection(db, COLLECTIONS.ACTIVITY_TEMPLATES);
    const newTemplate = {
      ...templateData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(templatesRef, newTemplate);
    return docRef.id;
  } catch (error) {
    console.error('Error creating activity template:', error);
    throw error;
  }
};

// ==================== RECURRING ORDERS ====================
/**
 * Get all recurring orders
 * Based on fsm.recurring model from field-service-18.0
 */
export const getRecurringOrders = async () => {
  try {
    const recurringRef = collection(db, COLLECTIONS.RECURRING);
    const snapshot = await getDocs(recurringRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching recurring orders:', error);
    return [];
  }
};

/**
 * Create recurring order
 */
export const createRecurringOrder = async (recurringData) => {
  try {
    const recurringRef = collection(db, COLLECTIONS.RECURRING);
    const newRecurring = {
      ...recurringData,
      state: 'draft',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(recurringRef, newRecurring);
    return docRef.id;
  } catch (error) {
    console.error('Error creating recurring order:', error);
    throw error;
  }
};

/**
 * Start recurring order (generate orders)
 */
export const startRecurringOrder = async (recurringId) => {
  try {
    const recurringRef = doc(db, COLLECTIONS.RECURRING, recurringId);
    await updateDoc(recurringRef, {
      state: 'progress',
      startDate: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    // Note: Actual order generation would be handled by a Cloud Function or scheduled task
  } catch (error) {
    console.error('Error starting recurring order:', error);
    throw error;
  }
};

// ==================== TERRITORIES ====================
/**
 * Get all territories
 * Based on res.territory model from base_territory
 */
export const getTerritories = async () => {
  try {
    const territoriesRef = collection(db, COLLECTIONS.TERRITORIES);
    const snapshot = await getDocs(territoriesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching territories:', error);
    return [];
  }
};

/**
 * Get all branches
 */
export const getBranches = async () => {
  try {
    const branchesRef = collection(db, COLLECTIONS.BRANCHES);
    const snapshot = await getDocs(branchesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
};

/**
 * Get all districts
 */
export const getDistricts = async () => {
  try {
    const districtsRef = collection(db, COLLECTIONS.DISTRICTS);
    const snapshot = await getDocs(districtsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

/**
 * Get all regions
 */
export const getRegions = async () => {
  try {
    const regionsRef = collection(db, COLLECTIONS.REGIONS);
    const snapshot = await getDocs(regionsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

// ==================== ROUTES ====================
/**
 * Get all routes
 * Based on fsm.route model from fieldservice_route
 */
export const getRoutes = async () => {
  try {
    const routesRef = collection(db, COLLECTIONS.ROUTES);
    const snapshot = await getDocs(routesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
};

/**
 * Create route
 */
export const createRoute = async (routeData) => {
  try {
    const routesRef = collection(db, COLLECTIONS.ROUTES);
    const newRoute = {
      ...routeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(routesRef, newRoute);
    return docRef.id;
  } catch (error) {
    console.error('Error creating route:', error);
    throw error;
  }
};

// ==================== SKILLS ====================
/**
 * Get all skills
 * Based on hr.skill model from fieldservice_skill
 */
export const getSkills = async () => {
  try {
    const skillsRef = collection(db, COLLECTIONS.SKILLS);
    const snapshot = await getDocs(skillsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};

/**
 * Assign skill to technician
 */
export const assignSkillToTechnician = async (technicianId, skillId, level = 1) => {
  try {
    const technicianRef = doc(db, COLLECTIONS.CUSTOMERS, technicianId);
    const technician = await getDoc(technicianRef);
    const currentSkills = technician.data().skills || [];
    
    const skillExists = currentSkills.find(s => s.skillId === skillId);
    if (skillExists) {
      // Update existing skill
      const updatedSkills = currentSkills.map(s => 
        s.skillId === skillId ? { ...s, level } : s
      );
      await updateDoc(technicianRef, { skills: updatedSkills });
    } else {
      // Add new skill
      await updateDoc(technicianRef, {
        skills: [...currentSkills, { skillId, level }]
      });
    }
  } catch (error) {
    console.error('Error assigning skill:', error);
    throw error;
  }
};

// ==================== AGREEMENTS ====================
/**
 * Get all agreements
 * Based on agreement model from fieldservice_agreement
 */
export const getAgreements = async () => {
  try {
    const agreementsRef = collection(db, COLLECTIONS.AGREEMENTS);
    const snapshot = await getDocs(agreementsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching agreements:', error);
    return [];
  }
};

/**
 * Create agreement
 */
export const createAgreement = async (agreementData) => {
  try {
    const agreementsRef = collection(db, COLLECTIONS.AGREEMENTS);
    const newAgreement = {
      ...agreementData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(agreementsRef, newAgreement);
    return docRef.id;
  } catch (error) {
    console.error('Error creating agreement:', error);
    throw error;
  }
};

// ==================== VEHICLES ====================
/**
 * Get all vehicles
 * Based on fsm.vehicle model from fieldservice_vehicle
 */
export const getVehicles = async () => {
  try {
    const vehiclesRef = collection(db, COLLECTIONS.VEHICLES);
    const snapshot = await getDocs(vehiclesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

/**
 * Create vehicle
 */
export const createVehicle = async (vehicleData) => {
  try {
    const vehiclesRef = collection(db, COLLECTIONS.VEHICLES);
    const newVehicle = {
      ...vehicleData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(vehiclesRef, newVehicle);
    return docRef.id;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

/**
 * Assign driver to vehicle
 */
export const assignDriverToVehicle = async (vehicleId, driverId) => {
  try {
    const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
    await updateDoc(vehicleRef, {
      personId: driverId,
      person_id: driverId,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error assigning driver:', error);
    throw error;
  }
};

// ==================== TAGS ====================
/**
 * Get all tags
 * Based on fsm.tag model from field-service-18.0
 */
export const getTags = async () => {
  try {
    const tagsRef = collection(db, COLLECTIONS.TAGS);
    const snapshot = await getDocs(tagsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
};

/**
 * Create tag
 */
export const createTag = async (tagData) => {
  try {
    const tagsRef = collection(db, COLLECTIONS.TAGS);
    const newTag = {
      ...tagData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(tagsRef, newTag);
    return docRef.id;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

// ==================== ORDER TYPES ====================
/**
 * Get all order types
 * Based on fsm.order.type model from field-service-18.0
 */
export const getOrderTypes = async () => {
  try {
    const typesRef = collection(db, COLLECTIONS.ORDER_TYPES);
    const snapshot = await getDocs(typesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching order types:', error);
    return [];
  }
};

/**
 * Create order type
 */
export const createOrderType = async (typeData) => {
  try {
    const typesRef = collection(db, COLLECTIONS.ORDER_TYPES);
    const newType = {
      ...typeData,
      internalType: typeData.internalType || 'fsm',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(typesRef, newType);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order type:', error);
    throw error;
  }
};

// ==================== ORDER TEMPLATES ====================
/**
 * Get all order templates
 * Based on fsm.template model from field-service-18.0
 */
export const getOrderTemplates = async () => {
  try {
    const templatesRef = collection(db, COLLECTIONS.ORDER_TEMPLATES);
    const snapshot = await getDocs(templatesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching order templates:', error);
    return [];
  }
};

/**
 * Create order template
 */
export const createOrderTemplate = async (templateData) => {
  try {
    const templatesRef = collection(db, COLLECTIONS.ORDER_TEMPLATES);
    const newTemplate = {
      ...templateData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(templatesRef, newTemplate);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order template:', error);
    throw error;
  }
};

// ==================== CATEGORIES ====================
/**
 * Get all categories
 * Based on fsm.category model from field-service-18.0
 */
export const getCategories = async () => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Create category
 */
export const createCategory = async (categoryData) => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const newCategory = {
      ...categoryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(categoriesRef, newCategory);
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// ==================== SIZES ====================
/**
 * Get all sizes
 * Based on fsm.size model from fieldservice_size
 */
export const getSizes = async () => {
  try {
    const sizesRef = collection(db, COLLECTIONS.SIZES);
    const snapshot = await getDocs(sizesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching sizes:', error);
    return [];
  }
};

/**
 * Create size
 */
export const createSize = async (sizeData) => {
  try {
    const sizesRef = collection(db, COLLECTIONS.SIZES);
    const newSize = {
      ...sizeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(sizesRef, newSize);
    return docRef.id;
  } catch (error) {
    console.error('Error creating size:', error);
    throw error;
  }
};

// ==================== TIMESHEETS ====================
/**
 * Get timesheets for an order
 * Based on fieldservice_timesheet
 */
export const getTimesheets = async (orderId) => {
  try {
    const timesheetsRef = collection(db, COLLECTIONS.TIMESHEETS);
    const q = query(timesheetsRef, where('fsmOrderId', '==', orderId), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return [];
  }
};

/**
 * Create timesheet entry
 */
export const createTimesheet = async (timesheetData) => {
  try {
    const timesheetsRef = collection(db, COLLECTIONS.TIMESHEETS);
    const newTimesheet = {
      ...timesheetData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(timesheetsRef, newTimesheet);
    return docRef.id;
  } catch (error) {
    console.error('Error creating timesheet:', error);
    throw error;
  }
};

// ==================== STOCK/INVENTORY ====================
/**
 * Get stock pickings for an order
 * Based on fieldservice_stock
 */
export const getStockPickings = async (orderId) => {
  try {
    const pickingsRef = collection(db, COLLECTIONS.STOCK_PICKINGS);
    const q = query(pickingsRef, where('fsmOrderId', '==', orderId), orderBy('scheduledDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching stock pickings:', error);
    return [];
  }
};

// ==================== EQUIPMENT WARRANTY ====================
/**
 * Update equipment warranty
 * Based on fieldservice_equipment_warranty
 */
export const updateEquipmentWarranty = async (equipmentId, warrantyData) => {
  try {
    const equipmentRef = doc(db, COLLECTIONS.EQUIPMENT, equipmentId);
    await updateDoc(equipmentRef, {
      warrantyStartDate: warrantyData.warrantyStartDate ? Timestamp.fromDate(new Date(warrantyData.warrantyStartDate)) : null,
      warrantyEndDate: warrantyData.warrantyEndDate ? Timestamp.fromDate(new Date(warrantyData.warrantyEndDate)) : null,
      productWarranty: warrantyData.productWarranty || null,
      productWarrantyType: warrantyData.productWarrantyType || null,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating equipment warranty:', error);
    throw error;
  }
};

// ==================== AVAILABILITY MANAGEMENT ====================
/**
 * Get blackout days
 * Based on fieldservice_availability
 */
export const getBlackoutDays = async () => {
  try {
    const blackoutRef = collection(db, COLLECTIONS.BLACKOUT_DAYS);
    const snapshot = await getDocs(blackoutRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching blackout days:', error);
    return [];
  }
};

/**
 * Create blackout day
 */
export const createBlackoutDay = async (blackoutData) => {
  try {
    const blackoutRef = collection(db, COLLECTIONS.BLACKOUT_DAYS);
    const newBlackout = {
      ...blackoutData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(blackoutRef, newBlackout);
    return docRef.id;
  } catch (error) {
    console.error('Error creating blackout day:', error);
    throw error;
  }
};

/**
 * Get stress days
 */
export const getStressDays = async () => {
  try {
    const stressRef = collection(db, COLLECTIONS.STRESS_DAYS);
    const snapshot = await getDocs(stressRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching stress days:', error);
    return [];
  }
};

/**
 * Create stress day
 */
export const createStressDay = async (stressData) => {
  try {
    const stressRef = collection(db, COLLECTIONS.STRESS_DAYS);
    const newStress = {
      ...stressData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(stressRef, newStress);
    return docRef.id;
  } catch (error) {
    console.error('Error creating stress day:', error);
    throw error;
  }
};

/**
 * Get delivery time ranges
 */
export const getDeliveryTimeRanges = async (routeId = null) => {
  try {
    const rangesRef = collection(db, COLLECTIONS.DELIVERY_TIME_RANGES);
    let q = query(rangesRef, orderBy('sequence', 'asc'), orderBy('startTime', 'asc'));
    
    if (routeId) {
      q = query(rangesRef, where('routeId', '==', routeId), orderBy('sequence', 'asc'), orderBy('startTime', 'asc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching delivery time ranges:', error);
    return [];
  }
};

/**
 * Create delivery time range
 */
export const createDeliveryTimeRange = async (rangeData) => {
  try {
    const rangesRef = collection(db, COLLECTIONS.DELIVERY_TIME_RANGES);
    const newRange = {
      ...rangeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(rangesRef, newRange);
    return docRef.id;
  } catch (error) {
    console.error('Error creating delivery time range:', error);
    throw error;
  }
};

// ==================== REPAIR ORDERS ====================
/**
 * Get repair orders for an order
 * Based on fieldservice_repair
 */
export const getRepairOrders = async (orderId) => {
  try {
    const repairsRef = collection(db, COLLECTIONS.REPAIR_ORDERS);
    const q = query(repairsRef, where('fsmOrderId', '==', orderId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching repair orders:', error);
    return [];
  }
};

/**
 * Create repair order
 */
export const createRepairOrder = async (repairData) => {
  try {
    const repairsRef = collection(db, COLLECTIONS.REPAIR_ORDERS);
    const newRepair = {
      ...repairData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(repairsRef, newRepair);
    return docRef.id;
  } catch (error) {
    console.error('Error creating repair order:', error);
    throw error;
  }
};

// ==================== CRM INTEGRATION ====================
/**
 * Get CRM leads
 * Based on fieldservice_crm
 */
export const getCRMLeads = async () => {
  try {
    const leadsRef = collection(db, COLLECTIONS.CRM_LEADS);
    const snapshot = await getDocs(leadsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching CRM leads:', error);
    return [];
  }
};

/**
 * Create service order from CRM lead
 */
export const createOrderFromLead = async (leadId, orderData) => {
  try {
    // Create the order
    const orderId = await createServiceOrder({
      ...orderData,
      opportunityId: leadId,
      origin: `CRM Lead: ${leadId}`
    });
    
    // Update lead with order reference
    const leadRef = doc(db, COLLECTIONS.CRM_LEADS, leadId);
    const lead = await getDoc(leadRef);
    const existingOrderIds = lead.data().fsmOrderIds || [];
    await updateDoc(leadRef, {
      fsmOrderIds: [...existingOrderIds, orderId],
      updatedAt: Timestamp.now()
    });
    
    return orderId;
  } catch (error) {
    console.error('Error creating order from lead:', error);
    throw error;
  }
};

// ==================== PROJECT INTEGRATION ====================
/**
 * Get projects
 * Based on fieldservice_project
 */
export const getProjects = async () => {
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const snapshot = await getDocs(projectsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

/**
 * Create service order from project task
 */
export const createOrderFromProjectTask = async (taskId, orderData) => {
  try {
    const orderId = await createServiceOrder({
      ...orderData,
      projectTaskId: taskId,
      origin: `Project Task: ${taskId}`
    });
    
    // Update task with order reference
    const taskRef = doc(db, 'projectTasks', taskId);
    const task = await getDoc(taskRef);
    const existingOrderIds = task.data().fsmOrderIds || [];
    await updateDoc(taskRef, {
      fsmOrderIds: [...existingOrderIds, orderId],
      updatedAt: Timestamp.now()
    });
    
    return orderId;
  } catch (error) {
    console.error('Error creating order from project task:', error);
    throw error;
  }
};

// ==================== INVOICES ====================
/**
 * Get invoices for an order
 * Based on fieldservice_account
 */
export const getOrderInvoices = async (orderId) => {
  try {
    const invoicesRef = collection(db, COLLECTIONS.INVOICES);
    const q = query(invoicesRef, where('fsmOrderIds', 'array-contains', orderId), orderBy('invoiceDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
};

// ==================== SALES INTEGRATION ====================
/**
 * Get sales orders
 * Based on fieldservice_sale
 */
export const getSalesOrders = async () => {
  try {
    const salesRef = collection(db, COLLECTIONS.SALES_ORDERS);
    const snapshot = await getDocs(salesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return [];
  }
};

/**
 * Link service order to sales order
 */
export const linkOrderToSale = async (orderId, saleId, saleLineId = null) => {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, {
      saleId: saleId,
      saleLineId: saleLineId,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error linking order to sale:', error);
    throw error;
  }
};

// ==================== FREQUENCY SETS & FREQUENCIES ====================
/**
 * Get all frequency sets
 */
export const getFrequencySets = async () => {
  try {
    const setsRef = collection(db, COLLECTIONS.FREQUENCY_SETS);
    const snapshot = await getDocs(setsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching frequency sets:', error);
    return [];
  }
};

/**
 * Create frequency set
 */
export const createFrequencySet = async (setData) => {
  try {
    const setsRef = collection(db, COLLECTIONS.FREQUENCY_SETS);
    const newSet = {
      ...setData,
      active: setData.active !== false,
      scheduleDays: setData.scheduleDays || 30,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(setsRef, newSet);
    return docRef.id;
  } catch (error) {
    console.error('Error creating frequency set:', error);
    throw error;
  }
};

/**
 * Get all frequencies
 */
export const getFrequencies = async () => {
  try {
    const frequenciesRef = collection(db, COLLECTIONS.FREQUENCIES);
    const snapshot = await getDocs(frequenciesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching frequencies:', error);
    return [];
  }
};

/**
 * Create frequency rule
 */
export const createFrequency = async (frequencyData) => {
  try {
    const frequenciesRef = collection(db, COLLECTIONS.FREQUENCIES);
    const newFrequency = {
      ...frequencyData,
      active: frequencyData.active !== false,
      interval: frequencyData.interval || 1,
      isExclusive: frequencyData.isExclusive || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(frequenciesRef, newFrequency);
    return docRef.id;
  } catch (error) {
    console.error('Error creating frequency:', error);
    throw error;
  }
};

// ==================== RECURRING TEMPLATES ====================
/**
 * Get all recurring templates
 */
export const getRecurringTemplates = async () => {
  try {
    const templatesRef = collection(db, COLLECTIONS.RECURRING_TEMPLATES);
    const snapshot = await getDocs(templatesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching recurring templates:', error);
    return [];
  }
};

/**
 * Create recurring template
 */
export const createRecurringTemplate = async (templateData) => {
  try {
    const templatesRef = collection(db, COLLECTIONS.RECURRING_TEMPLATES);
    const newTemplate = {
      ...templateData,
      active: templateData.active !== false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(templatesRef, newTemplate);
    return docRef.id;
  } catch (error) {
    console.error('Error creating recurring template:', error);
    throw error;
  }
};

// ==================== DAY ROUTES (DAYROUTE) ====================
/**
 * Get all dayroutes
 */
export const getDayroutes = async (filters = {}) => {
  try {
    const dayroutesRef = collection(db, COLLECTIONS.DAYROUTES);
    let q = query(dayroutesRef, orderBy('date', 'desc'));
    
    if (filters.routeId) {
      q = query(dayroutesRef, where('routeId', '==', filters.routeId), orderBy('date', 'desc'));
    }
    if (filters.personId) {
      q = query(dayroutesRef, where('personId', '==', filters.personId), orderBy('date', 'desc'));
    }
    if (filters.date) {
      q = query(dayroutesRef, where('date', '==', filters.date), orderBy('date', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching dayroutes:', error);
    return [];
  }
};

/**
 * Create dayroute
 */
export const createDayroute = async (dayrouteData) => {
  try {
    const dayroutesRef = collection(db, COLLECTIONS.DAYROUTES);
    const newDayroute = {
      ...dayrouteData,
      date: dayrouteData.date ? Timestamp.fromDate(new Date(dayrouteData.date)) : null,
      dateStartPlanned: dayrouteData.dateStartPlanned ? Timestamp.fromDate(new Date(dayrouteData.dateStartPlanned)) : null,
      workTime: dayrouteData.workTime || 8.0,
      maxAllowTime: dayrouteData.maxAllowTime || 10.0,
      orderCount: 0,
      orderRemaining: dayrouteData.maxOrder || 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(dayroutesRef, newDayroute);
    return docRef.id;
  } catch (error) {
    console.error('Error creating dayroute:', error);
    throw error;
  }
};

// ==================== LOCATION PERSON ASSIGNMENT ====================
/**
 * Get location persons (technician assignments to locations)
 */
export const getLocationPersons = async (locationId = null) => {
  try {
    const locationPersonsRef = collection(db, COLLECTIONS.LOCATION_PERSONS);
    let q = query(locationPersonsRef, orderBy('sequence', 'asc'));
    
    if (locationId) {
      q = query(locationPersonsRef, where('locationId', '==', locationId), orderBy('sequence', 'asc'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching location persons:', error);
    return [];
  }
};

/**
 * Assign technician to location
 */
export const assignTechnicianToLocation = async (locationId, technicianId, sequence = 10) => {
  try {
    const locationPersonsRef = collection(db, COLLECTIONS.LOCATION_PERSONS);
    const newAssignment = {
      locationId: locationId,
      personId: technicianId,
      sequence: sequence,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(locationPersonsRef, newAssignment);
    return docRef.id;
  } catch (error) {
    console.error('Error assigning technician to location:', error);
    throw error;
  }
};

// ==================== EQUIPMENT STOCK INTEGRATION ====================
/**
 * Link equipment to product and stock lot
 */
export const linkEquipmentToStock = async (equipmentId, productId, lotId = null) => {
  try {
    const equipmentRef = doc(db, COLLECTIONS.EQUIPMENT, equipmentId);
    await updateDoc(equipmentRef, {
      productId: productId,
      lotId: lotId,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error linking equipment to stock:', error);
    throw error;
  }
};

/**
 * Get equipment stock information
 */
export const getEquipmentStock = async (equipmentId) => {
  try {
    const equipmentRef = doc(db, COLLECTIONS.EQUIPMENT, equipmentId);
    const equipmentDoc = await getDoc(equipmentRef);
    if (equipmentDoc.exists()) {
      return {
        id: equipmentDoc.id,
        ...equipmentDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching equipment stock:', error);
    return null;
  }
};

// ==================== CONFIGURATION SETTINGS ====================
/**
 * Get configuration settings
 */
export const getConfigSettings = async () => {
  try {
    const settingsRef = collection(db, COLLECTIONS.CONFIG_SETTINGS);
    const snapshot = await getDocs(settingsRef);
    if (snapshot.docs.length > 0) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    }
    // Return defaults
    return {
      autoPopulatePersonsOnLocation: false,
      autoPopulateEquipmentsOnOrder: false,
      searchOnCompleteName: false,
      fsmOrderRequestLateLowest: 72,
      fsmOrderRequestLateLow: 48,
      fsmOrderRequestLateMedium: 24,
      fsmOrderRequestLateHigh: 8
    };
  } catch (error) {
    console.error('Error fetching config settings:', error);
    return null;
  }
};

/**
 * Update configuration settings
 */
export const updateConfigSettings = async (settings) => {
  try {
    const settingsRef = collection(db, COLLECTIONS.CONFIG_SETTINGS);
    const snapshot = await getDocs(settingsRef);
    
    if (snapshot.docs.length > 0) {
      const docRef = doc(db, COLLECTIONS.CONFIG_SETTINGS, snapshot.docs[0].id);
      await updateDoc(docRef, {
        ...settings,
        updatedAt: Timestamp.now()
      });
    } else {
      await addDoc(settingsRef, {
        ...settings,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating config settings:', error);
    throw error;
  }
};

// ==================== REPAIR ORDER TEMPLATES ====================
/**
 * Update order template with repair template
 */
export const linkRepairTemplateToOrderTemplate = async (templateId, repairTemplateId) => {
  try {
    const templateRef = doc(db, COLLECTIONS.ORDER_TEMPLATES, templateId);
    await updateDoc(templateRef, {
      repairOrderTemplateId: repairTemplateId,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error linking repair template:', error);
    throw error;
  }
};

// ==================== SALE RECURRING INTEGRATION ====================
/**
 * Link recurring order to sale
 */
export const linkRecurringToSale = async (recurringId, saleId, saleLineId = null) => {
  try {
    const recurringRef = doc(db, COLLECTIONS.RECURRING, recurringId);
    await updateDoc(recurringRef, {
      saleId: saleId,
      saleLineId: saleLineId,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error linking recurring to sale:', error);
    throw error;
  }
};

/**
 * Get recurring orders for sale
 */
export const getRecurringOrdersForSale = async (saleId) => {
  try {
    const recurringRef = collection(db, COLLECTIONS.RECURRING);
    const q = query(recurringRef, where('saleId', '==', saleId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching recurring orders for sale:', error);
    return [];
  }
};

// ==================== SALE AGREEMENT INTEGRATION ====================
/**
 * Link agreement to sale
 */
export const linkAgreementToSale = async (saleId, agreementId) => {
  try {
    const saleRef = doc(db, COLLECTIONS.SALES_ORDERS, saleId);
    await updateDoc(saleRef, {
      agreementId: agreementId,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error linking agreement to sale:', error);
    throw error;
  }
};

// ==================== ROUTE BLACKOUT GROUPS ====================
/**
 * Get route blackout groups
 */
export const getRouteBlackoutGroups = async (routeId = null) => {
  try {
    const groupsRef = collection(db, COLLECTIONS.ROUTE_BLACKOUT_GROUPS);
    let q = query(groupsRef);
    
    if (routeId) {
      q = query(groupsRef, where('routeId', '==', routeId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching route blackout groups:', error);
    return [];
  }
};

/**
 * Create route blackout group
 */
export const createRouteBlackoutGroup = async (groupData) => {
  try {
    const groupsRef = collection(db, COLLECTIONS.ROUTE_BLACKOUT_GROUPS);
    const newGroup = {
      ...groupData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(groupsRef, newGroup);
    return docRef.id;
  } catch (error) {
    console.error('Error creating route blackout group:', error);
    throw error;
  }
};

// ==================== PERSON CALENDAR FILTER ====================
/**
 * Get person calendar filters for user
 */
export const getPersonCalendarFilters = async (userId = null) => {
  try {
    const filtersRef = collection(db, COLLECTIONS.PERSON_CALENDAR_FILTERS);
    let q = query(filtersRef, where('active', '==', true));
    
    if (userId) {
      q = query(filtersRef, where('userId', '==', userId), where('active', '==', true));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching person calendar filters:', error);
    return [];
  }
};

/**
 * Create person calendar filter
 */
export const createPersonCalendarFilter = async (filterData) => {
  try {
    const filtersRef = collection(db, COLLECTIONS.PERSON_CALENDAR_FILTERS);
    const newFilter = {
      ...filterData,
      active: filterData.active !== false,
      personChecked: filterData.personChecked !== false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await addDoc(filtersRef, newFilter);
    return docRef.id;
  } catch (error) {
    console.error('Error creating person calendar filter:', error);
    throw error;
  }
};

// ==================== ROUTE DAYS ====================
/**
 * Get route days (reference data)
 */
export const getRouteDays = async () => {
  try {
    const daysRef = collection(db, COLLECTIONS.ROUTE_DAYS);
    const snapshot = await getDocs(daysRef);
    if (snapshot.docs.length > 0) {
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    // Return default days if none exist
    return [
      { id: 'mo', name: 'Monday' },
      { id: 'tu', name: 'Tuesday' },
      { id: 'we', name: 'Wednesday' },
      { id: 'th', name: 'Thursday' },
      { id: 'fr', name: 'Friday' },
      { id: 'sa', name: 'Saturday' },
      { id: 'su', name: 'Sunday' }
    ];
  } catch (error) {
    console.error('Error fetching route days:', error);
    return [];
  }
};

// ==================== PARTNER-TO-FSM CONVERSION WIZARD ====================
/**
 * Get partners (customers) that can be converted
 */
export const getConvertiblePartners = async () => {
  try {
    const partnersRef = collection(db, 'customers');
    const q = query(
      partnersRef,
      where('fsm_location', '==', false),
      where('fsm_person', '==', false),
      orderBy('displayName', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching convertible partners:', error);
    // Fallback: get all customers
    try {
      const partnersRef = collection(db, 'customers');
      const snapshot = await getDocs(partnersRef);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => !p.fsm_location && !p.fsm_person);
    } catch (fallbackError) {
      console.error('Error in fallback partner fetch:', fallbackError);
      return [];
    }
  }
};

/**
 * Convert partner to FSM Location
 */
export const convertPartnerToLocation = async (partnerId) => {
  try {
    const partnerRef = doc(db, 'customers', partnerId);
    const partnerDoc = await getDoc(partnerRef);
    
    if (!partnerDoc.exists()) {
      throw new Error('Partner not found');
    }
    
    const partnerData = partnerDoc.data();
    
    // Check if location already exists
    const locationsRef = collection(db, COLLECTIONS.LOCATIONS);
    const existingLocationQuery = query(
      locationsRef,
      where('partnerId', '==', partnerId)
    );
    const existingSnapshot = await getDocs(existingLocationQuery);
    
    if (existingSnapshot.docs.length > 0) {
      throw new Error('A Field Service Location related to that partner already exists.');
    }
    
    // Create FSM Location
    const newLocation = {
      partnerId: partnerId,
      ownerId: partnerId,
      name: partnerData.displayName || partnerData.name || partnerData.email,
      email: partnerData.email || null,
      phone: partnerData.phone || null,
      street: partnerData.street || null,
      street2: partnerData.street2 || null,
      city: partnerData.city || null,
      state: partnerData.state || null,
      zip: partnerData.zip || null,
      country: partnerData.country || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const locationDocRef = await addDoc(locationsRef, newLocation);
    
    // Update partner to mark as FSM location
    await updateDoc(partnerRef, {
      fsm_location: true,
      updatedAt: Timestamp.now()
    });
    
    // Handle child addresses (convert to "other" type)
    if (partnerData.addresses) {
      const addressesRef = collection(db, 'addresses');
      const childAddressesQuery = query(
        addressesRef,
        where('customerId', '==', partnerId)
      );
      const childSnapshot = await getDocs(childAddressesQuery);
      
      const updatePromises = childSnapshot.docs.map(childDoc =>
        updateDoc(doc(db, 'addresses', childDoc.id), {
          type: 'other',
          updatedAt: Timestamp.now()
        })
      );
      
      await Promise.all(updatePromises);
    }
    
    return { success: true, locationId: locationDocRef.id };
  } catch (error) {
    console.error('Error converting partner to location:', error);
    throw error;
  }
};

/**
 * Convert partner to FSM Worker (Person)
 */
export const convertPartnerToWorker = async (partnerId) => {
  try {
    const partnerRef = doc(db, 'customers', partnerId);
    const partnerDoc = await getDoc(partnerRef);
    
    if (!partnerDoc.exists()) {
      throw new Error('Partner not found');
    }
    
    const partnerData = partnerDoc.data();
    
    // Check if worker already exists
    const techniciansRef = collection(db, COLLECTIONS.CUSTOMERS);
    const existingWorkerQuery = query(
      techniciansRef,
      where('partnerId', '==', partnerId),
      where('role', 'in', ['technician', 'manager', 'supervisor'])
    );
    const existingSnapshot = await getDocs(existingWorkerQuery);
    
    if (existingSnapshot.docs.length > 0) {
      throw new Error('A Field Service Worker related to that partner already exists.');
    }
    
    // Update partner to mark as FSM worker and set role
    await updateDoc(partnerRef, {
      fsm_person: true,
      role: 'technician', // Default role
      updatedAt: Timestamp.now()
    });
    
    return { success: true, workerId: partnerId };
  } catch (error) {
    console.error('Error converting partner to worker:', error);
    throw error;
  }
};

/**
 * Convert multiple partners (bulk conversion)
 */
export const convertPartners = async (partnerIds, recordType) => {
  try {
    const results = [];
    const errors = [];
    
    for (const partnerId of partnerIds) {
      try {
        if (recordType === 'location') {
          const result = await convertPartnerToLocation(partnerId);
          results.push({ partnerId, ...result });
        } else if (recordType === 'person') {
          const result = await convertPartnerToWorker(partnerId);
          results.push({ partnerId, ...result });
        }
      } catch (error) {
        errors.push({ partnerId, error: error.message });
      }
    }
    
    return {
      success: results.length > 0,
      converted: results,
      errors: errors
    };
  } catch (error) {
    console.error('Error in bulk conversion:', error);
    throw error;
  }
};

