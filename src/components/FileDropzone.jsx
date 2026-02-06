import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileImage } from 'lucide-react';
import AlertModal from './AlertModal';

const FileDropzone = ({ onFileSelect }) => {
  const MAX_SIZE = 10 * 1024 * 1024;

  const [errorState, setErrorState] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect({ target: { files: [file] } });
    }

    if (fileRejections?.length > 0) {
      const error = fileRejections[0].errors[0];
      let title = "File Ditolak";
      let message = "Terjadi kesalahan saat memproses file.";

      if (error.code === 'file-too-large') {
        title = "File Terlalu Besar";
        message = "Ukuran file melebihi batas 10MB. Harap kompres gambar atau pilih file lain.";
      } else if (error.code === 'file-invalid-type') {
        title = "Format Tidak Didukung";
        message = "MagicTool hanya menerima file gambar (JPG, PNG, WEBP, BMP, ICO).";
      }

      setErrorState({ isOpen: true, title, message });
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'], 
      'image/webp': ['.webp'],
      'image/bmp': ['.bmp'],
      'image/x-icon': ['.ico'],
    },
    maxSize: MAX_SIZE,
    multiple: false
  });

  return (
    <>
      <AlertModal 
        isOpen={errorState.isOpen}
        onClose={() => setErrorState({ ...errorState, isOpen: false })}
        title={errorState.title}
        description={errorState.message}
      />

      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-2xl p-8 lg:p-10 text-center cursor-pointer transition-all duration-200 group h-full flex flex-col items-center justify-center min-h-[300px]
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
            : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors ${isDragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
          {isDragActive ? <FileImage size={32} /> : <UploadCloud size={32} />}
        </div>

        <h3 className="text-[16px] font-bold text-gray-700 mb-1">
          {isDragActive ? 'Lepaskan file di sini' : 'Klik atau Drag gambar ke sini'}
        </h3>
        <p className="text-[12px] text-gray-400 font-medium max-w-[200px] mx-auto leading-relaxed">
          Support JPG, PNG, WEBP, BMP<br/>(Max 10MB)
        </p>
      </div>
    </>
  );
};

export default FileDropzone;