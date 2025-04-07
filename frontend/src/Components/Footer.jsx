import { FaTwitter, FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-600 py-8 border-t">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* TheEvexa Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">TheEvexa</h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Learn more about TheEvexs! Help's journey and vision. In this space, we share 
              our story, values, and mission to bring positive change to those we impact
            </p>
          </div>

          {/* Pages Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Pages</h3>
            <ul className="space-y-1 text-sm text-gray-500">
              <li className="mb-2"><Link to="/" className="hover:text-orange-500 transition-colors duration-300">Home</Link></li>
              <li className="mb-2"><Link to="/about" className="hover:text-orange-500 transition-colors duration-300">About Us</Link></li>
              <li className="mb-2"><Link to="/events" className="hover:text-orange-500 transition-colors duration-300">Latest Events</Link></li>
              <li className="mb-2"><Link to="/services" className="hover:text-orange-500 transition-colors duration-300">Services</Link></li>
              <li className="mb-2"><Link to="/contact" className="hover:text-orange-500 transition-colors duration-300">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact</h3>
            <div className="text-sm text-gray-500 space-y-1">
              <p>4567 Northman Avenue,</p>
              <p>Amberg, East, Kurdistan</p>
              <p>Region Iraq</p>
              <p>evexa@gmail.com</p>
              <p>+964 746 123 456 789</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2023 Evexa - The Events Specialists All Rights Reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/twitter" className="text-gray-500 hover:text-orange-500 transition-colors duration-300">
                <FaTwitter size={16} />
              </Link>
              <Link to="/facebook" className="text-gray-500 hover:text-orange-500 transition-colors duration-300">
                <FaFacebookF size={16} />
              </Link>
              <Link to="/youtube" className="text-gray-500 hover:text-orange-500 transition-colors duration-300">
                <FaYoutube size={16} />
              </Link>
              <Link to="/instagram" className="text-gray-500 hover:text-orange-500 transition-colors duration-300">
                <FaInstagram size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
