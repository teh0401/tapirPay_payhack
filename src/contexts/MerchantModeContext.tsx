import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMerchant } from '@/hooks/useMerchant';

interface MerchantModeContextType {
  isMerchantMode: boolean;
  setMerchantMode: (enabled: boolean) => void;
}

const MerchantModeContext = createContext<MerchantModeContextType | undefined>(undefined);

export const MerchantModeProvider = ({ children }: { children: ReactNode }) => {
  const { merchantProfile } = useMerchant();
  const [isMerchantMode, setIsMerchantMode] = useState(false);

  // Update merchant mode when profile changes
  useEffect(() => {
    setIsMerchantMode(!!merchantProfile);
  }, [merchantProfile]);

  const setMerchantMode = (enabled: boolean) => {
    if (!enabled) {
      // Clear cached merchant profile when toggling off
      localStorage.removeItem('merchantProfile');
    }
    setIsMerchantMode(enabled);
  };

  return (
    <MerchantModeContext.Provider value={{ isMerchantMode, setMerchantMode }}>
      {children}
    </MerchantModeContext.Provider>
  );
};

export const useMerchantMode = () => {
  const context = useContext(MerchantModeContext);
  if (context === undefined) {
    throw new Error('useMerchantMode must be used within a MerchantModeProvider');
  }
  return context;
};