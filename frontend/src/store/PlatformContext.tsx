import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

interface PlatformContextType {
  isAppMode: boolean;
  isNative: boolean;
  toggleAppMode: () => void;
  setAppMode: (val: boolean) => void;
  deliveryLocation: {
    name: string;
    city: string;
    pincode: string;
  };
  setDeliveryLocation: (loc: { name: string; city: string; pincode: string }) => void;
  isVoiceSearchOpen: boolean;
  setIsVoiceSearchOpen: (val: boolean) => void;
  isLensOpen: boolean;
  setIsLensOpen: (val: boolean) => void;
  isLocationSheetOpen: boolean;
  setIsLocationSheetOpen: (val: boolean) => void;
  isUniPayOpen: boolean;
  setIsUniPayOpen: (val: boolean) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isNative = Capacitor.isNativePlatform();

  // If running inside native Android/iOS app, always default to App mode.
  // In browser, check saved preference or screen width (mobile = app mode, desktop = web mode by default).
  const [isAppMode, setIsAppMode] = useState<boolean>(() => {
    if (isNative) return true;
    const saved = localStorage.getItem('unistore_app_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  const [deliveryLocation, setDeliveryLocationState] = useState(() => {
    const savedPincode = localStorage.getItem('unistore_pincode') || '400050';
    return {
      name: 'Arjun',
      city: 'Mumbai',
      pincode: savedPincode,
    };
  });

  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isLensOpen, setIsLensOpen] = useState(false);
  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [isUniPayOpen, setIsUniPayOpen] = useState(false);

  useEffect(() => {
    if (!isNative) {
      localStorage.setItem('unistore_app_mode', String(isAppMode));
    }
  }, [isAppMode, isNative]);

  const toggleAppMode = () => {
    setIsAppMode((prev) => !prev);
  };

  const setDeliveryLocation = (loc: { name: string; city: string; pincode: string }) => {
    setDeliveryLocationState(loc);
    localStorage.setItem('unistore_pincode', loc.pincode);
  };

  return (
    <PlatformContext.Provider
      value={{
        isAppMode,
        isNative,
        toggleAppMode,
        setAppMode: setIsAppMode,
        deliveryLocation,
        setDeliveryLocation,
        isVoiceSearchOpen,
        setIsVoiceSearchOpen,
        isLensOpen,
        setIsLensOpen,
        isLocationSheetOpen,
        setIsLocationSheetOpen,
        isUniPayOpen,
        setIsUniPayOpen,
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
