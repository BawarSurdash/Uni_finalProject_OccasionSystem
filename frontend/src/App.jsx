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
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/event/:id' element={<EventDetail />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/servicesdetail/:id" element={<ServicesDetail />} />
      <Route path="/book/:id" element={<OrderForm />} />
      <Route path="/success" element={<BookingSuccess />} />
      <Route path="/booking/:id" element={<BookingDetail darkMode={darkMode} />} />
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
