import { useState, useEffect } from 'react';
import { UserOutlined, SearchOutlined, ReloadOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import axios from 'axios';

const Profile = ({ active, darkMode }) => {
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        role: '',
        joined: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [userError, setUserError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [promotingUser, setPromotingUser] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [manualUsername, setManualUsername] = useState('');
    const [processingManual, setProcessingManual] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Admin');

    useEffect(() => {
        if (active) {
            fetchUserProfile();
            fetchAllUsers();
        }
    }, [active]);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            const response = await axios.get('http://localhost:3001/auth/profile', {
                headers: { accessToken: token }
            });
            
            if (response.data) {
                setProfileData({
                    username: response.data.username || 'N/A',
                    email: response.data.email || 'N/A',
                    phoneNumber: response.data.phoneNumber || 'N/A',
                    role: response.data.role || 'User',
                    joined: response.data.createdAt ? new Date(response.data.createdAt).toLocaleDateString() : 'N/A'
                });
                
                // Check if user is Super Admin
                if (response.data.role?.toLowerCase() === 'super admin') {
                    setIsSuperAdmin(true);
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Unable to load profile information. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        setLoadingUsers(true);
        setUserError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            console.log("Fetching users...");
            
            // First try with accessToken header (used in most endpoints)
            try {
                console.log("Attempting to fetch users with accessToken...");
                const response = await axios.get('http://localhost:3001/auth/users', {
                    headers: { accessToken: token }
                });
                
                console.log("Users fetched successfully:", response.data);
                
                // Check if the response includes the isSuperAdmin flag
                if (response.data.isSuperAdmin !== undefined) {
                    setIsSuperAdmin(response.data.isSuperAdmin);
                }
                
                // Update the users array
                const usersArray = response.data.users || response.data;
                setAllUsers(Array.isArray(usersArray) ? usersArray : []);
                return;
            } catch (accessTokenError) {
                console.error("Error fetching with accessToken:", accessTokenError);
                // If that fails, try with Bearer token next
            }
            
            // Try with Authorization Bearer header as fallback
            try {
                console.log("Attempting to fetch users with Bearer token...");
                const bearerResponse = await axios.get('http://localhost:3001/auth/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log("Users fetched with bearer token:", bearerResponse.data);
                
                // Check if the response includes the isSuperAdmin flag
                if (bearerResponse.data.isSuperAdmin !== undefined) {
                    setIsSuperAdmin(bearerResponse.data.isSuperAdmin);
                }
                
                // Update the users array
                const usersArray = bearerResponse.data.users || bearerResponse.data;
                setAllUsers(Array.isArray(usersArray) ? usersArray : []);
                return;
            } catch (bearerError) {
                console.error("Error fetching with bearer token:", bearerError);
                // Continue to test endpoint
            }
            
            // Try the test endpoint without auth as last resort
            console.log("Attempting to fetch users with test endpoint...");
            const testResponse = await axios.get('http://localhost:3001/auth/test-users');
            console.log("Test endpoint response:", testResponse.data);
            
            if (testResponse.data.success && Array.isArray(testResponse.data.users)) {
                setAllUsers(testResponse.data.users);
                setUserError("Using test endpoint - limited functionality");
            } else {
                throw new Error("Test endpoint returned invalid data");
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setUserError(err.response?.data?.error || 'Unable to load users. Please try again later.');
            setAllUsers([]);
            
            // If we get a 403, it means the user doesn't have admin rights
            if (err.response?.status === 403) {
                setUserError('You do not have admin privileges to view all users.');
            }
        } finally {
            setLoadingUsers(false);
        }
    };

    const changeUserRole = async (userId, username, newRole) => {
        if (!isSuperAdmin) {
            alert("Only Super Admins can change user roles");
            return;
        }
        
        setPromotingUser(userId);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            console.log(`Changing role for user ${username} to ${newRole}...`);
            
            const response = await axios.post(`http://localhost:3001/auth/set-role/${username}`, 
                { newRole },
                { headers: { accessToken: token } }
            );
            
            if (response.data.success) {
                console.log("User role changed successfully:", response.data);
                // Update the user in the list
                setAllUsers(allUsers.map(user => 
                    user.id === userId ? { ...user, role: newRole } : user
                ));
                
                // Show success message
                setSuccessMessage(`${username} has been assigned the role of ${newRole}`);
                setShowSuccessMessage(true);
                
                // Dispatch custom event to notify navbar of role change
                window.dispatchEvent(new CustomEvent('user-role-change', { 
                    detail: { username, newRole } 
                }));
                
                // Force localStorage refresh
                localStorage.removeItem('userRole');
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    setShowSuccessMessage(false);
                }, 3000);
            }
        } catch (err) {
            console.error('Error changing user role:', err);
            const errorMessage = err.response?.data?.error || `Failed to assign ${newRole} role. Please try again.`;
            alert(errorMessage);
        } finally {
            setPromotingUser(null);
        }
    };

    // Legacy function to support old method (keeping for compatibility)
    const promoteToAdmin = async (userId, username) => {
        if (!isSuperAdmin) {
            alert("Only Super Admins can change user roles");
            return;
        }
        
        changeUserRole(userId, username, "Admin");
    };

    // Filter users based on search term
    const filteredUsers = allUsers.filter(user => 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add function to handle manual admin promotion
    const handleManualRoleChange = async (e) => {
        e.preventDefault();
        if (!manualUsername.trim()) {
            setFormError('Please enter a username');
            return;
        }
        
        if (!isSuperAdmin) {
            setFormError("You don't have permission to change user roles. Only Super Admins can change roles.");
            return;
        }
        
        setProcessingManual(true);
        setFormError('');
        setFormSuccess('');
        
        try {
            const token = localStorage.getItem('token');
            console.log(`Manually changing role for user ${manualUsername} to ${selectedRole}...`);
            
            const response = await axios.post(`http://localhost:3001/auth/set-role/${manualUsername}`, 
                { newRole: selectedRole },
                { headers: { accessToken: token } }
            );
            
            if (response.data.success) {
                console.log("User role changed successfully:", response.data);
                setSuccessMessage(`${manualUsername} has been assigned the role of ${selectedRole}`);
                setShowSuccessMessage(true);
                setFormSuccess(`${manualUsername} was successfully changed to ${selectedRole}`);
                
                // Dispatch custom event to notify navbar of role change
                window.dispatchEvent(new CustomEvent('user-role-change', { 
                    detail: { username: manualUsername, newRole: selectedRole } 
                }));
                
                // Force localStorage refresh
                localStorage.removeItem('userRole');
                
                // Refresh user list
                fetchAllUsers();
                
                // Reset form
                setManualUsername('');
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    setShowSuccessMessage(false);
                }, 3000);
            }
        } catch (err) {
            console.error('Error changing user role manually:', err);
            const errorMessage = err.response?.data?.error || 'Failed to change user role. Please check the username and try again.';
            setFormError(errorMessage);
        } finally {
            setProcessingManual(false);
        }
    };

    if (!active) return null;

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h2>
            
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : error ? (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                    {error}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Profile Avatar */}
                    <div className="flex justify-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <UserOutlined />
                        </div>
                    </div>
                    
                    {/* Profile Information */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Username</label>
                                <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profileData.username}</p>
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
                                <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profileData.email}</p>
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</label>
                                <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profileData.phoneNumber}</p>
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</label>
                                <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        profileData.role === 'Admin' 
                                            ? darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                                            : darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                        {profileData.role}
                                    </span>
                                </p>
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</label>
                                <p className={`mt-1 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{profileData.joined}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Account Actions Section */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Actions</h3>
                        <div className="mt-4 flex flex-wrap gap-4">
                            <button 
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                onClick={() => alert('Edit profile functionality coming soon!')}
                            >
                                Edit Profile
                            </button>
                            <button 
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => alert('Change password functionality coming soon!')}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                    
                    {/* All Users Management Section */}
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h3>
                            <button 
                                onClick={fetchAllUsers} 
                                className={`p-2 rounded-full ${darkMode ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                                title="Refresh users"
                            >
                                <ReloadOutlined />
                            </button>
                        </div>
                        
                        {!isSuperAdmin && (
                            <div className={`mb-4 px-4 py-3 rounded-lg ${darkMode ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-50 text-yellow-800'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                                <div className="flex items-center">
                                    <LockOutlined className="mr-2" />
                                    <p>Only Super Admins can change user roles. You can view user information but cannot modify roles.</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Role Assignment Form - Only visible to Super Admins */}
                        {isSuperAdmin && (
                            <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Assign User Role</h4>
                                <form onSubmit={handleManualRoleChange} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Username</label>
                                            <input
                                                type="text"
                                                value={manualUsername}
                                                onChange={(e) => {
                                                    setManualUsername(e.target.value);
                                                    if (formError) setFormError('');
                                                    if (formSuccess) setFormSuccess('');
                                                }}
                                                placeholder="Enter username"
                                                className={`w-full p-2 rounded-lg border ${
                                                    formError 
                                                        ? darkMode ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
                                                        : darkMode 
                                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                                            : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                                                }`}
                                                disabled={processingManual}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Role</label>
                                            <select 
                                                value={selectedRole}
                                                onChange={(e) => setSelectedRole(e.target.value)}
                                                className={`w-full p-2 border rounded-lg ${
                                                    darkMode 
                                                        ? 'bg-gray-700 border-gray-600 text-white' 
                                                        : 'bg-white border-gray-300 text-gray-800'
                                                }`}
                                                disabled={processingManual}
                                            >
                                                <option value="User">User</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={processingManual || !manualUsername.trim()}
                                        className={`px-4 py-2 rounded-lg font-medium ${
                                            processingManual || !manualUsername.trim()
                                                ? darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                                                : darkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700'
                                        } transition-colors`}
                                    >
                                        {processingManual ? 'Processing...' : 'Assign Role'}
                                    </button>
                                </form>
                                
                                {formError && (
                                    <div className={`mt-2 p-2 rounded text-sm ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600'}`}>
                                        {formError}
                                    </div>
                                )}
                                
                                {formSuccess && (
                                    <div className={`mt-2 p-2 rounded text-sm ${darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-600'}`}>
                                        {formSuccess}
                                    </div>
                                )}
                                
                                <p className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    As a Super Admin, you can assign any role to users in the system.
                                </p>
                            </div>
                        )}
                        
                        {/* Success Message */}
                        {showSuccessMessage && (
                            <div className={`p-3 mb-4 rounded-md ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'} flex items-center`}>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                {successMessage}
                            </div>
                        )}
                        
                        {/* Search and filter */}
                        <div className="mb-4 relative">
                            <input
                                type="text"
                                placeholder="Search by username or email"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full p-2 pl-9 rounded-lg border ${
                                    darkMode 
                                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                                }`}
                            />
                            <SearchOutlined className={`absolute left-3 top-2.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        
                        {loadingUsers ? (
                            <div className="flex justify-center py-8">
                                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : userError ? (
                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                                {userError}
                            </div>
                        ) : (
                            <div>
                                <div className="overflow-x-auto">
                                    <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                                        <thead>
                                            <tr>
                                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100'} uppercase tracking-wider rounded-tl-lg`}>Username</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100'} uppercase tracking-wider`}>Email</th>
                                                <th scope="col" className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100'} uppercase tracking-wider`}>Role</th>
                                                <th scope="col" className={`px-4 py-3 text-right text-xs font-medium ${darkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-100'} uppercase tracking-wider rounded-tr-lg`}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`${darkMode ? 'divide-y divide-gray-600' : 'divide-y divide-gray-200'}`}>
                                            {allUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className={`px-4 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        No users found in the database. Please try refreshing.
                                                    </td>
                                                </tr>
                                            ) : filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className={`px-4 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {searchTerm ? 'No users match your search' : 'No users match the filter criteria'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr key={user.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                                                        <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.username}</td>
                                                        <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user.email}</td>
                                                        <td className={`px-4 py-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                user.role === 'Super Admin' 
                                                                    ? darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                                                                    : user.role === 'Admin' 
                                                                        ? darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                                                                        : darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {user.role || 'User'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {isSuperAdmin && user.username !== profileData.username && (
                                                                <div className="flex justify-end space-x-2">
                                                                    {user.role !== 'Admin' && (
                                                                        <button
                                                                            onClick={() => changeUserRole(user.id, user.username, 'Admin')}
                                                                            disabled={promotingUser === user.id}
                                                                            className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                                                promotingUser === user.id
                                                                                    ? darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
                                                                                    : darkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700'
                                                                            } transition-colors`}
                                                                        >
                                                                            {promotingUser === user.id ? 'Processing...' : 'Make Admin'}
                                                                        </button>
                                                                    )}
                                                                    {user.role !== 'User' && (
                                                                        <button
                                                                            onClick={() => changeUserRole(user.id, user.username, 'User')}
                                                                            disabled={promotingUser === user.id}
                                                                            className={`px-3 py-1 rounded-md text-xs font-medium ${
                                                                                promotingUser === user.id
                                                                                    ? darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
                                                                                    : darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                            } transition-colors`}
                                                                        >
                                                                            {promotingUser === user.id ? 'Processing...' : 'Reset to User'}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {!isSuperAdmin && (
                                                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    <LockOutlined className="mr-1" /> Requires Super Admin
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
