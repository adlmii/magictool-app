import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Scissors, Menu, Command, Sparkles } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menus = [
    { id: 'convert', label: 'Convert Format', icon: ImageIcon },
    { id: 'remove_bg', label: 'Remove Background', icon: Scissors },
  ];

  return (
    <aside 
      className={`relative bg-white border-r border-gray-200 h-[calc(100vh-36px)] overflow-y-auto flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-30 shrink-0
      ${isCollapsed ? 'w-[64px]' : 'w-[240px]'}`}
    >
      
      {/* === HEADER === */}
      <div className="h-16 flex items-center px-3 mb-1">
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-all cursor-pointer shrink-0"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        {/* Brand */}
        <div className={`flex items-center gap-2.5 ml-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 -translate-x-2' : 'w-auto opacity-100 translate-x-0'}`}>
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles size={16} fill="currentColor" />
          </div>
          
          <div className="flex flex-col justify-center">
            <span className="text-[16px] font-bold tracking-tight text-gray-900 leading-none">MagicTool</span>
            <span className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mt-0.5">Pro Editor</span>
          </div>
        </div>
      </div>
      
      {/* === MENU NAVIGASI === */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = activeTab === menu.id;
          
          return (
            <button
              key={menu.id}
              onClick={() => setActiveTab(menu.id)}
              onMouseEnter={() => setIsHovered(menu.id)}
              onMouseLeave={() => setIsHovered(null)}
              className={`group relative flex items-center rounded-lg transition-all duration-200 cursor-pointer outline-none overflow-hidden
                ${isCollapsed ? 'justify-center h-10 w-full' : 'h-10 w-full px-3 gap-3'}
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              {isActive && (
                <div className={`absolute bg-indigo-600 rounded-full transition-all duration-300
                  ${isCollapsed 
                    ? 'w-1 h-1 left-2 top-1/2 -translate-y-1/2'
                    : 'left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full'
                  }`}>
                </div>
              )}

              <Icon 
                size={isCollapsed ? 20 : 18} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-colors shrink-0 z-10 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
              />
              
              <span 
                className={`text-[14px] font-medium whitespace-nowrap transition-all duration-300 origin-left
                ${isCollapsed ? 'w-0 opacity-0 absolute' : 'w-auto opacity-100 relative'}
                ${isActive ? 'font-semibold' : ''}`}
              >
                {menu.label}
              </span>

              {/* Tooltip */}
              {isCollapsed && isHovered === menu.id && (
                <div className="absolute left-12 px-2.5 py-1.5 bg-gray-800 text-white text-[12px] font-medium rounded shadow-xl whitespace-nowrap z-50 animate-in fade-in slide-in-from-left-2 pointer-events-none">
                  {menu.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* === FOOTER === */}
      <div className={`p-3 mt-auto border-t border-gray-100 transition-all duration-300 flex flex-col bg-gray-50/50
        ${isCollapsed ? 'items-center' : ''}`}
      >
        {isCollapsed ? (
           <div className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 cursor-help">
             v1
           </div>
        ) : (
           <div className="flex items-center justify-between animate-in fade-in">
             <div className="flex flex-col">
               <span className="text-[12px] font-semibold text-gray-700">MagicTool Core</span>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">v1.0.0 • Stable</span>
               </div>
             </div>
             <Command size={14} className="text-gray-300" />
           </div>
        )}
      </div>

    </aside>
  );
};

export default Sidebar;