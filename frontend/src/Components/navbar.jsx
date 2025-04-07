import { Link } from 'react-router-dom';
import logo from '../assets/imgs/logo.png';
import { CgProfile } from "react-icons/cg";
import { useState } from 'react';
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

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

                    {/* Desktop Navigation Links - Centered */}
                    <div className="hidden md:flex flex-grow items-center justify-center space-x-8">
                        <Link to="/" className="relative text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium transition-all duration-300 group">
                            Home
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/about" className="relative text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium transition-all duration-300 group">
                            About Us
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/events" className="relative text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium transition-all duration-300 group">
                            Latest Events
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/services" className="relative text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium transition-all duration-300 group">
                            Services
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link to="/contact" className="relative text-gray-700 hover:text-orange-500 px-3 py-2 text-sm font-medium transition-all duration-300 group">
                            Contact
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    </div>

                    {/* Profile Icon and Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login" className="text-gray-700 hover:text-white hover:bg-orange-500 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md border border-transparent hover:border-orange-500">
                            Login
                        </Link>
                        <Link to="/signup" className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 hover:shadow-md transition-all duration-300 border border-orange-500">
                            Sign Up
                        </Link>
                        <Link to="/profile" className="flex items-center text-gray-700 hover:text-orange-500 transition-colors duration-300">
                            <CgProfile className="w-6 h-6" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                        <Link 
                            to="/" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-all duration-300"
                            onClick={toggleMenu}
                        >
                            Home
                        </Link>
                        <Link 
                            to="/about" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-all duration-300"
                            onClick={toggleMenu}
                        >
                            About Us
                        </Link>
                        <Link 
                            to="/events" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-all duration-300"
                            onClick={toggleMenu}
                        >
                            Latest Events
                        </Link>
                        <Link 
                            to="/services" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-all duration-300"
                            onClick={toggleMenu}
                        >
                            Services
                        </Link>
                        <Link 
                            to="/contact" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-all duration-300"
                            onClick={toggleMenu}
                        >
                            Contact
                        </Link>
                        <Link 
                            to="/login" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-all duration-300"
                            onClick={toggleMenu}
                        >
                            Login
                        </Link>
                        <Link 
                            to="/signup" 
                            className="block px-3 py-2 text-base font-medium text-orange-500 hover:text-orange-600 hover:bg-gray-50 rounded-md transition-all duration-300"
                            onClick={toggleMenu}
                        >
                            Sign Up
                        </Link>
                        <Link 
                            to="/profile" 
                            className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 rounded-md transition-all duration-300"
                            onClick={toggleMenu}
                        >
                            Profile
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;