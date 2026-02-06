import React from 'react';
import { Image as ImageIcon, CheckCircle2 } from 'lucide-react';

const ImageComparison = ({ originalUrl, processedUrl }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
           <ImageIcon size={18} /> Visual Comparison
        </h3>
        {processedUrl && (
          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} /> Processed
          </span>
        )}
      </div>

      {/* Container Comparison */}
      <div className="flex-1 grid grid-cols-2 gap-4 h-[400px]">
        
        {/* ORIGINAL (BEFORE) */}
        <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center group">
          <div className="absolute top-3 left-3 z-10 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md">
            BEFORE
          </div>
          {originalUrl ? (
            <img src={originalUrl} className="max-w-full max-h-full object-contain p-2" alt="Original" />
          ) : (
             <div className="text-gray-300 text-sm">No Image</div>
          )}
        </div>

        {/* PROCESSED (AFTER) */}
        <div className="relative bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
            {/* Background catur transparan */}
            <div className="absolute inset-0 bg-[image:repeating-linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb),repeating-linear-gradient(45deg,#e5e7eb_25%,#f9fafb_25%,#f9fafb_75%,#e5e7eb_75%,#e5e7eb)] bg-[position:0_0,10px_10px] bg-[size:20px_20px] opacity-50 z-0"></div>

            <div className="absolute top-3 left-3 z-10 bg-rose-500/80 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              AFTER
            </div>

            {processedUrl ? (
              <img src={processedUrl} className="relative z-10 max-w-full max-h-full object-contain p-2 drop-shadow-xl animate-in zoom-in-95" alt="Processed" />
            ) : (
              <div className="relative z-10 text-gray-400 text-center text-sm p-4">
                 <p>Result will appear here</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageComparison;