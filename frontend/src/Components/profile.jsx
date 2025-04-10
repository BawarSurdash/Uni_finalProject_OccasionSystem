import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { BsBell, BsCheckCircle } from "react-icons/bs";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate('/login');
      }
    };
    
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    // Fetch user bookings when the History tab is active
    if (activeTab === "history") {
      fetchUserBookings();
    }
  }, [activeTab]);

  const fetchUserBookings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/booking/', {
        headers: { accessToken: token }
      });
      console.log('User bookings:', response.data);
      setUserBookings(response.data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setUserBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCancelClick = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3001/booking/cancel/${bookingToCancel}`, {}, {
        headers: { accessToken: token }
      });
      
      if (response.data.success) {
        // Update the booking status in the list
        setUserBookings(userBookings.map(booking => 
          booking.id === bookingToCancel ? { ...booking, status: 'cancelled' } : booking
        ));
        alert('Booking cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking: ' + (error.response?.data?.error || error.message));
    } finally {
      setShowCancelModal(false);
      setBookingToCancel(null);
    }
  };

  // Filter bookings based on status and date range
  const filteredBookings = userBookings.filter(booking => {
    // Status filter
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    // Date range filter
    let dateMatch = true;
    const bookingDate = new Date(booking.createdAt);
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      dateMatch = bookingDate >= start && bookingDate <= end;
    } else if (startDate) {
      const start = new Date(startDate);
      dateMatch = bookingDate >= start;
    } else if (endDate) {
      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      dateMatch = bookingDate <= end;
    }
    
    return matchesStatus && dateMatch;
  });
  
  // Calculate pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  

  const tabs = [
    { id: "personal", label: "Personal Information", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "history", label: "History", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8 mt-8 bg-white rounded-lg shadow-lg">
        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 backdrop-blur bg-white bg-opacity-5 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Cancel Booking</h3>
              <p className="mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes, Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Welcome back, {userData?.username || 'User'}!
            </h2>
            <p className="text-gray-600"> your personal account information here</p>
          </div>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
        
        {/* Enhanced Tabs */}
        <div className="relative flex justify-center space-x-1 border-b pb-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200
                ${activeTab === tab.id 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
                group flex items-center gap-2
              `}
            >
              <span className="transform transition-transform group-hover:scale-110">
                {tab.icon}
              </span>
              {tab.label}
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Hover indicator */}
              <div className={`
                absolute bottom-0 left-0 right-0 h-0.5 bg-orange-300 transform scale-x-0 transition-transform
                group-hover:scale-x-100 ${activeTab === tab.id ? 'opacity-0' : 'opacity-100'}
              `} />
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4"
        >
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Username</label>
                <input 
                  type="text" 
                  value={userData?.username || ''}
                  className="w-full p-2 border rounded-lg bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={userData?.email || ''}
                  className="w-full p-2 border rounded-lg bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-4 w-full">
              <NotificationsPanel />
            </div>
          )}

          {activeTab === "history" && (
            <div className="p-4 w-full">
              {/* Filter controls */}
              <div className="mb-4 flex flex-wrap items-end gap-4">
                <div>
                  <select 
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setCurrentPage(1); // Reset to first page when filter changes
                      }}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setCurrentPage(1); // Reset to first page when filter changes
                      }}
                      className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 h-[42px]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  <p className="mt-2 text-gray-600">Loading your bookings...</p>
                </div>
              ) : userBookings.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600">You don't have any bookings yet.</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600">No bookings match your search criteria.</p>
                </div>
              ) : (
                <div className="w-full">
                  <table className="w-full border border-gray-200 shadow-md rounded-lg text-base">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-4 px-3 border-b text-left font-semibold">ID</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Username</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Date</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Service</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Phone</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Address</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Payment</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Amount</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Status</th>
                        <th className="py-4 px-3 border-b text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="py-4 px-3 border-b">#{booking.id}</td>
                          <td className="py-4 px-3 border-b">{booking.User?.username || userData?.username || 'N/A'}</td>
                          <td className="py-4 px-3 border-b">{formatDate(booking.createdAt)}</td>
                          <td className="py-4 px-3 border-b">{booking.Post?.title || 'N/A'}</td>
                          <td className="py-4 px-3 border-b">{booking.phoneNumber || 'N/A'}</td>
                          <td className="py-4 px-3 border-b">{booking.address || 'N/A'}</td>
                          <td className="py-4 px-3 border-b">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              booking.paymentMethod?.toLowerCase() === 'cash' ? 'bg-yellow-100 text-yellow-800' :
                              booking.paymentMethod?.toLowerCase() === 'fib' ? 'bg-green-100 text-green-800' :
                              booking.paymentMethod?.toLowerCase() === 'fastpay' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 px-3 border-b">${booking.totalPrice}</td>
                          <td className="py-4 px-3 border-b">
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-3 border-b whitespace-nowrap">
                            <button 
                              style={{ marginRight: '50px' }}
                              className="text-blue-500 hover:text-blue-700 font-medium"
                              onClick={() => navigate(`/booking/${booking.id}`)}
                            >
                              View
                            </button>
                            {booking.status === 'pending' && (
                              <button 
                                className="text-red-500 hover:text-red-700 font-medium"
                                onClick={() => handleCancelClick(booking.id)}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination controls */}
                  {filteredBookings.length > bookingsPerPage && (
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-gray-600">
                        Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} bookings
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === 1 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage >= totalPages}
                          className={`px-4 py-2 rounded-md ${
                            currentPage >= totalPages
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/notification/user', {
        headers: { accessToken: token }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/notification/${notificationId}/read`, {}, {
        headers: { accessToken: token }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3001/notification/user/mark-all-read', {}, {
        headers: { accessToken: token }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        <p className="mt-2 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={fetchNotifications}
          className="mt-2 px-4 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Notifications</h2>
        {notifications.filter(n => !n.read).length > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200"
          >
            <BsCheckCircle className="mr-1" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <BsBell style={{ fontSize: '3rem' }} className="mx-auto mb-4" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 rounded-lg transition-all duration-200 ${
                notification.read 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-white border-l-4 border-l-orange-500 border-t border-r border-b border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">
                  {notification.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(notification.createdAt)}
                  </span>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-gray-600">
                {notification.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;