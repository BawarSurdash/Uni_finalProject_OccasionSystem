import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './navbar';
import axios from 'axios';
import { Rate, Button, Input, message } from 'antd';
import { useTheme } from '../contexts/ThemeContext';

const BookingSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = useLocation();
    const { darkMode } = useTheme();
    
    // Extract details from state if available
    const initialPostId = state?.postId || state?.bookingData?.postId;
    const bookingId = state?.bookingId || state?.bookingData?.id;
    
    const [postId, setPostId] = useState(initialPostId);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState(null);
    
    // Fetch the most recent booking if state is not available
    useEffect(() => {
        const fetchRecentBooking = async () => {
            if (postId) return; // Already have postId from state
            
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    setAuthError("You are not logged in. Please log in to view booking details.");
                    return;
                }
                
                // Get user's bookings
                const response = await axios.get('http://localhost:3001/booking', {
                    headers: { accessToken: token }
                });
                
                if (response.data && response.data.length > 0) {
                    // Get the most recent booking
                    const latestBooking = response.data[0];
                    setBookingDetails(latestBooking);
                    setPostId(latestBooking.Post?.id);
                    console.log("Found recent booking:", latestBooking);
                }
            } catch (error) {
                console.error("Error fetching recent booking:", error);
                message.error("Failed to load your booking information");
            } finally {
                setLoading(false);
            }
        };
        
        // Add fade-in animation for elements
        const elements = document.querySelectorAll('.animate-fade-in');
        elements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
        });
        
        // Debug state data
        console.log("BookingSuccess state data:", state);
        console.log("PostId from state:", postId);
        
        // Check if we need to fetch booking details
        if (!initialPostId) {
            fetchRecentBooking();
        }
        
        // Check authentication on load
        const token = localStorage.getItem('token');
        if (!token) {
            setAuthError("You are not logged in. Please log in to submit feedback.");
            console.warn("No authentication token found");
        }
    }, [state, initialPostId]);
    
    // Check if feedback has already been submitted for this post
    useEffect(() => {
        const checkExistingFeedback = async () => {
            if (!postId) return;
            
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                // Get user's feedback
                const response = await axios.get('http://localhost:3001/feedback/user', {
                    headers: { accessToken: token }
                });
                
                if (response.data && response.data.length > 0) {
                    // Check if user has already submitted feedback for this post
                    const feedback = response.data.find(f => f.PostId === postId);
                    if (feedback) {
                        console.log("Found existing feedback:", feedback);
                        setExistingFeedback(feedback);
                        setFeedbackSubmitted(true);
                        // Pre-fill the form with existing feedback
                        setRating(feedback.rating);
                        setComment(feedback.comment || '');
                    }
                }
            } catch (error) {
                console.error("Error checking existing feedback:", error);
            }
        };
        
        checkExistingFeedback();
    }, [postId]);
    
    const handleSubmitFeedback = async () => {
        if (rating === 0) {
            message.warning('Please provide a rating');
            return;
        }
        
        if (!postId) {
            message.error('Unable to identify which service you booked');
            return;
        }
        
        if (feedbackSubmitted) {
            message.info('You have already submitted feedback for this booking');
            return;
        }
        
        // Debug check for token
        const token = localStorage.getItem('token');
        if (!token) {
            message.error('You need to be logged in to submit feedback');
            console.error('No authentication token found');
            setAuthError("Authentication failed. Please log in and try again.");
            return;
        }
        
        console.log('Submitting feedback with postId:', postId);
        setIsSubmitting(true);
        
        try {
            // Submit feedback to the API
            console.log('Sending request to:', 'http://localhost:3001/feedback');
            console.log('With data:', { rating, comment, postId });
            console.log('Auth token (first 10 chars):', token.substring(0, 10) + '...');
            
            const response = await axios.post(
                'http://localhost:3001/feedback',
                { rating, comment, postId },
                { headers: { accessToken: token } }
            );
            
            console.log('Response received:', response.data);
            
            if (response.data.success) {
                message.success('Thank you for your feedback!');
                setFeedbackSubmitted(true);
                setExistingFeedback(response.data.feedback);
            } else {
                message.error(response.data.message || 'Failed to submit feedback');
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            // More detailed error logging
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                
                if (error.response.status === 401) {
                    setAuthError("Authentication failed. Please log in and try again.");
                }
            }
            message.error('Failed to submit feedback: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Custom styles for Ant Design components in dark mode
    const getTextAreaStyles = () => {
        if (darkMode) {
            return {
                backgroundColor: '#1f2937',
                color: '#e5e7eb',
                borderColor: '#4b5563',
                caretColor: '#ffffff',
            };
        }
        return {};
    };
    
    // Display loading state while fetching booking
    if (loading) {
        return (
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8 md:p-12`}>
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your booking details...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-8 md:p-12`}>
                    <div className="mb-8 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center animate-pulse">
                            <svg className="w-10 h-10 text-green-500 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 animate-fade-in`}>Booking Confirmed!</h1>
                    
                    <div className="mt-6 mb-8 animate-fade-in">
                        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                            Thank you for your booking. We've received your request and will contact you shortly with confirmation details.
                        </p>
                        <p className={`text-md ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            A confirmation email has been sent to your registered email address.
                        </p>
                    </div>
                    
                    {bookingDetails && (
                        <div className={`p-5 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-xl mb-8 max-w-lg mx-auto animate-fade-in`}>
                            <h3 className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>Booking Details</h3>
                            <div className={`text-left ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                                <p><span className="font-medium">Service:</span> {bookingDetails.Post?.title || 'N/A'}</p>
                                <p><span className="font-medium">Booking ID:</span> #{bookingDetails.id}</p>
                                <p><span className="font-medium">Date:</span> {new Date(bookingDetails.eventDate).toLocaleDateString()}</p>
                                <p><span className="font-medium">Total:</span> ${bookingDetails.totalPrice}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className={`p-5 ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'} rounded-xl mb-8 max-w-lg mx-auto animate-fade-in`}>
                        <h3 className={`font-medium ${darkMode ? 'text-orange-300' : 'text-orange-800'} mb-2`}>What happens next?</h3>
                        <ul className={`text-left ${darkMode ? 'text-orange-300' : 'text-orange-700'} space-y-2`}>
                            <li className="flex items-start animate-slide-in">
                                <svg className="w-5 h-5 mr-2 mt-0.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Our team will review your booking details
                            </li>
                            <li className="flex items-start animate-slide-in" style={{animationDelay: "0.2s"}}>
                                <svg className="w-5 h-5 mr-2 mt-0.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                You'll receive a confirmation call or message
                            </li>
                            <li className="flex items-start animate-slide-in" style={{animationDelay: "0.4s"}}>
                                <svg className="w-5 h-5 mr-2 mt-0.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Your booking will be marked as confirmed
                            </li>
                        </ul>
                    </div>
                    
                    <div className={`mt-8 p-6 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-sm animate-fade-in`}>
                        <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : ''}`}>Share Your Feedback (Optional)</h3>
                        
                        {authError && (
                            <div className={`mb-4 p-3 ${darkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700'} rounded-md text-sm`}>
                                {authError}
                            </div>
                        )}
                        
                        {feedbackSubmitted ? (
                            <div className={`mb-4 p-3 ${darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700'} rounded-md`}>
                                <p className="font-medium mb-1">Thank you for your feedback!</p>
                                <p className="text-sm">You rated this service {existingFeedback?.rating || rating} out of 5 stars.</p>
                                {(existingFeedback?.comment || comment) && (
                                    <div className={`mt-2 text-sm ${darkMode ? 'bg-gray-800 border-green-900' : 'bg-white border-green-100'} p-3 rounded border`}>
                                        "{existingFeedback?.comment || comment}"
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="max-w-md mx-auto">
                                <div className="mb-4">
                                    <span className={`block text-sm mb-2 ${darkMode ? 'text-gray-300' : ''}`}>How would you rate your experience?</span>
                                    <Rate 
                                        value={rating}
                                        onChange={setRating}
                                        className="text-2xl"
                                        allowClear
                                    />
                                </div>
                                
                                <Input.TextArea
                                    rows={3}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Any additional comments..."
                                    className={`mb-4 ${darkMode ? 'textarea-dark' : ''}`}
                                    maxLength={200}
                                    style={getTextAreaStyles()}
                                />
                                
                                <Button
                                    type="primary"
                                    onClick={handleSubmitFeedback}
                                    loading={isSubmitting}
                                    disabled={isSubmitting || !!authError || !postId}
                                    className="w-full"
                                >
                                    Submit Feedback
                                </Button>
                                
                                {postId && (
                                    <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        Submitting feedback for service ID: {postId}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-center gap-4 mt-8 animate-fade-in">
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors animate-bounce-subtle"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
                
                {/* Support Section */}
                <div className={`mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'} animate-fade-in`}>
                    <p>Need help? Contact our support team at <span className="text-orange-500 font-medium">support@example.com</span></p>
                </div>
            </div>
            
            {/* Add CSS for animations */}
            <style jsx="true">{`
                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                
                @keyframes scaleIn {
                    0% { transform: scale(0); }
                    70% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                @keyframes slideIn {
                    0% { transform: translateX(-20px); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes bounceSlight {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                
                .animate-fade-in {
                    opacity: 0;
                    animation: fadeIn 0.8s ease-in-out forwards;
                }
                
                .animate-scale-in {
                    animation: scaleIn 0.7s ease-out forwards;
                }
                
                .animate-slide-in {
                    opacity: 0;
                    animation: slideIn 0.5s ease-out forwards;
                }
                
                .animate-bounce-subtle {
                    animation: bounceSlight 2s infinite;
                    animation-delay: 1s;
                }
                
                .textarea-dark,
                .textarea-dark .ant-input {
                    background-color: #1f2937 !important;
                    color: #e5e7eb !important;
                    border-color: #4b5563 !important;
                }
                
                .textarea-dark::placeholder,
                .textarea-dark .ant-input::placeholder {
                    color: rgba(156, 163, 175, 0.8) !important;
                }
            `}</style>
        </div>
    );
};

export default BookingSuccess;