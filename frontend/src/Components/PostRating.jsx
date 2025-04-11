import { useState, useEffect } from 'react';
import axios from 'axios';

const PostRating = ({ postId }) => {
    const [rating, setRating] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRating = async () => {
            try {
                console.log(`Fetching rating for post ${postId}`);
                const response = await axios.get(`http://localhost:3001/feedback/post/${postId}/stats`);
                console.log('Rating response:', response.data);
                
                // Handle the case when averageRating is NaN or null
                const avgRating = parseFloat(response.data.averageRating);
                setRating(isNaN(avgRating) ? 0 : avgRating);
                setCount(response.data.totalCount);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching rating:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        if (postId) {
            fetchRating();
        }
    }, [postId]);

    // Helper function to render stars
    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => (
            <svg 
                key={star} 
                className={`w-4 h-4 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    if (loading) {
        return <div className="flex h-5 items-center">
            <div className="w-4 h-4 border-t-2 border-b-2 border-gray-300 rounded-full animate-spin"></div>
        </div>;
    }

    if (error) {
        return <div className="text-xs text-gray-400">No ratings</div>;
    }

    if (count === 0) {
        return <div className="text-xs text-gray-400">No ratings yet</div>;
    }

    return (
        <div className="flex items-center">
            <div className="flex mr-1">
                {renderStars()}
            </div>
            <span className="text-xs text-gray-500">({count})</span>
        </div>
    );
};

export default PostRating; 