import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('pinjemaja_settings');
      return saved ? JSON.parse(saved) : {
        notif_borrow: true,
        notif_return: true,
        notif_payment: true,
        notif_email: false,
        dark_mode: false,
        language: 'id',
      };
    } catch {
      return {
        notif_borrow: true,
        notif_return: true,
        notif_payment: true,
        notif_email: false,
        dark_mode: false,
        language: 'id',
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('pinjemaja_settings', JSON.stringify(settings));
    if (settings.dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};