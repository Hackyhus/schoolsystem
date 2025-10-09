'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type MaintenanceContextType = {
  isMaintenanceMode: boolean;
  isLoading: boolean;
};

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const settingsDocRef = doc(db, 'system', 'settings');

    const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsMaintenanceMode(docSnap.data().maintenanceMode || false);
      } else {
        setIsMaintenanceMode(false);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching maintenance status:", error);
      setIsMaintenanceMode(false); // Default to off if there's an error
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <MaintenanceContext.Provider value={{ isMaintenanceMode, isLoading }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
