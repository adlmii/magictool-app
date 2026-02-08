import React, { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ConfirmModal from '../components/ConfirmModal';
import { Maximize, Download, Loader2, X, Sparkles, Image as ImageIcon, Check } from 'lucide-react'; 
import { toLocalResourceUrl, formatFileSize, getFileNameWithoutExt } from '../utils/helpers';

const UpscalePage = ({ setProcessActive, showToast }) => {
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [resultPath, setResultPath] = useState('');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  
  // STATE: 2x/4x
  const [scaleFactor, setScaleFactor] = useState(2);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setStatus('idle');
    setResultPath('');
    
    const realPath = await window.electronAPI.getFilePath(selectedFile);
    setFile(selectedFile);
    setFilePath(realPath);
    setPreviewUrl(toLocalResourceUrl(realPath));
    setProcessActive(true);
  };

  const runUpscale = async () => {
    setStatus('loading');
    try {
      const res = await window.electronAPI.processImage({
        command: 'upscale',
        inputPath: filePath,
        scale: scaleFactor,
        keepSize: true // Tetap True (Enhance Mode)
      });

      if (res.success || res.outputPath) {
        setStatus('success');
        setResultPath(res.outputPath);
        setPreviewUrl(toLocalResourceUrl(res.outputPath));
        showToast('Gambar berhasil dipertajam! ✨', 'success');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      showToast('Gagal memproses gambar.', 'error');
    }
  };

  const handleDownload = async () => {
    if (!resultPath) return;
    const originalName = getFileNameWithoutExt(file.name);
    const defaultName = `${originalName}_enhanced_x${scaleFactor}.png`;
    
    const res = await window.electronAPI.saveImage({ 
      tempPath: resultPath, 
      defaultName: defaultName 
    });

    if (res.success) {
      showToast(`File disimpan di: ${res.savedPath}`, 'success');
    }
  };

  const executeReset = () => {
    setFile(null); setFilePath(''); setPreviewUrl(''); setStatus('idle'); setResultPath(''); setProcessActive(false); setIsCloseModalOpen(false);
  };

  if (!file) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Enhancer</h1>
          <p className="text-[15px] text-gray-500 mt-1">
            Pertajam detail dan kualitas gambar tanpa mengubah ukuran aslinya.
          </p>
        </header>
        <div className="flex-1 flex flex-col justify-center pb-10">
          <FileDropzone onFileSelect={handleFileChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <ConfirmModal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} onConfirm={executeReset} title="Batalkan Proses?" description="Gambar yang sedang diproses akan hilang." />

      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">AI Enhancer</h1>
        <p className="text-[15px] text-gray-500 mt-1">Pilih tingkat ketajaman AI.</p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="h-full flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* CONTROL BAR */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3 shrink-0">
            
            {/* Info File & Close */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Sparkles size={18} strokeWidth={2} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                </div>
                </div>
                <button onClick={() => setIsCloseModalOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                    <X size={18} />
                </button>
            </div>

            <hr className="border-gray-100" />

            {/* Tombol Pilihan x2 / x4 */}
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                {[2, 4].map((sc) => (
                    <button
                        key={sc}
                        onClick={() => { if(status !== 'loading') setScaleFactor(sc); }}
                        disabled={status === 'loading'}
                        className={`h-9 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm
                            ${scaleFactor === sc 
                                ? 'bg-white text-blue-600 ring-1 ring-gray-200' 
                                : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            } ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {sc === 2 ? 'Standard (x2)' : 'Ultra (x4)'}
                        {scaleFactor === sc && <Check size={14} strokeWidth={3} />}
                    </button>
                ))}
            </div>
          </div>

          {/* PREVIEW IMAGE */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative min-h-0">
             <div className="flex-1 p-4 bg-[url('https://media.istockphoto.com/id/1156204732/vector/abstract-seamless-checkered-pattern-transparent-pixel-background-seamless-pattern.jpg?s=612x612&w=0&k=20&c=66y31f-W3-oJ2fW7U7sT6D-9f3M-5k6Q2-8-6-7-1')] bg-repeat bg-[length:20px_20px] flex items-center justify-center overflow-hidden">
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-lg border border-gray-300 animate-in zoom-in-95 duration-300" />
                )}
             </div>

             <div className="absolute top-4 left-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm flex items-center gap-1 ${status === 'success' ? 'bg-green-500/90 text-white' : 'bg-gray-800/80 text-white'}`}>
                   {status === 'success' ? <Sparkles size={12} /> : <ImageIcon size={12} />} 
                   {status === 'success' ? `Enhanced (x${scaleFactor})` : 'Original'}
                </span>
             </div>

             <div className="p-3 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm z-10 shrink-0">
                {status !== 'success' ? (
                  <button
                    onClick={runUpscale}
                    disabled={status === 'loading'}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm tracking-wide rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles strokeWidth={2} className="w-4 h-4" />}
                    {status === 'loading' 
                        ? 'Sedang Memproses AI...' 
                        : 'Mulai Pertajam Gambar'
                    }
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

export default UpscalePage;