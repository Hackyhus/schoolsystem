'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type RoleContextType = {
  role: string | null;
  setRole: (role: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('user-role');
      if (storedRole) {
        setRoleState(JSON.parse(storedRole));
      }
    } catch (error) {
      console.error('Failed to read from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setRole = useCallback((newRole: string) => {
    try {
      localStorage.setItem('user-role', JSON.stringify(newRole));
      setRoleState(newRole);
    } catch (error) {
      console.error('Failed to write to localStorage', error);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('user-role');
      setRoleState(null);
      router.push('/');
    } catch (error) {
      console.error('Failed to remove from localStorage', error);
    }
  }, [router]);

  return (
    <RoleContext.Provider value={{ role, setRole, logout, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
