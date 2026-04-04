import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Locale, LibMessages } from "./types";
import { en } from "./locales/en";
import { uk } from "./locales/uk";

// ─── Internal lookup table ────────────────────────────────────────────────────

const LIB_MESSAGES: Record<Locale, LibMessages> = { en, uk };

// ─── Context value type ───────────────────────────────────────────────────────

export interface I18nContextValue {
  /** Currently active locale. */
  locale: Locale;
  /** Switch the active locale. */
  setLocale: (locale: Locale) => void;
  /**
   * Translate a message key.
   * Supports simple `{placeholder}` interpolation via the `vars` argument.
   *
   * @example
   * t('settings.title')                      // "Settings" / "Налаштування"
   * t('data.rows', { count: 42 })            // "42 rows" / "42 рядків"
   * t('app.greeting', { name: 'World' })     // app-provided key
   */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

// ─── Default context (English) used when no I18nProvider is mounted ───────────

function makeTFn(
  libDict: Record<string, string>,
  appDict: Record<string, string> = {},
): I18nContextValue["t"] {
  return (key, vars) => {
    let str = appDict[key] ?? libDict[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };
}

const DEFAULT_CTX: I18nContextValue = {
  locale: "en",
  setLocale: () => undefined,
  t: makeTFn(en as unknown as Record<string, string>),
};

const I18nContext = createContext<I18nContextValue>(DEFAULT_CTX);

// ─── Provider props ───────────────────────────────────────────────────────────

export interface I18nProviderProps {
  children: React.ReactNode;
  /** Initial locale. Defaults to `"en"`. */
  defaultLocale?: Locale;
  /**
   * Per-locale app-specific messages merged on top of lib messages.
   * Use this to translate your own UI strings with the same `t()` hook.
   *
   * @example
   * messages={{
   *   en: { 'nav.home': 'Home', 'nav.about': 'About' },
   *   uk: { 'nav.home': 'Головна', 'nav.about': 'Про нас' },
   * }}
   */
  messages?: Partial<Record<Locale, Record<string, string>>>;
  /** localStorage key for persisting the active locale across sessions. */
  storageKey?: string;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function I18nProvider({
  children,
  defaultLocale = "en",
  messages: appMessages = {},
  storageKey,
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved === "en" || saved === "uk") return saved as Locale;
      } catch {
        // ignore — e.g. private browsing
      }
    }
    return defaultLocale;
  });

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, next);
        } catch {
          // ignore
        }
      }
    },
    [storageKey],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const libDict = LIB_MESSAGES[locale] as unknown as Record<string, string>;
      const appDict = appMessages[locale] ?? {};
      let str = appDict[key] ?? libDict[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [locale, appMessages],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the active locale and translation function.
 * Works without `<I18nProvider>` — falls back to English.
 */
export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}
