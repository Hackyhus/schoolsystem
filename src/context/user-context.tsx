'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { MockUser } from '@/lib/schema';

type UserContextType = {
  users: MockUser[];
  addUser: (user: MockUser) => void;
  removeUser: (userId: number) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsersState] = useState<MockUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('app-users');
      if (storedUsers) {
        setUsersState(JSON.parse(storedUsers));
      }
    } catch (error) {
      console.error('Failed to read users from localStorage', error);
      setUsersState([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUsers = useCallback((newUsers: MockUser[]) => {
    try {
      localStorage.setItem('app-users', JSON.stringify(newUsers));
      setUsersState(newUsers);
    } catch (error) {
      console.error('Failed to write users to localStorage', error);
    }
  }, []);

  const addUser = (user: MockUser) => {
    setUsers([...users, user]);
  };

  const removeUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };


  return (
    <UserContext.Provider value={{ users, addUser, removeUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
