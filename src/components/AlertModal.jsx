import React from 'react';
import { XCircle } from 'lucide-react';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = "Terjadi Kesalahan", 
  description = "Ada masalah dengan file yang diupload." 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 scale-100 animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Header Merah */}
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="p-2.5 bg-red-50 rounded-full shrink-0">
            <XCircle size={24} strokeWidth={2.5} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
        </div>
        
        {/* Isi Pesan */}
        <p className="text-[15px] text-gray-600 mb-6 leading-relaxed font-medium">
          {description}
        </p>

        {/* Tombol OK Saja */}
        <div className="flex justify-end">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95"
          >
            Mengerti, Saya Ganti
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;