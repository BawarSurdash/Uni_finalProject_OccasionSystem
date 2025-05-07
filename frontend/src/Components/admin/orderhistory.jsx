import { useState, useEffect } from 'react';
import { HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const OrderHistory = ({ active, darkMode }) => {
    const [orderHistory, setOrderHistory] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [selectedOrderStatus, setSelectedOrderStatus] = useState('All');
    const [selectedOrderPaymentMethod, setSelectedOrderPaymentMethod] = useState('All');
    const [selectedOrderTimeframe, setSelectedOrderTimeframe] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentOrderPage, setCurrentOrderPage] = useState(1);
    const [ordersPerPage] = useState(10);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isViewingBookingDetails, setIsViewingBookingDetails] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [activeDetailsTab, setActiveDetailsTab] = useState('details');
    
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg", // Replace with your actual API key
        libraries: ["places"]
    });
    
    // Map styles
    const mapContainerStyle = {
        width: '100%',
        height: '200px',
        borderRadius: '0.5rem',
        marginTop: '0.5rem',
        marginBottom: '1rem'
    };
    
    const mapOptions = {
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: darkMode ? [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }
        ] : []
    };
    
    useEffect(() => {
        if (active) {
            fetchOrderHistory();
        }
    }, [active]);

    const fetchOrderHistory = async () => {
        setIsLoadingOrders(true);
        try {
            // Use the booking endpoint to get completed and cancelled bookings
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/booking/admin/all', {
                headers: { accessToken: token }
            });
            
            // Filter to only include completed and cancelled bookings
            const completedAndCancelledBookings = response.data.filter(
                booking => booking.status === 'completed' || booking.status === 'cancelled'
            );
            
            console.log('Order history data:', completedAndCancelledBookings);
            setOrderHistory(completedAndCancelledBookings);
        } catch (error) {
            console.error('Error fetching order history:', error);
            // Initialize with empty array if endpoint doesn't exist yet
            setOrderHistory([]);
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const viewBookingDetails = async (bookingId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:3001/booking/admin/${bookingId}`, {
                headers: { accessToken: token }
            });
            setSelectedBooking(response.data);
            setActiveDetailsTab('details');
            setIsViewingBookingDetails(true);
        } catch (error) {
            console.error('Error fetching booking details:', error);
            alert('Failed to fetch booking details');
        }
    };

    // Filter orders based on selected filters
    const filteredOrderHistory = orderHistory.filter(order => {
        // Filter by status
        const statusMatch = selectedOrderStatus === 'All' || order.status === selectedOrderStatus;
        
        // Filter by payment method
        const paymentMatch = selectedOrderPaymentMethod === 'All' || order.paymentMethod === selectedOrderPaymentMethod;
        
        // Filter by date range
        let dateMatch = true;
        const orderDate = new Date(order.createdAt);
        
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            dateMatch = orderDate >= start && orderDate <= end;
        } else if (startDate) {
            const start = new Date(startDate);
            dateMatch = orderDate >= start;
        } else if (endDate) {
            const end = new Date(endDate);
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            dateMatch = orderDate <= end;
        }
        
        // Time frame filter
        let timeMatch = true;
        const currentDate = new Date();
        
        if (selectedOrderTimeframe === '7days') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(currentDate.getDate() - 7);
            timeMatch = orderDate >= sevenDaysAgo;
        } else if (selectedOrderTimeframe === '30days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(currentDate.getDate() - 30);
            timeMatch = orderDate >= thirtyDaysAgo;
        } else if (selectedOrderTimeframe === '3months') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
            timeMatch = orderDate >= threeMonthsAgo;
        } else if (selectedOrderTimeframe === '6months') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(currentDate.getMonth() - 6);
            timeMatch = orderDate >= sixMonthsAgo;
        } else if (selectedOrderTimeframe === 'thisyear') {
            const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
            timeMatch = orderDate >= firstDayOfYear;
        }
        
        return statusMatch && paymentMatch && dateMatch && timeMatch;
    });

    if (!active) return null;

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order History</h2>
                <button 
                    onClick={fetchOrderHistory}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-200"
                >
                    Refresh
                </button>
            </div>

            {/* Booking Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
                <div 
                    className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-100'} p-4 rounded-lg border cursor-pointer`}
                    onClick={() => setSelectedOrderStatus('All')}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className={`${darkMode ? 'text-blue-400' : 'text-blue-800'} text-sm font-medium`}>Total Orders</span>
                            <span className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                {orderHistory.filter(order => order.status === 'completed' || order.status === 'cancelled').length}
                            </span>
                        </div>
                        <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div 
                    className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-100'} p-4 rounded-lg border cursor-pointer`}
                    onClick={() => setSelectedOrderStatus('completed')}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className={`${darkMode ? 'text-green-400' : 'text-green-800'} text-sm font-medium`}>Completed Orders</span>
                            <span className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                                {orderHistory.filter(order => order.status === 'completed').length}
                            </span>
                        </div>
                        <div className="bg-green-500 rounded-full w-10 h-10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div 
                    className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-red-100'} p-4 rounded-lg border cursor-pointer`}
                    onClick={() => setSelectedOrderStatus('cancelled')}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className={`${darkMode ? 'text-red-400' : 'text-red-800'} text-sm font-medium`}>Cancelled Orders</span>
                            <span className={`text-2xl font-bold ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                                {orderHistory.filter(order => order.status === 'cancelled').length}
                            </span>
                        </div>
                        <div className="bg-red-500 rounded-full w-10 h-10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Filter */}
            <div className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Filter by Status</label>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedOrderStatus('All')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                            selectedOrderStatus === 'All'
                                ? 'bg-blue-500 text-white shadow-md'
                                : darkMode 
                                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setSelectedOrderStatus('completed')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                            selectedOrderStatus === 'completed'
                                ? 'bg-green-500 text-white shadow-md'
                                : darkMode 
                                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setSelectedOrderStatus('cancelled')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                            selectedOrderStatus === 'cancelled'
                                ? 'bg-red-500 text-white shadow-md'
                                : darkMode 
                                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        Cancelled
                    </button>
                </div>
            </div>

            {/* Payment Method Filter */}
            <div className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Filter by Payment Method</label>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedOrderPaymentMethod('All')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                            selectedOrderPaymentMethod === 'All'
                                ? 'bg-blue-500 text-white shadow-md'
                                : darkMode 
                                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        All Methods
                    </button>
                    <button
                        onClick={() => setSelectedOrderPaymentMethod('fib')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                            selectedOrderPaymentMethod === 'fib'
                                ? 'bg-green-500 text-white shadow-md'
                                : darkMode 
                                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        FIB Bank
                    </button>
                    <button
                        onClick={() => setSelectedOrderPaymentMethod('fastpay')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                            selectedOrderPaymentMethod === 'fastpay'
                                ? 'bg-pink-500 text-white shadow-md'
                                : darkMode 
                                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-600' 
                                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        FastPay
                    </button>
                    <button
                        onClick={() => setSelectedOrderPaymentMethod('cash')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                            selectedOrderPaymentMethod === 'cash'
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

            {/* Date Range Filter */}
            <div className={`mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Filter by Date Range</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Start Date</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setSelectedOrderTimeframe('All'); // Reset timeframe filter when date is selected
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
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setSelectedOrderTimeframe('All'); // Reset timeframe filter when date is selected
                            }}
                            className={`w-full p-2 rounded-md ${
                                darkMode 
                                ? 'bg-gray-600 border-gray-500 text-gray-200' 
                                : 'bg-white border-gray-300 text-gray-800'
                            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                    </div>
                </div>
                {(startDate || endDate) && (
                    <div className="mt-2 flex justify-end">
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setCurrentOrderPage(1); // Reset to first page when dates are cleared
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

            {isLoadingOrders ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Loading order history...</p>
                </div>
            ) : filteredOrderHistory.length > 0 ? (
                <div className={`overflow-x-auto ${darkMode ? 'dark-table' : ''}`}>
                    {/* Result count indicator */}
                    <div className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} p-3 rounded-t-lg border border-b-0`}>
                        <div className="flex justify-between items-center">
                            <span className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                                Showing {filteredOrderHistory.length} of {orderHistory.length} orders
                            </span>
                            <div className="flex space-x-2">
                                {selectedOrderStatus !== 'All' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Status: {selectedOrderStatus.charAt(0).toUpperCase() + selectedOrderStatus.slice(1)}
                                        <button 
                                            onClick={() => {
                                                setSelectedOrderStatus('All');
                                                setCurrentOrderPage(1); // Reset to first page when filter changes
                                            }}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                )}
                                {selectedOrderPaymentMethod !== 'All' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Payment: {selectedOrderPaymentMethod === 'fib' ? 'FIB Bank' : 
                                                selectedOrderPaymentMethod === 'fastpay' ? 'FastPay' : 
                                                selectedOrderPaymentMethod === 'cash' ? 'Cash' : 
                                                selectedOrderPaymentMethod}
                                        <button 
                                            onClick={() => {
                                                setSelectedOrderPaymentMethod('All');
                                                setCurrentOrderPage(1); // Reset to first page when filter changes
                                            }}
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
                    
                    <table className={`min-w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <tr>
                                <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Order ID</th>
                                <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Customer</th>
                                <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Event Date</th>
                                <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Amount</th>
                                <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Payment Method</th>
                                <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Status</th>
                                <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200 text-gray-700'} text-left`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                // Calculate pagination
                                const indexOfLastOrder = currentOrderPage * ordersPerPage;
                                const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
                                const currentOrders = filteredOrderHistory.slice(indexOfFirstOrder, indexOfLastOrder);
                                
                                return currentOrders.map((order) => (
                                    <tr key={order.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                        <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>#{order.id}</td>
                                        <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>
                                            {order.User ? order.User.username : 'Unknown'}
                                        </td>
                                        <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>{formatDate(order.eventDate)}</td>
                                        <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>${parseFloat(order.totalPrice).toFixed(2)}</td>
                                        <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                order.paymentMethod === 'fib' ? 'bg-green-100 text-green-800' :
                                                order.paymentMethod === 'fastpay' ? 'bg-pink-100 text-pink-800' :
                                                order.paymentMethod === 'cash' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {order.paymentMethod === 'fib' ? 'FIB Bank' :
                                                order.paymentMethod === 'fastpay' ? 'FastPay' :
                                                order.paymentMethod === 'cash' ? 'Cash' :
                                                order.paymentMethod}
                                            </span>
                                        </td>
                                        <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                order.status === 'completed' ? 'bg-green-500 text-white' :
                                                order.status === 'cancelled' ? 'bg-red-500 text-white' :
                                                'bg-gray-500 text-white'
                                            }`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600 text-gray-200' : 'border-gray-200'}`}>
                                            <button 
                                                className={`${darkMode ? 'text-white hover:text-orange-300' : 'text-blue-500 hover:text-blue-700'}`}
                                                onClick={() => viewBookingDetails(order.id)}
                                            >
                                                View Details
                                            </button>
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
                                Page {currentOrderPage} of {Math.ceil(filteredOrderHistory.length / ordersPerPage)}
                            </span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentOrderPage(prev => Math.max(1, prev - 1))}
                                disabled={currentOrderPage === 1}
                                className={`px-4 py-2 rounded-md ${
                                    currentOrderPage === 1 
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => {
                                    const totalPages = Math.ceil(filteredOrderHistory.length / ordersPerPage);
                                    setCurrentOrderPage(prev => Math.min(totalPages, prev + 1));
                                }}
                                disabled={currentOrderPage >= Math.ceil(filteredOrderHistory.length / ordersPerPage)}
                                className={`px-4 py-2 rounded-md ${
                                    currentOrderPage >= Math.ceil(filteredOrderHistory.length / ordersPerPage)
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
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>No order history available.</p>
                </div>
            )}
            
            {/* Booking details modal */}
            {isViewingBookingDetails && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className={`relative mx-auto p-0 border-0 w-11/12 md:w-3/4 lg:w-2/3 shadow-2xl rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} overflow-hidden`}>
                        {/* Header with gradient */}
                        <div className={`px-6 py-4 ${darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white`}>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                <h3 className="text-xl font-bold flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Booking #{selectedBooking.id}
                            </h3>
                                    {selectedBooking.Post && (
                                        <p className="text-white text-opacity-90 mt-1">{selectedBooking.Post.title}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center">
                                        <div className={`px-3 py-1.5 rounded-full text-sm font-medium bg-white ${
                                            selectedBooking.status === 'completed' ? 'text-green-700' : 
                                            selectedBooking.status === 'pending' ? 'text-yellow-700' :
                                            selectedBooking.status === 'confirmed' ? 'text-blue-700' :
                                            'text-red-700'
                                        }`}>
                                            {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                        </div>
                                    </div>
                            <button 
                                onClick={() => setIsViewingBookingDetails(false)}
                                    className="text-white hover:text-gray-200 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                                </div>
                        </div>
                                    </div>
                        
                        {/* Status information */}
                        <div className="px-6 py-4 border-b border-dashed border-opacity-50 border-gray-300">
                            <div className={`flex flex-col md:flex-row md:items-center justify-between p-3 rounded-lg ${
                                selectedBooking.status === 'completed' ? darkMode ? 'bg-green-900/20 text-green-400 border-green-700/50' : 'bg-green-100 text-green-800 border-green-300' :
                                selectedBooking.status === 'confirmed' ? darkMode ? 'bg-blue-900/20 text-blue-400 border-blue-700/50' : 'bg-blue-100 text-blue-800 border-blue-300' :
                                selectedBooking.status === 'pending' ? darkMode ? 'bg-yellow-900/20 text-yellow-400 border-yellow-700/50' : 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                darkMode ? 'bg-red-900/20 text-red-400 border-red-700/50' : 'bg-red-100 text-red-800 border-red-300'
                            } border`}>
                                <div className="flex items-center mb-2 md:mb-0">
                                    <span className={`flex items-center justify-center w-10 h-10 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-white'} mr-3 ${
                                        selectedBooking.status === 'completed' ? 'text-green-500' :
                                        selectedBooking.status === 'confirmed' ? 'text-blue-500' :
                                        selectedBooking.status === 'pending' ? 'text-yellow-500' :
                                        'text-red-500'
                                    }`}>
                                        {selectedBooking.status === 'completed' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                        )}
                                        {selectedBooking.status === 'confirmed' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                        )}
                                        {selectedBooking.status === 'pending' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {selectedBooking.status === 'cancelled' && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        </span>
                                    <div>
                                        <p className="font-medium">
                                            Order Status: {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                        </p>
                                        <p className="text-sm opacity-80">Last updated: {formatDate(selectedBooking.updatedAt || selectedBooking.createdAt)}</p>
                                    </div>
                                </div>
                                </div>
                            </div>
                        
                        {/* Tab navigation */}
                        <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
                            <ul className="flex flex-wrap -mb-px">
                                <li className="mr-2">
                                    <button
                                        className={`inline-block px-4 py-2 rounded-t-lg border-b-2 ${
                                            activeDetailsTab === 'details'
                                                ? darkMode
                                                    ? 'text-blue-400 border-blue-400'
                                                    : 'text-blue-600 border-blue-600'
                                                : darkMode
                                                    ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
                                                    : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
                                        }`}
                                        onClick={() => setActiveDetailsTab('details')}
                                    >
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            Customer
                                        </div>
                                    </button>
                                </li>
                                <li className="mr-2">
                                    <button
                                        className={`inline-block px-4 py-2 rounded-t-lg border-b-2 ${
                                            activeDetailsTab === 'service'
                                                ? darkMode
                                                    ? 'text-blue-400 border-blue-400'
                                                    : 'text-blue-600 border-blue-600'
                                                : darkMode
                                                    ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
                                                    : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
                                        }`}
                                        onClick={() => setActiveDetailsTab('service')}
                                    >
                                                <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                            Service
                                        </div>
                                    </button>
                                </li>
                                {(selectedBooking.latitude && selectedBooking.longitude) && (
                                    <li className="mr-2">
                                        <button
                                            className={`inline-block px-4 py-2 rounded-t-lg border-b-2 ${
                                                activeDetailsTab === 'map'
                                                    ? darkMode
                                                        ? 'text-blue-400 border-blue-400'
                                                        : 'text-blue-600 border-blue-600'
                                                    : darkMode
                                                        ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
                                                        : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
                                            }`}
                                            onClick={() => setActiveDetailsTab('map')}
                                        >
                                                <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                Location
                                        </div>
                                        </button>
                                    </li>
                                )}
                                {selectedBooking.imageProof && (
                                    <li>
                                        <button
                                            className={`inline-block px-4 py-2 rounded-t-lg border-b-2 ${
                                                activeDetailsTab === 'payment'
                                                    ? darkMode
                                                        ? 'text-blue-400 border-blue-400'
                                                        : 'text-blue-600 border-blue-600'
                                                    : darkMode
                                                        ? 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
                                                        : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
                                            }`}
                                            onClick={() => setActiveDetailsTab('payment')}
                                        >
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                                Payment
                                    </div>
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                        
                        {/* Tab content */}
                        <div className="p-6">
                            {/* Customer tab */}
                            {activeDetailsTab === 'details' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Customer Information
                                            </h3>
                                            <div className="space-y-4">
                                                {selectedBooking.User && (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Username:</span>
                                                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.User.username}</span>
                                    </div>
                                                        <div className="flex justify-between">
                                                            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Email:</span>
                                                            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.User.email}</span>
                                                        </div>
                                                    </>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Phone Number:</span>
                                                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedBooking.phoneNumber}</span>
                                </div>
                            </div>
                        </div>
                        
                                        <div>
                                            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Booking Details
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Booking Date:</span>
                                                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedBooking.createdAt)}</span>
                                            </div>
                                                <div className="flex justify-between">
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Event Date:</span>
                                                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(selectedBooking.eventDate)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Payment Method:</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                                                <div className="flex justify-between">
                                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Price:</span>
                                                    <span className={`font-medium text-green-500`}>${parseFloat(selectedBooking.totalPrice).toFixed(2)}</span>
                                        </div>
                                            </div>
                                        </div>
                                </div>
                                
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Address
                                        </h3>
                                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <p className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{selectedBooking.address}</p>
                                            </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Service tab */}
                            {activeDetailsTab === 'service' && (
                                <div className="space-y-4">
                                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Service Details
                                    </h3>
                                    
                                    {selectedBooking.Post ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                    {selectedBooking.Post.image && (
                                                    <div className="mb-4 rounded-lg overflow-hidden shadow-md">
                                            <img 
                                                src={selectedBooking.Post.image} 
                                                alt={selectedBooking.Post.title} 
                                                            className="w-full h-56 object-cover rounded-md"
                                            />
                                        </div>
                                    )}
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {selectedBooking.Post.title}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                                            {selectedBooking.Post.category}
                                        </span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                                            Base Price: ${parseFloat(selectedBooking.Post.basePrice).toFixed(2)}
                                                    </span>
                                    </div>
                                                {selectedBooking.Post.description && (
                                                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {selectedBooking.Post.description}
                                                    </p>
                                                )}
                                </div>
                            </div>
                                    ) : (
                                        <div className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Service details not available</p>
                                        </div>
                                    )}
                                        </div>
                            )}
                            
                            {/* Map tab */}
                            {activeDetailsTab === 'map' && (selectedBooking.latitude && selectedBooking.longitude) && (
                                <div className="space-y-4">
                                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Customer Location
                                    </h3>
                                    <div className="rounded-lg overflow-hidden shadow-md">
                                        {isLoaded ? (
                                            <GoogleMap
                                                mapContainerStyle={mapContainerStyle}
                                                center={{
                                                    lat: parseFloat(selectedBooking.latitude),
                                                    lng: parseFloat(selectedBooking.longitude)
                                                }}
                                                zoom={15}
                                                options={mapOptions}
                                            >
                                                <Marker
                                                    position={{
                                                        lat: parseFloat(selectedBooking.latitude),
                                                        lng: parseFloat(selectedBooking.longitude)
                                                    }}
                                                    icon={{
                                                        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='36px' height='36px'%3E%3Cpath fill='%23F97316' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
                                                        scaledSize: { width: 36, height: 36 },
                                                        origin: { x: 0, y: 0 },
                                                        anchor: { x: 18, y: 36 },
                                                    }}
                                                />
                                            </GoogleMap>
                                        ) : (
                                            <div className={`h-[300px] flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
                                                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading map...</p>
                                                </div>
                                        )}
                            </div>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Customer Address: {selectedBooking.address}
                                    </p>
                                </div>
                            )}
                            
                            {/* Payment tab */}
                            {activeDetailsTab === 'payment' && selectedBooking.imageProof && (
                                <div className="space-y-4">
                                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Payment Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Total Amount:</span>
                                                    <span className="text-xl font-bold text-green-500">${parseFloat(selectedBooking.totalPrice).toFixed(2)}</span>
                                            </div>
                                                <div className="flex justify-between items-center">
                                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Payment Method:</span>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                                            <div className="space-y-2">
                                                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Proof:</p>
                                                <div className="flex justify-center rounded-lg overflow-hidden border border-gray-300">
                                                    <img 
                                                        src={`http://localhost:3001${selectedBooking.imageProof}`} 
                                                        alt="Payment Proof" 
                                                        className="h-48 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => setShowImageModal(true)}
                                                    />
                                            </div>
                                                <p className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Click to view larger image
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Image Modal */}
            {showImageModal && selectedBooking && selectedBooking.imageProof && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" 
                        onClick={() => setShowImageModal(false)}
                    ></div>
                    <div className="relative z-50 max-w-screen-md max-h-screen-md p-2">
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="bg-gray-800 bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <img 
                            src={`http://localhost:3001${selectedBooking.imageProof}`} 
                            alt="Payment Proof" 
                            className="mx-auto max-h-[80vh] max-w-full object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
            
            {/* Add dark mode styling */}
            {darkMode && (
                <style jsx="true">{`
                    /* Header styles for dark mode */
                    .dark-table .ant-table-thead > tr > th {
                        background-color: #1f2937 !important;
                        color: #e5e7eb !important;
                        border-bottom: 1px solid #374151 !important;
                    }
                    
                    /* Body styles for dark mode */
                    .dark-table .ant-table-tbody > tr > td {
                        background-color: #1f2937 !important;
                        color: #e5e7eb !important;
                        border-bottom: 1px solid #374151 !important;
                    }
                    
                    /* Hover styles */
                    .dark-table .ant-table-tbody > tr.ant-table-row:hover > td {
                        background-color: #374151 !important;
                    }
                    
                    /* Pagination styles */
                    .dark-table .ant-pagination .ant-pagination-item-active {
                        background-color: #3b82f6 !important;
                        border-color: #3b82f6 !important;
                    }
                    
                    .dark-table .ant-pagination .ant-pagination-item-active a {
                        color: white !important;
                    }
                    
                    .dark-table .ant-pagination .ant-pagination-item a,
                    .dark-table .ant-pagination .ant-pagination-prev button,
                    .dark-table .ant-pagination .ant-pagination-next button {
                        color: #e5e7eb !important;
                    }
                    
                    /* Empty data styling */
                    .dark-table .ant-empty-description {
                        color: #9ca3af !important;
                    }
                    
                    .dark-table .ant-empty-img-simple-ellipse {
                        fill: #4b5563 !important;
                    }
                    
                    .dark-table .ant-empty-img-simple-g {
                        stroke: #6b7280 !important;
                    }
                    
                    .dark-table .ant-empty-img-simple-path {
                        fill: #374151 !important;
                    }
                    
                    /* Modal dark mode styling */
                    .dark-modal .ant-modal-content {
                        background-color: #1f2937 !important;
                        color: #e5e7eb !important;
                    }
                    
                    .dark-modal .ant-modal-header {
                        background-color: #1f2937 !important;
                        border-bottom: 1px solid #374151 !important;
                    }
                    
                    .dark-modal .ant-modal-title {
                        color: #e5e7eb !important;
                    }
                    
                    .dark-modal .ant-modal-close {
                        color: #e5e7eb !important;
                    }
                    
                    .dark-modal .ant-modal-footer {
                        border-top: 1px solid #374151 !important;
                    }
                    
                    /* Select dropdown dark mode */
                    .ant-dropdown-dark {
                        background-color: #1f2937 !important;
                        border: 1px solid #374151 !important;
                        box-shadow: 0 3px 6px -4px rgba(0,0,0,0.48) !important;
                    }
                    
                    .ant-dropdown-dark .ant-select-item {
                        color: #e5e7eb !important;
                    }
                    
                    .ant-dropdown-dark .ant-select-item-option-selected {
                        background-color: #374151 !important;
                    }
                    
                    .ant-dropdown-dark .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
                        background-color: #4b5563 !important;
                    }
                    
                    .ant-select-dark .ant-select-selector {
                        background-color: #1f2937 !important;
                        border-color: #374151 !important;
                        color: #e5e7eb !important;
                    }
                    
                    .site-badge-count-dark .ant-badge-count {
                        box-shadow: 0 0 0 1px #1f2937 !important;
                    }
                `}</style>
            )}
        </div>
    );
};

export default OrderHistory;
