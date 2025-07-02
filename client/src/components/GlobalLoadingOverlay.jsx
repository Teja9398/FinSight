import React from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLoading } from '../contexts/LoadingContext';

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(255,255,255,0.7)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const GlobalLoadingOverlay = () => {
  const { loading } = useLoading();
  if (!loading) return null;
  return (
    <div style={overlayStyle}>
      <LoadingSpinner />
    </div>
  );
};

export default GlobalLoadingOverlay;
