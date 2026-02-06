import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Ganti Fitur?", 
  description = "File yang sedang aktif akan dihapus/di-reset jika kamu berpindah menu. Lanjutkan?" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-amber-500 mb-4">
          <div className="p-2 bg-amber-50 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md shadow-indigo-200 transition-colors cursor-pointer"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;