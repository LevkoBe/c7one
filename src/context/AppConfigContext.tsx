import React, { createContext, useContext } from "react";

const AppConfigContext = createContext<unknown>(null);

export interface AppConfigProviderProps<T> {
  config: T;
  children: React.ReactNode;
}

export function AppConfigProvider<T>({
  config,
  children,
}: AppConfigProviderProps<T>) {
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig<T>(): T {
  const ctx = useContext(AppConfigContext);
  if (ctx === null)
    throw new Error("useAppConfig must be used inside <AppConfigProvider>");
  return ctx as T;
}
