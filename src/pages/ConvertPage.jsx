import React, { useState } from 'react';
import FileDropzone from '../components/FileDropzone';
import ConfirmModal from '../components/ConfirmModal';
import { RefreshCw, FileType, CheckCircle2, Download, Loader2, X, Settings2 } from 'lucide-react';
import { formatFileSize, getFileNameWithoutExt } from '../utils/helpers';

const ConvertPage = ({ setProcessActive, showToast }) => {
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState('');
  const [status, setStatus] = useState('idle');
  const [targetFormat, setTargetFormat] = useState('png');
  const [resultPath, setResultPath] = useState('');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const formats = [
    { id: 'png', label: 'PNG', desc: 'Transparan' },
    { id: 'jpg', label: 'JPG', desc: 'Compact Size' },
    { id: 'webp', label: 'WEBP', desc: 'Web Optimized' },
    { id: 'ico', label: 'ICO', desc: 'Icon File' },
    { id: 'bmp', label: 'BMP', desc: 'Bitmap Raw' },
  ];

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const realPath = await window.electronAPI.getFilePath(selectedFile);
    setFile(selectedFile);
    setFilePath(realPath);
    setStatus('idle');
    setProcessActive(true);
  };

  const runConvert = async () => {
    setStatus('loading');
    try {
      const res = await window.electronAPI.processImage({
        command: 'convert',
        inputPath: filePath,
        targetFormat: targetFormat
      });
      setStatus('success');
      setResultPath(res.outputPath);
      showToast(`Berhasil dikonversi ke ${targetFormat.toUpperCase()}! 🎉`, 'success');
    } catch (err) {
      setStatus('error');
      showToast('Gagal mengonversi gambar.', 'error');
      console.error(err);
    }
  };

  const handleDownload = async () => {
    if (!resultPath) return;
    const originalName = getFileNameWithoutExt(file.name);
    const defaultName = `${originalName}_converted.${targetFormat}`;
    
    const res = await window.electronAPI.saveImage({ tempPath: resultPath, defaultName: defaultName });
    if (res.success) showToast(`File disimpan di: ${res.savedPath}`, 'success');
  };

  const executeReset = () => {
    setFile(null); setFilePath(''); setStatus('idle'); setProcessActive(false); setIsCloseModalOpen(false);
  };

  if (!file) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Image Converter</h1>
          <p className="text-[15px] text-gray-500 mt-1">Ubah format gambar dengan cepat. Mendukung PNG, JPG, WEBP, ICO, dan BMP.</p>
        </header>
        <div className="flex-1 flex flex-col justify-center pb-10">
          <FileDropzone onFileSelect={handleFileChange} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <ConfirmModal isOpen={isCloseModalOpen} onClose={() => setIsCloseModalOpen(false)} onConfirm={executeReset} title="Batalkan Konversi?" description="Pengaturan saat ini akan hilang dan file akan ditutup." />

      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Image Converter</h1>
        <p className="text-[15px] text-gray-500 mt-1">Pilih format tujuan dan konversi gambar Anda.</p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="h-full flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* INFO FILE BAR */}
          <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                 <FileType size={18} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 truncate max-w-[300px]">{file.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)} • {file.type}</p>
              </div>
            </div>
            <button onClick={() => setIsCloseModalOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* PILIH FORMAT & TOMBOL */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden relative min-h-0 flex-1">
             <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-wider">
                  <Settings2 size={14} className="text-indigo-500" />
                  Target Format
                </h2>
             </div>
             <div className="p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {formats.map((fmt) => {
                    const isSelected = targetFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => { if (status !== 'loading') { setTargetFormat(fmt.id); if (status === 'success') setStatus('idle'); }}}
                        disabled={status === 'loading'}
                        className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group flex flex-col justify-center min-h-[72px]
                          ${isSelected 
                            ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-500/10' 
                            : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50'
                          } ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 text-indigo-600 bg-white rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 size={14} strokeWidth={3} />
                          </div>
                        )}
                        <span className={`block text-[16px] font-bold tracking-tight mb-0.5 ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                          {fmt.label}
                        </span>
                        <span className={`text-[11px] font-medium ${isSelected ? 'text-indigo-600/80' : 'text-gray-400 group-hover:text-gray-500'}`}>
                          {fmt.desc}
                        </span>
                      </button>
                    )
                  })}
                </div>
             </div>
             <div className="p-3 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm z-10 shrink-0">
                {status !== 'success' ? (
                  <button
                    onClick={runConvert}
                    disabled={status === 'loading'}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm tracking-wide rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw strokeWidth={2} className="w-4 h-4" />}
                    {status === 'loading' ? 'Sedang Mengonversi...' : `Konversi ke ${targetFormat.toUpperCase()}`}
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

export default ConvertPage;