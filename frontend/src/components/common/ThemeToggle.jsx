import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';

/**
 * Premium Theme Toggle Component
 * Features smooth animations and a branded SaaS aesthetic.
 */
const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "relative flex items-center gap-2 p-1.5 rounded-2xl transition-all duration-500 overflow-hidden group border",
        isDarkMode 
          ? "bg-slate-900 border-slate-800 text-indigo-400" 
          : "bg-white border-slate-200 text-amber-500 shadow-soft"
      )}
      aria-label="Toggle theme"
    >
      {/* Background slide effect */}
      <div className={clsx(
        "absolute inset-0 transition-transform duration-500 ease-out z-0",
        isDarkMode ? "translate-x-0 bg-indigo-500/10" : "-translate-x-full"
      )} />

      <div className="relative z-10 flex items-center justify-between w-full">
        <div className={clsx(
          "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-500",
          !isDarkMode ? "bg-amber-100 shadow-sm" : "bg-transparent translate-x-10 opacity-0"
        )}>
          <Sun className="w-4.5 h-4.5 animate-in fade-in zoom-in duration-500" />
        </div>

        <div className={clsx(
          "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-500",
          isDarkMode ? "bg-indigo-500/20 shadow-lg shadow-indigo-500/20" : "bg-transparent -translate-x-10 opacity-0"
        )}>
          <Moon className="w-4.5 h-4.5 animate-in fade-in zoom-in duration-500" />
        </div>
      </div>
      
      {/* Decorative dot for interaction */}
      <div className={clsx(
        "absolute w-1.5 h-1.5 rounded-full bg-current transition-all duration-500 ease-elastic",
        isDarkMode ? "right-3 scale-100" : "left-3 scale-100"
      )} />
    </button>
  );
};

export default ThemeToggle;
