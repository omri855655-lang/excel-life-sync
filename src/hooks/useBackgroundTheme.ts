import { useEffect, useState } from "react";

export const BACKGROUND_THEME_STORAGE_KEY = "background-theme";

export const backgroundThemeOptions = [
  { id: "mint", label: "מנטה", hsl: "152 42% 92%", preview: "#dff4e9" },
  { id: "sky", label: "תכלת", hsl: "204 60% 93%", preview: "#e0f0fb" },
  { id: "sand", label: "חול", hsl: "42 55% 92%", preview: "#f5ebd9" },
  { id: "blush", label: "ורדרד", hsl: "344 52% 93%", preview: "#f8e1e7" },
  { id: "clean", label: "לבן נקי", hsl: "210 20% 98%", preview: "#f8fafc" },
] as const;

export type BackgroundThemeId = (typeof backgroundThemeOptions)[number]["id"];

const DEFAULT_BACKGROUND_THEME_ID: BackgroundThemeId = "mint";

const isBackgroundThemeId = (value: string): value is BackgroundThemeId =>
  backgroundThemeOptions.some((option) => option.id === value);

const getStoredBackgroundTheme = (): BackgroundThemeId => {
  if (typeof window === "undefined") {
    return DEFAULT_BACKGROUND_THEME_ID;
  }

  const storedValue = window.localStorage.getItem(BACKGROUND_THEME_STORAGE_KEY);
  return storedValue && isBackgroundThemeId(storedValue)
    ? storedValue
    : DEFAULT_BACKGROUND_THEME_ID;
};

export const useBackgroundTheme = () => {
  const [backgroundTheme, setBackgroundThemeState] = useState<BackgroundThemeId>(getStoredBackgroundTheme);

  useEffect(() => {
    const selectedTheme =
      backgroundThemeOptions.find((option) => option.id === backgroundTheme) ??
      backgroundThemeOptions[0];

    document.documentElement.style.setProperty("--background-light", selectedTheme.hsl);
    window.localStorage.setItem(BACKGROUND_THEME_STORAGE_KEY, selectedTheme.id);
  }, [backgroundTheme]);

  const setBackgroundTheme = (themeId: BackgroundThemeId) => {
    setBackgroundThemeState(themeId);
  };

  return {
    backgroundTheme,
    setBackgroundTheme,
    backgroundThemeOptions,
  };
};
