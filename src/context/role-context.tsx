'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';

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
      await signOut(auth);
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = userData.role;
          setRoleState(userRole);
          try {
            localStorage.setItem('user-role', userRole);
          } catch (error) {
            console.error('Failed to write role to localStorage', error);
          }
        } else {
          // If a user is in auth but not Firestore, something is wrong. Log them out.
          await logout({ silent: true });
        }
      } else {
        setUser(null);
        setRoleState(null);
        try {
          localStorage.removeItem('user-role');
        } catch (error) {
          console.error('Failed to remove role from localStorage', error);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [logout]);


  const setRole = useCallback((newRole: string) => {
    try {
      localStorage.setItem('user-role', newRole);
      setRoleState(newRole);
    } catch (error) {
      console.error('Failed to write to localStorage', error);
    }
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
