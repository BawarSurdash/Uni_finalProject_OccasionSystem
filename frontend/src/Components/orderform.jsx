import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './navbar';

const OrderForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [itemDetails, setItemDetails] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState(location.state?.selectedAddons || []);
    const [totalPrice, setTotalPrice] = useState(location.state?.totalPrice || 0);
    const [userData, setUserData] = useState(null);

    const availableAddons = [
        { id: 1, name: 'Candle Package', priceAdjustment: 15, description: 'Set of 24 elegant decorative candles' },
        { id: 2, name: 'Balloon Bundle', priceAdjustment: 10, description: '30 premium balloons in your choice of colors' },
        { id: 3, name: 'Extra Hour', priceAdjustment: 20, description: 'Extend your event time by 1 hour' }
    ];

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '+964',
        address: '',
        eventDate: '',
        additionalRequests: '',
        paymentMethod: '',
        paymentProof: null,
        selectedAddons: location.state?.selectedAddons || [],
        totalPrice: location.state?.totalPrice || 0
    });

    // Calculate total price with selected add-ons
    const calculateTotalPrice = (basePrice, selectedAddonIds) => {
        const base = parseFloat(basePrice) || 0;
        const addonAdjustments = selectedAddonIds.reduce((total, addonId) => {
            const addon = availableAddons.find(a => a.id === addonId);
            if (addon) {
                return total + (base * (addon.priceAdjustment / 100));
            }
            return total;
        }, 0);
        return base + addonAdjustments;
    };

    // Handle addon selection
    const toggleAddon = (addonId) => {
        setSelectedAddons(prev => {
            const newSelection = prev.includes(addonId)
                ? prev.filter(id => id !== addonId)
                : [...prev, addonId];
            
            // Update total price whenever selection changes
            if (itemDetails) {
                const newTotal = calculateTotalPrice(itemDetails.basePrice, newSelection);
                setTotalPrice(newTotal);
                setFormData(prevState => ({
                    ...prevState,
                    selectedAddons: newSelection,
                    totalPrice: newTotal
                }));
            }
            
            return newSelection;
        });
    };

    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/posts/${id}`);
                setItemDetails(response.data);
                // Only initialize total price if not passed from previous page
                if (!location.state?.totalPrice) {
                    setTotalPrice(response.data.basePrice);
                    setFormData(prevState => ({
                        ...prevState,
                        totalPrice: response.data.basePrice
                    }));
                }
            } catch (error) {
                console.error('Error fetching item details:', error);
            }
        };
        fetchItemDetails();
    }, [id, location.state]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/auth/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
                setFormData(prev => ({
                    ...prev,
                    fullName: response.data.username,
                    email: response.data.email
                }));
            } catch (error) {
                console.error("Error fetching user data:", error);
                navigate('/login');
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        
        if (name === 'phoneNumber') {
            // Allow 10 digits after country code
            const cleanedValue = '+964' + value.replace(/\D/g, '').slice(0, 10);
            
            setFormData(prevState => ({
                ...prevState,
                [name]: cleanedValue
            }));
        } else if (name === 'paymentProof') {
            setFormData(prevState => ({
                ...prevState,
                [name]: files[0]
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const getPaymentDetails = () => {
        switch(formData.paymentMethod) {
            case 'fib':
                return {
                    number: "1234-5678-9012-3456",
                    name: "FIB Bank Account"
                };
            case 'fastpay':
                return {
                    number: "0912-3456-789",
                    name: "FastPay Account"
                };
            default:
                return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            // Verify token exists
            if (!token) {
                alert('You need to be logged in to create a booking');
                navigate('/login');
                return;
            }
            
            // Log what's being sent
            console.log("Sending booking data:", {
                ...formData,
                serviceId: id
            });
            
            const response = await axios.post('http://localhost:3001/booking', {
                ...formData,
                serviceId: id
            }, {
                headers: { 
                    accessToken: token  // Changed from Authorization to accessToken
                }
            });
            
            console.log("Booking response:", response.data);
            
            // Only navigate if successful
            if (response.data.success) {
                navigate('/success');
            } else {
                alert('Error: ' + (response.data.message || 'Failed to create booking'));
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to create booking: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <Navbar />
            <div className="max-w-md mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Book This Offer</h1>
                    {itemDetails && (
                        <div className="text-center mb-6">
                            <p className="text-lg text-gray-600 mb-2">{itemDetails.title}</p>
                            {/* Price Summary */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-center items-center">
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-gray-900">Total Price</p>
                                        <p className="text-3xl font-bold text-pink-500 mt-1">${totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                {/* Country Code */}
                                <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                                    <span className="text-gray-600">+964</span>
                                </div>
                                {/* Phone Number Input */}
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber.replace('+964', '')}
                                    onChange={handleChange}
                                    pattern="\d{10}"
                                    title="Enter 10-digit phone number (excluding country code)"
                                    maxLength={10}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="7701234567"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Enter your 10-digit phone number
                            </p>
                        </div>

                        {/* New Address Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                 Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Street name, Building number, District"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Event Date
                            </label>
                            <input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Requests
                            </label>
                            <textarea
                                name="additionalRequests"
                                value={formData.additionalRequests}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Any special requirements or requests..."
                            />
                        </div>

                        {/* Payment Methods */}
                        <div className="border-t pt-6 mb-6">
                            <p className="text-sm text-gray-600 text-center mb-4">Select Payment Method</p>
                            <div className="flex justify-center space-x-6">
                                {/* FIB */}
                                <div className="flex flex-col items-center">
                                    <div 
                                        className={`w-16 h-12 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                                            formData.paymentMethod === 'fib' 
                                            ? 'bg-green-500 ring-2 ring-green-500 ring-offset-2' 
                                            : 'bg-green-500 hover:opacity-90'
                                        }`}
                                        onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'fib' } })}
                                    >
                                        <span className="text-white font-bold">FIB</span>
                                    </div>
                                    <span className="text-xs text-gray-600 mt-1">FIB Bank</span>
                                </div>

                                {/* FastPay */}
                                <div className="flex flex-col items-center">
                                    <div 
                                        className={`w-16 h-12 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                                            formData.paymentMethod === 'fastpay' 
                                            ? 'bg-pink-500 ring-2 ring-pink-500 ring-offset-2' 
                                            : 'bg-pink-500 hover:opacity-90'
                                        }`}
                                        onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'fastpay' } })}
                                    >
                                        <span className="font-bold text-white">Fast<span className="text-sm">Pay</span></span>
                                    </div>
                                    <span className="text-xs text-gray-600 mt-1">FastPay</span>
                                </div>

                                {/* Cash */}
                                <div className="flex flex-col items-center">
                                    <div 
                                        className={`w-16 h-12 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                                            formData.paymentMethod === 'cash' 
                                            ? 'bg-yellow-500 ring-2 ring-yellow-500 ring-offset-2' 
                                            : 'bg-yellow-500 hover:opacity-90'
                                        }`}
                                        onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'cash' } })}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-600 mt-1">Cash</span>
                                </div>
                            </div>
                            {formData.paymentMethod === '' && (
                                <p className="text-red-500 text-xs text-center mt-2">Please select a payment method</p>
                            )}

                            {/* Payment Details Section */}
                            {(formData.paymentMethod === 'fib' || formData.paymentMethod === 'fastpay') && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-center mb-4">
                                        {/* Add Total Price Display */}
                                        <div className="mb-4 pb-4 border-b border-gray-200">
                                            <p className="text-sm text-gray-600">Total Amount to Pay:</p>
                                            <p className="text-2xl font-bold text-pink-500 mt-1">
                                                ${totalPrice.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600">Please send payment to:</p>
                                        <p className="text-lg font-semibold text-gray-800 mt-1">
                                            {getPaymentDetails()?.number}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {getPaymentDetails()?.name}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Upload Payment Proof
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-orange-500 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="payment-proof"
                                                        className="relative cursor-pointer rounded-md font-medium text-orange-500 hover:text-orange-600"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="payment-proof"
                                                            name="paymentProof"
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            onChange={handleChange}
                                                            required={formData.paymentMethod === 'fib' || formData.paymentMethod === 'fastpay'}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, GIF up to 10MB
                                                </p>
                                                {formData.paymentProof && (
                                                    <p className="text-sm text-green-600 mt-2">
                                                        Selected file: {formData.paymentProof.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-orange-500 text-white py-3 rounded-md text-lg font-semibold hover:bg-orange-600 transition-colors"
                        >
                            Book Now
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrderForm;
