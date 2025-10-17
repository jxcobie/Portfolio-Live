'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavbarContextType {
  navbarText: string;
  setNavbarText: (text: string) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};

interface NavbarProviderProps {
  children: ReactNode;
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  const [navbarText, setNavbarText] = useState('[USER: JXCOB]');

  return (
    <NavbarContext.Provider value={{ navbarText, setNavbarText }}>
      {children}
    </NavbarContext.Provider>
  );
};
