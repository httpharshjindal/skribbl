"use client";
import { useEffect, useState } from "react";
const useClientId = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("clientId") || "";

      setClientId(id);
    }
  }, []);
  return clientId;
};

export default useClientId;
