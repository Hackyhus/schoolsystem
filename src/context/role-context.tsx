
'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { authService } from '@/lib/authService';
import { dbService } from '@/lib/dbService';

type RoleContextType = {
  user: User | null;
  role: string | null;
  setRole: (role: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const logout = useCallback(async (options?: { silent?: boolean }) => {
    try {
      await authService.signOut();
      localStorage.removeItem('user-role');
      setUser(null);
      setRoleState(null);
      if (!options?.silent) {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }, [router]);

  useInactivityTimeout(() => {
    toast({
      title: 'Session Expired',
      description: 'You have been logged out due to inactivity.',
    });
    logout({ silent: true });
    router.push('/'); // Force redirect after silent logout
  }, 3600000); // 1 hour

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user document from Firestore to get the role
        const userDoc = await dbService.getDoc('users', currentUser.uid);

        if (userDoc) {
          const userData = userDoc as { role: string };
          const userRole = userData.role;
          setRoleState(userRole);
          localStorage.setItem('user-role', userRole);
        } else {
          // If a user is in auth but not Firestore, something is wrong. Log them out.
          await logout({ silent: true });
        }
      } else {
        setUser(null);
        setRoleState(null);
        localStorage.removeItem('user-role');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [logout]);


  const setRole = useCallback((newRole: string) => {
    localStorage.setItem('user-role', newRole);
    setRoleState(newRole);
  }, []);

  return (
    <RoleContext.Provider value={{ user, role, setRole, logout, isLoading }}>
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
