import { useState, useEffect } from 'react';
import { HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';

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
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className={`relative mx-auto p-5 w-11/12 md:w-3/4 lg:w-1/2 rounded-md shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className={`flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b pb-3 mb-4`}>
                            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Booking Details #{selectedBooking.id}
                            </h3>
                            <button 
                                onClick={() => setIsViewingBookingDetails(false)}
                                className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
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
                                        <span className={darkMode ? 'text-white' : ''}>{formatDate(selectedBooking.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Event Date:</span>
                                        <span className={darkMode ? 'text-white' : ''}>{formatDate(selectedBooking.eventDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            selectedBooking.status === 'completed' 
                                            ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-500 text-white' 
                                            : selectedBooking.status === 'confirmed' 
                                            ? darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-500 text-white'
                                            : selectedBooking.status === 'pending' 
                                            ? darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-500 text-white'
                                            : darkMode ? 'bg-red-900 text-red-200' : 'bg-red-500 text-white'
                                        }`}>
                                            {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Price:</span>
                                        <span className={`font-medium ${darkMode ? 'text-white' : ''}`}>${parseFloat(selectedBooking.totalPrice).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            selectedBooking.paymentMethod === 'fib' 
                                            ? darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' 
                                            : selectedBooking.paymentMethod === 'fastpay' 
                                            ? darkMode ? 'bg-pink-900 text-pink-200' : 'bg-pink-100 text-pink-800'
                                            : selectedBooking.paymentMethod === 'cash' 
                                            ? darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                                            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
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
                                            <span className={darkMode ? 'text-white' : ''}>{selectedBooking.User.username}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email:</span>
                                            <span className={darkMode ? 'text-white' : ''}>{selectedBooking.User.email}</span>
                                        </div>
                                    </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone:</span>
                                        <span className={darkMode ? 'text-white' : ''}>{selectedBooking.phoneNumber}</span>
                                    </div>
                                    <div>
                                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} block mb-1`}>Address:</span>
                                        <span className={`block text-right ${darkMode ? 'text-white' : ''}`}>{selectedBooking.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {selectedBooking.Post && (
                            <div className={`mt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-4`}>
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
                                        <h5 className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>{selectedBooking.Post.title}</h5>
                                        <span className={`inline-block ${
                                            darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                                        } text-xs px-2 py-1 rounded-full mb-2`}>
                                            {selectedBooking.Post.category}
                                        </span>
                                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedBooking.Post.description}</p>
                                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mt-2`}>
                                            Base Price: ${parseFloat(selectedBooking.Post.basePrice).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setIsViewingBookingDetails(false)}
                                className={`px-4 py-2 rounded-md ${
                                    darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Close
                            </button>
                        </div>
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
