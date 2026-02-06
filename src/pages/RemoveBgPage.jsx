import React, { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ImageComparison from '../components/ImageComparison';
import ConfirmModal from '../components/ConfirmModal';
import { Wand2, Download, Loader2, X, ScanFace } from 'lucide-react';
import { toLocalResourceUrl, formatFileSize, getFileNameWithoutExt } from '../utils/helpers';

const RemoveBgPage = ({ setProcessActive, showToast }) => {
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [previewOriginal, setPreviewOriginal] = useState('');
  const [previewResult, setPreviewResult] = useState('');
  const [status, setStatus] = useState('idle');
  const [resultPath, setResultPath] = useState('');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setPreviewResult(''); 
    setStatus('idle');

    const realPath = await window.electronAPI.getFilePath(selectedFile);
    setFile(selectedFile);
    setFilePath(realPath);
    
    const originalUrl = toLocalResourceUrl(realPath);
    console.log('🖼️ Original URL:', originalUrl);
    setPreviewOriginal(originalUrl);
    
    setProcessActive(true);
  };

  const runRemoveBg = async () => {
    setStatus('loading');
    setPreviewResult('');
    
    try {
      const res = await window.electronAPI.processImage({
        command: 'remove_bg',
        inputPath: filePath
      });

      console.log('✅ Backend Output Path:', res.outputPath); // Debugging

      if (res.success) {
        setStatus('success');
        setResultPath(res.outputPath);
        
        const finalUrl = toLocalResourceUrl(res.outputPath);
        
        console.log('✨ Final Preview URL:', finalUrl); // Debugging
        setPreviewResult(finalUrl);
        
        showToast('Background berhasil dihapus! ✨', 'success');
      }
    } catch (err) {
      console.error('❌ Error Remove BG:', err);
      setStatus('error');
      showToast('Gagal memproses gambar.', 'error');
    }
  };

  const handleDownload = async () => {
    if (!resultPath) return;
    
    const originalName = getFileNameWithoutExt(file.name);
    const defaultName = `${originalName}_nobg.png`;
    
    const res = await window.electronAPI.saveImage({
      tempPath: resultPath,
      defaultName: defaultName
    });

    if (res.success) {
      showToast(`File disimpan di: ${res.savedPath}`, 'success');
    }
  };

  const executeReset = () => {
    setFile(null);
    setFilePath('');
    setPreviewOriginal('');
    setPreviewResult('');
    setStatus('idle');
    setProcessActive(false);
    setIsCloseModalOpen(false);
  };

  if (!file) {
     return (
       <div className="flex flex-col h-full animate-in fade-in duration-500">
         <header className="mb-6">
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Background Remover</h1>
           <p className="text-[15px] text-gray-500 mt-1">Hapus background otomatis dengan AI. Upload gambar untuk memulai.</p>
         </header>
         <div className="flex-1 flex flex-col justify-center pb-10">
           <FileDropzone onFileSelect={handleFileChange} />
         </div>
       </div>
     );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      <ConfirmModal 
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={executeReset}
        title="Tutup Editor?"
        description="Progress saat ini akan hilang."
      />

      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Background Remover</h1>
        <p className="text-[15px] text-gray-500 mt-1">Review hasil AI sebelum menyimpan gambar.</p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="h-full flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* INFO FILE BAR */}
          <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                 <ScanFace size={18} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 truncate max-w-[300px]">{file.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)} • {file.type}</p>
              </div>
            </div>

            <button 
              onClick={() => setIsCloseModalOpen(true)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* CARD UTAMA (PREVIEW) */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-0 relative">
             <div className="flex-1 overflow-hidden p-2 bg-[url('https://media.istockphoto.com/id/1156204732/vector/abstract-seamless-checkered-pattern-transparent-pixel-background-seamless-pattern.jpg?s=612x612&w=0&k=20&c=66y31f-W3-oJ2fW7U7sT6D-9f3M-5k6Q2-8-6-7-1')] bg-repeat bg-[length:20px_20px]">
                <ImageComparison 
                  originalUrl={previewOriginal} 
                  processedUrl={previewResult} 
                />
             </div>

             <div className="p-3 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm z-10 shrink-0">
                {status !== 'success' ? (
                  <button
                    onClick={runRemoveBg}
                    disabled={status === 'loading'}
                    className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm tracking-wide rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 strokeWidth={2} className="w-4 h-4" />}
                    {status === 'loading' ? 'Sedang Memproses...' : 'Hapus Background'}
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm tracking-wide rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] animate-in zoom-in-95"
                  >
                    <Download size={18} strokeWidth={2} /> Download Hasil
                  </button>
                )}
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default RemoveBgPage;