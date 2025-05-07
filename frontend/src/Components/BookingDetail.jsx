import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './navbar';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const BookingDetail = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg", // Replace with your actual API key
    libraries: ["places"]
  });

  useEffect(() => {
    const fetchBookingDetails = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:3001/booking/${id}`, {
          headers: { accessToken: token }
        });
        setBooking(response.data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setError(error.response?.data?.error || 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCancelClick = () => {
    setShowCancelConfirmModal(true);
  };

  const cancelBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3001/booking/cancel/${id}`, {}, {
        headers: { accessToken: token }
      });
      
      if (response.data.success) {
        setBooking({ ...booking, status: 'cancelled' });
        setShowCancelConfirmModal(false);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + (error.response?.data?.error || error.message));
      setShowCancelConfirmModal(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/profile');
  };
  
  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '0.75rem',
  };
  
  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: darkMode ? [
      { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }
    ] : []
  };
  
  // Define status color and icon
  const getStatusConfig = (status) => {
    switch(status) {
      case 'completed':
        return {
          color: darkMode ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-100 text-green-800 border-green-300',
          iconColor: darkMode ? 'text-green-400' : 'text-green-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'confirmed':
        return {
          color: darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300',
          iconColor: darkMode ? 'text-blue-400' : 'text-blue-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'pending':
        return {
          color: darkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300',
          iconColor: darkMode ? 'text-yellow-400' : 'text-yellow-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'cancelled':
      default:
        return {
          color: darkMode ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-100 text-red-800 border-red-300',
          iconColor: darkMode ? 'text-red-400' : 'text-red-500',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg py-8 px-4`}>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
            <p className={`text-center mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg py-8 px-4`}>
            <div className={`${darkMode ? 'bg-red-900/20 border-red-800 text-red-200' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 rounded-md`}>
              <p>{error}</p>
            </div>
            <div className="flex justify-center mt-6">
              <button 
                className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-md transition-colors`}
                onClick={() => navigate('/profile')}
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
      <Navbar />
      
      {/* Modals */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md mx-auto p-6 shadow-xl`}>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Cancel Booking
              </h3>
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowCancelConfirmModal(false)}
                  className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                >
                  No, Keep Booking
                </button>
                <button 
                  onClick={cancelBooking}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Yes, Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md mx-auto p-6 shadow-xl`}>
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'} mb-4`}>
                <svg className={`h-6 w-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Booking Cancelled Successfully
              </h3>
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Your booking has been cancelled. You'll be redirected to your profile.
              </p>
              <button 
                onClick={handleSuccessClose}
                className={`px-4 py-2 w-full rounded-md ${darkMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'} text-white transition-colors`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && booking && booking.imageProof && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" 
            onClick={() => setShowImageModal(false)}
          ></div>
          <div className="relative z-50 max-w-4xl p-2">
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setShowImageModal(false)}
                className="bg-gray-800 bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img 
              src={`http://localhost:3001${booking.imageProof}`} 
              alt="Payment Proof" 
              className="mx-auto max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {booking && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Back button */}
          <button 
            onClick={() => navigate('/profile')}
            className={`mb-6 flex items-center ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Profile
          </button>
          
          {/* Header section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden mb-6`}>
            <div className={`px-6 py-4 ${darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Booking #{booking.id}
                  </h1>
                  {booking.Post && (
                    <p className="text-white text-opacity-90 mt-1">{booking.Post.title}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium bg-white ${
                      booking.status === 'completed' ? 'text-green-700' : 
                      booking.status === 'pending' ? 'text-yellow-700' :
                      booking.status === 'confirmed' ? 'text-blue-700' :
                      'text-red-700'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                  <div className="text-xl font-bold bg-white/20 px-3 py-1 rounded-lg">
                    ${parseFloat(booking.totalPrice).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status information */}
            <div className="px-6 py-4 border-b border-dashed border-opacity-50 border-gray-300">
              <div className={`flex items-center justify-between p-3 rounded-lg ${getStatusConfig(booking.status).color}`}>
                <div className="flex items-center">
                  <span className={`flex items-center justify-center w-10 h-10 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} mr-3 ${getStatusConfig(booking.status).iconColor}`}>
                    {getStatusConfig(booking.status).icon}
                  </span>
                  <div>
                    <p className="font-medium">
                      {booking.status === 'pending' && 'Your booking is waiting to be confirmed'}
                      {booking.status === 'confirmed' && 'Your booking has been confirmed!'}
                      {booking.status === 'completed' && 'Your booking has been completed'}
                      {booking.status === 'cancelled' && 'This booking has been cancelled'}
                    </p>
                    <p className="text-sm opacity-80">Booking made on {formatDate(booking.createdAt)}</p>
                  </div>
                </div>
                {booking.status === 'pending' && (
                  <button 
                    onClick={handleCancelClick}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-sm font-medium rounded-md transition-colors"
                    style={{ color: 'white' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
            
            {/* Tab navigation */}
            <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px">
                <li className="mr-2">
                  <button
                    className={`inline-block px-4 py-2 rounded-t-lg border-b-2 ${
                      activeTab === 'details'
                        ? darkMode
                          ? 'text-blue-400 border-blue-400'
                          : 'text-blue-600 border-blue-600'
                        : darkMode
                          ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
                          : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Details
                    </div>
                  </button>
                </li>
                {(booking.latitude && booking.longitude) && (
                  <li className="mr-2">
                    <button
                      className={`inline-block px-4 py-2 rounded-t-lg border-b-2 ${
                        activeTab === 'map'
                          ? darkMode
                            ? 'text-blue-400 border-blue-400'
                            : 'text-blue-600 border-blue-600'
                          : darkMode
                            ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
                            : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('map')}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location
                      </div>
                    </button>
                  </li>
                )}
                <li className="mr-2">
                  <button
                    className={`inline-block px-4 py-2 rounded-t-lg border-b-2 ${
                      activeTab === 'service'
                        ? darkMode
                          ? 'text-blue-400 border-blue-400'
                          : 'text-blue-600 border-blue-600'
                        : darkMode
                          ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
                          : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('service')}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Service
                    </div>
                  </button>
                </li>
                {booking.imageProof && (
                  <li>
                    <button
                      className={`inline-block px-4 py-2 rounded-t-lg border-b-2 ${
                        activeTab === 'payment'
                          ? darkMode
                            ? 'text-blue-400 border-blue-400'
                            : 'text-blue-600 border-blue-600'
                          : darkMode
                            ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
                            : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('payment')}
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Payment
                      </div>
                    </button>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Tab content */}
            <div className="p-6">
              {/* Details tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Booking Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Booking Date:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(booking.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Event Date:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(booking.eventDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Payment Method:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.paymentMethod?.toLowerCase() === 'cash' 
                            ? darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                            : booking.paymentMethod?.toLowerCase() === 'fib' 
                            ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                            : booking.paymentMethod?.toLowerCase() === 'fastpay' 
                            ? darkMode ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'
                            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Contact Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Phone Number:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{booking.phoneNumber}</span>
                        </div>
                        <div>
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Address:</span>
                          <p className={`mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{booking.address}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Map tab */}
              {activeTab === 'map' && (booking.latitude && booking.longitude) && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Event Location
                  </h3>
                  <div className="rounded-lg overflow-hidden shadow-md">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{
                          lat: parseFloat(booking.latitude),
                          lng: parseFloat(booking.longitude)
                        }}
                        zoom={15}
                        options={mapOptions}
                      >
                        <Marker
                          position={{
                            lat: parseFloat(booking.latitude),
                            lng: parseFloat(booking.longitude)
                          }}
                          icon={{
                            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='36px' height='36px'%3E%3Cpath fill='%23F97316' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
                            scaledSize: { width: 36, height: 36 },
                            origin: { x: 0, y: 0 },
                            anchor: { x: 18, y: 36 },
                          }}
                        />
                      </GoogleMap>
                    ) : (
                      <div className={`h-[300px] flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading map...</p>
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Address: {booking.address}
                  </p>
                </div>
              )}
              
              {/* Service tab */}
              {activeTab === 'service' && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Service Details
                  </h3>
                  
                  {booking.Post ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        {booking.Post.image && (
                          <div className="mb-4 rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={booking.Post.image} 
                              alt={booking.Post.title}
                              className="w-full h-56 object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {booking.Post.title}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {booking.Post.category}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                            Base Price: ${parseFloat(booking.Post.basePrice).toFixed(2)}
                          </span>
                        </div>
                        {booking.Post.description && (
                          <div>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {booking.Post.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Service details not available</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Payment tab */}
              {activeTab === 'payment' && booking.imageProof && (
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Payment Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Total Amount:</span>
                          <span className="text-xl font-bold text-green-500">${parseFloat(booking.totalPrice).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Payment Method:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.paymentMethod?.toLowerCase() === 'cash' 
                            ? darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                            : booking.paymentMethod?.toLowerCase() === 'fib' 
                            ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                            : booking.paymentMethod?.toLowerCase() === 'fastpay' 
                            ? darkMode ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'
                            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="space-y-2">
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Proof:</p>
                        <div className="flex justify-center rounded-lg overflow-hidden border border-gray-300">
                          <img 
                            src={`http://localhost:3001${booking.imageProof}`} 
                            alt="Payment Proof" 
                            className="h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setShowImageModal(true)}
                          />
                        </div>
                        <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Click to view larger image
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail; 