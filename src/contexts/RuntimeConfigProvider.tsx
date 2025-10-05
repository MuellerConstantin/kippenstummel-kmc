"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";

const runtimeConfigContext = createContext<{
  config: { [key: string]: string } | null;
} | null>(null);

export function RuntimeConfigProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [runtimeConfig, setRuntimeConfig] = useState<{
    [key: string]: string;
  } | null>(null);

  const fetchRuntimeConfig = useCallback(async () => {
    const res = await axios.get("/api/runtime-config");

    return res.data as { [key: string]: string };
  }, []);

  useEffect(() => {
    fetchRuntimeConfig().then(setRuntimeConfig);
  }, [fetchRuntimeConfig]);

  return (
    <runtimeConfigContext.Provider value={{ config: runtimeConfig }}>
      {children}
    </runtimeConfigContext.Provider>
  );
}

export function useEnv(variable: string) {
  const context = useContext(runtimeConfigContext);

  if (!context) {
    throw new Error("useEnv must be used within a 'RuntimeConfigProvider'");
  }

  return context.config?.[variable] || null;
}
