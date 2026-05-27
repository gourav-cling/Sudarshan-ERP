"use client";

import { useCallback, useState } from "react";

export function useFormState<T extends Record<string, unknown>>(initial: T) {
  const [values, setValues] = useState<T>(initial);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
  }, []);

  const reset = useCallback((next?: T) => {
    setValues(next ?? initial);
  }, [initial]);

  return { values, setValues, setField, reset };
}

export function requireFields(
  values: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const k of keys) {
    const v = values[k];
    if (v == null || (typeof v === "string" && !v.trim())) {
      return `Please fill in ${k}`;
    }
  }
  return null;
}
