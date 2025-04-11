import Cover from "./cover";
import Navbar from "./navbar";
import Footer from "./Footer";
import vision from "../assets/imgs/1-3.jpg";
import approach from "../assets/imgs/6-1.jpg";
import goals from "../assets/imgs/1.jpg";
import wed from "../assets/imgs/wed.png";
import { useTheme } from '../contexts/ThemeContext';

const About = () => {
    const { darkMode } = useTheme();
    
    return ( 
        <div className={`${darkMode ? 'bg-gray-900' : ''}`} style={darkMode ? {backgroundColor: '#111827'} : {}}>
            <Navbar/>
            <Cover title="Who We Are" sub1="Home" sub2="About Us" />
            
            {/* Main Content Section */}
            <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-24 transition-colors duration-300`} style={darkMode ? {backgroundColor: '#111827'} : {}}>
                {/* Heading with animated underline */}
                <div className="text-center mb-16">
                    <h2 className={`text-5xl font-light ${darkMode ? '!text-white' : 'text-gray-800'} relative inline-block`} style={darkMode ? {color: 'white'} : {}}>
                        We <span className="text-orange-500 font-semibold">Create Events</span> That Last
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                    </h2>
                </div>
          
                {/* Description */}
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-xl text-center max-w-3xl mx-auto px-6 leading-relaxed mb-20 transition-colors duration-300`} style={darkMode ? {color: '#D1D5DB'} : {}}>
                    From Wedding Functions To Birthday Parties Or Corporate Events To
                    Musical Functions, We Offer Full Range Of Event Management Services
                    That Scale To Your Needs & Budget.
                </p>
          
                {/* Services Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto px-6">
                    {/* Vision Card */}
                    <div className="group hover:transform hover:scale-105 transition-all duration-300">
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors duration-300`} style={darkMode ? {backgroundColor: '#1F2937'} : {}}>
                            <img
                                src={vision}
                                alt="Our Vision"
                                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="p-6">
                                <h3 className={`text-2xl font-semibold ${darkMode ? '!text-white' : 'text-gray-800'} mb-3 transition-colors duration-300`} style={darkMode ? {color: 'white'} : {}}>Our Vision</h3>
                                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-300`} style={darkMode ? {color: '#D1D5DB'} : {}}>
                                    Lorem ipsum dolor sit amet consectetur elit sed tempor incididunt ut labore et dolore.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Approach Card */}
                    <div className="group hover:transform hover:scale-105 transition-all duration-300">
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors duration-300`} style={darkMode ? {backgroundColor: '#1F2937'} : {}}>
                            <img
                                src={approach}
                                alt="Our Approach"
                                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="p-6">
                                <h3 className={`text-2xl font-semibold ${darkMode ? '!text-white' : 'text-gray-800'} mb-3 transition-colors duration-300`} style={darkMode ? {color: 'white'} : {}}>Our Approach</h3>
                                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-300`} style={darkMode ? {color: '#D1D5DB'} : {}}>
                                    Lorem ipsum dolor sit amet consectetur elit sed tempor incididunt ut labore et dolore.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Goals Card */}
                    <div className="group hover:transform hover:scale-105 transition-all duration-300">
                        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden transition-colors duration-300`} style={darkMode ? {backgroundColor: '#1F2937'} : {}}>
                            <img
                                src={goals}
                                alt="Our Goals"
                                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="p-6">
                                <h3 className={`text-2xl font-semibold ${darkMode ? '!text-white' : 'text-gray-800'} mb-3 transition-colors duration-300`} style={darkMode ? {color: 'white'} : {}}>Our Goals</h3>
                                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-300`} style={darkMode ? {color: '#D1D5DB'} : {}}>
                                    Lorem ipsum dolor sit amet consectetur elit sed tempor incididunt ut labore et dolore.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-24 transition-colors duration-300`} style={darkMode ? {backgroundColor: '#1F2937'} : {}}>
                <div className="max-w-6xl mx-auto px-6 lg:flex items-center gap-16">
                    <div className="lg:w-1/2 space-y-8">
                        <h2 className={`text-5xl font-bold ${darkMode ? '!text-white' : 'text-gray-800'} transition-colors duration-300`} style={darkMode ? {color: 'white'} : {}}>
                            Why Choose <span className="text-orange-500">Evexa</span>
                        </h2>
                        <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`} style={darkMode ? {color: '#D1D5DB'} : {}}>
                            Planning events can be stressful, but Evexa makes it simple and efficient.
                        </p>

                        {/* Features */}
                        <div className="space-y-8">
                            {/* Feature Items */}
                            {[
                                {icon: "📌", title: "The Events Specialists"},
                                {icon: "🏛️", title: "Dedicated Venues & Arrangements"},
                                {icon: "🎉", title: "All Types of Events"}
                            ].map((feature, index) => (
                                <div key={index} className={`flex items-start group ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} p-4 rounded-lg transition-colors duration-300`}>
                                    <div className="text-3xl group-hover:scale-125 transition-transform duration-300">{feature.icon}</div>
                                    <div className="ml-6">
                                        <h3 className={`text-2xl font-semibold ${darkMode ? '!text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`} style={darkMode ? {color: 'white'} : {}}>
                                            {feature.title}
                                        </h3>
                                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`} style={darkMode ? {color: '#D1D5DB'} : {}}>
                                            Sit amet consectetur elit sed lorem tempor incididunt labore dolore.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="lg:w-1/2 mt-12 lg:mt-0">
                        <img
                            src={wed}
                            alt="Wedding Event"
                            className="rounded-2xl shadow-2xl hover:transform hover:scale-105 transition-all duration-500"
                        />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white py-16 mt-24">
                    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-6">
                        {[
                            {number: "320", label: "Featured Events"},
                            {number: "156", label: "Loyal Customers"},
                            {number: "594", label: "Good Comments"},
                            {number: "167", label: "Trophies Won"}
                        ].map((stat, index) => (
                            <div key={index} className="group hover:transform hover:scale-110 transition-all duration-300">
                                <h3 className="text-5xl font-bold mb-2">{stat.number}</h3>
                                <p className="text-sm uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer/>
        </div>
    );
}
 
export default About;