import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const FeedbackByStars = ({ postId }) => {
    const { darkMode } = useTheme();
    const [feedbackStats, setFeedbackStats] = useState({
        averageRating: 0,
        totalCount: 0,
        starCounts: {
            1: { count: 0, percentage: 0 },
            2: { count: 0, percentage: 0 },
            3: { count: 0, percentage: 0 },
            4: { count: 0, percentage: 0 },
            5: { count: 0, percentage: 0 }
        }
    });
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);

    useEffect(() => {
        const fetchFeedbackStats = async () => {
            try {
                setLoading(true);
                console.log(`Fetching feedback stats for post ${postId}`);
                
                // First get all feedback to make sure the basic call works
                const allFeedbackResponse = await axios.get(`http://localhost:3001/feedback/post/${postId}`);
                console.log('All feedback response:', allFeedbackResponse.data);
                setFeedbacks(allFeedbackResponse.data);
                
                // Then get the stats
                const statsResponse = await axios.get(`http://localhost:3001/feedback/post/${postId}/stats`);
                console.log('Stats response:', statsResponse.data);
                setFeedbackStats(statsResponse.data);
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching feedback stats:', error);
                setError(`Failed to load feedback data: ${error.message}`);
                setLoading(false);
            }
        };

        if (postId) {
            fetchFeedbackStats();
        }
    }, [postId]);

    const handleFilterByRating = async (rating) => {
        try {
            setLoading(true);
            console.log(`Filtering by ${rating} stars`);
            
            // If clicking the already selected rating, reset to show all
            if (selectedRating === rating) {
                setSelectedRating(null);
                const allFeedbackResponse = await axios.get(`http://localhost:3001/feedback/post/${postId}`);
                console.log('Reset filter - all feedback:', allFeedbackResponse.data);
                setFeedbacks(allFeedbackResponse.data);
            } else {
                setSelectedRating(rating);
                const response = await axios.get(`http://localhost:3001/feedback/post/${postId}/stars/${rating}`);
                console.log(`${rating} star feedback:`, response.data);
                setFeedbacks(response.data);
            }
            
            setLoading(false);
        } catch (error) {
            console.error('Error filtering feedback by rating:', error);
            setError(`Failed to filter feedback: ${error.message}`);
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Helper function to render stars
    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <svg 
                key={star} 
                className={`w-5 h-5 ${parseFloat(rating) >= star ? 'text-yellow-400' : darkMode ? 'text-gray-600' : 'text-gray-300'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    if (loading) {
        return (
            <div className="my-8">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-8">
                <div className="bg-red-50 p-4 rounded-md text-red-500">{error}</div>
            </div>
        );
    }

    // Handle case when there are no feedback entries
    if (feedbackStats.totalCount === 0) {
        return (
            <div className="my-8">
                <div className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'} p-6 rounded-lg text-center`}>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-700'} mb-2`}>No Feedback Yet</h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Be the first to leave a review for this event.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-8">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Customer Feedback</h2>
            
            {/* Overall Rating Summary */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
                <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                        <div className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feedbackStats.averageRating}</div>
                        <div className="flex mt-2 justify-center md:justify-start">
                            {renderStars(feedbackStats.averageRating)}
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Based on {feedbackStats.totalCount} ratings</div>
                    </div>
                    
                    <div className="w-full md:w-2/3">
                        {/* Star Rating Bars */}
                        {[5, 4, 3, 2, 1].map((star) => {
                            const starCount = feedbackStats.starCounts[star] || { count: 0, percentage: 0 };
                            return (
                                <div 
                                    key={star} 
                                    className={`flex items-center mb-2 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} p-1 rounded-md transition-colors`}
                                    onClick={() => handleFilterByRating(star)}
                                >
                                    <div className="flex items-center w-16">
                                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{star} stars</span>
                                    </div>
                                    <div className="flex-1 mx-4">
                                        <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2.5`}>
                                            <div 
                                                className={`bg-yellow-400 h-2.5 rounded-full ${selectedRating === star ? 'bg-pink-500' : ''}`}
                                                style={{ width: `${starCount.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="w-16 text-right">
                                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {starCount.count} ({starCount.percentage}%)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {selectedRating && (
                            <div className="mt-4 text-center">
                                <button 
                                    onClick={() => handleFilterByRating(selectedRating)}
                                    className="text-sm text-pink-600 hover:text-pink-800 underline"
                                >
                                    Clear Filter
                                </button>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                    Showing {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'} with {selectedRating} {selectedRating === 1 ? 'star' : 'stars'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Feedback List */}
            <div className="space-y-4">
                {feedbacks.length === 0 ? (
                    <div className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-500'} p-6 rounded-lg text-center`}>
                        <p>No reviews found with this filter.</p>
                    </div>
                ) : (
                    feedbacks.map((feedback) => (
                        <div key={feedback.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feedback.User?.username || 'Anonymous'}</h3>
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{formatDate(feedback.createdAt)}</p>
                                </div>
                                <div className="flex">
                                    {renderStars(feedback.rating)}
                                </div>
                            </div>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feedback.comment || "No comment provided."}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeedbackByStars; 