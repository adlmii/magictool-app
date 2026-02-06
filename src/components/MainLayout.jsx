import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ConfirmModal from './ConfirmModal';
import TitleBar from './TitleBar';

const MainLayout = ({ children, activeTab, onTabChange, isProcessActive }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);

  const handleRequestTabChange = (newTabId) => {
    if (activeTab === newTabId) return;
    if (isProcessActive) {
      setPendingTab(newTabId);
      setIsModalOpen(true);
    } else {
      onTabChange(newTabId);
    }
  };

  const confirmTabChange = () => {
    onTabChange(pendingTab);
    setIsModalOpen(false);
    setPendingTab(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900 pt-9 overflow-hidden">
      {/* Title Bar */}
      <TitleBar /> 

      <ConfirmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={confirmTabChange} 
      />

      {/* Sidebar Navigasi */}
      <Sidebar activeTab={activeTab} setActiveTab={handleRequestTabChange} />

      {/* Area Konten Dinamis */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-40px)]">
        <div className="p-8 max-w-7xl mx-auto min-h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;