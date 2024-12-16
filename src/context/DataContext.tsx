import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useDataSync } from '../hooks/useDataSync';
import { AuthState } from '../types';

interface DataContextType {
  handleDataUpdate: (data: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleDataUpdate = useCallback((data: any) => {
    const { type, action, data: updateData } = data;

    switch (type) {
      case 'products':
        // Handle product updates
        break;
      case 'sales':
        // Handle sales updates
        break;
      case 'customers':
        // Handle customer updates
        break;
      case 'orders':
        // Handle order updates
        break;
      case 'expenses':
        // Handle expense updates
        break;
      case 'users':
        // Handle user updates
        break;
      default:
        console.log('Unknown update type:', type);
    }
  }, []);

  return (
    <DataContext.Provider value={{ handleDataUpdate }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};