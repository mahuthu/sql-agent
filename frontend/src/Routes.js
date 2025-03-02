import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TemplateList from './components/TemplateList';
import TemplateForm from './components/TemplateForm';
import QueryInterface from './components/QueryInterface';
import UsageStats from './components/UsageStats';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import Subscription from './components/Subscription';
import SubscriptionSuccess from './components/SubscriptionSuccess';
import SubscriptionCancel from './components/SubscriptionCancel';
import Homepage from './components/Homepage';
import Contact from './components/Contact';
import Documentation from './components/Documentation';




const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/documentation" element={<Documentation />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
      <Route path="/templates" element={<PrivateRoute component={TemplateList} />} />
      <Route path="/templates/new" element={<PrivateRoute component={TemplateForm} />} />
      <Route 
        path="/templates/:id/edit" 
        element={<PrivateRoute component={TemplateForm} />} 
      />
      <Route 
        path="/query/:templateId" 
        element={<PrivateRoute component={QueryInterface} />} 
      />
      <Route path="/usage" element={<PrivateRoute component={UsageStats} />} />
      <Route path="/settings" element={<PrivateRoute component={Settings} />} />
      <Route 
        path="/subscription" 
        element={<PrivateRoute component={Subscription} />} 
      />
      <Route 
        path="/subscription/success" 
        element={<PrivateRoute component={SubscriptionSuccess} />} 
      />
      <Route 
        path="/subscription/cancel" 
        element={<PrivateRoute component={SubscriptionCancel} />} 
      />
    </Routes>
  );
};

export default AppRoutes; 