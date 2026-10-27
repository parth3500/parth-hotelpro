import React from 'react';
import { useHotel } from '../context/HotelContext';
import { CheckCircle } from 'lucide-react';

export const Toast = () => {
  const { toastMessage } = useHotel();
  if (!toastMessage) return null;

  return (
    <div aria-live="polite" aria-atomic="true" className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
      <div className="toast show align-items-center text-white bg-dark border-0 shadow-lg" role="alert">
        <div className="d-flex">
          <div className="toast-body d-flex align-items-center gap-2">
            <CheckCircle className="text-success" size={20} />
            <span>{toastMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
