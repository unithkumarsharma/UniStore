import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface PlatformContextType {
  isAppMode: boolean;
  isNative: boolean;
  toggleAppMode: () => void;
  setAppMode: (val: boolean) => void;
  isVoiceSearchOpen: boolean;
  setIsVoiceSearchOpen: (val: boolean) => void;
  isLensOpen: boolean;
  setIsLensOpen: (val: boolean) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isNative = Capacitor.isNativePlatform();

  // On native device (Android/iOS APK), it is always true.
  // On desktop/browser, it remembers preference or defaults to mobile view when screen width < 768px.
  const [isAppMode, setIsAppMode] = useState<boolean>(() => {
    if (isNative) return true;
    const saved = localStorage.getItem('unistore_app_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isLensOpen, setIsLensOpen] = useState(false);

  useEffect(() => {
    if (!isNative) {
      localStorage.setItem('unistore_app_mode', String(isAppMode));
    }
  }, [isAppMode, isNative]);

  const toggleAppMode = () => {
    setIsAppMode((prev) => !prev);
  };

  return (
    <PlatformContext.Provider
      value={{
        isAppMode,
        isNative,
        toggleAppMode,
        setAppMode: setIsAppMode,
        isVoiceSearchOpen,
        setIsVoiceSearchOpen,
        isLensOpen,
        setIsLensOpen,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
