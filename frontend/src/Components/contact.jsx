import 'antd/dist/reset.css';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { Button, Form } from 'antd';
import './Contact.css';
import Cover from './cover';
import Footer from './Footer';
import Navbar from './navbar';
import { useTheme } from '../contexts/ThemeContext';

const Contact = () => {
  const [form] = Form.useForm();
  const { darkMode } = useTheme();

  const onFinish = (values) => {
    console.log('Received values:', values);
  };

  return (
    <div className={`text-center pt-16 ${darkMode ? 'bg-gray-900' : ''}`} style={darkMode ? {backgroundColor: '#111827'} : {}}>
      <Navbar/>
      <Cover title="Contact" sub1="Home" sub2="Contact" />
      <h2 className={`text-lg font-semibold mb-6 ${darkMode ? '!text-white' : ''}`} style={darkMode ? {color: 'white'} : {}}>
        Contact us if you need our services. We will be happy to make your events memorable!
      </h2>
      <div className="flex flex-col md:flex-row justify-center gap-3 m-20">
        <div className="bg-green-500 text-white p-6 rounded-lg flex-1 flex items-center">
          <div className="flex-shrink-0">
            <FaMapMarkerAlt className="text-4xl mr-4" />
          </div>
          <div>
            <h3 className="font-semibold">Address</h3>
            <p className="font-bold">College of Engineering - Salahaddin University</p>
          </div>
        </div>
        <div className="bg-blue-500 text-white p-6 rounded-lg flex-1 flex items-center">
          <div className="flex-shrink-0">
            <FaPhoneAlt className="text-4xl mr-4" />
          </div>
          <div>
            <h3 className="font-semibold">Phone</h3>
            <p className="font-bold">(+964) 750 231 6612</p>
          </div>
        </div>
        <div className="bg-gray-700 h-30 text-white p-6 rounded-lg flex-1 flex items-center">
          <div className="flex-shrink-0">
            <FaEnvelope className="text-4xl mr-4" />
          </div>
          <div>
            <h3 className="font-semibold">Email</h3>
            <p className="font-bold">inform@events.com</p>
          </div>
        </div>
      </div> 
      <div className="flex flex-col md:flex-row gap-8 p-6">
        {/* Form Section */}
        <div className={`w-full md:w-1/2 ${darkMode ? 'bg-gray-800 !text-white' : 'bg-white'} p-6 shadow-lg rounded-xl`} style={darkMode ? {backgroundColor: '#1f2937', color: 'white'} : {}}>
          <h2 className={`text-lg font-bold ${darkMode ? '!text-white' : 'text-gray-700'} mb-4 border-l-4 border-orange-500 pl-2`} style={darkMode ? {color: 'white'} : {}}>
            MESSAGE FORM
          </h2>
          <Form form={form} onFinish={onFinish} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please input your name!' }]}
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  className={`p-3 rounded w-full ${darkMode ? 'bg-gray-700 !text-white border-gray-600' : ''}`}
                  style={darkMode ? {backgroundColor: '#374151', color: 'white', borderColor: '#4B5563'} : {}}
                />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[{ required: true, message: 'Please input your email!' }]}
              >
                <input
                  type="email"
                  placeholder="Your Email"
                  className={`p-3 rounded w-full ${darkMode ? 'bg-gray-700 !text-white border-gray-600' : ''}`}
                  style={darkMode ? {backgroundColor: '#374151', color: 'white', borderColor: '#4B5563'} : {}}
                />
              </Form.Item>
            </div>
            <Form.Item
              name="phone"
              rules={[{ required: true, message: 'Please input your phone number!' }]}
            >
              <input
                type="tel"
                placeholder="Your Tel"
                className={`p-3 rounded w-full ${darkMode ? 'bg-gray-700 !text-white border-gray-600' : ''}`}
                style={darkMode ? {backgroundColor: '#374151', color: 'white', borderColor: '#4B5563'} : {}}
              />
            </Form.Item>
       
            <Form.Item
              name="message"
              rules={[{ required: true, message: 'Please input your message!' }]}
            >
              <textarea
                placeholder="Your Message ..."
                className={`p-3 rounded w-full ${darkMode ? 'bg-gray-700 !text-white border-gray-600' : ''}`}
                style={darkMode ? {backgroundColor: '#374151', color: 'white', borderColor: '#4B5563'} : {}}
                rows="4"
              ></textarea>
            </Form.Item>
          
            <button 
              className="Buttoncontact bg-orange-500 text-white p-3 w-full rounded mt-4 hover:bg-orange-600 transition-colors duration-300 font-semibold tracking-wide hover:shadow-lg"
            >
              Send 
            </button>
          </Form>
        </div>
        {/* Map Section */}
        <div className="w-full md:w-1/2">
          <div className={`w-full max-w-4xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-xl`} style={darkMode ? {backgroundColor: '#1f2937'} : {}}>
            <div className={`w-full max-w-4xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-xl`} style={darkMode ? {backgroundColor: '#1f2937'} : {}}>
              <h2 className={`text-xl font-semibold ${darkMode ? '!text-white' : 'text-gray-800'} mb-4`} style={darkMode ? {color: 'white'} : {}}>
                College of Engineering - Salahaddin University
              </h2>
              <div className="relative w-full h-96">
                <iframe
                  title="Salahaddin University - College of Engineering"
                  className="w-full h-full rounded-lg"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3309.1234567890123!2d44.0244796!3d36.1423742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40073b4bd1f73c9d%3A0x27cdaacdd65aaa8a!2sCollege%20of%20Engineering%20-%20Salahaddin%20University-Erbil!5e0!3m2!1sen!2siq!4v1700000000000!5m2!1sen!2siq"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;
