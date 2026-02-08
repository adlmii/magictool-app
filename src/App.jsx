import { useState } from 'react';
import MainLayout from './components/MainLayout';
import ConvertPage from './pages/ConvertPage';
import RemoveBgPage from './pages/RemoveBgPage';
import Toast from './components/Toast';
import UpscalePage from './pages/UpscalePage';

function App() {
  const [activeTab, setActiveTab] = useState('convert');
  const [isProcessActive, setProcessActive] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  return (
    <>
      <MainLayout 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setProcessActive(false);
        }}
        isProcessActive={isProcessActive}
      >
        {activeTab === 'convert' && (
          <ConvertPage 
            setProcessActive={setProcessActive} 
            showToast={showToast} 
          />
        )}
        {activeTab === 'remove_bg' && (
          <RemoveBgPage 
            setProcessActive={setProcessActive} 
            showToast={showToast} 
          />
        )}
        {activeTab === 'upscale' && (
          <UpscalePage 
            setProcessActive={setProcessActive} 
            showToast={showToast} 
          />
        )}
      </MainLayout>

      {/* RENDER TOAST GLOBAL */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}

export default App;