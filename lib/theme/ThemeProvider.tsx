import { colorScheme as nwColorScheme, vars } from 'nativewind';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import { storage } from '../storage';
import {
  resolveSpringPalette,
  type PrimaryOverride,
  type SpringPalette,
  type ThemeMode,
} from './palette';

const STORAGE_KEY_MODE = 'theme:mode';
const STORAGE_KEY_ACCENT = 'theme:accent';

export type ThemeContextValue = {
  mode: ThemeMode;
  palette: SpringPalette;
  accent: PrimaryOverride | null;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: PrimaryOverride | null) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function hexToRgbTriple(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function paletteToVars(palette: SpringPalette): Record<string, string> {
  return {
    '--coral': hexToRgbTriple(palette.coral),
    '--coral-deep': hexToRgbTriple(palette.coralDeep),
    '--coral-soft': hexToRgbTriple(palette.coralSoft),
    '--coral-whisper': hexToRgbTriple(palette.coralWhisper),
    '--sage': hexToRgbTriple(palette.sage),
    '--sage-deep': hexToRgbTriple(palette.sageDeep),
    '--sage-soft': hexToRgbTriple(palette.sageSoft),
    '--butter': hexToRgbTriple(palette.butter),
    '--butter-deep': hexToRgbTriple(palette.butterDeep),
    '--butter-soft': hexToRgbTriple(palette.butterSoft),
    '--cream': hexToRgbTriple(palette.cream),
    '--ivory': hexToRgbTriple(palette.ivory),
    '--sand': hexToRgbTriple(palette.sand),
    '--stone': hexToRgbTriple(palette.stone),
    '--bark': hexToRgbTriple(palette.bark),
    '--espresso': hexToRgbTriple(palette.espresso),
    '--ink-soft': hexToRgbTriple(palette.inkSoft),
    '--success': hexToRgbTriple(palette.success),
    '--danger': hexToRgbTriple(palette.danger),
  };
}

export function ThemeProvider({
  children,
  initialMode,
}: {
  children: ReactNode;
  initialMode?: ThemeMode;
}) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = storage.getString(STORAGE_KEY_MODE);
    if (stored === 'light' || stored === 'dark') return stored;
    return initialMode ?? 'light';
  });

  const [accent, setAccentState] = useState<PrimaryOverride | null>(() => {
    const stored = storage.getString(STORAGE_KEY_ACCENT);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as PrimaryOverride;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    nwColorScheme.set(mode);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    storage.set(STORAGE_KEY_MODE, next);
    setModeState(next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const setAccent = useCallback((next: PrimaryOverride | null) => {
    if (next) {
      storage.set(STORAGE_KEY_ACCENT, JSON.stringify(next));
    } else {
      storage.delete(STORAGE_KEY_ACCENT);
    }
    setAccentState(next);
  }, []);

  const palette = useMemo(
    () => resolveSpringPalette(mode, accent ?? undefined),
    [mode, accent],
  );

  const cssVars = useMemo(() => vars(paletteToVars(palette)), [palette]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, palette, accent, setMode, toggleMode, setAccent }),
    [mode, palette, accent, setMode, toggleMode, setAccent],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, cssVars]} className="bg-cream">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
