import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Signup = ({ darkMode }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let error = '';
        switch(name) {
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
                break;
            case 'password':
                if (value.length < 8) error = 'Password must be at least 8 characters';
                break;
            case 'confirmPassword':
                if (value !== formData.password) error = 'Passwords do not match';
                break;
            case 'username':
                if (value.length < 4) error = 'Username must be at least 4 characters';
                break;
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:3001/auth', formData);
            if(response.status === 200) {
                navigate('/login', { state: { successMessage: 'Account created successfully!' } });
            }
        } catch (error) {
            setErrors({
                server: error.response?.data?.message || 'Registration failed. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} flex items-center justify-center p-4`}>
            <div className={`w-full max-w-md ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl shadow-sm p-8`}>
                <div className="text-center mb-8">
                    <h1 className={`text-3xl font-normal ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>Create Account</h1>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Get started with your free account</p>
                </div>

                {errors.server && (
                    <div className={`mb-4 p-3 text-sm text-red-700 ${darkMode ? 'bg-red-900/30' : 'bg-red-50'} rounded-lg`}>
                        {errors.server}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <input
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Username"
                            className={`w-full px-4 py-3 border-b-2 focus:outline-none ${
                                darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-orange-400' 
                                : 'border-gray-200 focus:border-orange-500'
                            }`}
                            style={darkMode ? { backgroundColor: '#374151', color: 'white' } : {}}
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    <div>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email address"
                            className={`w-full px-4 py-3 border-b-2 focus:outline-none ${
                                darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-orange-400' 
                                : 'border-gray-200 focus:border-orange-500'
                            }`}
                            style={darkMode ? { backgroundColor: '#374151', color: 'white' } : {}}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className={`w-full px-4 py-3 border-b-2 focus:outline-none ${
                                darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-orange-400' 
                                : 'border-gray-200 focus:border-orange-500'
                            }`}
                            style={darkMode ? { backgroundColor: '#374151', color: 'white' } : {}}
                        />
                    </div>

                    <div>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className={`w-full px-4 py-3 border-b-2 focus:outline-none ${
                                darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400 focus:border-orange-400' 
                                : 'border-gray-200 focus:border-orange-500'
                            }`}
                            style={darkMode ? { backgroundColor: '#374151', color: 'white' } : {}}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 ${
                            darkMode 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-orange-500 hover:bg-orange-600'
                        } text-white rounded-lg transition-colors disabled:opacity-50`}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Already have an account?{' '}
                    <Link 
                        to="/login" 
                        className={`${
                            darkMode 
                            ? 'text-orange-400 hover:text-orange-300' 
                            : 'text-orange-500 hover:text-orange-600'
                        } font-medium`}
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
