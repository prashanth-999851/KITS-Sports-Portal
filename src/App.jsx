import React, { useState, useEffect } from 'react';
import AppRouter from './router/AppRouter';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <AppRouter darkMode={darkMode} setDarkMode={setDarkMode} />
  );
}
