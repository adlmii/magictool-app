import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-10 fade-in duration-300">
      
      <div className={`flex items-center gap-3 px-5 py-4 bg-white rounded-lg shadow-xl border border-gray-100 border-l-4 ${
        isSuccess ? 'border-l-green-500' : 'border-l-red-500'
      }`}>
        
        {/* ICON WARNA-WARNI */}
        <div className={`shrink-0 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
          {isSuccess ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
        </div>
        
        {/* TEXT HITAM/ABU */}
        <p className="font-semibold text-sm text-gray-700 min-w-[200px]">
          {message}
        </p>

        {/* TOMBOL CLOSE ABU-ABU */}
        <button 
          onClick={onClose}
          className="p-1.5 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;