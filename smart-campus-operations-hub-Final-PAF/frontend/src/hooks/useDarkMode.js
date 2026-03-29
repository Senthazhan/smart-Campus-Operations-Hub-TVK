import { useState, useEffect, useCallback } from "react";

// Custom hook that encapsulates dark/light mode logic and persists preference
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  // read value from localStorage, default to light mode
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    // Always use saved preference, default to light mode
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  }, []);

  return [isDark, toggle];
}
