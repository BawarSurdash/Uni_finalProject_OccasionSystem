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
import Dashboard from './Components/dashboard'
import Profile from './Components/profile'
import EventDetail from './Components/eventDetail'
import ServicesDetail from './Components/servicesDetail'
import OrderForm from './Components/orderform'
import BookingSuccess from './Components/BookingSuccess'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
