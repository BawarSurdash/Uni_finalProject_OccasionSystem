import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import Home from './Components/home'
import Services from './Components/services'
import Event from './Components/event'
import About from './Components/about'
import Contact from './Components/contact'
import Signup from './Components/signup'
import Login from './Components/login'
import Profile from './Components/profile'
import EventDetail from './Components/eventDetail'
import ServicesDetail from './Components/servicesDetail'
import OrderForm from './Components/orderform'
import BookingSuccess from './Components/BookingSuccess'
import BookingDetail from './Components/BookingDetail'
import Dashboard from './Components/admin/Dashboard'
import AdminProfile from './Components/admin/profile'
import AdminRoute from './Components/AdminRoute'
import ThemeProvider, { useTheme } from './contexts/ThemeContext'

function AppRoutes() {
  const { darkMode } = useTheme();
  
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path="/signup" element={<Signup darkMode={darkMode} />} />
      <Route path="/login" element={<Login darkMode={darkMode} />} />
      
      <Route path='/services' element={<Services />} />
      <Route path='/events' element={<Event />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
      
      {/* Admin Routes */}
      <Route path='/dashboard/*' element={
        <AdminRoute>
          <Dashboard />
        </AdminRoute>
      } />
      
      {/* Admin Profile - Both Admin and Super Admin can access */}
      <Route path='/admin/profile' element={
        <AdminRoute>
          <Dashboard initialTab="profile" />
        </AdminRoute>
      } />
      
      {/* Role Management - Only Super Admin can access */}
      <Route path='/admin/roles' element={
        <AdminRoute superAdminOnly={true}>
          <Dashboard initialTab="profile" />
        </AdminRoute>
      } />
      
      {/* Catch-all for any dashboard-related paths */}
      <Route path='/admin/*' element={
        <AdminRoute>
          <Dashboard />
        </AdminRoute>
      } />
      
      <Route path='/event/:id' element={<EventDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/servicesdetail/:id" element={<ServicesDetail />} />
      <Route path="/book/:id" element={<OrderForm />} />
      <Route path="/success" element={<BookingSuccess />} />
      <Route path="/booking/:id" element={<BookingDetail darkMode={darkMode} />} />
      
      {/* Redirect dashboard URLs without the AdminRoute to proper route */}
      <Route path="*" element={
        <Navigate to="/" replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
