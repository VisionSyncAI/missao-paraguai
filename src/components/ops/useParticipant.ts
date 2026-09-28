"use client";

import { useEffect, useState } from "react";

export function useParticipant() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/participant/me")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json.participant);
      })
      .catch(() => setError("Falha ao carregar"));
  }, []);
  return { data, error };
}
