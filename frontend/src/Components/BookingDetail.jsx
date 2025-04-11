import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './navbar';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const cancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3001/booking/cancel/${id}`, {}, {
        headers: { accessToken: token }
      });
      
      if (response.data.success) {
        setBooking({ ...booking, status: 'cancelled' });
        alert('Booking cancelled successfully');
        navigate('/booking-success', {
          state: {
            postId: booking.Post.id,
            bookingData: booking
          }
        });
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + (error.response?.data?.error || error.message));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Navbar />
        <div className="max-w-4xl mx-auto p-8 mt-8 bg-white rounded-lg shadow-lg">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            <p className="mt-2 text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <Navbar />
        <div className="max-w-4xl mx-auto p-8 mt-8 bg-white rounded-lg shadow-lg">
          <div className="text-center py-10">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 mt-8 bg-white rounded-lg shadow-lg">
        {booking ? (
          <>
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Booking #{booking.id}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Booking Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-gray-600">Booking Date:</div>
                    <div>{formatDate(booking.createdAt)}</div>
                    
                    <div className="text-gray-600">Event Date:</div>
                    <div>{formatDate(booking.eventDate)}</div>
                    
                    <div className="text-gray-600">Total Price:</div>
                    <div className="font-medium">${booking.totalPrice}</div>
                    
                    <div className="text-gray-600">Payment Method:</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        booking.paymentMethod?.toLowerCase() === 'cash' ? 'bg-yellow-100 text-yellow-800' :
                        booking.paymentMethod?.toLowerCase() === 'fib' ? 'bg-green-100 text-green-800' :
                        booking.paymentMethod?.toLowerCase() === 'fastpay' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.paymentMethod}
                      </span>
                    </div>
                    
                    <div className="text-gray-600">Phone Number:</div>
                    <div>{booking.phoneNumber}</div>
                    
                    <div className="text-gray-600">Address:</div>
                    <div>{booking.address}</div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Service Information</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {booking.Post ? (
                    <div>
                      <h3 className="font-medium text-gray-800 mb-2">{booking.Post.title}</h3>
                      <p className="text-gray-600 mb-2">Category: {booking.Post.category}</p>
                      <p className="text-gray-600">Base Price: ${booking.Post.basePrice}</p>
                      {booking.Post.image && (
                        <img 
                          src={booking.Post.image} 
                          alt={booking.Post.title}
                          className="mt-4 rounded-lg w-full h-48 object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">Service details not available</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={() => navigate('/profile')}
              >
                Back to Profile
              </button>
              
              {booking.status === 'pending' && (
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  onClick={cancelBooking}
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">Booking not found</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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