import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/imgs/logo.png';
import { CgProfile } from "react-icons/cg";
import { useState, useEffect } from 'react';
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check auth status on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
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
                            className="text-gray-700 hover:text-orange-500 focus:outline-none"
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
                                    isActive ? 'text-orange-500' : 
                                    'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                Home
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/about" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive ? 'text-orange-500' : 
                                    'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                About Us
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/events" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive ? 'text-orange-500' : 
                                    'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                Latest Events
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/services" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive ? 'text-orange-500' : 
                                    'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                Services
                            </span>
                        </NavLink>
                        <NavLink 
                            to="/contact" 
                            className={({ isActive }) => 
                                `relative px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                    isActive ? 'text-orange-500' : 
                                    'text-gray-700 hover:text-orange-500 hover:-translate-y-0.5 hover:shadow-sm'
                                }`
                            }
                        >
                            <span className="block transition-all duration-300 hover:skew-y-2">
                                Contact
                            </span>
                        </NavLink>
                    </div>

                    {/* Auth Buttons - Unified Scale Effect */}
                    <div className="hidden md:flex items-center space-x-4">
                        {!isLoggedIn && (
                            <>
                                <Link 
                                    to="/login" 
                                    className="relative overflow-hidden text-gray-700 px-4 py-2 text-sm font-medium
                                    transition-all duration-300 hover:bg-orange-50 hover:scale-[1.02] rounded-md
                                    border border-transparent hover:border-orange-200"
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
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">
                                    {localStorage.getItem('username')}
                                </span>
                                <Link 
                                    to="/profile" 
                                    className="flex items-center text-gray-700 transition-all duration-300
                                    hover:text-orange-500 hover:rotate-[15deg]"
                                >
                                    <CgProfile className="w-6 h-6" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu - Subtle Background Transition */}
                <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                        <Link 
                            to="/" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 
                            transition-all duration-300 hover:bg-orange-50 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent hover:border-orange-500"
                            onClick={toggleMenu}
                        >
                            Home
                        </Link>
                        <Link 
                            to="/about" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 
                            transition-all duration-300 hover:bg-orange-50 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent hover:border-orange-500"
                            onClick={toggleMenu}
                        >
                            About Us
                        </Link>
                        <Link 
                            to="/events" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 
                            transition-all duration-300 hover:bg-orange-50 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent hover:border-orange-500"
                            onClick={toggleMenu}
                        >
                            Latest Events
                        </Link>
                        <Link 
                            to="/services" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 
                            transition-all duration-300 hover:bg-orange-50 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent hover:border-orange-500"
                            onClick={toggleMenu}
                        >
                            Services
                        </Link>
                        <Link 
                            to="/contact" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 
                            transition-all duration-300 hover:bg-orange-50 hover:translate-x-2 
                            rounded-md border-l-4 border-transparent hover:border-orange-500"
                            onClick={toggleMenu}
                        >
                            Contact
                        </Link>
                        {!isLoggedIn && (
                            <>
                                <Link 
                                    to="/login" 
                                    className="block px-3 py-2 text-base font-medium text-gray-700 
                                    transition-all duration-300 hover:bg-orange-50 hover:translate-x-2 
                                    rounded-md border-l-4 border-transparent hover:border-orange-500"
                                    onClick={toggleMenu}
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup" 
                                    className="block px-3 py-2 text-base font-medium text-orange-500 
                                    transition-all duration-300 hover:bg-orange-50 hover:translate-x-2 
                                    rounded-md border-l-4 border-transparent hover:border-orange-500"
                                    onClick={toggleMenu}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                        {isLoggedIn && (
                            <Link 
                                to="/profile" 
                                className="block px-3 py-2 text-base font-medium text-gray-700 
                                transition-all duration-300 hover:bg-orange-50 hover:translate-x-2 
                                rounded-md border-l-4 border-transparent hover:border-orange-500"
                                onClick={toggleMenu}
                            >
                                {localStorage.getItem('username')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;