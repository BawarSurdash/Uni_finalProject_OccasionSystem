import 'antd/dist/reset.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import './Contact.css';
import Cover from './cover';
import Footer from './Footer';
import Navbar from './navbar';
import { useTheme } from '../contexts/ThemeContext';

const Contact = () => {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Navbar/>
      <Cover title="Contact" sub1="Home" sub2="Contact" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Get In Touch
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Contact us if you need our services. We will be happy to make your events memorable!
          </p>
        </div>

        {/* Contact cards section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
            <div className="bg-green-500 p-4 flex justify-center">
              <FaMapMarkerAlt className="text-white text-3xl" />
            </div>
            <div className="p-6 text-center">
              <h3 className={`font-bold text-xl mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Address</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>College of Engineering</p>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Salahaddin University</p>
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
            <div className="bg-blue-500 p-4 flex justify-center">
              <FaPhoneAlt className="text-white text-3xl" />
            </div>
            <div className="p-6 text-center">
              <h3 className={`font-bold text-xl mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Phone</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>(+964) 750 231 6612</p>
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
            <div className="bg-purple-500 p-4 flex justify-center">
              <FaEnvelope className="text-white text-3xl" />
            </div>
            <div className="p-6 text-center">
              <h3 className={`font-bold text-xl mb-2 ${darkMode ? 'text-white' : 'text-gray-700'}`}>Email</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>inform@events.com</p>
            </div>
          </div>
        </div>
        
        {/* Map section */}
        <div className="max-w-5xl mx-auto">
          <div className={`rounded-xl overflow-hidden shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Find Us On The Map
              </h2>
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                College of Engineering - Salahaddin University
              </p>
            </div>
            <div className="w-full h-[400px]">
              <iframe
                title="Salahaddin University - College of Engineering"
                className="w-full h-full"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3309.1234567890123!2d44.0244796!3d36.1423742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40073b4bd1f73c9d%3A0x27cdaacdd65aaa8a!2sCollege%20of%20Engineering%20-%20Salahaddin%20University-Erbil!5e0!3m2!1sen!2siq!4v1700000000000!5m2!1sen!2siq"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
