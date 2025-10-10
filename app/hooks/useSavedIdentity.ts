"use client";

import { useEffect, useState } from "react";

export function useSavedIdentity() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("random-prediction-identity");
      if (cached) {
        const parsed = JSON.parse(cached) as { name?: string; email?: string };
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch (error) {
      console.warn("Unable to load cached identity", error);
    }
  }, []);

  const persist = (nextName: string, nextEmail: string) => {
    setName(nextName);
    setEmail(nextEmail);
    try {
      localStorage.setItem(
        "random-prediction-identity",
        JSON.stringify({ name: nextName, email: nextEmail })
      );
    } catch (error) {
      console.warn("Unable to persist identity", error);
    }
  };

  return { name, email, setName, setEmail, persist } as const;
}
