import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { useNavigate, Link } from "react-router-dom";
import { FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { BsBell, BsCheckCircle } from "react-icons/bs";
import PostRating from "./PostRating";
import { useTheme } from "../contexts/ThemeContext";

// CSS for dark mode
const darkModeStyles = `
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --bg-card: #ffffff;
    --text-primary: #1f2937;
    --text-secondary: #4b5563;
    --border-color: #e5e7eb;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --accent-color: #f97316;
    --accent-color-light: #ffedd5;
  }

  .dark-mode {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --bg-card: #242424;
    --text-primary: #e5e7eb;
    --text-secondary: #9ca3af;
    --border-color: #374151;
    --shadow-color: rgba(0, 0, 0, 0.5);
    --accent-color: #f97316;
    --accent-color-light: #7c2d12;
  }

  .dark-mode body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }

  .dark-mode .profile-container {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  .dark-mode .profile-card {
    background-color: var(--bg-card);
    border-color: var(--border-color);
    box-shadow: 0 4px 6px var(--shadow-color);
  }

  .dark-mode .profile-heading {
    color: var(--text-primary);
  }

  .dark-mode .profile-subheading {
    color: var(--text-secondary);
  }

  .dark-mode .profile-input {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .dark-mode .profile-tab {
    background-color: var(--bg-card);
    color: var(--text-primary);
    border-color: var(--border-color);
  }

  .dark-mode .profile-tab-active {
    background-color: var(--accent-color-light);
    color: var(--accent-color);
  }

  .dark-mode .profile-table {
    background-color: var(--bg-card);
    color: var(--text-primary);
    border-color: var(--border-color);
  }

  .dark-mode .profile-table th,
  .dark-mode .profile-table td {
    border-color: var(--border-color);
  }

  .dark-mode .profile-table tr:hover {
    background-color: var(--bg-secondary);
  }
`;

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cancelledBookingId, setCancelledBookingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Use the global theme context instead of local state
  const { darkMode, toggleDarkMode } = useTheme();

  // Check for URL parameters to set the active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

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
        
        // Check if user is admin
        if (response.data.role?.toLowerCase() === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate('/login');
      }
    };
    
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    // Fetch user bookings when the History tab or Orders tab is active
    if (activeTab === "history" || activeTab === "orders") {
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
        setCancelledBookingId(bookingToCancel);
        setShowCancelModal(false);
        setShowSuccessModal(true);
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
    // For history tab, filter by status
    if (activeTab === "history") {
      if (statusFilter === "all") {
        return booking.status === "cancelled" || booking.status === "completed";
      } else {
        return booking.status === statusFilter;
      }
    }
    
    // For orders tab, filter by status (pending or confirmed)
    if (activeTab === "orders") {
      if (statusFilter === "all") {
        return booking.status === "pending" || booking.status === "confirmed";
      } else {
        return booking.status === statusFilter;
      }
    }
    
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
    { id: "orders", label: "Orders", icon: "🛒" },
    { id: "history", label: "History", icon: "📋" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  // Add this section to render after the navigation tabs
  const renderAdminSection = () => {
    if (!isAdmin) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`mb-8 p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-purple-50 border-purple-200'} rounded-lg border shadow-sm`}
      >
        <div className="flex items-center mb-3">
          <div className={`p-2 rounded-full mr-3 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-purple-800'}`}>Admin Access</h2>
        </div>
        
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          You have administrative privileges. Access the admin profile to manage users and system settings.
        </p>
        
        <Link 
          to="/admin/profile" 
          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode 
              ? 'bg-purple-700 text-white hover:bg-purple-600' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Go to Admin Profile
        </Link>
        
        <Link 
          to="/dashboard" 
          className={`ml-3 inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
            darkMode 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Dashboard
        </Link>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16 transition-colors duration-200`}>
      <Navbar />
      <div className={`max-w-7xl mx-auto p-8 mt-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg transition-colors duration-200`}>
        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 backdrop-blur bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-xl max-w-md w-full transition-colors duration-200`}>
              <h3 className="text-xl font-semibold mb-4">Cancel Booking</h3>
              <p className="mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className={`px-4 py-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'} rounded hover:bg-gray-300 transition-colors duration-200`}
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                >
                  Yes, Cancel Booking
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 backdrop-blur bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 rounded-lg shadow-xl max-w-md w-full transition-colors duration-200`}>
              <div className="text-center">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'} mb-4`}>
                  <svg className={`h-6 w-6 ${darkMode ? 'text-green-300' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Booking Cancelled Successfully</h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Your booking #{cancelledBookingId} has been cancelled.
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className={`w-full px-4 py-2 ${darkMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-lg transition-colors duration-200`}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
              Welcome back, {userData?.username || 'User'}!
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>
              your personal account information here
            </p>
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
        
        {/* Admin section - place this right after the profile header */}
        {renderAdminSection()}
        
        {/* Enhanced Tabs */}
        <div className={`relative flex justify-center flex-wrap space-x-1 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b pb-2 mb-6 transition-colors duration-200`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-2
                ${activeTab === tab.id 
                  ? darkMode 
                    ? 'text-white bg-[#101828]' 
                    : 'text-orange-600 bg-orange-50'
                  : darkMode
                    ? 'text-white hover:bg-gray-800' 
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
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${darkMode ? 'bg-white' : 'bg-orange-500'}`}
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              {/* Hover indicator */}
              <div className={`
                absolute bottom-0 left-0 right-0 h-0.5 ${darkMode ? 'bg-gray-500' : 'bg-orange-300'} transform scale-x-0 transition-transform
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
          className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-200`}
        >
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div>
                <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Username</label>
                <input 
                  type="text" 
                  value={userData?.username || ''}
                  className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
                  readOnly
                />
              </div>
              <div>
                <label className={`block ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email</label>
                <input 
                  type="email" 
                  value={userData?.email || ''}
                  className={`w-full p-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-800'}`}
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

          {activeTab === "orders" && (
            <div className="p-4 w-full">
              <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Current Orders</h2>
              
              {/* Filter controls - simplified for orders tab */}
              <div className="mb-4 flex flex-wrap items-end gap-4">
                <div>
                  <select 
                    className={`p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
                
                <div className="flex items-end gap-2">
                  <div>
                    <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setCurrentPage(1); // Reset to first page when filter changes
                      }}
                      className={`p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setCurrentPage(1); // Reset to first page when filter changes
                      }}
                      className={`p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className={`p-2 ${
                        darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } rounded-lg h-[42px]`}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your orders...</p>
                </div>
              ) : userBookings.length === 0 ? (
                <div className={`text-center py-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>You don't have any current orders.</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className={`text-center py-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>No orders match your search criteria.</p>
                </div>
              ) : (
                <div className="w-full">
                  <table className={`w-full border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-md rounded-lg text-base`}>
                    <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <tr>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>ID</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Username</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Date</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Service</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Phone</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Address</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Payment</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Amount</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Status</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBookings.map(booking => (
                        <tr key={booking.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>#{booking.id}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{booking.User?.username || userData?.username || 'N/A'}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{formatDate(booking.createdAt)}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{booking.Post?.title || 'N/A'}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{booking.phoneNumber || 'N/A'}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{booking.address || 'N/A'}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
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
                          </td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>${booking.totalPrice}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              booking.status === 'confirmed' 
                                ? darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                : darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className={`py-4 px-3 border-b whitespace-nowrap ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button 
                              style={{ marginRight: '50px' }}
                              className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                              onClick={() => navigate(`/booking/${booking.id}`)}
                            >
                              View
                            </button>
                            {booking.status === 'pending' && (
                              <button 
                                className={`font-medium ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
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
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} orders
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === 1 
                              ? darkMode 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : darkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
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
                              ? darkMode 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : darkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
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

          {activeTab === "history" && (
            <div className="p-4 w-full">
              <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Booking History</h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>View your completed and cancelled bookings</p>
              
              {/* Filter controls */}
              <div className="mb-4 flex flex-wrap items-end gap-4">
                <div>
                  <select 
                    className={`p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <div>
                    <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Start Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setCurrentPage(1); // Reset to first page when filter changes
                      }}
                      className={`p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>End Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setCurrentPage(1); // Reset to first page when filter changes
                      }}
                      className={`p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                      }`}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className={`p-2 ${
                        darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } rounded-lg h-[42px]`}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your bookings...</p>
                </div>
              ) : userBookings.length === 0 ? (
                <div className={`text-center py-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>You don't have any bookings yet.</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className={`text-center py-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>No bookings match your search criteria.</p>
                </div>
              ) : (
                <div className="w-full">
                  <table className={`w-full border ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-md rounded-lg text-base`}>
                    <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                      <tr>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>ID</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Username</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Date</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Service</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Phone</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Address</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Payment</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Amount</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Status</th>
                        <th className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-800'} text-left font-semibold`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBookings.map(booking => (
                        <tr key={booking.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>#{booking.id}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{booking.User?.username || userData?.username || 'N/A'}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{formatDate(booking.createdAt)}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{booking.Post?.title || 'N/A'}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{booking.phoneNumber || 'N/A'}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>{booking.address || 'N/A'}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
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
                          </td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700 text-white' : 'border-gray-200'}`}>${booking.totalPrice}</td>
                          <td className={`py-4 px-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                              booking.status === 'completed' 
                                ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                : booking.status === 'cancelled' 
                                  ? darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                          <td className={`py-4 px-3 border-b whitespace-nowrap ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button 
                              style={{ marginRight: '50px' }}
                              className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'}`}
                              onClick={() => navigate(`/booking/${booking.id}`)}
                            >
                              View
                            </button>
                            {booking.status === 'pending' && (
                              <button 
                                className={`font-medium ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
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
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Showing {indexOfFirstBooking + 1}-{Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} bookings
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-md ${
                            currentPage === 1 
                              ? darkMode 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : darkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
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
                              ? darkMode 
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : darkMode
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
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

          {activeTab === "settings" && (
            <div className="p-4 w-full">
              <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Settings</h2>
              
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Dark Mode</h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm transition-colors duration-200`}>Toggle between light and dark theme</p>
                  </div>
                  
                  <button 
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                      darkMode ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span 
                      className={`${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                    <span className="sr-only">Toggle Dark Mode</span>
                    
                    {darkMode ? (
                      <FaMoon className="absolute left-1 text-orange-200 text-xs" />
                    ) : (
                      <FaSun className="absolute right-1 text-gray-400 text-xs" />
                    )}
                  </button>
                </div>
              </div>
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
  const { darkMode } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;
  const navigate = useNavigate();

  // Function to handle notification clicks
  const handleNotificationClick = (notification) => {
    // Mark as read first
    markAsRead(notification.id);
    
    // Check notification type or content to determine navigation
    if (notification.title.includes("New Event") || notification.content.includes("new event")) {
      // Extract event name from the content using regex
      const eventNameMatch = notification.content.match(/"([^"]+)"/);
      const eventName = eventNameMatch ? eventNameMatch[1] : null;
      
      if (eventName) {
        // Navigate to the events page with a search parameter for the specific event
        navigate(`/events?search=${encodeURIComponent(eventName)}`);
      } else {
        // If can't extract name, just go to events page
        navigate('/events');
      }
    } else if (notification.title.includes("Booking Status") || notification.content.includes("booking")) {
      // Try to get bookingId from notification if it exists as a property
      if (notification.bookingId) {
        navigate(`/booking/${notification.bookingId}`);
        return;
      }
      
      // Try to extract booking ID from content using regex patterns
      const bookingIdPattern1 = notification.content.match(/#(\d+)/);
      const bookingIdPattern2 = notification.content.match(/booking\s+(?:id|ID|Id)?\s*[:# ]?\s*(\d+)/i);
      const bookingIdPattern3 = notification.content.match(/booking\s+(?:number|#)?\s*(\d+)/i);
      
      // Use the first pattern that matches
      const bookingId = bookingIdPattern1 ? bookingIdPattern1[1] : 
                        bookingIdPattern2 ? bookingIdPattern2[1] :
                        bookingIdPattern3 ? bookingIdPattern3[1] : null;
      
      if (bookingId) {
        // Navigate to specific booking
        navigate(`/booking/${bookingId}`);
      } else {
        // No ID found in notification, fetch most recent booking
        fetchMostRecentBooking();
      }
    } else {
      // Default action for other notifications
      console.log("Notification clicked:", notification);
    }
  };

  // Function to fetch most recent booking when booking ID isn't available
  const fetchMostRecentBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/booking/', {
        headers: { accessToken: token }
      });
      
      // Sort bookings by date (newest first)
      const sortedBookings = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      if (sortedBookings.length > 0) {
        // Navigate to the most recent booking
        navigate(`/booking/${sortedBookings[0].id}`);
      } else {
        // If no bookings found, go to orders tab
        navigate('/profile?tab=orders');
      }
    } catch (error) {
      console.error('Error fetching recent booking:', error);
      // Fallback to orders tab
      navigate('/profile?tab=orders');
    }
  };

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

  // Calculate pagination
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} rounded-lg`}>
        <p>{error}</p>
        <button 
          onClick={fetchNotifications}
          className={`mt-2 px-4 py-2 ${darkMode ? 'bg-red-800 text-red-100 hover:bg-red-700' : 'bg-red-200 text-red-700 hover:bg-red-300'} rounded`}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Your Notifications</h2>
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
        <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <BsBell style={{ fontSize: '3rem' }} className="mx-auto mb-4" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg transition-all duration-200 ${
                  notification.read 
                    ? darkMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-gray-50 border border-gray-200' 
                    : darkMode
                      ? 'bg-gray-800 border-l-4 border-l-orange-500 border-t border-r border-b border-gray-700 shadow-sm'
                      : 'bg-white border-l-4 border-l-orange-500 border-t border-r border-b border-gray-200 shadow-sm'
                } ${
                  isNotificationClickable(notification) 
                    ? 'cursor-pointer hover:shadow-md transition-shadow' 
                    : ''
                }`}
                onClick={() => isNotificationClickable(notification) && handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {notification.title}
                    {isNotificationClickable(notification) && (
                      <span className="ml-2 text-xs py-1 px-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full font-medium">Click to view</span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatDate(notification.createdAt)}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering parent div click
                          markAsRead(notification.id);
                        }}
                        className={`px-2 py-1 text-xs ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } rounded`}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
                <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {notification.content}
                </p>
              </div>
            ))}
          </div>
          
          {/* Pagination controls */}
          {notifications.length > notificationsPerPage && (
            <div className="mt-6 flex justify-between items-center">
              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Showing {indexOfFirstNotification + 1}-{Math.min(indexOfLastNotification, notifications.length)} of {notifications.length} notifications
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === 1 
                      ? darkMode 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
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
                      ? darkMode 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : darkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
  
  // Helper function to determine if a notification is clickable
  function isNotificationClickable(notification) {
    // Check title first
    const titleMatches = [
      /booking/i, 
      /order/i, 
      /status/i, 
      /event/i,
      /new/i,
      /confirm/i,
      /complet/i,
      /cancel/i
    ].some(pattern => pattern.test(notification.title));
    
    // Check content if title doesn't match
    const contentMatches = [
      /booking/i,
      /order/i,
      /event/i,
      /service/i,
      /confirm/i,
      /complet/i,
      /cancel/i
    ].some(pattern => pattern.test(notification.content));
    
    return titleMatches || contentMatches;
  }
};

export default Profile;