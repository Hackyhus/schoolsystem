
'use client';

import { useState, useEffect, useCallback } from 'react';

function usePersistentState<T>(key: string, initialState: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialState);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        setState(JSON.parse(storedValue));
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
  }, [key]);

  const setValue = useCallback((value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setValue];
}

export default usePersistentState;
