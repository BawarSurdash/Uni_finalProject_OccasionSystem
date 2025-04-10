import { useState, useEffect } from 'react';
import { UserOutlined } from '@ant-design/icons';
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

    useEffect(() => {
        if (active) {
            fetchUserProfile();
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
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Unable to load profile information. Please try again later.');
        } finally {
            setIsLoading(false);
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
                    
                    {/* Additional Profile Sections - Can be expanded in the future */}
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
                </div>
            )}
        </div>
    );
};

export default Profile;
