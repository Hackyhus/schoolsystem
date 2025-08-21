'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRoleState(userData.role);
           try {
            localStorage.setItem('user-role', JSON.stringify(userData.role));
          } catch (error) {
            console.error('Failed to write to localStorage', error);
          }
        } else {
          // No user document, log them out
          await signOut(auth);
          setRoleState(null);
          setUser(null);
        }
      } else {
        setUser(null);
        setRoleState(null);
         try {
           localStorage.removeItem('user-role');
         } catch (error) {
            console.error('Failed to remove from localStorage', error);
         }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

   useEffect(() => {
    // Fallback for when onAuthStateChanged is slow
    try {
      const storedRole = localStorage.getItem('user-role');
      if (storedRole) {
        setRoleState(JSON.parse(storedRole));
      }
    } catch (error) {
      console.error('Failed to read from localStorage', error);
    } finally {
        if (isLoading) {
             setIsLoading(false);
        }
    }
  }, [isLoading]);


  const setRole = useCallback((newRole: string) => {
    try {
      localStorage.setItem('user-role', JSON.stringify(newRole));
      setRoleState(newRole);
    } catch (error) {
      console.error('Failed to write to localStorage', error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user-role');
      setUser(null);
      setRoleState(null);
      router.push('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }, [router]);

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
