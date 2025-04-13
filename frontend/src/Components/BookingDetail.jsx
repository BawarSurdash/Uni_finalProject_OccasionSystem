import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './navbar';

const BookingDetail = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
        <Navbar />
        <div className={`max-w-4xl mx-auto p-8 mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
        <Navbar />
        <div className={`max-w-4xl mx-auto p-8 mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
          <div className="text-center py-10">
            <div className={`${darkMode ? 'bg-red-900 border-red-800 text-red-200' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4 rounded`}>
              <p>{error}</p>
            </div>
            <button 
              className={`mt-4 px-4 py-2 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded hover:bg-blue-600`}
              onClick={() => navigate('/profile')}
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
      <Navbar />
      <div className={`max-w-4xl mx-auto p-8 mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        {booking ? (
          <>
            {/* Cancel Confirmation Modal */}
            {showCancelConfirmModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
                <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
                <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-md mx-auto p-6 shadow-xl`}>
                  <div className="text-center">
                    <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Cancel Booking
                    </h3>
                    <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Are you sure you want to cancel this booking? This action cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => setShowCancelConfirmModal(false)}
                        className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        No, Keep Booking
                      </button>
                      <button 
                        onClick={cancelBooking}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
                      className={`px-4 py-2 w-full rounded-md ${darkMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className={`flex justify-between items-center mb-6 ${darkMode ? 'border-gray-700' : 'border-b'} pb-4`}>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Booking #{booking.id}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === 'completed' 
                ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' 
                : booking.status === 'pending' 
                ? darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                : booking.status === 'confirmed' 
                ? darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                : darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Booking Information</h2>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Booking Date:</div>
                    <div className={darkMode ? 'text-white' : ''}>{formatDate(booking.createdAt)}</div>
                    
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Event Date:</div>
                    <div className={darkMode ? 'text-white' : ''}>{formatDate(booking.eventDate)}</div>
                    
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Price:</div>
                    <div className={`font-medium ${darkMode ? 'text-white' : ''}`}>${booking.totalPrice}</div>
                    
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method:</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        booking.paymentMethod?.toLowerCase() === 'cash' 
                        ? darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                        : booking.paymentMethod?.toLowerCase() === 'fib' 
                        ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                        : booking.paymentMethod?.toLowerCase() === 'fastpay' 
                        ? darkMode ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'
                        : darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.paymentMethod}
                      </span>
                    </div>
                    
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone Number:</div>
                    <div className={darkMode ? 'text-white' : ''}>{booking.phoneNumber}</div>
                    
                    <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Address:</div>
                    <div className={darkMode ? 'text-white' : ''}>{booking.address}</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Service Information</h2>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                  {booking.Post ? (
                    <div>
                      <h3 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{booking.Post.title}</h3>
                      <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category: {booking.Post.category}</p>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Base Price: ${booking.Post.basePrice}</p>
                      {booking.Post.image && (
                        <img 
                          src={booking.Post.image} 
                          alt={booking.Post.title}
                          className="mt-4 rounded-lg w-full h-48 object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Service details not available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button 
                className={`px-4 py-2 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg`}
                onClick={() => navigate('/profile')}
              >
                Back to Profile
              </button>
              
              {booking.status === 'pending' && (
                <button 
                  className={`px-4 py-2 ${darkMode ? 'bg-red-600' : 'bg-red-500'} text-white rounded-lg hover:bg-red-600`}
                  onClick={handleCancelClick}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Booking not found</p>
            <button 
              className={`mt-4 px-4 py-2 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded hover:bg-blue-600`}
              onClick={() => navigate('/profile')}
            >
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail; 