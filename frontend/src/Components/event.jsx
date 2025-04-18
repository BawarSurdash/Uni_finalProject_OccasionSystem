import Cover from "./cover";
import Navbar from "./navbar";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import PostRating from "./PostRating";
import { useTheme } from '../contexts/ThemeContext';

const Event = () => {
    const [posts, setPosts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 9;
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const categories = ['All', 'Birthday', 'Wedding', 'Gender Reveal', 'Easter', 'Graduation'];

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:3001/posts');
                // Filter non-special posts
                const nonSpecial = response.data.filter(post => !post.isSpecial);
                setPosts(nonSpecial);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, []);

    const handleViewEvent = (postId) => {
        navigate(`/event/${postId}`);
    };

    const filteredPosts = selectedCategory === 'All' 
        ? posts 
        : posts.filter(post => post.category === selectedCategory);
        
    // Calculate pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // Change page
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo(0, 0);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo(0, 0);
        }
    };

    return (    
        <div className={`pt-16 ${darkMode ? 'bg-gray-900' : ''}`}>
            <Navbar/>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className={`text-3xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'} mb-8`}>Latest Events</h2>
                
                {/* Category Filter */}
                <div className={`mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <h3 className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Filter by Category</h3>
                        <div className="mt-2 md:mt-0">
                            <button 
                                onClick={() => {
                                    setSelectedCategory('All');
                                    setCurrentPage(1);
                                }}
                                className="text-sm text-orange-600 hover:text-orange-800 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset Filter
                            </button>
                        </div>
                    </div>
                    
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setCurrentPage(1);
                                    }}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                        selectedCategory === category
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : darkMode 
                                              ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500' 
                                              : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Active Filter Summary */}
                    {selectedCategory !== 'All' && (
                        <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-center">
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-2`}>Active Filter:</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Category: {selectedCategory}
                                    <button 
                                        onClick={() => {
                                            setSelectedCategory('All');
                                            setCurrentPage(1);
                                        }}
                                        className="ml-1 text-orange-600 hover:text-orange-800"
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
                    {currentPosts.map((post) => (
                        <div key={post.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-md`}>
                            <div className="aspect-w-16 aspect-h-12">
                                <img 
                                    src={post.image} 
                                    alt={post.title}
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{post.title}</h3>
                                    <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {post.category}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <PostRating postId={post.id} />
                                </div>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 h-12 overflow-hidden`}>
                                    {post.description}
                                </p>
                                <div className={`flex items-center justify-between mb-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <div className="flex items-center">
                                        <span>{post.date}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span>{post.location}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleViewEvent(post.id)}
                                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
                                >
                                    View Event
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Pagination Controls */}
                {filteredPosts.length > postsPerPage && (
                    <div className="mt-10 flex justify-between items-center">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded-md ${
                                currentPage === 1
                                    ? `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            }`}
                        >
                            Previous Page
                        </button>
                        
                        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Page {currentPage} of {totalPages}
                        </div>
                        
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 rounded-md ${
                                currentPage === totalPages
                                    ? `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                        >
                            Next Page
                        </button>
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
     );
}
 
export default Event;