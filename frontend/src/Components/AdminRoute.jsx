import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminRoute = ({ children, superAdminOnly }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showDenied, setShowDenied] = useState(false);
  const [showSuperAdminRequired, setShowSuperAdminRequired] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Force reload to fix potential caching issues
  const forceReload = () => {
    window.location.reload();
  };

  // Clear cached auth data and redirect to login
  const clearAndRedirect = () => {
    localStorage.removeItem('userRole');
    navigate('/login', { state: { returnTo: location.pathname } });
  };
  
  // Go to home page with delay
  const goToHome = () => {
    setTimeout(() => {
      navigate('/');
    }, 5000); // 3 seconds to show access denied message
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Check if there's a token
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token found");
          setLoading(false);
          setShowDenied(true);
          return;
        }

        // Check stored role first
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          const isAdminRole = storedRole.toLowerCase() === 'admin' || storedRole.toLowerCase() === 'super admin';
          const isSuperAdminRole = storedRole.toLowerCase() === 'super admin';
          
          setIsAdmin(isAdminRole);
          setIsSuperAdmin(isSuperAdminRole);
          
          if (superAdminOnly && !isSuperAdminRole && isAdminRole) {
            // User is admin but not super admin, and this route requires super admin
            setShowSuperAdminRequired(true);
            setLoading(false);
            return;
          }
          
          if (!isAdminRole) {
            // User is not an admin at all
            setShowDenied(true);
            setLoading(false);
            return;
          }
          
          // If we get here, user has appropriate permissions
          setLoading(false);
          return;
        }
        
        // No stored role, verify with server
        try {
          // Try profile endpoint
          const response = await axios.get('http://localhost:3001/auth/profile', {
            headers: { accessToken: token }
          });
          
          if (response.data && response.data.role) {
            const role = response.data.role;
            localStorage.setItem('userRole', role);
            
            const isAdminRole = role.toLowerCase() === 'admin' || role.toLowerCase() === 'super admin';
            const isSuperAdminRole = role.toLowerCase() === 'super admin';
            
            setIsAdmin(isAdminRole);
            setIsSuperAdmin(isSuperAdminRole);
            
            if (superAdminOnly && !isSuperAdminRole && isAdminRole) {
              // User is admin but not super admin, and this route requires super admin
              setShowSuperAdminRequired(true);
              setLoading(false);
              return;
            }
            
            if (!isAdminRole) {
              // User is not an admin at all
              setShowDenied(true);
              setLoading(false);
              return;
            }
            
            // If we get here, user has appropriate permissions
            setLoading(false);
            return;
          } else {
            // No role found in response
            setShowDenied(true);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error checking admin access:", error);
          setShowDenied(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error in admin route:", error);
        setShowDenied(true);
        setLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [superAdminOnly, navigate, location.pathname]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-600">Verifying admin access...</p>
      </div>
    );
  }
  
  // Access denied state
  if (showDenied) {
    // Trigger delayed navigation
    goToHome();
    
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 border-t-4 border-red-500 transform transition duration-500 hover:scale-105">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
            <p className="text-gray-700">
              You need administrator privileges to access this page. Please log in with an admin account.
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              Redirecting to home page in a few seconds...
            </p>
          </div>
          
        
          
         
        </div>
      </div>
    );
  }
  
  // Super Admin access required state
  if (showSuperAdminRequired) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 border-t-4 border-yellow-500 transform transition duration-500 hover:scale-105">
          <div className="flex items-center mb-6">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2M9 9h2m4 4h6m-6 4H9a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v2a4 4 0 01-4 4h-1.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Higher Permissions Required</h2>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r">
            <p className="text-gray-700">
              You have Admin access, but this feature requires Super Admin privileges. Please contact a Super Admin for assistance.
            </p>
          </div>
          
         
        </div>
      </div>
    );
  }
  
  // All checks passed, render children
  return children;
};

export default AdminRoute; 