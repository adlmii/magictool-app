import React, { useState } from 'react';
import { Minus, Square, X, Sparkles } from 'lucide-react';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => window.electronAPI.minimizeWindow();
  const handleMaximize = () => {
    window.electronAPI.maximizeWindow();
    setIsMaximized(!isMaximized);
  };
  const handleClose = () => window.electronAPI.closeWindow();

  return (
    <div className="h-9 bg-white flex items-center justify-between border-b border-gray-200 select-none z-50 fixed top-0 left-0 right-0">
      
      {/* DRAG AREA */}
      <div 
        className="flex-1 h-full flex items-center gap-2 px-3"
        style={{ WebkitAppRegion: 'drag' }} 
      >
        <div className="text-indigo-600 flex items-center gap-2 opacity-90">
           <Sparkles size={14} fill="currentColor" />
           <span className="text-[12px] font-bold tracking-widest uppercase text-gray-600">MagicTool</span>
        </div>
      </div>

      {/* WINDOW CONTROLS */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' }}>
        <button 
          onClick={handleMinimize}
          className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
        >
          <Minus size={16} />
        </button>

        <button 
          onClick={handleMaximize}
          className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
        >
          <Square size={14} />
        </button>

        <button 
          onClick={handleClose}
          className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition-colors focus:outline-none"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;