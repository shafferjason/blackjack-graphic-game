import { createContext, useContext, useState } from 'react';
import * as constants from '../constants';

const GameSettingsContext = createContext(null);

export const GameSettingsProvider = ({ children }) => {
  const [overrides, setOverrides] = useState({});

  const updateSetting = (key, value) => {
    setOverrides(prev => ({ ...prev, [key]: value }));
  };

  // Merge compile-time constants with any runtime overrides
  const value = { ...constants, ...overrides, updateSetting };

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
};

export const useGameSettings = () => {
  const context = useContext(GameSettingsContext);
  if (context === null) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
};
