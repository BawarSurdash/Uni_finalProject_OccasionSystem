import { FaTwitter, FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useTheme } from "../contexts/ThemeContext";

export default function Footer() {
  const { darkMode } = useTheme();
  
  return (
    <footer className={`${darkMode ? 'bg-[#101828] !text-white !border-gray-700' : 'bg-gray-50 text-gray-600 border-gray-200'} py-8 border-t transition-colors duration-300`} style={darkMode ? {backgroundColor: '#101828', color: 'white'} : {}}>
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* TheEvexa Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? '!text-white' : 'text-gray-800'}`} style={darkMode ? {color: 'white'} : {}}>TheEvexa</h3>
            <p className={`text-sm leading-relaxed ${darkMode ? '!text-gray-300' : 'text-gray-500'}`} style={darkMode ? {color: '#d1d5db'} : {}}>
              Learn more about TheEvexs! Help's journey and vision. In this space, we share 
              our story, values, and mission to bring positive change to those we impact
            </p>
          </div>

          {/* Pages Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? '!text-white' : 'text-gray-800'}`} style={darkMode ? {color: 'white'} : {}}>Pages</h3>
            <ul className={`space-y-1 text-sm ${darkMode ? '!text-gray-300' : 'text-gray-500'}`} style={darkMode ? {color: '#d1d5db'} : {}}>
              <li className="mb-2"><Link to="/" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>Home</Link></li>
              <li className="mb-2"><Link to="/about" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>About Us</Link></li>
              <li className="mb-2"><Link to="/events" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>Latest Events</Link></li>
              <li className="mb-2"><Link to="/services" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>Services</Link></li>
              <li className="mb-2"><Link to="/contact" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>Contact</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? '!text-white' : 'text-gray-800'}`} style={darkMode ? {color: 'white'} : {}}>Contact</h3>
            <div className={`text-sm ${darkMode ? '!text-gray-300' : 'text-gray-500'} space-y-1`} style={darkMode ? {color: '#d1d5db'} : {}}>
              <p>4567 Northman Avenue,</p>
              <p>Amberg, East, Kurdistan</p>
              <p>Region Iraq</p>
              <p>evexa@gmail.com</p>
              <p>+964 746 123 456 789</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`border-t mt-8 pt-4 ${darkMode ? '!border-gray-700' : 'border-gray-200'}`} style={darkMode ? {borderColor: '#374151'} : {}}>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className={`${darkMode ? '!text-gray-300' : 'text-gray-500'}`} style={darkMode ? {color: '#d1d5db'} : {}}>© 2023 Evexa - The Events Specialists All Rights Reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/twitter" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>
                <FaTwitter size={16} />
              </Link>
              <Link to="/facebook" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>
                <FaFacebookF size={16} />
              </Link>
              <Link to="/youtube" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>
                <FaYoutube size={16} />
              </Link>
              <Link to="/instagram" className={`${darkMode ? '!text-gray-300 hover:!text-white' : 'text-gray-500 hover:text-orange-500'} transition-colors duration-300`} style={darkMode ? {color: '#d1d5db'} : {}}>
                <FaInstagram size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
