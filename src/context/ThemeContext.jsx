import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const THEME_STORAGE_KEY = "slugsync-theme";
const THEME_PREFERENCES = ["light", "dark", "system"];

const ThemeContext = createContext(undefined);

function hasWindow() {
  return typeof window !== "undefined";
}

function readStoredPreference() {
  if (!hasWindow()) return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_PREFERENCES.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

function systemPrefersDark() {
  if (!hasWindow() || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(preference) {
  return preference === "system" ? (systemPrefersDark() ? "dark" : "light") : preference;
}

function applyThemeAttribute(theme) {
  if (!hasWindow()) return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreferenceState] = useState(readStoredPreference);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    resolveTheme(readStoredPreference()),
  );

  const setThemePreference = useCallback((next) => {
    if (!THEME_PREFERENCES.includes(next)) return;
    setThemePreferenceState(next);
    if (hasWindow()) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // storage unavailable (private browsing, sandboxed tests) — preference just won't persist
      }
    }
  }, []);

  // Applies the resolved theme to the root element any time the preference changes.
  useEffect(() => {
    const next = resolveTheme(themePreference);
    setResolvedTheme(next);
    applyThemeAttribute(next);
  }, [themePreference]);

  // While on "system", track OS-level scheme changes without a page reload.
  useEffect(() => {
    if (themePreference !== "system" || !hasWindow() || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function handleChange(event) {
      const next = event.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyThemeAttribute(next);
    }

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [themePreference]);

  const value = useMemo(
    () => ({ themePreference, resolvedTheme, setThemePreference }),
    [themePreference, resolvedTheme, setThemePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
