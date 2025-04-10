import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PlusOutlined,
    ShoppingCartOutlined,
    HistoryOutlined,
    BellOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;

const Dashboard = () => {
    const navigate = useNavigate();
    const [listOfPosts, setListOfPosts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        image: '',
        basePrice: '',
        isSpecial: false,
        specialFeatures: ''
    });
    const [editing, setEditing] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('createPost');
    const [orderHistory, setOrderHistory] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isViewingBookingDetails, setIsViewingBookingDetails] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPostType, setSelectedPostType] = useState('All'); // 'All', 'Regular', 'Special'
    const [selectedBookingStatus, setSelectedBookingStatus] = useState('All'); // For filtering bookings by status
    const [stats, setStats] = useState({
        totalPosts: 0,
        specialPosts: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0
    });

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menuItems = [
        {
            key: 'createPost',
            icon: <PlusOutlined />,
            label: 'Create Post',
            className: 'text-white'
        },
        {
            key: 'userOrders',
            icon: <ShoppingCartOutlined />,
            label: 'User Orders',
            className: 'text-white'
        },
        {
            key: 'orderHistory',
            icon: <HistoryOutlined />,
            label: 'Order History',
            className: 'text-white'
        },
        {
            key: 'notifications',
            icon: <BellOutlined />,
            label: 'Notifications',
            className: 'text-white'
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Profile',
            className: 'text-white'
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
            className: 'text-white'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            className: 'text-red-500',
            style: { marginTop: 'auto' }
        }
    ];

    const handleMenuClick = (item) => {
        if (item.key === 'logout') {
            // Handle logout
            localStorage.removeItem('token');
            navigate('/login');
        } else {
            setActiveTab(item.key);
        }
    };

    const siderStyle = {
        background: '#001529',
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column'
    };

    const categories = [
        'All',
        'Birthday',
        'Wedding',
        'Gender Reveal',
        'Easter',
        'Graduation'
    ];

    const postTypes = ['All', 'Regular', 'Special'];

    useEffect(() => {
        fetchAllPosts();
        fetchStatistics();
    }, []);

    const fetchAllPosts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/posts');
            setListOfPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            // Fetch posts statistics
            const postsResponse = await axios.get('http://localhost:3001/posts');
            const posts = postsResponse.data;
            console.log('Fetched posts:', posts);
            const specialPosts = posts.filter(post => post.isSpecial).length;

            // Fetch bookings statistics
            const token = localStorage.getItem('token');
            const bookingsResponse = await axios.get('http://localhost:3001/booking/stats', {
                headers: { accessToken: token }
            });
            
            const bookingsStats = bookingsResponse.data;
            console.log('Fetched booking stats:', bookingsStats);

            const newStats = {
                totalPosts: posts.length,
                specialPosts,
                totalOrders: bookingsStats.totalBookings || 0,
                completedOrders: bookingsStats.completedBookings || 0,
                pendingOrders: bookingsStats.pendingBookings || 0,
                cancelledOrders: bookingsStats.cancelledBookings || 0
            };
            
            console.log('Updating statistics:', newStats);
            setStats(newStats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            
            // If booking stats fails, still update posts stats
            try {
                const postsResponse = await axios.get('http://localhost:3001/posts');
                const posts = postsResponse.data;
                const specialPosts = posts.filter(post => post.isSpecial).length;
                
                setStats(prevStats => ({
                    ...prevStats,
                    totalPosts: posts.length,
                    specialPosts
                }));
            } catch (postsError) {
                console.error('Error fetching posts statistics:', postsError);
            }
        }
    };

    useEffect(() => {
        if (activeTab === 'orderHistory') {
            fetchOrderHistory();
        }
        
        if (activeTab === 'userOrders') {
            fetchBookings();
        }
    }, [activeTab]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'isSpecial') {
                setFormData(prev => ({
                    ...prev,
                    [name]: checked
                }));
            }
        } else if (name === 'basePrice') {
            // Only allow numbers and decimal point
            const numericValue = value.replace(/[^0-9.]/g, '');
            setFormData(prev => ({
                ...prev,
                basePrice: numericValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/posts', formData);
            const newPost = response.data;
            
            // Update listOfPosts with the new post
            setListOfPosts(prevPosts => [...prevPosts, newPost]);
            
            // Update statistics immediately
            setStats(prevStats => ({
                ...prevStats,
                totalPosts: prevStats.totalPosts + 1,
                specialPosts: prevStats.specialPosts + (newPost.isSpecial ? 1 : 0)
            }));

            // Clear form
            setFormData({
                title: '',
                description: '',
                category: '',
                image: '',
                basePrice: '',
                isSpecial: false,
                specialFeatures: ''
            });
            setIsFormVisible(false);

            // Refresh all data to ensure consistency
            fetchAllPosts();
            fetchStatistics();
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    const handleDelete = async (postId) => {
        try {
            const postToDelete = listOfPosts.find(post => post.id === postId);
            await axios.delete(`http://localhost:3001/posts/${postId}`);
            
            // Update listOfPosts
            setListOfPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            
            // Update statistics immediately
            if (postToDelete) {
                setStats(prevStats => ({
                    ...prevStats,
                    totalPosts: prevStats.totalPosts - 1,
                    specialPosts: prevStats.specialPosts - (postToDelete.isSpecial ? 1 : 0)
                }));
            }

            // Refresh all data to ensure consistency
            fetchAllPosts();
            fetchStatistics();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEdit = (post) => {
        setEditing(post.id);
        setFormData({
            title: post.title,
            description: post.description,
            category: post.category,
            image: post.image,
            basePrice: post.basePrice,
            isSpecial: post.isSpecial || false,
            specialFeatures: post.specialFeatures || ''
        });
    };

    const handleUpdate = async (postId) => {
        try {
            const response = await axios.put(`http://localhost:3001/posts/${postId}`, formData);
            setListOfPosts(listOfPosts.map(post => 
                post.id === postId ? response.data : post
            ));
            // Refresh statistics after updating a post
            fetchStatistics();
            setEditing(null);
            // Clear form
            setFormData({
                title: '',
                description: '',
                category: '',
                image: '',
                basePrice: '',
                isSpecial: false,
                specialFeatures: ''
            });
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const fetchOrderHistory = async () => {
        setIsLoadingOrders(true);
        try {
            const response = await axios.get('http://localhost:3001/orders/history');
            console.log('Order history:', response.data);
            setOrderHistory(response.data);
        } catch (error) {
            console.error('Error fetching order history:', error);
            // Initialize with empty array if endpoint doesn't exist yet
            setOrderHistory([]);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Filter posts based on selected category and post type
    const filteredPosts = listOfPosts.filter(post => {
        // Filter by category
        const categoryMatch = selectedCategory === 'All' || post.category === selectedCategory;
        
        // Filter by post type
        let typeMatch = true;
        if (selectedPostType === 'Regular') {
            typeMatch = !post.isSpecial;
        } else if (selectedPostType === 'Special') {
            typeMatch = post.isSpecial;
        }
        
        return categoryMatch && typeMatch;
    });

    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/booking', {
                headers: { accessToken: token }
            });
            console.log('Bookings data:', response.data);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookings([]);
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const viewBookingDetails = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3001/booking/${bookingId}`, {
                headers: { accessToken: token }
            });
            setSelectedBooking(response.data);
            setIsViewingBookingDetails(true);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            alert('Failed to fetch booking details');
        }
    };
    
    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:3001/booking/cancel/${bookingId}`, {}, {
                headers: { accessToken: token }
            });
            
            if (response.data.success) {
                // Update the booking status in the list
                setBookings(bookings.map(booking => 
                    booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
                ));
                
                // If we're viewing the details of the cancelled booking, update it
                if (selectedBooking && selectedBooking.id === bookingId) {
                    setSelectedBooking({ ...selectedBooking, status: 'cancelled' });
                }
                
                alert('Booking cancelled successfully');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking: ' + (error.response?.data?.error || error.message));
        }
    };

    const updateBookingStatus = async (bookingId, status) => {
        try {
            setIsUpdatingStatus(true);
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:3001/booking/status/${bookingId}`, 
                { status },
                { headers: { accessToken: token } }
            );
            
            if (response.data) {
                // Update the booking status in the list
                setBookings(bookings.map(booking => 
                    booking.id === bookingId ? { ...booking, status } : booking
                ));
                
                // If we're viewing the details of the updated booking, update it
                if (selectedBooking && selectedBooking.id === bookingId) {
                    setSelectedBooking({ ...selectedBooking, status });
                }
                
                // Update statistics after status change
                fetchStatistics();
                
                alert(`Booking status updated to "${status}"`);
            }
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert('Failed to update status: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsUpdatingStatus(false);
            setNewStatus('');
        }
    };

    return (
        <Layout hasSider>
            <Sider style={siderStyle} width={200}>
                <div className="p-4">
                    <h1 className="text-white text-xl font-bold mb-6">Dashboard</h1>
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[activeTab]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="flex-1"
                    style={{ borderRight: 0 }}
                />
            </Sider>
            <Layout style={{ marginLeft: 200 }}>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            minHeight: 'calc(100vh - 48px)'
                        }}
                    >
                        {activeTab === 'createPost' && (
                            <>
                                {/* Statistics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                                    {/* Total Posts */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-sm">Total Posts</span>
                                            <div className="flex items-center mt-2">
                                                <span className="text-3xl font-semibold">{stats.totalPosts}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Posts */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-sm">Special Posts</span>
                                            <div className="flex items-center mt-2">
                                                <span className="text-3xl font-semibold text-purple-500">{stats.specialPosts}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Orders */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-sm">Total Bookings</span>
                                            <div className="flex items-center mt-2">
                                                <span className="text-3xl font-semibold text-blue-500">{stats.totalOrders}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pending Orders */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-sm">Pending Bookings</span>
                                            <div className="flex items-center mt-2">
                                                <span className="text-3xl font-semibold text-yellow-500">{stats.pendingOrders}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Completed Orders */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-sm">Completed Bookings</span>
                                            <div className="flex items-center mt-2">
                                                <span className="text-3xl font-semibold text-green-500">{stats.completedOrders}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Optional: Hide on smaller screens for better mobile experience */}
                                    <div className="hidden xl:block bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-sm">Cancelled Bookings</span>
                                            <div className="flex items-center mt-2">
                                                <span className="text-3xl font-semibold text-red-500">{stats.cancelledOrders}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 flex justify-end">
                                    <button
                                        onClick={() => setIsFormVisible(!isFormVisible)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                                    >
                                        {isFormVisible ? 'Close Form' : '+ Add New Post'}
                                    </button>
                                </div>

                                {/* Post Form */}
                                {isFormVisible && (
                                    <div className="mb-8 bg-white rounded-lg shadow p-6">
                                        <h2 className="text-2xl font-semibold mb-4">Create New Post</h2>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        placeholder="Enter event title"
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                    <select
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    >
                                                        <option value="">Select event category</option>
                                                        {categories.filter(cat => cat !== 'All').map((category, index) => (
                                                            <option key={index} value={category}>
                                                                {category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        rows="3"
                                                        placeholder="Describe your event details..."
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                                    <input
                                                        type="text"
                                                        name="image"
                                                        value={formData.image}
                                                        onChange={handleChange}
                                                        placeholder="Enter image URL (https://...)"
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                                                    <input
                                                        type="text"
                                                        name="basePrice"
                                                        value={formData.basePrice}
                                                        onChange={handleChange}
                                                        placeholder="Enter base price (e.g., 99.99)"
                                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <div className="flex items-center mb-4">
                                                        <input
                                                            type="checkbox"
                                                            name="isSpecial"
                                                            checked={formData.isSpecial}
                                                            onChange={handleChange}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label className="ml-2 block text-sm text-gray-900">
                                                            This is a special post (will appear in Services)
                                                        </label>
                                                    </div>
                                                </div>
                                                {formData.isSpecial && (
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Special Features
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="specialFeatures"
                                                            value={formData.specialFeatures}
                                                            onChange={handleChange}
                                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Enter special features (comma separated)"
                                                            required={formData.isSpecial}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end">
                                                <button 
                                                    type="submit"
                                                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                                                >
                                                    {editing ? 'Update Post' : 'Create Post'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Filters */}
                                <div className="mb-8 bg-white rounded-lg shadow p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800">Filter Posts</h2>
                                        <div className="mt-2 md:mt-0">
                                            <button 
                                                onClick={() => {
                                                    setSelectedCategory('All');
                                                    setSelectedPostType('All');
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Reset Filters
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Category Filter */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map((category) => (
                                                    <button
                                                        key={category}
                                                        onClick={() => setSelectedCategory(category)}
                                                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                            selectedCategory === category
                                                                ? 'bg-blue-500 text-white shadow-md'
                                                                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                                        }`}
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Post Type Filter */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Post Type</label>
                                            <div className="flex flex-wrap gap-2">
                                                {postTypes.map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setSelectedPostType(type)}
                                                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                            selectedPostType === type
                                                                ? 'bg-blue-500 text-white shadow-md'
                                                                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Active Filters Summary */}
                                    {(selectedCategory !== 'All' || selectedPostType !== 'All') && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-500 mr-2">Active Filters:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedCategory !== 'All' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Category: {selectedCategory}
                                                            <button 
                                                                onClick={() => setSelectedCategory('All')}
                                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    )}
                                                    {selectedPostType !== 'All' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Type: {selectedPostType}
                                                            <button 
                                                                onClick={() => setSelectedPostType('All')}
                                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Posts Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPosts.map((post) => (
                                        <div key={post.id} className={`bg-white rounded-lg shadow overflow-hidden ${
                                            post.isSpecial ? 'border-2 border-purple-200' : ''
                                        }`}>
                                            {editing === post.id ? (
                                                // Edit form
                                                <div className="p-6">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Event</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                            <input
                                                                type="text"
                                                                value={formData.title}
                                                                onChange={handleChange}
                                                                name="title"
                                                                placeholder="Enter event title"
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                            <textarea
                                                                value={formData.description}
                                                                onChange={handleChange}
                                                                name="description"
                                                                rows="3"
                                                                placeholder="Describe your event details..."
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                                            <select
                                                                value={formData.category}
                                                                onChange={handleChange}
                                                                name="category"
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="">Select event category</option>
                                                                {categories.filter(cat => cat !== 'All').map((category, index) => (
                                                                    <option key={index} value={category}>
                                                                        {category}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                                            <input
                                                                type="text"
                                                                value={formData.image}
                                                                onChange={handleChange}
                                                                name="image"
                                                                placeholder="Enter image URL (https://...)"
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
                                                            <input
                                                                type="text"
                                                                name="basePrice"
                                                                value={formData.basePrice}
                                                                onChange={handleChange}
                                                                placeholder="Enter base price (e.g., 99.99)"
                                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                            />
                                                        </div>

                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                name="isSpecial"
                                                                checked={formData.isSpecial}
                                                                onChange={handleChange}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <label className="ml-2 block text-sm text-gray-900">
                                                                This is a special post (will appear in Services)
                                                            </label>
                                                        </div>

                                                        {formData.isSpecial && (
                                                            <div className="md:col-span-2">
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Special Features
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="specialFeatures"
                                                                    value={formData.specialFeatures}
                                                                    onChange={handleChange}
                                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                                    placeholder="Enter special features (comma separated)"
                                                                    required={formData.isSpecial}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end space-x-3 mt-6">
                                                            <button
                                                                onClick={() => setEditing(null)}
                                                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdate(post.id)}
                                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                            >
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Display post
                                                <div>
                                                    {post.image && (
                                                        <div className="aspect-w-16 aspect-h-9">
                                                            <img 
                                                                src={post.image} 
                                                                alt={post.title}
                                                                className="w-full h-48 object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
                                                            <div className="flex gap-2">
                                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                                                                    post.isSpecial 
                                                                    ? 'bg-purple-100 text-purple-800' 
                                                                    : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {post.category}
                                                                </span>
                                                                {post.isSpecial && (
                                                                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                                        Special
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-4">{post.description}</p>
                                                        {post.isSpecial && post.specialFeatures && (
                                                            <p className="text-sm text-purple-600 mb-4">
                                                                Special Features: {post.specialFeatures}
                                                            </p>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-lg font-bold text-green-600">{post.priceText}</span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEdit(post)}
                                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(post.id)}
                                                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'userOrders' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold">User Orders</h2>
                                    <button 
                                        onClick={fetchBookings}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-200"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {/* Status Filter */}
                                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setSelectedBookingStatus(status === 'All' ? 'All' : status.toLowerCase())}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                    selectedBookingStatus === (status === 'All' ? 'All' : status.toLowerCase())
                                                        ? status === 'Pending' ? 'bg-yellow-500 text-white shadow-md' :
                                                          status === 'Confirmed' ? 'bg-blue-500 text-white shadow-md' :
                                                          status === 'Completed' ? 'bg-green-500 text-white shadow-md' :
                                                          status === 'Cancelled' ? 'bg-red-500 text-white shadow-md' :
                                                          'bg-blue-500 text-white shadow-md'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {isLoadingBookings ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                                        <p className="mt-2 text-gray-500">Loading bookings...</p>
                                    </div>
                                ) : bookings.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="py-2 px-4 border-b text-left">Booking ID</th>
                                                    <th className="py-2 px-4 border-b text-left">Username</th>
                                                    <th className="py-2 px-4 border-b text-left">Event Date</th>
                                                    <th className="py-2 px-4 border-b text-left">Total Price</th>
                                                    <th className="py-2 px-4 border-b text-left">Payment Method</th>
                                                    <th className="py-2 px-4 border-b text-left">Phone Number</th>
                                                    <th className="py-2 px-4 border-b text-left">Address</th>
                                                    <th className="py-2 px-4 border-b text-left">Status</th>
                                                    <th className="py-2 px-4 border-b text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookings.filter(booking => 
                                                    selectedBookingStatus === 'All' || booking.status === selectedBookingStatus
                                                ).map((booking) => (
                                                    <tr key={booking.id} className="hover:bg-gray-50">
                                                        <td className="py-2 px-4 border-b">#{booking.id}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            {booking.User ? (
                                                                <span className="font-medium text-gray-700">
                                                                    {booking.User.username}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400 italic">
                                                                    Unknown
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-4 border-b">{formatDate(booking.eventDate)}</td>
                                                        <td className="py-2 px-4 border-b">${parseFloat(booking.totalPrice).toFixed(2)}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                booking.paymentMethod === 'fib' ? 'bg-green-100 text-green-800' :
                                                                booking.paymentMethod === 'fastpay' ? 'bg-pink-100 text-pink-800' :
                                                                booking.paymentMethod === 'cash' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {booking.paymentMethod === 'fib' ? 'FIB Bank' :
                                                                 booking.paymentMethod === 'fastpay' ? 'FastPay' :
                                                                 booking.paymentMethod === 'cash' ? 'Cash' :
                                                                 booking.paymentMethod}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">{booking.phoneNumber}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            <div className="max-w-xs truncate" title={booking.address}>
                                                                {booking.address}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                booking.status === 'completed' ? 'bg-green-500 text-white' :
                                                                booking.status === 'confirmed' ? 'bg-blue-500 text-white' :
                                                                booking.status === 'pending' ? 'bg-yellow-500 text-white' :
                                                                booking.status === 'cancelled' ? 'bg-red-500 text-white' :
                                                                'bg-gray-500 text-white'
                                                            }`}>
                                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            <div className="flex items-center space-x-2">
                                                                <button 
                                                                    className="text-blue-500 hover:text-blue-700"
                                                                    onClick={() => viewBookingDetails(booking.id)}
                                                                >
                                                                    View
                                                                </button>
                                                                
                                                                <div className="relative inline-block text-left">
                                                                    <select
                                                                        className="text-sm border border-gray-300 rounded-md py-1 px-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        onChange={(e) => {
                                                                            if (e.target.value && e.target.value !== booking.status) {
                                                                                if (window.confirm(`Change status to ${e.target.value}?`)) {
                                                                                    updateBookingStatus(booking.id, e.target.value);
                                                                                }
                                                                                e.target.value = "";  // Reset after action
                                                                            }
                                                                        }}
                                                                        defaultValue=""
                                                                    >
                                                                        <option value="" disabled>Change Status</option>
                                                                        {booking.status !== 'pending' && <option value="pending">Pending</option>}
                                                                        {booking.status !== 'confirmed' && <option value="confirmed">Confirmed</option>}
                                                                        {booking.status !== 'completed' && <option value="completed">Complete</option>}
                                                                        {booking.status !== 'cancelled' && <option value="cancelled">Cancelled</option>}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No bookings available.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orderHistory' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold">Order History</h2>
                                    <button 
                                        onClick={fetchOrderHistory}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-200"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {isLoadingOrders ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                                        <p className="mt-2 text-gray-500">Loading order history...</p>
                                    </div>
                                ) : orderHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="py-2 px-4 border-b text-left">Order ID</th>
                                                    <th className="py-2 px-4 border-b text-left">Customer</th>
                                                    <th className="py-2 px-4 border-b text-left">Event</th>
                                                    <th className="py-2 px-4 border-b text-left">Date</th>
                                                    <th className="py-2 px-4 border-b text-left">Amount</th>
                                                    <th className="py-2 px-4 border-b text-left">Status</th>
                                                    <th className="py-2 px-4 border-b text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderHistory.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="py-2 px-4 border-b">#{order.id}</td>
                                                        <td className="py-2 px-4 border-b">{order.customerName}</td>
                                                        <td className="py-2 px-4 border-b">{order.eventTitle}</td>
                                                        <td className="py-2 px-4 border-b">{formatDate(order.orderDate)}</td>
                                                        <td className="py-2 px-4 border-b">${order.amount}</td>
                                                        <td className="py-2 px-4 border-b">
                                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-4 border-b">
                                                            <button className="text-blue-500 hover:text-blue-700 mr-2">View</button>
                                                            <button className="text-orange-500 hover:text-orange-700">Details</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No order history available.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
                                <p className="text-gray-500">Notifications section coming soon.</p>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-2xl font-semibold mb-4">Profile</h2>
                                <p className="text-gray-500">Profile section coming soon.</p>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-2xl font-semibold mb-4">Settings</h2>
                                <p className="text-gray-500">Settings section coming soon.</p>
                            </div>
                        )}

                        {/* Booking Details Modal */}
                        {isViewingBookingDetails && selectedBooking && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                                <div className="relative mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Booking Details #{selectedBooking.id}
                                        </h3>
                                        <button 
                                            onClick={() => setIsViewingBookingDetails(false)}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-800 mb-3">Booking Information</h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Booking Date:</span>
                                                    <span>{formatDate(selectedBooking.createdAt)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Event Date:</span>
                                                    <span>{formatDate(selectedBooking.eventDate)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Status:</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        selectedBooking.status === 'completed' ? 'bg-green-500 text-white' :
                                                        selectedBooking.status === 'confirmed' ? 'bg-blue-500 text-white' :
                                                        selectedBooking.status === 'pending' ? 'bg-yellow-500 text-white' :
                                                        selectedBooking.status === 'cancelled' ? 'bg-red-500 text-white' :
                                                        'bg-gray-500 text-white'
                                                    }`}>
                                                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Total Price:</span>
                                                    <span className="font-medium">${parseFloat(selectedBooking.totalPrice).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Payment Method:</span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        selectedBooking.paymentMethod === 'fib' ? 'bg-green-100 text-green-800' :
                                                        selectedBooking.paymentMethod === 'fastpay' ? 'bg-pink-100 text-pink-800' :
                                                        selectedBooking.paymentMethod === 'cash' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {selectedBooking.paymentMethod === 'fib' ? 'FIB Bank' :
                                                         selectedBooking.paymentMethod === 'fastpay' ? 'FastPay' :
                                                         selectedBooking.paymentMethod === 'cash' ? 'Cash' :
                                                         selectedBooking.paymentMethod}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-medium text-gray-800 mb-3">Contact Information</h4>
                                            <div className="space-y-3 text-sm">
                                                {selectedBooking.User && (
                                                <div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Username:</span>
                                                        <span>{selectedBooking.User.username}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Email:</span>
                                                        <span>{selectedBooking.User.email}</span>
                                                    </div>
                                                </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Phone:</span>
                                                    <span>{selectedBooking.phoneNumber}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block mb-1">Address:</span>
                                                    <span className="block text-right">{selectedBooking.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedBooking.Post && (
                                        <div className="mt-6 border-t pt-4">
                                            <h4 className="font-medium text-gray-800 mb-3">Service Details</h4>
                                            <div className="flex flex-col md:flex-row">
                                                {selectedBooking.Post.image && (
                                                    <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                                                        <img 
                                                            src={selectedBooking.Post.image} 
                                                            alt={selectedBooking.Post.title} 
                                                            className="w-full h-32 object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )}
                                                <div className="md:w-2/3">
                                                    <h5 className="text-lg font-medium">{selectedBooking.Post.title}</h5>
                                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                                                        {selectedBooking.Post.category}
                                                    </span>
                                                    <p className="text-sm text-gray-600">{selectedBooking.Post.description}</p>
                                                    <p className="text-sm font-medium text-gray-700 mt-2">
                                                        Base Price: ${parseFloat(selectedBooking.Post.basePrice).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-6 flex justify-end space-x-4">
                                        <button
                                            onClick={() => setIsViewingBookingDetails(false)}
                                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                                        >
                                            Close
                                        </button>
                                        
                                        {/* Status Change Dropdown */}
                                        <div className="flex items-center">
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className="mr-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                disabled={isUpdatingStatus}
                                            >
                                                <option value="">Change Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="completed">Complete</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            
                                            <button
                                                onClick={() => {
                                                    if (newStatus && newStatus !== selectedBooking.status) {
                                                        updateBookingStatus(selectedBooking.id, newStatus);
                                                    }
                                                }}
                                                disabled={!newStatus || newStatus === selectedBooking.status || isUpdatingStatus}
                                                className={`px-4 py-2 rounded-lg text-white ${
                                                    !newStatus || newStatus === selectedBooking.status || isUpdatingStatus
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-500 hover:bg-blue-600'
                                                }`}
                                            >
                                                {isUpdatingStatus ? 'Updating...' : 'Update'}
                                            </button>
                                        </div>
                                        
                                        {selectedBooking.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    cancelBooking(selectedBooking.id);
                                                    setIsViewingBookingDetails(false);
                                                }}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Occasions System ©{new Date().getFullYear()} Created with ❤️
                </Footer>
            </Layout>
        </Layout>
    );
}

export default Dashboard;