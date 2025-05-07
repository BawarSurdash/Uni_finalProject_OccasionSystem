import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './navbar';
import { useTheme } from '../contexts/ThemeContext';
import { GoogleMap, useLoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';

const OrderForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const { darkMode } = useTheme();
    const [itemDetails, setItemDetails] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState(location.state?.selectedAddons || []);
    const [totalPrice, setTotalPrice] = useState(location.state?.totalPrice || 0);
    const [userData, setUserData] = useState(null);
    const [currentLocation, setCurrentLocation] = useState({ lat: 36.1901, lng: 43.9930 }); // Default to Erbil
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [tempLocation, setTempLocation] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [searchBoxLoaded, setSearchBoxLoaded] = useState(false);
    const mapRef = useRef(null);
    const searchBoxRef = useRef(null);

    const libraries = ["places"];

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg", // This is a placeholder key. You should replace it with your actual Google Maps API key
        libraries: libraries,
    });

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

    const fetchAddressFromCoords = async (lat, lng) => {
        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`
            );
            if (response.data.results && response.data.results.length > 0) {
                const address = response.data.results[0].formatted_address;
                return address;
            }
            return "";
        } catch (error) {
            console.error("Error fetching address:", error);
            return "";
        }
    };

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

            // Check if location is selected
            if (!selectedLocation) {
                alert('Please select and confirm your location on the map');
                return;
            }
            
            // Create FormData object to handle file upload
            const formDataToSend = new FormData();
            
            // Add all form fields to FormData
            formDataToSend.append('fullName', formData.fullName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phoneNumber', formData.phoneNumber);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('eventDate', formData.eventDate);
            formDataToSend.append('additionalRequests', formData.additionalRequests);
            formDataToSend.append('paymentMethod', formData.paymentMethod);
            formDataToSend.append('totalPrice', formData.totalPrice);
            formDataToSend.append('serviceId', id);
            
            // Add location coordinates
            formDataToSend.append('latitude', selectedLocation.lat);
            formDataToSend.append('longitude', selectedLocation.lng);
            
            // Add payment proof file if it exists
            if (formData.paymentProof) {
                formDataToSend.append('paymentProof', formData.paymentProof);
            }
            
            // Log what's being sent
            console.log("Sending booking data with file upload");
            console.log("Location coordinates:", selectedLocation.lat, selectedLocation.lng);
            
            const response = await axios.post('http://localhost:3001/booking', formDataToSend, {
                headers: { 
                    accessToken: token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log("Booking response:", response.data);
            
            // Only navigate if successful
            if (response.data.success) {
                navigate('/success', { 
                    state: { 
                        postId: id,
                        bookingId: response.data.booking.id,
                        success: true
                    } 
                });
            } else {
                alert('Error: ' + (response.data.message || 'Failed to create booking'));
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Failed to create booking: ' + (error.response?.data?.error || error.message));
        }
    };

    const onMapClick = useCallback((e) => {
        setTempLocation({
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        });
    }, []);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
        setMapLoaded(true);
    }, []);

    const onSearchBoxLoad = (ref) => {
        searchBoxRef.current = ref;
        setSearchBoxLoaded(true);
    };

    const onPlacesChanged = () => {
        if (searchBoxRef.current) {
            const places = searchBoxRef.current.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                if (place.geometry && place.geometry.location) {
                    const newLocation = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    
                    setTempLocation(newLocation);
                    
                    // Center map on the selected location
                    if (mapRef.current) {
                        mapRef.current.panTo(newLocation);
                        mapRef.current.setZoom(16);
                    }
                }
            }
        }
    };

    const mapContainerStyle = {
        width: '100%',
        height: '360px',
        borderRadius: '0.75rem',
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
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
            },
            {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
            },
            {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
            },
        ] : []
    };

    const confirmLocation = async () => {
        if (tempLocation) {
            setSelectedLocation(tempLocation);
            const address = await fetchAddressFromCoords(tempLocation.lat, tempLocation.lng);
            setFormData(prev => ({
                ...prev,
                address: address
            }));
        } else {
            alert("Please select a location on the map first");
        }
    };

    const removeLocation = () => {
        setTempLocation(null);
        setSelectedLocation(null);
        setFormData(prev => ({
            ...prev,
            address: ''
        }));
    };

    const customMarkerIcon = {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='36px' height='36px'%3E%3Cpath fill='%23F97316' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
        scaledSize: { width: 36, height: 36 },
        origin: { x: 0, y: 0 },
        anchor: { x: 18, y: 36 },
    };

    const tempMarkerIcon = {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='36px' height='36px'%3E%3Cpath fill='%233B82F6' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
        scaledSize: { width: 36, height: 36 },
        origin: { x: 0, y: 0 },
        anchor: { x: 18, y: 36 },
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
            <Navbar />
            <div className="max-w-md mx-auto px-4 py-8">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                    <div className="mb-6">
                        <button 
                            onClick={() => navigate(-1)}
                            className={`flex items-center ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    <h1 className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Book This Offer</h1>
                    {itemDetails && (
                        <div className="text-center mb-6">
                            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>{itemDetails.title}</p>
                            {/* Price Summary */}
                            <div className={`mt-4 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                                <div className="flex justify-center items-center">
                                    <div className="text-center">
                                        <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Total Price</p>
                                        <p className="text-3xl font-bold text-pink-500 mt-1">${totalPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                 Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                readOnly
                                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-gray-100'} rounded-md`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                readOnly
                                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-gray-100'} rounded-md`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Phone Number
                            </label>
                            <div className="flex gap-2">
                                {/* Country Code */}
                                <div className={`flex items-center px-3 py-2 border border-r-0 ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-gray-50 text-gray-600'} rounded-l-md`}>
                                    <span>+964</span>
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
                                    className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300'} rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                    placeholder="7701234567"
                                    required
                                />
                            </div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                Enter your 10-digit phone number
                            </p>
                        </div>

                        {/* Map for location selection */}
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Your Location
                            </label>
                            
                            <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} shadow-lg mb-3`}>
                                <div className="p-3">
                                    {isLoaded ? (
                                        <StandaloneSearchBox
                                            onLoad={onSearchBoxLoad}
                                            onPlacesChanged={onPlacesChanged}
                                        >
                                            <div className="flex items-center relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search for a location..."
                                                    className={`w-full pl-10 pr-3 py-2 ${darkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                                />
                                            </div>
                                        </StandaloneSearchBox>
                                    ) : (
                                        <div className={`w-full pl-10 pr-3 py-2 ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'} border rounded-lg`}>
                                            Loading search...
                                        </div>
                                    )}
                                </div>
                                
                                <div className="relative">
                                    {!isLoaded ? (
                                        <div className="h-64 flex items-center justify-center">
                                            <div className="animate-pulse flex flex-col items-center">
                                                <div className={`h-16 w-16 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} mb-4`}></div>
                                                <div className={`h-4 w-24 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded mb-2`}></div>
                                                <div className={`h-3 w-32 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded`}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={selectedLocation || tempLocation || currentLocation}
                                            zoom={15}
                                            onClick={onMapClick}
                                            onLoad={onMapLoad}
                                            options={mapOptions}
                                        >
                                            {tempLocation && !selectedLocation && (
                                                <Marker
                                                    position={tempLocation}
                                                    icon={tempMarkerIcon}
                                                    animation={window.google.maps.Animation.DROP}
                                                />
                                            )}
                                            {selectedLocation && (
                                                <Marker 
                                                    position={selectedLocation} 
                                                    icon={customMarkerIcon}
                                                />
                                            )}
                                        </GoogleMap>
                                    )}
                                    
                                    {mapLoaded && (
                                        <div className={`absolute bottom-3 left-3 p-2 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} text-xs rounded-lg shadow-md flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            Click on the map to select your location
                                        </div>
                                    )}
                                    
                                    {tempLocation && !selectedLocation && (
                                        <div className={`absolute top-3 left-0 right-0 mx-auto w-max p-2 ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'} text-xs rounded-lg shadow-lg`}>
                                            Location selected - click confirm below
                                        </div>
                                    )}
                                    
                                    {selectedLocation && (
                                        <div className={`absolute top-3 left-0 right-0 mx-auto w-max p-2 ${darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800'} text-xs rounded-lg shadow-lg flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            Location confirmed
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={confirmLocation}
                                    disabled={!tempLocation || selectedLocation}
                                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors
                                        ${(!tempLocation || selectedLocation) 
                                            ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                                            : `${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`
                                        }`}
                                >
                                    <div className="flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Confirm Location
                                    </div>
                                </button>

                                {(tempLocation || selectedLocation) && (
                                    <button
                                        type="button"
                                        onClick={removeLocation}
                                        className={`py-2 px-4 text-sm font-medium rounded-md transition-colors
                                            ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                                    >
                                        <div className="flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            Remove
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Address Field */}
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                 Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                placeholder="Street name, Building number, District"
                                required
                            />
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                Address is auto-filled when you confirm a location on the map, but you can edit it for more details
                            </p>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Event Date
                            </label>
                            <input
                                type="date"
                                name="eventDate"
                                value={formData.eventDate}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                required
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                                Additional Requests
                            </label>
                            <textarea
                                name="additionalRequests"
                                value={formData.additionalRequests}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                                placeholder="Any special requirements or requests..."
                            />
                        </div>

                        {/* Payment Methods */}
                        <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6 mb-6`}>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center mb-4`}>Select Payment Method</p>
                            <div className="flex justify-center space-x-6">
                                {/* FIB */}
                                <div className="flex flex-col items-center">
                                    <div 
                                        className={`w-16 h-12 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                                            formData.paymentMethod === 'fib' 
                                            ? 'bg-green-500 ring-2 ring-green-500 ring-offset-2' 
                                            : 'bg-green-500 hover:opacity-90'
                                        } ${darkMode ? 'ring-offset-gray-800' : ''}`}
                                        onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'fib' } })}
                                    >
                                        <span className="text-white font-bold">FIB</span>
                                    </div>
                                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>FIB Bank</span>
                                </div>

                                {/* FastPay */}
                                <div className="flex flex-col items-center">
                                    <div 
                                        className={`w-16 h-12 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                                            formData.paymentMethod === 'fastpay' 
                                            ? 'bg-pink-500 ring-2 ring-pink-500 ring-offset-2' 
                                            : 'bg-pink-500 hover:opacity-90'
                                        } ${darkMode ? 'ring-offset-gray-800' : ''}`}
                                        onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'fastpay' } })}
                                    >
                                        <span className="font-bold text-white">Fast<span className="text-sm">Pay</span></span>
                                    </div>
                                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>FastPay</span>
                                </div>

                                {/* Cash */}
                                <div className="flex flex-col items-center">
                                    <div 
                                        className={`w-16 h-12 rounded-md flex items-center justify-center cursor-pointer transition-all ${
                                            formData.paymentMethod === 'cash' 
                                            ? 'bg-yellow-500 ring-2 ring-yellow-500 ring-offset-2' 
                                            : 'bg-yellow-500 hover:opacity-90'
                                        } ${darkMode ? 'ring-offset-gray-800' : ''}`}
                                        onClick={() => handleChange({ target: { name: 'paymentMethod', value: 'cash' } })}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Cash</span>
                                </div>
                            </div>
                            {formData.paymentMethod === '' && (
                                <p className="text-red-500 text-xs text-center mt-2">Please select a payment method</p>
                            )}

                            {/* Payment Details Section */}
                            {(formData.paymentMethod === 'fib' || formData.paymentMethod === 'fastpay') && (
                                <div className={`mt-6 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                                    <div className="text-center mb-4">
                                        {/* Add Total Price Display */}
                                        <div className={`mb-4 pb-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount to Pay:</p>
                                            <p className="text-2xl font-bold text-pink-500 mt-1">
                                                ${totalPrice.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Please send payment to:</p>
                                        <p className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mt-1`}>
                                            {getPaymentDetails()?.number}
                                        </p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                            {getPaymentDetails()?.name}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                            Upload Payment Proof
                                        </label>
                                        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'} border-dashed rounded-md hover:border-orange-500 transition-colors`}>
                                            <div className="space-y-1 text-center">
                                                <svg
                                                    className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
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
                                                <div className={`flex text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                                                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
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
