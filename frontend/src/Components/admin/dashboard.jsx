import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PlusOutlined,
    ShoppingCartOutlined,
    HistoryOutlined,
    BellOutlined,
    UserOutlined,
    SettingOutlined,
    CommentOutlined,
    StarOutlined,
    HomeOutlined,
    BarChartOutlined,
    LayoutOutlined,
    FundOutlined,
    CrownOutlined
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import Logout from './logout';
import Setting from './setting';
import Profile from './profile';
import OrderHistory from './orderhistory';
import AdminNotifications from './notification';
import Feedback from './feedback';
import { RiDashboardLine } from "react-icons/ri";
const { Header, Content, Footer, Sider } = Layout;

const Dashboard = ({ initialTab }) => {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(false);
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
    const [activeTab, setActiveTab] = useState(initialTab || 'createPost');
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isViewingBookingDetails, setIsViewingBookingDetails] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPostType, setSelectedPostType] = useState('All'); // 'All', 'Regular', 'Special'
    const [selectedBookingStatus, setSelectedBookingStatus] = useState('All'); // For filtering bookings by status
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All'); // For filtering bookings by payment method
    const [currentPage, setCurrentPage] = useState(1);
    const [bookingsPerPage] = useState(10);
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true' || false);
    const [userRole, setUserRole] = useState('');
    const [stats, setStats] = useState({
        totalPosts: 0,
        specialPosts: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        confirmedOrders: 0
    });
    const [postsPerPage] = useState(9); // Add this new state for posts pagination
    const [bookingStartDate, setBookingStartDate] = useState(''); // For All Bookings section
    const [bookingEndDate, setBookingEndDate] = useState(''); // For All Bookings section
    const [postStartDate, setPostStartDate] = useState('');
    const [postEndDate, setPostEndDate] = useState('');

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
            label: 'All Bookings',
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
            key: 'feedback',
            icon: <CommentOutlined />,
            label: 'Feedback',
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
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>,
            label: 'Logout',
            className: 'text-white',
            style: { color: '#ff6b6b' }
        }
    ];

    const handleMenuClick = (item) => {
        if (item.key === 'logout') {
            // Handle logout
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            navigate('/login');
            return;
        }
        
        if (item.key === 'profile') {
            // Profile should be handled within the dashboard now
            setActiveTab(item.key);
            return;
        }
        setActiveTab(item.key);
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

    // Update the homeButtonStyle with smaller dimensions
    const homeButtonStyle = {
        background: 'transparent',
        color: darkMode ? '#fff' : '#001529',
        border: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`,
        borderRadius: '4px',
        padding: '4px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: '500',
        fontSize: '13px',
        transition: 'all 0.2s ease',
        marginRight: '12px',
        boxShadow: 'none',
        height: '32px'
    };

    // Update the logout button style to be smaller
    const logoutButtonStyle = {
        background: 'transparent',
        color: darkMode ? '#ff6b6b' : '#d32f2f',
        border: darkMode ? '1px solid #444' : '1px solid #ffcdd2',
        borderRadius: '4px',
        padding: '4px 12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: '500',
        fontSize: '13px',
        transition: 'all 0.2s ease',
        height: '32px'
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
                cancelledOrders: bookingsStats.cancelledBookings || 0,
                confirmedOrders: bookingsStats.confirmedBookings || 0
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
        if (activeTab === 'userOrders') {
            fetchBookings();
            fetchStatistics();
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
        
        // Filter by date range
        let dateMatch = true;
        if (postStartDate || postEndDate) {
            const postDate = new Date(post.createdAt);
            
            if (postStartDate && postEndDate) {
                const start = new Date(postStartDate);
                const end = new Date(postEndDate);
                // Set end date to end of day for inclusive comparison
                end.setHours(23, 59, 59, 999);
                dateMatch = postDate >= start && postDate <= end;
            } else if (postStartDate) {
                const start = new Date(postStartDate);
                dateMatch = postDate >= start;
            } else if (postEndDate) {
                const end = new Date(postEndDate);
                // Set end date to end of day for inclusive comparison
                end.setHours(23, 59, 59, 999);
                dateMatch = postDate <= end;
            }
        }
        
        return categoryMatch && typeMatch && dateMatch;
    });

    // Calculate pagination for posts section
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPostPages = Math.ceil(filteredPosts.length / postsPerPage);

    const fetchBookings = async () => {
        setIsLoadingBookings(true);
        try {
            const token = localStorage.getItem('token');
            // Use admin endpoint to get all bookings
            const response = await axios.get('http://localhost:3001/booking/admin/all', {
                headers: { accessToken: token }
            });
            console.log('All bookings data:', response.data);
            setBookings(response.data);
            
            // Update booking counts in stats based on fetched data
            if (response.data && response.data.length > 0) {
                const pendingCount = response.data.filter(booking => booking.status === 'pending').length;
                const completedCount = response.data.filter(booking => booking.status === 'completed').length;
                const cancelledCount = response.data.filter(booking => booking.status === 'cancelled').length;
                const confirmedCount = response.data.filter(booking => booking.status === 'confirmed').length;
                
                setStats(prevStats => ({
                    ...prevStats,
                    totalOrders: response.data.length,
                    pendingOrders: pendingCount,
                    completedOrders: completedCount,
                    cancelledOrders: cancelledCount,
                    confirmedOrders: confirmedCount
                }));
            }
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
            const response = await axios.get(`http://localhost:3001/booking/admin/${bookingId}`, {
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
            const response = await axios.put(`http://localhost:3001/booking/admin/cancel/${bookingId}`, {}, {
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
                
                // Send notification to the user about status change
                const booking = bookings.find(b => b.id === bookingId);
                if (booking) {
                    // Extract the userId - check various possible structures
                    const userId = booking.userId || (booking.User && booking.User.id);
                    
                    if (userId) {
                        // Prepare notification content with appropriate message for each status
                        let statusMessage = '';
                        if (status === 'confirmed') {
                            statusMessage = 'Your booking has been confirmed. Get ready for your event!';
                        } else if (status === 'completed') {
                            statusMessage = 'Your booking has been marked as completed. Thank you for using our service!';
                        } else if (status === 'cancelled') {
                            statusMessage = 'Your booking has been cancelled. We\'re sorry for any inconvenience.';
                        } else {
                            statusMessage = `Your booking status has been updated to: ${status}`;
                        }
                        
                        const notificationData = {
                            userId: userId,
                            title: "Booking Status Update",
                            content: statusMessage,
                            type: "booking_status",
                            bookingId: bookingId
                        };
                        
                        try {
                            // Try both possible endpoints
                            await axios.post('http://localhost:3001/notification/create', notificationData, {
                                headers: { accessToken: token }
                            }).catch(async () => {
                                // If first endpoint fails, try alternative
                                await axios.post('http://localhost:3001/notification', notificationData, {
                                    headers: { accessToken: token }
                                });
                            });
                            console.log("Notification sent successfully!");
                        } catch (notifyError) {
                            console.error("Failed to send notification:", notifyError);
                        }
                    } else {
                        console.warn("Could not find user ID for booking:", booking);
                    }
                }
                
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

    // Dark mode toggle handler
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);
        
        // Apply dark mode class to body
        if (newDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    // Apply dark mode on component mount
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    // Modify the filter function for bookings
    const filteredBookings = bookings.filter(booking => {
        // Status filter
        const statusMatch = selectedBookingStatus === 'All' || booking.status === selectedBookingStatus;
        
        // Payment method filter
        const paymentMatch = selectedPaymentMethod === 'All' || booking.paymentMethod === selectedPaymentMethod;
        
        // Date range filter
        let dateMatch = true;
        const bookingDate = new Date(booking.createdAt);
        
        if (bookingStartDate && bookingEndDate) {
            const start = new Date(bookingStartDate);
            const end = new Date(bookingEndDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            dateMatch = bookingDate >= start && bookingDate <= end;
        } else if (bookingStartDate) {
            const start = new Date(bookingStartDate);
            dateMatch = bookingDate >= start;
        } else if (bookingEndDate) {
            const end = new Date(bookingEndDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            dateMatch = bookingDate <= end;
        }
        
        return statusMatch && paymentMatch && dateMatch;
    });

    // UseEffect to handle initialTab changes
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    // Add useEffect to check admin status when the component mounts
    useEffect(() => {
        const verifyAdminAccess = async () => {
            try {
                // First check if there's a token
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log("Dashboard: No token found, redirecting to login");
                    navigate('/login');
                    return;
                }
                
                // Check localStorage first
                const storedUserRole = localStorage.getItem('userRole');
                if (storedUserRole) {
                    setUserRole(storedUserRole);
                    const isAdmin = storedUserRole.toLowerCase() === 'admin' || storedUserRole.toLowerCase() === 'super admin';
                    
                    if (!isAdmin) {
                        console.log("Dashboard: User is not an admin, redirecting to home");
                        localStorage.removeItem('userRole'); // Clear cached role
                        navigate('/');
                        return;
                    }
                    return;
                }
                
                // If not in localStorage, check with the server
                try {
                    const response = await axios.get('http://localhost:3001/auth/profile', {
                        headers: { accessToken: token }
                    });
                    
                    if (response.data && response.data.role) {
                        const role = response.data.role;
                        setUserRole(role);
                        localStorage.setItem('userRole', role);
                        
                        const isAdmin = role.toLowerCase() === 'admin' || role.toLowerCase() === 'super admin';
                        
                        if (!isAdmin) {
                            console.log("Dashboard: User is not an admin according to profile, redirecting to home");
                            localStorage.removeItem('userRole'); // Clear cached role
                            navigate('/');
                            return;
                        }
                    } else {
                        console.log("Dashboard: No role found in profile, redirecting to home");
                        localStorage.removeItem('userRole'); // Clear cached role
                        navigate('/');
                    }
                } catch (error) {
                    console.error("Dashboard: Error checking admin status:", error);
                    localStorage.removeItem('userRole'); // Clear cached role
                    navigate('/');
                }
            } catch (error) {
                console.error("Dashboard: Error verifying admin access:", error);
                localStorage.removeItem('userRole'); // Clear cached role
                navigate('/');
            }
        };
        
        // Immediate check on mount
        verifyAdminAccess();
        
        // Return cleanup function
        return () => {
            console.log("Dashboard component unmounted");
        };
    }, [navigate]);

    // Early verification before rendering anything
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserRole = localStorage.getItem('userRole');
        
        if (!token) {
            console.log("Dashboard: No token found, redirecting to login");
            navigate('/login');
            return;
        }
        
        if (!storedUserRole || (storedUserRole.toLowerCase() !== 'admin' && storedUserRole.toLowerCase() !== 'super admin')) {
            console.log("Dashboard: Not an admin user, redirecting to home");
            localStorage.removeItem('userRole');
            navigate('/');
            return;
        }
        
        // If we get here, the user is authorized
        setAuthorized(true);
    }, [navigate]);
    
    // If not authorized, don't render anything
    if (!authorized) {
        return (
            <div className="min-h-screen flex justify-center items-center flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600">Checking permissions...</p>
            </div>
        );
    }
    
    const goToHome = () => {
        navigate('/');
    };
    
    return (
        <Layout hasSider className={darkMode ? 'dark-theme' : ''}>
            <Sider style={siderStyle} breakpoint="lg" collapsedWidth="0">
                <div
                    style={{
                        height: 40,
                        margin: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <RiDashboardLine style={{ fontSize: '24px', color: 'white' }} />
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[activeTab]}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout style={{ marginLeft: 200 }}>
                <Header style={{ 
                    padding: '0 20px', 
                    background: darkMode ? '#1a1a1a' : colorBgContainer,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                    height: '64px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                            style={homeButtonStyle}
                            onClick={goToHome}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = darkMode ? '#383838' : '#f5f5f5';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <HomeOutlined style={{ fontSize: '14px' }} />
                            Home
                        </button>
                        
                        <button
                            style={logoutButtonStyle}
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('userRole');
                                navigate('/login');
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = darkMode ? '#3b1b1b' : '#ffebee';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </button>
                    </div>
                </Header>
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            background: darkMode ? '#1f2937' : colorBgContainer,
                            borderRadius: borderRadiusLG,
                            minHeight: 'calc(100vh - 48px)'
                        }}
                    >
                        {activeTab === 'createPost' && (
                            <>
                                {/* Statistics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {/* Total Posts */}
                                    <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} p-6 rounded-lg shadow-sm border`}>
                                        <div className="flex flex-col">
                                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} text-sm`}>Total Posts</span>
                                            <div className="flex items-center mt-2">
                                                <span className={`text-3xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{stats.totalPosts}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ml-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Posts */}
                                    <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} p-6 rounded-lg shadow-sm border`}>
                                        <div className="flex flex-col">
                                            <span className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} text-sm`}>Special Posts</span>
                                            <div className="flex items-center mt-2">
                                                <span className={`text-3xl font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-500'}`}>{stats.specialPosts}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ml-2 ${darkMode ? 'text-purple-400' : 'text-purple-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
                                    <div className={`mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                                        <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Post</h2>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleChange}
                                                        placeholder="Enter event title"
                                                        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                        }`}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                                                    <select
                                                        name="category"
                                                        value={formData.category}
                                                        onChange={handleChange}
                                                        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'
                                                        }`}
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
                                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        rows="3"
                                                        placeholder="Describe your event details..."
                                                        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                        }`}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image URL</label>
                                                    <input
                                                        type="text"
                                                        name="image"
                                                        value={formData.image}
                                                        onChange={handleChange}
                                                        placeholder="Enter image URL (https://...)"
                                                        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                        }`}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Base Price ($)</label>
                                                    <input
                                                        type="text"
                                                        name="basePrice"
                                                        value={formData.basePrice}
                                                        onChange={handleChange}
                                                        placeholder="Enter base price (e.g., 99.99)"
                                                        className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                            darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                        }`}
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
                                                            className={`h-4 w-4 rounded focus:ring-blue-500 ${
                                                                darkMode ? 'bg-gray-700 border-gray-600 text-blue-600' : 'text-blue-600 border-gray-300'
                                                            }`}
                                                        />
                                                        <label className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                            This is a special post (will appear in Services)
                                                        </label>
                                                    </div>
                                                </div>
                                                {formData.isSpecial && (
                                                    <div className="md:col-span-2">
                                                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            Special Features
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="specialFeatures"
                                                            value={formData.specialFeatures}
                                                            onChange={handleChange}
                                                            className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                                darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                            }`}
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
                                <div className={`mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 md:mb-0`}>Filter Posts</h2>
                                        <div>
                                            <button 
                                                onClick={() => {
                                                    setSelectedCategory('All');
                                                    setSelectedPostType('All');
                                                    setCurrentPage(1); // Reset to first page when filters are reset
                                                }}
                                                className={`text-sm flex items-center ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
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
                                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Category</label>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.map((category) => (
                                                    <button
                                                        key={category}
                                                        onClick={() => {
                                                            setSelectedCategory(category);
                                                            setCurrentPage(1); // Reset to first page when filter changes
                                                        }}
                                                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                            selectedCategory === category
                                                                ? 'bg-blue-500 text-white shadow-md'
                                                                : darkMode
                                                                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-600'
                                                                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                                        }`}
                                                    >
                                                        {category}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Post Type Filter */}
                                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Post Type</label>
                                            <div className="flex flex-wrap gap-2">
                                                {postTypes.map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setSelectedPostType(type);
                                                            setCurrentPage(1); // Reset to first page when filter changes
                                                        }}
                                                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                            selectedPostType === type
                                                                ? 'bg-blue-500 text-white shadow-md'
                                                                : darkMode
                                                                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-600'
                                                                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date Range Filter */}
                                    <div className={`mt-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Filter by Creation Date</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Start Date</label>
                                                <input 
                                                    type="date" 
                                                    value={postStartDate}
                                                    onChange={(e) => {
                                                        setPostStartDate(e.target.value);
                                                        setCurrentPage(1); // Reset to first page when filter changes
                                                    }}
                                                    className={`w-full p-2 border rounded-md ${
                                                        darkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'border-gray-300 text-gray-800'
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>End Date</label>
                                                <input 
                                                    type="date" 
                                                    value={postEndDate}
                                                    onChange={(e) => {
                                                        setPostEndDate(e.target.value);
                                                        setCurrentPage(1); // Reset to first page when filter changes
                                                    }}
                                                    className={`w-full p-2 border rounded-md ${
                                                        darkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'border-gray-300 text-gray-800'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                        {(postStartDate || postEndDate) && (
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        setPostStartDate('');
                                                        setPostEndDate('');
                                                        setCurrentPage(1); // Reset to first page when dates are cleared
                                                    }}
                                                    className={`text-sm ${darkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800'} flex items-center`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Clear Dates
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Active Filters Summary */}
                                    {(selectedCategory !== 'All' || selectedPostType !== 'All' || postStartDate || postEndDate) && (
                                        <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <div className="flex items-center">
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`}>Active Filters:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedCategory !== 'All' && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            Category: {selectedCategory}
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedCategory('All');
                                                                    setCurrentPage(1); // Reset to first page when filter changes
                                                                }}
                                                                className={`ml-1 ${darkMode ? 'text-blue-300 hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    )}
                                                    {selectedPostType !== 'All' && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            Type: {selectedPostType}
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedPostType('All');
                                                                    setCurrentPage(1); // Reset to first page when filter changes
                                                                }}
                                                                className={`ml-1 ${darkMode ? 'text-blue-300 hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    )}
                                                    {(postStartDate || postEndDate) && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            Date: {postStartDate && postEndDate ? 
                                                                `${new Date(postStartDate).toLocaleDateString()} - ${new Date(postEndDate).toLocaleDateString()}` : 
                                                                postStartDate ? 
                                                                    `From ${new Date(postStartDate).toLocaleDateString()}` : 
                                                                    `Until ${new Date(postEndDate).toLocaleDateString()}`}
                                                            <button 
                                                                onClick={() => {
                                                                    setPostStartDate('');
                                                                    setPostEndDate('');
                                                                    setCurrentPage(1); // Reset to first page when dates are cleared
                                                                }}
                                                                className={`ml-1 ${darkMode ? 'text-green-300 hover:text-green-100' : 'text-green-600 hover:text-green-800'}`}
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
                                    {currentPosts.map((post) => (
                                        <div key={post.id} className={`${darkMode 
                                            ? `bg-gray-800 ${post.isSpecial ? 'border-2 border-purple-900' : ''}` 
                                            : `bg-white ${post.isSpecial ? 'border-2 border-purple-200' : ''}`
                                        } rounded-lg shadow overflow-hidden`}>
                                            {editing === post.id ? (
                                                // Edit form
                                                <div className="p-6">
                                                    <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Event</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                                                            <input
                                                                type="text"
                                                                value={formData.title}
                                                                onChange={handleChange}
                                                                name="title"
                                                                placeholder="Enter event title"
                                                                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                                }`}
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                                                            <textarea
                                                                value={formData.description}
                                                                onChange={handleChange}
                                                                name="description"
                                                                rows="3"
                                                                placeholder="Describe your event details..."
                                                                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                                }`}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                                                            <select
                                                                value={formData.category}
                                                                onChange={handleChange}
                                                                name="category"
                                                                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'border-gray-300'
                                                                }`}
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
                                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Image URL</label>
                                                            <input
                                                                type="text"
                                                                value={formData.image}
                                                                onChange={handleChange}
                                                                name="image"
                                                                placeholder="Enter image URL (https://...)"
                                                                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                                }`}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Base Price ($)</label>
                                                            <input
                                                                type="text"
                                                                name="basePrice"
                                                                value={formData.basePrice}
                                                                onChange={handleChange}
                                                                placeholder="Enter base price (e.g., 99.99)"
                                                                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                                    darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                                }`}
                                                            />
                                                        </div>

                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                name="isSpecial"
                                                                checked={formData.isSpecial}
                                                                onChange={handleChange}
                                                                className={`h-4 w-4 rounded focus:ring-blue-500 ${
                                                                    darkMode ? 'bg-gray-700 border-gray-600 text-blue-600' : 'text-blue-600 border-gray-300'
                                                                }`}
                                                            />
                                                            <label className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                                This is a special post (will appear in Services)
                                                            </label>
                                                        </div>

                                                        {formData.isSpecial && (
                                                            <div>
                                                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                    Special Features
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    name="specialFeatures"
                                                                    value={formData.specialFeatures}
                                                                    onChange={handleChange}
                                                                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                                                        darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'border-gray-300'
                                                                    }`}
                                                                    placeholder="Enter special features (comma separated)"
                                                                    required={formData.isSpecial}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end space-x-3 mt-6">
                                                            <button
                                                                onClick={() => setEditing(null)}
                                                                className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                                    darkMode 
                                                                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
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
                                                            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{post.title}</h2>
                                                            <div className="flex gap-2">
                                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                                                                    post.isSpecial 
                                                                    ? darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800' 
                                                                    : darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                    {post.category}
                                                                </span>
                                                                {post.isSpecial && (
                                                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                                                                        darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                                                                    }`}>
                                                                        Special
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{post.description}</p>
                                                        {post.isSpecial && post.specialFeatures && (
                                                            <p className={`text-sm mb-4 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                                                                Special Features: {post.specialFeatures}
                                                            </p>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <span className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{post.priceText}</span>
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

                                {/* Pagination Controls for Posts */}
                                {filteredPosts.length > postsPerPage && (
                                    <div className="flex justify-center mt-6">
                                        <div className={`inline-flex rounded-md shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                                                    darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                                                } ${
                                                    currentPage === 1 
                                                    ? darkMode ? 'bg-gray-800 cursor-not-allowed' : 'bg-gray-100 cursor-not-allowed' 
                                                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="ml-1">Previous</span>
                                            </button>
                                            <div className={`relative inline-flex items-center px-4 py-2 border ${
                                                darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-700'
                                            }`}>
                                                Page {currentPage} of {totalPostPages}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPostPages, prev + 1))}
                                                disabled={currentPage >= totalPostPages}
                                                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                                                    darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                                                } ${
                                                    currentPage >= totalPostPages
                                                    ? darkMode ? 'bg-gray-800 cursor-not-allowed' : 'bg-gray-100 cursor-not-allowed' 
                                                    : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className="mr-1">Next</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'userOrders' && (
                            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>All Bookings</h2>
                                        <button 
                                        onClick={fetchBookings}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-200"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                {/* Booking Statistics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div 
                                        className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'} p-4 rounded-lg border cursor-pointer`}
                                        onClick={() => setSelectedBookingStatus('All')}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className={`${darkMode ? 'text-blue-300' : 'text-blue-800'} text-sm font-medium`}>Total Booking</span>
                                                <span className={`text-2xl font-bold ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>{stats.pendingOrders + stats.confirmedOrders}</span>
                                            </div>
                                            <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-100'} p-4 rounded-lg border cursor-pointer`}
                                        onClick={() => setSelectedBookingStatus('pending')}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className={`${darkMode ? 'text-yellow-300' : 'text-yellow-800'} text-sm font-medium`}>Pending</span>
                                                <span className={`text-2xl font-bold ${darkMode ? 'text-yellow-200' : 'text-yellow-600'}`}>{stats.pendingOrders}</span>
                                            </div>
                                            <div className="bg-yellow-500 rounded-full w-10 h-10 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'} p-4 rounded-lg border cursor-pointer`}
                                        onClick={() => setSelectedBookingStatus('confirmed')}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className={`${darkMode ? 'text-blue-300' : 'text-blue-800'} text-sm font-medium`}>Confirmed</span>
                                                <span className={`text-2xl font-bold ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>{stats.confirmedOrders}</span>
                                            </div>
                                            <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Filter by Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['All', 'Pending', 'Confirmed'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => setSelectedBookingStatus(status === 'All' ? 'All' : status.toLowerCase())}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                    selectedBookingStatus === (status === 'All' ? 'All' : status.toLowerCase())
                                                        ? status === 'Pending' ? 'bg-yellow-500 text-white shadow-md' :
                                                          status === 'Confirmed' ? 'bg-blue-500 text-white shadow-md' :
                                                          'bg-blue-500 text-white shadow-md'
                                                        : darkMode 
                                                          ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-600' 
                                                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Method Filter */}
                                <div className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Filter by Payment Method</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedPaymentMethod('All')}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                selectedPaymentMethod === 'All'
                                                    ? 'bg-blue-500 text-white shadow-md'
                                                    : darkMode 
                                                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-600' 
                                                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            All Methods
                                        </button>
                                        <button
                                            onClick={() => setSelectedPaymentMethod('fib')}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                selectedPaymentMethod === 'fib'
                                                    ? 'bg-green-500 text-white shadow-md'
                                                    : darkMode 
                                                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-600' 
                                                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            FIB Bank
                                        </button>
                                        <button
                                            onClick={() => setSelectedPaymentMethod('fastpay')}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                selectedPaymentMethod === 'fastpay'
                                                    ? 'bg-pink-500 text-white shadow-md'
                                                    : darkMode 
                                                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-600' 
                                                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            FastPay
                                        </button>
                                        <button
                                            onClick={() => setSelectedPaymentMethod('cash')}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                                selectedPaymentMethod === 'cash'
                                                    ? 'bg-yellow-500 text-white shadow-md'
                                                    : darkMode 
                                                      ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-600' 
                                                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                        >
                                            Cash
                                        </button>
                                    </div>
                                </div>

                                {/* Add Date Range Filter to All Bookings section */}
                                <div className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Filter by Date Range</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Start Date</label>
                                            <input 
                                                type="date" 
                                                value={bookingStartDate}
                                                onChange={(e) => {
                                                    setBookingStartDate(e.target.value);
                                                    setCurrentPage(1); // Reset to first page when filter changes
                                                }}
                                                className={`w-full p-2 rounded-md ${
                                                    darkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-800'
                                                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>End Date</label>
                                            <input 
                                                type="date" 
                                                value={bookingEndDate}
                                                onChange={(e) => {
                                                    setBookingEndDate(e.target.value);
                                                    setCurrentPage(1); // Reset to first page when filter changes
                                                }}
                                                className={`w-full p-2 rounded-md ${
                                                    darkMode 
                                                    ? 'bg-gray-600 border-gray-500 text-gray-200' 
                                                    : 'bg-white border-gray-300 text-gray-800'
                                                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            />
                                        </div>
                                    </div>
                                    {(bookingStartDate || bookingEndDate) && (
                                        <div className="mt-2 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    setBookingStartDate('');
                                                    setBookingEndDate('');
                                                    setCurrentPage(1); // Reset to first page when dates are cleared
                                                }}
                                                className={`text-sm px-2 py-1 rounded ${
                                                    darkMode 
                                                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                Clear Dates
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isLoadingBookings ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                                        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Loading bookings...</p>
                                    </div>
                                ) : bookings.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        {/* Result count indicator */}
                                        <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} p-3 rounded-t-lg border border-b-0`}>
                                            <div className="flex justify-between items-center">
                                                <span className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                                                    {(() => {
                                                        const filteredBookings = bookings.filter(booking => 
                                                            (booking.status === 'pending' || booking.status === 'confirmed') &&
                                                            (selectedBookingStatus === 'All' || booking.status === selectedBookingStatus) &&
                                                            (selectedPaymentMethod === 'All' || booking.paymentMethod === selectedPaymentMethod)
                                                        );
                                                        const activeBookings = bookings.filter(booking => 
                                                            booking.status === 'pending' || booking.status === 'confirmed'
                                                        );
                                                        return `Showing ${filteredBookings.length} of ${activeBookings.length} active bookings`;
                                                    })()}
                                                </span>
                                                <div className="flex space-x-2">
                                                    {selectedBookingStatus !== 'All' && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            Status: {selectedBookingStatus.charAt(0).toUpperCase() + selectedBookingStatus.slice(1)}
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedBookingStatus('All');
                                                                    setCurrentPage(1); // Reset to first page when filter changes
                                                                }}
                                                                className={`ml-1 ${darkMode ? 'text-blue-300 hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    )}
                                                    {selectedPaymentMethod !== 'All' && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            Payment: {selectedPaymentMethod === 'fib' ? 'FIB Bank' : 
                                                                    selectedPaymentMethod === 'fastpay' ? 'FastPay' : 
                                                                    selectedPaymentMethod === 'cash' ? 'Cash' : 
                                                                    selectedPaymentMethod}
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedPaymentMethod('All');
                                                                    setCurrentPage(1); // Reset to first page when filter changes
                                                                }}
                                                                className={`ml-1 ${darkMode ? 'text-blue-300 hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    )}
                                                    {(bookingStartDate || bookingEndDate) && (
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            Date: {bookingStartDate ? new Date(bookingStartDate).toLocaleDateString() : 'Any'} - {bookingEndDate ? new Date(bookingEndDate).toLocaleDateString() : 'Any'}
                                                            <button 
                                                                onClick={() => {
                                                                    setBookingStartDate('');
                                                                    setBookingEndDate('');
                                                                    setCurrentPage(1); // Reset to first page when dates are cleared
                                                                }}
                                                                className={`ml-1 ${darkMode ? 'text-blue-300 hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}
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
                                        
                                        <table className={`min-w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                <tr>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Booking ID</th>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Username</th>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Event Date</th>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Total Price</th>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Payment Method</th>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Phone Number</th>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Address</th>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Status</th>
                                                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    // Calculate pagination for filtered bookings
                                                    const filteredBookings = bookings.filter(booking => 
                                                        (booking.status === 'pending' || booking.status === 'confirmed') &&
                                                        (selectedBookingStatus === 'All' || booking.status === selectedBookingStatus) &&
                                                        (selectedPaymentMethod === 'All' || booking.paymentMethod === selectedPaymentMethod)
                                                    );
                                                    const indexOfLastBooking = currentPage * bookingsPerPage;
                                                    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
                                                    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
                                                    
                                                    return currentBookings.map((booking) => (
                                                        <tr key={booking.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>#{booking.id}</td>
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                                {booking.User ? (
                                                                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                                        {booking.User.username}
                                                                    </span>
                                                                ) : (
                                                                    <span className={`italic ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                                                                        Unknown
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>{formatDate(booking.eventDate)}</td>
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>${parseFloat(booking.totalPrice).toFixed(2)}</td>
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
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
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>{booking.phoneNumber}</td>
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                                <div className={`max-w-xs truncate ${darkMode ? 'text-gray-200' : ''}`} title={booking.address}>
                                                                    {booking.address}
                                                                </div>
                                                            </td>
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
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
                                                            <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                                <div className="flex items-center space-x-2">
                                                                    <button 
                                                                        onClick={() => viewBookingDetails(booking.id)}
                                                                        className="text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
                                                                    >
                                                                        View
                                                                    </button>
                                                                    
                                                                    <div className="relative inline-block text-left">
                                                                        <select
                                                                            className={`text-sm border rounded-md py-1 px-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                                darkMode 
                                                                                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                                                                                  : 'bg-white border-gray-300'
                                                                            }`}
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
                                                                            {booking.status !== 'completed' && <option value="completed">Completed</option>}
                                                                            {booking.status !== 'cancelled' && <option value="cancelled">Cancelled</option>}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ));
                                                })()}
                                            </tbody>
                                        </table>
                                        
                                        {/* Pagination Controls */}
                                        <div className={`mt-4 flex justify-between items-center p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-b-lg border border-t-0`}>
                                            <div>
                                                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    Page {currentPage} of {Math.ceil(bookings.filter(booking => 
                                                        (booking.status === 'pending' || booking.status === 'confirmed') &&
                                                        (selectedBookingStatus === 'All' || booking.status === selectedBookingStatus) &&
                                                        (selectedPaymentMethod === 'All' || booking.paymentMethod === selectedPaymentMethod)
                                                    ).length / bookingsPerPage)}
                                                </span>
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
                                                    onClick={() => {
                                                        const totalPages = Math.ceil(bookings.filter(booking => 
                                                            (booking.status === 'pending' || booking.status === 'confirmed') &&
                                                            (selectedBookingStatus === 'All' || booking.status === selectedBookingStatus) &&
                                                            (selectedPaymentMethod === 'All' || booking.paymentMethod === selectedPaymentMethod)
                                                        ).length / bookingsPerPage);
                                                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                                                    }}
                                                    disabled={currentPage >= Math.ceil(bookings.filter(booking => 
                                                        (booking.status === 'pending' || booking.status === 'confirmed') &&
                                                        (selectedBookingStatus === 'All' || booking.status === selectedBookingStatus) &&
                                                        (selectedPaymentMethod === 'All' || booking.paymentMethod === selectedPaymentMethod)
                                                    ).length / bookingsPerPage)}
                                                    className={`px-4 py-2 rounded-md ${
                                                        currentPage >= Math.ceil(bookings.filter(booking => 
                                                            (booking.status === 'pending' || booking.status === 'confirmed') &&
                                                            (selectedBookingStatus === 'All' || booking.status === selectedBookingStatus) &&
                                                            (selectedPaymentMethod === 'All' || booking.paymentMethod === selectedPaymentMethod)
                                                        ).length / bookingsPerPage)
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                                    }`}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>No bookings available.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orderHistory' && (
                            <OrderHistory active={true} darkMode={darkMode} />
                        )}

                        {activeTab === 'feedback' && (
                            <Feedback darkMode={darkMode} />
                        )}

                        {activeTab === 'notifications' && (
                            <AdminNotifications darkMode={darkMode} />
                        )}

                        {activeTab === 'profile' && (
                            <div className="p-4">
                                <Profile active={true} darkMode={darkMode} />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <Setting darkMode={darkMode} toggleDarkMode={toggleDarkMode} active={true} />
                        )}

                        {/* Booking Details Modal */}
                        {isViewingBookingDetails && selectedBooking && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                                <div className={`relative mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
                                    <div className={`flex justify-between items-center border-b pb-3 mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Booking Details #{selectedBooking.id}
                                        </h3>
                                        <button 
                                            onClick={() => setIsViewingBookingDetails(false)}
                                            className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-400 hover:text-gray-500'}`}
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Booking Information</h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Booking Date:</span>
                                                    <span>{formatDate(selectedBooking.createdAt)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Event Date:</span>
                                                    <span>{formatDate(selectedBooking.eventDate)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status:</span>
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
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Price:</span>
                                                    <span className="font-medium">${parseFloat(selectedBooking.totalPrice).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method:</span>
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
                                            <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Contact Information</h4>
                                            <div className="space-y-3 text-sm">
                                                {selectedBooking.User && (
                                                <div>
                                                    <div className="flex justify-between">
                                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Username:</span>
                                                        <span>{selectedBooking.User.username}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email:</span>
                                                        <span>{selectedBooking.User.email}</span>
                                                    </div>
                                                </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone:</span>
                                                    <span>{selectedBooking.phoneNumber}</span>
                                                </div>
                                                <div>
                                                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} block mb-1`}>Address:</span>
                                                    <span className="block text-right">{selectedBooking.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedBooking.Post && (
                                        <div className={`mt-6 border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <h4 className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Service Details</h4>
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
                                                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedBooking.Post.description}</p>
                                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
                                                        Base Price: ${parseFloat(selectedBooking.Post.basePrice).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-6 flex justify-end space-x-4">
                                        <button
                                            onClick={() => setIsViewingBookingDetails(false)}
                                            className={`px-4 py-2 ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} rounded-lg`}
                                        >
                                            Close
                                        </button>
                                        
                                        {/* Status Change Dropdown */}
                                        <div className="flex items-center">
                                            <select
                                                value={newStatus}
                                                onChange={(e) => setNewStatus(e.target.value)}
                                                className={`mr-2 px-3 py-2 border ${darkMode ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-400' : 'border-gray-300 focus:ring-blue-500'} rounded-md text-sm focus:outline-none focus:ring-2`}
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
                    Occasions System ©{new Date().getFullYear()} Created by Olivia and Bawar
                </Footer>
            </Layout>
        </Layout>
    );
}

export default Dashboard;