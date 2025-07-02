import React from 'react';

const spinnerStyle = {
      display: 'inline-block',
      width: '48px',
      height: '48px',
};

const circleStyle = {
      boxSizing: 'border-box',
      display: 'block',
      position: 'absolute',
      width: '38px',
      height: '38px',
      margin: '5px',
      border: '5px solid #1976d2',
      borderRadius: '50%',
      animation: 'spin 1.2s linear infinite',
      borderColor: '#1976d2 transparent transparent transparent',
};

const wrapperStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      position: 'relative',
};

const LoadingSpinner = () => (
      <div style={wrapperStyle}>
            <div style={spinnerStyle}>
                  <div style={{ ...circleStyle, animationDelay: '0s' }} />
                  <div style={{ ...circleStyle, animationDelay: '-0.45s' }} />
                  <div style={{ ...circleStyle, animationDelay: '-0.3s' }} />
                  <div style={{ ...circleStyle, animationDelay: '-0.15s' }} />
            </div>
            <style>
                  {`
                        @keyframes spin {
                              0% { transform: rotate(0deg);}
                              100% { transform: rotate(360deg);}
                        }
                  `}
            </style>
      </div>
);

export default LoadingSpinner;