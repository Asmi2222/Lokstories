export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }
    
    // Optional: Add token expiration check if your backend provides an expiry
    // This requires storing the expiry timestamp along with the token
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      // Token has expired, clean up and return false
      logout();
      return false;
    }
    
    return true;
  };
  
  // Get the user's role
  export const getUserRole = () => {
    if (!isAuthenticated()) {
      return null;
    }
    
    const role = localStorage.getItem('user_role');
    return role;
  };
  
  // Handle user logout
  export const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('tokenExpiry');
    
    // Redirect to login page
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };
  
  // Parse JWT token (optional utility function)
  export const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };