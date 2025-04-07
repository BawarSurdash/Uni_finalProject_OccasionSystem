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
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPostType, setSelectedPostType] = useState('All'); // 'All', 'Regular', 'Special'
    const [stats, setStats] = useState({
        totalPosts: 0,
        specialPosts: 0,
        totalOrders: 0,
        completedOrders: 0
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

            // Fetch orders statistics
            const ordersResponse = await axios.get('http://localhost:3001/orders');
            const orders = ordersResponse.data || [];
            console.log('Fetched orders:', orders);
            const completedOrders = orders.filter(order => order.status === 'Completed').length;

            const newStats = {
                totalPosts: posts.length,
                specialPosts,
                totalOrders: orders.length,
                completedOrders
            };
            console.log('Updating statistics:', newStats);
            setStats(newStats);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // If orders endpoint doesn't exist yet, just update posts stats
                const postsResponse = await axios.get('http://localhost:3001/posts');
                const posts = postsResponse.data;
                const specialPosts = posts.filter(post => post.isSpecial).length;
                setStats(prevStats => ({
                    ...prevStats,
                    totalPosts: posts.length,
                    specialPosts
                }));
            } else {
                console.error('Error fetching statistics:', error);
            }
        }
    };

    useEffect(() => {
        if (activeTab === 'orderHistory') {
            fetchOrderHistory();
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                                                <span className="text-3xl font-semibold text-red-500">{stats.specialPosts}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Orders */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-sm">Total Orders</span>
                                            <div className="flex items-center mt-2">
                                                <span className="text-3xl font-semibold">{stats.totalOrders}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Completed Orders */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-sm">Completed Orders</span>
                                            <div className="flex items-center mt-2">
                                                <span className="text-3xl font-semibold text-green-500">{stats.completedOrders}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Special Features
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={formData.specialFeatures}
                                                                    onChange={handleChange}
                                                                    name="specialFeatures"
                                                                    placeholder="Enter special features (e.g., VIP service, Premium decorations)"
                                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                                <h2 className="text-2xl font-semibold mb-4">User Orders</h2>
                                <p className="text-gray-500">User orders section coming soon.</p>
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