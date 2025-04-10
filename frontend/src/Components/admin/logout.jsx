import { useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

const Logout = ({ className, style }) => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        // Handle logout
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div 
            onClick={handleLogout}
            className={`flex items-center cursor-pointer p-3 hover:bg-gray-700 rounded ${className || 'text-red-500'}`}
            style={style}
        >
            <LogoutOutlined className="mr-2" />
            <span>Logout</span>
        </div>
    );
};

export default Logout;
