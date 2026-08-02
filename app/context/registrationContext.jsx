'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Create a context with default empty values
const RegistrationContext = createContext({
  registrationData: { phoneNumber: '', fullName: '', password: '', attempts: 1 },
  updateRegistrationData: () => {},
  clearRegistrationData: () => {},
  incrementAttempts: () => {},
});

// Storage key for localStorage
const STORAGE_KEY = 'registration_data';

export function RegistrationProvider({ children }) {
  // Initialize state from localStorage if available
  const [registrationData, setRegistrationData] = useState(() => {
    // Only run in client-side
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : { phoneNumber: '', fullName: '', password: '', attempts: 1 };
    }
    return { phoneNumber: '', fullName: '', password: '', attempts: 1 };
  });

  // Update localStorage whenever registrationData changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registrationData));
      // console.log('Updated registration data in localStorage:', registrationData);
    }
  }, [registrationData]);

  const updateRegistrationData = (newData) => {
    console.log('Updating registration data with:', newData);
    setRegistrationData(prevData => {
      const updatedData = { ...prevData, ...newData };
      return updatedData;
    });
  };

  const clearRegistrationData = () => {
    // console.log('Clearing registration data');
    setRegistrationData({ phoneNumber: '', fullName: '', password: '', attempts: 1 });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const incrementAttempts = () => {
    setRegistrationData(prevData => ({
      ...prevData,
      attempts: (prevData.attempts || 1) + 1
    }));
  };

  const value = {
    registrationData,
    updateRegistrationData,
    clearRegistrationData,
    incrementAttempts
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}