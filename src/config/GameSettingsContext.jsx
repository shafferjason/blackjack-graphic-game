import React, { createContext, useContext, useState } from 'react';
import * as defaults from './defaults';

const GameSettingsContext = createContext(null);

export const GameSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    numDecks: defaults.NUM_DECKS,
    deckPenetration: defaults.DECK_PENETRATION,
    dealerHitsSoft17: true, // Example setting
    blackjackPayout: defaults.BLACKJACK_PAYOUT_RATIO,
    doubleAfterSplit: true, // Example setting
    surrenderAllowed: true, // Example setting
    // ... other settings from defaults
  });

  // Function to update settings
  const updateSetting = (key, value) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  const value = { ...defaults, ...settings, updateSetting };

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
};

export const useGameSettings = () => {
  const context = useContext(GameSettingsContext);
  if (context === undefined) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
};
