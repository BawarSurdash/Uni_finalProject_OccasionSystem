import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/imgs/logo.png';
import { CgProfile } from "react-icons/cg";
import { useState, useEffect } from 'react';
import { HiMenu, HiX } from "react-icons/hi";
import { BsBell } from "react-icons/bs";
import { RiDashboardLine } from "react-icons/ri";
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { darkMode } = useTheme();
    
    // Force a refresh of admin status
    const refreshAdminStatus = () => {
        // Clear cached role to force a fresh check
        localStorage.removeItem('userRole');
        checkIfAdmin();
    };

    // Check auth status on component mount and whenever the component renders
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        if (token) {
            fetchUnreadCount();
            checkIfAdmin();
        } else {
            // Clear any admin status if no token
            setIsAdmin(false);
            localStorage.removeItem('userRole');
        }
        
        // Set up an event listener for role changes
        window.addEventListener('user-role-change', refreshAdminStatus);
        
        return () => {
            window.removeEventListener('user-role-change', refreshAdminStatus);
        };
    }, []);

    // Check if user is admin - always fetch fresh data
    const checkIfAdmin = async () => {
        setIsAdmin(false); // Reset admin status during check
        
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Try profile endpoint first
            try {
                const response = await axios.get('http://localhost:3001/auth/profile', {
                    headers: { accessToken: token }
                });
                
                if (response.data && response.data.role) {
                    const isAdminRole = response.data.role.toLowerCase() === 'admin' || 
                                      response.data.role.toLowerCase() === 'super admin';
                    
                    setIsAdmin(isAdminRole);
                    localStorage.setItem('userRole', response.data.role);
                    return;
                }
            } catch (profileError) {
                console.error('Error checking admin status with profile endpoint:', profileError);
            }

            // Fallback to user endpoint if profile fails
            try {
                const userResponse = await axios.get('http://localhost:3001/auth/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (userResponse.data && userResponse.data.role) {
                    const isAdminRole = userResponse.data.role.toLowerCase() === 'admin' || 
                                      userResponse.data.role.toLowerCase() === 'super admin';
                    
                    setIsAdmin(isAdminRole);
                    localStorage.setItem('userRole', userResponse.data.role);
                }
            } catch (userError) {
                console.error('Error checking user endpoint:', userError);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    };

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/notification/user/unread-count', {
                headers: { accessToken: token }
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread notifications count:', error);
        }
    };

    // Poll for unread notifications every 30 seconds
    useEffect(() => {
        if (!isLoggedIn) return;
        
        const interval = setInterval(() => {
            fetchUnreadCount();
            
            // Also refresh admin status periodically
            checkIfAdmin();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [isLoggedIn]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className={`${darkMode ? 'bg-[#101828] !shadow-lg' : 'bg-white shadow-md'} fixed w-full top-0 left-0 z-50 transition-colors duration-300`} style={darkMode ? {backgroundColor: '#101828'} : {}}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center">
                            <img src={logo} alt="Logo" className="h-25 w-32 object-contain hover:opacity-80 transition-opacity duration-300" />
                        </Link>
                    </div>

                    {/* Burger Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className={`${darkMode ? '!text-white hover:!text-white' : 'text-gray-700 hover:text-orange-500'} focus:outline-none transition-colors duration-300`}
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            {isOpen ? (
                                <HiX className="h-6 w-6" />
                            ) : (
                                <HiMenu className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Desktop Navigation Links - Unified Animation */}
                    <div className="hidden md:flex flex-grow items-center justify-center space-x-8">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive 
                                        ? darkMode ? '!text-white !font-bold' : 'text-orange-500' 
                                        : darkMode 
                                            ? '!text-white hover:!text-white' 
                                            : 'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                Home
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/about" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive 
                                        ? darkMode ? '!text-white !font-bold' : 'text-orange-500' 
                                        : darkMode 
                                            ? '!text-white hover:!text-white' 
                                            : 'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                About Us
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/events" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive 
                                        ? darkMode ? '!text-white !font-bold' : 'text-orange-500' 
                                        : darkMode 
                                            ? '!text-white hover:!text-white' 
                                            : 'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                Latest Events
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/services" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive 
                                        ? darkMode ? '!text-white !font-bold' : 'text-orange-500' 
                                        : darkMode 
                                            ? '!text-white hover:!text-white' 
                                            : 'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                Services
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/contact" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive 
                                        ? darkMode ? '!text-white !font-bold' : 'text-orange-500' 
                                        : darkMode 
                                            ? '!text-white hover:!text-white' 
                                            : 'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                Contact
                            </span>
                        </NavLink>
                        {/* Dashboard Link - Only show if user is admin */}
                        {isLoggedIn && isAdmin && (
                            <NavLink 
                                to="/dashboard" 
                                className={({ isActive }) => 
                                    `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                        isActive 
                                            ? darkMode ? '!text-white !font-bold' : 'text-orange-500' 
                                            : darkMode 
                                                ? '!text-white hover:!text-white' 
                                                : 'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                    }`
                                }
                                style={darkMode ? {color: 'white'} : {}}
                            >
                                <span className="flex items-center">
                                    <RiDashboardLine className="mr-1" />
                                    <span className="block transition-all duration-300 hover:skew-y-2">
                                        Dashboard
                                    </span>
                                </span>
                            </NavLink>
                        )}
                    </div>

                    {/* Auth Buttons - Unified Scale Effect */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!isLoggedIn && (
                            <>
                                <Link 
                                    to="/login" 
                                    className={`relative overflow-hidden ${
                                        darkMode 
                                            ? '!text-white hover:bg-gray-700 hover:border-gray-600' 
                                            : 'text-gray-700 hover:bg-orange-50 hover:border-orange-200'
                                    } px-4 py-2 text-sm font-medium
                                    transition-all duration-300 hover:scale-[1.02] rounded-md
                                    border border-transparent`}
                                    style={darkMode ? {color: 'white'} : {}}
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium
                                    transition-all duration-300 hover:bg-orange-600 hover:scale-[1.02]
                                    shadow-md hover:shadow-orange-200"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                        {isLoggedIn && (
                            <div className="flex items-center space-x-4">
                                <span className={`text-sm font-medium ${darkMode ? '!text-white' : 'text-gray-600'} transition-colors duration-300`} style={darkMode ? {color: 'white'} : {}}>
                                    {localStorage.getItem('username')}
                                </span>
                                
                                <div className="flex items-center">
                                    <div className="relative">
                                        <Link
                                            to="/profile?tab=notifications"
                                            className={`flex items-center ${
                                                darkMode ? '!text-white hover:!text-white' : 'text-gray-700 hover:text-orange-500'
                                            } transition-all duration-300`}
                                            style={darkMode ? {color: 'white'} : {}}
                                        >
                                            <BsBell className="w-5 h-5 transform transition-all duration-300 hover:scale-125 hover:rotate-12" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </Link>
                                    </div>
                                    
                                    <Link 
                                        to="/profile" 
                                        className={`flex items-center ml-2 ${
                                            darkMode ? '!text-white hover:!text-white' : 'text-gray-700 hover:text-orange-500'
                                        } transition-all duration-300 hover:rotate-[15deg]`}
                                        style={darkMode ? {color: 'white'} : {}}
                                    >
                                        <CgProfile className="w-6 h-6" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu - Subtle Background Transition */}
                <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                    <div className={`px-2 pt-2 pb-3 space-y-1 ${darkMode ? 'bg-[#101828] !border-gray-700' : 'bg-white border-gray-200'} border-t transition-colors duration-300`} style={darkMode ? {backgroundColor: '#101828', borderColor: '#374151'} : {}}>
                        <Link 
                            to="/" 
                            className={`block px-3 py-2 text-base font-medium ${
                                darkMode 
                                    ? '!text-white hover:bg-gray-700 hover:!text-white hover:border-gray-300' 
                                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500'
                            } transition-all duration-300 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent`}
                            onClick={toggleMenu}
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            Home
                        </Link>
                        <Link 
                            to="/about" 
                            className={`block px-3 py-2 text-base font-medium ${
                                darkMode 
                                    ? '!text-white hover:bg-gray-700 hover:!text-white hover:border-gray-300' 
                                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500'
                            } transition-all duration-300 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent`}
                            onClick={toggleMenu}
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            About Us
                        </Link>
                        <Link 
                            to="/events" 
                            className={`block px-3 py-2 text-base font-medium ${
                                darkMode 
                                    ? '!text-white hover:bg-gray-700 hover:!text-white hover:border-gray-300' 
                                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500'
                            } transition-all duration-300 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent`}
                            onClick={toggleMenu}
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            Latest Events
                        </Link>
                        <Link 
                            to="/services" 
                            className={`block px-3 py-2 text-base font-medium ${
                                darkMode 
                                    ? '!text-white hover:bg-gray-700 hover:!text-white hover:border-gray-300' 
                                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500'
                            } transition-all duration-300 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent`}
                            onClick={toggleMenu}
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            Services
                        </Link>
                        <Link 
                            to="/contact" 
                            className={`block px-3 py-2 text-base font-medium ${
                                darkMode 
                                    ? '!text-white hover:bg-gray-700 hover:!text-white hover:border-gray-300' 
                                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500'
                            } transition-all duration-300 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent`}
                            onClick={toggleMenu}
                            style={darkMode ? {color: 'white'} : {}}
                        >
                            Contact
                        </Link>
                        {!isLoggedIn && (
                            <>
                                <Link 
                                    to="/login" 
                                    className={`block px-3 py-2 text-base font-medium ${
                                        darkMode 
                                            ? '!text-white hover:bg-gray-700 hover:border-gray-600' 
                                            : 'text-gray-700 hover:bg-orange-50 hover:border-orange-200'
                                    } transition-all duration-300 hover:translate-x-2 
                                    rounded-md border-l-4 border-transparent`}
                                    onClick={toggleMenu}
                                    style={darkMode ? {color: 'white'} : {}}
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className={`block px-3 py-2 text-base font-medium ${
                                        darkMode 
                                            ? '!text-white hover:bg-gray-700 hover:border-gray-600' 
                                            : 'text-gray-700 hover:bg-orange-50 hover:border-orange-200'
                                    } transition-all duration-300 hover:translate-x-2 
                                    rounded-md border-l-4 border-transparent`}
                                    onClick={toggleMenu}
                                    style={darkMode ? {color: 'white'} : {}}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                        {isLoggedIn && (
                            <>
                                <Link 
                                    to="/profile" 
                                    className={`block px-3 py-2 text-base font-medium ${
                                        darkMode 
                                            ? '!text-white hover:bg-gray-700 hover:!text-white hover:border-gray-300' 
                                            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500'
                                    } transition-all duration-300 hover:translate-x-2 
                                    rounded-md border-l-4 border-transparent`}
                                    onClick={toggleMenu}
                                    style={darkMode ? {color: 'white'} : {}}
                                >
                                    Profile
                                </Link>
                                <Link 
                                    to="/profile?tab=notifications" 
                                    className={`block px-3 py-2 text-base font-medium ${
                                        darkMode 
                                            ? '!text-white hover:bg-gray-700 hover:!text-white hover:border-gray-300' 
                                            : 'text-gray-700 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-500'
                                    } transition-all duration-300 hover:translate-x-2 
                                    rounded-md border-l-4 border-transparent`}
                                    onClick={toggleMenu}
                                    style={darkMode ? {color: 'white'} : {}}
                                >
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}
                        {isLoggedIn && isAdmin && (
                            <Link 
                                to="/dashboard" 
                                className={`block px-3 py-2 text-base font-medium ${
                                    darkMode 
                                        ? '!text-white hover:bg-gray-700 hover:!text-white hover:border-purple-300' 
                                        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-500 hover:border-purple-500'
                                } transition-all duration-300 hover:translate-x-2 
                                rounded-md border-l-4 border-transparent flex items-center`}
                                onClick={toggleMenu}
                                style={darkMode ? {color: 'white'} : {}}
                            >
                                <RiDashboardLine className="mr-2" />
                                Admin Dashboard
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;