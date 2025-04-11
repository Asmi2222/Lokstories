import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauth-container">
      <div className="unauth-card">
        <div className="unauth-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="unauth-heading">Access Denied</h1>
        <p className="unauth-message">
          You don't have permission to access this page. Please log in with appropriate credentials.
        </p>
        <button 
          className="unauth-button"
          onClick={() => navigate('/')}
        >
          Return to Login
        </button>
      </div>
      
      <style jsx>{`
        .unauth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f8f8f8;
          padding: 20px;
        }
        
        .unauth-card {
          width: 100%;
          max-width: 450px;
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          text-align: center;
          animation: unauthFadeIn 0.5s ease-out;
        }
        
        .unauth-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          color: #ff7700;
        }
        
        .unauth-icon svg {
          width: 100%;
          height: 100%;
        }
        
        .unauth-heading {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #333;
        }
        
        .unauth-message {
          font-size: 16px;
          line-height: 1.6;
          color: #666;
          margin-bottom: 32px;
        }
        
        .unauth-button {
          background-color: #ff7700;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
          width: 100%;
        }
        
        .unauth-button:hover {
          background-color: #e66c00;
        }
        
        .unauth-button:active {
          transform: translateY(1px);
        }
        
        @keyframes unauthFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Media query for mobile responsiveness */
        @media (max-width: 480px) {
          .unauth-card {
            padding: 30px 20px;
          }
          
          .unauth-icon {
            width: 60px;
            height: 60px;
            margin-bottom: 16px;
          }
          
          .unauth-heading {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Unauthorized;