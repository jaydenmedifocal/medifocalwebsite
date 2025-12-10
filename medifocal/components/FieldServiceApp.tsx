import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboardFieldService';
import AdminOverview from './admin/AdminOverview';
import BacklinkManagement from './admin/BacklinkManagement';
import Reports from './admin/Reports';
import UserManagement from './admin/UserManagement';
import Clients from './admin/Clients';
import ServiceOrders from './admin/ServiceOrders';
import Technicians from './admin/Technicians';
import Locations from './admin/Locations';
import Equipment from './admin/Equipment';
import Teams from './admin/Teams';
import Activities from './admin/Activities';
import RecurringOrders from './admin/RecurringOrders';
import Territories from './admin/Territories';
import RoutesPage from './admin/Routes';
import Skills from './admin/Skills';
import Agreements from './admin/Agreements';
import Vehicles from './admin/Vehicles';
import Tags from './admin/Tags';
import OrderTypes from './admin/OrderTypes';
import OrderTemplates from './admin/OrderTemplates';
import Categories from './admin/Categories';
import Sizes from './admin/Sizes';
import Timesheets from './admin/Timesheets';
import Availability from './admin/Availability';
import EquipmentWarranty from './admin/EquipmentWarranty';
import RepairOrders from './admin/RepairOrders';
import CRM from './admin/CRM';
import Projects from './admin/Projects';
import Invoices from './admin/Invoices';
import Stock from './admin/Stock';
import Sales from './admin/Sales';
import StageActions from './admin/StageActions';
import Calendar from './admin/Calendar';
import FrequencySets from './admin/FrequencySets';
import RecurringTemplates from './admin/RecurringTemplates';
import Dayroutes from './admin/Dayroutes';
import LocationPersons from './admin/LocationPersons';
import ConfigSettings from './admin/ConfigSettings';
import CalendarFilters from './admin/CalendarFilters';
import ConversionWizard from './admin/ConversionWizard';
import MedifocalAutoclave from './admin/MedifocalAutoclave';
import RaspberryPiManagement from './admin/RaspberryPiManagement';
import AliExpressProducts from './admin/AliExpressProducts';
import AliExpressOrders from './admin/AliExpressOrders';

// Create a wrapper AuthProvider that uses medifocal's AuthContext
const FieldServiceAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // The admin pages will use useAuth from medifocal's context
  // We need to create a compatible context for the admin pages
  return <>{children}</>;
};

interface FieldServiceAppProps {
  setCurrentView?: (view: any) => void;
}

const FieldServiceApp: React.FC<FieldServiceAppProps> = ({ setCurrentView }) => {
  const { isFieldServiceUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isFieldServiceUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You do not have permission to access the field service dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <main className="main-content">
          <Routes>
            <Route path="/admin" element={<AdminDashboard setCurrentView={setCurrentView} />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="clients" element={<Clients />} />
              <Route path="orders" element={<ServiceOrders />} />
              <Route path="technicians" element={<Technicians />} />
              <Route path="locations" element={<Locations />} />
              <Route path="equipment" element={<Equipment />} />
              <Route path="teams" element={<Teams />} />
              <Route path="activities" element={<Activities />} />
              <Route path="recurring" element={<RecurringOrders />} />
              <Route path="territories" element={<Territories />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="skills" element={<Skills />} />
              <Route path="agreements" element={<Agreements />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="tags" element={<Tags />} />
              <Route path="order-types" element={<OrderTypes />} />
              <Route path="templates" element={<OrderTemplates />} />
              <Route path="categories" element={<Categories />} />
              <Route path="sizes" element={<Sizes />} />
              <Route path="timesheets" element={<Timesheets />} />
              <Route path="availability" element={<Availability />} />
              <Route path="warranty" element={<EquipmentWarranty />} />
              <Route path="repairs" element={<RepairOrders />} />
              <Route path="crm" element={<CRM />} />
              <Route path="projects" element={<Projects />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="stock" element={<Stock />} />
              <Route path="sales" element={<Sales />} />
              <Route path="backlinks" element={<BacklinkManagement />} />
              <Route path="stage-actions" element={<StageActions />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="frequency-sets" element={<FrequencySets />} />
              <Route path="recurring-templates" element={<RecurringTemplates />} />
              <Route path="dayroutes" element={<Dayroutes />} />
              <Route path="location-persons" element={<LocationPersons />} />
              <Route path="config-settings" element={<ConfigSettings />} />
              <Route path="calendar-filters" element={<CalendarFilters />} />
              <Route path="conversion-wizard" element={<ConversionWizard />} />
              <Route path="medifocal-autoclave" element={<MedifocalAutoclave />} />
              <Route path="raspberry-pi" element={<RaspberryPiManagement />} />
              <Route path="aliexpress" element={<AliExpressProducts />} />
              <Route path="aliexpress/orders" element={<AliExpressOrders />} />
              <Route path="backlinks" element={<BacklinkManagement />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default FieldServiceApp;

