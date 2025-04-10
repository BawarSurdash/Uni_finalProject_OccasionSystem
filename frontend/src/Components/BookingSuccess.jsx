import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';

const BookingSuccess = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Add fade-in animation for elements
        const elements = document.querySelectorAll('.animate-fade-in');
        elements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.2}s`;
        });
    }, []);
    
    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                    <div className="mb-8 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center animate-pulse">
                            <svg className="w-10 h-10 text-green-500 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in">Booking Confirmed!</h1>
                    
                    <div className="mt-6 mb-8 animate-fade-in">
                        <p className="text-lg text-gray-700 mb-4">
                            Thank you for your booking. We've received your request and will contact you shortly with confirmation details.
                        </p>
                        <p className="text-md text-gray-600">
                            A confirmation email has been sent to your registered email address.
                        </p>
                    </div>
                    
                    <div className="p-5 bg-orange-50 rounded-xl mb-8 max-w-lg mx-auto animate-fade-in">
                        <h3 className="font-medium text-orange-800 mb-2">What happens next?</h3>
                        <ul className="text-left text-orange-700 space-y-2">
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
                <div className="mt-8 text-gray-600 animate-fade-in">
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
            `}</style>
        </div>
    );
};

export default BookingSuccess; 