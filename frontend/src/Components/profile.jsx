import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";



const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

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
      <div className="max-w-4xl mx-auto p-8 mt-8 bg-white rounded-lg shadow-lg">
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
            <div>
              <p className="text-gray-600 mb-4">Manage your email and push notifications here.</p>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                  <span className="text-gray-700">Receive email updates</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="form-checkbox text-orange-500 rounded" />
                  <span className="text-gray-700">Receive SMS notifications</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="overflow-x-auto p-4">
              {/* Add search and filter controls */}
              <div className="mb-4 flex gap-4">
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="p-2 border rounded-lg w-64 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <select className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <table className="min-w-full border border-gray-200 shadow-md rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border-b text-left">Booking ID</th>
                    <th className="py-3 px-4 border-b text-left">Creation Time</th>
                    <th className="py-3 px-4 border-b text-left">Username</th>
                    <th className="py-3 px-4 border-b text-left">Payment Type</th>
                    <th className="py-3 px-4 border-b text-left">Amount</th>
                    <th className="py-3 px-4 border-b text-left">Status</th>
                    <th className="py-3 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Sample booking rows - Replace with actual data from your backend */}
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">#BK12345</td>
                    <td className="py-3 px-4 border-b">2024-03-15 14:30</td>
                    <td className="py-3 px-4 border-b">John Doe</td>
                    <td className="py-3 px-4 border-b">Credit Card</td>
                    <td className="py-3 px-4 border-b">$150.00</td>
                    <td className="py-3 px-4 border-b">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Completed
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">#BK12346</td>
                    <td className="py-3 px-4 border-b">2024-03-14 09:15</td>
                    <td className="py-3 px-4 border-b">John Doe</td>
                    <td className="py-3 px-4 border-b">PayPal</td>
                    <td className="py-3 px-4 border-b">$75.00</td>
                    <td className="py-3 px-4 border-b">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
                      <button className="text-red-500 hover:text-red-700">Cancel</button>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-gray-600">
                  Showing 1-2 of 2 bookings
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded-lg disabled:opacity-50">Previous</button>
                  <button className="px-3 py-1 border rounded-lg disabled:opacity-50">Next</button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;