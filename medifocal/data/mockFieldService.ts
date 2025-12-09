/**
 * Mock Data for Field Service Management
 * Based on field-service-18.0 structure
 */

export interface ServiceOrder {
  id: string;
  name: string;
  description: string;
  locationId: string;
  locationName: string;
  personId: string;
  personName: string;
  teamId?: string;
  teamName?: string;
  priority: '0' | '1' | '2' | '3'; // 0=Low, 1=Normal, 2=High, 3=Urgent
  stage: string;
  scheduledDateStart: string;
  scheduledDateEnd: string;
  scheduledDuration: number; // hours
  requestDate: string;
  customerId: string;
  customerName: string;
  orderType: string;
  tags: string[];
  equipmentIds: string[];
  status: 'draft' | 'confirmed' | 'in_progress' | 'done' | 'cancel';
  color?: number;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  territoryIds: string[];
  territoryNames: string[];
  skillIds: string[];
  skillNames: string[];
  teamId?: string;
  teamName?: string;
  active: boolean;
  calendarId?: string;
  image?: string;
}

export interface Location {
  id: string;
  name: string;
  completeName: string;
  customerId: string;
  customerName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  direction?: string;
  parentId?: string;
  parentName?: string;
  territoryId?: string;
  territoryName?: string;
  personIds: string[];
  personNames: string[];
  equipmentIds: string[];
  active: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  assetName: string;
  locationId: string;
  locationName: string;
  personId?: string;
  personName?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  active: boolean;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  sequence: number;
  memberIds: string[];
  memberNames: string[];
  active: boolean;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  required: boolean;
  sequence: number;
  categoryId?: string;
  categoryName?: string;
}

export interface Route {
  id: string;
  name: string;
  personId: string;
  personName: string;
  vehicleId?: string;
  vehicleName?: string;
  date: string;
  orderIds: string[];
  orderNames: string[];
  startLocationId?: string;
  endLocationId?: string;
  status: 'draft' | 'in_progress' | 'completed';
}

// Mock Data
export const mockServiceOrders: ServiceOrder[] = [
  {
    id: 'SO001',
    name: 'Dental Equipment Maintenance - Dr. Smith',
    description: 'Routine maintenance check for dental chair and X-ray equipment',
    locationId: 'LOC001',
    locationName: 'Bright Smiles Dental Clinic',
    personId: 'TECH001',
    personName: 'John Anderson',
    teamId: 'TEAM001',
    teamName: 'Maintenance Team A',
    priority: '2',
    stage: 'In Progress',
    scheduledDateStart: '2024-01-15T09:00:00',
    scheduledDateEnd: '2024-01-15T12:00:00',
    scheduledDuration: 3,
    requestDate: '2024-01-10T10:00:00',
    customerId: 'CUST001',
    customerName: 'Dr. Smith',
    orderType: 'Maintenance',
    tags: ['routine', 'equipment'],
    equipmentIds: ['EQ001', 'EQ002'],
    status: 'in_progress',
    color: 3
  },
  {
    id: 'SO002',
    name: 'X-Ray System Installation',
    description: 'Install new digital X-ray system in treatment room 2',
    locationId: 'LOC002',
    locationName: 'Coastal Dental Practice',
    personId: 'TECH002',
    personName: 'Sarah Mitchell',
    teamId: 'TEAM002',
    teamName: 'Installation Team',
    priority: '3',
    stage: 'Confirmed',
    scheduledDateStart: '2024-01-18T08:00:00',
    scheduledDateEnd: '2024-01-18T17:00:00',
    scheduledDuration: 8,
    requestDate: '2024-01-12T14:00:00',
    customerId: 'CUST002',
    customerName: 'Coastal Dental Practice',
    orderType: 'Installation',
    tags: ['installation', 'new-equipment'],
    equipmentIds: ['EQ003'],
    status: 'confirmed',
    color: 5
  },
  {
    id: 'SO003',
    name: 'Autoclave Repair',
    description: 'Repair autoclave unit - not reaching proper temperature',
    locationId: 'LOC003',
    locationName: 'Family Dental Care',
    personId: 'TECH001',
    personName: 'John Anderson',
    teamId: 'TEAM001',
    teamName: 'Maintenance Team A',
    priority: '3',
    stage: 'Urgent',
    scheduledDateStart: '2024-01-16T10:00:00',
    scheduledDateEnd: '2024-01-16T14:00:00',
    scheduledDuration: 4,
    requestDate: '2024-01-15T08:00:00',
    customerId: 'CUST003',
    customerName: 'Family Dental Care',
    orderType: 'Repair',
    tags: ['urgent', 'repair'],
    equipmentIds: ['EQ004'],
    status: 'confirmed',
    color: 1
  },
  {
    id: 'SO004',
    name: 'Annual Equipment Inspection',
    description: 'Annual safety and compliance inspection for all equipment',
    locationId: 'LOC001',
    locationName: 'Bright Smiles Dental Clinic',
    personId: 'TECH003',
    personName: 'Michael Chen',
    teamId: 'TEAM001',
    teamName: 'Maintenance Team A',
    priority: '1',
    stage: 'Scheduled',
    scheduledDateStart: '2024-01-20T09:00:00',
    scheduledDateEnd: '2024-01-20T16:00:00',
    scheduledDuration: 7,
    requestDate: '2024-01-01T09:00:00',
    customerId: 'CUST001',
    customerName: 'Dr. Smith',
    orderType: 'Inspection',
    tags: ['annual', 'inspection', 'compliance'],
    equipmentIds: ['EQ001', 'EQ002', 'EQ005'],
    status: 'confirmed',
    color: 7
  },
  {
    id: 'SO005',
    name: 'Water Line Flushing Service',
    description: 'Quarterly water line flushing and sanitization',
    locationId: 'LOC004',
    locationName: 'Downtown Dental Group',
    personId: 'TECH004',
    personName: 'Emily Rodriguez',
    teamId: 'TEAM003',
    teamName: 'Service Team B',
    priority: '1',
    stage: 'Draft',
    scheduledDateStart: '2024-01-22T08:00:00',
    scheduledDateEnd: '2024-01-22T10:00:00',
    scheduledDuration: 2,
    requestDate: '2024-01-14T11:00:00',
    customerId: 'CUST004',
    customerName: 'Downtown Dental Group',
    orderType: 'Service',
    tags: ['quarterly', 'maintenance'],
    equipmentIds: [],
    status: 'draft',
    color: 0
  }
];

export const mockTechnicians: Technician[] = [
  {
    id: 'TECH001',
    name: 'John Anderson',
    email: 'john.anderson@medifocal.com',
    phone: '+61 2 9876 5432',
    mobile: '+61 400 123 456',
    territoryIds: ['TERR001', 'TERR002'],
    territoryNames: ['Sydney Metro', 'Eastern Suburbs'],
    skillIds: ['SKILL001', 'SKILL002'],
    skillNames: ['Equipment Maintenance', 'X-Ray Systems'],
    teamId: 'TEAM001',
    teamName: 'Maintenance Team A',
    active: true,
    image: 'https://ui-avatars.com/api/?name=John+Anderson&background=017bbf&color=fff'
  },
  {
    id: 'TECH002',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@medifocal.com',
    phone: '+61 2 9876 5433',
    mobile: '+61 400 123 457',
    territoryIds: ['TERR003'],
    territoryNames: ['Northern Beaches'],
    skillIds: ['SKILL003', 'SKILL004'],
    skillNames: ['Installation', 'Digital Systems'],
    teamId: 'TEAM002',
    teamName: 'Installation Team',
    active: true,
    image: 'https://ui-avatars.com/api/?name=Sarah+Mitchell&background=6bb944&color=fff'
  },
  {
    id: 'TECH003',
    name: 'Michael Chen',
    email: 'michael.chen@medifocal.com',
    phone: '+61 2 9876 5434',
    mobile: '+61 400 123 458',
    territoryIds: ['TERR001', 'TERR004'],
    territoryNames: ['Sydney Metro', 'Western Suburbs'],
    skillIds: ['SKILL001', 'SKILL005'],
    skillNames: ['Equipment Maintenance', 'Compliance Inspection'],
    teamId: 'TEAM001',
    teamName: 'Maintenance Team A',
    active: true,
    image: 'https://ui-avatars.com/api/?name=Michael+Chen&background=017bbf&color=fff'
  },
  {
    id: 'TECH004',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@medifocal.com',
    phone: '+61 2 9876 5435',
    mobile: '+61 400 123 459',
    territoryIds: ['TERR005'],
    territoryNames: ['South Sydney'],
    skillIds: ['SKILL006'],
    skillNames: ['Water Systems'],
    teamId: 'TEAM003',
    teamName: 'Service Team B',
    active: true,
    image: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=6bb944&color=fff'
  },
  {
    id: 'TECH005',
    name: 'David Thompson',
    email: 'david.thompson@medifocal.com',
    phone: '+61 2 9876 5436',
    mobile: '+61 400 123 460',
    territoryIds: ['TERR002'],
    territoryNames: ['Eastern Suburbs'],
    skillIds: ['SKILL002', 'SKILL007'],
    skillNames: ['X-Ray Systems', 'Emergency Repair'],
    teamId: 'TEAM002',
    teamName: 'Installation Team',
    active: true,
    image: 'https://ui-avatars.com/api/?name=David+Thompson&background=017bbf&color=fff'
  }
];

export const mockLocations: Location[] = [
  {
    id: 'LOC001',
    name: 'Bright Smiles Dental Clinic',
    completeName: 'Bright Smiles Dental Clinic - Main Office',
    customerId: 'CUST001',
    customerName: 'Dr. Smith',
    street: '123 Main Street',
    street2: 'Suite 200',
    city: 'Sydney',
    state: 'NSW',
    zip: '2000',
    country: 'Australia',
    phone: '+61 2 9123 4567',
    email: 'info@brightsmiles.com.au',
    direction: 'Corner of Main St and George St',
    territoryId: 'TERR001',
    territoryName: 'Sydney Metro',
    personIds: ['TECH001', 'TECH003'],
    personNames: ['John Anderson', 'Michael Chen'],
    equipmentIds: ['EQ001', 'EQ002', 'EQ005'],
    active: true
  },
  {
    id: 'LOC002',
    name: 'Coastal Dental Practice',
    completeName: 'Coastal Dental Practice',
    customerId: 'CUST002',
    customerName: 'Coastal Dental Practice',
    street: '45 Beach Road',
    city: 'Bondi',
    state: 'NSW',
    zip: '2026',
    country: 'Australia',
    phone: '+61 2 9130 1234',
    email: 'contact@coastaldental.com.au',
    territoryId: 'TERR003',
    territoryName: 'Northern Beaches',
    personIds: ['TECH002'],
    personNames: ['Sarah Mitchell'],
    equipmentIds: ['EQ003'],
    active: true
  },
  {
    id: 'LOC003',
    name: 'Family Dental Care',
    completeName: 'Family Dental Care - Main Clinic',
    customerId: 'CUST003',
    customerName: 'Family Dental Care',
    street: '789 Health Avenue',
    city: 'Parramatta',
    state: 'NSW',
    zip: '2150',
    country: 'Australia',
    phone: '+61 2 9891 2345',
    email: 'info@familydental.com.au',
    territoryId: 'TERR004',
    territoryName: 'Western Suburbs',
    personIds: ['TECH001'],
    personNames: ['John Anderson'],
    equipmentIds: ['EQ004'],
    active: true
  },
  {
    id: 'LOC004',
    name: 'Downtown Dental Group',
    completeName: 'Downtown Dental Group - Central Office',
    customerId: 'CUST004',
    customerName: 'Downtown Dental Group',
    street: '321 Business Street',
    street2: 'Level 5',
    city: 'Sydney',
    state: 'NSW',
    zip: '2000',
    country: 'Australia',
    phone: '+61 2 9222 3456',
    email: 'admin@downtowndental.com.au',
    territoryId: 'TERR005',
    territoryName: 'South Sydney',
    personIds: ['TECH004'],
    personNames: ['Emily Rodriguez'],
    equipmentIds: [],
    active: true
  }
];

export const mockEquipment: Equipment[] = [
  {
    id: 'EQ001',
    name: 'Dental Chair Unit A',
    assetName: 'DC-2023-001',
    locationId: 'LOC001',
    locationName: 'Bright Smiles Dental Clinic',
    personId: 'TECH001',
    personName: 'John Anderson',
    serialNumber: 'SN-DC-2023-001',
    model: 'Premium Pro 5000',
    manufacturer: 'DentalTech Industries',
    purchaseDate: '2023-01-15',
    warrantyExpiration: '2026-01-15',
    lastServiceDate: '2023-12-01',
    nextServiceDate: '2024-03-01',
    active: true
  },
  {
    id: 'EQ002',
    name: 'Digital X-Ray System',
    assetName: 'XR-2023-002',
    locationId: 'LOC001',
    locationName: 'Bright Smiles Dental Clinic',
    serialNumber: 'SN-XR-2023-002',
    model: 'Digital Pro XR-500',
    manufacturer: 'Imaging Solutions Co',
    purchaseDate: '2023-02-20',
    warrantyExpiration: '2026-02-20',
    lastServiceDate: '2023-11-15',
    nextServiceDate: '2024-02-15',
    active: true
  },
  {
    id: 'EQ003',
    name: 'Digital X-Ray System - New',
    assetName: 'XR-2024-003',
    locationId: 'LOC002',
    locationName: 'Coastal Dental Practice',
    serialNumber: 'SN-XR-2024-003',
    model: 'Digital Pro XR-600',
    manufacturer: 'Imaging Solutions Co',
    purchaseDate: '2024-01-10',
    warrantyExpiration: '2027-01-10',
    active: true
  },
  {
    id: 'EQ004',
    name: 'Autoclave Unit',
    assetName: 'AC-2022-004',
    locationId: 'LOC003',
    locationName: 'Family Dental Care',
    serialNumber: 'SN-AC-2022-004',
    model: 'Sterilizer Pro 3000',
    manufacturer: 'SterileTech',
    purchaseDate: '2022-06-10',
    warrantyExpiration: '2025-06-10',
    lastServiceDate: '2023-10-20',
    nextServiceDate: '2024-01-20',
    active: true
  },
  {
    id: 'EQ005',
    name: 'Ultrasonic Cleaner',
    assetName: 'UC-2023-005',
    locationId: 'LOC001',
    locationName: 'Bright Smiles Dental Clinic',
    serialNumber: 'SN-UC-2023-005',
    model: 'CleanWave 2000',
    manufacturer: 'CleanTech Systems',
    purchaseDate: '2023-03-05',
    warrantyExpiration: '2026-03-05',
    lastServiceDate: '2023-12-10',
    nextServiceDate: '2024-03-10',
    active: true
  }
];

export const mockTeams: Team[] = [
  {
    id: 'TEAM001',
    name: 'Maintenance Team A',
    description: 'Primary maintenance team covering Sydney Metro and Eastern Suburbs',
    sequence: 1,
    memberIds: ['TECH001', 'TECH003'],
    memberNames: ['John Anderson', 'Michael Chen'],
    active: true
  },
  {
    id: 'TEAM002',
    name: 'Installation Team',
    description: 'Specialized team for equipment installation and setup',
    sequence: 2,
    memberIds: ['TECH002', 'TECH005'],
    memberNames: ['Sarah Mitchell', 'David Thompson'],
    active: true
  },
  {
    id: 'TEAM003',
    name: 'Service Team B',
    description: 'Service team covering South Sydney and specialized services',
    sequence: 3,
    memberIds: ['TECH004'],
    memberNames: ['Emily Rodriguez'],
    active: true
  }
];

export const mockActivities: Activity[] = [
  {
    id: 'ACT001',
    name: 'Visual Inspection',
    description: 'Perform visual inspection of all equipment components',
    required: true,
    sequence: 1,
    categoryId: 'CAT001',
    categoryName: 'Inspection'
  },
  {
    id: 'ACT002',
    name: 'Calibration Check',
    description: 'Verify and calibrate equipment settings',
    required: true,
    sequence: 2,
    categoryId: 'CAT002',
    categoryName: 'Calibration'
  },
  {
    id: 'ACT003',
    name: 'Safety Test',
    description: 'Run safety and compliance tests',
    required: true,
    sequence: 3,
    categoryId: 'CAT001',
    categoryName: 'Inspection'
  },
  {
    id: 'ACT004',
    name: 'Documentation',
    description: 'Complete service documentation and reports',
    required: false,
    sequence: 4,
    categoryId: 'CAT003',
    categoryName: 'Administrative'
  }
];

export const mockRoutes: Route[] = [
  {
    id: 'ROUTE001',
    name: 'Sydney Metro Route - Jan 15',
    personId: 'TECH001',
    personName: 'John Anderson',
    vehicleId: 'VEH001',
    vehicleName: 'Service Van 1',
    date: '2024-01-15',
    orderIds: ['SO001'],
    orderNames: ['Dental Equipment Maintenance - Dr. Smith'],
    startLocationId: 'LOC001',
    endLocationId: 'LOC001',
    status: 'in_progress'
  },
  {
    id: 'ROUTE002',
    name: 'Northern Beaches Route - Jan 18',
    personId: 'TECH002',
    personName: 'Sarah Mitchell',
    vehicleId: 'VEH002',
    vehicleName: 'Installation Truck',
    date: '2024-01-18',
    orderIds: ['SO002'],
    orderNames: ['X-Ray System Installation'],
    startLocationId: 'LOC002',
    endLocationId: 'LOC002',
    status: 'draft'
  }
];


