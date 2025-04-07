import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from "./navbar";

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const availableAddons = [
        { id: 1, name: 'Candle Package', priceAdjustment: 15, description: 'Set of 24 elegant decorative candles' },
        { id: 2, name: 'Balloon Bundle', priceAdjustment: 10, description: '30 premium balloons in your choice of colors' },
        { id: 3, name: 'Premium Flowers', priceAdjustment: 25, description: 'Luxury floral arrangements for your event' }
    ];

    const [selectedAddons, setSelectedAddons] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

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
            if (post) {
                const newTotal = calculateTotalPrice(post.basePrice, newSelection);
                setTotalPrice(newTotal);
            }
            
            return newSelection;
        });
    };

    // Update total price when post loads
    useEffect(() => {
        if (post) {
            const newTotal = calculateTotalPrice(post.basePrice, selectedAddons);
            setTotalPrice(newTotal);
        }
    }, [post]);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3001/posts/${id}`);
                setPost(response.data);
                
                // Fetch related events
                const allPosts = await axios.get('http://localhost:3001/posts');
                // Filter related events by category, excluding the current event and special posts
                const related = allPosts.data.filter(
                    event => event.category === response.data.category && 
                             event.id !== parseInt(id) && 
                             !event.isSpecial
                );
                setRelatedEvents(related);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching event details:', error);
                setError('Failed to load event details');
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    const handleBackToEvents = () => {
        navigate('/events');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="text-red-500 text-xl">{error}</div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="text-gray-500 text-xl">Event not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <Navbar />
            
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <button 
                    onClick={handleBackToEvents}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Events
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="md:flex">
                        {/* Left side - Image */}
                        <div className="md:w-1/2">
                            <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full h-[500px] object-cover"
                            />
                        </div>

                        {/* Right side - Details */}
                        <div className="md:w-1/2 p-6 md:p-8">
                            {/* Category Badge */}
                            <div className="mb-4">
                                <span className="bg-pink-100 text-pink-800 text-xs font-medium px-3 py-1 rounded-full">
                                    {post.category}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {post.title}
                            </h1>

                            {/* Description */}
                            <div className="mb-6">
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    {post.description}
                                </p>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <p className="text-gray-900 text-xl">
                                    <span className="text-pink-500 font-semibold">Base Price: </span>
                                    ${post.basePrice}
                                </p>
                            </div>

                            {/* Add-ons Section */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Enhance Your Event</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {availableAddons.map(addon => (
                                        <div 
                                            key={addon.id} 
                                            onClick={() => toggleAddon(addon.id)}
                                            className={`relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                                selectedAddons.includes(addon.id)
                                                ? 'bg-pink-50 border-2 border-pink-400 shadow-sm'
                                                : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAddons.includes(addon.id)}
                                                    onChange={() => toggleAddon(addon.id)}
                                                    className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded mt-1"
                                                />
                                                <div className="ml-2">
                                                    <p className="font-medium text-gray-900 text-sm">{addon.name}</p>
                                                    <p className="text-xs text-gray-500">{addon.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-pink-500 font-medium text-sm">
                                                    +${((parseFloat(post.basePrice) || 0) * (addon.priceAdjustment / 100)).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Price - Simplified */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500">Base Price</p>
                                        <p className="text-lg font-medium">${parseFloat(post.basePrice).toFixed(2)}</p>
                                    </div>
                                    {selectedAddons.length > 0 && (
                                        <div className="text-right space-y-1">
                                            <p className="text-sm text-gray-500">Add-ons</p>
                                            <p className="text-lg font-medium text-pink-500">
                                                +${(totalPrice - parseFloat(post.basePrice)).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {selectedAddons.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <p className="text-lg font-semibold">Total</p>
                                            <p className="text-2xl font-bold text-pink-500">${totalPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Book Event Button */}
                            <button 
                                onClick={() => navigate(`/book/${id}`, {
                                    state: {
                                        selectedAddons,
                                        totalPrice,
                                        basePrice: post.basePrice
                                    }
                                })}
                                className="w-full bg-pink-500 text-white py-4 rounded-lg hover:bg-pink-600 transition duration-300 text-lg font-semibold shadow-md"
                            >
                                Book This Event
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Events Section */}
                {relatedEvents.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Events</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedEvents.map((event) => (
                                <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="relative">
                                        <img 
                                            src={event.image} 
                                            alt={event.title} 
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2 py-1 rounded-full">
                                                {event.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-pink-500 font-semibold">{event.priceText}</span>
                                            <button 
                                                onClick={() => navigate(`/eventdetail/${event.id}`)}
                                                className="text-pink-500 hover:text-pink-700 font-medium"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetail;