import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
export const ThemeContext = createContext();

// Create global styles for dark mode
const darkModeStyles = `
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --bg-card: #ffffff;
    --text-primary: #1f2937;
    --text-secondary: #4b5563;
    --border-color: #e5e7eb;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --accent-color: #f97316;
    --accent-highlight: #ea580c;
    --accent-color-light: #ffedd5;
    --danger-color: #ef4444;
    --success-color: #22c55e;
    --warning-color: #f59e0b;
    --info-color: #3b82f6;
  }

  .dark-mode {
    --bg-primary: #121212;
    --bg-secondary: #1e1e1e;
    --bg-card: #242424;
    --text-primary: #e5e7eb;
    --text-secondary: #9ca3af;
    --border-color: #374151;
    --shadow-color: rgba(0, 0, 0, 0.5);
    --accent-color: #f97316;
    --accent-highlight: #ea580c;
    --accent-color-light: #7c2d12;
    --danger-color: #ef4444;
    --success-color: #22c55e;
    --warning-color: #f59e0b;
    --info-color: #3b82f6;
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .dark-mode a {
    color: var(--accent-color);
  }

  /* Card styles */
  .dark-mode .card {
    background-color: var(--bg-card);
    border-color: var(--border-color);
  }

  /* Button styles */
  .dark-mode .btn {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  .dark-mode .btn-primary {
    background-color: var(--accent-color);
    color: white;
  }

  /* Input styles */
  .dark-mode input, 
  .dark-mode select,
  .dark-mode textarea {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  /* Table styles */
  .dark-mode table {
    border-color: var(--border-color);
  }

  .dark-mode th, 
  .dark-mode td {
    border-color: var(--border-color);
  }

  .dark-mode tr:hover {
    background-color: var(--bg-secondary);
  }

  /* Navbar and footer */
  .dark-mode nav,
  .dark-mode footer {
    background-color: var(--bg-card);
    color: var(--text-primary);
    border-color: var(--border-color);
  }

  /* Modal */
  .dark-mode .modal {
    background-color: var(--bg-card);
    color: var(--text-primary);
  }

  /* Dropdown */
  .dark-mode .dropdown-menu {
    background-color: var(--bg-card);
    border-color: var(--border-color);
  }

  .dark-mode .dropdown-item:hover {
    background-color: var(--bg-secondary);
  }

  /* Custom tailwind classes for dark mode */
  .dark-bg-primary {
    background-color: var(--bg-primary);
  }
  
  .dark-bg-secondary {
    background-color: var(--bg-secondary);
  }
  
  .dark-bg-card {
    background-color: var(--bg-card);
  }
  
  .dark-text-primary {
    color: var(--text-primary);
  }
  
  .dark-text-secondary {
    color: var(--text-secondary);
  }
  
  .dark-border {
    border-color: var(--border-color);
  }
`;

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  useEffect(() => {
    // Add the style element if it doesn't exist
    if (!document.getElementById('dark-mode-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'dark-mode-styles';
      styleEl.innerHTML = darkModeStyles;
      document.head.appendChild(styleEl);
    }
    
    // Apply dark mode class
    applyDarkMode(darkMode);
  }, []);

  useEffect(() => {
    // Update dark mode class whenever darkMode state changes
    applyDarkMode(darkMode);
    // Save to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const applyDarkMode = (isDarkMode) => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider; 