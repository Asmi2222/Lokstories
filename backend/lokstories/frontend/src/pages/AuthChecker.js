import { useEffect } from 'react';
import { isAuthenticated, logout } from '../utils/auth';

const AuthChecker = () => {
  useEffect(() => {
    // Check authentication on component mount
    if (!isAuthenticated()) {
      logout();
    }
    
    // Check authentication when page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!isAuthenticated()) {
          logout();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return null; // This component doesn't render anything
};



export default AuthChecker;