import { useState, useEffect } from 'react';
import { SettingOutlined } from '@ant-design/icons';

const Setting = ({ darkMode, toggleDarkMode, active }) => {
    // Apply dark mode on component mount
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode]);

    if (!active) return null;

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <h2 className={`text-2xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h2>
            
            <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</h3>
                            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Toggle between light and dark theme
                            </p>
                        </div>
                        <button 
                            onClick={toggleDarkMode}
                            className={`relative flex items-center h-12 px-2 rounded-full transition-colors duration-300 focus:outline-none ${
                                darkMode ? 'bg-gray-700' : 'bg-blue-100'
                            }`}
                        >
                            {/* Sun icon */}
                            <div className={`absolute left-2 transform transition-transform duration-500 ${
                                darkMode ? 'opacity-40 scale-75' : 'opacity-100 scale-100'
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            
                            {/* Toggle circle */}
                            <div className={`mx-12 h-8 w-8 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                                darkMode ? 'translate-x-4' : '-translate-x-4'
                            }`}></div>
                            
                            {/* Moon icon */}
                            <div className={`absolute right-2 transform transition-transform duration-500 ${
                                darkMode ? 'opacity-100 scale-100' : 'opacity-40 scale-75'
                            }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
                
                {/* Additional Settings */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Settings</h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        More settings coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Setting;
