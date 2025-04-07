import Cover from "./cover";
import Navbar from "./navbar";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";

const Event = () => {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigate = useNavigate();

    const categories = ['All', 'Birthday', 'Wedding', 'Gender Reveal', 'Easter', 'Graduation'];

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:3001/posts');
                // Filter only non-special posts
                const regularPosts = response.data.filter(post => !post.isSpecial);
                setPosts(regularPosts);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, []);

    const handleViewDetails = (postId) => {
        navigate(`/event/${postId}`);
    };

    const filteredPosts = selectedCategory === 'All' 
        ? posts 
        : posts.filter(post => post.category === selectedCategory);

    return (
        <div className="pt-16">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Events</h2>

                {/* Category Filter */}
                <div className="mb-8 bg-white rounded-lg shadow p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Filter by Category</h3>
                        <div className="mt-2 md:mt-0">
                            <button 
                                onClick={() => setSelectedCategory('All')}
                                className="text-sm text-pink-600 hover:text-pink-800 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset Filter
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                        selectedCategory === category
                                            ? 'bg-pink-500 text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-pink-50 border border-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Active Filter Summary */}
                    {selectedCategory !== 'All' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center">
                                <span className="text-sm text-gray-500 mr-2">Active Filter:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                    Category: {selectedCategory}
                                    <button 
                                        onClick={() => setSelectedCategory('All')}
                                        className="ml-1 text-pink-600 hover:text-pink-800"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((value, key) => (
                        <div key={key} className="bg-white rounded-lg shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                            <div className="relative">
                                <img 
                                    src={value.image} 
                                    alt={value.title} 
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <button 
                                        onClick={() => handleViewDetails(value.id)}
                                        className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {value.title}
                                    </h3>
                                    <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {value.category}
                                    </span>
                                </div>
                                <div className="flex justify-end items-center mt-4">
                                    <span className="text-pink-600 font-semibold">{value.priceText}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <Footer />
        </div>
    );
}

export default Event;